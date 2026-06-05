"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, RefreshCw, Volume2, VolumeX } from "lucide-react";

interface QRScannerProps {
  onScan: (text: string) => void;
  isScanningActive?: boolean;
}

export function QRScanner({ onScan, isScanningActive = true }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFrontFacing, setIsFrontFacing] = useState(false);

  // Play audio beep
  function playBeep() {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch clear beep
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12); // Beep for 120ms
    } catch (e) {
      console.error("Audio beep failed:", e);
    }
  }

  // Update available video input devices list
  async function updateDeviceList(currentSelectedId?: string) {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices.filter((device) => device.kind === "videoinput");
      setDevices(videoDevices);

      if (videoDevices.length > 0) {
        const activeId = currentSelectedId || selectedDeviceId;
        const exists = videoDevices.some((d) => d.deviceId === activeId);
        if (!exists) {
          // Look for back camera on mobile by default
          const backCamera = videoDevices.find(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("environment")
          );
          setSelectedDeviceId(backCamera?.deviceId || videoDevices[0].deviceId);
        }
      }
    } catch (err) {
      console.error("Error enumerating devices:", err);
    }
  }

  // List available video input devices initially
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.mediaDevices) {
      updateDeviceList("");
    }
  }, []);

  // Control camera stream
  useEffect(() => {
    if (!isScanningActive || !selectedDeviceId) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [selectedDeviceId, isScanningActive]);

  async function startCamera() {
    stopCamera();
    setPermissionError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Update the device list with labels now that user granted camera permission
      await updateDeviceList(selectedDeviceId);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // required for iOS safari
        videoRef.current.play();
        setIsCameraActive(true);

        // Detect if active video track is front-facing (user camera)
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          const trackLabel = videoTrack.label || "";
          const isUser =
            settings.facingMode === "user" ||
            trackLabel.toLowerCase().includes("front") ||
            trackLabel.toLowerCase().includes("user") ||
            trackLabel.toLowerCase().includes("selfie");
          setIsFrontFacing(isUser);
        } else {
          setIsFrontFacing(false);
        }

        animationFrameRef.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setPermissionError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera access denied. Please grant camera permissions to scan tickets."
          : "Unable to start camera feed. Please check connection or select another device."
      );
      setIsCameraActive(false);
    }
  }

  function stopCamera() {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }

  function tick() {
    if (!streamRef.current || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      // Set canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Extract image data for QR code processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        // Draw green bounding box around QR code
        drawBoundingBox(ctx, code.location);

        // Limit scanning frequency to once every 2 seconds to avoid duplicates
        const now = Date.now();
        if (now - lastScanTimeRef.current > 2000) {
          lastScanTimeRef.current = now;
          playBeep();
          onScan(code.data);
        }
      }
    }

    if (streamRef.current && videoRef.current && canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }

  function drawBoundingBox(
    ctx: CanvasRenderingContext2D,
    location: {
      topLeftCorner: { x: number; y: number };
      topRightCorner: { x: number; y: number };
      bottomRightCorner: { x: number; y: number };
      bottomLeftCorner: { x: number; y: number };
    }
  ) {
    ctx.beginPath();
    ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
    ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
    ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
    ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
    ctx.closePath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#10b981"; // Emerald green
    ctx.stroke();
  }

  return (
    <div className="relative flex flex-col items-center justify-between w-full h-full overflow-hidden bg-black p-2">
      {/* Hidden Video element used for camera feed */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Main Canvas rendering camera stream + overlays */}
      <div className="relative w-full aspect-square overflow-hidden rounded-[20px] bg-[#050505] shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] border border-white/10">
        {isCameraActive ? (
          <canvas
            ref={canvasRef}
            className={`w-full h-full object-cover ${isFrontFacing ? "scale-x-[-1]" : ""}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center text-white/50">
            {permissionError ? (
              <p className="text-sm font-semibold text-red-400">{permissionError}</p>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <CameraOff className="w-12 h-12 stroke-[1.5] text-white/30 animate-pulse" />
                <p className="text-xs font-black uppercase tracking-[0.18em]">Camera is offline</p>
              </div>
            )}
          </div>
        )}

        {/* Scan Frame Target Overlay (semi-transparent border box) */}
        {isCameraActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-56 h-56 border-2 border-dashed border-emerald-500/50 rounded-3xl bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

              {/* Scanning Red Laser Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-scan-laser" />
            </div>
          </div>
        )}
      </div>

      {/* Control Panel bar */}
      <div className="flex items-center justify-between w-full mt-3 bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5">
        {/* Device selector */}
        <div className="flex items-center gap-2">
          {devices.length > 1 && (
            <button
              type="button"
              onClick={() => {
                const currentIndex = devices.findIndex((d) => d.deviceId === selectedDeviceId);
                const nextIndex = (currentIndex + 1) % devices.length;
                setSelectedDeviceId(devices[nextIndex].deviceId);
              }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white/80"
              title="Switch Camera"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[9px] uppercase font-black text-white/40 tracking-wider">
            {isCameraActive ? "Camera Live" : "Camera Idle"}
          </span>
        </div>

        {/* Start / Stop toggle */}
        <button
          type="button"
          onClick={() => (isCameraActive ? stopCamera() : startCamera())}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
            isCameraActive
              ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
              : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
          }`}
        >
          {isCameraActive ? (
            <>
              <CameraOff className="w-3.5 h-3.5" />
              <span>Turn Off</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5" />
              <span>Turn On</span>
            </>
          )}
        </button>

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white/80"
          title={soundEnabled ? "Mute beep" : "Unmute beep"}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Embedded CSS for scan laser animation */}
      <style>{`
        @keyframes scanLaser {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(220px);
          }
        }
        .animate-scan-laser {
          animation: scanLaser 2.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

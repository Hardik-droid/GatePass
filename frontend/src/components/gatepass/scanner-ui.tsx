"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  CameraOff,
  Search,
  RefreshCw,
  Zap,
  User,
  Tag,
  Clock,
  DoorOpen,
  Loader2,
  ScanLine,
  Ban,
  Copy,
  RotateCcw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ScanStatus = "idle" | "scanning" | "success" | "already_used" | "invalid" | "error";

interface ScanPayload {
  status: string;
  message?: string;
  ticketId?: string;
  attendeeName?: string;
  categoryName?: string;
  checkedInAt?: string;
  gateName?: string;
  scannerStaffName?: string;
  deviceId?: string;
  eventTitle?: string;
}

interface TicketDetail {
  id: string;
  attendeeName: string;
  attendeeEmail?: string;
  ticketCategoryId?: string;
  status: string;
  eventId?: string;
  orderId?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function normalizeStatus(raw: string): ScanStatus {
  const s = raw.toUpperCase();
  if (s === "VALID") return "success";
  if (s === "ALREADY USED" || s === "USED") return "already_used";
  if (s === "INVALID" || s === "NOT FOUND" || s.includes("CANCEL") || s.includes("REFUND") || s.includes("EXPIRED")) return "invalid";
  return "error";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Pill({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-black/30 px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-white/40" />
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}

function SuccessOverlay({
  payload,
  onNext,
}: {
  payload: ScanPayload;
  onNext: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-emerald-950 px-6 text-white animate-in fade-in duration-300">
      {/* Ripple rings */}
      <div className="relative mb-8 flex items-center justify-center">
        <span className="absolute h-48 w-48 animate-ping rounded-full bg-emerald-400/20" style={{ animationDuration: "1.5s" }} />
        <span className="absolute h-36 w-36 animate-ping rounded-full bg-emerald-400/30" style={{ animationDuration: "1.5s", animationDelay: "0.2s" }} />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-400 shadow-[0_0_80px_rgba(52,211,153,0.6)]">
          <CheckCircle2 className="h-12 w-12 text-emerald-950" strokeWidth={3} />
        </div>
      </div>

      <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">Ticket Scanned Successfully</p>
      <h2 className="mt-3 text-center text-4xl font-black">ENTRY ALLOWED</h2>

      <div className="mt-8 w-full max-w-sm space-y-2">
        <Pill label="Attendee" value={payload.attendeeName ?? payload.ticketId ?? "—"} icon={User} />
        <Pill label="Ticket ID" value={payload.ticketId ?? "—"} icon={Tag} />
        <Pill label="Scanned at" value={fmtTime(payload.checkedInAt)} icon={Clock} />
        <Pill label="Gate" value={payload.gateName ?? "Main Gate"} icon={DoorOpen} />
      </div>

      <button
        type="button"
        onClick={onNext}
        className="mt-10 flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-emerald-400 py-4 font-black text-emerald-950 text-sm uppercase tracking-wider hover:bg-emerald-300 transition-colors"
      >
        <ScanLine className="h-5 w-5" />
        Scan Next Ticket
      </button>
    </div>
  );
}

function AlreadyUsedOverlay({
  payload,
  onNext,
}: {
  payload: ScanPayload;
  onNext: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-amber-950 px-6 text-white animate-in fade-in duration-300">
      <div className="relative mb-8 flex items-center justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.5)]">
          <AlertTriangle className="h-12 w-12 text-amber-950" strokeWidth={3} />
        </div>
      </div>

      <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">Duplicate Scan Detected</p>
      <h2 className="mt-3 text-4xl font-black">ALREADY USED</h2>
      <p className="mt-2 text-center text-sm text-white/60">This ticket was already checked in.</p>

      <div className="mt-8 w-full max-w-sm space-y-2">
        <Pill label="Ticket ID" value={payload.ticketId ?? "—"} icon={Tag} />
        <Pill label="First scan at" value={fmtTime(payload.checkedInAt)} icon={Clock} />
        <Pill label="Gate" value={payload.gateName ?? "Main Gate"} icon={DoorOpen} />
      </div>

      <div className="mt-10 flex w-full max-w-sm gap-3">
        <button
          type="button"
          onClick={onNext}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-400 py-4 font-black text-amber-950 text-sm uppercase tracking-wider hover:bg-amber-300 transition-colors"
        >
          <ScanLine className="h-5 w-5" />
          Scan Next
        </button>
      </div>
    </div>
  );
}

function InvalidOverlay({
  payload,
  onNext,
}: {
  payload: ScanPayload;
  onNext: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-950 px-6 text-white animate-in fade-in duration-300">
      <div className="relative mb-8 flex items-center justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-500 shadow-[0_0_60px_rgba(239,68,68,0.5)]">
          <XCircle className="h-12 w-12 text-white" strokeWidth={3} />
        </div>
      </div>

      <p className="text-xs font-black uppercase tracking-[0.3em] text-red-300">Scan Failed</p>
      <h2 className="mt-3 text-4xl font-black">INVALID TICKET</h2>
      <p className="mt-2 text-center text-sm text-white/60">{payload.message ?? "This ticket could not be validated."}</p>

      {payload.ticketId ? (
        <div className="mt-8 w-full max-w-sm space-y-2">
          <Pill label="Ticket ID" value={payload.ticketId} icon={Tag} />
        </div>
      ) : null}

      <button
        type="button"
        onClick={onNext}
        className="mt-10 flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-red-500 py-4 font-black text-white text-sm uppercase tracking-wider hover:bg-red-400 transition-colors"
      >
        <RotateCcw className="h-5 w-5" />
        Try Again
      </button>
    </div>
  );
}

// ─── Camera QR Scanner ────────────────────────────────────────────────────────

function CameraScanner({ onDetected }: { onDetected: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const lastDetectedRef = useRef<string>("");
  const cooldownRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      // Prefer BarcodeDetector API (Chrome / Android WebView)
      if ("BarcodeDetector" in window) {
        try {
          detectorRef.current = new (window as Window & { BarcodeDetector: typeof BarcodeDetector }).BarcodeDetector({ formats: ["qr_code"] });
        } catch {
          detectorRef.current = null;
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera access denied";
      setCameraError(msg.includes("denied") ? "Camera permission denied. Allow camera access and try again." : `Camera error: ${msg}`);
    }
  }, []);

  // Frame scanning loop
  useEffect(() => {
    if (!cameraActive) return;
    setScanning(true);

    const tick = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { rafRef.current = requestAnimationFrame(tick); return; }
      ctx.drawImage(video, 0, 0);

      try {
        let result: string | null = null;

        if (detectorRef.current) {
          const barcodes = await detectorRef.current.detect(canvas);
          if (barcodes.length > 0) result = barcodes[0].rawValue;
        } else {
          // jsQR fallback — lazy load to keep initial bundle small
          try {
            const jsQR = (await import("jsqr")).default;
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
            if (code) result = code.data;
          } catch {
            // jsQR not available, skip frame
          }
        }

        if (result && result !== lastDetectedRef.current && !cooldownRef.current) {
          lastDetectedRef.current = result;
          cooldownRef.current = true;
          onDetected(result);
          // 3-second cooldown before next scan to prevent duplicate reads
          setTimeout(() => {
            cooldownRef.current = false;
            lastDetectedRef.current = "";
          }, 3000);
        }
      } catch {
        // ignore frame errors
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cameraActive, onDetected]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-black aspect-video w-full">
      {/* Video feed */}
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted
        style={{ display: cameraActive ? "block" : "none" }}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Scanner overlay — aiming frame */}
      {cameraActive && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-56 w-56">
            {/* Corner brackets */}
            {[
              "top-0 left-0 border-t-4 border-l-4 rounded-tl-xl",
              "top-0 right-0 border-t-4 border-r-4 rounded-tr-xl",
              "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl",
              "bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl",
            ].map((c, i) => (
              <span key={i} className={`absolute h-10 w-10 border-emerald-400 ${c}`} />
            ))}
            {/* Laser scan line */}
            <div
              className="absolute left-2 right-2 h-0.5 bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              style={{
                animation: "scanLine 2s ease-in-out infinite",
              }}
            />
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center">
            {scanning ? (
              <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-emerald-300 backdrop-blur-sm">
                🔍 Scanning…
              </span>
            ) : null}
          </div>
        </div>
      )}

      {/* Placeholder when camera off */}
      {!cameraActive && !cameraError && (
        <div className="flex h-full min-h-48 w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-zinc-900 to-black">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Camera className="h-9 w-9 text-white/30" />
          </div>
          <p className="text-sm font-bold text-white/40">Camera is off</p>
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white hover:bg-emerald-400 transition-colors"
          >
            <Camera className="h-4 w-4" />
            Start Camera
          </button>
        </div>
      )}

      {/* Error state */}
      {cameraError && (
        <div className="flex h-full min-h-48 w-full flex-col items-center justify-center gap-4 bg-red-950/60 p-6 text-center">
          <CameraOff className="h-10 w-10 text-red-400" />
          <p className="text-sm font-semibold text-red-300">{cameraError}</p>
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-2.5 text-sm font-bold hover:bg-white/16 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {/* Camera toggle (top-right) */}
      {cameraActive && (
        <button
          type="button"
          onClick={stopCamera}
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
        >
          <CameraOff className="h-3.5 w-3.5" />
          Turn Off
        </button>
      )}

      {/* CSS scan line animation */}
      <style>{`
        @keyframes scanLine {
          0% { top: 8px; }
          50% { top: calc(100% - 8px); }
          100% { top: 8px; }
        }
      `}</style>
    </div>
  );
}

// ─── Main Scanner UI ──────────────────────────────────────────────────────────

export function ScannerPageUI({ manual = false }: { manual?: boolean }) {
  const [tab, setTab] = useState<"camera" | "text">(manual ? "text" : "camera");
  const [manualInput, setManualInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [overlay, setOverlay] = useState<{ status: ScanStatus; payload: ScanPayload } | null>(null);
  const [lastResult, setLastResult] = useState<{ status: ScanStatus; payload: ScanPayload } | null>(null);
  const [lookupResults, setLookupResults] = useState<TicketDetail[] | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const dismissOverlay = useCallback(() => {
    setOverlay(null);
    setManualInput("");
  }, []);

  // ── API call to validate a scanned QR/ticket ─────────────────────────────
  const submitValidation = useCallback(async (token: string) => {
    if (!token.trim() || submitting) return;
    setSubmitting(true);
    setLookupResults(null);

    try {
      // Determine if the input looks like a ticket ID (short) or a full QR token
      const isTicketId = token.trim().length < 30 && !token.includes(".");
      const body = isTicketId
        ? { ticketId: token.trim(), gateId: "gate_main", deviceId: "web-scanner-01", scannerUserId: "usr_scanner_demo" }
        : { qrToken: token.trim(), gateId: "gate_main", deviceId: "web-scanner-01", scannerUserId: "usr_scanner_demo" };

      const response = await fetch("/api/scanner", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": crypto.randomUUID(),
          "x-gatepass-role": "OWNER",
        },
        body: JSON.stringify(body),
      });

      const raw = (await response.json()) as ScanPayload & { message?: string };
      const status = normalizeStatus(raw.status ?? (response.ok ? "VALID" : "INVALID"));

      // Enrich with ticket details if we have a ticketId
      let enriched: ScanPayload = { ...raw };
      if (raw.ticketId) {
        try {
          const ticketRes = await fetch(`/api/scanner/manual-lookup`, {
            method: "POST",
            headers: { "content-type": "application/json", "x-gatepass-role": "OWNER" },
            body: JSON.stringify({ query: raw.ticketId }),
          });
          const ticketData = await ticketRes.json() as { items?: TicketDetail[] };
          const match = ticketData.items?.[0];
          if (match) {
            enriched = {
              ...enriched,
              attendeeName: match.attendeeName,
              eventTitle: match.eventId,
            };
          }
        } catch {
          // enrichment optional
        }
      }

      const result = { status, payload: enriched };
      setLastResult(result);

      if (status === "success" || status === "already_used" || status === "invalid") {
        setOverlay(result);
      }
    } catch (err) {
      const payload: ScanPayload = {
        status: "error",
        message: err instanceof Error ? err.message : "Network error. Check connection.",
      };
      const result = { status: "error" as ScanStatus, payload };
      setLastResult(result);
      setOverlay(result);
    } finally {
      setSubmitting(false);
    }
  }, [submitting]);

  // ── Manual lookup (search, not validate) ─────────────────────────────────
  const submitManualLookup = useCallback(async () => {
    const q = manualInput.trim();
    if (!q) return;
    setLookupLoading(true);
    setLookupResults(null);
    try {
      const res = await fetch("/api/scanner/manual-lookup", {
        method: "POST",
        headers: { "content-type": "application/json", "x-gatepass-role": "OWNER" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json() as { items?: TicketDetail[] };
      setLookupResults(data.items ?? []);
    } catch {
      setLookupResults([]);
    } finally {
      setLookupLoading(false);
    }
  }, [manualInput]);

  const copyToken = useCallback((text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, []);

  // ── Overlay rendering ─────────────────────────────────────────────────────
  if (overlay) {
    if (overlay.status === "success") {
      return <SuccessOverlay payload={overlay.payload} onNext={dismissOverlay} />;
    }
    if (overlay.status === "already_used") {
      return <AlreadyUsedOverlay payload={overlay.payload} onNext={dismissOverlay} />;
    }
    if (overlay.status === "invalid" || overlay.status === "error") {
      return <InvalidOverlay payload={overlay.payload} onNext={dismissOverlay} />;
    }
  }

  // ── Main scanner layout ───────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-400">
            GatePass · Mobile Web Scanner
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            {manual ? "Manual Lookup" : "Scanner"}
          </h1>
        </div>

        {/* Tabs */}
        {!manual && (
          <div className="mb-5 flex gap-2 rounded-2xl bg-white/5 p-1">
            {(["camera", "text"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black uppercase tracking-wider transition-all ${
                  tab === t
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {t === "camera" ? <Camera className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                {t === "camera" ? "Camera Scan" : "Text Lookup"}
              </button>
            ))}
          </div>
        )}

        {/* Camera Tab */}
        {tab === "camera" && !manual && (
          <div className="space-y-4">
            <CameraScanner
              onDetected={(code) => {
                void submitValidation(code);
              }}
            />
            {submitting && (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 py-3 text-sm font-bold text-emerald-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating ticket…
              </div>
            )}
            {/* Quick paste area for testing without camera */}
            <details className="rounded-2xl border border-white/8 bg-white/[0.04]">
              <summary className="cursor-pointer select-none px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/40">
                Or paste QR token manually
              </summary>
              <div className="px-4 pb-4">
                <textarea
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="mt-2 min-h-20 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs outline-none placeholder:text-white/25 focus:border-emerald-500/50"
                  placeholder="Paste signed QR token here…"
                />
                <button
                  type="button"
                  disabled={submitting || !manualInput.trim()}
                  onClick={() => void submitValidation(manualInput)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-black disabled:opacity-40 hover:bg-emerald-400 transition-colors"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Validate QR
                </button>
              </div>
            </details>
          </div>
        )}

        {/* Text / Manual Lookup Tab */}
        {(tab === "text" || manual) && (
          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.055] p-4">
              <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                Search by ticket ID, name, phone, email, or QR token
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void submitManualLookup(); }}
                  className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none placeholder:text-white/25 focus:border-emerald-500/60"
                  placeholder="e.g. TCK-8F42 or Aarav…"
                />
                <button
                  type="button"
                  disabled={lookupLoading || !manualInput.trim()}
                  onClick={() => void submitManualLookup()}
                  className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold disabled:opacity-40 hover:bg-white/16 transition-colors"
                >
                  {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Look Up
                </button>
              </div>
            </div>

            {/* Lookup results */}
            {lookupResults !== null && (
              <div className="space-y-3">
                {lookupResults.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-2xl bg-red-900/30 border border-red-500/20 px-4 py-4">
                    <Ban className="h-5 w-5 text-red-400 shrink-0" />
                    <p className="text-sm font-bold text-red-300">No matching ticket found.</p>
                  </div>
                ) : (
                  lookupResults.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-[24px] border border-white/10 bg-white/[0.055] p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-sm">{ticket.attendeeName}</p>
                          <p className="text-xs text-white/50 mt-0.5">{ticket.attendeeEmail}</p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${
                          ticket.status === "active" || ticket.status === "issued"
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                            : ticket.status === "used" || ticket.status === "checked_in"
                            ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                            : "border-red-400/30 bg-red-400/10 text-red-300"
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-black/30 px-3 py-2">
                          <p className="text-white/40 uppercase tracking-widest text-[9px] font-black">Ticket ID</p>
                          <p className="font-bold mt-0.5">{ticket.id}</p>
                        </div>
                        <div className="rounded-xl bg-black/30 px-3 py-2">
                          <p className="text-white/40 uppercase tracking-widest text-[9px] font-black">Order</p>
                          <p className="font-bold mt-0.5">{ticket.orderId || "—"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void submitValidation(ticket.id)}
                          disabled={submitting}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-emerald-400 disabled:opacity-40 transition-colors"
                        >
                          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Validate & Check In
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToken(ticket.id)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold hover:bg-white/10 transition-colors"
                        >
                          {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Last result mini-card (persists between scans) */}
        {lastResult && !overlay && (
          <div className={`mt-5 rounded-2xl border p-4 ${
            lastResult.status === "success"
              ? "border-emerald-500/30 bg-emerald-900/20"
              : lastResult.status === "already_used"
              ? "border-amber-500/30 bg-amber-900/20"
              : "border-red-500/30 bg-red-900/20"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-white/50">Last Scan Result</span>
              {lastResult.status === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : lastResult.status === "already_used" ? (
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
            </div>
            <p className="font-black text-sm">
              {lastResult.status === "success" ? "✅ Entry Allowed" : lastResult.status === "already_used" ? "⚠️ Already Used" : "❌ Invalid"}
            </p>
            {lastResult.payload.ticketId && (
              <p className="mt-1 text-xs text-white/50">Ticket: {lastResult.payload.ticketId}</p>
            )}
            {lastResult.payload.attendeeName && (
              <p className="text-xs text-white/50">Attendee: {lastResult.payload.attendeeName}</p>
            )}
            {lastResult.payload.checkedInAt && (
              <p className="text-xs text-white/50">At: {fmtTime(lastResult.payload.checkedInAt)}</p>
            )}
            {lastResult.payload.message && lastResult.status !== "success" && (
              <p className="text-xs text-white/50 mt-1">{lastResult.payload.message}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

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

interface ScannerValidationResponse {
  success: boolean;
  valid: boolean;
  code:
    | "VALID"
    | "ALREADY_CHECKED_IN"
    | "INVALID"
    | "NOT_FOUND"
    | "WRONG_EVENT"
    | "CANCELLED"
    | "REFUNDED"
    | "EXPIRED"
    | "OFFLINE_ERROR"
    | "SERVER_ERROR";
  message: string;
  ticket?: {
    id: string;
    orderId?: string;
    eventId: string;
    eventName: string;
    eventStartAt?: string;
    venue?: string;
    gateName?: string;
    category: string;
    status: string;
    buyerName?: string;
    buyerEmail?: string;
    buyerPhone?: string;
    attendeeName?: string;
    attendeeEmail?: string;
    attendeePhone?: string;
    purchasedAt?: string;
    checkedInAt?: string | null;
    checkedInBy?: string | null;
    checkedInGate?: string | null;
    checkedInDevice?: string | null;
  };
  audit?: {
    scannedAt: string;
    scannerDevice?: string;
    gateName?: string;
  };
}

interface TicketDetail {
  id: string;
  attendeeName: string;
  attendeeEmail?: string;
  ticketCategoryId?: string;
  status: string;
  eventId?: string;
  orderId?: string;
  eventName?: string;
  categoryName?: string;
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

function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + " · " + d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function normalizeStatus(raw: string): ScanStatus {
  const s = raw.toUpperCase();
  if (s === "VALID" || s === "SUCCESS") return "success";
  if (s === "ALREADY USED" || s === "USED" || s === "ALREADY_CHECKED_IN") return "already_used";
  if (s === "INVALID" || s === "NOT FOUND" || s === "NOT_FOUND" || s.includes("CANCEL") || s.includes("REFUND") || s.includes("EXPIRED")) return "invalid";
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
  ticket,
  audit,
  onNext,
}: {
  ticket: NonNullable<ScannerValidationResponse["ticket"]>;
  audit?: ScannerValidationResponse["audit"];
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

      <div className="mt-8 w-full max-w-sm space-y-2 max-h-[45vh] overflow-y-auto pr-1">
        <Pill label="Attendee" value={ticket.attendeeName || "—"} icon={User} />
        {ticket.buyerName && ticket.buyerName !== ticket.attendeeName && (
          <Pill label="Buyer" value={ticket.buyerName} icon={User} />
        )}
        <Pill label="Ticket ID" value={ticket.id} icon={Tag} />
        <Pill label="Category" value={ticket.category} icon={Tag} />
        <Pill label="Event" value={ticket.eventName} icon={Tag} />
        <Pill label="Scanned at" value={fmtDateTime(audit?.scannedAt || ticket.checkedInAt || undefined)} icon={Clock} />
        <Pill label="Gate" value={ticket.venue ? `${ticket.venue} / ${ticket.gateName || "Main Gate"}` : (ticket.gateName || "Main Gate")} icon={DoorOpen} />
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
  ticket,
  onNext,
}: {
  ticket: NonNullable<ScannerValidationResponse["ticket"]>;
  onNext: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-amber-950 px-6 text-white animate-in fade-in duration-300">
      <div className="relative mb-8 flex items-center justify-center">
        <span className="absolute h-48 w-48 animate-ping rounded-full bg-amber-500/20" style={{ animationDuration: "1.5s" }} />
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.5)]">
          <AlertTriangle className="h-12 w-12 text-amber-950" strokeWidth={3} />
        </div>
      </div>

      <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">Duplicate Scan Detected</p>
      <h2 className="mt-3 text-4xl font-black">ALREADY USED</h2>
      <p className="mt-2 text-center text-sm text-white/60">This ticket was already checked in.</p>

      <div className="mt-8 w-full max-w-sm space-y-2 max-h-[45vh] overflow-y-auto pr-1">
        <Pill label="Attendee" value={ticket.attendeeName || "—"} icon={User} />
        <Pill label="Ticket ID" value={ticket.id} icon={Tag} />
        <Pill label="Category" value={ticket.category} icon={Tag} />
        <Pill label="First scan at" value={fmtDateTime(ticket.checkedInAt || undefined)} icon={Clock} />
        {ticket.checkedInBy && (
          <Pill label="Checked in by" value={ticket.checkedInBy} icon={User} />
        )}
        <Pill label="Gate" value={ticket.gateName || "Main Gate"} icon={DoorOpen} />
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
  code,
  message,
  ticket,
  onNext,
}: {
  code: string;
  message: string;
  ticket?: ScannerValidationResponse["ticket"];
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
      <h2 className="mt-3 text-4xl font-black">{code}</h2>
      <p className="mt-2 text-center text-sm text-white/60">{message}</p>

      {ticket ? (
        <div className="mt-8 w-full max-w-sm space-y-2 max-h-[45vh] overflow-y-auto pr-1">
          <Pill label="Attendee" value={ticket.attendeeName || "—"} icon={User} />
          <Pill label="Ticket ID" value={ticket.id} icon={Tag} />
          <Pill label="Status" value={ticket.status.toUpperCase()} icon={Tag} />
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
  const lastDetectedRef = useRef<string>("");
  const cooldownRef = useRef(false);
  const scanning = cameraActive;

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
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

interface HistoryEntry {
  ticketId: string;
  attendeeName: string;
  timestamp: string;
  status: string;
  category: string;
}

export function ScannerPageUI({ manual = false }: { manual?: boolean }) {
  const [tab, setTab] = useState<"camera" | "text" | "history">(manual ? "text" : "camera");
  const [manualInput, setManualInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [overlay, setOverlay] = useState<{ status: ScanStatus; code: string; message: string; ticket?: ScannerValidationResponse["ticket"]; audit?: ScannerValidationResponse["audit"] } | null>(null);
  const [lastResult, setLastResult] = useState<{ status: ScanStatus; code: string; message: string; ticket?: ScannerValidationResponse["ticket"]; audit?: ScannerValidationResponse["audit"] } | null>(null);
  const [lookupResults, setLookupResults] = useState<TicketDetail[] | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("gatepass_scan_history");
      return stored ? (JSON.parse(stored) as HistoryEntry[]) : [];
    } catch {
      return [];
    }
  });

  const addToHistory = useCallback((ticket: NonNullable<ScannerValidationResponse["ticket"]>, code: string) => {
    const entry: HistoryEntry = {
      ticketId: ticket.id,
      attendeeName: ticket.attendeeName || "Guest",
      timestamp: new Date().toISOString(),
      status: code,
      category: ticket.category,
    };
    setHistory((prev) => {
      const updated = [entry, ...prev.slice(0, 49)];
      localStorage.setItem("gatepass_scan_history", JSON.stringify(updated));
      return updated;
    });
  }, []);

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

      const payload = (await response.json()) as ScannerValidationResponse;
      const status = normalizeStatus(payload.code || (response.ok ? "VALID" : "INVALID"));

      const result = {
        status,
        code: payload.code || (response.ok ? "VALID" : "INVALID"),
        message: payload.message || "",
        ticket: payload.ticket,
        audit: payload.audit,
      };
      setLastResult(result);

      if (payload.ticket) {
        addToHistory(payload.ticket, payload.code);
      }

      if (status === "success" || status === "already_used" || status === "invalid") {
        setOverlay(result);
      }
    } catch (err) {
      const result = {
        status: "error" as ScanStatus,
        code: "SERVER_ERROR",
        message: err instanceof Error ? err.message : "Network error. Check connection.",
      };
      setLastResult(result);
      setOverlay(result);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, addToHistory]);

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
    if (overlay.status === "success" && overlay.ticket) {
      return <SuccessOverlay ticket={overlay.ticket} audit={overlay.audit} onNext={dismissOverlay} />;
    }
    if (overlay.status === "already_used" && overlay.ticket) {
      return <AlreadyUsedOverlay ticket={overlay.ticket} onNext={dismissOverlay} />;
    }
    if (overlay.status === "invalid" || overlay.status === "error") {
      return <InvalidOverlay code={overlay.code} message={overlay.message} ticket={overlay.ticket} onNext={dismissOverlay} />;
    }
  }

  // ── Main scanner layout ───────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-400">
              GatePass · Event Operations
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              {manual ? "Manual Lookup" : "Gate Scanner"}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-black uppercase text-emerald-400 border border-emerald-400/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Gate Main
            </span>
            <span className="text-[9px] font-bold text-white/40">Device: Web-Scanner-01</span>
          </div>
        </div>

        {/* Tabs */}
        {!manual && (
          <div className="mb-5 flex gap-2 rounded-2xl bg-white/5 p-1">
            {([
              { id: "camera", name: "Camera Scan", icon: Camera },
              { id: "text", name: "Text Lookup", icon: Search },
              { id: "history", name: "History", icon: Clock }
            ] as const).map((t) => {
              const TabIcon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
                    tab === t.id
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  <TabIcon className="h-4 w-4 shrink-0" />
                  {t.name}
                </button>
              );
            })}
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
                        <div className="min-w-0">
                          <p className="font-black text-sm truncate">{ticket.attendeeName}</p>
                          <p className="text-xs text-white/50 mt-0.5 truncate">{ticket.attendeeEmail}</p>
                          <p className="text-[10px] text-white/40 mt-1 font-bold truncate">
                            {ticket.eventId || "Demo Event"}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${
                          ticket.status === "active" || ticket.status === "issued"
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                            : ticket.status === "used" || ticket.status === "checked_in"
                            ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                            : "border-red-400/30 bg-red-400/10 text-red-300"
                        }`}>
                          {ticket.status === "checked_in" || ticket.status === "used" ? "USED" : ticket.status}
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

        {/* History Tab */}
        {tab === "history" && !manual && (
          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.055] p-4">
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/50">Recent Scans</h3>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem("gatepass_scan_history");
                    }}
                    className="text-[10px] uppercase font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear History
                  </button>
                )}
              </div>
              
              {history.length === 0 ? (
                <div className="text-center text-xs text-white/30 py-8">No scan attempts recorded yet</div>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {history.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl bg-black/35 p-3 border border-white/5">
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{entry.attendeeName}</p>
                        <p className="text-[10px] text-white/40 mt-0.5 truncate">ID: {entry.ticketId} · {entry.category}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          entry.status === "VALID"
                            ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20"
                            : entry.status === "ALREADY_CHECKED_IN"
                            ? "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                            : "bg-red-400/10 text-red-300 border border-red-400/20"
                        }`}>
                          {entry.status === "VALID" ? "VALID" : entry.status === "ALREADY_CHECKED_IN" ? "USED" : "INVALID"}
                        </span>
                        <p className="text-[9px] text-white/30 mt-1">{fmtTime(entry.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              {lastResult.status === "success" ? "✅ Entry Allowed" : lastResult.status === "already_used" ? "⚠️ Already Checked-In" : "❌ Scan Rejected"}
            </p>
            {lastResult.ticket && (
              <div className="mt-2 space-y-1 text-xs text-white/50">
                <p>Attendee: <strong className="text-white font-semibold">{lastResult.ticket.attendeeName}</strong></p>
                <p>ID: <strong className="text-white font-semibold">{lastResult.ticket.id}</strong> ({lastResult.ticket.category})</p>
                {lastResult.status === "already_used" && lastResult.ticket.checkedInAt && (
                  <p>Used at: <strong className="text-amber-300 font-semibold">{fmtDateTime(lastResult.ticket.checkedInAt)}</strong></p>
                )}
                {lastResult.status === "success" && lastResult.audit && (
                  <p>Checked in: <strong className="text-emerald-300 font-semibold">{fmtTime(lastResult.audit.scannedAt)}</strong></p>
                )}
              </div>
            )}
            {lastResult.message && lastResult.status !== "success" && lastResult.status !== "already_used" && (
              <p className="text-xs text-red-300 mt-2 font-medium">{lastResult.message}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

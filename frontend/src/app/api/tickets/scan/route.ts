import { NextResponse } from "next/server";
import { ensureStoreReady } from "@/backend/core/store";
import { validateScan } from "@/backend/modules/scanner";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await ensureStoreReady();
    const body = await req.json();
    const { qrPayload, scannerId } = body;

    if (!qrPayload) {
      return NextResponse.json(
        { ok: false, reason: "qrPayload_required" },
        { status: 400 },
      );
    }

    const result = await validateScan({
      qrToken: String(qrPayload),
      scannerUserId: String(scannerId || "local-scanner"),
      gateId: "gate_main",
      deviceId: "legacy-ticket-scan-api",
    });

    return NextResponse.json({
      ok: result.valid,
      status: result.valid ? "accepted" : "rejected",
      reason: result.valid ? undefined : result.code,
      ...result,
    }, { status: result.valid ? 200 : 403 });
  } catch (error) {
    console.error("SCAN_TICKET_ERROR:", error);

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

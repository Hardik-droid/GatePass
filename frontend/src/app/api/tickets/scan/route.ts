import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";
import { hashToken, verifyQrPayload } from "@/lib/qrToken";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { qrPayload, scannerId } = body;

    if (!qrPayload) {
      return NextResponse.json(
        { ok: false, reason: "qrPayload_required" },
        { status: 400 },
      );
    }

    let parsed;

    try {
      parsed = verifyQrPayload(qrPayload);
    } catch {
      return NextResponse.json(
        { ok: false, reason: "invalid_qr_signature" },
        { status: 403 },
      );
    }

    const tokenHash = hashToken(parsed.rawToken);

    // Atomic update: only matches active + not-expired tickets
    const ticket = await Ticket.findOneAndUpdate(
      {
        ticketId: parsed.ticketId,
        tokenHash,
        status: "active",
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          status: "used",
          usedAt: new Date(),
          usedByScanner: scannerId || "local-scanner",
        },
        $inc: {
          scanCount: 1,
        },
      },
      {
        new: true,
      },
    ).lean();

    if (!ticket) {
      const existing = await Ticket.findOne({
        ticketId: parsed.ticketId,
      }).lean();

      const existingDoc = existing as Record<string, unknown> | null;

      return NextResponse.json(
        {
          ok: false,
          reason: existingDoc
            ? `ticket_${existingDoc.status}`
            : "ticket_not_found",
        },
        { status: 403 },
      );
    }

    const ticketDoc = ticket as Record<string, unknown>;

    return NextResponse.json({
      ok: true,
      status: "accepted",
      ticket: {
        ticketId: ticketDoc.ticketId,
        email: ticketDoc.email,
        rNo: ticketDoc.rNo,
        hName: ticketDoc.hName,
        eventId: ticketDoc.eventId,
        usedAt: ticketDoc.usedAt,
        usedByScanner: ticketDoc.usedByScanner,
      },
    });
  } catch (error) {
    console.error("SCAN_TICKET_ERROR:", error);

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

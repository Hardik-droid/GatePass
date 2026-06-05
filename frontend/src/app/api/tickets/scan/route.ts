import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";
import { hashToken, verifyQrPayload } from "@/lib/qrToken";

export const runtime = "nodejs";

type TicketDoc = {
  ticketId?: unknown;
  email?: unknown;
  rNo?: unknown;
  hName?: unknown;
  eventId?: unknown;
  status?: unknown;
  usedAt?: unknown;
  usedByScanner?: unknown;
  expiresAt?: unknown;
  scanCount?: unknown;
};

function serializeTicket(ticket: TicketDoc) {
  return {
    ticketId: String(ticket.ticketId || ""),
    email: String(ticket.email || ""),
    rNo: ticket.rNo,
    hName: String(ticket.hName || ""),
    eventId: String(ticket.eventId || ""),
    status: String(ticket.status || ""),
    usedAt: ticket.usedAt || null,
    usedByScanner: ticket.usedByScanner || null,
    expiresAt: ticket.expiresAt || null,
    scanCount: ticket.scanCount || 0,
  };
}

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

      const existingDoc = existing as TicketDoc | null;
      const isExpired =
        existingDoc?.status === "active" &&
        existingDoc.expiresAt instanceof Date &&
        existingDoc.expiresAt <= new Date();

      return NextResponse.json(
        {
          ok: false,
          reason: existingDoc ? (isExpired ? "ticket_expired" : `ticket_${existingDoc.status}`) : "ticket_not_found",
          ticket: existingDoc ? serializeTicket(existingDoc) : null,
        },
        { status: 403 },
      );
    }

    const ticketDoc = ticket as TicketDoc;

    return NextResponse.json({
      ok: true,
      status: "accepted",
      ticket: serializeTicket(ticketDoc),
    });
  } catch (error) {
    console.error("SCAN_TICKET_ERROR:", error);

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

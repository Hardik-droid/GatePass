import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/db";
import StudentData from "@/models/StudentData";
import Ticket from "@/models/Ticket";
import { createQrPayload, hashToken } from "@/lib/qrToken";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, eventId, paymentId, purchaseId } = body;

    if (!email || !eventId) {
      return NextResponse.json(
        { ok: false, reason: "email_and_eventId_required" },
        { status: 400 },
      );
    }

    const student = await StudentData.findOne({ email }).lean();

    if (!student) {
      return NextResponse.json(
        { ok: false, reason: "student_not_found" },
        { status: 404 },
      );
    }

    const ticketId = `gp_${nanoid(18)}`;
    const rawToken = nanoid(48);
    const tokenHash = hashToken(rawToken);
    const qrPayload = createQrPayload(ticketId, rawToken);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const studentDoc = student as Record<string, unknown>;

    const ticket = await Ticket.create({
      ticketId,
      userId: studentDoc._id,
      email: studentDoc.email,
      rNo: studentDoc.rNo,
      hName: studentDoc.hName,
      eventId,
      tokenHash,
      status: "active",
      expiresAt,
      paymentId: paymentId || "local-test-payment",
      purchaseId: purchaseId || "local-test-purchase",
    });

    const qrImageDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
    });

    return NextResponse.json({
      ok: true,
      ticket: {
        ticketId: ticket.ticketId,
        email: ticket.email,
        rNo: ticket.rNo,
        hName: ticket.hName,
        eventId: ticket.eventId,
        status: ticket.status,
        expiresAt: ticket.expiresAt,
      },
      qrPayload,
      qrImageDataUrl,
    });
  } catch (error) {
    console.error("ISSUE_TICKET_ERROR:", error);

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

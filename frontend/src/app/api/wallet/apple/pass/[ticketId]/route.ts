import { NextRequest, NextResponse } from "next/server";
import { signApplePkpass } from "@/backend/modules/apple-wallet-service";
import { syncWalletPassStatus, verifySignedWalletLinkToken } from "@/backend/modules/wallet-service";
import { getTicket } from "@/backend/modules/tickets";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const { ticketId } = await params;
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const qrToken = request.nextUrl.searchParams.get("qrToken") ?? getTicket(ticketId)?.qrToken ?? "";
  if (token && !verifySignedWalletLinkToken(ticketId, "apple", token)) {
    return NextResponse.json({ message: "Wallet link expired or invalid" }, { status: 403 });
  }
  try {
    const pass = await signApplePkpass(ticketId, qrToken || `token-${ticketId}`);
    if (!pass.configured || !("pkpassBuffer" in pass)) {
      return NextResponse.json(pass);
    }
    const pkpassBuffer = pass.pkpassBuffer;
    if (!pkpassBuffer) return NextResponse.json({ message: "Apple pass generation failed" }, { status: 400 });
    syncWalletPassStatus(ticketId, "downloaded");
    return new NextResponse(new Uint8Array(pkpassBuffer), {
      headers: {
        "content-type": "application/vnd.apple.pkpass",
        "content-disposition": `attachment; filename="${ticketId}.pkpass"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Apple pass generation failed" },
      { status: 400 },
    );
  }
}

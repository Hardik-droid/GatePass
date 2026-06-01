import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { generateQrSvgOrDataUrl, verifyQrToken } from "@/backend/modules/qr-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const token = request.nextUrl.searchParams.get("token") ?? "";
    const verified = verifyQrToken(token);
    if (!verified.valid || verified.ticketId !== id) {
      return { qrDataUrl: null, error: "QR token is required to render this pass" };
    }
    return { qrDataUrl: await generateQrSvgOrDataUrl(token) };
  });
}

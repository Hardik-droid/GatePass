import { withErrorHandling } from "@/backend/core/http";
import { requireApiPermission } from "@/backend/modules/auth";
import { isAppleWalletConfigured } from "@/backend/modules/apple-wallet-service";
import { isGoogleWalletConfigured } from "@/backend/modules/google-wallet-service";

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    await requireApiPermission(request, "dashboard:read");
    return {
    apple: isAppleWalletConfigured(),
    google: isGoogleWalletConfigured(),
    shared: {
      qrSigningSecret: Boolean(process.env.QR_SIGNING_SECRET),
      walletLinkSigningSecret: Boolean(process.env.WALLET_LINK_SIGNING_SECRET),
      walletBaseUrl: process.env.WALLET_PASS_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    },
    };
  });
}

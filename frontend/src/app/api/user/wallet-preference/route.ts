import { NextRequest } from "next/server";
import { parseJson, withErrorHandling } from "@/backend/core/http";
import { walletPreferenceSchema } from "@/backend/core/schemas";
import { requireUser } from "@/backend/modules/auth";
import { getWalletPreference, saveWalletPreference } from "@/backend/modules/wallet-service";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    return getWalletPreference(user.userId);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await parseJson(request, walletPreferenceSchema);
    return saveWalletPreference(user.userId, body.wallet_preference);
  });
}

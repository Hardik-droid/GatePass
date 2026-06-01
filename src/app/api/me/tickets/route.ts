import { NextRequest } from "next/server";
import { withErrorHandling } from "@/backend/core/http";
import { getTicketsForUser } from "@/backend/modules/tickets";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => ({
    items: getTicketsForUser({
      email: request.nextUrl.searchParams.get("email") ?? undefined,
      phone: request.nextUrl.searchParams.get("phone") ?? undefined,
    }),
  }));
}

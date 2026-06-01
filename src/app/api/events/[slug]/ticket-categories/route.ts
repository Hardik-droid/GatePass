import { NextRequest } from "next/server";
import { parseJson, withErrorHandling } from "@/backend/core/http";
import { ticketCategoryCreateSchema } from "@/backend/core/schemas";
import { requireApiPermission } from "@/backend/modules/auth";
import { createTicketCategory } from "@/backend/modules/events";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  return withErrorHandling(async () => {
    requireApiPermission(request, "tickets:write");
    const { slug } = await params;
    const payload = await parseJson(request, ticketCategoryCreateSchema);
    return createTicketCategory({ ...payload, eventId: slug });
  });
}

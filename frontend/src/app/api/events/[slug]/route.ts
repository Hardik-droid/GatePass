import { withErrorHandling } from "@/backend/core/http";
import { getEventBySlug, listTicketCategories } from "@/backend/modules/events";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return withErrorHandling(async () => {
    const { slug } = await params;
    const event = getEventBySlug(slug);
    return {
      event,
      ticketCategories: event ? listTicketCategories(event.id) : [],
    };
  });
}

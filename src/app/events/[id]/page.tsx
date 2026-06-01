import { CategorySelectClient } from "@/components/gatepass/category-select-client";
import {
  getEventBySlug,
  listEvents,
  listTicketCategories,
} from "@/backend/modules/events";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEventBySlug(id) ?? listEvents()[0];
  const categories = listTicketCategories(event.id);

  return (
    <CategorySelectClient event={event} categories={categories} />
  );
}

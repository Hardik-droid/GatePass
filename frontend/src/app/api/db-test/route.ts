import { NextResponse } from "next/server";
import { checkStateProvider } from "@/backend/db/state";
import { ensureStoreReady } from "@/backend/core/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const status = await checkStateProvider();
    const store = await ensureStoreReady();

    return NextResponse.json({
      ok: status.ok,
      provider: status.provider,
      database: status,
      counts: {
        events: store.events.length,
        tickets: store.tickets.length,
        orders: store.orders.length,
        scanLogs: store.scanLogs.length,
      },
    });
  } catch (error) {
    console.error("DB_TEST_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

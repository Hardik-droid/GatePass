import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { z } from "zod";

export function getIdempotencyKey(request: NextRequest) {
  return request.headers.get("idempotency-key") ?? crypto.randomUUID();
}

export async function parseJson<T extends z.ZodTypeAny>(request: NextRequest, schema: T): Promise<z.infer<T>> {
  return schema.parse(await request.json());
}

export async function withErrorHandling<T>(handler: () => Promise<T> | T) {
  try {
    return NextResponse.json(await handler());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ message }, { status: 400 });
  }
}

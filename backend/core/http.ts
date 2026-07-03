import type { z } from "zod";
import { ensureStoreReady } from "./store";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

type RequestLike = Request & {
  headers: Headers;
  json(): Promise<unknown>;
};

export function getIdempotencyKey(request: RequestLike) {
  return request.headers.get("idempotency-key") ?? crypto.randomUUID();
}

export async function parseJson<T extends z.ZodTypeAny>(request: RequestLike, schema: T): Promise<z.infer<T>> {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    throw new HttpError(422, result.error.issues.map((issue) => issue.message).join("; "));
  }
  return result.data;
}

export async function withErrorHandling<T>(handler: () => Promise<T> | T) {
  try {
    await ensureStoreReady();
    return Response.json(await handler());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    const status = error instanceof HttpError ? error.status : 400;
    return Response.json({ message }, { status });
  }
}

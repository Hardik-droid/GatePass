import { NextResponse } from "next/server";
import { getNeonAuth } from "@/authO/lib/server/session";

export const runtime = "nodejs";

const disabled = () => NextResponse.json({ message: "Neon Auth is not configured" }, { status: 503 });

const handlers = getNeonAuth()?.handler();

export const GET = handlers?.GET ?? disabled;
export const POST = handlers?.POST ?? disabled;
export const PUT = handlers?.PUT ?? disabled;
export const PATCH = handlers?.PATCH ?? disabled;
export const DELETE = handlers?.DELETE ?? disabled;

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StudentData from "@/models/StudentData";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const students = await StudentData.find().limit(10).lean();

    return NextResponse.json({
      ok: true,
      count: students.length,
      students,
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

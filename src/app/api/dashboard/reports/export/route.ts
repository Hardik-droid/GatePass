import { NextRequest, NextResponse } from "next/server";
import { requireApiPermission } from "@/backend/modules/auth";
import { getReports, exportCsv } from "@/backend/modules/reports";

export async function GET(request: NextRequest) {
  requireApiPermission(request, "reports:read");
  const type = request.nextUrl.searchParams.get("type") ?? "sales";
  const reports = getReports();
  const rows = type === "attendance" ? reports.attendanceRows : reports.salesRows;
  return new NextResponse(exportCsv(rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="gatepass-${type}.csv"`,
    },
  });
}

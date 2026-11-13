import { NextRequest, NextResponse } from "next/server";
import { currentStaff, canManage } from "@/server/auth";
import { loadPackageEnquiries, makePackageFilters } from "@/server/package-enquiry-data";
import { excelCsvRow } from "@/server/excel-csv";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const staff = await currentStaff();
  if (!staff || !canManage(staff)) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }
  const filters = makePackageFilters(Object.fromEntries(req.nextUrl.searchParams));
  try {
    const data = await loadPackageEnquiries(filters, true);
    if (data.total > 5000) {
      return NextResponse.json({ error: "Narrow the filters before export. Up to 5,000 matching records can be exported at once." }, { status: 422 });
    }
    const headers = [
      "Reference", "Submitted", "Package", "Destination", "Travel date",
      "Departure city", "Adults", "Children", "Infants", "Customer",
      "Email", "Phone", "Status", "Assigned to", "Price at enquiry",
      "Currency", "Notes",
    ];
    const rows = data.rows.map((row) => excelCsvRow([
      row.reference, row.createdAt, row.packageTitle, row.destination,
      row.preferredDate, row.departureCity, row.adults, row.children, row.infants,
      row.name, row.email, row.phone, row.status, row.assignedName,
      row.priceSnapshot, row.currency, row.notes,
    ], [0, 11]));
    const content = "\uFEFF" + [excelCsvRow(headers), ...rows].join("\r\n") + "\r\n";
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="sapphire-quest-package-enquiries.csv"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Package export is unavailable. Verify the database connection." }, { status: 503 });
  }
}

import { getSql } from "@/lib/db";
import { isTeacherAuthed } from "@/lib/teacherAuth";
import { NextResponse } from "next/server";

function csvEscape(val) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  if (!(await isTeacherAuthed())) return NextResponse.json({ ok: false }, { status: 401 });

  const sql = getSql();
  const rows = await sql`
    SELECT
      s.full_name, s.handle, s.class_room, s.phone,
      tr.test_key, tr.score, tr.band, tr.created_at
    FROM test_results tr
    JOIN students s ON s.id = tr.student_id
    ORDER BY s.full_name, tr.created_at DESC;
  `;

  const header = ["ชื่อ-นามสกุล", "รหัสบัญชี", "ชั้นเรียน", "เบอร์ติดต่อ", "แบบทดสอบ", "คะแนน", "ระดับผล", "วันที่ทำ"];
  const lines = [header.map(csvEscape).join(",")];
  rows.forEach((r) => {
    lines.push([
      r.full_name, r.handle, r.class_room, r.phone, r.test_key, r.score ?? "", r.band ?? "",
      new Date(r.created_at).toLocaleString("th-TH"),
    ].map(csvEscape).join(","));
  });

  // BOM so Excel opens Thai text correctly
  const csv = "\uFEFF" + lines.join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tunt-space-test-results.csv"`,
    },
  });
}

import { getSql } from "@/lib/db";
import { getStudentFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const student = await getStudentFromRequest();
  if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const sql = getSql();
  const rows = await sql`
    SELECT test_key, score, band, created_at FROM test_results
    WHERE student_id = ${student.id} ORDER BY created_at DESC LIMIT 100;
  `;
  return NextResponse.json({ ok: true, results: rows });
}

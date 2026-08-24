import { getSql } from "@/lib/db";
import { getStudentFromRequest } from "@/lib/auth";
import { censor } from "@/lib/profanity";
import { NextResponse } from "next/server";

export async function GET() {
  const student = await getStudentFromRequest();
  if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const sql = getSql();
  const rows = await sql`
    SELECT id, content, created_at FROM gratitude_entries
    WHERE student_id = ${student.id} ORDER BY created_at DESC LIMIT 60;
  `;
  return NextResponse.json({ ok: true, entries: rows });
}

export async function POST(req) {
  const student = await getStudentFromRequest();
  if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ ok: false, error: "missing content" }, { status: 400 });
  const sql = getSql();
  const clean = censor(content);
  await sql`INSERT INTO gratitude_entries (student_id, content) VALUES (${student.id}, ${clean});`;
  return NextResponse.json({ ok: true });
}

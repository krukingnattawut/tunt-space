import { getSql } from "@/lib/db";
import { getStudentFromRequest } from "@/lib/auth";
import { censor } from "@/lib/profanity";
import { NextResponse } from "next/server";

export async function GET() {
  const student = await getStudentFromRequest();
  if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const sql = getSql();
  const rows = await sql`
    SELECT id, content, sender, created_at FROM messages
    WHERE student_id = ${student.id} AND sender != 'system' ORDER BY created_at ASC;
  `;
  return NextResponse.json({ ok: true, messages: rows });
}

export async function POST(req) {
  const student = await getStudentFromRequest();
  if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ ok: false, error: "missing content" }, { status: 400 });
  const sql = getSql();
  const clean = censor(content);
  await sql`INSERT INTO messages (student_id, content, sender) VALUES (${student.id}, ${clean}, 'student');`;
  return NextResponse.json({ ok: true });
}

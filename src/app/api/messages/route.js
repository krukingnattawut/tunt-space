import { getSql } from "@/lib/db";
import { getStudentFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

// Student's own message thread with the teacher
export async function GET() {
  const student = await getStudentFromRequest();
  if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const sql = getSql();
  const rows = await sql`
    SELECT id, content, sender, created_at FROM messages
    WHERE student_id = ${student.id} ORDER BY created_at ASC;
  `;
  return NextResponse.json({ ok: true, messages: rows });
}

export async function POST(req) {
  const student = await getStudentFromRequest();
  if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ ok: false, error: "missing content" }, { status: 400 });
  const sql = getSql();
  await sql`INSERT INTO messages (student_id, content, sender) VALUES (${student.id}, ${content}, 'student');`;
  return NextResponse.json({ ok: true });
}

import { getSql } from "@/lib/db";
import { isTeacherAuthed } from "@/lib/teacherAuth";
import { NextResponse } from "next/server";

export async function POST(req) {
  if (!(await isTeacherAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  const { studentId, content } = await req.json();
  if (!studentId || !content?.trim()) return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
  const sql = getSql();
  await sql`INSERT INTO messages (student_id, content, sender) VALUES (${studentId}, ${content}, 'teacher');`;
  return NextResponse.json({ ok: true });
}

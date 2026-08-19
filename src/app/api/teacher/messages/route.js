import { getSql } from "@/lib/db";
import { isTeacherAuthed } from "@/lib/teacherAuth";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await isTeacherAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  const sql = getSql();
  const rows = await sql`
    SELECT m.id, m.content, m.sender, m.created_at, m.read_by_teacher,
           s.id as student_id, s.handle, s.full_name, s.phone, s.class_room
    FROM messages m JOIN students s ON s.id = m.student_id
    ORDER BY m.created_at DESC LIMIT 100;
  `;
  // mark student messages as read
  await sql`UPDATE messages SET read_by_teacher = TRUE WHERE sender = 'student' AND read_by_teacher = FALSE;`;
  return NextResponse.json({ ok: true, messages: rows });
}

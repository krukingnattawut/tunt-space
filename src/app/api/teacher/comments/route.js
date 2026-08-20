import { getSql } from "@/lib/db";
import { isTeacherAuthed } from "@/lib/teacherAuth";
import { NextResponse } from "next/server";

export async function POST(req) {
  if (!(await isTeacherAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  const { postId, content } = await req.json();
  if (!postId || !content?.trim()) return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
  const sql = getSql();
  await sql`
    INSERT INTO comments (post_id, student_id, sender, content) VALUES (${postId}, NULL, 'teacher', ${content});
  `;
  return NextResponse.json({ ok: true });
}

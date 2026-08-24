import { getSql } from "@/lib/db";
import { getStudentFromRequest } from "@/lib/auth";
import { isTeacherAuthed } from "@/lib/teacherAuth";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  const { id } = await params;
  const sql = getSql();

  const teacher = await isTeacherAuthed();
  if (teacher) {
    await sql`DELETE FROM posts WHERE id = ${id};`;
    return NextResponse.json({ ok: true });
  }

  const student = await getStudentFromRequest();
  if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const rows = await sql`SELECT student_id FROM posts WHERE id = ${id};`;
  if (!rows[0]) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  if (rows[0].student_id !== student.id) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  await sql`DELETE FROM posts WHERE id = ${id};`;
  return NextResponse.json({ ok: true });
}

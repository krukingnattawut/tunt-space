import { getSql } from "@/lib/db";
import { isTeacherAuthed } from "@/lib/teacherAuth";
import { NextResponse } from "next/server";

export async function POST(req) {
  if (!(await isTeacherAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  const { title, content } = await req.json();
  if (!title?.trim()) return NextResponse.json({ ok: false, error: "missing title" }, { status: 400 });
  const sql = getSql();
  await sql`INSERT INTO news (title, content) VALUES (${title}, ${content || ""});`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  if (!(await isTeacherAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await req.json();
  const sql = getSql();
  await sql`DELETE FROM news WHERE id = ${id};`;
  return NextResponse.json({ ok: true });
}

import { getSql } from "@/lib/db";
import { getStudentFromRequest } from "@/lib/auth";
import { isFlagged } from "@/lib/risk";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT posts.id, posts.content, posts.likes, posts.created_at, students.handle
      FROM posts JOIN students ON students.id = posts.student_id
      ORDER BY posts.created_at DESC LIMIT 50;
    `;
    return NextResponse.json({ ok: true, posts: rows });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const student = await getStudentFromRequest();
    if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ ok: false, error: "missing content" }, { status: 400 });
    const sql = getSql();
    const flagged = isFlagged(content);
    await sql`INSERT INTO posts (student_id, content, flagged) VALUES (${student.id}, ${content}, ${flagged});`;
    return NextResponse.json({ ok: true, flagged });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

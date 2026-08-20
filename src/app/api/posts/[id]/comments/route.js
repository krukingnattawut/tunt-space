import { getSql } from "@/lib/db";
import { getStudentFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT
        c.id, c.content, c.sender, c.created_at,
        COALESCE(s.nickname, s.handle) AS display_name,
        COALESCE(s.avatar_emoji, '🙂') AS avatar_emoji
      FROM comments c
      LEFT JOIN students s ON s.id = c.student_id
      WHERE c.post_id = ${id}
      ORDER BY c.created_at ASC;
    `;
    return NextResponse.json({ ok: true, comments: rows });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const { id } = await params;
  try {
    const student = await getStudentFromRequest();
    if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ ok: false, error: "missing content" }, { status: 400 });
    const sql = getSql();
    await sql`
      INSERT INTO comments (post_id, student_id, sender, content) VALUES (${id}, ${student.id}, 'student', ${content});
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

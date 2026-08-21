import { getSql } from "@/lib/db";
import { getStudentFromRequest } from "@/lib/auth";
import { isFlagged } from "@/lib/risk";
import { censor } from "@/lib/profanity";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT
        posts.id, posts.content, posts.image_url, posts.likes, posts.created_at,
        students.handle,
        COALESCE(students.nickname, students.handle) AS display_name,
        COALESCE(students.avatar_emoji, '🙂') AS avatar_emoji,
        COALESCE(students.avatar_color, '#9B8CFF') AS avatar_color,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = posts.id) AS comment_count
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
    const { content, imageDataUrl } = await req.json();
    if (!content?.trim() && !imageDataUrl) {
      return NextResponse.json({ ok: false, error: "missing content" }, { status: 400 });
    }
    const sql = getSql();
    const cleanContent = censor(content || "");
    const flagged = isFlagged(content || "");
    await sql`
      INSERT INTO posts (student_id, content, image_url, flagged)
      VALUES (${student.id}, ${cleanContent}, ${imageDataUrl || null}, ${flagged});
    `;
    return NextResponse.json({ ok: true, flagged });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

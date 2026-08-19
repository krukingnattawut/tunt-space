import { getSql } from "@/lib/db";
import { isTeacherAuthed } from "@/lib/teacherAuth";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await isTeacherAuthed())) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  try {
    const sql = getSql();
    const students = await sql`
      SELECT
        s.id, s.handle, s.full_name, s.phone, s.class_room, s.nickname,
        lc.mood AS last_mood,
        lc.created_at AS last_checkin_at,
        (SELECT COUNT(*) FROM checkins c WHERE c.student_id = s.id
           AND c.created_at > NOW() - INTERVAL '7 days') AS checkins_7d,
        (SELECT COUNT(*) FROM posts p WHERE p.student_id = s.id AND p.flagged = TRUE) AS flagged_posts
      FROM students s
      LEFT JOIN LATERAL (
        SELECT mood, created_at FROM checkins
        WHERE student_id = s.id ORDER BY created_at DESC LIMIT 1
      ) lc ON true
      ORDER BY s.created_at DESC;
    `;

    const flaggedPosts = await sql`
      SELECT p.id, p.content, p.created_at, s.handle, s.full_name, s.phone
      FROM posts p JOIN students s ON s.id = p.student_id
      WHERE p.flagged = TRUE
      ORDER BY p.created_at DESC LIMIT 20;
    `;

    const unreadMessages = await sql`
      SELECT COUNT(*) AS count FROM messages WHERE sender = 'student' AND read_by_teacher = FALSE;
    `;

    return NextResponse.json({ ok: true, students, flaggedPosts, unreadMessages: Number(unreadMessages[0]?.count || 0) });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

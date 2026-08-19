import { getSql } from "@/lib/db";
import { getStudentFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const student = await getStudentFromRequest();
  if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { nickname, avatarEmoji, avatarColor } = await req.json();
  const sql = getSql();
  await sql`
    UPDATE students SET
      nickname = COALESCE(${nickname}, nickname),
      avatar_emoji = COALESCE(${avatarEmoji}, avatar_emoji),
      avatar_color = COALESCE(${avatarColor}, avatar_color)
    WHERE id = ${student.id};
  `;
  return NextResponse.json({ ok: true });
}

import { getSql } from "@/lib/db";
import { isTeacherAuthed } from "@/lib/teacherAuth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function generatePassword() {
  // Easy-to-read temporary password, e.g. "tunt-4821"
  const n = crypto.randomInt(1000, 9999);
  return `tunt-${n}`;
}

export async function POST(req) {
  if (!(await isTeacherAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  const { studentId } = await req.json();
  if (!studentId) return NextResponse.json({ ok: false, error: "missing studentId" }, { status: 400 });

  const newPassword = generatePassword();
  const hash = await bcrypt.hash(newPassword, 10);
  const sql = getSql();
  await sql`UPDATE students SET password_hash = ${hash} WHERE id = ${studentId};`;

  // Also invalidate existing sessions for this student so the old login is forced out
  await sql`DELETE FROM sessions WHERE student_id = ${studentId};`;

  return NextResponse.json({ ok: true, newPassword });
}

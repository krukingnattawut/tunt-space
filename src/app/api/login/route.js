import { getSql } from "@/lib/db";
import { createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "กรุณากรอกไอดีและรหัสผ่าน" }, { status: 400 });
    }
    const sql = getSql();
    const rows = await sql`SELECT * FROM students WHERE username = ${username}`;
    const student = rows[0];
    if (!student) {
      return NextResponse.json({ ok: false, error: "ไม่พบบัญชีนี้" }, { status: 401 });
    }
    const match = await bcrypt.compare(password, student.password_hash);
    if (!match) {
      return NextResponse.json({ ok: false, error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    const { token } = await createSession(student.id);
    const res = NextResponse.json({
      ok: true,
      student: { id: student.id, handle: student.handle, nickname: student.nickname, avatar_emoji: student.avatar_emoji, avatar_color: student.avatar_color },
    });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true, sameSite: "lax", maxAge: SESSION_MAX_AGE, path: "/",
    });
    return res;
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

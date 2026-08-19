import { getSql } from "@/lib/db";
import { createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

function makeHandle() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `TUNT-${n}`;
}

export async function POST(req) {
  try {
    const { fullName, classRoom, phone, username, password } = await req.json();
    if (!fullName || !phone || !username || !password) {
      return NextResponse.json({ ok: false, error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
    }

    const sql = getSql();

    const existing = await sql`SELECT id FROM students WHERE username = ${username}`;
    if (existing.length > 0) {
      return NextResponse.json({ ok: false, error: "ไอดีนี้ถูกใช้แล้ว กรุณาเลือกไอดีอื่น" }, { status: 400 });
    }

    let handle = makeHandle();
    for (let i = 0; i < 5; i++) {
      const dup = await sql`SELECT id FROM students WHERE handle = ${handle}`;
      if (dup.length === 0) break;
      handle = makeHandle();
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const rows = await sql`
      INSERT INTO students (handle, username, password_hash, full_name, class_room, phone, nickname)
      VALUES (${handle}, ${username}, ${passwordHash}, ${fullName}, ${classRoom || ""}, ${phone}, ${fullName.split(" ")[0]})
      RETURNING id, handle, nickname, avatar_emoji, avatar_color;
    `;
    const student = rows[0];

    const { token } = await createSession(student.id);
    const res = NextResponse.json({ ok: true, student });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true, sameSite: "lax", maxAge: SESSION_MAX_AGE, path: "/",
    });
    return res;
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

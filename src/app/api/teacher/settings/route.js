import { getSql } from "@/lib/db";
import { isTeacherAuthed } from "@/lib/teacherAuth";
import { NextResponse } from "next/server";

export async function POST(req) {
  if (!(await isTeacherAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ ok: false, error: "missing key" }, { status: 400 });
  const sql = getSql();
  await sql`
    INSERT INTO app_settings (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = ${value};
  `;
  return NextResponse.json({ ok: true });
}

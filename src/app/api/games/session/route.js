import { getSql } from "@/lib/db";
import { getStudentFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const student = await getStudentFromRequest();
  if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const sql = getSql();
  const rows = await sql`
    SELECT game_key, score, created_at FROM game_sessions
    WHERE student_id = ${student.id} ORDER BY created_at DESC LIMIT 100;
  `;
  return NextResponse.json({ ok: true, sessions: rows });
}

export async function POST(req) {
  const student = await getStudentFromRequest();
  if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { gameKey, score } = await req.json();
  if (!gameKey) return NextResponse.json({ ok: false, error: "missing gameKey" }, { status: 400 });
  const sql = getSql();
  await sql`INSERT INTO game_sessions (student_id, game_key, score) VALUES (${student.id}, ${gameKey}, ${score ?? null});`;
  return NextResponse.json({ ok: true });
}

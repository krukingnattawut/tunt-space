import { getSql } from "@/lib/db";
import { getStudentFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const student = await getStudentFromRequest();
    if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    const { mood } = await req.json();
    if (!mood) return NextResponse.json({ ok: false, error: "missing mood" }, { status: 400 });
    const sql = getSql();
    await sql`INSERT INTO checkins (student_id, mood) VALUES (${student.id}, ${mood});`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

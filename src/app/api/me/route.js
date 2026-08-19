import { getStudentFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const student = await getStudentFromRequest();
  if (!student) return NextResponse.json({ ok: false }, { status: 401 });
  const { password_hash, ...safe } = student;
  return NextResponse.json({ ok: true, student: safe });
}

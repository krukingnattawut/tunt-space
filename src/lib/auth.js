import { getSql } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

const STUDENT_COOKIE = "tunt_session";
const SESSION_DAYS = 30;

export function makeToken() {
  return crypto.randomBytes(24).toString("hex");
}

export async function createSession(studentId) {
  const sql = getSql();
  const token = makeToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await sql`
    INSERT INTO sessions (token, student_id, expires_at) VALUES (${token}, ${studentId}, ${expiresAt});
  `;
  return { token, expiresAt };
}

export async function getStudentFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_COOKIE)?.value;
  if (!token) return null;

  const sql = getSql();
  const rows = await sql`
    SELECT s.* FROM sessions ses
    JOIN students s ON s.id = ses.student_id
    WHERE ses.token = ${token} AND ses.expires_at > NOW();
  `;
  return rows[0] || null;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_COOKIE)?.value;
  if (token) {
    const sql = getSql();
    await sql`DELETE FROM sessions WHERE token = ${token};`;
  }
}

export const SESSION_COOKIE_NAME = STUDENT_COOKIE;
export const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

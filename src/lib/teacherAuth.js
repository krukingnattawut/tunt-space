import { cookies } from "next/headers";

export async function isTeacherAuthed() {
  const cookieStore = await cookies();
  return cookieStore.get("tunt_teacher")?.value === "1";
}

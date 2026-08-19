// Very simple v01 keyword-based flag. This is NOT a clinical tool — it only
// helps surface posts for a teacher to review sooner. Expand this list
// carefully together with a school counselor / mental health professional.
const RISK_KEYWORDS = [
  "อยากตาย",
  "ไม่อยากอยู่",
  "ฆ่าตัวตาย",
  "ทำร้ายตัวเอง",
  "หายไปเลย",
  "ไม่มีความหมาย",
  "ทนไม่ไหว",
];

export function isFlagged(text) {
  const t = text || "";
  return RISK_KEYWORDS.some((kw) => t.includes(kw));
}

export const MOOD_RISK_LEVELS = {
  great: 0,
  good: 0,
  neutral: 1,
  tired: 2,
  bad: 3,
};

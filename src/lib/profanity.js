// Simple word-substitution profanity filter for a school app.
// Not perfect (can't catch every creative spelling), but blocks the
// common obvious cases in Thai and English. Extend BLOCKED_WORDS as needed.

const BLOCKED_WORDS = [
  // Thai — common profanity/insults (kept general, not exhaustive)
  "เหี้ย", "ควย", "สัส", "สัตว์", "เย็ด", "แม่ง", "ไอ้สัตว์", "ไอ้เหี้ย",
  "กู", "มึง", "ห่า", "ระยำ", "เชี่ย", "ฉิบหาย", "พ่อมึง", "แม่มึง",
  // English — common profanity
  "fuck", "shit", "bitch", "asshole", "bastard", "damn", "dick", "pussy",
];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Build one regex from all blocked words (case-insensitive, word-ish boundaries)
const FILTER_REGEX = new RegExp(BLOCKED_WORDS.map(escapeRegExp).join("|"), "gi");

export function censor(text) {
  if (!text) return text;
  return text.replace(FILTER_REGEX, (match) => "*".repeat(match.length));
}

export function containsProfanity(text) {
  if (!text) return false;
  FILTER_REGEX.lastIndex = 0;
  return FILTER_REGEX.test(text);
}

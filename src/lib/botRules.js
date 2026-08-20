// Simple keyword-matching "bot". This is NOT an AI model — it scans the
// student's message for known keywords and returns a pre-written response.
// Add more rules here as needed; order matters (first match wins).

export const ESCALATE_KEYWORDS = [
  "อยากคุยกับครู", "คุยกับครู", "ขอคุยกับครู", "ติดต่อครู", "หาครู", "พบครู",
];

export const CRISIS_KEYWORDS = [
  "อยากตาย", "ไม่อยากอยู่", "ฆ่าตัวตาย", "ทำร้ายตัวเอง", "ทนไม่ไหว",
];

export const RULES = [
  {
    keywords: ["เครียด", "กดดัน", "การเรียน", "สอบ", "การบ้าน"],
    response: "เข้าใจเลยค่ะ เรื่องเรียนมันกดดันจริงๆ ลองหายใจเข้าลึกๆ สัก 3 ครั้ง หรือพักสายตาสัก 5 นาทีดูไหมคะ บางทีร่างกายที่ล้าก็ทำให้ใจเครียดตามไปด้วยนะ 🌿",
  },
  {
    keywords: ["เพื่อน", "ทะเลาะ", "โดนแกล้ง", "กลั่นแกล้ง", "บูลลี่"],
    response: "เรื่องเพื่อนเป็นเรื่องที่กระทบใจได้มากเลยนะคะ ไม่ว่าจะทะเลาะกันหรือโดนกลั่นแกล้ง คุณไม่ได้ผิดที่รู้สึกแบบนี้ อยากเล่าให้ฟังเพิ่มไหมคะ หรือถ้าอยากให้ครูช่วยดูแลเรื่องนี้ พิมพ์ 'อยากคุยกับครู' ได้เลยค่ะ",
  },
  {
    keywords: ["ครอบครัว", "พ่อแม่", "พ่อ", "แม่", "บ้าน"],
    response: "เรื่องในครอบครัวบางทีก็หนักใจไม่แพ้เรื่องอื่นเลยนะคะ พี่รับฟังอยู่ตรงนี้ อยากระบายอะไรก็พิมพ์มาได้เลยค่ะ 💛",
  },
  {
    keywords: ["นอนไม่หลับ", "นอนไม่ค่อยหลับ", "นอน"],
    response: "การนอนไม่หลับบ่อยๆ อาจเป็นสัญญาณว่าใจกำลังแบกอะไรอยู่เยอะนะคะ ลองงดจอมือถือก่อนนอนสัก 20 นาที หรือเขียนสิ่งที่กังวลลงกระดาษก่อนนอนดูก็ช่วยได้บางคนค่ะ",
  },
  {
    keywords: ["เหงา", "ไม่มีใคร", "โดดเดี่ยว", "อยู่คนเดียว"],
    response: "ความรู้สึกเหงาเป็นเรื่องที่หนักหนาไม่แพ้เรื่องอื่นเลยนะคะ ขอบคุณที่กล้าเล่าให้ฟัง พี่อยู่ตรงนี้ ไม่ได้อยู่คนเดียวแล้วนะคะตอนนี้ 🤍",
  },
  {
    keywords: ["ขอบคุณ", "ดีขึ้น", "โอเคละ", "สบายใจ"],
    response: "ดีใจด้วยจริงๆ ค่ะที่รู้สึกดีขึ้น กลับมาคุยกันได้ทุกเมื่อเลยนะคะ 💛",
  },
  {
    keywords: ["สวัสดี", "หวัดดี", "ฮัลโหล", "hello", "hi"],
    response: "สวัสดีค่ะ ยินดีที่ได้คุยกันนะคะ วันนี้อยากเล่าอะไรให้ฟังไหมคะ 🙂",
  },
];

export const DEFAULT_RESPONSE =
  "ขอบคุณที่เล่าให้ฟังนะคะ พี่อยู่ตรงนี้เสมอ ถ้าอยากเล่าเพิ่มพิมพ์มาได้เลย หรือถ้าอยากคุยกับครูแนะแนวโดยตรง พิมพ์ 'อยากคุยกับครู' ได้ค่ะ 💛";

export const CRISIS_RESPONSE =
  "ขอบคุณที่ไว้ใจเล่าให้ฟังนะคะ สิ่งที่คุณรู้สึกอยู่สำคัญมาก และคุณไม่ควรเผชิญมันคนเดียว พี่ได้แจ้งครูแนะแนวให้ทราบแล้ว ถ้าต้องการความช่วยเหลือด่วนตอนนี้ โทรสายด่วนสุขภาพจิต 1323 ได้ตลอด 24 ชม. นะคะ 💙";

function normalize(text) {
  return (text || "").toLowerCase();
}

export function matchRule(message) {
  const text = normalize(message);

  if (CRISIS_KEYWORDS.some((kw) => text.includes(kw))) {
    return { type: "crisis", response: CRISIS_RESPONSE };
  }
  if (ESCALATE_KEYWORDS.some((kw) => text.includes(kw))) {
    return { type: "escalate", response: null };
  }
  const rule = RULES.find((r) => r.keywords.some((kw) => text.includes(kw)));
  if (rule) return { type: "rule", response: rule.response };

  return { type: "default", response: DEFAULT_RESPONSE };
}

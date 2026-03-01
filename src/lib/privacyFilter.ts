// Detects personal information: phone numbers, emails, social handles, URLs
const PHONE_REGEX = /(\+?\d[\d\s\-().]{7,}\d)/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const SOCIAL_REGEX = /@[a-zA-Z0-9_]{2,}/;
const URL_REGEX = /https?:\/\/[^\s]+|www\.[^\s]+|\.[a-zA-Z]{2,}\/[^\s]*/i;
const SOCIAL_KEYWORDS = /\b(instagram|insta|snapchat|snap|telegram|whatsapp|discord|facebook|fb|twitter|tiktok|linkedin|skype|wechat|line|viber|signal)\b/i;

export function containsPersonalInfo(text: string): boolean {
  return (
    PHONE_REGEX.test(text) ||
    EMAIL_REGEX.test(text) ||
    SOCIAL_REGEX.test(text) ||
    URL_REGEX.test(text) ||
    SOCIAL_KEYWORDS.test(text)
  );
}

const BANNED_WORDS_EN = [
  "fuck", "shit", "ass", "bitch", "dick", "cunt", "bastard", "damn", "hell",
  "piss", "cock", "slut", "whore", "fag", "nigger", "retard",
];

const BANNED_WORDS_HI = [
  "madarchod", "bhenchod", "chutiya", "gaand", "lund", "randi",
  "bhosdike", "harami", "saala", "kutta", "kamina",
];

const ALL_BANNED = [...BANNED_WORDS_EN, ...BANNED_WORDS_HI];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, "");
  return ALL_BANNED.some((word) => lower.includes(word));
}

export function filterMessage(text: string): { clean: boolean; filtered: string } {
  if (containsProfanity(text)) {
    return { clean: false, filtered: "" };
  }
  return { clean: true, filtered: text };
}

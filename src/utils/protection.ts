export interface ProtectedText {
  text: string;
  tokens: Record<string, string>;
}

const PATTERNS: RegExp[] = [
  /\$\{[^}]+\}/g,
  /<\/?[A-Za-z][^>]*>/g,
  /https?:\/\/[^\s<]+/g,
  /\\[nrt]/g,
  /&[A-Za-z0-9#]+;/g,
  /\{\{[^}]+\}\}/g,
  /%\d*\$?[sdif]/g
];

export function protectText(input: string): ProtectedText {
  let text = input;
  const tokens: Record<string, string> = {};
  let counter = 0;

  for (const pattern of PATTERNS) {
    text = text.replace(pattern, (match) => {
      const existing = Object.entries(tokens).find(([, value]) => value === match);
      if (existing) return existing[0];
      const token = `__XLF_PROTECTED_${String(counter++).padStart(4, "0")}__`;
      tokens[token] = match;
      return token;
    });
  }

  return { text, tokens };
}

export function restoreText(input: string, tokens: Record<string, string>): { text: string; missing: string[] } {
  let text = input;
  const missing: string[] = [];

  for (const [token, original] of Object.entries(tokens)) {
    if (!text.includes(token)) {
      missing.push(original);
      continue;
    }
    text = text.split(token).join(original);
  }

  return { text, missing };
}

export function extractProtectedSegments(input: string): string[] {
  const segments: string[] = [];
  for (const pattern of PATTERNS) {
    const matches = input.match(pattern);
    if (matches) segments.push(...matches);
  }
  return segments.sort();
}

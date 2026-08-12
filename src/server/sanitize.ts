/**
 * Refined Secret Sanitization & Redaction Engine
 * Redacts sensitive credentials (API keys, JWTs, session tokens, passwords) before logging.
 * Uses exact key matching to avoid redacting non-sensitive fields like 'password_policy', 'tokenized_payment', 'secret_sauce'.
 */

const RAW_SECRET_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: "OpenAI Key", pattern: /sk-[a-zA-Z0-9_-]{20,}/g },
  { name: "Bearer Token", pattern: /Bearer\s+[a-zA-Z0-9_\-\.=]+/gi },
  { name: "JWT Token", pattern: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g },
  { name: "Supabase Service Key", pattern: /sbp_[a-zA-Z0-9_-]{20,}/g },
  { name: "Cookie Header Session", pattern: /(how_admin_session)=([^;]+)/gi },
];

const EXACT_SENSITIVE_KEYS = new Set([
  "password",
  "api_key",
  "apikey",
  "secret",
  "token",
  "authorization",
  "cookie",
  "access_token",
  "refresh_token",
  "how_admin_session",
  "private_key",
  "client_secret",
  "resend_api_key",
  "aisensy_api_key",
  "bolna_api_key",
  "sarvam_api_key",
  "openai_api_key",
]);

/**
 * Sanitize any text or structured object, replacing sensitive credentials with [REDACTED]
 */
export function sanitizeData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    let sanitized = data;
    for (const { pattern } of RAW_SECRET_PATTERNS) {
      sanitized = sanitized.replace(pattern, (match, p1) => {
        if (p1 && match.includes("=")) {
          return `${p1}=[REDACTED]`;
        }
        return "[REDACTED]";
      });
    }
    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  if (typeof data === "object") {
    const redactedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase().trim();
      if (EXACT_SENSITIVE_KEYS.has(lowerKey)) {
        redactedObj[key] = "[REDACTED]";
      } else {
        redactedObj[key] = sanitizeData(value);
      }
    }
    return redactedObj;
  }

  return data;
}

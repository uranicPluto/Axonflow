/**
 * OWASP Production Security Headers & Hardened CSP Module
 * 
 * Directives Rationale:
 * - default-src 'self': Only allow assets from same origin by default.
 * - script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://app.cal.com: Allows self scripts, Turnstile widget scripts, and Cal.com embeds. Removed 'unsafe-eval' for strict execution security.
 * - style-src 'self' 'unsafe-inline' https://fonts.googleapis.com: Allows Tailwind CSS and Google Fonts stylesheets.
 * - font-src 'self' data: https://fonts.gstatic.com: Allows Google Fonts font files and inline webfonts.
 * - img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co: Allows images, Unsplash stock photos, and Supabase storage assets.
 * - connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com https://app.cal.com: Allows REST API calls and WebSockets for Supabase Realtime, Turnstile challenges, and Cal.com API.
 * - frame-src 'self' https://challenges.cloudflare.com https://cal.com https://app.cal.com: Allows Cloudflare Turnstile bot challenges and embedded Cal.com booking modal.
 * - object-src 'none': Prevents Flash / Legacy plugin vulnerabilities.
 * - base-uri 'self': Prevents base tag hijacking.
 * - form-action 'self': Restricts form action URLs.
 * - frame-ancestors 'self': Prevents clickjacking by blocking unauthorized framing.
 * - upgrade-insecure-requests: Automatically upgrades HTTP asset requests to HTTPS in production.
 */

export interface SecurityHeadersOptions {
  isProduction?: boolean;
}

export function getSecurityHeaders(options: SecurityHeadersOptions = {}): Record<string, string> {
  const isProduction = options.isProduction ?? (process.env.NODE_ENV === "production" || process.env.APP_ENV === "production");

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://app.cal.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com https://app.cal.com",
    "frame-src 'self' https://challenges.cloudflare.com https://cal.com https://app.cal.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  const headers: Record<string, string> = {
    "Content-Security-Policy": cspDirectives,
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  };

  if (isProduction) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
  }

  return headers;
}

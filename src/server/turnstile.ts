/**
 * Cloudflare Turnstile Server-Side Verification Helper
 * Verifies Turnstile response tokens against Cloudflare Siteverify API.
 */

export interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[];
  challengeTimestamp?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<TurnstileVerifyResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY || process.env.VITE_TURNSTILE_SECRET_KEY || "";
  const isProduction = process.env.NODE_ENV === "production" || process.env.APP_ENV === "production";

  // In non-production environments with no secret key configured, allow mock tokens for automated tests
  if (!secretKey) {
    if (isProduction) {
      throw new Error("CRITICAL SECURITY ERROR: TURNSTILE_SECRET_KEY is missing in production environment!");
    }
    // Dev fallback
    if (!token || token === "mock-turnstile-token" || token.startsWith("mock-")) {
      return { success: true, hostname: "localhost" };
    }
  }

  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  // Always test secret keys provided by Cloudflare for testing:
  // 1x0000000000000000000000000000000AA (Always passes)
  // 2x0000000000000000000000000000000AA (Always fails)
  // 3x0000000000000000000000000000000AA (Yields token already spent)
  const verifySecret = secretKey || "1x0000000000000000000000000000000AA";

  try {
    const formData = new URLSearchParams();
    formData.append("secret", verifySecret);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await res.json();
    return {
      success: !!data.success,
      errorCodes: data["error-codes"] || [],
      challengeTimestamp: data.challenge_ts,
      hostname: data.hostname,
    };
  } catch (err: any) {
    return {
      success: false,
      errorCodes: ["api-connection-error", err?.message || "Unknown fetch error"],
    };
  }
}

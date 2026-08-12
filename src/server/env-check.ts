/**
 * Production Environment Validator
 *
 * Called at server startup (before any request is served) in production mode.
 * Fails fast with an explicit error message for each missing required variable.
 *
 * SLACK_WEBHOOK_URL policy (final decision):
 *   REQUIRED in production. Slack alerting is the only persistent-failure
 *   notification channel for n8n pipeline errors. Silent loss of those
 *   alerts in production is unacceptable — operators would have no visibility
 *   into booking failures. Missing SLACK_WEBHOOK_URL therefore blocks startup.
 *
 * process.exit(1) vs throw new Error() (final decision):
 *   This project runs on Vercel/Nitro (Node.js). server.ts is loaded as a
 *   top-level ESM module. Throwing at module-evaluation time causes an
 *   unhandled rejection that Nitro surfaces as a startup crash with a
 *   clear stack trace in Vercel Function Logs — identical observability to
 *   process.exit(1) but safer for framework-level cleanup hooks. We use
 *   throw new Error(...) here so the Nitro/h3 runtime can capture and log
 *   it cleanly without suppressing any other pending I/O.
 *
 * Logging policy:
 *   Startup logs print the NAMES of configured variables, never their values.
 *   "✓ SUPABASE_URL configured" is safe; "SUPABASE_URL=https://xxx" is not.
 *
 * Voice credential rules:
 *   VOICE_PROVIDER=bolna  → BOLNA_API_KEY required
 *   VOICE_PROVIDER=sarvam → SARVAM_API_KEY required
 *   VOICE_PROVIDER unset  → no voice credential required; emits a warning
 */

export type EnvValidationResult = {
  ok: boolean;
  missing: string[];
  warnings: string[];
  configured: string[];
};

// Core variables always required in production
const REQUIRED_IN_PRODUCTION: string[] = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY",
  "CAL_WEBHOOK_SECRET",
  "JAY_EMAIL",
  "JAY_WHATSAPP_NUMBER",
  "SLACK_WEBHOOK_URL",   // Required: sole alerting channel for pipeline failures
];

export function validateProductionEnv(): EnvValidationResult {
  const result: EnvValidationResult = { ok: true, missing: [], warnings: [], configured: [] };

  if (process.env.NODE_ENV !== "production") {
    return result; // no-op outside production
  }

  // --- Required core variables ---
  for (const key of REQUIRED_IN_PRODUCTION) {
    const val = process.env[key];
    if (!val || val.trim() === "") {
      result.missing.push(key);
    } else {
      result.configured.push(key);
    }
  }

  // --- Validate Supabase URL format ---
  const supabaseUrl = process.env.SUPABASE_URL;
  if (supabaseUrl && supabaseUrl.trim() !== "" && !supabaseUrl.startsWith("https://")) {
    result.missing.push("SUPABASE_URL (value must start with https://)");
  }

  // --- Voice credentials: provider-specific ---
  const voiceProvider = (process.env.VOICE_PROVIDER || "").trim().toLowerCase();
  if (voiceProvider === "bolna") {
    const bolna = process.env.BOLNA_API_KEY;
    if (!bolna || bolna.trim() === "") {
      result.missing.push("BOLNA_API_KEY (required when VOICE_PROVIDER=bolna)");
    } else {
      result.configured.push("BOLNA_API_KEY");
    }
  } else if (voiceProvider === "sarvam") {
    const sarvam = process.env.SARVAM_API_KEY;
    if (!sarvam || sarvam.trim() === "") {
      result.missing.push("SARVAM_API_KEY (required when VOICE_PROVIDER=sarvam)");
    } else {
      result.configured.push("SARVAM_API_KEY");
    }
  } else if (voiceProvider === "") {
    result.warnings.push(
      "VOICE_PROVIDER is not set — voice calls are disabled (status=unavailable). " +
      "Set VOICE_PROVIDER=bolna or VOICE_PROVIDER=sarvam and the corresponding API key to enable."
    );
  } else {
    // Unrecognised provider — treat as fatal so misconfiguration is caught early
    result.missing.push(
      `VOICE_PROVIDER="${voiceProvider}" is not a recognised value. Valid: bolna | sarvam`
    );
  }

  if (result.missing.length > 0) {
    result.ok = false;
  }

  return result;
}

/**
 * assertProductionEnv()
 *
 * Call this at server entry point. Throws a hard Error if any required
 * production variable is missing, preventing the server from serving requests
 * with an incomplete configuration.
 *
 * We throw rather than call process.exit(1) so that the Nitro/h3 framework
 * can capture the startup error and surface it cleanly in Vercel Function Logs
 * without suppressing framework-level cleanup hooks.
 *
 * In non-production environments this is a complete no-op.
 */
export function assertProductionEnv(): void {
  const result = validateProductionEnv();

  if (process.env.NODE_ENV !== "production") return; // safety guard

  // Log configured variable names (never values) for deployment audit trail
  for (const key of result.configured) {
    console.log(`[env-check] ✓ ${key} configured`);
  }

  if (result.warnings.length > 0) {
    for (const w of result.warnings) {
      console.warn(`[env-check] WARNING: ${w}`);
    }
  }

  if (!result.ok) {
    const lines = [
      "",
      "═══════════════════════════════════════════════════════════════",
      "  PRODUCTION STARTUP FAILURE — Missing required environment",
      "  variables. The server will NOT serve requests until resolved.",
      "═══════════════════════════════════════════════════════════════",
      "",
      "  Missing variables:",
      ...result.missing.map((k) => `    ✗  ${k}`),
      "",
      "  Fix: Vercel Dashboard → Project → Settings → Environment Variables",
      "  Set each variable for the Production environment, then redeploy.",
      "═══════════════════════════════════════════════════════════════",
      "",
    ].join("\n");

    console.error(lines);

    // Throw (not process.exit) — Nitro captures this as a startup crash
    // and surfaces it in Vercel Function Logs with a clear stack trace.
    throw new Error(
      `PRODUCTION STARTUP FAILURE: Missing environment variables: ${result.missing.join(", ")}`
    );
  }

  console.log("[env-check] ✓ All required production environment variables present");
}

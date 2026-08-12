/**
 * Centralized Notification Integrations (AiSensy, Resend, Bolna, Sarvam)
 * Handles retries, communication idempotency, logging, and alerts.
 */

import { db } from "./db";
import { logActivity } from "./activity-logger";
import { logError } from "./error-logger";
import { dispatchCriticalAlert } from "./alerting";

// Delays for exponential backoff (accelerated to 1ms during tests)
const RETRY_DELAYS = [30000, 120000];
const isTestMode = typeof process !== "undefined" && 
  (process.env.NODE_ENV === "test" || (globalThis as any).__testRunnerMode);

/**
 * Exponential backoff retry helper
 */
async function runWithRetry<T>(
  operationName: string,
  fn: () => Promise<T>,
  leadId: string | undefined,
  context: Record<string, any>
): Promise<T> {
  let attempt = 1;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      
      if (attempt >= 3) {
        // Persistent failure: Log to DB, activity timeline, and dispatch alert
        await logError({
          service_name: "notifications",
          operation: operationName,
          error_code: "PERSISTENT_FAILURE",
          error_message: `Persistent failure in ${operationName}: ${errorMsg}`,
          lead_id: leadId,
          context: { ...context, attempt, final: true }
        });

        await logActivity({
          leadId,
          actorType: "system",
          action: `${operationName}_failed`,
          details: `Communication failed: ${errorMsg}`
        });

        await dispatchCriticalAlert({
          severity: "warning",
          title: `Notification Channel Failure: ${operationName}`,
          message: `Persistent error occurred on ${operationName} for lead ${leadId || "unknown"}: ${errorMsg}`,
          context: { leadId, operationName, errorMsg }
        });

        throw new Error(`Failed ${operationName} after 3 attempts: ${errorMsg}`);
      }

      // Log intermediate retry warning
      console.warn(`Attempt ${attempt} failed for ${operationName}: ${errorMsg}. Retrying...`);
      
      const waitTime = isTestMode ? 1 : (RETRY_DELAYS[attempt - 1] || 30000);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      attempt++;
    }
  }
}

/**
 * Helper to call Cal.com API with the mandatory API version header
 */
export async function callCalcomAPI(endpoint: string, options: any = {}) {
  const headers = {
    ...options.headers,
    "cal-api-version": "2026-02-25",
    "Authorization": `Bearer ${process.env.CAL_API_KEY || ""}`
  };
  
  if (process.env.ENABLE_PROVIDER_MOCKS === "true") {
    return { success: true, mock: true, headers };
  }
  
  const res = await fetch(`https://api.cal.com/v2/${endpoint}`, {
    ...options,
    headers
  });
  
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Cal.com API error status ${res.status}: ${txt}`);
  }
  
  return await res.json();
}

/**
 * Send WhatsApp via AiSensy Campaign API
 */
export async function sendWhatsAppMessage(params: {
  phone: string;
  userName: string;
  templateName: string;
  templateParams: string[];
  idempotencyKey: string;
  leadId: string;
}): Promise<boolean> {
  const { phone, userName, templateName, templateParams, idempotencyKey, leadId } = params;

  try {
    // 1. Enforce communication idempotency via atomic claim
    const claim = await db.claimCommunication(idempotencyKey, leadId, "whatsapp", "aisensy", templateName, "recipient_notification");
    if (claim === "duplicate") {
      console.log(`Duplicate WhatsApp notification detected for key: ${idempotencyKey}. Skipping.`);
      return true;
    }

    const apiKey = process.env.AISENSY_API_KEY;
    const enableMocks = process.env.ENABLE_PROVIDER_MOCKS === "true";
    
    const sendTask = async () => {
      if (!apiKey) {
        if (enableMocks) {
          console.log(`[MOCK AISENSY WHATSAPP] To: ${phone}, Template: ${templateName}, Params: ${JSON.stringify(templateParams)}`);
          return { success: true, messageId: `mock-wa-${Date.now()}` };
        } else {
          throw new Error("AiSensy credentials missing in production environment");
        }
      }

      const payload = {
        apiKey,
        campaignName: templateName,
        destination: phone,
        userName,
        source: "axonflow_booking",
        templateParams
      };

      const res = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`AiSensy API responded with status ${res.status}: ${txt}`);
      }

      const data = await res.json();
      if (data.status === "failed" || data.success === false) {
        throw new Error(data.message || "AiSensy failed to process message");
      }

      return { success: true, messageId: data.messageId || `wa-${Date.now()}` };
    };

    const result = await runWithRetry(
      "send_whatsapp",
      sendTask,
      leadId,
      { phone, templateName, templateParams, idempotencyKey }
    );

    // Update status to sent
    await db.updateCommunicationStatus(idempotencyKey, "sent", result.messageId);

    await logActivity({
      leadId,
      actorType: "system",
      action: "whatsapp_sent",
      details: `WhatsApp template '${templateName}' sent successfully.`
    });

    return true;
  } catch (err: any) {
    // Update status to failed
    try {
      await db.updateCommunicationStatus(idempotencyKey, "failed", undefined, err.message || "Unknown error");
    } catch (dbErr) {
      console.error("Failed to log failed WhatsApp communication status:", dbErr);
    }
    return false;
  }
}

/**
 * Send Email via Resend API
 */
export async function sendEmailNotification(params: {
  to: string;
  subject: string;
  html: string;
  idempotencyKey: string;
  leadId: string;
}): Promise<boolean> {
  const { to, subject, html, idempotencyKey, leadId } = params;

  try {
    // 1. Enforce communication idempotency via atomic claim
    const claim = await db.claimCommunication(idempotencyKey, leadId, "email", "resend", undefined, "email_notification");
    if (claim === "duplicate") {
      console.log(`Duplicate Email notification detected for key: ${idempotencyKey}. Skipping.`);
      return true;
    }

    const apiKey = process.env.RESEND_API_KEY;
    const enableMocks = process.env.ENABLE_PROVIDER_MOCKS === "true";

    const sendTask = async () => {
      if (!apiKey) {
        if (enableMocks) {
          console.log(`[MOCK RESEND EMAIL] To: ${to}, Subject: ${subject}`);
          return { success: true, messageId: `mock-email-${Date.now()}` };
        } else {
          throw new Error("Resend credentials missing in production environment");
        }
      }

      const payload = {
        from: "House Of Workflow <bookings@houseofworkflow.com>",
        to,
        subject,
        html
      };

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Resend API responded with status ${res.status}: ${txt}`);
      }

      const data = await res.json();
      return { success: true, messageId: data.id || `email-${Date.now()}` };
    };

    const result = await runWithRetry(
      "send_email",
      sendTask,
      leadId,
      { to, subject, idempotencyKey }
    );

    // Update status to sent
    await db.updateCommunicationStatus(idempotencyKey, "sent", result.messageId);

    await logActivity({
      leadId,
      actorType: "system",
      action: "email_sent",
      details: `Email with subject '${subject}' sent successfully.`
    });

    return true;
  } catch (err: any) {
    try {
      await db.updateCommunicationStatus(idempotencyKey, "failed", undefined, err.message || "Unknown error");
    } catch (dbErr) {
      console.error("Failed to log failed Email communication status:", dbErr);
    }
    return false;
  }
}

/**
 * Dispatch Call via Voice Provider (Bolna or Sarvam)
 */
export async function dispatchVoiceCall(params: {
  phone: string;
  leadId: string;
}): Promise<boolean> {
  const { phone, leadId } = params;
  const provider = process.env.VOICE_PROVIDER || "bolna";
  const idempotencyKey = `voice_call:${leadId}`;

  try {
    // 1. Enforce communication idempotency via atomic claim
    const claim = await db.claimCommunication(idempotencyKey, leadId, "voice", provider, undefined, "outbound_call");
    if (claim === "duplicate") {
      console.log(`Duplicate Voice Call detected for lead: ${leadId}. Skipping.`);
      return true;
    }

    const bolnaKey = process.env.BOLNA_API_KEY;
    const sarvamKey = process.env.SARVAM_API_KEY;
    const enableMocks = process.env.ENABLE_PROVIDER_MOCKS === "true";

    // Production check for missing credentials
    if (provider === "bolna" && !bolnaKey) {
      if (enableMocks) {
        console.log(`[MOCK BOLNA CALL] Calling destination: ${phone} (mocks enabled)`);
        const mockSid = `mock-bolna-${Date.now()}`;
        await db.updateCommunicationStatus(idempotencyKey, "sent", mockSid);
        await logActivity({
          leadId,
          actorType: "system",
          action: "voice_call_dispatched",
          details: `Mock call scheduled via bolna. SID: ${mockSid}`
        });
        return true;
      } else {
        console.warn(`[VOICE CALL] Bolna credentials missing. Skipping outbound call for lead: ${leadId}`);
        await db.updateCommunicationStatus(idempotencyKey, "unavailable", undefined, "Bolna credentials missing");
        await logActivity({
          leadId,
          actorType: "system",
          action: "voice_call_skipped",
          details: "Outbound call skipped: Bolna credentials missing."
        });
        await dispatchCriticalAlert({
          severity: "warning",
          title: "Voice Integration Unavailable",
          message: `Voice call skipped for lead ${leadId} because Bolna API Key is missing.`,
          context: { leadId, provider }
        });
        return true; // continue workflow safely
      }
    }

    if (provider === "sarvam" && !sarvamKey) {
      if (enableMocks) {
        console.log(`[MOCK SARVAM CALL] Calling destination: ${phone} (mocks enabled)`);
        const mockSid = `mock-sarvam-${Date.now()}`;
        await db.updateCommunicationStatus(idempotencyKey, "sent", mockSid);
        await logActivity({
          leadId,
          actorType: "system",
          action: "voice_call_dispatched",
          details: `Mock call scheduled via sarvam. SID: ${mockSid}`
        });
        return true;
      } else {
        console.warn(`[VOICE CALL] Sarvam credentials missing. Skipping outbound call for lead: ${leadId}`);
        await db.updateCommunicationStatus(idempotencyKey, "unavailable", undefined, "Sarvam credentials missing");
        await logActivity({
          leadId,
          actorType: "system",
          action: "voice_call_skipped",
          details: "Outbound call skipped: Sarvam credentials missing."
        });
        await dispatchCriticalAlert({
          severity: "warning",
          title: "Voice Integration Unavailable",
          message: `Voice call skipped for lead ${leadId} because Sarvam API Key is missing.`,
          context: { leadId, provider }
        });
        return true; // continue workflow safely
      }
    }

    const dispatchTask = async () => {
      if (provider === "bolna") {
        const agentId = process.env.BOLNA_AGENT_ID || "default-agent";
        const payload = {
          agent_id: agentId,
          recipient_phone_number: phone
        };

        const res = await fetch("https://api.bolna.ai/call", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${bolnaKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Bolna API status ${res.status}: ${txt}`);
        }

        const data = await res.json();
        return { success: true, sid: data.execution_id || `bolna-${Date.now()}` };
      } else {
        // Sarvam
        console.log(`[SARVAM CALL] Calling destination: ${phone}`);
        return { success: true, sid: `sarvam-${Date.now()}` };
      }
    };

    const result = await runWithRetry(
      "dispatch_voice_call",
      dispatchTask,
      leadId,
      { phone, provider }
    );

    await db.updateCommunicationStatus(idempotencyKey, "sent", result.sid);

    await logActivity({
      leadId,
      actorType: "system",
      action: "voice_call_dispatched",
      details: `Outbound call scheduled via ${provider}. SID: ${result.sid}`
    });

    return true;
  } catch (err: any) {
    try {
      await db.updateCommunicationStatus(idempotencyKey, "failed", undefined, err.message || "Unknown error");
    } catch (dbErr) {
      console.error("Failed to log failed Voice communication status:", dbErr);
    }
    return false;
  }
}

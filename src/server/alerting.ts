/**
 * Decoupled System Alerting & Alert Threshold Engine
 * Dispatches critical system alerts across Email, Slack, and WhatsApp channels.
 * Evaluates operational triggers:
 * 1. Database unavailable > 60 seconds (Critical)
 * 2. Webhook failures > 10 in 15 minutes (Warning)
 * 3. Critical errors > 5 in 15 minutes (Critical)
 * 4. Rate-limit breach burst > 15 breaches in 15 minutes (Warning)
 */

import { sanitizeData } from "./sanitize";
import { isSupabaseEnabled, supabaseAdmin } from "./supabase";

export interface AlertPayload {
  severity: "critical" | "warning";
  title: string;
  message: string;
  context?: Record<string, any>;
  timestamp?: string;
}

export interface ThresholdCheckInput {
  dbDownDurationSeconds?: number;
  webhookFailuresIn15Min?: number;
  criticalErrorsIn15Min?: number;
  rateLimitBreachesIn15Min?: number;
  includeBusinessRules?: boolean;
}

export type AlertDispatcher = (alert: AlertPayload) => Promise<boolean>;

const registeredDispatchers: { name: string; dispatcher: AlertDispatcher }[] = [];

/**
 * Register a custom alert channel dispatcher (e.g. Email, Slack, WhatsApp)
 */
export function registerAlertDispatcher(name: string, dispatcher: AlertDispatcher): void {
  registeredDispatchers.push({ name, dispatcher });
}

// Automatically register default Slack Webhook Dispatcher if SLACK_WEBHOOK_URL is configured
if (typeof process !== "undefined" && process.env && process.env.SLACK_WEBHOOK_URL) {
  registerAlertDispatcher("slack-webhook", async (alert) => {
    try {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (!webhookUrl) return false;

      const payload = {
        text: `*[SYSTEM ALERT - ${alert.severity.toUpperCase()}] ${alert.title}*`,
        attachments: [
          {
            color: alert.severity === "critical" ? "#FF0000" : "#FFA500",
            fields: [
              { title: "Message", value: alert.message, short: false },
              { title: "Timestamp", value: alert.timestamp || new Date().toISOString(), short: true },
              { title: "Context", value: alert.context ? JSON.stringify(alert.context) : "None", short: false },
            ],
          },
        ],
      };

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return res.ok;
    } catch (err) {
      console.error("Slack webhook dispatch error:", err);
      return false;
    }
  });
}

/**
 * Dispatch a critical alert to all registered channels
 */
export async function dispatchCriticalAlert(alert: AlertPayload): Promise<{ dispatchedCount: number; success: boolean }> {
  const sanitizedAlert: AlertPayload = {
    severity: alert.severity,
    title: sanitizeData(alert.title),
    message: sanitizeData(alert.message),
    context: alert.context ? sanitizeData(alert.context) : undefined,
    timestamp: alert.timestamp || new Date().toISOString(),
  };

  // Console fallback output
  console.error(`[SYSTEM ALERT - ${sanitizedAlert.severity.toUpperCase()}] ${sanitizedAlert.title}: ${sanitizedAlert.message}`, sanitizedAlert.context || "");

  let successCount = 0;
  for (const { name, dispatcher } of registeredDispatchers) {
    try {
      const ok = await dispatcher(sanitizedAlert);
      if (ok) successCount++;
    } catch (err) {
      console.error(`Failed to dispatch alert via ${name}:`, err);
    }
  }

  return {
    dispatchedCount: successCount,
    success: true,
  };
}

/**
 * Evaluate system operational threshold rules and dispatch alerts when breached
 */
export async function evaluateAlertTriggers(input?: ThresholdCheckInput): Promise<{ triggeredAlerts: string[] }> {
  const triggered: string[] = [];
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  let dbDownSeconds = input?.dbDownDurationSeconds || 0;
  let webhookFailures = input?.webhookFailuresIn15Min || 0;
  let criticalErrors = input?.criticalErrorsIn15Min || 0;
  let breaches = input?.rateLimitBreachesIn15Min || 0;

  if (isSupabaseEnabled && supabaseAdmin && !input) {
    try {
      const [whRes, errRes, breachRes] = await Promise.all([
        supabaseAdmin.from("webhook_events").select("id", { count: "exact", head: true }).eq("status", "failed").gte("created_at", fifteenMinAgo),
        supabaseAdmin.from("error_logs").select("id", { count: "exact", head: true }).eq("severity", "critical").gte("created_at", fifteenMinAgo),
        supabaseAdmin.from("rate_limit_log").select("id", { count: "exact", head: true }).like("action", "%_breach%").gte("created_at", fifteenMinAgo),
      ]);
      webhookFailures = whRes.count || 0;
      criticalErrors = errRes.count || 0;
      breaches = breachRes.count || 0;
    } catch {
      dbDownSeconds = 61; // DB query error implies DB issue
    }
  }

  // Rule 1: Database unavailable > 60 seconds (Critical)
  if (dbDownSeconds > 60) {
    const alertName = "Database Unavailable Alert";
    triggered.push(alertName);
    await dispatchCriticalAlert({
      severity: "critical",
      title: alertName,
      message: `Database connection has been unreachable for ${dbDownSeconds} seconds.`,
      context: { dbDownSeconds },
    });
  }

  // Rule 2: Webhook failures > 10 in 15 minutes (Warning)
  if (webhookFailures > 10) {
    const alertName = "High Webhook Failure Burst Alert";
    triggered.push(alertName);
    await dispatchCriticalAlert({
      severity: "warning",
      title: alertName,
      message: `Detected ${webhookFailures} webhook processing failures in the last 15 minutes.`,
      context: { webhookFailures },
    });
  }

  // Rule 3: Critical errors > 5 in 15 minutes (Critical)
  if (criticalErrors > 5) {
    const alertName = "Critical Error Spike Alert";
    triggered.push(alertName);
    await dispatchCriticalAlert({
      severity: "critical",
      title: alertName,
      message: `Detected ${criticalErrors} critical system exceptions in the last 15 minutes.`,
      context: { criticalErrors },
    });
  }

  // Rule 4: Rate-limit breach burst > 15 breaches in 15 minutes (Warning)
  if (breaches > 15) {
    const alertName = "Rate Limit Breach Burst Alert";
    triggered.push(alertName);
    await dispatchCriticalAlert({
      severity: "warning",
      title: alertName,
      message: `Detected large burst of ${breaches} rate-limit breaches in the last 15 minutes. Potential DDoS or bot activity.`,
      context: { breaches },
    });
  }

  // Rules 5, 6, and 7 evaluate live business metrics and should run only during cron triggers,
  // avoiding triggering on simulated infrastructure checks during unit tests (unless includeBusinessRules is forced)
  if (!input || input.includeBusinessRules) {
    // Rule 5: Conversion Rate Drops Below 15% (Warning)
    try {
      const { db } = await import("./db");
      const dashboardStats = await db.getDashboardMetrics();
      const conversion = dashboardStats.conversionRate;
      if (conversion < 15) {
        const alertName = "Low Funnel Conversion Alert";
        triggered.push(alertName);
        await dispatchCriticalAlert({
          severity: "warning",
          title: alertName,
          message: `Overall qualified-to-won funnel conversion rate is currently ${conversion}%, which is below the target threshold of 15%.`,
          context: { conversionRate: conversion },
        });
      }
    } catch (err) {
      console.error("Failed to check funnel conversion alert:", err);
    }

    // Rule 6: Lead Registration Volume Drop Alert (Warning)
    try {
      const { db } = await import("./db");
      const nowMs = Date.now();
      const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;
      const fourteenDaysAgoMs = nowMs - 14 * 24 * 60 * 60 * 1000;

      const leadsLast7Days = await db.getLeadsCountInWindow(new Date(sevenDaysAgoMs).toISOString(), new Date(nowMs).toISOString());
      const leadsPrior7Days = await db.getLeadsCountInWindow(new Date(fourteenDaysAgoMs).toISOString(), new Date(sevenDaysAgoMs).toISOString());

      if (leadsPrior7Days >= 4 && leadsLast7Days <= leadsPrior7Days * 0.5) {
        const alertName = "Lead Registration Volume Drop Alert";
        triggered.push(alertName);
        await dispatchCriticalAlert({
          severity: "warning",
          title: alertName,
          message: `Lead registration volume dropped by more than 50% in the last 7 days. Count dropped from ${leadsPrior7Days} to ${leadsLast7Days}.`,
          context: { leadsPrior7Days, leadsLast7Days },
        });
      }
    } catch (err) {
      console.error("Failed to check lead volume drop alert:", err);
    }

    // Rule 7: High Funnel Abandonment Alert (Warning)
    try {
      const { db } = await import("./db");
      const funnel = await db.getLeadFunnel();
      const proposalStage = funnel.stages.find((s: any) => s.stage === "proposal sent");
      const wonStage = funnel.stages.find((s: any) => s.stage === "won");
      
      if (proposalStage && wonStage) {
        const proposalCount = proposalStage.count || 0;
        const wonCount = wonStage.count || 0;
        
        if (proposalCount >= 3) {
          const dropOff = proposalCount > 0 ? ((proposalCount - wonCount) / proposalCount) * 100 : 0;
          if (dropOff > 80) {
            const alertName = "High Funnel Abandonment Alert";
            triggered.push(alertName);
            await dispatchCriticalAlert({
              severity: "warning",
              title: alertName,
              message: `Funnel abandonment at the proposal stage has reached ${dropOff.toFixed(1)}% (target drop-off is under 80%).`,
              context: { proposalCount, wonCount, abandonmentRate: dropOff },
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to check funnel abandonment alert:", err);
    }
  }

  return { triggeredAlerts: triggered };
}

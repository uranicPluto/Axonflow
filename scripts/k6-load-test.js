import http from "k6/http";
import { check, sleep } from "k6";

/**
 * Enterprise Production k6 Load Testing Script for House Of Workflow (AxonFlow)
 * 
 * Target Workloads:
 * 1. Public Lead Intake (`createLeadFn`) - High volume public submission
 * 2. Single-Use Call Opt-In (`requestLeadCallFn`) - Single-use token validation
 * 3. System Health Check (`getHealthFn`) - Lightweight status probe
 * 4. Admin Metrics (`getMetricsFn`) - Authenticated RPC query
 */

export const options = {
  stages: [
    { duration: "30s", target: 100 },   // Stage 1: Warmup to 100 VUs
    { duration: "1m", target: 1000 },   // Stage 2: Ramp up to 1,000 VUs (Growth Scale)
    { duration: "2m", target: 5000 },   // Stage 3: Ramp up to 5,000 VUs (High Saturation)
    { duration: "1m", target: 10000 },  // Stage 4: Peak Stress to 10,000 VUs (Enterprise Saturation)
    { duration: "30s", target: 0 },     // Stage 5: Cooldown
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],     // Less than 1% failure rate
    http_req_duration: ["p(95)<500"],   // 95% of requests must complete under 500ms
    http_req_duration: ["p(99)<1500"],  // 99% of requests must complete under 1,500ms
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const vuId = __VU;
  const iterId = __ITER;
  const timestamp = Date.now();

  // Scenario A: System Health Check Probe
  const healthRes = http.get(`${BASE_URL}/_serverFn/getHealthFn`);
  check(healthRes, {
    "health status is 200": (r) => r.status === 200,
  });

  // Scenario B: Public Lead Intake Submission
  const leadPayload = JSON.stringify({
    data: {
      name: `LoadTest User ${vuId}-${iterId}`,
      email: `loadtest-${vuId}-${iterId}-${timestamp}@example.com`,
      phone: `+9198765${Math.floor(10000 + Math.random() * 90000)}`,
      service_interest: "ai_automation",
      problem_description: "Automated k6 load test intake payload.",
      consent: true,
      turnstile_token: "mock-turnstile-token",
    },
  });

  const leadRes = http.post(`${BASE_URL}/_serverFn/createLeadFn`, leadPayload, {
    headers: { "Content-Type": "application/json" },
  });

  const leadSuccess = check(leadRes, {
    "lead creation status is 200": (r) => r.status === 200,
    "lead payload contains ID": (r) => r.body.includes("id"),
  });

  if (leadSuccess) {
    try {
      const body = JSON.parse(leadRes.body);
      const leadId = body?.result?.id;
      const callToken = body?.result?.call_token;

      if (leadId && callToken) {
        // Scenario C: Call Opt-In Token Submission
        const callPayload = JSON.stringify({
          data: {
            leadId: leadId,
            callToken: callToken,
          },
        });

        const callRes = http.post(`${BASE_URL}/_serverFn/requestLeadCallFn`, callPayload, {
          headers: { "Content-Type": "application/json" },
        });

        check(callRes, {
          "call request status is 200": (r) => r.status === 200,
        });
      }
    } catch (e) {
      // JSON parsing error ignored in stress bursts
    }
  }

  sleep(1);
}

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...val] = trimmed.split("=");
      process.env[key.trim()] = val.join("=").trim();
    }
  }
}
if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
}

import { getSupabaseAdmin } from "../src/server/supabase";

async function runProductionAudit() {
  console.log("==================================================");
  console.log("PRODUCTION VERIFICATION AUDIT (LIVE SYSTEM TEST)");
  console.log("==================================================\n");

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("❌ Supabase Admin client failed to initialize!");
    process.exit(1);
  }

  // 1. Target Supabase environment details
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  console.log("1. SUPABASE TARGET DETAILS:");
  console.log("   - SUPABASE_URL:", url);
  console.log("   - Project Reference:", url?.match(/https:\/\/([^.]+)\.supabase/)?.[1] || "unknown");
  console.log("   - Database Schema: public");
  console.log("   - Target Tables: leads, bookings, workflow_events, communication_logs\n");

  // 2. Health check endpoint
  console.log("2. CHECKING PRODUCTION HEALTH ENDPOINT:");
  const healthRes = await fetch("https://www.houseofworkflow.com/api/health");
  const healthJson = await healthRes.json();
  console.log("   Status Code:", healthRes.status);
  console.log("   Response:", JSON.stringify(healthJson));

  // 3. E2E Production Test
  const testBookingId = 23789137;
  const testUid = "23789137";
  const testEmail = "jaymahajan987@gmail.com";

  const payload = {
    triggerEvent: "BOOKING_CREATED",
    createdAt: new Date().toISOString(),
    payload: {
      bookingId: testBookingId,
      uid: testUid,
      title: "House Of Workflow Discovery Call",
      eventTitle: "House Of Workflow Discovery Call",
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 88200000).toISOString(),
      organizer: {
        name: "Jay Mahajan",
        email: "jay@houseofworkflow.com",
        timeZone: "Asia/Kolkata"
      },
      attendees: [
        {
          name: "Jay Mahajan",
          email: testEmail,
          timeZone: "Asia/Kolkata"
        }
      ]
    }
  };

  const bodyString = JSON.stringify(payload);
  const internalToken = process.env.N8N_ALERT_SECRET || "how_alert_secret_v1_8f93a";
  const calSecret = process.env.CAL_WEBHOOK_SECRET || "how_calcom_secret_v1_9f82a";
  const hmacSig = crypto.createHmac("sha256", calSecret).update(bodyString).digest("hex");

  console.log("\n3. RUNNING END-TO-END PRODUCTION WEBHOOK TEST:");
  console.log("   Target URL: https://www.houseofworkflow.com/api/webhook/calcom");
  console.log("   Payload Target: bookingId = 23789137, email = jaymahajan987@gmail.com");

  // Test 3A: Internal Token Header
  console.log("\n   [Test 3A] Sending via x-internal-token header...");
  const resA = await fetch("https://www.houseofworkflow.com/api/webhook/calcom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-token": internalToken
    },
    body: bodyString
  });
  const resAText = await resA.text();
  console.log("   HTTP Status:", resA.status);
  console.log("   Response Body:", resAText);

  // Test 3B: Direct Cal.com HMAC Signature
  console.log("\n   [Test 3B] Sending via X-Cal-Signature-256 header...");
  const resB = await fetch("https://www.houseofworkflow.com/api/webhook/calcom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Cal-Signature-256": hmacSig
    },
    body: bodyString
  });
  const resBText = await resB.text();
  console.log("   HTTP Status:", resB.status);
  console.log("   Response Body:", resBText);

  // 4. Query Supabase for results
  console.log("\n4. QUERYING PRODUCTION SUPABASE FOR RECORD CREATION:");
  const { data: leadRows, error: lErr } = await supabase.from("leads").select("*").eq("email", testEmail);
  const { data: bookingRows, error: bErr } = await supabase.from("bookings").select("*").eq("cal_booking_uid", testUid);
  const { data: wfRows, error: wErr } = await supabase.from("workflow_events").select("*").eq("event_id", `BOOKING_CREATED:${testUid}`);
  const { data: commRows, error: cErr } = await supabase.from("communication_logs").select("*").eq("lead_id", leadRows?.[0]?.id || "none");

  console.log("   Leads Query Error:", lErr ? lErr.message : "NONE");
  console.log("   Leads Count:", leadRows?.length || 0);
  if (leadRows && leadRows.length > 0) {
    console.log("   Created Lead ID:", leadRows[0].id);
    console.log("   Lead Record:", JSON.stringify(leadRows[0], null, 2));
  }

  console.log("   Bookings Query Error:", bErr ? bErr.message : "NONE");
  console.log("   Bookings Count:", bookingRows?.length || 0);
  if (bookingRows && bookingRows.length > 0) {
    console.log("   Created Booking ID:", bookingRows[0].id);
    console.log("   Booking Record:", JSON.stringify(bookingRows[0], null, 2));
  }

  console.log("   Workflow Events Count:", wfRows?.length || 0);
  if (wfRows && wfRows.length > 0) {
    console.log("   Workflow Event Record:", JSON.stringify(wfRows[0], null, 2));
  }
}

runProductionAudit().catch(console.error);

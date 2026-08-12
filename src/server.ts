import "./lib/error-capture";
import { assertProductionEnv } from "./server/env-check";

let envChecked = false;
let envError: Error | null = null;

function checkProductionEnvLazy(): Error | null {
  if (!envChecked) {
    envChecked = true;
    try {
      assertProductionEnv();
    } catch (err: any) {
      envError = err;
    }
  }
  return envError;
}

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const err = checkProductionEnvLazy();
    if (err) {
      const url = new URL(request.url);
      if (url.pathname === "/api/health") {
        return new Response(
          JSON.stringify({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            database: "disconnected",
            environment: "production",
            uptimeSeconds: 0,
            error: err.message,
          }),
          {
            status: 503,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store, no-cache, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0",
            },
          }
        );
      }
      return new Response(
        `<!DOCTYPE html><html><head><title>Configuration Required - House of Workflow</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>` +
        `<body style="font-family:system-ui,-apple-system,sans-serif;background:#090d16;color:#f3f4f6;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:1.5rem;">` +
        `<div style="max-width:540px;background:#111827;border:1px solid #1f2937;border-radius:12px;padding:2rem;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">` +
        `<h2 style="color:#f87171;margin-top:0;">⚡ House of Workflow — Setup Required</h2>` +
        `<p style="color:#d1d5db;line-height:1.6;">The production environment is missing required operational credentials.</p>` +
        `<div style="background:#1e1b4b;border-left:4px solid #6366f1;padding:1rem;margin:1.5rem 0;font-family:monospace;font-size:0.875rem;color:#c7d2fe;word-break:break-word;">` +
        `${err.message}` +
        `</div>` +
        `<p style="color:#9ca3af;font-size:0.875rem;line-height:1.5;"><strong>Next Steps:</strong> Open Vercel Dashboard &rarr; Project Settings &rarr; Environment Variables, set the required variables for Production environment, and trigger a redeploy.</p>` +
        `</div></body></html>`,
        {
          status: 503,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

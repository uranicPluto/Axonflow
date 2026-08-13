/**
 * Central Cal.com Configuration & Embed Utility
 * Connects website CTAs to the official Cal.com booking experience.
 */

export const CALCOM_EVENT_SLUG = "jay-mahajan-euwk62/j";
export const CALCOM_BOOKING_URL = "https://cal.com/jay-mahajan-euwk62/j";

declare global {
  interface Window {
    Cal?: any;
  }
}

/**
 * Initialize Cal.com embed script on the client side (SSR safe).
 */
export function initCalcomEmbed() {
  if (typeof window === "undefined") return;

  (function (C: any, A: any, L: any) {
    let p = function (a: any, ar: any) {
      a.q.push(ar);
    };
    let c = C.document;
    C.Cal =
      C.Cal ||
      function () {
        let a = C.Cal;
        if (!a.loaded) {
          a.loaded = true;
          a.q = [];
          let s = c.createElement("script");
          s.src = "https://embed.cal.com/embed/parent.js";
          let h = c.getElementsByTagName("head")[0];
          if (h) {
            h.appendChild(s);
          }
        }
        a.p = p;
        a.ar = arguments;
        return a;
      };
  })(window, "clean", null);

  if (window.Cal) {
    window.Cal("init", { origin: "https://cal.com" });
    window.Cal("ui", {
      theme: "dark",
      styles: { branding: { brandColor: "#6366f1" } },
      hideEventTypeDetails: false,
      layout: "month_view",
    });
  }
}

export interface CalcomPrefillOptions {
  name?: string;
  email?: string;
  notes?: string;
}

/**
 * Programmatically trigger the Cal.com popup scheduling modal.
 * Preserves UTM parameters from current window URL.
 */
export function openCalcomBookingModal(
  customCalLink: string = CALCOM_EVENT_SLUG,
  prefill?: CalcomPrefillOptions
) {
  if (typeof window === "undefined") return;

  initCalcomEmbed();

  // Extract UTM parameters to pass to Cal.com tracking
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const val = urlParams.get(key);
    if (val) utmParams[key] = val;
  }

  const configObj: Record<string, any> = {
    ...utmParams,
    ...prefill,
  };

  if (window.Cal) {
    window.Cal("popup", {
      calLink: customCalLink,
      config: configObj,
    });
  } else {
    window.open(CALCOM_BOOKING_URL, "_blank", "noopener,noreferrer");
  }
}

/**
 * Register a listener for successful Cal.com bookings.
 */
export function onCalcomBookingSuccess(callback: (eventData: any) => void) {
  if (typeof window === "undefined") return;
  initCalcomEmbed();

  if (window.Cal) {
    window.Cal("on", {
      action: "bookingSuccessful",
      callback: (e: any) => {
        callback(e?.detail || e);
      },
    });
  }
}

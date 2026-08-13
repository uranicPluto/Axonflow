import { getCalApi } from "@calcom/embed-react";

/**
 * Central Cal.com Configuration & Embed Utility using official @calcom/embed-react API
 */
export const CALCOM_NAMESPACE = "j";
export const CALCOM_EVENT_SLUG = "jay-mahajan-euwk62/j";
export const CALCOM_BOOKING_URL = "https://cal.com/jay-mahajan-euwk62/j";

declare global {
  interface Window {
    Cal?: any;
  }
}

/**
 * Initialize Cal.com embed API with namespace "j" (SSR safe).
 */
export async function initCalcomEmbed() {
  if (typeof window === "undefined") return null;

  try {
    const cal = await getCalApi({ namespace: CALCOM_NAMESPACE });
    cal("ui", {
      theme: "dark",
      styles: { branding: { brandColor: "#6366f1" } },
      hideEventTypeDetails: false,
      layout: "month_view",
    });
    return cal;
  } catch (err) {
    console.error("Failed to initialize Cal.com API:", err);
    return null;
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
export async function openCalcomBookingModal(
  customCalLink: string = CALCOM_EVENT_SLUG,
  prefill?: CalcomPrefillOptions
) {
  if (typeof window === "undefined") return;

  const cal = await initCalcomEmbed();

  // Extract UTM parameters to pass to Cal.com tracking
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const val = urlParams.get(key);
    if (val) utmParams[key] = val;
  }

  const configObj: Record<string, any> = {
    layout: "month_view",
    useSlotsViewOnSmallScreen: "true",
    ...utmParams,
    ...prefill,
  };

  if (cal) {
    cal("popup", {
      calLink: customCalLink,
      config: configObj,
    });
  } else if (window.Cal) {
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
export async function onCalcomBookingSuccess(callback: (eventData: any) => void) {
  if (typeof window === "undefined") return;
  const cal = await initCalcomEmbed();

  if (cal) {
    cal("on", {
      action: "bookingSuccessful",
      callback: (e: any) => {
        callback(e?.detail || e);
      },
    });
  }
}

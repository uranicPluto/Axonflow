/**
 * Cal.com API Client — Direct Availability Queries & Slot Booking
 */

export interface CalcomTimeSlot {
  time: string; // ISO 8601 string
  formattedTime: string;
}

export interface CalcomBookingParams {
  eventTypeId?: number | string;
  start: string;
  name: string;
  email: string;
  phone?: string;
  timezone?: string;
  responses?: Record<string, any>;
}

export interface CalcomBookingResult {
  success: boolean;
  bookingId?: string;
  bookingUid?: string;
  meetingLink?: string;
  start?: string;
  error?: string;
}

/**
 * Fetch available time slots for a given Cal.com event type across a date range.
 */
export async function getCalcomAvailability(params: {
  eventTypeId?: string | number;
  dateFrom?: string;
  dateTo?: string;
  timeZone?: string;
}): Promise<CalcomTimeSlot[]> {
  const apiKey = process.env.CAL_API_KEY;
  const eventTypeId = params.eventTypeId || process.env.CAL_EVENT_TYPE_ID || "discovery-call";
  const timeZone = params.timeZone || "Asia/Kolkata";
  const dateFrom = params.dateFrom || new Date().toISOString().split("T")[0];
  
  // Default dateTo to 3 days from dateFrom
  const startDate = new Date(dateFrom);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 3);
  const dateTo = params.dateTo || endDate.toISOString().split("T")[0];

  if (!apiKey && process.env.NODE_ENV === "production" && process.env.ENABLE_PROVIDER_MOCKS !== "true") {
    console.warn("[CALCOM API] CAL_API_KEY missing in production. Returning mock availability.");
  }

  // If mock mode or API key missing
  if (!apiKey || process.env.ENABLE_PROVIDER_MOCKS === "true") {
    const slots: CalcomTimeSlot[] = [];
    const base = new Date();
    base.setHours(base.getHours() + 24); // Tomorrow

    for (let i = 0; i < 4; i++) {
      const slotTime = new Date(base.getTime() + i * 2 * 60 * 60 * 1000); // every 2 hours
      slots.push({
        time: slotTime.toISOString(),
        formattedTime: slotTime.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone,
        }),
      });
    }
    return slots;
  }

  try {
    const url = `https://api.cal.com/v1/availability?apiKey=${apiKey}&eventTypeId=${eventTypeId}&dateFrom=${dateFrom}&dateTo=${dateTo}&timeZone=${encodeURIComponent(timeZone)}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[CALCOM API] Availability API returned status ${res.status}`);
      return [];
    }

    const data = await res.json();
    const busySlots = data.busy || [];
    const availableSlots: CalcomTimeSlot[] = [];

    // Filter and format available slots
    const cur = new Date(dateFrom);
    while (cur <= new Date(dateTo)) {
      // Create 10:00, 14:00, 16:00 slot candidates
      for (const hour of [10, 14, 16]) {
        const slotCandidate = new Date(cur);
        slotCandidate.setHours(hour, 0, 0, 0);

        if (slotCandidate > new Date()) {
          const iso = slotCandidate.toISOString();
          const isBusy = busySlots.some((b: any) => new Date(b.start) <= slotCandidate && new Date(b.end) > slotCandidate);
          if (!isBusy) {
            availableSlots.push({
              time: iso,
              formattedTime: slotCandidate.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone,
              }),
            });
          }
        }
      }
      cur.setDate(cur.getDate() + 1);
    }

    return availableSlots.slice(0, 5);
  } catch (err: any) {
    console.error("[CALCOM API] Error fetching availability:", err?.message);
    return [];
  }
}

/**
 * Book a slot directly via Cal.com API.
 */
export async function bookCalcomSlot(params: CalcomBookingParams): Promise<CalcomBookingResult> {
  const apiKey = process.env.CAL_API_KEY;
  const eventTypeId = params.eventTypeId || process.env.CAL_EVENT_TYPE_ID || "discovery-call";
  const timezone = params.timezone || "Asia/Kolkata";

  if (!apiKey || process.env.ENABLE_PROVIDER_MOCKS === "true") {
    console.log(`[MOCK CALCOM BOOKING] Booking slot for ${params.name} (${params.email}) at ${params.start}`);
    const mockUid = `bk-${Date.now()}`;
    return {
      success: true,
      bookingId: mockUid,
      bookingUid: mockUid,
      meetingLink: `https://cal.com/meeting/${mockUid}`,
      start: params.start,
    };
  }

  try {
    const payload = {
      eventTypeId: Number(eventTypeId) || eventTypeId,
      start: params.start,
      name: params.name,
      email: params.email,
      timeZone: timezone,
      metadata: { phone: params.phone, source: "ai_voice_booking" },
      responses: {
        name: params.name,
        email: params.email,
        phone: params.phone || "",
        ...(params.responses || {}),
      },
    };

    const res = await fetch(`https://api.cal.com/v1/bookings?apiKey=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errTxt = await res.text();
      console.error(`[CALCOM API] Booking slot failed: status ${res.status}`, errTxt);
      return { success: false, error: `Cal.com Booking Error: ${errTxt}` };
    }

    const data = await res.json();
    const bookingObj = data.booking || data;
    const uid = bookingObj.uid || bookingObj.id || `bk-${Date.now()}`;
    const meetingLink = bookingObj.location || bookingObj.meetingUrl || `https://cal.com/meeting/${uid}`;

    return {
      success: true,
      bookingId: String(uid),
      bookingUid: String(uid),
      meetingLink,
      start: params.start,
    };
  } catch (err: any) {
    console.error("[CALCOM API] Exception during booking creation:", err?.message);
    return { success: false, error: err?.message || "Booking request failed" };
  }
}

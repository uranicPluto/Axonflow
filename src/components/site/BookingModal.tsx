import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import { brand } from "@/content/site";

export function BookingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const today = new Date();

  // Real working calendar state (Default: Current date / August 2026)
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Time format toggle (12h vs 24h)
  const [is24Hour, setIs24Hour] = useState(false);

  // Step state: "time" | "form" | "confirmed"
  const [step, setStep] = useState<"time" | "form" | "confirmed">("time");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guest email state
  const [showGuests, setShowGuests] = useState(false);
  const [guestEmails, setGuestEmails] = useState<string[]>([""]);

  // Reset to current date & step 1 every time modal is opened
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setCurrentYear(now.getFullYear());
      setCurrentMonth(now.getMonth());
      setSelectedDay(now.getDate());
      setSelectedTime(null);
      setStep("time");
      setName("");
      setEmail("");
      setNotes("");
      setShowGuests(false);
      setGuestEmails([""]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Dynamic Month details
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const startDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  const monthLabel = `${monthNames[currentMonth]} ${currentYear}`;

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Time slots in 12h vs 24h (Starting from 12:00pm / 12:00)
  const timeSlots12 = [
    "12:00pm",
    "12:30pm",
    "1:00pm",
    "1:30pm",
    "2:00pm",
    "2:30pm",
    "3:00pm",
    "3:30pm",
    "4:00pm",
    "4:30pm",
    "5:00pm",
    "5:30pm",
    "6:00pm",
    "6:30pm",
    "7:00pm",
  ];

  const timeSlots24 = [
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
  ];

  const activeTimeSlots = is24Hour ? timeSlots24 : timeSlots12;

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep("form");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("confirmed");
    }, 600);
  };

  const handleReset = () => {
    setStep("time");
    setSelectedTime(null);
    setName("");
    setEmail("");
    setNotes("");
    setShowGuests(false);
    setGuestEmails([""]);
    onClose();
  };

  // Format date display for selected day
  const formattedSelectedDate = useMemo(() => {
    const d = new Date(currentYear, currentMonth, selectedDay);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }, [currentYear, currentMonth, selectedDay]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/65 backdrop-blur-lg"
          />

          {/* Modal Card - Increased max width and height */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-[92vh] w-full max-w-[1040px] flex-col overflow-hidden rounded-[28px] border border-hairline bg-surface shadow-2xl"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-hairline px-8 py-5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-bold tracking-tight">
                  [ <span className="font-display">{brand.name.toUpperCase()}</span> <span className="text-primary">.</span> ]
                </span>
                <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                  // book a call — explore how we can help your business
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-8 sm:p-10">
              {step === "confirmed" ? (
                /* Success State */
                <div className="my-12 flex flex-col items-center justify-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-3xl font-medium">Booking Confirmed!</h3>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
                    We've scheduled your alignment call for{" "}
                    <strong className="text-foreground">{formattedSelectedDate}, {currentYear} at {selectedTime}</strong>. A calendar invite has been sent to <span className="text-foreground">{email}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lift hover:opacity-90"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
                  {/* Left Column - Host & Meeting Meta */}
                  <div className="border-b border-hairline pb-8 lg:border-b-0 lg:border-r lg:pr-10 lg:pb-0">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-mono text-base font-semibold text-primary">
                        {brand.name.split(" ").map((w) => w[0]).join("")}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{brand.name} Team</p>
                        <p className="text-base font-semibold text-foreground">Discovery Call</p>
                      </div>
                    </div>

                    <h3 className="mt-6 text-2xl font-medium">Alignment Call</h3>

                    <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                      {step === "form" && selectedTime && (
                        <div className="flex items-start gap-3 border-b border-hairline/60 pb-4 text-foreground">
                          <span className="mt-0.5 text-base">📅</span>
                          <div>
                            <p className="font-semibold text-foreground">{formattedSelectedDate}, {currentYear}</p>
                            <p className="text-xs text-muted-foreground">{selectedTime} – 30 mins</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <span className="text-base">⏱️</span>
                        <span className="font-medium text-foreground/80">30m</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-base">📹</span>
                        <span className="font-medium text-foreground/80">Google Meet Video</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-base">🌐</span>
                        <span className="font-medium text-foreground/80">Asia/Kolkata</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Working Calendar & Time Slots OR Booking Form */}
                  {step === "time" ? (
                    <div className="grid gap-8 md:grid-cols-[1fr_220px]">
                      {/* Interactive Calendar Month View */}
                      <div>
                        {/* Month Header & Controls */}
                        <div className="flex items-center justify-between pb-6">
                          <span className="font-display text-base font-semibold">{monthLabel}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handlePrevMonth}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-background text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                              aria-label="Previous month"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              onClick={handleNextMonth}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-background text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                              aria-label="Next month"
                            >
                              ›
                            </button>
                          </div>
                        </div>

                        {/* Calendar Day Grid */}
                        <div className="grid grid-cols-7 gap-2.5 text-center text-xs">
                          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                            <span key={d} className="py-1.5 font-mono text-[0.7rem] font-bold tracking-wider text-muted-foreground uppercase">
                              {d}
                            </span>
                          ))}

                          {/* Empty offset padding for first day of month */}
                          {Array.from({ length: startDayOfWeek }).map((_, idx) => (
                            <span key={`empty-${idx}`} className="h-11 w-full" />
                          ))}

                          {/* Day buttons with gray background box & today indicator dot */}
                          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                            const isSelected = selectedDay === day;
                            const isToday =
                              day === today.getDate() &&
                              currentMonth === today.getMonth() &&
                              currentYear === today.getFullYear();

                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => setSelectedDay(day)}
                                className={`relative flex h-11 sm:h-12 w-full flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground shadow-md scale-[1.04]"
                                    : "bg-secondary/70 text-foreground hover:bg-secondary hover:scale-[1.04]"
                                }`}
                              >
                                <span>{day}</span>
                                {isToday && (
                                  <span
                                    className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${
                                      isSelected ? "bg-primary-foreground" : "bg-primary"
                                    }`}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Slots Column + 12h / 24h Format Toggle Switch */}
                      <div className="border-t border-hairline pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">
                            {new Date(currentYear, currentMonth, selectedDay).toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                          </span>

                          {/* 12h / 24h Format Converter Toggle */}
                          <div className="flex items-center rounded-lg bg-secondary/80 p-0.5 text-[0.7rem]">
                            <button
                              type="button"
                              onClick={() => setIs24Hour(false)}
                              className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
                                !is24Hour
                                  ? "bg-background text-foreground shadow-xs font-semibold"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              12h
                            </button>
                            <button
                              type="button"
                              onClick={() => setIs24Hour(true)}
                              className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
                                is24Hour
                                  ? "bg-background text-foreground shadow-xs font-semibold"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              24h
                            </button>
                          </div>
                        </div>

                        {/* Clean Scrollable Time Slots List */}
                        <div className="flex max-h-[340px] flex-col gap-2.5 overflow-y-auto px-1.5 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {activeTimeSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleSelectTime(time)}
                              className="w-full rounded-2xl border border-hairline bg-background py-2.5 text-center text-xs font-semibold text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary hover:scale-[1.01]"
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Step 2: Booking Form (Matching Cal.com Reference Images 1 & 2) */
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-foreground/90">Your name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder=""
                          className="mt-2 w-full rounded-xl border border-hairline bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground/90">Email address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder=""
                          className="mt-2 w-full rounded-xl border border-hairline bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground/90">
                          Tell us about your business *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Please share anything that will help prepare for our meeting."
                          className="mt-2 w-full rounded-xl border border-hairline bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                        />
                      </div>

                      {/* Add Guests Section (Matching Cal.com Reference Images 1 & 2) */}
                      <div className="pt-1">
                        {!showGuests ? (
                          <button
                            type="button"
                            onClick={() => {
                              setShowGuests(true);
                              setGuestEmails([""]);
                            }}
                            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="8.5" cy="7" r="4" />
                              <line x1="20" y1="8" x2="20" y2="14" />
                              <line x1="17" y1="11" x2="23" y2="11" />
                            </svg>
                            Add guests
                          </button>
                        ) : (
                          <div className="space-y-2.5">
                            <label className="block text-sm font-semibold text-foreground/90">Add guests</label>

                            {guestEmails.map((emailVal, idx) => (
                              <div key={idx} className="relative flex items-center">
                                <input
                                  type="email"
                                  value={emailVal}
                                  onChange={(e) => {
                                    const updated = [...guestEmails];
                                    updated[idx] = e.target.value;
                                    setGuestEmails(updated);
                                  }}
                                  placeholder="Email"
                                  className="w-full rounded-xl border border-hairline bg-background px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (guestEmails.length === 1) {
                                      setShowGuests(false);
                                      setGuestEmails([""]);
                                    } else {
                                      setGuestEmails(guestEmails.filter((_, i) => i !== idx));
                                    }
                                  }}
                                  className="absolute right-3.5 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                  aria-label="Remove guest email field"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => setGuestEmails((prev) => [...prev, ""])}
                              className="inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="17" y1="11" x2="23" y2="11" />
                              </svg>
                              Add another
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="pt-2 text-xs text-muted-foreground">
                        By proceeding, you agree to {brand.name}'s{" "}
                        <span className="font-semibold text-foreground">Terms</span> and{" "}
                        <span className="font-semibold text-foreground">Privacy Policy</span>.
                      </p>

                      <div className="flex items-center justify-end gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => setStep("time")}
                          className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground shadow-lift hover:opacity-90 disabled:opacity-50"
                        >
                          {isSubmitting ? "Confirming..." : "Confirm"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Bottom Company Brand Footer */}
              <div className="mt-8 flex items-center justify-center border-t border-hairline/60 pt-5 font-mono text-sm font-bold tracking-tight text-foreground/75">
                [ <span className="font-display tracking-normal">{brand.name.toUpperCase()}</span> <span className="text-primary">.</span> ]
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

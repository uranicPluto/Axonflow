import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { mainNav, brand } from "@/content/site";
import { cn } from "@/lib/utils";

import { BookingModal } from "./BookingModal";
import { ArrowRight, Container } from "./primitives";

function Wordmark({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label={`${brand.name} home`}>
      <span className="relative flex h-7 w-7 items-center justify-center">
        <svg viewBox="0 0 28 28" className="h-7 w-7" aria-hidden>
          <rect x="0.75" y="0.75" width="26.5" height="26.5" rx="7.5" fill="none" stroke="currentColor" strokeOpacity="0.16" />
          <circle cx="8" cy="8" r="2" fill="currentColor" className="text-primary" />
          <circle cx="20" cy="8" r="1.5" fill="currentColor" opacity="0.35" />
          <circle cx="8" cy="20" r="1.5" fill="currentColor" opacity="0.35" />
          <circle cx="20" cy="20" r="2.6" fill="currentColor" className="text-primary" />
          <path d="M8 8h12M8 8v12M8 20h12M20 8v12" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" />
          <path d="M8 8L20 20" stroke="currentColor" strokeWidth="1.4" className="text-primary" />
        </svg>
      </span>
      <span className={cn("font-display text-[1.0625rem] font-semibold tracking-tight", tone === "dark" && "text-ink-foreground")}>
        {brand.name}
      </span>
    </Link>
  );
}

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpen(null);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled ? "border-b border-hairline bg-background/85 backdrop-blur-xl" : "border-b border-transparent",
        )}
        onMouseLeave={() => setOpen(null)}
      >
        <Container size="wide">
          <div className="grid h-16 grid-cols-[auto_1fr] items-center gap-4 sm:h-[4.5rem] lg:grid-cols-[1fr_auto_1fr]">
            <div className="flex items-center justify-start">
              <Wordmark />
            </div>

            <nav className="hidden items-center justify-center gap-1 lg:flex" aria-label="Main">
              {mainNav.map((group) => {
                const active = pathname === group.to || pathname.startsWith(`${group.to}/`);
                return (
                  <div key={group.label} onMouseEnter={() => setOpen(group.children ? group.label : null)}>
                    <Link
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      to={group.to as any}
                      className={cn(
                        "relative flex h-9 items-center rounded-full px-3.5 text-[0.875rem] transition-colors",
                        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {group.label}
                      {active ? (
                        <span className="absolute inset-x-3.5 -bottom-px h-px bg-primary" aria-hidden />
                      ) : null}
                    </Link>
                  </div>
                );
              })}
            </nav>

            <div className="flex items-center justify-end gap-2">
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  to="/careers"
                  className="flex h-9 items-center rounded-full px-3.5 text-[0.875rem] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Careers
                </Link>
                <button
                  type="button"
                  onClick={() => setBookingOpen(true)}
                  className="group inline-flex h-9 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float active:translate-y-0"
                >
                  Book a discovery call
                  <ArrowRight />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline lg:hidden"
              >
                <span className="relative block h-3 w-4">
                  <span
                    className={cn(
                      "absolute left-0 h-px w-4 bg-foreground transition-all duration-300",
                      mobileOpen ? "top-1.5 rotate-45" : "top-0.5",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 h-px w-4 bg-foreground transition-all duration-300",
                      mobileOpen ? "top-1.5 -rotate-45" : "top-2.5",
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </Container>

        {/* Desktop mega menu */}
        <AnimatePresence>
          {open ? (
            <motion.div
              key={open}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 top-full hidden border-y border-hairline bg-background/95 backdrop-blur-xl lg:block"
            >
              <Container size="wide">
                <div className="grid gap-8 py-8 lg:grid-cols-[220px_1fr]">
                  <div>
                    <p className="eyebrow">{open}</p>
                    <Link
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      to={mainNav.find((g) => g.label === open)!.to as any}
                      className="group mt-3 inline-flex items-center gap-2 font-display text-lg font-medium"
                    >
                      View all
                      <ArrowRight />
                    </Link>
                  </div>
                  <ul className="grid gap-1 md:grid-cols-2 xl:grid-cols-3">
                    {mainNav
                      .find((g) => g.label === open)!
                      .children?.map((child) => (
                        <li key={child.to}>
                          <Link
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            to={child.to as any}
                            className="group block rounded-xl border border-transparent px-4 py-3 transition-colors hover:border-hairline hover:bg-surface"
                          >
                            <span className="flex items-center gap-1.5 text-[0.9375rem] font-medium">
                              {child.label}
                              <ArrowRight className="opacity-0 transition-opacity group-hover:opacity-100" />
                            </span>
                            <span className="mt-1 block text-[0.8125rem] leading-snug text-muted-foreground">
                              {child.blurb}
                            </span>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </Container>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-hairline bg-background lg:hidden"
            >
              <Container className="py-4">
                <ul className="divide-y divide-hairline">
                  {mainNav.map((group) => (
                    <li key={group.label} className="py-1">
                      <div className="flex items-center justify-between">
                        <Link
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          to={group.to as any}
                          className="py-2.5 font-display text-base font-medium"
                        >
                          {group.label}
                        </Link>
                        {group.children ? (
                          <button
                            type="button"
                            onClick={() => setOpen(open === group.label ? null : group.label)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-muted-foreground"
                            aria-label={`Toggle ${group.label}`}
                          >
                            {open === group.label ? "–" : "+"}
                          </button>
                        ) : null}
                      </div>
                      {group.children && open === group.label ? (
                        <ul className="pb-3 pl-1">
                          {group.children.map((child) => (
                            <li key={child.to}>
                              <Link
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                to={child.to as any}
                                className="block py-2 text-sm text-muted-foreground"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                  <li className="py-1">
                    <Link to="/about" className="block py-2.5 font-display text-base font-medium">
                      About
                    </Link>
                  </li>
                  <li className="py-1">
                    <Link to="/careers" className="block py-2.5 font-display text-base font-medium">
                      Careers
                    </Link>
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setBookingOpen(true);
                  }}
                  className="group mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary px-7 text-[0.95rem] font-medium text-primary-foreground shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float active:translate-y-0"
                >
                  Book a discovery call
                  <ArrowRight />
                </button>
              </Container>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}

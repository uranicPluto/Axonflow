import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { brand } from "@/content/site";

import { BookingModal } from "./BookingModal";
import { Container } from "./primitives";

export function Footer() {
  const year = new Date().getFullYear();
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-hairline bg-background text-foreground">
        <Container size="wide" className="py-12 sm:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Brand & Status Indicator */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="group flex items-center gap-2.5"
                aria-label={`${brand.name} home`}
              >
                <span className="font-display text-xl font-bold tracking-tight">
                  {brand.name}
                  <span className="text-primary">.</span>
                </span>
              </Link>
              <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
            </div>

            {/* Center: Horizontal Navigation Links */}
            <div className="flex flex-col items-start gap-2.5 lg:items-center">
              {/* Top Primary Row */}
              <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.9375rem] font-medium text-foreground/80 sm:gap-x-8">
                <Link to="/" className="transition-colors hover:text-foreground">
                  Home
                </Link>
                <Link to="/services" className="transition-colors hover:text-foreground">
                  Services
                </Link>
                <Link to="/solutions" className="transition-colors hover:text-foreground">
                  Solutions
                </Link>
                <Link to="/case-studies" className="transition-colors hover:text-foreground">
                  Portfolio
                </Link>
                <Link to="/blogs" className="transition-colors hover:text-foreground">
                  Blogs
                </Link>
                <Link to="/careers" className="transition-colors hover:text-foreground">
                  Careers
                </Link>
                <button
                  type="button"
                  onClick={() => setBookingOpen(true)}
                  className="transition-colors hover:text-foreground"
                >
                  Book a call
                </button>
              </nav>

              {/* Sub Secondary Row */}
              <div className="flex flex-wrap items-center gap-x-5 text-xs text-muted-foreground/75">
                <Link to="/about" className="transition-colors hover:text-foreground">
                  What We Do
                </Link>
                <Link to="/solutions" className="transition-colors hover:text-foreground">
                  Industries
                </Link>
                <Link to="/contact" className="transition-colors hover:text-foreground">
                  FAQ
                </Link>
              </div>
            </div>

            {/* Right: Agency Details */}
            <div className="text-left text-xs leading-relaxed text-muted-foreground lg:text-right">
              <p className="font-medium text-foreground/90">Web Development &amp; AI Automation</p>
              <p>{brand.addressLines[0]}</p>
              <p>
                <a
                  href={`mailto:${brand.email}`}
                  className="transition-colors hover:text-foreground"
                >
                  {brand.email}
                </a>
              </p>
            </div>
          </div>

          {/* Bottom copyright & Socials */}
          <div className="mt-12 flex flex-col gap-4 border-t border-hairline pt-7 text-xs text-muted-foreground/70 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {brand.legalName}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href={brand.social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                LinkedIn
              </a>
              <a
                href={brand.social.x}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                X
              </a>
              <a
                href={brand.social.github}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                GitHub
              </a>
            </div>
          </div>
        </Container>
      </footer>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let currentX = -100;
    let currentY = -100;
    let targetX = -100;
    let targetY = -100;
    let isHovered = false;

    const moveCursor = (e: MouseEvent) => {
      targetX = e.clientX - 10;
      targetY = e.clientY - 10;
    };

    const handleMouseLeave = () => {
      cursor.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      cursor.style.opacity = "0.9";
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.getAttribute("role") === "button" ||
        target.closest('[role="button"]')
      ) {
        isHovered = true;
      } else {
        isHovered = false;
      }
    };

    // Smooth animation loop using requestAnimationFrame
    let animationFrameId: number;
    const updatePosition = () => {
      // Lerp for smooth lag effect (linear interpolation)
      const ease = 0.15;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      const scale = isHovered ? 1.4 : 1;
      const color = isHovered ? "#8094f8" : "#93a5ff";

      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${scale})`;
      cursor.style.backgroundColor = color;

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseover", handleMouseOver);

    updatePosition();

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-5 w-5 rounded-full bg-[#93a5ff] opacity-90 transition-opacity duration-300 md:block hidden"
      style={{
        transform: "translate3d(-100px, -100px, 0)",
        willChange: "transform",
      }}
    />
  );
}

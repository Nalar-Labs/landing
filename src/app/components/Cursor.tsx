import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const INTERACTIVE = 'a, button, input, textarea, select, [role="button"]';

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("custom-cursor");
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.06, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.06, ease: "power2.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.38, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.38, ease: "power3.out" });

    let visible = false;
    const onMove = (e: MouseEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element).closest?.(INTERACTIVE)) {
        gsap.to(ring, { scale: 1.7, duration: 0.25, ease: "power2.out", overwrite: "auto" });
        gsap.to(dot, { scale: 0.5, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element).closest?.(INTERACTIVE)) {
        gsap.to([ring, dot], { scale: 1, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      }
    };
    const onDown = () => gsap.to(ring, { scale: 0.85, duration: 0.12, overwrite: "auto" });
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.3, ease: "back.out(2)", overwrite: "auto" });
    const onLeave = () => {
      visible = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf([dot, ring]);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="invisible fixed left-0 top-0 z-[2000] h-2 w-2 rounded-full bg-white mix-blend-difference pointer-events-none"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="invisible fixed left-0 top-0 z-[2000] h-9 w-9 rounded-full border border-white mix-blend-difference pointer-events-none"
      />
    </>
  );
}

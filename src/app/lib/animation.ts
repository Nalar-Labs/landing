import { gsap } from "gsap";

/**
 * Splits an element's text into per-word masked spans for staggered reveals.
 * Returns the inner spans (the animation targets).
 *
 * The mask spans get pb-[0.12em]/-mb-[0.12em] so serif descenders aren't
 * clipped by overflow-hidden at tight line-heights. The original text is
 * exposed to screen readers via aria-label; the visual spans are aria-hidden.
 */
export function splitWords(el: HTMLElement): HTMLElement[] {
  const text = (el.textContent ?? "").trim().replace(/\s+/g, " ");
  el.setAttribute("aria-label", text);
  el.textContent = "";
  const inners: HTMLElement[] = [];
  const words = text.split(" ");
  words.forEach((word, i) => {
    const mask = document.createElement("span");
    mask.className = "inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]";
    mask.setAttribute("aria-hidden", "true");
    const inner = document.createElement("span");
    inner.className = "inline-block will-change-transform";
    inner.textContent = word;
    mask.appendChild(inner);
    el.appendChild(mask);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    inners.push(inner);
  });
  return inners;
}

/** Masked word rise for section headings, triggered once on scroll into view. */
export function wordRevealOnScroll(heading: HTMLElement, trigger: Element): void {
  const words = splitWords(heading);
  gsap.from(words, {
    yPercent: 120,
    duration: 0.85,
    ease: "power3.out",
    stagger: 0.04,
    scrollTrigger: { trigger, start: "top 80%", once: true },
  });
}

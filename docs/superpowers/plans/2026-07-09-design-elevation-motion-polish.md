# Design Elevation: Cursor, Motion & Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the Nalar Labs landing page from "default vibecoded" to crafted-premium via five additive layers: button microinteractions, a custom cursor, choreographed hero entrance, scroll-triggered word reveals + stat count-ups, and subtle aurora gradient backdrops.

**Architecture:** All changes are additive polish on the existing editorial-serif identity — no palette, font, or layout overhauls. A new `Cursor` component and a tiny `animation.ts` utility module are the only new files; everything else layers onto `App.tsx` and `theme.css`. Every new animation is gated behind `prefers-reduced-motion: no-preference` via `gsap.matchMedia()` or CSS `motion-safe:`/media queries, and uses transform/opacity only.

**Tech Stack:** React 18 + TypeScript (strict), Tailwind CSS v4, GSAP 3.15 + ScrollTrigger (already installed and registered in `App.tsx:8`), lucide-react.

## Global Constraints

- **No new runtime dependencies.** GSAP + ScrollTrigger only — do NOT add SplitText or any Club plugin; word-splitting is hand-rolled in `src/app/lib/animation.ts`.
- **Preserve the existing identity verbatim:** `Instrument Serif` display font, `#fafaf8` page background, `#0d0d0d` dark sections, black/white CTAs. No new brand colors except low-opacity aurora tints (cyan `#0891B2`, amber `#D97706`, purple `#9333EA` at ≤0.16 alpha).
- **Reduced motion is a hard requirement:** every new JS animation lives inside `gsap.matchMedia(...).add("(prefers-reduced-motion: no-preference)", ...)`; every new CSS animation uses `motion-safe:` or an `@media (prefers-reduced-motion: reduce)` override. With reduced motion ON, all content must be fully visible and static.
- **Transform/opacity only** — never animate width/height/top/left (CLS = 0).
- **Custom cursor is desktop-only:** render nothing when `(pointer: fine)` is false or reduced motion is on. Never break text-input I-beam cursors.
- **Per-task verification:** `npm run typecheck` && `npm run build` must pass before every commit. Commit at the end of each task with the exact message given. Work continues directly on `main` (established repo convention).
- **Known environment quirk:** node_modules on this iCloud path corrupts intermittently. If typecheck/build fails with `Cannot find module` errors pointing into `node_modules`, run `rm -rf node_modules package-lock.json && npm install` and retry before debugging code.
- **Do not touch** the Three.js globe internals (`Globe` component) or the `Modal.tsx` focus-trap logic.

---

### Task 1: Button & CTA microinteractions (`.btn-press`)

**Files:**
- Modify: `src/styles/theme.css` (append utility at end of file, after the existing `modalIn` keyframes)
- Modify: `src/app/App.tsx` (append `btn-press` to 7 CTA class strings)

**Interfaces:**
- Produces: a global `.btn-press` CSS class — hover lift (translateY(-1px) scale(1.02) + shadow), active press (scale(0.97)), spring-ish easing, disabled under reduced motion. Later tasks (3) rely on this class existing on the hero CTAs.

- [ ] **Step 1: Append the utility to `src/styles/theme.css`**

Add at the very end of the file:

```css
/* Tactile press/hover feedback for CTAs. Transform-only (no layout shift). */
.btn-press {
  transition:
    transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 180ms ease,
    opacity 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease,
    color 180ms ease;
}
@media (hover: hover) {
  .btn-press:hover {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }
}
.btn-press:active {
  transform: translateY(0) scale(0.97);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition-duration: 90ms;
}
@media (prefers-reduced-motion: reduce) {
  .btn-press,
  .btn-press:hover,
  .btn-press:active {
    transform: none;
  }
}
```

- [ ] **Step 2: Apply `btn-press` to the 7 CTAs in `src/app/App.tsx`**

Make these exact string replacements (each is a unique match — append ` btn-press` just before the closing quote of the className):

1. Hero "Book a call" `<a>`:
   - Old: `"group inline-flex items-center gap-2.5 bg-foreground text-background px-9 py-4 text-[0.82rem] font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/40"`
   - New: same string + ` btn-press`

2. Hero "Refer someone" `<button>`:
   - Old: `"inline-flex items-center border border-foreground/20 px-9 py-4 text-[0.82rem] font-medium tracking-widest uppercase hover:border-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-black/40"`
   - New: same string + ` btn-press`

3. Globe "Step inside the globe" `<button>`:
   - Old: `"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 text-[0.75rem] font-semibold tracking-widest uppercase bg-black text-white hover:bg-foreground transition-colors rounded z-10 focus:outline-none focus:ring-2 focus:ring-white/60 whitespace-nowrap"`
   - New: same string + ` btn-press`
   - **CAUTION:** this button is centered via `-translate-x-1/2 -translate-y-1/2`. The `.btn-press` hover transform would override the centering translate. So for THIS button only, do NOT add `btn-press`; instead leave it unchanged. (The Tailwind translate utilities and the `.btn-press` transform both write the `transform` property — they cannot compose.) Skip this one; final count is 6 CTAs, not 7.

4. Refer section "Suggest a referral" `<button>`:
   - Old: `"inline-flex items-center gap-2.5 bg-foreground text-background px-8 py-3.5 text-[0.8rem] font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/40"`
   - New: same string + ` btn-press`

5. Contact "Book a call" `<a>`:
   - Old: `"cta-item group inline-flex items-center gap-3 border border-white/25 px-11 py-4.5 text-[0.82rem] font-medium tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/60"`
   - New: same string + ` btn-press`

6. `CopyButton` component's `base` const:
   - Old: `"inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[0.8rem] font-semibold tracking-widest uppercase transition-all focus:outline-none focus:ring-2 focus:ring-black/40"`
   - New: same string + ` btn-press`

7. Referral modal "Generate referral link" `<button>`:
   - Old: `"inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3.5 text-[0.8rem] font-semibold tracking-widest uppercase transition-opacity focus:outline-none focus:ring-2 focus:ring-black/40 disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:opacity-80"`
   - New: same string + ` btn-press`

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run build`
Expected: both pass (`✓ built in …`).

- [ ] **Step 4: Preview check**

With the dev server running (launch config `nalar-landing-v1-dev`), hover a hero CTA: it lifts 1px with a soft shadow; click-and-hold: it compresses slightly. Disabled "Generate referral link" button must NOT lift (it's `disabled`, `:active` doesn't fire; `:hover` transform on a disabled button is acceptable but verify the button still looks disabled at 40% opacity).

- [ ] **Step 5: Commit**

```bash
git add src/styles/theme.css src/app/App.tsx
git commit -m "feat: add tactile btn-press microinteraction to CTAs"
```

---

### Task 2: Custom cursor (dot + trailing ring, blend-difference)

**Files:**
- Create: `src/app/components/Cursor.tsx`
- Modify: `src/styles/theme.css` (append cursor-hiding rules)
- Modify: `src/app/App.tsx` (import + mount `<Cursor />`)

**Interfaces:**
- Consumes: `gsap` (already a dependency).
- Produces: `export function Cursor(): JSX.Element` — self-contained; renders two fixed divs; adds/removes the `custom-cursor` class on `<html>`. No props.

Design: an instant white 8px dot + a 36px ring that lags behind (`gsap.quickTo`, 0.38s ease), both `mix-blend-mode: difference` so they invert against any background (dark ring on `#fafaf8`, light on `#0d0d0d`). Ring scales 1.7× over interactive elements, compresses on mousedown. Native cursor is hidden on the page and interactive elements but **kept on inputs/textareas** (I-beam preserved). Renders nothing on touch devices or under reduced motion.

- [ ] **Step 1: Create `src/app/components/Cursor.tsx`**

```tsx
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
```

- [ ] **Step 2: Append cursor-hiding rules to `src/styles/theme.css`**

Add at the very end (note: inputs/textareas intentionally excluded so text-caret I-beams survive):

```css
/* Custom cursor: hide the native pointer on non-text surfaces (desktop only).
   The Cursor component adds/removes .custom-cursor on <html>. */
@media (pointer: fine) {
  html.custom-cursor,
  html.custom-cursor body,
  html.custom-cursor a,
  html.custom-cursor button,
  html.custom-cursor [role="button"],
  html.custom-cursor label,
  html.custom-cursor canvas {
    cursor: none;
  }
}
```

- [ ] **Step 3: Mount in `src/app/App.tsx`**

Add the import below the Modal import:

```tsx
import { Cursor } from "./components/Cursor";
```

Then in the `App` component, add `<Cursor />` as the first child of `<main>`:

Old:
```tsx
    <main className="bg-[#fafaf8] min-h-screen overflow-x-hidden">
      <Nav />
```
New:
```tsx
    <main className="bg-[#fafaf8] min-h-screen overflow-x-hidden">
      <Cursor />
      <Nav />
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run build`
Expected: both pass.

- [ ] **Step 5: Preview check**

Desktop viewport: dot tracks the pointer instantly, ring lags ~0.3s behind; over "Book a call" the ring grows and dot shrinks; mousedown compresses the ring; over the dark Contact section both appear light (blend-difference); over the referral modal's email inputs the native I-beam still shows. Mobile viewport (375px): neither div is visible (component bails early — check no `custom-cursor` class on `<html>` via devtools emulation of coarse pointer).

- [ ] **Step 6: Commit**

```bash
git add src/app/components/Cursor.tsx src/styles/theme.css src/app/App.tsx
git commit -m "feat: add custom cursor (blend-difference dot + trailing ring, desktop-only)"
```

---

### Task 3: Word-split utility + hero entrance choreography

**Files:**
- Create: `src/app/lib/animation.ts`
- Modify: `src/app/App.tsx` (rewrite `HeroSection`)

**Interfaces:**
- Produces: `export function splitWords(el: HTMLElement): HTMLElement[]` — wraps each word of `el`'s text in a masked `overflow-hidden` span, sets `aria-label` on `el` for screen readers, and returns the inner (animatable) spans. Re-runnable (StrictMode-safe: re-reading `textContent` flattens prior spans back to plain text).
- Task 4 also consumes `splitWords` and adds `wordRevealOnScroll` to this same file.

- [ ] **Step 1: Create `src/app/lib/animation.ts`**

```ts
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
```

- [ ] **Step 2: Import it in `src/app/App.tsx`**

Add below the Cursor import:

```tsx
import { splitWords } from "./lib/animation";
```

- [ ] **Step 3: Rewrite `HeroSection` with a choreographed timeline**

Replace the ENTIRE current `HeroSection` function:

Old (current code, verbatim):
```tsx
function HeroSection({ onRefer }: { onRefer: () => void }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".h-item", {
        opacity: 0,
        y: 44,
        duration: 1.05,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.15,
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="pt-36 pb-10 text-center px-6">
      <p className="h-item inline-block text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-8">
        AI-Native Design &amp; Engineering Studio
      </p>

      <h1 className="h-item font-['Instrument_Serif',serif] text-[clamp(2.6rem,5.2vw,5.4rem)] leading-[1.07] text-foreground max-w-5xl mx-auto">
        {"We're a world class team of AI-Native"}
        <br className="hidden sm:block" />
        {" Designers & Engineers"}
      </h1>

      <p className="h-item mt-5 font-['Instrument_Serif',serif] italic text-[clamp(1.15rem,2.2vw,1.9rem)] text-muted-foreground">
        Ready to help you &amp; your business evolve
      </p>

      <div className="h-item mt-11 flex flex-wrap justify-center gap-4">
```

New `HeroSection` (complete function — note the `<br>` is removed so `splitWords` can treat the headline as one string; `max-w-5xl` still wraps it to ~2 lines):

```tsx
function HeroSection({ onRefer }: { onRefer: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(ref);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const words = headlineRef.current ? splitWords(headlineRef.current) : [];
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".h-eyebrow", { opacity: 0, y: 18, duration: 0.7 }, 0.1)
        .from(words, { yPercent: 120, duration: 0.9, stagger: 0.05 }, 0.25)
        .from(".h-sub", { opacity: 0, y: 20, duration: 0.8 }, 0.8)
        .from(
          ".h-cta",
          { opacity: 0, y: 24, duration: 0.7, ease: "back.out(1.6)", stagger: 0.09, clearProps: "all" },
          1.0,
        );
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className="pt-36 pb-10 text-center px-6">
      <p className="h-eyebrow inline-block text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-8">
        AI-Native Design &amp; Engineering Studio
      </p>

      <h1
        ref={headlineRef}
        className="font-['Instrument_Serif',serif] text-[clamp(2.6rem,5.2vw,5.4rem)] leading-[1.07] text-foreground max-w-5xl mx-auto"
      >
        {"We're a world class team of AI-Native Designers & Engineers"}
      </h1>

      <p className="h-sub mt-5 font-['Instrument_Serif',serif] italic text-[clamp(1.15rem,2.2vw,1.9rem)] text-muted-foreground">
        Ready to help you &amp; your business evolve
      </p>

      <div className="mt-11 flex flex-wrap justify-center gap-4">
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="h-cta group inline-flex items-center gap-2.5 bg-foreground text-background px-9 py-4 text-[0.82rem] font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/40 btn-press"
        >
          Book a call
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
        <button
          onClick={onRefer}
          className="h-cta inline-flex items-center border border-foreground/20 px-9 py-4 text-[0.82rem] font-medium tracking-widest uppercase hover:border-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-black/40 btn-press"
        >
          Refer someone
        </button>
      </div>
    </section>
  );
}
```

Key details an implementer must not drop:
- `clearProps: "all"` on the `.h-cta` tween — without it, GSAP's leftover inline `transform` permanently defeats the `.btn-press` hover transform from Task 1.
- `gsap.matchMedia(ref)` scopes selector strings (`.h-eyebrow` etc.) to the section AND handles cleanup via `mm.revert()`.
- Under reduced motion the `mm.add` callback never runs → no splitting, no tweens, content fully visible.

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run build`
Expected: both pass.

- [ ] **Step 5: Preview check**

Reload the page: eyebrow fades up → headline words rise out of their masks left-to-right (no descender clipping on "y"/"g" glyphs after settle) → subtitle → CTAs pop in with a slight overshoot. After the entrance, hover a CTA: the Task-1 lift still works (this is what `clearProps` guarantees). Emulate reduced motion in devtools rendering settings and reload: everything is visible instantly with zero animation.

- [ ] **Step 6: Commit**

```bash
git add src/app/lib/animation.ts src/app/App.tsx
git commit -m "feat: choreographed hero entrance with masked word reveal"
```

---

### Task 4: Scroll-triggered section word reveals + stats count-up

**Files:**
- Modify: `src/app/lib/animation.ts` (add `wordRevealOnScroll`)
- Modify: `src/app/App.tsx` (`STATS` const, `StatsBar`, `ValuesSection`, `ServicesSection`, `ReferSection`, `ContactSection` effects)

**Interfaces:**
- Consumes: `splitWords` from Task 3.
- Produces: `export function wordRevealOnScroll(heading: HTMLElement, trigger: Element): void` — splits `heading` and rises its words on scroll into view (fires once).

- [ ] **Step 1: Add `wordRevealOnScroll` to `src/app/lib/animation.ts`**

Append to the file (and add the gsap import at the top):

```ts
import { gsap } from "gsap";
```

```ts
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
```

(ScrollTrigger is registered globally in `App.tsx:8`; usage here happens at runtime inside effects, after registration.)

- [ ] **Step 2: Update the App.tsx import**

Old: `import { splitWords } from "./lib/animation";`
New: `import { splitWords, wordRevealOnScroll } from "./lib/animation";`

- [ ] **Step 3: Restructure `STATS` for count-up**

Old:
```tsx
  { value: "120+", label: "Clients Worldwide" },
  { value: "98%", label: "Client Retention" },
  { value: "$2.4B", label: "Revenue Generated" },
  { value: "8 yrs", label: "Industry Experience" },
];
```
New:
```tsx
  { prefix: "", num: 120, decimals: 0, suffix: "+", label: "Clients Worldwide" },
  { prefix: "", num: 98, decimals: 0, suffix: "%", label: "Client Retention" },
  { prefix: "$", num: 2.4, decimals: 1, suffix: "B", label: "Revenue Generated" },
  { prefix: "", num: 8, decimals: 0, suffix: " yrs", label: "Industry Experience" },
];
```

- [ ] **Step 4: Rewrite `StatsBar` with count-up**

Replace the entire `StatsBar` function with:

```tsx
function StatsBar() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(ref);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".stat-item", {
        opacity: 0,
        y: 24,
        duration: 0.75,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
      gsap.utils.toArray<HTMLElement>(".stat-num").forEach((el) => {
        const num = parseFloat(el.dataset.num ?? "0");
        const decimals = parseInt(el.dataset.decimals ?? "0", 10);
        const prefix = el.dataset.prefix ?? "";
        const suffix = el.dataset.suffix ?? "";
        const counter = { v: 0 };
        gsap.to(counter, {
          v: num,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = prefix + counter.v.toFixed(decimals) + suffix;
          },
        });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className="border-y border-border py-16 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        {STATS.map((s) => (
          <div key={s.label} className="stat-item text-center">
            <div
              className="stat-num font-['Instrument_Serif',serif] text-[clamp(2.4rem,4vw,4rem)] leading-none text-foreground tabular-nums"
              data-num={s.num}
              data-decimals={s.decimals}
              data-prefix={s.prefix}
              data-suffix={s.suffix}
            >
              {s.prefix}{s.num}{s.suffix}
            </div>
            <div className="mt-2.5 text-[0.67rem] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

Notes: JSX renders the FINAL value statically (reduced-motion users and pre-JS paint see the real numbers); the tween overwrites `textContent` only under `no-preference`. `tabular-nums` prevents digit-width jitter during the count.

- [ ] **Step 5: Add word reveals to the four sections (and gate existing tweens behind reduced-motion)**

**ValuesSection** — replace its `useEffect`:

Old:
```tsx
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".value-card", {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);
```
New:
```tsx
  useEffect(() => {
    const mm = gsap.matchMedia(ref);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const h2 = ref.current?.querySelector("h2");
      if (h2 && ref.current) wordRevealOnScroll(h2 as HTMLElement, ref.current);
      gsap.from(".value-card", {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    });
    return () => mm.revert();
  }, []);
```

**ServicesSection** — replace its `useEffect` using the identical pattern (keep BOTH existing tweens inside the `mm.add` callback, add the same 2 `h2` lines at the top):

Old:
```tsx
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".svc-card", {
        opacity: 0,
        y: 30,
        duration: 0.72,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 78%" },
      });
      gsap.from(".approach-step", {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);
```
New:
```tsx
  useEffect(() => {
    const mm = gsap.matchMedia(ref);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const h2 = ref.current?.querySelector("h2");
      if (h2 && ref.current) wordRevealOnScroll(h2 as HTMLElement, ref.current);
      gsap.from(".svc-card", {
        opacity: 0,
        y: 30,
        duration: 0.72,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 78%" },
      });
      gsap.from(".approach-step", {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });
    });
    return () => mm.revert();
  }, []);
```

(`querySelector("h2")` returns the FIRST h2 — "Two ways to work together" — which is what we want; the "Our approach" heading inside is an `h2`? No — group titles are `h3`, "Our approach" is an `h2` further down, but `querySelector` returns the first match in document order, which is the section heading. Correct as-is.)

**ReferSection** — replace its `useEffect`:

Old:
```tsx
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".refer-cta", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);
```
New:
```tsx
  useEffect(() => {
    const mm = gsap.matchMedia(ref);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".refer-cta", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    });
    return () => mm.revert();
  }, []);
```

(No word reveal here — the whole block already fades as one unit and its h2 is mid-size; splitting it too would over-animate the page. This section only gains the reduced-motion gate.)

**ContactSection** — replace its `useEffect` AND remove `cta-item` from the h2 so it isn't double-animated:

Old effect:
```tsx
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cta-item", {
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);
```
New effect:
```tsx
  useEffect(() => {
    const mm = gsap.matchMedia(ref);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const h2 = ref.current?.querySelector("h2");
      if (h2 && ref.current) wordRevealOnScroll(h2 as HTMLElement, ref.current);
      gsap.from(".cta-item", {
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        clearProps: "all",
        scrollTrigger: { trigger: ref.current, start: "top 80%" },
      });
    });
    return () => mm.revert();
  }, []);
```

Old h2:
```tsx
        <h2 className="cta-item font-['Instrument_Serif',serif] text-[clamp(2.4rem,5vw,5rem)] leading-[1.08] mb-10">
```
New h2 (drop `cta-item `):
```tsx
        <h2 className="font-['Instrument_Serif',serif] text-[clamp(2.4rem,5vw,5rem)] leading-[1.08] mb-10">
```

(`clearProps: "all"` added because the Contact "Book a call" `<a>` carries both `cta-item` and `btn-press` — same inline-transform conflict as the hero CTAs.)

- [ ] **Step 6: Verify**

Run: `npm run typecheck && npm run build`
Expected: both pass.

- [ ] **Step 7: Preview check**

Scroll the page top to bottom: "Why we do this", "Two ways to work together", and "Let's build something extraordinary together" each rise word-by-word exactly once; stats count from 0 to 120+/98%/$2.4B/8 yrs over ~1.6s without digit jitter; scrolling back up and down again does NOT re-trigger the word reveals (once: true). Reduced-motion emulation: numbers show final values, headings render instantly.

- [ ] **Step 8: Commit**

```bash
git add src/app/lib/animation.ts src/app/App.tsx
git commit -m "feat: scroll-triggered word reveals and stats count-up"
```

---

### Task 5: Aurora gradient backdrops (hero + contact)

**Files:**
- Modify: `src/styles/theme.css` (append `auroraDrift` keyframes)
- Modify: `src/app/App.tsx` (add `AuroraBackdrop` component; place in `HeroSection` and `ContactSection`)

**Interfaces:**
- Produces: `function AuroraBackdrop({ variant }: { variant?: "light" | "dark" }): JSX.Element` — local to App.tsx, purely decorative (`aria-hidden`), `pointer-events-none`.

- [ ] **Step 1: Append keyframes to `src/styles/theme.css`**

```css
@keyframes auroraDrift {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(4%, -6%) scale(1.08); }
  66% { transform: translate(-5%, 4%) scale(0.95); }
  100% { transform: translate(0, 0) scale(1); }
}
```

- [ ] **Step 2: Add `AuroraBackdrop` to `src/app/App.tsx`**

Insert directly ABOVE the `/* ─── Copy-to-clipboard button */` comment:

```tsx
/* ─── Aurora backdrop (decorative) ──────────────────────────── */
function AuroraBackdrop({ variant = "light" }: { variant?: "light" | "dark" }) {
  const blobs =
    variant === "light"
      ? [
          "left-[8%] top-[10%] w-[42vw] h-[42vw] bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.14),transparent_65%)]",
          "right-[6%] top-[30%] w-[38vw] h-[38vw] bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.10),transparent_65%)]",
        ]
      : [
          "left-[10%] top-[15%] w-[45vw] h-[45vw] bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.13),transparent_65%)]",
          "right-[8%] bottom-[10%] w-[40vw] h-[40vw] bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.10),transparent_65%)]",
        ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((b, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-3xl motion-safe:animate-[auroraDrift_26s_ease-in-out_infinite] ${
            i === 1 ? "motion-safe:[animation-delay:-13s]" : ""
          } ${b}`}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Place in `HeroSection`**

The hero `<section>` needs `relative` and its content needs to sit above the backdrop. Change the section wrapper and add the backdrop + a relative content wrapper:

Old:
```tsx
    <section ref={ref} className="pt-36 pb-10 text-center px-6">
      <p className="h-eyebrow inline-block
```
New:
```tsx
    <section ref={ref} className="relative pt-36 pb-10 text-center px-6">
      <AuroraBackdrop variant="light" />
      <div className="relative">
      <p className="h-eyebrow inline-block
```

And close the wrapper — old:
```tsx
      </div>
    </section>
  );
}
```
(the hero's closing lines, right after the "Refer someone" button's `</div>`) — new:
```tsx
      </div>
      </div>
    </section>
  );
}
```

(The extra `<div className="relative">` establishes paint order above the absolutely-positioned backdrop. Indentation of inner content may be left as-is; do not reformat the whole block.)

- [ ] **Step 4: Place in `ContactSection`**

Old:
```tsx
    <section id="contact" ref={ref} className="py-32 px-6 bg-[#0d0d0d] text-white">
      <div className="max-w-4xl mx-auto text-center">
```
New:
```tsx
    <section id="contact" ref={ref} className="relative py-32 px-6 bg-[#0d0d0d] text-white">
      <AuroraBackdrop variant="dark" />
      <div className="relative max-w-4xl mx-auto text-center">
```

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm run build`
Expected: both pass.

- [ ] **Step 6: Preview check**

Hero: a faint cyan wash upper-left and faint amber wash right, drifting imperceptibly (26s loop) — text contrast unchanged, headline still crisp. Contact (dark): faint cyan + purple glows. Confirm no horizontal scrollbar at 375px (blobs are inside `overflow-hidden`). Reduced-motion: blobs render but do NOT drift (`motion-safe:` gate). CTAs remain clickable (pointer-events-none on the backdrop).

- [ ] **Step 7: Commit**

```bash
git add src/styles/theme.css src/app/App.tsx
git commit -m "feat: subtle aurora gradient backdrops on hero and contact sections"
```

---

### Task 6: Remove generic stats bar section

**Files:**
- Modify: `src/app/App.tsx` (remove `StatsBar` component, its imports, and the render call)

**Interfaces:**
- Consumes: nothing.
- Produces: none (cleanup only).

The stats bar ("120+ Clients", "98% Retention", "$2.4B Revenue", "8 yrs Experience") is generic boilerplate that dilutes the authentic brand story. Removing it streamlines the page and makes room for the genuine Values section below.

- [ ] **Step 1: Remove the `STATS` constant**

Find (lines 77–81):
```tsx
const STATS = [
  { prefix: "", num: 120, decimals: 0, suffix: "+", label: "Clients Worldwide" },
  { prefix: "", num: 98, decimals: 0, suffix: "%", label: "Client Retention" },
  { prefix: "$", num: 2.4, decimals: 1, suffix: "B", label: "Revenue Generated" },
  { prefix: "", num: 8, decimals: 0, suffix: " yrs", label: "Industry Experience" },
];
```

Delete all five lines.

- [ ] **Step 2: Remove the `StatsBar` component function**

Find the entire `StatsBar` function (starts around line 525, ends around line 558) and delete it entirely.

- [ ] **Step 3: Remove `<StatsBar />` from the `App` render**

In the `App` component's return (around line 987), find:
```tsx
      <GlobeSection />
      <StatsBar />
      <ValuesSection />
```

Change to:
```tsx
      <GlobeSection />
      <ValuesSection />
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run build`
Expected: both pass.

- [ ] **Step 5: Preview check**

Reload the page: the globe section flows directly into "Why we do this" (Values section). No stats bar between them.

- [ ] **Step 6: Commit**

```bash
git add src/app/App.tsx
git commit -m "refactor: remove generic stats bar section"
```

---

### Task 7: Full QA pass and push

**Files:** none (verification only).

- [ ] **Step 1: Clean gate**

Run: `npm run typecheck && npm run build`
Expected: both pass. (If node_modules corruption strikes: `rm -rf node_modules package-lock.json && npm install`, retry.)

- [ ] **Step 2: Desktop walkthrough (1280px)**

- [ ] Hero entrance: eyebrow → masked word rise → subtitle → CTA pop, in order, ~1.8s total.
- [ ] Cursor: dot + lagging ring; ring grows over every link/button; inverts over dark sections; I-beam intact in modal inputs; native pointer hidden elsewhere.
- [ ] CTA hover lift + active press works on hero, refer, contact, modal buttons — INCLUDING after entrance animations (clearProps regression check).
- [ ] Stats count up once; headings word-reveal once each ("Why we do this", "Two ways to work together", contact headline).
- [ ] Auroras drift on hero + contact; text legibility unaffected.
- [ ] Globe interaction (drag, "Step inside the globe", scroll depth, exit) still works — no regression from hero restructure.
- [ ] Referral modal open/close, focus trap, generate + copy flow still works.

- [ ] **Step 3: Reduced-motion emulation**

DevTools → Rendering → `prefers-reduced-motion: reduce`, reload:
- [ ] No cursor divs (native pointer everywhere).
- [ ] Hero + all sections fully visible with no animation; stats show final values.
- [ ] Aurora blobs static; `.btn-press` buttons don't lift.

- [ ] **Step 4: Mobile (375px)**

- [ ] No custom cursor; no horizontal scroll; hero headline wraps naturally (the `<br>` removal check); everything readable.

- [ ] **Step 5: Push**

```bash
git push origin main
```
Expected: `main -> main` on `https://github.com/Nalar-Labs/landing.git`.

---

## Notes / Open Items

1. **Globe "Step inside" button deliberately has no `btn-press`** — its centering translate would be clobbered by the hover transform (documented in Task 1 Step 2 item 3). If press feedback is wanted there later, wrap the button in a positioned parent and apply `btn-press` to the inner button.
2. **The hero `<br className="hidden sm:block">` is removed** — the headline now wraps naturally under `max-w-5xl`. Line-break position may differ slightly from before at some widths; this is expected and acceptable.
3. **Existing section tweens are now gated behind reduced-motion** (they weren't before) — a net accessibility improvement shipped as a side effect of Tasks 3–4.
4. The aurora tints (cyan/amber/purple ≤0.14 alpha) are the only new colors; they read as "paper warmth/coolness," not as a palette change. Tune opacity down before deleting them if they feel too loud in review.

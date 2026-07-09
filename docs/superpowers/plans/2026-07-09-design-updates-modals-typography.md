# Design Updates: Typography, Booking + Referral Modals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase undersized Values-section type, replace the two hero CTAs with modal-driven "Book a call" / "Refer someone" actions, and convert Contact + Refer buttons to the same Calendly-backed modal flow.

**Architecture:** One reusable accessible `Modal` primitive (focus trap, Esc, scrim, reduced-motion) lives in its own file. Two thin content components (`BookingModal`, `ReferralModal`) render inside it and are driven by a single piece of `useState` lifted to `App`. Both modals point at one `CALENDLY_URL` constant; the referral link is that URL plus a `?utm_source=referral` tag. No backend, no new dependencies — booking opens Calendly in a new tab, referral copies a link to the clipboard.

**Tech Stack:** React 18 + TypeScript (strict), Tailwind CSS v4, GSAP (existing), lucide-react icons. Everything lives in `src/app/App.tsx` except the new `Modal` primitive.

## Global Constraints

- **Preserve the existing visual identity.** Font is `Instrument Serif` for display + system sans for body; background `#fafaf8`; dark sections `#0d0d0d`. Do NOT introduce new fonts, colors, or a different design language.
- **No backend and no new runtime dependencies.** Use `navigator.clipboard` (with a legacy `execCommand` fallback) and `target="_blank"` links only.
- **Single source for the booking link:** one `CALENDLY_URL` constant. Value is a placeholder pending the real URL — see Task 3.
- **Accessibility is mandatory** (this is the core of the design pass): every interactive element gets a visible `focus:ring`, the modal traps focus, `Escape` closes it, the scrim is `bg-black/50`, `role="dialog"` + `aria-modal="true"` + `aria-label` are set, and all entrance animation is gated behind `motion-safe:`.
- **Minimum body text 16px** (`text-base` / `~1rem`). No new body copy below that.
- **Per-task verification:** `npm run typecheck` and `npm run build` must both pass before every commit. Commit at the end of each task with the exact message given.
- Work on the `main` branch is already the working branch for this repo (established in the prior plan). Continue committing there.

---

### Task 1: Enlarge Values-section typography

**Files:**
- Modify: `src/app/App.tsx` (the `ValuesSection` component, around lines 660–672)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by later tasks. Purely visual.

Current markup renders the belief heading at `text-lg` (~1.125rem) and the description at `text-[0.85rem]` (~13.6px) in `text-muted-foreground` — both flagged as too small.

- [ ] **Step 1: Read the current ValuesSection block**

Run: open `src/app/App.tsx` and locate the `VALUES.map(...)` block inside `ValuesSection` (search for `value-card`). Confirm it matches the "old" string below before editing.

- [ ] **Step 2: Replace the heading + description classes**

Find this exact block:

```tsx
            <div key={v.belief} className="value-card">
              <div className="mb-6 pb-6 border-t-2 border-foreground/20" />
              <h3 className="font-['Instrument_Serif',serif] text-lg italic leading-snug mb-4 text-foreground">
                {v.belief}
              </h3>
              <p className="text-[0.85rem] text-muted-foreground leading-relaxed">
                {v.desc}
              </p>
            </div>
```

Replace it with:

```tsx
            <div key={v.belief} className="value-card">
              <div className="mb-6 pb-6 border-t-2 border-foreground/20" />
              <h3 className="font-['Instrument_Serif',serif] text-[clamp(1.4rem,2.4vw,1.9rem)] italic leading-snug mb-4 text-foreground">
                {v.belief}
              </h3>
              <p className="text-[1.02rem] text-foreground/70 leading-[1.75]">
                {v.desc}
              </p>
            </div>
```

Rationale: heading grows from ~1.125rem to a responsive 1.4–1.9rem; body grows from 13.6px to ~16.3px and shifts from `muted-foreground` to `foreground/70` for stronger contrast (satisfies the 4.5:1 / 16px-body guidance).

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no output, exit 0 (class changes are type-neutral; this confirms nothing else broke).

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `✓ built in …` with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/App.tsx
git commit -m "style: enlarge Values section heading and body type for readability"
```

---

### Task 2: Create the accessible Modal primitive

**Files:**
- Create: `src/app/components/Modal.tsx`
- Modify: `src/styles/theme.css` (append two keyframes)

**Interfaces:**
- Produces:
  - `Modal` — `function Modal(props: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }): JSX.Element | null`. Renders nothing when `open` is false. Handles scrim, focus trap, `Escape`, body-scroll lock, focus restore, and `role="dialog"`/`aria-modal`. Renders `title` as an `Instrument Serif` `<h2>` and a close (X) button.

- [ ] **Step 1: Create `src/app/components/Modal.tsx`**

```tsx
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && focusables && focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm motion-safe:animate-[fadeIn_200ms_ease-out]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative w-full max-w-md bg-[#fafaf8] border border-black/10 shadow-2xl p-8 motion-safe:animate-[modalIn_220ms_cubic-bezier(0.16,1,0.3,1)]"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 text-black/40 hover:text-black hover:bg-black/5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-black/40"
        >
          <X size={18} />
        </button>
        <h2 className="font-['Instrument_Serif',serif] text-[1.7rem] leading-tight mb-2 pr-8 text-foreground">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Append keyframes to `src/styles/theme.css`**

Add to the very end of the file (these are referenced by the `animate-[fadeIn…]` / `animate-[modalIn…]` arbitrary utilities above; they must be globally defined):

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: none; }
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: exit 0. (Confirms the new file's types are sound even though nothing imports it yet.)

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `✓ built …`. An unused module is fine; this just proves it compiles.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/Modal.tsx src/styles/theme.css
git commit -m "feat: add accessible Modal primitive (focus trap, Esc, scrim, reduced-motion)"
```

---

### Task 3: Add Calendly constant, CopyButton, and the two modal content components

**Files:**
- Modify: `src/app/App.tsx` (imports; add constants + three components near the other section components)

**Interfaces:**
- Consumes: `Modal` from Task 2.
- Produces:
  - `CALENDLY_URL: string` and `REFERRAL_URL: string` module constants.
  - `BookingModal` — `function BookingModal(props: { open: boolean; onClose: () => void }): JSX.Element`.
  - `ReferralModal` — `function ReferralModal(props: { open: boolean; onClose: () => void }): JSX.Element`.
  - `CopyButton` — `function CopyButton(props: { value: string; label: string; primary?: boolean }): JSX.Element`.

- [ ] **Step 1: Extend the lucide-react import and add the Modal import**

Find the existing top import:

```tsx
import { ArrowRight, Menu, X, Layers, Code2, Palette, Cpu, FlaskConical, Microscope } from "lucide-react";
```

Replace with (adds `ArrowUpRight`, `Copy`, `Check`):

```tsx
import { ArrowRight, ArrowUpRight, Copy, Check, Menu, X, Layers, Code2, Palette, Cpu, FlaskConical, Microscope } from "lucide-react";
```

Then add a Modal import directly below the existing lucide import line:

```tsx
import { Modal } from "./components/Modal";
```

- [ ] **Step 2: Add the Calendly constants**

Locate the `VALUES` constant block near the top of the file. Immediately AFTER the `VALUES` array's closing `];`, add:

```tsx
/* ─── Booking / referral ────────────────────────────────────── */
// Single source of truth for booking (Calendly).
const CALENDLY_URL = "https://calendly.com/garda4199/30min";
const REFERRAL_URL = `${CALENDLY_URL}?utm_source=referral`;
```

- [ ] **Step 3: Add the `CopyButton`, `BookingModal`, and `ReferralModal` components**

Insert this block immediately BEFORE the `/* ─── Refer Section */` comment (i.e. just above `function ReferSection`):

```tsx
/* ─── Copy-to-clipboard button ──────────────────────────────── */
function CopyButton({ value, label, primary = false }: { value: string; label: string; primary?: boolean }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); }, []);

  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[0.8rem] font-semibold tracking-widest uppercase transition-all focus:outline-none focus:ring-2 focus:ring-black/40";
  const variant = primary
    ? "bg-foreground text-background hover:opacity-80"
    : "border border-foreground/20 hover:border-foreground/60";

  return (
    <button onClick={copy} className={`${base} ${variant}`} aria-live="polite">
      {copied ? (<><Check size={15} /> Copied</>) : (<><Copy size={15} /> {label}</>)}
    </button>
  );
}

/* ─── Booking modal ─────────────────────────────────────────── */
function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Book a call">
      <p className="text-[1rem] text-muted-foreground leading-relaxed mb-6">
        Grab a 30-minute intro slot. We&apos;ll talk through where you are and whether we
        can help — no pitch, no obligation.
      </p>
      <div className="flex flex-col gap-3">
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3.5 text-[0.8rem] font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/40"
        >
          Open Calendly <ArrowUpRight size={15} />
        </a>
        <CopyButton value={CALENDLY_URL} label="Copy booking link" />
      </div>
    </Modal>
  );
}

/* ─── Referral modal ────────────────────────────────────────── */
function ReferralModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Refer someone">
      <p className="text-[1rem] text-muted-foreground leading-relaxed mb-6">
        Know a business that should own their software instead of renting it? Copy this
        link and send it their way — it opens our intro booking page.
      </p>
      <div className="flex flex-col gap-3">
        <CopyButton value={REFERRAL_URL} label="Copy referral link" primary />
        <a
          href={REFERRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 border border-foreground/20 px-6 py-3.5 text-[0.8rem] font-medium tracking-widest uppercase hover:border-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-black/40"
        >
          Open Calendly <ArrowUpRight size={15} />
        </a>
      </div>
    </Modal>
  );
}
```

Note: `useState`, `useRef`, and `useEffect` are already imported at the top of `App.tsx` (used throughout). No import change needed for those.

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: exit 0. The components are defined but not yet rendered — that is expected and fine.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: `✓ built …`.

- [ ] **Step 6: Commit**

```bash
git add src/app/App.tsx
git commit -m "feat: add CALENDLY_URL constant, CopyButton, BookingModal, ReferralModal"
```

---

### Task 4: Wire triggers — hero CTAs, Contact, Refer, and App-level state

**Files:**
- Modify: `src/app/App.tsx` (`HeroSection`, `ContactSection`, `ReferSection`, and `App`)

**Interfaces:**
- Consumes: `BookingModal`, `ReferralModal` (Task 3).
- Produces: the wired-up page. `App` owns `modal` state of type `null | "booking" | "referral"`.

- [ ] **Step 1: Change `HeroSection` to accept trigger props and swap the two CTAs**

Change the signature line:

```tsx
function HeroSection() {
```

to:

```tsx
function HeroSection({ onBookCall, onRefer }: { onBookCall: () => void; onRefer: () => void }) {
```

Then find the hero CTA block:

```tsx
      <div className="h-item mt-11 flex flex-wrap justify-center gap-4">
        <a
          href="#globe"
          className="group inline-flex items-center gap-2.5 bg-foreground text-background px-9 py-4 text-[0.82rem] font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity"
        >
          View our work
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
        <a
          href="#services"
          className="inline-flex items-center border border-foreground/20 px-9 py-4 text-[0.82rem] font-medium tracking-widest uppercase hover:border-foreground/60 transition-colors"
        >
          Our services
        </a>
      </div>
```

Replace with:

```tsx
      <div className="h-item mt-11 flex flex-wrap justify-center gap-4">
        <button
          onClick={onBookCall}
          className="group inline-flex items-center gap-2.5 bg-foreground text-background px-9 py-4 text-[0.82rem] font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/40"
        >
          Book a call
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={onRefer}
          className="inline-flex items-center border border-foreground/20 px-9 py-4 text-[0.82rem] font-medium tracking-widest uppercase hover:border-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-black/40"
        >
          Refer someone
        </button>
      </div>
```

- [ ] **Step 2: Change `ReferSection` to accept an `onRefer` prop and swap its mailto anchor for a button**

Change the signature:

```tsx
function ReferSection() {
```

to:

```tsx
function ReferSection({ onRefer }: { onRefer: () => void }) {
```

Then find:

```tsx
          <a
            href="mailto:hello@nalarlabs.com?subject=Referral"
            className="inline-flex items-center gap-2.5 bg-foreground text-background px-8 py-3.5 text-[0.8rem] font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity"
          >
            Suggest a referral
            <ArrowRight size={14} />
          </a>
```

Replace with:

```tsx
          <button
            onClick={onRefer}
            className="inline-flex items-center gap-2.5 bg-foreground text-background px-8 py-3.5 text-[0.8rem] font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/40"
          >
            Suggest a referral
            <ArrowRight size={14} />
          </button>
```

- [ ] **Step 3: Change `ContactSection` to accept an `onBookCall` prop and swap its mailto anchor for a button**

Change the signature:

```tsx
function ContactSection() {
```

to:

```tsx
function ContactSection({ onBookCall }: { onBookCall: () => void }) {
```

Then find:

```tsx
        <a
          href="mailto:hello@nalarlabs.com"
          className="cta-item group inline-flex items-center gap-3 border border-white/25 px-11 py-4.5 text-[0.82rem] font-medium tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300"
        >
          hello@nalarlabs.com
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
```

Replace with:

```tsx
        <button
          onClick={onBookCall}
          className="cta-item group inline-flex items-center gap-3 border border-white/25 px-11 py-4.5 text-[0.82rem] font-medium tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          Book a call
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
```

- [ ] **Step 4: Wire state in `App`**

Find the `App` component:

```tsx
export default function App() {
  return (
    <main className="bg-[#fafaf8] min-h-screen overflow-x-hidden">
      <Nav />
      <HeroSection />
      <GlobeSection />
      <StatsBar />
      <ValuesSection />
      <ServicesSection />
      <ReferSection />
      <TeamSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
```

Replace with:

```tsx
export default function App() {
  const [modal, setModal] = useState<null | "booking" | "referral">(null);
  const closeModal = () => setModal(null);

  return (
    <main className="bg-[#fafaf8] min-h-screen overflow-x-hidden">
      <Nav />
      <HeroSection onBookCall={() => setModal("booking")} onRefer={() => setModal("referral")} />
      <GlobeSection />
      <StatsBar />
      <ValuesSection />
      <ServicesSection />
      <ReferSection onRefer={() => setModal("referral")} />
      <TeamSection />
      <ContactSection onBookCall={() => setModal("booking")} />
      <Footer />
      <BookingModal open={modal === "booking"} onClose={closeModal} />
      <ReferralModal open={modal === "referral"} onClose={closeModal} />
    </main>
  );
}
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: exit 0. This is the task where prop wiring is validated end to end — a missing prop or typo will surface here.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: `✓ built …`.

- [ ] **Step 7: Commit**

```bash
git add src/app/App.tsx
git commit -m "feat: wire hero/contact/refer CTAs to booking + referral modals"
```

---

### Task 5: QA pass and push

**Files:** none modified (verification only).

- [ ] **Step 1: Clean typecheck + build**

Run:
```bash
npm run typecheck && npm run build
```
Expected: both succeed, `✓ built …`.

- [ ] **Step 2: Run the dev server and drive the flows**

Start the dev server (via the launch config created previously) and verify each item below by clicking through the live page:

- [ ] Values section: belief headings are visibly larger (~1.4–1.9rem) and body copy is ~16px with darker contrast.
- [ ] Hero: buttons read "Book a call" and "Refer someone".
- [ ] Click "Book a call" → booking modal opens, animates in, scrim dims the page.
- [ ] Modal: `Tab` cycles only within the modal (focus trap); `Shift+Tab` from the first control wraps to the last.
- [ ] Modal: `Escape` closes it; focus returns to the button that opened it.
- [ ] Modal: clicking the scrim closes it; the X button closes it.
- [ ] Booking modal: "Open Calendly" opens the Calendly URL in a new tab; "Copy booking link" flips to "Copied" for ~2s.
- [ ] "Refer someone" (hero) and "Suggest a referral" (Refer section) both open the referral modal.
- [ ] Referral modal: "Copy referral link" copies the URL with `?utm_source=referral` and shows "Copied".
- [ ] Contact section (dark): button reads "Book a call" and opens the booking modal (white focus ring visible against the dark background).
- [ ] Body scroll is locked while a modal is open and restored after close.

- [ ] **Step 3: Reduced-motion check**

In the browser devtools, emulate `prefers-reduced-motion: reduce` and reopen a modal. Expected: the modal appears without the slide/scale entrance animation (the `motion-safe:` gate suppresses it) but is fully functional.

- [ ] **Step 4: Mobile width check**

Resize to 375px wide. Expected: modal is `max-w-md` with `px-5` gutters, no horizontal scroll, buttons stack full-width and remain ≥44px tall.

- [ ] **Step 5: Confirm no stray mailto links remain**

Run:
```bash
grep -n "mailto:hello@nalarlabs.com" src/app/App.tsx || echo "No mailto links remain"
```
Expected: `No mailto links remain` (the footer/error-boundary mailto, if any, are out of scope — only the Contact and Refer CTAs were converted; confirm the two converted ones are gone).

- [ ] **Step 6: Push**

```bash
git push origin main
```
Expected: refs updated on `origin/main`.

---

## Notes / Open Items (surface at review, not blockers)

1. **Calendly URL is set** to `https://calendly.com/garda4199/30min` (the real link). Everything — booking + referral — flows from this single `CALENDLY_URL` constant, so future changes are one line.
2. **Revised after first pass (2026-07-09):**
   - **"Book a call" now redirects straight to Calendly** (both hero and Contact CTAs are direct `target="_blank"` links) — no intermediate modal. The `BookingModal` was removed.
   - **The referral modal is now a two-email form:** "Your email" (referrer, for credit) + "Their email" (the prospect). The "Generate referral link" button stays disabled/greyed until both are valid emails. Generating builds `CALENDLY_URL?email=<prospect>&utm_source=referral&utm_content=<referrer>`, so Calendly prefills the prospect's email and records the referrer in `utm_content`. A copy button appears after generation. No backend; still copy-only sharing.
3. **Nav "Contact Us" pill is unchanged** — it still anchor-scrolls to the Contact section, whose button now opens the booking modal. If you'd prefer the nav pill to open the modal directly, that's a trivial follow-up.
4. **Fabricated content** (stats, team, "120+ clients") remains untouched, consistent with the prior plan's scope boundary.

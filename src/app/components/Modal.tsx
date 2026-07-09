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

    const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])';
    const panel = panelRef.current;
    panel?.querySelectorAll<HTMLElement>(FOCUSABLE)[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        // Re-query each time — the panel's focusable set can change (e.g. a
        // disabled button becoming enabled, or new controls appearing).
        const nodes = panel?.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (!nodes || nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
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

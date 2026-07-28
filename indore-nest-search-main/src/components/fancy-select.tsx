import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { GoCheck, GoChevronDown } from "react-icons/go";
import { cn } from "@/lib/utils";

export type FancySelectOption = {
  value: string;
  label: string;
  /** Chhota sub-label — jaise Hindi naam ya extra hint. */
  hint?: string;
  icon?: IconType;
};

type FancySelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: FancySelectOption[];
  /** Khaali value ka label — list me sabse upar "sab" option ban jaata hai. */
  placeholder: string;
  /** List me khaali option ka label, agar placeholder se alag chahiye. */
  clearLabel?: string;
  /** Trigger par dikhne wala leading icon. */
  icon?: IconType;
  ariaLabel?: string;
  className?: string;
};

/**
 * Browser ka default <select> har OS par alag aur bhadda dikhta hai —
 * ye uska replacement hai: site ke tokens par bana, animated aur
 * poora keyboard-accessible (arrows, Home/End, typeahead, Esc).
 */
export function FancySelect({
  value,
  onChange,
  options,
  placeholder,
  clearLabel,
  icon: LeadingIcon,
  ariaLabel,
  className,
}: FancySelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  // placeholder bhi ek asli option hai — usse chunkar filter clear hota hai
  const items = useMemo<FancySelectOption[]>(
    () => [{ value: "", label: clearLabel ?? placeholder }, ...options],
    [clearLabel, options, placeholder],
  );
  const selectedIndex = Math.max(
    0,
    items.findIndex((o) => o.value === value),
  );
  const selected = items[selectedIndex];
  const hasValue = value !== "";

  // bahar click ya scroll par band
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // active option hamesha view me rahe
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openList = (index = selectedIndex) => {
    setActive(index);
    setOpen(true);
  };

  const commit = (index: number) => {
    onChange(items[index].value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  // typeahead — "f" dabao to Flats par pahunch jao
  const typed = useRef({ query: "", at: 0 });
  const typeahead = (char: string) => {
    const now = performance.now();
    typed.current.query = now - typed.current.at > 800 ? char : typed.current.query + char;
    typed.current.at = now;
    const q = typed.current.query;
    const from = items.findIndex((o, i) => i > active && o.label.toLowerCase().startsWith(q));
    const found = from >= 0 ? from : items.findIndex((o) => o.label.toLowerCase().startsWith(q));
    if (found >= 0) setActive(found);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        if (!open) return openList();
        const step = e.key === "ArrowDown" ? 1 : -1;
        setActive((i) => (i + step + items.length) % items.length);
        break;
      }
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(items.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) commit(active);
        else openList();
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          if (!open) openList();
          typeahead(e.key.toLowerCase());
        }
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-xl border bg-card px-3.5 py-[0.65rem] text-left text-sm",
          "transition-[border-color,box-shadow,transform] duration-200 outline-none",
          "hover:border-primary/50 hover:shadow-soft",
          open
            ? "border-primary shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]"
            : "border-input",
          "focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]",
        )}
      >
        {LeadingIcon && (
          <LeadingIcon
            aria-hidden="true"
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              hasValue ? "text-primary" : "text-muted-foreground",
            )}
          />
        )}
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            hasValue ? "font-medium" : "text-muted-foreground",
          )}
        >
          {hasValue ? selected.label : placeholder}
        </span>
        {selected.hint && hasValue && (
          <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
            {selected.hint}
          </span>
        )}
        <GoChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "-rotate-180 text-primary",
          )}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          tabIndex={-1}
          className={cn(
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 absolute z-50 mt-2 max-h-72 w-full",
            "overflow-y-auto overscroll-contain rounded-2xl border border-border bg-popover p-1.5 shadow-lifted",
          )}
        >
          {items.map((opt, i) => {
            const isSelected = i === selectedIndex;
            const isActive = i === active;
            const OptIcon = opt.icon;
            return (
              <li key={opt.value || "__all"} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => commit(i)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                    isActive ? "bg-secondary text-secondary-foreground" : "text-foreground",
                    isSelected && "font-semibold text-primary",
                    !opt.value && "text-muted-foreground",
                  )}
                >
                  {OptIcon ? (
                    <OptIcon
                      aria-hidden="true"
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        isSelected ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  {opt.hint && (
                    <span className="shrink-0 text-xs text-muted-foreground">{opt.hint}</span>
                  )}
                  {isSelected && (
                    <GoCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

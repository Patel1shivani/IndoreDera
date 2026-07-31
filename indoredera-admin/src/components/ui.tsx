import type { ReactNode } from "react";
import { Icons, type IconType } from "../lib/icons";

/** Admin panel ke reusable blocks. */

export type Tone = "plain" | "brand" | "ok" | "warn";

const toneChip: Record<Tone, string> = {
  plain: "bg-surface text-ink-soft",
  brand: "bg-brand-soft text-brand",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-[oklch(0.45_0.11_60)]",
};

const toneBar: Record<Tone, string> = {
  plain: "bg-line",
  brand: "bg-brand",
  ok: "bg-ok",
  warn: "bg-warn",
};

export function Card({
  title,
  subtitle,
  icon: Icon,
  tone = "plain",
  action,
  padding = true,
  children,
}: {
  title?: string;
  subtitle?: string;
  icon?: IconType;
  tone?: Tone;
  action?: ReactNode;
  /** Table jaise full-bleed content ke liye off kar dein. */
  padding?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line/70 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneChip[tone]}`}
              >
                <Icon className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="truncate text-base tracking-wide">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      <div className={padding ? "p-5" : undefined}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "plain",
  onClick,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: IconType;
  tone?: Tone;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`card group relative overflow-hidden p-5 text-left transition-all ${
        onClick ? "hover:-translate-y-0.5 hover:shadow-lg" : "cursor-default"
      }`}
    >
      {/* upar patli rangeen patti — card ko tone deti hai bina bhari kiye */}
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${toneBar[tone]}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
          <p className="mt-1.5 font-display text-3xl leading-none tracking-wide">{value}</p>
          {hint && <p className="mt-1.5 text-xs text-ink-soft">{hint}</p>}
        </div>
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneChip[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {onClick && (
        <Icons.arrowUp
          aria-hidden="true"
          className="absolute bottom-4 right-4 h-4 w-4 text-ink-soft opacity-0 transition-opacity group-hover:opacity-100"
        />
      )}
    </button>
  );
}

export function Badge({
  tone = "plain",
  icon: Icon,
  children,
}: {
  tone?: "plain" | "ok" | "warn" | "danger";
  icon?: IconType;
  children: ReactNode;
}) {
  const map = {
    plain: "bg-surface text-ink-soft border-line",
    ok: "bg-ok-soft text-ok border-ok/30",
    warn: "bg-warn-soft text-[oklch(0.45_0.11_60)] border-warn/45",
    danger: "bg-brand-soft text-brand border-brand/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}
    >
      {Icon && <Icon aria-hidden="true" className="h-3 w-3" />}
      {children}
    </span>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  span,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  span?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={span ? "sm:col-span-2" : undefined}>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-ink-soft">{hint}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  icon: Icon = Icons.info,
  action,
}: {
  title: string;
  hint?: string;
  icon?: IconType;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface/60 px-6 py-10 text-center">
      <span
        aria-hidden="true"
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-panel text-ink-soft shadow-sm"
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 font-medium">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">{hint}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/** Horizontal bar — dashboard ke breakdown ke liye. */
export function BarRow({
  label,
  icon: Icon,
  value,
  total,
  color,
}: {
  label: string;
  icon: IconType;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="w-20 shrink-0 text-sm font-medium">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-14 shrink-0 text-right text-sm">
        <span className="font-semibold">{value}</span>
        <span className="text-ink-soft"> · {pct}%</span>
      </span>
    </div>
  );
}

/** Naam se initials wala round avatar. */
export function Avatar({
  name,
  size = "md",
  tone = "brand",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  tone?: "brand" | "ok" | "ink";
}) {
  const sizes = {
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-xs",
    lg: "h-12 w-12 text-sm",
  };
  const tones = {
    brand: "bg-brand text-white",
    ok: "bg-ok text-white",
    ink: "bg-sidebar text-white",
  };
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${sizes[size]} ${tones[tone]}`}
    >
      {initials(name)}
    </span>
  );
}

export function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  );
}

/** Icon wala search box — har list page par ek jaisa. */
export function SearchInput({
  value,
  onChange,
  placeholder,
  className = "w-64",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Icons.search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
      />
      <input
        className="input pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          aria-label="Search saaf karein"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-soft hover:bg-surface hover:text-ink"
        >
          <Icons.close className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/** Filter chips — listings, users aur subscriptions teeno par same. */
export function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number; icon?: IconType }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "border-brand bg-brand text-white"
                : "border-line bg-panel text-ink-soft hover:border-brand/40 hover:text-ink"
            }`}
          >
            {Icon && <Icon aria-hidden="true" className="h-3.5 w-3.5" />}
            {o.label}
            {o.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  active ? "bg-white/20" : "bg-surface"
                }`}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Sirf icon wala chhota action button — table rows ke liye. */
export function IconButton({
  icon: Icon,
  label,
  onClick,
  tone = "plain",
  disabled,
}: {
  icon: IconType;
  label: string;
  onClick: () => void;
  tone?: "plain" | "ok" | "danger";
  disabled?: boolean;
}) {
  const tones = {
    plain: "border-line text-ink-soft hover:border-brand/40 hover:text-ink",
    ok: "border-ok/30 text-ok hover:bg-ok-soft",
    danger: "border-danger/30 text-danger hover:bg-brand-soft",
  };
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-panel transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/** Star rating — testimonials me repeat ho raha tha. */
export function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) =>
        n <= rating ? (
          <Icons.starFill key={n} aria-hidden="true" className="h-3.5 w-3.5 text-warn" />
        ) : (
          <Icons.star key={n} aria-hidden="true" className="h-3.5 w-3.5 text-ink-soft/35" />
        ),
      )}
    </span>
  );
}

/**
 * Content pages ki save patti.
 *
 * Page ke neeche chipki rehti hai (sticky) taaki lambi form me scroll karne par
 * bhi Save haath ke paas rahe, aur ek nazar me pata chale ki kuch save hona
 * baaki hai ya nahi.
 */
export function SaveBar({
  dirty,
  saving,
  error,
  saved,
  onSave,
  onDiscard,
}: {
  /** Kitni fields badli hain. 0 = kuch save karna baaki nahi. */
  dirty: number;
  saving: boolean;
  error: string | null;
  /** Is page par ek baar save ho chuka hai — "sab save ho gaya" dikhane ke liye. */
  saved: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  const status = error ? (
    <>
      <Icons.alert aria-hidden="true" className="h-4 w-4 shrink-0 text-danger" />
      <span className="text-danger">{error}</span>
    </>
  ) : dirty > 0 ? (
    /* text-warn khud bahut halka hai (light amber) — panel par padha nahi
       jaata, isliye wahi gehra shade jo Badge me use hota hai */
    <span className="flex items-center gap-2 text-[oklch(0.45_0.11_60)]">
      <Icons.pending aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span>
        <strong>{dirty}</strong> {dirty === 1 ? "change" : "changes"} save nahi hue
      </span>
    </span>
  ) : saved ? (
    <>
      <Icons.approve aria-hidden="true" className="h-4 w-4 shrink-0 text-ok" />
      <span className="text-ink-soft">Sab save ho gaya — website par live hai</span>
    </>
  ) : (
    <>
      <Icons.info aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-soft" />
      <span className="text-ink-soft">Koi change nahi</span>
    </>
  );

  return (
    <div
      className={`card sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 bg-panel/95 px-5 py-3 backdrop-blur ${
        // save baaki ho to patti khud dikhe ki dhyaan chahiye
        dirty > 0 ? "border-warn" : "border-line/70"
      }`}
    >
      <p className="flex min-w-0 items-center gap-2 text-sm">{status}</p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          className="btn btn-ghost"
          disabled={dirty === 0 || saving}
          onClick={onDiscard}
        >
          <Icons.refresh aria-hidden="true" className="h-4 w-4" />
          Wapas lein
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={dirty === 0 || saving}
          onClick={onSave}
        >
          <Icons.check aria-hidden="true" className="h-4 w-4" />
          {saving ? "Save ho raha hai…" : "Save karein"}
        </button>
      </div>
    </div>
  );
}

/**
 * Add / remove / upar-neeche wali list.
 *
 * About ke steps, legal clauses, FAQ, bullet points — sab jagah wahi teen
 * kaam chahiye the, isliye ek hi component. Row ke andar kya dikhega wo caller
 * decide karta hai; ye sirf ordering aur add/remove sambhalta hai.
 *
 * Ordering isliye zaroori hai kyunki website list ko usi kram me dikhati hai
 * jis kram me wo array me hai (legal clauses to numbered bhi hain).
 */
export function ListEditor<T>({
  items,
  onChange,
  create,
  addLabel = "Naya add karein",
  itemLabel,
  children,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  /** Naya khaali item — "Add" par yahi list ke aakhir me judta hai. */
  create: () => T;
  addLabel?: string;
  /** Row ke upar chhota label, jaise "Clause 3". */
  itemLabel?: (index: number) => string;
  children: (item: T, set: (next: T) => void, index: number) => ReactNode;
}) {
  const replace = (index: number, next: T) =>
    onChange(items.map((item, i) => (i === index ? next : item)));

  const move = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-line bg-surface/60 px-4 py-6 text-center text-sm text-ink-soft">
          Abhi kuch nahi hai — neeche se add karein.
        </p>
      )}

      {items.map((item, index) => (
        <div
          // index hi key hai: in lists me koi stable id nahi hota aur content
          // se key banane par typing ke beech row remount ho jaati hai
          key={index}
          className="rounded-xl border border-line bg-surface/50 p-3"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              {itemLabel?.(index) ?? `#${index + 1}`}
            </span>
            <div className="flex items-center gap-1.5">
              <IconButton
                icon={Icons.moveUp}
                label="Upar le jaayein"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              />
              <IconButton
                icon={Icons.moveDown}
                label="Neeche le jaayein"
                disabled={index === items.length - 1}
                onClick={() => move(index, 1)}
              />
              <IconButton
                icon={Icons.remove}
                label="Hataayein"
                tone="danger"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              />
            </div>
          </div>
          {children(item, (next) => replace(index, next), index)}
        </div>
      ))}

      <button type="button" className="btn btn-ghost" onClick={() => onChange([...items, create()])}>
        <Icons.add aria-hidden="true" className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}

/** Sirf strings ki list — bullet points ke liye ListEditor ka shortcut. */
export function StringListEditor({
  items,
  onChange,
  addLabel,
  placeholder,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  addLabel?: string;
  placeholder?: string;
}) {
  return (
    <ListEditor items={items} onChange={onChange} create={() => ""} addLabel={addLabel}>
      {(item, set) => (
        <textarea
          rows={2}
          className="input"
          placeholder={placeholder}
          value={item}
          onChange={(e) => set(e.target.value)}
        />
      )}
    </ListEditor>
  );
}

/** Chhoti key-value line — cards ke andar meta info ke liye. */
export function MetaLine({ icon: Icon, children }: { icon: IconType; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
      <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  );
}

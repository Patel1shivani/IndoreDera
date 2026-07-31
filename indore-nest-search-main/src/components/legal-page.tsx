import type { ReactNode } from "react";
import { GoLaw } from "react-icons/go";
import type { LegalDoc } from "@/lib/site-data";

/**
 * Privacy Policy aur Terms — dono ka ek jaisa layout, taaki styling
 * ek jagah rahe aur dono page consistent dikhein.
 */
export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  /** "Last updated" date — human readable. */
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="animate-rise-in text-center">
        <GoLaw aria-hidden="true" className="mx-auto h-9 w-9 text-primary" />
        <h1 className="mt-3 text-3xl tracking-wide sm:text-4xl">{title}</h1>
        {updated && (
          <p className="mt-2 text-xs tracking-wide text-muted-foreground uppercase">
            Last updated: {updated}
          </p>
        )}
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{intro}</p>
      </div>

      <div className="animate-rise-in delay-step-1 mt-10 space-y-4">{children}</div>
    </div>
  );
}

/** Ek numbered clause — card ke andar heading + content. */
export function LegalSection({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="flex items-baseline gap-3 font-display text-xl tracking-wide">
        <span className="text-sm font-bold text-primary">{String(n).padStart(2, "0")}</span>
        {title}
      </h2>
      <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

/**
 * Poora legal document — Privacy aur Terms dono isi se bante hain.
 *
 * Content admin panel se aata hai, isliye clause ka title, paragraph aur
 * bullets teeno optional hain: jo khaali hai wo render hi nahi hota. Numbering
 * list ke kram se banti hai, database me store nahi hoti — clause upar-neeche
 * karne par numbers apne aap theek ho jaate hain.
 */
export function LegalDocView({ doc }: { doc: LegalDoc }) {
  return (
    <LegalPage title={doc.title} updated={doc.updated} intro={doc.intro}>
      {doc.sections.map((section, i) => (
        <LegalSection key={`${i}-${section.title}`} n={i + 1} title={section.title}>
          {section.items.length > 0 && <LegalList items={section.items} />}
          {section.body && <p>{section.body}</p>}
        </LegalSection>
      ))}
    </LegalPage>
  );
}

/** Clause ke andar bullet list. */
export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

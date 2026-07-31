import { Card, Field, SaveBar } from "../components/ui";
import { useSectionEditor } from "../lib/draft";
import { Icons } from "../lib/icons";
import { useStore } from "../lib/store";
import type { ContactContent } from "../lib/types";

/*
 * Contact page + footer.
 *
 * Address, phone aur email pehle website ke code me teen jagah likhe the
 * (contact page ke cards, footer ka "Reach Us", aur privacy/terms ka sampark
 * clause). Ab ek hi jagah se aate hain — number badalna ek field ka kaam hai.
 */

const fields: { key: keyof ContactContent; label: string; hint?: string; big?: boolean }[] = [
  { key: "heading", label: "Page ka heading" },
  { key: "subheading", label: "Page ka subheading", big: true },
  { key: "address", label: "Office address", hint: "Contact page aur footer dono me" },
  { key: "phone", label: "Phone", hint: "Footer me click karne par call lagti hai" },
  { key: "email", label: "Email" },
  { key: "timings", label: "Timings" },
  { key: "sentTitle", label: "Form bhejne ke baad — title" },
  { key: "sentText", label: "Form bhejne ke baad — text", big: true },
  {
    key: "footerTagline",
    label: "Footer tagline",
    hint: "Footer me logo ke neeche wali line",
    big: true,
  },
];

export function ContactPage() {
  const { siteData } = useStore();
  if (!siteData) return null;
  return <ContactEditor server={siteData.contact} />;
}

/* Editor alag component hai taaki draft ka state siteData aane ke baad hi bane
   — warna pehle render par khaali object draft ban jaata. */
function ContactEditor({ server }: { server: ContactContent }) {
  const { saveContact } = useStore();
  const { draft, update, state } = useSectionEditor(server, saveContact);

  return (
    <div className="space-y-6">
      <Card
        icon={Icons.mail}
        tone="brand"
        title="Contact details"
        subtitle="Website ke Contact page aur footer, dono yahin se bharte hain"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <Field
              key={f.key}
              label={f.label}
              hint={f.hint}
              htmlFor={`contact-${f.key}`}
              span={f.big}
            >
              {f.big ? (
                <textarea
                  id={`contact-${f.key}`}
                  rows={2}
                  className="input"
                  value={draft[f.key]}
                  onChange={(e) => update({ [f.key]: e.target.value })}
                />
              ) : (
                <input
                  id={`contact-${f.key}`}
                  className="input"
                  value={draft[f.key]}
                  onChange={(e) => update({ [f.key]: e.target.value })}
                />
              )}
            </Field>
          ))}
        </div>
      </Card>

      <Card icon={Icons.show} title="Preview" subtitle="Save karne par website par aisa dikhega">
        <p className="font-display text-2xl tracking-wide">{draft.heading}</p>
        <p className="mt-1 text-sm text-ink-soft">{draft.subheading}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { icon: Icons.locality, k: "Office", v: draft.address },
            { icon: Icons.phone, k: "Phone", v: draft.phone },
            { icon: Icons.mail, k: "Email", v: draft.email },
            { icon: Icons.pending, k: "Timings", v: draft.timings },
          ].map((row) => (
            <div
              key={row.k}
              className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <row.icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-ink-soft">{row.k}</p>
                <p className="mt-0.5 break-words text-sm font-medium">{row.v}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SaveBar {...state} />
    </div>
  );
}

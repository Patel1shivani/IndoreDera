import { useState } from "react";
import { Card, Field, FilterPills, ListEditor, SaveBar, StringListEditor } from "../components/ui";
import { useSectionEditor } from "../lib/draft";
import { Icons } from "../lib/icons";
import { useStore } from "../lib/store";
import { useUnsaved } from "../lib/unsaved";
import type { LegalDoc, LegalPageKey } from "../lib/types";

/*
 * Privacy Policy aur Terms & Conditions.
 *
 * Dono ka dhaancha bilkul ek hai — title, "last updated", intro aur numbered
 * clauses — isliye ek hi editor hai aur upar sirf page switch hota hai.
 *
 * Har clause me paragraph bhi ho sakta hai aur bullet list bhi; website dono
 * dikha deti hai (pehle bullets, phir paragraph). Khaali chhod dein to wo hissa
 * render hi nahi hota.
 */

const tabs: { value: LegalPageKey; label: string }[] = [
  { value: "privacy", label: "Privacy Policy" },
  { value: "terms", label: "Terms & Conditions" },
];

export function LegalPagesPage() {
  const { siteData } = useStore();
  const [page, setPage] = useState<LegalPageKey>("privacy");
  const { confirmLeave } = useUnsaved();

  if (!siteData) return null;

  return (
    <div className="space-y-6">
      <Card
        icon={Icons.lock}
        tone="brand"
        title="Kaunsa page edit karna hai"
        subtitle="Dono footer me link hote hain"
      >
        <FilterPills
          options={tabs}
          value={page}
          // tab badalna bhi "page chhodna" hai — bina save kiye switch karne par
          // draft chala jaata, isliye pehle poochh lete hain
          onChange={(next) => confirmLeave() && setPage(next)}
        />
      </Card>

      {/* key: tab badalte hi naya draft banna chahiye, purana nahi chalte rehna */}
      <LegalEditor key={page} page={page} server={siteData.legal[page]} />
    </div>
  );
}

function LegalEditor({ page, server }: { page: LegalPageKey; server: LegalDoc }) {
  const { saveLegal } = useStore();
  const { draft, update, state } = useSectionEditor(server, (patch) => saveLegal(page, patch));

  return (
    <div className="space-y-6">
      <Card icon={Icons.content} title="Page ka sar" subtitle="Sabse upar dikhne wala hissa">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Page ka title" htmlFor={`legal-${page}-title`}>
            <input
              id={`legal-${page}-title`}
              className="input"
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
            />
          </Field>
          <Field
            label="Last updated"
            hint="Jaise: 28 July 2026 — clause badlein to ise bhi badal dein"
            htmlFor={`legal-${page}-updated`}
          >
            <input
              id={`legal-${page}-updated`}
              className="input"
              value={draft.updated}
              onChange={(e) => update({ updated: e.target.value })}
            />
          </Field>
          <Field label="Intro paragraph" htmlFor={`legal-${page}-intro`} span>
            <textarea
              id={`legal-${page}-intro`}
              rows={3}
              className="input"
              value={draft.intro}
              onChange={(e) => update({ intro: e.target.value })}
            />
          </Field>
        </div>
      </Card>

      <Card
        icon={Icons.tasks}
        title="Clauses"
        subtitle="Website inhe isi kram me 01, 02, 03… karke dikhati hai"
      >
        <ListEditor
          items={draft.sections}
          onChange={(sections) => update({ sections })}
          create={() => ({ title: "", body: "", items: [] })}
          addLabel="Clause add karein"
          itemLabel={(i) => `Clause ${String(i + 1).padStart(2, "0")}`}
        >
          {(clause, set, index) => (
            <div className="grid gap-3">
              <Field label="Clause ka title" htmlFor={`clause-${page}-${index}-title`}>
                <input
                  id={`clause-${page}-${index}-title`}
                  className="input"
                  value={clause.title}
                  onChange={(e) => set({ ...clause, title: e.target.value })}
                />
              </Field>
              <Field
                label="Paragraph"
                hint="Khaali chhod dein to sirf bullets dikhenge"
                htmlFor={`clause-${page}-${index}-body`}
              >
                <textarea
                  id={`clause-${page}-${index}-body`}
                  rows={4}
                  className="input"
                  value={clause.body}
                  onChange={(e) => set({ ...clause, body: e.target.value })}
                />
              </Field>
              <div>
                <p className="label">Bullet points</p>
                <StringListEditor
                  items={clause.items}
                  onChange={(items) => set({ ...clause, items })}
                  addLabel="Bullet add karein"
                />
              </div>
            </div>
          )}
        </ListEditor>
      </Card>

      <SaveBar {...state} />
    </div>
  );
}

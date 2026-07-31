import { BlurbListEditor } from "../components/content-editors";
import { Card, Field, ListEditor, SaveBar } from "../components/ui";
import { useSectionEditor } from "../lib/draft";
import { Icons } from "../lib/icons";
import { useStore } from "../lib/store";
import type { HomeContent } from "../lib/types";

/*
 * Homepage ka wo text jo hero ke neeche aata hai — "Indore Dera hi kyun?",
 * "Kaise kaam karta hai?" aur FAQ.
 *
 * Hero khud "Hero & logo" page par hai (wo logo aur login gate ke saath jaata
 * hai), isliye yahan dobara nahi rakha.
 */

export function HomeTextPage() {
  const { siteData } = useStore();
  if (!siteData) return null;
  return <HomeTextEditor server={siteData.home} />;
}

function HomeTextEditor({ server }: { server: HomeContent }) {
  const { saveHome } = useStore();
  const { draft, update, state } = useSectionEditor(server, saveHome);

  const text = (key: keyof HomeContent, label: string) => (
    <Field key={key} label={label} htmlFor={`home-${key}`}>
      <input
        id={`home-${key}`}
        className="input"
        value={draft[key] as string}
        onChange={(e) => update({ [key]: e.target.value })}
      />
    </Field>
  );

  return (
    <div className="space-y-6">
      <Card
        icon={Icons.trophy}
        tone="brand"
        title="Indore Dera hi kyun?"
        subtitle="Chaar icon wale cards"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {text("whyTitle", "Section ka title")}
          {text("whySubtitle", "Section ka subtitle")}
        </div>
        <div className="mt-4">
          <BlurbListEditor
            idPrefix="home-why"
            items={draft.whyPoints}
            onChange={(whyPoints) => update({ whyPoints })}
            addLabel="Card add karein"
          />
        </div>
      </Card>

      <Card icon={Icons.tasks} title="Kaise kaam karta hai?" subtitle="Numbered steps">
        <div className="grid gap-4 sm:grid-cols-2">
          {text("stepsTitle", "Section ka title")}
          {text("stepsSubtitle", "Section ka subtitle")}
        </div>
        <div className="mt-4">
          <BlurbListEditor
            idPrefix="home-step"
            items={draft.steps}
            onChange={(steps) => update({ steps })}
            addLabel="Step add karein"
          />
        </div>
      </Card>

      <Card
        icon={Icons.feedback}
        title="FAQ"
        subtitle="Home page ke neeche khulne-band hone wale sawaal"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {text("faqTitle", "Section ka title")}
          {text("faqSubtitle", "Section ka subtitle")}
        </div>
        <div className="mt-4">
          <ListEditor
            items={draft.faqs}
            onChange={(faqs) => update({ faqs })}
            create={() => ({ q: "", a: "" })}
            addLabel="Sawaal add karein"
            itemLabel={(i) => `Sawaal ${i + 1}`}
          >
            {(faq, set, index) => (
              <div className="grid gap-3">
                <Field label="Sawaal" htmlFor={`faq-${index}-q`}>
                  <input
                    id={`faq-${index}-q`}
                    className="input"
                    value={faq.q}
                    onChange={(e) => set({ ...faq, q: e.target.value })}
                  />
                </Field>
                <Field label="Jawab" htmlFor={`faq-${index}-a`}>
                  <textarea
                    id={`faq-${index}-a`}
                    rows={3}
                    className="input"
                    value={faq.a}
                    onChange={(e) => set({ ...faq, a: e.target.value })}
                  />
                </Field>
              </div>
            )}
          </ListEditor>
        </div>
      </Card>

      <SaveBar {...state} />
    </div>
  );
}

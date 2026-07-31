import { BlurbListEditor } from "../components/content-editors";
import { Card, Field, SaveBar, StringListEditor } from "../components/ui";
import { useSectionEditor } from "../lib/draft";
import { Icons } from "../lib/icons";
import { useStore } from "../lib/store";
import type { AboutContent } from "../lib/types";

/*
 * About page ka poora text.
 *
 * Page website par upar se neeche jis kram me hai, ye cards bhi usi kram me
 * hain — taaki admin ko dhoondhna na pade ki kaunsa box kahan dikhega.
 *
 * "Kya-kya milta hai" ke property types aur ilaakon ki list yahan nahi hai:
 * wo asli data se banti hai (listings aur localities), text se nahi.
 */

export function AboutPage() {
  const { siteData } = useStore();
  if (!siteData) return null;
  return <AboutEditor server={siteData.about} />;
}

function AboutEditor({ server }: { server: AboutContent }) {
  const { saveAbout } = useStore();
  const { draft, update, state } = useSectionEditor(server, saveAbout);

  /** Chhota helper — har text field ek jaisa hi hai. */
  const text = (key: keyof AboutContent, label: string, opts: { big?: boolean } = {}) => (
    <Field key={key} label={label} htmlFor={`about-${key}`} span={opts.big}>
      {opts.big ? (
        <textarea
          id={`about-${key}`}
          rows={3}
          className="input"
          value={draft[key] as string}
          onChange={(e) => update({ [key]: e.target.value })}
        />
      ) : (
        <input
          id={`about-${key}`}
          className="input"
          value={draft[key] as string}
          onChange={(e) => update({ [key]: e.target.value })}
        />
      )}
    </Field>
  );

  return (
    <div className="space-y-6">
      <Card
        icon={Icons.megaphone}
        tone="brand"
        title="Upar ka hero"
        subtitle="About page kholte hi jo sabse pehle dikhta hai"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {text("badge", "Badge")}
          {text("title", "Title")}
          {text("intro", "Intro paragraph", { big: true })}
        </div>
        <div className="mt-4">
          <p className="label">Hero ke neeche wale tick points</p>
          <StringListEditor
            items={draft.bullets}
            onChange={(bullets) => update({ bullets })}
            addLabel="Point add karein"
            placeholder="Jaise: Zero brokerage"
          />
        </div>
      </Card>

      <Card icon={Icons.info} title="“Dera” ka matlab" subtitle="Naam samjhane wala box">
        <div className="grid gap-4">
          {text("meaningTitle", "Box ka title")}
          {text("meaningBody", "Box ka text", { big: true })}
        </div>
      </Card>

      <Card icon={Icons.check} title="Hum kya hain / kya nahi" subtitle="Do saamne-saamne wale cards">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="grid gap-4">{text("weAreTitle", "Left card ka title")}</div>
            <div className="mt-3">
              <StringListEditor
                items={draft.weAre}
                onChange={(weAre) => update({ weAre })}
                addLabel="Line add karein"
              />
            </div>
          </div>
          <div>
            <div className="grid gap-4">{text("weAreNotTitle", "Right card ka title")}</div>
            <div className="mt-3">
              <StringListEditor
                items={draft.weAreNot}
                onChange={(weAreNot) => update({ weAreNot })}
                addLabel="Line add karein"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card
        icon={Icons.tasks}
        title="Kaam kaise karta hai"
        subtitle="Kirayedaar aur owner — dono ke steps"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {text("howTitle", "Section ka title")}
          {text("howSubtitle", "Section ka subtitle")}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="grid gap-4">{text("tenantTitle", "Left column ka title")}</div>
            <div className="mt-3">
              {/* steps par number dikhta hai, icon nahi */}
              <BlurbListEditor
                idPrefix="about-tenant"
                withIcon={false}
                items={draft.tenantSteps}
                onChange={(tenantSteps) => update({ tenantSteps })}
                addLabel="Step add karein"
              />
            </div>
          </div>
          <div>
            <div className="grid gap-4">{text("ownerTitle", "Right column ka title")}</div>
            <div className="mt-3">
              <BlurbListEditor
                idPrefix="about-owner"
                withIcon={false}
                items={draft.ownerSteps}
                onChange={(ownerSteps) => update({ ownerSteps })}
                addLabel="Step add karein"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card
        icon={Icons.listings}
        title="Kya-kya milta hai"
        subtitle="Iske neeche property types aur ilaake apne aap aate hain"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {text("typesTitle", "Property types ka heading")}
          {text("localitiesSubtitle", "Ilaakon ke neeche wali line")}
        </div>
      </Card>

      <Card icon={Icons.shield} title="Hamara vaada" subtitle="Chaar icon wale cards">
        <div className="grid gap-4">{text("valuesTitle", "Section ka title")}</div>
        <div className="mt-3">
          <BlurbListEditor
            idPrefix="about-value"
            items={draft.values}
            onChange={(values) => update({ values })}
            addLabel="Card add karein"
          />
        </div>
      </Card>

      <Card icon={Icons.rocket} title="Neeche ke CTA box" subtitle="Page ke aakhir me">
        <div className="grid gap-4 sm:grid-cols-2">
          {text("ctaTitle", "Green box ka title")}
          {text("ctaText", "Green box ka text", { big: true })}
          {text("helpTitle", "“Sawaal hai?” box ka title")}
          {text("helpText", "“Sawaal hai?” box ka text", { big: true })}
        </div>
      </Card>

      <SaveBar {...state} />
    </div>
  );
}

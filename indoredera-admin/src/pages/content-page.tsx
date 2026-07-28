import { Card, Field } from "../components/ui";
import { Icons, type IconType } from "../lib/icons";
import { useStore } from "../lib/store";
import type { HeroContent } from "../lib/types";

const groups: {
  title: string;
  icon: IconType;
  hint: string;
  fields: { key: keyof HeroContent; label: string; big?: boolean }[];
}[] = [
  {
    title: "Brand",
    icon: Icons.organization,
    hint: "Header aur footer me dikhta hai",
    fields: [
      { key: "logoText", label: "Logo text" },
      { key: "logoTagline", label: "Logo tagline" },
    ],
  },
  {
    title: "Hero section",
    icon: Icons.megaphone,
    hint: "Homepage kholte hi sabse upar",
    fields: [
      { key: "badge", label: "Badge" },
      { key: "titleStart", label: "Title — shuruaat" },
      { key: "titleHighlight", label: "Title — highlight (red)" },
      { key: "titleEnd", label: "Title — aakhir" },
      { key: "subtitle", label: "Subtitle", big: true },
      { key: "searchCta", label: "Search button" },
      { key: "ownerCta", label: "Owner CTA" },
    ],
  },
  {
    title: "Login gate",
    icon: Icons.lock,
    hint: "Logged-out visitors ko ye message dikhta hai",
    fields: [
      { key: "lockedTitle", label: "Gate title" },
      { key: "lockedSubtitle", label: "Gate subtitle", big: true },
    ],
  },
];

export function ContentPage() {
  const { siteData, updateHero } = useStore();
  if (!siteData) return null;
  const { hero } = siteData;

  return (
    <div className="space-y-6">
      <Card
        icon={Icons.show}
        tone="brand"
        title="Hero preview"
        subtitle="Website par bilkul aisa dikhega"
      >
        <div className="rounded-xl border border-line bg-surface px-6 py-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ok px-3 py-1 text-xs font-semibold text-white">
            <Icons.verified aria-hidden="true" className="h-3 w-3" />
            {hero.badge}
          </span>
          <p className="mx-auto mt-4 max-w-2xl font-display text-3xl tracking-wide">
            {hero.titleStart} <span className="text-brand">{hero.titleHighlight}</span>{" "}
            {hero.titleEnd}
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-soft">{hero.subtitle}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white">
              <Icons.search aria-hidden="true" className="h-3.5 w-3.5" />
              {hero.searchCta}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold">
              <Icons.add aria-hidden="true" className="h-3.5 w-3.5" />
              {hero.ownerCta}
            </span>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
          <Icons.info aria-hidden="true" className="h-3.5 w-3.5" />
          Changes turant save ho jaate hain — alag se Save button nahi hai.
        </p>
      </Card>

      {groups.map((g) => (
        <Card key={g.title} icon={g.icon} title={g.title} subtitle={g.hint}>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.fields.map((f) => (
              <Field key={f.key} label={f.label} htmlFor={`hero-${f.key}`} span={f.big}>
                {f.big ? (
                  <textarea
                    id={`hero-${f.key}`}
                    rows={2}
                    className="input"
                    value={hero[f.key]}
                    onChange={(e) => updateHero({ [f.key]: e.target.value })}
                  />
                ) : (
                  <input
                    id={`hero-${f.key}`}
                    className="input"
                    value={hero[f.key]}
                    onChange={(e) => updateHero({ [f.key]: e.target.value })}
                  />
                )}
              </Field>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

import { useState } from "react";
import { Badge, Card, EmptyState, Field, IconButton, StatCard } from "../components/ui";
import { Icons, type IconType } from "../lib/icons";
import { useStore } from "../lib/store";
import type { Audience, Banner } from "../lib/types";

const audiences: { value: Audience; label: string; hint: string; icon: IconType }[] = [
  { value: "guest", label: "Guest", hint: "Login se pehle", icon: Icons.globe },
  { value: "user", label: "Tenant", hint: "Logged-in kirayedar", icon: Icons.tenant },
  { value: "owner", label: "Owner", hint: "Property owners", icon: Icons.owner },
];

const emptyBanner = (): Banner => ({
  id: crypto.randomUUID(),
  audience: "guest",
  title: "",
  subtitle: "",
  image: "",
  ctaLabel: "Dekhein",
  active: true,
});

export function BannersPage() {
  const { siteData, saveBanner, removeBanner } = useStore();
  const [draft, setDraft] = useState<Banner>(emptyBanner);

  if (!siteData) return null;

  const live = siteData.banners.filter((b) => b.active);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Kul banners"
          value={siteData.banners.length}
          hint="Teeno audience milakar"
          icon={Icons.banners}
          tone="brand"
        />
        <StatCard
          label="Live"
          value={live.length}
          hint="Website par dikh rahe hain"
          icon={Icons.live}
          tone={live.length ? "ok" : "plain"}
        />
        <StatCard
          label="Hidden"
          value={siteData.banners.length - live.length}
          hint="Banaye hain par band hain"
          icon={Icons.hide}
        />
      </div>

      <Card
        icon={Icons.add}
        title="Naya banner"
        subtitle="Audience chunein — banner sirf unhi ko dikhega"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Audience" htmlFor="b-aud">
              <select
                id="b-aud"
                className="input"
                value={draft.audience}
                onChange={(e) => setDraft((b) => ({ ...b, audience: e.target.value as Audience }))}
              >
                {audiences.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label} — {a.hint}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Button text" htmlFor="b-cta">
              <input
                id="b-cta"
                className="input"
                value={draft.ctaLabel}
                onChange={(e) => setDraft((b) => ({ ...b, ctaLabel: e.target.value }))}
              />
            </Field>
            <Field label="Title" htmlFor="b-title" span>
              <input
                id="b-title"
                className="input"
                placeholder="Zero brokerage, 100% Indore"
                value={draft.title}
                onChange={(e) => setDraft((b) => ({ ...b, title: e.target.value }))}
              />
            </Field>
            <Field label="Subtitle" htmlFor="b-sub" span>
              <input
                id="b-sub"
                className="input"
                value={draft.subtitle}
                onChange={(e) => setDraft((b) => ({ ...b, subtitle: e.target.value }))}
              />
            </Field>
            <Field label="Image URL" htmlFor="b-img" span>
              <input
                id="b-img"
                type="url"
                className="input"
                placeholder="https://images.unsplash.com/..."
                value={draft.image}
                onChange={(e) => setDraft((b) => ({ ...b, image: e.target.value }))}
              />
            </Field>
          </div>

          {/* Live preview — banner website par kaisa lagega */}
          <div className="self-start overflow-hidden rounded-xl border border-line">
            {draft.image ? (
              <img src={draft.image} alt="" className="h-28 w-full object-cover" />
            ) : (
              <div className="flex h-28 items-center justify-center bg-surface text-ink-soft">
                <Icons.banners className="h-6 w-6" />
              </div>
            )}
            <div className="p-3">
              <p className="truncate text-sm font-semibold">{draft.title || "Banner ka title"}</p>
              <p className="truncate text-xs text-ink-soft">
                {draft.subtitle || "Subtitle yahan aayega"}
              </p>
              <span className="mt-2 inline-flex rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white">
                {draft.ctaLabel || "Dekhein"}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary mt-4"
          disabled={!draft.title || !draft.image}
          onClick={() => {
            saveBanner(draft);
            setDraft(emptyBanner());
          }}
        >
          <Icons.add className="h-4 w-4" />
          Banner add karein
        </button>
      </Card>

      {audiences.map((a) => {
        const list = siteData.banners.filter((b) => b.audience === a.value);
        return (
          <Card
            key={a.value}
            icon={a.icon}
            title={`${a.label} — ${a.hint}`}
            subtitle={`${list.length} banner · ${list.filter((b) => b.active).length} live`}
          >
            {list.length === 0 ? (
              <EmptyState icon={Icons.banners} title="Is audience ke liye koi banner nahi" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((b) => (
                  <div
                    key={b.id}
                    className="overflow-hidden rounded-xl border border-line transition-colors hover:border-brand/40"
                  >
                    <div className="relative">
                      <img
                        src={b.image}
                        alt=""
                        className={`h-28 w-full object-cover ${b.active ? "" : "opacity-50 grayscale"}`}
                      />
                      <span className="absolute right-2 top-2">
                        <Badge
                          tone={b.active ? "ok" : "plain"}
                          icon={b.active ? Icons.live : Icons.hide}
                        >
                          {b.active ? "Live" : "Hidden"}
                        </Badge>
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="truncate font-medium">{b.title}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-soft">{b.subtitle}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="truncate rounded-lg bg-surface px-2 py-1 text-[11px] font-semibold text-ink-soft">
                          {b.ctaLabel}
                        </span>
                        <div className="flex gap-2">
                          <IconButton
                            icon={b.active ? Icons.hide : Icons.show}
                            label={b.active ? "Hide karein" : "Live karein"}
                            tone={b.active ? "plain" : "ok"}
                            onClick={() => saveBanner({ ...b, active: !b.active })}
                          />
                          <IconButton
                            icon={Icons.remove}
                            label="Delete karein"
                            tone="danger"
                            onClick={() => removeBanner(b.id)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

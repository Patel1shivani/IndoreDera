import { Badge, Card, Field, StatCard } from "../components/ui";
import { Icons } from "../lib/icons";
import { planStats } from "../lib/stats";
import { useStore } from "../lib/store";
import { formatRent, isPlanActive, type Plan } from "../lib/types";
import type { PageId } from "./registry";

export function PlansPage({ onNavigate }: { onNavigate: (id: PageId) => void }) {
  const { siteData, savePlan, users } = useStore();
  if (!siteData) return null;

  const patch = (plan: Plan, changes: Partial<Plan>) => savePlan({ ...plan, ...changes });
  const stats = planStats(users, siteData.plans);
  const revenue = stats.reduce((sum, s) => sum + s.revenue, 0);
  const active = users.filter((u) => isPlanActive(u.plan)).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Plans"
          value={siteData.plans.length}
          hint="Website ke Plans page par ye dikhte hain"
          icon={Icons.plans}
          tone="brand"
        />
        <StatCard
          label="Active subscriptions"
          value={active}
          hint="Kisne liya — Subscriptions page par"
          icon={Icons.subscriptions}
          tone={active ? "ok" : "plain"}
          onClick={() => onNavigate("subscriptions")}
        />
        <StatCard
          label="Plan revenue"
          value={formatRent(revenue)}
          hint="Aaj ke price × kul purchases"
          icon={Icons.zap}
          tone="ok"
          onClick={() => onNavigate("subscriptions")}
        />
      </div>

      <Card
        icon={Icons.plans}
        title="Plans edit karein"
        subtitle="Har change turant website par chala jaata hai"
      >
        <div className="grid gap-5 xl:grid-cols-3">
          {siteData.plans.map((p) => {
            const stat = stats.find((s) => s.plan.id === p.id);

            return (
              <div
                key={p.id}
                className={`space-y-3 rounded-xl border p-4 ${
                  p.highlight ? "border-brand/45 bg-brand-soft/30" : "border-line"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-soft">
                    <Icons.plans aria-hidden="true" className="h-3.5 w-3.5" />
                    {p.id}
                  </span>
                  {p.highlight && (
                    <Badge tone="danger" icon={Icons.trophy}>
                      Popular
                    </Badge>
                  )}
                </div>

                {/* Live preview — website par ye plan kaisa dikhega */}
                <div className="rounded-lg border border-line bg-panel p-3 text-center">
                  <p className="font-display text-lg tracking-wide">{p.label || "Naam daalein"}</p>
                  <p className="mt-0.5">
                    <span className="font-display text-2xl tracking-wide text-brand">
                      {formatRent(p.price)}
                    </span>
                    <span className="text-xs text-ink-soft"> {p.period}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-ink-soft">
                    {p.credits === null ? "Unlimited listings" : `${p.credits} listing credit`} ·{" "}
                    {p.durationDays === null ? "expire nahi hota" : `${p.durationDays} din valid`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-surface px-2 py-2">
                    <p className="font-display text-xl leading-none">{stat?.total ?? 0}</p>
                    <p className="mt-1 text-[11px] text-ink-soft">subscriber</p>
                  </div>
                  <div className="rounded-lg bg-surface px-2 py-2">
                    <p className="font-display text-xl leading-none text-ok">
                      {formatRent(stat?.revenue ?? 0)}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-soft">revenue</p>
                  </div>
                </div>

                <Field label="Naam" htmlFor={`p-label-${p.id}`}>
                  <input
                    id={`p-label-${p.id}`}
                    className="input"
                    value={p.label}
                    onChange={(e) => patch(p, { label: e.target.value })}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Price (₹)" htmlFor={`p-price-${p.id}`}>
                    <input
                      id={`p-price-${p.id}`}
                      type="number"
                      min="0"
                      className="input"
                      value={p.price}
                      onChange={(e) => patch(p, { price: Number(e.target.value) || 0 })}
                    />
                  </Field>
                  <Field label="Period text" htmlFor={`p-period-${p.id}`}>
                    <input
                      id={`p-period-${p.id}`}
                      className="input"
                      value={p.period}
                      onChange={(e) => patch(p, { period: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Listing credits"
                    htmlFor={`p-credits-${p.id}`}
                    hint="khaali = unlimited"
                  >
                    <input
                      id={`p-credits-${p.id}`}
                      type="number"
                      min="0"
                      className="input"
                      placeholder="unlimited"
                      value={p.credits ?? ""}
                      onChange={(e) =>
                        patch(p, { credits: e.target.value === "" ? null : Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Valid days" htmlFor={`p-days-${p.id}`} hint="khaali = never expires">
                    <input
                      id={`p-days-${p.id}`}
                      type="number"
                      min="0"
                      className="input"
                      placeholder="never"
                      value={p.durationDays ?? ""}
                      onChange={(e) =>
                        patch(p, {
                          durationDays: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                </div>

                <Field label="Perks (har line par ek)" htmlFor={`p-perks-${p.id}`}>
                  <textarea
                    id={`p-perks-${p.id}`}
                    rows={4}
                    className="input"
                    value={p.perks.join("\n")}
                    onChange={(e) =>
                      patch(p, { perks: e.target.value.split("\n").filter((l) => l.trim() !== "") })
                    }
                  />
                </Field>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={p.highlight ?? false}
                    onChange={(e) => patch(p, { highlight: e.target.checked })}
                  />
                  <Icons.trophy aria-hidden="true" className="h-4 w-4 text-warn" />
                  “Sabse popular” tag
                </label>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card icon={Icons.subscriptions} title="Kisne plan liya hai">
          <p className="text-sm text-ink-soft">
            Har plan ke buyers, unki credits aur expiry Subscriptions page par hai. Wahan se aap
            manually kisi user ko plan de bhi sakte hain aur hata bhi sakte hain.
          </p>
          <button
            type="button"
            className="btn btn-primary mt-4"
            onClick={() => onNavigate("subscriptions")}
          >
            <Icons.users className="h-4 w-4" />
            Subscriptions kholein
          </button>
        </Card>

        <Card icon={Icons.alert} tone="warn" title="Payment">
          <p className="text-sm text-ink-soft">
            Abhi koi asli payment nahi hota — plan lete hi turant activate ho jaata hai. Live jaane
            se pehle Razorpay lagana hoga: server par order banega, signature verify hoga, tabhi
            plan activate karenge.
          </p>
        </Card>
      </div>
    </div>
  );
}

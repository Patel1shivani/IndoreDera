import { Avatar, BarRow, Badge, Card, EmptyState, MetaLine, StatCard, Stars } from "../components/ui";
import { useAdminAuth } from "../lib/auth";
import { Icons, type IconType } from "../lib/icons";
import { overviewStats } from "../lib/stats";
import { useStore } from "../lib/store";
import {
  formatRent,
  isPlanActive,
  propertyTypeLabels,
  type PropertyType,
  type User,
} from "../lib/types";
import { pages, type PageId } from "./registry";

/* Har property type ka apna rang — logo ke palette se. */
const typeColors: Record<PropertyType, string> = {
  flat: "oklch(0.5 0.185 27)", // brand red
  room: "oklch(0.79 0.155 72)", // saffron
  shop: "oklch(0.52 0.13 148)", // green
  pg: "oklch(0.55 0.1 250)", // indigo
  land: "oklch(0.55 0.09 60)", // earth brown
};

const typeIcons: Record<PropertyType, IconType> = {
  flat: Icons.flat,
  room: Icons.room,
  shop: Icons.shop,
  pg: Icons.pg,
  land: Icons.land,
};

const roleIcons: Record<User["role"], IconType> = {
  tenant: Icons.tenant,
  owner: Icons.owner,
  admin: Icons.admin,
};

export function DashboardPage({ onNavigate }: { onNavigate: (id: PageId) => void }) {
  const { siteData, users } = useStore();
  const { admin } = useAdminAuth();
  if (!siteData) return null;

  const s = overviewStats(siteData, users);
  const todo = s.pendingListings.length + s.pendingFeedback.length;

  /* Users ke paas createdAt nahi hai, isliye "naye" ka matlab list ka aakhiri
     hissa hai — server naye users end me push karta hai.
     TODO(backend): User par createdAt aane par isse date se sort karein. */
  const recentUsers = users.filter((u) => u.role !== "admin").slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Greeting + pending kaam ka summary */}
      <div className="card flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-brand-soft to-panel p-5">
        <div>
          <h2 className="text-xl tracking-wide">Namaste, {admin?.name.split(" ")[0] ?? "Admin"}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
            {todo === 0 ? (
              <>
                <Icons.approve aria-hidden="true" className="h-4 w-4 text-ok" />
                Sab clear hai — koi kaam pending nahi.
              </>
            ) : (
              <>
                <Icons.pending aria-hidden="true" className="h-4 w-4 text-warn" />
                {todo} cheez aapke action ka intezaar kar rahi hai.
              </>
            )}
          </p>
        </div>
        {todo > 0 && (
          <div className="flex flex-wrap gap-2">
            {s.pendingListings.length > 0 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onNavigate("listings")}
              >
                <Icons.approve className="h-4 w-4" />
                {s.pendingListings.length} listing approve karein
              </button>
            )}
            {s.pendingFeedback.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => onNavigate("testimonials")}
              >
                <Icons.feedback className="h-4 w-4" />
                {s.pendingFeedback.length} feedback dekhein
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Live listings"
          value={s.live.length}
          hint={`${s.listings.length} total · ${s.drafts.length} draft`}
          icon={Icons.listings}
          tone="ok"
          onClick={() => onNavigate("listings")}
        />
        <StatCard
          label="Approval pending"
          value={s.pendingListings.length}
          hint={s.pendingListings.length ? "Aapka action chahiye" : "Sab clear"}
          icon={Icons.pending}
          tone={s.pendingListings.length ? "warn" : "plain"}
          onClick={() => onNavigate("listings")}
        />
        <StatCard
          label="Registered users"
          value={users.length}
          hint={`${s.owners.length} owner · ${s.tenants.length} tenant`}
          icon={Icons.users}
          tone="brand"
          onClick={() => onNavigate("users")}
        />
        <StatCard
          label="Active plans"
          value={s.activeSubscribers.length}
          hint={`${formatRent(s.revenue)} total plan revenue`}
          icon={Icons.subscriptions}
          tone={s.activeSubscribers.length ? "ok" : "plain"}
          onClick={() => onNavigate("subscriptions")}
        />
      </div>

      {/* Plan / revenue — "kisne plan liya" ka short version, poori list Subscriptions par */}
      <Card
        icon={Icons.subscriptions}
        tone="brand"
        title="Plans aur subscriptions"
        subtitle={`${s.subscribers.length} user ne plan liya · ${s.activeSubscribers.length} abhi active`}
        action={
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onNavigate("subscriptions")}
          >
            Poori list
            <Icons.arrow className="h-3.5 w-3.5" />
          </button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {s.planStats.map(({ plan, total, active, revenue }) => (
            <div
              key={plan.id}
              className="rounded-xl border border-line p-4 transition-colors hover:border-brand/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{plan.label}</p>
                  <p className="text-xs text-ink-soft">
                    {formatRent(plan.price)} {plan.period}
                  </p>
                </div>
                {plan.highlight && (
                  <Badge tone="warn" icon={Icons.trophy}>
                    Popular
                  </Badge>
                )}
              </div>
              <p className="mt-3 font-display text-2xl leading-none tracking-wide">{total}</p>
              <p className="mt-1 text-xs text-ink-soft">
                subscriber · {active} active
              </p>
              <p className="mt-2 flex items-center gap-1.5 border-t border-line/70 pt-2 text-xs font-semibold text-ok">
                <Icons.zap aria-hidden="true" className="h-3.5 w-3.5" />
                {formatRent(revenue)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          icon={Icons.pending}
          tone="warn"
          title="Approval ka intezaar"
          subtitle={`${s.pendingListings.length} listing`}
          action={
            <button type="button" className="btn btn-ghost" onClick={() => onNavigate("listings")}>
              Sab dekhein
              <Icons.arrow className="h-3.5 w-3.5" />
            </button>
          }
        >
          {s.pendingListings.length === 0 ? (
            <EmptyState
              icon={Icons.approve}
              title="Koi pending listing nahi"
              hint="Owner jab nayi property post karega, wo yahan aayegi."
            />
          ) : (
            <ul className="space-y-2">
              {s.pendingListings.slice(0, 4).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-line p-2.5 transition-colors hover:border-brand/40"
                >
                  <img src={p.image} alt="" className="h-12 w-16 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.title}</p>
                    <p className="truncate text-xs text-ink-soft">
                      {p.ownerName} · {p.locality} · {formatRent(p.rent)}
                    </p>
                  </div>
                  <Badge tone="warn" icon={Icons.pending}>
                    Pending
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          icon={Icons.register}
          tone="brand"
          title="Naye registrations"
          subtitle={`${users.length - s.admins.length} user website se register hue`}
          action={
            <button type="button" className="btn btn-ghost" onClick={() => onNavigate("users")}>
              Sab dekhein
              <Icons.arrow className="h-3.5 w-3.5" />
            </button>
          }
        >
          {recentUsers.length === 0 ? (
            <EmptyState
              icon={Icons.register}
              title="Abhi koi user register nahi hua"
              hint="Website ke Register page se account banate hi wo yahan dikhega."
            />
          ) : (
            <ul className="space-y-2">
              {recentUsers.map((u) => {
                const RoleIcon = roleIcons[u.role];
                return (
                  <li
                    key={u.id}
                    className="flex items-center gap-3 rounded-xl border border-line p-2.5 transition-colors hover:border-brand/40"
                  >
                    <Avatar name={u.name} size="sm" tone={u.role === "owner" ? "ok" : "brand"} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{u.name}</p>
                      <div className="flex flex-wrap items-center gap-x-3">
                        <MetaLine icon={Icons.mail}>{u.email}</MetaLine>
                        <MetaLine icon={Icons.phone}>{u.phone}</MetaLine>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge icon={RoleIcon}>{u.role}</Badge>
                      {isPlanActive(u.plan) && (
                        <Badge tone="ok" icon={Icons.subscriptions}>
                          {u.plan!.label}
                        </Badge>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card
          icon={Icons.feedback}
          tone="warn"
          title="Naya feedback"
          subtitle={`${s.pendingFeedback.length} pending · ${s.liveFeedback.length} live`}
          action={
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => onNavigate("testimonials")}
            >
              Sab dekhein
              <Icons.arrow className="h-3.5 w-3.5" />
            </button>
          }
        >
          {s.pendingFeedback.length === 0 ? (
            <EmptyState
              icon={Icons.feedback}
              title="Koi naya feedback nahi"
              hint="Website ke testimonials section se naya feedback yahan aayega."
            />
          ) : (
            <ul className="space-y-2">
              {s.pendingFeedback.slice(0, 4).map((t) => (
                <li key={t.id} className="rounded-xl border border-line p-3">
                  <Stars rating={t.rating} />
                  <p className="mt-1.5 line-clamp-2 text-sm">“{t.message}”</p>
                  <p className="mt-1.5 flex items-center gap-3">
                    <MetaLine icon={Icons.tenant}>{t.name}</MetaLine>
                    <MetaLine icon={Icons.locality}>{t.locality}</MetaLine>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          icon={Icons.dashboard}
          title="Listings — type ke hisaab se"
          subtitle={`Kul ${s.listings.length} · average rent ${formatRent(s.avgRent)}`}
        >
          <div className="space-y-3">
            {(Object.keys(typeColors) as PropertyType[]).map((type) => (
              <BarRow
                key={type}
                label={propertyTypeLabels[type]}
                icon={typeIcons[type]}
                value={s.listings.filter((p) => p.type === type).length}
                total={s.listings.length}
                color={typeColors[type]}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Panel me kya-kya hai — har section ka shortcut */}
      <Card
        icon={Icons.guide}
        title="Is panel me kya-kya hota hai"
        subtitle="Har section par ek click me jaayein"
        action={
          <button type="button" className="btn btn-ghost" onClick={() => onNavigate("guide")}>
            Poora guide
            <Icons.arrow className="h-3.5 w-3.5" />
          </button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pages
            .filter((p) => p.id !== "dashboard" && p.id !== "guide")
            .map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onNavigate(p.id)}
                  className="group flex items-start gap-3 rounded-xl border border-line p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{p.label}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-ink-soft">
                      {p.description}
                    </span>
                  </span>
                </button>
              );
            })}
        </div>
      </Card>
    </div>
  );
}

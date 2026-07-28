import { useState } from "react";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  FilterPills,
  IconButton,
  MetaLine,
  SearchInput,
  StatCard,
} from "../components/ui";
import { Icons, type IconType } from "../lib/icons";
import { planStats, subscriptionsOf } from "../lib/stats";
import { useStore } from "../lib/store";
import {
  daysLeft,
  formatDate,
  formatRent,
  planStateLabels,
  type PlanState,
  type User,
} from "../lib/types";

/**
 * Kisne kaunsa plan liya hai — poori listing.
 *
 * Data users[].plan se aata hai (wahi jo website purchase par set karti hai).
 * Price plan catalog se jodte hain, kyunki user ke plan snapshot me price nahi hota.
 */

type Filter = "all" | PlanState;

const filterMeta: Record<Filter, { label: string; icon: IconType }> = {
  all: { label: "Sab", icon: Icons.filter },
  active: { label: "Active", icon: Icons.approve },
  expired: { label: "Expired", icon: Icons.pending },
  "used-up": { label: "Credits khatam", icon: Icons.alert },
  none: { label: "Free users", icon: Icons.tenant },
};

const stateTone: Record<PlanState, "ok" | "warn" | "danger" | "plain"> = {
  active: "ok",
  expired: "danger",
  "used-up": "warn",
  none: "plain",
};

const stateIcon: Record<PlanState, IconType> = {
  active: Icons.approve,
  expired: Icons.reject,
  "used-up": Icons.alert,
  none: Icons.info,
};

export function SubscriptionsPage() {
  const { siteData, users, setUserPlan } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  if (!siteData) return null;

  const subs = subscriptionsOf(users, siteData.plans);
  const stats = planStats(users, siteData.plans);
  const freeUsers = users.filter((u) => u.plan === null && u.role !== "admin");
  const revenue = stats.reduce((sum, s) => sum + s.revenue, 0);
  const activeCount = subs.filter((s) => s.state === "active").length;

  const matches = (name: string, email: string, phone: string) =>
    q.trim() ? `${name} ${email} ${phone}`.toLowerCase().includes(q.toLowerCase()) : true;

  const rows =
    filter === "none"
      ? []
      : subs
          .filter((s) => (filter === "all" ? true : s.state === filter))
          .filter((s) => matches(s.user.name, s.user.email, s.user.phone));

  const freeRows =
    filter === "none" || filter === "all"
      ? freeUsers.filter((u) => matches(u.name, u.email, u.phone))
      : [];

  const countFor = (f: Filter) =>
    f === "all" ? subs.length : f === "none" ? freeUsers.length : subs.filter((s) => s.state === f).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Plan liya"
          value={subs.length}
          hint={`${users.length} registered users me se`}
          icon={Icons.subscriptions}
          tone="brand"
        />
        <StatCard
          label="Abhi active"
          value={activeCount}
          hint={activeCount ? "Ye users post kar sakte hain" : "Koi active plan nahi"}
          icon={Icons.approve}
          tone={activeCount ? "ok" : "plain"}
        />
        <StatCard
          label="Plan revenue"
          value={formatRent(revenue)}
          hint="Aaj ke price × kul purchases"
          icon={Icons.zap}
          tone="ok"
        />
        <StatCard
          label="Free users"
          value={freeUsers.length}
          hint="Inko abhi koi plan nahi mila"
          icon={Icons.tenant}
        />
      </div>

      <Card
        icon={Icons.plans}
        title="Plan-wise breakdown"
        subtitle="Kaunsa plan sabse zyada bik raha hai"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map(({ plan, total, active, revenue: planRevenue }) => {
            const share = subs.length ? Math.round((total / subs.length) * 100) : 0;
            return (
              <div key={plan.id} className="rounded-xl border border-line p-4">
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

                <div className="mt-3 flex items-end justify-between gap-2">
                  <p className="font-display text-2xl leading-none tracking-wide">{total}</p>
                  <p className="text-xs text-ink-soft">{share}% share</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-500"
                    style={{ width: `${share}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-2 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-ok">
                    <Icons.live aria-hidden="true" className="h-3 w-3" />
                    {active} active
                  </span>
                  <span className="font-semibold">{formatRent(planRevenue)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card
        icon={Icons.users}
        title={`${filter === "none" ? freeRows.length : rows.length} record`}
        subtitle="Har user ka plan, credits aur expiry"
        action={
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Naam, email ya mobile"
            className="w-full sm:w-64"
          />
        }
      >
        <div className="mb-4">
          <FilterPills<Filter>
            value={filter}
            onChange={setFilter}
            options={(["all", "active", "expired", "used-up", "none"] as Filter[]).map((f) => ({
              value: f,
              label: filterMeta[f].label,
              icon: filterMeta[f].icon,
              count: countFor(f),
            }))}
          />
        </div>

        {filter === "none" ? (
          <FreeUserList users={freeRows} plans={siteData.plans} onGivePlan={setUserPlan} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Icons.subscriptions}
            title="Yahan koi subscription nahi"
            hint={
              subs.length === 0
                ? "Website ke Plans page se koi user plan lega, to wo yahan dikhega."
                : "Filter ya search badal kar dekhein."
            }
          />
        ) : (
          <div className="space-y-3">
            {rows.map(({ user, plan, catalog, state, price }) => {
              const left = daysLeft(plan);
              const StateIcon = stateIcon[state];
              return (
                <div
                  key={user.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-line p-4 transition-colors hover:border-brand/40"
                >
                  <Avatar name={user.name} tone={state === "active" ? "ok" : "brand"} />

                  <div className="min-w-[10rem] flex-1">
                    <p className="font-semibold">{user.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3">
                      <MetaLine icon={Icons.mail}>{user.email}</MetaLine>
                      <MetaLine icon={Icons.phone}>{user.phone}</MetaLine>
                      <MetaLine icon={Icons.owner}>{user.role}</MetaLine>
                    </div>
                  </div>

                  <div className="min-w-[9rem]">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      Plan
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold">
                      <Icons.plans aria-hidden="true" className="h-3.5 w-3.5 text-brand" />
                      {plan.label}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {catalog ? `${formatRent(price)} ${catalog.period}` : "Catalog me nahi hai"}
                    </p>
                  </div>

                  <div className="min-w-[8rem]">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      Credits
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">
                      {plan.credits === null ? "Unlimited" : `${plan.credits} bachi`}
                    </p>
                  </div>

                  <div className="min-w-[9rem]">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                      Validity
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm">
                      <Icons.calendar aria-hidden="true" className="h-3.5 w-3.5 text-ink-soft" />
                      {plan.expiresAt === null ? "Expire nahi hota" : formatDate(plan.expiresAt)}
                    </p>
                    {left !== null && (
                      <p
                        className={`text-xs ${left <= 7 && left > 0 ? "font-semibold text-warn" : "text-ink-soft"}`}
                      >
                        {left > 0 ? `${left} din baaki` : `${Math.abs(left)} din pehle khatam`}
                      </p>
                    )}
                  </div>

                  <Badge tone={stateTone[state]} icon={StateIcon}>
                    {planStateLabels[state]}
                  </Badge>

                  <IconButton
                    icon={Icons.remove}
                    label={`${user.name} ka plan hataayein`}
                    tone="danger"
                    onClick={() => setUserPlan(user.id, null)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {filter === "all" && freeRows.length > 0 && (
        <Card
          icon={Icons.tenant}
          title={`Bina plan wale users (${freeRows.length})`}
          subtitle="Inhe manually plan de sakte hain"
        >
          <FreeUserList users={freeRows} plans={siteData.plans} onGivePlan={setUserPlan} />
        </Card>
      )}

      <Card icon={Icons.info} title="Ye numbers kahan se aate hain">
        <ul className="space-y-2 text-sm text-ink-soft">
          <li className="flex gap-2">
            <Icons.live aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 text-brand" />
            Revenue = har plan ka aaj ka price × usse kitne logon ne liya. Purchase history abhi
            server par store nahi hoti, isliye renewals aur purane price ismein nahi aate.
          </li>
          <li className="flex gap-2">
            <Icons.live aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 text-brand" />
            "Active" ka matlab wahi hai jo website par hai — expiry nikli nahi ho aur credits bachi
            hon.
          </li>
          <li className="flex gap-2">
            <Icons.live aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 text-brand" />
            Yahan se plan dena bina payment ke turant activate ho jaata hai — sirf support cases ke
            liye use karein.
          </li>
        </ul>
      </Card>
    </div>
  );
}

/** Bina plan wale users — inhe seedha yahin se plan diya ja sakta hai. */
function FreeUserList({
  users,
  plans,
  onGivePlan,
}: {
  users: User[];
  plans: { id: string; label: string }[];
  onGivePlan: (userId: string, planId: string | null) => void;
}) {
  if (users.length === 0) {
    return <EmptyState icon={Icons.approve} title="Har registered user ke paas plan hai" />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {users.map((u) => (
        <div key={u.id} className="rounded-xl border border-line p-4">
          <div className="flex items-center gap-3">
            <Avatar name={u.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{u.name}</p>
              <MetaLine icon={Icons.mail}>{u.email}</MetaLine>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Icons.add aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-soft" />
            <select
              className="input"
              aria-label={`${u.name} ko plan dein`}
              value=""
              onChange={(e) => e.target.value && onGivePlan(u.id, e.target.value)}
            >
              <option value="">Plan dein…</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

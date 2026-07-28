/*
 * Derived numbers ek hi jagah.
 *
 * Dashboard, Plans aur Subscriptions — teeno ko wahi revenue/subscriber counts
 * chahiye. Alag-alag calculate karte to teeno par alag numbers dikhne lagte.
 */

import { isPlanActive, planState, type Plan, type SiteData, type User } from "./types";

export type Subscription = {
  user: User;
  /** Server par plan sirf id+label rakhta hai — price ke liye catalog se jodte hain. */
  plan: NonNullable<User["plan"]>;
  catalog: Plan | undefined;
  state: ReturnType<typeof planState>;
  price: number;
};

/** Har wo user jisne kabhi koi plan liya hai — expired wale bhi. */
export function subscriptionsOf(users: User[], plans: Plan[]): Subscription[] {
  return users
    .filter((u) => u.plan !== null)
    .map((u) => {
      const plan = u.plan!;
      const catalog = plans.find((p) => p.id === plan.id);
      return { user: u, plan, catalog, state: planState(plan), price: catalog?.price ?? 0 };
    })
    .sort((a, b) => (b.plan.expiresAt ?? Infinity) - (a.plan.expiresAt ?? Infinity));
}

export type PlanStat = {
  plan: Plan;
  total: number;
  active: number;
  revenue: number;
};

/** Plan-wise subscriber count aur revenue. */
export function planStats(users: User[], plans: Plan[]): PlanStat[] {
  return plans.map((plan) => {
    const holders = users.filter((u) => u.plan?.id === plan.id);
    return {
      plan,
      total: holders.length,
      active: holders.filter((u) => isPlanActive(u.plan)).length,
      revenue: holders.length * plan.price,
    };
  });
}

/**
 * Poore panel ka ek summary.
 *
 * Note: revenue "kitne logon ne plan liya × plan ka aaj ka price" hai. Abhi
 * server par purchase history nahi hai, isliye renewals aur purane price is
 * number me nahi aate.
 * TODO(backend): asli payments aane par ise orders table se nikaalein.
 */
export function overviewStats(siteData: SiteData, users: User[]) {
  const listings = siteData.listings;
  const stats = planStats(users, siteData.plans);

  const owners = users.filter((u) => u.role === "owner");
  const tenants = users.filter((u) => u.role === "tenant");
  const admins = users.filter((u) => u.role === "admin");

  return {
    listings,
    live: listings.filter((p) => p.status === "approved"),
    pendingListings: listings.filter((p) => p.status === "pending"),
    drafts: listings.filter((p) => p.status === "draft"),
    featured: listings.filter((p) => p.featured),

    users,
    owners,
    tenants,
    admins,

    pendingFeedback: siteData.testimonials.filter((t) => t.status === "pending"),
    liveFeedback: siteData.testimonials.filter((t) => t.status === "approved"),
    liveBanners: siteData.banners.filter((b) => b.active),

    planStats: stats,
    subscribers: users.filter((u) => u.plan !== null),
    activeSubscribers: users.filter((u) => isPlanActive(u.plan)),
    revenue: stats.reduce((sum, s) => sum + s.revenue, 0),

    avgRent: listings.length
      ? Math.round(listings.reduce((s, p) => s + p.rent, 0) / listings.length)
      : 0,
  };
}

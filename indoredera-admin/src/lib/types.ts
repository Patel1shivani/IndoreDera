/*
 * Backend API ka shape.
 *
 * Ye types website ke types se match karte hain. Dono apps alag hain, isliye
 * ye jaan-boojh kar duplicate hain — API contract hi beech ka rishta hai.
 *
 * Password hash yahan nahi hai kyunki server use kabhi bhejta hi nahi
 * (user.model.js ka toJSON use hata deta hai).
 *
 * TODO: aage chal kar inhe backend ke zod schemas se generate karein
 * (OpenAPI ya zod-to-ts), warna dono taraf dheere-dheere drift ho jaayega.
 */

export type Role = "tenant" | "owner" | "admin";
export type Audience = "guest" | "user" | "owner";
export type PropertyType = "flat" | "room" | "shop" | "pg" | "land";
export type ListingStatus = "draft" | "pending" | "approved";

export interface UserPlan {
  id: string;
  label: string;
  credits: number | null;
  expiresAt: number | null;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: Role;
  plan: UserPlan | null;
}

export interface Property {
  id: string;
  title: string;
  titleHi: string;
  type: PropertyType;
  locality: string;
  rent: number;
  deposit: number;
  area: string;
  bhk?: string;
  furnishing: "Furnished" | "Semi-Furnished" | "Unfurnished";
  preferred: string;
  image: string;
  featured?: boolean;
  amenities: string[];
  description: string;
  ownerName: string;
  postedAgo: string;
  road?: string;
  tags?: string[];
  ownerId?: string;
  ownerPhone?: string;
  status?: ListingStatus;
  createdAt?: number;
}

export interface HeroContent {
  logoText: string;
  logoTagline: string;
  badge: string;
  titleStart: string;
  titleHighlight: string;
  titleEnd: string;
  subtitle: string;
  searchCta: string;
  ownerCta: string;
  lockedTitle: string;
  lockedSubtitle: string;
}

/* --------------------------------------------------- baaki pages ka text */

/*
 * About/Contact/Home/Legal ka text.
 *
 * Ye sab pehle website ke code me hard-coded tha. Ab backend ke SiteContent
 * singleton me rehta hai, isliye admin panel se badla ja sakta hai —
 * shape backend ke site-content.model.js se match karna zaroori hai.
 */

/** Icon + title + description — steps, values aur why-points sab isi shape me. */
export interface Blurb {
  icon: string;
  t: string;
  d: string;
}

export interface Faq {
  q: string;
  a: string;
}

/** Legal page ka ek numbered clause — paragraph aur/ya bullet list. */
export interface LegalClause {
  title: string;
  body: string;
  items: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: LegalClause[];
}

export type LegalPageKey = "privacy" | "terms";

export interface ContactContent {
  heading: string;
  subheading: string;
  address: string;
  phone: string;
  email: string;
  timings: string;
  sentTitle: string;
  sentText: string;
  footerTagline: string;
}

export interface AboutContent {
  badge: string;
  title: string;
  intro: string;
  bullets: string[];
  meaningTitle: string;
  meaningBody: string;
  weAreTitle: string;
  weAre: string[];
  weAreNotTitle: string;
  weAreNot: string[];
  howTitle: string;
  howSubtitle: string;
  tenantTitle: string;
  tenantSteps: Blurb[];
  ownerTitle: string;
  ownerSteps: Blurb[];
  typesTitle: string;
  localitiesSubtitle: string;
  valuesTitle: string;
  values: Blurb[];
  ctaTitle: string;
  ctaText: string;
  helpTitle: string;
  helpText: string;
}

export interface HomeContent {
  whyTitle: string;
  whySubtitle: string;
  whyPoints: Blurb[];
  stepsTitle: string;
  stepsSubtitle: string;
  steps: Blurb[];
  faqTitle: string;
  faqSubtitle: string;
  faqs: Faq[];
}

export type LegalContent = Record<LegalPageKey, LegalDoc>;

/**
 * Icon ke naam jo backend maanta hai (CONTENT_ICONS). Website inhe apne
 * react-icons components par map karti hai — yahan sirf dropdown ke liye.
 */
export const contentIcons = [
  "tag",
  "globe",
  "location",
  "shield",
  "verified",
  "zap",
  "comment",
  "search",
  "personAdd",
  "home",
  "rocket",
  "clock",
  "mail",
  "phone",
  "star",
  "check",
  "creditCard",
  "people",
  "info",
] as const;

export interface Banner {
  id: string;
  audience: Audience;
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  active: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  locality: string;
  rating: number;
  message: string;
  status: "pending" | "approved";
  createdAt: number;
}

export interface Plan {
  id: string;
  label: string;
  price: number;
  period: string;
  credits: number | null;
  durationDays: number | null;
  perks: string[];
  highlight?: boolean;
}

export interface SiteData {
  hero: HeroContent;
  contact: ContactContent;
  about: AboutContent;
  home: HomeContent;
  legal: LegalContent;
  banners: Banner[];
  testimonials: Testimonial[];
  listings: Property[];
  plans: Plan[];
}

export interface ServerState {
  siteData: SiteData | null;
  users: User[];
  updatedAt: number;
}

export const propertyTypeLabels: Record<PropertyType, string> = {
  flat: "Flat",
  room: "Room",
  shop: "Shop",
  pg: "PG / Hostel",
  land: "Land",
};

export const localities = [
  "Vijay Nagar",
  "Palasia",
  "Rau",
  "Bhawarkuan",
  "Sudama Nagar",
  "Nipania",
  "Scheme No. 78",
  "Rajwada",
  "Annapurna",
  "Mhow Naka",
];

export const formatRent = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/**
 * Plan abhi chal raha hai ya nahi. Ye logic website ke `isPlanActive` se
 * bilkul same hai — dono jagah alag hua to admin galat status dikhayega.
 */
export function isPlanActive(plan: UserPlan | null | undefined): plan is UserPlan {
  if (!plan) return false;
  if (plan.expiresAt !== null && plan.expiresAt < Date.now()) return false;
  return plan.credits === null || plan.credits > 0;
}

export type PlanState = "none" | "active" | "expired" | "used-up";

/** Plan kis haal me hai — expired aur credits-khatam alag alag dikhate hain. */
export function planState(plan: UserPlan | null | undefined): PlanState {
  if (!plan) return "none";
  if (plan.expiresAt !== null && plan.expiresAt < Date.now()) return "expired";
  if (plan.credits !== null && plan.credits <= 0) return "used-up";
  return "active";
}

export const planStateLabels: Record<PlanState, string> = {
  none: "Free user",
  active: "Active",
  expired: "Expire ho gaya",
  "used-up": "Credits khatam",
};

/** Plan kitne din me expire hoga. null = expiry hai hi nahi. */
export function daysLeft(plan: UserPlan): number | null {
  if (plan.expiresAt === null) return null;
  return Math.ceil((plan.expiresAt - Date.now()) / 86_400_000);
}

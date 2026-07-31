import type { Banner, HeroContent, Plan, Property, Testimonial, User } from "./types";

/*
 * Backend API ka client.
 *
 * Admin app ka saara data isi se aata-jaata hai — koi localStorage nahi, koi
 * apna cache nahi. Har admin action ek REST call hai jise server authorize
 * karta hai (JWT + role check), isliye panel kholne bhar se kuch nahi hota.
 */

export const API_BASE =
 Backend nahi chal raha
const TOKEN_KEY = "indoredera-admin:token";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/* ------------------------------------------------------------------ token */

export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

/* ---------------------------------------------------------------- request */

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = getToken();

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: init.method ?? "GET",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError(
      0,
      `Data server (${API_BASE}) se connect nahi ho paaya. ` +
        `indoredera-api folder me "npm run dev" chala hai kya?`,
    );
  }

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    /* khaali ya non-JSON body */
  }

  if (!res.ok) {
    const message =
      (payload as { error?: { message?: string } })?.error?.message ??
      `Server ne ${res.status} ${res.statusText} bheja`;
    // token expire/invalid — rakhna bekaar hai, agli request bhi 401 hi degi
    if (res.status === 401) setToken(null);
    throw new ApiError(res.status, message);
  }

  return payload as T;
}

/* -------------------------------------------------------------------- api */

export interface SiteContent {
  hero: HeroContent;
  banners: Banner[];
  testimonials: Testimonial[];
  listings: Property[];
  plans: Plan[];
  updatedAt: number;
}

export const api = {
  health: () => request<{ ok: boolean }>("/health"),

  login: (identifier: string, password: string) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: { identifier, password },
    }),

  me: () => request<{ user: User }>("/api/auth/me"),

  logout: () => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),

  /** Admin token ke saath ye sab kuch deta hai — pending listings/feedback samet. */
  content: () => request<SiteContent>("/api/content"),

  users: () => request<{ items: User[] }>("/api/users"),

  patchHero: (patch: Partial<HeroContent>) =>
    request<{ hero: HeroContent }>("/api/content/hero", { method: "PATCH", body: patch }),

  saveBanner: (banner: Banner) =>
    request<{ banner: Banner }>(`/api/banners/${banner.id}`, { method: "PUT", body: banner }),

  deleteBanner: (id: string) => request<{ ok: boolean }>(`/api/banners/${id}`, { method: "DELETE" }),

  setTestimonialStatus: (id: string, status: Testimonial["status"]) =>
    request<{ testimonial: Testimonial }>(`/api/testimonials/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),

  deleteTestimonial: (id: string) =>
    request<{ ok: boolean }>(`/api/testimonials/${id}`, { method: "DELETE" }),

  setListingStatus: (id: string, status: NonNullable<Property["status"]>) =>
    request<{ property: Property }>(`/api/properties/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),

  setListingFeatured: (id: string, featured: boolean) =>
    request<{ property: Property }>(`/api/properties/${id}/featured`, {
      method: "PATCH",
      body: { featured },
    }),

  deleteListing: (id: string) =>
    request<{ ok: boolean }>(`/api/properties/${id}`, { method: "DELETE" }),

  savePlan: (plan: Plan) =>
    request<{ plan: Plan }>(`/api/plans/${plan.id}`, { method: "PUT", body: plan }),

  setUserRole: (id: string, role: User["role"]) =>
    request<{ user: User }>(`/api/users/${id}/role`, { method: "PATCH", body: { role } }),

  setUserPlan: (id: string, planId: string | null) =>
    request<{ user: User }>(`/api/users/${id}/plan`, { method: "PATCH", body: { planId } }),

  deleteUser: (id: string) =>
    request<{ ok: boolean; deletedListings: number }>(`/api/users/${id}`, { method: "DELETE" }),
};

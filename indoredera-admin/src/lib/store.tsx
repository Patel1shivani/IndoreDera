import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError } from "./api";
import type { Banner, Plan, Property, SiteData, Testimonial, User } from "./types";

/**
 * Poora admin data ek jagah. Server hi single source of truth hai —
 * yahan koi localStorage nahi, taaki website aur admin kabhi alag na hon.
 *
 * Har mutation pehle local state badalti hai (UI turant respond kare), phir
 * server par bhej deti hai.
 */

const POLL_INTERVAL_MS = 5000;

type StoreValue = {
  siteData: SiteData | null;
  users: User[];
  loading: boolean;
  error: string | null;
  /** Server par data hi nahi hai — website ek baar khulni chahiye. */
  empty: boolean;
  refresh: () => Promise<void>;

  updateHero: (patch: Partial<SiteData["hero"]>) => void;
  saveBanner: (banner: Banner) => void;
  removeBanner: (id: string) => void;
  setTestimonialStatus: (id: string, status: Testimonial["status"]) => void;
  removeTestimonial: (id: string) => void;
  setListingStatus: (id: string, status: NonNullable<Property["status"]>) => void;
  removeListing: (id: string) => void;
  savePlan: (plan: Plan) => void;

  setUserRole: (userId: string, role: User["role"]) => void;
  removeUser: (userId: string) => void;
  /** Admin manually plan de sakta hai ya hata sakta hai (planId = null → hataayein). */
  setUserPlan: (userId: string, planId: string | null) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Apni hi likhi hui state polling se wapas na aa jaaye, iske liye last push
     ka time yaad rakhte hain. */
  const lastWriteRef = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const state = await api.getState();
      setError(null);
      // 2 sec ke andar humne khud likha ho to server ka jawab ignore karein
      if (Date.now() - lastWriteRef.current < 2000) return;
      setSiteData(state.siteData);
      setUsers(state.users ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Data load nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  /** Local state turant badlo, server ko background me bhejo. */
  const commitUsers = useCallback((next: User[]) => {
    lastWriteRef.current = Date.now();
    setUsers(next);
    api.putUsers(next).catch((err: unknown) => {
      setError(err instanceof ApiError ? err.message : "Save nahi ho paaya.");
    });
  }, []);

  const patch = useCallback((fn: (d: SiteData) => SiteData) => {
    setSiteData((current) => {
      if (!current) return current;
      const next = fn(current);
      lastWriteRef.current = Date.now();
      api.putSiteData(next).catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Save nahi ho paaya.");
      });
      return next;
    });
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      siteData,
      users,
      loading,
      error,
      empty: !loading && siteData === null,
      refresh,

      updateHero: (heroPatch) => patch((d) => ({ ...d, hero: { ...d.hero, ...heroPatch } })),

      saveBanner: (banner) =>
        patch((d) => ({
          ...d,
          banners: d.banners.some((b) => b.id === banner.id)
            ? d.banners.map((b) => (b.id === banner.id ? banner : b))
            : [...d.banners, banner],
        })),

      removeBanner: (id) => patch((d) => ({ ...d, banners: d.banners.filter((b) => b.id !== id) })),

      setTestimonialStatus: (id, status) =>
        patch((d) => ({
          ...d,
          testimonials: d.testimonials.map((t) => (t.id === id ? { ...t, status } : t)),
        })),

      removeTestimonial: (id) =>
        patch((d) => ({ ...d, testimonials: d.testimonials.filter((t) => t.id !== id) })),

      setListingStatus: (id, status) =>
        patch((d) => ({
          ...d,
          listings: d.listings.map((p) => (p.id === id ? { ...p, status } : p)),
        })),

      removeListing: (id) =>
        patch((d) => ({ ...d, listings: d.listings.filter((p) => p.id !== id) })),

      savePlan: (plan) =>
        patch((d) => ({ ...d, plans: d.plans.map((p) => (p.id === plan.id ? plan : p)) })),

      setUserRole: (userId, role) =>
        commitUsers(users.map((u) => (u.id === userId ? { ...u, role } : u))),

      removeUser: (userId) => commitUsers(users.filter((u) => u.id !== userId)),

      /* Plan wahi shape me banate hain jo website purchase par banati hai —
         warna dono jagah plan alag dikhega. */
      setUserPlan: (userId, planId) => {
        const plan = planId ? siteData?.plans.find((p) => p.id === planId) : null;
        if (planId && !plan) return;
        commitUsers(
          users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  plan: plan
                    ? {
                        id: plan.id,
                        label: plan.label,
                        credits: plan.credits,
                        expiresAt: plan.durationDays
                          ? Date.now() + plan.durationDays * 86_400_000
                          : null,
                      }
                    : null,
                }
              : u,
          ),
        );
      },
    }),
    [siteData, users, loading, error, refresh, patch, commitUsers],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore ko <StoreProvider> ke andar hi use karein");
  return ctx;
}

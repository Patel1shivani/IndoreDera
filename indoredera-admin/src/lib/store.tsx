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

/*
 * Poora admin data ek jagah. Server hi single source of truth hai — yahan koi
 * localStorage nahi, taaki website aur admin kabhi alag na hon.
 *
 * Pehle har change poora site-data blob overwrite kar deta tha ("last write
 * wins"), isliye do admin ek saath kaam karte to ek ka change gayab ho jaata.
 * Ab har action apne resource par jaata hai (PATCH /api/properties/:id/status
 * waghairah), to sirf wahi cheez badalti hai jo badalni thi.
 *
 * Pattern har mutation me same hai: local state turant badlo (UI atke nahi),
 * server call karo, fail hone par purani state wapas laa kar error dikhao.
 */

const POLL_INTERVAL_MS = 5000;

type StoreValue = {
  siteData: SiteData | null;
  users: User[];
  loading: boolean;
  error: string | null;
  /** Server par data hi nahi hai — seed chalana padega. */
  empty: boolean;
  refresh: () => Promise<void>;

  updateHero: (patch: Partial<SiteData["hero"]>) => void;
  saveBanner: (banner: Banner) => void;
  removeBanner: (id: string) => void;
  setTestimonialStatus: (id: string, status: Testimonial["status"]) => void;
  removeTestimonial: (id: string) => void;
  setListingStatus: (id: string, status: NonNullable<Property["status"]>) => void;
  setListingFeatured: (id: string, featured: boolean) => void;
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

  /* Abhi-abhi ki gayi apni hi change polling se purani state me na badal jaaye,
     iske liye last write ka time yaad rakhte hain. */
  const lastWriteRef = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const [content, userList] = await Promise.all([api.content(), api.users()]);
      setError(null);
      // 2 sec ke andar humne khud likha ho to server ka jawab ignore karein
      if (Date.now() - lastWriteRef.current < 2000) return;
      setSiteData({
        hero: content.hero,
        banners: content.banners,
        testimonials: content.testimonials,
        listings: content.listings,
        plans: content.plans,
      });
      setUsers(userList.items);
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

  /**
   * Optimistic mutation.
   *
   * Local state turant badalta hai, phir server call jaati hai. Fail hone par
   * purani state wapas aa jaati hai — warna admin ko lagta rehta ki change save
   * ho gaya jabki server ne mana kar diya tha.
   */
  const mutate = useCallback(
    <T,>(apply: () => void, revert: () => void, call: () => Promise<T>, fallback: string) => {
      lastWriteRef.current = Date.now();
      apply();
      call()
        .then(() => setError(null))
        .catch((err: unknown) => {
          revert();
          setError(err instanceof ApiError ? err.message : fallback);
        });
    },
    [],
  );

  /** SiteData ka ek hissa badalne ka shortcut (revert ke saath). */
  const patchSite = useCallback(
    <T,>(apply: (d: SiteData) => SiteData, call: () => Promise<T>, fallback: string) => {
      let previous: SiteData | null = null;
      mutate(
        () =>
          setSiteData((current) => {
            if (!current) return current;
            previous = current;
            return apply(current);
          }),
        () => previous && setSiteData(previous),
        call,
        fallback,
      );
    },
    [mutate],
  );

  const patchUsers = useCallback(
    <T,>(apply: (list: User[]) => User[], call: () => Promise<T>, fallback: string) => {
      let previous: User[] = [];
      mutate(
        () =>
          setUsers((current) => {
            previous = current;
            return apply(current);
          }),
        () => setUsers(previous),
        call,
        fallback,
      );
    },
    [mutate],
  );

  const value = useMemo<StoreValue>(
    () => ({
      siteData,
      users,
      loading,
      error,
      empty: !loading && siteData === null,
      refresh,

      updateHero: (heroPatch) =>
        patchSite(
          (d) => ({ ...d, hero: { ...d.hero, ...heroPatch } }),
          () => api.patchHero(heroPatch),
          "Hero text save nahi hua.",
        ),

      saveBanner: (banner) =>
        patchSite(
          (d) => ({
            ...d,
            banners: d.banners.some((b) => b.id === banner.id)
              ? d.banners.map((b) => (b.id === banner.id ? banner : b))
              : [...d.banners, banner],
          }),
          () => api.saveBanner(banner),
          "Banner save nahi hua.",
        ),

      removeBanner: (id) =>
        patchSite(
          (d) => ({ ...d, banners: d.banners.filter((b) => b.id !== id) }),
          () => api.deleteBanner(id),
          "Banner hat nahi paaya.",
        ),

      setTestimonialStatus: (id, status) =>
        patchSite(
          (d) => ({
            ...d,
            testimonials: d.testimonials.map((t) => (t.id === id ? { ...t, status } : t)),
          }),
          () => api.setTestimonialStatus(id, status),
          "Feedback ka status badal nahi paaya.",
        ),

      removeTestimonial: (id) =>
        patchSite(
          (d) => ({ ...d, testimonials: d.testimonials.filter((t) => t.id !== id) }),
          () => api.deleteTestimonial(id),
          "Feedback hat nahi paaya.",
        ),

      setListingStatus: (id, status) =>
        patchSite(
          (d) => ({ ...d, listings: d.listings.map((p) => (p.id === id ? { ...p, status } : p)) }),
          () => api.setListingStatus(id, status),
          "Listing ka status badal nahi paaya.",
        ),

      setListingFeatured: (id, featured) =>
        patchSite(
          (d) => ({ ...d, listings: d.listings.map((p) => (p.id === id ? { ...p, featured } : p)) }),
          () => api.setListingFeatured(id, featured),
          "Featured tag badal nahi paaya.",
        ),

      removeListing: (id) =>
        patchSite(
          (d) => ({ ...d, listings: d.listings.filter((p) => p.id !== id) }),
          () => api.deleteListing(id),
          "Listing hat nahi paayi.",
        ),

      savePlan: (plan) =>
        patchSite(
          (d) => ({ ...d, plans: d.plans.map((p) => (p.id === plan.id ? plan : p)) }),
          () => api.savePlan(plan),
          "Plan save nahi hua.",
        ),

      setUserRole: (userId, role) =>
        patchUsers(
          (list) => list.map((u) => (u.id === userId ? { ...u, role } : u)),
          () => api.setUserRole(userId, role),
          "Role badal nahi paaya.",
        ),

      removeUser: (userId) =>
        patchUsers(
          (list) => list.filter((u) => u.id !== userId),
          () => api.deleteUser(userId),
          "User delete nahi ho paaya.",
        ),

      /* Plan ka snapshot server banata hai (wahi expiry calculate karta hai).
         Yahan sirf optimistic preview dikhate hain; server ka jawab agle
         refresh me aa jaata hai. */
      setUserPlan: (userId, planId) => {
        const plan = planId ? siteData?.plans.find((p) => p.id === planId) : null;
        if (planId && !plan) return;
        patchUsers(
          (list) =>
            list.map((u) =>
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
          () => api.setUserPlan(userId, planId),
          "Plan set nahi ho paaya.",
        );
      },
    }),
    [siteData, users, loading, error, refresh, patchSite, patchUsers],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore ko <StoreProvider> ke andar hi use karein");
  return ctx;
}

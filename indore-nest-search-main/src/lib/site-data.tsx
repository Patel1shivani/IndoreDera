import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { properties as seedProperties, type Property } from "./properties";
import { fetchRemoteState, pushSiteData } from "./remote-store";

/*
 * Saara editable site content ek jagah — hero text, logo text, banners,
 * testimonials, listings aur plans. Admin panel isi ko mutate karta hai.
 *
 * TODO(backend): defaults ko GET /api/content se load karein aur har mutation ko
 * PATCH /api/admin/* se. Keys jaan-boojh kar backend schema jaisi rakhi hain.
 */

const STORAGE_KEY = "indoredera:site-data";

export type Audience = "guest" | "user" | "owner";

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
  /** Logged-out visitors ko dikhne wala gate. */
  lockedTitle: string;
  lockedSubtitle: string;
}

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
  /** null = unlimited listings */
  credits: number | null;
  /** null = expire nahi hota */
  durationDays: number | null;
  perks: string[];
  highlight?: boolean;
}

export interface SiteData {
  hero: HeroContent;
  banners: Banner[];
  testimonials: Testimonial[];
  listings: Property[];
  plans: Plan[];
}

const defaultHero: HeroContent = {
  logoText: "Indore Dera",
  logoTagline: "अपना घर, अपना शहर",
  badge: "Indore ka apna rental platform",
  titleStart: "Indore me",
  titleHighlight: "kiraye ka ghar",
  titleEnd: "dhundhna ab aasaan",
  subtitle:
    "Flat, room, dukaan, PG ya zameen — sab kuch ek jagah. Bina broker ke, seedha owner se baat karein.",
  searchCta: "Search ",
  ownerCta: "Owner hoon — property list karni hai",
  lockedTitle: "Properties dekhne ke liye login zaroori hai",
  lockedSubtitle:
    "Free account banayein aur Indore ki saari verified listings, rent, photos aur owner ka number turant dekhein.",
};

const defaultBanners: Banner[] = [
  {
    id: "b-guest-1",
    audience: "guest",
    title: "Zero brokerage, 100% Indore",
    subtitle: "Account banayein aur 500+ verified listings unlock karein.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=70",
    ctaLabel: "Free account banayein",
    active: true,
  },
  {
    id: "b-user-1",
    audience: "user",
    title: "Naye flats roz add ho rahe hain",
    subtitle: "Vijay Nagar, Nipania aur Super Corridor me fresh listings dekhein.",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=70",
    ctaLabel: "Browse karein",
    active: true,
  },
  {
    id: "b-user-2",
    audience: "user",
    title: "PG dhoondh rahe hain?",
    subtitle: "Bhawarkuan aur Annapurna ke student-friendly PG, meals ke saath.",
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1400&q=70",
    ctaLabel: "PG dekhein",
    active: true,
  },
  {
    id: "b-owner-1",
    audience: "owner",
    title: "Pehli listing bilkul free",
    subtitle: "Apni property post karein — hazaaron Indore tenants tak pahunchein.",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=70",
    ctaLabel: "Property list karein",
    active: true,
  },
];

const defaultTestimonials: Testimonial[] = [
  {
    id: "t-1",
    name: "Pooja Sharma",
    locality: "Vijay Nagar",
    rating: 5,
    message:
      "Do din me 2 BHK mil gaya, wo bhi bina kisi broker ke. Owner se seedha baat hui aur rent bhi kam mila.",
    status: "approved",
    createdAt: 0,
  },
  {
    id: "t-2",
    name: "Imran Khan",
    locality: "Rajwada",
    rating: 4,
    message: "Apni dukaan yahan list ki thi, ek hafte me kirayedaar mil gaya. Listing free thi.",
    status: "approved",
    createdAt: 0,
  },
  {
    id: "t-3",
    name: "Anjali Verma",
    locality: "Bhawarkuan",
    rating: 5,
    message: "Girls PG dhoondhna Indore me mushkil tha. Yahan photos aur meals ki detail mil gayi.",
    status: "approved",
    createdAt: 0,
  },
];

const defaultPlans: Plan[] = [
  {
    id: "one-time",
    label: "One-time listing",
    price: 99,
    period: "ek listing",
    credits: 1,
    durationDays: null,
    perks: ["Ek extra property post karein", "30 din tak live", "Owner ka number visible"],
  },
  {
    id: "monthly",
    label: "Monthly",
    price: 299,
    period: "/ month",
    credits: null,
    durationDays: 30,
    perks: ["Unlimited listings", "Featured tag", "Priority support"],
    highlight: true,
  },
  {
    id: "yearly",
    label: "Yearly",
    price: 1999,
    period: "/ year",
    credits: null,
    durationDays: 365,
    perks: ["Unlimited listings", "Featured tag", "2 mahine free", "Priority support"],
  },
];

const defaultSiteData: SiteData = {
  hero: defaultHero,
  banners: defaultBanners,
  testimonials: defaultTestimonials,
  listings: seedProperties.map((p) => ({ ...p, status: "approved" as const })),
  plans: defaultPlans,
};

type SiteDataContextValue = {
  data: SiteData;
  /** localStorage merge hone ke baad true. */
  ready: boolean;
  updateHero: (patch: Partial<HeroContent>) => void;
  saveBanner: (banner: Banner) => void;
  removeBanner: (id: string) => void;
  addTestimonial: (input: Omit<Testimonial, "id" | "status" | "createdAt">) => void;
  setTestimonialStatus: (id: string, status: Testimonial["status"]) => void;
  removeTestimonial: (id: string) => void;
  savePlan: (plan: Plan) => void;
  saveListing: (listing: Property) => void;
  setListingStatus: (id: string, status: NonNullable<Property["status"]>) => void;
  removeListing: (id: string) => void;
  resetAll: () => void;
};

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  // SSR aur pehle client render par defaults — warna hydration mismatch hota hai
  const [data, setData] = useState<SiteData>(defaultSiteData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // pehle shared data server (admin panel bhi wahi use karta hai),
      // wo na mile to localStorage, warna defaults
      const remote = await fetchRemoteState<Partial<SiteData>, unknown>();
      if (cancelled) return;

      const saved =
        remote?.siteData ??
        (() => {
          try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            return raw ? (JSON.parse(raw) as Partial<SiteData>) : null;
          } catch {
            return null; // corrupt payload — defaults hi rehne do
          }
        })();

      if (saved) {
        setData({
          hero: { ...defaultHero, ...saved.hero },
          banners: saved.banners ?? defaultBanners,
          testimonials: saved.testimonials ?? defaultTestimonials,
          listings: saved.listings ?? defaultSiteData.listings,
          plans: saved.plans ?? defaultPlans,
        });
      }
      setReady(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ready hone ke baad hi likhein, warna mount par defaults save ho jaate hain
  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    void pushSiteData(data);
  }, [data, ready]);

  const updateHero = useCallback((patch: Partial<HeroContent>) => {
    setData((d) => ({ ...d, hero: { ...d.hero, ...patch } }));
  }, []);

  const saveBanner = useCallback((banner: Banner) => {
    setData((d) => {
      const exists = d.banners.some((b) => b.id === banner.id);
      return {
        ...d,
        banners: exists
          ? d.banners.map((b) => (b.id === banner.id ? banner : b))
          : [...d.banners, banner],
      };
    });
  }, []);

  const removeBanner = useCallback((id: string) => {
    setData((d) => ({ ...d, banners: d.banners.filter((b) => b.id !== id) }));
  }, []);

  const addTestimonial = useCallback<SiteDataContextValue["addTestimonial"]>((input) => {
    setData((d) => ({
      ...d,
      testimonials: [
        // naya feedback pending rehta hai jab tak admin approve na kare
        { ...input, id: crypto.randomUUID(), status: "pending", createdAt: Date.now() },
        ...d.testimonials,
      ],
    }));
  }, []);

  const setTestimonialStatus = useCallback<SiteDataContextValue["setTestimonialStatus"]>(
    (id, status) => {
      setData((d) => ({
        ...d,
        testimonials: d.testimonials.map((t) => (t.id === id ? { ...t, status } : t)),
      }));
    },
    [],
  );

  const removeTestimonial = useCallback((id: string) => {
    setData((d) => ({ ...d, testimonials: d.testimonials.filter((t) => t.id !== id) }));
  }, []);

  const savePlan = useCallback((plan: Plan) => {
    setData((d) => ({ ...d, plans: d.plans.map((p) => (p.id === plan.id ? plan : p)) }));
  }, []);

  const saveListing = useCallback((listing: Property) => {
    setData((d) => {
      const exists = d.listings.some((p) => p.id === listing.id);
      return {
        ...d,
        listings: exists
          ? d.listings.map((p) => (p.id === listing.id ? listing : p))
          : [listing, ...d.listings],
      };
    });
  }, []);

  const setListingStatus = useCallback<SiteDataContextValue["setListingStatus"]>((id, status) => {
    setData((d) => ({
      ...d,
      listings: d.listings.map((p) => (p.id === id ? { ...p, status } : p)),
    }));
  }, []);

  const removeListing = useCallback((id: string) => {
    setData((d) => ({ ...d, listings: d.listings.filter((p) => p.id !== id) }));
  }, []);

  const resetAll = useCallback(() => setData(defaultSiteData), []);

  const value = useMemo<SiteDataContextValue>(
    () => ({
      data,
      ready,
      updateHero,
      saveBanner,
      removeBanner,
      addTestimonial,
      setTestimonialStatus,
      removeTestimonial,
      savePlan,
      saveListing,
      setListingStatus,
      removeListing,
      resetAll,
    }),
    [
      data,
      ready,
      updateHero,
      saveBanner,
      removeBanner,
      addTestimonial,
      setTestimonialStatus,
      removeTestimonial,
      savePlan,
      saveListing,
      setListingStatus,
      removeListing,
      resetAll,
    ],
  );

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error("useSiteData ko <SiteDataProvider> ke andar hi use karein");
  return ctx;
}

/** Sirf wahi listings jo public par dikhni chahiye. */
export function publicListings(listings: Property[]) {
  return listings.filter((p) => p.status !== "draft" && p.status !== "pending");
}

export function bannersFor(banners: Banner[], audience: Audience) {
  return banners.filter((b) => b.active && b.audience === audience);
}

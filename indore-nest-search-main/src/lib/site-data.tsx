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
import { api, API_BASE, ApiError, onTokenChange } from "./api-client";
import type { Property } from "./properties";

/*
 * Saara editable site content ek jagah — hero text, banners, testimonials,
 * listings aur plans. Sab kuch backend se aata hai (GET /api/content) aur har
 * mutation apne resource endpoint par jaati hai.
 *
 * Pehle ye poora blob localStorage me rehta tha aur server par push hota tha.
 * Ab database hi source of truth hai: browser sirf ek cache hai jise hum reload
 * ya refresh() par bhar dete hain.
 */

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

/* ---------------------------------------------------- baaki pages ka text */

/*
 * About, Contact, Home ke sections aur legal pages ka text.
 *
 * Ye sab pehle in files me hard-coded tha, isliye ek shabd badalne ke liye
 * bhi deploy karna padta tha. Ab backend se aata hai aur admin panel se badla
 * ja sakta hai — shape backend ke site-content.model.js se match karta hai.
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

export interface LegalContent {
  privacy: LegalDoc;
  terms: LegalDoc;
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
  contact: ContactContent;
  about: AboutContent;
  home: HomeContent;
  legal: LegalContent;
  banners: Banner[];
  testimonials: Testimonial[];
  listings: Property[];
  plans: Plan[];
}

/*
 * SSR aur pehle client render ke liye khaali shell — server se data aane tak
 * yahi rehta hai. Text defaults ab database me hain (indoredera-api ka seed),
 * isliye yahan sirf itna rakha hai ki layout na toote.
 */
const emptyHero: HeroContent = {
  logoText: "Indore Dera",
  logoTagline: "अपना घर, अपना शहर",
  badge: "",
  titleStart: "",
  titleHighlight: "",
  titleEnd: "",
  subtitle: "",
  searchCta: "Search",
  ownerCta: "",
  lockedTitle: "",
  lockedSubtitle: "",
};

const emptyContact: ContactContent = {
  heading: "",
  subheading: "",
  address: "",
  phone: "",
  email: "",
  timings: "",
  sentTitle: "",
  sentText: "",
  footerTagline: "",
};

const emptyAbout: AboutContent = {
  badge: "",
  title: "",
  intro: "",
  bullets: [],
  meaningTitle: "",
  meaningBody: "",
  weAreTitle: "",
  weAre: [],
  weAreNotTitle: "",
  weAreNot: [],
  howTitle: "",
  howSubtitle: "",
  tenantTitle: "",
  tenantSteps: [],
  ownerTitle: "",
  ownerSteps: [],
  typesTitle: "",
  localitiesSubtitle: "",
  valuesTitle: "",
  values: [],
  ctaTitle: "",
  ctaText: "",
  helpTitle: "",
  helpText: "",
};

const emptyHome: HomeContent = {
  whyTitle: "",
  whySubtitle: "",
  whyPoints: [],
  stepsTitle: "",
  stepsSubtitle: "",
  steps: [],
  faqTitle: "",
  faqSubtitle: "",
  faqs: [],
};

const emptyLegalDoc: LegalDoc = { title: "", updated: "", intro: "", sections: [] };

const emptySiteData: SiteData = {
  hero: emptyHero,
  contact: emptyContact,
  about: emptyAbout,
  home: emptyHome,
  legal: { privacy: emptyLegalDoc, terms: emptyLegalDoc },
  banners: [],
  testimonials: [],
  listings: [],
  plans: [],
};

type ContentResponse = SiteData & { updatedAt: number };

/**
 * Server ka jawab → SiteData.
 *
 * Har section me spread isliye hai ki purana backend (jisme koi naya field
 * abhi aaya hi nahi) bhejta hai to bhi UI undefined par na toote.
 */
function mergeContent(content?: Partial<ContentResponse> | null): SiteData {
  if (!content) return emptySiteData;
  return {
    hero: { ...emptyHero, ...content.hero },
    contact: { ...emptyContact, ...content.contact },
    about: { ...emptyAbout, ...content.about },
    home: { ...emptyHome, ...content.home },
    legal: {
      privacy: { ...emptyLegalDoc, ...content.legal?.privacy },
      terms: { ...emptyLegalDoc, ...content.legal?.terms },
    },
    banners: content.banners ?? [],
    testimonials: content.testimonials ?? [],
    listings: content.listings ?? [],
    plans: content.plans ?? [],
  };
}

/**
 * Server par (SSR ke waqt) site content laata hai.
 *
 * Root route ka loader ise chalata hai taaki About/Privacy/Terms ka text pehle
 * HTML me hi aa jaaye — warna wo pages crawler ko khaali dikhte. Yahan
 * api-client use nahi karte kyunki wo localStorage se token padhta hai, jo
 * server par hota hi nahi. Fail hone par null — page phir bhi khulta hai aur
 * client mount hote hi dobara maang leta hai.
 */
export async function fetchSiteContent(): Promise<ContentResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/content`);
    if (!res.ok) return null;
    return (await res.json()) as ContentResponse;
  } catch {
    return null;
  }
}

type SiteDataContextValue = {
  data: SiteData;
  /** Server se pehla jawab aane ke baad true. */
  ready: boolean;
  /** Server tak pahunch nahi paaye to yahan message aata hai. */
  error: string | null;
  /** Server se sab kuch dobara load karta hai. */
  refresh: () => Promise<void>;
  /** Nayi listing banata hai — id, owner aur status server decide karta hai. */
  saveListing: (listing: NewListing) => Promise<Property>;
  /** Owner ya admin apni listing hata sakta hai. */
  removeListing: (id: string) => Promise<void>;
  /** Feedback bhejta hai — server par hamesha "pending" me jaata hai. */
  addTestimonial: (input: Omit<Testimonial, "id" | "status" | "createdAt">) => Promise<void>;
};

/** Listing banate waqt client jo bhej sakta hai (baaki server bharta hai). */
export type NewListing = Omit<
  Property,
  "id" | "ownerId" | "ownerName" | "ownerPhone" | "postedAgo" | "createdAt" | "featured"
> & { status: "draft" | "pending" };

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export function SiteDataProvider({
  children,
  initial,
}: {
  children: ReactNode;
  /** SSR loader ka data — pehla render isi se hota hai. */
  initial?: ContentResponse | null;
}) {
  const [data, setData] = useState<SiteData>(() => mergeContent(initial));
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // StrictMode ke double-effect me do parallel loads na chalein
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const content = await api.get<ContentResponse>("/api/content");
      setData(mergeContent(content));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Content load nahi ho paaya.");
    } finally {
      loadingRef.current = false;
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void load();

    /* Login/logout par content badalta hai — owner ko apni draft/pending
       listings dikhti hain, guest ko sirf approved. Isliye token badalte hi
       dobara load karte hain. */
    return onTokenChange(() => void load());
  }, [load]);

  const saveListing = useCallback<SiteDataContextValue["saveListing"]>(
    async (listing) => {
      const { property } = await api.post<{ property: Property }>("/api/properties", listing);
      // apni nayi listing turant dikhe — server ka poora reload na wait karna pade
      setData((d) => ({ ...d, listings: [property, ...d.listings] }));
      return property;
    },
    [],
  );

  const removeListing = useCallback<SiteDataContextValue["removeListing"]>(async (id) => {
    await api.delete(`/api/properties/${id}`);
    setData((d) => ({ ...d, listings: d.listings.filter((p) => p.id !== id) }));
  }, []);

  const addTestimonial = useCallback<SiteDataContextValue["addTestimonial"]>(async (input) => {
    /* Jawab me pending testimonial aata hai par use local list me nahi daalte —
       website sirf approved dikhati hai, aur admin ke approve karne par wo agle
       load par apne aap aa jaayega. */
    await api.post("/api/testimonials", input);
  }, []);

  const value = useMemo<SiteDataContextValue>(
    () => ({ data, ready, error, refresh: load, saveListing, removeListing, addTestimonial }),
    [data, ready, error, load, saveListing, removeListing, addTestimonial],
  );

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error("useSiteData ko <SiteDataProvider> ke andar hi use karein");
  return ctx;
}

/**
 * Sirf wahi listings jo public par dikhni chahiye.
 *
 * Server pehle hi filter karta hai, par owner ko apni draft/pending listings
 * bhi milti hain — home/properties page par wo nahi dikhni chahiye.
 */
export function publicListings(listings: Property[]) {
  return listings.filter((p) => p.status !== "draft" && p.status !== "pending");
}

export function bannersFor(banners: Banner[], audience: Audience) {
  return banners.filter((b) => b.active && b.audience === audience);
}

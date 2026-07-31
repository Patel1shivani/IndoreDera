import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  GoArrowRight,
  GoChevronLeft,
  GoChevronRight,
  GoCreditCard,
  GoDotFill,
  GoHomeFill,
  GoLocation,
  GoPersonAdd,
  GoRocket,
  GoSearch,
  GoShieldCheck,
  GoTag,
} from "react-icons/go";
import { BannerStrip } from "@/components/banner-strip";
import { CountUp } from "@/components/count-up";
import { FancySelect } from "@/components/fancy-select";
import { FaqSection } from "@/components/faq-section";
import { LoginGate } from "@/components/login-gate";
import { PropertyCard } from "@/components/property-card";
import { Reveal } from "@/components/reveal";
import { useInView } from "@/hooks/use-in-view";
import { contentIcon } from "@/lib/content-icons";
import { TestimonialsSection } from "@/components/testimonials-section";
import { useAuth } from "@/lib/auth";
import { localities, propertyTypes } from "@/lib/properties";
import { publicListings, useSiteData } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Indore Dera — Flat, Room, Shop & PG on Rent in Indore" },
      {
        name: "description",
        content:
          "Indore ka hyperlocal rental platform. Vijay Nagar se Rau tak flats, rooms, shops, PG aur land — seedha owner se, zero brokerage.",
      },
      { property: "og:title", content: "Indore Dera — Apna Ghar, Apna Shehar" },
      {
        property: "og:description",
        content: "Indore me kiraye ka ghar, dukaan ya PG dhundhein — seedha owner se baat karein.",
      },
    ],
  }),
  component: Home,
});

const budgetOptions = [
  { value: "5000", label: "Upto ₹5,000" },
  { value: "10000", label: "Upto ₹10,000" },
  { value: "20000", label: "Upto ₹20,000" },
  { value: "50000", label: "Upto ₹50,000" },
];

/* Hero ke neeche chhoti trust patti — teeno cheezein jo log sabse pehle poochhte hain. */
const heroTrust = [
  { icon: GoTag, label: "0% brokerage" },
  { icon: GoShieldCheck, label: "Verified owners" },
  { icon: GoLocation, label: "Sirf Indore" },
];

/* Budget bands wahi hain jo /properties ke filters me hain — link seedha wahin kholta hai. */
const budgetBands = [
  { label: "₹5,000 tak", min: undefined, max: 5000 },
  { label: "₹5k – ₹10k", min: 5000, max: 10000 },
  { label: "₹10k – ₹20k", min: 10000, max: 20000 },
  { label: "₹20k – ₹50k", min: 20000, max: 50000 },
  { label: "₹50,000+", min: 50000, max: undefined },
];

function Home() {
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const { data } = useSiteData();
  const { hero, home } = data;

  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [locality, setLocality] = useState("");
  const [budget, setBudget] = useState("");

  const isLoggedIn = ready && !!user;
  const audience = user?.role === "owner" ? "owner" : user ? "user" : "guest";
  const live = publicListings(data.listings);
  const featured = live.filter((p) => p.featured);

  /* Har locality ke saamne uski live listings ka count — data server se aata hai,
     isliye pehle render par sab 0 hota hai aur baad me bhar jaata hai. */
  const localityCounts = localities.map((name) => ({
    name,
    count: live.filter((p) => p.locality === name).length,
  }));

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/properties",
      search: {
        q: q || undefined,
        type: type || undefined,
        locality: locality || undefined,
        budget: budget ? Number(budget) : undefined,
      },
    });
  };

  return (
    <>
      {/* relative z-20 — warna neeche wale animated cards dropdown ke upar aa jaate hain */}
      <section className="hero-surface relative z-20">
        {/* Sajawat ke rangeen dhabbe. Apne hi wrapper me clip hote hain, warna
            overflow-hidden search ke dropdowns ko bhi kaat deta. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="animate-blob absolute -left-24 top-6 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
          <span className="animate-blob delay-step-3 absolute -right-20 top-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
          <span className="animate-blob delay-step-5 absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-brand-green/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:py-24">
          <span className="badge-green animate-drop-in">{hero.badge}</span>
          <h1 className="animate-rise-in delay-step-1 mx-auto mt-5 max-w-3xl text-4xl leading-tight tracking-wide sm:text-6xl">
            {hero.titleStart} <span className="text-sheen">{hero.titleHighlight}</span>{" "}
            {hero.titleEnd}
          </h1>
          <p className="animate-rise-in delay-step-2 mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {hero.subtitle}
          </p>

          {/* form par relative z-30 — animate-rise-in har block ka apna stacking context banata
              hai, isliye warna neeche wale "Popular" chips dropdown ko dhak lete hain */}
          <form
            onSubmit={onSearch}
            className="animate-rise-in delay-step-3 relative z-30 mx-auto mt-9 grid max-w-4xl gap-3 rounded-3xl border border-border bg-card p-4 shadow-lifted"
          >
            <div className="relative">
              <GoSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                className="field pl-11"
                aria-label="Search"
                placeholder="Kuch bhi likhein — 2 BHK, Vijay Nagar, dukaan, PG, 10000..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <FancySelect
                value={type}
                onChange={setType}
                placeholder="Property type"
                clearLabel="Sabhi types"
                ariaLabel="Property type"
                icon={GoHomeFill}
                options={propertyTypes.map((t) => ({
                  value: t.value,
                  label: t.label,
                  hint: t.labelHi,
                  icon: t.icon,
                }))}
              />
              <FancySelect
                value={locality}
                onChange={setLocality}
                placeholder="Locality (Indore)"
                clearLabel="Poora Indore"
                ariaLabel="Locality"
                icon={GoLocation}
                options={localities.map((l) => ({ value: l, label: l }))}
              />
              <FancySelect
                value={budget}
                onChange={setBudget}
                placeholder="Max budget"
                clearLabel="Koi bhi budget"
                ariaLabel="Budget"
                icon={GoCreditCard}
                options={budgetOptions}
              />
              <button type="submit" className="btn-primary">
                {hero.searchCta}
                <GoSearch aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="animate-rise-in delay-step-4 mt-6 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <span>Popular:</span>
            {["Vijay Nagar", "Bhawarkuan", "Palasia", "Nipania"].map((l) => (
              <Link
                key={l}
                to="/properties"
                search={{ locality: l }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 transition-colors hover:border-primary hover:text-primary"
              >
                <GoLocation aria-hidden="true" className="h-3.5 w-3.5" />
                {l}
              </Link>
            ))}
          </div>

          {/* Trust patti — chhoti si, par pehli nazar me bharosa deti hai */}
          <ul className="animate-rise-in delay-step-5 mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium">
            {heroTrust.map((t) => (
              <li key={t.label} className="inline-flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-green/12 text-brand-green transition-transform duration-300 hover:scale-110">
                  <t.icon aria-hidden="true" className="h-4 w-4" />
                </span>
                {t.label}
              </li>
            ))}
          </ul>

          {ready && !user && (
            <Link to="/list-property" className="btn-outline animate-rise-in delay-step-6 mt-7">
              {hero.ownerCta}
              <GoArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Chalti hui patti — Indore ke ilaake, bina ruke. Hover par ruk jaati hai. */}
      <div
        aria-hidden="true"
        className="relative z-10 overflow-hidden border-y border-border bg-secondary/60 py-2.5"
      >
        <div className="marquee-track">
          {/* Do baar — dusri copy khatam hote hi pehli wapas aa jaati hai, jod dikhta nahi */}
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex items-center gap-6 pr-6 text-sm text-secondary-foreground"
            >
              {localities.map((l) => (
                <span
                  key={`${copy}-${l}`}
                  className="inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <GoDotFill className="h-2.5 w-2.5 text-primary/70" />
                  {l}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Login ke baad hi banners dikhte hain — pehle gate dikhta hai */}
      {isLoggedIn && <BannerStrip audience={audience} />}

      {/* Numbers band — screen par aate hi ginti shuru hoti hai */}
      <section className="mx-auto max-w-7xl px-4 pt-12">
        <Reveal variant="zoom">
          <div className="surface-flow grid grid-cols-2 gap-6 rounded-3xl px-6 py-9 text-center text-brand-green-foreground shadow-lifted sm:grid-cols-4 sm:px-10">
            <Stat value={<CountUp to={live.length} suffix="+" />} label="Live listings" />
            <Stat value={<CountUp to={localities.length} suffix="+" />} label="Indore ke ilaake" />
            <Stat value={<CountUp to={propertyTypes.length} />} label="Property types" />
            <Stat value={<CountUp to={0} prefix="₹" />} label="Brokerage, hamesha" />
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading
          title="Aap kya dhoondh rahe hain?"
          subtitle="Flat se lekar zameen tak — sab kuch ek hi jagah"
        />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {propertyTypes.map((t, i) => (
            <Reveal key={t.value} delay={i * 80}>
              <Link
                to="/properties"
                search={{ type: t.value }}
                className="card-hover card-shine group flex h-full flex-col items-center gap-2 rounded-2xl border border-border bg-card px-4 py-6 text-center shadow-soft"
              >
                <t.icon
                  aria-hidden="true"
                  className="h-8 w-8 text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110"
                />
                <span className="font-display text-lg tracking-wide">{t.label}</span>
                <span className="text-sm text-muted-foreground">{t.labelHi}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        {!ready ? (
          <div className="h-64 animate-pulse rounded-3xl border border-border bg-card" />
        ) : isLoggedIn ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-3xl tracking-wide">Featured rentals</h2>
                <p className="text-muted-foreground">Indore ke sabse pasandida listings</p>
              </div>
              <Link to="/properties" className="btn-outline">
                View all
                <GoArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          </>
        ) : (
          <LoginGate
            title={hero.lockedTitle}
            subtitle={hero.lockedSubtitle}
            redirect="/properties"
          />
        )}
      </section>

      {/* Kyun Indore Dera — chaar wajah, hover par icon uchhalta hai */}
      <section className="relative py-14">
        {/* mask inline hai taaki -webkit- prefix bhi jaa sake (Safari) */}
        <div
          aria-hidden="true"
          style={{
            maskImage: "radial-gradient(70% 60% at 50% 50%, black, transparent)",
            WebkitMaskImage: "radial-gradient(70% 60% at 50% 50%, black, transparent)",
          }}
          className="dot-grid pointer-events-none absolute inset-0 opacity-40"
        />
        <div className="relative mx-auto max-w-7xl px-4">
          <SectionHeading title={home.whyTitle} subtitle={home.whySubtitle} />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {home.whyPoints.map((w, i) => {
              const Icon = contentIcon(w.icon);
              return (
                <Reveal key={`${i}-${w.t}`} delay={i * 90} variant="up">
                  <div className="card-hover group h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-6">
                      <Icon aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-lg tracking-wide">{w.t}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{w.d}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Locality-wise browsing — arrows/swipe se chalne wala rail */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading
          title="Ilaake se dhundhein"
          subtitle="Vijay Nagar se Rau tak — apne mohalle ki listings seedha kholein"
        />
        <LocalityRail items={localityCounts} />
      </section>

      {/* Budget-wise shortcut — ek line me poora price range */}
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-2xl tracking-wide">
                  <GoCreditCard aria-hidden="true" className="h-6 w-6 text-primary" />
                  Budget ke hisaab se
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Jitna kharcha kar sakte hain, utna hi dekhein — filter apne aap lag jaayega.
                </p>
              </div>
              <Link to="/properties" className="btn-outline">
                Saari listings
                <GoArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {budgetBands.map((b) => (
                <Link
                  key={b.label}
                  to="/properties"
                  search={{ minBudget: b.min, budget: b.max }}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-soft"
                >
                  {b.label}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading title={home.stepsTitle} subtitle={home.stepsSubtitle} />
        <div className="relative mt-8">
          {/* Steps ko jodne wali dashed line — sirf bade screen par */}
          <div
            aria-hidden="true"
            className="absolute left-[16%] right-[16%] top-11 hidden border-t-2 border-dashed border-border sm:block"
          />
          <div className="relative grid gap-6 sm:grid-cols-3">
            {home.steps.map((s, i) => {
              const Icon = contentIcon(s.icon);
              return (
                <Reveal key={`${i}-${s.t}`} delay={i * 120}>
                  <div className="card-hover h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                    <span className="animate-pulse-ring flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground">
                      {/* number list ke kram se banta hai — admin ko alag se
                          nahi likhna padta */}
                      {i + 1}
                    </span>
                    <h3 className="mt-4 flex items-center gap-2 text-xl tracking-wide">
                      <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
                      {s.t}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <FaqSection />

      {/* Do CTA — ek owner ke liye, ek kirayedaar ke liye */}
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-6 lg:grid-cols-5">
          <Reveal variant="left" className="lg:col-span-3">
            <div className="surface-flow relative h-full overflow-hidden rounded-3xl px-6 py-12 text-center text-brand-green-foreground shadow-lifted sm:px-10 sm:text-left">
              <GoRocket
                aria-hidden="true"
                className="animate-tilt-bob pointer-events-none absolute -right-4 -top-4 h-32 w-32 opacity-15"
              />
              <h2 className="text-3xl tracking-wide">Property hai? Pehli listing free</h2>
              <p className="mt-2 max-w-xl text-brand-green-foreground/85">
                Apni property Indore ke hazaaron kirayedaron tak pahunchayein — pehli listing bilkul
                free, uske baad sasta sa plan. Photos daalein, rent likhein, aur enquiries seedha
                aapke phone par.
              </p>
              <Link to="/list-property" className="btn-accent mt-6">
                List Your Property
                <GoArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <Reveal variant="right" delay={120} className="lg:col-span-2">
            <div className="card-hover flex h-full flex-col justify-center rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-soft sm:px-8">
              <GoSearch
                aria-hidden="true"
                className="animate-soft-float mx-auto h-10 w-10 text-primary"
              />
              <h2 className="mt-4 text-2xl tracking-wide">Ghar dhoondh rahe hain?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Free account banayein aur Indore ki saari verified listings, owner ke number ke
                saath, abhi kholein.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/properties" className="btn-primary">
                  Listings dekhein
                  <GoArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                {ready && !user && (
                  <Link to="/register" search={{ redirect: "/properties" }} className="btn-outline">
                    <GoPersonAdd aria-hidden="true" className="h-4 w-4" />
                    Free signup
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/**
 * Ilaakon ka horizontal rail — testimonials jaisa hi pattern: native scroll +
 * snap, arrows sirf tab dikhte hain jab scroll karne ko bacha ho.
 */
function LocalityRail({ items }: { items: { name: string; count: number }[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const syncArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    syncArrows();
    window.addEventListener("resize", syncArrows);
    return () => window.removeEventListener("resize", syncArrows);
  }, [syncArrows, items.length]);

  /** Ek "page" — jitna dikh raha hai utna hi aage/peeche. */
  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div className="relative mt-8">
      {(!atStart || !atEnd) && (
        <div className="mb-3 flex items-center justify-end gap-2">
          <RailArrow
            label="Pichhle ilaake"
            disabled={atStart}
            onClick={() => page(-1)}
            icon={GoChevronLeft}
          />
          <RailArrow
            label="Agle ilaake"
            disabled={atEnd}
            onClick={() => page(1)}
            icon={GoChevronRight}
          />
        </div>
      )}

      {/* Kinaron par halka fade — batata hai ki aur bhi cards hain */}
      {!atStart && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 top-14 z-10 w-10 bg-gradient-to-r from-background to-transparent"
        />
      )}
      {!atEnd && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 top-14 z-10 w-10 bg-gradient-to-l from-background to-transparent"
        />
      )}

      <div
        ref={trackRef}
        onScroll={syncArrows}
        tabIndex={0}
        aria-label="Indore ke ilaake"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((l, i) => (
          <Reveal
            key={l.name}
            delay={Math.min(i, 6) * 55}
            variant="zoom"
            className="w-[58%] shrink-0 snap-start sm:w-[31%] lg:w-[19%]"
          >
            <Link
              to="/properties"
              search={{ locality: l.name }}
              className="card-hover group flex h-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 text-left shadow-soft"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/25 text-accent-foreground transition-transform duration-300 group-hover:scale-110">
                <GoLocation aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="font-display block truncate text-base tracking-wide">
                  {l.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {l.count > 0 ? `${l.count} listing${l.count > 1 ? "s" : ""}` : "Jaldi aa rahi"}
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/** Rail ka gol arrow — end par pahunchte hi faint ho jaata hai. */
function RailArrow({
  label,
  icon: Icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: IconType;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground"
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}

/** Section ka title — reveal hote hi neeche brand ki chhoti patti khinchti hai. */
function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);

  return (
    <div ref={ref} data-visible={inView} className="reveal text-center">
      <h2 data-visible={inView} className="heading-rule text-3xl tracking-wide">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

/** Numbers band ka ek tile. */
function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl tracking-wide sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-brand-green-foreground/85">{label}</p>
    </div>
  );
}

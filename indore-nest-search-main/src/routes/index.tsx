import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GoCommentDiscussion, GoLocation, GoPersonAdd, GoSearch } from "react-icons/go";
import { BannerStrip } from "@/components/banner-strip";
import { LoginGate } from "@/components/login-gate";
import { PropertyCard } from "@/components/property-card";
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

/* Har step ka apna Octicon — pehle sirf number tha. */
const steps = [
  {
    n: "1",
    icon: GoPersonAdd,
    t: "Account banayein",
    d: "Free registration — uske baad saari listings unlock ho jaati hain.",
  },
  {
    n: "2",
    icon: GoSearch,
    t: "Search karein",
    d: "Ek hi box me area, BHK, budget ya type likhein.",
  },
  {
    n: "3",
    icon: GoCommentDiscussion,
    t: "Owner se baat",
    d: "Bina brokerage, seedha owner ko call ya WhatsApp.",
  },
];

function Home() {
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const { data } = useSiteData();
  const { hero } = data;

  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [locality, setLocality] = useState("");
  const [budget, setBudget] = useState("");

  const isLoggedIn = ready && !!user;
  const audience = user?.role === "owner" ? "owner" : user ? "user" : "guest";
  const featured = publicListings(data.listings).filter((p) => p.featured);

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
      <section className="hero-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:py-24">
          <span className="badge-green animate-drop-in">{hero.badge}</span>
          <h1 className="animate-rise-in delay-step-1 mx-auto mt-5 max-w-3xl text-4xl leading-tight tracking-wide sm:text-6xl">
            {hero.titleStart} <span className="text-sheen">{hero.titleHighlight}</span>{" "}
            {hero.titleEnd}
          </h1>
          <p className="animate-rise-in delay-step-2 mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {hero.subtitle}
          </p>

          <form
            onSubmit={onSearch}
            className="animate-rise-in delay-step-3 mx-auto mt-9 grid max-w-4xl gap-3 rounded-3xl border border-border bg-card p-4 shadow-lifted"
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
              <select
                className="field"
                value={type}
                onChange={(e) => setType(e.target.value)}
                aria-label="Property type"
              >
                <option value="">Property type</option>
                {propertyTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select
                className="field"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                aria-label="Locality"
              >
                <option value="">Locality (Indore)</option>
                {localities.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <select
                className="field"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                aria-label="Budget"
              >
                <option value="">Max budget</option>
                <option value="5000">Upto ₹5,000</option>
                <option value="10000">Upto ₹10,000</option>
                <option value="20000">Upto ₹20,000</option>
                <option value="50000">Upto ₹50,000</option>
              </select>
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
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 hover:border-primary hover:text-primary"
              >
                <GoLocation aria-hidden="true" className="h-3.5 w-3.5" />
                {l}
              </Link>
            ))}
          </div>

          {ready && !user && (
            <Link to="/list-property" className="btn-outline mt-6">
              {hero.ownerCta}
            </Link>
          )}
        </div>
      </section>

      {/* Login ke baad hi banners dikhte hain — pehle gate dikhta hai */}
      {isLoggedIn && <BannerStrip audience={audience} />}

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-center text-3xl tracking-wide">Aap kya dhoondh rahe hain?</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {propertyTypes.map((t, i) => (
            <Link
              key={t.value}
              to="/properties"
              search={{ type: t.value }}
              style={{ animationDelay: `${i * 90}ms` }}
              className="card-hover group animate-rise-in flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-4 py-6 text-center shadow-soft"
            >
              <t.icon
                aria-hidden="true"
                className="h-8 w-8 text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110"
              />
              <span className="font-display text-lg tracking-wide">{t.label}</span>
              <span className="text-sm text-muted-foreground">{t.labelHi}</span>
            </Link>
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

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-center text-3xl tracking-wide">Kaise kaam karta hai?</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.n}
              style={{ animationDelay: `${i * 120}ms` }}
              className="card-hover animate-rise-in rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground">
                {s.n}
              </span>
              <h3 className="mt-4 flex items-center gap-2 text-xl tracking-wide">
                <s.icon aria-hidden="true" className="h-5 w-5 text-primary" />
                {s.t}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <TestimonialsSection />

      <section className="mx-auto max-w-7xl px-4 pb-6">
        <div className="rounded-3xl bg-brand-green px-6 py-12 text-center text-brand-green-foreground shadow-lifted">
          <h2 className="text-3xl tracking-wide">Property hai? Pehli listing free</h2>
          <p className="mx-auto mt-2 max-w-xl text-brand-green-foreground/85">
            Apni property Indore ke hazaaron kirayedaron tak pahunchayein — pehli listing bilkul
            free, uske baad sasta sa plan.
          </p>
          <Link to="/list-property" className="btn-accent mt-6">
            List Your Property
          </Link>
        </div>
      </section>
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GoArrowRight,
  GoCheck,
  GoCommentDiscussion,
  GoLocation,
  GoMail,
  GoPlus,
  GoSearch,
  GoX,
} from "react-icons/go";
import { Reveal } from "@/components/reveal";
import { contentIcon } from "@/lib/content-icons";
import { localities, propertyTypes } from "@/lib/properties";
import { useSiteData } from "@/lib/site-data";
import logo from "../assets/logo.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Indore Dera — Hyperlocal Rental Platform for Indore" },
      {
        name: "description",
        content:
          "Indore Dera Indore ke liye bana hyperlocal rental platform hai — owners aur tenants ko bina broker seedha jodta hai.",
      },
      { property: "og:title", content: "About Indore Dera" },
      {
        property: "og:description",
        content: "Indore ke liye bana rental platform — apna ghar, apna shehar.",
      },
    ],
  }),
  component: About,
});

/* Is page ka saara text admin panel se aata hai (Content → About page).
   Pehle ye sab yahin arrays me tha — matlab "hum kya hain" me ek line jodne ke
   liye bhi deploy karna padta tha. */
function About() {
  const { data } = useSiteData();
  const about = data.about;

  return (
    <div>
      {/* Pehle logo beech me tha aur baaki page khaali — ab hero do hisson me,
          taaki khulte hi baat samajh aaye. */}
      <section className="hero-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div className="animate-rise-in">
            <span className="badge-accent">{about.badge}</span>
            <h1 className="mt-4 font-display text-4xl leading-tight tracking-wide sm:text-5xl">
              {about.title}
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">{about.intro}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/properties" className="btn-primary">
                <GoSearch aria-hidden="true" className="h-4 w-4" />
                Rentals dekhein
              </Link>
              <Link to="/list-property" className="btn-outline">
                <GoPlus aria-hidden="true" className="h-4 w-4" />
                Apni property daalein
              </Link>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {about.bullets.map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <GoCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-green" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto">
            {/* Logo ke peeche halka halo — plain logo flat lag raha tha */}
            <div
              aria-hidden="true"
              className="animate-halo absolute inset-0 m-auto h-56 w-56 rounded-full bg-accent/30 blur-3xl"
            />
            <img
              src={logo}
              alt="Indore Dera logo"
              className="animate-soft-float relative h-64 w-64 object-contain sm:h-72 sm:w-72"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14">
        {/* Naam ka matlab — is page ko baaki rental sites se alag banata hai */}
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft sm:p-10">
            <div
              aria-hidden="true"
              className="dot-grid pointer-events-none absolute inset-0 opacity-40"
            />
            <div className="relative max-w-3xl border-l-4 border-accent pl-5 sm:pl-6">
              <h2 className="font-display text-2xl tracking-wide sm:text-3xl">
                {about.meaningTitle}
              </h2>
              {/* Pehle yahan bold/italic markup tha; ab text admin likhta hai
                  isliye plain paragraph rehta hai. */}
              <p className="mt-3 leading-relaxed text-muted-foreground">{about.meaningBody}</p>
            </div>
          </div>
        </Reveal>

        {/* Hum kya hain / kya nahi hain */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal variant="left">
            <div className="h-full rounded-2xl border border-brand-green/30 bg-card p-6 shadow-soft sm:p-8">
              <h2 className="flex items-center gap-2.5 font-display text-xl tracking-wide">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/12 text-brand-green">
                  <GoCheck aria-hidden="true" className="h-5 w-5" />
                </span>
                {about.weAreTitle}
              </h2>
              <ul className="mt-5 grid gap-3">
                {about.weAre.map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-sm">
                    <GoCheck
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-green"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal variant="right">
            <div className="h-full rounded-2xl border border-border bg-secondary/50 p-6 shadow-soft sm:p-8">
              <h2 className="flex items-center gap-2.5 font-display text-xl tracking-wide">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <GoX aria-hidden="true" className="h-5 w-5" />
                </span>
                {about.weAreNotTitle}
              </h2>
              <ul className="mt-5 grid gap-3">
                {about.weAreNot.map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <GoX
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-destructive/70"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Kaise kaam karta hai — dono taraf ke liye alag-alag 3 step */}
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-wide sm:text-3xl">{about.howTitle}</h2>
          <p className="mt-1 text-muted-foreground">{about.howSubtitle}</p>

          <div className="mt-7 grid gap-6 lg:grid-cols-2">
            {[
              { title: about.tenantTitle, steps: about.tenantSteps },
              { title: about.ownerTitle, steps: about.ownerSteps },
            ].map((track, ti) => (
              <Reveal key={track.title} delay={ti * 120}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
                  <h3 className="font-display text-lg tracking-wide text-primary">{track.title}</h3>
                  <ol className="mt-5 grid gap-5">
                    {track.steps.map((s, i) => (
                      <li key={s.t} className="flex gap-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-sm text-primary">
                          {i + 1}
                        </span>
                        <span>
                          <span className="block font-semibold">{s.t}</span>
                          <span className="block text-sm text-muted-foreground">{s.d}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Kya-kya milta hai + kahan-kahan — dono asli data se aate hain */}
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-wide sm:text-3xl">{about.typesTitle}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {propertyTypes.map((t, i) => (
              <Reveal key={t.value} delay={i * 70}>
                <Link
                  to="/properties"
                  search={{ type: t.value }}
                  className="card-hover flex h-full flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 text-center shadow-soft"
                >
                  <t.icon aria-hidden="true" className="h-6 w-6 text-primary" />
                  <span className="font-display tracking-wide">{t.label}</span>
                  <span className="text-xs text-muted-foreground">{t.labelHi}</span>
                </Link>
              </Reveal>
            ))}
          </div>

          <h2 className="mt-12 font-display text-2xl tracking-wide sm:text-3xl">
            Indore ke {localities.length} ilaake
          </h2>
          <p className="mt-1 text-muted-foreground">{about.localitiesSubtitle}</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {localities.map((l) => (
              <Link
                key={l}
                to="/properties"
                search={{ q: l }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-soft transition-colors hover:border-primary/50 hover:text-primary"
              >
                <GoLocation aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                {l}
              </Link>
            ))}
          </div>
        </section>

        {/* Hamara vaada */}
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-wide sm:text-3xl">{about.valuesTitle}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {about.values.map((c, i) => {
              const Icon = contentIcon(c.icon);
              return (
              <Reveal key={`${i}-${c.t}`} delay={i * 90}>
                <div className="card-hover h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg tracking-wide text-primary">{c.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
                </div>
              </Reveal>
              );
            })}
          </div>
        </section>

        {/* CTA band — pehle plain secondary box tha */}
        <Reveal variant="zoom" className="mt-16">
          <div className="surface-flow rounded-3xl px-6 py-12 text-center text-brand-green-foreground shadow-lifted sm:px-10">
            <h2 className="font-display text-3xl tracking-wide">{about.ctaTitle}</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-brand-green-foreground/85">
              {about.ctaText}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 rounded-full bg-card px-6 py-3 font-semibold text-primary shadow-soft transition-transform hover:scale-105"
              >
                <GoSearch aria-hidden="true" className="h-4 w-4" />
                Browse rentals
              </Link>
              <Link
                to="/list-property"
                className="inline-flex items-center gap-2 rounded-full border border-brand-green-foreground/40 px-6 py-3 font-semibold transition-colors hover:bg-brand-green-foreground/10"
              >
                <GoPlus aria-hidden="true" className="h-4 w-4" />
                List your property
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Baat karni ho to */}
        <Reveal className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <GoCommentDiscussion aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-lg tracking-wide">{about.helpTitle}</p>
                <p className="text-sm text-muted-foreground">{about.helpText}</p>
              </div>
            </div>
            <Link to="/contact" className="btn-outline">
              <GoMail aria-hidden="true" className="h-4 w-4" />
              Contact karein
              <GoArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

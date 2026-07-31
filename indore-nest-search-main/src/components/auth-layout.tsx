import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { GoArrowLeft, GoShieldCheck } from "react-icons/go";
import logo from "../assets/logo.png";
import { useSiteData } from "@/lib/site-data";

export type AuthPoint = { icon: IconType; title: string; text: string };

/**
 * Login aur register — dono ka ek hi shakal wala layout.
 *
 * Pehle dono pages ek patli si form strip the, khaali page ke beech me. Ab
 * split card hai: baayein taraf brand panel (bade screen par) aur daayein
 * taraf form. Mobile par sirf form dikhta hai, upar chhota sa brand header.
 */
export function AuthLayout({
  badge,
  title,
  subtitle,
  points,
  children,
}: {
  badge: string;
  title: string;
  subtitle: string;
  /** Brand panel ke bullet points — har page ke apne. */
  points: AuthPoint[];
  children: ReactNode;
}) {
  const { data } = useSiteData();

  return (
    <div className="hero-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <GoArrowLeft aria-hidden="true" className="h-4 w-4" />
          Home par wapas
        </Link>

        <div className="animate-rise-in mt-4 grid overflow-hidden rounded-3xl border border-border bg-card shadow-lifted lg:grid-cols-[1.02fr_1fr]">
          {/* Brand panel — chhoti screen par jagah nahi hai, isliye lg se upar */}
          {/* justify-center: register ka form lamba hai, isliye space-between
              rakhne par beech me badi khaali jagah bach jaati thi. */}
          <aside className="relative hidden flex-col justify-center gap-9 overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
            <div
              aria-hidden="true"
              className="dot-grid pointer-events-none absolute inset-0 opacity-25"
            />
            {/* Kone me halka saffron glow — flat laal patti se behtar lagta hai */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/30 blur-3xl"
            />

            <div className="relative">
              <img
                src={logo}
                alt={`${data.hero.logoText} logo`}
                className="h-20 w-20 object-contain"
              />
              <h2 className="mt-5 font-display text-3xl leading-tight tracking-wide">
                Indore ka apna rental platform
              </h2>
              <p className="mt-2 max-w-sm text-sm text-primary-foreground/80">
                Flats, rooms, dukaan, PG aur zameen — sab ek jagah, bina kisi broker ke.
              </p>
            </div>

            <ul className="relative grid gap-5">
              {points.map((p) => (
                <li key={p.title} className="flex gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/12 text-accent">
                    <p.icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-semibold">{p.title}</span>
                    <span className="block text-sm text-primary-foreground/75">{p.text}</span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="relative flex items-center gap-2 border-t border-primary-foreground/15 pt-5 text-xs text-primary-foreground/75">
              <GoShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0" />
              Aapka number sirf owner tak jaata hai — kisi broker ko nahi bechte.
            </p>
          </aside>

          <div className="p-6 sm:p-10">
            {/* Mobile par brand panel nahi hai, to logo yahan aa jaata hai */}
            <img
              src={logo}
              alt={`${data.hero.logoText} logo`}
              className="h-14 w-14 object-contain lg:hidden"
            />
            <span className="badge-accent mt-3 inline-flex lg:mt-0">{badge}</span>
            <h1 className="mt-3 font-display text-3xl leading-tight tracking-wide sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>

            <div className="mt-7">{children}</div>
          </div>
        </div>

        {/* Mobile par brand panel nahi dikhta, isliye bharosa yahan likha hai */}
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground lg:hidden">
          <GoShieldCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-brand-green" />
          Zero brokerage · Aapka number sirf owner tak jaata hai
        </p>
      </div>
    </div>
  );
}

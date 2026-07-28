import { Link } from "@tanstack/react-router";
import { GoArrowRight } from "react-icons/go";
import { bannersFor, useSiteData, type Audience } from "@/lib/site-data";

/**
 * Audience ke hisaab se alag banners — guest, logged-in user aur owner
 * sabko alag offers dikhte hain. Content admin panel se aata hai.
 */
export function BannerStrip({ audience }: { audience: Audience }) {
  const { data } = useSiteData();
  const banners = bannersFor(data.banners, audience);

  if (banners.length === 0) return null;

  const ctaTo = audience === "owner" ? "/list-property" : "/properties";

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {banners.map((b, i) => (
          <article
            key={b.id}
            style={{ animationDelay: `${i * 110}ms` }}
            className="card-hover group animate-rise-in relative overflow-hidden rounded-3xl border border-border shadow-soft"
          >
            <img
              src={b.image}
              alt={b.title}
              loading="lazy"
              className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-background">
              <h3 className="font-display text-xl tracking-wide">{b.title}</h3>
              <p className="mt-1 text-sm text-background/85">{b.subtitle}</p>
              <Link to={ctaTo} className="btn-accent group/cta mt-4">
                {b.ctaLabel}
                <GoArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1"
                />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

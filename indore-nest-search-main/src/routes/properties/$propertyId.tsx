import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GoArrowLeft,
  GoCheck,
  GoCommentDiscussion,
  GoDeviceMobile,
  GoLocation,
  GoPerson,
  GoShieldCheck,
} from "react-icons/go";
import { ImageCarousel } from "@/components/image-carousel";
import { formatRent, getProperty, propertyImages, propertyTypes } from "@/lib/properties";
import { useSiteData } from "@/lib/site-data";

export const Route = createFileRoute("/properties/$propertyId")({
  /* Seed listing server par mil jaati hai (SEO ke liye). Owner ki apni listing
     sirf browser storage me hoti hai — wo component me site-data se aati hai. */
  loader: ({ params }) => getProperty(params.propertyId) ?? null,
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — ${formatRent(loaderData.rent)}/month | Indore Dera` },
          { name: "description", content: loaderData.description.slice(0, 155) },
          { property: "og:title", content: `${loaderData.title} | Indore Dera` },
          { property: "og:description", content: loaderData.description.slice(0, 155) },
        ]
      : [],
  }),
  component: PropertyDetail,
});

function PropertyDetail() {
  const loaded = Route.useLoaderData();
  const { propertyId } = Route.useParams();
  const { data, ready } = useSiteData();

  // site-data me owner ki nayi listings bhi hoti hain aur seed listings ka
  // latest version bhi — isliye pehle wahan dekhte hain
  const p = data.listings.find((l) => l.id === propertyId) ?? loaded;

  if (!p) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        {ready ? (
          <>
            <h1 className="text-2xl tracking-wide">Ye listing nahi mili</h1>
            <p className="mt-2 text-muted-foreground">
              Shayad owner ne hata di ho ya link purana ho gaya ho.
            </p>
            <Link to="/properties" className="btn-primary mt-6">
              <GoArrowLeft aria-hidden="true" className="h-4 w-4" />
              Sabhi rentals dekhein
            </Link>
          </>
        ) : (
          <div className="h-72 animate-pulse rounded-3xl border border-border bg-card" />
        )}
      </div>
    );
  }

  const type = propertyTypes.find((t) => t.value === p.type);
  const TypeIcon = type?.icon;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        to="/properties"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <GoArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to all rentals
      </Link>

      <ImageCarousel images={propertyImages(p)} alt={p.title} className="mt-4" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="badge-accent inline-flex items-center gap-1.5">
              {TypeIcon && <TypeIcon aria-hidden="true" className="h-4 w-4" />}
              {type?.label}
            </span>
            <span className="badge-green">{p.furnishing}</span>
          </div>
          <h1 className="mt-3 text-3xl tracking-wide sm:text-4xl">{p.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <GoLocation aria-hidden="true" className="h-4 w-4 shrink-0" />
            {p.locality}, Indore · Posted {p.postedAgo}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { k: "Monthly Rent", v: formatRent(p.rent) },
              { k: "Deposit", v: formatRent(p.deposit) },
              { k: "Area", v: p.area },
              { k: "Config", v: p.bhk ?? type?.label ?? "—" },
            ].map((s) => (
              <div
                key={s.k}
                className="rounded-xl border border-border bg-card p-4 text-center shadow-soft"
              >
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.k}</p>
                <p className="mt-1 font-display text-lg">{s.v}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-2xl tracking-wide">Description</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">{p.description}</p>

          <h2 className="mt-8 text-2xl tracking-wide">Amenities</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {p.amenities.map((a: string) => (
              <li
                key={a}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1.5 text-sm text-secondary-foreground"
              >
                <GoCheck aria-hidden="true" className="h-4 w-4 text-brand-green" />
                {a}
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-2xl tracking-wide">Preferred tenant</h2>
          <p className="mt-2 text-muted-foreground">{p.preferred}</p>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
          <p className="font-display text-3xl text-primary">{formatRent(p.rent)}</p>
          <p className="text-sm text-muted-foreground">
            per month · deposit {formatRent(p.deposit)}
          </p>
          <div className="mt-5 border-t border-border pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Owner</p>
            <p className="flex items-center gap-2 font-display text-xl">
              <GoPerson aria-hidden="true" className="h-5 w-5 text-primary" />
              {p.ownerName}
            </p>
          </div>
          <a href="tel:+919826000000" className="btn-primary mt-5 w-full">
            <GoDeviceMobile aria-hidden="true" className="h-4 w-4" />
            Call Owner
          </a>
          <a
            href={`https://wa.me/919826000000?text=${encodeURIComponent(`Namaste, mujhe "${p.title}" ke baare me jaankari chahiye.`)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-outline mt-3 w-full"
          >
            <GoCommentDiscussion aria-hidden="true" className="h-4 w-4" />
            WhatsApp
          </a>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <GoShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-brand-green" />
            Zero brokerage · Seedha owner se baat
          </p>
        </aside>
      </div>
    </div>
  );
}

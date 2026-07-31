import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  GoAlert,
  GoArrowLeft,
  GoArrowRight,
  GoCheck,
  GoCheckCircleFill,
  GoChevronRight,
  GoClock,
  GoCommentDiscussion,
  GoCopy,
  GoCreditCard,
  GoDeviceMobile,
  GoLinkExternal,
  GoListUnordered,
  GoLocation,
  GoNote,
  GoPerson,
  GoShieldCheck,
  GoStack,
} from "react-icons/go";
import { toast } from "sonner";
import { ImageCarousel } from "@/components/image-carousel";
import { LoginGate } from "@/components/login-gate";
import { PropertyCard } from "@/components/property-card";
import { Reveal } from "@/components/reveal";
import { useAuth } from "@/lib/auth";
import { fetchProperty, formatRent, propertyImages, propertyTypes } from "@/lib/properties";
import { publicListings, useSiteData } from "@/lib/site-data";

export const Route = createFileRoute("/properties/$propertyId")({
  /* Approved listing SSR par API se aa jaati hai (SEO/og tags ke liye). Owner ki
     apni draft/pending listing public endpoint par nahi milti — wo component me
     site-data se aati hai. */
  loader: ({ params }) => fetchProperty(params.propertyId),
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

/* Har section ek card hai — pehle sab kuch khaali page par bikhra hua tha,
   isliye lamba scroll bhi flat lagta tha. */
function Section({
  icon: Icon,
  title,
  hint,
  children,
  className = "",
}: {
  icon: IconType;
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6 ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-xl leading-tight tracking-wide">{title}</h2>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* Ghar dekhne jaane se pehle ki basic ehtiyat — har listing par same. */
const safetyTips = [
  "Paisa dene se pehle jagah khud jaakar dekhein — sirf photos par bharosa na karein.",
  "Owner ki ID aur property ke kaagaz ek baar zaroor check karein.",
  "Rent, deposit, notice period aur maintenance — sab agreement me likhwa lein.",
  "Indore Dera koi brokerage ya platform fee nahi leta. Koi maange to hume batayein.",
];

function PropertyDetail() {
  const loaded = Route.useLoaderData();
  const { propertyId } = Route.useParams();
  const { data, ready } = useSiteData();
  const { user } = useAuth();

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

  /* Pehle mahine me kitna paisa lagega — rent + deposit. Log yahi calculator
     phone par khud lagate hain, to page par hi de dete hain. */
  const moveInTotal = p.rent + p.deposit;

  const mapQuery = encodeURIComponent(
    `${p.road ? `${p.road}, ` : ""}${p.locality}, Indore, Madhya Pradesh`,
  );

  /* Similar = same ilaaka ya same type. Pehle locality wali, phir type wali —
     taaki upar wahi dikhe jo sach me aas-paas hai. */
  const others = publicListings(data.listings).filter((l) => l.id !== p.id);
  const similar = [
    ...others.filter((l) => l.locality === p.locality),
    ...others.filter((l) => l.locality !== p.locality && l.type === p.type),
  ].slice(0, 3);

  const facts: { k: string; v: string }[] = [
    { k: "Property type", v: type?.label ?? p.type },
    { k: "Configuration", v: p.bhk ?? type?.label ?? "—" },
    { k: "Area", v: p.area },
    { k: "Furnishing", v: p.furnishing },
    { k: "Ilaaka", v: `${p.locality}, Indore` },
    ...(p.road ? [{ k: "Road / landmark", v: p.road }] : []),
    { k: "Preferred tenant", v: p.preferred },
    { k: "Listing ID", v: p.id },
    { k: "Kab daali gayi", v: p.postedAgo },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copy ho gaya — ab kisi ko bhi bhej dein.");
    } catch {
      toast.error("Link copy nahi ho paaya. Address bar se copy kar lein.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      {/* Breadcrumb — back link se behtar, kyunki poora rasta dikhta hai */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
        <Link to="/" className="text-muted-foreground hover:text-primary">
          Home
        </Link>
        <GoChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground/60" />
        <Link to="/properties" className="text-muted-foreground hover:text-primary">
          Sab dekho
        </Link>
        <GoChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground/60" />
        <Link
          to="/properties"
          search={{ type: p.type }}
          className="text-muted-foreground hover:text-primary"
        >
          {type?.label}
        </Link>
        <GoChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="max-w-[16rem] truncate font-medium text-foreground/80">{p.locality}</span>
      </nav>

      {/* Title gallery ke upar — pehle photo ke neeche tha, isliye kholte hi
          pata hi nahi chalta tha ki kis cheez ki listing hai. */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-accent inline-flex items-center gap-1.5">
              {TypeIcon && <TypeIcon aria-hidden="true" className="h-4 w-4" />}
              {type?.label}
            </span>
            <span className="badge-green">{p.furnishing}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <GoClock aria-hidden="true" className="h-3.5 w-3.5" />
              {p.postedAgo}
            </span>
          </div>
          <h1 className="mt-3 font-display text-3xl leading-tight tracking-wide sm:text-4xl">
            {p.title}
          </h1>
          {p.titleHi && <p className="mt-1 text-lg text-muted-foreground">{p.titleHi}</p>}
          <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
            <GoLocation aria-hidden="true" className="h-4 w-4 shrink-0" />
            {p.road ? `${p.road}, ` : ""}
            {p.locality}, Indore
          </p>
        </div>

        {/* Bade screen par price yahan bhi — sidebar tak scroll na karna pade */}
        <div className="hidden text-right lg:block">
          <p className="font-display text-3xl text-primary">{formatRent(p.rent)}</p>
          <p className="text-sm text-muted-foreground">per month</p>
        </div>
      </div>

      <ImageCarousel images={propertyImages(p)} alt={p.title} className="mt-5" />

      {/* Ek nazar me sab — gallery ke turant neeche, taaki scroll kiye bina
          rent/deposit/area/config dikh jaaye. */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: "Monthly rent", v: formatRent(p.rent), icon: GoCreditCard },
          { k: "Deposit", v: formatRent(p.deposit), icon: GoShieldCheck },
          { k: "Area", v: p.area, icon: GoStack },
          { k: "Config", v: p.bhk ?? type?.label ?? "—", icon: GoListUnordered },
        ].map((s, i) => (
          <Reveal key={s.k} delay={i * 60}>
            <div className="card-hover h-full rounded-xl border border-border bg-card p-4 text-center shadow-soft">
              <s.icon aria-hidden="true" className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                {s.k}
              </p>
              <p className="mt-0.5 font-display text-lg leading-tight">{s.v}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="grid gap-6">
          <Reveal>
            <Section icon={GoNote} title="Is jagah ke baare me">
              <p className="leading-relaxed text-muted-foreground">{p.description}</p>
            </Section>
          </Reveal>

          <Reveal>
            <Section
              icon={GoCheckCircleFill}
              title="Amenities"
              hint={`${p.amenities.length} cheezein is listing me shaamil hain`}
            >
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {p.amenities.map((a: string) => (
                  <li
                    key={a}
                    className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-secondary/40 px-3.5 py-2.5 text-sm"
                  >
                    <GoCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-green" />
                    {a}
                  </li>
                ))}
              </ul>
            </Section>
          </Reveal>

          {/* Poori detail ek table me — pehle ye jaankari page par thi hi nahi */}
          <Reveal>
            <Section icon={GoListUnordered} title="Poori jaankari">
              <dl className="grid gap-x-8 sm:grid-cols-2">
                {facts.map((f) => (
                  <div
                    key={f.k}
                    className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2.5 last:border-0"
                  >
                    <dt className="text-sm text-muted-foreground">{f.k}</dt>
                    <dd className="text-right text-sm font-medium">{f.v}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          </Reveal>

          {/* Move-in kharcha — log ye calculator khud phone par lagate hain */}
          <Reveal>
            <Section
              icon={GoCreditCard}
              title="Shuru me kitna paisa lagega"
              hint="Listing me di gayi rakam ke hisaab se"
            >
              <ul className="text-sm">
                <li className="flex items-center justify-between border-b border-border/60 py-2.5">
                  <span className="text-muted-foreground">Pehle mahine ka rent</span>
                  <span className="font-medium">{formatRent(p.rent)}</span>
                </li>
                <li className="flex items-center justify-between border-b border-border/60 py-2.5">
                  <span className="text-muted-foreground">Security deposit</span>
                  <span className="font-medium">{formatRent(p.deposit)}</span>
                </li>
                <li className="flex items-center justify-between border-b border-border/60 py-2.5">
                  <span className="text-muted-foreground">Brokerage</span>
                  <span className="font-medium text-brand-green">₹0 — zero brokerage</span>
                </li>
                <li className="flex items-center justify-between pt-3">
                  <span className="font-display text-base">Total move-in cost</span>
                  <span className="font-display text-xl text-primary">
                    {formatRent(moveInTotal)}
                  </span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Maintenance, bijli-paani aur agreement kharcha alag ho sakta hai — owner se ek baar
                confirm kar lein.
              </p>
            </Section>
          </Reveal>

          <Reveal>
            <Section icon={GoLocation} title={`${p.locality} me ye jagah`}>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {p.road ? `${p.road}, ` : ""}
                {p.locality}, Indore (MP). Exact address owner se baat karne par mil jaayega.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline"
                >
                  <GoLinkExternal aria-hidden="true" className="h-4 w-4" />
                  Map par dekhein
                </a>
                <Link to="/properties" search={{ q: p.locality }} className="btn-outline">
                  <GoArrowRight aria-hidden="true" className="h-4 w-4" />
                  {p.locality} ki sabhi listings
                </Link>
              </div>
            </Section>
          </Reveal>

          <Reveal>
            <Section
              icon={GoAlert}
              title="Dekhne jaane se pehle"
              hint="Chhoti si ehtiyat, badi bachat"
            >
              <ul className="grid gap-2.5">
                {safetyTips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <GoShieldCheck
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-green"
                    />
                    {tip}
                  </li>
                ))}
              </ul>
            </Section>
          </Reveal>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <p className="font-display text-3xl text-primary">{formatRent(p.rent)}</p>
            <p className="text-sm text-muted-foreground">
              per month · deposit {formatRent(p.deposit)}
            </p>

            <div className="mt-5 flex items-center gap-3 border-t border-border pt-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <GoPerson aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Owner</p>
                <p className="truncate font-display text-lg leading-tight">{p.ownerName}</p>
              </div>
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
            <button type="button" onClick={copyLink} className="btn-outline mt-3 w-full">
              <GoCopy aria-hidden="true" className="h-4 w-4" />
              Link share karein
            </button>

            <ul className="mt-5 grid gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
              {[
                "Zero brokerage — seedha owner se baat",
                "Sirf Indore ki listings",
                "Admin verified listing",
              ].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <GoShieldCheck
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-brand-green"
                  />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Kuch galat lag raha hai?{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Hume batayein
            </Link>
          </p>
        </aside>
      </div>

      {/* Baaki site ki tarah property cards sirf logged-in users ko — guest ko
          wahi login gate jo home/properties par hai. */}
      {!user && (
        <div className="mt-12">
          <LoginGate
            title="Aur options dekhne hain?"
            subtitle="Free account banayein — is jaisi milti-julti listings aur poora Indore search karna khul jaata hai."
            redirect={`/properties/${p.id}`}
          />
        </div>
      )}

      {/* Ek listing pasand na aaye to user wapas search par na jaaye */}
      {user && similar.length > 0 && (
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl tracking-wide">Aise hi aur options</h2>
              <p className="text-sm text-muted-foreground">
                {p.locality} aur {type?.label} me milti-julti listings
              </p>
            </div>
            <Link to="/properties" className="btn-outline">
              Sab dekho
              <GoArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s, i) => (
              <PropertyCard key={s.id} property={s} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

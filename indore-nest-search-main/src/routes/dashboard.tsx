import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  GoCheck,
  GoChecklist,
  GoClock,
  GoCreditCard,
  GoEye,
  GoInbox,
  GoLocation,
  GoNote,
  GoPlus,
  GoStack,
  GoTrash,
  GoVerified,
  GoX,
} from "react-icons/go";
import type { IconType } from "react-icons";
import { toast } from "sonner";
import { ImageCarousel } from "@/components/image-carousel";
import { LoginGate } from "@/components/login-gate";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api-client";
import { canPostListing, FREE_LISTINGS_PER_OWNER, isPlanActive, useAuth } from "@/lib/auth";
import { formatRent, propertyImages, propertyTypes, type Property } from "@/lib/properties";
import { useSiteData } from "@/lib/site-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Meri Listings — Indore Dera" },
      {
        name: "description",
        content: "Apni Indore Dera listings, drafts aur plan status ek jagah manage karein.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, ready } = useAuth();
  const { data, removeListing } = useSiteData();
  const [preview, setPreview] = useState<Property | null>(null);

  /* Delete ab server par jaata hai — fail ho sakta hai (session expire, listing
     pehle hi hat chuki), isliye jawab user ko dikhana zaroori hai. */
  async function handleDelete(p: Property) {
    try {
      await removeListing(p.id);
      toast.success("Listing hata di gayi");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Listing hat nahi paayi.");
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="h-72 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <LoginGate
          title="Dashboard dekhne ke liye login karein"
          subtitle="Apni listings, drafts aur plan yahan manage kar sakte hain."
          redirect="/dashboard"
        />
      </div>
    );
  }

  const myListings = data.listings.filter((p) => p.ownerId === user.id);
  const gate = canPostListing(user, myListings.length);
  const plan = isPlanActive(user.plan) ? user.plan : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-wide sm:text-4xl">Meri listings</h1>
          <p className="mt-1 text-muted-foreground">
            Namaste {user.name.split(" ")[0]} — aapki {myListings.length} listing
            {myListings.length === 1 ? "" : "s"} hain.
          </p>
        </div>
        <Link to={gate.allowed ? "/list-property" : "/plans"} className="btn-primary">
          {gate.allowed ? (
            <GoPlus aria-hidden="true" className="h-4 w-4" />
          ) : (
            <GoCreditCard aria-hidden="true" className="h-4 w-4" />
          )}
          {gate.allowed ? "Nayi property post karein" : "Plan lekar post karein"}
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={GoStack} label="Total listings" value={String(myListings.length)} />
        <StatCard
          icon={GoChecklist}
          label="Free quota"
          value={`${Math.min(myListings.length, FREE_LISTINGS_PER_OWNER)}/${FREE_LISTINGS_PER_OWNER}`}
        />
        <StatCard
          icon={GoCreditCard}
          label="Plan"
          value={
            plan
              ? plan.credits === null
                ? plan.label
                : `${plan.label} · ${plan.credits} credit`
              : "Koi plan nahi"
          }
        />
      </div>

      {myListings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <GoInbox aria-hidden="true" className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-2xl tracking-wide">Abhi koi listing nahi</h2>
          <p className="mt-2 text-muted-foreground">
            Aapki pehli listing bilkul free hai — abhi post karein.
          </p>
          <Link to="/list-property" className="btn-primary mt-6">
            <GoPlus aria-hidden="true" className="h-4 w-4" />
            Property list karein
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {myListings.map((p, i) => (
            <div
              key={p.id}
              style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
              className="card-hover animate-rise-in flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <img src={p.image} alt={p.title} className="h-20 w-28 rounded-xl object-cover" />
              <div className="min-w-48 flex-1">
                <h3 className="font-display text-lg leading-snug tracking-wide">{p.title}</h3>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <GoLocation aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {p.locality} · {formatRent(p.rent)}/month
                </p>
              </div>
              <StatusBadge status={p.status ?? "approved"} />
              <div className="flex gap-2">
                {/* Dekhein har status par chalta hai — draft/pending ka public page
                    nahi hota, isliye poori detail modal me dikhati hai */}
                <button type="button" className="btn-outline" onClick={() => setPreview(p)}>
                  <GoEye aria-hidden="true" className="h-4 w-4" />
                  Dekhein
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
                  onClick={() => void handleDelete(p)}
                >
                  <GoTrash aria-hidden="true" className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ListingPreview listing={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

/** "Dekhein" par khulne wala modal — listing ki poori detail, photos samet. */
function ListingPreview({ listing, onClose }: { listing: Property | null; onClose: () => void }) {
  const type = listing ? propertyTypes.find((t) => t.value === listing.type) : undefined;

  return (
    <Dialog open={!!listing} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        {listing && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl leading-snug tracking-wide">
                {listing.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-1.5">
                <GoLocation aria-hidden="true" className="h-4 w-4 shrink-0" />
                {listing.locality}
                {listing.road ? `, ${listing.road}` : ""} · Indore
              </DialogDescription>
            </DialogHeader>

            <ImageCarousel
              images={propertyImages(listing)}
              alt={listing.title}
              imageClassName="h-56 sm:h-72"
            />

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={listing.status ?? "approved"} />
              {type && (
                <span className="badge-accent">
                  <type.icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {type.label}
                </span>
              )}
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {listing.furnishing}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { k: "Rent", v: `${formatRent(listing.rent)}/mo` },
                { k: "Deposit", v: formatRent(listing.deposit) },
                { k: "Area", v: listing.area || "—" },
                { k: "Config", v: listing.bhk ?? type?.label ?? "—" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-xl border border-border bg-background p-3 text-center"
                >
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.k}</p>
                  <p className="mt-0.5 font-display text-base">{s.v}</p>
                </div>
              ))}
            </div>

            {listing.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
            )}

            {listing.amenities.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold">Amenities</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <li
                      key={a}
                      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                    >
                      <GoCheck aria-hidden="true" className="h-3.5 w-3.5 text-brand-green" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <dl className="grid gap-2 rounded-2xl bg-secondary/50 p-4 text-sm sm:grid-cols-2">
              <Row label="Preferred tenant" value={listing.preferred} />
              <Row label="Owner" value={listing.ownerName} />
              {listing.ownerPhone && <Row label="Contact" value={`+91 ${listing.ownerPhone}`} />}
              <Row
                label="Posted"
                value={
                  listing.createdAt
                    ? new Date(listing.createdAt).toLocaleDateString("en-IN")
                    : listing.postedAgo
                }
              />
            </dl>

            <DialogFooter>
              {listing.status === "approved" && (
                <Link
                  to="/properties/$propertyId"
                  params={{ propertyId: listing.id }}
                  className="btn-primary"
                >
                  <GoEye aria-hidden="true" className="h-4 w-4" />
                  Public page par dekhein
                </Link>
              )}
              <button type="button" className="btn-outline" onClick={onClose}>
                <GoX aria-hidden="true" className="h-4 w-4" />
                Band karein
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 sm:block">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon aria-hidden="true" className="h-4 w-4" />
        {label}
      </p>
      <p className="mt-1 font-display text-xl tracking-wide">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: "draft" | "pending" | "approved" }) {
  const map = {
    draft: { text: "Draft", icon: GoNote, className: "bg-secondary text-secondary-foreground" },
    pending: {
      text: "Verify hona baaki",
      icon: GoClock,
      className: "bg-accent text-accent-foreground",
    },
    approved: {
      text: "Live",
      icon: GoVerified,
      className: "bg-brand-green text-brand-green-foreground",
    },
  } as const;
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${s.className}`}
    >
      <s.icon aria-hidden="true" className="h-3.5 w-3.5" />
      {s.text}
    </span>
  );
}

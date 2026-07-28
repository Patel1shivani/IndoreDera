import { createFileRoute, Link } from "@tanstack/react-router";
import {
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
} from "react-icons/go";
import type { IconType } from "react-icons";
import { LoginGate } from "@/components/login-gate";
import { canPostListing, FREE_LISTINGS_PER_OWNER, isPlanActive, useAuth } from "@/lib/auth";
import { formatRent } from "@/lib/properties";
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
                {p.status === "approved" && (
                  <Link
                    to="/properties/$propertyId"
                    params={{ propertyId: p.id }}
                    className="btn-outline"
                  >
                    <GoEye aria-hidden="true" className="h-4 w-4" />
                    Dekhein
                  </Link>
                )}
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
                  onClick={() => removeListing(p.id)}
                >
                  <GoTrash aria-hidden="true" className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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

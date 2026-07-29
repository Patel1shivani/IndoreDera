import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type { IconType } from "react-icons";
import {
  GoCheckCircle,
  GoClock,
  GoCreditCard,
  GoDeviceMobile,
  GoKey,
  GoMail,
  GoPencil,
  GoPerson,
  GoPlus,
  GoProject,
  GoShieldCheck,
  GoSignOut,
  GoStack,
  GoX,
} from "react-icons/go";
import { toast } from "sonner";
import { LoginGate } from "@/components/login-gate";
import { AuthError, isPlanActive, useAuth } from "@/lib/auth";
import { useSiteData } from "@/lib/site-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Meri Profile — Indore Dera" },
      {
        name: "description",
        content:
          "Apna naam, mobile, email aur password update karein aur account ka status dekhein.",
      },
    ],
  }),
  component: Profile,
});

const roleLabel: Record<string, string> = {
  tenant: "Tenant",
  owner: "Owner",
  admin: "Admin",
};

function Profile() {
  const { user, ready, updateProfile, changePassword, logout } = useAuth();
  const { data } = useSiteData();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-72 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <LoginGate
          title="Profile dekhne ke liye login karein"
          subtitle="Apni details, plan aur listings ek jagah manage karein."
          redirect="/profile"
        />
      </div>
    );
  }

  const myListings = data.listings.filter((p) => p.ownerId === user.id);
  const live = myListings.filter((p) => p.status === "approved").length;
  const pending = myListings.length - live;
  const plan = isPlanActive(user.plan) ? user.plan : null;
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  function startEdit() {
    if (!user) return;
    setForm({ name: user.name, phone: user.phone, email: user.email });
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfile(form);
      setEditing(false);
      toast.success("Profile update ho gaya");
    } catch (err) {
      toast.error(err instanceof AuthError ? err.message : "Profile save nahi ho paya");
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next !== pw.confirm) {
      toast.error("Naya password dono jagah same likhein");
      return;
    }
    setSavingPw(true);
    try {
      await changePassword({ current: pw.current, next: pw.next });
      setPw({ current: "", next: "", confirm: "" });
      setPwOpen(false);
      toast.success("Password badal gaya");
    } catch (err) {
      toast.error(err instanceof AuthError ? err.message : "Password badal nahi paya");
    } finally {
      setSavingPw(false);
    }
  }

  function handleLogout() {
    logout();
    void navigate({ to: "/", replace: true });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Identity card */}
      <div className="animate-rise-in flex flex-wrap items-center gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary font-display text-2xl font-bold text-primary-foreground">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-3xl tracking-wide">{user.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <GoMail aria-hidden="true" className="h-4 w-4" />
              {user.email}
            </span>
            <span className="flex items-center gap-1.5">
              <GoDeviceMobile aria-hidden="true" className="h-4 w-4" />
              +91 {user.phone}
            </span>
          </p>
          <span className="badge-accent mt-3">
            <GoPerson aria-hidden="true" className="h-3.5 w-3.5" />
            {roleLabel[user.role] ?? user.role}
          </span>
        </div>
        {!editing && (
          <button type="button" onClick={startEdit} className="btn-outline">
            <GoPencil aria-hidden="true" className="h-4 w-4" />
            Edit profile
          </button>
        )}
      </div>

      {/* Edit form — sirf Edit dabane par khulta hai */}
      {editing && (
        <form
          onSubmit={(e) => void handleSave(e)}
          className="animate-rise-in mt-4 rounded-3xl border border-border bg-card p-6 shadow-soft"
        >
          <h2 className="font-display text-xl tracking-wide">Details update karein</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-name" className="mb-1.5 block text-sm font-medium">
                Poora naam
              </label>
              <input
                id="pf-name"
                required
                className="field"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="pf-phone" className="mb-1.5 block text-sm font-medium">
                Mobile number
              </label>
              <input
                id="pf-phone"
                required
                inputMode="numeric"
                className="field"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="pf-email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                id="pf-email"
                required
                type="email"
                className="field"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              <GoCheckCircle aria-hidden="true" className="h-4 w-4" />
              Save karein
            </button>
            <button type="button" className="btn-outline" onClick={() => setEditing(false)}>
              <GoX aria-hidden="true" className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Account ka ek nazar me haal */}
      <div className="animate-rise-in delay-step-1 mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard icon={GoStack} label="Total listings" value={String(myListings.length)} />
        <StatCard icon={GoCheckCircle} label="Live" value={String(live)} />
        <StatCard icon={GoClock} label="Review me" value={String(pending)} />
      </div>

      {/* Plan */}
      <div className="animate-rise-in delay-step-2 mt-4 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl tracking-wide">
            <GoCreditCard aria-hidden="true" className="h-5 w-5 text-primary" />
            Plan
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan ? (
              <>
                <span className="font-medium text-foreground">{plan.label}</span> —{" "}
                {plan.credits === null ? "unlimited listings" : `${plan.credits} listing credits`}
                {plan.expiresAt
                  ? `, ${new Date(plan.expiresAt).toLocaleDateString("en-IN")} tak valid`
                  : ", kabhi expire nahi hota"}
              </>
            ) : (
              "Abhi koi active plan nahi hai — pehli listing free hai."
            )}
          </p>
        </div>
        <Link to="/plans" className={plan ? "btn-outline" : "btn-primary"}>
          {plan ? "Plans dekhein" : "Plan lein"}
        </Link>
      </div>

      {/* Password */}
      <div className="animate-rise-in delay-step-3 mt-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl tracking-wide">
              <GoShieldCheck aria-hidden="true" className="h-5 w-5 text-primary" />
              Security
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Password samay-samay par badalte rahein.
            </p>
          </div>
          <button type="button" className="btn-outline" onClick={() => setPwOpen((v) => !v)}>
            <GoKey aria-hidden="true" className="h-4 w-4" />
            {pwOpen ? "Band karein" : "Password badlein"}
          </button>
        </div>

        {pwOpen && (
          <form onSubmit={(e) => void handlePassword(e)} className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="pf-pw-old" className="mb-1.5 block text-sm font-medium">
                Purana password
              </label>
              <input
                id="pf-pw-old"
                required
                type="password"
                className="field"
                value={pw.current}
                onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="pf-pw-new" className="mb-1.5 block text-sm font-medium">
                Naya password
              </label>
              <input
                id="pf-pw-new"
                required
                type="password"
                minLength={6}
                className="field"
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="pf-pw-confirm" className="mb-1.5 block text-sm font-medium">
                Dobara likhein
              </label>
              <input
                id="pf-pw-confirm"
                required
                type="password"
                minLength={6}
                className="field"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-3">
              <button type="submit" disabled={savingPw} className="btn-primary disabled:opacity-60">
                <GoCheckCircle aria-hidden="true" className="h-4 w-4" />
                {savingPw ? "Save ho raha hai..." : "Password save karein"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Shortcuts + logout */}
      <div className="animate-rise-in delay-step-4 mt-4 flex flex-wrap gap-3 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <Link to="/dashboard" className="btn-outline">
          <GoProject aria-hidden="true" className="h-4 w-4" />
          Meri listings
        </Link>
        <Link to="/list-property" className="btn-outline">
          <GoPlus aria-hidden="true" className="h-4 w-4" />
          Nayi property post karein
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="btn-outline ml-auto text-destructive hover:border-destructive"
        >
          <GoSignOut aria-hidden="true" className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <div className="card-hover rounded-2xl border border-border bg-card p-5 shadow-soft">
      <Icon aria-hidden="true" className="h-6 w-6 text-primary" />
      <p className="mt-2 font-display text-2xl">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  GoAlertFill,
  GoCheck,
  GoDeviceMobile,
  GoEye,
  GoEyeClosed,
  GoHomeFill,
  GoKey,
  GoMail,
  GoPerson,
  GoPersonAdd,
  GoSearch,
  GoTag,
  GoZap,
} from "react-icons/go";
import { AuthLayout, type AuthPoint } from "@/components/auth-layout";
import { useAuth } from "@/lib/auth";

const points: AuthPoint[] = [
  {
    icon: GoSearch,
    title: "Poora Indore ek search me",
    text: "Flat, room, dukaan, PG aur zameen — sab listings khul jaati hain.",
  },
  {
    icon: GoTag,
    title: "Bilkul free",
    text: "Na registration fee, na brokerage. Pehli listing bhi free.",
  },
  {
    icon: GoZap,
    title: "24 ghante me approval",
    text: "Property daali ho to admin verify karke jaldi live kar dete hain.",
  },
];

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Free Account | Indore Dera" },
      {
        name: "description",
        content:
          "Indore Dera par free account banayein — properties save karein, owner se seedha baat karein aur apni listing manage karein.",
      },
      { property: "og:title", content: "Free Account Banayein | Indore Dera" },
      {
        property: "og:description",
        content: "Indore Dera par free register karein aur bina brokerage rental shuru karein.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { user, ready, register } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
    role: "tenant" as "tenant" | "owner",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: redirect ?? "/", replace: true });
  }, [ready, user, redirect, navigate]);

  const confirmState = !form.confirm ? null : form.confirm === form.password ? "match" : "mismatch";

  function set<K extends keyof typeof form>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError("Dono password ek jaise nahi hain.");
      return;
    }

    setBusy(true);
    try {
      await register({
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate({ to: redirect ?? "/", replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Account nahi ban paaya, dobara koshish karein.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      badge="Free register"
      title="Free account banayein"
      subtitle="Ek baar register karein — properties dekhein aur owner se seedha judein. Koi brokerage nahi."
      points={points}
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        {error && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <GoAlertFill aria-hidden="true" className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <fieldset>
          <legend className="mb-1.5 block text-sm font-medium">Aap kaun hain?</legend>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                {
                  value: "tenant",
                  label: "Kirayedar",
                  icon: GoPerson,
                  hint: "Property dhoondh raha hoon",
                },
                {
                  value: "owner",
                  label: "Owner",
                  icon: GoHomeFill,
                  hint: "Property kiraye par deni hai",
                },
              ] as const
            ).map((r) => (
              <label
                key={r.value}
                className={
                  form.role === r.value
                    ? "cursor-pointer rounded-xl border-2 border-primary bg-secondary p-3 text-center"
                    : "cursor-pointer rounded-xl border border-border p-3 text-center hover:border-primary"
                }
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={form.role === r.value}
                  onChange={() => setForm((f) => ({ ...f, role: r.value }))}
                  className="sr-only"
                />
                <r.icon aria-hidden="true" className="mx-auto h-5 w-5 text-primary" />
                <span className="mt-1 block text-sm font-semibold">{r.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{r.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            Aapka naam
          </label>
          <div className="relative">
            <GoPerson
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              className="field pl-11"
              placeholder="Rakesh Patidar"
              value={form.name}
              onChange={set("name")}
            />
          </div>
        </div>

        {/* Card ab chaudi hai, isliye chhote fields do-do karke — form
            chhota dikhta hai aur scroll kam hota hai. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
              Mobile number
            </label>
            <div className="relative">
              <GoDeviceMobile
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="phone"
                name="phone"
                required
                type="tel"
                autoComplete="tel"
                className="field pl-11"
                placeholder="8962504009"
                value={form.phone}
                onChange={set("phone")}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <GoMail
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="email"
                name="email"
                required
                type="email"
                autoComplete="email"
                className="field pl-11"
                placeholder="rakesh@gmail.com"
                value={form.email}
                onChange={set("email")}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <GoKey
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="password"
              name="password"
              required
              minLength={6}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="field pl-11 pr-12"
              placeholder="Kam se kam 6 character"
              value={form.password}
              onChange={set("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Password chhupayein" : "Password dikhayein"}
              className="absolute inset-y-0 right-3 flex items-center text-primary"
            >
              {showPassword ? <GoEyeClosed className="h-4 w-4" /> : <GoEye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
            Password dobara
          </label>
          <div className="relative">
            <GoKey
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="confirm"
              name="confirm"
              required
              minLength={6}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="field pl-11"
              placeholder="Password confirm karein"
              value={form.confirm}
              onChange={set("confirm")}
            />
          </div>
          {/* Submit karne par hi pata chalta tha ki password match nahi hua —
              ab likhte-likhte dikh jaata hai. */}
          {confirmState && (
            <p
              className={`mt-1.5 flex items-center gap-1.5 text-xs ${
                confirmState === "match" ? "text-brand-green" : "text-destructive"
              }`}
            >
              {confirmState === "match" ? (
                <GoCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <GoAlertFill aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              )}
              {confirmState === "match" ? "Password match ho gaya" : "Dono password alag hain"}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="btn-primary mt-2 w-full disabled:opacity-60"
        >
          <GoPersonAdd aria-hidden="true" className="h-4 w-4" />
          {busy ? "Account ban raha hai..." : "Account banayein"}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Account banate hi aap hamari{" "}
          <Link to="/terms" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          aur{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>{" "}
          se sehmat hote hain.
        </p>

        <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
          Pehle se account hai?{" "}
          <Link
            to="/login"
            search={{ redirect }}
            className="font-semibold text-primary hover:underline"
          >
            Login karein
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

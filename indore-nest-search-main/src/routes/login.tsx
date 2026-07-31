import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  GoAlertFill,
  GoCommentDiscussion,
  GoEye,
  GoEyeClosed,
  GoKey,
  GoPerson,
  GoProject,
  GoSignIn,
  GoTag,
} from "react-icons/go";
import { AuthLayout, type AuthPoint } from "@/components/auth-layout";
import { useAuth } from "@/lib/auth";

const points: AuthPoint[] = [
  {
    icon: GoTag,
    title: "Zero brokerage",
    text: "Kirayedaar ko ek rupaya commission nahi deni padti.",
  },
  {
    icon: GoCommentDiscussion,
    title: "Seedha owner se baat",
    text: "Call ya WhatsApp — beech me koi agent nahi.",
  },
  {
    icon: GoProject,
    title: "Apni listings ek jagah",
    text: "Dashboard se apni property edit ya hata sakte hain.",
  },
];

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Indore Dera" },
      {
        name: "description",
        content:
          "Indore Dera account me login karein — apni listings, saved properties aur enquiries ek jagah manage karein.",
      },
      { property: "og:title", content: "Login | Indore Dera" },
      {
        property: "og:description",
        content: "Apne Indore Dera account me login karein aur rental journey continue karein.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, ready, login } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: redirect ?? "/", replace: true });
  }, [ready, user, redirect, navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login({ identifier, password });
      navigate({ to: redirect ?? "/", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login nahi ho paaya, dobara koshish karein.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      badge="Login"
      title="Wapas swagat hai"
      subtitle="Apne Indore Dera account me login karke listings aur enquiries manage karein."
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

        <div>
          <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium">
            Email ya mobile number
          </label>
          <div className="relative">
            <GoPerson
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="identifier"
              name="identifier"
              required
              autoComplete="username"
              className="field pl-11"
              placeholder="rakesh@gmail.com ya 8962504009"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
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
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="field pl-11 pr-12"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <button
          type="submit"
          disabled={busy}
          className="btn-primary mt-2 w-full disabled:opacity-60"
        >
          <GoSignIn aria-hidden="true" className="h-4 w-4" />
          {busy ? "Login ho raha hai..." : "Login karein"}
        </button>

        <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
          Naya account chahiye?{" "}
          <Link
            to="/register"
            search={{ redirect }}
            className="font-semibold text-primary hover:underline"
          >
            Register karein
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

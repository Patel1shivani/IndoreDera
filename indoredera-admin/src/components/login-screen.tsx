import { useState } from "react";
import { demoCredentials, useAdminAuth } from "../lib/auth";
import { Icons } from "../lib/icons";
import { useStore } from "../lib/store";

export function LoginScreen() {
  const { login } = useAdminAuth();
  const { loading, users, error: storeError } = useStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(identifier, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login nahi ho paaya.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#540404] to-[#2a0a0a] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <img
            src="/logo.png"
            alt="Indore Dera"
            className="mx-auto h-24 w-24 rounded-2xl bg-white/95 object-contain p-1"
          />
          <p className="mt-4 font-display text-2xl tracking-wide text-white">
            Indore Dera <span className="text-sidebar-soft">Admin</span>
          </p>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-sidebar-soft">
            <Icons.lock aria-hidden="true" className="h-3.5 w-3.5" />
            Control panel me aane ke liye login karein
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          {(error || storeError) && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-brand/30 bg-brand-soft px-3 py-2.5 text-sm text-brand"
            >
              <Icons.alert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              {error ?? storeError}
            </p>
          )}

          {!loading && users.length === 0 && !storeError && (
            <p className="flex items-start gap-2 rounded-lg border border-warn/40 bg-warn-soft px-3 py-2.5 text-sm">
              <Icons.info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              Data server par abhi koi user nahi hai. Ek baar website kholein — wo demo admin
              account bana degi.
            </p>
          )}

          <div>
            <label className="label" htmlFor="id">
              Email ya mobile
            </label>
            <div className="relative">
              <Icons.tenant
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
              />
              <input
                id="id"
                required
                autoComplete="username"
                className="input pl-9"
                placeholder="admin@indoredera.in"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="pw">
              Password
            </label>
            <div className="relative">
              <Icons.key
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
              />
              <input
                id="pw"
                required
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="input px-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={showPassword ? "Password chhupayein" : "Password dikhayein"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-soft transition-colors hover:bg-surface hover:text-ink"
              >
                {showPassword ? (
                  <Icons.hide className="h-4 w-4" />
                ) : (
                  <Icons.show className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={busy || loading} className="btn btn-primary w-full">
            <Icons.lock className="h-4 w-4" />
            {busy ? "Login ho raha hai..." : "Login"}
          </button>

          {/* Demo shortcut — production me hata dena hai */}
          <button
            type="button"
            className="btn btn-ghost w-full"
            onClick={() => {
              setIdentifier(demoCredentials.email);
              setPassword(demoCredentials.password);
            }}
          >
            <Icons.zap className="h-4 w-4" />
            Demo credentials bharein
          </button>
        </form>
      </div>
    </div>
  );
}

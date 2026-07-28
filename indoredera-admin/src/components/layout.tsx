import { useState, type ReactNode } from "react";
import { API_BASE } from "../lib/api";
import { useAdminAuth } from "../lib/auth";
import { Icons } from "../lib/icons";
import { useStore } from "../lib/store";
import { isPlanActive } from "../lib/types";
import { pageGroups, pages, type PageId } from "../pages/registry";
import { Avatar } from "./ui";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "http://localhost:8080";

export function Layout({
  current,
  onNavigate,
  children,
}: {
  current: PageId;
  onNavigate: (id: PageId) => void;
  children: ReactNode;
}) {
  const { admin, logout } = useAdminAuth();
  const { siteData, users, error, refresh } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // sidebar par pending kaam ka counter dikhate hain
  const pendingListings = siteData?.listings.filter((p) => p.status === "pending").length ?? 0;
  const pendingFeedback = siteData?.testimonials.filter((t) => t.status === "pending").length ?? 0;
  const activePlans = users.filter((u) => isPlanActive(u.plan)).length;

  const badges: Partial<Record<PageId, { count: number; urgent: boolean }>> = {
    listings: { count: pendingListings, urgent: true },
    testimonials: { count: pendingFeedback, urgent: true },
    users: { count: users.length, urgent: false },
    subscriptions: { count: activePlans, urgent: false },
  };

  const activePage = pages.find((p) => p.id === current);
  const todo = pendingListings + pendingFeedback;

  const nav = (
    <nav className="flex flex-col gap-5">
      {pageGroups.map((group) => (
        <div key={group}>
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-sidebar-soft/80">
            {group}
          </p>
          <div className="flex flex-col gap-0.5">
            {pages
              .filter((p) => p.group === group)
              .map((p) => {
                const badge = badges[p.id];
                const isActive = p.id === current;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onNavigate(p.id);
                      setMobileOpen(false);
                    }}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white/18 font-semibold text-white"
                        : "text-sidebar-soft hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {/* active indicator — left edge par patli patti */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-warn"
                      />
                    )}
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{p.label}</span>
                    {badge && badge.count > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          badge.urgent ? "bg-warn text-ink" : "bg-white/15 text-white"
                        }`}
                      >
                        {badge.count}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </nav>
  );

  const sidebarInner = (
    <>
      <SidebarBrand />
      <div className="mt-6 flex-1 overflow-y-auto">{nav}</div>
      <SidebarFooter siteUrl={SITE_URL} apiBase={API_BASE} />
    </>
  );

  /* Gehra maroon-black. Gradient bahut halka rakha hai — pehle ye zyada bright
     tha aur uspar sidebar text ghul jaata tha. */
  const sidebarBg = "bg-gradient-to-b from-[#540404] to-[#e0baba]";

  return (
    <div className="min-h-screen lg:flex">
      <aside className={`hidden w-64 shrink-0 flex-col px-4 py-5 lg:flex ${sidebarBg}`}>
        {sidebarInner}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Menu band karein"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className={`absolute inset-y-0 left-0 flex w-64 flex-col px-4 py-5 ${sidebarBg}`}>
            {sidebarInner}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-panel/85 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setMobileOpen(true)}
              className="btn btn-ghost px-2.5 lg:hidden"
            >
              <Icons.menu className="h-4 w-4" />
            </button>

            {activePage && (
              <>
                <span
                  aria-hidden="true"
                  className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand sm:flex"
                >
                  <activePage.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h1 className="truncate text-lg leading-tight tracking-wide">
                    {activePage.label}
                  </h1>
                  <p className="truncate text-xs text-ink-soft">{activePage.description}</p>
                </div>
              </>
            )}

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              {todo > 0 && (
                <span className="hidden items-center gap-1.5 rounded-full border border-warn/45 bg-warn-soft px-2.5 py-1 text-xs font-semibold text-[oklch(0.45_0.11_60)] md:inline-flex">
                  <Icons.bell aria-hidden="true" className="h-3.5 w-3.5" />
                  {todo} pending
                </span>
              )}

              <button
                type="button"
                onClick={() => void refresh()}
                title="Data dobara load karein"
                aria-label="Refresh"
                className="btn btn-ghost px-2.5"
              >
                <Icons.refresh className="h-4 w-4" />
              </button>

              <a
                href={SITE_URL}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost hidden sm:inline-flex"
              >
                Site kholein
                <Icons.external className="h-3.5 w-3.5" />
              </a>

              {admin && (
                <div className="flex items-center gap-2.5 rounded-full border border-line bg-surface py-1 pl-1 pr-1.5">
                  <Avatar name={admin.name} size="sm" />
                  <div className="hidden leading-tight sm:block">
                    <p className="text-sm font-semibold">{admin.name}</p>
                    <p className="text-[11px] text-ink-soft">{admin.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    title="Logout"
                    aria-label="Logout"
                    className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-brand-soft hover:text-brand"
                  >
                    <Icons.logout className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {error && (
          <p className="flex items-center gap-2 border-b border-brand/30 bg-brand-soft px-4 py-2.5 text-sm font-medium text-brand sm:px-6">
            <Icons.alert aria-hidden="true" className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/8 px-2.5 py-2.5">
      {/* logo ka background transparent nahi hai, isliye halka sa panel de dete hain */}
      <img
        src="/logo.png"
        alt="Indore Dera"
        className="h-11 w-11 rounded-lg bg-white object-contain p-0.5"
      />
      <div className="min-w-0">
        <p className="font-display text-lg leading-tight tracking-wide text-white">Indore Dera</p>
        <p className="flex items-center gap-1 text-[11px] text-sidebar-soft">
          <Icons.shield aria-hidden="true" className="h-3 w-3" />
          Admin panel
        </p>
      </div>
    </div>
  );
}

function SidebarFooter({ siteUrl, apiBase }: { siteUrl: string; apiBase: string }) {
  return (
    <div className="mt-5 space-y-1 rounded-xl bg-white/6 px-3 py-2.5 text-[11px] leading-relaxed text-sidebar-soft">
      <p className="flex items-center gap-1.5">
        <Icons.globe aria-hidden="true" className="h-3 w-3 shrink-0 text-ok" />
        Site <span className="truncate text-white">{siteUrl.replace("http://", "")}</span>
      </p>
      <p className="flex items-center gap-1.5">
        <Icons.database aria-hidden="true" className="h-3 w-3 shrink-0 text-ok" />
        Data <span className="truncate text-white">{apiBase.replace("http://", "")}</span>
      </p>
    </div>
  );
}

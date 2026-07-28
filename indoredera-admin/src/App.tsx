import { useState } from "react";
import { Layout } from "./components/layout";
import { LoginScreen } from "./components/login-screen";
import { EmptyState } from "./components/ui";
import { AuthProvider, useAdminAuth } from "./lib/auth";
import { Icons } from "./lib/icons";
import { StoreProvider, useStore } from "./lib/store";
import { BannersPage } from "./pages/banners-page";
import { ContentPage } from "./pages/content-page";
import { DashboardPage } from "./pages/dashboard-page";
import { GuidePage } from "./pages/guide-page";
import { ListingsPage } from "./pages/listings-page";
import { PlansPage } from "./pages/plans-page";
import { SubscriptionsPage } from "./pages/subscriptions-page";
import { TestimonialsPage } from "./pages/testimonials-page";
import { UsersPage } from "./pages/users-page";
import type { PageId } from "./pages/registry";

/*
 * Indore Dera Admin — standalone app.
 *
 * Website (localhost:8080) se poori tarah alag hai. Beech me sirf shared data
 * server (localhost:4000) hai — dono usi ko padhte-likhte hain.
 */
export function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </StoreProvider>
  );
}

function Gate() {
  const { admin } = useAdminAuth();
  const [page, setPage] = useState<PageId>("dashboard");

  if (!admin) return <LoginScreen />;

  return (
    <Layout current={page} onNavigate={setPage}>
      <PageBody page={page} onNavigate={setPage} />
    </Layout>
  );
}

function PageBody({ page, onNavigate }: { page: PageId; onNavigate: (id: PageId) => void }) {
  const { loading, empty } = useStore();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-line bg-panel" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl border border-line bg-panel" />
      </div>
    );
  }

  // server chal raha hai par usme abhi kuch hai nahi
  if (empty) {
    return (
      <EmptyState
        icon={Icons.database}
        title="Data server abhi khaali hai"
        hint="Ek baar website (localhost:8080) kholein — wo default content server par bhej degi, phir yahan sab dikhne lagega."
      />
    );
  }

  switch (page) {
    case "dashboard":
      return <DashboardPage onNavigate={onNavigate} />;
    case "guide":
      return <GuidePage onNavigate={onNavigate} />;
    case "listings":
      return <ListingsPage />;
    case "users":
      return <UsersPage />;
    case "subscriptions":
      return <SubscriptionsPage />;
    case "banners":
      return <BannersPage />;
    case "content":
      return <ContentPage />;
    case "testimonials":
      return <TestimonialsPage />;
    case "plans":
      return <PlansPage onNavigate={onNavigate} />;
  }
}

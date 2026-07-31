import { useCallback, useState } from "react";
import { Layout } from "./components/layout";
import { LoginScreen } from "./components/login-screen";
import { EmptyState } from "./components/ui";
import { AuthProvider, useAdminAuth } from "./lib/auth";
import { Icons } from "./lib/icons";
import { StoreProvider, useStore } from "./lib/store";
import { UnsavedProvider, useUnsaved } from "./lib/unsaved";
import { AboutPage } from "./pages/about-page";
import { BannersPage } from "./pages/banners-page";
import { ContactPage } from "./pages/contact-page";
import { ContentPage } from "./pages/content-page";
import { DashboardPage } from "./pages/dashboard-page";
import { GuidePage } from "./pages/guide-page";
import { HomeTextPage } from "./pages/home-text-page";
import { LegalPagesPage } from "./pages/legal-pages";
import { ListingsPage } from "./pages/listings-page";
import { PlansPage } from "./pages/plans-page";
import { SubscriptionsPage } from "./pages/subscriptions-page";
import { TestimonialsPage } from "./pages/testimonials-page";
import { UsersPage } from "./pages/users-page";
import type { PageId } from "./pages/registry";

/*
 * Indore Dera Admin — standalone app.
 *
 * Website (localhost:8080) se poori tarah alag hai. Beech me sirf backend
 * (localhost:4000) hai — dono usi ko padhte-likhte hain.
 *
 * AuthProvider bahar hai aur StoreProvider login ke BAAD mount hota hai: admin
 * data (users, pending listings) ke liye server ko JWT chahiye, isliye login se
 * pehle usse maangne ka koi matlab nahi — sirf 401 aata.
 */
export function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { admin, ready } = useAdminAuth();

  // purana token verify hone tak login screen flash na ho
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#540404] to-[#2a0a0a]">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-white/20" />
      </div>
    );
  }

  if (!admin) return <LoginScreen />;

  return (
    <StoreProvider>
      <UnsavedProvider>
        <Panel />
      </UnsavedProvider>
    </StoreProvider>
  );
}

function Panel() {
  const [page, setPage] = useState<PageId>("dashboard");
  const { confirmLeave } = useUnsaved();

  /* Content pages par Save button hai, isliye admin bina save kiye doosre page
     par ja sakta hai. Aisa hone se pehle ek baar poochh lete hain — warna uska
     likha hua chup-chaap gayab ho jaata. */
  const navigate = useCallback(
    (next: PageId) => {
      if (confirmLeave()) setPage(next);
    },
    [confirmLeave],
  );

  return (
    <Layout current={page} onNavigate={navigate}>
      <PageBody page={page} onNavigate={navigate} />
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

  // server chal raha hai par database khaali hai
  if (empty) {
    return (
      <EmptyState
        icon={Icons.database}
        title="Database abhi khaali hai"
        hint='indoredera-api folder me "npm run seed" chalayein — wo default content (listings, banners, plans) bana dega.'
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
    case "home-text":
      return <HomeTextPage />;
    case "about":
      return <AboutPage />;
    case "contact":
      return <ContactPage />;
    case "legal":
      return <LegalPagesPage />;
    case "testimonials":
      return <TestimonialsPage />;
    case "plans":
      return <PlansPage onNavigate={onNavigate} />;
  }
}

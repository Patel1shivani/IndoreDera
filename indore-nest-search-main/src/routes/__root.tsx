import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/lib/auth";
import { fetchSiteContent, SiteDataProvider } from "@/lib/site-data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { IntroSplash } from "@/components/intro-splash";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Indore Dera — Indore ka Rental Platform" },
      {
        name: "description",
        content:
          "Indore me flat, room, shop, PG aur zameen kiraye par — seedha owner se baat, bina brokerage.",
      },
      { name: "author", content: "Indore Dera" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Mukta:wght@300;400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.webp", type: "image/webp" },
    ],
  }),
  /* Site ka text (hero, about, legal, FAQ) server par hi le aate hain, taaki
     wo pehle HTML me maujood ho — warna About/Privacy/Terms crawler ko khaali
     dikhte, kyunki data client par mount hone ke baad aata hai.

     Loader ke paas user ka token nahi hota (wo localStorage me hai), isliye ye
     hamesha guest wala view hai; login ke hisaab se badalne wala hissa client
     par SiteDataProvider dobara maang leta hai. Isi wajah se staleTime Infinity
     hai — har navigation par dobara fetch karne ka koi fayda nahi. */
  loader: () => fetchSiteContent(),
  staleTime: Number.POSITIVE_INFINITY,
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const content = Route.useLoaderData();

  return (
    <QueryClientProvider client={queryClient}>
      {/* AuthProvider bahar hai: login/logout par site content dobara load hota
          hai (owner ko apni draft/pending listings dikhni chahiye), isliye
          SiteDataProvider ko session ke andar rehna chahiye. */}
      <AuthProvider>
        <SiteDataProvider initial={content}>
          {/* Pehli baar site khulne par sitare wala intro */}
          <IntroSplash />
          {/* pb-20: mobile par niche fixed tab bar hai, uske peeche content
              chhup na jaye. Desktop par bar nahi hai to padding bhi nahi. */}
          <div className="flex min-h-screen flex-col pb-20 md:pb-0">
            <SiteHeader />
            {/* overflow-x-clip (hidden nahi) — reveal animations me elements
                thoda side se aate hain, unse page horizontally scroll na ho.
                clip scroll container nahi banata, isliye sticky header aur
                dropdowns waise ke waise chalte hain. */}
            <main className="flex-1 overflow-x-clip">
              {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
              <Outlet />
            </main>
            <SiteFooter />
          </div>
          <MobileTabBar />
          {/* Alerts right side me — center me nahi, taaki content block na ho.
              richColors jaan-boojh kar band hai: styling styles.css se aati hai. */}
          <Toaster position="top-right" closeButton />
        </SiteDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import {
  GoListUnordered,
  GoPlus,
  GoProject,
  GoSearch,
  GoSignIn,
  GoSignOut,
  GoX,
} from "react-icons/go";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useSiteData } from "@/lib/site-data";
import logo from "../assets/logo.png";

const nav = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Sab dekho" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

/* Plain text links — active hone par sirf rang badalta hai aur niche patli line
   aati hai. Pehle har link ek pill tha, isliye header box-box lag raha tha. */
const navLinkClass =
  "relative rounded-md px-1 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary [&.active]:text-primary [&.active]:after:absolute [&.active]:after:inset-x-1 [&.active]:after:-bottom-0.5 [&.active]:after:h-0.5 [&.active]:after:rounded-full [&.active]:after:bg-primary";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { user, ready, logout } = useAuth();
  const { data } = useSiteData();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setOpen(false);
    navigate({ to: "/", replace: true });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    navigate({ to: "/properties", search: { q: q || undefined } });
  }

  const firstName = user?.name.split(" ")[0] ?? "";
  const initials = user?.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-18">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img src={logo} alt={`${data.hero.logoText} logo`} className="h-24 w-24 object-contain" />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-lg tracking-wide text-primary">
              {data.hero.logoText}
            </span>
            <span className="text-[11px] text-muted-foreground">{data.hero.logoTagline}</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={navLinkClass}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Search ab soft pill hai — alag box jaisa nahi lagta, focus par thoda khulta hai */}
          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <GoSearch
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              aria-label="Search properties"
              placeholder="Room, 2 BHK, Vijay Nagar..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-56 rounded-full border border-transparent bg-secondary/70 py-2 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-muted-foreground/80 focus:w-72 focus:border-primary/40 focus:bg-card"
            />
          </form>

          {/* Guest: auth links pehle, CTA sabse right me. Logged-in: CTA pehle,
              avatar sabse right me — dono jagah sabse zaroori cheez kinare par. */}
          {ready && !user && (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                to="/login"
                search={{ redirect: undefined }}
                className={`${navLinkClass} inline-flex items-center gap-1.5`}
              >
                <GoSignIn aria-hidden="true" className="h-4 w-4" />
                Login
              </Link>
              <Link to="/register" search={{ redirect: undefined }} className="btn-outline">
                Register
              </Link>
            </div>
          )}

          <Link to="/list-property" className="btn-primary hidden sm:inline-flex">
            <GoPlus aria-hidden="true" className="h-4 w-4" />
            List Property
          </Link>

          {/* hydration ke pehle kuch na dikhayein, warna SSR mismatch hota hai */}
          {ready && user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-0.5 pr-2 outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {initials}
                </span>
                <span className="hidden text-sm font-medium lg:inline">{firstName}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block">{user.name}</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <GoProject className="mr-2 h-4 w-4" />
                    Meri listings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <GoSignOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2 text-foreground/70 hover:bg-secondary hover:text-primary md:hidden"
          >
            {open ? <GoX className="h-5 w-5" /> : <GoListUnordered className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <GoSearch
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              aria-label="Search properties"
              placeholder="Room, 2 BHK, Vijay Nagar..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </form>

          <nav className="mt-4 flex flex-col">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-primary [&.active]:text-primary"
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 border-t border-border pt-4">
            {ready &&
              (user ? (
                <>
                  <p className="px-3 text-sm font-semibold">{user.name}</p>
                  <p className="px-3 text-xs text-muted-foreground">{user.email}</p>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="mt-2 flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary"
                  >
                    <GoProject className="mr-2 h-4 w-4" />
                    Meri listings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary"
                  >
                    <GoSignOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    search={{ redirect: undefined }}
                    onClick={() => setOpen(false)}
                    className="btn-outline"
                  >
                    <GoSignIn aria-hidden="true" className="h-4 w-4" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    search={{ redirect: undefined }}
                    onClick={() => setOpen(false)}
                    className="btn-primary"
                  >
                    Register
                  </Link>
                </div>
              ))}

            <Link
              to="/list-property"
              onClick={() => setOpen(false)}
              className="btn-primary mt-3 w-full"
            >
              <GoPlus aria-hidden="true" className="h-4 w-4" />
              List Your Property
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

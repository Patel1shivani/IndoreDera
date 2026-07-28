import { Link } from "@tanstack/react-router";
import { GoDeviceMobile, GoInfo, GoLocation, GoMail, GoPlus, GoSearch } from "react-icons/go";
import logo from "../assets/logo.png";
import { propertyTypes } from "@/lib/properties";

/* Company column ke links — har link ka apna Octicon. */
const companyLinks = [
  { to: "/about", label: "About Us", icon: GoInfo },
  { to: "/contact", label: "Contact", icon: GoMail },
  { to: "/list-property", label: "List Your Property", icon: GoPlus },
  { to: "/properties", label: "Browse Rentals", icon: GoSearch },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t-4 border-accent bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src={logo} alt="Indore Dera" className="h-36 w-36 object-contain" />
          <p className="-mt-8 text-sm text-primary-foreground/80">
            Indore ka apna rental platform — flats, rooms, shops, PG aur zameen, sab ek jagah.
          </p>
        </div>
        <div>
          <h3 className="font-display text-lg tracking-wide">Categories</h3>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            {propertyTypes.map((t) => (
              <li key={t.value}>
                <Link
                  to="/properties"
                  search={{ type: t.value }}
                  className="flex items-center gap-2 hover:text-accent"
                >
                  <t.icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-lg tracking-wide">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            {companyLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="flex items-center gap-2 hover:text-accent">
                  <l.icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-lg tracking-wide">Reach Us</h3>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
            <li className="flex items-start gap-2">
              <GoLocation aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              Vijay Nagar, Indore, MP 452010
            </li>
            <li className="flex items-center gap-2">
              <GoDeviceMobile aria-hidden="true" className="h-4 w-4 shrink-0" />
              <a href="tel:+919826000000" className="hover:text-accent">
                +91 98260 00000
              </a>
            </li>
            <li className="flex items-center gap-2">
              <GoMail aria-hidden="true" className="h-4 w-4 shrink-0" />
              <a href="mailto:hello@indoredera.in" className="hover:text-accent">
                hello@indoredera.in
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 py-4 text-center text-xs text-primary-foreground/70">
        © {new Date().getFullYear()} Indore Dera · अपना घर, अपना शहर
      </div>
    </footer>
  );
}

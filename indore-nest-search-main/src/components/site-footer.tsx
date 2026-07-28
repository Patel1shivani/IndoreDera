import { Link } from "@tanstack/react-router";
import {
  GoDeviceMobile,
  GoInfo,
  GoLaw,
  GoLocation,
  GoMail,
  GoPlus,
  GoSearch,
  GoShieldCheck,
} from "react-icons/go";
import logo from "../assets/logo.png";
import { propertyTypes } from "@/lib/properties";

/* Company column ke links — har link ka apna Octicon. */
const companyLinks = [
  { to: "/about", label: "About Us", icon: GoInfo },
  { to: "/contact", label: "Contact", icon: GoMail },
  { to: "/list-property", label: "List Your Property", icon: GoPlus },
  { to: "/properties", label: "Browse Rentals", icon: GoSearch },
] as const;

/* Legal column — policy pages. */
const legalLinks = [
  { to: "/privacy", label: "Privacy Policy", icon: GoShieldCheck },
  { to: "/terms", label: "Terms & Conditions", icon: GoLaw },
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
              <a href="tel:+918962504009" className="hover:text-accent">
                +91 8962504009
              </a>
            </li>
            <li className="flex items-center gap-2">
              <GoMail aria-hidden="true" className="h-4 w-4 shrink-0" />
              <a href="mailto:shivimukati74@gmail.com" className="hover:text-accent">
                shivimukati74@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 text-xs text-primary-foreground/70 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Indore Dera · अपना घर, अपना शहर</p>
          <ul className="flex items-center gap-4">
            {legalLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="flex items-center gap-1.5 hover:text-accent">
                  <l.icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "@tanstack/react-router";
import { GoLocation, GoStarFill } from "react-icons/go";
import { formatRent, propertyTypes, type Property } from "@/lib/properties";

export function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  const type = propertyTypes.find((t) => t.value === property.type);
  const TypeIcon = type?.icon;

  return (
    <Link
      to="/properties/$propertyId"
      params={{ propertyId: property.id }}
      /* grid me har card thoda-thoda late aata hai — stagger effect */
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
      className="card-hover group animate-rise-in flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="badge-accent absolute left-3 top-3 inline-flex items-center gap-1.5">
          {TypeIcon && <TypeIcon aria-hidden="true" className="h-4 w-4" />}
          {type?.label}
        </span>
        {property.featured && (
          <span className="badge-green absolute right-3 top-3 inline-flex items-center gap-1.5">
            <GoStarFill aria-hidden="true" className="h-3.5 w-3.5 animate-soft-float" />
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg leading-snug tracking-wide text-foreground">
          {property.title}
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <GoLocation aria-hidden="true" className="h-4 w-4 shrink-0" />
          {property.locality}, Indore · {property.area}
        </p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="font-display text-xl text-primary">{formatRent(property.rent)}</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {property.furnishing}
          </span>
        </div>
      </div>
    </Link>
  );
}

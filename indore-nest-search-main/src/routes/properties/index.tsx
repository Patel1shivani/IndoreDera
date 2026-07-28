import { createFileRoute, Link } from "@tanstack/react-router";
import { GoFilter, GoPlus, GoSearch, GoTelescope, GoTrash, GoX } from "react-icons/go";
import { LoginGate } from "@/components/login-gate";
import { PropertyCard } from "@/components/property-card";
import { useAuth } from "@/lib/auth";
import { localities, matchesQuery, propertyTypes } from "@/lib/properties";
import { publicListings, useSiteData } from "@/lib/site-data";

type Search = {
  q?: string;
  type?: string;
  locality?: string;
  bhk?: string;
  budget?: number;
  minBudget?: number;
  furnishing?: string;
};

const bhkOptions = ["1 BHK", "2 BHK", "3 BHK", "4 BHK"];
const furnishingOptions = ["Furnished", "Semi-Furnished", "Unfurnished"];

const priceBands = [
  { label: "Upto ₹5,000", min: undefined, max: 5000 },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000 – ₹20,000", min: 10000, max: 20000 },
  { label: "₹20,000 – ₹50,000", min: 20000, max: 50000 },
  { label: "₹50,000+", min: 50000, max: undefined },
];

export const Route = createFileRoute("/properties/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search.q === "string" ? search.q : undefined,
    type: typeof search.type === "string" ? search.type : undefined,
    locality: typeof search.locality === "string" ? search.locality : undefined,
    bhk: typeof search.bhk === "string" ? search.bhk : undefined,
    furnishing: typeof search.furnishing === "string" ? search.furnishing : undefined,
    budget: search.budget ? Number(search.budget) : undefined,
    minBudget: search.minBudget ? Number(search.minBudget) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Rental Properties in Indore — Flats, Rooms, Shops, PG" },
      {
        name: "description",
        content:
          "Browse verified rental listings across Indore — Vijay Nagar, Palasia, Nipania, Rau aur more. Filter by keyword, type, locality, BHK and budget.",
      },
      { property: "og:title", content: "Rental Properties in Indore | Indore Dera" },
      {
        property: "og:description",
        content: "Indore rentals ko keyword, type, locality aur budget se filter karein.",
      },
    ],
  }),
  component: PropertiesPage,
});

function PropertiesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { user, ready } = useAuth();
  const { data } = useSiteData();

  const setFilter = (patch: Search) =>
    navigate({ search: (prev: Search) => ({ ...prev, ...patch }) });

  const results = publicListings(data.listings).filter((p) => {
    if (search.q && !matchesQuery(p, search.q)) return false;
    if (search.type && p.type !== search.type) return false;
    if (search.locality && p.locality !== search.locality) return false;
    if (search.bhk && p.bhk !== search.bhk) return false;
    if (search.furnishing && p.furnishing !== search.furnishing) return false;
    if (search.budget && p.rent > search.budget) return false;
    if (search.minBudget && p.rent < search.minBudget) return false;
    return true;
  });

  const activeBand = priceBands.find((b) => b.min === search.minBudget && b.max === search.budget);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl tracking-wide sm:text-4xl">Sab dekho — Indore rentals</h1>

      {/* Universal search har waqt dikhta hai, chahe login ho ya na ho */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <label htmlFor="global-q" className="mb-1.5 block text-sm font-medium">
          Kuch bhi dhoondhein
        </label>
        <div className="relative">
          <GoSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="global-q"
            className="field pl-11"
            placeholder="2 BHK Vijay Nagar / dukaan Palasia / PG meals / 10000"
            value={search.q ?? ""}
            onChange={(e) => setFilter({ q: e.target.value || undefined })}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Type, area, road, BHK, rent, amenities — sab ek hi box se match hota hai.
        </p>
      </div>

      {!ready ? (
        <div className="mt-8 h-64 animate-pulse rounded-3xl border border-border bg-card" />
      ) : !user ? (
        <div className="mt-8">
          <LoginGate
            title="Listings dekhne ke liye login karein"
            subtitle="Search sabke liye khula hai, lekin property details, photos aur owner ka number sirf registered users ko dikhte hain."
            redirect="/properties"
          />
        </div>
      ) : (
        <>
          <p className="mt-6 text-muted-foreground">
            {results.length} propert{results.length === 1 ? "y" : "ies"} mili
          </p>

          <div className="mt-4 grid gap-6 lg:grid-cols-[260px_1fr]">
            <aside className="h-max rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-lg tracking-wide">
                  <GoFilter aria-hidden="true" className="h-4 w-4 text-primary" />
                  Filters
                </h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  onClick={() => navigate({ search: {} })}
                >
                  <GoTrash aria-hidden="true" className="h-3.5 w-3.5" />
                  Clear all
                </button>
              </div>

              <FilterGroup label="Property type">
                <select
                  className="field"
                  aria-label="Property type"
                  value={search.type ?? ""}
                  onChange={(e) => setFilter({ type: e.target.value || undefined })}
                >
                  <option value="">All types</option>
                  {propertyTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </FilterGroup>

              <FilterGroup label="Locality">
                <select
                  className="field"
                  aria-label="Locality"
                  value={search.locality ?? ""}
                  onChange={(e) => setFilter({ locality: e.target.value || undefined })}
                >
                  <option value="">All localities</option>
                  {localities.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </FilterGroup>

              <FilterGroup label="BHK">
                <div className="flex flex-wrap gap-2">
                  {bhkOptions.map((b) => (
                    <Chip
                      key={b}
                      active={search.bhk === b}
                      onClick={() => setFilter({ bhk: search.bhk === b ? undefined : b })}
                    >
                      {b}
                    </Chip>
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup label="Budget">
                <div className="flex flex-col gap-2">
                  {priceBands.map((band) => (
                    <Chip
                      key={band.label}
                      active={activeBand?.label === band.label}
                      onClick={() =>
                        setFilter(
                          activeBand?.label === band.label
                            ? { minBudget: undefined, budget: undefined }
                            : { minBudget: band.min, budget: band.max },
                        )
                      }
                    >
                      {band.label}
                    </Chip>
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup label="Furnishing">
                <div className="flex flex-wrap gap-2">
                  {furnishingOptions.map((f) => (
                    <Chip
                      key={f}
                      active={search.furnishing === f}
                      onClick={() =>
                        setFilter({ furnishing: search.furnishing === f ? undefined : f })
                      }
                    >
                      {f}
                    </Chip>
                  ))}
                </div>
              </FilterGroup>
            </aside>

            <div>
              {results.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((p, i) => (
                    <PropertyCard key={p.id} property={p} index={i} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                  <GoTelescope aria-hidden="true" className="mx-auto h-10 w-10 text-primary" />
                  <h2 className="mt-4 text-2xl tracking-wide">Koi property nahi mili</h2>
                  <p className="mt-2 text-muted-foreground">
                    {search.q
                      ? `"${search.q}" ke liye kuch nahi mila. Filters hata kar dobara try karein.`
                      : "Filters badal kar dobara try karein ya apni property list karein."}
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => navigate({ search: {} })}
                    >
                      <GoX aria-hidden="true" className="h-4 w-4" />
                      Clear filters
                    </button>
                    <Link to="/list-property" className="btn-primary">
                      <GoPlus aria-hidden="true" className="h-4 w-4" />
                      List Your Property
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          : "rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
      }
    >
      {children}
    </button>
  );
}

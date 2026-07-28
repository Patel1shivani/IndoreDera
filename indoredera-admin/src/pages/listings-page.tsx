import { useState } from "react";
import {
  Badge,
  Card,
  EmptyState,
  FilterPills,
  IconButton,
  MetaLine,
  SearchInput,
  StatCard,
} from "../components/ui";
import { Icons, type IconType } from "../lib/icons";
import { useStore } from "../lib/store";
import { formatRent, propertyTypeLabels, type ListingStatus, type PropertyType } from "../lib/types";

const filters = ["pending", "approved", "draft", "all"] as const;
type Filter = (typeof filters)[number];

const filterMeta: Record<Filter, { label: string; icon: IconType }> = {
  pending: { label: "Approval pending", icon: Icons.pending },
  approved: { label: "Live", icon: Icons.approve },
  draft: { label: "Drafts", icon: Icons.edit },
  all: { label: "Sab", icon: Icons.filter },
};

const typeIcons: Record<PropertyType, IconType> = {
  flat: Icons.flat,
  room: Icons.room,
  shop: Icons.shop,
  pg: Icons.pg,
  land: Icons.land,
};

export function ListingsPage() {
  const { siteData, setListingStatus, removeListing } = useStore();
  // pending pehle dikhao, par koi pending na ho to khaali screen mat dikhao
  const hasPending = (siteData?.listings ?? []).some((p) => p.status === "pending");
  const [filter, setFilter] = useState<Filter>(hasPending ? "pending" : "all");
  const [q, setQ] = useState("");

  if (!siteData) return null;

  const rows = siteData.listings
    .filter((p) => (filter === "all" ? true : (p.status ?? "approved") === filter))
    .filter((p) =>
      q.trim()
        ? `${p.title} ${p.locality} ${p.ownerName} ${p.type}`.toLowerCase().includes(q.toLowerCase())
        : true,
    );

  const countFor = (f: Filter) =>
    f === "all"
      ? siteData.listings.length
      : siteData.listings.filter((p) => (p.status ?? "approved") === f).length;

  const avgRent = siteData.listings.length
    ? Math.round(siteData.listings.reduce((s, p) => s + p.rent, 0) / siteData.listings.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Live"
          value={countFor("approved")}
          hint="Website par dikh rahi hain"
          icon={Icons.approve}
          tone="ok"
          onClick={() => setFilter("approved")}
        />
        <StatCard
          label="Pending"
          value={countFor("pending")}
          hint={countFor("pending") ? "Approve karna baaki hai" : "Sab clear"}
          icon={Icons.pending}
          tone={countFor("pending") ? "warn" : "plain"}
          onClick={() => setFilter("pending")}
        />
        <StatCard
          label="Featured"
          value={siteData.listings.filter((p) => p.featured).length}
          hint="Homepage par upar aati hain"
          icon={Icons.trophy}
          tone="brand"
        />
        <StatCard
          label="Average rent"
          value={formatRent(avgRent)}
          hint={`${siteData.listings.length} listings par`}
          icon={Icons.zap}
        />
      </div>

      <Card
        icon={Icons.listings}
        title={`${rows.length} listing${rows.length === 1 ? "" : "s"}`}
        subtitle="Approve, hide ya delete karein"
        action={
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Title, area ya owner"
            className="w-full sm:w-64"
          />
        }
      >
        <div className="mb-4">
          <FilterPills<Filter>
            value={filter}
            onChange={setFilter}
            options={filters.map((f) => ({
              value: f,
              label: filterMeta[f].label,
              icon: filterMeta[f].icon,
              count: countFor(f),
            }))}
          />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Icons.listings}
            title="Yahan koi listing nahi"
            hint="Filter badal kar dekhein."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                  <th className="pb-2 font-medium">Property</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Owner</th>
                  <th className="pb-2 font-medium">Rent</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const status = (p.status ?? "approved") as ListingStatus;
                  const TypeIcon = typeIcons[p.type];
                  return (
                    <tr key={p.id} className="border-b border-line/70 last:border-0">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img src={p.image} alt="" className="h-11 w-16 rounded-lg object-cover" />
                            {p.featured && (
                              <span
                                aria-label="Featured"
                                title="Featured"
                                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-warn text-ink"
                              >
                                <Icons.starFill className="h-2.5 w-2.5" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{p.title}</p>
                            <MetaLine icon={Icons.locality}>
                              {p.locality}
                              {p.road ? ` · ${p.road}` : ""}
                              {p.bhk ? ` · ${p.bhk}` : ""}
                            </MetaLine>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <span className="inline-flex items-center gap-1.5 text-ink-soft">
                          <TypeIcon aria-hidden="true" className="h-3.5 w-3.5" />
                          {propertyTypeLabels[p.type]}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-medium">{p.ownerName}</p>
                        {p.ownerPhone && <MetaLine icon={Icons.phone}>{p.ownerPhone}</MetaLine>}
                      </td>
                      <td className="py-3 pr-3 font-semibold">{formatRent(p.rent)}</td>
                      <td className="py-3 pr-3">
                        <Badge
                          tone={status === "approved" ? "ok" : status === "pending" ? "warn" : "plain"}
                          icon={
                            status === "approved"
                              ? Icons.live
                              : status === "pending"
                                ? Icons.pending
                                : Icons.edit
                          }
                        >
                          {status === "approved" ? "Live" : status === "pending" ? "Pending" : "Draft"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          {status === "approved" ? (
                            <IconButton
                              icon={Icons.hide}
                              label="Website se hide karein"
                              onClick={() => setListingStatus(p.id, "pending")}
                            />
                          ) : (
                            <IconButton
                              icon={Icons.approve}
                              label="Approve karke live karein"
                              tone="ok"
                              onClick={() => setListingStatus(p.id, "approved")}
                            />
                          )}
                          <IconButton
                            icon={Icons.remove}
                            label="Delete karein"
                            tone="danger"
                            onClick={() => removeListing(p.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

import { useState } from "react";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  FilterPills,
  IconButton,
  MetaLine,
  SearchInput,
  StatCard,
} from "../components/ui";
import { useAdminAuth } from "../lib/auth";
import { Icons, type IconType } from "../lib/icons";
import { useStore } from "../lib/store";
import { formatDate, planState, planStateLabels, type Role } from "../lib/types";

const roles: Role[] = ["tenant", "owner", "admin"];

const roleMeta: Record<Role, { label: string; icon: IconType; hint: string }> = {
  tenant: { label: "Tenant", icon: Icons.tenant, hint: "Kiraye par ghar dhoondh rahe hain" },
  owner: { label: "Owner", icon: Icons.owner, hint: "Property list karte hain" },
  admin: { label: "Admin", icon: Icons.admin, hint: "Is panel me aa sakte hain" },
};

export function UsersPage() {
  const { users, siteData, setUserRole, removeUser } = useStore();
  const { admin } = useAdminAuth();
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

  const rows = users
    .filter((u) => (roleFilter === "all" ? true : u.role === roleFilter))
    .filter((u) =>
      q.trim() ? `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q.toLowerCase()) : true,
    );

  const withPlan = users.filter((u) => planState(u.plan) === "active").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Kul users"
          value={users.length}
          hint="Website par register hue"
          icon={Icons.users}
          tone="brand"
        />
        {roles.map((r) => (
          <StatCard
            key={r}
            label={roleMeta[r].label}
            value={users.filter((u) => u.role === r).length}
            hint={roleMeta[r].hint}
            icon={roleMeta[r].icon}
            tone={r === "owner" ? "ok" : "plain"}
            onClick={() => setRoleFilter(r)}
          />
        ))}
      </div>

      <Card
        icon={Icons.register}
        title={`${rows.length} user${rows.length === 1 ? "" : "s"}`}
        subtitle={`${withPlan} ke paas active plan hai`}
        action={
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Naam, email ya mobile"
            className="w-full sm:w-64"
          />
        }
      >
        <div className="mb-4">
          <FilterPills<Role | "all">
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: "all", label: "Sab", icon: Icons.filter, count: users.length },
              ...roles.map((r) => ({
                value: r,
                label: roleMeta[r].label,
                icon: roleMeta[r].icon,
                count: users.filter((u) => u.role === r).length,
              })),
            ]}
          />
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Icons.users}
            title="Koi user nahi mila"
            hint="Filter ya search badal kar dekhein."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Contact</th>
                  <th className="pb-2 font-medium">Listings</th>
                  <th className="pb-2 font-medium">Plan</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => {
                  const listingCount =
                    siteData?.listings.filter((p) => p.ownerId === u.id).length ?? 0;
                  const isSelf = u.id === admin?.id;
                  const state = planState(u.plan);

                  return (
                    <tr key={u.id} className="border-b border-line/70 last:border-0">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={u.name}
                            size="sm"
                            tone={u.role === "admin" ? "ink" : u.role === "owner" ? "ok" : "brand"}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {u.name}
                              {isSelf && <span className="text-ink-soft"> (aap)</span>}
                            </p>
                            <p className="text-[11px] text-ink-soft">ID {u.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <MetaLine icon={Icons.mail}>{u.email}</MetaLine>
                        <br />
                        <MetaLine icon={Icons.phone}>{u.phone}</MetaLine>
                      </td>
                      <td className="py-3 pr-3">
                        {listingCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <Icons.listings aria-hidden="true" className="h-3.5 w-3.5 text-ok" />
                            {listingCount}
                          </span>
                        ) : (
                          <span className="text-ink-soft">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        {u.plan ? (
                          <>
                            <Badge
                              tone={
                                state === "active"
                                  ? "ok"
                                  : state === "expired"
                                    ? "danger"
                                    : "warn"
                              }
                              icon={Icons.subscriptions}
                            >
                              {u.plan.label}
                            </Badge>
                            <p className="mt-1 text-[11px] text-ink-soft">
                              {planStateLabels[state]}
                              {u.plan.expiresAt ? ` · ${formatDate(u.plan.expiresAt)}` : ""}
                            </p>
                          </>
                        ) : (
                          <span className="text-ink-soft">Free</span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <select
                          className="input w-auto"
                          aria-label={`${u.name} ka role`}
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) => setUserRole(u.id, e.target.value as Role)}
                        >
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {roleMeta[r].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end">
                          <IconButton
                            icon={Icons.remove}
                            label={`${u.name} ko delete karein`}
                            tone="danger"
                            disabled={isSelf}
                            onClick={() => removeUser(u.id)}
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

        <p className="mt-4 flex items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-xs text-ink-soft">
          <Icons.lock aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Apna khud ka account na delete kar sakte hain na role badal sakte hain — warna admin
          access khatam ho jaayega.
        </p>
      </Card>
    </div>
  );
}

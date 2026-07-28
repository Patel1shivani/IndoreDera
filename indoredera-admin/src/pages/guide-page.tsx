import { Badge, Card, MetaLine } from "../components/ui";
import { API_BASE } from "../lib/api";
import { Icons } from "../lib/icons";
import { overviewStats } from "../lib/stats";
import { useStore } from "../lib/store";
import { formatRent } from "../lib/types";
import { pageGroups, pages, type PageId } from "./registry";

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "http://localhost:8080";

const groupHint: Record<(typeof pageGroups)[number], string> = {
  Overview: "Panel ka haal ek nazar me",
  Manage: "Roz ka kaam — approve, moderate aur users",
  Content: "Website par kya dikhega, wo yahan se set hota hai",
};

/**
 * "Is panel me kya-kya hota hai" — har section ka kaam ek jagah.
 *
 * Text registry se aata hai (`can` array), taaki naya page add karte hi wo
 * apne aap yahan aa jaaye aur ye page purana na pade.
 */
export function GuidePage({ onNavigate }: { onNavigate: (id: PageId) => void }) {
  const { siteData, users } = useStore();
  const s = siteData ? overviewStats(siteData, users) : null;

  /* Har page ke aage ek chhota "abhi kitna hai" number — guide sirf theory na lage. */
  const liveCount: Partial<Record<PageId, string>> = s
    ? {
        listings: `${s.live.length} live · ${s.pendingListings.length} pending`,
        users: `${s.users.length} registered`,
        subscriptions: `${s.activeSubscribers.length} active · ${formatRent(s.revenue)}`,
        testimonials: `${s.liveFeedback.length} live · ${s.pendingFeedback.length} pending`,
        banners: `${s.liveBanners.length} live`,
        plans: `${siteData!.plans.length} plans`,
      }
    : {};

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-brand-soft to-panel p-5">
        <h2 className="flex items-center gap-2 text-xl tracking-wide">
          <Icons.guide aria-hidden="true" className="h-5 w-5 text-brand" />
          Indore Dera admin panel
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-ink-soft">
          Website par jo bhi dikhta hai — listings, users, testimonials, banners, hero ka text aur
          plans — wo sab yahin se control hota hai. Aap yahan kuch badlein, website par wo turant
          dikh jaata hai, kyunki dono ek hi data server se judte hain.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="ok" icon={Icons.globe}>
            Site {SITE_URL.replace("http://", "")}
          </Badge>
          <Badge icon={Icons.database}>Data {API_BASE.replace("http://", "")}</Badge>
          <Badge tone="warn" icon={Icons.refresh}>
            Har 5 sec me auto refresh
          </Badge>
        </div>
      </div>

      {pageGroups.map((group) => (
        <Card
          key={group}
          icon={
            group === "Overview" ? Icons.dashboard : group === "Manage" ? Icons.tasks : Icons.content
          }
          title={group}
          subtitle={groupHint[group]}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {pages
              .filter((p) => p.group === group)
              .map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.id}
                    className="flex flex-col rounded-xl border border-line p-4 transition-colors hover:border-brand/40"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand"
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{p.label}</p>
                        <p className="text-xs text-ink-soft">{p.description}</p>
                      </div>
                      {liveCount[p.id] && (
                        <MetaLine icon={Icons.live}>{liveCount[p.id]}</MetaLine>
                      )}
                    </div>

                    <ul className="mt-3 flex-1 space-y-1.5">
                      {p.can.map((line) => (
                        <li key={line} className="flex gap-2 text-sm text-ink-soft">
                          <Icons.check
                            aria-hidden="true"
                            className="mt-1 h-3.5 w-3.5 shrink-0 text-ok"
                          />
                          {line}
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      className="btn btn-ghost mt-4 self-start"
                      onClick={() => onNavigate(p.id)}
                    >
                      {p.label} kholein
                      <Icons.arrow className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
          </div>
        </Card>
      ))}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card icon={Icons.shield} tone="brand" title="Access aur security">
          <ul className="space-y-2.5 text-sm text-ink-soft">
            <li className="flex gap-2">
              <Icons.key aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              Sirf <strong className="text-ink">admin</strong> role wale account hi is panel me
              login kar sakte hain. Users page se kisi ko admin bana sakte hain.
            </li>
            <li className="flex gap-2">
              <Icons.lock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              Apna khud ka role ya account yahan se nahi badal sakte — warna panel se hi bahar ho
              jaayenge.
            </li>
            <li className="flex gap-2">
              <Icons.alert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
              Ye demo setup hai: password sirf SHA-256 hai aur session tab band karte hi khatam ho
              jaata hai. Live jaane se pehle proper backend auth (JWT + bcrypt) lagana hoga.
            </li>
          </ul>
        </Card>

        <Card icon={Icons.server} title="Data kaise chalta hai">
          <ul className="space-y-2.5 text-sm text-ink-soft">
            <li className="flex gap-2">
              <Icons.database aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              Website aur admin panel alag apps hain. Beech me ek shared data server
              ({API_BASE.replace("http://", "")}) hai — dono usi ko padhte-likhte hain.
            </li>
            <li className="flex gap-2">
              <Icons.refresh aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              Har change turant save hota hai — koi alag "Save" button nahi hai. Panel har 5 second
              me server se naya data le aata hai.
            </li>
            <li className="flex gap-2">
              <Icons.info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              Plan lene par abhi koi asli payment nahi hota — plan turant activate ho jaata hai.
              Razorpay lagne ke baad ye Subscriptions page asli orders dikhayega.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

import { Badge, Card, EmptyState, MetaLine, StatCard, Stars } from "../components/ui";
import { Icons } from "../lib/icons";
import { useStore } from "../lib/store";
import { formatDate, type Testimonial } from "../lib/types";

export function TestimonialsPage() {
  const { siteData, setTestimonialStatus, removeTestimonial } = useStore();
  if (!siteData) return null;

  const pending = siteData.testimonials.filter((t) => t.status === "pending");
  const approved = siteData.testimonials.filter((t) => t.status === "approved");
  const all = siteData.testimonials;
  const avgRating = all.length
    ? (all.reduce((s, t) => s + t.rating, 0) / all.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Website par live"
          value={approved.length}
          hint="Homepage par dikh rahe hain"
          icon={Icons.approve}
          tone="ok"
        />
        <StatCard
          label="Approval pending"
          value={pending.length}
          hint={pending.length ? "Padhkar approve karein" : "Sab clear"}
          icon={Icons.pending}
          tone={pending.length ? "warn" : "plain"}
        />
        <StatCard
          label="Average rating"
          value={avgRating}
          hint={`${all.length} feedback par`}
          icon={Icons.starFill}
          tone="brand"
        />
      </div>

      <Card
        icon={Icons.pending}
        tone="warn"
        title={`Approval ka intezaar (${pending.length})`}
        subtitle="Approve karte hi website par dikhne lagega"
      >
        {pending.length === 0 ? (
          <EmptyState
            icon={Icons.feedback}
            title="Koi naya feedback nahi"
            hint="Website ke testimonials section se naya feedback yahan aayega."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {pending.map((t) => (
              <Row
                key={t.id}
                t={t}
                actions={
                  <>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setTestimonialStatus(t.id, "approved")}
                    >
                      <Icons.approve className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeTestimonial(t.id)}
                    >
                      <Icons.reject className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </Card>

      <Card
        icon={Icons.testimonials}
        tone="ok"
        title={`Website par live (${approved.length})`}
        subtitle="Homepage ke testimonials section me"
      >
        {approved.length === 0 ? (
          <EmptyState icon={Icons.star} title="Abhi koi testimonial live nahi hai" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {approved.map((t) => (
              <Row
                key={t.id}
                t={t}
                live
                actions={
                  <>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setTestimonialStatus(t.id, "pending")}
                    >
                      <Icons.hide className="h-4 w-4" />
                      Hide
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeTestimonial(t.id)}
                    >
                      <Icons.remove className="h-4 w-4" />
                      Delete
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Row({
  t,
  live,
  actions,
}: {
  t: Testimonial;
  live?: boolean;
  actions: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line p-4 transition-colors hover:border-brand/40">
      <div className="flex items-start justify-between gap-3">
        <Stars rating={t.rating} />
        <Badge tone={live ? "ok" : "warn"} icon={live ? Icons.live : Icons.pending}>
          {live ? "Live" : "Pending"}
        </Badge>
      </div>
      <p className="mt-2 text-sm">“{t.message}”</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <MetaLine icon={Icons.tenant}>{t.name}</MetaLine>
        <MetaLine icon={Icons.locality}>{t.locality}</MetaLine>
        {t.createdAt ? <MetaLine icon={Icons.calendar}>{formatDate(t.createdAt)}</MetaLine> : null}
      </div>
      <div className="mt-3 flex gap-2">{actions}</div>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GoCheck, GoCreditCard, GoInfo, GoPlus, GoStarFill, GoVerified } from "react-icons/go";
import { toast } from "sonner";
import { AuthError, isPlanActive, useAuth } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";
import { useSiteData, type Plan } from "@/lib/site-data";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Listing Plans — Indore Dera" },
      {
        name: "description",
        content:
          "Pehli property listing free. Uske baad one-time, monthly ya yearly plan lekar unlimited listings post karein.",
      },
      { property: "og:title", content: "Listing Plans | Indore Dera" },
      {
        property: "og:description",
        content: "Indore Dera ke sasta listing plans — one-time, monthly aur yearly.",
      },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  const { user, ready, activatePlan } = useAuth();
  const { data } = useSiteData();
  const navigate = useNavigate();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  const activePlan = isPlanActive(user?.plan ?? null) ? user?.plan : null;

  async function handleBuy(plan: Plan) {
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/plans" } });
      return;
    }

    setBusyPlan(plan.id);

    /* Plan server par activate hota hai — credits aur expiry wahi calculate
       karta hai, isliye client inhe bhejta nahi.
       TODO(payments): Razorpay order pehle banega aur signature verify hone ke
       baad hi ye call jaayegi. Abhi koi paisa nahi lagta. */
    try {
      await activatePlan(plan.id);
      await sendMail({
        to: user.email,
        template: "plan-purchased",
        data: { plan: plan.label, amount: plan.price },
      });

      toast.success(`${plan.label} activate ho gaya`, {
        description: "Ab aap nayi listing post kar sakte hain.",
      });
      navigate({ to: "/list-property" });
    } catch (err) {
      toast.error(err instanceof AuthError ? err.message : "Plan activate nahi ho paaya.");
    } finally {
      setBusyPlan(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-3xl tracking-wide sm:text-4xl">Listing plans</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Har owner ki <strong>pehli listing bilkul free</strong> hai. Usse zyada properties post
        karni hain to niche se koi ek plan chunein.
      </p>

      {ready && activePlan && (
        <div className="mt-6 rounded-2xl border border-brand-green bg-card p-5 shadow-soft">
          <p className="flex items-center gap-2 font-display text-lg tracking-wide">
            <GoVerified aria-hidden="true" className="h-5 w-5 text-brand-green" />
            Aapka active plan: {activePlan.label}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activePlan.credits === null
              ? "Unlimited listings"
              : `${activePlan.credits} listing credit bacha hai`}
            {activePlan.expiresAt
              ? ` · ${new Date(activePlan.expiresAt).toLocaleDateString("en-IN")} tak valid`
              : ""}
          </p>
          <Link to="/list-property" className="btn-primary mt-4">
            <GoPlus aria-hidden="true" className="h-4 w-4" />
            Nayi property post karein
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {data.plans.map((plan, i) => (
          <div
            key={plan.id}
            style={{ animationDelay: `${i * 110}ms` }}
            className={
              plan.highlight
                ? "card-hover animate-rise-in relative rounded-3xl border-2 border-primary bg-card p-6 shadow-lifted"
                : "card-hover animate-rise-in rounded-3xl border border-border bg-card p-6 shadow-soft"
            }
          >
            {plan.highlight && (
              <span className="badge-accent absolute -top-3 left-6 inline-flex items-center gap-1.5">
                <GoStarFill aria-hidden="true" className="h-3.5 w-3.5 animate-soft-float" />
                Sabse popular
              </span>
            )}
            <h2 className="font-display text-xl tracking-wide">{plan.label}</h2>
            <p className="mt-3">
              <span className="font-display text-4xl text-primary">
                ₹{plan.price.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-muted-foreground"> {plan.period}</span>
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex gap-2">
                  <GoCheck
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand-green"
                  />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn-primary mt-6 w-full disabled:opacity-60"
              disabled={busyPlan !== null}
              onClick={() => void handleBuy(plan)}
            >
              <GoCreditCard aria-hidden="true" className="h-4 w-4" />
              {busyPlan === plan.id ? "Activate ho raha hai..." : "Ye plan lein"}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-8 flex gap-2 rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
        <GoInfo aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <strong>Note:</strong> abhi koi asli payment nahi hota — plan turant activate ho jaata
          hai. Live jaane se pehle Razorpay integrate karna hoga (order create + signature verify
          server par).
        </span>
      </p>
    </div>
  );
}

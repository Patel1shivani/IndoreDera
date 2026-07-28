import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  GoCheckCircleFill,
  GoClock,
  GoDeviceMobile,
  GoLocation,
  GoMail,
  GoPaperAirplane,
} from "react-icons/go";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Indore Dera — Rental Support in Indore" },
      {
        name: "description",
        content:
          "Indore Dera se sampark karein — listing, verification ya kisi bhi rental sawaal ke liye call, WhatsApp ya email.",
      },
      { property: "og:title", content: "Contact Indore Dera" },
      {
        property: "og:description",
        content: "Rental related sawaal? Indore Dera team se call, WhatsApp ya email par judein.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-3xl tracking-wide sm:text-4xl">Sampark karein</h1>
      <p className="mt-2 text-muted-foreground">
        Koi sawaal ya suggestion? Hum Indore me hi hain, jaldi jawab denge.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {[
            { k: "Office", v: "Vijay Nagar, Indore, MP 452010", icon: GoLocation },
            { k: "Phone", v: "+91 98260 00000", icon: GoDeviceMobile },
            { k: "Email", v: "hello@indoredera.in", icon: GoMail },
            { k: "Timings", v: "Mon – Sat, 10am – 7pm", icon: GoClock },
          ].map((i) => (
            <div
              key={i.k}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <i.icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{i.k}</p>
                <p className="mt-1 font-display text-lg">{i.v}</p>
              </div>
            </div>
          ))}
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-brand-green bg-card p-10 text-center shadow-soft">
            <GoCheckCircleFill aria-hidden="true" className="h-12 w-12 text-brand-green" />
            <h2 className="mt-3 text-2xl tracking-wide">Message bhej diya gaya</h2>
            <p className="mt-2 text-muted-foreground">Hum jald hi aapse sampark karenge.</p>
          </div>
        ) : (
          <form
            className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div>
              <label htmlFor="cname" className="mb-1.5 block text-sm font-medium">
                Naam
              </label>
              <input id="cname" required className="field" placeholder="Aapka naam" />
            </div>
            <div>
              <label htmlFor="cphone" className="mb-1.5 block text-sm font-medium">
                Mobile / Email
              </label>
              <input id="cphone" required className="field" placeholder="98260 00000" />
            </div>
            <div>
              <label htmlFor="cmsg" className="mb-1.5 block text-sm font-medium">
                Message
              </label>
              <textarea
                id="cmsg"
                rows={5}
                required
                className="field"
                placeholder="Aapka sandesh..."
              />
            </div>
            <button type="submit" className="btn-primary">
              <GoPaperAirplane aria-hidden="true" className="h-4 w-4" />
              Send message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

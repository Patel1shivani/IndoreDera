import { createFileRoute, Link } from "@tanstack/react-router";
import { GoGlobe, GoLocation, GoPlus, GoSearch, GoShieldCheck } from "react-icons/go";
import logo from "../assets/logo.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Indore Dera — Hyperlocal Rental Platform for Indore" },
      {
        name: "description",
        content:
          "Indore Dera Indore ke liye bana hyperlocal rental platform hai — owners aur tenants ko bina broker seedha jodta hai.",
      },
      { property: "og:title", content: "About Indore Dera" },
      {
        property: "og:description",
        content: "Indore ke liye bana rental platform — apna ghar, apna shehar.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <img
        src={logo}
        alt="Indore Dera logo"
        className="animate-soft-float mx-auto h-[300px] w-[300px] object-contain"
      />
      <h1 className="animate-rise-in text-center text-3xl tracking-wide sm:text-4xl">
        Indore ke liye, Indore walon dwara
      </h1>
      <p className="animate-rise-in delay-step-1 mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
        Indore Dera ek hyperlocal rental platform hai jo sirf Indore par focus karta hai. Rajwada ki
        galiyon se lekar Nipania ki nayi societies tak — har locality, har budget.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          {
            t: "Zero brokerage",
            icon: GoShieldCheck,
            d: "Tenant aur owner seedha connect hote hain — beech me koi commission nahi.",
          },
          {
            t: "Local language",
            icon: GoGlobe,
            d: "Hindi-English mix me listings, taaki har koi asaani se samajh sake.",
          },
          {
            t: "Sirf Indore",
            icon: GoLocation,
            d: "Har listing Indore ki hai — koi irrelevant result nahi.",
          },
        ].map((c, i) => (
          <div
            key={c.t}
            style={{ animationDelay: `${i * 110}ms` }}
            className="card-hover animate-rise-in rounded-2xl border border-border bg-card p-6 shadow-soft"
          >
            <c.icon aria-hidden="true" className="h-7 w-7 text-primary" />
            <h2 className="mt-3 text-xl tracking-wide text-primary">{c.t}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl bg-secondary p-8 text-center">
        <h2 className="text-2xl tracking-wide">Shuru karein aaj hi</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/properties" className="btn-primary">
            <GoSearch aria-hidden="true" className="h-4 w-4" />
            Browse rentals
          </Link>
          <Link to="/list-property" className="btn-outline">
            <GoPlus aria-hidden="true" className="h-4 w-4" />
            List your property
          </Link>
        </div>
      </div>
    </div>
  );
}

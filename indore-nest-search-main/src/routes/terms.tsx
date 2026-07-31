import { createFileRoute } from "@tanstack/react-router";
import { LegalDocView } from "@/components/legal-page";
import { useSiteData } from "@/lib/site-data";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Indore Dera" },
      {
        name: "description",
        content:
          "Indore Dera use karne ki shartein — listing rules, account rules, payment, liability aur jurisdiction.",
      },
      { property: "og:title", content: "Terms & Conditions — Indore Dera" },
      {
        property: "og:description",
        content: "Platform use karne se pehle ye shartein padh lein.",
      },
    ],
  }),
  component: Terms,
});

/* Shartein ka poora text admin panel se aata hai (Content → Privacy & Terms). */
function Terms() {
  const { data } = useSiteData();
  return <LegalDocView doc={data.legal.terms} />;
}

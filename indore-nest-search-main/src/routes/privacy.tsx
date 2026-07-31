import { createFileRoute } from "@tanstack/react-router";
import { LegalDocView } from "@/components/legal-page";
import { useSiteData } from "@/lib/site-data";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Indore Dera" },
      {
        name: "description",
        content:
          "Indore Dera aapka data kaise collect, use aur protect karta hai — poori privacy policy Hindi-English me.",
      },
      { property: "og:title", content: "Privacy Policy — Indore Dera" },
      {
        property: "og:description",
        content:
          "Aapka data kaise use hota hai, kiske saath share hota hai aur aapke rights kya hain.",
      },
    ],
  }),
  component: Privacy,
});

/* Policy ka poora text admin panel se aata hai (Content → Privacy & Terms).
   Pehle wo yahan hard-coded tha, isliye ek clause badalne ke liye bhi deploy
   karna padta tha. */
function Privacy() {
  const { data } = useSiteData();
  return <LegalDocView doc={data.legal.privacy} />;
}

import { useState } from "react";
import { GoChevronDown, GoQuestion } from "react-icons/go";
import { Reveal } from "@/components/reveal";
import { useInView } from "@/hooks/use-in-view";

/**
 * Home page ka FAQ. Radix accordion ki jagah apna chhota version — yahan
 * height 0fr → 1fr grid transition se khulta hai, jo bina JS height maape
 * smooth chalta hai.
 */
const faqs = [
  {
    q: "Kya Indore Dera par brokerage lagti hai?",
    a: "Bilkul nahi. Aap seedha owner se baat karte hain — beech me koi broker nahi, isliye kirayedaar ko ek rupaya brokerage nahi deni padti.",
  },
  {
    q: "Listing dekhne ke liye account zaroori hai?",
    a: "Haan, ek free account banana padta hai. Isse owner ka number sirf genuine logon tak jaata hai aur fake enquiries ruk jaati hain. Registration me sirf naam, mobile aur email lagta hai.",
  },
  {
    q: "Main apni property kaise list karun?",
    a: "‘List Your Property’ par jaayein, photos ke saath detail bharein aur submit kar dein. Pehli listing bilkul free hai; admin verify karte hi wo live ho jaati hai.",
  },
  {
    q: "Kitni der me listing approve hoti hai?",
    a: "Aam taur par 24 ghante ke andar. Photos saaf hon aur rent, deposit, area sahi bhare hon to approval jaldi ho jaata hai.",
  },
  {
    q: "Kaun-kaun se ilaake cover hote hain?",
    a: "Poora Indore — Vijay Nagar, Palasia, Nipania, Bhawarkuan, Rau, Sudama Nagar, Annapurna, Rajwada, Mhow Naka aur Scheme No. 78 tak.",
  },
  {
    q: "Flat ke alawa aur kya milta hai?",
    a: "Room, dukaan/showroom, PG-hostel aur zameen/godown bhi. Search box me seedha ‘dukaan’ ya ‘kamra’ likhein — Roman-Hindi bhi samajh me aata hai.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const { ref: titleRef, inView: titleInView } = useInView<HTMLHeadingElement>(0.4);

  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <h2
        ref={titleRef}
        data-visible={titleInView}
        className="heading-rule text-center text-3xl tracking-wide"
      >
        Aksar poochhe jaane wale sawaal
      </h2>
      <p className="mt-3 text-center text-muted-foreground">
        Jo sawaal Indore walon ne sabse zyada poochhe
      </p>

      <div className="mt-8 grid gap-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q} delay={i * 70}>
              <div
                className={`overflow-hidden rounded-2xl border bg-card shadow-soft transition-colors duration-300 ${
                  isOpen ? "border-primary/45" : "border-border"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                >
                  <GoQuestion
                    aria-hidden="true"
                    className={`h-5 w-5 shrink-0 transition-colors duration-300 ${
                      isOpen ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span className="font-display flex-1 text-base tracking-wide sm:text-lg">
                    {f.q}
                  </span>
                  <GoChevronDown
                    aria-hidden="true"
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {/* 0fr → 1fr — content ki height maape bina smooth khulta hai */}
                <div
                  className={`grid transition-[grid-template-rows] duration-400 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 pl-13 text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

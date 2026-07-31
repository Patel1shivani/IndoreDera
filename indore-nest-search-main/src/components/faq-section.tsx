import { useState } from "react";
import { GoChevronDown, GoQuestion } from "react-icons/go";
import { Reveal } from "@/components/reveal";
import { useInView } from "@/hooks/use-in-view";
import { useSiteData } from "@/lib/site-data";

/**
 * Home page ka FAQ. Radix accordion ki jagah apna chhota version — yahan
 * height 0fr → 1fr grid transition se khulta hai, jo bina JS height maape
 * smooth chalta hai.
 *
 * Sawaal-jawab admin panel se aate hain (Content → Home page text), isliye
 * yahan koi list hard-coded nahi hai.
 */
export function FaqSection() {
  const { data } = useSiteData();
  const { faqTitle, faqSubtitle, faqs } = data.home;
  const [open, setOpen] = useState<number | null>(0);
  const { ref: titleRef, inView: titleInView } = useInView<HTMLHeadingElement>(0.4);

  // ek bhi sawaal na ho to poora section hi chhupa dete hain
  if (faqs.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <h2
        ref={titleRef}
        data-visible={titleInView}
        className="heading-rule text-center text-3xl tracking-wide"
      >
        {faqTitle}
      </h2>
      <p className="mt-3 text-center text-muted-foreground">{faqSubtitle}</p>

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

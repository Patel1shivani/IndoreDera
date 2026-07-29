import { useEffect, useRef, useState } from "react";

/**
 * Element jab pehli baar viewport me aata hai tab `true` ho jaata hai — aur
 * wahin ruk jaata hai (observer disconnect ho jaata hai), taaki scroll upar-neeche
 * karne par cheezein baar-baar blink na karein.
 *
 * IntersectionObserver na ho (bahut purana browser) to seedha visible kar dete
 * hain — content chhupa nahi rehna chahiye.
 */
export function useInView<T extends HTMLElement>(
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView };
}

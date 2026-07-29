import { useEffect, useState } from "react";
import { useInView } from "@/hooks/use-in-view";

/**
 * 0 se target tak ginta hua number — tabhi chalta hai jab tile screen par aata
 * hai. Reduced-motion me seedha final value dikha dete hain.
 *
 * `to` badalne par dobara chalta hai, kyunki listings server se baad me aati
 * hain aur pehla render 0 ke saath hota hai.
 */
export function CountUp({
  to,
  duration = 1400,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || to <= 0) {
      setN(to);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // ease-out cubic — shuru me tez, ant me dheere
      setN(Math.round(to * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {n.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

import type { ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";

type RevealVariant = "up" | "left" | "right" | "zoom";

const variantClass: Record<RevealVariant, string> = {
  up: "reveal",
  left: "reveal-left",
  right: "reveal-right",
  zoom: "reveal-zoom",
};

/**
 * Scroll par entry animation. Andar ka content SSR me bhi render hota hai —
 * sirf opacity/transform badalta hai, isliye SEO par koi asar nahi.
 */
export function Reveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  /** ms — grid me har card ko thoda-thoda late laane ke liye. */
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-visible={inView}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`${variantClass[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

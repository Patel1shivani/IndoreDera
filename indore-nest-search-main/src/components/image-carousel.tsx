import { useCallback, useEffect, useRef, useState } from "react";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import { cn } from "@/lib/utils";

/** Har slide itni der dikhti hai, phir apne aap agli aa jaati hai. */
const AUTOPLAY_MS = 2000;

/**
 * Property photos ka carousel — har 2 second me apne aap aage badhta hai,
 * neeche dots hote hain, aur hover/focus par ruk jaata hai taaki user
 * aaram se photo dekh sake.
 */
export function ImageCarousel({
  images,
  alt,
  className,
  imageClassName = "h-[22rem]",
}: {
  images: string[];
  alt: string;
  className?: string;
  /** Slide ki height — modal me chhoti, detail page par badi. */
  imageClassName?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = (i + el.children.length) % el.children.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIndex(next);
  }, []);

  // autoplay — hover/focus par band, aur reduced-motion walon ke liye bhi band
  useEffect(() => {
    if (paused || images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => goTo(index + 1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, index, images.length, goTo]);

  // user khud swipe kare to dots bhi usi ke saath chalein
  const onScroll = () => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (images.length === 0) return null;

  return (
    <div
      className={cn("group relative overflow-hidden rounded-3xl shadow-lifted", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <img
            key={`${src.slice(0, 48)}-${i}`}
            src={src}
            alt={`${alt} — photo ${i + 1}`}
            loading={i === 0 ? "eager" : "lazy"}
            className={cn("w-full shrink-0 snap-start object-cover", imageClassName)}
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <NavButton side="left" onClick={() => goTo(index - 1)} />
          <NavButton side="right" onClick={() => goTo(index + 1)} />

          {/* dots — click karke seedha us photo par ja sakte hain */}
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
            {images.map((src, i) => (
              <button
                key={`dot-${src.slice(0, 32)}-${i}`}
                type="button"
                aria-label={`Photo ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={cn(
                  "h-2 rounded-full bg-white/70 shadow transition-all duration-300 hover:bg-white",
                  i === index ? "w-6 bg-white" : "w-2",
                )}
              />
            ))}
          </div>

          <span className="absolute right-4 top-4 rounded-full bg-foreground/55 px-2.5 py-1 text-xs font-medium text-background backdrop-blur-sm">
            {index + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  );
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? GoChevronLeft : GoChevronRight;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Pichhli photo" : "Agli photo"}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-soft backdrop-blur-sm transition hover:bg-background",
        /* mobile par hamesha, desktop par hover/focus karne par */
        "opacity-100 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}

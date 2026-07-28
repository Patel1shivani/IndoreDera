import { useEffect, useState } from "react";
import { GoLocation, GoStarFill } from "react-icons/go";
import logo from "../assets/logo.png";

/* Ek session me ek hi baar intro chale — har navigation par nahi. */
const SEEN_KEY = "indoredera:intro-seen";

/* Private mode me sessionStorage block ho sakta hai — tab intro skip kar dete hain. */
function seenThisSession() {
  try {
    return sessionStorage.getItem(SEEN_KEY) !== null;
  } catch {
    return true;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage nahi hai to bhi intro band ho hi jaata hai */
  }
}

type Phase = "hidden" | "falling" | "ready" | "leaving";

/**
 * Website khulte hi ek sitara upar se gir kar logo ke peeche tik jaata hai.
 * Us par click karte hi sitara wapas upar uth jaata hai aur site shuru ho jaati hai.
 *
 * SSR ke waqt kuch render nahi hota (phase "hidden") — isse hydration mismatch
 * nahi hota, baaki site pehle se hi ready rehti hai.
 */
export function IntroSplash() {
  const [phase, setPhase] = useState<Phase>("hidden");

  useEffect(() => {
    if (seenThisSession()) return;
    setPhase("falling");

    // girne ka animation khatam hone ke baad hi click invite dikhta hai
    const t = setTimeout(() => setPhase("ready"), 1250);
    return () => clearTimeout(t);
  }, []);

  // intro ke dauraan page scroll band — warna peeche ka content khisakta hai
  useEffect(() => {
    if (phase === "hidden") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  function start() {
    if (phase !== "ready") return;
    setPhase("leaving");
    markSeen();
    setTimeout(() => setPhase("hidden"), 750);
  }

  if (phase === "hidden") return null;

  const leaving = phase === "leaving";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{
        background:
          "radial-gradient(120% 80% at 50% 10%, color-mix(in oklab, var(--color-accent) 55%, transparent) 0%, transparent 62%), var(--color-background)",
      }}
    >
      <button
        type="button"
        onClick={start}
        disabled={phase !== "ready"}
        aria-label="Website shuru karein"
        className="flex cursor-pointer flex-col items-center gap-6 px-6 text-center outline-none disabled:cursor-default"
      >
        {/* girta hua sitara — click par wapas upar */}
        <span className="relative flex h-28 w-28 items-center justify-center">
          <span className="absolute inset-0 animate-halo rounded-full bg-accent/45 blur-xl" />
          <GoStarFill
            aria-hidden="true"
            className={`relative h-24 w-24 text-accent drop-shadow-[0_10px_30px_color-mix(in_oklab,var(--color-accent)_60%,transparent)] ${
              leaving ? "animate-star-lift" : "animate-star-drop"
            }`}
          />
        </span>

        <img
          src={logo}
          alt="Indore Dera"
          className="animate-rise-in delay-step-3 h-24 w-24 object-contain"
        />

        <span className="animate-rise-in delay-step-4 block">
          <span className="block font-display text-4xl tracking-wide text-primary sm:text-5xl">
            Indore Dera
          </span>
          <span className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <GoLocation aria-hidden="true" className="h-4 w-4" />
            अपना घर, अपना शहर
          </span>
        </span>

        <span
          className={`animate-rise-in delay-step-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold text-foreground shadow-soft transition-opacity ${
            phase === "ready" ? "animate-soft-float opacity-100" : "opacity-0"
          }`}
        >
          <GoStarFill aria-hidden="true" className="h-4 w-4 text-accent" />
          Sitare par click karein — website shuru
        </span>
      </button>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { GoMegaphone } from "react-icons/go";
import { mainNav } from "@/lib/nav";

/* Center wala "+" button beech me aata hai, isliye menu ko do halves me
   todte hain — left me pehle do, right me baaki. */
const leftItems = mainNav.slice(0, 2);
const rightItems = mainNav.slice(2);

/* Fixed height + justify-start: chhote phone par "Sab dekho" do line me jata
   hai, par icons ki height ek jaisi rehni chahiye. */
const tabClass =
  "flex h-14 min-w-0 flex-1 flex-col items-center justify-start gap-1 rounded-lg px-0.5 pt-2 text-center text-[10px] font-medium leading-tight text-foreground/60 transition-colors hover:text-primary [&.active]:text-primary";

/* Sirf mobile par — phone app jaisa bottom bar. Desktop par header ka nav
   kaafi hai, isliye md se upar chhup jata hai. */
export function MobileTabBar() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto flex max-w-md items-end justify-between px-2">
        {leftItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={tabClass}
            activeOptions={{ exact: item.to === "/" }}
          >
            <item.icon aria-hidden="true" className="h-5 w-5" />
            {item.label}
          </Link>
        ))}

        {/* Sabse zaroori action — uthaya hua pill. Sirf icon se pata nahi chalta
            ki kya add ho raha hai, isliye साथ me naam bhi likha hai. */}
        <Link
          to="/list-property"
          className="-mt-6 flex shrink-0 items-center gap-1.5 rounded-full border-4 border-background bg-primary px-3.5 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 [&.active]:ring-2 [&.active]:ring-primary/40"
        >
          <GoMegaphone aria-hidden="true" className="h-5 w-5 shrink-0" />
          List Property
        </Link>

        {rightItems.map((item) => (
          <Link key={item.to} to={item.to} className={tabClass}>
            <item.icon aria-hidden="true" className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

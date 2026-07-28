import { Link } from "@tanstack/react-router";
import { GoLock, GoPersonAdd, GoSignIn } from "react-icons/go";

/**
 * Logged-out visitors ko properties ki jagah ye dikhta hai.
 * Login ke baad ye poori tarah hat jaata hai (banners le lete hain iski jagah).
 */
export function LoginGate({
  title,
  subtitle,
  redirect,
}: {
  title: string;
  subtitle: string;
  redirect?: string;
}) {
  return (
    <div className="animate-rise-in rounded-3xl border border-dashed border-primary/40 bg-card p-8 text-center shadow-soft sm:p-12">
      <GoLock aria-hidden="true" className="animate-soft-float mx-auto h-10 w-10 text-primary" />
      <h2 className="mt-4 text-2xl tracking-wide sm:text-3xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{subtitle}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/register" search={{ redirect }} className="btn-primary">
          <GoPersonAdd aria-hidden="true" className="h-4 w-4" />
          Free account banayein
        </Link>
        <Link to="/login" search={{ redirect }} className="btn-outline">
          <GoSignIn aria-hidden="true" className="h-4 w-4" />
          Pehle se account hai? Login
        </Link>
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Registration bilkul free hai — sirf naam, mobile aur email chahiye.
      </p>
    </div>
  );
}

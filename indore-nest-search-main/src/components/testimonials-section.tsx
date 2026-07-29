import { useCallback, useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  GoChevronLeft,
  GoChevronRight,
  GoPaperAirplane,
  GoPencil,
  GoStar,
  GoStarFill,
  GoX,
} from "react-icons/go";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { localities } from "@/lib/properties";
import { useSiteData } from "@/lib/site-data";

/**
 * Approved testimonials public par dikhte hain. Koi bhi customer feedback bhej
 * sakta hai — wo "pending" me jaata hai aur admin approve kare tabhi live hota hai.
 */
export function TestimonialsSection() {
  const { data, addTestimonial } = useSiteData();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", locality: localities[0], rating: 5, message: "" });

  const approved = data.testimonials.filter((t) => t.status === "approved");

  /* Grid ki jagah ek x-scroll carousel — desktop par 3 card dikhte hain,
     baaki arrows se ya swipe karke aate hain. */
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const syncArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    syncArrows();
    window.addEventListener("resize", syncArrows);
    return () => window.removeEventListener("resize", syncArrows);
  }, [syncArrows, approved.length]);

  /** Ek "page" — jitna dikh raha hai utna hi aage/peeche. */
  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addTestimonial({
        name: form.name.trim() || user?.name || "Anonymous",
        locality: form.locality,
        rating: form.rating,
        message: form.message.trim(),
      });
      setForm({ name: "", locality: localities[0], rating: 5, message: "" });
      setOpen(false);
      toast.success("Shukriya! Aapka feedback bhej diya gaya", {
        description: "Admin approve karte hi ye website par dikhne lagega.",
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Feedback bhej nahi paaye.");
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="text-center text-3xl tracking-wide">Indore walon ka experience</h2>
      <p className="mt-2 text-center text-muted-foreground">
        Asli tenants aur owners jinhone Indore Dera use kiya
      </p>

      {approved.length > 0 && (
        <div className="mt-8">
          {(!atStart || !atEnd) && (
            <div className="mb-3 flex items-center justify-end gap-2">
              <ArrowButton
                label="Pichhle testimonials"
                disabled={atStart}
                onClick={() => page(-1)}
                icon={GoChevronLeft}
              />
              <ArrowButton
                label="Agle testimonials"
                disabled={atEnd}
                onClick={() => page(1)}
                icon={GoChevronRight}
              />
            </div>
          )}

          <div
            ref={trackRef}
            onScroll={syncArrows}
            tabIndex={0}
            aria-label="Testimonials"
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {approved.map((t, i) => (
              <figure
                key={t.id}
                style={{ animationDelay: `${i * 90}ms` }}
                className="card-hover animate-rise-in w-[85%] shrink-0 snap-start rounded-2xl border border-border bg-card p-6 shadow-soft sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
              >
                <Stars rating={t.rating} />
                <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">
                  “{t.message}”
                </blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-muted-foreground"> · {t.locality}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        {/* Form ab screen ke center me dialog ki tarah khulta hai */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button type="button" className="btn-outline">
              <GoPencil aria-hidden="true" className="h-4 w-4" />
              Apna experience share karein
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-xl tracking-wide">
                Apna experience share karein
              </DialogTitle>
              <DialogDescription>
                Admin approve karte hi aapka feedback website par dikhne lagega.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-4 text-left">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="fb-name" className="mb-1.5 block text-sm font-medium">
                    Aapka naam
                  </label>
                  <input
                    id="fb-name"
                    required
                    className="field"
                    placeholder="Pooja Sharma"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="fb-locality" className="mb-1.5 block text-sm font-medium">
                    Locality
                  </label>
                  <select
                    id="fb-locality"
                    className="field"
                    value={form.locality}
                    onChange={(e) => setForm((f) => ({ ...f, locality: e.target.value }))}
                  >
                    {localities.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Rating ab star buttons se chunte hain — dropdown me icon nahi aa sakta tha */}
              <fieldset>
                <legend className="mb-1.5 block text-sm font-medium">Rating</legend>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      aria-label={`${r} star`}
                      aria-pressed={form.rating === r}
                      onClick={() => setForm((f) => ({ ...f, rating: r }))}
                      className="rounded-full p-1 text-accent transition-transform hover:scale-110"
                    >
                      {r <= form.rating ? (
                        <GoStarFill className="h-6 w-6" />
                      ) : (
                        <GoStar className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">({form.rating}/5)</span>
                </div>
              </fieldset>
              <div>
                <label htmlFor="fb-message" className="mb-1.5 block text-sm font-medium">
                  Aapka experience
                </label>
                <textarea
                  id="fb-message"
                  required
                  rows={4}
                  className="field"
                  placeholder="Kaisa laga Indore Dera?"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn-primary flex-1">
                  <GoPaperAirplane aria-hidden="true" className="h-4 w-4" />
                  Feedback bhejein
                </button>
                <button type="button" className="btn-outline" onClick={() => setOpen(false)}>
                  <GoX aria-hidden="true" className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

/** Carousel ka gol arrow — end par pahunchne par khud faint ho jaata hai. */
function ArrowButton({
  label,
  icon: Icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: IconType;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground"
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}

/** 5 me se rating — bhare hue Octicon stars. */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-accent" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) =>
        i <= rating ? (
          <GoStarFill key={i} aria-hidden="true" className="h-4 w-4" />
        ) : (
          <GoStar key={i} aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
        ),
      )}
    </div>
  );
}

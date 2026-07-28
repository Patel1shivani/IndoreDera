import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  GoCheckCircleFill,
  GoCreditCard,
  GoNote,
  GoPaperAirplane,
  GoPlus,
  GoStack,
  GoTag,
  GoUpload,
  GoX,
} from "react-icons/go";
import { toast } from "sonner";
import { LoginGate } from "@/components/login-gate";
import { canPostListing, FREE_LISTINGS_PER_OWNER, useAuth } from "@/lib/auth";
import { fileToDataUrl, ImageUploadError, MAX_PHOTOS, MIN_PHOTOS } from "@/lib/image-upload";
import { sendMail } from "@/lib/mailer";
import { localities, propertyTypes, type Property, type PropertyType } from "@/lib/properties";
import { useSiteData } from "@/lib/site-data";

export const Route = createFileRoute("/list-property")({
  head: () => ({
    meta: [
      { title: "List Your Property for Rent in Indore — Free | Indore Dera" },
      {
        name: "description",
        content:
          "Apni property Indore me free me list karein. Flat, room, shop, PG ya land — kirayedar seedha aapse sampark karenge.",
      },
      { property: "og:title", content: "List Your Property Free | Indore Dera" },
      {
        property: "og:description",
        content: "Indore me apni rental property free me list karein aur seedha tenants se judein.",
      },
    ],
  }),
  component: ListProperty,
});

const emptyForm = {
  title: "",
  type: "" as PropertyType | "",
  bhk: "",
  locality: "",
  road: "",
  area: "",
  rent: "",
  deposit: "",
  furnishing: "Semi-Furnished" as Property["furnishing"],
  preferred: "",
  amenities: "",
  description: "",
  images: [] as string[],
};

const fallbackImage =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=70";

function ListProperty() {
  const { user, ready, consumeListingCredit } = useAuth();
  const { data, saveListing } = useSiteData();

  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState<"pending" | "draft" | null>(null);
  const [busy, setBusy] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const myListings = data.listings.filter((p) => p.ownerId && p.ownerId === user?.id);
  const gate = canPostListing(user ?? null, myListings.length);

  function set<K extends keyof typeof form>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  /* Photos: gallery se files chunein ya link paste karein — dono ek hi list me
     jaate hain. Pehli photo cover banti hai. */
  function addPhotos(next: string[]) {
    setForm((f) => {
      const merged = [...f.images, ...next.filter((src) => !f.images.includes(src))];
      if (merged.length > MAX_PHOTOS) {
        toast.warning(`Zyada se zyada ${MAX_PHOTOS} photos add ho sakti hain`);
      }
      return { ...f, images: merged.slice(0, MAX_PHOTOS) };
    });
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // same file dobara chunne par bhi change fire ho
    if (!files.length) return;

    setUploading(true);
    const done: string[] = [];
    for (const file of files) {
      try {
        done.push(await fileToDataUrl(file));
      } catch (err) {
        toast.error(err instanceof ImageUploadError ? err.message : `${file.name} add nahi hui`);
      }
    }
    if (done.length) addPhotos(done);
    setUploading(false);
  }

  function addPhotoUrl() {
    const url = photoUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.error("Link http:// ya https:// se shuru hona chahiye");
      return;
    }
    addPhotos([url]);
    setPhotoUrl("");
  }

  function removePhoto(src: string) {
    setForm((f) => ({ ...f, images: f.images.filter((s) => s !== src) }));
  }

  function buildListing(status: "pending" | "draft"): Property {
    return {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      titleHi: form.title.trim(),
      type: (form.type || "flat") as PropertyType,
      locality: form.locality,
      road: form.road.trim() || undefined,
      rent: Number(form.rent) || 0,
      deposit: Number(form.deposit) || 0,
      area: form.area.trim(),
      bhk: form.bhk || undefined,
      furnishing: form.furnishing,
      preferred: form.preferred.trim() || "Anyone",
      image: form.images[0] || fallbackImage,
      images: form.images.length ? form.images : undefined,
      amenities: form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      description: form.description.trim(),
      ownerName: user?.name ?? "Owner",
      ownerId: user?.id,
      ownerPhone: user?.phone,
      postedAgo: "abhi",
      status,
      createdAt: Date.now(),
    };
  }

  async function submit(status: "pending" | "draft") {
    if (!user) return;
    // draft me kam photos chalti hain, par live listing ke liye poori gallery chahiye
    if (status === "pending" && form.images.length < MIN_PHOTOS) {
      toast.error(`Kam se kam ${MIN_PHOTOS} photos add karein (abhi ${form.images.length} hain)`);
      return;
    }
    setBusy(true);

    const listing = buildListing(status);
    saveListing(listing);

    // free quota khatam ho chuka tha to plan ka credit kharch karo
    if (status === "pending" && gate.reason === "plan") consumeListingCredit();

    await sendMail({
      to: user.email,
      template: status === "draft" ? "listing-draft" : "listing-submitted",
      data: { title: listing.title, rent: listing.rent },
    });

    setSubmitted(status);
    setForm(emptyForm);
    setBusy(false);
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <LoginGate
          title="Property list karne ke liye login karein"
          subtitle="Owner account banayein — pehli listing bilkul free hai."
          redirect="/list-property"
        />
      </div>
    );
  }

  // NOTE: ye check gate se PEHLE aana chahiye. Listing save hote hi free quota
  // khatam ho jaata hai, to gate pehle chalta to success screen kabhi na dikhta.
  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-brand-green bg-card p-8 text-center shadow-soft">
          {submitted === "draft" ? (
            <GoNote aria-hidden="true" className="mx-auto h-12 w-12 text-primary" />
          ) : (
            <GoCheckCircleFill aria-hidden="true" className="mx-auto h-12 w-12 text-brand-green" />
          )}
          <h1 className="mt-3 text-2xl tracking-wide">
            {submitted === "draft" ? "Draft save ho gaya" : "Dhanyawaad!"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {submitted === "draft"
              ? "Aap dashboard se ise kabhi bhi dekh sakte hain."
              : "Aapki property details mil gayi hain. Admin verify karte hi listing live ho jayegi."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/dashboard" className="btn-primary">
              <GoStack aria-hidden="true" className="h-4 w-4" />
              Meri listings dekhein
            </Link>
            <button type="button" className="btn-outline" onClick={() => setSubmitted(null)}>
              <GoPlus aria-hidden="true" className="h-4 w-4" />
              Ek aur property list karein
            </button>
          </div>
        </div>
      </div>
    );
  }

  // free listing use ho chuki aur koi active plan nahi — plan page par bhejo
  if (!gate.allowed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 text-center">
        <GoTag aria-hidden="true" className="mx-auto h-12 w-12 text-accent" />
        <h1 className="mt-4 text-3xl tracking-wide">Free listing use ho chuki hai</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Aapki pehli {FREE_LISTINGS_PER_OWNER > 1 ? `${FREE_LISTINGS_PER_OWNER} ` : ""}listing free
          thi. Aur properties post karne ke liye ek plan chunein — one-time, monthly ya yearly.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/plans" className="btn-primary">
            <GoCreditCard aria-hidden="true" className="h-4 w-4" />
            Plans dekhein
          </Link>
          <Link to="/dashboard" className="btn-outline">
            <GoStack aria-hidden="true" className="h-4 w-4" />
            Meri listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl tracking-wide sm:text-4xl">Apni property list karein</h1>
      <p className="mt-2 text-muted-foreground">
        Details bharein — hamari team verify karke aapki listing live kar degi.
      </p>

      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
        <GoTag aria-hidden="true" className="h-4 w-4" />
        {gate.reason === "free"
          ? `Ye aapki free listing hai (${myListings.length + 1}/${FREE_LISTINGS_PER_OWNER})`
          : `Plan active: ${user.plan?.label}`}
      </p>

      <form
        className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          void submit("pending");
        }}
      >
        <Field label="Property title" htmlFor="title" full>
          <input
            id="title"
            required
            className="field"
            placeholder="2 BHK flat near Vijay Nagar square"
            value={form.title}
            onChange={set("title")}
          />
        </Field>
        <Field label="Property type" htmlFor="type">
          <select id="type" required className="field" value={form.type} onChange={set("type")}>
            <option value="" disabled>
              Select type
            </option>
            {propertyTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="BHK (flat ho to)" htmlFor="bhk">
          <select id="bhk" className="field" value={form.bhk} onChange={set("bhk")}>
            <option value="">Lagu nahi</option>
            {["1 BHK", "2 BHK", "3 BHK", "4 BHK"].map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Locality" htmlFor="locality">
          <select
            id="locality"
            required
            className="field"
            value={form.locality}
            onChange={set("locality")}
          >
            <option value="" disabled>
              Select locality
            </option>
            {localities.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Road / landmark" htmlFor="road">
          <input
            id="road"
            className="field"
            placeholder="Scheme 54 main road"
            value={form.road}
            onChange={set("road")}
          />
        </Field>
        <Field label="Expected rent (₹ / month)" htmlFor="rent">
          <input
            id="rent"
            required
            type="number"
            min="0"
            className="field"
            placeholder="12000"
            value={form.rent}
            onChange={set("rent")}
          />
        </Field>
        <Field label="Security deposit (₹)" htmlFor="deposit">
          <input
            id="deposit"
            type="number"
            min="0"
            className="field"
            placeholder="25000"
            value={form.deposit}
            onChange={set("deposit")}
          />
        </Field>
        <Field label="Area" htmlFor="area">
          <input
            id="area"
            required
            className="field"
            placeholder="1050 sq.ft."
            value={form.area}
            onChange={set("area")}
          />
        </Field>
        <Field label="Furnishing" htmlFor="furnishing">
          <select
            id="furnishing"
            className="field"
            value={form.furnishing}
            onChange={set("furnishing")}
          >
            {["Furnished", "Semi-Furnished", "Unfurnished"].map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Preferred tenant" htmlFor="preferred">
          <input
            id="preferred"
            className="field"
            placeholder="Family / Bachelors / Students"
            value={form.preferred}
            onChange={set("preferred")}
          />
        </Field>
        <Field label={`Photos (kam se kam ${MIN_PHOTOS})`} htmlFor="photo-files" full>
          <div className="rounded-2xl border border-dashed border-input bg-secondary/30 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="photo-files"
                className="btn-outline cursor-pointer bg-card aria-disabled:opacity-60"
                aria-disabled={uploading || form.images.length >= MAX_PHOTOS}
              >
                <GoUpload aria-hidden="true" className="h-4 w-4" />
                {uploading ? "Photos process ho rahi hain..." : "Phone/PC se photos chunein"}
              </label>
              <input
                id="photo-files"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={uploading || form.images.length >= MAX_PHOTOS}
                onChange={(e) => void handleFiles(e)}
              />
              <span className="text-sm text-muted-foreground">ya</span>
              <div className="flex min-w-[15rem] flex-1 gap-2">
                <input
                  type="url"
                  aria-label="Photo ka link"
                  className="field bg-card"
                  placeholder="https://... link paste karein"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPhotoUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-outline shrink-0 bg-card"
                  onClick={addPhotoUrl}
                >
                  <GoPlus aria-hidden="true" className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>

            <p
              className={`mt-3 text-sm ${
                form.images.length >= MIN_PHOTOS ? "text-brand-green" : "text-muted-foreground"
              }`}
            >
              {form.images.length}/{MIN_PHOTOS} photos
              {form.images.length >= MIN_PHOTOS
                ? " — badhiya! Pehli photo cover banegi."
                : ` — aur ${MIN_PHOTOS - form.images.length} photo add karein (max ${MAX_PHOTOS}).`}
            </p>

            {form.images.length > 0 && (
              <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {form.images.map((src, i) => (
                  <li key={src.slice(0, 64)} className="group relative">
                    <img
                      src={src}
                      alt={`Photo ${i + 1}`}
                      className="aspect-square w-full rounded-xl border border-border object-cover"
                    />
                    {i === 0 && (
                      <span className="badge-accent absolute left-1.5 top-1.5 !px-2 !py-0.5 !text-[10px]">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={`Photo ${i + 1} hataayein`}
                      onClick={() => removePhoto(src)}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/70 text-background transition hover:bg-destructive"
                    >
                      <GoX aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Field>
        <Field label="Amenities (comma se alag karein)" htmlFor="amenities" full>
          <input
            id="amenities"
            className="field"
            placeholder="Lift, Car Parking, 24x7 Water"
            value={form.amenities}
            onChange={set("amenities")}
          />
        </Field>
        <Field label="Description" htmlFor="description" full>
          <textarea
            id="description"
            rows={4}
            className="field"
            placeholder="Floor, furnishing, parking, paani, preferred tenant..."
            value={form.description}
            onChange={set("description")}
          />
        </Field>

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button type="submit" disabled={busy} className="btn-primary flex-1 disabled:opacity-60">
            <GoPaperAirplane aria-hidden="true" className="h-4 w-4" />
            {busy ? "Bhej rahe hain..." : "Submit listing"}
          </button>
          <button
            type="button"
            disabled={busy || !form.title}
            className="btn-outline disabled:opacity-60"
            onClick={() => void submit("draft")}
          >
            <GoNote aria-hidden="true" className="h-4 w-4" />
            Draft save karein
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  full,
  children,
}: {
  label: string;
  htmlFor: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

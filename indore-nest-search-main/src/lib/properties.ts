import { GoContainer, GoGoal, GoHomeFill, GoPeople, GoTag } from "react-icons/go";
import type { IconType } from "react-icons";
import { API_BASE } from "./api-client";

/*
 * Listing ka shared type aur UI constants.
 *
 * Pehle yahan 9 seed listings ka array bhi tha jo browser me hi rehta tha. Ab
 * saari listings backend se aati hain (`indoredera-api`), aur wo seed data
 * `indoredera-api/src/seed/seed-data.js` me chala gaya hai. Field names dono
 * taraf bilkul same hain.
 */

export type PropertyType = "flat" | "room" | "shop" | "pg" | "land";

export interface Property {
  id: string;
  title: string;
  titleHi: string;
  type: PropertyType;
  locality: string;
  rent: number;
  deposit: number;
  area: string;
  bhk?: string;
  furnishing: "Furnished" | "Semi-Furnished" | "Unfurnished";
  preferred: string;
  /** Cover photo — card aur og:image me yahi use hoti hai. */
  image: string;
  /** Poori gallery (cover samet). Purani listings me nahi hoti, isliye optional. */
  images?: string[];
  featured?: boolean;
  amenities: string[];
  description: string;
  ownerName: string;
  /** Server har response me taaza banata hai — "2 din pehle". */
  postedAgo: string;
  road?: string;
  tags?: string[];
  ownerId?: string;
  ownerPhone?: string;
  status?: "draft" | "pending" | "approved";
  createdAt?: number;
}

export const propertyTypes: {
  value: PropertyType;
  label: string;
  labelHi: string;
  /** react-icons/go (GitHub Octicons) ka component — emoji ki jagah. */
  icon: IconType;
  /** Roman-Hindi shabd jo log search me likhte hain. */
  aliases: string[];
}[] = [
  {
    value: "flat",
    label: "Flats",
    labelHi: "फ्लैट",
    icon: GoHomeFill,
    aliases: ["flat", "apartment", "ghar", "makan", "home", "house"],
  },
  {
    value: "room",
    label: "Rooms",
    labelHi: "कमरा",
    icon: GoContainer,
    aliases: ["room", "kamra", "kamara", "single"],
  },
  {
    value: "shop",
    label: "Shops",
    labelHi: "दुकान",
    icon: GoTag,
    aliases: ["shop", "dukaan", "dukan", "showroom", "office"],
  },
  {
    value: "pg",
    label: "PG / Hostel",
    labelHi: "पीजी",
    icon: GoPeople,
    aliases: ["pg", "hostel", "paying guest", "mess"],
  },
  {
    value: "land",
    label: "Land",
    labelHi: "ज़मीन",
    icon: GoGoal,
    aliases: ["land", "zameen", "jameen", "plot", "godown", "warehouse"],
  },
];

/**
 * Universal search — ek hi keyword box se type, locality, road, BHK, rent,
 * amenities, owner ka naam, sab kuch match hota hai (OLX jaisa).
 * Roman-Hindi bhi chalta hai: "dukaan", "kamra", "zameen".
 *
 * Ye client-side filter hai. Server par bhi text search hai (`?q=`), par abhi
 * listings itni kam hain ki poori list ek saath aa jaati hai aur filter turant
 * chalta hai — koi round-trip nahi.
 */
export function matchesQuery(p: Property, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;

  const typeMeta = propertyTypes.find((t) => t.value === p.type);
  const haystack = [
    p.title,
    p.titleHi,
    p.type,
    typeMeta?.label,
    typeMeta?.labelHi,
    ...(typeMeta?.aliases ?? []),
    p.locality,
    p.area,
    p.bhk,
    p.road,
    p.furnishing,
    p.preferred,
    p.description,
    p.ownerName,
    String(p.rent),
    ...(p.amenities ?? []),
    ...(p.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // numeric words ko poora token match karna padta hai, warna "2 BHK" ka "2"
  // rent "22000" ke andar bhi match ho jaata hai
  const numericTokens = new Set(haystack.match(/\d+/g) ?? []);

  // har word alag se match hona chahiye — "dukaan palasia" dono par filter kare
  return query.split(/\s+/).every((word) => {
    if (/^\d+$/.test(word)) return numericTokens.has(word);
    return haystack.includes(word);
  });
}

export const localities = [
  "Vijay Nagar",
  "Palasia",
  "Rau",
  "Bhawarkuan",
  "Sudama Nagar",
  "Nipania",
  "Scheme No. 78",
  "Rajwada",
  "Annapurna",
  "Mhow Naka",
];

/** Gallery — nayi listings me `images`, purani me sirf cover photo. */
export function propertyImages(p: Property): string[] {
  const list = (p.images ?? []).filter(Boolean);
  return list.length ? list : [p.image];
}

export const formatRent = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * Ek listing seedha API se — SSR loaders ke liye (jahan React context nahi hota).
 *
 * Sirf approved listings public par milti hain, isliye owner ki draft/pending
 * listing yahan `null` aayegi; component wahan site-data se le leta hai.
 * Server band ho to bhi page render hona chahiye, isliye error par `null`.
 */
export async function fetchProperty(id: string): Promise<Property | null> {
  try {
    const res = await fetch(`${API_BASE}/api/properties/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const { property } = (await res.json()) as { property: Property };
    return property ?? null;
  } catch {
    return null;
  }
}

/** Sitemap ke liye — saari public listings. */
export async function fetchPublicListings(): Promise<Property[]> {
  try {
    const res = await fetch(`${API_BASE}/api/properties?limit=200`);
    if (!res.ok) return [];
    const { items } = (await res.json()) as { items: Property[] };
    return items ?? [];
  } catch {
    return [];
  }
}

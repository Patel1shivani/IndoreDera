import { GoContainer, GoGoal, GoHomeFill, GoPeople, GoTag } from "react-icons/go";
import type { IconType } from "react-icons";

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
  postedAgo: string;
  /* Owner-submitted listings ke extra fields — seed data me optional hain. */
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

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1000&q=70`;

/* Seed listings ke liye extra interior photos — har listing ki gallery 5 photo ki
   ban jaati hai. Owner-submitted listings apni khud ki photos laati hain. */
const galleryPool = [
  "photo-1522708323590-d24dbb6b0267",
  "photo-1493809842364-78817add7ffb",
  "photo-1484154218962-a197022b5858",
  "photo-1502005229762-cf1b2da7c5d6",
  "photo-1600585154340-be6161a56a0c",
  "photo-1600566753086-00f18fb6b3ea",
  "photo-1616486338812-3dadae4b4ace",
  "photo-1600607687920-4e2a09cf159d",
];

const seedProperties: Property[] = [
  {
    id: "vn-2bhk-01",
    title: "2 BHK Semi-Furnished Flat near Scheme 54",
    titleHi: "विजय नगर में 2 BHK फ्लैट",
    type: "flat",
    locality: "Vijay Nagar",
    rent: 14500,
    deposit: 30000,
    area: "1050 sq.ft.",
    bhk: "2 BHK",
    furnishing: "Semi-Furnished",
    preferred: "Family / Working Couple",
    image: img("photo-1502672260266-1c1ef2d93688"),
    featured: true,
    amenities: ["Lift", "Car Parking", "24x7 Water", "Power Backup"],
    description:
      "Bright 2 BHK on the 3rd floor with modular kitchen, balcony facing the park and walking distance from C21 Mall. Ideal for families and working couples.",
    ownerName: "Rakesh Patidar",
    postedAgo: "2 din pehle",
  },
  {
    id: "pal-shop-02",
    title: "Ground Floor Shop on Palasia Main Road",
    titleHi: "पलासिया मेन रोड पर दुकान",
    type: "shop",
    locality: "Palasia",
    rent: 38000,
    deposit: 150000,
    area: "420 sq.ft.",
    furnishing: "Unfurnished",
    preferred: "Retail / Cafe",
    image: img("photo-1441986300917-64674bd600d8"),
    featured: true,
    amenities: ["Main Road Facing", "Shutter", "Washroom", "High Footfall"],
    description:
      "Prime retail space right on Palasia main road with excellent visibility. Suitable for showroom, cafe or clinic.",
    ownerName: "Suresh Jain",
    postedAgo: "5 din pehle",
  },
  {
    id: "bkn-pg-03",
    title: "Boys PG with Meals near Bhawarkuan Square",
    titleHi: "भंवरकुआं में बॉयज़ पीजी",
    type: "pg",
    locality: "Bhawarkuan",
    rent: 6500,
    deposit: 6500,
    area: "Sharing / Single",
    furnishing: "Furnished",
    preferred: "Students",
    image: img("photo-1555854877-bab0e564b8d5"),
    featured: true,
    amenities: ["3 Time Meals", "WiFi", "Laundry", "Study Table"],
    description:
      "Student-friendly PG minutes away from DAVV and coaching hubs. Home-style food, RO water and daily housekeeping included.",
    ownerName: "Anita Sharma",
    postedAgo: "1 hafta pehle",
  },
  {
    id: "nip-3bhk-04",
    title: "Spacious 3 BHK in Gated Society, Nipania",
    titleHi: "निपानिया में 3 BHK",
    type: "flat",
    locality: "Nipania",
    rent: 22000,
    deposit: 50000,
    area: "1450 sq.ft.",
    bhk: "3 BHK",
    furnishing: "Furnished",
    preferred: "Family",
    image: img("photo-1560448204-e02f11c3d0e2"),
    amenities: ["Clubhouse", "Gym", "Kids Play Area", "Security"],
    description:
      "Fully furnished 3 BHK in a premium gated township with clubhouse, gym and 24x7 security.",
    ownerName: "Deepak Verma",
    postedAgo: "3 din pehle",
  },
  {
    id: "sud-room-05",
    title: "Independent Room with Attached Bathroom",
    titleHi: "सुदामा नगर में सिंगल रूम",
    type: "room",
    locality: "Sudama Nagar",
    rent: 4500,
    deposit: 9000,
    area: "180 sq.ft.",
    furnishing: "Semi-Furnished",
    preferred: "Bachelors",
    image: img("photo-1522708323590-d24dbb6b0267"),
    amenities: ["Attached Bathroom", "Separate Entry", "Water Tank"],
    description:
      "Independent room on the first floor with separate entry, perfect for bachelors working nearby.",
    ownerName: "Mahesh Yadav",
    postedAgo: "4 din pehle",
  },
  {
    id: "rau-land-06",
    title: "Commercial Plot on Rau-Pithampur Road",
    titleHi: "राऊ में कमर्शियल प्लॉट",
    type: "land",
    locality: "Rau",
    rent: 45000,
    deposit: 200000,
    area: "5000 sq.ft.",
    furnishing: "Unfurnished",
    preferred: "Warehouse / Godown",
    image: img("photo-1500382017468-9049fed747ef"),
    amenities: ["Boundary Wall", "Road Access", "Electricity"],
    description:
      "Open plot with boundary wall on the busy Rau-Pithampur road. Great for godown, yard or event space.",
    ownerName: "Ramesh Chouhan",
    postedAgo: "1 hafta pehle",
  },
  {
    id: "sch78-1bhk-07",
    title: "Cosy 1 BHK near Scheme No. 78 Garden",
    titleHi: "स्कीम 78 में 1 BHK",
    type: "flat",
    locality: "Scheme No. 78",
    rent: 9000,
    deposit: 18000,
    area: "600 sq.ft.",
    bhk: "1 BHK",
    furnishing: "Semi-Furnished",
    preferred: "Couple / Bachelors",
    image: img("photo-1493809842364-78817add7ffb"),
    amenities: ["Balcony", "Two Wheeler Parking", "Borewell"],
    description:
      "Neat 1 BHK with balcony overlooking the garden. Quiet colony with easy access to Bypass road.",
    ownerName: "Neha Gupta",
    postedAgo: "6 din pehle",
  },
  {
    id: "raj-shop-08",
    title: "Compact Shop in Rajwada Market",
    titleHi: "राजवाड़ा मार्केट में दुकान",
    type: "shop",
    locality: "Rajwada",
    rent: 18000,
    deposit: 60000,
    area: "200 sq.ft.",
    furnishing: "Unfurnished",
    preferred: "Retail",
    image: img("photo-1604719312566-8912e9227c6a"),
    amenities: ["Heavy Footfall", "Shutter", "Loading Space"],
    description:
      "Small but high-traffic shop in the heart of the old city market — best for garments or accessories.",
    ownerName: "Imran Khan",
    postedAgo: "9 din pehle",
  },
  {
    id: "ann-pg-09",
    title: "Girls PG with AC Rooms, Annapurna",
    titleHi: "अन्नपूर्णा में गर्ल्स पीजी",
    type: "pg",
    locality: "Annapurna",
    rent: 7800,
    deposit: 8000,
    area: "Double Sharing",
    furnishing: "Furnished",
    preferred: "Working Women / Students",
    image: img("photo-1540518614846-7eded433c457"),
    amenities: ["AC Rooms", "CCTV", "Meals", "Warden"],
    description: "Safe and secure girls PG with CCTV, warden, AC rooms and hygienic homely meals.",
    ownerName: "Sunita Rao",
    postedAgo: "2 din pehle",
  },
];

/* Har seed listing ko cover + 4 interior photos ki gallery mil jaati hai. */
export const properties: Property[] = seedProperties.map((p, i) => {
  const start = (i * 2) % (galleryPool.length - 3);
  return {
    ...p,
    images: [p.image, ...galleryPool.slice(start, start + 4).map(img)],
  };
});

/** Gallery — nayi listings me `images`, purani me sirf cover photo. */
export function propertyImages(p: Property): string[] {
  const list = (p.images ?? []).filter(Boolean);
  return list.length ? list : [p.image];
}

export const formatRent = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const getProperty = (id: string) => properties.find((p) => p.id === id);

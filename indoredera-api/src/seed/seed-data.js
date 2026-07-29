/*
 * Default content.
 *
 * Pehle ye website ke `src/lib/site-data.tsx` aur `src/lib/properties.ts` me
 * hard-coded tha aur browser se server par push hota tha. Ab database hi source
 * of truth hai — website sirf padhti hai.
 */

const img = (seed) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1000&q=70`;
const wide = (seed) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1400&q=70`;

export const defaultHero = {
  logoText: "Indore Dera",
  logoTagline: "अपना घर, अपना शहर",
  badge: "Indore ka apna rental platform",
  titleStart: "Indore me",
  titleHighlight: "kiraye ka ghar",
  titleEnd: "dhundhna ab aasaan",
  subtitle:
    "Flat, room, dukaan, PG ya zameen — sab kuch ek jagah. Bina broker ke, seedha owner se baat karein.",
  searchCta: "Search ",
  ownerCta: "Owner hoon — property list karni hai",
  lockedTitle: "Properties dekhne ke liye login zaroori hai",
  lockedSubtitle:
    "Free account banayein aur Indore ki saari verified listings, rent, photos aur owner ka number turant dekhein.",
};

export const defaultBanners = [
  {
    id: "b-guest-1",
    audience: "guest",
    title: "Zero brokerage, 100% Indore",
    subtitle: "Account banayein aur 500+ verified listings unlock karein.",
    image: wide("photo-1560518883-ce09059eeffa"),
    ctaLabel: "Free account banayein",
    active: true,
    order: 0,
  },
  {
    id: "b-user-1",
    audience: "user",
    title: "Naye flats roz add ho rahe hain",
    subtitle: "Vijay Nagar, Nipania aur Super Corridor me fresh listings dekhein.",
    image: wide("photo-1502672260266-1c1ef2d93688"),
    ctaLabel: "Browse karein",
    active: true,
    order: 0,
  },
  {
    id: "b-user-2",
    audience: "user",
    title: "PG dhoondh rahe hain?",
    subtitle: "Bhawarkuan aur Annapurna ke student-friendly PG, meals ke saath.",
    image: wide("photo-1555854877-bab0e564b8d5"),
    ctaLabel: "PG dekhein",
    active: true,
    order: 1,
  },
  {
    id: "b-owner-1",
    audience: "owner",
    title: "Pehli listing bilkul free",
    subtitle: "Apni property post karein — hazaaron Indore tenants tak pahunchein.",
    image: wide("photo-1560448204-e02f11c3d0e2"),
    ctaLabel: "Property list karein",
    active: true,
    order: 0,
  },
];

export const defaultTestimonials = [
  {
    id: "t-1",
    name: "Pooja Sharma",
    locality: "Vijay Nagar",
    rating: 5,
    message:
      "Do din me 2 BHK mil gaya, wo bhi bina kisi broker ke. Owner se seedha baat hui aur rent bhi kam mila.",
    status: "approved",
    createdAt: 0,
  },
  {
    id: "t-2",
    name: "Imran Khan",
    locality: "Rajwada",
    rating: 4,
    message: "Apni dukaan yahan list ki thi, ek hafte me kirayedaar mil gaya. Listing free thi.",
    status: "approved",
    createdAt: 0,
  },
  {
    id: "t-3",
    name: "Anjali Verma",
    locality: "Bhawarkuan",
    rating: 5,
    message: "Girls PG dhoondhna Indore me mushkil tha. Yahan photos aur meals ki detail mil gayi.",
    status: "approved",
    createdAt: 0,
  },
];

export const defaultPlans = [
  {
    id: "one-time",
    label: "One-time listing",
    price: 99,
    period: "ek listing",
    credits: 1,
    durationDays: null,
    perks: ["Ek extra property post karein", "30 din tak live", "Owner ka number visible"],
    highlight: false,
    order: 0,
    active: true,
  },
  {
    id: "monthly",
    label: "Monthly",
    price: 299,
    period: "/ month",
    credits: null,
    durationDays: 30,
    perks: ["Unlimited listings", "Featured tag", "Priority support"],
    highlight: true,
    order: 1,
    active: true,
  },
  {
    id: "yearly",
    label: "Yearly",
    price: 1999,
    period: "/ year",
    credits: null,
    durationDays: 365,
    perks: ["Unlimited listings", "Featured tag", "2 mahine free", "Priority support"],
    highlight: false,
    order: 2,
    active: true,
  },
];

/* Seed listings ki gallery ke liye interior photos — har listing ko cover +
   4 photos milti hain. */
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

const day = 86_400_000;

const baseListings = [
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
    ageDays: 2,
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
    ageDays: 5,
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
    ageDays: 7,
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
    ageDays: 3,
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
    ageDays: 4,
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
    ageDays: 7,
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
    ageDays: 6,
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
    ageDays: 9,
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
    ageDays: 2,
  },
];

/** Seed listings — gallery aur createdAt seed time ke hisaab se banti hai. */
export function defaultListings(now = Date.now()) {
  return baseListings.map(({ ageDays, ...p }, i) => {
    const start = (i * 2) % (galleryPool.length - 3);
    return {
      ...p,
      images: [p.image, ...galleryPool.slice(start, start + 4).map(img)],
      featured: p.featured ?? false,
      status: "approved",
      createdAt: now - ageDays * day,
    };
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

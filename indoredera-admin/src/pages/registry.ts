import { Icons, type IconType } from "../lib/icons";

type PageDef = {
  id: string;
  label: string;
  icon: IconType;
  group: string;
  description: string;
  /** Panel guide page par ye dikhta hai — is section me admin kya-kya kar sakta hai. */
  can: string[];
};

/** Sidebar nav + page ids ek hi jagah. `group` sidebar me heading banata hai. */
export const pages = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Icons.dashboard,
    group: "Overview",
    description: "Ek nazar me sab kuch",
    can: [
      "Live listings, pending approvals aur users ka count dekhein",
      "Plan revenue aur active subscriptions track karein",
      "Naye registrations aur naya feedback turant dekhein",
      "Ek click me pending kaam wale page par jaayein",
    ],
  },
  {
    id: "guide",
    label: "Panel guide",
    icon: Icons.guide,
    group: "Overview",
    description: "Is panel me kya-kya hota hai",
    can: ["Har section ka kaam samjhein", "Demo login aur data server ki jaankari dekhein"],
  },
  {
    id: "listings",
    label: "Listings",
    icon: Icons.listings,
    group: "Manage",
    description: "Properties approve ya hataayein",
    can: [
      "Owner ki bheji nayi property approve karein",
      "Live listing ko wapas hide karein",
      "Galat ya duplicate listing delete karein",
      "Type, area, owner ya status se dhoondhein",
    ],
  },
  {
    id: "users",
    label: "Users",
    icon: Icons.users,
    group: "Manage",
    description: "Registered tenants, owners aur admins",
    can: [
      "Website par register hue saare users dekhein",
      "Kisi ka role tenant / owner / admin karein",
      "User ka contact, plan aur listing count dekhein",
      "Fake ya spam account delete karein",
    ],
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: Icons.subscriptions,
    group: "Manage",
    description: "Kisne kaunsa plan liya hai",
    can: [
      "Plan lene wale saare users ki listing dekhein",
      "Credits bachi hain aur kab expire hoga — dono dekhein",
      "Plan-wise revenue aur subscriber count dekhein",
      "Manually kisi ko plan dein ya uska plan hataayein",
    ],
  },
  {
    id: "testimonials",
    label: "Testimonials",
    icon: Icons.testimonials,
    group: "Manage",
    description: "Customer feedback moderate karein",
    can: [
      "Naya feedback approve karke website par dikhaayein",
      "Live testimonial hide ya delete karein",
      "Rating aur message padhein",
    ],
  },
  {
    id: "banners",
    label: "Banners",
    icon: Icons.banners,
    group: "Content",
    description: "Audience ke hisaab se offers",
    can: [
      "Guest, tenant aur owner ke liye alag banner banayein",
      "Image, title aur button text set karein",
      "Banner live karein ya hide karein",
    ],
  },
  {
    id: "content",
    label: "Hero & logo",
    icon: Icons.content,
    group: "Content",
    description: "Homepage ka hero, logo aur login gate",
    can: [
      "Homepage ka hero title aur subtitle badlein",
      "Logo text aur tagline set karein",
      "Login gate ka message edit karein",
      "Live preview dekhte hue likhein",
    ],
  },
  {
    id: "home-text",
    label: "Home page text",
    icon: Icons.trophy,
    group: "Content",
    description: "Hero ke neeche wale sections aur FAQ",
    can: [
      '"Indore Dera hi kyun?" ke cards likhein aur unka icon chunein',
      '"Kaise kaam karta hai?" ke steps badlein',
      "FAQ ke sawaal-jawab add, edit ya delete karein",
      "Har list ka kram upar-neeche karke set karein",
    ],
  },
  {
    id: "about",
    label: "About page",
    icon: Icons.info,
    group: "Content",
    description: "About page ka poora text",
    can: [
      "Hero ka title, intro aur tick points badlein",
      '"Dera ka matlab" wala box edit karein',
      '"Hum kya hain / kya nahi hain" ki dono list badlein',
      "Kirayedaar aur owner ke steps, aur “Hamara vaada” ke cards likhein",
    ],
  },
  {
    id: "contact",
    label: "Contact & footer",
    icon: Icons.mail,
    group: "Content",
    description: "Address, phone, email aur footer tagline",
    can: [
      "Office address, phone, email aur timings badlein",
      "Contact page ka heading aur thank-you message likhein",
      "Footer ki tagline set karein",
      "Ek jagah badlein — contact page aur footer dono par lag jaata hai",
    ],
  },
  {
    id: "legal",
    label: "Privacy & Terms",
    icon: Icons.lock,
    group: "Content",
    description: "Dono policy pages ke clauses",
    can: [
      "Privacy Policy aur Terms ka poora text edit karein",
      "Naya clause add karein ya purana hataayein",
      "Clauses ka kram upar-neeche karein",
      '"Last updated" date badlein',
    ],
  },
  {
    id: "plans",
    label: "Plans",
    icon: Icons.plans,
    group: "Content",
    description: "Listing plans aur pricing",
    can: [
      "Plan ka naam, price aur period badlein",
      "Listing credits aur validity days set karein",
      "Perks list edit karein",
      '"Sabse popular" tag kisi ek plan par lagayein',
    ],
  },
] as const satisfies readonly PageDef[];

export type PageId = (typeof pages)[number]["id"];

/** Sidebar ke liye group order. */
export const pageGroups = ["Overview", "Manage", "Content"] as const;

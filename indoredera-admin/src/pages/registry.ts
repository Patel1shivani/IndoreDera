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
    label: "Site content",
    icon: Icons.content,
    group: "Content",
    description: "Hero, logo aur gate ka text",
    can: [
      "Homepage ka hero title aur subtitle badlein",
      "Logo text aur tagline set karein",
      "Login gate ka message edit karein",
      "Live preview dekhte hue likhein",
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

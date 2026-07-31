import mongoose from "mongoose";
import { jsonOptions } from "./shared.js";

/*
 * Website ka saara editable text. Ye singleton hai — collection me hamesha ek
 * hi document rehta hai (`key: "site"`), isliye admin ko kabhi id yaad nahi
 * rakhni.
 *
 * Pehle sirf hero yahan tha aur About/Contact/Privacy/Terms/FAQ website ke code
 * me hard-coded the — matlab ek comma badalne ke liye bhi deploy karna padta
 * tha. Ab wo saara text bhi isi document me section-wise rehta hai aur admin
 * panel se badla ja sakta hai.
 *
 * Har section ke schema defaults wahi text hain jo pehle code me the. Mongoose
 * defaults hydration par bhi lagte hain, isliye purane database me ye sections
 * apne aap bhar jaate hain — alag migration ki zaroorat nahi.
 */

/* Icon ka naam string me jaata hai; dono frontend ke paas isi vocabulary ka
   naam→component map hai aur anjaan naam par wo fallback icon dikha dete hain. */
export const CONTENT_ICONS = [
  "tag",
  "globe",
  "location",
  "shield",
  "verified",
  "zap",
  "comment",
  "search",
  "personAdd",
  "home",
  "rocket",
  "clock",
  "mail",
  "phone",
  "star",
  "check",
  "creditCard",
  "people",
  "info",
];

/* ------------------------------------------------------------ chhote blocks */

/** Icon + title + description — steps, values aur why-points sab isi shape me. */
const blurbSchema = new mongoose.Schema(
  {
    icon: { type: String, default: "" },
    t: { type: String, default: "" },
    d: { type: String, default: "" },
  },
  { _id: false },
);

const faqSchema = new mongoose.Schema(
  { q: { type: String, default: "" }, a: { type: String, default: "" } },
  { _id: false },
);

/** Legal page ka ek numbered clause — paragraph aur/ya bullet list. */
const clauseSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    items: { type: [String], default: () => [] },
  },
  { _id: false },
);

/** Privacy aur Terms ka dhaancha ek hi hai — sirf default text alag. */
const legalDocSchema = (defaults) =>
  new mongoose.Schema(
    {
      title: { type: String, default: defaults.title },
      updated: { type: String, default: defaults.updated },
      intro: { type: String, default: defaults.intro },
      sections: { type: [clauseSchema], default: () => defaults.sections },
    },
    { _id: false },
  );

/* ------------------------------------------------------------------- hero */

const heroSchema = new mongoose.Schema(
  {
    logoText: { type: String, default: "Indore Dera" },
    logoTagline: { type: String, default: "अपना घर, अपना शहर" },
    badge: { type: String, default: "" },
    titleStart: { type: String, default: "" },
    titleHighlight: { type: String, default: "" },
    titleEnd: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    searchCta: { type: String, default: "Search" },
    ownerCta: { type: String, default: "" },
    /** Logged-out visitors ko dikhne wala gate. */
    lockedTitle: { type: String, default: "" },
    lockedSubtitle: { type: String, default: "" },
  },
  { _id: false },
);

/* ---------------------------------------------------------------- contact */

/* Ye block do jagah chalta hai — /contact page ke cards aur footer ka "Reach
   Us" column. Do jagah alag rakhne se hamesha ek number purana reh jaata tha. */
const contactSchema = new mongoose.Schema(
  {
    heading: { type: String, default: "Sampark karein" },
    subheading: {
      type: String,
      default: "Koi sawaal ya suggestion? Hum Indore me hi hain, jaldi jawab denge.",
    },
    address: { type: String, default: "Vijay Nagar, Indore, MP 452010" },
    phone: { type: String, default: "+91 8962504009" },
    email: { type: String, default: "shivimukati74@gmail.com" },
    timings: { type: String, default: "Mon – Sat, 10am – 7pm" },
    sentTitle: { type: String, default: "Message bhej diya gaya" },
    sentText: { type: String, default: "Hum jald hi aapse sampark karenge." },
    footerTagline: {
      type: String,
      default: "Indore ka apna rental platform — flats, rooms, shops, PG aur zameen, sab ek jagah.",
    },
  },
  { _id: false },
);

/* ------------------------------------------------------------------ about */

const aboutSchema = new mongoose.Schema(
  {
    badge: { type: String, default: "अपना घर, अपना शहर" },
    title: { type: String, default: "Indore ke liye, Indore walon dwara" },
    intro: {
      type: String,
      default:
        "Indore Dera ek hyperlocal rental platform hai jo sirf Indore par focus karta hai. Rajwada ki galiyon se lekar Nipania ki nayi societies tak — har locality, har budget.",
    },
    bullets: {
      type: [String],
      default: () => ["Zero brokerage", "Seedha owner se baat", "Sirf Indore"],
    },

    meaningTitle: { type: String, default: "“Dera” ka matlab" },
    meaningBody: {
      type: String,
      default:
        "Malwa ki bol-chaal me dera matlab padav — wo jagah jahan aap ruk kar apna thikana bana lete ho. “Dera jamaana” yaani kahin tik jaana. Indore me padhne, naukri karne ya dukaan kholne aane wale har insaan ko sabse pehle yahi chahiye hota hai — ek dera. Isi liye naam rakha Indore Dera.",
    },

    weAreTitle: { type: String, default: "Indore Dera hai" },
    weAre: {
      type: [String],
      default: () => [
        "Sirf Indore ka rental platform",
        "Owner aur kirayedaar ko seedha jodne ka zariya",
        "Roman-Hindi me chalne wala search — ‘dukaan’, ‘kamra’, ‘zameen’",
        "Listing daalne ke liye bilkul free",
      ],
    },
    weAreNotTitle: { type: String, default: "Indore Dera nahi hai" },
    weAreNot: {
      type: [String],
      default: () => [
        "Broker ya property agency",
        "Kisi property ke malik ya rent lene wale",
        "Paise ke len-den ke beech me aane wale",
        "Doosre shehron ki listings dikhane wale",
      ],
    },

    howTitle: { type: String, default: "Kaam kaise karta hai" },
    howSubtitle: { type: String, default: "Kirayedaar ho ya owner — teen hi step, dono taraf." },
    tenantTitle: { type: String, default: "Kirayedaar ke liye" },
    tenantSteps: {
      type: [blurbSchema],
      default: () => [
        { t: "Search karein", d: "Ilaaka, budget ya seedha ‘2 BHK Vijay Nagar’ likh dein." },
        { t: "Listing dekhein", d: "Photos, rent, deposit aur amenities — sab ek page par." },
        { t: "Owner se baat", d: "Call ya WhatsApp par seedha owner se — koi beech me nahi." },
      ],
    },
    ownerTitle: { type: String, default: "Owner ke liye" },
    ownerSteps: {
      type: [blurbSchema],
      default: () => [
        { t: "Listing daalein", d: "Photos aur detail bharein — pehli listing free hai." },
        { t: "Verify hoti hai", d: "Admin check karta hai taaki fake listings na aayein." },
        { t: "Enquiries aayein", d: "Genuine registered users hi aapse contact karte hain." },
      ],
    },

    typesTitle: { type: String, default: "Kya-kya milta hai" },
    localitiesSubtitle: {
      type: String,
      default: "Kisi bhi ilaake par click karke wahan ki listings dekh lein.",
    },

    valuesTitle: { type: String, default: "Hamara vaada" },
    values: {
      type: [blurbSchema],
      default: () => [
        {
          icon: "tag",
          t: "Zero brokerage",
          d: "Tenant aur owner seedha connect hote hain — beech me koi commission nahi.",
        },
        {
          icon: "globe",
          t: "Local zubaan",
          d: "Hindi-English mix me listings, taaki har koi asaani se samajh sake.",
        },
        {
          icon: "location",
          t: "Sirf Indore",
          d: "Har listing Indore ki hai — koi irrelevant result nahi.",
        },
        {
          icon: "shield",
          t: "Number surakshit",
          d: "Aapka mobile number sirf owner tak jaata hai, kisi broker list me nahi.",
        },
      ],
    },

    ctaTitle: { type: String, default: "Shuru karein aaj hi" },
    ctaText: {
      type: String,
      default: "Ghar dhoondhna ho ya kiraye par dena — dono ke liye account free hai.",
    },
    helpTitle: { type: String, default: "Koi sawaal ya shikayat?" },
    helpText: { type: String, default: "Seedha likh dein — hum jaldi jawab dete hain." },
  },
  { _id: false },
);

/* ------------------------------------------------------------------- home */

const homeSchema = new mongoose.Schema(
  {
    whyTitle: { type: String, default: "Indore Dera hi kyun?" },
    whySubtitle: {
      type: String,
      default: "Kirayedaar aur owner, dono ke liye seedha-saada tareeka",
    },
    whyPoints: {
      type: [blurbSchema],
      default: () => [
        {
          icon: "tag",
          t: "Zero brokerage",
          d: "Na broker, na commission. Jo rent listing me likha hai, bas wahi dena hota hai.",
        },
        {
          icon: "comment",
          t: "Seedha owner se baat",
          d: "Call ya WhatsApp par khud owner — beech me koi agent nahi, jawab turant.",
        },
        {
          icon: "verified",
          t: "Verified listings",
          d: "Har listing admin check karta hai, tabhi live hoti hai. Fake photos nahi.",
        },
        {
          icon: "zap",
          t: "Ek box, poora Indore",
          d: "‘2 BHK Vijay Nagar 10000’ ya ‘dukaan Palasia’ — jaise bolte hain waise hi search.",
        },
      ],
    },

    stepsTitle: { type: String, default: "Kaise kaam karta hai?" },
    stepsSubtitle: {
      type: String,
      default: "Teen step — aur aap seedha owner se baat kar rahe honge",
    },
    steps: {
      type: [blurbSchema],
      default: () => [
        {
          icon: "personAdd",
          t: "Account banayein",
          d: "Free registration — uske baad saari listings unlock ho jaati hain.",
        },
        { icon: "search", t: "Search karein", d: "Ek hi box me area, BHK, budget ya type likhein." },
        {
          icon: "comment",
          t: "Owner se baat",
          d: "Bina brokerage, seedha owner ko call ya WhatsApp.",
        },
      ],
    },

    faqTitle: { type: String, default: "Aksar poochhe jaane wale sawaal" },
    faqSubtitle: { type: String, default: "Jo sawaal Indore walon ne sabse zyada poochhe" },
    faqs: {
      type: [faqSchema],
      default: () => [
        {
          q: "Kya Indore Dera par brokerage lagti hai?",
          a: "Bilkul nahi. Aap seedha owner se baat karte hain — beech me koi broker nahi, isliye kirayedaar ko ek rupaya brokerage nahi deni padti.",
        },
        {
          q: "Listing dekhne ke liye account zaroori hai?",
          a: "Haan, ek free account banana padta hai. Isse owner ka number sirf genuine logon tak jaata hai aur fake enquiries ruk jaati hain. Registration me sirf naam, mobile aur email lagta hai.",
        },
        {
          q: "Main apni property kaise list karun?",
          a: "‘List Your Property’ par jaayein, photos ke saath detail bharein aur submit kar dein. Pehli listing bilkul free hai; admin verify karte hi wo live ho jaati hai.",
        },
        {
          q: "Kitni der me listing approve hoti hai?",
          a: "Aam taur par 24 ghante ke andar. Photos saaf hon aur rent, deposit, area sahi bhare hon to approval jaldi ho jaata hai.",
        },
        {
          q: "Kaun-kaun se ilaake cover hote hain?",
          a: "Poora Indore — Vijay Nagar, Palasia, Nipania, Bhawarkuan, Rau, Sudama Nagar, Annapurna, Rajwada, Mhow Naka aur Scheme No. 78 tak.",
        },
        {
          q: "Flat ke alawa aur kya milta hai?",
          a: "Room, dukaan/showroom, PG-hostel aur zameen/godown bhi. Search box me seedha ‘dukaan’ ya ‘kamra’ likhein — Roman-Hindi bhi samajh me aata hai.",
        },
      ],
    },
  },
  { _id: false },
);

/* ------------------------------------------------------------------ legal */

const privacyDefaults = {
  title: "Privacy Policy",
  updated: "28 July 2026",
  intro:
    "Indore Dera par aapki jaankari sirf ek hi kaam ke liye hai — owner aur tenant ko aapas me jodna. Neeche saaf-saaf likha hai ki hum kya collect karte hain, kyun karte hain aur aap use kaise control kar sakte hain.",
  sections: [
    {
      title: "Hum kya collect karte hain",
      body: "",
      items: [
        "Account details — naam, mobile number, email aur password (password encrypted form me store hota hai).",
        "Listing details — property ka address/locality, rent, photos, amenities aur owner ka contact number.",
        "Enquiry details — aap kis property par call ya WhatsApp click karte hain.",
        "Technical data — browser, device type aur basic usage logs, taaki site theek chale aur spam roka ja sake.",
      ],
    },
    {
      title: "Is data ka use kis liye hota hai",
      body: "Hum aapka data bechte nahi hain, aur na hi kisi broker ya third-party advertiser ko rent par dete hain.",
      items: [
        "Aapko sahi listings dikhane aur search/filter chalane ke liye.",
        "Tenant ko owner se seedha connect karne ke liye — bina kisi broker ke.",
        "Account, plan aur listing se judi zaroori emails bhejne ke liye.",
        "Fraud, fake listing aur duplicate posting rokne ke liye.",
      ],
    },
    {
      title: "Listing par public kya dikhta hai",
      body: "Jab aap property list karte hain, to listing me di gayi jaankari — locality, rent, photos aur aapka contact number — logged-in users ko public taur par dikhti hai. Yahi is platform ka poora point hai: tenant seedha aapse baat kar sake. Agar aap contact number nahi dikhana chahte, to listing publish na karein ya humein email karke usse hata dein.",
      items: [],
    },
    {
      title: "Sharing aur third parties",
      body: "",
      items: [
        "Hosting aur email delivery jaise service providers, sirf platform chalane ke liye.",
        "Kanooni zaroorat par — court order ya valid government request aane par.",
        "Iske alawa kisi ke saath aapka personal data share nahi hota.",
      ],
    },
    {
      title: "Cookies aur local storage",
      body: "Hum aapke browser me login session aur kuch preferences save karte hain, taaki har baar dobara login na karna pade. Ye tracking ke liye nahi hai. Browser settings se aap inhe kabhi bhi clear kar sakte hain — uske baad dobara login karna padega.",
      items: [],
    },
    {
      title: "Data kitne din rakha jaata hai",
      body: "Account rehne tak aapka data rehta hai. Listing hataane par wo public search se turant nikal jaati hai. Account delete karne ki request par hum aapka personal data hata dete hain — sirf wahi records rehte hain jo kanoonan ya fraud-record ke liye rakhne zaroori hain.",
      items: [],
    },
    {
      title: "Aapke rights",
      body: "In sabke liye shivimukati74@gmail.com par email karein — hum aam taur par 7 working days me jawab dete hain.",
      items: [
        "Apna data dekhne, sudharne ya update karne ka haq.",
        "Account aur listings delete karwane ka haq.",
        "Marketing emails se opt-out karne ka haq (zaroori transactional email phir bhi aayenge).",
      ],
    },
    {
      title: "Security",
      body: "Passwords hashed form me store hote hain aur data encrypted connection (HTTPS) par jaata hai. Phir bhi internet par 100% security kisi ki guarantee nahi hoti — apna password kisi ke saath share na karein, aur shaq hone par turant badal dein.",
      items: [],
    },
    {
      title: "Bachche",
      body: "Ye platform 18 saal se kam umar walon ke liye nahi hai. Agar aapko lagta hai ki kisi minor ne account banaya hai, to humein batayein — hum wo account hata denge.",
      items: [],
    },
    {
      title: "Policy me badlaav",
      body: 'Zaroorat padne par ye policy update ho sakti hai. Naya version isi page par "Last updated" date ke saath publish hoga. Bada badlaav hone par registered users ko email se bhi bata diya jaayega.',
      items: [],
    },
    {
      title: "Sampark",
      body: "Privacy se judi kisi bhi baat ke liye: shivimukati74@gmail.com, ya Indore Dera, Vijay Nagar, Indore, Madhya Pradesh 452010.",
      items: [],
    },
  ],
};

const termsDefaults = {
  title: "Terms & Conditions",
  updated: "28 July 2026",
  intro:
    "Indore Dera use karke aap in shartein se sehmat hote hain. Chhota sa saar: hum ek listing platform hain, broker nahi — deal aapke aur doosre paksh ke beech hoti hai.",
  sections: [
    {
      title: "Humara role",
      body: "Indore Dera sirf ek platform hai jahan property owners apni listing daalte hain aur tenants unhe dhoondh kar seedha sampark karte hain. Hum na broker hain, na agent, na kisi property ke maalik. Rent, deposit, agreement ya possession — in sab par faisla aapka aur doosre paksh ka hota hai, aur uski zimmedari bhi aap dono ki hai.",
      items: [],
    },
    {
      title: "Account",
      body: "",
      items: [
        "Account banane ke liye aapki umar 18 saal ya usse zyada honi chahiye.",
        "Registration me di gayi jaankari sahi aur updated honi chahiye.",
        "Apne login credentials ki suraksha aapki zimmedari hai — aapke account se hui har activity aapki maani jaayegi.",
        "Ek hi vyakti ke kai fake accounts banane par sabhi accounts band kiye ja sakte hain.",
      ],
    },
    {
      title: "Listing ke niyam",
      body: "Niyam todne wali listing hum bina notice hata sakte hain, aur baar-baar aisa hone par account suspend kar sakte hain.",
      items: [
        "Sirf wahi property list karein jiske aap owner hain ya jiske liye aapko owner ki permission hai.",
        "Rent, deposit, area aur photos asli aur current honi chahiye — fake ya purani photos allowed nahi.",
        "Ek hi property ko baar-baar duplicate listing me post na karein.",
        "Aisi property list na karein jo kanoonan rent par nahi di ja sakti, ya jis par vivaad/court case chal raha ho.",
        "Listing me caste, dharm ya kisi community ke against bhedbhav wali baat nahi likhi ja sakti.",
      ],
    },
    {
      title: "Kya nahi kar sakte",
      body: "",
      items: [
        "Doosron ke contact numbers ko marketing ya spam ke liye use karna.",
        "Bots, scraper ya automated tools se data nikalna.",
        "Platform ki security todne ki koshish karna ya kisi aur ke account me ghusna.",
        "Broker hote hue khud ko owner batakar listing daalna.",
      ],
    },
    {
      title: "Plans aur payment",
      body: "Pehli listing free hai. Uske baad zyada listings ke liye one-time, monthly ya yearly plan lena padta hai — har plan ki credits, duration aur keemat Plans page par saaf likhi hoti hai. Plan activate hone ke baad amount refundable nahi hai, siwaye us case ke jab technical galti se paisa do baar kat gaya ho. Niyam todne par account band hone ki soorat me bacha hua plan balance zabt ho sakta hai.",
      items: [],
    },
    {
      title: "Verification aapki zimmedari",
      body: "Hum listings par nazar rakhte hain, par har property ko physically verify nahi kar sakte. Paisa dene se pehle property khud jaakar dekhein, owner ke documents check karein, likhit rent agreement banwayein aur tenant/owner ka verification karwayein. Kisi bhi haal me advance amount bina property dekhe transfer na karein.",
      items: [],
    },
    {
      title: "Zimmedari ki seema",
      body: 'Platform "as is" diya jaata hai. Users dwara di gayi jaankari ki sacchai, ya aapke aur doosre paksh ke beech hui deal, dispute, nuksaan ya dhokhadhadi ke liye Indore Dera zimmedaar nahi hoga. Kisi bhi claim me humari maximum zimmedari utni hi hogi jitna aapne pichhle 12 mahine me plan ke liye humein bhugtan kiya hai.',
      items: [],
    },
    {
      title: "Content aur IP",
      body: "Aapki listing ki photos aur text par haq aapka hi rehta hai, par listing daalte waqt aap humein unhe website aur uske promotion me dikhane ki permission dete hain. Indore Dera ka naam, logo aur design humari property hai — bina permission use na karein.",
      items: [],
    },
    {
      title: "Account band karna",
      body: "Aap jab chahein apna account band karwa sakte hain. Hum bhi fraud, fake listing ya in shartein ke ullanghan par account suspend ya delete kar sakte hain — gambhir maamlon me bina pehle notice diye.",
      items: [],
    },
    {
      title: "Kanoon aur adhikar-kshetra",
      body: "In shartein par Bharat ka kanoon lagu hoga. Kisi bhi vivaad par sirf Indore, Madhya Pradesh ki adalaton ka adhikar-kshetra maanya hoga.",
      items: [],
    },
    {
      title: "Shartein me badlaav",
      body: 'Ye shartein samay-samay par update ho sakti hain. Update ke baad platform use karte rehna hi nayi shartein maanne ka matlab hoga. Har version ki date upar "Last updated" me dikhti hai.',
      items: [],
    },
    {
      title: "Sampark",
      body: "Sawaal ho to shivimukati74@gmail.com par likhein, ya Indore Dera, Vijay Nagar, Indore, Madhya Pradesh 452010 par sampark karein.",
      items: [],
    },
  ],
};

const legalSchema = new mongoose.Schema(
  {
    privacy: { type: legalDocSchema(privacyDefaults), default: () => ({}) },
    terms: { type: legalDocSchema(termsDefaults), default: () => ({}) },
  },
  { _id: false },
);

/* ------------------------------------------------------------------- root */

const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, default: "site", unique: true, immutable: true },
    hero: { type: heroSchema, default: () => ({}) },
    contact: { type: contactSchema, default: () => ({}) },
    about: { type: aboutSchema, default: () => ({}) },
    home: { type: homeSchema, default: () => ({}) },
    legal: { type: legalSchema, default: () => ({}) },
  },
  { timestamps: true, toJSON: jsonOptions(["key"]), toObject: jsonOptions() },
);

/** Document na ho to bana deta hai — pehle request par crash na ho. */
siteContentSchema.statics.singleton = async function singleton() {
  const doc = await this.findOneAndUpdate(
    { key: "site" },
    { $setOnInsert: { key: "site" } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  /* Purane document me naye sections hote hi nahi. Mongoose hydration par
     defaults bhar deta hai, par wo database me tabhi jaate hain jab hum save
     karein — warna har request unhe dobara memory me bharti rehti. */
  if (doc.isModified()) await doc.save();
  return doc;
};

export const SiteContent = mongoose.model("SiteContent", siteContentSchema);
export { heroSchema };

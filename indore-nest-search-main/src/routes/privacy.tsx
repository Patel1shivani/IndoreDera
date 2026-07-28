import { createFileRoute } from "@tanstack/react-router";
import { LegalList, LegalPage, LegalSection } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Indore Dera" },
      {
        name: "description",
        content:
          "Indore Dera aapka data kaise collect, use aur protect karta hai — poori privacy policy Hindi-English me.",
      },
      { property: "og:title", content: "Privacy Policy — Indore Dera" },
      {
        property: "og:description",
        content:
          "Aapka data kaise use hota hai, kiske saath share hota hai aur aapke rights kya hain.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="28 July 2026"
      intro="Indore Dera par aapki jaankari sirf ek hi kaam ke liye hai — owner aur tenant ko aapas me jodna. Neeche saaf-saaf likha hai ki hum kya collect karte hain, kyun karte hain aur aap use kaise control kar sakte hain."
    >
      <LegalSection n={1} title="Hum kya collect karte hain">
        <LegalList
          items={[
            "Account details — naam, mobile number, email aur password (password encrypted form me store hota hai).",
            "Listing details — property ka address/locality, rent, photos, amenities aur owner ka contact number.",
            "Enquiry details — aap kis property par call ya WhatsApp click karte hain.",
            "Technical data — browser, device type aur basic usage logs, taaki site theek chale aur spam roka ja sake.",
          ]}
        />
      </LegalSection>

      <LegalSection n={2} title="Is data ka use kis liye hota hai">
        <LegalList
          items={[
            "Aapko sahi listings dikhane aur search/filter chalane ke liye.",
            "Tenant ko owner se seedha connect karne ke liye — bina kisi broker ke.",
            "Account, plan aur listing se judi zaroori emails bhejne ke liye.",
            "Fraud, fake listing aur duplicate posting rokne ke liye.",
          ]}
        />
        <p>
          Hum aapka data bechte nahi hain, aur na hi kisi broker ya third-party advertiser ko rent
          par dete hain.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Listing par public kya dikhta hai">
        <p>
          Jab aap property list karte hain, to listing me di gayi jaankari — locality, rent, photos
          aur aapka contact number — logged-in users ko public taur par dikhti hai. Yahi is platform
          ka poora point hai: tenant seedha aapse baat kar sake. Agar aap contact number nahi
          dikhana chahte, to listing publish na karein ya humein email karke usse hata dein.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Sharing aur third parties">
        <LegalList
          items={[
            "Hosting aur email delivery jaise service providers, sirf platform chalane ke liye.",
            "Kanooni zaroorat par — court order ya valid government request aane par.",
            "Iske alawa kisi ke saath aapka personal data share nahi hota.",
          ]}
        />
      </LegalSection>

      <LegalSection n={5} title="Cookies aur local storage">
        <p>
          Hum aapke browser me login session aur kuch preferences save karte hain, taaki har baar
          dobara login na karna pade. Ye tracking ke liye nahi hai. Browser settings se aap inhe
          kabhi bhi clear kar sakte hain — uske baad dobara login karna padega.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Data kitne din rakha jaata hai">
        <p>
          Account rehne tak aapka data rehta hai. Listing hataane par wo public search se turant
          nikal jaati hai. Account delete karne ki request par hum aapka personal data hata dete
          hain — sirf wahi records rehte hain jo kanoonan ya fraud-record ke liye rakhne zaroori
          hain.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Aapke rights">
        <LegalList
          items={[
            "Apna data dekhne, sudharne ya update karne ka haq.",
            "Account aur listings delete karwane ka haq.",
            "Marketing emails se opt-out karne ka haq (zaroori transactional email phir bhi aayenge).",
          ]}
        />
        <p>
          In sabke liye shivimukati74@gmail.com par email karein — hum aam taur par 7 working days me
          jawab dete hain.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Security">
        <p>
          Passwords hashed form me store hote hain aur data encrypted connection (HTTPS) par jaata
          hai. Phir bhi internet par 100% security kisi ki guarantee nahi hoti — apna password kisi
          ke saath share na karein, aur shaq hone par turant badal dein.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Bachche">
        <p>
          Ye platform 18 saal se kam umar walon ke liye nahi hai. Agar aapko lagta hai ki kisi minor
          ne account banaya hai, to humein batayein — hum wo account hata denge.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Policy me badlaav">
        <p>
          Zaroorat padne par ye policy update ho sakti hai. Naya version isi page par "Last updated"
          date ke saath publish hoga. Bada badlaav hone par registered users ko email se bhi bata
          diya jaayega.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Sampark">
        <p>
          Privacy se judi kisi bhi baat ke liye: shivimukati74@gmail.com, ya Indore Dera, Vijay Nagar,
          Indore, Madhya Pradesh 452010.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

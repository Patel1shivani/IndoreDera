import { createFileRoute } from "@tanstack/react-router";
import { LegalList, LegalPage, LegalSection } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Indore Dera" },
      {
        name: "description",
        content:
          "Indore Dera use karne ki shartein — listing rules, account rules, payment, liability aur jurisdiction.",
      },
      { property: "og:title", content: "Terms & Conditions — Indore Dera" },
      {
        property: "og:description",
        content: "Platform use karne se pehle ye shartein padh lein.",
      },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="28 July 2026"
      intro="Indore Dera use karke aap in shartein se sehmat hote hain. Chhota sa saar: hum ek listing platform hain, broker nahi — deal aapke aur doosre paksh ke beech hoti hai."
    >
      <LegalSection n={1} title="Humara role">
        <p>
          Indore Dera sirf ek platform hai jahan property owners apni listing daalte hain aur
          tenants unhe dhoondh kar seedha sampark karte hain. Hum na broker hain, na agent, na kisi
          property ke maalik. Rent, deposit, agreement ya possession — in sab par faisla aapka aur
          doosre paksh ka hota hai, aur uski zimmedari bhi aap dono ki hai.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Account">
        <LegalList
          items={[
            "Account banane ke liye aapki umar 18 saal ya usse zyada honi chahiye.",
            "Registration me di gayi jaankari sahi aur updated honi chahiye.",
            "Apne login credentials ki suraksha aapki zimmedari hai — aapke account se hui har activity aapki maani jaayegi.",
            "Ek hi vyakti ke kai fake accounts banane par sabhi accounts band kiye ja sakte hain.",
          ]}
        />
      </LegalSection>

      <LegalSection n={3} title="Listing ke niyam">
        <LegalList
          items={[
            "Sirf wahi property list karein jiske aap owner hain ya jiske liye aapko owner ki permission hai.",
            "Rent, deposit, area aur photos asli aur current honi chahiye — fake ya purani photos allowed nahi.",
            "Ek hi property ko baar-baar duplicate listing me post na karein.",
            "Aisi property list na karein jo kanoonan rent par nahi di ja sakti, ya jis par vivaad/court case chal raha ho.",
            "Listing me caste, dharm ya kisi community ke against bhedbhav wali baat nahi likhi ja sakti.",
          ]}
        />
        <p>
          Niyam todne wali listing hum bina notice hata sakte hain, aur baar-baar aisa hone par
          account suspend kar sakte hain.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Kya nahi kar sakte">
        <LegalList
          items={[
            "Doosron ke contact numbers ko marketing ya spam ke liye use karna.",
            "Bots, scraper ya automated tools se data nikalna.",
            "Platform ki security todne ki koshish karna ya kisi aur ke account me ghusna.",
            "Broker hote hue khud ko owner batakar listing daalna.",
          ]}
        />
      </LegalSection>

      <LegalSection n={5} title="Plans aur payment">
        <p>
          Pehli listing free hai. Uske baad zyada listings ke liye one-time, monthly ya yearly plan
          lena padta hai — har plan ki credits, duration aur keemat{" "}
          <span className="font-medium text-foreground">Plans</span> page par saaf likhi hoti hai.
          Plan activate hone ke baad amount refundable nahi hai, siwaye us case ke jab technical
          galti se paisa do baar kat gaya ho. Niyam todne par account band hone ki soorat me bacha
          hua plan balance zabt ho sakta hai.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Verification aapki zimmedari">
        <p>
          Hum listings par nazar rakhte hain, par har property ko physically verify nahi kar sakte.
          Paisa dene se pehle property khud jaakar dekhein, owner ke documents check karein, likhit
          rent agreement banwayein aur tenant/owner ka verification karwayein. Kisi bhi haal me
          advance amount bina property dekhe transfer na karein.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Zimmedari ki seema">
        <p>
          Platform "as is" diya jaata hai. Users dwara di gayi jaankari ki sacchai, ya aapke aur
          doosre paksh ke beech hui deal, dispute, nuksaan ya dhokhadhadi ke liye Indore Dera
          zimmedaar nahi hoga. Kisi bhi claim me humari maximum zimmedari utni hi hogi jitna aapne
          pichhle 12 mahine me plan ke liye humein bhugtan kiya hai.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Content aur IP">
        <p>
          Aapki listing ki photos aur text par haq aapka hi rehta hai, par listing daalte waqt aap
          humein unhe website aur uske promotion me dikhane ki permission dete hain. Indore Dera ka
          naam, logo aur design humari property hai — bina permission use na karein.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Account band karna">
        <p>
          Aap jab chahein apna account band karwa sakte hain. Hum bhi fraud, fake listing ya in
          shartein ke ullanghan par account suspend ya delete kar sakte hain — gambhir maamlon me
          bina pehle notice diye.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Kanoon aur adhikar-kshetra">
        <p>
          In shartein par Bharat ka kanoon lagu hoga. Kisi bhi vivaad par sirf Indore, Madhya
          Pradesh ki adalaton ka adhikar-kshetra maanya hoga.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Shartein me badlaav">
        <p>
          Ye shartein samay-samay par update ho sakti hain. Update ke baad platform use karte rehna
          hi nayi shartein maanne ka matlab hoga. Har version ki date upar "Last updated" me dikhti
          hai.
        </p>
      </LegalSection>

      <LegalSection n={12} title="Sampark">
        <p>
          Sawaal ho to shivimukati74@gmail.com par likhein, ya Indore Dera, Vijay Nagar, Indore, Madhya
          Pradesh 452010 par sampark karein.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

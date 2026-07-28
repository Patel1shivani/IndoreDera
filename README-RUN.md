# Indore Dera — teen alag apps, teen terminal

```
indore-nest-search-main/
├── indore-nest-search-main/   → website        http://localhost:8080
├── indoredera-admin/          → admin panel    http://localhost:5174
└── indoredera-api/            → data server    http://localhost:4000
```

Teeno poori tarah alag hain. Website ke `src/` me admin ka ek bhi file nahi hai,
aur admin app website ke code par depend nahi karta. Beech me sirf API server hai.

## Chalane ka tareeka

Teen alag terminal kholein — **data server sabse pehle**:

**Terminal 1 — data server**

```bash
cd indoredera-api
npm install    # sirf pehli baar
npm run dev
```

**Terminal 2 — website**

```bash
cd indore-nest-search-main
npm run dev
```

**Terminal 3 — admin panel**

```bash
cd indoredera-admin
npm install    # sirf pehli baar
npm run dev
```

## Admin login

| | |
|---|---|
| URL | http://localhost:5174 |
| Email | `admin@indoredera.in` |
| Password | `admin123` |

Ye account **data server** banata hai (`indoredera-api/server.js`), website nahi.
Login page par "Demo credentials bharein" button bhi hai.

Website par admin ka koi link ya button nahi hai — admin panel sirf apne port par
milta hai.

## "Port 5174 is already in use" aaye to

Purana dev server abhi chal raha hai. PowerShell me:

```powershell
Get-NetTCPConnection -LocalPort 5174 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

(5174 ki jagah 8080 ya 4000 daal kar unke liye bhi.)

## Data server kyun zaroori hai

Website `:8080` par hai aur admin `:5174` par. Browser inhe **alag origin** maanta
hai, isliye dono ka `localStorage` alag hota hai — admin ko website ka data dikhta
hi nahi.

API server beech me rehta hai:

- Website load par server se content padhti hai, har change server par bhejti hai.
- Admin app **sirf** server se padhta hai (uska apna localStorage nahi hai) aur har
  5 second me refresh karta hai — isliye nayi registration/listing apne aap aa jaati hai.

Server band ho to website `localStorage` par chalti rehti hai (kuch tootega nahi),
bas admin ko changes nahi dikhenge. Console me info message aata hai.

**Pehli baar:** server khaali hota hai. Ek baar website kholein — wo default content
(9 listings, banners, testimonials, plans) server par bhej degi, phir admin me sab
dikhne lagega.

## Data reset

```bash
curl -X DELETE http://localhost:4000/api/state
```

Data file: `indoredera-api/data.json` (ise delete kar dein to bhi reset ho jaata hai).

## Ye abhi bhi demo hai

- `indoredera-api` sab kuch ek JSON file me rakhta hai, "last write wins" chalta hai.
  Ye asli backend nahi hai — Express + Mongoose (User, Property, Testimonial, Banner,
  Plan models) + JWT isko replace karega. Field names wahi rakhe hain taaki migration
  seedha rahe.
- Passwords SHA-256 se hash hote hain — asli app me bcrypt, aur compare server par.
- Emails asli nahi jaate (`src/lib/mailer.ts` sirf toast dikhata hai).
- Plan purchase mock hai — koi payment nahi hota, Razorpay lagana baaki hai.
- Admin app ke types (`indoredera-admin/src/lib/types.ts`) website ke types ki copy
  hain. Backend aane par inhe ek shared package ya generated types se replace karein,
  warna dono alag ho jaayenge.

Har jagah code me `TODO(backend)` comment hai.

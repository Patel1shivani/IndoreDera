# Indore Dera — teen alag apps, teen terminal

```
IndoreDera/
├── indore-nest-search-main/   → website        http://localhost:8080
├── indoredera-admin/          → admin panel    http://localhost:5174
└── indoredera-api/            → backend        http://localhost:4000  (+ MongoDB)
```

Website aur admin panel poori tarah alag hain — ek doosre ke code par koi
dependency nahi. Beech me backend hai, aur asli data MongoDB me rehta hai.

## Zaroorat

- Node 18+
- **MongoDB** — local (`mongodb://127.0.0.1:27017`) ya MongoDB Atlas ka URI

Windows par local MongoDB chal raha hai ya nahi:

```powershell
Get-Service MongoDB
```

## Chalane ka tareeka

Teen alag terminal kholein — **backend sabse pehle**:

**Terminal 1 — backend**

```bash
cd indoredera-api
npm install          # sirf pehli baar
cp .env.example .env # sirf pehli baar — phir MONGODB_URI check karein
npm run dev
```

Pehli baar chalne par ye khud hi default content (9 listings, banners,
testimonials, plans) aur admin account bana deta hai.

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

Ye account backend banata hai — credentials `indoredera-api/.env` me hain
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`). Login page par "Demo credentials bharein"
button bhi hai. Website par admin ka koi link nahi hai.

## Purana data (agar pehle se chala rahe the)

Purana server sab kuch `indoredera-api/data.json` me rakhta tha. Use MongoDB me
le aane ke liye ek baar:

```bash
cd indoredera-api
npm run migrate
```

Listings, users, banners, testimonials aur plans — sab aa jaate hain. Purane
passwords SHA-256 me the; wo `legacyPasswordHash` me aate hain aur user ke agle
sahi login par apne aap bcrypt me upgrade ho jaate hain. Kisi ko password reset
nahi karna padta.

## Data reset

```bash
cd indoredera-api
npm run seed:fresh     # sab mita kar defaults par wapas (admin bacha rehta hai)
```

Admin panel se bhi ho jaata hai (`POST /api/admin/reset`).

## "Port already in use" aaye to

PowerShell me:

```powershell
Get-NetTCPConnection -LocalPort 5174 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

(5174 ki jagah 8080 ya 4000 daal kar unke liye bhi.)

## Backend kyun zaroori hai

Website `:8080` par hai aur admin `:5174` par — browser inhe alag origin maanta
hai, isliye dono ka `localStorage` alag hota hai.

Pehle ye app poori tarah browser me chalti thi: users, passwords aur listings
`localStorage` me the, aur ek chhota server sab kuch ek JSON file me push kar
deta tha. Ab aisa nahi hai:

- **Database hi source of truth hai.** Dono apps sirf padhte-likhte hain, apna
  data nahi rakhte.
- **Auth server par hai.** Password bcrypt se hash hota hai, session JWT hai,
  aur "kaun admin hai" server decide karta hai — browser nahi.
- **Rules server par lagte hain.** Free-listing quota, plan credits, aur
  "listing approve karna sirf admin ka kaam hai" — sab backend enforce karta hai.
  Client inhe bypass nahi kar sakta.
- **Har change apne endpoint par jaata hai** (`PATCH /api/properties/:id/status`
  jaisa), poora blob overwrite nahi hota. Do admin ek saath kaam karein to ek ka
  change doosre ko nahi mitata.

Backend band ho to ab apps chalti nahi — data unke paas hai hi nahi. Terminal 1
sabse pehle chalayein.

API ki poori detail: [`indoredera-api/README.md`](indoredera-api/README.md)

## Abhi bhi baaki hai

- **Payments** — plan purchase abhi bina paise ke activate ho jaata hai.
  Razorpay lagana baaki hai.
- **Photo uploads** — photos base64 me database me jaati hain. S3/Cloudinary par
  bhejni chahiye.
- **Emails** — `src/lib/mailer.ts` sirf toast dikhata hai, asli mail nahi jaata.
- **Types** — website aur admin ke types duplicate hain. Backend ke zod schemas
  se generate karna behtar hoga, warna dheere-dheere drift ho jaayenge.

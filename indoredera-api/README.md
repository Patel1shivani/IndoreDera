# Indore Dera API

Express + MongoDB (Mongoose) + JWT. Website (`:8080`) aur admin panel (`:5174`)
dono isi se baat karte hain — data ka single source of truth yahi hai.

## Chalane ka tareeka

```bash
npm install
cp .env.example .env     # phir .env me MONGODB_URI check karein
npm run dev              # http://localhost:4000
```

MongoDB local par chal raha ho (`mongodb://127.0.0.1:27017/indoredera`) ya Atlas
ka SRV URI `.env` me daal dein. Connect na ho to server start hi nahi hota aur
terminal par kya check karna hai wo likha aata hai.

### Scripts

| command | kya karta hai |
|---|---|
| `npm run dev` | `--watch` ke saath server |
| `npm start` | production server |
| `npm run seed` | khaali collections me default content bharta hai |
| `npm run seed:fresh` | sab mita kar defaults par wapas (admins bache rehte hain) |
| `npm run migrate` | purane `data.json` ko MongoDB me le aata hai |

Server har start par `seedIfEmpty()` chalata hai (`SEED_ON_START=true`), isliye
pehli baar kuch manually karne ki zaroorat nahi. Production me ise `false` rakhein.

## Auth

- Password **bcrypt** se hash hota hai. Browser me kabhi hash nahi banta.
- Login par **JWT** milta hai — response body me (`token`) aur httpOnly cookie
  dono me. Frontends `Authorization: Bearer` header use karte hain kyunki wo
  API se alag origin par chalte hain.
- Har request par user database se load hota hai, token se sirf id aati hai —
  isliye role ya plan badalne ka asar turant hota hai.

### Purane accounts

Purana app SHA-256 use karta tha. `npm run migrate` un accounts ko
`legacyPasswordHash` me le aata hai; user ke **agle sahi login par** password
apne aap bcrypt me upgrade ho jaata hai aur purana hash hat jaata hai. User ko
kuch reset nahi karna padta.

## Endpoints

`GET /health` — service + database status.

### Auth — `/api/auth`

| method | path | access |
|---|---|---|
| POST | `/register` | public (role sirf `tenant`/`owner`) |
| POST | `/login` | public |
| POST | `/logout` | public |
| GET | `/me` | login |
| PATCH | `/profile` | login |
| POST | `/change-password` | login |

`/register` aur `/login` par rate limit lagi hai.

### Content — `/api/content`

| method | path | access |
|---|---|---|
| GET | `/` | public — saara site text + banners + testimonials + listings + plans, ek call me |
| GET | `/hero` | public |
| PATCH | `/hero` | admin |
| GET | `/contact` | public |
| PATCH | `/contact` | admin |
| GET | `/about` | public |
| PATCH | `/about` | admin |
| GET | `/home` | public |
| PATCH | `/home` | admin |
| GET | `/legal/:page` | public — `page` = `privacy` ya `terms` |
| PATCH | `/legal/:page` | admin |

`GET /api/content` ka jawab caller ke hisaab se badalta hai:

- guest/tenant — approved listings, approved feedback, active banners
- owner — upar wala + apni saari listings (draft/pending samet)
- admin — sab kuch

**Website ka text kahan rehta hai.** About, Contact, Privacy, Terms, home page
ke sections aur FAQ — sab `SiteContent` singleton ke andar hain (ek hi document,
`key: "site"`). Pehle ye sab website ke code me hard-coded tha; ab admin panel
se badalta hai. Har section ka apna PATCH hai taaki do admin ek saath alag-alag
page edit karein to ek doosre ka kaam na mite.

PATCH partial hota hai — jo field bheji sirf wahi badalti hai. Arrays iska
apwaad hain: wo poori replace hoti hain (warna "teesra bullet hata do" bheja hi
nahi ja sakta). Defaults model me hain, isliye purane database me ye sections
pehli request par apne aap bhar jaate hain — koi migration nahi chalani padti.

### Listings — `/api/properties`

| method | path | access |
|---|---|---|
| GET | `/` | public (`?q &type &locality &minRent &maxRent &status &ownerId &page &limit`) |
| GET | `/:id` | public (approved), warna owner/admin |
| POST | `/` | login — **quota server par lagti hai** |
| PATCH | `/:id` | owner ya admin |
| PATCH | `/:id/status` | admin |
| PATCH | `/:id/featured` | admin |
| DELETE | `/:id` | owner ya admin |

Pehli listing free; uske baad active plan chahiye, warna **402** aata hai.
Plan wala credit server ghatata hai — client se nahi hota. Owner apni approved
listing edit kare to wo dobara `pending` ho jaati hai.

### Baaki

| resource | GET | write |
|---|---|---|
| `/api/banners` | public (active) / admin (sab) | admin: `POST`, `PUT /:id`, `DELETE /:id` |
| `/api/testimonials` | public (approved) / admin (sab) | `POST` public → hamesha `pending`; admin: `PATCH /:id/status`, `DELETE /:id` |
| `/api/plans` | public (active) / admin (sab) | admin: `POST`, `PUT /:id`, `DELETE /:id`; login: `POST /:id/purchase` |
| `/api/users` | admin | admin: `PATCH /:id/role`, `PATCH /:id/plan`, `DELETE /:id` |
| `/api/admin/stats` | admin | — |
| `/api/admin/reset` | admin (`POST`) | sab mita kar seed par wapas |

Aakhri admin ka role badalna ya use delete karna rok diya jaata hai — warna
panel me wapas ghusa hi nahi ja sakta. User delete hone par uski listings bhi
jaati hain.

## Errors

Har error ek hi shape me aata hai:

```json
{ "error": { "message": "Yeh email pehle se registered hai. Login karein.", "details": {} } }
```

`message` seedha user ko dikhaya ja sakta hai. `stack` sirf development me aata hai.

## Structure

```
src/
├── server.js            entry — config check → DB connect → seed → listen
├── app.js               express wiring (helmet, cors, cookies, routes, errors)
├── config/
│   ├── env.js           saari env reading + production config check
│   └── db.js            mongoose connect, reconnect events, health
├── models/              User, Property, Banner, Testimonial, Plan, SiteContent
├── middleware/          auth (requireAuth/requireAdmin), validate (zod), error
├── validators/          request schemas
├── routes/              per-resource routers
├── lib/                 ApiError, asyncHandler, tokens, objects
└── seed/
    ├── seed-data.js     default hero/banners/testimonials/plans/listings
    ├── seed.js          seedIfEmpty, resetToSeed, ensureAdmin
    └── migrate-json.js  purana data.json → MongoDB
```

## Production se pehle

`NODE_ENV=production` par server khud check karta hai aur kamzor config par
start hone se mana kar deta hai:

- `JWT_SECRET` 32+ random characters ka ho
- `SEED_ON_START=false`
- `ADMIN_PASSWORD` default na ho

Iske alawa abhi ye baaki hai:

- **Photos** base64 data-URL me database me jaati hain (isliye `50mb` body limit).
  Inhe S3/Cloudinary par bhejein aur sirf URL rakhein.
- **Payments** — `POST /api/plans/:id/purchase` abhi bina paise ke plan activate
  kar deta hai. Razorpay order + signature verify iske aage lagana hai.
- **Emails** abhi sirf browser me toast dikhate hain (`src/lib/mailer.ts`).
  Nodemailer/Resend ke saath `POST /api/mail` yahan banana hai.
- **Refresh tokens** nahi hain — JWT 7 din ka hai aur expire hone par dobara
  login karna padta hai.

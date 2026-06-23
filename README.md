# Pipeline Ledger — Mini CRM Opportunity Tracker

A full-stack MERN application for tracking a shared sales opportunity pipeline: leads, follow-ups, and deal stages, with JWT authentication and ownership-based authorization.

Built for the CEOFactory.vc MERN Stack Developer Assignment.

- **Live application:** _add your deployed frontend URL here_
- **Backend API:** https://mini-crm-opportunity-tracker-y192.onrender.com
- **Repository:** https://github.com/kavyanerella65/mini-crm-opportunity-tracker

---

## 1. Project overview

Every logged-in user can see the **entire shared pipeline** of opportunities created by the whole team, but can only **edit or delete the opportunities they personally created**. Ownership is always derived from the JWT on the backend — the frontend never sends, and the backend never trusts, a user id from the request body.

Core features:
- Register / login with bcrypt-hashed passwords and JWT (2-hour expiry)
- Create, view, update, and delete opportunities with full ownership enforcement
- Shared dashboard with search, filters (stage/priority/"my opportunities"), sorting, and pagination
- Dashboard summary cards: open pipeline value, won value, high-priority open deals, total opportunities
- Clear loading, empty, and error states throughout
- Responsive layout — a real `<table>` on desktop, stacked cards on mobile

## 2. Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router v6, Axios, Tailwind CSS v3, lucide-react icons |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| Validation | `express-validator` |
| Security middleware | `helmet`, `cors` |
| Testing | Jest + Supertest (backend) |

## 3. Project structure

```
mini-crm/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── constants/enums.js
│   │   ├── controllers/{authController,opportunityController}.js
│   │   ├── middleware/{authMiddleware,errorMiddleware,validators,asyncHandler}.js
│   │   ├── models/{User,Opportunity}.js
│   │   ├── routes/{authRoutes,opportunityRoutes}.js
│   │   ├── utils/{generateToken,isOwner}.js
│   │   ├── app.js        # Express app (exported for tests)
│   │   └── server.js     # Connects to MongoDB + starts the HTTP server
│   ├── tests/             # Jest + Supertest test suite
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/    # Navbar, OpportunityList, FilterBar, SummaryStrip, etc.
    │   ├── context/AuthContext.jsx
    │   ├── pages/{Login,Register,Dashboard,OpportunityForm}.jsx
    │   ├── services/{api,authService,opportunityService}.js
    │   ├── utils/         # formatting, enum constants, JWT decode helper
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── .env.example
```

## 4. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev             # nodemon, http://localhost:5000
```

Run the test suite (mocks Mongoose models — no live database required):

```bash
npm test
```

### Backend environment variables

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `5000`) |
| `MONGO_URI` | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | Long random string used to sign/verify JWTs — **generate your own** |
| `JWT_EXPIRES_IN` | Token lifetime (assignment requires ~2 hours, e.g. `2h`) |
| `CLIENT_URL` | Comma-separated list of allowed frontend origins for CORS |
| `NODE_ENV` | `development` \| `production` \| `test` |

The server refuses to start with a clear error message if `MONGO_URI` or `JWT_SECRET` is missing.

## 5. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # then set VITE_API_URL to your backend's /api URL
npm run dev             # http://localhost:5173
```

### Frontend environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` in development or `https://your-backend.onrender.com/api` in production |

## 6. API reference

All responses are JSON in the shape `{ success, message?, data?, errors? }`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | Public | `{ name, email, password }` → `201` with `{ user, token }`. `409` if email already registered. |
| POST | `/api/auth/login` | Public | `{ email, password }` → `200` with `{ user, token }`. `401` (generic message) on bad credentials. |
| GET | `/api/auth/me` | Private | Returns the logged-in user's profile. |

### Opportunities

| Method | Endpoint | Access rule |
|---|---|---|
| GET | `/api/opportunities` | Any authenticated user — shared pipeline. Supports `?search=&stage=&priority=&mine=true&sortBy=&order=&page=&limit=` |
| GET | `/api/opportunities/summary` | Any authenticated user — dashboard totals |
| GET | `/api/opportunities/:id` | Any authenticated user |
| POST | `/api/opportunities` | Any authenticated user — `owner` is always set from the JWT, never the body |
| PUT | `/api/opportunities/:id` | **Owner only** — `403` otherwise |
| DELETE | `/api/opportunities/:id` | **Owner only** — `403` otherwise |

**Opportunity fields:** `customerName*`, `contactName`, `contactEmail`, `contactPhone`, `requirement*`, `estimatedValue`, `stage` (`New`/`Contacted`/`Qualified`/`Proposal Sent`/`Won`/`Lost`), `priority` (`Low`/`Medium`/`High`), `nextFollowUpDate`, `notes`. (`*` = required.)

Sending `owner`, `user_id`, or `created_by` in the request body for create/update returns `400 Validation failed` — identity is derived exclusively from the verified JWT.

## 7. Security implementation notes

- Passwords are hashed with `bcrypt` (10 salt rounds) in a Mongoose `pre('save')` hook; the field is `select: false` so it's never returned by default.
- JWT is verified in `authMiddleware.js`, which loads the real user from the database and attaches it as `req.user` — controllers only ever trust `req.user._id`.
- Every update/delete re-checks `opportunity.owner` against `req.user._id` on the backend (`utils/isOwner.js`), regardless of what the frontend UI shows or hides.
- Centralized error handler normalizes Mongoose `CastError`, `ValidationError`, and duplicate-key errors into consistent JSON responses with appropriate status codes.

## 8. Deployment steps

This was deployed using **MongoDB Atlas** (database), **Render** (backend), and **Vercel** (frontend) — substitute Railway/AWS/your own VPS as needed.

### 8.1 MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add a database user (username/password) and, under Network Access, allow access from anywhere (`0.0.0.0/0`) for simplicity, or your hosting provider's IPs.
3. Copy the connection string and use it as `MONGO_URI` (include a database name, e.g. `.../mini-crm?retryWrites=true&w=majority`).

### 8.2 Backend on Render
1. Push this repo to GitHub.
2. On [render.com](https://render.com), create a **New Web Service** → connect the repo → set **Root Directory** to `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=2h`, `CLIENT_URL` (your Vercel frontend URL once you have it), `NODE_ENV=production`.
5. Deploy, then verify `https://<your-backend>.onrender.com/api/health` returns `{ "success": true }`.

### 8.3 Frontend on Vercel
1. On [vercel.com](https://vercel.com), import the same repo → set **Root Directory** to `frontend`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Add environment variable `VITE_API_URL=https://<your-backend>.onrender.com/api`.
4. Deploy, then go back to Render and update `CLIENT_URL` to the resulting Vercel URL so CORS allows it.

## 9. Known limitations / pending improvements

- No password-reset / email-verification flow (out of scope for the assignment).
- Refresh tokens aren't implemented — when the 2-hour JWT expires, the user is logged out and must sign in again.
- Free-tier Render backends spin down when idle, so the first request after inactivity can take ~30–50 seconds to respond.
- No real-time updates (e.g. via Socket.IO) — other users' changes appear on next refresh/filter change, not live.
- Search uses a case-insensitive regex match rather than a dedicated full-text search index in production queries.

## 10. Bonus features implemented

- Search, filtering (stage/priority/owner), sorting, and pagination on `GET /api/opportunities`
- Dashboard summary cards (open pipeline value, won value, high-priority open, total opportunities)
- Responsive UI (table on desktop, cards on mobile) with empty/loading/error states throughout
- Centralized error handling and request logging on the backend
- Jest + Supertest test suite covering authentication requirements and ownership-based authorization (the two most security-critical behaviors in the spec)

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0%3A07061a%2C100%3A8b5cf6&height=180&section=header&text=Ledger&fontSize=64&fontColor=ffffff&fontAlignY=35&desc=Every%20store%20earns%20its%20stars&descAlignY=57&descSize=20" alt="Ledger banner"/>

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_LIVE_DEMO-Visit_Site-8b5cf6?style=for-the-badge)](https://roxiler-store-rating-system-theta.vercel.app)
[![API Health](https://img.shields.io/badge/API_HEALTH-Check_Status-34d399?style=for-the-badge)](https://roxiler-store-rating-system-snw7.onrender.com/api/health)

<br/>

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=flat-square&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-316192?style=flat-square&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/API-Render-46E3B7?style=flat-square&logo=render&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

**A role-based store rating platform**: one login, three roles (Administrator, Store Owner, Member), and one shared ledger of 1-5 star ratings.

[**🔗 View Live Site**](https://roxiler-store-rating-system-theta.vercel.app)

</div>

<br/>

## 📋 Table of Contents

<details>
<summary>Click to expand</summary>

- [Overview](#-overview)
- [Try It](#-try-it)
- [Features](#-features)
- [Architecture](#%EF%B8%8F-architecture)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Screenshots](#-screenshots)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Modules](#-api-modules)
- [Validation Rules](#-validation-rules)
- [Security](#-security)
- [Deployment](#-deployment)
- [Design Decisions](#-design-decisions)
- [Challenge Checklist](#-challenge-checklist)
- [Roadmap](#%EF%B8%8F-roadmap)
- [Author](#-author)
- [License](#-license)

</details>

<br/>

## 🌍 Overview

Most rating apps treat every visitor the same. **Ledger** is built on one idea: *a rating is an entry in a ledger, and different people need different views of the same ledger.*

| Role | Their view of the ledger |
|---|---|
| **Administrator** | The whole book: totals, every user, every store, full add / edit / delete control |
| **Store Owner** | Their own pages: average rating, and exactly who rated their store and when |
| **Member** | The public face: discover stores, give a 1-5 star rating, change it any time |

A single login screen sends each person to the right workspace, and the **server** enforces the role on every request, not just the UI.

It is a separate REST API (Express + PostgreSQL) consumed by a React single-page app (Vite, hand-written CSS with a design-token system, no UI framework), with JWT auth, bcrypt-hashed passwords, and role checks enforced at the middleware level. It was built for the **Roxiler FullStack Intern coding challenge**.

> ⚠️ **Note:** The API runs on a free-tier host and sleeps after 15 minutes of inactivity. The first request after that can take 30-60 seconds to wake it up. After that it is fast.

<br/>

## 🎮 Try It

Open the **[live site](https://roxiler-store-rating-system-theta.vercel.app)** and sign in with a demo account:

| Role | Email | Password | What to try |
|---|---|---|---|
| 🛡️ Administrator | `admin@example.com` | `Test@1234` | Dashboard, add / edit / delete users and stores, filters and sorting |
| 🏪 Store Owner | `owner@example.com` | `Test@1234` | Average rating and the list of everyone who rated your store |
| ⭐ Member | `user1@example.com` | `Test@1234` | Search stores, rate 1-5, then change your rating |

Or create your own **Member** account from the sign-up page. The name must be 20-60 characters.

<br/>

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

**🛡️ Administrator**
- Dashboard with animated totals (users, owners, stores, ratings), a role-distribution chart, and a top-rated stores leaderboard
- Add, edit and delete **users** (Admin / Owner / Member) and **stores**; assign a store to an owner
- Filter by name, email, address and role; sort ascending or descending on every column
- User detail view; for a Store Owner it also shows their average rating
- Safety rails: an admin cannot delete or demote their own account

**⭐ Member**
- Self sign-up and login; update your own password
- Search stores by name or address (debounced, so it does not fire a request per keystroke)
- See each store's **overall rating** next to **your own rating**
- Submit a 1-5 star rating and modify it later; the database allows only one rating per store

**🏪 Store Owner**
- Dashboard with the store's average rating and total number of ratings
- Table of every user who rated the store, sortable by user, email, rating and date
- Owners with several stores get a **store switcher**

</td>
<td width="50%" valign="top">

**✅ Validation, Both Sides**
- Name 20-60 characters, address up to 400, email in standard format
- Password 8-16 characters with at least one uppercase letter and one special character
- Backend is the source of truth; the frontend mirrors the rules for instant feedback

**🔒 Security Built In**
- bcrypt password hashing, JWT sessions, helmet headers, strict CORS
- Rate-limited login and sign-up
- The role is **re-read from the database on every request**, so a deleted user or changed role takes effect immediately

**🎨 UX Details**
- Glass-style dark theme with animated count-up numbers and a pie chart
- Skeleton loaders, empty states, confirm-before-delete dialogs and toast feedback on every action
- Click-to-sort table headers on desktop and a dedicated sort control on mobile
- Fully responsive, with a slide-in drawer navigation on small screens

**⚙️ Engineering**
- Filtering, sorting and averages computed in SQL
- Parameterized queries only; `ORDER BY` columns come from a whitelist
- Ratings saved with an atomic upsert (`INSERT ... ON CONFLICT DO UPDATE`)

</td>
</tr>
</table>

<br/>

## 🏗️ Architecture

The browser never talks to the database. Every request goes through a layered Express API: security headers and rate limiting first, then JWT authentication, then a role check, then validation, and only then a controller.

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
  'primaryColor': '#F3EEFF',
  'primaryBorderColor': '#6d4aff',
  'primaryTextColor': '#1b1633',
  'lineColor': '#8b5cf6',
  'clusterBkg': '#FBF9FF',
  'clusterBorder': '#D9CCFF',
  'fontSize': '15px',
  'edgeLabelBackground': '#F3EEFF'
}}}%%
flowchart LR
    UI["🖥️ React SPA<br/>Admin / Owner / Member"]

    subgraph API["⚙️ Express API"]
        direction TB
        SEC["helmet · CORS<br/>JSON size limit"]
        RL["Rate limiter<br/>login · signup"]
        AUTH["authenticate<br/>verify JWT + re-read role"]
        RBAC["authorize<br/>ADMIN · OWNER · USER"]
        VAL["express-validator"]
        CTRL["Controllers<br/>auth · admin · store · owner"]
        SEC --> RL --> AUTH --> RBAC --> VAL --> CTRL
    end

    subgraph DB["🗄️ PostgreSQL (Neon)"]
        direction TB
        T1[("users")]
        T2[("stores")]
        T3[("ratings")]
    end

    UI -->|"HTTPS + JSON<br/>Bearer JWT"| SEC
    CTRL -->|"pg Pool · parameterized SQL"| T1
    CTRL --> T2
    CTRL --> T3
```

**Why this shape matters:** the role is checked once, in the `authorize` step, not re-implemented inside every controller. And because `authenticate` re-reads the user's role from the database on each request instead of trusting the token alone, an admin can remove someone's access instantly rather than waiting for a token to expire.

### Request lifecycle: a member rates a store

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
  'primaryColor': '#F3EEFF',
  'primaryBorderColor': '#6d4aff',
  'primaryTextColor': '#1b1633',
  'lineColor': '#8b5cf6',
  'actorBkg': '#F3EEFF',
  'actorBorder': '#6d4aff',
  'noteBkgColor': '#FFF6DB',
  'noteBorderColor': '#E0B84A',
  'fontSize': '14px'
}}}%%
sequenceDiagram
    actor M as Member
    participant UI as React (UserStores)
    participant AX as axios client
    participant API as Express API
    participant DB as PostgreSQL

    M->>UI: Click 4 stars on a store
    UI->>AX: rateStore(storeId, 4)
    AX->>API: POST /api/stores/:id/rating + Bearer JWT
    API->>DB: SELECT id, role FROM users WHERE id = token id
    DB-->>API: user row (role read fresh)
    API->>API: authorize USER, validate rating is an integer 1 to 5
    API->>DB: INSERT rating ON CONFLICT (user_id, store_id) DO UPDATE
    DB-->>API: saved row
    API-->>AX: 200 OK
    AX-->>UI: resolved
    UI-->>M: Toast + updated stars
    Note over AX,API: Any 401 clears the token and redirects to /login
```

### Database design

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
  'primaryColor': '#F3EEFF',
  'primaryBorderColor': '#6d4aff',
  'primaryTextColor': '#1b1633',
  'lineColor': '#8b5cf6',
  'fontSize': '14px'
}}}%%
erDiagram
    USERS ||--o{ RATINGS : submits
    STORES ||--o{ RATINGS : receives
    USERS |o--o{ STORES : owns

    USERS {
        int id PK
        varchar name "20 to 60 chars (CHECK)"
        varchar email UK
        text password_hash "bcrypt"
        varchar address "max 400"
        user_role role "ADMIN, USER, OWNER"
        timestamptz created_at
    }
    STORES {
        int id PK
        varchar name "20 to 60 chars (CHECK)"
        varchar email UK
        varchar address "max 400"
        int owner_id FK "ON DELETE SET NULL"
        timestamptz created_at
    }
    RATINGS {
        int id PK
        int user_id FK "ON DELETE CASCADE"
        int store_id FK "ON DELETE CASCADE"
        smallint rating "CHECK 1 to 5"
        timestamptz created_at
        timestamptz updated_at
    }
```

`UNIQUE (user_id, store_id)` on `ratings` guarantees one rating per member per store, which turns "modify my rating" into a single atomic upsert. Averages are never stored; they are computed with `AVG()` so they can never go stale.

### Role-based access

| Capability | Admin | Owner | Member | Public |
|---|:---:|:---:|:---:|:---:|
| Sign up / log in | | | | ✅ |
| Update own password | ✅ | ✅ | ✅ | |
| Dashboard totals, user and store lists | ✅ | | | |
| Create / edit / delete users and stores | ✅ | | | |
| View any user's details | ✅ | | | |
| Browse and search stores, rate 1-5 | | | ✅ | |
| See who rated my store and its average | | ✅ | | |

Not logged in returns `401`; a wrong role returns `403`.

The frontend is deployed on **Vercel**, the API on **Render**, and the database on **Neon**: three independent pieces rather than one monolith.

<br/>

## 🛠️ Tech Stack

<div align="center">

![Skills](https://skillicons.dev/icons?i=nodejs,express,postgres,react,javascript,vite,css,git,github,vercel)

</div>

| Layer | Tools |
|---|---|
| **Frontend** | React 18, React Router 6, Vite 5, hand-written CSS (design tokens, no UI framework) |
| **UI libraries** | Framer Motion, Recharts, Lucide icons, react-hot-toast |
| **HTTP client** | axios (single configured instance: base URL, token header, 401 handling) |
| **Backend** | Node.js, Express 5 |
| **Database** | PostgreSQL via `pg` (enum type, CHECK constraints, foreign keys, indexes) |
| **Auth** | JWT, bcrypt |
| **Security** | helmet, CORS allow-list, express-rate-limit, express-validator |
| **Deployment** | Vercel (frontend), Render (API), Neon (PostgreSQL) |

<br/>

## 📸 Screenshots

<div align="center">

<table>
<tr>
<td align="center" width="33%"><b>Login</b></td>
<td align="center" width="33%"><b>Admin Dashboard</b></td>
<td align="center" width="33%"><b>Manage Users</b></td>
</tr>
<tr>
<td><img src="docs/screenshots/01-login.png" width="100%" alt="Login page"/></td>
<td><img src="docs/screenshots/03-admin-dashboard.png" width="100%" alt="Admin dashboard"/></td>
<td><img src="docs/screenshots/04-admin-users.png" width="100%" alt="Admin users table"/></td>
</tr>
<tr>
<td align="center"><b>Add User</b></td>
<td align="center"><b>Manage Stores</b></td>
<td align="center"><b>Member: Discover &amp; Rate</b></td>
</tr>
<tr>
<td><img src="docs/screenshots/05-add-user-modal.png" width="100%" alt="Add user modal"/></td>
<td><img src="docs/screenshots/07-admin-stores.png" width="100%" alt="Admin stores table"/></td>
<td><img src="docs/screenshots/08-user-stores.png" width="100%" alt="Member store list"/></td>
</tr>
<tr>
<td align="center" colspan="3"><b>Store Owner Dashboard</b></td>
</tr>
<tr>
<td colspan="3" align="center"><img src="docs/screenshots/09-owner-dashboard.png" width="60%" alt="Owner dashboard"/></td>
</tr>
</table>

</div>

<br/>

## 📁 Project Structure

```
roxiler-store-rating/
├── README.md
├── docs/
│   └── screenshots/
├── backend/
│   ├── sql/schema.sql              # tables, constraints, indexes
│   ├── scripts/seed.js             # demo accounts, stores and ratings
│   └── src/
│       ├── server.js               # starts the HTTP server
│       ├── app.js                  # middleware stack, routes, error handler
│       ├── config/db.js            # pg connection pool
│       ├── middleware/             # auth.js (authenticate + authorize), validate.js
│       ├── validators/rules.js     # name, email, address, password, rating rules
│       ├── utils/query.js          # ORDER BY whitelist, safe ILIKE filters, parseId
│       ├── routes/                 # auth, admin, store, owner
│       └── controllers/            # auth, admin, store, owner
│
└── frontend/
    ├── index.html
    ├── vite.config.js              # vendor / charts / motion chunk splitting
    ├── vercel.json                 # SPA rewrite so page refresh works
    └── src/
        ├── main.jsx, App.jsx       # entry point and routes
        ├── api/                    # client.js (axios) + auth, admin, stores, owner
        ├── context/                # AuthContext (session + login/logout)
        ├── routes/                 # ProtectedRoute (role guard)
        ├── hooks/                  # useDebounce, useCountUp
        ├── utils/                  # validators.js (mirrors backend), format.js
        ├── components/             # AppShell, Modal, SortHeader, MobileSort, Stars,
        │                           # ConfirmModal, ChangePasswordModal, Skeleton, ...
        ├── pages/                  # Login, Signup, admin/, user/, owner/
        └── styles/                 # index.css, layout.css
```

<br/>

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local install, or a free [Neon](https://neon.com) database)

### Installation

```bash
git clone https://github.com/shakibuddin677-shakib/roxiler-store-rating-system.git
cd roxiler-store-rating-system
```

**Database**
```bash
createdb store_rating
psql -d store_rating -f backend/sql/schema.sql
```

**Backend**
```bash
cd backend
cp .env.example .env        # then edit DATABASE_URL and JWT_SECRET
npm install
npm run seed                # loads the demo accounts, stores and ratings
npm run dev                 # http://localhost:5000
```

**Frontend** (in a separate terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Open `http://localhost:5173` and sign in with a [demo account](#-try-it). Use `localhost`, not `127.0.0.1`, because `CLIENT_URL` must match the browser origin exactly.

<br/>

## 🔑 Environment Variables

`backend/.env`
```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/store_rating
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

`frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

| Variable | Used by | Notes |
|---|---|---|
| `DATABASE_URL` | Backend | For Neon use the direct connection string ending in `?sslmode=require` |
| `JWT_SECRET` | Backend | Long random string; the server refuses to start without it |
| `JWT_EXPIRES_IN` | Backend | Token lifetime, for example `1d` |
| `CLIENT_URL` | Backend | Exact frontend origin for CORS: `https://` included, no trailing slash |
| `VITE_API_URL` | Frontend | Must include `/api`; it is baked in at build time, so redeploy after changing it |

> Never commit a real `.env` file. Both `.env` files are git-ignored; only the `.env.example` templates are tracked.

<br/>

## 🔌 API Modules

All routes are prefixed with `/api`. Protected routes need `Authorization: Bearer <token>`.

<details>
<summary><b>View all endpoints</b></summary>
<br/>

| Method | Endpoint | Access | Purpose |
|---|---|:---:|---|
| GET | `/health` | Public | API and database health check |
| POST | `/auth/signup` | Public | Register a Member |
| POST | `/auth/login` | Public | Returns `{ user, token }` |
| PUT | `/auth/password` | Any role | Change own password |
| POST | `/auth/logout` | Any role | Acknowledge logout (client drops the token) |
| GET | `/admin/dashboard` | Admin | Totals by entity and by role |
| GET | `/admin/users` | Admin | List; filters `name, email, address, role`; sort `sortBy, order` |
| POST | `/admin/users` | Admin | Create a user with any role |
| GET | `/admin/users/:id` | Admin | Details (an Owner also returns `rating`) |
| PUT | `/admin/users/:id` | Admin | Update (blank password keeps the current one) |
| DELETE | `/admin/users/:id` | Admin | Delete (cannot delete yourself) |
| GET | `/admin/stores` | Admin | List with average rating and owner name |
| POST | `/admin/stores` | Admin | Create, optionally assigning an owner |
| PUT | `/admin/stores/:id` | Admin | Update |
| DELETE | `/admin/stores/:id` | Admin | Delete |
| GET | `/stores` | Member | Stores with `overall_rating` and `my_rating`; `search`, sort |
| POST | `/stores/:id/rating` | Member | Submit or modify a rating (upsert) |
| GET | `/owner/dashboard` | Owner | Store, average, raters; optional `storeId`, sort |

**Error shape**

```json
{ "message": "Validation failed", "errors": [{ "field": "password", "message": "..." }] }
```

`400` validation, `401` not authenticated, `403` wrong role, `404` not found, `409` duplicate email.

</details>

<br/>

## 📏 Validation Rules

Enforced on the backend (`express-validator`) and mirrored in the frontend for instant feedback.

| Field | Rule |
|---|---|
| Name | 20 to 60 characters |
| Address | Up to 400 characters |
| Email | Standard email format, stored lower-case and unique |
| Password | 8 to 16 characters, at least one uppercase letter and one special character |
| Rating | Integer from 1 to 5 |

<br/>

## 🔒 Security

- Passwords hashed with **bcrypt**; `password_hash` is never returned by any endpoint
- **JWT** sessions with an expiry, and the user's role **re-read from the database on every request**
- Sign-up always creates a `USER`; only admin endpoints can assign roles, and an admin cannot demote or delete themselves
- **Parameterized SQL** everywhere; `ORDER BY` columns are chosen from a whitelist, never interpolated from input
- `%`, `_` and `\` are escaped in search text so it is matched literally inside `ILIKE`
- **Rate limiting** on login and sign-up (50 attempts per 15 minutes per IP)
- **Helmet** secure headers, a strict **CORS** allow-list locked to the frontend origin, and a 100 KB JSON body limit
- One generic message for "unknown email" and "wrong password" to prevent account enumeration
- The owner dashboard derives the store from the verified token and only accepts a `storeId` that belongs to that owner, which prevents IDOR

<br/>

## ☁️ Deployment

| Piece | Service | Key settings |
|---|---|---|
| Frontend | **Vercel** | Root directory `frontend`; env `VITE_API_URL`; `vercel.json` rewrites all paths to `index.html` |
| API | **Render** (Node web service) | Root directory `backend`; build `npm install`; start `npm start`; env `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `NODE_VERSION=20` |
| Database | **Neon** (PostgreSQL) | Run `schema.sql`, then `npm run seed` once |

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
  'primaryColor': '#F3EEFF',
  'primaryBorderColor': '#6d4aff',
  'primaryTextColor': '#1b1633',
  'lineColor': '#8b5cf6',
  'fontSize': '14px'
}}}%%
flowchart LR
    GH["GitHub<br/>main branch"] -->|"auto-deploy"| V["Vercel<br/>React build"]
    GH -->|"auto-deploy"| R["Render<br/>Express API"]
    U["Browser"] -->|"loads the site"| V
    U -->|"API calls"| R
    R -->|"SQL over SSL"| N[("Neon<br/>PostgreSQL")]
```

Every push to `main` redeploys the frontend and the API automatically. Order of setup: **database first, then API, then frontend, then set `CLIENT_URL` on the API to the frontend's exact URL.**

<br/>

## 🧠 Design Decisions

| Decision | Reasoning | Trade-off |
|---|---|---|
| One `users` table with a role enum | A single login path serves every role | One account cannot hold two roles |
| Average rating computed, not stored | Always correct, nothing to keep in sync | Slightly more work per read (indexed join) |
| Rating saved with an upsert | Atomic and race-safe; one rating per user per store | Rating history is not kept |
| Role re-checked in the database each request | A deleted user or changed role takes effect immediately | One extra indexed lookup per request |
| JWT stored in `localStorage` | Simple setup across two domains | Exposed to XSS; httpOnly cookies are the hardening step |
| Filtering and sorting in SQL | Correct at any data size | Needs pagination as data grows |
| No UI framework | Full control of the design and a small bundle | More CSS to maintain |

<br/>

## ✅ Challenge Checklist

How the project maps to the coding challenge requirements.

| Requirement | Where it lives |
|---|---|
| Single login, three roles (Admin, Normal User, Store Owner) | `auth.controller.js`, `ProtectedRoute.jsx`, role-based redirect after login |
| Admin dashboard: total users, stores, ratings | `GET /admin/dashboard`, `AdminDashboard.jsx` |
| Admin adds users and stores; lists with filters | `admin.controller.js`, `AdminUsers.jsx`, `AdminStores.jsx` |
| Filters on Name, Email, Address, Role | `buildFilters` in `utils/query.js` |
| Sorting ascending / descending on all tables | `buildOrderBy` whitelist, `SortHeader.jsx` |
| User details; Store Owner shows their rating | `GET /admin/users/:id` |
| Normal user sign-up, login, password update | `Signup.jsx`, `Login.jsx`, `ChangePasswordModal.jsx` |
| Store list with search by name and address | `store.controller.js`, `UserStores.jsx` |
| Overall rating, own rating, submit and modify | `ratings` upsert, `StarPicker` component |
| Store Owner: raters list and average rating | `owner.controller.js`, `OwnerDashboard.jsx` |
| Form validations (name, address, password, email) | `validators/rules.js`, `utils/validators.js` |
| Logout for every role | `POST /auth/logout`, `AppShell.jsx` |
| Best practices (structure, schema, security) | Layered folders, constrained schema, [Security](#-security) |

<br/>

## 🗺️ Roadmap

- [ ] Server-side pagination for the admin tables
- [ ] httpOnly refresh-token cookies and token revocation
- [ ] Written reviews and photos alongside star ratings
- [ ] Automated tests (Jest + Supertest for the API, Vitest for the UI)
- [ ] CI pipeline (lint, test, build) on every pull request

<br/>

## 👤 Author

<div align="center">

**Shakibuddin**
B.Tech CSE (Lateral Entry) · IES College of Technology, Bhopal

[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shakibuddin677-shakib)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://in.linkedin.com/in/shakib-uddin-36865b240)

</div>

<br/>

## 📄 License

This project is licensed under the **MIT License**.

<br/>

<div align="center">

If you found this project useful, consider giving it a ⭐ on GitHub!

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:8b5cf6,100:07061a&height=100&section=footer" alt="footer"/>

</div>

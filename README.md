# Lumina — eCommerce Platform

A production-grade eCommerce platform built with React 18 + TypeScript (Vite), Node.js 20 + Express, and MySQL 8.0. Launched in a single command via Docker Compose.

---

## Quick Start

```bash
# Clone the repository, then:
docker compose up
```

The application will be available at **http://localhost:3000**.  
No dependency installation, migration scripts, or manual seeding is required.

---

## Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend   | Node.js 20, Express, TypeScript                 |
| Database  | MySQL 8.0                                       |
| Container | Docker Compose                                  |

---

## Repository Structure

```
/
├── ai-boilerplate/          # AI Blueprint: engineering guidelines, capability
│   ├── assignment.txt       #   definitions, and bootstrap prompt used to
│   ├── engineering-guidelines.md   #   drive AI code generation
│   ├── capability-definitions.md
│   └── initial.md
├── backend/
│   ├── db/
│   │   ├── schema.sql       # Auto-applied by MySQL on first boot
│   │   └── seed.sql         # 22 products, 4 categories, seeded on first boot
│   └── src/                 # Express + TypeScript source
├── frontend/
│   └── src/                 # React + TypeScript source
├── docker-compose.yml
├── AI interactions Documentation.txt   # Full prompt log, model rationale, AI-gap analysis
└── README.md
```

---

## Features

- **Authentication** — Register / login with JWT access tokens (in-memory) + refresh tokens (httpOnly cookie, 7-day rotation)
- **Product Catalog** — Search, category filter, price range, sort, pagination, featured products
- **Cart** — Persistent server-side cart synced across sessions
- **Checkout** — Multi-step flow: shipping address → mock payment → confirmation
- **Order History** — Paginated order list + full order detail view with status badges
- **Account** — Edit profile name/phone, change password

---

## Manual Interventions (AI-Gap Analysis)

The README requirement asks for explicit documentation of every fix that had to be done **by hand** and **why the AI could not handle it autonomously**.

### 1. MySQL `caching_sha2_password` Authentication Plugin

**What was fixed:**  
The `mysql2` Node.js driver could not authenticate against MySQL 8.0 running inside Docker. The connection was rejected with `ER_ACCESS_DENIED_ERROR` for the `lumina@172.18.0.1` host even with correct credentials.

**Root cause:**  
MySQL 8.0 defaults the authentication plugin to `caching_sha2_password`, which requires an SSL channel or an RSA public-key exchange that the `mysql2` driver does not perform in this configuration.

**Manual fix:**  
```sql
ALTER USER 'lumina'@'%' IDENTIFIED WITH mysql_native_password BY 'lumipassword';
FLUSH PRIVILEGES;
```

**Why the AI failed:**  
This is a runtime environment issue — the incompatibility only surfaces when the actual container is running. The AI generated syntactically correct connection code but had no visibility into the runtime auth-plugin mismatch. No amount of prompt refinement can substitute for observing the live Docker log output and knowing the `mysql_native_password` workaround for mysql2 + MySQL 8.

---

### 2. PowerShell Pipe Syntax for Manual Schema Import

**What was fixed:**  
During early development, the schema had to be imported manually into the running MySQL container. The AI proposed a bash-style stdin redirect:

```bash
mysql -u root -p lumina < schema.sql   # does not work in PowerShell
```

**Manual fix:**  
```powershell
Get-Content .\backend\db\schema.sql | docker exec -i <container_id> mysql -u root -prootpassword lumina
```

**Why the AI failed:**  
The AI generated UNIX shell syntax. PowerShell does not support the `<` stdin redirect operator for piping file contents into a process. This required knowing the PowerShell-equivalent idiom — a shell-environment detail outside the AI's context when operating inside Windsurf on Windows.

---

### 3. Database Name Mismatch Between Schema and Docker Compose

**What was fixed:**  
The AI-generated `schema.sql` used `CREATE DATABASE lumina_store` and `USE lumina_store`, while `docker-compose.yml` set `MYSQL_DATABASE: lumina`. The MySQL init scripts ran inside the `lumina` database context, so the schema was applied to the wrong database and the backend could not connect.

**Manual fix:**  
Searched and replaced every occurrence of `lumina_store` with `lumina` across `schema.sql` and `seed.sql`.

**Why the AI failed:**  
The schema and the Compose file were generated in separate prompts. The AI did not maintain a shared memory of the chosen database name across sessions. A human reading both files side-by-side spotted the inconsistency; the AI had no cross-file awareness at review time.

---

### 4. Removing the Redundant `imageUrl` Column

**What was fixed:**  
The initial schema included both an `imageUrl` VARCHAR column and an `images` JSON array column on the `products` table. This caused type inconsistencies throughout backend services, frontend types, and seed data — two different fields referring to the same concept.

**Manual fix:**  
Made the architectural decision to drop `imageUrl` entirely and standardise on `images[0]` as the thumbnail source everywhere. Then directed the AI to execute the refactor across schema, seed, backend types/services, and all frontend components.

**Why the AI failed:**  
This was a **product design judgment call**, not a code error. The AI surfaced both fields because both were mentioned at different points in the prompts. Recognising that one was redundant and deciding which to remove required human design reasoning. The AI executed the refactor correctly once given the decision.

---

### 5. Vite Proxy Target for Docker Networking

**What was fixed:**  
`vite.config.ts` had the API proxy target set to `http://localhost:4000`. Inside Docker, the frontend container cannot reach the backend via `localhost` — it must use the Docker Compose service name.

**Manual fix:**  
Changed the proxy target to `http://backend:4000` in `vite.config.ts`.

**Why the AI failed:**  
The AI defaulted to `localhost` because that is correct for local development outside Docker. The Docker networking implication — that inter-container communication requires the Compose service hostname — requires awareness of the actual deployment topology, which the AI did not apply when generating the Vite config.

---

### 6. Type Alignment: `IAddress` and `IOrderItem` Fields

**What was fixed:**  
The frontend `IAddress` type used `street` and `postalCode`; the backend Zod schema and DB columns used `line1` and `zip`. Similarly, `IOrderItem` used `name` and `imageUrl`; the DB query returned `productName` and `productImageUrl`. This caused silent type mismatches and runtime `undefined` values in the checkout and order detail views.

**Manual fix (AI-assisted after human diagnosis):**  
- Unified `IAddress` shape across frontend types, backend Zod schema, and SQL column aliases.  
- Added SQL column aliases (`productName AS name`) in order queries.  
- Removed `imageUrl` from `IOrderItem` and used `images[0]` instead (linked to fix #4).

**Why the AI failed:**  
Field naming was decided independently across the schema prompt, the service prompt, and the frontend type prompt. Without a single canonical type source enforced at generation time, the AI produced locally-consistent but globally-inconsistent names. Human review of the full data flow (DB → service → controller → frontend) was required to spot the divergence.

---

## AI Interactions

Full prompt log, model selection rationale, debugging sessions, and architectural decision register:  
→ **`AI interactions Documentation.txt`**

---

## Environment Variables

All defaults are baked into `docker-compose.yml`. For production, copy `.env.example` and override:

| Variable                   | Default                   | Purpose                          |
|----------------------------|---------------------------|----------------------------------|
| `DB_ROOT_PASSWORD`         | `rootpassword`            | MySQL root password              |
| `DB_NAME`                  | `lumina`                  | Database name                    |
| `DB_USER`                  | `lumina`                  | App DB user                      |
| `DB_PASSWORD`              | `lumipassword`            | App DB user password             |
| `JWT_SECRET`               | `change_me_in_production` | Access token signing key         |
| `JWT_EXPIRES_IN`           | `15m`                     | Access token TTL                 |
| `REFRESH_TOKEN_SECRET`     | `change_me_refresh_secret`| Refresh token signing key        |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d`                      | Refresh token TTL                |
| `BCRYPT_ROUNDS`            | `12`                      | bcrypt cost factor               |
| `ALLOWED_ORIGINS`          | `http://localhost:3000`   | CORS allowed origins             |

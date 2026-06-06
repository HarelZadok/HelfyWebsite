# initial.md — Bootstrap Prompt

> **Usage**: Feed this entire file as the first message to your AI coding assistant (Claude, GPT-4o, Gemini, etc.) to generate the complete eCommerce platform from scratch.

---

## SYSTEM CONTEXT

You are an expert full-stack software engineer. You will generate a complete, production-ready eCommerce web application. Every file you produce must be immediately runnable with `docker compose up` — no manual steps after cloning.

Adhere strictly to the Engineering Guidelines and Capability Definitions provided in the companion documents. Do not deviate from the defined architecture, naming conventions, or patterns.

---

## PROJECT OVERVIEW

Build a full-featured eCommerce platform called **"Lumina Store"** — a premium online shop selling electronics and lifestyle products.

**Stack**:
- Frontend: React 18 + TypeScript + Vite + TailwindCSS + Framer Motion
- Backend: Node.js 20 + Express + TypeScript
- Database: MySQL 8 — raw SQL via `mysql2/promise` (NO ORM)
- Containerization: Docker Compose (3 services: `db`, `backend`, `frontend`)

---

## STEP 1: Repository Scaffold

Create the following directory structure and base config files:

```
/
├── docker-compose.yml
├── .env.example
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── db/
│       ├── schema.sql
│       └── seed.sql
└── ai-blueprint/
```

### `docker-compose.yml` requirements:
- Service `db`: `mysql:8.0`, health check on `mysqladmin ping`, named volume `mysql_data`, mounts `./backend/db/schema.sql` and `./backend/db/seed.sql` into `/docker-entrypoint-initdb.d/` (MySQL auto-executes these on first run).
- Service `backend`: builds `./backend`, `depends_on db (condition: service_healthy)`, exposes port 4000.
- Service `frontend`: builds `./frontend`, depends on `backend`, exposes port 3000. Nginx proxies `/api` → `http://backend:4000`.
- All secrets from `.env` file.

### `.env.example`:
```
DB_HOST=db
DB_PORT=3306
DB_USER=lumina
DB_PASSWORD=luminapass
DB_NAME=lumina_store
JWT_SECRET=change_me_in_production_jwt_secret
JWT_REFRESH_SECRET=change_me_in_production_refresh_secret
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=production
```

---

## STEP 2: Database Schema (`backend/db/schema.sql`)

Generate complete DDL with the following tables. Use `IF NOT EXISTS` on all `CREATE TABLE` statements. Use `CREATE DATABASE IF NOT EXISTS lumina_store; USE lumina_store;` at the top.

### Tables required:
1. **`categories`**: `id`, `name`, `slug`, `createdAt`
2. **`products`**: `id`, `categoryId` (FK), `name`, `slug`, `description`, `price` (DECIMAL 10,2), `comparePrice` (DECIMAL 10,2 nullable), `images` (JSON), `stock`, `featured` (BOOLEAN), `rating` (DECIMAL 3,2), `reviewCount`, `createdAt`
3. **`users`**: `id`, `email` (UNIQUE), `passwordHash`, `firstName`, `lastName`, `role` (ENUM 'customer','admin' DEFAULT 'customer'), `createdAt`
4. **`refresh_tokens`**: `id`, `userId` (FK), `token` (TEXT), `expiresAt`, `createdAt`
5. **`carts`**: `id`, `userId` (FK UNIQUE — one cart per user), `createdAt`, `updatedAt`
6. **`cart_items`**: `id`, `cartId` (FK), `productId` (FK), `quantity`, UNIQUE(`cartId`, `productId`)
7. **`orders`**: `id`, `userId` (FK), `status` (ENUM: pending/processing/shipped/delivered/cancelled), `subtotal`, `shippingCost`, `total`, `shippingAddress` (JSON), `createdAt`, `updatedAt`
8. **`order_items`**: `id`, `orderId` (FK), `productId` (FK), `productName`, `price`, `quantity`, `lineTotal`

---

## STEP 3: Seed Data (`backend/db/seed.sql`)

Insert seed data **only if the table is empty** (use `INSERT IGNORE` or check with `SELECT COUNT(*)`).

### Categories (4):
1. Electronics — slug: `electronics`
2. Audio — slug: `audio`
3. Wearables — slug: `wearables`
4. Lifestyle — slug: `lifestyle`

### Products (minimum 20):
Each product must have:
- A JSON array of 3 image URLs for `images`
- Realistic `price`, optional `comparePrice` (for sale items)
- `featured = 1` for at least 6 products

Sample products per category:
- **Electronics**: MacBook Pro M3, Dell XPS 15, Sony A7 IV camera, iPad Pro, mechanical keyboard, USB-C hub
- **Audio**: Sony WH-1000XM5 headphones, AirPods Pro, Bose QuietComfort, studio monitor speakers, vinyl turntable
- **Wearables**: Apple Watch Ultra, Samsung Galaxy Watch, Fitbit Sense, Garmin Fenix
- **Lifestyle**: Aesop hand cream set, premium notebook, minimalist desk lamp, ergonomic mouse pad, cable organizer kit

---

## STEP 4: Backend Application

### `backend/src/index.ts`
Entry point: create HTTP server, connect to DB pool (test with a `SELECT 1` query on startup), listen on `config.PORT`.

### `backend/src/app.ts`
Configure Express:
- `helmet()`, `cors({ origin: config.CORS_ORIGIN, credentials: true })`, `express.json()`
- Cookie parser for refresh tokens
- Mount all routers under `/api/v1/`
- Mount `errorHandler` as last middleware
- Health check: `GET /api/health` → `{ status: 'ok', timestamp: Date.now() }`

### Middleware
- `authenticate.ts`: Verify JWT Bearer token, attach `req.user`.
- `asyncHandler.ts`: Wraps async functions, forwards errors to next().
- `errorHandler.ts`: Global error handler, formats `AppError` into JSON response.
- `validate.ts`: Zod schema validation middleware factory.

### Auth Module
**Routes** (`/api/v1/auth`):
- `POST /register` → `authController.register`
- `POST /login` → `authController.login`
- `POST /logout` → `authController.logout`
- `POST /refresh` → `authController.refresh`
- `GET /me` → `[authenticate]` → `authController.me`

**Service** (`authService.ts`): All business logic. Use bcrypt (12 rounds). Issue JWTs. Store refresh tokens in `refresh_tokens` table.

### Products Module
**Routes** (`/api/v1/products`):
- `GET /` → list with filters (search, categoryId, minPrice, maxPrice, sort, page, limit)
- `GET /:id` → single product

**Categories Routes** (`/api/v1/categories`):
- `GET /` → all categories

**Service** (`productService.ts`): Build dynamic SQL WHERE clause for filters. Use `LIKE` for search. Always use parameterized queries.

### Cart Module
All routes require `authenticate` middleware.
**Routes** (`/api/v1/cart`):
- `GET /` → get cart with items + totals
- `POST /items` → add item (body: `{ productId, quantity }`)
- `PATCH /items/:productId` → update quantity
- `DELETE /items/:productId` → remove item
- `DELETE /` → clear cart

**Service** (`cartService.ts`): Create cart on first add if not exists. Compute `subtotal` and `itemCount` by joining `cart_items` with `products`.

### Orders Module
All routes require `authenticate` middleware.
**Routes** (`/api/v1/orders`):
- `POST /` → place order (body: `{ shippingAddress }`)
- `GET /` → list user orders (paginated)
- `GET /:id` → single order detail

**Service** (`orderService.ts`): Use a DB transaction — insert order, copy cart items to `order_items`, clear cart.

### Users Module
All routes require `authenticate` middleware.
**Routes** (`/api/v1/users`):
- `GET /profile` → get profile
- `PATCH /profile` → update firstName, lastName
- `POST /change-password` → verify old, set new

---

## STEP 5: Frontend Application

### Design System
Configure TailwindCSS with a custom theme:
```js
// tailwind.config.js
colors: {
  brand: { 50: '#f0f4ff', 500: '#4F46E5', 600: '#4338CA', 900: '#1e1b4b' },
  surface: { DEFAULT: '#ffffff', dark: '#0f0f13' },
  muted: '#6b7280',
}
```
Dark mode via `class` strategy. Root layout applies `dark` class based on user preference.

### `src/api/client.ts`
Axios instance with:
- `baseURL: '/api/v1'`
- Request interceptor: attach `Authorization: Bearer <token>` from memory.
- Response interceptor: on 401, call `POST /auth/refresh`, retry original request once. On second 401, redirect to `/login`.

### `src/context/AuthContext.tsx`
- State: `user: IUser | null`, `accessToken: string | null`, `isLoading: boolean`
- On mount: call `GET /auth/me` to rehydrate session (refresh token in cookie).
- Exports: `useAuth()` hook.

### `src/context/CartContext.tsx`
- State: `cart: ICart | null`, `isOpen: boolean` (drawer)
- All mutations call API and update local state.
- Exports: `useCart()` hook.

### Pages to generate (complete implementation):

#### 1. `HomePage` (`/`)
- Full-viewport hero section: gradient background, large headline ("Discover Premium Tech & Lifestyle"), subtitle, two CTAs ("Shop Now" → `/products`, "View Collections" → `/products?category=electronics`).
- Framer Motion: hero text fades in from bottom on mount.
- Featured products grid (3-4 columns on desktop) — fetch `?featured=true&limit=8`.
- Category cards strip — 4 cards with icons/images, hover lift effect.

#### 2. `ProductsPage` (`/products`)
- URL-synced filters (React Router `useSearchParams`).
- Left sidebar: category checkboxes, price range slider (`min`/`max` inputs), sort dropdown.
- Right content: search bar, product grid with `ProductCard` components.
- Skeleton loaders while fetching.
- Pagination at bottom.

#### 3. `ProductDetailPage` (`/products/:id`)
- Image gallery: large main image + thumbnail strip (click to swap).
- Product name, rating stars, price (with compare price crossed out).
- Stock indicator (green/yellow/red).
- Quantity selector (+ / - buttons).
- "Add to Cart" button (Framer Motion scale on click, loading state).
- Description section below.

#### 4. `CartPage` (`/cart`) + `CartDrawer`
- `CartDrawer`: fixed right panel (Framer Motion slide-in from right), shows items, quantities, subtotal, checkout button.
- `CartPage`: full-page version of the cart for mobile/dedicated view.

#### 5. `CheckoutPage` (`/checkout`)
- `StepIndicator`: animated progress bar with 4 steps.
- Step 1 `AddressForm`: full name, address line 1 & 2, city, state, zip, country. Validated with `react-hook-form` + `zod`.
- Step 2 `PaymentForm`: card number (masked display), expiry, CVV. No real validation — this is a mock.
- Step 3 `ReviewStep`: order summary with items, address, totals.
- Step 4 `ConfirmationStep`: success animation (Framer Motion), order ID, "Continue Shopping" button.
- Requires authentication — redirect to `/login?redirect=/checkout` if not logged in.

#### 6. `LoginPage` (`/login`) + `RegisterPage` (`/register`)
- Split-screen layout: left side — full-height gradient/image, right side — form.
- Login: email, password, "Remember me" checkbox, "Forgot password?" link (dummy), link to register.
- Register: firstName, lastName, email, password, confirmPassword.
- All validated with `react-hook-form` + `zod`.
- On success, redirect to `/` or `?redirect` param.

#### 7. `AccountLayout` + Account Pages
- Shared `AccountLayout` with sidebar nav: Profile, Orders, Settings.
- `AccountProfilePage`: editable firstName, lastName, email display (read-only), save button.
- `AccountOrdersPage`: list of orders with status badge, date, total. Clickable rows.
- `AccountOrderDetailPage`: full order breakdown.

### Shared Components
- `Navbar`: logo, nav links (Home, Products, About), search icon, cart icon with item count badge, user menu (avatar dropdown → Account, Logout). Dark mode toggle.
- `Footer`: 4-column layout with links, copyright.
- `ProductCard`: image (aspect-ratio box), category badge, name, rating, price, "Add to Cart" button. Framer Motion hover lift.
- `StarRating`: filled/half/empty stars based on `rating` float.
- `Skeleton`: animated shimmer block.
- `Button`, `Input`, `Badge`, `Spinner`, `Modal` primitives.

---

## STEP 6: Dockerfiles

### `backend/Dockerfile`
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

### `frontend/Dockerfile`
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### `frontend/nginx.conf`
Serve static files from `/usr/share/nginx/html`. All routes fallback to `index.html` for SPA routing. Proxy `/api` to `http://backend:4000`.

---

## STEP 7: Quality Checks

After generating all files, verify:
1. `docker compose up` starts all 3 services without errors.
2. `GET http://localhost:3000` loads the homepage.
3. `GET http://localhost:4000/api/health` returns `{ status: 'ok' }`.
4. Register a new user at `/register` — succeeds.
5. Login at `/login` — succeeds, navbar shows user avatar.
6. Browse `/products` — 20+ products visible with working filters.
7. Add a product to cart — cart drawer opens with item.
8. Complete checkout flow — order confirmed, appears in `/account` orders.

---

## CONSTRAINTS REMINDER

- **Never** use an ORM. All database access is raw SQL via `mysql2/promise`.
- **Never** expose `.env` secrets in client-side code.
- **Never** use `any` TypeScript type without explicit comment justification.
- **Always** wrap async Express handlers with `asyncHandler()`.
- **Always** use parameterized SQL queries — never string interpolation with user input.
- The app must work with zero manual steps after `docker compose up`.

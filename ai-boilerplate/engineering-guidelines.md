# Engineering Guidelines & Constraints

## Language & Runtime
- **TypeScript** is mandatory across the entire codebase (frontend and backend). No plain `.js` files except config files that explicitly require it (e.g., `tailwind.config.js`, `postcss.config.js`).
- Target **ES2022** (`"target": "ES2022"` in `tsconfig.json`).
- Backend: **Node.js 20 LTS**.
- Frontend: **React 18** with **Vite** as the build tool.
- **Strict mode** enabled in all `tsconfig.json` files (`"strict": true`).

---

## Architectural Patterns

### Backend (Layered Architecture)
```
routes → controllers → services → db (mysql2 pool)
```
- **Routes**: Register Express routers, apply middleware, delegate to controllers.
- **Controllers**: Handle HTTP concerns only — parse request, call service, send JSON response. No business logic.
- **Services**: All business logic, domain rules, and data orchestration. Completely framework-agnostic.
- **DB layer** (`src/db/`): A single `pool.ts` exporting the `mysql2/promise` pool. All raw SQL queries live in service files or dedicated query modules under `src/db/queries/`.
- No ORM, no query builder. Raw parameterized SQL only (`?` placeholders, never string interpolation).

### Frontend (Feature-Sliced)
```
src/
  api/          # axios instance + typed API call functions
  components/   # shared/reusable UI components
  context/      # React Context providers (Auth, Cart)
  hooks/        # custom React hooks
  pages/        # one folder per route
  types/        # shared TypeScript interfaces and enums
  utils/        # pure utility functions
```

---

## Folder Structure

### Backend
```
backend/
  src/
    controllers/
    db/
      pool.ts
      queries/
    middleware/
    routes/
    services/
    types/
    utils/
    app.ts
    index.ts
  db/
    schema.sql
    seed.sql
  Dockerfile
  tsconfig.json
  package.json
```

### Frontend
```
frontend/
  src/
    api/
    components/
      ui/         # primitives (Button, Input, Badge, Spinner…)
      layout/     # Navbar, Footer, PageWrapper
      product/    # ProductCard, ProductGrid, ProductFilters
      cart/       # CartDrawer, CartItem
      checkout/   # StepIndicator, AddressForm, PaymentForm, ReviewStep
    context/
    hooks/
    pages/
    types/
    utils/
  public/
  Dockerfile
  nginx.conf
  tailwind.config.js
  vite.config.ts
  tsconfig.json
  package.json
```

---

## Naming Conventions
- **Files**: `camelCase.ts` for modules, `PascalCase.tsx` for React components.
- **Interfaces/Types**: `PascalCase`, prefixed with `I` for interfaces (e.g., `IUser`, `IProduct`).
- **Database tables**: `snake_case` plural (e.g., `users`, `order_items`).
- **API routes**: RESTful, kebab-case, versioned under `/api/v1/` (e.g., `/api/v1/products`).
- **Environment variables**: `SCREAMING_SNAKE_CASE` (e.g., `JWT_SECRET`, `DB_HOST`).
- **React components**: One component per file, filename matches the exported component name.
- **Custom hooks**: `use` prefix (e.g., `useCart`, `useAuth`).

---

## Error Handling

### Backend
- A single `errorHandler` middleware in `src/middleware/errorHandler.ts` catches all errors.
- Services throw typed `AppError` instances: `throw new AppError(message, statusCode)`.
- All async route handlers are wrapped with `asyncHandler(fn)` — no `try/catch` in controllers.
- Never expose stack traces or raw DB errors to the client in production.
- Standard error response shape:
  ```json
  { "success": false, "message": "Human-readable error", "code": "ERROR_CODE" }
  ```

### Frontend
- All API calls use a centralized `apiClient` (Axios instance) with an interceptor for 401 → auto-refresh or redirect to login.
- User-facing errors shown via `react-hot-toast` notifications.
- Page-level errors render a graceful `<ErrorBoundary>` fallback component.

---

## API Response Shape
All backend responses follow this envelope:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 100 }  // only for paginated responses
}
```

---

## Security
- Passwords hashed with **bcrypt** (minimum 12 rounds).
- JWT access token: short-lived (15 min), sent in `Authorization: Bearer` header.
- JWT refresh token: long-lived (7 days), stored in httpOnly, Secure, SameSite=Strict cookie.
- All SQL queries use parameterized statements — no string concatenation.
- CORS configured to allow only the frontend origin.
- Helmet.js applied to all Express responses.
- Rate limiting on auth endpoints (`express-rate-limit`).

---

## Code Quality
- ESLint + Prettier enforced. Config files committed to repo.
- No `any` types without explicit `// eslint-disable-next-line` comment and justification.
- All exported functions must have explicit return type annotations.
- Environment variables read once in `src/config.ts` and exported as typed constants. Never access `process.env` directly elsewhere.

---

## Git & Commits
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- No secrets committed. `.env` is gitignored; `.env.example` is committed with placeholder values.

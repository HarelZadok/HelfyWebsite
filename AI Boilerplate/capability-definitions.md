# Capability Definitions

This document describes the functional building blocks (domains) the AI can leverage when generating the eCommerce application. Each capability is self-contained and has defined inputs, outputs, and integration points.

---

## 1. Authentication Module

**Responsibility**: User identity — registration, login, logout, token lifecycle.

### Backend Capabilities
| Capability | Route | Description |
|---|---|---|
| Register | `POST /api/v1/auth/register` | Hash password (bcrypt), insert user, return access token + set refresh cookie |
| Login | `POST /api/v1/auth/login` | Verify credentials, issue JWT pair |
| Logout | `POST /api/v1/auth/logout` | Clear refresh token cookie |
| Refresh | `POST /api/v1/auth/refresh` | Validate refresh token cookie, issue new access token |
| Me | `GET /api/v1/auth/me` | Return authenticated user profile |

### JWT Strategy
- Access token: 15-minute expiry, signed with `JWT_SECRET`, returned in response body.
- Refresh token: 7-day expiry, signed with `JWT_REFRESH_SECRET`, stored in httpOnly cookie.
- `authenticate` middleware: validates Bearer token, attaches `req.user` (`{ id, email, role }`).

### Frontend Capabilities
- `AuthContext`: Provides `user`, `login()`, `logout()`, `register()`, `isAuthenticated`.
- `useAuth()` hook: consumes `AuthContext`.
- Token stored in memory (not localStorage); Axios interceptor auto-refreshes on 401.
- Protected route wrapper `<RequireAuth>` redirects unauthenticated users to `/login`.

---

## 2. Product Catalog Module

**Responsibility**: Product discovery — listing, filtering, searching, and detail views.

### Backend Capabilities
| Capability | Route | Description |
|---|---|---|
| List Products | `GET /api/v1/products` | Paginated list with filters: `?search=`, `?category=`, `?minPrice=`, `?maxPrice=`, `?sort=`, `?page=`, `?limit=` |
| Get Product | `GET /api/v1/products/:id` | Single product with full details |
| List Categories | `GET /api/v1/categories` | All categories |
| Featured Products | `GET /api/v1/products?featured=true` | Subset for homepage |

### Data Shape
```typescript
interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;     
  images: string[];            // JSON array stored in DB
  categoryId: number;
  categoryName: string;
  stock: number;
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}
```

### Frontend Capabilities
- `ProductGrid`: Responsive grid of `ProductCard` components with skeleton loaders.
- `ProductFilters`: Sidebar/drawer with category checkboxes, price range slider, sort dropdown.
- `useProducts(params)`: Custom hook — debounced search, URL-synced filters, pagination.
- `ProductCard`: Image, name, price (with strike-through compare price), rating stars, add-to-cart button.
- `ProductDetailPage`: Image gallery with thumbnail strip, description, quantity selector, add-to-cart.

---

## 3. Cart Module

**Responsibility**: Persistent shopping cart linked to authenticated users.

### Backend Capabilities
| Capability | Route | Description |
|---|---|---|
| Get Cart | `GET /api/v1/cart` | Returns user's cart with all items and computed totals |
| Add Item | `POST /api/v1/cart/items` | `{ productId, quantity }` — upserts item |
| Update Item | `PATCH /api/v1/cart/items/:productId` | `{ quantity }` — set exact quantity |
| Remove Item | `DELETE /api/v1/cart/items/:productId` | Remove single line item |
| Clear Cart | `DELETE /api/v1/cart` | Empty the cart |

### Data Shape
```typescript
interface ICart {
  id: number;
  items: ICartItem[];
  subtotal: number;
  itemCount: number;
}

interface ICartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}
```

### Frontend Capabilities
- `CartContext`: Provides `cart`, `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, `itemCount`.
- `CartDrawer`: Slide-in panel (Framer Motion) showing cart items, totals, and checkout CTA.
- Optimistic UI updates — local state updates immediately, syncs with server in background.
- Cart icon in navbar shows live `itemCount` badge.

---

## 4. Checkout Module

**Responsibility**: Multi-step order placement flow.

### Steps
1. **Address** — shipping address form (validated with `react-hook-form` + `zod`).
2. **Payment** — mock credit card form (no real payment gateway required; simulate success).
3. **Review** — order summary showing items, address, estimated total.
4. **Confirmation** — order placed, show order ID, clear cart.

### Backend Capabilities
| Capability | Route | Description |
|---|---|---|
| Place Order | `POST /api/v1/orders` | Creates order from current cart, clears cart, returns order ID |

### Data Shape
```typescript
interface ICreateOrderPayload {
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentMethod: 'card';        // mock only
}
```

### Frontend Capabilities
- `CheckoutPage` with `StepIndicator` (animated progress bar).
- Form state persisted across steps in a `useCheckout()` hook.
- Final confirmation page with order ID and "Continue Shopping" CTA.

---

## 5. Order Management Module

**Responsibility**: View past orders and their details.

### Backend Capabilities
| Capability | Route | Description |
|---|---|---|
| List Orders | `GET /api/v1/orders` | Paginated order history for authenticated user |
| Get Order | `GET /api/v1/orders/:id` | Full order detail with line items |

### Data Shape
```typescript
interface IOrder {
  id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
  shippingAddress: IAddress;
  items: IOrderItem[];
}
```

### Frontend Capabilities
- `AccountOrdersPage`: List of orders with status badges and totals.
- `OrderDetailPage`: Itemized breakdown, status timeline, shipping address.

---

## 6. User Profile Module

**Responsibility**: Account settings and profile management.

### Backend Capabilities
| Capability | Route | Description |
|---|---|---|
| Get Profile | `GET /api/v1/users/profile` | Return name, email, createdAt |
| Update Profile | `PATCH /api/v1/users/profile` | Update name; email change requires password confirmation |
| Change Password | `POST /api/v1/users/change-password` | Verify old password, set new |

### Frontend Capabilities
- `AccountProfilePage`: Editable name/email fields with inline save confirmation.
- `AccountLayout`: Shared sidebar navigation for all `/account/*` pages.

---

## 7. Reusable UI Primitives

All components accept standard HTML props via TypeScript intersection types.

| Component | Props | Notes |
|---|---|---|
| `Button` | `variant`, `size`, `loading`, `disabled` | Variants: `primary`, `secondary`, `ghost`, `danger` |
| `Input` | `label`, `error`, `helperText` | Wraps `<input>` with label + error message |
| `Badge` | `variant`, `size` | Variants: `default`, `success`, `warning`, `error` |
| `Spinner` | `size` | Centered loading indicator |
| `Skeleton` | `className` | Animated shimmer placeholder |
| `Modal` | `isOpen`, `onClose`, `title` | Framer Motion fade+scale animation |
| `Pagination` | `page`, `totalPages`, `onChange` | Page number controls |

---

## 8. Data Access Patterns

### DB Pool (`src/db/pool.ts`)
```typescript
import mysql from 'mysql2/promise';
export const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});
```

### Query Pattern
```typescript
// Always use parameterized queries
const [rows] = await pool.execute<RowDataPacket[]>(
  'SELECT * FROM products WHERE id = ?',
  [productId]
);
```

### Transaction Pattern
```typescript
const conn = await pool.getConnection();
try {
  await conn.beginTransaction();
  // ... multiple queries
  await conn.commit();
} catch (err) {
  await conn.rollback();
  throw err;
} finally {
  conn.release();
}
```

---

## 9. Environment Configuration

All environment variables are centralized in `src/config.ts`:
```typescript
export const config = {
  PORT: Number(process.env.PORT) || 4000,
  DB_HOST: process.env.DB_HOST!,
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_USER: process.env.DB_USER!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  DB_NAME: process.env.DB_NAME!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
```

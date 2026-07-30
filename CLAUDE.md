# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"La Gracia Frontend" is a hospital management system built with Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS v4. The application supports role-based access control via the `Role` enum in [src/lib/types/auth.types.ts](src/lib/types/auth.types.ts): `ADMIN`, `PHARMACY`, `WAREHOUSE`, `DOCTOR`, `NURSE`, `AUDITOR`, `USER`.

## Development Commands

- `pnpm dev` - Start development server at http://localhost:3000
- `pnpm build` - Build production application
- `pnpm start` - Start production server
- `pnpm test` / `pnpm test:watch` - Run Jest test suite

Package manager: **pnpm** (required)

## Architecture

### Authentication Pattern

The app uses a **hybrid client-server authentication architecture**:

1. **Server Actions** ([src/actions/auth.actions.ts](src/actions/auth.actions.ts)) handle all API communication:
   - `loginAction()` / `registerAction()` - Authenticate with backend API
   - Store JWT token in httpOnly cookie (secure, inaccessible to client JS)
   - Store user data in non-httpOnly cookie (readable by client)
   - `logoutAction()` - Clears cookies and redirects to `/login`
   - `getCurrentUser()` / `getValidatedUser()` - Server-side user retrieval from cookies
   - `checkAuth()` / `getToken()` - Helper functions for protected routes
   - `verifyTokenAction()` / `refreshTokenAction()` - Token validation/refresh
   - `changePasswordAction()` / `changePasswordVoluntaryAction()` / `updateProfileAction()`
   - `checkPermission()` / `checkRouteAccess()` / `getValidatedUserWithPermission()` - RBAC checks, backed by [src/lib/permissions.ts](src/lib/permissions.ts)

2. **Zustand Store** ([src/stores/auth.store.ts](src/stores/auth.store.ts)) manages client state:
   - Does NOT make API calls directly
   - Reads user data from cookies via `getUserFromCookie()` utility
   - Synchronizes auth state across client components
   - Methods: `login()`, `logout()`, `checkAuth()`, `register()`

3. **Route Protection**:
   - [src/proxy.ts](src/proxy.ts) (Next.js proxy/middleware) validates the token cookie against the backend (`/auth/check-status`, with a 1-minute in-memory cache) and redirects unauthenticated users to `/login`. It does NOT check per-module permissions — that happens in each page.
   - Auth pages (e.g., `/login`) use `getCurrentUser()` to redirect authenticated users
   - Protected pages call `getValidatedUserWithPermission(module, action)` server-side before rendering (redirects to `/login` or `/dashboard?error=access_denied`)

### UI Component Architecture

Uses **shadcn/ui** component library (configured in [components.json](components.json)):
- Style: "new-york"
- Base color: neutral
- Icon library: lucide-react
- Components in `src/components/ui/`
- Utilities in `src/lib/utils.ts`: `cn()` and `formatBytes()` (bytes → B/KB/MB/… labels)
- Toasts: **sonner** (`import { toast } from 'sonner'`); `<Toaster />` is mounted once in the root layout
- Tables: use shadcn `Table` primitives directly (no generic DataTable abstraction); destructive confirmations use shadcn `AlertDialog`

### Layout System

- **Dashboard Layout** ([src/components/layout/DashboardLayout.tsx](src/components/layout/DashboardLayout.tsx)):
  - Client component with responsive sidebar/navbar
  - Sidebar toggles on mobile, persistent on desktop
  - Main content area with responsive padding
  - Used via layout wrapper at [src/app/dashboard/layout.tsx](src/app/dashboard/layout.tsx)

- **Route Groups**:
  - `(auth)/` - Authentication pages (`login`, `register`, `change-password`)
  - `dashboard/` - Protected application pages with DashboardLayout. Modules: `categories`, `products`, `providers`, `users`, `profile`, `pharmacy` (`products`, `dispensations`, `expiring`, `expired`), `warehouse` (`products`, `dispensations`, `expiring`, `expired`), `reports` (`products`, `movements`), `inventario` (`movimientos`), `settings` (landing with section cards + `backups`)

- **Header alignment**: the sidebar header and the navbar both use a fixed `h-16` height so their bottom borders line up. Keep `h-16` if you touch either header.

### Authorization / Permissions System

- [src/lib/permissions.ts](src/lib/permissions.ts) defines module-level RBAC: `Module` (`dashboard`, `profile`, `products`, `categories`, `providers`, `pharmacy`, `warehouse`, `users`, `reports`, `settings`), `Action` (`view`, `create`, `edit`, `delete`), and `ROLE_PERMISSIONS: Record<UserRole, ModulePermissions>`.
- `UserRole` string values (`'admin' | 'user' | 'pharmacy' | 'warehouse' | 'doctor' | 'nurse' | 'auditor'`) mirror the backend's `ValidRoles`, lowercase.
- The `settings` module (Configuración → Respaldos) is **admin-only**.
- Use `checkPermission()` / `checkRouteAccess()` (in `auth.actions.ts`) to gate server-side access per module/action instead of ad-hoc role checks. Client-side, use the `usePermissions()` hook ([src/hooks/usePermissions.ts](src/hooks/usePermissions.ts)) — e.g. the navbar shows "Configuración" only when `canView('settings')`; the sidebar filters `menuItems` by each item's `module`.
- **When adding a new module/route**: add it to the `Module` union, to the relevant roles in `ROLE_PERMISSIONS`, and to BOTH `ROUTE_TO_MODULE` and `ROUTE_TO_ACTION` — `canAccessRoute()` denies unmapped routes by default.

### Settings / Backups Module (admin-only)

- **Routes**: `/dashboard/settings` ([src/app/dashboard/settings/page.tsx](src/app/dashboard/settings/page.tsx)) is a landing page with section cards ([src/components/settings/SettingsPage.tsx](src/components/settings/SettingsPage.tsx)) — to add a future settings section, add an entry to its `sections` array. `/dashboard/settings/backups` hosts the database backups manager.
- **Entry point**: the navbar user dropdown's "Configuración" item (gated by `canView('settings')`) navigates to `/dashboard/settings`.
- **Server actions** ([src/actions/backup.actions.ts](src/actions/backup.actions.ts)): `getBackupsAction()`, `createBackupAction()`, `getBackupDownloadUrlAction(key)`, `deleteBackupAction(key)`. Backend endpoints: `GET/POST ${API_URL}/backups`, `GET ${API_URL}/backups/:key/url`, `DELETE ${API_URL}/backups/:key` (always `encodeURIComponent(key)`).
- **Components**: [src/components/settings/backups/BackupsPage.tsx](src/components/settings/backups/BackupsPage.tsx) (client orchestrator: create with pending state, download, delete with AlertDialog confirm, refresh) and `BackupsTable.tsx` (presentational; Fecha / Tamaño / Acciones).
- **Download URLs are signed R2 URLs valid for 1 hour** — request a fresh URL on every click (`getBackupDownloadUrlAction` + `window.open`); never store/cache them.
- The backend also creates an automatic backup every 5 days at midnight and prunes backups older than 30 days (the UI shows an informational note about this).
- Backup list response shape is `{ data, total }` — NOT the paginated `{ data, meta }` shape used by other modules.

### Expiring / Expired Batches (Pharmacy + Warehouse)

- **Routes**: `/dashboard/{pharmacy,warehouse}/expiring` (lotes próximos a vencer, with a 7/30/60/90-day period `Select`) and `/dashboard/{pharmacy,warehouse}/expired` (lotes ya vencidos, no period filter). Each pair of pages is a thin server component calling `getValidatedUserWithPermission('<pharmacy|warehouse>', 'view')` then rendering a single shared client component parametrized by `location: 'farmacia' | 'bodega'`.
- **Shared components**: [src/components/expiring/ExpiringBatchesPage.tsx](src/components/expiring/ExpiringBatchesPage.tsx) and [src/components/expired/ExpiredBatchesPage.tsx](src/components/expired/ExpiredBatchesPage.tsx) — same shape (header with location icon, stat cards, shadcn `Table`), each used by both the pharmacy and warehouse page for that concern instead of per-module duplicates.
- **Server actions** ([src/actions/product.actions.ts](src/actions/product.actions.ts)): `getExpiringBatchesAction(days, location)` → `GET /products/batches/expiring?days&location`; `getExpiredBatchesAction(location)` → `GET /products/alerts/expired?location`. Both uppercase `location` before sending and return `IExpiringBatch[]` (or `{ error }`).
- When adding either page/route, remember the permissions step above (`ROUTE_TO_MODULE`/`ROUTE_TO_ACTION`) plus a sidebar sub-item in [src/components/layout/sidebar.tsx](src/components/layout/sidebar.tsx).

### Styling & Theming

- **Tailwind CSS v4** with PostCSS plugin
- **Dark mode** support via `next-themes` and CSS variables
- Color system uses OKLCH color space for perceptual uniformity
- CSS variables defined in [src/app/globals.css](src/app/globals.css)
- Custom Tailwind variant: `@custom-variant dark (&:is(.dark *))`
- Animation utilities via `tw-animate-css`
- Use Tailwind v4 class names (v3 names trigger deprecation warnings): `bg-linear-to-br` (not `bg-gradient-to-br`), `shrink-0` (not `flex-shrink-0`)

### Form Handling

Standard pattern using react-hook-form + Zod:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
```

### Type System

- Types organized by domain in `src/lib/types/` (`auth`, `product`, `provider`, `category`, `user`, `inventory`, `report`, `backup`)
- Re-exported via barrel files (`src/lib/types/index.ts` → `src/lib/index.ts`); import with `import { IBackup } from '@/lib'`
- Auth types include Role enum and IUser, ILoginRequest, IRegisterRequest, IAuthResponse interfaces
- Naming convention: `I`-prefixed interfaces, typically a `I<Domain>`, `I<Domain>sResponse`, `ICreate<Domain>Request` trio per domain
- TypeScript strict mode enabled

### Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API endpoint (defaults to http://localhost:3000)
- **IMPORTANT**: the configured value already includes the `/api` prefix (e.g. `http://localhost:3001/api`). Server actions build URLs as `${API_URL}/<resource>` — never append another `/api`.
- Set in `.env.local` for development

### Path Aliases

- `tsconfig.json` only declares the wildcard `@/*` → `./src/*`.
- [components.json](components.json) additionally declares shadcn-facing aliases: `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, `@/hooks`. These resolve through the `@/*` wildcard, not as separate tsconfig paths.

## Key Patterns

### Adding Server Actions

1. Create action in `src/actions/` with `'use server'` directive (existing: `auth`, `category`, `product`, `provider`, `user`, `inventory`, `report`, `backup`)
2. Get the JWT via `getToken()` from `./auth.actions`; return `{ error: 'No autenticado' }` if missing
3. Fetch with `headers: { 'Content-Type': 'application/json', Authorization: \`Bearer ${token}\` }` and `cache: 'no-store'`
4. Return structured responses: `{ success: true, data }` or `{ error: string }`; callers discriminate with `'error' in response`
5. Handle errors with try-catch and return error objects (don't throw); on `!response.ok` return `{ error: errorData.message || '<fallback>' }`

### Adding Protected Pages

1. Call `await getValidatedUserWithPermission('<module>', 'view')` in the async server page component (handles both auth and RBAC redirects)
2. Fetch initial data via server action and pass it to a client component in `src/components/<module>/` (see categories for the reference pattern: server `page.tsx` → client orchestrator → shadcn `Table`)
3. Wrap in dashboard layout for consistent UI (automatic under `src/app/dashboard/`)

### Products Report Expiry Filter

- [src/components/reports/ProductsReportPage.tsx](src/components/reports/ProductsReportPage.tsx)'s "Estado de stock" `<Select>` has six options: Todos, OK, Bajo mínimo, Sin stock, Vencido, Próximo a vencer — a single control driving two mutually exclusive backend params on `IProductsReportFilters` ([src/lib/types/report.types.ts](src/lib/types/report.types.ts)):
  - `stockStatus?: 'ok' | 'low' | 'out'` — quantity-based state.
  - `expiryStatus?: ('near_expiry' | 'expired')[]` — lot-level filter (`GET /reports/products?expiryStatus=...`, repeatable param). A product with mixed lots only shows matching rows; products with zero matching lots are excluded entirely (never shown as false "SIN STOCK").
  - Picking Vencido/Próximo a vencer sets `expiryStatus` and clears `stockStatus`; picking OK/Bajo mínimo/Sin stock does the reverse — never send both from this select.
- Do **not** send `expired`/`near_expiry` as `stockStatus` values — only `ok | low | out` are confirmed valid there.

### Working with Zustand Stores

- Create stores in `src/stores/` using Zustand's `create()`
- Export typed hooks for components
- Keep stores focused on client-side state synchronization
- Use server actions for data mutations

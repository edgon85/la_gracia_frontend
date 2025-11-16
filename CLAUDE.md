# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"La Gracia Frontend" is a hospital management system built with Next.js 15 App Router, React 19, TypeScript, and Tailwind CSS v4. The application supports role-based access control for hospital staff (ADMIN, FARMACIA, BODEGA, MEDICO, ENFERMERO, AUDITOR).

## Development Commands

- `pnpm dev` - Start development server at http://localhost:3000
- `pnpm build` - Build production application
- `pnpm start` - Start production server

Package manager: **pnpm** (required)

## Architecture

### Authentication Pattern

The app uses a **hybrid client-server authentication architecture**:

1. **Server Actions** ([src/actions/auth.actions.ts](src/actions/auth.actions.ts)) handle all API communication:
   - `loginAction()` / `registerAction()` - Authenticate with backend API
   - Store JWT token in httpOnly cookie (secure, inaccessible to client JS)
   - Store user data in non-httpOnly cookie (readable by client)
   - `logoutAction()` - Clears cookies and redirects to `/login`
   - `getCurrentUser()` - Server-side user retrieval from cookies
   - `checkAuth()` / `getToken()` - Helper functions for protected routes

2. **Zustand Store** ([src/stores/auth.store.ts](src/stores/auth.store.ts)) manages client state:
   - Does NOT make API calls directly
   - Reads user data from cookies via `getUserFromCookie()` utility
   - Synchronizes auth state across client components
   - Methods: `login()`, `logout()`, `checkAuth()`, `register()`

3. **Route Protection**:
   - Auth pages (e.g., `/login`) use `getCurrentUser()` to redirect authenticated users
   - Protected pages should check auth status server-side before rendering

### UI Component Architecture

Uses **shadcn/ui** component library (configured in [components.json](components.json)):
- Style: "new-york"
- Base color: neutral
- Icon library: lucide-react
- Components in `src/components/ui/`
- Utilities in `src/lib/utils.ts`

### Layout System

- **Dashboard Layout** ([src/components/layout/DashboardLayout.tsx](src/components/layout/DashboardLayout.tsx)):
  - Client component with responsive sidebar/navbar
  - Sidebar toggles on mobile, persistent on desktop
  - Main content area with responsive padding
  - Used via layout wrapper at [src/app/dashboard/layout.tsx](src/app/dashboard/layout.tsx)

- **Route Groups**:
  - `(auth)/` - Authentication pages (login, register)
  - `dashboard/` - Protected application pages with DashboardLayout

### Styling & Theming

- **Tailwind CSS v4** with PostCSS plugin
- **Dark mode** support via `next-themes` and CSS variables
- Color system uses OKLCH color space for perceptual uniformity
- CSS variables defined in [src/app/globals.css](src/app/globals.css)
- Custom Tailwind variant: `@custom-variant dark (&:is(.dark *))`
- Animation utilities via `tw-animate-css`

### Form Handling

Standard pattern using react-hook-form + Zod:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
```

### Type System

- Types organized by domain in `src/lib/types/`
- Re-exported via barrel files (`src/lib/index.ts`)
- Auth types include Role enum and IUser, ILoginRequest, IRegisterRequest, IAuthResponse interfaces
- TypeScript strict mode enabled

### Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API endpoint (defaults to http://localhost:3000)
- Set in `.env.local` for development

### Path Aliases

Configure in both [tsconfig.json](tsconfig.json) and [components.json](components.json):
- `@/*` → `./src/*`
- `@/components` → `./src/components`
- `@/lib` → `./src/lib`
- `@/hooks` → `./src/hooks`
- `@/ui` → `./src/components/ui`

## Key Patterns

### Adding Server Actions

1. Create action in `src/actions/` with `'use server'` directive
2. Use Next.js `cookies()` API for session management
3. Return structured responses: `{ success: true, data }` or `{ error: string }`
4. Handle errors with try-catch and return error objects (don't throw)

### Adding Protected Pages

1. Use `getCurrentUser()` in page component to check auth server-side
2. Redirect unauthenticated users: `if (!user) redirect('/login')`
3. Wrap in dashboard layout for consistent UI

### Working with Zustand Stores

- Create stores in `src/stores/` using Zustand's `create()`
- Export typed hooks for components
- Keep stores focused on client-side state synchronization
- Use server actions for data mutations

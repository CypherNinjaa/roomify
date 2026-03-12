# Roomify — Copilot Instructions

## Project Overview

Roomify is an **AI-powered architectural visualization SaaS** that transforms 2D floor plans into photorealistic 3D renders. Built with React 19, TypeScript, TailwindCSS 4, React Router 7 (SSR), Clerk for authentication, Cloudinary for cloud storage, and Google Gemini API for AI image generation.

## Tech Stack

- **Framework**: React 19 + React Router 7 (SSR enabled) + Vite 7
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 4 with custom theme in `app/app.css`
- **Authentication**: Clerk (React SDK `@clerk/react-router`) — email/social sign-in, RBAC via public metadata
- **Cloud Storage**: Cloudinary (image upload, transformation, delivery via CDN)
- **AI**: Google Gemini API (`@google/generative-ai`) — `gemini-2.5-flash` for floor plan → 3D render
- **UI Icons**: lucide-react
- **Image Compare**: react-compare-slider

## Project Structure

```
app/
  root.tsx          — Root layout with ClerkProvider, global auth state
  routes.ts         — All route definitions
  routes/
    home.tsx        — Landing page: hero, upload, project gallery
    visualizer.$id.tsx — AI render viewer: generation, compare slider, export
    profile.tsx     — User profile & their projects
    product.tsx     — Product features showcase
    pricing.tsx     — Pricing plans page
    community.tsx   — Public gallery of shared projects
    enterprise.tsx  — Enterprise solutions page
    admin.tsx       — Admin dashboard (role-gated via Clerk public metadata)
  app.css           — TailwindCSS theme + all component styles (neobrutalism design)

components/
  Navbar.tsx        — Top nav with Clerk auth (SignInButton/UserButton), links
  Upload.tsx        — Drag-and-drop image upload with progress bar
  Footer.tsx        — Site footer with links
  Skeleton.tsx      — Loading placeholder components
  ui/Button.tsx     — Reusable button with variant/size props

lib/
  constants.ts      — Storage paths, timing constants, AI render prompt, room styles
  ai.action.ts      — generate3DView(): calls Gemini API with floor plan image
  cloudinary.ts     — Cloudinary upload/delete helpers (server-side signed uploads)
  auth.ts           — Clerk auth helpers, role checking utilities
  utils.ts          — General utility functions

server/
  api/              — Server-side API routes (Cloudinary signed uploads, admin endpoints)

type.d.ts           — Global TypeScript interfaces
```

## Authentication (Clerk)

### Setup

- Clerk React Router SDK (`@clerk/react-router`) wraps the app in `ClerkProvider`
- Environment variables: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- SSR-compatible: use Clerk's `rootAuthLoader` for server-side auth

### RBAC via Public Metadata

- User roles are set via **Clerk Dashboard → Users → Public Metadata**
- Public metadata JSON example: `{ "role": "admin" }` or `{ "role": "user" }`
- Default role (no metadata) = regular user
- Access roles in client via `useUser()` → `user.publicMetadata.role`
- Access roles in server/loaders via `getAuth(request)` → decode JWT claims
- **ALWAYS follow Clerk official docs for RBAC**: https://clerk.com/docs/references/react/authorization

### Key Clerk Components & Hooks

- `<SignInButton>`, `<SignUpButton>`, `<UserButton>` — pre-built auth UI
- `useUser()` — current user object (client-side)
- `useAuth()` — auth state: `isSignedIn`, `userId`, `getToken()`
- `<SignedIn>`, `<SignedOut>` — conditional rendering
- `<Protect>` — role/permission-based rendering guard
- Server-side: `getAuth(request)` in loaders for SSR auth checks

### Admin Dashboard

- Route: `/admin` — protected by role check (`publicMetadata.role === "admin"`)
- Tracks: total users, total projects, renders generated, storage usage
- Admin can view all projects, manage users, see analytics

## Cloud Storage (Cloudinary)

### Setup

- Environment variables: `CLOUDINARY_CLOUD_NAME_2`, `CLOUDINARY_API_KEY_2`, `CLOUDINARY_API_SECRET_2`, `CLOUDINARY_UPLOAD_PRESET_2`
- Use **unsigned uploads** with upload preset for client-side uploads
- Use **signed uploads** for server-side operations (admin, automated tasks)

### Image Organization

- Upload folder structure: `roomify/projects/{userId}/{projectId}/`
- Source images: `roomify/projects/{userId}/{projectId}/source`
- Rendered images: `roomify/projects/{userId}/{projectId}/rendered_{style}`
- Public URLs via Cloudinary CDN with transformations

### Key Operations

- `uploadImage(file, folder)` — upload image to Cloudinary
- `deleteImage(publicId)` — remove image from Cloudinary
- `getOptimizedUrl(publicId, options)` — generate transformed URL (resize, format, quality)

## AI (Google Gemini API)

### Setup

- Environment variable: `geminiapi` (API key)
- Model: `gemini-2.5-flash` (or latest available) for image generation/editing
- SDK: `@google/generative-ai`

### Data Flow: Upload → Render

1. User uploads floor plan image in `Upload.tsx`
2. Image uploaded to Cloudinary → returns URL + public_id
3. Project metadata saved (user ID, image URL, timestamp)
4. Navigates to `/visualizer/:id`
5. `visualizer.$id.tsx` calls `generate3DView()` with Gemini API
6. Rendered image uploaded to Cloudinary
7. Project metadata updated with rendered image URL

### Room Styles

- modern, rustic, minimalist, industrial, scandinavian
- Each style has a specific prompt override for the AI

## Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Google Gemini AI
geminiapi=AIza...

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME_2=...
CLOUDINARY_API_KEY_2=...
CLOUDINARY_API_SECRET_2=...
CLOUDINARY_UPLOAD_PRESET_2=...
```

## Design System

- **Theme**: Warm background (`#fdfbf7`), orange primary (`#f97316`), blue secondary (`#3b82f6`)
- **Fonts**: "Instrument Serif" for headings, "Inter" for body
- **Style**: Neobrutalism — bold shadows (`4px 4px 0px 0px rgba(0,0,0,1)`), crisp borders
- **CSS**: All styles in `app/app.css` using TailwindCSS `@layer components` with nested selectors

## Coding Conventions

- Use functional React components with hooks
- All Clerk auth via hooks (`useUser`, `useAuth`) — never prop-drill auth
- All Cloudinary calls go in `lib/cloudinary.ts`, never directly in components
- All Gemini AI calls go in `lib/ai.action.ts`, never directly in components
- Types are global in `type.d.ts` — no need for imports
- Use `lucide-react` icons, not raw SVGs
- Prefer `async/await` over `.then()` chains
- Error handling: `try/catch` with `console.error`, return fallback values (null, [])
- CSS: Use existing class names from `app.css`; avoid inline styles
- **ALWAYS follow official documentation** before implementing any feature
- **ALWAYS check workspace for errors** after making changes (`npm run typecheck`)
- **Learn from mistakes** — never repeat the same error pattern; if a fix fails, try a different approach

## Commands

- `npm run dev` — Start dev server (default port 5173)
- `npm run build` — Production build
- `npm run start` — Serve production build
- `npm run typecheck` — Run TypeScript type checking

## Critical Rules

1. **Always follow official docs** — Technology changes rapidly. Before implementing Clerk, Cloudinary, or Gemini features, verify the latest API and SDK usage from official documentation.
2. **Always check for errors** — After every code change, run typecheck and verify the build. Fix all errors before moving on.
3. **Never repeat mistakes** — If an approach fails, document why and try a fundamentally different solution. Do not retry the same broken pattern.
4. **Security first** — Never expose secret keys on the client side. `CLERK_SECRET_KEY`, `CLOUDINARY_API_SECRET_2` are server-only. Only `NEXT_PUBLIC_*` and `VITE_*` prefixed vars are safe for client.
5. **Incremental changes** — Make small, testable changes. Verify each step works before moving to the next.

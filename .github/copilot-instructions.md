# Roomify — Copilot Instructions

## Project Overview

Roomify is an **AI-powered architectural visualization SaaS** that transforms 2D floor plans into photorealistic 3D renders. Built with React, TypeScript, TailwindCSS, and Puter as the serverless backend.

## Tech Stack

- **Framework**: React 19 + React Router 7 (SSR enabled) + Vite 7
- **Language**: TypeScript (strict)
- **Styling**: TailwindCSS 4 with custom theme in `app/app.css`
- **Backend**: Puter.js SDK (auth, file storage, KV database, AI, hosting, Workers)
- **AI Models**: Gemini `gemini-2.5-flash-image-preview` via `puter.ai.txt2img()`
- **UI Icons**: lucide-react
- **Image Compare**: react-compare-slider

## Project Structure

```
app/
  root.tsx          — Layout + global auth state (signIn/signOut/refreshAuth via outlet context)
  routes.ts         — Route definitions: "/" → home.tsx, "/visualizer/:id" → visualizer.$id.tsx
  routes/
    home.tsx        — Landing page: hero, upload area, project gallery grid
    visualizer.$id.tsx — AI render viewer: generation, compare slider, export
  app.css           — TailwindCSS theme + all component styles (neobrutalism design)

components/
  Navbar.tsx        — Top nav with Puter auth (sign in/out), links
  Upload.tsx        — Drag-and-drop image upload, converts to base64, progress bar
  ui/Button.tsx     — Reusable button with variant/size props

lib/
  constants.ts      — Env vars, storage paths, timing constants, AI render prompt
  ai.action.ts      — generate3DView(): calls puter.ai.txt2img with floor plan image
  puter.action.ts   — Auth helpers + CRUD: createProject, getProjects, getProjectById (via Puter Workers)
  puter.hosting.ts  — Image hosting: upload to Puter FS, generate public URLs via subdomain
  puter.worker.js   — Serverless worker code (deployed to Puter): save/list/get projects via KV store
  utils.ts          — URL helpers, blob conversion, image extension detection, data URL parsing

type.d.ts           — Global TypeScript interfaces: AuthState, DesignItem, AuthContext, HostingConfig, etc.
```

## Key Architecture Patterns

### Authentication

- Puter handles all auth (no custom backend)
- `root.tsx` maintains `AuthState` and passes `signIn`, `signOut`, `refreshAuth` via React Router outlet context
- All child routes access auth via `useOutletContext<AuthContext>()`

### Data Flow: Upload → Render

1. User uploads floor plan image in `Upload.tsx` (converted to base64)
2. `home.tsx` calls `createProject()` → saves to Puter Worker KV store
3. Navigates to `/visualizer/:id`
4. `visualizer.$id.tsx` auto-calls `generate3DView()` which uses `puter.ai.txt2img()` with Gemini
5. Rendered image saved back via `createProject()` with hosted URLs

### Storage

- **KV Store**: Project metadata stored via Puter Workers (`roomify_project_{id}`)
- **File Storage**: Images uploaded to Puter FS under `projects/{id}/source.png` and `projects/{id}/rendered.png`
- **Hosting**: Each user gets a unique `roomify-*.puter.site` subdomain for public image URLs

### Worker API Endpoints (puter.worker.js)

- `POST /api/projects/save` — Save/update project
- `GET /api/projects/list` — List all user projects
- `GET /api/projects/get?id=...` — Get single project by ID

## Environment Variables

- `VITE_PUTER_WORKER_URL` — URL of deployed Puter Worker (e.g., `https://romify.puter.work`)

## Design System

- **Theme**: Warm background (`#fdfbf7`), orange primary (`#f97316`), blue secondary (`#3b82f6`)
- **Fonts**: "Instrument Serif" for headings, "Inter" for body
- **Style**: Neobrutalism — bold shadows (`4px 4px 0px 0px rgba(0,0,0,1)`), crisp borders
- **CSS**: All styles in `app/app.css` using TailwindCSS `@layer components` with nested selectors

## Coding Conventions

- Use functional React components with hooks
- Use `useOutletContext()` for shared auth state — never prop-drill auth
- All Puter SDK calls go in `lib/` files, never directly in components
- Types are global in `type.d.ts` — no need for imports
- Use `lucide-react` icons, not raw SVGs
- Prefer `async/await` over `.then()` chains
- Error handling: `try/catch` with `console.error`, return fallback values (null, [])
- CSS: Use existing class names from `app.css`; avoid inline styles

## Commands

- `npm run dev` — Start dev server (default port 5173)
- `npm run build` — Production build
- `npm run start` — Serve production build
- `npm run typecheck` — Run TypeScript type checking

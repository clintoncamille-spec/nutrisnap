# NutriSnap

AI-powered meal calorie tracking and fridge-to-recipe generation, as a web app (React) and mobile app (Expo/React Native) sharing one backend.

## Structure

```
apps/web/        React + Vite + Tailwind (web)
apps/mobile/      Expo + NativeWind (iOS/Android)
packages/shared/  API client, domain types, cross-platform hooks
packages/config/  Shared design tokens (colors/spacing) for both Tailwind configs
backend/          Fastify API — vision AI + Supabase (DB/Auth/Storage)
```

See the implementation plan for full architecture rationale.

## Prerequisites

- Node.js 20+
- pnpm (this repo pins `packageManager: pnpm@9.15.9` in `package.json` — use `corepack enable` or `npx pnpm@9` if you don't have pnpm installed globally)
- A Supabase project (Postgres + Auth + Storage)
- An OpenAI API key with GPT-4o access

## Setup

1. Install dependencies from the repo root:
   ```
   pnpm install
   ```

2. **Backend**: copy `backend/.env.example` to `backend/.env` and fill in `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Apply the schema in `backend/supabase/migrations/0001_init.sql` to your Supabase project (via the SQL editor or `supabase db push` if using the Supabase CLI), and create a Storage bucket named `meal-photos` if the migration's bucket insert doesn't run automatically in your project.

3. **Web**: copy `apps/web/.env.example` to `apps/web/.env.local` and fill in `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL` (defaults to `http://localhost:3000`).

4. **Mobile**: copy `apps/mobile/.env.example` to `apps/mobile/.env` and fill in the equivalent `EXPO_PUBLIC_*` variables. For `EXPO_PUBLIC_API_BASE_URL`, use your machine's LAN IP (not `localhost`) if testing on a physical device — Expo Go on a phone can't resolve your laptop's `localhost`.

## Running

```
pnpm dev:backend   # Fastify API on :3000
pnpm dev:web       # Vite dev server
pnpm dev:mobile    # Expo dev server (scan the QR with Expo Go, or press i/a for a simulator)
```

## Verifying it works end-to-end

1. Start the backend, then `curl -X POST http://localhost:3000/api/health` — expect `{"status":"ok"}`.
2. Sign up a user from the web app's login screen (this hits Supabase Auth directly, not the backend).
3. Scan a meal photo — confirm a calorie/macro breakdown appears, edit a portion, save it, and confirm it shows up in History.
4. Scan a fridge/ingredients photo — confirm 3 recipes appear with steps and nutrition, and that favoriting one persists across a reload.
5. Repeat the meal-scan flow on the mobile app (same Supabase account) and confirm the meal logged from web appears in mobile's History — this validates the shared backend end-to-end.

## Notes on what's swappable

- **AI vision provider**: `VISION_PROVIDER=openai` (default) or `gemini` (documented in `backend/src/services/vision/gemini.ts`, not yet implemented) — see `backend/src/services/vision/index.ts` for the factory seam.
- **Database**: `DB_PROVIDER=supabase` (default; only implementation built) — see `backend/src/repositories/index.ts` for where a Firebase implementation would plug in.

## Known follow-ups (not blocking, see plan for full list)

- `packages/shared` carries its own `react`/`@types/react` devDependency so it can be typechecked standalone; this creates a second physical `react` copy on disk that `expo-doctor` flags as a duplicate. Metro is configured (`apps/mobile/metro.config.js` → `resolver.extraNodeModules`) to always resolve `react`/`react-native` to the mobile app's own copy regardless, so this shouldn't cause runtime "Invalid hook call" issues, but it's worth revisiting if dependency versions drift further apart.
- No food-search endpoint yet for manually adding a food item in the Results screen — users enter grams/macros by hand for now.
- Per-user rate limiting on the expensive `/analyze` routes isn't wired up yet (only a global IP-based limit); see the comment in `backend/src/server.ts`.

# MealPreply App (v1)

Expo (React Native + Web) app for the MealPreply v1 dogfooding MVP.

## Quick start

```bash
cd app
npm install
cp .env.example .env   # fill in Supabase URL + anon key from the project dashboard
npx expo start
```

- Web: `npx expo start --web` → http://localhost:8081
- iOS / Android: scan the QR with Expo Go

## Scripts

| Script              | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm test`          | Jest (env + i18n suites, ~0.5s)             |
| `npm run typecheck` | `tsc --noEmit` (strict TS)                  |
| `npm run lint`      | `expo lint`                                 |

Tests live in `__tests__/` only (Jest `testMatch` rule). Co-located `*.test.ts` files next to source are silently ignored.

## Stack

- **Expo SDK 54** + **expo-router** (file-based routing)
- **NativeWind v4** (Tailwind for RN + Web)
- **TypeScript** strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`
- **i18next + react-i18next + expo-localization** (en only in v1, extensible)
- **@supabase/supabase-js** + AsyncStorage for session persistence; magic-link auth ready (web + native)
- **Jest 29 + jest-expo 55 + @testing-library/react-native**

## i18n

All UI strings go through `t("key")` from `src/i18n`. Adding a locale:

1. Add the code to `SUPPORTED_LOCALES` in `src/i18n/types.ts`
2. Add a JSON file under `src/i18n/locales/<code>.json` matching the same shape as `en.json`
3. Done — no code changes elsewhere.

## Environment variables

| Variable                          | Where it comes from           | Required |
| --------------------------------- | ----------------------------- | -------- |
| `EXPO_PUBLIC_SUPABASE_URL`        | Supabase dashboard → Settings → API | yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`   | Supabase dashboard → Settings → API | yes |

`service_role` keys MUST NOT be added to `.env` — they belong in Supabase Edge Functions / server contexts only. `EXPO_PUBLIC_*` prefix means the value is embedded into the client bundle.

## Supabase

- Project linked via `supabase/config.toml` (ref `qvzczwongfetibasbwxj`)
- Migrations live in `supabase/migrations/`
- Local CLI ops (run from repo root):
  - `supabase db push` — apply pending migrations to remote
  - `supabase migration new <name>` — scaffold next migration
  - `supabase db pull` — sync remote schema back into a new migration file

## Deployment

- **Web preview / production:** Vercel project `mealpreply-v1-app` — `npx vercel` (preview) / `npx vercel --prod` (production)
- **Mobile:** Expo Go for dogfooding; EAS Build deferred to v1.1.

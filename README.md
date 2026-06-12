# Momentum

Gym training logger — personalized workout plans, smart progression, and
progress tracking. Local-first: everything works offline; paid users get
cloud backup & sync.

## Stack

Expo 56 · React Native 0.85 · TypeScript (strict) · NativeWind 4 ·
Expo Router · Zustand (persisted, AsyncStorage) · react-native-actions-sheet ·
Supabase (auth + sync, paid) · RevenueCat (one-time PWYW purchases).

## Run it

```bash
pnpm install
pnpm start          # Expo Go — everything except notifications & purchases
```

Native features (notifications, Google sign-in, RevenueCat) need a dev build:

```bash
npx expo run:ios    # or: npx expo run:android
```

## Environment

Copy `.env.example` → `.env`. All vars are optional — the app runs fully
local without any of them.

| Var | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` | cloud auth + sync |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | native Google sign-in |
| `EXPO_PUBLIC_REVENUECAT_KEY` (or `_IOS_KEY`/`_ANDROID_KEY`) | purchases |

Supabase schema: run `supabase/schema.sql` in the SQL editor (tables +
owner-only RLS).

## Structure

```
app/                 expo-router routes (thin wrappers only)
features/            one folder per domain: onboarding, home, workout,
                     progress, profile, auth, paywall, sync
  <feature>/         components/ hooks/ api/ lib/ index.ts (barrel)
shared/
  ui/                design-system primitives (Icon, CtaButton, Sheet, …)
  lib/               program domain (exercises/splits/progression), storage
                     adapter, entitlements, notifications, supabase client
  stores/            global Zustand stores (plan, workout, body, settings,
                     auth, sync) — persisted with Zod-validated rehydrate
providers/sheets.tsx bottom-sheet registry (typed SheetManager ids)
```

Conventions: kebab-case files, ≤250 lines/file, no `any`, design tokens in
`tailwind.config.js` (mirrored in `shared/lib/colors.ts`), sheets via the
actions-sheet registry — see the org CODING_STANDARDS doc.

## Business model

Free forever: all training features; Progress view limited to the last
8 weeks (data never deleted). One-time pay-what-you-want unlock
(₹299/₹499/₹999 · $9.99/$19.99/$39.99) adds all-time history, Google
sign-in, cloud sync, export. Tiers: `features/paywall/lib/tiers.ts`;
gating: `shared/lib/entitlements.ts`.

## Release checklist

- [ ] Play Console / App Store Connect: create non-consumable products
      `momentum.unlock`, `momentum.support`, `momentum.champion` with the
      prices above (India overrides in ₹)
- [ ] RevenueCat: attach store products to the `premium` entitlement; swap
      the `test_` key for `appl_`/`goog_` keys in `.env`
- [ ] Google OAuth clients (web/iOS/Android) + Supabase Google provider;
      add the google-signin config plugin with `iosUrlScheme` to app.json
- [ ] Replace dev fallback purchase path (`paywall-screen.tsx` TODO)

# Mobile App (Capacitor wrapper) — Claude Code Prompt

Copy everything between the fences below and paste as your **first message** in a new Claude Code session at the Caltrack-pro repo root.

This is a multi-week build, not an evening's work. Read the diff at every commit boundary.

---

```
Turn the existing CalCheq React web app into a native mobile app for iOS + Android, using Capacitor. The deliverable is two installable apps, in App Store and Play Store, focused on the field technician workflow: scan an instrument tag (QR/barcode) → open its detail page → enter a calibration → attach a photo → submit.

This is NOT a rewrite. We're wrapping the existing React app, sharing 95% of the code with web, and adding native capabilities only where they earn their keep.

## Read these first (in this order)
1. `CLAUDE.md` — full project reference. File map, routing, auth, data shape.
2. `DECISIONS.md` — why we chose Supabase Auth, why per-site isolation by `created_by`.
3. `ROADMAP.md` — what's shipped recently. Note: super-admin work may have just landed; don't conflict with it.
4. `frontend/package.json` — current React 18 + Vite + Tailwind setup. Capacitor plugs in here.
5. `frontend/src/pages/InstrumentList.jsx` and `InstrumentDetail.jsx` — these get the QR scan integration.
6. `frontend/src/pages/CalibrationForm.jsx` — gets the camera/photo attachment.
7. `frontend/src/utils/supabase.js` — existing Supabase client; we'll extend with Storage for photos.

## Scope — what's IN v1

- Capacitor wrapper with iOS and Android native projects
- App Store + Play Store distribution (production-ready builds, not just simulator)
- QR/barcode scanning via `@capacitor-mlkit/barcode-scanning`
- Camera + photo attachment via `@capacitor/camera`, photos stored in Supabase Storage and linked to calibration records
- Mobile-optimised UI tweaks for technician flow: bottom nav on mobile (replaces sidebar), bigger touch targets, floating "scan" action button on instrument list and dashboard
- Auth via existing Supabase JWT (no auth changes), with Capacitor Preferences for secure token storage in WebView
- App icons + splash screens (placeholders are fine — I'll provide final art later)
- App Store + Play Store metadata templates: name, description, keywords, privacy policy URL, screenshots
- Build pipeline: npm scripts for `npm run build:ios` and `npm run build:android` that handle web build + cap sync

## Scope — what's OUT of v1 (do NOT build)

- Offline mode + sync (deferred — meaningful complexity, ship without)
- Push notifications (deferred — iOS PWA push is unreliable; native push is its own project)
- Biometric auth (Face ID / Touch ID) — deferred
- React Native rewrite — explicitly rejected
- Marketing-site mobile app — only `/app/*` routes go in the mobile build; marketing pages stay web-only
- Plan-gated mobile features — keep feature gating identical to web for now

If you're tempted to add any of these "while we're at it", don't. Leave clean extension points and document them in ROADMAP as "next mobile increments".

## Architectural decisions (locked in — do not relitigate)

- **Capacitor over Cordova** — modern, actively maintained, official.
- **WebView-based** — the existing React app loads in the WebView; native plugins bridge to camera/scanner.
- **Token storage:** use `@capacitor/preferences` (encrypted on iOS, EncryptedSharedPreferences on Android) for the Supabase JWT. Falls back to localStorage on web.
- **Photos:** uploaded to a Supabase Storage bucket called `calibration-photos`, scoped per-site via RLS. Photo URLs stored on the `calibration_records` table in a new `photo_urls TEXT[]` column.
- **QR/barcode payload contract:** scan returns the raw tag_number string (e.g. `PT-9300`). Backend endpoint `GET /api/instruments/by-tag/{tag_number}` returns the instrument id, then frontend navigates to `/app/instruments/{id}`. If tag not found, show a clear error.
- **Mobile UI strategy:** detect mobile via Capacitor's `isNativePlatform()` plus a Tailwind `md:` breakpoint. Show bottom nav + FAB on mobile, sidebar on web. Use existing Tailwind utility classes — no new CSS framework.
- **App ID:** `com.calcheq.app` for both platforms.

## What to build, in order

### Phase 1 — Capacitor scaffolding (~1 day)

- Install dependencies in `frontend/`: `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`, `@capacitor/preferences`, `@capacitor/splash-screen`, `@capacitor/status-bar`.
- Run `npx cap init "CalCheq" "com.calcheq.app" --web-dir=dist`.
- Generate `capacitor.config.ts` with:
  - `appId: 'com.calcheq.app'`
  - `appName: 'CalCheq'`
  - `webDir: 'dist'`
  - `server.androidScheme: 'https'`
  - Splash screen + status bar config
- Add `npx cap add ios` and `npx cap add android` to create native projects.
- Add npm scripts: `build:mobile` (vite build + cap sync), `open:ios`, `open:android`.
- Verify: `npm run build:mobile` succeeds. `npx cap open ios` opens Xcode. `npx cap open android` opens Android Studio. Both projects build successfully against an empty React app.
- Commit: "Phase 1: Capacitor scaffolding for iOS + Android".

### Phase 2 — Mobile-aware UI (~2 days)

- Add a platform detection helper at `frontend/src/utils/platform.js`: exports `isNative()` (Capacitor's `isNativePlatform`), `isMobileViewport()` (Tailwind sm/md detection).
- Refactor `Layout.jsx` so that on mobile (native OR mobile viewport), the sidebar is replaced with a bottom nav bar showing the 5 most-used items: 🏠 Dashboard, 🔧 Instruments, 📋 Calibrations, 📅 Schedule, ⚙️ More. The "More" tab opens a sheet/drawer with the remaining items (Diagnostics, Documents, Reports, Settings, Support).
- Move the existing Sidebar.jsx into `desktop` mode and create `BottomNav.jsx` for mobile.
- Add a floating action button (FAB) on the Dashboard and InstrumentList: large round button bottom-right, 📷 icon, opens the QR scanner. On non-native web, hide it.
- Increase touch targets across `InstrumentList`, `Calibrations`, and `Schedule` to a minimum 44×44pt (Apple HIG) on mobile breakpoints.
- All mobile-specific styles via Tailwind breakpoints — no new CSS files.
- Verify: web at desktop width still uses sidebar; web at <768px viewport uses bottom nav; iOS simulator shows bottom nav.
- Commit: "Phase 2: Mobile-aware Layout with bottom nav + FAB".

### Phase 3 — QR / barcode scanning (~2 days)

- Install `@capacitor-mlkit/barcode-scanning`.
- iOS: add `NSCameraUsageDescription` to `ios/App/App/Info.plist` with text "CalCheq uses the camera to scan instrument tags".
- Android: add `<uses-permission android:name="android.permission.CAMERA"/>` and ML Kit dependencies to `android/app/build.gradle`.
- Create `frontend/src/components/BarcodeScanner.jsx`: requests permission, opens scanner, returns the scanned string, handles cancellation and permission denial.
- Wire the FAB → scanner. On successful scan:
  1. Call new backend endpoint `GET /api/instruments/by-tag/{tag_number}`.
  2. If found, `navigate(\`/app/instruments/\${id}\`)`.
  3. If not found, toast: "No instrument with tag '{tag_number}' on this site. Check the tag or create a new instrument."
- New backend endpoint in `backend/routes/instruments.py`: `GET /api/instruments/by-tag/{tag_number}` — site-isolated lookup by tag_number, returns 404 if not found.
- Verify on iOS simulator: scanner opens, scans a printed QR with `PT-9300`, navigates to PT-9300 detail page. Verify same on Android emulator.
- Commit: "Phase 3: QR/barcode scanner with instrument lookup".

### Phase 4 — Camera + photo attachment (~3 days)

- Install `@capacitor/camera`.
- iOS: add `NSCameraUsageDescription` (already added above) and `NSPhotoLibraryUsageDescription` to Info.plist.
- Android: add camera permission (already added) and `READ_EXTERNAL_STORAGE` if targeting older API levels.
- Create Supabase Storage bucket `calibration-photos` via SQL migration. Apply RLS policies: a user can `insert` only with `created_by` matching their site_name; can `select` only photos in their site. Public read is OFF.
- DB migration: add `photo_urls TEXT[]` column to `calibration_records` (default empty array). New alembic migration in `backend/alembic/versions/`.
- Backend: extend `CalibrationRecord` schema and ORM model. POST /calibrations and PATCH /calibrations accept `photo_urls`.
- Frontend: in `CalibrationForm.jsx`, add a "📷 Add photo" button (mobile-only via `isNative()`). On click:
  1. Capacitor Camera plugin captures photo.
  2. Photo uploads to Supabase Storage at `calibration-photos/{site_name}/{calibration_id_or_tmp}/{uuid}.jpg`.
  3. The returned public URL is appended to a local `photo_urls` array, shown as a thumbnail row above the submit button.
  4. On form submit, `photo_urls` is included in the payload.
- Display photos: in `InstrumentDetail.jsx` Calibration History tab and in calibration record detail, render thumbnails of `photo_urls`. Click → full-screen viewer.
- Verify: take a photo, submit calibration, reload, photo appears in history.
- Commit: "Phase 4: Camera + photo attachment to calibrations".

### Phase 5 — App icons, splash screens, store metadata (~1 day)

- Use `@capacitor/assets` to generate all icon + splash sizes from a single 1024×1024 source. Use placeholder source (CalCheq logo on teal background) — I'll swap in final art before submission.
- Generate iOS launch storyboard + Android adaptive icons.
- Create `mobile/store-metadata/` folder with template files:
  - `app-store-listing.md` — name, subtitle, keywords (max 100 chars), description (max 4000), what's-new, support URL, marketing URL, privacy policy URL.
  - `play-store-listing.md` — same format for Play Store fields.
  - `screenshots/` — empty folder with a README listing required dimensions per device class.
- Pre-fill the listings with: tagline ("Industrial calibration management for Australian process plants"), 80-word description (lift from calcheq.com landing copy), category "Productivity" or "Utilities".
- Add `https://calcheq.com/privacy` to the listings — IMPORTANT: this URL must exist and be reachable before submission. If it doesn't exist yet, flag it in the final report.
- Commit: "Phase 5: App icons, splash screens, store metadata templates".

### Phase 6 — Documentation (final commit)

Update these files in one commit:

**CLAUDE.md**
- Add new top-level section "Mobile App (Capacitor)" covering: app ID, build pipeline (`npm run build:mobile`), where iOS lives (`frontend/ios/`), where Android lives (`frontend/android/`), the new mobile-only files (BottomNav.jsx, BarcodeScanner.jsx), the `photo_urls` column on calibration_records, the `calibration-photos` Supabase Storage bucket, the `/api/instruments/by-tag/{tag}` endpoint.
- Add `@capacitor/*` plugins to the file map for `frontend/`.
- Document the mobile detection helper at `frontend/src/utils/platform.js`.
- Add to "Required Railway env vars" if any new ones (likely none).

**DECISIONS.md**
New section "Mobile app: Capacitor + Field Tech focus — April 2026":
- Why Capacitor over React Native (95% code reuse vs. UI rewrite; cost vs. polish trade-off appropriate for current scale).
- Why iOS+Android stores over PWA (industrial buyer perception of "real app"; reliable native APIs).
- Why technician-focused over feature parity (mobile is a different surface; matching desktop is a recipe for clutter).
- What's deferred and why: offline mode (complexity, ship-fast), push (iOS unreliability without native), biometrics (not a security blocker for v1).

**ROADMAP.md**
- "Completed {today's date} April 2026" block covering the mobile build phases.
- Add to "Next steps" / future increments: offline mode + sync, push notifications, biometric unlock, plan-gated mobile features.

**README.md**
Add a "Mobile development" section:
- Required tooling: Xcode 15+, Android Studio Hedgehog+, iOS 16+ target, Android 12+ target.
- How to run on simulator: `npm run build:mobile && npm run open:ios` (or `open:android`).
- How to test on physical device: brief Capacitor live-reload notes.
- App Store submission requirements: Apple Developer Program ($99/yr), code-signing certificates, App Store Connect setup.
- Play Store submission requirements: Google Play Console ($25 one-time), upload key, signed AAB.
- Note: privacy policy URL must be live before store submission.

Commit: "Phase 6: Mobile app documentation".

## Guardrails — things NOT to do

- Do NOT modify the marketing pages (`frontend/src/pages/marketing/`). The mobile app does not include marketing.
- Do NOT change the Supabase Auth flow. Capacitor uses the same JWT, just stored via Preferences.
- Do NOT push commits. I review and push manually.
- Do NOT add offline-mode shims, push notification scaffolding, or biometric auth even partially. Those are separate projects with their own design constraints. Leave clean extension points and call them out in ROADMAP.
- Do NOT introduce a new state management library (Redux, Zustand, etc.) for mobile. Existing component state + React Router is sufficient.
- Do NOT break the existing web build. After every phase, `cd frontend && npm run build` (web) must still succeed.
- Do NOT run `pod install` or other native build commands inside Claude Code's terminal — flag any required manual steps in the commit message.
- Do NOT skip the SQL migration for `photo_urls` and the Supabase Storage bucket policies. Photos without RLS = cross-tenant data leak.

## How to work

1. **Plan first.** Reply with a bullet-list plan: files to create, files to edit, plugin versions, DB migrations, manual steps I'll need to run (Xcode signing, Apple Developer account setup, Supabase Storage bucket creation), estimated commit-boundary scope. Wait for my sign-off before any code.
2. After sign-off, work phases 1 → 6 in order. Commit at each phase boundary with the message format above.
3. After each phase: `cd frontend && npm run build` must succeed. After phases 1+ also run `npm run build:mobile`.
4. After phase 4: `npx cap doctor` must pass for both ios and android.
5. After phase 6: run `/review` for self-review.
6. Final report at the end: list of every commit, list of every manual step I need to do (App Developer accounts, Supabase Storage bucket creation, signing certs, etc.), known limitations, recommended testing checklist.

## Verification I'll run after you're done

**Builds and basics**
- `npm run build` (web) succeeds.
- `npm run build:mobile` succeeds.
- `npx cap open ios` opens Xcode with a buildable project.
- `npx cap open android` opens Android Studio with a buildable project.

**Mobile UI**
- iOS simulator: app launches to login screen → can sign in with IXOM credentials → dashboard loads → bottom nav visible, sidebar hidden.
- Android emulator: same.
- Web at desktop width (>=1024px): sidebar visible as before, no bottom nav.

**QR scanning**
- iOS simulator with simulated QR code: scanner opens, scans a tag, navigates to instrument detail.
- Unknown tag scan: friendly toast, no crash.

**Camera + photos**
- Take a photo on simulator → uploads to Supabase Storage → URL stored in calibration record → thumbnail visible in history.
- Cross-tenant test: log in as Demo, try to fetch a photo URL belonging to IXOM → 403.

**No regressions**
- Web app still passes all the same flows it did before. Sign in, dashboard, create instrument, calibrate, etc.

## Manual steps I'll need to do myself (please list these in your final report)

- Open Apple Developer account ($99/yr).
- Open Google Play Developer account ($25 one-time).
- Create the `calibration-photos` Supabase Storage bucket and apply RLS (or you can do this via Supabase MCP if you have access — check first).
- Generate signing certificates (iOS provisioning profile, Android keystore).
- Provide final app icon art (1024×1024 PNG) and splash screen art.
- Write the actual Privacy Policy and host at https://calcheq.com/privacy.
- Take store screenshots on simulator/emulator.
- First-time App Store Connect + Play Console setup (app name reservation, etc.).
- Submit for review.
```

---

## After Code finishes

1. Read every diff. Mobile builds touch Xcode project files (`.pbxproj`), Gradle files, native config — Code tends to over-modify these. Check that only the additions you'd expect are there.

2. Run on a real device, not just simulator. Capacitor apps that work fine on iOS Simulator can have camera permission issues on a physical iPhone. Same for Android.

3. The Supabase Storage RLS policies are the single highest-risk piece of this build. Test cross-tenant access yourself before declaring victory: log into Demo, look at a Network request URL for an IXOM photo, try to fetch it directly, confirm 403.

4. The Privacy Policy is a real blocker for App Store submission. If `calcheq.com/privacy` doesn't exist yet, you'll need to write one (Termly or iubenda generators do a passable job). Don't submit without it — App Store will reject within hours.

5. Plan for ~2-4 weeks elapsed time even though the prompt outlines ~1.5 weeks of build work. The store submission process — first-time App Store Connect setup, code signing, screenshot prep, the actual review queue — adds real calendar time. Budget for it.

6. Apple Developer account approval can take 24-48 hours. Start that application now if you haven't.

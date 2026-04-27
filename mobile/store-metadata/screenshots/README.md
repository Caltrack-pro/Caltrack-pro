# Store screenshots

Drop final PNG/JPG screenshots in this folder when you're ready to submit.
File naming: `<store>-<device>-<index>-<slug>.png` (e.g. `play-phone-01-scan.png`).

## Required sizes

### Apple App Store
- **iPhone 6.9" (15 Pro Max / 16 Pro Max):** 1290 × 2796 — REQUIRED, min 3 / max 10
- **iPhone 6.5" (legacy fallback):** 1242 × 2688 — optional, only if you need to support older devices that can't display 6.9"
- **iPad 13" (Pro):** 2064 × 2752 — REQUIRED if app supports iPad, min 3 / max 10

### Google Play Store
- **Phone:** min 1080 px on the short side, 16:9 or 9:16, JPG/PNG, min 2 / max 8
- **Tablet 7":** 1024 × 600 (or 600 × 1024), optional
- **Tablet 10":** 1280 × 800 (or 800 × 1280), optional
- **Feature graphic:** 1024 × 500 PNG/JPG — REQUIRED for Play Store listing card

## Shot list (capture in order, in landscape only where the screen actually is landscape)

1. **Tag scan** — fullscreen scanner with crosshair on a real instrument tag. Caption overlay: "Scan a tag, open the asset."
2. **Instrument detail** — calibration history + drift trend chart visible. Caption: "Full history, drift trend, audit trail."
3. **Calibration form (test points)** — 5-point form with as-found values typed in, one marginal point highlighted amber. Caption: "Pass/marginal/fail called the moment you type."
4. **Photo evidence** — calibration form scrolled to the photo grid with 3 thumbnails attached. Caption: "Photo evidence on every record."
5. **Pending approval** — Calibrations page → Pending Approvals tab with 2 records. Caption: "Submit from the field, approve from anywhere."
6. **Smart diagnostics** — Recommendations tab with at least one critical card visible. Caption: "Spot drift before it fails."
7. **Dashboard** — KPI cards + donut + upcoming list. Caption: "Compliance at a glance."

## Capture method
Use the Android emulator (API 34, Pixel 7 Pro device profile) for Play screenshots.
Use the iOS simulator (iPhone 16 Pro Max, latest iOS) for App Store screenshots — run via Codemagic CI macOS runner.
For both, log in as the Riverdale demo account so the data looks realistic.

## Caption / overlay tooling
Use the same gradient + brand navy palette as the marketing site. Caption font: Inter Bold 64pt, white, with a 12pt brand-navy drop shadow. Place captions in the top third — bottom third is reserved for the device's bottom nav.

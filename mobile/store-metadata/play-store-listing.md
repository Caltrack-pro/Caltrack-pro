# Google Play Store Listing — CalCheq

## App basics
- **App name:** CalCheq
- **Short description (≤80 chars):** Scan, calibrate, photograph, submit — calibration management in the field.
- **Application ID:** com.calcheq.app
- **Category:** Business
- **Tags:** Productivity, Tools
- **Content rating:** Everyone
- **Pricing:** Free to install (subscription required; managed at calcheq.com)
- **Target audience:** Adults (18+) — work tool, not consumer

## Full description (≤4,000 chars)
CalCheq is calibration management built for the technicians who actually do the work — and the engineers who have to prove it to an auditor.

Walk up to an instrument, scan its tag with your phone's camera, and the right asset opens instantly — no menu hunting, no typing. Capture as-found and as-left readings against your test points, snap photos of the install or the tag plate, and submit. The pass / marginal / fail call is made server-side from the same engine the desktop app uses, so your field result and your audit record never disagree.

<b>Key features</b>
• QR / barcode tag scanning — point at the instrument, the asset opens
• Photo evidence — attach photos of the tag, install location, or post-cal state to every record
• Per-point as-found / as-left entry — 1 to 20 test points, percent-span / percent-reading / absolute tolerance
• Drift intelligence — see whether an instrument is trending toward failure before it gets there
• Pending approvals — submit from the field, your supervisor approves from anywhere
• Calibration certificates — generated automatically and emailed to the technician on record
• Same data as the web app — no separate mobile database to keep in sync

<b>Who it's for</b>
• Water utilities, food & beverage producers, and process plants subject to MHF, HACCP, FSANZ, or similar compliance regimes
• Maintenance teams currently living in spreadsheets, Access databases, or paper logbooks
• Calibration contractors who service multiple sites and need a clean handover trail

<b>Requirements</b>
• A CalCheq subscription (Starter, Professional, or Enterprise — manage at calcheq.com)
• Camera permission to scan tags and capture evidence photos
• Internet connection (offline mode coming in a future release)

<b>Privacy</b>
We don't sell your data. Photos and calibration records are stored against your site only — no other CalCheq customer can see them. Full privacy policy at calcheq.com/privacy.

## Required permissions (AndroidManifest.xml)
- `android.permission.CAMERA` — scan tags + capture photos
- `android.permission.READ_EXTERNAL_STORAGE` — attach existing photos (legacy Android)
- `android.permission.READ_MEDIA_IMAGES` — attach existing photos (Android 13+)
- `android.permission.INTERNET` — connect to CalCheq backend (auto-granted)

## Data safety declaration (Play Console)
- **Photos:** collected, transmitted to our backend, stored against your CalCheq site. NOT shared with third parties. NOT used for advertising. Required for app function. User can delete via app or by contacting support.
- **Personal info:** email + name (your CalCheq account) — required for sign-in. Encrypted in transit. NOT shared.
- **App activity:** calibration records you create — required for app function. Encrypted in transit.
- **Device or other IDs:** none collected.

## Contact details
- **Support email:** info@calcheq.com
- **Support website:** https://calcheq.com/support
- **Privacy policy:** https://calcheq.com/privacy

## Release notes (first release)
First release. Field calibration entry with QR/barcode tag scanning and photo evidence.

## Screenshots required
See `screenshots/README.md` for sizes and shot list.

"""
Build the self-contained IXOM CalCheq presentation HTML.

Reads: _template.html + screenshots + logo SVG
Writes: IXOM-CalCheq-Proposal.html (single file, fully offline, base64-embedded images)
"""
import base64
import os
import sys

import qrcode

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, ".."))
SCREENSHOTS = os.path.join(ROOT, "assets", "screenshots")
LOGO = os.path.join(ROOT, "frontend", "public", "assets", "calcheq-logo-horizontal-lockup.svg")

TEMPLATE = os.path.join(HERE, "_template.html")
OUTPUT   = os.path.join(HERE, "IXOM-CalCheq-Proposal.html")

IMG_MAP = {
    "IMG_DASHBOARD":    "Dashboard.png",
    "IMG_INSTRUMENTS":  "Instruments.png",
    "IMG_SCHEDULE":     "Schedule.png",
    "IMG_CALIBRATIONS": "Calibrations.png",
    "IMG_SETTINGS":     "Settings.png",
    "IMG_DRIFT":        "Diagnostics Drift Alerts.png",
    "IMG_DRIFT2":       "Drift alerts 2.png",
    "IMG_RECS":         "Diagnostics Recommendations.png",
    "IMG_REPEAT":       "Diagnostics Repeat Failures.png",
    "IMG_CAL_CERT":     "Cal Cert.png",
    "IMG_CAL_HIST":     "Historical cal cert.png",
}

QR_URL = "https://calcheq.com"

def b64_png(path):
    with open(path, "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode("ascii")

def load_svg(path):
    with open(path, "r", encoding="utf-8") as f:
        svg = f.read()
    if svg.lstrip().startswith("<?xml"):
        svg = svg.split("?>", 1)[1]
    return svg.strip()

def make_qr_svg(url, px=150):
    """Generate a real, scannable QR code as inline SVG."""
    q = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=1, border=2,
    )
    q.add_data(url)
    q.make(fit=True)
    m = q.get_matrix()
    rows = len(m)
    rects = []
    for y, row in enumerate(m):
        x = 0
        while x < rows:
            if row[x]:
                start = x
                while x < rows and row[x]:
                    x += 1
                rects.append(f'<rect x="{start}" y="{y}" width="{x-start}" height="1"/>')
            else:
                x += 1
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'width="{px}" height="{px}" viewBox="0 0 {rows} {rows}" '
        f'shape-rendering="crispEdges">'
        f'<rect width="{rows}" height="{rows}" fill="#ffffff"/>'
        f'<g fill="#050B1C">{"".join(rects)}</g>'
        f'</svg>'
    )
    return svg

def main():
    for p, label in [(TEMPLATE, "template"), (SCREENSHOTS, "screenshots dir"), (LOGO, "logo")]:
        if not os.path.exists(p):
            print(f"ERROR: {label} missing at {p}", file=sys.stderr)
            sys.exit(1)

    with open(TEMPLATE, "r", encoding="utf-8") as f:
        html = f.read()

    # Logo — inject with unique gradient IDs per occurrence
    base_svg = load_svg(LOGO)
    count = 0
    def next_logo():
        nonlocal count
        count += 1
        s = base_svg
        for gid in ("hArc", "hCheck", "hWord"):
            s = s.replace(f'id="{gid}"', f'id="{gid}_{count}"')
            s = s.replace(f'url(#{gid})', f'url(#{gid}_{count})')
        return s
    while "{{LOGO_SVG}}" in html:
        html = html.replace("{{LOGO_SVG}}", next_logo(), 1)

    # QR code
    qr_svg = make_qr_svg(QR_URL, px=150)
    html = html.replace("{{QR_SVG}}", qr_svg)
    print(f"  injected QR_SVG (target: {QR_URL})")

    # Screenshots
    for placeholder, filename in IMG_MAP.items():
        path = os.path.join(SCREENSHOTS, filename)
        if not os.path.exists(path):
            print(f"ERROR: missing screenshot {path}", file=sys.stderr)
            sys.exit(1)
        token = "{{" + placeholder + "}}"
        if token not in html:
            print(f"  skip  {placeholder} (not referenced in template)")
            continue
        html = html.replace(token, b64_png(path))
        print(f"  injected {placeholder}  ({filename}, {os.path.getsize(path):,} bytes)")

    # Sanity check
    import re
    leftover = re.findall(r"\{\{[A-Z_0-9]+\}\}", html)
    if leftover:
        print(f"WARNING: unresolved placeholders: {sorted(set(leftover))}", file=sys.stderr)

    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write(html)

    size_mb = os.path.getsize(OUTPUT) / 1024 / 1024
    print(f"\nWrote: {OUTPUT}")
    print(f"Final size: {os.path.getsize(OUTPUT):,} bytes ({size_mb:.2f} MB)")

if __name__ == "__main__":
    main()

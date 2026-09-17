#!/usr/bin/env python3
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve()

required = [
    "index.html",
    "de/index.html",
    "en/index.html",
    "de/tool.html",
    "en/tool.html",
    "de/basket.html",
    "en/basket.html",
    "de/pets.html",
    "en/pets.html",
    "assets/styles.css",
    "assets/app.js",
]

missing = [p for p in required if not (ROOT / p).exists()]
if missing:
    raise SystemExit("Missing required deployment paths: " + ", ".join(missing))

html_files = sorted(ROOT.rglob("*.html"))
if not html_files:
    raise SystemExit("No HTML files found")

# Keep the production shell closed to indexing until the commercial core and legal launch gate pass.
robots_fail = []
for p in html_files:
    rel = p.relative_to(ROOT).as_posix()
    if rel.startswith(("de/", "en/")) or rel == "index.html":
        text = p.read_text(encoding="utf-8", errors="strict")
        if not re.search(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*noindex[^"\']*nofollow[^"\']*["\']', text, re.I):
            robots_fail.append(rel)
if robots_fail:
    raise SystemExit("Pre-launch robots lock missing from: " + ", ".join(robots_fail[:30]))

# Resolve local href/src references across the complete static site.
missing_refs = []
for p in html_files:
    text = p.read_text(encoding="utf-8", errors="strict")
    for ref in re.findall(r'(?:src|href)=["\']([^"\']+)["\']', text, re.I):
        if ref.startswith(("http://", "https://", "mailto:", "tel:", "javascript:", "data:", "#")):
            continue
        clean = ref.split("#", 1)[0].split("?", 1)[0].strip()
        if not clean:
            continue
        if clean.startswith("/"):
            target = ROOT / clean.lstrip("/")
        else:
            target = (p.parent / clean).resolve()
        try:
            target.relative_to(ROOT)
        except ValueError:
            missing_refs.append((p.relative_to(ROOT).as_posix(), ref, "escapes deployment root"))
            continue
        if not target.exists():
            missing_refs.append((p.relative_to(ROOT).as_posix(), ref, "missing"))
if missing_refs:
    sample = "; ".join(f"{a} -> {b} ({c})" for a, b, c in missing_refs[:40])
    raise SystemExit("Broken local references: " + sample)

# V26 regression sentinels: pet-first journey, dry-food choice, and pet identity in checkout/confirmation.
critical = {
    "de/tool.html": ["Trockenfutter", "Pet Match"],
    "en/tool.html": ["Pet Match"],
    "de/basket.html": ["data-active-pet-name", "checkout7Done"],
    "en/basket.html": ["data-active-pet-name", "checkout7Done"],
    "de/pets.html": ["data-active-pet-name"],
    "en/pets.html": ["data-active-pet-name"],
}
for rel, markers in critical.items():
    text = (ROOT / rel).read_text(encoding="utf-8", errors="strict")
    absent = [m for m in markers if m not in text]
    if absent:
        raise SystemExit(f"Regression sentinel missing in {rel}: {absent}")

# No accidental credential material in deployable output.
for p in ROOT.rglob("*"):
    if not p.is_file():
        continue
    n = p.name.lower()
    if n in {".env", "id_rsa", "id_ed25519"} or n.endswith((".pem", ".key", ".p12", ".pfx")):
        raise SystemExit(f"Sensitive-looking file present in deployment: {p.relative_to(ROOT)}")

print(f"QUALIFIED: {len(html_files)} HTML files; required paths present; local references resolved; pre-launch robots lock intact; V26 regression sentinels present")

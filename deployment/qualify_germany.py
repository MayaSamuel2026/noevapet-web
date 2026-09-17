#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

root = Path(sys.argv[1]).resolve()

required = [
    'index.html', 'tool.html', 'basket.html', 'pets.html', 'how-it-works.html',
    'faq.html', 'contact.html', 'privacy.html', 'imprint.html', 'terms.html', 'cookies.html',
    'assets/styles.css', 'assets/app.js', 'robots.txt', 'VERSION.txt', 'MARKET.txt'
]
missing = [p for p in required if not (root / p).exists()]
if missing:
    raise SystemExit('Germany deployment missing required paths: ' + ', '.join(missing))

if (root / 'en').exists():
    raise SystemExit('Germany deployment must not contain an /en directory')
if (root / 'de').exists():
    raise SystemExit('Germany deployment must be flattened to the domain root, not /de')

html_files = sorted(root.glob('*.html'))
if not html_files:
    raise SystemExit('Germany deployment contains no HTML pages')

broken = []
for p in html_files:
    text = p.read_text(encoding='utf-8', errors='strict')
    rel = p.name

    if not re.search(r'<html\b[^>]*\blang=["\']de["\']', text, re.I):
        raise SystemExit(f'{rel}: html lang must be de')
    if rel != '404.html' and not re.search(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*noindex[^"\']*nofollow[^"\']*["\']', text, re.I):
        raise SystemExit(f'{rel}: pre-launch noindex,nofollow lock missing')
    if rel != '404.html':
        expected = 'https://noevapet.de/' if rel == 'index.html' else f'https://noevapet.de/{rel}'
        if f'rel="canonical" href="{expected}"' not in text:
            raise SystemExit(f'{rel}: canonical URL missing or incorrect; expected {expected}')

    lowered = text.lower()
    if '../en/' in lowered or '/en/' in lowered:
        raise SystemExit(f'{rel}: English-market link leaked into Germany build')
    if re.search(r'<a\b[^>]*class=["\'][^"\']*\blang\b[^"\']*["\'][^>]*>\s*en\s*</a>', text, re.I):
        raise SystemExit(f'{rel}: EN language switch leaked into Germany build')

    # Validate local static references from the flattened root.
    for ref in re.findall(r'(?:src|href)=["\']([^"\']+)["\']', text, re.I):
        if ref.startswith(('http://', 'https://', 'mailto:', 'tel:', 'javascript:', 'data:', '#', 'about:')):
            continue
        clean = ref.split('#', 1)[0].split('?', 1)[0].strip()
        if not clean:
            continue
        target = (root / clean.lstrip('/')).resolve() if clean.startswith('/') else (p.parent / clean).resolve()
        try:
            target.relative_to(root)
        except ValueError:
            broken.append((rel, ref, 'escapes root'))
            continue
        if not target.exists():
            broken.append((rel, ref, 'missing'))

if broken:
    sample = '; '.join(f'{a} -> {b} ({c})' for a, b, c in broken[:40])
    raise SystemExit('Germany deployment has broken local references: ' + sample)

# Product/UX regression sentinels for the German launch.
critical = {
    'tool.html': ['Trockenfutter', 'Pet Match'],
    'basket.html': ['data-active-pet-name', 'checkout7Done'],
    'pets.html': ['data-active-pet-name'],
}
for rel, markers in critical.items():
    text = (root / rel).read_text(encoding='utf-8', errors='strict')
    absent = [m for m in markers if m not in text]
    if absent:
        raise SystemExit(f'{rel}: Germany regression sentinel missing: {absent}')

# Fresh visitors must never be auto-populated with prototype pets.
app = (root / 'assets/app.js').read_text(encoding='utf-8', errors='strict')
if "localStorage.setItem('npPets',JSON.stringify(starterPets))" in app:
    raise SystemExit('Germany production still auto-seeds starterPets')
if 'npGermanyFreshPetState' not in app:
    raise SystemExit('Germany fresh-user pet-state guard missing')
if "localStorage.setItem('npPets','[]')" not in app:
    raise SystemExit('Germany production does not initialize empty pet state')

index = (root / 'index.html').read_text(encoding='utf-8', errors='strict')
if 'class="hero6-basket hero8-basket" hidden' not in index:
    raise SystemExit('Germany homepage basket must be hidden until a pet is present')
if '<span data-active-pet-name>Milo</span>' in index:
    raise SystemExit('Germany homepage leaks demo pet Milo before hydration')

robots = (root / 'robots.txt').read_text(encoding='utf-8')
if 'Disallow: /' not in robots:
    raise SystemExit('robots.txt must block crawling during pre-launch')
if (root / 'MARKET.txt').read_text(encoding='utf-8').strip() != 'DE':
    raise SystemExit('MARKET.txt must be DE')

print(f'GERMANY QUALIFIED: {len(html_files)} HTML pages; German-only; root-flattened; canonicals correct; crawl lock intact; fresh-user state empty; critical UX sentinels present')

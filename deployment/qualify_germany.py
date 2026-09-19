#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

root = Path(sys.argv[1]).resolve()

required = [
    'index.html', 'tool.html', 'basket.html', 'pets.html', 'how-it-works.html',
    'faq.html', 'contact.html', 'privacy.html', 'imprint.html', 'terms.html', 'cookies.html',
    'assets/styles.css', 'assets/app.js', 'assets/runtime-config.js',
    'assets/noeva-core-binding.js', 'assets/noevapet-real-core-v1.js',
    '.well-known/noeva-core-binding.json',
    'robots.txt', 'VERSION.txt', 'MARKET.txt', 'LAUNCH_BLOCKERS.txt', '.htaccess'
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

# REAL CORE production binding must be explicit, credential-free and fail closed.
runtime = (root / 'assets/runtime-config.js').read_text(encoding='utf-8', errors='strict')
if 'mode:"production"' not in runtime:
    raise SystemExit('Germany runtime config is not in production mode')
for marker in (
    '/api/public/v1/noevapet/catalog',
    '/api/public/v1/noevapet/recommend',
    '/api/public/v1/noevapet/exact-product',
    '/api/public/v1/noevapet/contact',
    '/api/public/v1/noevapet/retailer-handoff',
    '/api/public/v1/noevapet/consent-event',
):
    if marker not in runtime:
        raise SystemExit(f'NoevaPet REAL CORE endpoint missing from runtime config: {marker}')
for forbidden in ('NOEVA_CORE_INTERNAL_TOKEN', 'NOEVA_CORE_API_KEY', 'Bearer ', 'password=', 'secret='):
    if forbidden in runtime:
        raise SystemExit(f'Germany runtime config leaks a protected credential marker: {forbidden}')
if 'analytics:{enabled:false' not in runtime:
    raise SystemExit('Analytics must remain disabled until an explicit provider/consent launch gate exists')
if 'affiliate:{enabled:false' not in runtime or 'rankingInfluence:false' not in runtime:
    raise SystemExit('Affiliate activation/ranking independence guard missing')

bridge = (root / 'assets/noevapet-real-core-v1.js').read_text(encoding='utf-8', errors='strict')
for marker in ('npNoevaPetRealCoreV1', 'exactProduct', 'recommend', 'consentEvent', 'retailerHandoff', 'affiliateRankingInfluence:false'):
    if marker not in bridge:
        raise SystemExit(f'NoevaPet REAL CORE bridge sentinel missing: {marker}')

blockers = (root / 'LAUNCH_BLOCKERS.txt').read_text(encoding='utf-8', errors='strict')
for marker in (
    'status=BLOCKED_UNTIL_EXTERNAL_FACTS_COMPLETE',
    'affiliate_network_activation=DISABLED_UNTIL_PARTNER_CREDENTIALS',
    'robots=NOINDEX_NOFOLLOW',
):
    if marker not in blockers:
        raise SystemExit(f'NoevaPet launch-blocker gate incomplete: {marker}')

binding = (root / '.well-known/noeva-core-binding.json').read_text(encoding='utf-8', errors='strict')
for marker in ('"core_version":"1.5.0"', '"mode":"native-core-module"', '"data_bound":true', '"affiliate_activation":false'):
    if marker not in binding:
        raise SystemExit(f'NoevaPet binding contract incomplete: {marker}')

index = (root / 'index.html').read_text(encoding='utf-8', errors='strict')
if 'class="hero6-basket hero8-basket" hidden' not in index:
    raise SystemExit('Germany homepage basket must be hidden until a pet is present')
if '<span data-active-pet-name>Milo</span>' in index:
    raise SystemExit('Germany homepage leaks demo pet Milo before hydration')

# Pet-specific surfaces cannot be entered before profile creation.
for rel in ('tool.html', 'basket.html'):
    text = (root / rel).read_text(encoding='utf-8', errors='strict')
    if 'data-noevapet-de-pet-guard' not in text or "location.replace('pets.html')" not in text:
        raise SystemExit(f'{rel}: direct-entry pet guard missing')

ht = (root / '.htaccess').read_text(encoding='utf-8')
if 'www\\.noevapet\\.de' not in ht or 'https://noevapet.de%{REQUEST_URI}' not in ht:
    raise SystemExit('.htaccess must canonicalize www.noevapet.de to noevapet.de')
if '%{HTTPS} !=on' not in ht:
    raise SystemExit('.htaccess must enforce HTTPS')

robots = (root / 'robots.txt').read_text(encoding='utf-8')
if 'Disallow: /' not in robots:
    raise SystemExit('robots.txt must block crawling during pre-launch')
if (root / 'MARKET.txt').read_text(encoding='utf-8').strip() != 'DE':
    raise SystemExit('MARKET.txt must be DE')

print(f'GERMANY QUALIFIED: {len(html_files)} HTML pages; V26 frozen UX intact; REAL CORE v1.0 data binding present; analytics/affiliate activation fail-closed; German-only; canonicals correct; crawl lock intact; pet-route guards active')

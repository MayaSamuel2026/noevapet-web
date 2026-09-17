#!/usr/bin/env python3
from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

src = Path(sys.argv[1]).resolve()
out = Path(sys.argv[2]).resolve()

if out.exists():
    shutil.rmtree(out)
out.mkdir(parents=True)

required = [src / 'de', src / 'assets']
missing = [str(p) for p in required if not p.exists()]
if missing:
    raise SystemExit('Germany build missing source paths: ' + ', '.join(missing))

# Runtime assets shared with future markets.
shutil.copytree(src / 'assets', out / 'assets')
if (src / 'site.webmanifest').exists():
    shutil.copy2(src / 'site.webmanifest', out / 'site.webmanifest')

# Flatten the German site to the canonical domain root.
for page in sorted((src / 'de').glob('*.html')):
    text = page.read_text(encoding='utf-8')

    # Germany launch is German-only: remove the EN switch from the public build.
    text = re.sub(
        r'<a\b[^>]*class=["\'][^"\']*\blang\b[^"\']*["\'][^>]*>\s*EN\s*</a>',
        '',
        text,
        flags=re.I,
    )

    # Pages move from /de/ to /, so normalize deploy-time resource references.
    text = text.replace('../assets/', 'assets/')
    text = text.replace('../site.webmanifest', 'site.webmanifest')

    # Canonical Germany URLs. Keep noindex until the commercial launch gate is passed.
    canonical = 'https://noevapet.de/' if page.name == 'index.html' else f'https://noevapet.de/{page.name}'
    canonical_tag = f'<link rel="canonical" href="{canonical}">'
    if 'rel="canonical"' in text or "rel='canonical'" in text:
        text = re.sub(r'<link\b[^>]*rel=["\']canonical["\'][^>]*>', canonical_tag, text, flags=re.I)
    else:
        text = text.replace('</head>', canonical_tag + '\n</head>', 1)

    # Defensive cleanup: the DE production build must not expose English-market links.
    text = re.sub(r'<link\b[^>]*hreflang=["\'][^"\']*["\'][^>]*>', '', text, flags=re.I)

    (out / page.name).write_text(text, encoding='utf-8')

# Pre-launch crawl lock at server level as well as meta robots.
(out / 'robots.txt').write_text('User-agent: *\nDisallow: /\n', encoding='utf-8')
(out / 'VERSION.txt').write_text('NoevaPet V26 — Germany pre-launch production shell\n', encoding='utf-8')
(out / 'MARKET.txt').write_text('DE\n', encoding='utf-8')

# German 404 without introducing a second language or a duplicate application shell.
(out / '404.html').write_text(
    '<!doctype html><html lang="de"><head><meta charset="utf-8">'
    '<meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1">'
    '<title>NoevaPet — Seite nicht gefunden</title></head><body>'
    '<main style="font-family:Arial,sans-serif;max-width:720px;margin:80px auto;padding:24px">'
    '<h1>Diese Seite gibt es nicht.</h1><p>Zurück zu NoevaPet.</p><a href="index.html">Zur Startseite</a>'
    '</main></body></html>',
    encoding='utf-8',
)

print(f'Built Germany-only production site with {len(list(out.glob("*.html")))} HTML pages')

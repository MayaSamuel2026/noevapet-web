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

# Germany production must start with a genuinely empty customer state.
# The early prototype carried Milo/Luna demo fallbacks in two pet helpers. We
# retain demo data in source/QA, but production-de must never auto-create it.
app = out / 'assets' / 'app.js'
app_text = app.read_text(encoding='utf-8')
legacy_seed = "localStorage.setItem('npPets',JSON.stringify(starterPets));\n  return starterPets;"
seed_count = app_text.count(legacy_seed)
if seed_count < 2:
    raise SystemExit(f'Expected at least two legacy starter-pet fallbacks; found {seed_count}')
app_text = app_text.replace(
    legacy_seed,
    "localStorage.setItem('npPets','[]');\n  return [];"
)

# Clean demo state that may have been written during the brief pre-launch
# validation window. Real customer-created profiles have generated IDs and are
# left untouched.
fresh_guard = r"""
// NOEVAPET DE PRODUCTION — fresh visitors begin without demo pets.
(function npGermanyFreshPetState(){
  try{
    const raw=localStorage.getItem('npPets');
    if(raw===null){
      localStorage.setItem('npPets','[]');
      localStorage.removeItem('npActivePetId');
      return;
    }
    const pets=JSON.parse(raw);
    const untouchedDemo=Array.isArray(pets) && pets.length===2 &&
      pets[0]?.id==='milo' && pets[1]?.id==='luna';
    if(untouchedDemo){
      localStorage.setItem('npPets','[]');
      localStorage.removeItem('npActivePetId');
      ['milo','luna'].forEach(id=>{
        localStorage.removeItem(`npRoutine:${id}`);
        localStorage.removeItem(`npNeeds:${id}`);
        localStorage.removeItem(`npPlan:${id}`);
      });
    }
  }catch(e){
    localStorage.setItem('npPets','[]');
    localStorage.removeItem('npActivePetId');
  }
})();
"""
# Production runtime configuration contains only public endpoints and no credentials.
runtime_config = r"""// NoevaPet Germany production runtime — public bindings only.
window.NOEVA_RUNTIME={
 mode:"production",
 endpoints:{
  catalog:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/catalog",
  recommend:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/recommend",
  exactProduct:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/exact-product",
  contact:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/contact",
  profile:null,
  retailerHandoff:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/retailer-handoff",
  affiliateEvent:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/affiliate-event",
  consentEvent:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/consent-event"
 },
 analytics:{enabled:false,provider:null,measurementId:null},
 affiliate:{enabled:false,network:null,partnerId:null,rankingInfluence:false},
 retailers:{},
 auth:{enabled:false,provider:null,persistence:"device-local"},
 legal:{operator:"NOEVA Systems e.K.",registerCourt:null,registrationNumber:null,vatId:null}
};
"""
(out / 'assets' / 'runtime-config.js').write_text(runtime_config, encoding='utf-8')

app.write_text(fresh_guard + app_text, encoding='utf-8')

# Direct Pet Match / cart URLs require a real saved pet. This runs before the
# application bundle to avoid a flash of prototype/default pet content.
pet_required_guard = """<script data-noevapet-de-pet-guard>(function(){try{var p=JSON.parse(localStorage.getItem('npPets')||'[]');var demo=Array.isArray(p)&&p.length===2&&p[0]&&p[0].id==='milo'&&p[1]&&p[1].id==='luna';if(!Array.isArray(p)||!p.length||demo){if(demo){localStorage.setItem('npPets','[]');localStorage.removeItem('npActivePetId');}location.replace('pets.html');}}catch(e){location.replace('pets.html');}})();</script>"""

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

    # Avoid a visible demo-pet flash before JavaScript hydrates the empty state.
    text = text.replace('<span data-active-pet-name>Milo</span>', '<span data-active-pet-name>Tier hinzufügen</span>')
    text = text.replace('>Warenkorb für Milo<', '>Dein Warenkorb<')
    if page.name == 'index.html':
        text = text.replace('class="hero6-basket hero8-basket"', 'class="hero6-basket hero8-basket" hidden', 1)

    # Pet Match and cart are pet-specific surfaces. Direct entry without a real
    # saved pet always returns the visitor to the profile creation page.
    if page.name in {'tool.html', 'basket.html'}:
        text = text.replace('</head>', pet_required_guard + '\n</head>', 1)

    # Canonical Germany URLs. Keep noindex until the commercial launch gate is passed.
    canonical = 'https://noevapet.de/' if page.name == 'index.html' else f'https://noevapet.de/{page.name}'
    canonical_tag = f'<link rel="canonical" href="{canonical}">'
    if 'rel="canonical"' in text or "rel='canonical'" in text:
        text = re.sub(r'<link\b[^>]*rel=["\']canonical["\'][^>]*>', canonical_tag, text, flags=re.I)
    else:
        text = text.replace('</head>', canonical_tag + '\n</head>', 1)

    # Defensive cleanup: the DE production build must not expose English-market links.
    text = re.sub(r'<link\b[^>]*hreflang=["\'][^"\']*["\'][^>]*>', '', text, flags=re.I)

    # Final live-service copy: consent is bound to CORE; analytics remains off.
    text = text.replace(
        'Diese Vorab-Version nutzt lokalen Speicher nur für die derzeitigen Funktionen. Vor dem öffentlichen Start wird die endgültige Einwilligungslogik angebunden.',
        'Notwendige lokale Speicherung hält deine Tier- und Warenkorbwahl auf diesem Gerät. Optionale Dienste werden erst nach deiner Einwilligung aktiviert.'
    )
    text = text.replace(
        'Danke. In dieser Vorschau wird noch nichts versendet; der Live-Endpunkt wird vor dem öffentlichen Start angebunden.',
        'Danke. Deine Nachricht wird sicher an NoevaPet übermittelt.'
    )
    text = text.replace(
        'Für allgemeine Anfragen wird vor dem öffentlichen Start eine zentrale Kontaktadresse aktiviert.',
        'Für allgemeine Anfragen erreichst du NoevaPet über das Kontaktformular.'
    )
    text = text.replace(
        '<div class="notice">Kontaktadresse folgt zum öffentlichen Start.</div>',
        '<div class="notice">Betreiber: NOEVA Systems e.K. · info@noevasystems.com</div>'
    )

    (out / page.name).write_text(text, encoding='utf-8')

# Canonical host + HTTPS. Hostinger shared hosting/LiteSpeed honors .htaccess.
(out / '.htaccess').write_text(
    'RewriteEngine On\n'
    'RewriteCond %{HTTPS} !=on [OR]\n'
    'RewriteCond %{HTTP_HOST} ^www\\.noevapet\\.de$ [NC]\n'
    'RewriteRule ^ https://noevapet.de%{REQUEST_URI} [R=301,L]\n',
    encoding='utf-8',
)

# Pre-launch crawl lock at server level as well as meta robots.
(out / 'robots.txt').write_text('User-agent: *\nDisallow: /\n', encoding='utf-8')
(out / 'VERSION.txt').write_text('NoevaPet V26 + REAL CORE v1.0 — Germany production candidate\n', encoding='utf-8')
(out / 'MARKET.txt').write_text('DE\n', encoding='utf-8')

# NOEVAPET REAL CORE v1.0 capability contract and integration bridge.
(out / '.well-known').mkdir(parents=True, exist_ok=True)
(out / '.well-known' / 'noeva-core-binding.json').write_text(
    '{"schema":"noeva-core-binding/v1","vertical_id":"noevapet","core_origin":"https://noeva-core.179-198-203-247.nip.io","core_version":"1.5.0","mode":"native-core-module","data_bound":true,"capabilities":["health","catalog","offers","recommend","exact-product","contact","retailer-handoff","consent-event","affiliate-event"],"affiliate_activation":false,"analytics_activation":false}\\n',
    encoding='utf-8',
)
shutil.copy2(src.parent / 'deployment' / 'noeva_core_binding.js', out / 'assets' / 'noeva-core-binding.js')
shutil.copy2(src.parent / 'deployment' / 'noevapet_real_core_v1.js', out / 'assets' / 'noevapet-real-core-v1.js')
for built_page in out.glob('*.html'):
    html = built_page.read_text(encoding='utf-8')
    inject = '<script src="assets/noeva-core-binding.js" defer></script>\\n<script src="assets/noevapet-real-core-v1.js" defer></script>\\n'
    if 'assets/noevapet-real-core-v1.js' not in html:
        html = html.replace('</head>', inject + '</head>', 1)
        built_page.write_text(html, encoding='utf-8')

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

print(f'Built Germany-only production site with {len(list(out.glob("*.html")))} HTML pages, fresh-user pet state and canonical-host guard')

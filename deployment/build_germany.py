#!/usr/bin/env python3
from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

src = Path(sys.argv[1]).resolve()
out = Path(sys.argv[2]).resolve()
deployment_dir = Path(__file__).resolve().parent

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

    # Legal/consent copy is aligned to the actual production architecture.
    # Statutory company-register/VAT facts are deliberately not guessed.
    if page.name == 'privacy.html':
        text = text.replace('Datenschutzinformationen – Vorabfassung.', 'Datenschutzinformationen.')
        text = text.replace(
            'Diese Seite ist für die Vorab-Version vollständig angelegt. Rechtliche Pflichtangaben, konkrete Dienstleister und finale Kontaktangaben müssen vor Livegang gegen die tatsächliche Produktionsumgebung geprüft werden.',
            'Hier erklären wir, welche Daten NoevaPet in der derzeitigen Produktionsarchitektur verarbeitet und welche Funktionen bewusst lokal auf deinem Gerät bleiben.'
        )
        text = text.replace(
            'Je nach Nutzung können Kontaktdaten, Angaben zu Tierprofilen, hochgeladene Tierfotos, technische Nutzungsdaten und Informationen zu ausgewählten Produkten verarbeitet werden. In dieser statischen Vorab-Version werden Tierprofile und Einkaufsplan-Demos ausschließlich lokal im Browser gespeichert.',
            'Tierprofile, Tierfotos und Einkaufsplan werden derzeit lokal im Browser auf deinem Gerät gespeichert. Wenn du das Kontaktformular nutzt oder eine Einwilligungs- beziehungsweise Händleraktion auslöst, werden die dafür erforderlichen Angaben an NOEVA CORE übermittelt und dort als technisches Ereignis verarbeitet.'
        )
        text = text.replace(
            'Die Datenverarbeitung dient insbesondere der Bereitstellung der Website, der Personalisierung des Auswahlprozesses, der Speicherung freiwilliger Tierprofile, der Kontaktaufnahme und – nach Livegang – der Messung von vermittelten Händlerbesuchen.',
            'Die Verarbeitung dient der Bereitstellung der Website, der lokalen Personalisierung des Auswahlprozesses, der Bearbeitung von Kontaktanfragen sowie der technischen Dokumentation von Einwilligungs- und Händlerweiterleitungsereignissen.'
        )
        text = text.replace(
            'Hochgeladene Fotos dienen dazu, Tierprofile persönlicher zu gestalten. Vor dem Livegang müssen Speicherort, Aufbewahrungsdauer und Löschprozess der Produktionslösung ergänzt werden.',
            'Hochgeladene Tierfotos werden für das Tierprofil verwendet und derzeit ausschließlich lokal in deinem Browser gespeichert. Sie werden von NoevaPet nicht serverseitig hochgeladen.'
        )
        text = text.replace(
            'Bei Nutzung getrackter Händlerlinks können technische Zuordnungsdaten verarbeitet werden, damit eine mögliche Vermittlungsprovision erkannt wird. Die konkreten Anbieter und Rechtsgrundlagen sind vor Livegang zu ergänzen.',
            'Beim Wechsel zu einem externen Händler kann NoevaPet ein technisches Weiterleitungsereignis speichern. Affiliate-Netzwerke und provisionsbezogenes Tracking sind derzeit nicht aktiviert. Falls solche Dienste später aktiviert werden, werden diese Informationen vor Aktivierung entsprechend ergänzt.'
        )
        text = text.replace(
            'Die Vorab-Version nutzt lokalen Browserspeicher für Demo-Funktionen. Die finale Consent-Lösung wird vor Livegang auf die tatsächlich eingesetzten Dienste abgestimmt.',
            'NoevaPet nutzt notwendigen lokalen Browserspeicher für Tierprofil, Warenkorb und Einwilligungsauswahl. Analyse-Dienste sind derzeit deaktiviert. Optionale Dienste werden nicht ohne die dafür vorgesehene Einwilligung aktiviert.'
        )
        text = text.replace(
            'Vorabfassung, 16. September 2026. Vor Produktionsfreigabe rechtlich prüfen.',
            'Stand: 19. September 2026. Die Angaben werden aktualisiert, sobald zusätzliche optionale Dienste aktiviert werden.'
        )
    elif page.name == 'cookies.html':
        text = text.replace('In dieser Vorab-Version ist das bewusst sehr wenig.', 'NoevaPet hält die technische Speicherung bewusst schlank.')
        text = text.replace('<h2>Lokaler Speicher in der Demo</h2>', '<h2>Notwendiger lokaler Speicher</h2>')
        text = text.replace(
            'Die Vorab-Version verwendet lokalen Browserspeicher, damit Tierprofile, hochgeladene Fotos, Demo-Einkaufsplan und Cookie-Auswahl beim Wechsel zwischen Seiten erhalten bleiben. Diese Daten verlassen in dieser statischen Fassung nicht den Browser.',
            'Lokaler Browserspeicher hält Tierprofile, hochgeladene Tierfotos, Einkaufsplan, Warenkorb und deine Einwilligungsauswahl auf diesem Gerät verfügbar. Tierprofile und Fotos werden derzeit nicht an NoevaPet-Server übertragen.'
        )
        text = text.replace(
            '<h2>Vor dem Livegang</h2><p>Die finale Website muss die tatsächlich eingesetzten Analyse-, Affiliate-, Sicherheits- und Komfortdienste erfassen und über die Consent-Lösung korrekt steuern.</p>',
            '<h2>Optionale Dienste</h2><p>Analyse-Dienste und Affiliate-Netzwerk-Tracking sind derzeit deaktiviert. NoevaPet speichert deine Auswahl zur Einwilligung technisch in NOEVA CORE. Werden später optionale Dienste aktiviert, wird diese Seite vor deren Aktivierung entsprechend ergänzt.</p>'
        )
    elif page.name == 'how-we-make-money.html':
        text = text.replace(
            'Wenn ein getrackter Händlerlink zu einem Kauf führt, kann NoevaPet eine Provision erhalten.',
            'NoevaPet kann künftig bei vermittelten Käufen eine Provision erhalten. Affiliate-Netzwerke sind in der aktuellen Startkonfiguration noch nicht aktiviert.'
        )
        text = text.replace(
            'Ein Affiliate-Modell kann einen Interessenkonflikt erzeugen. Deshalb muss die Logik der Empfehlung getrennt von der Vergütung bleiben. Im Live-System sollten wir Händlervergütung, Verfügbarkeit und Empfehlungslogik technisch und redaktionell klar trennen.',
            'Ein Affiliate-Modell kann einen Interessenkonflikt erzeugen. Deshalb ist die Empfehlungslogik in NOEVA CORE technisch von der Vergütung getrennt: Provisionen sind kein Ranking-Eingangssignal. Verfügbarkeit, Produktpassung, beobachtete Preise und Aktualität bleiben davon getrennt.'
        )
    elif page.name == 'terms.html':
        text = text.replace('Nutzungsbedingungen – Vorabfassung.', 'Nutzungsbedingungen.')
        text = text.replace(
            'Diese Fassung beschreibt das beabsichtigte NoevaPet-Modell und muss vor Livegang rechtlich geprüft werden.',
            'Diese Bedingungen beschreiben die Rolle von NoevaPet als Informations-, Vergleichs- und Weiterleitungsdienst.'
        )
        text = text.replace(
            '<h2>6. Stand</h2><p>Vorabfassung, 16. September 2026. Vor Produktionsfreigabe rechtlich prüfen.</p>',
            '<h2>6. Stand</h2><p>Stand: 19. September 2026.</p>'
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
(out / 'LAUNCH_BLOCKERS.txt').write_text(
    'NOEVAPET GERMANY PUBLIC-INDEXING GATE\\n'
    'status=BLOCKED_UNTIL_EXTERNAL_FACTS_COMPLETE\\n'
    'legal_register_court=PENDING_VERIFIED_OPERATOR_DATA\\n'
    'legal_registration_number=PENDING_VERIFIED_OPERATOR_DATA\\n'
    'legal_vat_id=PENDING_VERIFIED_OPERATOR_DATA\\n'
    'legal_content_responsible=PENDING_VERIFIED_OPERATOR_DATA\\n'
    'affiliate_network_activation=DISABLED_UNTIL_PARTNER_CREDENTIALS\\n'
    'analytics_activation=DISABLED\\n'
    'robots=NOINDEX_NOFOLLOW\\n',
    encoding='utf-8',
)

# NOEVAPET REAL CORE v1.0 capability contract and integration bridge.
(out / '.well-known').mkdir(parents=True, exist_ok=True)
(out / '.well-known' / 'noeva-core-binding.json').write_text(
    '{"schema":"noeva-core-binding/v1","vertical_id":"noevapet","core_origin":"https://noeva-core.179-198-203-247.nip.io","core_version":"1.5.0","mode":"native-core-module","data_bound":true,"capabilities":["health","catalog","offers","recommend","exact-product","contact","retailer-handoff","consent-event","affiliate-event"],"affiliate_activation":false,"analytics_activation":false}\\n',
    encoding='utf-8',
)
shutil.copy2(deployment_dir / 'noeva_core_binding.js', out / 'assets' / 'noeva-core-binding.js')
shutil.copy2(deployment_dir / 'noevapet_real_core_v1.js', out / 'assets' / 'noevapet-real-core-v1.js')
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

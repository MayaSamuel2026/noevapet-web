#!/usr/bin/env python3
from pathlib import Path
import sys

root = Path(sys.argv[1]).resolve()

# Root language chooser: remove obsolete deployment wording while keeping the pre-launch robots lock.
root_index = root / 'index.html'
if root_index.exists():
    text = root_index.read_text(encoding='utf-8')
    text = text.replace('<h1>NoevaPet pre-deployment</h1>', '<h1>NoevaPet</h1>')
    root_index.write_text(text, encoding='utf-8')

# Publicly visible wording must describe the actual state: deployed for validation, not yet publicly launched.
replacements = {
    'This pre-deployment build does not send yet; the live endpoint will be connected before deployment.':
        'This preview does not send yet; the live endpoint will be connected before public launch.',
    'Danke. In dieser Vorab-Version wird noch nichts versendet; der Live-Endpunkt wird vor Deployment angebunden.':
        'Danke. In dieser Vorschau wird noch nichts versendet; der Live-Endpunkt wird vor dem öffentlichen Start angebunden.',
    'This pre-deployment build only uses local storage for demo interactions. The live site should connect the final consent setup before launch.':
        'This pre-launch version only uses local storage for the current interactions. The final consent setup will be connected before public launch.',
    'Diese Vorab-Version nutzt lokalen Speicher nur für Demo-Funktionen. Vor dem Livegang wird die endgültige Einwilligungslogik angebunden.':
        'Diese Vorab-Version nutzt lokalen Speicher nur für die derzeitigen Funktionen. Vor dem öffentlichen Start wird die endgültige Einwilligungslogik angebunden.',
    '<p>The live version can use one central contact address for general enquiries.</p><div class="notice">pre-deployment@noevapet.com<br><span style="font-size:12px">Placeholder — replace before launch</span></div>':
        '<p>A central contact address will be activated before public launch.</p><div class="notice">Contact address follows for public launch.</div>',
    '<p>Für allgemeine Anfragen kann die Live-Version eine zentrale Kontaktadresse verwenden.</p><div class="notice">pre-deployment@noevapet.com<br><span style="font-size:12px">Platzhalter – vor Livegang ersetzen</span></div>':
        '<p>Für allgemeine Anfragen wird vor dem öffentlichen Start eine zentrale Kontaktadresse aktiviert.</p><div class="notice">Kontaktadresse folgt zum öffentlichen Start.</div>',
}

for path in root.rglob('*.html'):
    if any(part in {'node_modules', 'qa'} for part in path.parts):
        continue
    text = path.read_text(encoding='utf-8')
    original = text
    for old, new in replacements.items():
        text = text.replace(old, new)
    if text != original:
        path.write_text(text, encoding='utf-8')

print('Applied NoevaPet pre-launch presentation patch')

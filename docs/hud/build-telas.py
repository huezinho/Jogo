from pathlib import Path
import re

folder = Path(__file__).parent
source = (folder / 'hud-propostas.fragment.html').read_text(encoding='utf-8')
parts = (folder / 'telas-detalhadas.part.html').read_text(encoding='utf-8')
style, rest = parts.split('<!-- HERO -->')
hero, rest = rest.split('<!-- MERCENARY -->')
mercenary, script = rest.split('<!-- EXTRA_SCRIPT -->')
assets = {'HERO': re.search(r'class="actor hero" src="([^"]+)"', source)[1]}
for token, piece in [('WEAPON','weapon'),('HEAD','head'),('CHEST','chest'),('LEGS','legs'),('FEET','feet')]:
    assets[token] = re.search(r'data-piece="'+piece+r'"[^>]*><img src="([^"]+)"', source)[1]
for token, value in assets.items():
    hero = hero.replace('__'+token+'__', value)
forest = re.search(r"url\('([^']+)'\) center", source)[1]
style = style.replace('<!-- EXTRA_STYLE -->', '').replace('<style>', '<style>\n#hud-propostas .hud{--forest-art:url(\''+forest+'\')}')
source = source.replace('</style>', '</style>'+style, 1)
source = re.sub(r'<div class="page" data-screen="hero".*?(?=<div class="page" data-screen="bag")', lambda m: hero, source, count=1, flags=re.S)
source = source.replace('<div class="overlay" role="dialog"', mercenary+'<div class="overlay" role="dialog"', 1)
source = source.replace('<button data-service="mercenary">Mercenário</button>', '<button data-page="mercenary">Mercenário</button>')
source = source.replace('Componente da região', 'Pelo do Lobo Sombrio').replace('Componente secundário', 'Presa Sombria')
source = source.replace('Estudo de HUD · valores e estoques ilustrativos', 'Duas propostas · combate, equipamentos, oficina e mercenário · valores ilustrativos')
# Inject after the existing initializer so the second layout has already been cloned.
source = source.rsplit('</div>', 1)[0] + script + '</div>\n'
(folder / 'hud-telas.fragment.html').write_text(source, encoding='utf-8')
assert len(source.encode('utf-8')) < 1000000
assert not re.search(r'__[A-Z]+__', source)
print('hud-telas.fragment.html:', len(source.encode('utf-8')), 'bytes')

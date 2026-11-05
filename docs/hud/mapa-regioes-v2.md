# Mapa de regiões — versão 2

Arte final: `assets/visual/maps/region-map-v2.webp`.

Gerada com a ferramenta integrada `image_gen`, usando `assets/visual/maps/region-map.webp` como referência de estilo. A primeira alternativa, com cenários grandes ocupando toda a tela, foi descartada. A referência antiga foi preservada.

Orientação da arte final: mapa de aventura medieval sobre pergaminho envelhecido, formato vertical 2:3. Manter margens irregulares e espaços vazios de papel, rosas dos ventos discretas e pequenas paisagens pintadas em perspectiva isométrica. Evitar composição em grade, cenários ampliados preenchendo o papel, nomes, números e marcadores circulares. Representar Floresta, Caverna, Ruínas, Pântano, Vulcão, Abismo, Fortaleza, Necrópole, Cidadela, Panteão, Cataclismo e Paradoxo, com uma trilha de pequenas luzes douradas visitando todas as paisagens. A disposição assimétrica acompanha o mapa anterior, começando pela floresta embaixo e terminando no portal do Paradoxo em cima.

As áreas clicáveis são polígonos proporcionais definidos em `REGION_MAP_MARKERS`, em `assets/js/game.js`. Os mesmos polígonos são usados na viagem, no bestiário e na seleção de receitas do ferreiro. O pergaminho vazio não é uma área clicável. Os nomes e requisitos continuam nos pop-ups, ancorados no centro da paisagem correspondente.

Verificação: `node docs/qa/2026-11-05/map-regions.cjs`. Exercita as 12 seleções, pop-ups, bestiário, ferreiro, bloqueios de viagem e larguras 1366, 390 e 320 px.

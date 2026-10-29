# Artes de habilidades e equipamentos

Geração individual pela ferramenta integrada image_gen, sem montagens substituindo os ícones. O catálogo foi extraído das quatro classes em todas as rotas e níveis necessários, incluindo variações das subclasses: 59 habilidades ativas, 29 passivas e 4 ataques básicos. Cada uma tem identidade própria por classe e ID.

Há 96 equipamentos: 12 regiões × (4 peças de armadura compartilhadas pelas classes + 4 armas específicas por classe). O mesmo objeto conserva a arte ao melhorar a raridade; raridade continua indicada pela interface. Os tipos de peça e as identidades regionais são distintos. Os acessórios já possuíam artes próprias, e a bolsa e o marcador de acessório vazio foram preservados conforme solicitado.

Arquivos de produção:
- assets/visual/skills/*.webp
- assets/visual/items/sets/*.webp

Catálogo: catalogo.json. Prompts e arquivos originais de cada geração: geracao/*.json. Cópias dos originais raster são empacotadas em WebP de 256 px sem recorte ou repintura por scripts/install-arsenal-icon.py.

As artes são usadas no combate, na descrição das habilidades, no livro do personagem (incluindo passivas), na oficina, na inspeção de equipamentos e na bolsa. Equipamentos usam a mesma resolução de caminho, evitando a antiga diferença entre SVG genérico e arte da oficina. Itens em saves existentes resolvem pelo conjunto regional e tipo de peça, sem alteração de IDs ou dados de balanceamento.

Conferência: node docs/hud/arsenal/verificar.cjs. A galeria index.html permite inspecionar todas as artes geradas.

# Dungeon — jornada atual

A estrutura anterior de quatro regiões, ouro compartilhado e bênçãos foi substituída pela jornada independente pelas 12 regiões, conforme os esclarecimentos do jogador.

- [Sistema, encontros, provocação e economia](dungeon/sistema_roguelite.md)
- [Habilidades por classe](dungeon/referencia_habilidades.md)
- [Requisitos confirmados](dungeon/reformulacao_solicitada.md)
- [Validação de regras e XP](qa/dungeon-journey-validation.json)
- [Interface](qa/dungeon-journey-ui.json)
- [Cooperativo real](qa/dungeon-journey-network.json)

Módulos ativos: `dungeon-journey.js` define o percurso, serviços, inventário, moedas, trocas e provocação; `dungeon-rogue-engine.js` contém o núcleo de combate reaproveitado; `dungeon-rogue-app.js` apresenta a interface; `dungeon-campaign-skin.css` reutiliza a identidade visual da campanha. `dungeon-base-ui.js` e `dungeon-base.css` apresentam a base, os mapas clicáveis, equipamentos, comerciantes e trocas pela bolsa; [prévias e artes](hud/dungeon-base-visual.md). As evidências com nome `dungeon-rogue-*-2026-11-06` descrevem a primeira estrutura, já substituída.

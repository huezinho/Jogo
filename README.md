# RPG de turnos — campanha

Execute `python -m http.server 8000` e abra http://localhost:8000.

## Regras atuais

- O mercenário oferece contratos com recompensa fixa, visível antes de aceitar. Quantidade de abates, força do alvo, tipo do componente e distância entre regiões determinam esforço e pagamento. O quadro renova em 30 minutos; até três contratos ativos.
- O artesão tem um mapa para selecionar regiões desbloqueadas. Cada peça tem atributos definidos pelo conjunto, sem perfis selecionáveis.
- Crafting produz apenas itens comuns. O ferreiro melhora uma etapa de cada vez: comum → incomum → rara → ultrarrara → lendária, cobrando materiais e moedas em cada etapa.
- Todos os equipamentos usam o mesmo catálogo e a mesma regra de raridade; os caminhos antigos de drops e forja foram removidos. Saves passam pela normalização canônica com backup de versão.

Arena e dungeon não fazem parte desta rodada de desenvolvimento.

## Interface da campanha

A campanha usa a direção de arte de fantasia aprovada: molduras de bronze, couro, pergaminho, ícones pintados e cenários do jogo. Combate, personagem, bolsa, oficina, serviços da aldeia e contratos usam a nova navegação. Fabricar e aprimorar são abas da oficina; todos os números vêm das regras reais do jogo.

A bolsa inspeciona antes de equipar, usar ou vender. Mapas, efeitos das habilidades e histórico abrem em janelas acessíveis por toque e teclado. Os atalhos numéricos mantêm a posição das habilidades mesmo quando alguma está bloqueada.

Detalhes, capturas e validações: [implementação da HUD](docs/hud/implementacao-rpg.md). As artes recortadas ficam em `assets/visual/hud/`; `python scripts/prepare-hud-art.py` reconstrói os recortes a partir das folhas originais.

## Testes e análise

Requer Node.js, Edge e Playwright (instalado ou fornecido pelo runtime do Codex).

```powershell
node scripts/run-regressions.cjs
node scripts/run-regressions.cjs --analysis
```

A primeira opção valida regras, interface e habilidades da campanha. `--analysis` também executa as simulações de progressão e a matriz dos níveis 1–40; pode levar alguns minutos. Contextos do navegador são descartáveis.

[Análise da campanha até o nível 40](docs/analise_campanha_nivel40.md). Evidências em `docs/qa/campaign/`. Relatórios antigos retratam versões anteriores e não definem as regras atuais.

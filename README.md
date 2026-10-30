# RPG de turnos — campanha

Execute `python -m http.server 8000` e abra http://localhost:8000.

## Regras atuais

- O mercenário oferece contratos com recompensa fixa, visível antes de aceitar. Quantidade de abates, força do alvo, tipo do componente e distância entre regiões determinam esforço e pagamento. O quadro renova em 20 minutos; até três contratos ativos. Ofertas aceitas ou já recebidas deixam de aparecer na lista de disponíveis.
- O artesão tem um mapa para selecionar regiões desbloqueadas. Cada peça tem atributos definidos pelo conjunto, sem perfis selecionáveis.
- Crafting produz apenas itens comuns. Uma peça já possuída na bolsa ou equipada, mesmo aprimorada, impede fabricar outra do mesmo modelo; vender a última cópia libera a receita novamente. O ferreiro melhora uma etapa de cada vez: comum → incomum → rara → ultrarrara → lendária, cobrando materiais e moedas em cada etapa.
- Todos os equipamentos usam o mesmo catálogo e a mesma regra de raridade; os caminhos antigos de drops e forja foram removidos. Saves passam pela normalização canônica com backup de versão.
- Depois de vencer o chefe de uma região, o rastreador permite contratar uma criatura local por 15 minutos. Custa `30 + 8 × nível da criatura` moedas e eleva a chance dela para pelo menos 90%. Um novo rastreamento substitui o anterior; duração e alvo são salvos com o personagem. O desafio ao chefe fica apenas no mapa, também em telas pequenas.
- A pousada recupera vida e mana juntas pela soma dos custos individuais. No acampamento, clicar num slot permite escolher e equipar uma peça compatível da bolsa.
- Contratos do mercenário entregam a recompensa automaticamente no último abate necessário e mostram um aviso temporário de contrato concluído. Conquistas mantêm seu funcionamento anterior.
- Ao fabricar, a peça pisca em verde; a indicação de peça já possuída tem fundo verde. O peitoral exige mais moedas e materiais que a calça, incluindo componentes da criatura mais forte da região.
- Em batalha, Itens abre um painel compacto de ícones acima do botão; passar o mouse mostra o efeito e clicar usa o consumível. Poções consomem turno e reduzem as durações dos buffs já ativos; um tônico recém-aplicado mantém sua duração inicial.
- O treinador fica abaixo dos equipamentos no acampamento. Procurar inimigo mostra as chances reais dos encontros ao passar o mouse. O volume usa um slider nas configurações; o controle de velocidade da barra de vida foi removido da interface.

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

[Análise ampliada de balanceamento até o nível 70](docs/analise_balanceamento_nivel70.md): quatro classes-base, 16 especializações finais, oito distribuições de atributos, todos os 48 inimigos e avaliação de relevância das habilidades. [Evidências e reprodução](docs/qa/balance70/README.md).

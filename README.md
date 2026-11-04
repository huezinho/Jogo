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
- Ao fabricar, a peça pisca em verde; a indicação de peça já possuída tem fundo verde. O peitoral comum exige 7 materiais, incluindo componentes primários da criatura mais forte da região, e 18% mais moedas que as demais armaduras, antes do arredondamento.
- No acampamento, Descansar recupera 1% da vida máxima a cada 3 segundos, arredondado para baixo e com mínimo de 1 HP, gratuitamente. O descanso continua ao navegar, fabricar, equipar e recarregar a página; o tempo decorrido é contabilizado. Encontros e entrada em arena/dungeon ficam bloqueados até voltar ao acampamento e clicar em Levantar. Vida cheia não encerra o descanso automaticamente.
- Em batalha, Itens abre um painel compacto de ícones acima do botão; passar o mouse mostra o efeito e clicar usa o consumível. Poções consomem turno e reduzem as durações dos buffs já ativos; um tônico recém-aplicado mantém sua duração inicial.
- O treinador fica abaixo dos equipamentos no acampamento. Procurar inimigo mostra as chances reais dos encontros ao passar o mouse. O volume usa um slider nas configurações; o controle de velocidade da barra de vida foi removido da interface.
- Todos os pontos já investidos usam o valor por ponto do nível atual, tanto nos atributos permanentes quanto no poder de habilidade de Força. Subir nível, carregar o save e redistribuir no treinador seguem a mesma regra; a migração guarda uma cópia do save anterior. Equipamentos mostra Força, Vitalidade e Sabedoria em três quadros coloridos com a quantidade de pontos.
- Explodir aplica seu dano calculado ao inimigo, respeitando armadura/escudo e os custos de vida e mana.

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

[Habilidades de todas as classes](docs/referencia_habilidades_atual.md): fórmulas matemáticas, incógnitas, custos e condições de cada classe/subclasse.

[Inimigos e chefes atuais](docs/inimigos_e_chefes_atual.md), [regras do Mago](docs/balanceamento/mago_2026-11-04.md) e [regras dos inimigos e DOTs](docs/balanceamento/inimigos_2026-11-04.md).

Análises com os inimigos reformulados: [Guerreiro e Arqueiro](docs/analise_guerreiro_arqueiro_inimigos_2026-11-04.md) e [Mago](docs/analise_mago_2026-11-04.md). As análises documentam a preparação artificial e as limitações das builds.

[Equipamentos e custos](docs/equipamentos_balanceamento_2026-11-03.md). [Testes e reprodução](docs/qa/README.md).

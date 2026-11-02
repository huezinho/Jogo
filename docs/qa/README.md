# Evidências de QA

A suíte ativa da campanha está em `campaign/`. Execute `node scripts/run-regressions.cjs` na raiz; use `--analysis` para repetir a progressão e a matriz 1–40.

`campaign/contracts-ui.cjs` verifica a entrega automática de contratos pelo fluxo de vitória, persistência sem recompensa duplicada, receitas de peitoral, feedback verde, treinador, consumíveis rápidos e tooltips em 1366/390/320 px, além do slider de volume. `campaign/services.cjs` cobre os serviços, rastreamento e consumo de turnos das poções.

`campaign/camp-rest.cjs` cobre a cura a cada 3 segundos, tempo parcial e acumulado, navegação e ações durante o descanso, persistência, limite de vida, bloqueio de combate e retorno ao acampamento ao acessar arena/dungeon diretamente. Também verifica as receitas moderadas de peitoral nas 12 regiões e o botão de descanso em 1366/390/320 px.

`campaign/investments.cjs` percorre as 396 transições de nível das quatro classes, confere a equivalência com o treinador, migração de ganhos históricos, backup/reload sem duplicação, perfis de rede e os três quadros de pontos em 1366/390/320 px. Também verifica Explodir pela execução local e pelo turno real, custos, absorção por armadura/escudo e bloqueio por falta de recursos.

As pastas `2026-10-27` e `2026-10-28` são evidências históricas da análise e da primeira implementação. Alguns testes nelas pressupõem perfis ou fabricação por raridade, regras substituídas. Não representam a especificação atual e não fazem parte do runner da campanha. Os testes de arena/dungeon permanecem arquivados sem revisão nesta rodada.

`balance70/` contém a análise ampliada de 30/10/2026, com progressões até 70, confronto das 16 especializações com todos os inimigos, checkpoints, equipamentos, rotações e ablação das habilidades. A suíte possui [instruções próprias](balance70/README.md) e não altera as regras do jogo.

`skills-formulas/` contém a auditoria atual de custos, dano, efeitos condicionais e janelas de preparo, com 28 formas e níveis legais até 100. Gera o catálogo separado por classe/subclasse e verifica numericamente as expressões de custos e danos contra o runtime. Veja as [instruções](skills-formulas/README.md); as sugestões de balanceamento ficam em documento separado e não são aplicadas ao combate.

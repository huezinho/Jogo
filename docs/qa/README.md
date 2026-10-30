# Evidências de QA

A suíte ativa da campanha está em `campaign/`. Execute `node scripts/run-regressions.cjs` na raiz; use `--analysis` para repetir a progressão e a matriz 1–40.

`campaign/contracts-ui.cjs` verifica a entrega automática de contratos pelo fluxo de vitória, persistência sem recompensa duplicada, receitas de peitoral, feedback verde, treinador, consumíveis rápidos e tooltips em 1366/390/320 px, além do slider de volume. `campaign/services.cjs` cobre os serviços, rastreamento e consumo de turnos das poções.

As pastas `2026-10-27` e `2026-10-28` são evidências históricas da análise e da primeira implementação. Alguns testes nelas pressupõem perfis ou fabricação por raridade, regras substituídas. Não representam a especificação atual e não fazem parte do runner da campanha. Os testes de arena/dungeon permanecem arquivados sem revisão nesta rodada.

`balance70/` contém a análise ampliada de 30/10/2026, com progressões até 70, confronto das 16 especializações com todos os inimigos, checkpoints, equipamentos, rotações e ablação das habilidades. A suíte possui [instruções próprias](balance70/README.md) e não altera as regras do jogo.

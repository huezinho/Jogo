# Evidências de QA

A suíte ativa da campanha está em `campaign/`. Execute `node scripts/run-regressions.cjs` na raiz; use `--analysis` para repetir a progressão e a matriz 1–40.

`campaign/contracts-ui.cjs` verifica a entrega automática de contratos pelo fluxo de vitória, persistência sem recompensa duplicada, receitas de peitoral, feedback verde, treinador, consumíveis rápidos e tooltips em 1366/390/320 px, além do slider de volume. `campaign/services.cjs` cobre os serviços, rastreamento e consumo de turnos das poções.

`campaign/camp-rest.cjs` cobre a cura a cada 3 segundos, tempo parcial e acumulado, navegação e ações durante o descanso, persistência, limite de vida, bloqueio de combate e retorno ao acampamento ao acessar arena/dungeon diretamente. Também verifica as receitas moderadas de peitoral nas 12 regiões e o botão de descanso em 1366/390/320 px.

`campaign/investments.cjs` percorre as 396 transições de nível das quatro classes, confere a equivalência com o treinador, migração de ganhos históricos, backup/reload sem duplicação, perfis de rede e os três quadros de pontos em 1366/390/320 px. Também verifica Explodir pela execução local e pelo turno real, custos, absorção por armadura/escudo e bloqueio por falta de recursos.

As pastas `2026-10-27` e `2026-10-28` são evidências históricas da análise e da primeira implementação. Alguns testes nelas pressupõem perfis ou fabricação por raridade, regras substituídas. Não representam a especificação atual e não fazem parte do runner da campanha. Os testes de arena/dungeon permanecem arquivados sem revisão nesta rodada.

## Análises e referências atuais

- `revised-progression-2026-11-04/`: campanhas de Guerreiro/Arqueiro com os inimigos novos; resultados principais, controle de estratégia e resumo CSV.
- `mage-progression/`: campanhas aceleradas do Mago com os inimigos novos.
- `enemy-catalog.json`: atributos e habilidades dos inimigos atuais.
- `2026-10-28/skills-reference.json`: dados atuais de habilidades, regenerados junto à referência matemática.

Reprodução na raiz:

```sh
node scripts/generate-skill-reference.cjs
node scripts/export-enemy-catalog.cjs
node scripts/run-revised-progression.cjs
python3 scripts/generate-revised-progression-report.py
node scripts/run-mage-progression.cjs
```

As pastas antigas de balanceamento até 70, catálogos anteriores e progressões anteriores à reformulação dos inimigos foram removidas. Os utilitários de navegador e fixtures de `2026-10-27/` permanecem porque as suítes atuais os importam. A opção histórica `--analysis` do runner da campanha cobre seu recorte antigo de progressão; use os scripts acima para os relatórios atuais.

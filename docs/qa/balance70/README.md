# Análise PvE solo, níveis 1–70

Relatório: [../../analise_balanceamento_nivel70.md](../../analise_balanceamento_nivel70.md).

Requer Node, Python, Edge e o Playwright usado por `../2026-10-27/smoke.cjs`. O runner abre contextos descartáveis e carrega as regras atuais do projeto. Não usa saves reais. O combate usa o motor nativo; somente apresentação, espera e persistência são desativadas.

Execute da raiz, na ordem:

```powershell
node docs/qa/balance70/run.cjs discovery
node docs/qa/balance70/run.cjs checkpoints
node docs/qa/balance70/run.cjs validate
node docs/qa/balance70/run.cjs equipment
node docs/qa/balance70/run.cjs ablation
node docs/qa/balance70/run.cjs rotations
node docs/qa/balance70/run.cjs probes
node docs/qa/balance70/run.cjs audit
node docs/qa/balance70/run.cjs mechanics
node docs/qa/balance70/run.cjs journey
node docs/qa/balance70/run.cjs journey-checks
node docs/qa/balance70/run.cjs earned
node docs/qa/balance70/run.cjs frontier
python docs/qa/balance70/summarize.py
python docs/qa/balance70/report.py
node docs/qa/balance70/verify.cjs
```

O runner retoma arquivos existentes. Para recomputar dados, use uma nova cópia deste diretório contendo somente os fontes `.js`, `.cjs` e `.py`, sem JSONs/CSVs gerados. Não misture resultados de versões diferentes das regras. `verify.cjs` verifica os hashes registrados na sondagem inicial, cobertura e invariantes dos resultados.

A progressão `journey` e os checkpoints `journey-checks` também aceitam `warrior`, `mage`, `archer` ou `nature` como terceiro argumento. Essas partições são disjuntas e podem rodar em processos independentes. Não execute duas partições iguais simultaneamente.

## Evidência principal

- `metadata.json`: formas, builds, catálogo, inimigos e hashes de produção.
- `discovery-*`: nível70, oito builds, quatro estilos, 48 inimigos, três sementes.
- `validation-*`: candidato por forma, sem itens, 30 sementes novas por inimigo.
- `equipment-*`: nova seleção com cinco peças comuns da Fortaleza, com validação30.
- `checkpoints-*`: cada nível1–70, formas legalmente disponíveis, sem itens.
- `ablation-*`: ativa retirada ou usada na abertura; mesma configuração da validação principal.
- `rotations-*`: dois combos específicos do70 por forma; nova validação quando a sondagem melhora. Reaproveita as sementes de validação, portanto não é novo holdout.
- `journey-*` (exceto `journey-levels-*`): **progressão principal**. Oito builds × duas sementes ×16 finais. Farm recua depois de falhar. Um limite100 com herói vivo encerra a trajetória; não concede cura/respawn gratuito.
- `journey-levels-*`: checkpoints com equipamentos realmente existentes no início de cada nível da trajetória. Não extrapolam níveis não atingidos.
- `earned-*` (exceto `earned-levels-*`): sondagem preliminar de fronteira com equipamento conquistado e a política usada no farm; validação20001–20030.
- `frontier-*`: fronteira ampliada com equipamento conquistado e sete estilos. Seleção com três sementes por chefe, validação independente30001–30030. É o quadro principal de avanço com equipamento obtido.
- `probes.json`, `audit.json`, `mechanics.json`: sondagens de habilidades/passivas/conjuntos e diagnósticos de ordem de resolução.
- `summary.json`, `*.csv`: agregações legíveis, sem novas regras de combate.
- `verification.json`: integridade das evidências finais.

## Experimentos exploratórios substituídos

Os arquivos `campaign-*`, `earned-levels-*`, `pilot.json` e `clone-parity.json`, se presentes, são experimentos preparatórios, **excluídos das contagens e tabelas principais**. O controlador antigo repetia alvos ruins e tratava interrupção100 como falha seguida de reinício de recursos. Isso não equivale a uma morte real. A versão principal `journey` distingue morte de limite sem resolução e não continua após esse limite. As diferenças entre os controladores não devem ser interpretadas como mudanças nos coeficientes do jogo.

O compartilhamento de inventário/contratos nas cópias hipotéticas do avaliador foi comparado à cópia completa numa progressão de750 combates, sem diferença no resultado. `--full-clone` desativa essa otimização; nenhum dos dois campos é alterado durante sondagens de ação.

Habilidades do80, coop online e PvP não entram no ranking do70. Todas as taxas são resultados das configurações e políticas descritas, não estimativas da população de jogadores nem prova de estratégia ótima.

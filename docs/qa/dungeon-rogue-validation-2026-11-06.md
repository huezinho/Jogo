# Validação histórica da primeira dungeon — 06/11/2026

Esta evidência descreve a estrutura anterior. A [jornada atual](dungeon-journey-validation.md) substitui quatro regiões, ouro compartilhado e memórias por 12 regiões, carteiras individuais e XP.

| Suíte | Resultado observado |
|---|---|
| `node scripts/test-dungeon-rogue.cjs` | 514 verificações; 129 lançamentos em 28 classes/subclasses; 18 jornadas concluídas por vitória ou derrota, sem travamentos ou estados numéricos inválidos |
| `node scripts/qa-dungeon-rogue-ui.cjs` | 24 combinações de sala/largura; criação independente, seleção/confirmação de alvo, todos os encontros, 28 formas visuais, retomada, memória contabilizada uma vez e dados da campanha preservados |
| `node scripts/test-dungeon-rogue-network.cjs` | 12 verificações com três navegadores isolados em conexões PeerJS/WebRTC reais, incluindo autoridade, replay, desconexão, reconexão e igualdade dos estados |
| `node scripts/test-warrior-balance.cjs` | 126 verificações de mecânica e quatro verificações de UI/salvamento |
| `node scripts/test-mage-balance.cjs` | 99 verificações de fórmulas/contadores, além de salvamento e interface |
| `node scripts/test-archer-balance.cjs` | 83 verificações de mecânica, efeitos persistidos, rastreio e interface |
| `node scripts/test-w14-dungeon.cjs` | 19 verificações de custos W, crítico, fórmulas e sangramento; entrada independente no computador/celular |
| `node docs/qa/hud/verify.cjs` | 50 telas e dez fluxos da campanha; zero erros de JavaScript e zero respostas de imagem/asset ausente |

Evidências estruturadas: [combate e jornadas](dungeon-rogue-tests-2026-11-06.json), [interface e salvamento](dungeon-rogue-ui-2026-11-06.json), [rede real](dungeon-rogue-network-2026-11-06.json).

Capturas: [entrada](../hud/dungeon-rogue-lobby-1366.png), [combate com níveis e recursos reais da expedição](../hud/dungeon-rogue-preview-1366.png), [celular](../hud/dungeon-rogue-preview-390.png), [santuário](../hud/dungeon-rogue-sanctuary-1366.png).

As jornadas usam três sementes e seis composições: as quatro classes solo e dois trios. A política escolhe ações por uma estimativa simples de dano/sustentação. São testes de integração e encerramento, não uma prova de equilíbrio definitivo ou de estratégia ótima.

As verificações da campanha precisaram alinhar três expectativas antigas aos requisitos já adotados pelo jogo: prévia dos conjuntos de todas as regiões, assinatura do contrato escolhido entre várias ofertas e clique no centro da região desenhada do mapa (a caixa do botão abrange o mapa inteiro e é recortada por polígono). Nenhuma dessas adequações altera as regras da campanha.

Também foi corrigido o retorno com campanha em andamento: a renderização inicial usa a descrição base se o módulo de descrições detalhadas ainda estiver carregando. O teste abre a dungeon a partir de um combate salvo e retorna pelo botão Campanha, sem consumir seus recursos.

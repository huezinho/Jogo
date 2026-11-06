# Reavaliação da progressão — 06/11/2026

192 campanhas: 16 especializações × três sementes (101, 202, 303) × antes/depois × dois cenários de equipamento. Antes usa os quatro arquivos de mecânica do commit 03e74b1; depois usa as habilidades, IA, equipamentos e crítico universais atuais. A régua continua sendo o alcance da maioria, não a obrigação de concluir o jogo.

## Método e limites

Motor real do jogo, atributos equilibrados, política heurística de habilidades compartilhada entre versões. As alterações de habilidades e IA da rodada anterior já estão presentes em ambos os lados. Sem poções, torre, dungeon ou arena. Recuperação completa entre lutas. Cada derrota/fuga oferece um nível até 100; falhas repetidas melhoram uma peça. A campanha termina ao vencer o último chefe ou acumular 11 mortes já no nível 100 com seis lendários. Não mede tempo de farm nem custo real da preparação. Três sementes são uma amostra pequena, e mudanças nos críticos alteram a sequência de RNG: diferenças descritivas, sem isolamento causal de cada ajuste.

Referência: conserva o equipamento inicial Floresta/Caverna ao melhorar, com acessório da Floresta. Conjuntos por rota: nas preparações, troca gratuitamente as peças já existentes pelo conjunto preferido liberado, preservando raridade e acessório; não cria espaços antes vazios. Essa concessão existe igualmente antes/depois e serve para comparar sinergias, não para simular economia. A escolha é pré-definida, não uma busca pelo melhor conjunto ou rotação. Ganhar poder não garante uma trajetória de RNG mais favorável.

## Referência

Antes: 14430 lutas; 4160 mortes; 7/48 conclusões; 23/48 chegaram ao Paradoxo; mediana da região 11.0 de 12.

Depois: 13870 lutas; 4162 mortes; 7/48 conclusões; 23/48 chegaram ao Paradoxo; mediana da região 11.0 de 12.

| Especialização | Antes: parada (campanhas) | Depois: parada (campanhas) | Mortes medianas antes → depois | Nível final mediano depois |
|---|---|---|---:|---:|
| Paladino | Cataclismo (3/3) | Cataclismo (3/3) | 87 → 82 | 100 |
| Berserker | Cataclismo (3/3) | Cataclismo (3/3) | 88 → 82 | 100 |
| Samurai | Panteao (3/3) | Panteao (3/3) | 88 → 85 | 100 |
| Ninja | Concluiu (1/3); Panteao (1/3); Cataclismo (1/3) | Cataclismo (1/3); Paradoxo (2/3) | 85 → 83 | 100 |
| Sniper | Concluiu (3/3) | Concluiu (3/3) | 70 → 69 | 85 |
| Atirador Arcano | Concluiu (3/3) | Concluiu (3/3) | 71 → 69 | 84 |
| Espreitador | Paradoxo (3/3) | Paradoxo (3/3) | 87 → 89 | 100 |
| Guarda Florestal | Paradoxo (3/3) | Paradoxo (3/3) | 84 → 89 | 100 |
| Incendiário | Paradoxo (3/3) | Paradoxo (2/3); Concluiu (1/3) | 94 → 90 | 100 |
| Frígido | Cataclismo (2/3); Paradoxo (1/3) | Cataclismo (3/3) | 95 → 90 | 100 |
| Arquimago | Cataclismo (3/3) | Cataclismo (3/3) | 92 → 94 | 100 |
| Corrompido | Paradoxo (3/3) | Paradoxo (3/3) | 93 → 95 | 100 |
| Druida Sombrio | Panteao (3/3) | Panteao (2/3); Cataclismo (1/3) | 89 → 97 | 100 |
| Avatar da Natureza | Panteao (3/3) | Panteao (3/3) | 88 → 97 | 100 |
| Fada Monarca | Paradoxo (3/3) | Paradoxo (3/3) | 88 → 93 | 100 |
| Protetor da Floresta | Cataclismo (3/3) | Cataclismo (3/3) | 86 → 93 | 100 |

### Gargalos após as mudanças

- Paladino: Deus da Ruina: 110 derrotas; Avatar do Zenith: 40 derrotas; Carrasco de Guerra: 35 derrotas.
- Berserker: Deus da Ruina: 74 derrotas; Avatar do Zenith: 39 derrotas; Carrasco de Guerra: 36 derrotas.
- Samurai: Avatar do Zenith: 87 derrotas; Colosso do Vazio: 30 derrotas; General de Aco: 21 derrotas.
- Ninja: Avatar do Zenith: 67 derrotas; Colosso do Vazio: 30 derrotas; Deus da Ruina: 24 derrotas.
- Sniper: Colosso do Vazio: 27 derrotas; Avatar do Zenith: 26 derrotas; General de Aco: 24 derrotas.
- Atirador Arcano: Colosso do Vazio: 27 derrotas; Soberano do Paradoxo: 21 derrotas; Avatar do Zenith: 19 derrotas.
- Espreitador: Avatar do Zenith: 89 derrotas; Colosso do Vazio: 39 derrotas; Oraculo do Zero: 17 derrotas.
- Guarda Florestal: Oraculo do Zero: 66 derrotas; Colosso do Vazio: 39 derrotas; Avatar do Zenith: 21 derrotas.
- Incendiário: Carrasco de Guerra: 52 derrotas; Avatar do Zenith: 47 derrotas; Titan Rachado: 34 derrotas.
- Frígido: Carrasco de Guerra: 58 derrotas; Deus da Ruina: 49 derrotas; Avatar do Zenith: 45 derrotas.
- Arquimago: Avatar do Zenith: 73 derrotas; Deus da Ruina: 64 derrotas; General de Aco: 50 derrotas.
- Corrompido: Soberano do Paradoxo: 76 derrotas; General de Aco: 50 derrotas; Avatar do Zenith: 35 derrotas.
- Druida Sombrio: Avatar do Zenith: 89 derrotas; Lorde da Cripta: 31 derrotas; Carrasco de Guerra: 26 derrotas.
- Avatar da Natureza: Avatar do Zenith: 98 derrotas; Lorde da Cripta: 46 derrotas; Carrasco de Guerra: 26 derrotas.
- Fada Monarca: Soberano do Paradoxo: 87 derrotas; Colosso do Vazio: 33 derrotas; Avatar do Zenith: 32 derrotas.
- Protetor da Floresta: Deus da Ruina: 86 derrotas; Avatar do Zenith: 39 derrotas; Colosso do Vazio: 33 derrotas.

## Conjuntos por rota

Antes: 14390 lutas; 4143 mortes; 6/48 conclusões; 22/48 chegaram ao Paradoxo; mediana da região 11.0 de 12.

Depois: 14682 lutas; 4204 mortes; 6/48 conclusões; 22/48 chegaram ao Paradoxo; mediana da região 11.0 de 12.

| Especialização | Antes: parada (campanhas) | Depois: parada (campanhas) | Mortes medianas antes → depois | Nível final mediano depois |
|---|---|---|---:|---:|
| Paladino | Cataclismo (3/3) | Cataclismo (3/3) | 85 → 83 | 100 |
| Berserker | Cataclismo (3/3) | Cataclismo (3/3) | 85 → 84 | 100 |
| Samurai | Panteao (3/3) | Panteao (2/3); Cataclismo (1/3) | 86 → 86 | 100 |
| Ninja | Panteao (1/3); Paradoxo (1/3); Cataclismo (1/3) | Paradoxo (2/3); Panteao (1/3) | 85 → 87 | 100 |
| Sniper | Concluiu (3/3) | Concluiu (3/3) | 68 → 67 | 91 |
| Atirador Arcano | Concluiu (3/3) | Concluiu (3/3) | 72 → 69 | 84 |
| Espreitador | Paradoxo (3/3) | Paradoxo (3/3) | 91 → 91 | 100 |
| Guarda Florestal | Paradoxo (3/3) | Paradoxo (3/3) | 90 → 94 | 100 |
| Incendiário | Paradoxo (3/3) | Paradoxo (3/3) | 96 → 99 | 100 |
| Frígido | Paradoxo (1/3); Cataclismo (2/3) | Cataclismo (3/3) | 92 → 94 | 100 |
| Arquimago | Panteao (3/3) | Panteao (3/3) | 95 → 94 | 100 |
| Corrompido | Cataclismo (3/3) | Cataclismo (3/3) | 94 → 94 | 100 |
| Druida Sombrio | Panteao (3/3) | Panteao (2/3); Cataclismo (1/3) | 91 → 96 | 100 |
| Avatar da Natureza | Panteao (3/3) | Panteao (3/3) | 90 → 95 | 100 |
| Fada Monarca | Paradoxo (3/3) | Paradoxo (3/3) | 89 → 93 | 100 |
| Protetor da Floresta | Paradoxo (2/3); Cataclismo (1/3) | Cataclismo (1/3); Paradoxo (2/3) | 88 → 84 | 100 |

### Gargalos após as mudanças

- Paladino: Deus da Ruina: 119 derrotas; Carrasco de Guerra: 42 derrotas; Colosso do Vazio: 33 derrotas.
- Berserker: Deus da Ruina: 79 derrotas; Carrasco de Guerra: 44 derrotas; Colosso do Vazio: 33 derrotas.
- Samurai: Avatar do Zenith: 51 derrotas; Draco Magmatico: 29 derrotas; Anjo Caido: 25 derrotas.
- Ninja: Avatar do Zenith: 62 derrotas; Draco Magmatico: 29 derrotas; General de Aco: 23 derrotas.
- Sniper: Colosso do Vazio: 27 derrotas; General de Aco: 22 derrotas; Guardiao Temporal: 19 derrotas.
- Atirador Arcano: Colosso do Vazio: 27 derrotas; General de Aco: 22 derrotas; Arauto do Cataclismo: 20 derrotas.
- Espreitador: Avatar do Zenith: 75 derrotas; Colosso do Vazio: 37 derrotas; Oraculo do Zero: 28 derrotas.
- Guarda Florestal: Oraculo do Zero: 61 derrotas; Colosso do Vazio: 37 derrotas; General de Aco: 23 derrotas.
- Incendiário: Titan Rachado: 60 derrotas; Avatar do Zenith: 41 derrotas; Carrasco de Guerra: 27 derrotas.
- Frígido: Deus da Ruina: 93 derrotas; Carrasco de Guerra: 39 derrotas; Avatar do Zenith: 32 derrotas.
- Arquimago: Avatar do Zenith: 120 derrotas; Slime Toxico: 16 derrotas; Fenix Sombria: 15 derrotas.
- Corrompido: Deus da Ruina: 95 derrotas; Avatar do Zenith: 52 derrotas; Slime Toxico: 16 derrotas.
- Druida Sombrio: Avatar do Zenith: 97 derrotas; Lorde da Cripta: 44 derrotas; General de Aco: 19 derrotas.
- Avatar da Natureza: Avatar do Zenith: 93 derrotas; Lorde da Cripta: 60 derrotas; General de Aco: 19 derrotas.
- Fada Monarca: Soberano do Paradoxo: 86 derrotas; Avatar do Zenith: 46 derrotas; Colosso do Vazio: 30 derrotas.
- Protetor da Floresta: Carrasco de Guerra: 57 derrotas; Soberano do Paradoxo: 42 derrotas; Colosso do Vazio: 34 derrotas.

## Leitura dos resultados

Sniper e Atirador Arcano seguem acima das outras rotas nesta preparação: concluíram as três campanhas nos dois cenários depois das mudanças. O acesso universal ao crítico não eliminou essa diferença.

Samurai segue como prioridade de investigação: duas campanhas com conjunto por rota ainda param no Panteão, e uma alcança Cataclismo; na referência, as três param no Panteão. O novo sangramento não foi suficiente para assegurar o alcance majoritário nesta política. Paladino e Berserker continuam no Cataclismo nos dois cenários.

Incendiário deixou de ser um caso de conclusão precoce generalizada: na referência concluiu uma campanha; com a seleção pré-definida de conjuntos não concluiu nenhuma. Corrompido alcançou Paradoxo nas três campanhas de referência, mas ficou no Cataclismo nas três com conjunto por rota. Isso reforça que não se deve considerar a seleção proposta de conjuntos como otimizada.

Frígido e Arquimago merecem revisão da rotação e da sobrevivência no Cataclismo/Panteão. Ninja tem resultados variáveis; Espreitador e Guarda Florestal chegam ao Paradoxo consistentemente sem concluir. Essa ausência de conclusão, sozinha, não justifica buffs. A linha Natureza foi executada como cobertura adicional das mudanças universais; permanece separada da prioridade de balanceamento das três linhas anteriores.

Próxima investigação: comparar outras rotações e conjuntos para Samurai, Paladino, Berserker, Frígido e Arquimago; medir habilidade escolhida, causa da morte e HP restante do chefe. Não aumentar globalmente os equipamentos ou reduzir todos os chefes com base apenas nessas três sementes.

## Reprodução e evidências

- `node scripts/run-progression-2026-11-06.cjs`
- `node scripts/run-progression-sets-2026-11-06.cjs`
- Resumo: `docs/qa/progression-summary-2026-11-06.csv`.
- Evidências completas: `results.json.gz` nas duas pastas de QA, com encontros, níveis, equipamentos, mortes e uso de habilidades.


## Ressalva posterior sobre a política do Samurai

Ao revisar as sugestões de balanceamento, foi identificado que `warriorAction` avalia `bleedPercent`, mas não inclui `bleedMaxHpPercent` no valor esperado de Golpes Velozes. Nos três resultados atuais com conjuntos por rota, essa habilidade não foi selecionada nenhuma vez. Portanto, o bloqueio observado não demonstra que o novo sangramento de 5% é insuficiente; as conclusões sobre aumentar dano do Samurai devem ficar suspensas até corrigir a política e repetir os testes. Os resultados acima continuam sendo registros válidos da política executada, não da melhor rotação disponível.

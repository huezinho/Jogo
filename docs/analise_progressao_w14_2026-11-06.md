# Reavaliação da progressão — 06/11/2026

> Recorte histórico: estas simulações precedem a revisão de turnos e sangramentos v5. Golpes Velozes do Samurai agora aplica sangramento por golpe e Corte Profundo usa 30% nas duas subclasses; este relatório não foi recalculado para essas alterações.

192 campanhas: 16 especializações × três sementes (101, 202, 303) × antes/depois × dois cenários de equipamento. Antes usa os quatro arquivos de mecânica do commit 601d32f; depois usa as habilidades, IA, equipamentos e crítico universais atuais. A régua continua sendo o alcance da maioria, não a obrigação de concluir o jogo.

## Método e limites

Motor real do jogo, atributos equilibrados, política heurística de habilidades compartilhada entre versões. A política foi corrigida para incluir os 5% da vida máxima por turno de Golpes Velozes ao avaliar a ação, tanto antes quanto depois. Isso impede atribuir a melhora de uma rotação corrigida apenas aos novos coeficientes. A IA inimiga e os conjuntos da rodada anterior estão presentes em ambos os lados. Sem poções, torre, dungeon ou arena. Recuperação completa entre lutas. Cada derrota/fuga oferece um nível até 100; falhas repetidas melhoram uma peça. A campanha termina ao vencer o último chefe ou acumular 11 mortes já no nível 100 com seis lendários. Não mede tempo de farm nem custo real da preparação. Três sementes são uma amostra pequena, e mudanças nos críticos alteram a sequência de RNG: diferenças descritivas, sem isolamento causal de cada ajuste.

Referência: conserva o equipamento inicial Floresta/Caverna ao melhorar, com acessório da Floresta. Conjuntos por rota: nas preparações, troca gratuitamente as peças já existentes pelo conjunto preferido liberado, preservando raridade e acessório; não cria espaços antes vazios. Essa concessão existe igualmente antes/depois e serve para comparar sinergias, não para simular economia. A escolha é pré-definida, não uma busca pelo melhor conjunto ou rotação. Ganhar poder não garante uma trajetória de RNG mais favorável.

## Referência

Antes: 13845 lutas; 4161 mortes; 7/48 conclusões; 23/48 chegaram ao Paradoxo; mediana da região 11.0 de 12.

Depois: 13697 lutas; 4185 mortes; 8/48 conclusões; 23/48 chegaram ao Paradoxo; mediana da região 11.0 de 12.

| Especialização | Antes: parada (campanhas) | Depois: parada (campanhas) | Mortes medianas antes → depois | Nível final mediano depois |
|---|---|---|---:|---:|
| Paladino | Cataclismo (3/3) | Cataclismo (3/3) | 82 → 86 | 100 |
| Berserker | Cataclismo (3/3) | Cataclismo (3/3) | 82 → 86 | 100 |
| Samurai | Panteao (3/3) | Panteao (2/3); Cataclismo (1/3) | 84 → 86 | 100 |
| Ninja | Cataclismo (1/3); Paradoxo (2/3) | Cataclismo (1/3); Paradoxo (1/3); Concluiu (1/3) | 83 → 84 | 100 |
| Sniper | Concluiu (3/3) | Concluiu (3/3) | 69 → 63 | 85 |
| Atirador Arcano | Concluiu (3/3) | Concluiu (3/3) | 69 → 67 | 88 |
| Espreitador | Paradoxo (3/3) | Paradoxo (3/3) | 89 → 89 | 100 |
| Guarda Florestal | Paradoxo (3/3) | Paradoxo (3/3) | 89 → 89 | 100 |
| Incendiário | Paradoxo (2/3); Concluiu (1/3) | Paradoxo (3/3) | 90 → 95 | 100 |
| Frígido | Cataclismo (3/3) | Cataclismo (3/3) | 90 → 94 | 100 |
| Arquimago | Cataclismo (3/3) | Cataclismo (3/3) | 94 → 94 | 100 |
| Corrompido | Paradoxo (3/3) | Concluiu (1/3); Paradoxo (2/3) | 95 → 95 | 100 |
| Druida Sombrio | Panteao (2/3); Cataclismo (1/3) | Panteao (2/3); Cataclismo (1/3) | 97 → 97 | 100 |
| Avatar da Natureza | Panteao (3/3) | Panteao (3/3) | 97 → 97 | 100 |
| Fada Monarca | Paradoxo (3/3) | Paradoxo (3/3) | 93 → 93 | 100 |
| Protetor da Floresta | Cataclismo (3/3) | Cataclismo (3/3) | 93 → 93 | 100 |

### Gargalos após as mudanças

- Paladino: Deus da Ruina: 113 derrotas; Colosso do Vazio: 42 derrotas; Carrasco de Guerra: 37 derrotas.
- Berserker: Deus da Ruina: 72 derrotas; Avatar do Zenith: 46 derrotas; Colosso do Vazio: 42 derrotas.
- Samurai: Avatar do Zenith: 82 derrotas; Colosso do Vazio: 31 derrotas; Guardiao Aureo: 23 derrotas.
- Ninja: Deus da Ruina: 36 derrotas; Colosso do Vazio: 31 derrotas; Avatar do Zenith: 29 derrotas.
- Sniper: Avatar do Zenith: 28 derrotas; Colosso do Vazio: 27 derrotas; General de Aco: 22 derrotas.
- Atirador Arcano: Colosso do Vazio: 27 derrotas; Avatar do Zenith: 23 derrotas; Soberano do Paradoxo: 17 derrotas.
- Espreitador: Avatar do Zenith: 83 derrotas; Colosso do Vazio: 39 derrotas; General de Aco: 22 derrotas.
- Guarda Florestal: Oraculo do Zero: 55 derrotas; Colosso do Vazio: 39 derrotas; Avatar do Zenith: 25 derrotas.
- Incendiário: Carrasco de Guerra: 52 derrotas; Avatar do Zenith: 48 derrotas; Titan Rachado: 36 derrotas.
- Frígido: Carrasco de Guerra: 58 derrotas; Deus da Ruina: 54 derrotas; Avatar do Zenith: 44 derrotas.
- Arquimago: Avatar do Zenith: 71 derrotas; Deus da Ruina: 65 derrotas; General de Aco: 43 derrotas.
- Corrompido: Soberano do Paradoxo: 68 derrotas; General de Aco: 43 derrotas; Avatar do Zenith: 37 derrotas.
- Druida Sombrio: Avatar do Zenith: 90 derrotas; Lorde da Cripta: 32 derrotas; Carrasco de Guerra: 26 derrotas.
- Avatar da Natureza: Avatar do Zenith: 98 derrotas; Lorde da Cripta: 46 derrotas; Carrasco de Guerra: 26 derrotas.
- Fada Monarca: Soberano do Paradoxo: 87 derrotas; Colosso do Vazio: 33 derrotas; Avatar do Zenith: 32 derrotas.
- Protetor da Floresta: Deus da Ruina: 86 derrotas; Avatar do Zenith: 39 derrotas; Colosso do Vazio: 33 derrotas.

## Conjuntos por rota

Antes: 14693 lutas; 4204 mortes; 6/48 conclusões; 22/48 chegaram ao Paradoxo; mediana da região 11.0 de 12.

Depois: 14694 lutas; 4161 mortes; 8/48 conclusões; 25/48 chegaram ao Paradoxo; mediana da região 12.0 de 12.

| Especialização | Antes: parada (campanhas) | Depois: parada (campanhas) | Mortes medianas antes → depois | Nível final mediano depois |
|---|---|---|---:|---:|
| Paladino | Cataclismo (3/3) | Cataclismo (3/3) | 83 → 84 | 100 |
| Berserker | Cataclismo (3/3) | Cataclismo (3/3) | 84 → 82 | 100 |
| Samurai | Cataclismo (2/3); Panteao (1/3) | Cataclismo (1/3); Panteao (2/3) | 86 → 85 | 100 |
| Ninja | Paradoxo (2/3); Panteao (1/3) | Panteao (1/3); Paradoxo (1/3); Concluiu (1/3) | 87 → 82 | 100 |
| Sniper | Concluiu (3/3) | Concluiu (3/3) | 67 → 67 | 87 |
| Atirador Arcano | Concluiu (3/3) | Concluiu (3/3) | 69 → 74 | 89 |
| Espreitador | Paradoxo (3/3) | Paradoxo (3/3) | 91 → 91 | 100 |
| Guarda Florestal | Paradoxo (3/3) | Paradoxo (3/3) | 94 → 88 | 100 |
| Incendiário | Paradoxo (3/3) | Paradoxo (3/3) | 99 → 99 | 100 |
| Frígido | Cataclismo (3/3) | Cataclismo (1/3); Paradoxo (2/3) | 94 → 94 | 100 |
| Arquimago | Panteao (3/3) | Panteao (2/3); Cataclismo (1/3) | 94 → 93 | 100 |
| Corrompido | Cataclismo (3/3) | Concluiu (1/3); Cataclismo (2/3) | 94 → 94 | 100 |
| Druida Sombrio | Panteao (2/3); Cataclismo (1/3) | Panteao (2/3); Cataclismo (1/3) | 96 → 96 | 100 |
| Avatar da Natureza | Panteao (3/3) | Panteao (3/3) | 95 → 95 | 100 |
| Fada Monarca | Paradoxo (3/3) | Paradoxo (3/3) | 93 → 93 | 100 |
| Protetor da Floresta | Cataclismo (1/3); Paradoxo (2/3) | Cataclismo (1/3); Paradoxo (2/3) | 84 → 81 | 100 |

### Gargalos após as mudanças

- Paladino: Deus da Ruina: 119 derrotas; Colosso do Vazio: 51 derrotas; Carrasco de Guerra: 24 derrotas.
- Berserker: Deus da Ruina: 75 derrotas; Colosso do Vazio: 51 derrotas; Titan Rachado: 26 derrotas.
- Samurai: Avatar do Zenith: 46 derrotas; Guardiao Aureo: 25 derrotas; Colosso do Vazio: 22 derrotas.
- Ninja: Avatar do Zenith: 44 derrotas; Deus da Ruina: 28 derrotas; Draco Magmatico: 23 derrotas.
- Sniper: Colosso do Vazio: 27 derrotas; General de Aco: 22 derrotas; Avatar do Zenith: 19 derrotas.
- Atirador Arcano: Colosso do Vazio: 27 derrotas; General de Aco: 22 derrotas; Soberano do Paradoxo: 21 derrotas.
- Espreitador: Avatar do Zenith: 70 derrotas; Colosso do Vazio: 37 derrotas; Oraculo do Zero: 26 derrotas.
- Guarda Florestal: Oraculo do Zero: 59 derrotas; Colosso do Vazio: 37 derrotas; General de Aco: 22 derrotas.
- Incendiário: Titan Rachado: 51 derrotas; Avatar do Zenith: 39 derrotas; Carrasco de Guerra: 26 derrotas.
- Frígido: Deus da Ruina: 73 derrotas; Carrasco de Guerra: 44 derrotas; Avatar do Zenith: 30 derrotas.
- Arquimago: Avatar do Zenith: 109 derrotas; General de Aco: 34 derrotas; Slime Toxico: 16 derrotas.
- Corrompido: Deus da Ruina: 67 derrotas; Avatar do Zenith: 43 derrotas; General de Aco: 34 derrotas.
- Druida Sombrio: Avatar do Zenith: 97 derrotas; Lorde da Cripta: 44 derrotas; General de Aco: 19 derrotas.
- Avatar da Natureza: Avatar do Zenith: 93 derrotas; Lorde da Cripta: 60 derrotas; General de Aco: 19 derrotas.
- Fada Monarca: Soberano do Paradoxo: 86 derrotas; Avatar do Zenith: 46 derrotas; Colosso do Vazio: 30 derrotas.
- Protetor da Floresta: Carrasco de Guerra: 59 derrotas; Colosso do Vazio: 33 derrotas; Deus da Ruina: 32 derrotas.

## Alterações avaliadas

W = piso(1,4L) para os custos que anteriormente usavam piso(0,5L), inclusive os multiplicadores 2W e 3W. Custos fixos, percentuais e fatores de dano por nível foram preservados. O teto de mana dos custos de Mago continua vigente. Headshot do Sniper: 50% de chance própria de crítico, somada à chance geral e aos bônus de Mirar. Headshot Arcano: parcela de mana máxima 0,26; Emergência Arcana: parcela de mana faltante 0,61. Vallhala: +112% de dano recebido (multiplicador 2,12).

O sangramento do Samurai aplica uma pilha de 5% da vida máxima por turno, por três turnos, a cada uso que cause dano. Não duplica por projétil, não usa a vida atual e aparece explicitamente no histórico. A política da avaliação agora inclui esse valor esperado.

## Interpretação

Os resultados são descritivos: três sementes, preparação acelerada e rotação heurística não demonstram a melhor build. A referência continua sendo o alcance e esforço da maioria, não a obrigação de concluir o jogo. Comparar as duas tabelas antes/depois antes de recomendar novos aumentos ou cortes; a seleção pré-definida de conjuntos não é uma busca otimizada.

A mudança de W afeta também classes que já estavam abaixo da régua. Portanto, uma redução de conclusões de Sniper/Atirador Arcano só representará aproximação se o alcance das demais rotas não recuar na mesma proporção. Conferir especialmente Samurai, Paladino, Frígido e Arquimago.

## Reprodução e evidências

- `node scripts/run-progression-w14-2026-11-06.cjs`
- `node scripts/run-progression-sets-w14-2026-11-06.cjs`
- Resumo: `docs/qa/progression-w14-summary-2026-11-06.csv`.
- Evidências completas: `results.json.gz` nas duas pastas de QA, incluindo encontros, equipamentos, mortes e uso de habilidades.

## Resultado desta rodada

A aproximação dos extremos ainda não foi suficiente. Sniper e Atirador Arcano concluíram 3/3 nos dois cenários, antes e depois. No cenário de referência, o nível final mediano do Arcano passou de 84 para 88; com conjuntos, de 84 para 89. Para o Sniper, ficou em 85 na referência e passou de 91 para 87 com conjuntos. Isso não prova que a redução de crítico aumentou sua força: as sequências de RNG e os encontros divergem.

Samurai continua abaixo da régua: na referência passou de três bloqueios no Panteão para dois no Panteão e um no Cataclismo; com conjuntos, passou de dois no Cataclismo para apenas um. A política agora reconhece o sangramento, portanto os próximos testes devem investigar também a prioridade dada a Cortes Ultrassônicos e as janelas de sobrevivência, sem presumir que aumentar novamente o sangramento resolve.

Paladino permanece no Cataclismo e sua mediana de mortes aumentou de 82 para 86 na referência e de 83 para 84 com conjuntos. Berserker também permanece no Cataclismo: 82 para 86 mortes na referência, mas 84 para 82 com conjuntos. Frígido chegou ao Paradoxo em duas sementes com conjuntos, embora continue no Cataclismo na referência. Arquimago permanece no Cataclismo na referência; com conjuntos saiu do Panteão em uma semente.

Ninja concluiu uma campanha em cada cenário; Espreitador e Guarda Florestal chegam ao Paradoxo nas três sementes. Incendiário não concluiu nenhuma desta rodada, mas alcançou o Paradoxo nas três. Corrompido concluiu uma em cada cenário; sua diferença de alcance entre os equipamentos mostra que a build ainda influencia bastante a leitura.

O custo por nível precisa de atenção nas classes já atrasadas: no nível 100, W passou de 50 para 140. Julgamento passou de 250 para 520 MP, e Cortes Ultrassônicos de 340 para 520 MP. Uma próxima hipótese é testar apenas os multiplicadores desses custos (Julgamento: 3W para 2W; Cortes: 2W para W), sem reverter W global ou aumentar dano de todas as classes. São sugestões, não alterações desta rodada.

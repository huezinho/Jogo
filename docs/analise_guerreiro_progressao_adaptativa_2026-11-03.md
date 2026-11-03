# Progressão adaptativa do Guerreiro — 03/11/2026

Esta revisão substitui o critério anterior de 21 mortes. As fórmulas de habilidades e equipamentos são as mesmas da revisão anterior; mudaram a preparação, uso de consumíveis, farm dirigido e critério de desistência. Não atribuir a diferença de resultados apenas às habilidades.

## Implementações na interface

- Bolsa: botão Abrir todos os baús (quantidade). Abre pilhas de todas as regiões, agrega materiais e mantém quatro unidades sorteadas por baú. Mostra quantos baús foram abertos e quantos materiais foram recebidos. Não consome itens que não sejam baús válidos nem abre durante processamento/morte.
- Limite de personagens: 16, aplicado à criação, interface e importação que usa a mesma constante. Saves existentes são mantidos.

## Método das campanhas

Quatro destinos (Paladino, Berserker, Samurai e Ninja), três sementes (101, 202 e 303), todos começando como Guerreiro nível 1. Cavaleiro/Espadachim são escolhidos no 30 e o destino avançado no 60. Pontos equilibrados entre força, vitalidade e sabedoria, diferença máxima de um ponto. Combate, XP, loot, baús, contratos, compras, fabricação e melhorias são executados pelas funções nativas. Não há XP, moedas, materiais ou equipamentos concedidos pelo simulador. Somente animações e esperas reais são aceleradas.

Após morrer ou recuar, busca materiais, moedas, níveis e melhorias antes de retentar. A preparação é considerada efetiva após dois níveis ou aumento da progressão de equipamentos. No nível 100, precisa melhorar equipamento; já equipado com seis lendários, retenta com suprimentos. Para obter materiais de chefes ainda não vencidos, busca contratos em vez de tratar o chefe bloqueador como um alvo de farm. Usa rastreamento pago para criaturas de regiões cujo chefe já foi derrotado e abandona contratos sem utilidade para os materiais planejados.

Plano reproduzível: peças temporárias da Floresta e depois conjunto da Caverna, de perfil equilibrado, mais um artefato obtido de fato por drop (nestas execuções, Colar de Raízes). O conjunto é completado e melhorado gradualmente. A melhoria lendária do artefato consome a cópia comum adicional. Esse plano não explora todas as combinações de equipamento; os resultados não demonstram o teto absoluto de cada classe.

Compra poções e tônicos com moedas obtidas, usa recuperação gratuita de HP no acampamento contabilizando tempo, paga recuperação de mana e usa Escudo de Fé quando há ameaça de morte. Lutas estagnadas geram recuo pago quando ainda não está totalmente preparado. Com nível 100 e seis lendários, tenta romper a estagnação com ofensiva em vez de encerrar a campanha por tempo/combates.

## Critério de parada

- Vitória: chefe do Paradoxo derrotado, em qualquer nível/equipamento.
- Desistência: nível 100, seis espaços equipados com itens lendários (incluindo artefato) e 11 mortes enquanto essas condições estavam satisfeitas.
- Mortes anteriores são registradas e não impõem limite. Chegar ao nível 100, isoladamente, não encerra a run.
- Checkpoints conservam RNG, recursos, estado e progresso; o teste de retomada compara a continuação com uma execução sem interrupção.

## Resultados

| Rota | Semente | Resultado | Nível | Combates | Mortes totais | Mortes no nível 100 com seis lendários | Lendários equipados ao fim |
|---|---:|---|---:|---:|---:|---:|---:|
| paladino | 101 | Vitória | 100 | 1367 | 5 | 0 | 0/6 |
| paladino | 202 | Vitória | 100 | 1416 | 25 | 0 | 0/6 |
| paladino | 303 | Vitória | 100 | 1364 | 5 | 0 | 0/6 |
| berserker | 101 | Desistência conforme critério | 100 | 7835 | 43 | 11 | 6/6 |
| berserker | 202 | Desistência conforme critério | 100 | 6623 | 83 | 11 | 6/6 |
| berserker | 303 | Desistência conforme critério | 100 | 7596 | 49 | 11 | 6/6 |
| samurai | 101 | Vitória | 100 | 6556 | 53 | 3 | 6/6 |
| samurai | 202 | Vitória | 100 | 6822 | 107 | 0 | 6/6 |
| samurai | 303 | Vitória | 100 | 6122 | 45 | 2 | 6/6 |
| ninja | 101 | Vitória | 100 | 3798 | 21 | 0 | 1/6 |
| ninja | 202 | Vitória | 100 | 3203 | 35 | 0 | 0/6 |
| ninja | 303 | Vitória | 100 | 5649 | 32 | 7 | 6/6 |

Total: 58,351 combates; 9 vitórias e 3 desistências. As três desistências cumpriram integralmente o critério.

## Leitura dos resultados

- Paladino venceu as três campanhas com poucas peças comuns/incomuns. Cura, reflexão, controle, poções e Escudo de Fé permitiram concluir antes de precisar de lendários. É um sinal forte de diferença de sustentação nesta política, não prova de que equipamento é dispensável para todo jogador.
- Samurai venceu nas três sementes, após obter seis lendários; houve 3, 0 e 2 mortes nessa condição antes da vitória.
- Ninja venceu nas três sementes. Duas vitórias ocorreram antes de completar seis lendários; na terceira, venceu depois de sete mortes totalmente preparado.
- Berserker desistiu nas três sementes após a 11ª morte totalmente preparado. O custo de vida e a vulnerabilidade exigem revisar a rotação e possivelmente a sustentação; não concluir inviabilidade geral só com este conjunto e esta política.
- O ganho de equipamentos altera fortemente a leitura do teste anterior: o limite de 21 mortes interrompia a preparação de várias rotas antes de atingir seu potencial.
- O farm para seis lendários foi longo, com milhares de combates, muitos contratos e esperas por rotação do quadro. Houve sobra de moedas no fim; disponibilidade dos tipos específicos de material foi um gargalo importante. O tempo simulado é uma estimativa da política (quatro segundos por ação e tempo de recuperação/espera), não uma medição de jogador real.

## Integridade e reproduções

Os resultados iniciais do planejador foram arquivados separadamente e não entram na tabela consolidada. Em especial, legacy-checkpoint-berserker-202.json registra um caso encerrado a partir de um checkpoint da política antiga, que ainda tentava farmar chefes não vencidos; a semente foi repetida do nível 1 com a guarda corrigida. Os dados consolidados estão em docs/qa/warrior-progression-legendary/results.json.

Comandos:

```sh
node scripts/test-bulk-chests-and-characters.cjs
node scripts/test-warrior-balance.cjs
node scripts/test-equipment-balance.cjs
node scripts/test-warrior-progression-policy.cjs
node scripts/run-warrior-progression.cjs --resume
```

O teste de personagens cria 16 saves e rejeita o 17º. O teste de baús abre 35 baús de duas regiões (140 unidades), preserva os demais itens, valida repetição sem duplicação, persistência e interface em 1366/390/320 pixels. O teste do critério de desistência verifica inclusive 1.000 mortes anteriores sem encerramento prematuro.

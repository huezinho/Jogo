# Rebalanceamento do Guerreiro — 03/11/2026

> Histórico: este relatório usa o limite anterior de 21 mortes. A repetição com preparação até lendários e o novo critério de desistência está em analise_guerreiro_progressao_adaptativa_2026-11-03.md.

## Regras implementadas

HP = vida máxima do herói; ATQ = ataque ativo; POD = poder de habilidade. W = piso(0,5 × nível). Coeficientes de dano são arredondados para baixo por parcela, mantendo a convenção do motor. As durações não mencionadas foram preservadas.

| Ramo | Mudança |
|---|---|
| Guerreiro | Recuperar Fôlego: 12% HP. Esbarrão: 20 + 6% HP + 0,6 ATQ + 0,4 POD. |
| Cavaleiro | Recuperar Fôlego: 19% HP. Esbarrão: 20 + 8% HP + 0,7 ATQ + 0,5 POD. Contundir: 30 + 7% HP + 0,6 ATQ + 0,4 POD. Brado: +30% dano total final. Refletir: 20% da vida efetivamente perdida. |
| Paladino | Contundir: 45% de bloqueio do turno inimigo. Julgamento: 100 + 3W MP. Refletir: 40% da vida efetivamente perdida. Herda demais mudanças do Cavaleiro. |
| Berserker | Contundir: 60 + 7% HP + 1,1 ATQ + 0,4 POD, removida parcela de vida máxima do inimigo. Ira: 70% HP máximo de custo, +120% dano final e 20% roubo de vida. Vallhala: +150% dano recebido. Você Irá Me Parar?: +100 ATQ e quebra de controle do turno atual. |
| Espadachim | Recuperar Fôlego: 12% HP e +28% dano total final. Investida: 20 + 6% HP + 0,8 ATQ + 0,8 POD e quebra de controle. |
| Samurai | Cortes Ultrassônicos: 240 + 2W MP. Ao terminar, exige esperar um turno/ação antes de reativar. |
| Ninja | Corte Profundo: 70 + 0,9 ATQ + 1,1 POD. Mata-Gigantes: 32% da vida atual do inimigo. |

Esquiva impede o dano e os novos efeitos hostis do golpe. Efeitos já ativos continuam, inclusive queimadura no início do turno. A chance combinada pode chegar a 100%. Efeitos próprios do chefe, como ganhar escudo, não são removidos por esquivar de seu ataque.

Sangramentos são DOTs independentes, com danos somados e duração própria. Recebem bônus de DOT e são mostrados na interface. Pilhas são preservadas ao salvar e carregar. Roubo de vida considera somente HP efetivamente retirado (sem escudo nem excedente), inclusive DOTs; respeita redução de cura. Custos de vida não são tratados como golpes recebidos para reflexão.

## Método da progressão

12 campanhas independentes: quatro destinos de subclasse × sementes 101, 202 e 303. Todas começam como Guerreiro nível 1; Cavaleiro/Espadachim no nível 30 e subclasse avançada no 60. Pontos alternados entre força, vitalidade e sabedoria, mantendo diferença máxima de um ponto. Nenhum equipamento, moeda, XP ou material foi concedido artificialmente.

O teste usa as funções reais de combate, morte/renascimento, XP, subclasses, fabricação, melhoria, drops, baús e mercenário. Apenas animações, desenho da interface e esperas reais são acelerados. A recuperação gratuita de HP do acampamento tem seu tempo contado; recuperação de mana é paga. Mortes usam o renascimento normal, que restaura os recursos. Não há teto de nível, tempo ou combates usado para cancelar a campanha. Cada execução termina na 21ª morte ou na vitória contra o chefe do Paradoxo.

Política fixa: reserva componentes para uma arma faltante, fabrica/melhora quando tem recursos, compara atributos e sinergia parcial de conjunto, aceita contratos, usa cura e recursos defensivos, tenta chefes liberados e volta a treinar após derrotas/recuos. Evita inimigos mais de três níveis acima enquanto ainda pode subir de nível; no nível 100 tenta a região final. Lutas sem novo progresso de HP por 12 turnos, ou com mais de 300 turnos, geram tentativa de fuga paga; isso é um recuo da batalha, não encerramento da campanha. Após falhar, nova tentativa de chefe ocorre com três níveis, nova peça/melhoria ou 30 combates de intervalo.

A política é uma aproximação reproduzível de jogo normal, não um jogador ótimo. Não usa rastreamento pago nem abandona contratos antigos; não garante conjunto completo ou melhor rotação de habilidades. Escudo de Fé não foi escolhido pela política nestas campanhas, portanto a comparação não mede o potencial máximo defensivo do Paladino. O ensaio exploratório anterior está separado em exploratory.json e não entra nos totais abaixo.

## Resultados consolidados

| Destino | Semente | Nível final | Região da última derrota | Chefes vencidos | Combates | Mortes |
|---|---:|---:|---|---:|---:|---:|
| paladino | 101 | 100 | Paradoxo | 11/12 | 1373 | 21 |
| berserker | 101 | 72 | Necropole | 7/12 | 780 | 21 |
| samurai | 101 | 75 | Necropole | 7/12 | 861 | 21 |
| ninja | 101 | 73 | Necropole | 8/12 | 817 | 21 |
| paladino | 202 | 100 | Paradoxo | 11/12 | 1337 | 21 |
| berserker | 202 | 66 | Fortaleza | 7/12 | 667 | 21 |
| samurai | 202 | 70 | Necropole | 8/12 | 772 | 21 |
| ninja | 202 | 69 | Necropole | 7/12 | 748 | 21 |
| paladino | 303 | 100 | Paradoxo | 11/12 | 1356 | 21 |
| berserker | 303 | 78 | Necropole | 8/12 | 899 | 21 |
| samurai | 303 | 69 | Necropole | 7/12 | 781 | 21 |
| ninja | 303 | 64 | Fortaleza | 7/12 | 691 | 21 |

Total: 11,082 combates. Todas as execuções terminaram na 21ª morte; nenhuma derrotou o chefe final.

## Leitura dos resultados

- Paladino chegou ao nível 100 e venceu 11 dos 12 chefes nas três sementes. A combinação de cura, redução fixa, Aura Divina, controle e reflexão sustentou melhor a progressão nesta política. O obstáculo final foi a região do Paradoxo, com mortes em inimigos comuns antes de liberar o chefe.
- Berserker terminou nos níveis 66, 72 e 78. O custo de 70% de HP de Ira e a vulnerabilidade de Vallhala exigem cuidado; houve mortes por dano direto e queimadura. O resultado não atribui cada morte exclusivamente a essas habilidades.
- Samurai terminou nos níveis 69, 70 e 75; Ninja nos níveis 64, 69 e 73. A sustentação de 12% de HP encontrou pressão em Fortaleza/Necrópole. Sangramentos e esquiva funcionaram, mas não bastaram para concluir as campanhas com os equipamentos obtidos.
- Nenhuma execução Samurai/Ninja chegou ao nível 80; Cortes Ultrassônicos e Mata-Gigantes foram validados em testes pontuais, não na progressão natural. Você Irá Me Parar? também não foi alcançada nas execuções Berserker.
- Equipamentos comuns predominaram até o fim; somente duas execuções chegaram a uma peça rara. Nenhuma alcançou ultra rara/lendária. Assim, estas campanhas medem a economia real de materiais e moedas, não o teto de poder com conjuntos lendários.
- Houve variação forte no início: antes do nível 30, a semente 101 acumulou 4 mortes; a 202, 11; a 303, 8–9. Drops e sequência de encontros afetam muito o orçamento de 20 mortes.
- Não há comparação direta com uma campanha anterior usando exatamente esta política; os resultados não demonstram um percentual causal de melhora em relação às fórmulas antigas.

## Verificação

- scripts/test-warrior-balance.cjs: fórmulas e custos de todos os ramos, roubo de vida sem escudo/overkill, esquiva de efeitos para quatro classes, DOT já ativo, pilhas com duração independente, quebra de controle, recarga, interface e persistência.
- scripts/test-equipment-balance.cjs: 4.800 combinações, 288 etapas de receita, 24 casos de reflexão e oficina.
- Regressão de habilidades/conjuntos: 348 casos.
- Resultados completos e histórico: docs/qa/warrior-progression/results.json.

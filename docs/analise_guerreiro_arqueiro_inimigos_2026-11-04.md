# Guerreiro e Arqueiro contra os inimigos reformulados — 04/11/2026

## Resultado principal

24 campanhas principais, oito rotas e três sementes: **10 vitórias**, 14 desistências, **7522 combates** e 1864 mortes totais. As desistências ocorreram somente com nível 100, seis equipamentos lendários e 11 mortes já nessa condição. Foram duas vitórias em 12 campanhas de Guerreiro e oito em 12 de Arqueiro.

| Rota | Vitórias | Níveis nas vitórias | Mortes totais por campanha | Onde pararam as campanhas sem vitória |
| --- | ---: | --- | --- | --- |
| Paladino | 0/3 | — | 68–78 | Deus da Ruina (3) |
| Berserker | 0/3 | — | 69–82 | Avatar do Zenith (3) |
| Samurai | 0/3 | — | 80–89 | Avatar do Zenith (3) |
| Ninja | 2/3 | 100–100 | 72–85 | Deus da Ruina (1) |
| Sniper | 3/3 | 83–97 | 62–72 | Todas venceram |
| Atirador Arcano | 3/3 | 87–94 | 63–82 | Todas venceram |
| Espreitador | 0/3 | — | 87–96 | Soberano do Paradoxo (2); Guardiao Temporal (1) |
| Guarda Florestal | 2/3 | 89–100 | 65–99 | Soberano do Paradoxo (1) |

Todas as campanhas sem vitória terminaram no nível 100. O contador de 11 mortes com preparação máxima é acumulado na campanha, podendo incluir inimigos diferentes; não se reinicia ao vencer um chefe. Mortes anteriores ao nível 100 ou antes de completar seis lendários não contam para esse limite.

## Método

O personagem começa no nível 1, escolhe a subclasse nos níveis normais e distribui os pontos equilibradamente entre Força, Vitalidade e Sabedoria. Combate, efeitos, IA inimiga, esquiva, DOTs, XP, loot, custos de habilidades e escalonamento dos equipamentos usam as funções executáveis do jogo. Foram usadas as sementes 101, 202 e 303. A política não consulta os próximos sorteios.

A preparação foi acelerada, como autorizado: recuperação completa de HP/MP entre lutas; após cada derrota, concede-se um nível até 100. Se o mesmo alvo voltar a derrotar o personagem, concede-se também uma melhoria no slot de menor raridade. Ao nível 100, melhora-se uma peça por derrota até completar seis lendários. Fugas forçadas por Assombrar são registradas separadamente e acionam a mesma preparação. Repete-se o alvo que causou a falha.

O craft inicial só usa materiais e moedas obtidos. Melhorias concedidas na preparação não cobram recursos. O planejamento procura itens da Floresta no começo e da Caverna depois do desbloqueio, mas conserva a região das peças já obtidas ao melhorá-las. O acessório de preparação é Colar de Raízes. Portanto, este teste não mede tempo de farm nem a dificuldade econômica do crafting.

A estratégia usa as habilidades disponíveis conforme dano, custo, vida, controle e buffs. A preparação e as condições de encerramento são iguais às da análise acelerada do Mago. Nesta análise, a estratégia também evita buffs contra Oráculo Radiante/Imperador, espera o Pacto Fúnebre terminar antes de atacar diretamente e procura defesa contra um ataque carregado prestes a atingir. Isso não impede que reflexões automáticas acionem Pacto Fúnebre.

Em 100 ações sem progresso ofensivo, o personagem passa turnos para deixar o combate se resolver, sem editar HP ou registrar uma morte fictícia. Nenhuma campanha encerra por limite arbitrário de turnos.

## Por que foi necessário adaptar a estratégia

Uma rodada de controle de 24 campanhas com a política anterior teve **0 vitórias**. Mantendo a mesma preparação e as mesmas três sementes, a política que reconhece Pacto Fúnebre e roubo/remoção de buffs teve 10 vitórias. As sequências de sorteios posteriores podem divergir porque as ações consomem RNG; não são replays com encontros idênticos do início ao fim.

| Rota | Política anterior | Política com resposta às mecânicas |
| --- | ---: | ---: |
| Paladino | 0/3 | 0/3 |
| Berserker | 0/3 | 0/3 |
| Samurai | 0/3 | 0/3 |
| Ninja | 0/3 | 2/3 |
| Sniper | 0/3 | 3/3 |
| Atirador Arcano | 0/3 | 3/3 |
| Espreitador | 0/3 | 0/3 |
| Guarda Florestal | 0/3 | 2/3 |

Os controles estão em `qa/revised-progression-2026-11-04/baseline-policy-results.json`. Eles são preservados para comparação e não entram nas 24 campanhas principais. Ao todo, foram executadas 48 campanhas nesta análise.

## Leitura dos gargalos

**Avatar do Zenith:** é o maior ponto de preparação para várias rotas. Cura 4% e gera 6% de escudo por turno: com 13.830 de vida, são 553 de cura e 829 de escudo por turno, antes dos efeitos que os reduzem/impedem. Seu ataque básico tem impacto de 12%, e há queimadura de 7% e o Prisma carregado. Interromper um ataque não elimina automaticamente a aura. Berserker e Samurai pararam nele nas três sementes; o dano sustentado e a capacidade de lidar com regeneração/escudo merecem um teste de build específico.

**Deus da Ruína:** Paladino parou nele nas três sementes. Colapso Final aplica três DOTs, e uma segunda aplicação pode completar cinco efeitos ainda ativos. Fim dos Fracos executa por quantidade de debuffs/DOTs; cura, escudo e invulnerabilidade não removem esses efeitos. A esquiva de 30% e os escudos gerados ao esquivar também aumentam a pressão. Isso favorece evitar aplicações, impedir ações ou vencer rapidamente, em vez de só aumentar a resistência. Essa é uma explicação mecânica compatível com os resultados, não um isolamento experimental de cada causa de morte.

**Lorde da Cripta e Imperador do Eclipse:** a política anterior desperdiçava buffs ou continuava buscando dano fatal durante Pacto Fúnebre. Sniper passou de 0/3 para 3/3; Atirador Arcano, de 0/3 para 3/3. Espreitador e Guarda Florestal passaram a avançar além do Imperador. O resultado mostra a importância da decisão de combate, e não apenas dos atributos brutos.

**Paradoxo:** o Guardião Temporal limita lutas longas, Devorar aumenta a vida máxima do inimigo e o Soberano combina reversão da última ação, armadura crescente, escudo de 75% e DOT crescente irremovível. O Espreitador chegou ao Soberano em duas sementes e parou no Guardião em uma. Ninja venceu duas; Guarda Florestal venceu duas. Evitar os gargalos anteriores não garante dano suficiente para resolver o último combate.

## Limites e próximos testes de balanceamento

Seis lendários não significam um conjunto otimizado. Nos Guerreiros, as cinco peças de conjunto terminaram com duas ou três peças da Caverna, misturadas à Floresta: **nenhum fechou quatro peças da Caverna**. Nos Arqueiros, houve cinco peças da Floresta ou quatro da Floresta e uma da Caverna. O Colar é separado da contagem de conjunto.

Isso importa: a arma da Floresta concentra o orçamento ofensivo em poder de habilidade, enquanto Rajada de Flechas depende do ataque. Também não houve busca de acessórios de outras regiões para substituir a reflexão em combates com Pacto. Os resultados não demonstram que uma classe seja incapaz de vencer com outra build. Antes de aumentar dano de habilidades, os próximos testes mais úteis seriam: Guerreiro com conjunto Caverna fechado; Caçador com arma focada em ataque e conjunto ofensivo; e acessórios apropriados a cada chefe. Nenhuma alteração de balanceamento foi feita nesta análise.

Os resultados antigos de 03/11 enfrentaram outros inimigos e usaram, em parte, preparação/equipamentos diferentes. Não é correto atribuir toda a diferença exclusivamente à força dos inimigos novos. As três sementes por rota também não estabelecem uma taxa de vitória populacional.

## Campanhas individuais

| Rota | Semente | Resultado | Nível | Mortes | Fugas | Combates | Mortes com preparação máxima |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: |
| Paladino | 101 | Deus da Ruina | 100 | 68 | 10 | 363 | 11 |
| Paladino | 202 | Deus da Ruina | 100 | 78 | 11 | 292 | 11 |
| Paladino | 303 | Deus da Ruina | 100 | 78 | 9 | 312 | 11 |
| Berserker | 101 | Avatar do Zenith | 100 | 69 | 10 | 368 | 11 |
| Berserker | 202 | Avatar do Zenith | 100 | 82 | 11 | 291 | 11 |
| Berserker | 303 | Avatar do Zenith | 100 | 82 | 9 | 292 | 11 |
| Samurai | 101 | Avatar do Zenith | 100 | 80 | 10 | 304 | 11 |
| Samurai | 202 | Avatar do Zenith | 100 | 89 | 11 | 258 | 11 |
| Samurai | 303 | Avatar do Zenith | 100 | 85 | 9 | 275 | 11 |
| Ninja | 101 | Vitória | 100 | 72 | 10 | 360 | 8 |
| Ninja | 202 | Deus da Ruina | 100 | 85 | 11 | 311 | 11 |
| Ninja | 303 | Vitória | 100 | 73 | 9 | 314 | 1 |
| Sniper | 101 | Vitória | 97 | 67 | 3 | 436 | 0 |
| Sniper | 202 | Vitória | 83 | 72 | 1 | 201 | 0 |
| Sniper | 303 | Vitória | 87 | 62 | 4 | 297 | 0 |
| Atirador Arcano | 101 | Vitória | 87 | 63 | 3 | 346 | 0 |
| Atirador Arcano | 202 | Vitória | 94 | 82 | 1 | 241 | 0 |
| Atirador Arcano | 303 | Vitória | 94 | 71 | 4 | 302 | 0 |
| Espreitador | 101 | Soberano do Paradoxo | 100 | 87 | 3 | 319 | 11 |
| Espreitador | 202 | Soberano do Paradoxo | 100 | 96 | 1 | 326 | 11 |
| Espreitador | 303 | Guardiao Temporal | 100 | 88 | 4 | 354 | 11 |
| Guarda Florestal | 101 | Vitória | 89 | 65 | 3 | 282 | 0 |
| Guarda Florestal | 202 | Soberano do Paradoxo | 100 | 99 | 1 | 270 | 11 |
| Guarda Florestal | 303 | Vitória | 100 | 71 | 4 | 408 | 0 |

## Nível em que cada chefe foi vencido

Cada célula mostra o intervalo dos níveis nas vitórias e quantas sementes venceram aquele chefe. “—” significa que nenhuma venceu.

| Região / chefe | Paladino | Berserker | Samurai | Ninja | Sniper | Atirador Arcano | Espreitador | Guarda Florestal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Floresta | 10–10 (3/3) | 10–10 (3/3) | 10–10 (3/3) | 10–10 (3/3) | 11–12 (3/3) | 11–12 (3/3) | 11–12 (3/3) | 11–12 (3/3) |
| Caverna | 15–17 (3/3) | 15–17 (3/3) | 15–17 (3/3) | 15–17 (3/3) | 17–20 (3/3) | 17–20 (3/3) | 17–20 (3/3) | 17–20 (3/3) |
| Ruinas | 29–30 (3/3) | 29–30 (3/3) | 29–30 (3/3) | 29–30 (3/3) | 25–27 (3/3) | 25–27 (3/3) | 25–27 (3/3) | 25–27 (3/3) |
| Pantano | 31–33 (3/3) | 31–33 (3/3) | 31–32 (3/3) | 31–32 (3/3) | 30–36 (3/3) | 30–36 (3/3) | 32–37 (3/3) | 32–37 (3/3) |
| Vulcao | 42–44 (3/3) | 42–44 (3/3) | 44–50 (3/3) | 44–50 (3/3) | 39–41 (3/3) | 39–41 (3/3) | 48–56 (3/3) | 48–56 (3/3) |
| Abismo | 43–48 (3/3) | 43–48 (3/3) | 45–52 (3/3) | 45–52 (3/3) | 43–47 (3/3) | 43–47 (3/3) | 49–57 (3/3) | 49–57 (3/3) |
| Fortaleza | 60–60 (3/3) | 62–64 (3/3) | 60–60 (3/3) | 60–61 (3/3) | 61–61 (3/3) | 60–60 (3/3) | 61–67 (3/3) | 60–70 (3/3) |
| Necropole | 61–63 (3/3) | 70–72 (3/3) | 61–63 (3/3) | 61–64 (3/3) | 62–64 (3/3) | 60–62 (3/3) | 66–70 (3/3) | 62–70 (3/3) |
| Citadela | 62–66 (3/3) | 74–79 (3/3) | 77–93 (3/3) | 72–75 (3/3) | 63–71 (3/3) | 61–63 (3/3) | 70–74 (3/3) | 73–75 (3/3) |
| Panteao | 95–97 (3/3) | — | — | 77–100 (3/3) | 80–81 (3/3) | 68–70 (3/3) | 99–100 (3/3) | 80–90 (3/3) |
| Cataclismo | — | — | — | 98–100 (2/3) | 80–81 (3/3) | 75–81 (3/3) | 100–100 (3/3) | 84–91 (3/3) |
| Paradoxo | — | — | — | 100–100 (2/3) | 83–97 (3/3) | 87–94 (3/3) | — | 89–100 (2/3) |

## Inimigos com mais mortes acumuladas

Inclui mortes durante a preparação, não apenas as 11 finais. A soma de três sementes pode ser alta mesmo para um chefe posteriormente vencido.

| Rota | Três maiores concentrações de mortes |
| --- | --- |
| Paladino | Avatar do Zenith: 89; Deus da Ruina: 45; Carrasco de Guerra: 42 |
| Berserker | Avatar do Zenith: 93; Carrasco de Guerra: 42; Draco Magmatico: 19 |
| Samurai | Avatar do Zenith: 59; Draco Magmatico: 40; Imperador do Eclipse: 25 |
| Ninja | Avatar do Zenith: 45; Draco Magmatico: 40; Deus da Ruina: 30 |
| Sniper | Avatar do Zenith: 32; Ent Ancestral: 20; General de Aco: 20 |
| Atirador Arcano | Soberano do Paradoxo: 31; Ent Ancestral: 20; General de Aco: 17 |
| Espreitador | Avatar do Zenith: 78; Draco Magmatico: 43; Ent Ancestral: 20 |
| Guarda Florestal | Draco Magmatico: 43; Avatar do Zenith: 23; Imperador do Eclipse: 22 |

## Reprodução e auditoria

- `node scripts/run-revised-progression.cjs` retoma campanhas já concluídas do arquivo de resultados.
- Para regenerar o relatório e auditar: `python3 scripts/generate-revised-progression-report.py`.
- Motor: `scripts/revised-progression-engine.js`.
- Dados e auditoria: `docs/qa/revised-progression-2026-11-04/results.json`.
- Resumo em CSV: `docs/qa/revised-progression-2026-11-04/summary.csv`.
- Validado: três sementes por rota, pontos equilibrados, eventos de mortes compatíveis com os contadores e nenhuma desistência antes da preparação máxima.

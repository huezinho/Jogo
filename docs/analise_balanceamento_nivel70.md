# Balanceamento da campanha até o nível 70

Análise de 30/10/2026 sobre o código do commit `db33480`, com hashes dos cinco arquivos de regras registrados em [metadata.json](qa/balance70/metadata.json). Os coeficientes e o código de produção do jogo não foram alterados. Os arquivos novos são simuladores, evidências e este relatório.

**Conclusão principal:** Corrompido e Arquimago concentram os maiores excessos ofensivos; Avatar da Natureza e Espreitador têm as limitações solo mais persistentes neste recorte. Druida Sombrio depende muito de distribuição/equipamento e de executar corretamente o preparo. Berserker tem uma habilidade muito forte, Contundir, mas suas habilidades de sacrifício frequentemente pioram a luta. Não existe um ranking único que continue igual sem itens, com conjunto e durante o crescimento.

O pior confronto de mesmo nível sem equipamento é **Ent Ancestral, personagem 10 contra chefe 10: 0/96** na matriz. A principal quebra posterior fica no **50–59**, entre a entrada no Vulcão/Abismo e a especialização final no 60. Há também um problema funcional que contamina a avaliação de controle e esquiva: os chefes aplicam efeitos negativos antes de o motor cancelar o dano do ataque.

## Amplitude e método

Foram cobertas **quatro classes-base, oito formas intermediárias e 16 finais**, com oito distribuições de atributos e quatro estilos gerais. Todas as formas foram exercitadas nas faixas em que existem; a matriz controlada percorre **cada nível de 1 a 70**. No 70, todas as 16 especializações enfrentaram os **48 inimigos da campanha**, incluindo os 12 chefes. Dois combos adicionais por especialização foram sondados para evitar depender exclusivamente da rotação genérica.

São **478.019 combates nas matrizes principais e nas progressões registradas abaixo**, além de 452 sondagens de ativas, 68 de passivas e 1.356 usos de habilidades com os 12 conjuntos comuns. O catálogo inclui 43 IDs de ativas e 29 de passivas; variantes herdadas de uma mesma habilidade não são contadas como novas habilidades independentes.

| Experimento | Combates / execuções |
| --- | --- |
| Nível 70: 16 formas × 8 builds × 4 estilos × 48 inimigos × 3 sementes | 73.728 |
| Validação sem equipamento: 30 sementes novas por confronto | 23.040 |
| Seleção com cinco peças comuns da Fortaleza | 4.608 |
| Validação com conjunto comum: 30 sementes novas | 23.040 |
| Níveis 1–70, sem equipamento: todas as formas legais, quatro builds, dois estilos | 25.536 |
| Checkpoints com equipamento efetivamente obtido na progressão | 52.944 |
| Retirada de uma ativa e abertura forçada com essa ativa | 15.120 |
| Combos específicos do 70: sondagem e validação adicional | 10.272 |
| Fronteira com equipamento conquistado: seleção de sete estilos e validação | 34.506 |
| Sondagem preliminar da fronteira com a política de farm | 24.678 |
| Progressões contínuas, oito builds × duas sementes × 16 finais | 256 trajetórias / 190.547 combates |

As ações passam pelas funções reais `attack`, `useSkill`, `passTurn`, aplicação de dano, regeneração, DOTs, efeitos de equipamento e IA dos chefes. Apenas animações, DOM, espera e gravação de saves são desativados. Os testes rodam em contextos descartáveis do Edge via Playwright; nenhum save do jogador é carregado ou alterado. Pontos são investidos cronologicamente com o ganho de cada nível; não há respec para concentrar ganhos tardios.

As políticas são heurísticas. “Dano direto” compara efeitos imediatos em sondagens com aleatoriedade independente da luta; “sustentação” acrescenta cura/escudo/controle; “combo” segue uma sequência legal; “básico” usa apenas ataque e espera por mana quando necessário. As duas rotações extras só tentam habilidades disponíveis até o 70. O simulador não conhece a próxima rolagem do combate.

A progressão principal usa uma política adicional simples, “pragmática”: compara dano/preparo/defesa pelo estado atual e recua para alvos mais fracos depois de falhar. Usa drops, fabricação, melhorias até raro e contratos reais; a pousada é paga. Não são concedidos itens, moedas ou materiais; não se compram poções nem se equipam acessórios/baús aleatórios de chefe. Ao morrer, a simulação aplica a recuperação e a espera do ressurgimento. Um combate que chega a 100 ações ainda vivo encerra a trajetória como **sem resolução**, sem cura gratuita para continuar. Cada trajetória para no 70, em 30 mortes ou em 6.000 combates.

A escolha de inimigos é dirigida para materiais e farm; não reproduz o sorteio de encontros. Chefes da progressão são tentados a partir de três níveis acima, após matar os três tipos comuns da região. Essa é uma decisão conservadora do bot, não uma exigência do jogo. Tempos usam quatro segundos por ação, oito de transição e vinte por descanso; não são sessões humanas cronometradas. A região alcançada pela campanha e a capacidade num combate controlado são métricas separadas.

Nos confrontos controlados, HP e MP começam cheios e o limite é de 100 ações. O conjunto padronizado da Fortaleza é uma fixture concedida para isolar equipamento; não significa que foi fabricado naquela trajetória. A fronteira “conquistada” usa somente equipamento de trajetórias que realmente chegaram ao 70. Em ambos os casos, cada adversário é reiniciado: não é um gauntlet sem descanso.

As três sementes da sondagem servem para selecionar candidatos, não para fechar uma taxa de vitória. A validação usa 30 sementes novas. Mesmo 30/30 não demonstra vitória garantida, e 0/30 não demonstra impossibilidade; como referência, os extremos têm intervalo de Wilson de aproximadamente 88,6–100% e 0–11,4%. Builds foram selecionadas contra chefes de níveis 60–90; isso favorece esse recorte. Não é uma busca exaustiva de jogo ótimo.

Este ranking é **PvE solo da campanha**. As habilidades de suporte foram verificadas funcionalmente nesse contexto; a contribuição numa equipe online e o PvP não foram medidos. Habilidades de nível 80 não são tratadas como disponíveis no 70.

## Até onde os personagens chegaram durante o crescimento

Cada forma final tem 16 tentativas: oito distribuições × duas sementes. Uma tentativa que para antes do 60 representa uma rota planejada para aquela forma; ela ainda não havia desbloqueado a especialização final. Esses resultados medem a trajetória e o controlador, não apenas a força do kit final. “Sem resolução” identifica estagnação da política, não uma morte ou impossibilidade do personagem.

| Rota final planejada | Chegou ao 70 | Nível atingido | Distribuições que chegaram: tentativas |
| --- | --- | --- | --- |
| Paladino | 12/16 | 23–70 | arcana (2), equilibrada (2), forca_pura (2), hibrida (2), ofensiva (2), resistente (2) |
| Berserker | 12/16 | 24–70 | arcana (2), equilibrada (2), forca_pura (2), hibrida (2), ofensiva (2), resistente (2) |
| Samurai | 12/16 | 23–70 | arcana (2), equilibrada (2), forca_pura (2), hibrida (2), ofensiva (2), resistente (2) |
| Ninja | 12/16 | 23–70 | arcana (2), equilibrada (2), forca_pura (2), hibrida (2), ofensiva (2), resistente (2) |
| Mago Incendiario | 14/16 | 58–70 | arcana (2), equilibrada (2), forca_pura (2), hibrida (2), mana_pura (2), ofensiva (2), resistente (2) |
| Mago Frigido | 14/16 | 57–70 | arcana (2), equilibrada (2), forca_pura (2), hibrida (2), mana_pura (2), ofensiva (2), resistente (2) |
| Arquimago | 14/16 | 57–70 | arcana (2), equilibrada (2), forca_pura (2), hibrida (2), mana_pura (2), ofensiva (2), resistente (2) |
| Corrompido | 14/16 | 58–70 | arcana (2), equilibrada (2), forca_pura (2), hibrida (2), mana_pura (2), ofensiva (2), resistente (2) |
| Atirador Arcano | 12/16 | 23–70 | arcana (2), equilibrada (2), forca_pura (2), hibrida (2), ofensiva (2), resistente (2) |
| Sniper | 10/16 | 23–70 | equilibrada (2), forca_pura (2), hibrida (2), ofensiva (2), resistente (2) |
| Espreitador | 6/16 | 23–70 | equilibrada (2), ofensiva (2), resistente (2) |
| Guarda Florestal | 10/16 | 23–70 | equilibrada (2), forca_pura (2), hibrida (2), ofensiva (2), resistente (2) |
| Druida Sombrio | 9/16 | 16–70 | arcana (1), equilibrada (2), forca_pura (2), hibrida (2), ofensiva (2) |
| Avatar da Natureza | 8/16 | 17–70 | equilibrada (2), forca_pura (2), hibrida (2), ofensiva (2) |
| Fada Monarca | 11/16 | 16–70 | arcana (1), equilibrada (2), forca_pura (2), hibrida (2), ofensiva (2), resistente (2) |
| Protetor da Floresta | 12/16 | 17–70 | arcana (2), equilibrada (2), forca_pura (2), hibrida (2), ofensiva (2), resistente (2) |

No total, **182/256 trajetórias chegaram ao 70**, e todas as 16 especializações têm ao menos uma trajetória concluída. As demais pararam pelos limites de morte ou de resolução descritos no método.

As oito distribuições são força/vitalidade/sabedoria: equilibrada 1/1/1; força pura 1/0/0; vida pura 0/1/0; mana pura 0/0/1; ofensiva 6/2/2; resistente 2/6/2; arcana 2/2/6; híbrida 4/2/4. Os pontos são inteiros; as proporções são alvos de distribuição. Trajetórias planejadas para especializações irmãs compartilham grande parte das regras antes do 60; não são 256 experiências estatisticamente independentes.

Força aumenta ataque **e** poder de habilidade; sabedoria aumenta MP e regeneração, e certas classes convertem esse MP em dano, HP ou proteção fatal. Portanto, “mana pura” não representa o mesmo sacrifício em todas as classes. A escolha de alvo e de habilidades também importa: as tentativas exploratórias com uma política de sustentação menos adaptativa bloquearam várias builds que a política pragmática conseguiu levar adiante. Esses bloqueios iniciais foram descartados do quadro principal, não atribuídos como defeito inevitável das classes.

## Comparação direta no nível 70

Cada célula mostra vitórias em 30 confrontos independentes. A configuração de cada forma foi selecionada na sondagem e mantida nos três chefes. Sem itens e com conjunto têm seleções próprias; a diferença entre as colunas não é uma ablação isolada do equipamento. É a capacidade observada em cada cenário sob o mesmo protocolo.

| Forma | Build sem itens | General 70 | Cripta 80 | Eclipse 90 | Build c/ conjunto | General 70 | Cripta 80 | Eclipse 90 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Paladino | resistente | 30/30 | 30/30 | 25/30 | resistente | 30/30 | 30/30 | 30/30 |
| Berserker | resistente | 30/30 | 30/30 | 0/30 | ofensiva | 30/30 | 30/30 | 24/30 |
| Samurai | ofensiva | 18/30 | 3/30 | 0/30 | ofensiva | 30/30 | 30/30 | 3/30 |
| Ninja | resistente | 11/30 | 0/30 | 0/30 | ofensiva | 30/30 | 30/30 | 2/30 |
| Mago Incendiario | mana_pura | 30/30 | 30/30 | 30/30 | mana_pura | 30/30 | 30/30 | 30/30 |
| Mago Frigido | hibrida | 30/30 | 0/30 | 0/30 | mana_pura | 30/30 | 0/30 | 30/30 |
| Arquimago | mana_pura | 30/30 | 30/30 | 30/30 | mana_pura | 30/30 | 30/30 | 30/30 |
| Corrompido | mana_pura | 30/30 | 30/30 | 30/30 | mana_pura | 30/30 | 30/30 | 30/30 |
| Atirador Arcano | equilibrada | 30/30 | 26/30 | 20/30 | arcana | 30/30 | 30/30 | 30/30 |
| Sniper | ofensiva | 30/30 | 24/30 | 10/30 | ofensiva | 30/30 | 30/30 | 27/30 |
| Espreitador | ofensiva | 18/30 | 0/30 | 0/30 | resistente | 26/30 | 1/30 | 0/30 |
| Guarda Florestal | ofensiva | 30/30 | 0/30 | 2/30 | ofensiva | 30/30 | 10/30 | 15/30 |
| Druida Sombrio | ofensiva | 2/30 | 0/30 | 0/30 | forca_pura | 30/30 | 30/30 | 0/30 |
| Avatar da Natureza | ofensiva | 0/30 | 0/30 | 0/30 | ofensiva | 30/30 | 0/30 | 0/30 |
| Fada Monarca | ofensiva | 30/30 | 4/30 | 1/30 | ofensiva | 30/30 | 30/30 | 30/30 |
| Protetor da Floresta | ofensiva | 30/30 | 0/30 | 0/30 | forca_pura | 29/30 | 30/30 | 0/30 |

O General tem 4.035 HP, 360 de ataque, 98 de armadura e 270 MP. O Lorde tem 5.334 HP, 467 de ataque, 130 de armadura e 321 MP. O Imperador tem 6.980 HP, 592 de ataque, 174 de armadura e 391 MP. São os valores finais do motor, não os números crus dos templates.

O **Mago Frígido com conjunto ganhou 30/30 do Imperador 90 e perdeu 30/30 do Lorde 80**. O Lorde combina regeneração, escudo, corte de cura e punição a alvo sem escudo; sua dificuldade não é uma simples interpolação do número do nível. Vencer o Imperador em fixture não permite ultrapassar um Lorde que ainda bloqueia a sequência.

Dois combos adicionais por classe mudaram alguns candidatos selecionados. O quadro seguinte mostra a nova configuração validada quando a sondagem justificou uma validação. As mesmas 30 sementes de validação foram reaproveitadas para comparação: esta é uma extensão exploratória após os primeiros resultados, não um segundo holdout independente.

| Forma | Build | Rotação específica | General 70 | Cripta 80 | Eclipse 90 |
| --- | --- | --- | --- | --- | --- |
| Ninja | ofensiva | Fumaça → Golpes Velozes → Corte | 30/30 | 4/30 | 0/30 |
| Mago Frigido | hibrida | Bola de Neve → Congelar → Explosão | 30/30 | 0/30 | 0/30 |
| Druida Sombrio | ofensiva | Semente → Raízes → Flor → Apodrecer → Colheita | 18/30 | 0/30 | 0/30 |
| Avatar da Natureza | ofensiva | Forma → Semente → Raízes → Flor → básico | 30/30 | 0/30 | 0/30 |
| Protetor da Floresta | ofensiva | Canção → Raízes → Encanto → Canção → Encanto | 18/30 | 0/30 | 0/30 |

Isso também limita a expressão “classe fraca”: melhorar a sequência pode mudar o resultado. Em particular, consumir DOTs cedo com Colheita prejudicava a rotação do Avatar. O ganho obtido ao retirar essa etapa é um problema de execução do combo e não evidência para enfraquecer Colheita.

## Fronteira de campanha com equipamento conquistado

Escolhi entre as trajetórias que chegaram ao 70 e **sete estilos de luta** (os quatro gerais, a política de farm e os dois combos específicos), usando três sementes de sondagem por chefe. Validei a configuração escolhida com **30 sementes adicionais, 30001–30030**. A coluna “último chefe consistente” exige pelo menos 24/30 vitórias em **todos os chefes anteriores**, respeitando a sequência e a região acessível no nível 70. O próximo chefe é uma barreira de consistência, não necessariamente zero vitórias. Não interprete a região bloqueadora como uma região concluída.

No nível 70, a região mais adiantada permitida pelo requisito de nível é Citadela, que abre no 69; Panteão exige 78, Cataclismo 87 e Paradoxo 96. Os testes contra seus chefes acima desse acesso são sondagens de poder, não progresso de campanha legal no 70.

| Forma | Build com equipamento obtido | Estilo | Último chefe consistente | Primeira barreira |
| --- | --- | --- | --- | --- |
| Paladino | resistente | Dano direto | Imperador do Eclipse | Nenhuma até Citadela |
| Berserker | ofensiva | Dano direto | Lorde da Cripta | Imperador do Eclipse |
| Samurai | ofensiva | Dano direto | Lorde da Cripta | Imperador do Eclipse |
| Ninja | ofensiva | Corte → Fumaça → Golpes Velozes | Lorde da Cripta | Imperador do Eclipse |
| Mago Incendiario | mana_pura | Dano direto | Imperador do Eclipse | Nenhuma até Citadela |
| Mago Frigido | ofensiva | Bola de Neve → Congelar → Explosão | Lorde da Cripta | Imperador do Eclipse |
| Arquimago | mana_pura | Dano direto | Imperador do Eclipse | Nenhuma até Citadela |
| Corrompido | mana_pura | Dano direto | Imperador do Eclipse | Nenhuma até Citadela |
| Atirador Arcano | arcana | Dano direto | Imperador do Eclipse | Nenhuma até Citadela |
| Sniper | ofensiva | Dano direto | Imperador do Eclipse | Nenhuma até Citadela |
| Espreitador | resistente | Dano direto | General de Aco | Lorde da Cripta |
| Guarda Florestal | ofensiva | combo:nivel70_0 | General de Aco | Lorde da Cripta |
| Druida Sombrio | ofensiva | Apodrecer → Semente → Raízes → Flor → Colheita | General de Aco | Lorde da Cripta |
| Avatar da Natureza | ofensiva | Forma → Semente → Raízes → Flor → básico | General de Aco | Lorde da Cripta |
| Fada Monarca | ofensiva | Sustentação | Imperador do Eclipse | Nenhuma até Citadela |
| Protetor da Floresta | ofensiva | Adaptativa | Imperador do Eclipse | Nenhuma até Citadela |

A seleção favorece uma boa trajetória entre as testadas e não descreve a experiência média de todo jogador. Cada configuração continua usando sua própria distribuição e itens conquistados; esse quadro mede avanço possível observado. A comparação com conjunto comum é a referência mais controlada para separar diferenças entre kits.

## Qual nível é mais difícil em relação ao nível do inimigo

Aqui o personagem e o inimigo têm **exatamente o mesmo nível**. A matriz sem itens usa quatro distribuições e dois estilos por forma legal; não inclui extremos puros. As colunas com itens usam snapshots do equipamento existente no início daquele nível nas trajetórias correspondentes. Não são os mesmos personagens, nem as mesmas sementes ou quantidades de amostras: os dois cenários não devem ser subtraídos como efeito causal do equipamento. Antes do 30/60, snapshots de rotas futuras podem repetir o mesmo personagem efetivo; os totais são execuções, não amostras independentes. Rotas que não atingiram um nível não fornecem snapshot desse nível.

| Inimigo | Nível de ambos | Sem itens | Com itens obtidos: amostra de trajetórias |
| --- | --- | --- | --- |
| Ent Ancestral | 10 | 0/96 (0,0%) | 16/384 (4,2%) |
| Aranha Gigante | 8 | 8/96 (8,3%) | 108/384 (28,1%) |
| Troll das Profundezas | 20 | 22/96 (22,9%) | 153/384 (39,8%) |
| Cavaleiro Abissal | 51 | 51/192 (26,6%) | 210/384 (54,7%) |
| Slime Toxico | 18 | 26/96 (27,1%) | 240/384 (62,5%) |
| Esqueleto Mineiro | 13 | 27/96 (28,1%) | 202/384 (52,6%) |
| Morcego de Pedra | 11 | 28/96 (29,2%) | 174/384 (45,3%) |
| Lamia do Eclipse | 53 | 56/192 (29,2%) | 239/384 (62,2%) |
| Draco Magmatico | 50 | 62/192 (32,3%) | 221/384 (57,6%) |
| Colosso do Vazio | 58 | 67/192 (34,9%) | 244/360 (67,8%) |
| Salamandra Rubra | 41 | 86/192 (44,8%) | 282/384 (73,4%) |
| Sentinela Quebrada | 21 | 47/96 (49,0%) | 299/384 (77,9%) |
| Golem de Brasa | 43 | 95/192 (49,5%) | 294/384 (76,6%) |
| General de Aco | 70 | 205/384 (53,4%) | 289/342 (84,5%) |

**Nível 10 é o maior bloqueio de chefe do começo.** Ent Ancestral tem 350 HP e 35 de ataque, com uma habilidade que também enfraquece dano. Guerreiro ainda só dispõe de cura ativa; Arqueiro prepara ataques, Mago só tem mísseis e Natureza ainda não tem Raízes. Os kits ofensivos/defensivos da faixa ainda são muito curtos. A Aranha 8 é outro ponto severo, especialmente porque seu material participa do acesso à primeira arma.

**A quebra intermediária é 50–59.** Hidra 40 → Draco 50 muda HP de 1.249 para 2.187 (+75,1%), ataque de 121 para 204 (+68,6%) e armadura de 20 para 49 (+145%). O Draco ainda adiciona 3,5% do HP máximo do herói aos golpes elegíveis e possui queimadura e redução de cura. Na matriz de mesmo nível, as vitórias do jogador caem de 145/192 contra a Hidra para 62/192 contra o Draco. As oito formas intermediárias são as mesmas nas duas faixas.

O Abismo aprofunda a pressão: o Cavaleiro Abissal comum no 51 teve apenas 51/192 vitórias do jogador sem itens; Lâmia 53, 56/192. Não é só o chefe que sobe de dificuldade. O desbloqueio de especialização no 60 traz novo orçamento de atributos e uma ativa nova, recuperando parte das rotas. A média do 60 também passa a conter 16 formas, portanto não é diretamente a mesma população das oito formas do 50.

A recomendação é reduzir a concentração de saltos simultâneos no 50: distribuir HP/ataque/armadura e o dano de HP máximo ao longo da região, revisar a primeira arma e dar ferramentas úteis antes do 20. Simplesmente diminuir o HP de todos os chefes deixaria ainda mais fáceis os abates explosivos dos magos.

## Diagnóstico de cada especialização

### Paladino
É uma das referências mais estáveis de tanque ofensivo. Vida sustenta Julgamento, cura por turno e Aura Divina; o investimento resistente tem retorno em ataque e sobrevivência. Na validação sem itens, a configuração resistente ganhou 30/30 do General, 30/30 do Lorde e 25/30 do Imperador. Não deve receber um buff genérico junto das outras rotas de Guerreiro. Na ablação de três chefes, retirar Julgamento derrubou as vitórias de 85/90 para 30/90. Brado e Contundir podem ter valor situacional mesmo quando o bot prioriza Julgamento.

### Berserker
O kit tem um contraste importante: **Contundir é muito forte; o pacote de sacrifício é pouco atraente.** A configuração resistente de dano direto ganhou 60/90 contra General/Lorde/Imperador; sem Contundir caiu para 30/90. Abrir com Ira caiu para 0/90; abrir com Vallhala, para 18/90. Ira cobra 80% do HP máximo e Vallhala triplica dano recebido. O bônus por vida máxima inimiga pode causar muito dano, mas a ação de preparação e a resposta imediata do chefe cobram demais. Reequilibrar risco/retorno e timing dessas duas ativas é melhor do que buffar todo o dano da classe.

### Samurai
O dano sem equipamento fica aquém de Paladino/Berserker, apesar da defesa reativa. A configuração ofensiva de dano direto ganhou 18/30 do General, 3/30 do Lorde e 0/30 do Imperador; com conjunto passou a 30/30, 30/30 e 3/30. Isso revela dependência de reserva defensiva e da janela de executar as habilidades. Furar Blindagem tem nicho real contra escudo; Corte Profundo evita armadura; Golpes Velozes paga armadura por golpe. Mente Limpa beneficia o primeiro básico, não qualquer primeira skill. Rever a recompensa dessa abertura e a sobrevivência do caminho, sem antecipar Cortes Ultrassônicos, que só vem no 80.

### Ninja
Há sinergia entre esquiva, contra-ataque que ignora defesa e Eliminar abaixo de metade da vida. A consistência sem itens foi baixa na rotação genérica; combos específicos aumentam sua competitividade e precisam ser considerados junto da tabela extra. O conjunto comum permite passar o Lorde com a build ofensiva. Bomba de Fumaça garante a reação, mas seu bônus de próximo dano pode ser consumido no contra-ataque; a interface deveria deixar isso claro. Mata-Gigantes é nível 80 e não foi usada para justificar poder no 70.

### Mago Incendiário
É forte, mas não pelo mesmo mecanismo de Arcanista. Mana e Vida converte MP em HP e também dá poder de habilidade à rota; Bola de Fogo soma dano da vida atual e queimadura da vida máxima, ampliada no 70. Mana pura ganhou 30/30 dos três chefes principais sem itens. Fênix Sagrada **não é uma habilidade morta**: apareceu 915 vezes na seleção de dano direto da sondagem completa, embora seu custo seja alto e retirar a skill não tenha reduzido as vitórias nos três chefes da ablação. O excesso principal a revisar é o acúmulo de retornos da mesma sabedoria e o orçamento de dano percentual em chefe.

### Mago Frígido
O perfil até o 70 é de controle, mitigação e HP convertido de mana. Ainda não tem Avalanche. A comparação sem itens fica bem abaixo dos outros magos na progressão de chefes, e o Lorde é um contraexemplo forte à ideia de dificuldade estritamente por nível. Nevasca custa uma ação para 15% de chance de perder o ataque por seis turnos; Congelar e Bola de Neve já causam dano e fornecem controle/mitigação. O problema de efeitos aplicados mesmo após controle diminui ainda mais o retorno defensivo. Corrigir a resolução antes de decidir um buff geral de controle.

### Arquimago
Continua acima da curva com mana, mesmo após a correção antiga do bônus fixo por míssil. A configuração de mana pura ganhou 30/30 de General, Lorde, Imperador e Zenith sem equipamento; ganhou 23/30 do Deus da Ruína e 0/30 do Paradoxo. O bônus de Transbordando é **por ação**, mas ainda cresce muito com MP máximo. O básico custa apenas 30 MP no 70, enquanto a regeneração cresce com toda a reserva. Escudo de Mana e Concentração não melhoraram a taxa já saturada dos três chefes da ablação; isso não prova inutilidade em conteúdo mais longo. Concentrar todo o retorno em reserva máxima torna o básico competitivo demais com skills que pagam o custo extra arcano.

### Corrompido
É o excesso ofensivo mais evidente na abertura. Mana pura matou General e Lorde em uma ação em 30/30 sementes, sem equipamento; Imperador e Zenith caíram em duas. Canhão de Vidro dobra o primeiro dano e a vulnerabilidade dos primeiros turnos pouco contrabalança uma luta que termina imediatamente. Contra o General, Explosão de Mana removeu 5.398 HP com mana inimiga cheia e 4.318 com mana inimiga zero; o chefe tem 4.035 HP. Portanto, o excesso **não se resume à drenagem do alvo**. Rever a combinação reserva máxima + Transbordando + bônus de abertura; não reabrir o defeito antigo já corrigido de repetir todo o bônus por projétil.

### Atirador Arcano
É forte no grupo de arqueiros. Headshot domina muitas situações; na configuração equilibrada, retirar Headshot reduziu 76/90 para 24/90 vitórias nos três chefes. Emergência Arcana perdeu espaço: a regeneração alta e os custos menores frequentemente mantêm a mana perto do máximo, onde a habilidade tem pouco bônus. Abrir com ela caiu de 76/90 para 52/90; ela não foi escolhida pelo bot de dano direto na sondagem. Continua havendo um nicho com mana realmente esgotada, mas Sobreaquecer, a ferramenta óbvia para esgotá-la, só chega no 80. Revisar essa conexão no kit do 60–70.

### Sniper
Executar e Tiro Perfurante têm papéis reais: retirar Executar custou 14 vitórias e retirar Tiro Perfurante custou 11 na amostra de 90. Chance de crítico acima de 100% vira dano extra e dá retorno claro a Olhos de Falcão. Mirar, porém, perdeu para a economia de ações das skills: abrir com Mirar reduziu 64/90 para 47/90. Isso não elimina seu uso em farm por básicos, mas mostra que o bônus de cinco turnos pode chegar tarde em chefes que exigem burst. A build ofensiva com conjunto foi consistente até o Imperador (27/30), sem reproduzir a abertura de uma ação do Corrompido.

### Espreitador
É uma das rotas mais fracas de forma persistente no protocolo principal. Sem itens, 18/30 do General, 0/30 do Lorde e 0/30 do Imperador; com conjunto e build resistente, 26/30, 1/30 e 0/30. Camuflagem → Surpresa é uma interação útil, não um combo inexistente: retirar Surpresa custou 12 vitórias e retirar Camuflagem custou nove na amostra principal de 90. O problema é pagar uma ação de preparo para uma recompensa modesta frente a Headshot/Executar e à pressão dos chefes. Melhorar a compressão de ações ou a recompensa condicional, sem simplesmente aumentar esquiva global.

### Guarda Florestal
Fica entre os arqueiros frágeis de dano e as rotas de sustentação. Cura por esquiva, redução e Tranquilizante dão sobrevivência; Rajada passa a três ataques. No 70, Resistência Florestal dá apenas 14 de redução fixa, pouco diante de golpes de centenas com parcela de HP máximo. Com conjunto, venceu o General em 30/30, mas teve 10/30 contra o Lorde e 15/30 contra o Imperador. Precisa converter defesa em pressão útil e ter mitigação relevante na faixa, respeitando que cada golpe de Rajada paga armadura separadamente.

### Druida Sombrio
O preparo longo é o principal custo: marca, enraizamento, veneno e apodrecimento competem com uma janela curta de sobrevivência. A configuração genérica ofensiva sem itens teve 2/30 do General; a sequência específica com preparo deve ser lida na tabela extra. Com conjunto, a build de força pura ganhou 30/30 de General e Lorde. Portanto, chamá-lo de inviável apagaria um caso forte de dependência de item/distribuição. Seiva cura 8% do dano dos DOTs, que pode ser insuficiente antes de eles acumularem. Melhorar fluidez e um caminho de aplicação menos dependente de Raízes é mais preciso do que aumentar todo DOT percentual.

### Avatar da Natureza
É uma prioridade de revisão do lado de Natureza solo, mas o resultado é muito sensível à rotação. Sem itens a sequência genérica não passou o General em 30 sementes; a sequência dedicada à Forma Verdadeira ganhou **30/30 do General**, ainda com 0/30 de Lorde/Imperador. Com conjunto, o protocolo principal também passou o General e parou nos dois seguintes. Forma cobra **toda a mana máxima**, custa uma ação e concede ataque/mitigação por cinco turnos; quem investiu em mana paga mais sem necessariamente converter isso em dano proporcional. Casca ajuda, mas o kit mais explosivo só chega no 80. Retirar Colheita da rotação genérica melhorou General de 0/30 para 18/30, mostrando uma falha de timing do bot. Não há base para chamar a transformação de inútil; sua fluidez e retorno devem ser julgados pela sequência que efetivamente funciona.

### Fada Monarca
É bem mais forte com equipamento do que a leitura de dano inicial sugere. Com conjunto comum e build ofensiva venceu os três chefes principais em 30/30. Curar constrói Cadência, que fortalece Decreto; Semente reduz dano, e Asas dá esquiva no 70. Tirar Canção derrubou a amostra sem itens de 35/90 para 7/90. Não deve receber o mesmo buff genérico recomendado a Avatar. Coroar só chega no 80; o bônus coroado de Asas não está disponível por uma habilidade própria no recorte, mas os 20% normais de esquiva já funcionam.

### Protetor da Floresta
Funciona como sustentação, mas pode virar combate excessivamente longo em solo. Canção e Casulo competem pela mesma ação; Juramento reflete dano absorvido, e o conjunto Bastião dá outra conversão defensiva. Sem itens, retirar Canção levou 30/90 para 0/90 na amostra principal. Com conjunto, a build de força venceu General em 29/30 e Lorde em 30/30, mas não Imperador. Jogar Espinhos é nível 80 e ainda não pode resolver sua falta de finalização no 70. Qualquer ajuste deve preservar o papel de suporte e ser verificado em grupo depois; este relatório não mede sua contribuição cooperativa.

## Relevância das habilidades

**Nem todas as habilidades têm uma razão igualmente forte para usar no fim do recorte.** Frequência do bot sozinha não basta: o estilo de dano direto quase nunca escolhe defesa ou preparo. Para dar um sinal mais útil, a ablação retira uma habilidade e reexecuta os três chefes com as mesmas 30 sementes iniciais por chefe; o bot adapta a ação restante. Outro teste força a habilidade na primeira ação e depois volta à política original. Isso mede uma abertura concreta, não a melhor hora possível de usar a habilidade.

As amostras da ablação são **sem itens**, com as configurações do quadro principal de quatro estilos; não são automaticamente os combos adicionais. Uma abertura ruim com Executar, por exemplo, não elimina seu valor quando o alvo já está abaixo de 40% de HP.

| Forma | Habilidade | Rotação original | Sem a habilidade | Abrindo com ela |
| --- | --- | --- | --- | --- |
| Berserker | Ira | 60/90 | 60/90 | 0/90 |
| Berserker | Vallhala | 60/90 | 60/90 | 18/90 |
| Atirador Arcano | Emergencia Arcana | 76/90 | 76/90 | 52/90 |
| Sniper | Mirar | 64/90 | 64/90 | 47/90 |
| Espreitador | Mirar | 18/90 | 18/90 | 9/90 |
| Arquimago | Concentracao | 90/90 | 90/90 | 90/90 |
| Arquimago | Escudo de Mana | 90/90 | 90/90 | 90/90 |
| Avatar da Natureza | Forma Verdadeira | 0/90 | 0/90 | 0/90 |
| Mago Incendiario | Fenix Sagrada | 90/90 | 90/90 | 90/90 |
| Paladino | Julgamento | 85/90 | 30/90 | 85/90 |
| Protetor da Floresta | Cancao Ancestral | 30/90 | 0/90 | 30/90 |

**Prioridade para rever relevância:** Ira e Vallhala (risco/ação), Emergência Arcana antes do 80 (falta uma forma atraente de chegar com MP baixo), Mirar no combate de skills (tempo de retorno), Forma Verdadeira (custo e janela), e Nevasca (competição com controle que também causa dano). Escudo de Mana/Concentração não são “provas de habilidade inútil” quando a build já mata todos os alvos da amostra: é preciso testar sobrevivência/tempo/consumo em confrontos mais longos.

**Habilidades que mantêm função demonstrável:** Julgamento, Contundir do Berserker, Headshot do Atirador Arcano, Executar e Tiro Perfurante do Sniper, Camuflagem/Surpresa do Espreitador, Tranquilizante/Rajada do Guarda, Canção Ancestral e Decreto. Semente/Raízes/Flor/Colheita devem ser julgadas pela cadeia de DOT e seu timing, não só pelo dano imediato.

O inventário completo de variantes de ativas/passivas, níveis, tipos, custos e descrições está em [habilidades.csv](qa/balance70/habilidades.csv). Os resultados de uso/retirada/abertura por ativa herdada estão em [relevancia.csv](qa/balance70/relevancia.csv). Os valores das descrições são exemplos com distribuição equilibrada e um alvo de teste de 20.000 HP/80 de armadura/zero mana; não substituem as fórmulas dinâmicas nem representam dano no General.

As 452 sondagens incluem estado normal, DOTs/recursos preparados, mana ampliada para exercitar custo e alvo com escudo. As 68 verificações de passivas passaram seus predicados funcionais; isso não demonstra que os valores estejam equilibrados. As sondagens com recurso ampliado são fixtures funcionais e não entram no ranking de builds legais. Ira não era legal com o HP inicial reduzido a 70% nos três estados sem HP ampliado: exigir mais que o custo de 80% foi respeitado. Os 1.356 testes com conjuntos comuns passaram sem exceções ou números não finitos.

## Problema funcional que precisa vir antes dos buffs e nerfs

`resolveBossAction` aplica queimadura, redução de cura/dano e controle antes de `enemyTurn` decidir se o ataque foi impedido. Esquiva é resolvida ainda depois, em `applyIncomingDamage`. Resultado medido com Paladino resistente e a mesma habilidade forçada para isolar a ordem:

| Chefe / ação | Dano sem defesa | Dano com ataque impedido ou esquiva garantida | Efeitos que continuam entrando |
| --- | --- | --- | --- |
| Hidra / Sopro Corrosivo | 62 HP | 0 HP | Queimadura 3 turnos e −50% cura por 3 turnos |
| General / Marcha de Ferro | 580 HP | 0 HP | −25% dano causado por 3 turnos |
| Lorde / Sentença Fúnebre | 757 HP | 0 HP | −50% cura por 4 turnos e −15% dano por 2 turnos |

Os mesmos efeitos persistiram com `skipNextAttack`, esquiva automática e a chance da nevasca forçada a 100% para testar o ramo. Forçar esses estados não altera os números do ranking: é somente uma fixture determinística de diagnóstico. **Isso faz “perder o turno” e “esquivar” protegerem menos do que a descrição sugere.** Se o design quiser manter algum efeito inevitável, essa exceção precisa ser explícita por habilidade; aplicar tudo antes do resultado torna a leitura das classes de controle enganosa.

Fonte: [game.js:6886](../assets/js/game.js#L6886), funções `resolveBossAction`, `enemyTurn` e `applyIncomingDamage`; prova em [mechanics.json](qa/balance70/mechanics.json). Ajustar a ordem ou a regra explícita, repetir os confrontos e só depois fechar os números de Congelar, Nevasca, Camuflagem e demais defesas.

Também foi rechecado o problema histórico de dano por projétil/cargas. O código atual distribui o bônus fixo dos mísseis por ação. No teste de Arquimago equilibrado contra o General, zero/três/seis cargas produziram 1.176/1.343/1.512 no mesmo ataque inicial. Não se deve importar do relatório antigo a conclusão de que o bônus fixo inteiro ainda se repete em cada míssil ou de que Carregar necessariamente aplica o percentual duas vezes.

## Todos os inimigos

Tabela de valores finais e vitórias de personagens **nível 70**. “Sem itens” agrega as 16 configurações selecionadas, 30 sementes cada; “conjunto” agrega as 16 seleções próprias com cinco peças comuns da Fortaleza. As colunas servem para comparar encontros no mesmo patamar do personagem. Não são taxas de jogadores do nível indicado na coluna do inimigo; inimigos acima do acesso da região continuam sendo fixtures de diagnóstico.

| Inimigo | Nv. | HP | ATQ | Armadura | MP | Vitórias sem itens | Vitórias c/ conjunto |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Lobo Sombrio | 1 | 88 | 10 | 1 | 0 | 480/480 | 480/480 |
| Goblin | 3 | 136 | 15 | 1 | 0 | 480/480 | 480/480 |
| Aranha Gigante | 8 | 240 | 27 | 1 | 0 | 480/480 | 480/480 |
| Ent Ancestral **chefe** | 10 | 350 | 35 | 5 | 60 | 480/480 | 480/480 |
| Morcego de Pedra | 11 | 288 | 32 | 3 | 0 | 480/480 | 480/480 |
| Esqueleto Mineiro | 13 | 336 | 37 | 3 | 0 | 480/480 | 480/480 |
| Slime Toxico | 18 | 444 | 48 | 4 | 0 | 480/480 | 480/480 |
| Troll das Profundezas **chefe** | 20 | 610 | 62 | 8 | 70 | 480/480 | 480/480 |
| Sentinela Quebrada | 21 | 506 | 55 | 7 | 0 | 480/480 | 480/480 |
| Cultista Perdido | 23 | 554 | 61 | 7 | 0 | 480/480 | 480/480 |
| Fantasma Antigo | 28 | 669 | 72 | 8 | 0 | 480/480 | 480/480 |
| Rei Espectral **chefe** | 30 | 897 | 91 | 14 | 91 | 480/480 | 480/480 |
| Sapo Colossal | 31 | 734 | 81 | 12 | 0 | 480/480 | 480/480 |
| Bruxa do Brejo | 33 | 784 | 87 | 12 | 0 | 480/480 | 480/480 |
| Serpente do Lodo | 38 | 912 | 101 | 14 | 0 | 480/480 | 480/480 |
| Hidra do Lodo **chefe** | 40 | 1249 | 121 | 20 | 124 | 480/480 | 480/480 |
| Salamandra Rubra | 41 | 1577 | 159 | 34 | 0 | 480/480 | 480/480 |
| Golem de Brasa | 43 | 1666 | 169 | 35 | 0 | 480/480 | 480/480 |
| Fenix Sombria | 48 | 1885 | 189 | 38 | 0 | 480/480 | 480/480 |
| Draco Magmatico **chefe** | 50 | 2187 | 204 | 49 | 179 | 480/480 | 480/480 |
| Cavaleiro Abissal | 51 | 2361 | 230 | 51 | 0 | 480/480 | 480/480 |
| Lamia do Eclipse | 53 | 2465 | 241 | 52 | 0 | 480/480 | 480/480 |
| Colosso do Vazio | 58 | 2749 | 265 | 55 | 0 | 480/480 | 480/480 |
| Arauto do Vazio **chefe** | 60 | 2994 | 273 | 70 | 223 | 477/480 | 480/480 |
| Escudeiro de Ferro | 61 | 3392 | 320 | 73 | 0 | 480/480 | 480/480 |
| Maga da Muralha | 63 | 3520 | 334 | 75 | 0 | 480/480 | 480/480 |
| Carrasco de Guerra | 68 | 3862 | 364 | 78 | 0 | 447/480 | 480/480 |
| General de Aco **chefe** | 70 | 4035 | 360 | 98 | 270 | 379/480 | 475/480 |
| Guardiao Funebre | 71 | 4773 | 431 | 101 | 0 | 370/480 | 476/480 |
| Feiticeira Morta | 73 | 4951 | 446 | 102 | 0 | 331/480 | 476/480 |
| Ceifador de Ossos | 78 | 5383 | 481 | 107 | 0 | 314/480 | 473/480 |
| Lorde da Cripta **chefe** | 80 | 5334 | 467 | 130 | 321 | 207/480 | 371/480 |
| Anjo Caido | 81 | 6566 | 568 | 136 | 0 | 271/480 | 402/480 |
| Drake Celeste | 83 | 6790 | 585 | 138 | 0 | 268/480 | 400/480 |
| Executor Astral | 88 | 7328 | 627 | 143 | 0 | 261/480 | 380/480 |
| Imperador do Eclipse **chefe** | 90 | 6980 | 592 | 174 | 391 | 148/480 | 281/480 |
| Guardiao Aureo | 91 | 8872 | 739 | 181 | 0 | 167/480 | 281/480 |
| Oraculo Radiante | 93 | 9172 | 761 | 183 | 0 | 165/480 | 274/480 |
| Quimera Solar | 98 | 9856 | 808 | 189 | 0 | 100/480 | 230/480 |
| Avatar do Zenith **chefe** | 100 | 9005 | 754 | 228 | 466 | 65/480 | 102/480 |
| Arauto do Cataclismo | 101 | 11926 | 960 | 237 | 0 | 56/480 | 147/480 |
| Titan Rachado | 103 | 12299 | 989 | 240 | 0 | 48/480 | 126/480 |
| Serafim do Fim | 108 | 13167 | 1049 | 247 | 0 | 45/480 | 98/480 |
| Deus da Ruina **chefe** | 110 | 11737 | 975 | 294 | 550 | 24/480 | 4/480 |
| Guardiao Temporal | 111 | 15402 | 1228 | 298 | 0 | 9/480 | 14/480 |
| Oraculo do Zero | 113 | 15877 | 1260 | 301 | 0 | 0/480 | 12/480 |
| Devorador de Eras | 118 | 16963 | 1331 | 310 | 0 | 0/480 | 8/480 |
| Soberano do Paradoxo **chefe** | 120 | 14648 | 1197 | 368 | 656 | 0/480 | 0/480 |

Os 36 inimigos comuns compartilham o mesmo fluxo de ataque básico, variando atributos, armadura, perfil regional e impacto de HP máximo. Os chefes têm seus próprios conjuntos de habilidades, mana, regeneração e seleção por pontuação. A IA escolhe a habilidade disponível de maior pontuação; não usa a propriedade `chance` do catálogo como sorteio de frequência. Portanto, ler “22%” no objeto da habilidade não descreve quantas vezes o chefe a usa atualmente.

Os cortes de defesa a partir do Vulcão/Abismo e os picos de armadura prejudicam ataques pequenos repetidos. O dano proporcional ao HP máximo faz aumentar vitalidade oferecer retorno menor do que o HP bruto sugere. Mana dos chefes faz Explosão de Mana ganhar mais dano em alvos de patamar alto; por isso um inimigo mais forte também alimenta parte da ofensiva do Mago. Contra o mesmo General e com a mesma build equilibrada do Incendiário, zerar somente a mana atual do alvo mudou Explosão de 1.246 para 706 de dano: 540 vêm dos 135 MP drenados ×4. No Corrompido, o bônus de abertura dobra também essa diferença.

Nos chefes posteriores, defesa penetrada, anti-cura, regeneração, escudo e controle aparecem juntos. Isso pode ser bom para identidade de encontro, mas não deveria tornar todo combate um teste de matar antes da primeira resposta. O Lorde é uma evidência útil de contra-arquétipo; o problema é quando uma classe não dispõe de resposta no intervalo de níveis em que o encontro está acessível.

## Ajustes recomendados e ordem de validação

1. **Resolver os efeitos aplicados apesar de controle/esquiva.** Repetir os três casos determinísticos e depois General/Lorde/Imperador com as classes defensivas. Esse é um problema funcional observado, não uma preferência de coeficiente.
2. **Reduzir a abertura excessiva de Corrompido e o retorno acumulado de MP em Arcanista.** Testar separadamente bônus de abertura, conversão de reserva em dano e custo dos básicos. Preservar o bônus por ação já corrigido. Meta inicial de design: chefes equivalentes sobreviverem à primeira ação de builds legais comuns, permitindo ao menos uma resposta e uma decisão defensiva.
3. **Suavizar o começo e o salto 50–59.** Rever a arma inicial/material de Aranha; distribuir as elevações de HP/ataque/armadura e impacto percentual ao longo da região. Oferecer uma ofensiva simples e barata antes do 20 para os kits que ficam muito tempo sem alternativa. Não reduzir todos os chefes uniformemente.
4. **Dar retorno utilizável às ações de preparo.** Ira precisa de custo/janela que permita receber uma resposta; Vallhala precisa de risco compatível com o ganho; Forma Verdadeira precisa recompensar a ação e a mana sacrificadas. Para Emergência Arcana, testar um gatilho útil antes do desbloqueio de Sobreaquecer. Para Mirar e Nevasca, comparar valor em dois/quatro/seis turnos reais.
5. **Reforçar as rotas que continuam atrás sob equipamento comparável.** Avatar e Espreitador merecem prioridade. Sombrio precisa de fluidez de DOT e sobrevivência durante o preparo; Guarda precisa de retorno defensivo relevante na faixa. Fada e Paladino não devem receber o mesmo buff global apenas por dividirem a classe-base com rotas fracas.
6. **Validar suporte em grupo e o PvP em matrizes próprias.** Somar valor de cura/escudo efetivos, turnos ganhos e dano aliado habilitado; não usar vitória solo para definir o orçamento completo de um suporte.

Essas são propostas para a próxima rodada. Nenhum coeficiente sugerido foi aplicado nem anunciado como já validado. Após cada alteração, usar as mesmas configurações e sementes para a comparação, acrescentando um lote novo de validação para não ajustar somente aos casos já conhecidos.

## Evidências e reprodução

O diretório [qa/balance70](qa/balance70/) contém o motor de teste, runner, dados crus, hashes, catálogo, tabelas e instruções. [summary.json](qa/balance70/summary.json) deriva as contagens e quadros sem implementar regras de combate. [README da suíte](qa/balance70/README.md) descreve os comandos e quais arquivos são exploratórios.

O conjunto de evidências dá suporte às diferenças observadas de classe, rota, atributo, ação e inimigo. Não demonstra balanceamento perfeito, estratégia ótima, taxa populacional de jogadores ou equivalência de PvE/PvP/co-op.

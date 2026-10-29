# Classes, distribuições e combos — avaliação ampliada

Base: código atual do projeto, commit `c70b9f3`. O código do jogo foi preservado. Esta avaliação descreve o comportamento atual; alterações e números de itens são propostas para um ciclo posterior.

## Cobertura e leitura dos resultados

Foram executadas **44.780 lutas simuladas** e **6.720 janelas de rotação**, além de 516 sondagens de habilidades ativas, 68 verificações de gatilhos passivos e 12 cenários de cura/área na dungeon. A matriz cobre quatro classes-base, oito especializações intermediárias e 16 finais: 28 formas, em 100 combinações de forma e nível.

Ações passam pelas funções reais `attack`, `useSkill` e `passTurn`, com a IA inimiga original. Animação, DOM, espera, XP e recompensa foram desativados para medir combate. Cada ponto foi distribuído no nível em que seria ganho, com os valores daquele nível. Sem respec para inflar atributos, sem equipamento, sem poções e com HP/MP cheios no início de cada luta.

A triagem principal usa cinco sementes por célula. As duas rotações adicionais de cada especialização final usam dez. A validação usa 30 sementes diferentes, incluindo Panteão, Cataclismo, Paradoxo, inimigo comum do Panteão e um alvo de teste com resposta constante. Configurações repetidas como referência não viram amostras independentes; algumas builds são idênticas no nível 1 por ainda não terem pontos.

As políticas são heurísticas, não um jogador perfeito nem prova de inviabilidade. A escolha de dano usa sondagem independente da aleatoriedade futura da luta. Companheiros não participam da matriz solo. Não se deve usar estas taxas como ranking PvP: o motor defensivo da arena ainda tem os problemas identificados no relatório anterior.

A janela de rotação usa até seis turnos, ou termina ao matar o alvo. O alvo tem 100.000 HP, 80 de armadura e não ataca; portanto mede sequência/dano e disponibilidade de recurso, sem validar sobrevivência. Resultados que chegam a 100.000 são limitados pelo HP do alvo. Não comparar formas de níveis diferentes como se estivessem no mesmo patamar.

## O que os pontos realmente fazem

Força melhora ataque **e** poder de habilidade pelo ganho investido; sabedoria melhora MP máximo, que também alimenta regeneração e conversões de algumas rotas; vitalidade melhora HP. Portanto, “mana pura” no mago pode trazer vida e dano, enquanto no guerreiro pode deixar pouco dano direto. A regeneração normal de 10% do MP máximo por turno torna muitas habilidades sustentáveis sem gasto líquido nas builds com mana.

| Distribuição | Força / Vitalidade / Sabedoria | Objetivo |
| --- | --- | --- |
| equilibrada | 33/33/33 | referência geral |
| forca_pura | 100/0/0 | extremo ofensivo |
| vida_pura | 0/100/0 | extremo de HP |
| mana_pura | 0/0/100 | extremo de MP/conversões |
| ofensiva | 60/20/20 | dano com alguma reserva |
| resistente | 20/60/20 | sobrevivência com recursos |
| arcana | 20/20/60 | reserva/escala de MP |
| hibrida | 40/20/40 | força e mana |

Os percentuais são alvos de proporção; os 99 pontos do nível 100 são inteiros. Na equilibrada são 33/33/33 pontos. A política resistente termina com aproximadamente 20/59/20 pontos, por arredondamento cronológico.

Quatro estilos gerais foram comparados: básico; dano direto imediato; roteiro de combo; sustentação com reação a HP, escudo e debuffs. Foram adicionadas duas rotações específicas por especialização final. Se faltar recurso ou a habilidade estiver travada, o roteiro registra/substitui a tentativa por uma ação legal; não é contado como se o combo tivesse sido executado.

## Comparação das oito distribuições

Triagem contra o chefe do Panteão, personagem nível 100. Cada célula mostra vitórias/tentativas da melhor política observada para aquela distribuição: cinco sementes nas políticas gerais ou dez nas rotações específicas. É uma comparação exploratória com amostras pequenas; a tabela seguinte de especializações traz a validação com sementes novas. F/V/S são força/vitalidade/sabedoria.

| Forma | 33/33/33 | 100/0/0 | 0/100/0 | 0/0/100 | 60/20/20 | 20/60/20 | 20/20/60 | 40/20/40 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Paladino | 5/5 | 0/5 | 0/5 | 0/10 | 0/10 | 5/5 | 0/10 | 0/10 |
| Berserker | 0/5 | 0/5 | 0/10 | 0/5 | 0/5 | 0/5 | 0/5 | 0/5 |
| Samurai | 0/5 | 0/10 | 0/5 | 0/5 | 1/5 | 0/5 | 0/5 | 0/5 |
| Ninja | 1/5 | 0/10 | 0/5 | 0/5 | 4/10 | 1/5 | 0/5 | 1/10 |
| Mago Incendiario | 0/5 | 0/5 | 0/5 | 5/5 | 0/5 | 0/5 | 5/5 | 0/5 |
| Mago Frigido | 5/5 | 1/5 | 0/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 |
| Arquimago | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 |
| Corrompido | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 |
| Atirador Arcano | 8/10 | 4/5 | 0/10 | 5/5 | 4/5 | 5/5 | 10/10 | 8/10 |
| Sniper | 5/5 | 1/5 | 0/5 | 1/5 | 10/10 | 5/5 | 4/5 | 5/5 |
| Espreitador | 0/5 | 0/5 | 0/5 | 0/5 | 0/5 | 0/5 | 0/5 | 0/5 |
| Guarda Florestal | 0/10 | 0/5 | 0/5 | 0/5 | 0/10 | 0/5 | 0/5 | 0/5 |
| Druida Sombrio | 0/5 | 5/5 | 0/5 | 0/5 | 0/5 | 0/5 | 0/5 | 0/5 |
| Avatar da Natureza | 0/10 | 0/10 | 0/5 | 0/5 | 0/5 | 0/10 | 0/5 | 0/5 |
| Fada Monarca | 0/10 | 0/5 | 0/10 | 0/5 | 5/5 | 0/10 | 0/5 | 0/5 |
| Protetor da Floresta | 0/10 | 0/5 | 0/5 | 0/5 | 0/10 | 0/10 | 0/10 | 0/10 |

## Principais conclusões

1. **Arquimago e Corrompido estão estruturalmente acima da curva.** O básico matou os três chefes em uma ação nas sementes de validação. MP gera dano fixo por míssil, e o custo do básico é coberto pela recuperação.
2. **Carregar aplica mais dano do que o bônus nominal indica.** Em teste controlado, três cargas nominalmente +15% levaram o básico de 25.636 a 33.891 de dano: cerca de +32,2%. O percentual entra antes e dentro da aplicação de dano.
3. **Boa build depende da rota.** Paladino resistente, Sniper equilibrado e Atirador Arcano de mana obtiveram resultados diferentes de simplesmente escolher força para todos.
4. **Dano alto em alvo parado não garante build boa.** Berserker perde sobrevivência; Sombrio força pura vence uma abertura específica e morre para o inimigo comum; Protetor exige preparação real de escudo.
5. **Suporte precisa funcionar corretamente antes de receber números finais.** Canção Ancestral lançada por convidado da dungeon pode deixar o host sem cura e aplicar novamente o benefício ao conjurador.
6. **Os itens devem premiar decisões por ação e mistura de atributos.** Multiplicar MP/dano fixo/percentuais por raridade e por cada projétil agravaria as distorções.

## Classes-base e especializações intermediárias

Tabela de triagem: melhor resultado observado contra o chefe da faixa na última etapa da forma, sem itens. Cada resultado é de cinco sementes; não comparar a coluna de vitórias entre níveis diferentes como ranking geral.

| Forma | Nível | F/V/S | Estilo | Vitórias | HP do chefe removido, média |
| --- | --- | --- | --- | --- | --- |
| Guerreiro | 20 | 60/20/20 | dano direto | 0/5 | 54% |
| Cavaleiro | 50 | 60/20/20 | dano direto | 5/5 | 100% |
| Espadachim | 50 | 20/60/20 | dano direto | 2/5 | 93% |
| Mago | 20 | 0/0/100 | dano direto | 5/5 | 100% |
| Elementalista | 50 | 60/20/20 | básico | 5/5 | 100% |
| Arcanista | 50 | 33/33/33 | básico | 5/5 | 100% |
| Arqueiro | 20 | 100/0/0 | básico | 0/5 | 32% |
| Atirador | 50 | 60/20/20 | dano direto | 4/5 | 95% |
| Cacador | 50 | 60/20/20 | sustentação | 1/5 | 66% |
| Adepto da Natureza | 20 | 100/0/0 | dano direto | 0/5 | 56% |
| Druida | 50 | 60/20/20 | roteiro de combo | 3/5 | 98% |
| Espirito da Floresta | 50 | 60/20/20 | sustentação | 5/5 | 100% |

Nas formas-base o kit ainda é curto; defesa, cura e escolha de alvo pesam muito. Cavaleiro desenvolve vida/regeneração; Espadachim depende de acertar sua janela; Elementalista acrescenta DOT/controle; Arcanista já começa a distorção do dano por mana; Atirador ganha burst, Caçador ganha desgaste/economia; Druida ganha a sequência de DOT, Espírito passa a construir suporte/Cadência.

## Especializações finais — validação com sementes novas

Para cada forma, a tabela mostra uma das configurações testadas que teve melhor resultado no Panteão, entre as finalistas e a referência. A mesma configuração é então comparada nos outros dois chefes. A seleção é exploratória; não significa que seja a melhor contra todo adversário. Suportes estão sendo medidos solo.

| Forma | F/V/S | Estilo | Panteão | Cataclismo | Paradoxo |
| --- | --- | --- | --- | --- | --- |
| Paladino | 20/60/20 | dano direto | 30/30 | 30/30 | 0/30 |
| Berserker | 20/60/20 | dano direto | 0/30 | 0/30 | 0/30 |
| Samurai | 60/20/20 | dano direto | 7/30 | 0/30 | 0/30 |
| Ninja | 20/60/20 | dano direto | 18/30 | 1/30 | 0/30 |
| Mago Incendiario | 0/0/100 | dano direto | 30/30 | 17/30 | 0/30 |
| Mago Frigido | 20/60/20 | dano direto | 30/30 | 30/30 | 29/30 |
| Arquimago | 33/33/33 | básico | 30/30 | 30/30 | 30/30 |
| Corrompido | 33/33/33 | básico | 30/30 | 30/30 | 30/30 |
| Atirador Arcano | 0/0/100 | dano direto | 30/30 | 16/30 | 11/30 |
| Sniper | 33/33/33 | dano direto | 30/30 | 27/30 | 17/30 |
| Espreitador | 20/60/20 | dano direto | 0/30 | 0/30 | 0/30 |
| Guarda Florestal | 20/60/20 | sustentação | 0/30 | 0/30 | 0/30 |
| Druida Sombrio | 100/0/0 | dano direto | 30/30 | 0/30 | 0/30 |
| Avatar da Natureza | 60/20/20 | roteiro de combo | 0/30 | 0/30 | 0/30 |
| Fada Monarca | 60/20/20 | sustentação | 24/30 | 0/30 | 0/30 |
| Protetor da Floresta | 60/20/20 | combo: cancao espinhos | 0/30 | 0/30 | 0/30 |

Chefes: Avatar do Zenith (nível 100), Deus da Ruína (110) e Soberano do Paradoxo (120). Personagem sempre nível 100. Zero vitórias é resultado deste conjunto de testes, não prova de que a classe não possa vencer com outra estratégia, itens ou apoio de grupo.

## Avaliação por especialização

### Paladino: consistente em vida

Julgamento transforma vida em dano, enquanto redução fixa, cura e Aura Divina sustentam a rota. A distribuição resistente foi melhor que simplesmente maximizar força. No Paradoxo ainda perdeu na configuração escolhida.

**Sequência a entender:** Brado → Julgamento → Esbarrão; Escudo de Fé e Recuperar Fôlego conforme a ameaça.

**Ajuste recomendado:** Preservar o tanque ofensivo, revisar custo/duração da invulnerabilidade e limitar acúmulo de escudo; não compensar tudo com mais dano por HP.

### Berserker: risco alto, retorno inconsistente

Mostrou dano enorme em alvo sem resposta, mas não venceu o Panteão na matriz verificada. Ira deixa pouca vida e Vallhala triplica o dano recebido. O básico/dano direto resistente sobreviveu melhor que as preparações mais arriscadas.

**Sequência a entender:** Vallhala → Contundir ou Ira → Contundir são explosões distintas; não juntar sacrifícios sem proteção.

**Ajuste recomendado:** Reduzir custo de HP e vulnerabilidade, com orçamento menor de bônus; dar uma janela utilizável de risco. Corrigir a imunidade a controle de Você Irá Me Parar?.

### Samurai: precisa converter preparação em sobrevivência

Corte Profundo contra armadura é útil, mas a build ofensiva ficou dependente de sobreviver poucos turnos. Cortes Ultrassônicos restringe a básicos; uma rotação que tente habilidades durante a trava não executa a sequência imaginada.

**Sequência a entender:** Recuperar Fôlego → Corte Profundo → Golpes Velozes; ou Cortes Ultrassônicos → básico → básico → Corte Profundo.

**Ajuste recomendado:** Rever mitigação por golpe, custo da janela segura e retorno da cura do contra-ataque; clarificar que Mente Limpa duplica parte do primeiro básico.

### Ninja: forte interação, muita variância

Dano de vida atual e finalização combinam bem, mas dependem da sobrevivência. A busca de curto prazo escolheu um combo ofensivo que só venceu 2/30 no lote novo; a configuração resistente de dano direto venceu 18/30. Esse contraste impede chamar a maior pontuação da triagem de melhor build universal.

**Sequência a entender:** Bomba de Fumaça → Mata-Gigantes → Corte Profundo; aproveitar Contra-Ataque e Eliminar.

**Ajuste recomendado:** Informar consumo do bônus pela reação de esquiva e colocar teto por ação no dano percentual contra chefes.

### Mago Incendiario: mana tem vários retornos simultâneos

Mana pura também vira HP e poder por Mana e Vida, então essa build não representa um personagem sem defesa. Queimadura e Explodir dão valor em chefes. A vantagem cai no Paradoxo.

**Sequência a entender:** Bafo de Fogo → Bola de Fogo/básico → Explodir quando finalizar ou houver margem de vida.

**Ajuste recomendado:** Separar os benefícios de MP e limitar a parcela percentual; dar função mais eficiente à Fênix Sagrada frente às outras opções.

### Mago Frigido: muito forte em chefe

A combinação de vida, HP convertido de mana, mitigação e Avalanche foi eficiente. A configuração resistente venceu 29/30 contra o Paradoxo. Não é só uma classe de controle: o dano de 50% do HP máximo é determinante.

**Sequência a entender:** Bola de Neve → Congelar → Avalanche; Avalanche repetida também foi testada.

**Ajuste recomendado:** Rebalancear o percentual de HP e o preparo de resfriamento. Na dungeon, recalcular a parcela percentual por alvo ou documentar uma regra de área própria.

### Arquimago: distorção estrutural de dano

Com distribuição equilibrada, o básico encerrou os três chefes testados em um turno nas 30 sementes. A mana adiciona dano fixo a cada míssil e a recuperação por turno cobre o custo baixo do básico.

**Sequência a entender:** A combinação saudável seria Concentração → mísseis → acumular cargas → Descarregar/Sobrecarregar; atualmente muitas vezes o primeiro básico já encerra a luta.

**Ajuste recomendado:** Distribuir o bônus fixo por ação e aplicar Carregar uma única vez. Recalibrar as skills ativas depois, para não apenas transferir o excesso de um botão para outro.

### Corrompido: a abertura elimina o risco previsto

Transbordando multi-hit e Canhão de Vidro encerraram os chefes em uma ação no lote verificado. Isso impede avaliar a vulnerabilidade como contrapeso real.

**Sequência a entender:** Corrupção → Incorporar Demônio → mísseis é uma rotação de defesa quebrada; abrir com mísseis foi outra sequência testada.

**Ajuste recomendado:** Corrigir a base do dano e o custo mínimo de Corrupção. Depois ajustar a janela demoníaca e o risco da abertura.

### Atirador Arcano: explosão por mana, defesa frágil

Mana pura fortalece Headshot, Cristalizar Mana e o ataque baseado em mana faltante. Venceu o chefe do Panteão, mas perdeu boa parte das lutas contra o inimigo comum e o alvo de teste com resposta constante.

**Sequência a entender:** Headshot para gastar reserva → Sobreaquecer → recuperação → Emergência Arcana; comparar com guardar mana para controle.

**Ajuste recomendado:** Distribuir o benefício de MP entre opções, evitar duas escalas de mana excessivas na mesma habilidade e preservar alguma escolha defensiva.

### Sniper: bom papel de abertura e execução

A distribuição equilibrada funcionou melhor do que presumir força pura. Ponto Fraco, Headshot e Executar ocupam momentos diferentes da luta. O crítico total alto participa muito do resultado.

**Sequência a entender:** Mirar → Ponto Fraco → Headshot → Executar abaixo de 40%; Tiro Perfurante em alvo blindado.

**Ajuste recomendado:** Centralizar as parcelas de crítico e auditar o acréscimo duplicado de 15% ao entrar no Sniper. Reservar espaço de orçamento para itens.

### Espreitador: identidade boa, conversão de dano insuficiente

Camuflagem → Surpresa funciona na campanha, mas os roteiros testados não venceram o chefe do Panteão. Reduzir armadura antes da rajada tem lógica, porém exige sobreviver à preparação.

**Sequência a entender:** Mirar no Pé → Camuflagem → Surpresa → Armadilha/Rajada.

**Ajuste recomendado:** Reduzir o custo de oportunidade da preparação ou melhorar o retorno defensivo. Na arena, preservar o tipo da última ação para não perder a sinergia.

### Guarda Florestal: sustentação sem pressão suficiente

A build resistente com sustentação venceu o inimigo comum, mas não o chefe. Sobrevive por muitos turnos; isso não é o mesmo que conseguir vencer. Parte de sua utilidade em grupo não aparece nesta taxa solo.

**Sequência a entender:** Tranquilizante → Tiro Cortante → Armadilha → Rajada; Camuflagem quando a proteção compensar o turno.

**Ajuste recomendado:** Melhorar pressão de DOT/rajada e tornar a mitigação útil contra chefes, sem criar um ciclo infinito de esquiva e cura.

### Druida Sombrio: explosão especializada e frágil

Força pura com Colapso/Colheita venceu o Panteão, mas tinha apenas 200 HP e perdeu todas contra o inimigo comum nessa validação. O chefe às vezes prepara buffs, concedendo a janela; não recomendar isso como build geral.

**Sequência a entender:** Colapso do Brejo → Colheita é abertura; Semente → Raízes → Flor → Apodrecer → Colheita é desgaste/preparo.

**Ajuste recomendado:** Preservar as duas rotações, limitar dano percentual e oferecer defesa utilizável sem depender de a IA gastar o primeiro turno em buff.

### Avatar da Natureza: conceito de transformação com economia difícil

A build precisa pagar toda a mana para se transformar e ainda reservar ações/recuperação para Raízes e Esmagar Invasor. As rotações adicionais não resolveram sua dificuldade contra os chefes testados sem itens.

**Sequência a entender:** Forma Verdadeira → básicos para recuperar MP → Raízes → Esmagar Invasor; ou Semente → Raízes → Flor → Colheita para escudo.

**Ajuste recomendado:** Testar custo parcial da forma ou desconto de Esmagar durante transformação, com aumento defensivo mensurável. Não confundir o bônus de casca com invulnerabilidade.

### Fada Monarca: sustentação funciona, lutas podem ficar longas

Sustentação ofensiva venceu 24/30 no Panteão com média alta de turnos, mas empatou por limite de 120 turnos no Cataclismo. Curas vazias não geram Cadência. Seu suporte em grupo precisa ser avaliado separadamente.

**Sequência a entender:** Curas efetivas → Cadência → Coroar → Raízes/Decreto; escolher ofensiva quando a vida estiver segura.

**Ajuste recomendado:** Transformar preparação em pressão suficiente para fechar a luta e impedir loops intermináveis de cura/esquiva. Corrigir o dono da cura de grupo quando quem conjura é convidado.

### Protetor da Floresta: precisa de roteiro de escudo

O dano direto isolado não representa a proposta da classe. Canção/Casulo → Jogar Espinhos melhorou bastante a atuação contra inimigo comum e alvo de teste, embora não tenha resolvido o chefe do Panteão.

**Sequência a entender:** Raízes → Canção Ancestral → Casulo de Vinhas → Jogar Espinhos; comparar com dois Casulos antes de gastar escudo.

**Ajuste recomendado:** Dar tempo e recursos para construir escudo, mostrar o valor que será consumido e revisar o custo de HP/MP. Corrigir a origem do suporte cooperativo antes de balancear por números.

## Rotações adicionais executadas

Cada uma das sequências abaixo foi testada com as oito distribuições, três chefes e dez sementes. São roteiros comparados, não recomendações para repetir sem olhar o estado da luta. Uma raiz, esquiva ou controle pode falhar; custos podem impedir etapas.

**Paladino**

- escudo julgamento: Escudo de Fe → Julgamento → Julgamento → Recuperar Folego → Julgamento.
- brado sustento: Brado → Esbarrao → Julgamento → Recuperar Folego → Julgamento.

**Berserker**

- ultima chance: Ira → Contundir.
- furia explosiva: Vallhala → Contundir → Contundir.

**Samurai**

- janela segura: Cortes Ultrasonicos → básico → básico → Corte Profundo → Furar Blindagem.
- sangramento: Recuperar Folego → Corte Profundo → Golpes Velozes → Corte Profundo.

**Ninja**

- esquiva execucao: Bomba de Fumaca → Mata-Gigantes → Bomba de Fumaca → Golpes Velozes → Corte Profundo.
- sangramento primeiro: Corte Profundo → Bomba de Fumaca → Mata-Gigantes → Golpes Velozes.

**Mago Incendiario**

- queimar: Bafo de Fogo → básico → Bola de Fogo → Explodir.
- explosao: Explodir → Bafo de Fogo → básico.

**Mago Frigido**

- avalanche dupla: Avalanche → Avalanche → Bola de Neve → Congelar.
- frio preparado: Bola de Neve → Congelar → Avalanche.

**Arquimago**

- escudo cargas: Escudo de Mana → básico → básico → Descarregar.
- concentrar: Concentracao → básico → básico → Sobrecarregar.

**Corrompido**

- missil primeiro: básico → Corrupcao → Incorporar Demonio → básico.
- corrupcao abertura: Corrupcao → Incorporar Demonio → básico.

**Atirador Arcano**

- reservar mana: Headshot → Headshot → Emergencia Arcana → Sobreaquecer.
- esgotar recuperar: Sobreaquecer → Emergencia Arcana → Headshot.

**Sniper**

- ponto fraco primeiro: Ponto Fraco → Headshot → Executar.
- foco camo: Mirar → Camuflagem → Headshot → Executar.

**Espreitador**

- reduzir armadura: Mirar no Pe → Camuflagem → Surpresa → Rajada de Flechas → Armadilha.
- emboscada: Camuflagem → Surpresa → Camuflagem → Surpresa → Armadilha.

**Guarda Florestal**

- mitigar dot: Tranquilizante → Tiro Cortante → Rajada de Flechas → Armadilha.
- esquiva rajada: Mirar → Camuflagem → Armadilha → Rajada de Flechas → Rajada de Flechas.

**Druida Sombrio**

- colapso colheita: Colapso do Brejo → Colheita.
- dot longo: Semente Viva → Raizes → Flor do Pantano → Apodrecer → Colheita.

**Avatar da Natureza**

- forma abertura: Forma Verdadeira → básico → básico → Raizes → Esmagar Invasor → Colheita.
- escudo colheita: Semente Viva → Raizes → Flor do Pantano → Colheita → Esmagar Invasor.

**Fada Monarca**

- coroa cedo: Coroar → Semente Viva → Cancao Ancestral → Decreto da Rainha → Raizes → Decreto da Rainha.
- cadencia curta: Cancao Ancestral → Cancao Ancestral → Coroar → Decreto da Rainha → Raizes → Decreto da Rainha.

**Protetor da Floresta**

- casulo espinhos: Casulo de Vinhas → Casulo de Vinhas → Jogar Espinhos.
- cancao espinhos: Raizes → Cancao Ancestral → Casulo de Vinhas → Jogar Espinhos.

## Comparação da ordem dos combos

Abaixo, a mesma distribuição equilibrada contra o mesmo alvo de teste. As linhas com 100.000 atingiram o limite de vida do alvo. Inverter ordem também pode tornar uma habilidade indisponível; conferir as ações efetivas no JSON. A janela sem resposta inimiga favorece sacrifícios e não prevê vitória contra chefe.

| Forma | Roteiro | Ordem invertida | Só básico |
| --- | --- | --- | --- |
| Paladino | 6603 | 8783 | 2133 |
| Berserker | 95090 | 67272 | 2493 |
| Samurai | 3299 | 3535 | 2821 |
| Ninja | 43814 | 42903 | 2752 |
| Mago Incendiario | 41117 | 32809 | 13444 |
| Mago Frigido | 83401 | 63434 | 8998 |
| Arquimago | 100000 | 92253 | 100000 |
| Corrompido | 100000 | 42768 | 100000 |
| Atirador Arcano | 11088 | 8082 | 2351 |
| Sniper | 44326 | 43298 | 3844 |
| Espreitador | 13063 | 13373 | 2314 |
| Guarda Florestal | 3945 | 3863 | 1941 |
| Druida Sombrio | 23318 | 13947 | 2169 |
| Avatar da Natureza | 4812 | 3115 | 2169 |
| Fada Monarca | 2348 | 2357 | 2019 |
| Protetor da Floresta | 6687 | 1706 | 2109 |

Exemplos práticos: Frígido se beneficia de preparar resfriamento; o Sombrio pode abrir com Colapso e colher ou preparar uma sequência longa de DOT; o Protetor perde boa parte do dano se gasta Jogar Espinhos antes de construir escudo. No Espreitador, a sequência de Camuflagem precisa ser preservada pela implementação. No Avatar, gastar toda a mana na forma exige planejar a recuperação dentro da duração restante.

## Falhas/interações verificadas nas habilidades

- **Transbordando + mísseis:** um orçamento fixo inteiro de dano em cada projétil, com custo baixo do básico. Corrigir por ação.
- **Carregar:** bônus percentual passa por duas etapas de multiplicação no básico. O aumento controlado foi +32,2% para três cargas de +5%.
- **Você Irá Me Parar?:** no teste, conjurar a habilidade e depois receber `skipNextTurn` ainda fez o jogador perder a ação. O código aplica ataque, mas não guarda/consulta imunidade de controle.
- **Canção Ancestral na dungeon:** quando o host conjura, os três recebem benefício. Quando um convidado conjura, o host ficou com o mesmo HP e o conjurador recebeu o benefício novamente. No Protetor, o convidado chegou a 2417 de escudo contra 1154 do outro convidado e zero do host na fixture. Corrigir `sourceId` para o ator real, não o peer do host.
- **Avalanche em área:** alvos com 20.000, 50.000 e 90.000 HP máximos receberam o mesmo dano, 10.928, porque o coeficiente foi calculado a partir do primeiro alvo. Definir regra de área e recalcular por alvo quando a descrição depender do HP dele.
- **Duração de Escudo de Fé:** três turnos nominais protegeram duas respostas; o contador cai na conjuração. Uniformizar a convenção e o texto.
- **Sets atuais:** o getter de bônus devolveu zero mesmo para Paradoxo. Ter perfis regionais declarados não equivale a bônus ativo.

Nevasca e Decreto da Rainha aplicaram seu efeito/dano nos três alvos dos testes de área, tanto para host quanto para convidado. A sinergia Camuflagem→Surpresa foi confirmada na campanha; na arena, o código que substitui a última ação por `skill` precisa ser corrigido para preservar essa informação.

## Entregáveis e próximos passos

- [Avaliação de todas as habilidades](avaliacao_habilidades.md): quatro ataques básicos, 59 ativas nomeadas e 31 variantes passivas, com descrição extraída e avaliação individual.
- [Proposta de itens e conjuntos](proposta_itens_e_sets.md): slots, orçamento, atributos, raridades, crafting e 12 conjuntos com bônus de 2/4/5 peças.
- `docs/qa/2026-10-27/class-lab-results.json`: matriz agregada, finalistas, ações, rotações e sondagens.
- `docs/qa/2026-10-27/dungeon-class-results.json`: cura em grupo e habilidades de área.

Corrigir primeiro dano por ação, bônus duplicado, imunidade prometida e origem de cura/escudo. Depois prototipar quatro sets e repetir a mesma matriz com orçamento igual de itens. A proposta de equipamento não deve ser usada para mascarar um básico que já mata qualquer chefe nem para decidir sozinha a viabilidade de uma classe de suporte.

Reprodução: `node docs/qa/2026-10-27/class-lab.cjs`, depois `node docs/qa/2026-10-27/class-lab-extra.cjs` e `node docs/qa/2026-10-27/dungeon-class-probes.cjs`. O Playwright usa o runtime desta máquina e Edge em perfis descartáveis. `--resume` reaproveita apenas a triagem já salva e repete os testes posteriores. Esta avaliação não substitui playtest humano completo, balanço PvP com o motor corrigido, testes de rede nem campanha contínua com recursos carregados de uma luta para a seguinte.

# Incentivos de uso e propostas para as fórmulas

**Snapshot de 30/10/2026, anterior às correções de 02/11/2026.** Explodir já aplica dano, e os investimentos antigos agora usam o ganho por ponto do nível atual. As comparações numéricas abaixo preservam o estado anterior e precisam de nova análise antes de orientar um rebalanceamento; as demais propostas não foram aplicadas. Os dados originais foram preservados em `qa/skills-formulas/audit-20261030.json` e `windows-20261030.json`. O catálogo separado é regenerado com o código atual.

O catálogo completo, sem esta análise, está em [habilidades_classes_subclasses.md](habilidades_classes_subclasses.md). Ele separa as quatro classes-base, oito subclasses do 30 e dezesseis especializações do 60, repetindo o kit herdado em cada forma e incluindo as habilidades do 80. As fórmulas de combate não haviam sido alteradas na revisão original; os valores propostos abaixo são candidatos para teste.

## Escopo e evidência

Auditoria do código atual de 30/10/2026, reproduzível por [audit.cjs](qa/skills-formulas/audit.cjs), [catalog.py](qa/skills-formulas/catalog.py) e [windows.cjs](qa/skills-formulas/windows.cjs). Fontes principais: [árvores de classes](../assets/js/data/class-trees.js), [cálculo e execução das habilidades](../assets/js/game.js), [equipamentos](../assets/js/systems/equipment-system.js).

- **28 formas**, quatro distribuições de atributos: equilibrada, ofensiva, arcana e resistente. Classes-base nos níveis 1/10/20/29; intermediárias no 30/40/50/59; finais no 60/70/80/90/100 (limite atual do jogo). São **5.440 linhas de comparação e 87.040 avaliações de ação**, com 16 sementes por linha, usando as funções nativas. Cada habilidade é comparada ao básico no mesmo personagem.
- Cada configuração tem armadura zero e armadura do chefe da região apropriada ao nível. O HP máximo do alvo é o desse chefe. Alvo começa sem escudo e sem mana, para separar escala própria de drenagem de mana; Explosão de Mana fica melhor contra inimigos com MP. Personagens começam sem equipamento, com HP/MP cheios e sem preparos. Dano pode incluir excesso sobre o HP restante: é uma avaliação de fórmula, não uma taxa de vitória.
- **204 comparações de janelas**, **6.528 sequências**, em dois builds, níveis 70/80/100 e horizontes de 2/4/6 ações: preparar primeiro versus atacar desde o início. Usam o turno nativo, regeneração e duração reais, mas alvo controlado com 1.000.000 de HP, armadura zero e ataque zero. Servem para medir o custo ofensivo de gastar uma ação em preparo; não medem sobrevivência contra chefes reais. Mesmo nesse alvo, o motor pode produzir dano mínimo recebido.
- **10 sondagens de estado** verificam condições como mana incompleta, escudo, DOT anterior e a execução de Explodir. Dados: [audit-20261030.json](qa/skills-formulas/audit-20261030.json), [windows-20261030.json](qa/skills-formulas/windows-20261030.json).
- O catálogo verifica numericamente custos e danos calculados de **129 entradas ativas** e enumera **68 entradas passivas**, com repetições herdadas. São 55 tipos de execução ativa e 31 tipos de passiva. A confirmação numérica usa um estado sem preparo por forma; estados condicionais também foram conferidos no código e nas sondagens, sem alegar cobertura de todas as combinações de buffs e equipamentos.

O DOT da matriz de ação é o **total potencial** das durações aplicadas: não significa que o inimigo sobreviva até receber tudo. Cura em personagem cheio e Jogar Espinhos sem escudo naturalmente retornam zero; isso não prova falta de utilidade. Comparações com probabilidades são médias de 16 sementes, não valores exatos de expectativa nem telemetria de jogadores.

A [análise anterior até 70](analise_balanceamento_nivel70.md) contém ablações e vitórias de um snapshot anterior. Ela ajuda a conferir os problemas de preparo, mas não substitui os resultados atuais nem representa as habilidades do 80. Não somei aqueles combates às contagens desta revisão.

## O que mais tira o incentivo de clicar

1. **Falha de execução:** Explodir não aplica dano. Aumentar seu coeficiente não resolveria o problema.
2. **Mana deixa de ser uma escolha:** a regeneração padrão é aproximadamente 10% de M por rodada. No Paladino equilibrado, nível 70, são 156 MP por rodada: Julgamento custa 114, Esbarrão 58 e Contundir 54. Os três são sustentáveis; economizar mana com os golpes fracos quase não traz benefício. No 100, Julgamento custa 120 e a regeneração é 295.
3. **Pagar uma ação para ganhar pouco dano por poucos turnos:** um buff de +20% por quatro ataques futuros rende 4×1,2=4,8 ataques equivalentes, contra cinco ataques sem preparo. Com dano constante, nem sem custo de mana ele repaga a ação. Cura, defesa, recarga e oportunidade de ampliar um golpe específico podem mudar essa conta.
4. **Escalas diferentes passam a competir dentro do mesmo kit:** A, P, H, M e HP inimigo crescem de formas distintas. Headshot do Atirador Arcano escala com 60% de M, enquanto Emergência depende do MP faltante; Contundir e os golpes percentuais do 80 escalam com o inimigo; Golpes Velozes depende quase só de A.
5. **Armadura por aplicação:** cada flecha, corte ou míssil paga a defesa novamente. Isso reduz o valor dos golpes múltiplos no fim do jogo e faz um DOT ou um golpe que ignora defesa valer muito mais do que o tooltip bruto sugere.
6. **Pré-requisitos que não são remunerados:** precisar de marca, raiz, escudo ou mana cheia deve produzir um retorno adicional. Hoje algumas habilidades preparadas só empatam com uma alternativa imediata e barata.

## Problemas funcionais antes de ajustar coeficientes

| Caso | Comportamento observado | Providência sugerida |
| --- | --- | --- |
| Explodir — Incendiário, 80 (corrigido em 02/11) | Sondagem histórica: calcula 7.778 de dano, paga 500 MP e 1.615 HP, mas causa **zero**. Não existe ramo correspondente em `applySkillLocally`. | Implementar a aplicação do golpe; depois avaliar a fórmula. Não buffar números antes de corrigir a execução. |
| Furar Blindagem — Samurai | Com escudo, triplica o dano calculado, mas continua pagando armadura e escudo. Sondagem: 2.499 brutos viram 2.199 após 100 de armadura e 200 de escudo. | Definir se é quebra de escudo ou penetração; alinhar nome, descrição e flags. Se passar a ignorar defesa, reavaliar o multiplicador ×3 no mesmo ajuste. |
| Colheita normal | A marca causa `floor(.8P)` por rodada, mas a versão normal consome seu restante como `floor(.3P×turnos)`. Também remove a marca antes de aplicar dano, perdendo Ciclo Natural e seu reembolso. | Usar o DOT realmente armazenado e definir explicitamente se o golpe consome a marca antes ou depois de receber seus bônus. |
| Cadência/Coroar | Parte do ganho de P usa a soma de ataque e poder passivo, não apenas o “poder de habilidade” do texto. Coroar melhora as rolagens de Encanto, não a chance de Raízes. | Descrever e estabilizar essas bases antes de calibrar percentuais; evitar a indicação genérica de “todas as chances de controle”. |
| Controle/esquiva contra chefes | Efeitos negativos de certos golpes podem ser aplicados antes de a esquiva/controle cancelar o dano. | Resolver cancelamento antes de aplicar efeitos associados ao acerto. Não compensar esse defeito aumentando indiscriminadamente esquiva ou controle. |

## Exemplos atuais de perda de espaço

Valores arredondados, build equilibrado, sem equipamento, primeiro uso, contra HP/armadura do chefe do nível e sem mana inimiga. `D+DOT` separa dano imediato do periódico potencial; o DOT não é garantido. Crítico e passiva de abertura estão incluídos quando a execução os aplica.

| Forma / nível | Habilidade | D imediato + DOT potencial | MP | Comparação relevante |
| --- | --- | --- | --- | --- |
| Paladino 70 | Julgamento | 1.492 + 0 | 114 | Esbarrão 489/58 MP; Contundir 389/54 MP. Os menores preservam debuff/controle, mas perdem como ataques comuns. |
| Ninja 70 | Golpes Velozes | 638 + 0 | 58 | Investida 651/64 MP: próximos. |
| Ninja 100 | Golpes Velozes | 764 + 0 | 64 | Investida 996/70 MP: a defesa por golpe amplia a perda. |
| Incendiário 100 | Fênix Sagrada | 1.731 + 450 | 1.233 | Bola de Fogo 1.614 + 1.350 por 40 MP; Bafo 761 + 2.700 por 60. Fênix ainda pode finalizar sem esperar DOT. |
| Frígido 100 | Congelar | 252 + 186 | 60 | Bola de Neve 429 + 270 por 40. Congelar compra controle/vulnerabilidade, não eficiência direta. |
| Atirador Arcano 80 | Emergência Arcana, mana cheia | 548 + 0 | 100 | Headshot 2.406/84 MP. O estado de pouca mana precisa justificar a Emergência. |
| Atirador Arcano 80 | Sobreaquecer, mana cheia | 2.468 + 0 | 2.402 | Só um pouco mais que Headshot, consumindo toda a reserva. |
| Guarda Florestal 80 | Tiro Cortante | 0 + 885 | 80 | Rajada 543/60 MP. O DOT tem nicho real contra armadura e lutas duradouras. |
| Avatar 80 | Esmagar Invasor, sem preparo | 532 + 0 | 364 | Flor 557/52 MP. Esmagar depende muito dos bônus de raiz e Forma. |
| Druida Sombrio 80 | Colapso, alvo limpo | 1.049 + 2.434 | 1.846 | Semente e Apodrecer custam 60 e 80; Colapso compra os três efeitos em uma ação, mas exige 85% de M. |
| Espreitador 100 | Mirar no Pé | 330 + 0 | 100 | Armadilha 975/80 MP. Pé compra quebra de armadura/debuff, mas o déficit de dano cresce. |

Jogar Espinhos, Colheita, Emergência, Executar e habilidades de preparo **não devem ser julgadas apenas nessa tabela**: ela deliberadamente não começa com escudo, marca, mana gasta ou alvo na faixa de execução.

### O custo da primeira ação de preparo

Janela de quatro ações no alvo controlado descrito acima. Percentuais comparam o dano total com e sem preparo; não são taxas de vitória. O número incorpora duração, regeneração, acerto e crítico nativos. Nos casos de HP percentual, o alvo de um milhão amplifica o valor desse componente; eles não são comparáveis em força absoluta aos demais.

| Preparo e ação seguinte | Nível | Dano relativo em 4 ações | Interpretação |
| --- | --- | --- | --- |
| Brado → Julgamento | 70 | 76,8% | Julgamento depende muito mais de H que de A; Brado aumenta a parte menos importante e perde uma ação. Ainda tem redução de dano. |
| Recuperar Fôlego → Investida, Samurai | 70 | 91,5% | É cura com incentivo ofensivo, não um buff obrigatório com vida cheia. |
| Concentração → básicos, Arquimago | 70 | 89,0% | Duração e magnitude não repagam o preparo em quatro ações; mana pode ser seu motivo de uso. |
| Mirar → Headshot, Atirador Arcano | 70 | 91,0% | Headshot já acerta e sua versão arcana não usa A diretamente. |
| Mirar → Rajada, Guarda Florestal | 70 | 114,3% | Aqui o preparo funciona: ataque, precisão e disparo adicional beneficiam vários tiros. |
| Camuflagem → Surpresa, Espreitador | 70 | 92,4% | A sequência perde dano puro; seu retorno principal é a defesa/contra-bônus, que o alvo fraco não mede. |
| Forma Verdadeira → básicos | 80 | 160,0% | A forma já tem retorno ofensivo. Seu problema é acesso com mana cheia, custo e competição com o kit, não coeficiente baixo do básico. |
| Coroar → Decreto, Fada | 80 | 98,4% | Quase empata ofensivamente, mas compra esquiva e controle. Não é um botão morto. |
| Incorporar Demônio → Corrupção | 80 | 240,0% | Preparo extremamente forte na janela; a vulnerabilidade precisa ser considerada contra inimigos reais. |

Ira e Vallhala também superam o spam de Contundir nesse alvo sem ameaça (cerca de 187% em quatro ações no 70). Isso **não** invalida o risco: Ira remove 80% do HP máximo e Vallhala triplica o dano recebido. A evidência anterior de piora ao abrir com elas contra chefes reais é compatível com um grande ganho ofensivo que frequentemente não sobrevive à resposta.

## Recomendações por família

Nas propostas abaixo: `L`, `A`, `P`, `H`, `M`, `m`, `EH`, `eh`, `Q` têm o mesmo significado do catálogo. São versões de teste, não novos valores já aprovados pelo simulador. Cada pacote precisa de nova validação de combate, principalmente com equipamento e contra chefes acima do nível.

### Guerreiro, Cavaleiro, Paladino e Berserker

- **Base/Cavaleiro:** Esbarrão tem papel de debuff; Contundir tem papel de controle. O problema surge quando Julgamento/Contundir Berserker viram ataques sustentáveis melhores em quase todos os turnos. Manter as utilidades, sem tentar igualar todos os danos brutos.
- **Paladino — Julgamento:** preservar a identidade de escala em H, mas criar orçamento de explosão. Se mantida a regeneração de 10%, testar custo `max(100+floor(.2L), floor(.14M))`, em vez de simplesmente aumentar o coeficiente dos ataques baratos. Separadamente, testar cura passiva menor se a combinação de redução, cura e escudo ainda eliminar a pressão do inimigo. Não aplicar ambos os nerfs sem medir.
- **Paladino — Brado:** seu +30% A quase não afeta o maior golpe, que usa `.4H`. Testar também `+10% ao próximo Julgamento` ou reduzir custo base de 40 para 25, conservando os 16% defensivos; uma dessas mudanças primeiro. Recuperar Fôlego deve continuar sendo uma cura utilizável com dano alto recebido, não uma preparação que precise ser aberta com vida cheia.
- **Paladino — Escudo de Fé:** tem nicho forte no 80: negar três respostas e armazenar dano. Testar custo `floor(.45M)+W`, em vez de `.70M+W`, se estiver inacessível nos builds de H; limitar a explosão armazenada se o custo menor permitir abusar de chefes muito acima do nível. Não buffar a duração antes de corrigir efeitos que atravessam invulnerabilidade.
- **Berserker — Contundir:** o termo `floor(.10EH)` não depende do investimento ofensivo e barateia atacar inimigos muito superiores. Testar `min(floor(.06EH), floor(1.5*(A+P)))` para esse termo, preservando a parte base. O limite evita que um ajuste de inimigo seja um buff involuntário da classe.
- **Berserker — Ira:** testar custo de HP `floor(.25*HP_atual)` e bônus total de +80% por quatro turnos, em vez de 80% do HP máximo por +150%. Corrigir Contundir no mesmo pacote: reduzir o risco de Ira sem controlar o golpe percentual provavelmente cria outro excesso.
- **Berserker — Vallhala:** testar +40–60% de dano recebido, em vez de +200%; em contrapartida, bônus ofensivo de `min(floor(.06EH),floor(1.5*(A+P)))`, disparando uma vez por ação, não em cada resposta/proc. Manter o risco legível e controlado.
- **Berserker — Você Irá Me Parar?:** +50 A fixos perdem relevância com o nível: trocar por `floor(.25A)` ou `20+floor(.4L)`, mantendo imunidade a controle. Com `.30H` de custo, o dano extra deve compensar mais de uma ação; testar reduzir o HP para `.15*HP_atual` se a versão escalável ainda não se sustentar.

### Espadachim, Samurai e Ninja

- **Golpes Velozes:** é um caso claro de perda com o crescimento da armadura. Testar por golpe `A+floor(.35P)+U`, conservando dois golpes no Samurai e três no Ninja. Avaliar separadamente a penetração parcial, sem conceder simultaneamente todo o dano novo e toda a penetração. Não usar apenas mais acertos como correção: isso aumenta a tributação da armadura e a interação com procs.
- **Samurai — Corte Profundo:** já tem nicho por ignorar armadura; não precisa superar Investida em toda condição. O sangramento atual é só 15% do dano causado **no total**, dividido por três. Se o papel pretendido é DOT, testar 25% total, calculado antes da absorção por escudo, e deixar o texto explícito. Não multiplicar inadvertidamente 15% por três.
- **Samurai — Furar Blindagem:** corrigir a semântica de defesa. Uma opção inicial: ignorar armadura e destruir escudo, mas trocar a triplicação por um bônus limitado `min(escudo_inimigo, floor(1.5*(A+P)))`. Isso cria resposta específica ao escudo sem um multiplicador descontrolado.
- **Samurai — Cortes Ultrassônicos:** é ferramenta defensiva de três respostas, não dano imediato. É preciso testar contra os efeitos de chefes após corrigir a ordem de cancelamento. Não concluir falta de utilidade porque o dano de lançamento é zero.
- **Ninja — Corte Profundo:** a versão de 30% total precisa competir com três básicos e Investida. Testar DOT calculado sobre o dano antes de escudo, mantendo sua identidade de pressão, enquanto Golpes ganha escala em P.
- **Ninja — Bomba de Fumaça:** manter esquiva e reação; garantir que o bônus de próximo dano deixe claro se pode ser consumido pelo Contra-Ataque. Se o objetivo é preparar um golpe escolhido, separar `próxima_habilidade` de `próximo_dano`, em vez de aumentar cegamente o +30%.
- **Ninja — Mata-Gigantes:** `.40eh`, somado a buffs e Eliminar, pode tornar o 80 uma mudança abrupta de poder. Testar `80+floor(A)+floor(.8P)+min(floor(.18eh),floor(2.5*(A+P)))`, com custo candidato `140+W`. O limite no termo percentual preserva a especialização contra alvos grandes sem transferir toda a escala para o monstro.

### Mago, Elementalista, Incendiário e Frígido

- **Mago-base:** até o 20 só há Mísseis. Não resolver isso com uma habilidade do 80; se a intenção é decisão ativa no começo, antecipar uma versão pequena de Explosão para o 10, com números próprios, sem já dar a drenagem plena.
- **Incendiário — Fênix Sagrada:** o custo `200+P` pune o atributo que deveria promovê-la. No equilibrado, vai de 810 MP no 70 a 1.233 no 100, enquanto Bola de Fogo custa 40 e ganha `.05eh` mais três ticks de 5% EH. Testar custo `90+floor(.25P)` e papel de finalização: `100+floor(1.6P)` mais consumir até dois ticks de queimadura já existente. Consumir esses ticks, não duplicá-los; evita transformar o botão apenas em outra reaplicação de fogo.
- **Incendiário — Bafo de Fogo:** não é inútil por perder no dano imediato: oferece seis ticks. O pouco incentivo é reaplicá-lo quando o DOT maior já está ativo, porque as queimaduras não empilham. Dar sinergia específica com Fênix ou com alvo sem queimadura é melhor do que elevar duração continuamente.
- **Incendiário — escala do fogo:** fogo de 5% de EH por rodada e a parcela de 5% de eh da Bola também favorecem atacar monstros muito acima do próprio investimento. Antes de baratear a Fênix, testar limites como `min(floor(.05EH),floor(.8P))` por tick e `min(floor(.05eh),floor(.75P))` na Bola. Esses limites podem preservar o dano contra um alvo do próprio nível e controlar a transferência de escala para o HP do monstro. Não aumentar todos os ataques até alcançar a melhor combinação percentual atual.
- **Incendiário — Explodir:** prioridade funcional. Depois de aplicar o dano, o termo `.5EH` precisa de limite e o custo de HP precisa de teste. Candidato inicial: `200+floor(1.3P)+floor(.25H)+min(floor(.20EH),floor(3P))+F`, custo `cm(250+S)` e HP `.25*HP_atual`. Não publicar a fórmula antiga como dano efetivamente existente.
- **Frígido — Congelar:** não compete com Bola de Neve em dano por MP, mas tem 30% de impedir a ação e pode preparar +50% no próximo dano. O ramo que consegue controlar não aplica a queimadura de Gelo Queima; alinhar isso se o objetivo é consistência. Testar dano `60+floor(1.1P)` ou custo base 30, uma alteração de cada vez.
- **Frígido — Nevasca:** 15% por seis respostas tem expectativa bruta de 0,9 ações negadas, antes de sobreposição com outros controles e antes de a luta terminar. Custa a própria ação para preparar. Testar 25% por quatro respostas, ou conservar 15% e acrescentar um impacto inicial `floor(.5P)`. Escolher uma alternativa, sem tornar a habilidade outro enraizamento garantido.
- **Frígido — Avalanche:** ao contrário de Nevasca, já tem forte retorno: metade do HP máximo do inimigo no dano bruto. Testar limitar o termo a `min(floor(.25EH),floor(3P))` e custo de 250–300 antes de julgar o resto do kit fraco por comparação com essa suprema.
- **Mísseis no fim do jogo:** no Frígido equilibrado 100 contra a armadura do chefe 100, o básico causou em média 39 por ação por 39 MP, enquanto Explosão sem drenagem causou 612 por 40 MP. Um remendo de custo não resolve a perda por projétil. Testar penetração parcial apenas para esse ramo, ou um mínimo de dano por míssil, validando separadamente o efeito em Arquimago/Corrompido; aplicar penetração universal a todos daria mais poder aos ramos já fortes.

### Arcanista, Arquimago e Corrompido

- **Arcanista — Transbordando:** aumentar M também aumenta F e S, mas o básico paga só `3*floor(3+.1L)` MP enquanto magias recebem S inteiro. No Arquimago 100, básico custa 39; Explosão custa 819. A armadura alta ainda pode favorecer o golpe único. Há um problema de distribuição entre famílias de ataque, não prova de que todas as magias são descartáveis.
- **Arquimago — Descarregar:** perdeu parte fixa e termos de P/M ao especializar; passa a `floor((L+.007M)*Q)+F`. Com poucas cargas tende a ficar entre básico barato e magias de golpe único mais fortes. Testar `60+floor(.5P)+floor(.10M)+floor(Q*(.8L+.04M))+F`, com teto de 6–8 cargas e custo `cm(20+10Q+min(S,floor(.03M)))`. Testar o teto junto da passiva de +5% por carga, para não criar escala ilimitada.
- **Arquimago — Concentração:** +20% por quatro ataques futuros não repaga a ação com dano estável. Testar +35% por quatro turnos e custo `cm(70+floor(.03M))`, sem S adicional. O ganho de regeneração já é relevante; avaliar também quanto MP o básico gera indiretamente enquanto as magias ficam proibitivas.
- **Arquimago — Sobrecarregar:** `.95M+S` normalmente é truncado a M por `cm`; portanto exige mana cheia. Não é apenas “95%”. Testar custo de `.70M` sem S e preservar o consumo das cargas, com o dano reavaliado; não somar esse buff a todas as reduções de custo no mesmo lançamento de balanceamento.
- **Corrompido — Corrupção e Transbordando:** ataque que ignora armadura, abertura dobrada e conversão 1:1 do HP perdido em escudo criam vantagem em vários eixos. Testar conversão de dano para escudo de 35–50%, com limite, antes de aumentar escudos ativos. Corrupção deve continuar tática contra armadura, e não receber também um buff de dano genérico.
- **Corrompido — Incorporar Demônio:** +200% por três turnos já mais que repaga a ação: 240% do dano em quatro ações na janela testada. Testar +100–120% e vulnerabilidade de 20–30%; comparar com abrir de básico para gastar Canhão de Vidro. Não usar o fraco incentivo do Escudo de Mana como razão para buffar o dano desse ramo.
- **Escudo de Mana:** mede defesa, não DPS. No Corrompido ele compete com escudo gratuito ao perder HP; no Arquimago custa muito por S. Antes de ampliar o coeficiente de escudo, testar remover S dessa habilidade e substituir o reset do escudo por `max(escudo_atual, novo_escudo)` se a intenção não é punir a reaplicação.

### Arqueiro, Atirador, Sniper e Atirador Arcano

- **Mirar não está morto em toda a classe.** No Guarda Florestal a janela ofensiva funciona; no Atirador Arcano os benefícios de precisão/A quase não chegam ao Headshot. Sem equipamentos, Headshot arcano passa de crítico 15% para 25%; com +10% de dano, o ganho médio desse componente é `1.1*1.25/1.15≈1.196`, antes de arredondar. Cinco golpes ampliados rendem cerca de 5,978 golpes normais, menos que os seis sem preparo.
- **Atirador — Mirar:** testar bônus de Headshot de 10% para 20% durante a janela, conservando o turno de preparo, ou reduzir seu custo para `20+floor(.3L)`. A melhora de dano resolve o tempo de retorno; a redução de custo só resolve acesso à mana. Não tratar as duas soluções como equivalentes. A conta simplificada do parágrafo anterior isola dano/crítico; não inclui a marca de 15% do Headshot arcano, que também muda com a chance de crítico.
- **Atirador Arcano — Headshot:** `.6M` produz um nuke barato, com precisão garantida, crítico e eventual marca de +15%. Testar `.35–.40M` e `.9–1.1P`, e só então comparar Emergência/Sobreaquecer. Subir todas as outras habilidades até o Headshot atual aumenta muito o poder total da classe.
- **Emergência Arcana:** sem considerar crítico, ela supera Headshot bruto apenas quando `m < .20M-.1333P`; com diferenças de crítico o limite costuma ser mais restrito. M é grande e regenera 10% por rodada: é difícil permanecer nesse estado. Testar `70+floor(1.1P)+floor(.9*(M-m))`, com desconto para 60 MP abaixo de 35% de mana. Manter o MP faltante medido antes do custo evita autoalimentação escondida.
- **Sobreaquecer:** a mana cheia custa milhares para um dano próximo de Headshot; mana zero dá lançamento grátis de `80+floor(1.6P)`. Essa inversão precisa de regra explícita. Candidato: consumir `min(m, floor(.35M))`, exigir um mínimo, dano `80+floor(1.2P)+floor(.9*MPconsumido)`. Se o objetivo for all-in, dar retorno proporcional suficiente e impedir custo zero; são desenhos alternativos, não acumuláveis.
- **Sniper — Executar:** já tem motivo claro abaixo ou exatamente em 40% do HP: triplica o dano. Fora dessa faixa é normal perder para Headshot/Tiro Perfurante. Não precisa vencer em todo momento.
- **Sniper — Ponto Fraco:** 25% do HP atual ainda pode critar. Testar criticar só a parcela fixa, com parcela percentual limitada `min(floor(.15eh),floor(2A+1.2P))`. Preserva abrir contra inimigo saudável sem transformar a reserva de HP do chefe no principal atributo ofensivo.
- **Tiro Perfurante:** possui nicho robusto e cresce de importância com a defesa inimiga. A versão Sniper também apaga escudo. Não aumentar seu dano para que sempre supere Headshot: o bypass já é o pagamento pelo botão.

### Caçador, Espreitador e Guarda Florestal

- **Espreitador — Surpresa/Camuflagem:** Surpresa maior exige uma ação anterior sem dano. No 70 a sequência dá 92,4% do dano da alternativa em quatro ações, no alvo sem ameaça. A defesa pode torná-la correta, mas o bônus ofensivo não é uma recompensa ampla. Testar versão preparada `80+floor(1.5A)+floor(1.2P)`, preservando a versão sem preparo, e medir separadamente o bônus após esquivar.
- **Espreitador — Mirar no Pé:** no 100 há 330 de impacto contra 975 da Armadilha na abertura. Testar `80+floor(.9A)+floor(.9P)` ou baixar custo para 70, conservando a quebra de armadura; não elevar ao mesmo tempo controle, dano e debuff.
- **Espreitador — Armadilha:** `.08eh` sustenta parte do kit, mas compartilha o risco de escala externa. Se o pacote de dano dos demais botões subir, limitar essa parcela a `min(floor(.08eh),floor(1.5*(A+P)))`, sem retirar simultaneamente sua utilidade de controle.
- **Guarda — Armadilha:** +15% na próxima Rajada só vem se a rolagem de 30% funcionar. Ganho nominal de dano é 4,5% de uma Rajada antes de outros fatores, além do controle. Testar bônus de Rajada garantido ao lançar a Armadilha; manter os 30% exclusivamente para impedir a ação. Isso cria uma preparação confiável sem controle garantido.
- **Guarda — Tiro Cortante:** não está sem incentivo no 80/100; ignora a tributação da armadura por tiro e cresce com P. Seu risco é morrer o inimigo cedo ou o sangramento ser substituído por outro DOT. Melhorar sinalização de duração/colisão, não o multiplicador automaticamente.
- **Guarda — Tranquilizante/Camuflagem:** debuff de 30% e cura de 13% ao esquivar oferecem motivos defensivos reais. O excesso de esquiva passiva com nível alto pode reduzir a melhoria marginal de Camuflagem; mostrar a chance total e evitar conceder mais porcentagem quando já encosta no teto de 95%.

### Adepto da Natureza, Druida e Druida Sombrio

- **Base:** Semente introduz marca e Raízes dá controle apenas no 20. Há pouca decisão entre o 1 e o 19. Testar raiz inicial mais fraca no 10, mantendo o aprimoramento no 20, em vez de aumentar o dano da Semente para dominar toda a rota posterior.
- **Druida — Semente/Colheita:** a marca cresceu para quatro turnos e `floor(.8P)` por tick, mas Colheita normal ainda usa `.3P` por turno restante. Isso perde cerca de 62,5% da parcela periódica antes dos arredondamentos. Testar consumir 90–100% do valor armazenado, conservando a especialização Sombria como a única que colhe também veneno e apodrecimento.
- **Flor do Pântano:** sem raiz já é um ataque barato; não classificá-la como inútil porque não aplicou veneno. Para tornar o combo mais consistente, testar veneno curto de duas rodadas sem raiz e duração maior com raiz, sem empilhar reaplicações. A diferença de duração do Avatar merece revisão separada.
- **Druida Sombrio — Apodrecer:** o DOT percentual ganha relevância contra monstros de HP alto e cura com Seiva. Não aumentar esse percentual antes de limitar os outros percentuais de HP; um teto em P pode ser necessário se a classe voltar a avançar muito além do próprio equipamento.
- **Druida Sombrio — Colapso:** custo de 85% M cresce e o pacote de DOT some se o alvo já tiver um DOT positivo. Isso contradiz o fluxo natural de começar com Semente e depois usar a suprema. Testar custo de 45–55% M e aplicar/renovar somente os efeitos ausentes, com durações sem somar, ou conservar o custo alto e consumir/transformar os DOT existentes. Escolher uma identidade, não dar as duas vantagens.
- **Colheita Sombria:** tem motivo real como execução/cash-out; o dano se torna menor quando se usa cedo ou se remove um DOT que ainda sustentaria a vida pela Seiva. Não recomendar spam como rotação universal.

### Avatar da Natureza

- **Forma Verdadeira:** os coeficientes já entregam mais dano no uso preparado. Na sondagem do 80, faltar **1 MP** torna a habilidade indisponível; no equilibrado custa 1.972 MP. Testar custo `.35–.45M`, mantendo os cinco turnos, antes de aumentar ataque/redução. Isso permite combinar Forma com o restante do kit sem obrigar pausa até mana cheia.
- **Esmagar Invasor:** sem preparo é pior que Flor na abertura do 80; mesmo o custo cresce para 380 no 100. Testar custo `100+floor(.5L)` e a fórmula atual com seus bônus, ou manter o custo e elevar a parte de P. Priorizar a redução de custo primeiro, porque a forma já amplifica A e o básico.
- **Colheita Avatar:** o escudo de 70% do dano é um incentivo defensivo real, mas a perda da marca prejudica a sinergia. Corrigir o valor consumido da marca antes de ampliar esse escudo. Não confundir retorno baixo do controlador solo com ausência de qualquer ação útil.

### Espírito da Floresta, Fada Monarca e Protetor da Floresta

- **Espírito — Semente:** marca sem DOT, -24% de ataque e +10% contra marcado custam uma ação. É mais útil contra inimigo que realmente ameaçará várias respostas; em lutas curtas, Decreto/Encanto podem terminar antes. Evitar torná-la preparação obrigatória em todos os combates; a defesa já é seu nicho.
- **Fada — Canção Ancestral:** não é descartável: cura, reduz ataque e gera Cadência se houver cura efetiva. A evidência anterior de retirada prejudicar vitórias é consistente com esse papel. O problema é gerar Cadência com HP cheio: testar que a primeira Canção por combate conceda uma Cadência ao ser lançada, sem permitir empilhamento ilimitado fora de combate.
- **Fada — Decreto:** manter a recompensa por três Cadências, sem buff direto generalizado. Se ficar muito acima das demais ações, melhorar a confiabilidade do preparo em vez de subir `2.9P` outra vez.
- **Fada — Coroar:** esquiva passa a 60% e Encanto pode chegar a 50% de controle; o retorno não aparece em uma planilha apenas de dano. A janela de quatro ações quase empatou ofensivamente e ainda comprou defesa. Prioridade é corrigir texto/base de P; não reduzir custo e aumentar poder simultaneamente.
- **Protetor — Casulo versus Canção:** com alvo enraizado, Canção cura `2P` e dá `2.2P` de escudo por menos MP; Casulo dá `1.4A+1.4P`. Para P muito alto, Canção pode cobrir as duas funções. Testar Casulo como defesa imediata garantida — por exemplo, uma redução pequena apenas para a próxima resposta — em vez de aumentar indefinidamente escudo acumulável.
- **Protetor — Jogar Espinhos:** tem identidade de conversão de defesa em ataque, mas pode ser clicado com E=0, pagar HP/MP e causar zero. Exigir E>0 e mostrar a previsão é prioridade. Testar custo `80+floor(.8L)` e HP `.10*HP_atual`, mantendo `2E`; medir com escudos construídos, jamais usando a abertura sem escudo como prova de inutilidade.
- **Protetor — Encanto da Brisa:** contra alvo marcado transforma dano em escudo, além das rolagens. A leitura só de dano direto o subestima. Melhor mostrar o ganho esperado; não precisa de buff de P apenas porque Raízes deu mais dano em um estado limpo.

## Cobertura dos botões e seus nichos

| Família | Habilidades examinadas | Diagnóstico predominante |
| --- | --- | --- |
| Guerreiro | Recuperar Fôlego; Esbarrão/Investida; Contundir; Brado/Ira; Golpes Velozes; Corte Profundo | Cura situacional; ataque/debuff; controle ou percentual forte; preparo arriscado; perda contra armadura; DOT/penetração especializados. |
| Paladino | Julgamento; Escudo de Fé | Ataque sustentável dominante; suprema defensiva cara e dependente da ordem de resolução. |
| Berserker | Vallhala; Você Irá Me Parar? | Risco excessivo; bônus fixo +50 perde peso com crescimento. |
| Samurai | Furar Blindagem; Cortes Ultrassônicos | Counter de escudo com semântica inconsistente; defesa de três respostas, não DPS de lançamento. |
| Ninja | Bomba de Fumaça; Mata-Gigantes | Defesa com bônus que pode ser gasto na reação; grande mudança de poder percentual no 80. |
| Mago | Explosão de Mana | Drenagem valiosa contra MP; escala/custo muda muito por ramo. |
| Elementalistas | Bola de Fogo/Bola de Neve; Congelar/Bafo de Fogo; Fênix Sagrada; Nevasca; Explodir; Avalanche | Efeitos persistentes/controle; disputa com reaplicação; custo da Fênix cresce com P; preparo fraco da Nevasca; falha de execução; percentual alto da Avalanche. |
| Arcanistas | Descarregar; Escudo de Mana; Concentração; Corrupção; Sobrecarregar; Incorporar Demônio | Consumo de cargas mal remunerado em Arquimago; defesa que compete com passiva; pouco retorno do preparo; bypass e defesa forte; requisito de mana cheia; amplificador muito forte. |
| Arqueiro/Atirador | Mirar; Camuflagem; Headshot; Tiro Perfurante | Preparo dependente do ramo; defesa com ganho marginal decrescente; spam arcano dominante; nicho claro contra defesa. |
| Finais de Atirador | Emergência Arcana; Executar; Sobreaquecer; Ponto Fraco | Pouca mana raramente alcançada; execução situacional útil; custo cheio/zero invertido; alto percentual criticável. |
| Caçadores | Rajada de Flechas; Armadilha; Surpresa; Tranquilizante; Mirar no Pé; Tiro Cortante | Multi-hit dependente de armadura/precisão; controle/percentual ou preparo aleatório; sequência cara em ações; defesa útil; suprema de baixo impacto; DOT com nicho real tardio. |
| Natureza comum | Semente Viva; Raízes; Flor do Pântano; Encanto da Brisa; Colheita; Canção Ancestral | Marca; controle; ataque barato e veneno condicional; controle/escudo; cash-out desigual por ramo; sustentação/Cadência. |
| Druidas finais | Apodrecer; Forma Verdadeira; Colapso do Brejo; Esmagar Invasor | DOT percentual útil; boa forma com acesso ruim; suprema que conflita com preparo prévio; custo desproporcional sem as condições. |
| Espíritos finais | Decreto da Rainha; Casulo de Vinhas; Coroar; Jogar Espinhos | Recompensa de Cadência; defesa que compete com cura+escudo; benefício defensivo real; conversão útil, mas lançamento vazio permitido. |

Passivas entram na análise porque mudam o incentivo de clicar: redução/cura/Aura enfraquecem a necessidade de curar ativamente; escudo automático do Corrompido compete com Escudo de Mana; bônus de esquiva por nível diminui o ganho marginal de Camuflagem; Cadência e Seiva dão valor a cura/DOT; Carregar aumenta a importância de conservar versus consumir Q. Não tratá-las como botões que faltam na rotação.

## Ordem de implementação sugerida

1. Corrigir Explodir, semântica de Furar Blindagem, consumo de marca e ordem de cancelamento de golpes de chefes. Alinhar textos ao que o motor executa.
2. Escolher a economia de mana. Alternativa A: manter regeneração de 10% e cobrar os ataques de explosão acima dela. Alternativa B: testar regeneração menor **só após o 30**, por exemplo `max(6,floor(.03M)+floor(.15L))`, junto da revisão dos custos S. Não reduzir regeneração cedo e deixar os custos atuais intactos.
3. Recuperar decisões dos botões mais prejudicados: Concentração, Emergência/Sobreaquecer, Colheita normal, Forma Verdadeira, Esmagar e Mirar no Pé. Separar cura/controle de dano puro.
4. Limitar os percentuais de HP e a combinação de dano/defesa do Corrompido; medir simultaneamente os novos incentivos do Berserker para não trocar suicídio por explosão sem risco.
5. Validar novamente nos níveis 20/30/50/59/60/70/80/90/100, com equipamentos obtidos e builds de H/M/P. Para cada botão, comparar melhor rotação com e sem ele e preparos de 2/4/6 turnos, além de condições favoráveis reais. Aprovar por nicho utilizável e custo de oportunidade, não por todos terem o mesmo DPS.

O objetivo é preservar escolhas situacionais: Executar pode ser ruim com inimigo saudável; Tiro Perfurante pode perder contra alvo sem defesa; cura pode ser ruim com HP cheio. O que precisa desaparecer é a habilidade que perde também na situação que deveria favorecê-la, ou que cobra recursos sem executar o efeito.

# Avaliação de todas as habilidades

Complemento da avaliação de classes e combos. São quatro ataques básicos, um por classe, 59 nomes/variantes ativas e 31 variantes passivas. As ativas representam 55 tipos de implementação; Bola de Neve/Fogo, Congelar/Bafo, Brado/Ira e Esbarrão/Investida são variantes do mesmo tipo. Todas as entradas abaixo têm avaliação; nenhum tipo ficou sem nota.

Descrições numéricas foram extraídas do motor em distribuição equilibrada, sem itens: classe-base nível 20, intermediária 50 e final 100. O alvo de referência tem 20.000 HP, 80 de armadura e 200 de ataque. Coeficientes de HP, mana atual, escudo e cargas dependem desse estado. Não interpretar esses valores contextuais como fórmula universal.

As 516 sondagens ativas cobrem estados normal, preparado, recursos altos e alvo com escudo, executando a ação real e a resposta inimiga. A condição normal usa 70% de HP para exercitar cura/custos de vida. Uma skill indisponível por custo é um bloqueio esperado, não erro. As 68 verificações passivas confirmam gatilhos/valores específicos nas formas que possuem cada passiva; não certificam todas as interações possíveis. Problemas de matemática de Carregar e de dono de suporte aparecem nos testes adicionais, mesmo com seu gatilho básico funcionando.

## Guerreiro

### Ataque básico

Ataque basico. Dano entre 62 e 67.

Confiável e sem custo de MP; depende de força e sofre contra armadura. É referência para medir se uma preparação realmente compensa.

### Ativas

#### Recuperar Folego

**Desbloqueio da entrada/variante:** nível 1. **Formas com esta entrada:** Guerreiro, Cavaleiro, Paladino, Berserker, Espadachim, Samurai, Ninja.

**Referência extraída — Paladino, nível 100:** Recuperar Folego: consome 50 MP e recupera 690 de vida.

**Avaliação e ajuste:** Sustentação útil; Cavaleiro cura mais e Espadachim também prepara dano. O valor cresce com vida máxima. Explicar o bônus ofensivo e equilibrar custo pela vida efetivamente recuperada; regeneração de mana alta permite repetir indefinidamente.

**Teste executado:** 28 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Esbarrao

**Desbloqueio da entrada/variante:** nível 20. **Formas com esta entrada:** Guerreiro, Cavaleiro, Paladino, Berserker.

**Referência extraída — Paladino, nível 100:** Esbarrao: consome 64 MP e causa 940 de dano. Tambem reduz o ataque do inimigo em 30% por 3 turnos.

**Avaliação e ajuste:** Boa ponte entre vida e dano, com redução ofensiva na rota Cavaleiro e escala ofensiva na Investida. Preservar essa diferença. Evitar que o investimento em vida seja simultaneamente a melhor defesa e a melhor fonte de dano em todas as rotas.

**Teste executado:** 16 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Investida

**Desbloqueio da entrada/variante:** nível 30. **Formas com esta entrada:** Espadachim, Samurai, Ninja.

**Referência extraída — Samurai, nível 100:** Investida: consome 70 MP e causa 1236 de dano.

**Avaliação e ajuste:** Boa ponte entre vida e dano, com redução ofensiva na rota Cavaleiro e escala ofensiva na Investida. Preservar essa diferença. Evitar que o investimento em vida seja simultaneamente a melhor defesa e a melhor fonte de dano em todas as rotas.

**Teste executado:** 12 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Contundir

**Desbloqueio da entrada/variante:** nível 30. **Formas com esta entrada:** Cavaleiro, Paladino, Berserker.

**Referência extraída — Paladino, nível 100:** Contundir: consome 60 MP e causa 774 de dano. Tem 30% de chance de fazer o inimigo perder o proximo turno.

**Avaliação e ajuste:** Controle na rota defensiva; no Berserker vira dano que inclui 10% do HP máximo do alvo. É uma das ações mais eficientes dessa rota. Separar o orçamento de dano de chefe do orçamento de atordoamento e testar um teto ligado ao poder do atacante.

**Teste executado:** 12 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Golpes Velozes

**Desbloqueio da entrada/variante:** nível 30. **Formas com esta entrada:** Espadachim, Samurai, Ninja.

**Referência extraída — Samurai, nível 100:** Golpes Velozes: consome 64 MP e executa 2 ataques basicos. Tambem aplica sangramento por 3 turnos.

**Avaliação e ajuste:** Valor depende muito da armadura, subtraída em cada golpe. O Ninja recebe três golpes; o Samurai acrescenta sangramento. Uniformizar a regra de efeitos por ação e esclarecer que o sangramento desta habilidade é calculado de forma diferente do Corte Profundo.

**Teste executado:** 12 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Brado

**Desbloqueio da entrada/variante:** nível 50. **Formas com esta entrada:** Cavaleiro, Paladino.

**Referência extraída — Paladino, nível 100:** Brado: consome 60 MP e aumenta o ataque em 30% por 5 turnos. Tambem bloqueia 16% do dano sofrido nesse periodo.

**Avaliação e ajuste:** Brado prepara ataque e, no Paladino, defesa. Ira troca 80% da vida máxima por +150% de dano: muito arriscada sob resposta imediata do chefe. Testar custo menor de vida atual e bônus menor/duração clara; não avaliar Ira apenas pelo dano em alvo passivo.

**Teste executado:** 8 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Corte Profundo

**Desbloqueio da entrada/variante:** nível 50. **Formas com esta entrada:** Espadachim, Samurai, Ninja.

**Referência extraída — Samurai, nível 100:** Corte Profundo: consome 72 MP e causa 933 de dano. Ignora armadura. Aplica sangramento equivalente a 15% do dano causado por 3 turnos.

**Avaliação e ajuste:** Uma das melhores ferramentas do Espadachim contra armadura; o Samurai ignora armadura e o Ninja reforça sangramento. Preservar a identidade e mostrar dano direto e total de DOT separadamente.

**Teste executado:** 12 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Ira

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Berserker.

**Referência extraída — Berserker, nível 100:** Ira: consome 20 MP e 80% da sua vida maxima, aumentando o dano total em 150% por 4 turnos.

**Avaliação e ajuste:** Brado prepara ataque e, no Paladino, defesa. Ira troca 80% da vida máxima por +150% de dano: muito arriscada sob resposta imediata do chefe. Testar custo menor de vida atual e bônus menor/duração clara; não avaliar Ira apenas pelo dano em alvo passivo.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Bomba de Fumaca

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Ninja.

**Referência extraída — Ninja, nível 100:** Bomba de Fumaca: consome 60 MP, garante esquiva no proximo ataque do inimigo e fortalece em 30% o seu proximo dano.

**Avaliação e ajuste:** Esquiva garantida e preparação de +30% no próximo dano; combina com Contra-Ataque. Um contra-ataque pode consumir o bônus antes da ação ofensiva planejada. Comunicar essa interação ou reservar a carga à próxima ação escolhida.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Furar Blindagem

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Samurai.

**Referência extraída — Samurai, nível 100:** Furar Blindagem: consome 102 MP e causa 1071 de dano.

**Avaliação e ajuste:** Triplica dano contra escudo, mas o retorno da descrição não inclui ignorar armadura: o nome pode sugerir algo que a implementação não faz. Definir se é quebra-escudo ou perfuração e mostrar isso no tooltip.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Julgamento

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Paladino.

**Referência extraída — Paladino, nível 100:** Julgamento: consome 120 MP e causa 2468 de dano.

**Avaliação e ajuste:** Escala de 40% da vida máxima favorece Paladino resistente. Foi decisiva no bom resultado da build de vida. Manter a função de tanque ofensivo, com coeficiente que não torne força dispensável em toda situação.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Vallhala

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Berserker.

**Referência extraída — Berserker, nível 100:** Vallhala: consome 120 MP, faz voce receber 200% de dano adicional e adiciona 15% da vida maxima do inimigo em qualquer dano causado por 5 turnos.

**Avaliação e ajuste:** Adiciona 15% da vida máxima do inimigo por ocorrência de dano e aumenta o recebido em 200%. O dano em alvo passivo é enorme, mas a sobrevivência real cai. Limitar a parcela percentual por ação e reduzir a diferença extrema entre benefício e penalidade.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Cortes Ultrasonicos

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Samurai.

**Referência extraída — Samurai, nível 100:** Cortes Ultrasonicos: consome 260 MP. Por 3 turnos, voce so pode usar o ataque basico e nao pode ser atingido.

**Avaliação e ajuste:** Janela segura que restringe a ataques básicos. A sequência precisa usar básicos enquanto a trava durar; tentar outras skills não é combo válido. Especificar duração incluindo a conjuração e distinguir proteção contra golpes de dano periódico.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Escudo de Fe

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Paladino.

**Referência extraída — Paladino, nível 100:** Escudo de Fe: consome 2089 MP e por 3 turnos voce nao recebe dano. Depois, explode causando 50% do dano que teria sido absorvido ao inimigo.

**Avaliação e ajuste:** Ferramenta forte de sobrevivência e retaliação. Custa 70% do MP máximo mais custo por nível. O teste de duração mostra que três turnos nominais protegem duas respostas inimigas porque a conjuração já reduz o contador. Definir e exibir a convenção de duração.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Mata-Gigantes

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Ninja.

**Referência extraída — Ninja, nível 100:** Mata-Gigantes: consome 220 MP e causa 8000 de dano com base na vida atual do inimigo.

**Avaliação e ajuste:** 40% da vida atual do alvo favorece abertura e perde valor para finalizar. Armadura ainda pode reduzir o resultado. Adotar teto contra chefes ligado ao poder do atacante; manter a escolha de usá-la cedo.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Voce Ira Me Parar?

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Berserker.

**Referência extraída — Berserker, nível 100:** Voce Ira Me Parar?: consome 120 MP e 30% da sua vida maxima, impede pulos de turno e aumenta o ataque basico em 50 por 4 turnos.

**Avaliação e ajuste:** Buff de ataque com custo de 30% do HP máximo. Deve ter utilidade concreta contra controle; a verificação de skipNextTurn no início do turno não consulta esta habilidade. Corrigir/verificar imunidade a controle antes de aumentar números.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

### Passivas

#### Veloz

**Desbloqueio da entrada/variante:** nível 30. **Formas com esta entrada:** Espadachim, Samurai, Ninja.

**Referência extraída — Samurai, nível 100:** Veloz: concede 20% de chance do inimigo errar ao atacar voce.

**Avaliação e ajuste:** 20% de esquiva dá variância e alimenta Contra-Ataque. Preservar o papel de reação, mas não depender apenas de sorte para a sobrevivência das rotas de espada.

**Gatilho verificado:** 3/3 verificações passaram.

- Espadachim: `{"dodge": 0.2}`.
- Samurai: `{"dodge": 0.2}`.
- Ninja: `{"dodge": 0.2}`.

#### Vontade de Ferro

**Desbloqueio da entrada/variante:** nível 10. **Formas com esta entrada:** Guerreiro, Cavaleiro, Paladino, Berserker.

**Referência extraída — Paladino, nível 100:** Vontade de Ferro: reduz 60 de dano por ataque recebido. Alem disso, recupera 138 de vida por turno.

**Avaliação e ajuste:** Redução fixa é valiosa contra golpes pequenos; Cavaleiro adiciona regeneração de 3% do HP por turno. Com muitos inimigos fracos pode anular a ameaça. Usar fórmula de resistência ou piso de dano com regras separadas para DOT.

**Gatilho verificado:** 4/4 verificações passaram.

- Guerreiro: `{"reduction": 12, "damage": 88, "regen": 0}`.
- Cavaleiro: `{"reduction": 30, "damage": 70, "regen": 0.03}`.
- Paladino: `{"reduction": 60, "damage": 40, "regen": 0.03}`.
- Berserker: `{"reduction": 60, "damage": 40, "regen": 0.03}`.

#### Contra-Ataque

**Desbloqueio da entrada/variante:** nível 40. **Formas com esta entrada:** Espadachim, Samurai, Ninja.

**Referência extraída — Samurai, nível 100:** Contra-Ataque: ao desviar, executa um ataque basico de contra-ataque e recupera 30% do dano que o golpe causaria.

**Avaliação e ajuste:** Contra-ataca quando esquiva; Samurai cura e Ninja ignora defesa no contra-golpe. Funciona com Bomba de Fumaça, inclusive consumindo o bônus de próximo dano. Exibir a interação no log/tooltip.

**Gatilho verificado:** 3/3 verificações passaram.

- Espadachim: `{"counterDamage": 192, "healed": 0}`.
- Samurai: `{"counterDamage": 480, "healed": 30}`.
- Ninja: `{"counterDamage": 485, "healed": 0}`.

#### Refletir

**Desbloqueio da entrada/variante:** nível 40. **Formas com esta entrada:** Cavaleiro, Paladino, Berserker.

**Referência extraída — Paladino, nível 100:** Refletir: reflete 32% do dano recebido para o inimigo.

**Avaliação e ajuste:** Cavaleiro/Paladino refletem dano recebido; Berserker ganha chance de contra-atacar. As variantes passaram nos gatilhos testados. Usar flag de origem para reflexão não disparar cadeias de itens/reflexão.

**Gatilho verificado:** 3/3 verificações passaram.

- Cavaleiro: `{"reflection": 0.18, "enemyDamage": 12}`.
- Paladino: `{"reflection": 0.32, "enemyDamage": 12}`.
- Berserker: `{"reflection": 0, "enemyDamage": 495}`.

#### Aura Divina

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Paladino.

**Referência extraída — Paladino, nível 100:** Aura Divina: a cada turno, ganha um escudo persistente de 92.

**Avaliação e ajuste:** Escudo persistente de 2% do HP a cada turno reforça vida e cura. Contribui para o Paladino resistente. Definir teto de estoque e se turnos perdidos também devem gerar a proteção.

**Gatilho verificado:** 1/1 verificações passaram.

- Paladino: `{"shield": 92, "expected": 92}`.

#### Eliminar

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Ninja.

**Referência extraída — Ninja, nível 100:** Eliminar: causa 50% de dano total adicional contra inimigos abaixo de 50% da vida.

**Avaliação e ajuste:** Bônus de 50% contra alvo abaixo de metade da vida recompensa finalização. Combina com dano inicial percentual do Ninja. Usar limiar de HP consistente e mostrar quando está ativo.

**Gatilho verificado:** 1/1 verificações passaram.

- Ninja: `{"high": 100, "low": 150}`.

#### Mente Limpa

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Samurai.

**Referência extraída — Samurai, nível 100:** Mente Limpa: o primeiro ataque do combate acerta duas vezes, com o segundo golpe causando 50% do dano, mas repetindo os efeitos.

**Avaliação e ajuste:** Primeiro básico adiciona corte de 50%; a implementação não repete toda habilidade ativa. Funciona no teste de básico. Ajustar texto para não sugerir duplicação de qualquer skill nem duplicar proc de equipamento.

**Gatilho verificado:** 1/1 verificações passaram.

- Samurai: `{"first": 720, "second": 480}`.

#### Voce Nao e Digno

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Berserker.

**Referência extraída — Berserker, nível 100:** Voce Nao e Digno: uma vez por combate, ao sofrer um golpe fatal, fica com 1 de vida e pode agir mais uma vez antes de morrer.

**Avaliação e ajuste:** Concede uma ação após golpe fatal; se ela matar o inimigo, a vitória pode evitar a morte seguinte. Gatilho confirmado. Tornar o estado de última chance inequívoco e impedir que ação inválida consuma a oportunidade.

**Gatilho verificado:** 1/1 verificações passaram.

- Berserker: `{"hp": 1, "pending": true}`.

## Mago

### Ataque básico

Missel Magico: consome 15 MP, dispara 5 misseis e cada um causa entre 16 e 34 de dano.

Custa MP por míssil, mas a regeneração de 10% do máximo por turno frequentemente cobre o custo. Arcanista e suas rotas recebem dano fixo por míssil; corrigir essa escala antes de itens.

### Ativas

#### Explosao de Mana

**Desbloqueio da entrada/variante:** nível 20. **Formas com esta entrada:** Mago, Elementalista, Mago Incendiario, Mago Frigido, Arcanista, Arquimago, Corrompido.

**Referência extraída — Mago Incendiario, nível 100:** Explosao de Mana: consome 40 MP e causa 1366 de dano.

**Avaliação e ajuste:** Muito forte contra chefes com mana: queima metade da mana atual e converte essa quantidade em dano. Alternar com básicos/elementais evita desperdiçar a parte de queima quando o alvo está vazio. Revisar a razão de conversão e o ritmo de recuperação de mana dos chefes.

**Teste executado:** 28 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Bola de Fogo

**Desbloqueio da entrada/variante:** nível 30. **Formas com esta entrada:** Elementalista, Mago Incendiario.

**Referência extraída — Mago Incendiario, nível 100:** Bola de Fogo: consome 40 MP e causa 2392 de dano de fogo. A queimadura causa 1000 por turno durante 3 turnos e reduz a cura recebida pelo inimigo em 30%.

**Avaliação e ajuste:** Bola de Fogo oferece DOT e redução de cura; Bola de Neve oferece redução de ataque e interage com Gelo Queima. As duas variantes precisam de avaliações e tooltips distintos. Limitar DOT percentual em chefes pelo poder do usuário.

**Teste executado:** 8 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Bola de Neve

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Mago Frigido.

**Referência extraída — Mago Frigido, nível 100:** Bola de Neve: consome 40 MP e causa 657 de dano. Aplica resfriamento por 3 turnos, reduzindo em 30% o ataque do inimigo.

**Avaliação e ajuste:** Bola de Fogo oferece DOT e redução de cura; Bola de Neve oferece redução de ataque e interage com Gelo Queima. As duas variantes precisam de avaliações e tooltips distintos. Limitar DOT percentual em chefes pelo poder do usuário.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Descarregar

**Desbloqueio da entrada/variante:** nível 30. **Formas com esta entrada:** Arcanista, Arquimago, Corrompido.

**Referência extraída — Arquimago, nível 100:** Descarregar: consome 779 MP, gasta todas as cargas arcanas e causa 1753 de dano.

**Avaliação e ajuste:** O jogador acumula cargas com mísseis e escolhe quando descarregar. Hoje competir com o bônus fixo multiplicado em cada míssil é difícil. Aumentar seu papel de consumir cargas depois de corrigir o básico; informar custo e expiração das cargas.

**Teste executado:** 12 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Bafo de Fogo

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Mago Incendiario.

**Referência extraída — Mago Incendiario, nível 100:** Bafo de Fogo: consome 60 MP, causa 989 de dano e aplica queimadura por 6 turnos.

**Avaliação e ajuste:** Congelar prepara vulnerabilidade/controle no Frígido; Bafo de Fogo mantém queimadura longa no Incendiário. A ordem com Bola de Neve importa para o estado resfriado. Tornar o estado necessário e a chance de controle visíveis.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Congelar

**Desbloqueio da entrada/variante:** nível 50. **Formas com esta entrada:** Elementalista, Mago Frigido.

**Referência extraída — Mago Frigido, nível 100:** Congelar: consome 60 MP, causa 480 de dano e tem 30% de chance de impedir o proximo ataque do inimigo. Se nao impedir o turno, aplica resfriamento por 2 turnos ou Congelamento se o alvo ja estiver resfriado.

**Avaliação e ajuste:** Congelar prepara vulnerabilidade/controle no Frígido; Bafo de Fogo mantém queimadura longa no Incendiário. A ordem com Bola de Neve importa para o estado resfriado. Tornar o estado necessário e a chance de controle visíveis.

**Teste executado:** 8 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Escudo de Mana

**Desbloqueio da entrada/variante:** nível 50. **Formas com esta entrada:** Arcanista, Arquimago, Corrompido.

**Referência extraída — Arquimago, nível 100:** Escudo de Mana: consome 1246 MP e concede 1598 de escudo por 2 turnos.

**Avaliação e ajuste:** Escudo escala com MP e compete com o gasto da mana. É coerente com Arcanista; no Corrompido há enfraquecimento reativo. Deve respeitar a mesma defesa na arena e não substituir escudo maior silenciosamente sem informar.

**Teste executado:** 12 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Concentracao

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Arquimago.

**Referência extraída — Arquimago, nível 100:** Concentracao: consome 979 MP, aumenta o dano total em 20% e a regeneracao de mana em 10% por 4 turnos.

**Avaliação e ajuste:** Buff útil em combate longo, mas perde valor quando os mísseis já encerram a luta no primeiro turno. Reavaliar depois de corrigir Transbordando; promover janela de preparação sem exigir buff obrigatório em toda luta.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Corrupcao

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Corrompido.

**Referência extraída — Corrompido, nível 100:** Corrupcao: consome 1018 MP, causa 2573 de dano, remove toda a armadura do inimigo e impede escudos por 5 turnos.

**Avaliação e ajuste:** Boa abertura contra armadura: dano ignora armadura, remove a defesa temporariamente e impede novos escudos. O custo é 30% da mana atual e pode chegar a zero quando vazia; definir custo mínimo para impedir spam sem decisão.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Fenix Sagrada

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Mago Incendiario.

**Referência extraída — Mago Incendiario, nível 100:** Fenix Sagrada: consome 1233 MP e causa 1959 de dano, aplicando queimadura por 1 turno.

**Avaliação e ajuste:** Custo cresce com poder de habilidade, enquanto aplica apenas um turno de queimadura. Sua eficiência deve ser comparada a Bola/Bafo e Explodir. Dar função própria de explosão/recuperação ou reduzir custo; não assumir cura/revive apenas pelo nome Fênix.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Nevasca

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Mago Frigido.

**Referência extraída — Mago Frigido, nível 100:** Nevasca: consome 120 MP e faz o inimigo ter 15% de chance de perder o turno por 6 turnos.

**Avaliação e ajuste:** 15% de chance de perder turno por seis turnos tem valor esperado pequeno para gastar uma ação. Torna-se diferente na dungeon por afetar grupo de inimigos. Exibir valor de controle e testar redução de ataque/efeito garantido pequeno como complemento.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Avalanche

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Mago Frigido.

**Referência extraída — Mago Frigido, nível 100:** Avalanche: consome 400 MP, causa 10807 de dano e aplica resfriamento por 4 turnos.

**Avaliação e ajuste:** Dano de 50% do HP máximo do alvo e resfriamento, sem o custo de HP de Explodir. Foi uma das melhores ferramentas de chefe. Reduzir parcela percentual/teto e reforçar a recompensa de preparar resfriamento em vez de repetir Avalanche.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Explodir

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Mago Incendiario.

**Referência extraída — Mago Incendiario, nível 100:** Explodir: consome 500 MP, 50% da sua vida maxima e causa 14014 de dano.

**Avaliação e ajuste:** 50% do HP máximo do alvo mais coeficientes próprios gera explosão independente da build, com custo de HP. É poderosa, mas o usuário precisa sobreviver à resposta se não matar. Separar dano percentual de chefe e dano baseado em poder.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Incorporar Demonio

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Corrompido.

**Referência extraída — Corrompido, nível 100:** Incorporar Demonio: consome 1018 MP, concede 200% de dano total adicional por 3 turnos e faz voce receber 30% de dano adicional pelo mesmo tempo.

**Avaliação e ajuste:** Preparação de +200% de dano com +30% de vulnerabilidade. Útil em lutas que sobrevivam à abertura, mas amplia uma base já excessiva. Reduzir o multiplicador e garantir que o risco seja aplicado durante a janela descrita.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Sobrecarregar

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Arquimago.

**Referência extraída — Arquimago, nível 100:** Sobrecarregar: consome 3896 MP e causa 5849 de dano usando sua mana maxima e as cargas arcanas.

**Avaliação e ajuste:** Finalizador baseado em MP máximo e cargas, com gasto próximo de toda a reserva. Atualmente o básico frequentemente o supera com menos custo. Reconstruir a relação carga/custo/dano depois de limitar Transbordando por ação.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

### Passivas

#### Ultimo Recurso

**Desbloqueio da entrada/variante:** nível 10. **Formas com esta entrada:** Mago, Elementalista, Mago Incendiario, Mago Frigido, Arcanista, Arquimago, Corrompido.

**Referência extraída — Mago Incendiario, nível 100:** Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe.

**Avaliação e ajuste:** Gasta duas vezes o dano fatal em MP; vulnerabilidade do Corrompido aumenta esse dano antes do cálculo. Gatilho confirmado nas quatro rotas. Exibir custo previsto depois de mitigação/vulnerabilidade para evitar falsa segurança.

**Gatilho verificado:** 7/7 verificações passaram.

- Mago: `{"hp": 1, "mp": 300, "manaSpent": 200, "expected": 200}`.
- Elementalista: `{"hp": 1, "mp": 300, "manaSpent": 200, "expected": 200}`.
- Mago Incendiario: `{"hp": 1, "mp": 300, "manaSpent": 200, "expected": 200}`.
- Mago Frigido: `{"hp": 1, "mp": 300, "manaSpent": 200, "expected": 200}`.
- Arcanista: `{"hp": 1, "mp": 300, "manaSpent": 200, "expected": 200}`.
- Arquimago: `{"hp": 1, "mp": 300, "manaSpent": 200, "expected": 200}`.
- Corrompido: `{"hp": 1, "mp": 200, "manaSpent": 300, "expected": 300}`.

#### Mana e Vida

**Desbloqueio da entrada/variante:** nível 40. **Formas com esta entrada:** Elementalista, Mago Incendiario, Mago Frigido.

**Referência extraída — Mago Incendiario, nível 100:** Mana e Vida: converte 50% da mana maxima em vida maxima. Alem disso, concede 546 de dano de habilidade.

**Avaliação e ajuste:** MP também vira HP, e no Incendiário poder; por isso mana pura não significa a mesma fragilidade nas quatro classes. Evitar que itens de MP aumentem simultaneamente defesa, dano e recuperação sem orçamento.

**Gatilho verificado:** 3/3 verificações passaram.

- Elementalista: `{"bonusHp": 466, "maxMp": 932, "factor": 0.5}`.
- Mago Incendiario: `{"bonusHp": 1518, "maxMp": 3036, "factor": 0.5}`.
- Mago Frigido: `{"bonusHp": 2233, "maxMp": 3436, "factor": 0.65}`.

#### Transbordando

**Desbloqueio da entrada/variante:** nível 40. **Formas com esta entrada:** Arcanista, Arquimago, Corrompido.

**Referência extraída — Arquimago, nível 100:** Transbordando: concede 1753 de dano adicional em ataques e habilidades e aumenta os custos das habilidades em 779.

**Avaliação e ajuste:** Principal distorção: dano fixo de 30%/45% do MP máximo entra em cada míssil, enquanto o básico mantém custo baixo. Aplicar um único orçamento adicional por ação, dividido entre projéteis; recalibrar os custos depois.

**Gatilho verificado:** 3/3 verificações passaram.

- Arcanista: `{"flat": 297, "costIncrease": 99, "maxMp": 992}`.
- Arquimago: `{"flat": 1753, "costIncrease": 779, "maxMp": 3896}`.
- Corrompido: `{"flat": 1018, "costIncrease": 339, "maxMp": 3396}`.

#### Canhao de Vidro

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Corrompido.

**Referência extraída — Corrompido, nível 100:** Canhao de Vidro: o primeiro ataque do combate causa o dobro de dano, mas voce sofre 50% de dano adicional nos 2 primeiros turnos do combate.

**Avaliação e ajuste:** Primeiro dano dobrado e vulnerabilidade inicial. O básico multi-hit amplifica uma base já excessiva e elimina o risco se matar imediatamente. Corrigir a base antes de julgar a passiva pela taxa de vitórias.

**Gatilho verificado:** 1/1 verificações passaram.

- Corrompido: `{"boosted": 32370, "normal": 16185, "incoming": 0.5}`.

#### Carregar

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Arquimago.

**Referência extraída — Arquimago, nível 100:** Carregar: cada carga arcana aumenta o dano total em 5%. Atualmente: 0%.

**Avaliação e ajuste:** Cada carga informa +5% de dano total. O ataque de mísseis aplica o bônus percentual antes de chamar o aplicador que o adiciona novamente. Centralizar a multiplicação; não aumentar itens de dano total sobre essa duplicação.

**Gatilho verificado:** 1/1 verificações passaram.

- Arquimago: `{"percent": 0.15000000000000002}`.

#### Fogo do Inferno

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Mago Incendiario.

**Referência extraída — Mago Incendiario, nível 100:** Fogo do Inferno: aumenta o dano da queimadura de 3% para 5% da vida maxima do inimigo por turno.

**Avaliação e ajuste:** Aumenta queimadura de 3% para 5% do HP máximo inimigo por tick. Muito eficiente em chefes grandes. Aplicar teto baseado no poder de habilidade e manter a vantagem de manter queimaduras.

**Gatilho verificado:** 1/1 verificações passaram.

- Mago Incendiario: `{"burn": 1000, "expected": 1000}`.

#### Gelo Queima

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Mago Frigido.

**Referência extraída — Mago Frigido, nível 100:** Gelo Queima: sempre que aplicar resfriamento, tambem causa queimadura de 3% da vida maxima por 1 turno.

**Avaliação e ajuste:** Resfriamento também provoca DOT de 3% do HP máximo. Gatilho confirmado. Combina dano e mitigação sem depender de força; contabilizar ambas as vantagens no custo das skills frias.

**Gatilho verificado:** 1/1 verificações passaram.

- Mago Frigido: `{"burn": 600, "turns": 1}`.

## Arqueiro

### Ataque básico

Ataque basico. Dano entre 60 e 65. Chance de acerto: 84%.

Chance básica de acerto é 84%; Mirar garante acerto e aumenta ataque. Equipamentos de precisão precisam ter valor sem tornar Mirar inútil.

### Ativas

#### Mirar

**Desbloqueio da entrada/variante:** nível 1. **Formas com esta entrada:** Arqueiro, Atirador, Atirador Arcano, Sniper, Cacador, Espreitador, Guarda Florestal.

**Referência extraída — Atirador Arcano, nível 100:** Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta o dano de ataque basico em 105, alem de fortalecer o Headshot em 10% e dar +10% de chance de critico.

**Avaliação e ajuste:** Preparação de precisão e dano por vários ataques; eficiente em lutas longas e sinérgica com Headshot/Rajada. Perde um turno em encontros curtos. Informar quantas ações restam e avaliar buff parcial sem custo de turno na primeira utilização.

**Teste executado:** 28 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Camuflagem

**Desbloqueio da entrada/variante:** nível 20. **Formas com esta entrada:** Arqueiro, Atirador, Atirador Arcano, Sniper, Cacador, Espreitador, Guarda Florestal.

**Referência extraída — Atirador Arcano, nível 100:** Camuflagem: consome 90 MP e concede 20% de esquiva adicional por 4 turnos, deixando o proximo dano causado 30% mais forte.

**Avaliação e ajuste:** Defesa por esquiva; no Atirador também prepara o próximo dano e no Espreitador prepara Surpresa. Funciona no fluxo de campanha testado. O estado detalhado da última ação precisa ser preservado igualmente nos modos online.

**Teste executado:** 28 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Headshot

**Desbloqueio da entrada/variante:** nível 30. **Formas com esta entrada:** Atirador, Atirador Arcano, Sniper.

**Referência extraída — Atirador Arcano, nível 100:** Headshot: consome 90 MP e causa 2954 de dano, com 15% de chance total de critico. Se nao critar, marca o alvo para receber 15% a mais no proximo golpe.

**Avaliação e ajuste:** Pilar do Atirador. Sniper soma crítico e Atirador Arcano escala com MP máximo. Com Mirar pode ultrapassar 100% de crítico e transformar excedente em dano. Centralizar a composição da chance e comparar ao Tiro Perfurante contra armadura.

**Teste executado:** 12 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Rajada de Flechas

**Desbloqueio da entrada/variante:** nível 30. **Formas com esta entrada:** Cacador, Espreitador, Guarda Florestal.

**Referência extraída — Espreitador, nível 100:** Rajada de Flechas: consome 60 MP e realiza 2 ataques basicos no mesmo turno.

**Avaliação e ajuste:** Dano por múltiplos ataques, com tiros extras no Guarda Florestal e interação com Mirar/Armadilha. Sofre várias subtrações de armadura e testes de acerto. Não balancear somente pelo número de flechas; rever mitigação e efeitos por ação.

**Teste executado:** 12 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Armadilha

**Desbloqueio da entrada/variante:** nível 50. **Formas com esta entrada:** Cacador, Espreitador, Guarda Florestal.

**Referência extraída — Espreitador, nível 100:** Armadilha: consome 80 MP, causa 2083 de dano e tem 30% de chance de fazer o inimigo perder o proximo turno. O dano inclui 8% da vida atual do inimigo.

**Avaliação e ajuste:** Dano mais chance de controle. Espreitador adiciona 8% do HP atual e Guarda prepara Rajada quando prende. Combos são probabilísticos; não prometer a Rajada fortalecida sem confirmar o estado. Mostrar sucesso/falha da preparação.

**Teste executado:** 12 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Tiro Perfurante

**Desbloqueio da entrada/variante:** nível 50. **Formas com esta entrada:** Atirador, Atirador Arcano, Sniper.

**Referência extraída — Atirador Arcano, nível 100:** Tiro Perfurante: consome 80 MP e causa 1379 de dano, ignorando armadura e escudo do inimigo.

**Avaliação e ajuste:** Ferramenta confiável contra alvos blindados: ignora armadura e escudo; Sniper também quebra o escudo. Precisa manter uma vantagem de nicho frente ao spam de Headshot e distinguir atravessar de remover escudo.

**Teste executado:** 12 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Emergencia Arcana

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Atirador Arcano.

**Referência extraída — Atirador Arcano, nível 100:** Emergencia Arcana: consome 100 MP e causa 823 de dano arcano. O dano aumenta conforme sua mana atual estiver abaixo da mana maxima.

**Avaliação e ajuste:** Escala com mana faltante e combina com gastar a reserva antes. A build precisa ainda pagar 100 MP depois do gasto. Sobreaquecer seguido de regeneração pode abrir essa janela; mostrar a projeção de dano e a mana necessária.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Executar

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Sniper.

**Referência extraída — Sniper, nível 100:** Executar: consome 120 MP e causa 1157 de dano. Se o inimigo estiver abaixo de 40% da vida, o dano e triplicado.

**Avaliação e ajuste:** Finalizador abaixo de 40% do HP: fora da faixa perde muito valor. Usar Ponto Fraco/Headshot antes e exibir o limiar no alvo. Reavaliar multiplicador com críticos e bônus de conjunto.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Surpresa

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Espreitador.

**Referência extraída — Espreitador, nível 100:** Surpresa: consome 80 MP e causa 764 de dano.

**Avaliação e ajuste:** Recompensa agir após Camuflagem; a ordem faz parte da identidade do Espreitador. Mantê-la competitiva com outras aberturas e corrigir qualquer modo que substitua o tipo específico da última ação por um texto genérico.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Tranquilizante

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Guarda Florestal.

**Referência extraída — Guarda Florestal, nível 100:** Tranquilizante: consome 80 MP, causa 664 de dano e reduz em 30% o dano do inimigo por 3 turnos.

**Avaliação e ajuste:** Reduz em 30% o dano do inimigo e ajuda bastante em encontros prolongados. O custo de abrir com defesa precisa compensar a perda de dano inicial. Preservar sua utilidade em grupo, com resistência a controle própria para chefes.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Mirar no Pe

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Espreitador.

**Referência extraída — Espreitador, nível 100:** Mirar no Pe: consome 100 MP, causa 558 de dano, reduz em 15% o dano do inimigo, corta 50% da armadura por 3 turnos e tem 10% de chance de fazer o alvo perder o proximo turno.

**Avaliação e ajuste:** Redução de armadura e dano prepara a sequência do Espreitador. Preferir em alvo blindado antes de Rajada/Surpresa; o controle adicional é incerto. A classe precisa converter essa preparação em dano antes de morrer.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Ponto Fraco

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Sniper.

**Referência extraída — Sniper, nível 100:** Ponto Fraco: consome 120 MP e causa 5485 de dano, explorando a vida atual do alvo.

**Avaliação e ajuste:** 25% da vida atual faz sentido como abertura; combina com Executar no fim. Um dos bons exemplos de ordem tática. Impor orçamento percentual contra chefes sem apagar a diferença entre abertura e execução.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Sobreaquecer

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Atirador Arcano.

**Referência extraída — Atirador Arcano, nível 100:** Sobreaquecer: gasta toda a mana atual (3426) e causa 3355 de dano.

**Avaliação e ajuste:** Gasta toda a mana atual e abre Emergência Arcana depois da recuperação. Não é botão sempre melhor: pode impedir controle/defesa subsequente. Definir um custo mínimo/condição quando MP for zero para não virar ataque gratuito involuntário.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Tiro Cortante

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Guarda Florestal.

**Referência extraída — Guarda Florestal, nível 100:** Tiro Cortante: consome 80 MP e faz o alvo sofrer 381 de dano por rodada durante 3 rodadas (1143 no total).

**Avaliação e ajuste:** DOT de três turnos ajuda a contornar armadura por golpe. Reaplicar cedo apenas renova a duração; mostrar o dano restante e evitar sobrescrever sangramento melhor sem aviso. Reforçar a rota de desgaste do Guarda.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

### Passivas

#### Passos Leves — level_scaling

**Desbloqueio da entrada/variante:** nível 10. **Formas com esta entrada:** Arqueiro.

**Referência extraída — Arqueiro, nível 20:** Passos Leves: concede 15% de chance do inimigo errar o ataque contra voce.

**Avaliação e ajuste:** Esquiva cresce com nível e chega a 55% no nível 100. O ganho é grande mesmo sem investir defesa. Mostrar a chance total e reservar espaço de orçamento para equipamentos.

**Gatilho verificado:** 1/1 verificações passaram.

- Arqueiro: `{"dodge": 0.15000000000000002, "crit": 0, "coinBonus": 0}`.

#### Passos Leves — double_bonus

**Desbloqueio da entrada/variante:** nível 30. **Formas com esta entrada:** Atirador, Atirador Arcano, Sniper.

**Referência extraída — Atirador Arcano, nível 100:** Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e 5% de chance de critico em qualquer ataque ou habilidade.

**Avaliação e ajuste:** Passos Leves na rota Atirador mantém a esquiva e dá crítico. Verificar as parcelas adicionais de crítico do Sniper, que são adicionadas em vários ifs por subclasse/nível.

**Gatilho verificado:** 3/3 verificações passaram.

- Atirador: `{"dodge": 0.3, "crit": 0.05, "coinBonus": 0}`.
- Atirador Arcano: `{"dodge": 0.55, "crit": 0.05, "coinBonus": 0}`.
- Sniper: `{"dodge": 0.55, "crit": 0.5, "coinBonus": 0}`.

#### Passos Leves — coin_bonus

**Desbloqueio da entrada/variante:** nível 30. **Formas com esta entrada:** Cacador, Espreitador, Guarda Florestal.

**Referência extraída — Espreitador, nível 100:** Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e aumenta em 10% as moedas recebidas dos inimigos.

**Avaliação e ajuste:** Passos Leves no Caçador acrescenta moedas à mesma esquiva. É progressão econômica e não substitui uma defesa ativa em chefes. Comparar o ganho monetário fora da métrica de dano.

**Gatilho verificado:** 3/3 verificações passaram.

- Cacador: `{"dodge": 0.3, "crit": 0, "coinBonus": 0.1}`.
- Espreitador: `{"dodge": 0.55, "crit": 0, "coinBonus": 0.1}`.
- Guarda Florestal: `{"dodge": 0.55, "crit": 0, "coinBonus": 0.1}`.

#### Errou

**Desbloqueio da entrada/variante:** nível 40. **Formas com esta entrada:** Cacador, Espreitador, Guarda Florestal.

**Referência extraída — Espreitador, nível 100:** Errou: ao esquivar de um ataque, seu proximo dano causado fica 50% mais forte.

**Avaliação e ajuste:** Errou muda de papel: dano no Caçador/Espreitador e cura no Guarda. Gatilhos confirmados. A variante de cura precisa continuar ajudando sem produzir lutas intermináveis de esquiva e regeneração.

**Gatilho verificado:** 3/3 verificações passaram.

- Cacador: `{"next": 0, "buff": 0.1, "heal": 0}`.
- Espreitador: `{"next": 0.5, "buff": 0, "heal": 0}`.
- Guarda Florestal: `{"next": 0, "buff": 0, "heal": 525}`.

#### Pulso Firme

**Desbloqueio da entrada/variante:** nível 40. **Formas com esta entrada:** Atirador, Atirador Arcano, Sniper.

**Referência extraída — Atirador Arcano, nível 100:** Pulso Firme: concede 90 de dano de ataque basico e 130 de dano de habilidade no nivel atual.

**Avaliação e ajuste:** Pulso Firme dá ataque/poder e, no Sniper, se associa a crítico extra. É crescimento automático forte que beneficia pouco a escolha de distribuição. Mostrar as fontes de atributo separadamente.

**Gatilho verificado:** 3/3 verificações passaram.

- Atirador: `{"attack": 60, "power": 60}`.
- Atirador Arcano: `{"attack": 105, "power": 366}`.
- Sniper: `{"attack": 175, "power": 105}`.

#### Cristalizar Mana

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Atirador Arcano.

**Referência extraída — Atirador Arcano, nível 100:** Cristalizar Mana: converte 171 de mana maxima em dano de habilidade.

**Avaliação e ajuste:** Converte 5% do MP máximo em poder. Junto do coeficiente de MP do Headshot torna mana a principal distribuição ofensiva do Atirador Arcano. Limitar a soma das conversões em equipamentos.

**Gatilho verificado:** 1/1 verificações passaram.

- Atirador Arcano: `{"power": 366, "fromMana": 171}`.

#### Olhos de Falcao

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Sniper.

**Referência extraída — Sniper, nível 100:** Olhos de Falcao: concede 15% de chance de critico e faz qualquer excedente acima de 100% virar dano critico adicional.

**Avaliação e ajuste:** Acrescenta crítico e favorece excedente acima de 100%. O aumento ao cruzar 70 foi confirmado. Auditar bônus de 15% duplicados ao entrar no Sniper e definir limite para o excedente.

**Gatilho verificado:** 1/1 verificações passaram.

- Sniper: `{"at70": 0.5, "at69": 0.35, "delta": 0.15000000000000002, "critical": {"totalChance": 1.3, "critChance": 1, "critDamageBonus": 1.3, "multiplierOnCrit": 2.3}}`.

#### Passos Silenciosos

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Espreitador.

**Referência extraída — Espreitador, nível 100:** Passos Silenciosos: concede 7% de chance do inimigo perder o turno sem atacar.

**Avaliação e ajuste:** 7% de chance de negar o turno inimigo é um complemento, não uma defesa confiável. A descrição deve mostrar probabilidade; um mecanismo de preparação garantida pode reduzir frustração.

**Gatilho verificado:** 1/1 verificações passaram.

- Espreitador: `{"skip": 0.07}`.

#### Resistencia Florestal

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Guarda Florestal.

**Referência extraída — Guarda Florestal, nível 100:** Resistencia Florestal: reduz 20 de dano por ataque recebido.

**Avaliação e ajuste:** 20 de redução no nível 100 ajuda contra vários golpes, mas é pouco frente aos chefes finais. Avaliar junto da esquiva/cura do Guarda, sem tentar corrigir sua falta de dano apenas com resistência.

**Gatilho verificado:** 1/1 verificações passaram.

- Guarda Florestal: `{"flat": 20}`.

## Adepto da Natureza

### Ataque básico

Ataque basico. Dano entre 56 e 61.

Usa ataque e recebe bônus na Forma Verdadeira; não substitui a preparação de marca/raiz. Serve também para recuperar MP dentro da forma.

### Ativas

#### Semente Viva

**Desbloqueio da entrada/variante:** nível 1. **Formas com esta entrada:** Adepto da Natureza, Druida, Druida Sombrio, Avatar da Natureza, Espirito da Floresta, Fada Monarca, Protetor da Floresta.

**Referência extraída — Druida Sombrio, nível 100:** Semente Viva: consome 70 MP, causa 446 de dano e marca o alvo por 4 turnos. A marca tambem causa 345 por turno.

**Avaliação e ajuste:** Entrada central dos combos: marca, aumenta dano posterior e habilita reembolso/efeitos por rota. Druida acrescenta DOT e Espírito reduz ataque inimigo. A classe deveria comunicar esse preparo antes de apresentar dano baixo como falha.

**Teste executado:** 28 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Raizes

**Desbloqueio da entrada/variante:** nível 20. **Formas com esta entrada:** Adepto da Natureza, Druida, Druida Sombrio, Avatar da Natureza, Espirito da Floresta, Fada Monarca, Protetor da Floresta.

**Referência extraída — Druida Sombrio, nível 100:** Raizes: consome 90 MP, causa 716 de dano e tem 60% de chance de enraizar.

**Avaliação e ajuste:** Prepara veneno, cura e Esmagar Invasor; sucesso é probabilístico. Enraizar não equivale automaticamente a perder turno na implementação. Descrever isso e exibir claramente se a raiz foi aplicada antes da próxima decisão.

**Teste executado:** 28 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Encanto da Brisa

**Desbloqueio da entrada/variante:** nível 30. **Formas com esta entrada:** Espirito da Floresta, Fada Monarca, Protetor da Floresta.

**Referência extraída — Fada Monarca, nível 100:** Encanto da Brisa: consome 60 MP, causa 648 de dano e tem 30% de chance de pular o turno do inimigo. Se o alvo estiver marcado, pode enraizar.

**Avaliação e ajuste:** Controle para Fada e geração de escudo por dano no Protetor quando há marca. É uma ligação ofensiva/defensiva valiosa. Ajustar taxa de conversão e custo para viabilizar a ponte até Jogar Espinhos sem depender de mana extrema.

**Teste executado:** 12 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Flor do Pantano

**Desbloqueio da entrada/variante:** nível 30. **Formas com esta entrada:** Druida, Druida Sombrio, Avatar da Natureza.

**Referência extraída — Druida Sombrio, nível 100:** Flor do Pantano: consome 60 MP e causa 706 de dano. Se o alvo estiver enraizado, aplica veneno de 172 por 7 turnos.

**Avaliação e ajuste:** Aplica veneno quando o alvo está enraizado. A rotação precisa verificar a raiz, e o Sombrio pode colher a duração longa. Exibir o veneno esperado e oferecer um benefício parcial quando a preparação falhar.

**Teste executado:** 12 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Cancao Ancestral

**Desbloqueio da entrada/variante:** nível 50. **Formas com esta entrada:** Espirito da Floresta, Fada Monarca, Protetor da Floresta.

**Referência extraída — Fada Monarca, nível 100:** Cancao Ancestral: consome 80 MP e cura 799.

**Avaliação e ajuste:** Cura maior contra raiz; Protetor também ganha escudo e Fada enfraquece o alvo. Gera Cadência apenas com cura efetiva/escudo. Explicar que conjurar de HP cheio sem escudo pode não construir a preparação desejada.

**Teste executado:** 12 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Colheita

**Desbloqueio da entrada/variante:** nível 50. **Formas com esta entrada:** Druida, Druida Sombrio, Avatar da Natureza.

**Referência extraída — Druida Sombrio, nível 100:** Colheita: consome 70 MP, causa 556 de dano e consome efeitos naturais ativos para explodir o dano restante.

**Avaliação e ajuste:** Finaliza antecipando DOT; Sombrio consome os três efeitos e Avatar converte parte do dano em escudo. Foi relevante para a explosão Colapso→Colheita. Garantir que o dano consumido não seja contado novamente como tick/proc de item.

**Teste executado:** 12 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Apodrecer

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Druida Sombrio.

**Referência extraída — Druida Sombrio, nível 100:** Apodrecer: consome 90 MP, causa 576 de dano e aplica apodrecimento por 5 turnos.

**Avaliação e ajuste:** DOT percentual próprio do Sombrio, que combina com Seiva/Podridão/Colheita. Requer teto de chefe e comparação entre deixar o DOT correr e antecipá-lo. Deve ter utilidade fora da rotação de explosão mais curta.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Casulo de Vinhas

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Protetor da Floresta.

**Referência extraída — Protetor da Floresta, nível 100:** Casulo de Vinhas: consome 120 MP e concede 1384 de escudo.

**Avaliação e ajuste:** Escudo acumulável que permite preparar Jogar Espinhos. A rotação precisa considerar dano absorvido entre os casts e disponibilidade de MP/HP. Colocar um teto de estoque e preservar a escolha entre gastar escudo e sobreviver.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Decreto da Rainha

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Fada Monarca.

**Referência extraída — Fada Monarca, nível 100:** Decreto da Rainha: consome 90 MP e causa 1142 de dano. Com 3 Cadencias, o fator sobe para 2.9.

**Avaliação e ajuste:** Finalizador que cresce com três Cadências. A preparação funciona melhor se também curar/proteger em vez de perder três turnos em ações sem efeito. Melhorar o feedback da potência preparada e comparar a Raízes repetida.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Forma Verdadeira

**Desbloqueio da entrada/variante:** nível 60. **Formas com esta entrada:** Avatar da Natureza.

**Referência extraída — Avatar da Natureza, nível 100:** Forma Verdadeira: consome toda a mana maxima, aumenta ataque em 26%, reduz dano sofrido em 18% e fortalece ataques basicos por 5 turnos.

**Avaliação e ajuste:** Gasta a mana máxima inteira para abrir cinco turnos de buff. Precisa ser usada com MP cheio, e o gasto entra em conflito com Esmagar Invasor. Testar custo parcial ou recuperação/benefício condicionado ao básico durante a forma.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Colapso do Brejo

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Druida Sombrio.

**Referência extraída — Druida Sombrio, nível 100:** Colapso do Brejo: consome 2716 MP e causa 1567 de dano. Se o alvo nao tiver DOT natural, aplica marca, veneno e apodrecimento por 4 turnos.

**Avaliação e ajuste:** Aplica os três DOTs quando o alvo não tem DOT natural; se usado depois da preparação, perde essa função. Abertura Colapso→Colheita é diferente de Semente→Raízes→Flor. Mostrar a condição e limitar a explosão percentual em chefes.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Coroar

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Fada Monarca.

**Referência extraída — Fada Monarca, nível 100:** Coroar: consome 500 MP e fica coroada por 5 turnos, com +30% poder de habilidade, +20% curas e +20% nas chances de controle.

**Avaliação e ajuste:** Coroa melhora poder, cura, controle e esquiva por passiva. É o centro da Fada, mas gastar uma ação de buff diante de chefe agressivo pode inviabilizar a preparação. Comparar duas curas efetivas antes com coroação imediata.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Esmagar Invasor

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Avatar da Natureza.

**Referência extraída — Avatar da Natureza, nível 100:** Esmagar Invasor: consome 380 MP e causa 878 de dano, com bonus contra alvo enraizado e na Forma Verdadeira.

**Avaliação e ajuste:** Dano melhora com raiz e Forma Verdadeira, mas custa pelo menos 300 MP e disputa recurso com o custo integral da forma. Reduzir a incompatibilidade de custos ou conceder desconto enquanto transformado.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

#### Jogar Espinhos

**Desbloqueio da entrada/variante:** nível 80. **Formas com esta entrada:** Protetor da Floresta.

**Referência extraída — Protetor da Floresta, nível 100:** Jogar Espinhos: consome 400 MP, 20% da vida maxima e todo seu escudo atual para causar 0 de dano ignorando armadura e escudo.

**Avaliação e ajuste:** Transforma escudo acumulado em dano que ignora armadura/escudo, pagando HP. As rotações Casulo/Canção melhoram muito a função; usar sem escudo é desperdício. Bloquear/alertar execução com estoque zero e limitar o dano por ação contra estoque artificial.

**Teste executado:** 4 sondagens em 4 condições; 0 exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.

### Passivas

#### Ciclo Natural

**Desbloqueio da entrada/variante:** nível 10. **Formas com esta entrada:** Adepto da Natureza, Druida, Druida Sombrio, Avatar da Natureza, Espirito da Floresta, Fada Monarca, Protetor da Floresta.

**Referência extraída — Druida Sombrio, nível 100:** Ciclo Natural: alvos marcados recebem 16% a mais de dano e devolvem 10% do custo da habilidade usada contra eles.

**Avaliação e ajuste:** Marca aumenta dano e reembolsa 10% do custo; Espírito também converte ataque em poder. Gatilho confirmado. Preservar um único reembolso por ação e impedir que DOT/procs de set devolvam custo novamente.

**Gatilho verificado:** 7/7 verificações passaram.

- Adepto da Natureza: `{"damage": 110, "refund": 5, "spiritPower": 0}`.
- Druida: `{"damage": 116, "refund": 5, "spiritPower": 5}`.
- Druida Sombrio: `{"damage": 116, "refund": 5, "spiritPower": 35}`.
- Avatar da Natureza: `{"damage": 116, "refund": 5, "spiritPower": 20}`.
- Espirito da Floresta: `{"damage": 110, "refund": 5, "spiritPower": 63}`.
- Fada Monarca: `{"damage": 110, "refund": 5, "spiritPower": 174}`.
- Protetor da Floresta: `{"damage": 110, "refund": 5, "spiritPower": 163}`.

#### Aura Feerica

**Desbloqueio da entrada/variante:** nível 40. **Formas com esta entrada:** Espirito da Floresta, Fada Monarca, Protetor da Floresta.

**Referência extraída — Fada Monarca, nível 100:** Aura Feerica: curar ou ganhar escudo concede Cadencia. Cada acumulo da 6% de poder de habilidade, ate 3. Com 3 acumulos, curas aumentam 10%.

**Avaliação e ajuste:** Cura efetiva ou ganho de escudo gera Cadência até três; aumenta poder e cura/escudo por rota. Cura de HP cheio não gera carga. Exibir pilhas e a razão de uma preparação não ter acontecido.

**Gatilho verificado:** 3/3 verificações passaram.

- Espirito da Floresta: `{"cadence": 3, "powerBefore": 207, "powerAfter": 233}`.
- Fada Monarca: `{"cadence": 3, "powerBefore": 571, "powerAfter": 676}`.
- Protetor da Floresta: `{"cadence": 3, "powerBefore": 560, "powerAfter": 631}`.

#### Seiva

**Desbloqueio da entrada/variante:** nível 40. **Formas com esta entrada:** Druida, Druida Sombrio, Avatar da Natureza.

**Referência extraída — Druida Sombrio, nível 100:** Seiva: dano de marca e veneno cura 8% do dano causado. Tambem considera apodrecimento.

**Avaliação e ajuste:** Cura com ticks de marca/veneno, e também apodrecimento no Sombrio; Avatar acrescenta HP máximo. Funciona nos testes. Colheita muda a duração disponível de cura, criando decisão que deve ser comunicada.

**Gatilho verificado:** 3/3 verificações passaram.

- Druida: `{"healed": 16, "maxHp": 1088}`.
- Druida Sombrio: `{"healed": 20, "maxHp": 3546}`.
- Avatar da Natureza: `{"healed": 16, "maxHp": 4359}`.

#### Asas da Realeza

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Fada Monarca.

**Referência extraída — Fada Monarca, nível 100:** Asas da Realeza: concede 20% de chance de esquiva.

**Avaliação e ajuste:** Esquiva passa de 20% para 60% durante a coroa. Gatilho confirmado. Ajuda a Fada a sobreviver, mas a combinação com cura pode produzir empate por limite de turnos.

**Gatilho verificado:** 1/1 verificações passaram.

- Fada Monarca: `{"normal": 0.2, "crowned": 0.6}`.

#### Casca Ancestral

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Avatar da Natureza.

**Referência extraída — Avatar da Natureza, nível 100:** Casca Ancestral: reduz 54 de dano recebido por ataque.

**Avaliação e ajuste:** Redução fixa maior durante a forma; 54 normalmente e 74 transformado no nível 100. Gatilho confirmado. O ganho fica pequeno perto do custo integral da forma e das pancadas dos chefes.

**Gatilho verificado:** 1/1 verificações passaram.

- Avatar da Natureza: `{"normal": 54, "inForm": 74}`.

#### Juramento do Bosque

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Protetor da Floresta.

**Referência extraída — Protetor da Floresta, nível 100:** Juramento do Bosque: aumenta escudos em 6% e reflete 30% do dano absorvido enquanto houver escudo.

**Avaliação e ajuste:** Aumenta escudos e reflete parte do dano absorvido. Gatilho confirmado. É a ponte entre Casulo e ataque do Protetor; procs de item devem ter origem marcada para não criar reflexões recursivas.

**Gatilho verificado:** 1/1 verificações passaram.

- Protetor da Floresta: `{"shield": 106, "reflected": 30}`.

#### Podridao

**Desbloqueio da entrada/variante:** nível 70. **Formas com esta entrada:** Druida Sombrio.

**Referência extraída — Druida Sombrio, nível 100:** Podridao: aumenta marca, veneno e apodrecimento em 30%.

**Avaliação e ajuste:** 30% a mais nos DOTs naturais, inclusive na antecipação da Colheita. Gatilho numérico confirmado. Evitar que itens estendam duração e multipliquem a colheita duas vezes.

**Gatilho verificado:** 1/1 verificações passaram.

- Druida Sombrio: `{"multiplier": 1.3}`.

## Correções que devem preceder o ajuste de números

Centralizar dano percentual/fixo por ação; eliminar multiplicação duplicada de Carregar; respeitar a imunidade anunciada do Berserker; corrigir a origem de Canção Ancestral quando lançada pelo convidado; recalcular percentual de área por alvo quando aplicável; padronizar duração e preservar o tipo específico da última ação. Os valores propostos de itens e conjuntos só devem ser medidos depois dessas correções.

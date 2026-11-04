# Referência atual de habilidades

Catálogo gerado a partir do código executável atual em 04/11/2026. Não utiliza o documento antigo de balanceamento.

São 28 formas de classe/subclasse e 59 nomes distintos de habilidades ativas. Habilidades herdadas aparecem em cada rota em que estão disponíveis.

Os exemplos usam distribuição equilibrada dos pontos, sem equipamentos, níveis 20/50/100 conforme o estágio da árvore, vida e mana cheias, zero Cargas Arcanas, zero Cadência e alvo com 20.000 de vida máxima. As passivas iniciais de combate permanecem ativas. Valores dependentes de vida, mana, ataque, alvo e estado são fotografias desse contexto; não são coeficientes fixos nem uma avaliação de balanceamento.

Custos e descrições vêm de `getSkillInfo()` e `useSkillCost()`; passivas vêm de `getUnlockedPassiveSkills()` e `getPassiveStatusDescription()`. O JSON contém também os campos numéricos dos descritores e os modificadores passivos. A aplicação final ocorre em `applySkillLocally()`, no ataque básico e nos resolvedores de combate: buffs globais, crítico, mitigação e efeitos de equipamentos podem alterar o resultado. A coluna de duração reproduz os campos retornados pelo código; detalhes condicionais estão no texto.

Convenções das fórmulas: attack = ataque ativo; skillPower = poder de habilidade ativo; maxHp/maxMp = máximos do herói; enemy.hp/mp = valores atuais do alvo; enemy.maxHp = vida máxima do alvo; player.level = nível. Math.floor arredonda para baixo. warriorExtraCost e mageLevelCost = piso(0,5 × nível); mageExtraCost = S de Transbordando; getUniversalDamageFlatBonus() = F. As expressões condicionais mostram as variações herdadas por subclasse. Os valores da coluna de efeito são os exemplos calculados no contexto acima.

Condições gerais: esquiva impede novos efeitos ligados ao golpe evitado, mas não remove DOTs já ativos. Queimaduras, venenos e sangramentos acumulam com dano e prazo próprios. Canhão de Vidro conta duas ações de dano, não dois projéteis ou turnos; seu primeiro golpe recebido é um contador separado. Nevasca aplica seis turnos completos de resfriamento; aplicar resfriamento ativa Gelo Queima. Custos do Mago mantêm o teto de mana máxima. Investida e Você Irá Me Parar? podem romper perda de turno; Cortes Ultrassônicos exige uma ação de intervalo após terminar.

Revisão de 04/11/2026: Mago e subclasses rebalanceados; Canhão de Vidro usa dois contadores de eventos, resfriamento ativa Gelo Queima e rastreio usa (50 + 4 × nível²) × raridade. Detalhes: docs/balanceamento/mago_2026-11-04.md.

Para regenerar: `node scripts/generate-skill-reference.cjs`. Dados completos: [skills-reference.json](qa/2026-10-28/skills-reference.json).

Revisão de 03/11/2026: fórmulas e custos do Guerreiro e subclasses rebalanceados; esquiva bloqueia novos efeitos hostis; sangramentos acumulam com duração própria; Investida e Você Irá Me Parar? rompem perda de turno; Cortes Ultrassônicos exige intervalo após expirar. Arqueiro e subclasses também rebalanceados; rastreio passa a seis minutos com custo quadrático por nível e raridade. Análises: docs/analise_guerreiro_progressao_adaptativa_2026-11-03.md e docs/analise_arqueiro_2026-11-03.md.

## Guerreiro — nível 20

Classe: **Guerreiro**. Rota: base. Vida máxima: 396; mana máxima: 300; ataque: 74.

**Atacar:** Ataque basico. Dano entre 74 e 79.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Recuperar Folego | 1 | 40 | turns: 0 | heal = Math.floor(maxHp * healFactor); cost = 30 + warriorExtraCost | Recuperar Folego: consome 40 MP e recupera 47 de vida. |
| Esbarrao | 20 | 48 | enemyAttackDownTurns: 0 | damage = isEspadachim ? 20 + Math.floor(0.06 * maxHp) + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower) : 20 + Math.floor((isCavaleiro ? 0.08 : 0.06) * maxHp) + Math.floor((isCavaleiro ? 0.7 : 0.6) * attack) + Math.floor((isCavaleiro ? 0.5 : 0.4) * skillPower); cost = (isEspadachim ? 50 : isCavaleiro ? 44 : 38) + warriorExtraCost | Esbarrao: consome 48 MP e causa 109 de dano. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Vontade de Ferro: reduz 12 de dano por ataque recebido. |

## Cavaleiro — nível 50

Classe: **Guerreiro**. Rota: cavaleiro. Vida máxima: 1860; mana máxima: 1420; ataque: 230.

**Atacar:** Ataque basico. Dano entre 230 e 235.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Recuperar Folego | 1 | 55 | turns: 0 | heal = Math.floor(maxHp * healFactor); cost = 30 + warriorExtraCost | Recuperar Folego: consome 55 MP e recupera 353 de vida. |
| Esbarrao | 20 | 69 | enemyAttackDownTurns: 3 | damage = isEspadachim ? 20 + Math.floor(0.06 * maxHp) + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower) : 20 + Math.floor((isCavaleiro ? 0.08 : 0.06) * maxHp) + Math.floor((isCavaleiro ? 0.7 : 0.6) * attack) + Math.floor((isCavaleiro ? 0.5 : 0.4) * skillPower); cost = (isEspadachim ? 50 : isCavaleiro ? 44 : 38) + warriorExtraCost | Esbarrao: consome 69 MP e causa 435 de dano. Tambem reduz o ataque do inimigo em 30% por 3 turnos. |
| Contundir | 30 | 65 | Ver efeito | damage = isBerserker ? 60 + Math.floor(0.07 * maxHp) + Math.floor(1.1 * attack) + Math.floor(0.4 * skillPower) : 30 + Math.floor(0.07 * maxHp) + Math.floor(0.6 * attack) + Math.floor(0.4 * skillPower); cost = 40 + warriorExtraCost | Contundir: consome 65 MP e causa 382 de dano. Tem 30% de chance de fazer o inimigo perder o proximo turno. |
| Brado | 50 | 65 | turns: 5 | cost = warriorExtraCost; cost = 40 + warriorExtraCost | Brado: consome 65 MP e aumenta o dano total final em 30% por 5 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Vontade de Ferro: reduz 30 de dano por ataque recebido. Alem disso, recupera 55 de vida por turno. |
| Refletir | 40 | Refletir: reflete 20% do dano recebido para o inimigo. |

## Paladino — nível 100

Classe: **Guerreiro**. Rota: cavaleiro → paladino. Vida máxima: 7530; mana máxima: 5340; ataque: 696.

**Atacar:** Ataque basico. Dano entre 696 e 701.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Recuperar Folego | 1 | 80 | turns: 0 | heal = Math.floor(maxHp * healFactor); cost = 30 + warriorExtraCost | Recuperar Folego: consome 80 MP e recupera 1430 de vida. |
| Esbarrao | 20 | 94 | enemyAttackDownTurns: 3 | damage = isEspadachim ? 20 + Math.floor(0.06 * maxHp) + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower) : 20 + Math.floor((isCavaleiro ? 0.08 : 0.06) * maxHp) + Math.floor((isCavaleiro ? 0.7 : 0.6) * attack) + Math.floor((isCavaleiro ? 0.5 : 0.4) * skillPower); cost = (isEspadachim ? 50 : isCavaleiro ? 44 : 38) + warriorExtraCost | Esbarrao: consome 94 MP e causa 1447 de dano. Tambem reduz o ataque do inimigo em 30% por 3 turnos. |
| Contundir | 30 | 90 | Ver efeito | damage = isBerserker ? 60 + Math.floor(0.07 * maxHp) + Math.floor(1.1 * attack) + Math.floor(0.4 * skillPower) : 30 + Math.floor(0.07 * maxHp) + Math.floor(0.6 * attack) + Math.floor(0.4 * skillPower); cost = 40 + warriorExtraCost | Contundir: consome 90 MP e causa 1244 de dano. Tem 45% de chance de fazer o inimigo perder o proximo turno. |
| Brado | 50 | 90 | turns: 5 | cost = warriorExtraCost; cost = 40 + warriorExtraCost | Brado: consome 90 MP e aumenta o dano total final em 30% por 5 turnos. Tambem bloqueia 16% do dano sofrido nesse periodo. |
| Julgamento | 60 | 250 | Ver efeito | damage = 80 + Math.floor(0.4 * maxHp) + Math.floor(0.5 * attack) + Math.floor(0.8 * skillPower); cost = 100 + 3 * warriorExtraCost | Julgamento: consome 250 MP e causa 3980 de dano. |
| Escudo de Fe | 80 | 3787 | turns: 3 | cost = Math.floor(maxMp * 0.7) + warriorExtraCost | Escudo de Fe: consome 3787 MP e por 3 turnos voce nao recebe dano. Depois, explode causando 50% do dano que teria sido absorvido ao inimigo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Vontade de Ferro: reduz 60 de dano por ataque recebido. Alem disso, recupera 225 de vida por turno. |
| Refletir | 40 | Refletir: reflete 40% do dano recebido para o inimigo. |
| Aura Divina | 70 | Aura Divina: a cada turno, ganha um escudo persistente de 150. |

## Berserker — nível 100

Classe: **Guerreiro**. Rota: cavaleiro → berserker. Vida máxima: 6530; mana máxima: 5340; ataque: 756.

**Atacar:** Ataque basico. Dano entre 756 e 761.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Recuperar Folego | 1 | 80 | turns: 0 | heal = Math.floor(maxHp * healFactor); cost = 30 + warriorExtraCost | Recuperar Folego: consome 80 MP e recupera 1240 de vida. |
| Esbarrao | 20 | 94 | enemyAttackDownTurns: 3 | damage = isEspadachim ? 20 + Math.floor(0.06 * maxHp) + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower) : 20 + Math.floor((isCavaleiro ? 0.08 : 0.06) * maxHp) + Math.floor((isCavaleiro ? 0.7 : 0.6) * attack) + Math.floor((isCavaleiro ? 0.5 : 0.4) * skillPower); cost = (isEspadachim ? 50 : isCavaleiro ? 44 : 38) + warriorExtraCost | Esbarrao: consome 94 MP e causa 1405 de dano. Tambem reduz o ataque do inimigo em 30% por 3 turnos. |
| Contundir | 30 | 90 | Ver efeito | damage = isBerserker ? 60 + Math.floor(0.07 * maxHp) + Math.floor(1.1 * attack) + Math.floor(0.4 * skillPower) : 30 + Math.floor(0.07 * maxHp) + Math.floor(0.6 * attack) + Math.floor(0.4 * skillPower); cost = 40 + warriorExtraCost | Contundir: consome 90 MP e causa 1615 de dano. |
| Ira | 50 | 50 + 70% da vida máxima | turns: 4 | cost = warriorExtraCost; cost = 40 + warriorExtraCost | Ira: consome 50 MP e 70% da sua vida maxima, aumentando o dano total final em 120% e concedendo 20% de roubo de vida sobre dano causado a vida do inimigo por 4 turnos. |
| Vallhala | 60 | 150 | turns: 5 | cost = 100 + warriorExtraCost | Vallhala: consome 150 MP, faz voce receber 150% de dano adicional e adiciona 15% da vida maxima do inimigo em qualquer dano causado por 5 turnos. |
| Voce Ira Me Parar? | 80 | 150 + 30% da vida máxima | turns: 4 | cost = 100 + warriorExtraCost | Voce Ira Me Parar?: consome 150 MP e 30% da sua vida maxima, impede pulos de turno e aumenta o ataque em 100 por 4 turnos. Pode ser usada para impedir a perda do turno atual. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Vontade de Ferro: reduz 60 de dano por ataque recebido. Alem disso, recupera 195 de vida por turno. |
| Refletir | 40 | Refletir: ao sofrer dano, tem 50% de chance de responder com um ataque basico. |
| Voce Nao e Digno | 70 | Voce Nao e Digno: uma vez por combate, ao sofrer um golpe fatal, fica com 1 de vida e pode agir mais uma vez antes de morrer. |

## Espadachim — nível 50

Classe: **Guerreiro**. Rota: espadachim. Vida máxima: 1720; mana máxima: 1420; ataque: 247.

**Atacar:** Ataque basico. Dano entre 247 e 252.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Recuperar Folego | 1 | 55 | turns: 3 | heal = Math.floor(maxHp * healFactor); cost = 30 + warriorExtraCost | Recuperar Folego: consome 55 MP e recupera 206 de vida. Tambem aumenta seu dano total final em 28% por 3 turnos. |
| Investida | 20 | 75 | enemyAttackDownTurns: 0 | damage = isEspadachim ? 20 + Math.floor(0.06 * maxHp) + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower) : 20 + Math.floor((isCavaleiro ? 0.08 : 0.06) * maxHp) + Math.floor((isCavaleiro ? 0.7 : 0.6) * attack) + Math.floor((isCavaleiro ? 0.5 : 0.4) * skillPower); cost = (isEspadachim ? 50 : isCavaleiro ? 44 : 38) + warriorExtraCost | Investida: consome 75 MP e causa 495 de dano. Pode ser usada para impedir a perda do turno atual. |
| Golpes Velozes | 30 | 69 | Ver efeito | hits = subclassState.tier60 === "ninja" && player.level >= 60 ? 3 : 2; cost = 44 + warriorExtraCost | Golpes Velozes: consome 69 MP e executa 2 ataques basicos. |
| Corte Profundo | 50 | 77 | bleedTurns: 3 | damage = 70 + Math.floor((isNinja ? .9 : 1.1) * attack) + Math.floor((isNinja ? 1.1 : .8) * skillPower); cost = 52 + warriorExtraCost | Corte Profundo: consome 77 MP e causa 516 de dano. Aplica sangramento equivalente a 15% do dano causado por 3 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar de um ataque, executa um contra-ataque com seu ataque basico. |

## Samurai — nível 100

Classe: **Guerreiro**. Rota: espadachim → samurai. Vida máxima: 6890; mana máxima: 5340; ataque: 738.

**Atacar:** Ataque basico. Dano entre 738 e 743.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Recuperar Folego | 1 | 80 | turns: 3 | heal = Math.floor(maxHp * healFactor); cost = 30 + warriorExtraCost | Recuperar Folego: consome 80 MP e recupera 826 de vida. Tambem aumenta seu dano total final em 28% por 3 turnos. |
| Investida | 20 | 100 | enemyAttackDownTurns: 0 | damage = isEspadachim ? 20 + Math.floor(0.06 * maxHp) + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower) : 20 + Math.floor((isCavaleiro ? 0.08 : 0.06) * maxHp) + Math.floor((isCavaleiro ? 0.7 : 0.6) * attack) + Math.floor((isCavaleiro ? 0.5 : 0.4) * skillPower); cost = (isEspadachim ? 50 : isCavaleiro ? 44 : 38) + warriorExtraCost | Investida: consome 100 MP e causa 1575 de dano. Pode ser usada para impedir a perda do turno atual. |
| Golpes Velozes | 30 | 94 | Ver efeito | hits = subclassState.tier60 === "ninja" && player.level >= 60 ? 3 : 2; cost = 44 + warriorExtraCost | Golpes Velozes: consome 94 MP e executa 2 ataques basicos. Tambem aplica sangramento por 3 turnos. |
| Corte Profundo | 50 | 102 | bleedTurns: 3 | damage = 70 + Math.floor((isNinja ? .9 : 1.1) * attack) + Math.floor((isNinja ? 1.1 : .8) * skillPower); cost = 52 + warriorExtraCost | Corte Profundo: consome 102 MP e causa 1433 de dano. Ignora armadura. Aplica sangramento equivalente a 15% do dano causado por 3 turnos. |
| Furar Blindagem | 60 | 132 | Ver efeito | damage = 80 + Math.floor(1.1 * attack) + Math.floor(1.1 * skillPower); cost = 82 + warriorExtraCost | Furar Blindagem: consome 132 MP e causa 1650 de dano. |
| Cortes Ultrasonicos | 80 | 340 | turns: 3 | cost = 240 + 2 * warriorExtraCost | Cortes Ultrasonicos: consome 340 MP. Por 3 turnos, voce so pode usar o ataque basico e nao pode ser atingido. Ao terminar, precisa realizar outra acao antes de reativar. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar, executa um ataque basico de contra-ataque e recupera 30% do dano que o golpe causaria. |
| Mente Limpa | 70 | Mente Limpa: o primeiro ataque do combate acerta duas vezes, com o segundo golpe causando 50% do dano, mas repetindo os efeitos. |

## Ninja — nível 100

Classe: **Guerreiro**. Rota: espadachim → ninja. Vida máxima: 6390; mana máxima: 5340; ataque: 743.

**Atacar:** Ataque basico. Dano entre 743 e 748.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Recuperar Folego | 1 | 80 | turns: 3 | heal = Math.floor(maxHp * healFactor); cost = 30 + warriorExtraCost | Recuperar Folego: consome 80 MP e recupera 766 de vida. Tambem aumenta seu dano total final em 28% por 3 turnos. |
| Investida | 20 | 100 | enemyAttackDownTurns: 0 | damage = isEspadachim ? 20 + Math.floor(0.06 * maxHp) + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower) : 20 + Math.floor((isCavaleiro ? 0.08 : 0.06) * maxHp) + Math.floor((isCavaleiro ? 0.7 : 0.6) * attack) + Math.floor((isCavaleiro ? 0.5 : 0.4) * skillPower); cost = (isEspadachim ? 50 : isCavaleiro ? 44 : 38) + warriorExtraCost | Investida: consome 100 MP e causa 1561 de dano. Pode ser usada para impedir a perda do turno atual. |
| Golpes Velozes | 30 | 94 | Ver efeito | hits = subclassState.tier60 === "ninja" && player.level >= 60 ? 3 : 2; cost = 44 + warriorExtraCost | Golpes Velozes: consome 94 MP e executa 3 ataques basicos. |
| Corte Profundo | 50 | 102 | bleedTurns: 3 | damage = 70 + Math.floor((isNinja ? .9 : 1.1) * attack) + Math.floor((isNinja ? 1.1 : .8) * skillPower); cost = 52 + warriorExtraCost | Corte Profundo: consome 102 MP e causa 1513 de dano. Aplica sangramento equivalente a 30% do dano causado por 3 turnos. |
| Bomba de Fumaca | 60 | 90 | turns: 1 | cost = 40 + warriorExtraCost | Bomba de Fumaca: consome 90 MP, garante esquiva no proximo ataque do inimigo e fortalece em 30% o seu proximo dano. |
| Mata-Gigantes | 80 | 250 | Ver efeito | damage = enemy ? Math.floor(enemy.hp * 0.32) : 0; cost = 200 + warriorExtraCost | Mata-Gigantes: consome 250 MP e causa 6400 de dano com base na vida atual do inimigo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar, executa um ataque basico de contra-ataque ignorando armadura e escudo. |
| Eliminar | 70 | Eliminar: causa 50% de dano total adicional contra inimigos abaixo de 50% da vida. |

## Mago — nível 20

Classe: **Mago**. Rota: base. Vida máxima: 356; mana máxima: 340; ataque: 70.

**Misseis Magicos:** Missel Magico: consome 15 MP, dispara 5 misseis e cada um causa entre 19 e 35 de dano.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Explosao de Mana | 20 | 30 | Ver efeito | skillFactor = subclassState.tier30 === "elementalista" && player.level >= 30 ? 1.0 : 0.6; manaFactor = subclassState.tier30 === "arcanista" && player.level >= 30 ? 0.12 : 0.08; manaBurstCost = clampMageSkillCost(20 + mageLevelCost + mageExtraCost); enemyManaBurnAmount = enemy?.maxMp > 0 ? Math.floor((enemy.mp \|\| 0) * 0.4) : 0; damage = 30 + Math.floor(skillFactor * skillPower) + Math.floor(manaFactor * maxMp) + Math.floor(enemyManaBurnAmount * 3.5) + getUniversalDamageFlatBonus() | Explosao de Mana: consome 30 MP e causa 90 de dano. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |

## Elementalista — nível 50

Classe: **Mago**. Rota: elementalista. Vida máxima: 2355; mana máxima: 1500; ataque: 218.

**Misseis Magicos:** Missel Magico: consome 24 MP, dispara 8 misseis e cada um causa entre 69 e 115 de dano.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Explosao de Mana | 20 | 45 | Ver efeito | skillFactor = subclassState.tier30 === "elementalista" && player.level >= 30 ? 1.0 : 0.6; manaFactor = subclassState.tier30 === "arcanista" && player.level >= 30 ? 0.12 : 0.08; manaBurstCost = clampMageSkillCost(20 + mageLevelCost + mageExtraCost); enemyManaBurnAmount = enemy?.maxMp > 0 ? Math.floor((enemy.mp \|\| 0) * 0.4) : 0; damage = 30 + Math.floor(skillFactor * skillPower) + Math.floor(manaFactor * maxMp) + Math.floor(enemyManaBurnAmount * 3.5) + getUniversalDamageFlatBonus() | Explosao de Mana: consome 45 MP e causa 384 de dano. |
| Bola de Fogo | 30 | 65 | burnTurns: 3; chillTurns: 0 | isFrigido = subclassState.tier60 === "mago_frigido" && player.level >= 60; isIncendiario = subclassState.tier60 === "mago_incendiario" && player.level >= 60; currentHpBonus = isIncendiario && enemy ? Math.floor(enemy.hp * 0.05) : 0; damage = 50 + Math.floor((isFrigido \|\| isIncendiario ? .18 : .15) * attack) + Math.floor((isFrigido \|\| isIncendiario ? 1.25 : 1.2) * skillPower) + currentHpBonus + getUniversalDamageFlatBonus() | Bola de Fogo: consome 65 MP e causa 362 de dano de fogo. A queimadura causa 600 por turno durante 3 turnos e reduz a cura recebida pelo inimigo em 30%. |
| Congelar | 50 | 65 | burnTurns: 0; chillTurns: 0 | isIncendiario = subclassState.tier60 === "mago_incendiario" && player.level >= 60; isFrigido = subclassState.tier60 === "mago_frigido" && player.level >= 60; damage = 60 + Math.floor(.08 * attack) + Math.floor((isIncendiario \|\| isFrigido ? .9 : .85) * skillPower) + getUniversalDamageFlatBonus(); cost = clampMageSkillCost(40 + mageLevelCost + mageExtraCost) | Congelar: consome 65 MP, causa 275 de dano e tem 30% de chance de impedir o proximo ataque do inimigo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Mana e Vida | 40 | Mana e Vida: converte 45% da mana maxima em vida maxima. |

## Mago Incendiario — nível 100

Classe: **Mago**. Rota: elementalista → mago_incendiario. Vida máxima: 8789; mana máxima: 5420; ataque: 674.

**Misseis Magicos:** Missel Magico: consome 39 MP, dispara 13 misseis e cada um causa entre 284 e 421 de dano.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Explosao de Mana | 20 | 70 | Ver efeito | skillFactor = subclassState.tier30 === "elementalista" && player.level >= 30 ? 1.0 : 0.6; manaFactor = subclassState.tier30 === "arcanista" && player.level >= 30 ? 0.12 : 0.08; manaBurstCost = clampMageSkillCost(20 + mageLevelCost + mageExtraCost); enemyManaBurnAmount = enemy?.maxMp > 0 ? Math.floor((enemy.mp \|\| 0) * 0.4) : 0; damage = 30 + Math.floor(skillFactor * skillPower) + Math.floor(manaFactor * maxMp) + Math.floor(enemyManaBurnAmount * 3.5) + getUniversalDamageFlatBonus() | Explosao de Mana: consome 70 MP e causa 2080 de dano. |
| Bola de Fogo | 30 | 90 | burnTurns: 3; chillTurns: 0 | isFrigido = subclassState.tier60 === "mago_frigido" && player.level >= 60; isIncendiario = subclassState.tier60 === "mago_incendiario" && player.level >= 60; currentHpBonus = isIncendiario && enemy ? Math.floor(enemy.hp * 0.05) : 0; damage = 50 + Math.floor((isFrigido \|\| isIncendiario ? .18 : .15) * attack) + Math.floor((isFrigido \|\| isIncendiario ? 1.25 : 1.2) * skillPower) + currentHpBonus + getUniversalDamageFlatBonus() | Bola de Fogo: consome 90 MP e causa 3192 de dano de fogo. A queimadura causa 1000 por turno durante 3 turnos e reduz a cura recebida pelo inimigo em 30%. |
| Bafo de Fogo | 50 | 90 | burnTurns: 6; chillTurns: 0 | isIncendiario = subclassState.tier60 === "mago_incendiario" && player.level >= 60; isFrigido = subclassState.tier60 === "mago_frigido" && player.level >= 60; damage = 60 + Math.floor(.08 * attack) + Math.floor((isIncendiario \|\| isFrigido ? .9 : .85) * skillPower) + getUniversalDamageFlatBonus(); cost = clampMageSkillCost(40 + mageLevelCost + mageExtraCost) | Bafo de Fogo: consome 90 MP, causa 1568 de dano e aplica queimadura por 6 turnos. |
| Fenix Sagrada | 60 | 1817 | burnTurns: 1 | cost = clampMageSkillCost(200 + skillPower + mageExtraCost); damage = 100 + Math.floor(.4 * attack) + Math.floor(1.85 * skillPower) + getUniversalDamageFlatBonus() | Fenix Sagrada: consome 1817 MP e causa 3360 de dano, aplicando queimadura por 1 turno. |
| Explodir | 80 | 500 + 50% da vida máxima | Ver efeito | damage = 200 + Math.floor(1.3 * skillPower) + Math.floor(0.5 * maxHp) + Math.floor(0.5 * (enemy?.maxHp \|\| 0)) + getUniversalDamageFlatBonus(); cost = clampMageSkillCost(500 + mageExtraCost) | Explodir: consome 500 MP, 50% da sua vida maxima e causa 16696 de dano. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Mana e Vida | 40 | Mana e Vida: converte 45% da mana maxima em vida maxima. Alem disso, concede 867 de dano de habilidade. |
| Fogo do Inferno | 70 | Fogo do Inferno: aumenta o dano da queimadura de 3% para 5% da vida maxima do inimigo por turno. |

## Mago Frigido — nível 100

Classe: **Mago**. Rota: elementalista → mago_frigido. Vida máxima: 10133; mana máxima: 5820; ataque: 674.

**Misseis Magicos:** Missel Magico: consome 39 MP, dispara 13 misseis e cada um causa entre 204 e 341 de dano.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Explosao de Mana | 20 | 70 | Ver efeito | skillFactor = subclassState.tier30 === "elementalista" && player.level >= 30 ? 1.0 : 0.6; manaFactor = subclassState.tier30 === "arcanista" && player.level >= 30 ? 0.12 : 0.08; manaBurstCost = clampMageSkillCost(20 + mageLevelCost + mageExtraCost); enemyManaBurnAmount = enemy?.maxMp > 0 ? Math.floor((enemy.mp \|\| 0) * 0.4) : 0; damage = 30 + Math.floor(skillFactor * skillPower) + Math.floor(manaFactor * maxMp) + Math.floor(enemyManaBurnAmount * 3.5) + getUniversalDamageFlatBonus() | Explosao de Mana: consome 70 MP e causa 1225 de dano. |
| Bola de Neve | 30 | 90 | burnTurns: 3; chillTurns: 3 | isFrigido = subclassState.tier60 === "mago_frigido" && player.level >= 60; isIncendiario = subclassState.tier60 === "mago_incendiario" && player.level >= 60; currentHpBonus = isIncendiario && enemy ? Math.floor(enemy.hp * 0.05) : 0; damage = 50 + Math.floor((isFrigido \|\| isIncendiario ? .18 : .15) * attack) + Math.floor((isFrigido \|\| isIncendiario ? 1.25 : 1.2) * skillPower) + currentHpBonus + getUniversalDamageFlatBonus() | Bola de Neve: consome 90 MP e causa 1083 de dano. Aplica resfriamento por 3 turnos, reduzindo em 30% o ataque do inimigo. |
| Congelar | 50 | 90 | burnTurns: 0; chillTurns: 2 | isIncendiario = subclassState.tier60 === "mago_incendiario" && player.level >= 60; isFrigido = subclassState.tier60 === "mago_frigido" && player.level >= 60; damage = 60 + Math.floor(.08 * attack) + Math.floor((isIncendiario \|\| isFrigido ? .9 : .85) * skillPower) + getUniversalDamageFlatBonus(); cost = clampMageSkillCost(40 + mageLevelCost + mageExtraCost) | Congelar: consome 90 MP, causa 770 de dano e tem 30% de chance de impedir o proximo ataque do inimigo. Se nao impedir o turno, aplica resfriamento por 2 turnos ou Congelamento se o alvo ja estiver resfriado. |
| Nevasca | 60 | 170 | turns: 6; chillTurns: 6 | cost = clampMageSkillCost(120 + mageLevelCost + mageExtraCost) | Nevasca: consome 170 MP e faz o inimigo ter 15% de chance de perder o turno e reduz seu ataque em 30% por 6 turnos. |
| Avalanche | 80 | 450 | chillTurns: 4 | damage = 200 + Math.floor(1.3 * skillPower) + Math.floor(0.38 * (enemy?.hp \|\| 0)) + getUniversalDamageFlatBonus(); cost = clampMageSkillCost(400 + mageLevelCost + mageExtraCost) | Avalanche: consome 450 MP, causa 8749 de dano e aplica resfriamento por 4 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Mana e Vida | 40 | Mana e Vida: converte 65% da mana maxima em vida maxima. |
| Gelo Queima | 70 | Gelo Queima: sempre que aplicar resfriamento, tambem causa queimadura de 3% da vida maxima por 1 turno. |

## Arcanista — nível 50

Classe: **Mago**. Rota: arcanista. Vida máxima: 1680; mana máxima: 1560; ataque: 228.

**Misseis Magicos:** Missel Magico: bonus fixo de 390 por acao, dividido entre os projeteis.  consome 24 MP, dispara 8 misseis e cada um causa entre 50 e 98 de dano. Cada missel tem 15% de chance de gerar 1 Carga Arcana, que dura 3 turnos a partir da primeira carga.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Explosao de Mana | 20 | 216 | Ver efeito | skillFactor = subclassState.tier30 === "elementalista" && player.level >= 30 ? 1.0 : 0.6; manaFactor = subclassState.tier30 === "arcanista" && player.level >= 30 ? 0.12 : 0.08; manaBurstCost = clampMageSkillCost(20 + mageLevelCost + mageExtraCost); enemyManaBurnAmount = enemy?.maxMp > 0 ? Math.floor((enemy.mp \|\| 0) * 0.4) : 0; damage = 30 + Math.floor(skillFactor * skillPower) + Math.floor(manaFactor * maxMp) + Math.floor(enemyManaBurnAmount * 3.5) + getUniversalDamageFlatBonus() | Explosao de Mana: consome 216 MP e causa 738 de dano. |
| Descarregar | 30 | 171 | Ver efeito | charges = getArcaneChargeInfo().charges; damage = subclassState.tier60 === "arquimago" && player.level >= 60 ? Math.floor((player.level + (0.0065 * maxMp)) * charges) + getUniversalDamageFlatBonus() : 60 + (player.level * charges) + Math.floor(0.3 * skillPower) + Math.floor(0.045 * maxMp) + getUniversalDamageFlatBonus(); cost = clampMageSkillCost((30 * charges) + mageExtraCost) | Descarregar: consome 171 MP, gasta todas as cargas arcanas e causa 585 de dano. |
| Escudo de Mana | 50 | 405 | turns: 2 | isArquimago = subclassState.tier60 === "arquimago" && player.level >= 60; factor = isArquimago ? 0.4 : 0.3; costPercent = isArquimago ? 0.12 : 0.15; cost = clampMageSkillCost(Math.floor(maxMp * costPercent) + mageExtraCost); shield = 40 + Math.floor(factor * maxMp) | Escudo de Mana: consome 405 MP e concede 508 de escudo por 2 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Transbordando | 40 | Transbordando: concede 390 de dano adicional em ataques e habilidades e aumenta os custos das habilidades em 171. |

## Arquimago — nível 100

Classe: **Mago**. Rota: arcanista → arquimago. Vida máxima: 6350; mana máxima: 6280; ataque: 694.

**Misseis Magicos:** Missel Magico: bonus fixo de 2512 por acao, dividido entre os projeteis.  consome 39 MP, dispara 13 misseis e cada um causa entre 143 e 284 de dano. Cada missel tem 15% de chance de gerar 1 Carga Arcana, que dura 3 turnos a partir da primeira carga.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Explosao de Mana | 20 | 1326 | Ver efeito | skillFactor = subclassState.tier30 === "elementalista" && player.level >= 30 ? 1.0 : 0.6; manaFactor = subclassState.tier30 === "arcanista" && player.level >= 30 ? 0.12 : 0.08; manaBurstCost = clampMageSkillCost(20 + mageLevelCost + mageExtraCost); enemyManaBurnAmount = enemy?.maxMp > 0 ? Math.floor((enemy.mp \|\| 0) * 0.4) : 0; damage = 30 + Math.floor(skillFactor * skillPower) + Math.floor(manaFactor * maxMp) + Math.floor(enemyManaBurnAmount * 3.5) + getUniversalDamageFlatBonus() | Explosao de Mana: consome 1326 MP e causa 3706 de dano. |
| Descarregar | 30 | 1256 | Ver efeito | charges = getArcaneChargeInfo().charges; damage = subclassState.tier60 === "arquimago" && player.level >= 60 ? Math.floor((player.level + (0.0065 * maxMp)) * charges) + getUniversalDamageFlatBonus() : 60 + (player.level * charges) + Math.floor(0.3 * skillPower) + Math.floor(0.045 * maxMp) + getUniversalDamageFlatBonus(); cost = clampMageSkillCost((30 * charges) + mageExtraCost) | Descarregar: consome 1256 MP, gasta todas as cargas arcanas e causa 2512 de dano. |
| Escudo de Mana | 50 | 2009 | turns: 2 | isArquimago = subclassState.tier60 === "arquimago" && player.level >= 60; factor = isArquimago ? 0.4 : 0.3; costPercent = isArquimago ? 0.12 : 0.15; cost = clampMageSkillCost(Math.floor(maxMp * costPercent) + mageExtraCost); shield = 40 + Math.floor(factor * maxMp) | Escudo de Mana: consome 2009 MP e concede 2552 de escudo por 2 turnos. |
| Concentracao | 60 | 1456 | turns: 4 | cost = clampMageSkillCost(200 + mageExtraCost) | Concentracao: consome 1456 MP, aumenta o dano total em 30% e a regeneracao de mana em 10% por 4 turnos. |
| Sobrecarregar | 80 | 5966 | Ver efeito | charges = getArcaneChargeInfo().charges; damage = 200 + maxMp + (player.level * charges) + getUniversalDamageFlatBonus(); cost = clampMageSkillCost(Math.floor(maxMp * 0.75) + mageExtraCost) | Sobrecarregar: consome 5966 MP e causa 8992 de dano usando sua mana maxima e as cargas arcanas. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Transbordando | 40 | Transbordando: concede 2512 de dano adicional em ataques e habilidades e aumenta os custos das habilidades em 1256. |
| Carregar | 70 | Carregar: cada carga arcana aumenta o dano total em 5%. Atualmente: 0%. |

## Corrompido — nível 100

Classe: **Mago**. Rota: arcanista → corrompido. Vida máxima: 6350; mana máxima: 5780; ataque: 709.

**Misseis Magicos:** Missel Magico: bonus fixo de 1445 por acao, dividido entre os projeteis.  consome 39 MP, dispara 13 misseis e cada um causa entre 146 e 290 de dano. Cada missel tem 15% de chance de gerar 1 Carga Arcana, que dura 3 turnos a partir da primeira carga.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Explosao de Mana | 20 | 705 | Ver efeito | skillFactor = subclassState.tier30 === "elementalista" && player.level >= 30 ? 1.0 : 0.6; manaFactor = subclassState.tier30 === "arcanista" && player.level >= 30 ? 0.12 : 0.08; manaBurstCost = clampMageSkillCost(20 + mageLevelCost + mageExtraCost); enemyManaBurnAmount = enemy?.maxMp > 0 ? Math.floor((enemy.mp \|\| 0) * 0.4) : 0; damage = 30 + Math.floor(skillFactor * skillPower) + Math.floor(manaFactor * maxMp) + Math.floor(enemyManaBurnAmount * 3.5) + getUniversalDamageFlatBonus() | Explosao de Mana: consome 705 MP e causa 2588 de dano. |
| Descarregar | 30 | 635 | Ver efeito | charges = getArcaneChargeInfo().charges; damage = subclassState.tier60 === "arquimago" && player.level >= 60 ? Math.floor((player.level + (0.0065 * maxMp)) * charges) + getUniversalDamageFlatBonus() : 60 + (player.level * charges) + Math.floor(0.3 * skillPower) + Math.floor(0.045 * maxMp) + getUniversalDamageFlatBonus(); cost = clampMageSkillCost((30 * charges) + mageExtraCost) | Descarregar: consome 635 MP, gasta todas as cargas arcanas e causa 1975 de dano. |
| Escudo de Mana | 50 | 1502 | turns: 2 | isArquimago = subclassState.tier60 === "arquimago" && player.level >= 60; factor = isArquimago ? 0.4 : 0.3; costPercent = isArquimago ? 0.12 : 0.15; cost = clampMageSkillCost(Math.floor(maxMp * costPercent) + mageExtraCost); shield = 40 + Math.floor(factor * maxMp) | Escudo de Mana: consome 1502 MP e concede 1774 de escudo por 2 turnos. |
| Corrupcao | 60 | 1734 | armorBreakTurns: 5; noShieldTurns: 5 | currentManaCost = clampMageSkillCost(Math.floor(maxMp * 0.3)); damage = 100 + Math.floor(1.15 * skillPower) + Math.floor(0.22 * maxMp) + getUniversalDamageFlatBonus() | Corrupcao: consome 1734 MP, causa 3620 de dano, remove toda a armadura do inimigo e impede escudos por 5 turnos. |
| Incorporar Demonio | 80 | 1734 | turns: 3 | cost = clampMageSkillCost(Math.floor(maxMp * 0.3)) | Incorporar Demonio: consome 1734 MP, concede 200% de dano total adicional por 3 turnos e faz voce receber 40% de dano adicional pelo mesmo tempo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Transbordando | 40 | Transbordando: concede 1445 de dano adicional em ataques e habilidades e aumenta os custos das habilidades em 635. Tambem converte dano perdido na vida, ou impedido por Ultimo Recurso, em escudo. |
| Canhao de Vidro | 70 | Canhao de Vidro: sofre o dobro de dano no primeiro golpe inimigo que acertar; suas duas primeiras acoes que causarem dano recebem +50% de dano. Buffs, DOTs e projeteis extras nao gastam acoes adicionais. |

## Arqueiro — nível 20

Classe: **Arqueiro**. Rota: base. Vida máxima: 376; mana máxima: 320; ataque: 72.

**Atacar:** Ataque basico. Dano entre 72 e 77. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Mirar | 1 | 50 | turns: 5 | cost = 30 + player.level; attackBonus = 5 + player.level | Mirar: consome 50 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 25. |
| Camuflagem | 20 | 50 | turns: 5 | cost = 40 + Math.floor(0.5 * player.level) | Camuflagem: consome 50 MP e concede 20% de esquiva adicional por 5 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 15% de chance do inimigo errar o ataque contra voce. |

## Atirador — nível 50

Classe: **Arqueiro**. Rota: atirador. Vida máxima: 1700; mana máxima: 1490; ataque: 280.

**Atacar:** Ataque basico. Dano entre 280 e 285. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Mirar | 1 | 80 | turns: 5 | cost = 30 + player.level; attackBonus = 5 + player.level | Mirar: consome 80 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 55, alem de fortalecer o Headshot em 10% e dar +10% de chance de critico. |
| Camuflagem | 20 | 65 | turns: 5 | cost = 40 + Math.floor(0.5 * player.level) | Camuflagem: consome 65 MP e concede 20% de esquiva adicional por 5 turnos, deixando o proximo dano causado 30% mais forte. |
| Headshot | 30 | 85 | Ver efeito | focusActive = playerEffects.guaranteedHitTurns > 0; focusDamageBonus = subclassState.tier30 === "atirador" && focusActive ? 0.1 : 0; baseDamage = subclassState.tier60 === "atirador_arcano" && player.level >= 60 ? 60 + Math.floor(0.4 * attack) + Math.floor(0.85 * skillPower) + Math.floor(0.35 * maxMp) : 30 + Math.floor((subclassState.tier60 === "sniper" ? 0.85 : 0.65) * attack) + Math.floor(0.65 * skillPower); damage = Math.floor(baseDamage * (1 + focusDamageBonus)); cost = 60 + Math.floor(0.5 * player.level) | Headshot: consome 85 MP e causa 383 de dano, com 15% de chance total de critico. |
| Tiro Perfurante | 50 | 105 | Ver efeito | attackFactor = subclassState.tier60 === "sniper" && player.level >= 60 ? 1.2 : 0.8; skillFactor = subclassState.tier60 === "atirador_arcano" && player.level >= 60 ? 1.2 : 0.8; damage = 50 + Math.floor(attackFactor * attack) + Math.floor(skillFactor * skillPower); cost = 80 + Math.floor(0.5 * player.level) | Tiro Perfurante: consome 105 MP e causa 485 de dano, ignorando armadura e escudo do inimigo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 30% de chance do inimigo errar o ataque contra voce e 5% de chance de critico em qualquer ataque ou habilidade. |
| Pulso Firme | 40 | Pulso Firme: concede 45 de dano de ataque basico e 45 de dano de habilidade no nivel atual. |

## Atirador Arcano — nível 100

Classe: **Arqueiro**. Rota: atirador → atirador_arcano. Vida máxima: 6370; mana máxima: 5810; ataque: 781.

**Atacar:** Ataque basico. Dano entre 781 e 786. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Mirar | 1 | 130 | turns: 5 | cost = 30 + player.level; attackBonus = 5 + player.level | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 105, alem de fortalecer o Headshot em 10% e dar +10% de chance de critico. |
| Camuflagem | 20 | 90 | turns: 5 | cost = 40 + Math.floor(0.5 * player.level) | Camuflagem: consome 90 MP e concede 20% de esquiva adicional por 5 turnos, deixando o proximo dano causado 30% mais forte. |
| Headshot | 30 | 110 | Ver efeito | focusActive = playerEffects.guaranteedHitTurns > 0; focusDamageBonus = subclassState.tier30 === "atirador" && focusActive ? 0.1 : 0; baseDamage = subclassState.tier60 === "atirador_arcano" && player.level >= 60 ? 60 + Math.floor(0.4 * attack) + Math.floor(0.85 * skillPower) + Math.floor(0.35 * maxMp) : 30 + Math.floor((subclassState.tier60 === "sniper" ? 0.85 : 0.65) * attack) + Math.floor(0.65 * skillPower); damage = Math.floor(baseDamage * (1 + focusDamageBonus)); cost = 60 + Math.floor(0.5 * player.level) | Headshot: consome 110 MP e causa 3378 de dano, com 15% de chance total de critico. Se nao critar, marca o alvo para receber 15% a mais no proximo golpe. |
| Tiro Perfurante | 50 | 130 | Ver efeito | attackFactor = subclassState.tier60 === "sniper" && player.level >= 60 ? 1.2 : 0.8; skillFactor = subclassState.tier60 === "atirador_arcano" && player.level >= 60 ? 1.2 : 0.8; damage = 50 + Math.floor(attackFactor * attack) + Math.floor(skillFactor * skillPower); cost = 80 + Math.floor(0.5 * player.level) | Tiro Perfurante: consome 130 MP e causa 2048 de dano, ignorando armadura e escudo do inimigo. |
| Emergencia Arcana | 60 | 500 | Ver efeito | missingMana = Math.max(0, maxMp - player.mp); damage = 60 + skillPower + Math.floor(0.75 * missingMana) | Emergencia Arcana: consome 500 MP e causa 1205 de dano arcano. O dano aumenta conforme sua mana atual estiver abaixo da mana maxima. |
| Sobreaquecer | 80 | 5810 | Ver efeito | currentMana = player.mp; damage = 80 + Math.floor(1.6 * skillPower) + Math.floor(0.6 * currentMana) | Sobreaquecer: gasta toda a mana atual (5810) e causa 5398 de dano. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e 5% de chance de critico em qualquer ataque ou habilidade. |
| Pulso Firme | 40 | Pulso Firme: concede 90 de dano de ataque basico e 130 de dano de habilidade no nivel atual. |
| Cristalizar Mana | 70 | Cristalizar Mana: converte 290 de mana maxima em dano de habilidade. |

## Sniper — nível 100

Classe: **Arqueiro**. Rota: atirador → sniper. Vida máxima: 6370; mana máxima: 5410; ataque: 851.

**Atacar:** Ataque basico. Dano entre 851 e 856. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Mirar | 1 | 130 | turns: 5 | cost = 30 + player.level; attackBonus = 5 + player.level | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 105, alem de fortalecer o Headshot em 10% e dar +10% de chance de critico. |
| Camuflagem | 20 | 90 | turns: 5 | cost = 40 + Math.floor(0.5 * player.level) | Camuflagem: consome 90 MP e concede 20% de esquiva adicional por 5 turnos, deixando o proximo dano causado 30% mais forte. |
| Headshot | 30 | 110 | Ver efeito | focusActive = playerEffects.guaranteedHitTurns > 0; focusDamageBonus = subclassState.tier30 === "atirador" && focusActive ? 0.1 : 0; baseDamage = subclassState.tier60 === "atirador_arcano" && player.level >= 60 ? 60 + Math.floor(0.4 * attack) + Math.floor(0.85 * skillPower) + Math.floor(0.35 * maxMp) : 30 + Math.floor((subclassState.tier60 === "sniper" ? 0.85 : 0.65) * attack) + Math.floor(0.65 * skillPower); damage = Math.floor(baseDamage * (1 + focusDamageBonus)); cost = 60 + Math.floor(0.5 * player.level) | Headshot: consome 110 MP e causa 1250 de dano, com 104% de chance total de critico. O excedente acima de 100% de chance de critico vira dano critico adicional, deixando o critico em 104% de dano extra. |
| Tiro Perfurante | 50 | 130 | Ver efeito | attackFactor = subclassState.tier60 === "sniper" && player.level >= 60 ? 1.2 : 0.8; skillFactor = subclassState.tier60 === "atirador_arcano" && player.level >= 60 ? 1.2 : 0.8; damage = 50 + Math.floor(attackFactor * attack) + Math.floor(skillFactor * skillPower); cost = 80 + Math.floor(0.5 * player.level) | Tiro Perfurante: consome 130 MP e causa 1683 de dano, ignorando armadura e escudo do inimigo. Alem disso, remove totalmente o escudo do alvo. |
| Executar | 60 | 120 | Ver efeito | damage = 60 + Math.floor(1.1 * attack) + Math.floor(0.9 * skillPower) | Executar: consome 120 MP e causa 1684 de dano. Se o inimigo estiver abaixo de 40% da vida, o dano e triplicado. |
| Ponto Fraco | 80 | 120 | Ver efeito | enemyCurrentHp = enemy ? enemy.hp : 0; damage = 100 + Math.floor(0.65 * attack) + Math.floor(0.4 * skillPower) + Math.floor(0.25 * enemyCurrentHp) | Ponto Fraco: consome 120 MP e causa 5959 de dano, explorando a vida atual do alvo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e 5% de chance de critico em qualquer ataque ou habilidade. |
| Pulso Firme | 40 | Pulso Firme: concede 90 de dano de ataque basico e 90 de dano de habilidade no nivel atual. Alem disso, seus ataques e habilidades ganham 15% de chance adicional de critico. |
| Olhos de Falcao | 70 | Olhos de Falcao: concede 15% de chance de critico e faz qualquer excedente acima de 100% virar dano critico adicional. |

## Cacador — nível 50

Classe: **Arqueiro**. Rota: cacador. Vida máxima: 1800; mana máxima: 1440; ataque: 240.

**Atacar:** Ataque basico. Dano entre 240 e 245. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Mirar | 1 | 80 | turns: 5 | cost = 30 + player.level; attackBonus = 5 + player.level | Mirar: consome 80 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 55, alem de conceder 10% de chance de um disparo extra na Rajada de Flechas. |
| Camuflagem | 20 | 65 | turns: 5 | cost = 40 + Math.floor(0.5 * player.level) | Camuflagem: consome 65 MP e concede 28% de esquiva adicional por 5 turnos. |
| Rajada de Flechas | 30 | 60 | Ver efeito | hits = subclassState.tier60 === "guarda_florestal" && player.level >= 60 ? 3 : 2 | Rajada de Flechas: consome 60 MP e realiza 2 ataques basicos no mesmo turno. |
| Armadilha | 50 | 105 | Ver efeito | bonusCurrentHpDamage = subclassState.tier60 === "espreitador" && player.level >= 60 && enemy ? Math.floor(enemy.hp * 0.06) : 0; damage = 30 + Math.floor(1.1 * skillPower) + bonusCurrentHpDamage; cost = 80 + Math.floor(0.5 * player.level) | Armadilha: consome 105 MP, causa 254 de dano e tem 30% de chance de fazer o inimigo perder o proximo turno. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 30% de chance do inimigo errar o ataque contra voce e aumenta em 18% as moedas e em 12% a XP recebidas dos inimigos. |
| Errou | 40 | Errou: ao esquivar de um ataque, voce ganha 12% de dano total final por 2 turnos. |

## Espreitador — nível 100

Classe: **Arqueiro**. Rota: cacador → espreitador. Vida máxima: 6470; mana máxima: 5460; ataque: 726.

**Atacar:** Ataque basico. Dano entre 726 e 731. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Mirar | 1 | 130 | turns: 5 | cost = 30 + player.level; attackBonus = 5 + player.level | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 105, alem de conceder 10% de chance de um disparo extra na Rajada de Flechas. |
| Camuflagem | 20 | 90 | turns: 5 | cost = 40 + Math.floor(0.5 * player.level) | Camuflagem: consome 90 MP e concede 28% de esquiva adicional por 5 turnos. |
| Rajada de Flechas | 30 | 60 | Ver efeito | hits = subclassState.tier60 === "guarda_florestal" && player.level >= 60 ? 3 : 2 | Rajada de Flechas: consome 60 MP e realiza 2 ataques basicos no mesmo turno. Errar um disparo fortalece o proximo dano em 16%; errar dois ou mais fortalece em 40%. |
| Armadilha | 50 | 130 | Ver efeito | bonusCurrentHpDamage = subclassState.tier60 === "espreitador" && player.level >= 60 && enemy ? Math.floor(enemy.hp * 0.06) : 0; damage = 30 + Math.floor(1.1 * skillPower) + bonusCurrentHpDamage; cost = 80 + Math.floor(0.5 * player.level) | Armadilha: consome 130 MP, causa 1972 de dano e tem 30% de chance de fazer o inimigo perder o proximo turno. O dano inclui 6% da vida atual do inimigo. |
| Surpresa | 60 | 80 | Ver efeito | damage = fromCamouflage ? 80 + Math.floor(1.2 * attack) + Math.floor(0.9 * skillPower) : 60 + Math.floor(0.9 * attack) + Math.floor(0.7 * skillPower) | Surpresa: consome 80 MP e causa 1185 de dano. |
| Mirar no Pe | 80 | 100 | enemyAttackDownTurns: 3; enemyArmorDownTurns: 3 | damage = 80 + Math.floor(0.6 * skillPower) + Math.floor(0.5 * attack) | Mirar no Pe: consome 100 MP, causa 848 de dano, reduz em 20% o ataque, corta 50% da armadura e concede 10% de chance de impedir o ataque em cada um dos 3 turnos do debuff. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e aumenta em 18% as moedas e em 12% a XP recebidas dos inimigos. |
| Errou | 40 | Errou: ao esquivar de um ataque, seu proximo dano causado fica 50% mais forte. |
| Passos Silenciosos | 70 | Passos Silenciosos: concede 7% de chance do inimigo perder o turno sem atacar. |

## Guarda Florestal — nível 100

Classe: **Arqueiro**. Rota: cacador → guarda_florestal. Vida máxima: 6970; mana máxima: 5360; ataque: 721.

**Atacar:** Ataque basico. Dano entre 721 e 726. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Mirar | 1 | 130 | turns: 5 | cost = 30 + player.level; attackBonus = 5 + player.level | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 105, alem de conceder 10% de chance de um disparo extra na Rajada de Flechas. |
| Camuflagem | 20 | 90 | turns: 5 | cost = 40 + Math.floor(0.5 * player.level) | Camuflagem: consome 90 MP e concede 28% de esquiva adicional por 5 turnos. |
| Rajada de Flechas | 30 | 60 | Ver efeito | hits = subclassState.tier60 === "guarda_florestal" && player.level >= 60 ? 3 : 2 | Rajada de Flechas: consome 60 MP e realiza 3 ataques basicos no mesmo turno. |
| Armadilha | 50 | 130 | Ver efeito | bonusCurrentHpDamage = subclassState.tier60 === "espreitador" && player.level >= 60 && enemy ? Math.floor(enemy.hp * 0.06) : 0; damage = 30 + Math.floor(1.1 * skillPower) + bonusCurrentHpDamage; cost = 80 + Math.floor(0.5 * player.level) | Armadilha: consome 130 MP, causa 756 de dano e tem 30% de chance de fazer o inimigo perder o proximo turno. Se prender o alvo, sua proxima Rajada de Flechas causara 23% de dano adicional por disparo. |
| Tranquilizante | 60 | 80 | enemyAttackDownTurns: 4 | damage = 60 + Math.floor(0.8 * attack) + Math.floor(0.6 * skillPower) | Tranquilizante: consome 80 MP, causa 1032 de dano e reduz em 30% o dano do inimigo por 4 turnos. |
| Tiro Cortante | 80 | 80 | dotTurns: 3 | totalDamage = 120 + Math.floor(1.2 * attack) + Math.floor(1.2 * skillPower); dotDamage = Math.floor(totalDamage / 3) | Tiro Cortante: consome 80 MP e faz o alvo sofrer 592 de dano por rodada durante 3 rodadas (1776 no total). |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e aumenta em 18% as moedas e em 12% a XP recebidas dos inimigos. |
| Errou | 40 | Errou: ao esquivar de um ataque, voce recupera 906 de vida. |
| Resistencia Florestal | 70 | Resistencia Florestal: reduz 46 de dano por ataque recebido. |

## Adepto da Natureza — nível 20

Classe: **Adepto da Natureza**. Rota: base. Vida máxima: 376; mana máxima: 340; ataque: 68.

**Atacar:** Ataque basico. Dano entre 68 e 73.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Semente Viva | 1 | 30 | markTurns: 3 | markTurns = subclassState.tier30 === "druida" && player.level >= 30 ? 4 : 3; markDamage = subclassState.tier30 === "druida" && player.level >= 30 ? Math.floor(0.2 * skillPower * markTurns) : 0; cost = 20 + Math.floor(0.5 * player.level); damage = 10 + Math.floor(0.7 * attack) + Math.floor(0.3 * skillPower) | Semente Viva: consome 30 MP, causa 73 de dano e marca o alvo por 3 turnos. |
| Raizes | 20 | 42 | Ver efeito | cost = 30 + Math.floor(0.6 * player.level); damage = 20 + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower) | Raizes: consome 42 MP, causa 118 de dano e tem 45% de chance de enraizar. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |

## Druida — nível 50

Classe: **Adepto da Natureza**. Rota: druida. Vida máxima: 1800; mana máxima: 1460; ataque: 226.

**Atacar:** Ataque basico. Dano entre 226 e 231.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Semente Viva | 1 | 45 | markTurns: 4 | markTurns = subclassState.tier30 === "druida" && player.level >= 30 ? 4 : 3; markDamage = subclassState.tier30 === "druida" && player.level >= 30 ? Math.floor(0.2 * skillPower * markTurns) : 0; cost = 20 + Math.floor(0.5 * player.level); damage = 10 + Math.floor(0.7 * attack) + Math.floor(0.3 * skillPower) | Semente Viva: consome 45 MP, causa 230 de dano e marca o alvo por 4 turnos. A marca tambem causa 167 por turno. |
| Raizes | 20 | 60 | Ver efeito | cost = 30 + Math.floor(0.6 * player.level); damage = 20 + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower) | Raizes: consome 60 MP, causa 367 de dano e tem 60% de chance de enraizar. |
| Flor do Pantano | 30 | 40 | poisonTurns: 4 | cost = 20 + Math.floor(0.4 * player.level); damage = 10 + Math.floor((isAvatar ? 1.3 : 0.8) * attack) + Math.floor(0.8 * skillPower) | Flor do Pantano: consome 40 MP e causa 357 de dano. Se o alvo estiver enraizado, aplica veneno de 83 por 4 turnos. |
| Colheita | 50 | 55 | Ver efeito | cost = 40 + Math.floor(0.3 * player.level); damage = 30 + Math.floor(1.2 * attack) | Colheita: consome 55 MP, causa 301 de dano e consome efeitos naturais ativos para explodir o dano restante. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 16% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |
| Seiva | 40 | Seiva: dano de marca e veneno cura 8% do dano causado. |

## Druida Sombrio — nível 100

Classe: **Adepto da Natureza**. Rota: druida → druida_sombrio. Vida máxima: 6470; mana máxima: 5580; ataque: 702.

**Atacar:** Ataque basico. Dano entre 702 e 707.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Semente Viva | 1 | 70 | markTurns: 4 | markTurns = subclassState.tier30 === "druida" && player.level >= 30 ? 4 : 3; markDamage = subclassState.tier30 === "druida" && player.level >= 30 ? Math.floor(0.2 * skillPower * markTurns) : 0; cost = 20 + Math.floor(0.5 * player.level); damage = 10 + Math.floor(0.7 * attack) + Math.floor(0.3 * skillPower) | Semente Viva: consome 70 MP, causa 709 de dano e marca o alvo por 4 turnos. A marca tambem causa 556 por turno. |
| Raizes | 20 | 90 | Ver efeito | cost = 30 + Math.floor(0.6 * player.level); damage = 20 + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower) | Raizes: consome 90 MP, causa 1137 de dano e tem 60% de chance de enraizar. |
| Flor do Pantano | 30 | 60 | poisonTurns: 7 | cost = 20 + Math.floor(0.4 * player.level); damage = 10 + Math.floor((isAvatar ? 1.3 : 0.8) * attack) + Math.floor(0.8 * skillPower) | Flor do Pantano: consome 60 MP e causa 1127 de dano. Se o alvo estiver enraizado, aplica veneno de 278 por 7 turnos. |
| Colheita | 50 | 70 | Ver efeito | cost = 40 + Math.floor(0.3 * player.level); damage = 30 + Math.floor(1.2 * attack) | Colheita: consome 70 MP, causa 872 de dano e consome efeitos naturais ativos para explodir o dano restante. |
| Apodrecer | 60 | 90 | decayTurns: 5 | cost = 40 + Math.floor(0.5 * player.level); damage = 50 + Math.floor(1.2 * attack) | Apodrecer: consome 90 MP, causa 892 de dano e aplica apodrecimento por 5 turnos. |
| Colapso do Brejo | 80 | 4743 | Ver efeito | cost = Math.floor(maxMp * 0.85); damage = Math.floor(1.8 * attack + 1.8 * skillPower) | Colapso do Brejo: consome 4743 MP e causa 2514 de dano. Se o alvo nao tiver DOT natural, aplica marca, veneno e apodrecimento por 4 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 16% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |
| Seiva | 40 | Seiva: dano de marca e veneno cura 8% do dano causado. Tambem considera apodrecimento. |
| Podridao | 70 | Podridao: aumenta marca, veneno e apodrecimento em 30%. |

## Avatar da Natureza — nível 100

Classe: **Adepto da Natureza**. Rota: druida → avatar_da_natureza. Vida máxima: 7634; mana máxima: 5380; ataque: 702.

**Atacar:** Ataque basico. Dano entre 702 e 707.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Semente Viva | 1 | 70 | markTurns: 4 | markTurns = subclassState.tier30 === "druida" && player.level >= 30 ? 4 : 3; markDamage = subclassState.tier30 === "druida" && player.level >= 30 ? Math.floor(0.2 * skillPower * markTurns) : 0; cost = 20 + Math.floor(0.5 * player.level); damage = 10 + Math.floor(0.7 * attack) + Math.floor(0.3 * skillPower) | Semente Viva: consome 70 MP, causa 705 de dano e marca o alvo por 4 turnos. A marca tambem causa 544 por turno. |
| Raizes | 20 | 90 | Ver efeito | cost = 30 + Math.floor(0.6 * player.level); damage = 20 + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower) | Raizes: consome 90 MP, causa 1125 de dano e tem 60% de chance de enraizar. |
| Flor do Pantano | 30 | 60 | poisonTurns: 3 | cost = 20 + Math.floor(0.4 * player.level); damage = 10 + Math.floor((isAvatar ? 1.3 : 0.8) * attack) + Math.floor(0.8 * skillPower) | Flor do Pantano: consome 60 MP e causa 1466 de dano. Se o alvo estiver enraizado, aplica veneno de 272 por 3 turnos. |
| Colheita | 50 | 70 | Ver efeito | cost = 40 + Math.floor(0.3 * player.level); damage = 30 + Math.floor(1.2 * attack) | Colheita: consome 70 MP, causa 872 de dano e consome efeitos naturais ativos para explodir o dano restante. |
| Forma Verdadeira | 60 | 5380 | turns: 5 | Ver efeito e condições | Forma Verdadeira: consome toda a mana maxima, aumenta ataque em 26%, reduz dano sofrido em 18% e fortalece ataques basicos por 5 turnos. |
| Esmagar Invasor | 80 | 380 | Ver efeito | cost = 300 + Math.floor(0.8 * player.level) | Esmagar Invasor: consome 380 MP e causa 1404 de dano, com bonus contra alvo enraizado e na Forma Verdadeira. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 16% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |
| Seiva | 40 | Seiva: dano de marca e veneno cura 8% do dano causado. Tambem aumenta sua vida maxima em 12%. |
| Casca Ancestral | 70 | Casca Ancestral: reduz 54 de dano recebido por ataque. |

## Espirito da Floresta — nível 50

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta. Vida máxima: 1700; mana máxima: 1560; ataque: 221.

**Atacar:** Ataque basico. Dano entre 221 e 226.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Semente Viva | 1 | 45 | markTurns: 3 | markTurns = subclassState.tier30 === "druida" && player.level >= 30 ? 4 : 3; markDamage = subclassState.tier30 === "druida" && player.level >= 30 ? Math.floor(0.2 * skillPower * markTurns) : 0; cost = 20 + Math.floor(0.5 * player.level); damage = 10 + Math.floor(0.7 * attack) + Math.floor(0.3 * skillPower) | Semente Viva: consome 45 MP, causa 249 de dano e marca o alvo por 3 turnos. A marca reduz o dano do inimigo em 24%. |
| Raizes | 20 | 60 | Ver efeito | cost = 30 + Math.floor(0.6 * player.level); damage = 20 + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower) | Raizes: consome 60 MP, causa 424 de dano e tem 45% de chance de enraizar. Se enraizar, tambem reduz 50% da armadura. |
| Encanto da Brisa | 30 | 45 | Ver efeito | cost = 30 + Math.floor(0.3 * player.level); damage = 20 + Math.floor(1.1 * skillPower) | Encanto da Brisa: consome 45 MP, causa 333 de dano e tem 20% de chance de pular o turno do inimigo. Se o alvo estiver marcado, pode enraizar. |
| Cancao Ancestral | 50 | 60 | Ver efeito | cost = 40 + Math.floor(0.4 * player.level); heal = Math.floor((rooted ? 2 : 1.4) * skillPower); shield = subclassState.tier60 === "protetor_da_floresta" && player.level >= 60 ? Math.floor((rooted ? 2.2 : 1.6) * skillPower) : 0 | Cancao Ancestral: consome 60 MP e cura 399. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. Tambem converte 30% do ataque basico em poder de habilidade. |
| Aura Feerica | 40 | Aura Feerica: curar ou ganhar escudo concede Cadencia. Cada acumulo da 4% de poder de habilidade, ate 3. Com 3 acumulos, curas aumentam 5%. |

## Fada Monarca — nível 100

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta → fada_monarca. Vida máxima: 6370; mana máxima: 5880; ataque: 677.

**Atacar:** Ataque basico. Dano entre 677 e 682.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Semente Viva | 1 | 70 | markTurns: 3 | markTurns = subclassState.tier30 === "druida" && player.level >= 30 ? 4 : 3; markDamage = subclassState.tier30 === "druida" && player.level >= 30 ? Math.floor(0.2 * skillPower * markTurns) : 0; cost = 20 + Math.floor(0.5 * player.level); damage = 10 + Math.floor(0.7 * attack) + Math.floor(0.3 * skillPower) | Semente Viva: consome 70 MP, causa 756 de dano e marca o alvo por 3 turnos. A marca reduz o dano do inimigo em 24%. |
| Raizes | 20 | 90 | Ver efeito | cost = 30 + Math.floor(0.6 * player.level); damage = 20 + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower) | Raizes: consome 90 MP, causa 1291 de dano e tem 45% de chance de enraizar. Se enraizar, tambem reduz 50% da armadura. |
| Encanto da Brisa | 30 | 60 | Ver efeito | cost = 30 + Math.floor(0.3 * player.level); damage = 20 + Math.floor(1.1 * skillPower) | Encanto da Brisa: consome 60 MP, causa 1024 de dano e tem 30% de chance de pular o turno do inimigo. Se o alvo estiver marcado, pode enraizar. |
| Cancao Ancestral | 50 | 80 | Ver efeito | cost = 40 + Math.floor(0.4 * player.level); heal = Math.floor((rooted ? 2 : 1.4) * skillPower); shield = subclassState.tier60 === "protetor_da_floresta" && player.level >= 60 ? Math.floor((rooted ? 2.2 : 1.6) * skillPower) : 0 | Cancao Ancestral: consome 80 MP e cura 1278. |
| Decreto da Rainha | 60 | 90 | Ver efeito | factor = (playerEffects.natureCadence \|\| 0) >= 3 ? 2.9 : 2; damage = Math.floor(factor * skillPower) | Decreto da Rainha: consome 90 MP e causa 1826 de dano. Com 3 Cadencias, o fator sobe para 2.9. |
| Coroar | 80 | 500 | turns: 5 | cost = 300 + Math.floor(2 * player.level) | Coroar: consome 500 MP e fica coroada por 5 turnos, com +30% poder de habilidade, +20% curas e +20% nas chances de controle. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. Tambem converte 30% do ataque basico em poder de habilidade. |
| Aura Feerica | 40 | Aura Feerica: curar ou ganhar escudo concede Cadencia. Cada acumulo da 6% de poder de habilidade, ate 3. Com 3 acumulos, curas aumentam 10%. |
| Asas da Realeza | 70 | Asas da Realeza: concede 20% de chance de esquiva. |

## Protetor da Floresta — nível 100

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta → protetor_da_floresta. Vida máxima: 6770; mana máxima: 5480; ataque: 692.

**Atacar:** Ataque basico. Dano entre 692 e 697.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula no código | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Semente Viva | 1 | 70 | markTurns: 3 | markTurns = subclassState.tier30 === "druida" && player.level >= 30 ? 4 : 3; markDamage = subclassState.tier30 === "druida" && player.level >= 30 ? Math.floor(0.2 * skillPower * markTurns) : 0; cost = 20 + Math.floor(0.5 * player.level); damage = 10 + Math.floor(0.7 * attack) + Math.floor(0.3 * skillPower) | Semente Viva: consome 70 MP, causa 764 de dano e marca o alvo por 3 turnos. A marca reduz o dano do inimigo em 24%. |
| Raizes | 20 | 90 | Ver efeito | cost = 30 + Math.floor(0.6 * player.level); damage = 20 + Math.floor(0.8 * attack) + Math.floor(0.8 * skillPower) | Raizes: consome 90 MP, causa 1294 de dano e tem 45% de chance de enraizar. Se enraizar, tambem reduz 50% da armadura. |
| Encanto da Brisa | 30 | 60 | Ver efeito | cost = 30 + Math.floor(0.3 * player.level); damage = 20 + Math.floor(1.1 * skillPower) | Encanto da Brisa: consome 60 MP, causa 1012 de dano e tem 20% de chance de pular o turno do inimigo. Se o alvo estiver marcado, pode enraizar. |
| Cancao Ancestral | 50 | 80 | Ver efeito | cost = 40 + Math.floor(0.4 * player.level); heal = Math.floor((rooted ? 2 : 1.4) * skillPower); shield = subclassState.tier60 === "protetor_da_floresta" && player.level >= 60 ? Math.floor((rooted ? 2.2 : 1.6) * skillPower) : 0 | Cancao Ancestral: consome 80 MP e cura 1262. Tambem concede 1443 de escudo. |
| Casulo de Vinhas | 60 | 120 | Ver efeito | cost = 60 + Math.floor(0.6 * player.level); shield = Math.floor(1.4 * attack + 1.4 * skillPower) | Casulo de Vinhas: consome 120 MP e concede 2231 de escudo. |
| Jogar Espinhos | 80 | 400 + 20% da vida máxima | Ver efeito | cost = Math.floor(4 * player.level); shield = playerEffects.shieldValue \|\| 0; damage = Math.floor(shield * 2) | Jogar Espinhos: consome 400 MP, 20% da vida maxima e todo seu escudo atual para causar 0 de dano ignorando armadura e escudo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. Tambem converte 30% do ataque basico em poder de habilidade. |
| Aura Feerica | 40 | Aura Feerica: curar ou ganhar escudo concede Cadencia. Cada acumulo da 4% de poder de habilidade, ate 3. Com 3 acumulos, curas aumentam 5%. |
| Juramento do Bosque | 70 | Juramento do Bosque: aumenta escudos em 6% e reflete 30% do dano absorvido enquanto houver escudo. |


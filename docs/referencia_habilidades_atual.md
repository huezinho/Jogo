# Referência atual de habilidades

Catálogo gerado a partir do código executável atual em 03/11/2026. Não utiliza o documento antigo de balanceamento.

São 28 formas de classe/subclasse e 59 nomes distintos de habilidades ativas. Habilidades herdadas aparecem em cada rota em que estão disponíveis.

Os exemplos usam distribuição equilibrada dos pontos, sem equipamentos, níveis 20/50/100 conforme o estágio da árvore, vida e mana cheias, zero Cargas Arcanas, zero Cadência e alvo com 20.000 de vida máxima. As passivas iniciais de combate permanecem ativas. Valores dependentes de vida, mana, ataque, alvo e estado são fotografias desse contexto; não são coeficientes fixos nem uma avaliação de balanceamento.

Custos e descrições vêm de `getSkillInfo()` e `useSkillCost()`; passivas vêm de `getUnlockedPassiveSkills()` e `getPassiveStatusDescription()`. O JSON contém também os campos numéricos dos descritores e os modificadores passivos. A aplicação final ocorre em `applySkillLocally()`, no ataque básico e nos resolvedores de combate: buffs globais, crítico, mitigação e efeitos de equipamentos podem alterar o resultado. A coluna de duração reproduz os campos retornados pelo código; detalhes condicionais estão no texto.

Para regenerar: `node scripts/generate-skill-reference.cjs`. Dados completos: [skills-reference.json](qa/2026-10-28/skills-reference.json).

Revisão de 03/11/2026: fórmulas e custos do Guerreiro e subclasses rebalanceados; esquiva bloqueia novos efeitos hostis; sangramentos acumulam com duração própria; Investida e Você Irá Me Parar? rompem perda de turno; Cortes Ultrassônicos exige intervalo após expirar. Arqueiro e subclasses também rebalanceados; rastreio passa a seis minutos com custo quadrático por nível e raridade. Análises: docs/analise_guerreiro_progressao_adaptativa_2026-11-03.md e docs/analise_arqueiro_2026-11-03.md.

## Guerreiro — nível 20

Classe: **Guerreiro**. Rota: base. Vida máxima: 396; mana máxima: 300; ataque: 74.

**Atacar:** Ataque basico. Dano entre 74 e 79.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Recuperar Folego | 1 | 40 | turns: 0 | Recuperar Folego: consome 40 MP e recupera 47 de vida. |
| Esbarrao | 20 | 48 | enemyAttackDownTurns: 0 | Esbarrao: consome 48 MP e causa 109 de dano. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Vontade de Ferro: reduz 12 de dano por ataque recebido. |

## Cavaleiro — nível 50

Classe: **Guerreiro**. Rota: cavaleiro. Vida máxima: 1860; mana máxima: 1420; ataque: 230.

**Atacar:** Ataque basico. Dano entre 230 e 235.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Recuperar Folego | 1 | 55 | turns: 0 | Recuperar Folego: consome 55 MP e recupera 353 de vida. |
| Esbarrao | 20 | 69 | enemyAttackDownTurns: 3 | Esbarrao: consome 69 MP e causa 435 de dano. Tambem reduz o ataque do inimigo em 30% por 3 turnos. |
| Contundir | 30 | 65 | Ver efeito | Contundir: consome 65 MP e causa 382 de dano. Tem 30% de chance de fazer o inimigo perder o proximo turno. |
| Brado | 50 | 65 | turns: 5 | Brado: consome 65 MP e aumenta o dano total final em 30% por 5 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Vontade de Ferro: reduz 30 de dano por ataque recebido. Alem disso, recupera 55 de vida por turno. |
| Refletir | 40 | Refletir: reflete 20% do dano recebido para o inimigo. |

## Paladino — nível 100

Classe: **Guerreiro**. Rota: cavaleiro → paladino. Vida máxima: 7530; mana máxima: 5340; ataque: 696.

**Atacar:** Ataque basico. Dano entre 696 e 701.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Recuperar Folego | 1 | 80 | turns: 0 | Recuperar Folego: consome 80 MP e recupera 1430 de vida. |
| Esbarrao | 20 | 94 | enemyAttackDownTurns: 3 | Esbarrao: consome 94 MP e causa 1447 de dano. Tambem reduz o ataque do inimigo em 30% por 3 turnos. |
| Contundir | 30 | 90 | Ver efeito | Contundir: consome 90 MP e causa 1244 de dano. Tem 45% de chance de fazer o inimigo perder o proximo turno. |
| Brado | 50 | 90 | turns: 5 | Brado: consome 90 MP e aumenta o dano total final em 30% por 5 turnos. Tambem bloqueia 16% do dano sofrido nesse periodo. |
| Julgamento | 60 | 250 | Ver efeito | Julgamento: consome 250 MP e causa 3980 de dano. |
| Escudo de Fe | 80 | 3787 | turns: 3 | Escudo de Fe: consome 3787 MP e por 3 turnos voce nao recebe dano. Depois, explode causando 50% do dano que teria sido absorvido ao inimigo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Vontade de Ferro: reduz 60 de dano por ataque recebido. Alem disso, recupera 225 de vida por turno. |
| Refletir | 40 | Refletir: reflete 40% do dano recebido para o inimigo. |
| Aura Divina | 70 | Aura Divina: a cada turno, ganha um escudo persistente de 150. |

## Berserker — nível 100

Classe: **Guerreiro**. Rota: cavaleiro → berserker. Vida máxima: 6530; mana máxima: 5340; ataque: 756.

**Atacar:** Ataque basico. Dano entre 756 e 761.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Recuperar Folego | 1 | 80 | turns: 0 | Recuperar Folego: consome 80 MP e recupera 1240 de vida. |
| Esbarrao | 20 | 94 | enemyAttackDownTurns: 3 | Esbarrao: consome 94 MP e causa 1405 de dano. Tambem reduz o ataque do inimigo em 30% por 3 turnos. |
| Contundir | 30 | 90 | Ver efeito | Contundir: consome 90 MP e causa 1615 de dano. |
| Ira | 50 | 50 + 70% da vida máxima | turns: 4 | Ira: consome 50 MP e 70% da sua vida maxima, aumentando o dano total final em 120% e concedendo 20% de roubo de vida sobre dano causado a vida do inimigo por 4 turnos. |
| Vallhala | 60 | 150 | turns: 5 | Vallhala: consome 150 MP, faz voce receber 150% de dano adicional e adiciona 15% da vida maxima do inimigo em qualquer dano causado por 5 turnos. |
| Voce Ira Me Parar? | 80 | 150 + 30% da vida máxima | turns: 4 | Voce Ira Me Parar?: consome 150 MP e 30% da sua vida maxima, impede pulos de turno e aumenta o ataque em 100 por 4 turnos. Pode ser usada para impedir a perda do turno atual. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Vontade de Ferro: reduz 60 de dano por ataque recebido. Alem disso, recupera 195 de vida por turno. |
| Refletir | 40 | Refletir: ao sofrer dano, tem 50% de chance de responder com um ataque basico. |
| Voce Nao e Digno | 70 | Voce Nao e Digno: uma vez por combate, ao sofrer um golpe fatal, fica com 1 de vida e pode agir mais uma vez antes de morrer. |

## Espadachim — nível 50

Classe: **Guerreiro**. Rota: espadachim. Vida máxima: 1720; mana máxima: 1420; ataque: 247.

**Atacar:** Ataque basico. Dano entre 247 e 252.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Recuperar Folego | 1 | 55 | turns: 3 | Recuperar Folego: consome 55 MP e recupera 206 de vida. Tambem aumenta seu dano total final em 28% por 3 turnos. |
| Investida | 20 | 75 | enemyAttackDownTurns: 0 | Investida: consome 75 MP e causa 495 de dano. Pode ser usada para impedir a perda do turno atual. |
| Golpes Velozes | 30 | 69 | Ver efeito | Golpes Velozes: consome 69 MP e executa 2 ataques basicos. |
| Corte Profundo | 50 | 77 | bleedTurns: 3 | Corte Profundo: consome 77 MP e causa 516 de dano. Aplica sangramento equivalente a 15% do dano causado por 3 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar de um ataque, executa um contra-ataque com seu ataque basico. |

## Samurai — nível 100

Classe: **Guerreiro**. Rota: espadachim → samurai. Vida máxima: 6890; mana máxima: 5340; ataque: 738.

**Atacar:** Ataque basico. Dano entre 738 e 743.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Recuperar Folego | 1 | 80 | turns: 3 | Recuperar Folego: consome 80 MP e recupera 826 de vida. Tambem aumenta seu dano total final em 28% por 3 turnos. |
| Investida | 20 | 100 | enemyAttackDownTurns: 0 | Investida: consome 100 MP e causa 1575 de dano. Pode ser usada para impedir a perda do turno atual. |
| Golpes Velozes | 30 | 94 | Ver efeito | Golpes Velozes: consome 94 MP e executa 2 ataques basicos. Tambem aplica sangramento por 3 turnos. |
| Corte Profundo | 50 | 102 | bleedTurns: 3 | Corte Profundo: consome 102 MP e causa 1433 de dano. Ignora armadura. Aplica sangramento equivalente a 15% do dano causado por 3 turnos. |
| Furar Blindagem | 60 | 132 | Ver efeito | Furar Blindagem: consome 132 MP e causa 1650 de dano. |
| Cortes Ultrasonicos | 80 | 340 | turns: 3 | Cortes Ultrasonicos: consome 340 MP. Por 3 turnos, voce so pode usar o ataque basico e nao pode ser atingido. Ao terminar, precisa realizar outra acao antes de reativar. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar, executa um ataque basico de contra-ataque e recupera 30% do dano que o golpe causaria. |
| Mente Limpa | 70 | Mente Limpa: o primeiro ataque do combate acerta duas vezes, com o segundo golpe causando 50% do dano, mas repetindo os efeitos. |

## Ninja — nível 100

Classe: **Guerreiro**. Rota: espadachim → ninja. Vida máxima: 6390; mana máxima: 5340; ataque: 743.

**Atacar:** Ataque basico. Dano entre 743 e 748.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Recuperar Folego | 1 | 80 | turns: 3 | Recuperar Folego: consome 80 MP e recupera 766 de vida. Tambem aumenta seu dano total final em 28% por 3 turnos. |
| Investida | 20 | 100 | enemyAttackDownTurns: 0 | Investida: consome 100 MP e causa 1561 de dano. Pode ser usada para impedir a perda do turno atual. |
| Golpes Velozes | 30 | 94 | Ver efeito | Golpes Velozes: consome 94 MP e executa 3 ataques basicos. |
| Corte Profundo | 50 | 102 | bleedTurns: 3 | Corte Profundo: consome 102 MP e causa 1513 de dano. Aplica sangramento equivalente a 30% do dano causado por 3 turnos. |
| Bomba de Fumaca | 60 | 90 | turns: 1 | Bomba de Fumaca: consome 90 MP, garante esquiva no proximo ataque do inimigo e fortalece em 30% o seu proximo dano. |
| Mata-Gigantes | 80 | 250 | Ver efeito | Mata-Gigantes: consome 250 MP e causa 6400 de dano com base na vida atual do inimigo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar, executa um ataque basico de contra-ataque ignorando armadura e escudo. |
| Eliminar | 70 | Eliminar: causa 50% de dano total adicional contra inimigos abaixo de 50% da vida. |

## Mago — nível 20

Classe: **Mago**. Rota: base. Vida máxima: 356; mana máxima: 340; ataque: 70.

**Misseis Magicos:** Missel Magico: consome 15 MP, dispara 5 misseis e cada um causa entre 19 e 40 de dano.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Explosao de Mana | 20 | 24 | Ver efeito | Explosao de Mana: consome 24 MP e causa 97 de dano. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |

## Elementalista — nível 50

Classe: **Mago**. Rota: elementalista. Vida máxima: 2430; mana máxima: 1500; ataque: 218.

**Misseis Magicos:** Missel Magico: consome 24 MP, dispara 8 misseis e cada um causa entre 71 e 137 de dano.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Explosao de Mana | 20 | 30 | Ver efeito | Explosao de Mana: consome 30 MP e causa 414 de dano. |
| Bola de Fogo | 30 | 40 | burnTurns: 3; chillTurns: 0 | Bola de Fogo: consome 40 MP e causa 354 de dano de fogo. A queimadura causa 600 por turno durante 3 turnos e reduz a cura recebida pelo inimigo em 30%. |
| Congelar | 50 | 50 | burnTurns: 0; chillTurns: 0 | Congelar: consome 50 MP, causa 270 de dano e tem 30% de chance de impedir o proximo ataque do inimigo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Mana e Vida | 40 | Mana e Vida: converte 50% da mana maxima em vida maxima. |

## Mago Incendiario — nível 100

Classe: **Mago**. Rota: elementalista → mago_incendiario. Vida máxima: 9060; mana máxima: 5420; ataque: 674.

**Misseis Magicos:** Missel Magico: consome 39 MP, dispara 13 misseis e cada um causa entre 311 e 514 de dano.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Explosao de Mana | 20 | 40 | Ver efeito | Explosao de Mana: consome 40 MP e causa 2297 de dano. |
| Bola de Fogo | 30 | 40 | burnTurns: 3; chillTurns: 0 | Bola de Fogo: consome 40 MP e causa 3292 de dano de fogo. A queimadura causa 1000 por turno durante 3 turnos e reduz a cura recebida pelo inimigo em 30%. |
| Bafo de Fogo | 50 | 60 | burnTurns: 6; chillTurns: 0 | Bafo de Fogo: consome 60 MP, causa 1612 de dano e aplica queimadura por 6 turnos. |
| Fenix Sagrada | 60 | 1925 | burnTurns: 1 | Fenix Sagrada: consome 1925 MP e causa 3205 de dano, aplicando queimadura por 1 turno. |
| Explodir | 80 | 500 + 50% da vida máxima | Ver efeito | Explodir: consome 500 MP, 50% da sua vida maxima e causa 16972 de dano. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Mana e Vida | 40 | Mana e Vida: converte 50% da mana maxima em vida maxima. Alem disso, concede 975 de dano de habilidade. |
| Fogo do Inferno | 70 | Fogo do Inferno: aumenta o dano da queimadura de 3% para 5% da vida maxima do inimigo por turno. |

## Mago Frigido — nível 100

Classe: **Mago**. Rota: elementalista → mago_frigido. Vida máxima: 10133; mana máxima: 5820; ataque: 674.

**Misseis Magicos:** Missel Magico: consome 39 MP, dispara 13 misseis e cada um causa entre 212 e 415 de dano.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Explosao de Mana | 20 | 40 | Ver efeito | Explosao de Mana: consome 40 MP e causa 1342 de dano. |
| Bola de Neve | 30 | 40 | burnTurns: 3; chillTurns: 3 | Bola de Neve: consome 40 MP e causa 999 de dano. Aplica resfriamento por 3 turnos, reduzindo em 30% o ataque do inimigo. |
| Congelar | 50 | 60 | burnTurns: 0; chillTurns: 2 | Congelar: consome 60 MP, causa 717 de dano e tem 30% de chance de impedir o proximo ataque do inimigo. Se nao impedir o turno, aplica resfriamento por 2 turnos ou Congelamento se o alvo ja estiver resfriado. |
| Nevasca | 60 | 120 | turns: 6 | Nevasca: consome 120 MP e faz o inimigo ter 15% de chance de perder o turno por 6 turnos. |
| Avalanche | 80 | 400 | chillTurns: 4 | Avalanche: consome 400 MP, causa 11149 de dano e aplica resfriamento por 4 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Mana e Vida | 40 | Mana e Vida: converte 65% da mana maxima em vida maxima. |
| Gelo Queima | 70 | Gelo Queima: sempre que aplicar resfriamento, tambem causa queimadura de 3% da vida maxima por 1 turno. |

## Arcanista — nível 50

Classe: **Mago**. Rota: arcanista. Vida máxima: 1680; mana máxima: 1560; ataque: 228.

**Misseis Magicos:** Missel Magico: bonus fixo de 468 por acao, dividido entre os projeteis.  consome 24 MP, dispara 8 misseis e cada um causa entre 50 e 119 de dano. Cada missel tem 15% de chance de gerar 1 Carga Arcana, que dura 3 turnos a partir da primeira carga.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Explosao de Mana | 20 | 186 | Ver efeito | Explosao de Mana: consome 186 MP e causa 847 de dano. |
| Descarregar | 30 | 156 | Ver efeito | Descarregar: consome 156 MP, gasta todas as cargas arcanas e causa 611 de dano. |
| Escudo de Mana | 50 | 390 | turns: 2 | Escudo de Mana: consome 390 MP e concede 508 de escudo por 2 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Transbordando | 40 | Transbordando: concede 468 de dano adicional em ataques e habilidades e aumenta os custos das habilidades em 156. |

## Arquimago — nível 100

Classe: **Mago**. Rota: arcanista → arquimago. Vida máxima: 6350; mana máxima: 6280; ataque: 694.

**Misseis Magicos:** Missel Magico: bonus fixo de 2826 por acao, dividido entre os projeteis.  consome 39 MP, dispara 13 misseis e cada um causa entre 143 e 352 de dano. Cada missel tem 15% de chance de gerar 1 Carga Arcana, que dura 3 turnos a partir da primeira carga.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Explosao de Mana | 20 | 1296 | Ver efeito | Explosao de Mana: consome 1296 MP e causa 4146 de dano. |
| Descarregar | 30 | 1256 | Ver efeito | Descarregar: consome 1256 MP, gasta todas as cargas arcanas e causa 2826 de dano. |
| Escudo de Mana | 50 | 2009 | turns: 2 | Escudo de Mana: consome 2009 MP e concede 2552 de escudo por 2 turnos. |
| Concentracao | 60 | 1456 | turns: 4 | Concentracao: consome 1456 MP, aumenta o dano total em 20% e a regeneracao de mana em 10% por 4 turnos. |
| Sobrecarregar | 80 | 6280 | Ver efeito | Sobrecarregar: consome 6280 MP e causa 9306 de dano usando sua mana maxima e as cargas arcanas. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Transbordando | 40 | Transbordando: concede 2826 de dano adicional em ataques e habilidades e aumenta os custos das habilidades em 1256. |
| Carregar | 70 | Carregar: cada carga arcana aumenta o dano total em 5%. Atualmente: 0%. |

## Corrompido — nível 100

Classe: **Mago**. Rota: arcanista → corrompido. Vida máxima: 6350; mana máxima: 5780; ataque: 709.

**Misseis Magicos:** Missel Magico: bonus fixo de 1734 por acao, dividido entre os projeteis.  consome 39 MP, dispara 13 misseis e cada um causa entre 146 e 359 de dano. Cada missel tem 15% de chance de gerar 1 Carga Arcana, que dura 3 turnos a partir da primeira carga.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Explosao de Mana | 20 | 618 | Ver efeito | Explosao de Mana: consome 618 MP e causa 2993 de dano. |
| Descarregar | 30 | 578 | Ver efeito | Descarregar: consome 578 MP, gasta todas as cargas arcanas e causa 2095 de dano. |
| Escudo de Mana | 50 | 1445 | turns: 2 | Escudo de Mana: consome 1445 MP e concede 1774 de escudo por 2 turnos. |
| Corrupcao | 60 | 1734 | armorBreakTurns: 5; noShieldTurns: 5 | Corrupcao: consome 1734 MP, causa 4268 de dano, remove toda a armadura do inimigo e impede escudos por 5 turnos. |
| Incorporar Demonio | 80 | 1734 | turns: 3 | Incorporar Demonio: consome 1734 MP, concede 200% de dano total adicional por 3 turnos e faz voce receber 30% de dano adicional pelo mesmo tempo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Transbordando | 40 | Transbordando: concede 1734 de dano adicional em ataques e habilidades e aumenta os custos das habilidades em 578. |
| Canhao de Vidro | 70 | Canhao de Vidro: o primeiro ataque do combate causa o dobro de dano, mas voce sofre 50% de dano adicional nos 2 primeiros turnos do combate. |

## Arqueiro — nível 20

Classe: **Arqueiro**. Rota: base. Vida máxima: 376; mana máxima: 320; ataque: 72.

**Atacar:** Ataque basico. Dano entre 72 e 77. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Mirar | 1 | 50 | turns: 5 | Mirar: consome 50 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 25. |
| Camuflagem | 20 | 50 | turns: 5 | Camuflagem: consome 50 MP e concede 20% de esquiva adicional por 5 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 15% de chance do inimigo errar o ataque contra voce. |

## Atirador — nível 50

Classe: **Arqueiro**. Rota: atirador. Vida máxima: 1700; mana máxima: 1490; ataque: 280.

**Atacar:** Ataque basico. Dano entre 280 e 285. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Mirar | 1 | 80 | turns: 5 | Mirar: consome 80 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 55, alem de fortalecer o Headshot em 10% e dar +10% de chance de critico. |
| Camuflagem | 20 | 65 | turns: 5 | Camuflagem: consome 65 MP e concede 20% de esquiva adicional por 5 turnos, deixando o proximo dano causado 30% mais forte. |
| Headshot | 30 | 85 | Ver efeito | Headshot: consome 85 MP e causa 383 de dano, com 15% de chance total de critico. |
| Tiro Perfurante | 50 | 105 | Ver efeito | Tiro Perfurante: consome 105 MP e causa 485 de dano, ignorando armadura e escudo do inimigo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 30% de chance do inimigo errar o ataque contra voce e 5% de chance de critico em qualquer ataque ou habilidade. |
| Pulso Firme | 40 | Pulso Firme: concede 45 de dano de ataque basico e 45 de dano de habilidade no nivel atual. |

## Atirador Arcano — nível 100

Classe: **Arqueiro**. Rota: atirador → atirador_arcano. Vida máxima: 6370; mana máxima: 5810; ataque: 781.

**Atacar:** Ataque basico. Dano entre 781 e 786. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Mirar | 1 | 130 | turns: 5 | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 105, alem de fortalecer o Headshot em 10% e dar +10% de chance de critico. |
| Camuflagem | 20 | 90 | turns: 5 | Camuflagem: consome 90 MP e concede 20% de esquiva adicional por 5 turnos, deixando o proximo dano causado 30% mais forte. |
| Headshot | 30 | 110 | Ver efeito | Headshot: consome 110 MP e causa 3378 de dano, com 15% de chance total de critico. Se nao critar, marca o alvo para receber 15% a mais no proximo golpe. |
| Tiro Perfurante | 50 | 130 | Ver efeito | Tiro Perfurante: consome 130 MP e causa 2048 de dano, ignorando armadura e escudo do inimigo. |
| Emergencia Arcana | 60 | 500 | Ver efeito | Emergencia Arcana: consome 500 MP e causa 1205 de dano arcano. O dano aumenta conforme sua mana atual estiver abaixo da mana maxima. |
| Sobreaquecer | 80 | 5810 | Ver efeito | Sobreaquecer: gasta toda a mana atual (5810) e causa 5398 de dano. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e 5% de chance de critico em qualquer ataque ou habilidade. |
| Pulso Firme | 40 | Pulso Firme: concede 90 de dano de ataque basico e 130 de dano de habilidade no nivel atual. |
| Cristalizar Mana | 70 | Cristalizar Mana: converte 290 de mana maxima em dano de habilidade. |

## Sniper — nível 100

Classe: **Arqueiro**. Rota: atirador → sniper. Vida máxima: 6370; mana máxima: 5410; ataque: 851.

**Atacar:** Ataque basico. Dano entre 851 e 856. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Mirar | 1 | 130 | turns: 5 | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 105, alem de fortalecer o Headshot em 10% e dar +10% de chance de critico. |
| Camuflagem | 20 | 90 | turns: 5 | Camuflagem: consome 90 MP e concede 20% de esquiva adicional por 5 turnos, deixando o proximo dano causado 30% mais forte. |
| Headshot | 30 | 110 | Ver efeito | Headshot: consome 110 MP e causa 1250 de dano, com 104% de chance total de critico. O excedente acima de 100% de chance de critico vira dano critico adicional, deixando o critico em 104% de dano extra. |
| Tiro Perfurante | 50 | 130 | Ver efeito | Tiro Perfurante: consome 130 MP e causa 1683 de dano, ignorando armadura e escudo do inimigo. Alem disso, remove totalmente o escudo do alvo. |
| Executar | 60 | 120 | Ver efeito | Executar: consome 120 MP e causa 1684 de dano. Se o inimigo estiver abaixo de 40% da vida, o dano e triplicado. |
| Ponto Fraco | 80 | 120 | Ver efeito | Ponto Fraco: consome 120 MP e causa 5959 de dano, explorando a vida atual do alvo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e 5% de chance de critico em qualquer ataque ou habilidade. |
| Pulso Firme | 40 | Pulso Firme: concede 90 de dano de ataque basico e 90 de dano de habilidade no nivel atual. Alem disso, seus ataques e habilidades ganham 15% de chance adicional de critico. |
| Olhos de Falcao | 70 | Olhos de Falcao: concede 15% de chance de critico e faz qualquer excedente acima de 100% virar dano critico adicional. |

## Cacador — nível 50

Classe: **Arqueiro**. Rota: cacador. Vida máxima: 1800; mana máxima: 1440; ataque: 240.

**Atacar:** Ataque basico. Dano entre 240 e 245. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Mirar | 1 | 80 | turns: 5 | Mirar: consome 80 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 55, alem de conceder 10% de chance de um disparo extra na Rajada de Flechas. |
| Camuflagem | 20 | 65 | turns: 5 | Camuflagem: consome 65 MP e concede 28% de esquiva adicional por 5 turnos. |
| Rajada de Flechas | 30 | 60 | Ver efeito | Rajada de Flechas: consome 60 MP e realiza 2 ataques basicos no mesmo turno. |
| Armadilha | 50 | 105 | Ver efeito | Armadilha: consome 105 MP, causa 254 de dano e tem 30% de chance de fazer o inimigo perder o proximo turno. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 30% de chance do inimigo errar o ataque contra voce e aumenta em 18% as moedas e em 12% a XP recebidas dos inimigos. |
| Errou | 40 | Errou: ao esquivar de um ataque, voce ganha 12% de dano total final por 2 turnos. |

## Espreitador — nível 100

Classe: **Arqueiro**. Rota: cacador → espreitador. Vida máxima: 6470; mana máxima: 5460; ataque: 726.

**Atacar:** Ataque basico. Dano entre 726 e 731. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Mirar | 1 | 130 | turns: 5 | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 105, alem de conceder 10% de chance de um disparo extra na Rajada de Flechas. |
| Camuflagem | 20 | 90 | turns: 5 | Camuflagem: consome 90 MP e concede 28% de esquiva adicional por 5 turnos. |
| Rajada de Flechas | 30 | 60 | Ver efeito | Rajada de Flechas: consome 60 MP e realiza 2 ataques basicos no mesmo turno. Errar um disparo fortalece o proximo dano em 16%; errar dois ou mais fortalece em 40%. |
| Armadilha | 50 | 130 | Ver efeito | Armadilha: consome 130 MP, causa 1972 de dano e tem 30% de chance de fazer o inimigo perder o proximo turno. O dano inclui 6% da vida atual do inimigo. |
| Surpresa | 60 | 80 | Ver efeito | Surpresa: consome 80 MP e causa 1185 de dano. |
| Mirar no Pe | 80 | 100 | enemyAttackDownTurns: 3; enemyArmorDownTurns: 3 | Mirar no Pe: consome 100 MP, causa 848 de dano, reduz em 20% o ataque, corta 50% da armadura e concede 10% de chance de impedir o ataque em cada um dos 3 turnos do debuff. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e aumenta em 18% as moedas e em 12% a XP recebidas dos inimigos. |
| Errou | 40 | Errou: ao esquivar de um ataque, seu proximo dano causado fica 50% mais forte. |
| Passos Silenciosos | 70 | Passos Silenciosos: concede 7% de chance do inimigo perder o turno sem atacar. |

## Guarda Florestal — nível 100

Classe: **Arqueiro**. Rota: cacador → guarda_florestal. Vida máxima: 6970; mana máxima: 5360; ataque: 721.

**Atacar:** Ataque basico. Dano entre 721 e 726. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Mirar | 1 | 130 | turns: 5 | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 105, alem de conceder 10% de chance de um disparo extra na Rajada de Flechas. |
| Camuflagem | 20 | 90 | turns: 5 | Camuflagem: consome 90 MP e concede 28% de esquiva adicional por 5 turnos. |
| Rajada de Flechas | 30 | 60 | Ver efeito | Rajada de Flechas: consome 60 MP e realiza 3 ataques basicos no mesmo turno. |
| Armadilha | 50 | 130 | Ver efeito | Armadilha: consome 130 MP, causa 756 de dano e tem 30% de chance de fazer o inimigo perder o proximo turno. Se prender o alvo, sua proxima Rajada de Flechas causara 23% de dano adicional por disparo. |
| Tranquilizante | 60 | 80 | enemyAttackDownTurns: 4 | Tranquilizante: consome 80 MP, causa 1032 de dano e reduz em 30% o dano do inimigo por 4 turnos. |
| Tiro Cortante | 80 | 80 | dotTurns: 3 | Tiro Cortante: consome 80 MP e faz o alvo sofrer 592 de dano por rodada durante 3 rodadas (1776 no total). |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e aumenta em 18% as moedas e em 12% a XP recebidas dos inimigos. |
| Errou | 40 | Errou: ao esquivar de um ataque, voce recupera 906 de vida. |
| Resistencia Florestal | 70 | Resistencia Florestal: reduz 46 de dano por ataque recebido. |

## Adepto da Natureza — nível 20

Classe: **Adepto da Natureza**. Rota: base. Vida máxima: 376; mana máxima: 340; ataque: 68.

**Atacar:** Ataque basico. Dano entre 68 e 73.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Semente Viva | 1 | 30 | markTurns: 3 | Semente Viva: consome 30 MP, causa 73 de dano e marca o alvo por 3 turnos. |
| Raizes | 20 | 42 | Ver efeito | Raizes: consome 42 MP, causa 118 de dano e tem 45% de chance de enraizar. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |

## Druida — nível 50

Classe: **Adepto da Natureza**. Rota: druida. Vida máxima: 1800; mana máxima: 1460; ataque: 226.

**Atacar:** Ataque basico. Dano entre 226 e 231.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Semente Viva | 1 | 45 | markTurns: 4 | Semente Viva: consome 45 MP, causa 230 de dano e marca o alvo por 4 turnos. A marca tambem causa 167 por turno. |
| Raizes | 20 | 60 | Ver efeito | Raizes: consome 60 MP, causa 367 de dano e tem 60% de chance de enraizar. |
| Flor do Pantano | 30 | 40 | poisonTurns: 4 | Flor do Pantano: consome 40 MP e causa 357 de dano. Se o alvo estiver enraizado, aplica veneno de 83 por 4 turnos. |
| Colheita | 50 | 55 | Ver efeito | Colheita: consome 55 MP, causa 301 de dano e consome efeitos naturais ativos para explodir o dano restante. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 16% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |
| Seiva | 40 | Seiva: dano de marca e veneno cura 8% do dano causado. |

## Druida Sombrio — nível 100

Classe: **Adepto da Natureza**. Rota: druida → druida_sombrio. Vida máxima: 6470; mana máxima: 5580; ataque: 702.

**Atacar:** Ataque basico. Dano entre 702 e 707.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Semente Viva | 1 | 70 | markTurns: 4 | Semente Viva: consome 70 MP, causa 709 de dano e marca o alvo por 4 turnos. A marca tambem causa 556 por turno. |
| Raizes | 20 | 90 | Ver efeito | Raizes: consome 90 MP, causa 1137 de dano e tem 60% de chance de enraizar. |
| Flor do Pantano | 30 | 60 | poisonTurns: 7 | Flor do Pantano: consome 60 MP e causa 1127 de dano. Se o alvo estiver enraizado, aplica veneno de 278 por 7 turnos. |
| Colheita | 50 | 70 | Ver efeito | Colheita: consome 70 MP, causa 872 de dano e consome efeitos naturais ativos para explodir o dano restante. |
| Apodrecer | 60 | 90 | decayTurns: 5 | Apodrecer: consome 90 MP, causa 892 de dano e aplica apodrecimento por 5 turnos. |
| Colapso do Brejo | 80 | 4743 | Ver efeito | Colapso do Brejo: consome 4743 MP e causa 2514 de dano. Se o alvo nao tiver DOT natural, aplica marca, veneno e apodrecimento por 4 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 16% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |
| Seiva | 40 | Seiva: dano de marca e veneno cura 8% do dano causado. Tambem considera apodrecimento. |
| Podridao | 70 | Podridao: aumenta marca, veneno e apodrecimento em 30%. |

## Avatar da Natureza — nível 100

Classe: **Adepto da Natureza**. Rota: druida → avatar_da_natureza. Vida máxima: 7634; mana máxima: 5380; ataque: 702.

**Atacar:** Ataque basico. Dano entre 702 e 707.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Semente Viva | 1 | 70 | markTurns: 4 | Semente Viva: consome 70 MP, causa 705 de dano e marca o alvo por 4 turnos. A marca tambem causa 544 por turno. |
| Raizes | 20 | 90 | Ver efeito | Raizes: consome 90 MP, causa 1125 de dano e tem 60% de chance de enraizar. |
| Flor do Pantano | 30 | 60 | poisonTurns: 3 | Flor do Pantano: consome 60 MP e causa 1466 de dano. Se o alvo estiver enraizado, aplica veneno de 272 por 3 turnos. |
| Colheita | 50 | 70 | Ver efeito | Colheita: consome 70 MP, causa 872 de dano e consome efeitos naturais ativos para explodir o dano restante. |
| Forma Verdadeira | 60 | 5380 | turns: 5 | Forma Verdadeira: consome toda a mana maxima, aumenta ataque em 26%, reduz dano sofrido em 18% e fortalece ataques basicos por 5 turnos. |
| Esmagar Invasor | 80 | 380 | Ver efeito | Esmagar Invasor: consome 380 MP e causa 1404 de dano, com bonus contra alvo enraizado e na Forma Verdadeira. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 16% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |
| Seiva | 40 | Seiva: dano de marca e veneno cura 8% do dano causado. Tambem aumenta sua vida maxima em 12%. |
| Casca Ancestral | 70 | Casca Ancestral: reduz 54 de dano recebido por ataque. |

## Espirito da Floresta — nível 50

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta. Vida máxima: 1700; mana máxima: 1560; ataque: 221.

**Atacar:** Ataque basico. Dano entre 221 e 226.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Semente Viva | 1 | 45 | markTurns: 3 | Semente Viva: consome 45 MP, causa 249 de dano e marca o alvo por 3 turnos. A marca reduz o dano do inimigo em 24%. |
| Raizes | 20 | 60 | Ver efeito | Raizes: consome 60 MP, causa 424 de dano e tem 45% de chance de enraizar. Se enraizar, tambem reduz 50% da armadura. |
| Encanto da Brisa | 30 | 45 | Ver efeito | Encanto da Brisa: consome 45 MP, causa 333 de dano e tem 20% de chance de pular o turno do inimigo. Se o alvo estiver marcado, pode enraizar. |
| Cancao Ancestral | 50 | 60 | Ver efeito | Cancao Ancestral: consome 60 MP e cura 399. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. Tambem converte 30% do ataque basico em poder de habilidade. |
| Aura Feerica | 40 | Aura Feerica: curar ou ganhar escudo concede Cadencia. Cada acumulo da 4% de poder de habilidade, ate 3. Com 3 acumulos, curas aumentam 5%. |

## Fada Monarca — nível 100

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta → fada_monarca. Vida máxima: 6370; mana máxima: 5880; ataque: 677.

**Atacar:** Ataque basico. Dano entre 677 e 682.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Semente Viva | 1 | 70 | markTurns: 3 | Semente Viva: consome 70 MP, causa 756 de dano e marca o alvo por 3 turnos. A marca reduz o dano do inimigo em 24%. |
| Raizes | 20 | 90 | Ver efeito | Raizes: consome 90 MP, causa 1291 de dano e tem 45% de chance de enraizar. Se enraizar, tambem reduz 50% da armadura. |
| Encanto da Brisa | 30 | 60 | Ver efeito | Encanto da Brisa: consome 60 MP, causa 1024 de dano e tem 30% de chance de pular o turno do inimigo. Se o alvo estiver marcado, pode enraizar. |
| Cancao Ancestral | 50 | 80 | Ver efeito | Cancao Ancestral: consome 80 MP e cura 1278. |
| Decreto da Rainha | 60 | 90 | Ver efeito | Decreto da Rainha: consome 90 MP e causa 1826 de dano. Com 3 Cadencias, o fator sobe para 2.9. |
| Coroar | 80 | 500 | turns: 5 | Coroar: consome 500 MP e fica coroada por 5 turnos, com +30% poder de habilidade, +20% curas e +20% nas chances de controle. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. Tambem converte 30% do ataque basico em poder de habilidade. |
| Aura Feerica | 40 | Aura Feerica: curar ou ganhar escudo concede Cadencia. Cada acumulo da 6% de poder de habilidade, ate 3. Com 3 acumulos, curas aumentam 10%. |
| Asas da Realeza | 70 | Asas da Realeza: concede 20% de chance de esquiva. |

## Protetor da Floresta — nível 100

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta → protetor_da_floresta. Vida máxima: 6770; mana máxima: 5480; ataque: 692.

**Atacar:** Ataque basico. Dano entre 692 e 697.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Semente Viva | 1 | 70 | markTurns: 3 | Semente Viva: consome 70 MP, causa 764 de dano e marca o alvo por 3 turnos. A marca reduz o dano do inimigo em 24%. |
| Raizes | 20 | 90 | Ver efeito | Raizes: consome 90 MP, causa 1294 de dano e tem 45% de chance de enraizar. Se enraizar, tambem reduz 50% da armadura. |
| Encanto da Brisa | 30 | 60 | Ver efeito | Encanto da Brisa: consome 60 MP, causa 1012 de dano e tem 20% de chance de pular o turno do inimigo. Se o alvo estiver marcado, pode enraizar. |
| Cancao Ancestral | 50 | 80 | Ver efeito | Cancao Ancestral: consome 80 MP e cura 1262. Tambem concede 1443 de escudo. |
| Casulo de Vinhas | 60 | 120 | Ver efeito | Casulo de Vinhas: consome 120 MP e concede 2231 de escudo. |
| Jogar Espinhos | 80 | 400 + 20% da vida máxima | Ver efeito | Jogar Espinhos: consome 400 MP, 20% da vida maxima e todo seu escudo atual para causar 0 de dano ignorando armadura e escudo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. Tambem converte 30% do ataque basico em poder de habilidade. |
| Aura Feerica | 40 | Aura Feerica: curar ou ganhar escudo concede Cadencia. Cada acumulo da 4% de poder de habilidade, ate 3. Com 3 acumulos, curas aumentam 5%. |
| Juramento do Bosque | 70 | Juramento do Bosque: aumenta escudos em 6% e reflete 30% do dano absorvido enquanto houver escudo. |


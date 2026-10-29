# Referência atual de habilidades

Catálogo gerado a partir do código executável atual em 28/10/2026. Não utiliza o documento antigo de balanceamento.

São 28 formas de classe/subclasse e 59 nomes distintos de habilidades ativas. Habilidades herdadas aparecem em cada rota em que estão disponíveis.

Os exemplos usam distribuição equilibrada dos pontos, sem equipamentos, níveis 20/50/100 conforme o estágio da árvore, vida e mana cheias, zero Cargas Arcanas, zero Cadência e alvo com 20.000 de vida máxima. As passivas iniciais de combate permanecem ativas. Valores dependentes de vida, mana, ataque, alvo e estado são fotografias desse contexto; não são coeficientes fixos nem uma avaliação de balanceamento.

Custos e descrições vêm de `getSkillInfo()` e `useSkillCost()`; passivas vêm de `getUnlockedPassiveSkills()` e `getPassiveStatusDescription()`. O JSON contém também os campos numéricos dos descritores e os modificadores passivos. A aplicação final ocorre em `applySkillLocally()`, no ataque básico e nos resolvedores de combate: buffs globais, crítico, mitigação e efeitos de equipamentos podem alterar o resultado. A coluna de duração reproduz os campos retornados pelo código; detalhes condicionais estão no texto.

Para regenerar: `node scripts/generate-skill-reference.cjs`. Dados completos: [skills-reference.json](qa/2026-10-28/skills-reference.json).

Correções verificadas nesta revisão: bônus global aplicado uma vez; bônus fixo de Transbordando aplicado uma vez por ação de mísseis; crítico do Sniper sem duplicação; Escudo de Fé com três respostas inimigas; Cortes Ultrassônicos com três ataques básicos; imunidade a controle de Você Irá Me Parar?; Corrupção bloqueando escudos ativos e a conversão passiva de Transbordando. Os coeficientes de definição das classes, subclasses, pontos e `getSkillInfo()` foram comparados com o HEAD anterior e preservados.

## Guerreiro — nível 20

Classe: **Guerreiro**. Rota: base. Vida máxima: 291; mana máxima: 222; ataque: 62.

**Atacar:** Ataque basico. Dano entre 62 e 67.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Recuperar Folego | 1 | 34 | turns: 0 | Recuperar Folego: consome 34 MP e recupera 29 de vida. |
| Esbarrao | 20 | 42 | enemyAttackDownTurns: 0 | Esbarrao: consome 42 MP e causa 103 de dano. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Vontade de Ferro: reduz 12 de dano por ataque recebido. |

## Cavaleiro — nível 50

Classe: **Guerreiro**. Rota: cavaleiro. Vida máxima: 1148; mana máxima: 852; ataque: 170.

**Atacar:** Ataque basico. Dano entre 170 e 175.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Recuperar Folego | 1 | 40 | turns: 0 | Recuperar Folego: consome 40 MP e recupera 172 de vida. |
| Esbarrao | 20 | 54 | enemyAttackDownTurns: 3 | Esbarrao: consome 54 MP e causa 316 de dano. Tambem reduz o ataque do inimigo em 30% por 3 turnos. |
| Contundir | 30 | 50 | Ver efeito | Contundir: consome 50 MP e causa 271 de dano. Tem 30% de chance de fazer o inimigo perder o proximo turno. |
| Brado | 50 | 50 | turns: 5 | Brado: consome 50 MP e aumenta o ataque em 30% por 5 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Vontade de Ferro: reduz 30 de dano por ataque recebido. Alem disso, recupera 34 de vida por turno. |
| Refletir | 40 | Refletir: reflete 18% do dano recebido para o inimigo. |

## Paladino — nível 100

Classe: **Guerreiro**. Rota: cavaleiro → paladino. Vida máxima: 4606; mana máxima: 2956; ataque: 433.

**Atacar:** Ataque basico. Dano entre 433 e 438.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Recuperar Folego | 1 | 50 | turns: 0 | Recuperar Folego: consome 50 MP e recupera 690 de vida. |
| Esbarrao | 20 | 64 | enemyAttackDownTurns: 3 | Esbarrao: consome 64 MP e causa 940 de dano. Tambem reduz o ataque do inimigo em 30% por 3 turnos. |
| Contundir | 30 | 60 | Ver efeito | Contundir: consome 60 MP e causa 774 de dano. Tem 30% de chance de fazer o inimigo perder o proximo turno. |
| Brado | 50 | 60 | turns: 5 | Brado: consome 60 MP e aumenta o ataque em 30% por 5 turnos. Tambem bloqueia 16% do dano sofrido nesse periodo. |
| Julgamento | 60 | 120 | Ver efeito | Julgamento: consome 120 MP e causa 2468 de dano. |
| Escudo de Fe | 80 | 2089 | turns: 3 | Escudo de Fe: consome 2089 MP e por 3 turnos voce nao recebe dano. Depois, explode causando 50% do dano que teria sido absorvido ao inimigo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Vontade de Ferro: reduz 60 de dano por ataque recebido. Alem disso, recupera 138 de vida por turno. |
| Refletir | 40 | Refletir: reflete 32% do dano recebido para o inimigo. |
| Aura Divina | 70 | Aura Divina: a cada turno, ganha um escudo persistente de 92. |

## Berserker — nível 100

Classe: **Guerreiro**. Rota: cavaleiro → berserker. Vida máxima: 3606; mana máxima: 2956; ataque: 493.

**Atacar:** Ataque basico. Dano entre 493 e 498.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Recuperar Folego | 1 | 50 | turns: 0 | Recuperar Folego: consome 50 MP e recupera 540 de vida. |
| Esbarrao | 20 | 64 | enemyAttackDownTurns: 3 | Esbarrao: consome 64 MP e causa 882 de dano. Tambem reduz o ataque do inimigo em 30% por 3 turnos. |
| Contundir | 30 | 60 | Ver efeito | Contundir: consome 60 MP e causa 3119 de dano. |
| Ira | 50 | 20 + 80% da vida máxima | turns: 4 | Ira: consome 20 MP e 80% da sua vida maxima, aumentando o dano total em 150% por 4 turnos. |
| Vallhala | 60 | 120 | turns: 5 | Vallhala: consome 120 MP, faz voce receber 200% de dano adicional e adiciona 15% da vida maxima do inimigo em qualquer dano causado por 5 turnos. |
| Voce Ira Me Parar? | 80 | 120 + 30% da vida máxima | turns: 4 | Voce Ira Me Parar?: consome 120 MP e 30% da sua vida maxima, impede pulos de turno e aumenta o ataque basico em 50 por 4 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Vontade de Ferro: reduz 60 de dano por ataque recebido. Alem disso, recupera 108 de vida por turno. |
| Refletir | 40 | Refletir: ao sofrer dano, tem 50% de chance de responder com um ataque basico. |
| Voce Nao e Digno | 70 | Voce Nao e Digno: uma vez por combate, ao sofrer um golpe fatal, fica com 1 de vida e pode agir mais uma vez antes de morrer. |

## Espadachim — nível 50

Classe: **Guerreiro**. Rota: espadachim. Vida máxima: 1008; mana máxima: 852; ataque: 187.

**Atacar:** Ataque basico. Dano entre 187 e 192.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Recuperar Folego | 1 | 40 | turns: 3 | Recuperar Folego: consome 40 MP e recupera 100 de vida. Tambem aumenta seu dano total em 20% por 3 turnos. |
| Investida | 20 | 60 | enemyAttackDownTurns: 0 | Investida: consome 60 MP e causa 448 de dano. |
| Golpes Velozes | 30 | 54 | Ver efeito | Golpes Velozes: consome 54 MP e executa 2 ataques basicos. |
| Corte Profundo | 50 | 62 | bleedTurns: 3 | Corte Profundo: consome 62 MP e causa 402 de dano. Aplica sangramento equivalente a 15% do dano causado por 3 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar de um ataque, executa um contra-ataque com seu ataque basico. |

## Samurai — nível 100

Classe: **Guerreiro**. Rota: espadachim → samurai. Vida máxima: 3966; mana máxima: 2956; ataque: 475.

**Atacar:** Ataque basico. Dano entre 475 e 480.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Recuperar Folego | 1 | 50 | turns: 3 | Recuperar Folego: consome 50 MP e recupera 396 de vida. Tambem aumenta seu dano total em 20% por 3 turnos. |
| Investida | 20 | 70 | enemyAttackDownTurns: 0 | Investida: consome 70 MP e causa 1236 de dano. |
| Golpes Velozes | 30 | 64 | Ver efeito | Golpes Velozes: consome 64 MP e executa 2 ataques basicos. Tambem aplica sangramento por 3 turnos. |
| Corte Profundo | 50 | 72 | bleedTurns: 3 | Corte Profundo: consome 72 MP e causa 933 de dano. Ignora armadura. Aplica sangramento equivalente a 15% do dano causado por 3 turnos. |
| Furar Blindagem | 60 | 102 | Ver efeito | Furar Blindagem: consome 102 MP e causa 1071 de dano. |
| Cortes Ultrasonicos | 80 | 260 | turns: 3 | Cortes Ultrasonicos: consome 260 MP. Por 3 turnos, voce so pode usar o ataque basico e nao pode ser atingido. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar, executa um ataque basico de contra-ataque e recupera 30% do dano que o golpe causaria. |
| Mente Limpa | 70 | Mente Limpa: o primeiro ataque do combate acerta duas vezes, com o segundo golpe causando 50% do dano, mas repetindo os efeitos. |

## Ninja — nível 100

Classe: **Guerreiro**. Rota: espadachim → ninja. Vida máxima: 3466; mana máxima: 2956; ataque: 480.

**Atacar:** Ataque basico. Dano entre 480 e 485.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Recuperar Folego | 1 | 50 | turns: 3 | Recuperar Folego: consome 50 MP e recupera 346 de vida. Tambem aumenta seu dano total em 20% por 3 turnos. |
| Investida | 20 | 70 | enemyAttackDownTurns: 0 | Investida: consome 70 MP e causa 1224 de dano. |
| Golpes Velozes | 30 | 64 | Ver efeito | Golpes Velozes: consome 64 MP e executa 3 ataques basicos. |
| Corte Profundo | 50 | 72 | bleedTurns: 3 | Corte Profundo: consome 72 MP e causa 951 de dano. Aplica sangramento equivalente a 30% do dano causado por 3 turnos. |
| Bomba de Fumaca | 60 | 60 | turns: 1 | Bomba de Fumaca: consome 60 MP, garante esquiva no proximo ataque do inimigo e fortalece em 30% o seu proximo dano. |
| Mata-Gigantes | 80 | 220 | Ver efeito | Mata-Gigantes: consome 220 MP e causa 8000 de dano com base na vida atual do inimigo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar, executa um ataque basico de contra-ataque ignorando armadura e escudo. |
| Eliminar | 70 | Eliminar: causa 50% de dano total adicional contra inimigos abaixo de 50% da vida. |

## Mago — nível 20

Classe: **Mago**. Rota: base. Vida máxima: 251; mana máxima: 262; ataque: 58.

**Misseis Magicos:** Missel Magico: consome 15 MP, dispara 5 misseis e cada um causa entre 16 e 34 de dano.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Explosao de Mana | 20 | 24 | Ver efeito | Explosao de Mana: consome 24 MP e causa 82 de dano. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |

## Elementalista — nível 50

Classe: **Mago**. Rota: elementalista. Vida máxima: 1434; mana máxima: 932; ataque: 158.

**Misseis Magicos:** Missel Magico: consome 24 MP, dispara 8 misseis e cada um causa entre 53 e 101 de dano.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Explosao de Mana | 20 | 30 | Ver efeito | Explosao de Mana: consome 30 MP e causa 297 de dano. |
| Bola de Fogo | 30 | 40 | burnTurns: 3; chillTurns: 0 | Bola de Fogo: consome 40 MP e causa 276 de dano de fogo. A queimadura causa 600 por turno durante 3 turnos e reduz a cura recebida pelo inimigo em 30%. |
| Congelar | 50 | 50 | burnTurns: 0; chillTurns: 0 | Congelar: consome 50 MP, causa 216 de dano e tem 30% de chance de impedir o proximo ataque do inimigo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Mana e Vida | 40 | Mana e Vida: converte 50% da mana maxima em vida maxima. |

## Mago Incendiario — nível 100

Classe: **Mago**. Rota: elementalista → mago_incendiario. Vida máxima: 4944; mana máxima: 3036; ataque: 411.

**Misseis Magicos:** Missel Magico: consome 39 MP, dispara 13 misseis e cada um causa entre 190 e 313 de dano.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Explosao de Mana | 20 | 40 | Ver efeito | Explosao de Mana: consome 40 MP e causa 1366 de dano. |
| Bola de Fogo | 30 | 40 | burnTurns: 3; chillTurns: 0 | Bola de Fogo: consome 40 MP e causa 2392 de dano de fogo. A queimadura causa 1000 por turno durante 3 turnos e reduz a cura recebida pelo inimigo em 30%. |
| Bafo de Fogo | 50 | 60 | burnTurns: 6; chillTurns: 0 | Bafo de Fogo: consome 60 MP, causa 989 de dano e aplica queimadura por 6 turnos. |
| Fenix Sagrada | 60 | 1233 | burnTurns: 1 | Fenix Sagrada: consome 1233 MP e causa 1959 de dano, aplicando queimadura por 1 turno. |
| Explodir | 80 | 500 + 50% da vida máxima | Ver efeito | Explodir: consome 500 MP, 50% da sua vida maxima e causa 14014 de dano. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Mana e Vida | 40 | Mana e Vida: converte 50% da mana maxima em vida maxima. Alem disso, concede 546 de dano de habilidade. |
| Fogo do Inferno | 70 | Fogo do Inferno: aumenta o dano da queimadura de 3% para 5% da vida maxima do inimigo por turno. |

## Mago Frigido — nível 100

Classe: **Mago**. Rota: elementalista → mago_frigido. Vida máxima: 5659; mana máxima: 3436; ataque: 411.

**Misseis Magicos:** Missel Magico: consome 39 MP, dispara 13 misseis e cada um causa entre 133 e 256 de dano.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Explosao de Mana | 20 | 40 | Ver efeito | Explosao de Mana: consome 40 MP e causa 840 de dano. |
| Bola de Neve | 30 | 40 | burnTurns: 3; chillTurns: 3 | Bola de Neve: consome 40 MP e causa 657 de dano. Aplica resfriamento por 3 turnos, reduzindo em 30% o ataque do inimigo. |
| Congelar | 50 | 60 | burnTurns: 0; chillTurns: 2 | Congelar: consome 60 MP, causa 480 de dano e tem 30% de chance de impedir o proximo ataque do inimigo. Se nao impedir o turno, aplica resfriamento por 2 turnos ou Congelamento se o alvo ja estiver resfriado. |
| Nevasca | 60 | 120 | turns: 6 | Nevasca: consome 120 MP e faz o inimigo ter 15% de chance de perder o turno por 6 turnos. |
| Avalanche | 80 | 400 | chillTurns: 4 | Avalanche: consome 400 MP, causa 10807 de dano e aplica resfriamento por 4 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Mana e Vida | 40 | Mana e Vida: converte 65% da mana maxima em vida maxima. |
| Gelo Queima | 70 | Gelo Queima: sempre que aplicar resfriamento, tambem causa queimadura de 3% da vida maxima por 1 turno. |

## Arcanista — nível 50

Classe: **Mago**. Rota: arcanista. Vida máxima: 968; mana máxima: 992; ataque: 168.

**Misseis Magicos:** Missel Magico: bonus fixo de 297 por acao, dividido entre os projeteis.  consome 24 MP, dispara 8 misseis e cada um causa entre 38 e 89 de dano. Cada missel tem 15% de chance de gerar 1 Carga Arcana, que dura 3 turnos a partir da primeira carga.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Explosao de Mana | 20 | 129 | Ver efeito | Explosao de Mana: consome 129 MP e causa 560 de dano. |
| Descarregar | 30 | 99 | Ver efeito | Descarregar: consome 99 MP, gasta todas as cargas arcanas e causa 411 de dano. |
| Escudo de Mana | 50 | 247 | turns: 2 | Escudo de Mana: consome 247 MP e concede 337 de escudo por 2 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Transbordando | 40 | Transbordando: concede 297 de dano adicional em ataques e habilidades e aumenta os custos das habilidades em 99. |

## Arquimago — nível 100

Classe: **Mago**. Rota: arcanista → arquimago. Vida máxima: 3426; mana máxima: 3896; ataque: 431.

**Misseis Magicos:** Missel Magico: bonus fixo de 1753 por acao, dividido entre os projeteis.  consome 39 MP, dispara 13 misseis e cada um causa entre 91 e 220 de dano. Cada missel tem 15% de chance de gerar 1 Carga Arcana, que dura 3 turnos a partir da primeira carga.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Explosao de Mana | 20 | 819 | Ver efeito | Explosao de Mana: consome 819 MP e causa 2581 de dano. |
| Descarregar | 30 | 779 | Ver efeito | Descarregar: consome 779 MP, gasta todas as cargas arcanas e causa 1753 de dano. |
| Escudo de Mana | 50 | 1246 | turns: 2 | Escudo de Mana: consome 1246 MP e concede 1598 de escudo por 2 turnos. |
| Concentracao | 60 | 979 | turns: 4 | Concentracao: consome 979 MP, aumenta o dano total em 20% e a regeneracao de mana em 10% por 4 turnos. |
| Sobrecarregar | 80 | 3896 | Ver efeito | Sobrecarregar: consome 3896 MP e causa 5849 de dano usando sua mana maxima e as cargas arcanas. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Transbordando | 40 | Transbordando: concede 1753 de dano adicional em ataques e habilidades e aumenta os custos das habilidades em 779. |
| Carregar | 70 | Carregar: cada carga arcana aumenta o dano total em 5%. Atualmente: 0%. |

## Corrompido — nível 100

Classe: **Mago**. Rota: arcanista → corrompido. Vida máxima: 3426; mana máxima: 3396; ataque: 446.

**Misseis Magicos:** Missel Magico: bonus fixo de 1018 por acao, dividido entre os projeteis.  consome 39 MP, dispara 13 misseis e cada um causa entre 94 e 228 de dano. Cada missel tem 15% de chance de gerar 1 Carga Arcana, que dura 3 turnos a partir da primeira carga.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Explosao de Mana | 20 | 379 | Ver efeito | Explosao de Mana: consome 379 MP e causa 1785 de dano. |
| Descarregar | 30 | 339 | Ver efeito | Descarregar: consome 339 MP, gasta todas as cargas arcanas e causa 1256 de dano. |
| Escudo de Mana | 50 | 848 | turns: 2 | Escudo de Mana: consome 848 MP e concede 1058 de escudo por 2 turnos. |
| Corrupcao | 60 | 1018 | armorBreakTurns: 5; noShieldTurns: 5 | Corrupcao: consome 1018 MP, causa 2573 de dano, remove toda a armadura do inimigo e impede escudos por 5 turnos. |
| Incorporar Demonio | 80 | 1018 | turns: 3 | Incorporar Demonio: consome 1018 MP, concede 200% de dano total adicional por 3 turnos e faz voce receber 30% de dano adicional pelo mesmo tempo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Transbordando | 40 | Transbordando: concede 1018 de dano adicional em ataques e habilidades e aumenta os custos das habilidades em 339. |
| Canhao de Vidro | 70 | Canhao de Vidro: o primeiro ataque do combate causa o dobro de dano, mas voce sofre 50% de dano adicional nos 2 primeiros turnos do combate. |

## Arqueiro — nível 20

Classe: **Arqueiro**. Rota: base. Vida máxima: 271; mana máxima: 242; ataque: 60.

**Atacar:** Ataque basico. Dano entre 60 e 65. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Mirar | 1 | 50 | turns: 5 | Mirar: consome 50 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta o dano de ataque basico em 25. |
| Camuflagem | 20 | 50 | turns: 4 | Camuflagem: consome 50 MP e concede 20% de esquiva adicional por 4 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 15% de chance do inimigo errar o ataque contra voce. |

## Atirador — nível 50

Classe: **Arqueiro**. Rota: atirador. Vida máxima: 988; mana máxima: 922; ataque: 220.

**Atacar:** Ataque basico. Dano entre 220 e 225. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Mirar | 1 | 80 | turns: 5 | Mirar: consome 80 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta o dano de ataque basico em 55, alem de fortalecer o Headshot em 10% e dar +10% de chance de critico. |
| Camuflagem | 20 | 65 | turns: 4 | Camuflagem: consome 65 MP e concede 20% de esquiva adicional por 4 turnos, deixando o proximo dano causado 30% mais forte. |
| Headshot | 30 | 75 | Ver efeito | Headshot: consome 75 MP e causa 367 de dano, com 15% de chance total de critico. |
| Tiro Perfurante | 50 | 80 | Ver efeito | Tiro Perfurante: consome 80 MP e causa 389 de dano, ignorando armadura e escudo do inimigo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 30% de chance do inimigo errar o ataque contra voce e 5% de chance de critico em qualquer ataque ou habilidade. |
| Pulso Firme | 40 | Pulso Firme: concede 45 de dano de ataque basico e 45 de dano de habilidade no nivel atual. |

## Atirador Arcano — nível 100

Classe: **Arqueiro**. Rota: atirador → atirador_arcano. Vida máxima: 3446; mana máxima: 3426; ataque: 518.

**Atacar:** Ataque basico. Dano entre 518 e 523. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Mirar | 1 | 130 | turns: 5 | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta o dano de ataque basico em 105, alem de fortalecer o Headshot em 10% e dar +10% de chance de critico. |
| Camuflagem | 20 | 90 | turns: 4 | Camuflagem: consome 90 MP e concede 20% de esquiva adicional por 4 turnos, deixando o proximo dano causado 30% mais forte. |
| Headshot | 30 | 90 | Ver efeito | Headshot: consome 90 MP e causa 2954 de dano, com 15% de chance total de critico. Se nao critar, marca o alvo para receber 15% a mais no proximo golpe. |
| Tiro Perfurante | 50 | 80 | Ver efeito | Tiro Perfurante: consome 80 MP e causa 1379 de dano, ignorando armadura e escudo do inimigo. |
| Emergencia Arcana | 60 | 100 | Ver efeito | Emergencia Arcana: consome 100 MP e causa 823 de dano arcano. O dano aumenta conforme sua mana atual estiver abaixo da mana maxima. |
| Sobreaquecer | 80 | 3426 | Ver efeito | Sobreaquecer: gasta toda a mana atual (3426) e causa 3355 de dano. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e 5% de chance de critico em qualquer ataque ou habilidade. |
| Pulso Firme | 40 | Pulso Firme: concede 90 de dano de ataque basico e 130 de dano de habilidade no nivel atual. |
| Cristalizar Mana | 70 | Cristalizar Mana: converte 171 de mana maxima em dano de habilidade. |

## Sniper — nível 100

Classe: **Arqueiro**. Rota: atirador → sniper. Vida máxima: 3446; mana máxima: 3026; ataque: 588.

**Atacar:** Ataque basico. Dano entre 588 e 593. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Mirar | 1 | 130 | turns: 5 | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta o dano de ataque basico em 105, alem de fortalecer o Headshot em 10% e dar +10% de chance de critico. |
| Camuflagem | 20 | 90 | turns: 4 | Camuflagem: consome 90 MP e concede 20% de esquiva adicional por 4 turnos, deixando o proximo dano causado 30% mais forte. |
| Headshot | 30 | 90 | Ver efeito | Headshot: consome 90 MP e causa 892 de dano, com 104% de chance total de critico. O excedente acima de 100% de chance de critico vira dano critico adicional, deixando o critico em 104% de dano extra. |
| Tiro Perfurante | 50 | 80 | Ver efeito | Tiro Perfurante: consome 80 MP e causa 1156 de dano, ignorando armadura e escudo do inimigo. Alem disso, remove totalmente o escudo do alvo. |
| Executar | 60 | 120 | Ver efeito | Executar: consome 120 MP e causa 1157 de dano. Se o inimigo estiver abaixo de 40% da vida, o dano e triplicado. |
| Ponto Fraco | 80 | 120 | Ver efeito | Ponto Fraco: consome 120 MP e causa 5485 de dano, explorando a vida atual do alvo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e 5% de chance de critico em qualquer ataque ou habilidade. |
| Pulso Firme | 40 | Pulso Firme: concede 90 de dano de ataque basico e 90 de dano de habilidade no nivel atual. Alem disso, seus ataques e habilidades ganham 15% de chance adicional de critico. |
| Olhos de Falcao | 70 | Olhos de Falcao: concede 15% de chance de critico e faz qualquer excedente acima de 100% virar dano critico adicional. |

## Cacador — nível 50

Classe: **Arqueiro**. Rota: cacador. Vida máxima: 1088; mana máxima: 872; ataque: 180.

**Atacar:** Ataque basico. Dano entre 180 e 185. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Mirar | 1 | 80 | turns: 5 | Mirar: consome 80 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta o dano de ataque basico em 55, alem de conceder 10% de chance de um disparo extra na Rajada de Flechas. |
| Camuflagem | 20 | 65 | turns: 4 | Camuflagem: consome 65 MP e concede 25% de esquiva adicional por 4 turnos. |
| Rajada de Flechas | 30 | 60 | Ver efeito | Rajada de Flechas: consome 60 MP e realiza 2 ataques basicos no mesmo turno. |
| Armadilha | 50 | 80 | Ver efeito | Armadilha: consome 80 MP, causa 188 de dano e tem 30% de chance de fazer o inimigo perder o proximo turno. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 30% de chance do inimigo errar o ataque contra voce e aumenta em 10% as moedas recebidas dos inimigos. |
| Errou | 40 | Errou: ao esquivar de um ataque, voce ganha 10% de dano total por 2 turnos. |

## Espreitador — nível 100

Classe: **Arqueiro**. Rota: cacador → espreitador. Vida máxima: 3546; mana máxima: 3076; ataque: 463.

**Atacar:** Ataque basico. Dano entre 463 e 468. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Mirar | 1 | 130 | turns: 5 | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta o dano de ataque basico em 105, alem de conceder 10% de chance de um disparo extra na Rajada de Flechas. |
| Camuflagem | 20 | 90 | turns: 4 | Camuflagem: consome 90 MP e concede 25% de esquiva adicional por 4 turnos. |
| Rajada de Flechas | 30 | 60 | Ver efeito | Rajada de Flechas: consome 60 MP e realiza 2 ataques basicos no mesmo turno. |
| Armadilha | 50 | 80 | Ver efeito | Armadilha: consome 80 MP, causa 2083 de dano e tem 30% de chance de fazer o inimigo perder o proximo turno. O dano inclui 8% da vida atual do inimigo. |
| Surpresa | 60 | 80 | Ver efeito | Surpresa: consome 80 MP e causa 764 de dano. |
| Mirar no Pe | 80 | 100 | enemyAttackDownTurns: 3; enemyArmorDownTurns: 3 | Mirar no Pe: consome 100 MP, causa 558 de dano, reduz em 15% o dano do inimigo, corta 50% da armadura por 3 turnos e tem 10% de chance de fazer o alvo perder o proximo turno. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e aumenta em 10% as moedas recebidas dos inimigos. |
| Errou | 40 | Errou: ao esquivar de um ataque, seu proximo dano causado fica 50% mais forte. |
| Passos Silenciosos | 70 | Passos Silenciosos: concede 7% de chance do inimigo perder o turno sem atacar. |

## Guarda Florestal — nível 100

Classe: **Arqueiro**. Rota: cacador → guarda_florestal. Vida máxima: 4046; mana máxima: 2976; ataque: 458.

**Atacar:** Ataque basico. Dano entre 458 e 463. Chance de acerto: 84%.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Mirar | 1 | 130 | turns: 5 | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta o dano de ataque basico em 105, alem de conceder 10% de chance de um disparo extra na Rajada de Flechas. |
| Camuflagem | 20 | 90 | turns: 4 | Camuflagem: consome 90 MP e concede 25% de esquiva adicional por 4 turnos. |
| Rajada de Flechas | 30 | 60 | Ver efeito | Rajada de Flechas: consome 60 MP e realiza 3 ataques basicos no mesmo turno. |
| Armadilha | 50 | 80 | Ver efeito | Armadilha: consome 80 MP, causa 466 de dano e tem 30% de chance de fazer o inimigo perder o proximo turno. Se prender o alvo, sua proxima Rajada de Flechas causara 15% de dano adicional. |
| Tranquilizante | 60 | 80 | enemyAttackDownTurns: 3 | Tranquilizante: consome 80 MP, causa 664 de dano e reduz em 30% o dano do inimigo por 3 turnos. |
| Tiro Cortante | 80 | 80 | dotTurns: 3 | Tiro Cortante: consome 80 MP e faz o alvo sofrer 381 de dano por rodada durante 3 rodadas (1143 no total). |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Passos Leves | 10 | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e aumenta em 10% as moedas recebidas dos inimigos. |
| Errou | 40 | Errou: ao esquivar de um ataque, voce recupera 525 de vida. |
| Resistencia Florestal | 70 | Resistencia Florestal: reduz 20 de dano por ataque recebido. |

## Adepto da Natureza — nível 20

Classe: **Adepto da Natureza**. Rota: base. Vida máxima: 271; mana máxima: 262; ataque: 56.

**Atacar:** Ataque basico. Dano entre 56 e 61.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Semente Viva | 1 | 30 | markTurns: 3 | Semente Viva: consome 30 MP, causa 62 de dano e marca o alvo por 3 turnos. |
| Raizes | 20 | 42 | Ver efeito | Raizes: consome 42 MP, causa 99 de dano e tem 45% de chance de enraizar. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |

## Druida — nível 50

Classe: **Adepto da Natureza**. Rota: druida. Vida máxima: 1088; mana máxima: 892; ataque: 166.

**Atacar:** Ataque basico. Dano entre 166 e 171.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Semente Viva | 1 | 45 | markTurns: 4 | Semente Viva: consome 45 MP, causa 170 de dano e marca o alvo por 4 turnos. A marca tambem causa 119 por turno. |
| Raizes | 20 | 60 | Ver efeito | Raizes: consome 60 MP, causa 271 de dano e tem 60% de chance de enraizar. |
| Flor do Pantano | 30 | 40 | poisonTurns: 4 | Flor do Pantano: consome 40 MP e causa 261 de dano. Se o alvo estiver enraizado, aplica veneno de 59 por 4 turnos. |
| Colheita | 50 | 55 | Ver efeito | Colheita: consome 55 MP, causa 229 de dano e consome efeitos naturais ativos para explodir o dano restante. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 16% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |
| Seiva | 40 | Seiva: dano de marca e veneno cura 8% do dano causado. |

## Druida Sombrio — nível 100

Classe: **Adepto da Natureza**. Rota: druida → druida_sombrio. Vida máxima: 3546; mana máxima: 3196; ataque: 439.

**Atacar:** Ataque basico. Dano entre 439 e 444.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Semente Viva | 1 | 70 | markTurns: 4 | Semente Viva: consome 70 MP, causa 446 de dano e marca o alvo por 4 turnos. A marca tambem causa 345 por turno. |
| Raizes | 20 | 90 | Ver efeito | Raizes: consome 90 MP, causa 716 de dano e tem 60% de chance de enraizar. |
| Flor do Pantano | 30 | 60 | poisonTurns: 7 | Flor do Pantano: consome 60 MP e causa 706 de dano. Se o alvo estiver enraizado, aplica veneno de 172 por 7 turnos. |
| Colheita | 50 | 70 | Ver efeito | Colheita: consome 70 MP, causa 556 de dano e consome efeitos naturais ativos para explodir o dano restante. |
| Apodrecer | 60 | 90 | decayTurns: 5 | Apodrecer: consome 90 MP, causa 576 de dano e aplica apodrecimento por 5 turnos. |
| Colapso do Brejo | 80 | 2716 | Ver efeito | Colapso do Brejo: consome 2716 MP e causa 1567 de dano. Se o alvo nao tiver DOT natural, aplica marca, veneno e apodrecimento por 4 turnos. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 16% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |
| Seiva | 40 | Seiva: dano de marca e veneno cura 8% do dano causado. Tambem considera apodrecimento. |
| Podridao | 70 | Podridao: aumenta marca, veneno e apodrecimento em 30%. |

## Avatar da Natureza — nível 100

Classe: **Adepto da Natureza**. Rota: druida → avatar_da_natureza. Vida máxima: 4359; mana máxima: 2996; ataque: 439.

**Atacar:** Ataque basico. Dano entre 439 e 444.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Semente Viva | 1 | 70 | markTurns: 4 | Semente Viva: consome 70 MP, causa 442 de dano e marca o alvo por 4 turnos. A marca tambem causa 333 por turno. |
| Raizes | 20 | 90 | Ver efeito | Raizes: consome 90 MP, causa 704 de dano e tem 60% de chance de enraizar. |
| Flor do Pantano | 30 | 60 | poisonTurns: 3 | Flor do Pantano: consome 60 MP e causa 913 de dano. Se o alvo estiver enraizado, aplica veneno de 166 por 3 turnos. |
| Colheita | 50 | 70 | Ver efeito | Colheita: consome 70 MP, causa 556 de dano e consome efeitos naturais ativos para explodir o dano restante. |
| Forma Verdadeira | 60 | 2996 | turns: 5 | Forma Verdadeira: consome toda a mana maxima, aumenta ataque em 26%, reduz dano sofrido em 18% e fortalece ataques basicos por 5 turnos. |
| Esmagar Invasor | 80 | 380 | Ver efeito | Esmagar Invasor: consome 380 MP e causa 878 de dano, com bonus contra alvo enraizado e na Forma Verdadeira. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 16% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |
| Seiva | 40 | Seiva: dano de marca e veneno cura 8% do dano causado. Tambem aumenta sua vida maxima em 12%. |
| Casca Ancestral | 70 | Casca Ancestral: reduz 54 de dano recebido por ataque. |

## Espirito da Floresta — nível 50

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta. Vida máxima: 988; mana máxima: 992; ataque: 161.

**Atacar:** Ataque basico. Dano entre 161 e 166.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Semente Viva | 1 | 45 | markTurns: 3 | Semente Viva: consome 45 MP, causa 184 de dano e marca o alvo por 3 turnos. A marca reduz o dano do inimigo em 24%. |
| Raizes | 20 | 60 | Ver efeito | Raizes: consome 60 MP, causa 313 de dano e tem 45% de chance de enraizar. Se enraizar, tambem reduz 50% da armadura. |
| Encanto da Brisa | 30 | 45 | Ver efeito | Encanto da Brisa: consome 45 MP, causa 247 de dano e tem 20% de chance de pular o turno do inimigo. Se o alvo estiver marcado, pode enraizar. |
| Cancao Ancestral | 50 | 60 | Ver efeito | Cancao Ancestral: consome 60 MP e cura 289. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. Tambem converte 30% do ataque basico em poder de habilidade. |
| Aura Feerica | 40 | Aura Feerica: curar ou ganhar escudo concede Cadencia. Cada acumulo da 4% de poder de habilidade, ate 3. Com 3 acumulos, curas aumentam 5%. |

## Fada Monarca — nível 100

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta → fada_monarca. Vida máxima: 3446; mana máxima: 3496; ataque: 414.

**Atacar:** Ataque basico. Dano entre 414 e 419.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Semente Viva | 1 | 70 | markTurns: 3 | Semente Viva: consome 70 MP, causa 470 de dano e marca o alvo por 3 turnos. A marca reduz o dano do inimigo em 24%. |
| Raizes | 20 | 90 | Ver efeito | Raizes: consome 90 MP, causa 807 de dano e tem 45% de chance de enraizar. Se enraizar, tambem reduz 50% da armadura. |
| Encanto da Brisa | 30 | 60 | Ver efeito | Encanto da Brisa: consome 60 MP, causa 648 de dano e tem 30% de chance de pular o turno do inimigo. Se o alvo estiver marcado, pode enraizar. |
| Cancao Ancestral | 50 | 80 | Ver efeito | Cancao Ancestral: consome 80 MP e cura 799. |
| Decreto da Rainha | 60 | 90 | Ver efeito | Decreto da Rainha: consome 90 MP e causa 1142 de dano. Com 3 Cadencias, o fator sobe para 2.9. |
| Coroar | 80 | 500 | turns: 5 | Coroar: consome 500 MP e fica coroada por 5 turnos, com +30% poder de habilidade, +20% curas e +20% nas chances de controle. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. Tambem converte 30% do ataque basico em poder de habilidade. |
| Aura Feerica | 40 | Aura Feerica: curar ou ganhar escudo concede Cadencia. Cada acumulo da 6% de poder de habilidade, ate 3. Com 3 acumulos, curas aumentam 10%. |
| Asas da Realeza | 70 | Asas da Realeza: concede 20% de chance de esquiva. |

## Protetor da Floresta — nível 100

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta → protetor_da_floresta. Vida máxima: 3846; mana máxima: 3096; ataque: 429.

**Atacar:** Ataque basico. Dano entre 429 e 434.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |
| --- | ---: | ---: | --- | --- |
| Semente Viva | 1 | 70 | markTurns: 3 | Semente Viva: consome 70 MP, causa 478 de dano e marca o alvo por 3 turnos. A marca reduz o dano do inimigo em 24%. |
| Raizes | 20 | 90 | Ver efeito | Raizes: consome 90 MP, causa 811 de dano e tem 45% de chance de enraizar. Se enraizar, tambem reduz 50% da armadura. |
| Encanto da Brisa | 30 | 60 | Ver efeito | Encanto da Brisa: consome 60 MP, causa 636 de dano e tem 20% de chance de pular o turno do inimigo. Se o alvo estiver marcado, pode enraizar. |
| Cancao Ancestral | 50 | 80 | Ver efeito | Cancao Ancestral: consome 80 MP e cura 784. Tambem concede 896 de escudo. |
| Casulo de Vinhas | 60 | 120 | Ver efeito | Casulo de Vinhas: consome 120 MP e concede 1384 de escudo. |
| Jogar Espinhos | 80 | 400 + 20% da vida máxima | Ver efeito | Jogar Espinhos: consome 400 MP, 20% da vida maxima e todo seu escudo atual para causar 0 de dano ignorando armadura e escudo. |

| Passiva | Desbloqueio | Efeito atual |
| --- | ---: | --- |
| Ciclo Natural | 10 | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. Tambem converte 30% do ataque basico em poder de habilidade. |
| Aura Feerica | 40 | Aura Feerica: curar ou ganhar escudo concede Cadencia. Cada acumulo da 4% de poder de habilidade, ate 3. Com 3 acumulos, curas aumentam 5%. |
| Juramento do Bosque | 70 | Juramento do Bosque: aumenta escudos em 6% e reflete 30% do dano absorvido enquanto houver escudo. |


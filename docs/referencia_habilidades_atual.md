# Referência atual de habilidades

Catálogo gerado a partir do código executável atual em 04/11/2026. Não utiliza o documento antigo de balanceamento.

São 28 formas de classe/subclasse e 59 nomes distintos de habilidades ativas. Habilidades herdadas aparecem em cada rota em que estão disponíveis.

Os exemplos usam distribuição equilibrada dos pontos, sem equipamentos, níveis 20/50/100 conforme o estágio da árvore, vida e mana cheias, zero Cargas Arcanas, zero Cadência e alvo com 20.000 de vida máxima. As passivas iniciais de combate permanecem ativas. Valores dependentes de vida, mana, ataque, alvo e estado são fotografias desse contexto; não são coeficientes fixos nem uma avaliação de balanceamento.

Custos e descrições vêm de `getSkillInfo()` e `useSkillCost()`; passivas vêm de `getUnlockedPassiveSkills()` e `getPassiveStatusDescription()`. O JSON contém também os campos numéricos dos descritores e os modificadores passivos. A aplicação final ocorre em `applySkillLocally()`, no ataque básico e nos resolvedores de combate: buffs globais, crítico, mitigação e efeitos de equipamentos podem alterar o resultado. A coluna de duração reproduz os campos retornados pelo código; detalhes condicionais estão no texto.

Legenda: D = dano calculado pela habilidade; C = custo em mana (MP); L = nível do herói; A = ataque ativo; P = poder de habilidade ativo; H = vida máxima do herói; M = mana máxima do herói; m = mana atual do herói antes do custo; h = vida atual do inimigo; E = vida máxima do inimigo; mₑ = mana atual do inimigo; Q = cargas arcanas; Z = escudo atual do herói; X = dano acumulado que Escudo de Fé impediu; V = vida efetivamente retirada do inimigo; Vᵣ = dano recebido pelo herói após suas defesas; Dₑ = dano do golpe após as defesas; r = sorteio inteiro de 0 a 5; T = dano periódico total antes do rateio.

W = piso(0,5L). F = dano fixo adicional de Transbordando; S = acréscimo de custo de Transbordando. Para Arcanista e Corrompido: F = piso(0,25M) e S = piso(0,11M). Para Arquimago: F = piso(0,4M) e S = piso(0,2M). Sem a passiva desbloqueada, F = S = 0.

Como ler: 0,06H significa 6% da vida máxima; 0,8A significa 80% do ataque. Exemplo: na linha do Espadachim, Investida tem D = 20 + 0,06H + 0,8A + 0,8P e C = 50 + W. As variações de classe já estão resolvidas em cada tabela. Piso significa arredondar para baixo. Nas somas, cada parcela fracionária é arredondada separadamente, exceto quando piso envolve a soma inteira. O custo final do Mago é limitado à sua mana máxima. As fórmulas representam a base: buffs, crítico, conjuntos, mitigação e demais efeitos descritos podem modificar o resultado.

Condições gerais: esquiva impede novos efeitos ligados ao golpe evitado, mas não remove DOTs já ativos. Queimaduras, venenos e sangramentos acumulam com dano e prazo próprios. Canhão de Vidro conta duas ações de dano, não dois projéteis ou turnos; seu primeiro golpe recebido é um contador separado. Nevasca aplica seis turnos completos de resfriamento; aplicar resfriamento ativa Gelo Queima. Custos do Mago mantêm o teto de mana máxima. Investida e Você Irá Me Parar? podem romper perda de turno; Cortes Ultrassônicos exige uma ação de intervalo após terminar.

Revisão de 04/11/2026: Mago e subclasses rebalanceados; Canhão de Vidro usa dois contadores de eventos, resfriamento ativa Gelo Queima e rastreio usa (50 + 4 × nível²) × raridade. Detalhes: docs/balanceamento/mago_2026-11-04.md.

Para regenerar: `node scripts/generate-skill-reference.cjs`. Dados completos: [skills-reference.json](qa/2026-10-28/skills-reference.json).

Revisão de 03/11/2026: fórmulas e custos do Guerreiro e subclasses rebalanceados; esquiva bloqueia novos efeitos hostis; sangramentos acumulam com duração própria; Investida e Você Irá Me Parar? rompem perda de turno; Cortes Ultrassônicos exige intervalo após expirar. Arqueiro e subclasses também rebalanceados; rastreio passa a seis minutos com custo quadrático por nível e raridade. Análise atual: docs/analise_guerreiro_arqueiro_inimigos_2026-11-04.md.

## Guerreiro — nível 20

Classe: **Guerreiro**. Rota: base. Vida máxima: 396; mana máxima: 300; ataque: 74.

**Atacar:** Ataque basico. Dano entre 74 e 79.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Recuperar Folego | 1 | 40 | Duração: 0 turno(s) | C = 30 + W; cura = 0,12H | Recuperar Folego: consome 40 MP e recupera 47 de vida. |
| Esbarrao | 20 | 48 | Ataque reduzido: 0 turno(s) | C = 38 + W; D = 20 + 0,06H + 0,6A + 0,4P | Esbarrao: consome 48 MP e causa 109 de dano. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Vontade de Ferro | 10 | Redução fixa = piso(0,6L) | Vontade de Ferro: reduz 12 de dano por ataque recebido. |

## Cavaleiro — nível 50

Classe: **Guerreiro**. Rota: cavaleiro. Vida máxima: 1860; mana máxima: 1420; ataque: 230.

**Atacar:** Ataque basico. Dano entre 230 e 235.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Recuperar Folego | 1 | 55 | Duração: 0 turno(s) | C = 30 + W; cura = 0,19H | Recuperar Folego: consome 55 MP e recupera 353 de vida. |
| Esbarrao | 20 | 69 | Ataque reduzido: 3 turno(s) | C = 44 + W; D = 20 + 0,08H + 0,7A + 0,5P | Esbarrao: consome 69 MP e causa 435 de dano. Tambem reduz o ataque do inimigo em 30% por 3 turnos. |
| Contundir | 30 | 65 | Ver efeito | C = 40 + W; D = 30 + 0,07H + 0,6A + 0,4P | Contundir: consome 65 MP e causa 382 de dano. Tem 30% de chance de fazer o inimigo perder o proximo turno. |
| Brado | 50 | 65 | Duração: 5 turno(s) | C = 40 + W; dano final × 1,3 | Brado: consome 65 MP e aumenta o dano total final em 30% por 5 turnos. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Vontade de Ferro | 10 | Redução fixa = piso(0,6L); cura por turno = 0,03H | Vontade de Ferro: reduz 30 de dano por ataque recebido. Alem disso, recupera 55 de vida por turno. |
| Refletir | 40 | Dano refletido = 0,2Vᵣ, mais o bônus do acessório | Refletir: reflete 20% do dano recebido para o inimigo. |

## Paladino — nível 100

Classe: **Guerreiro**. Rota: cavaleiro → paladino. Vida máxima: 7530; mana máxima: 5340; ataque: 696.

**Atacar:** Ataque basico. Dano entre 696 e 701.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Recuperar Folego | 1 | 80 | Duração: 0 turno(s) | C = 30 + W; cura = 0,19H | Recuperar Folego: consome 80 MP e recupera 1430 de vida. |
| Esbarrao | 20 | 94 | Ataque reduzido: 3 turno(s) | C = 44 + W; D = 20 + 0,08H + 0,7A + 0,5P | Esbarrao: consome 94 MP e causa 1447 de dano. Tambem reduz o ataque do inimigo em 30% por 3 turnos. |
| Contundir | 30 | 90 | Ver efeito | C = 40 + W; D = 30 + 0,07H + 0,6A + 0,4P | Contundir: consome 90 MP e causa 1244 de dano. Tem 45% de chance de fazer o inimigo perder o proximo turno. |
| Brado | 50 | 90 | Duração: 5 turno(s) | C = 40 + W; dano final × 1,3 | Brado: consome 90 MP e aumenta o dano total final em 30% por 5 turnos. Tambem bloqueia 16% do dano sofrido nesse periodo. |
| Julgamento | 60 | 250 | Ver efeito | C = 100 + 3W; D = 80 + 0,4H + 0,5A + 0,8P | Julgamento: consome 250 MP e causa 3980 de dano. |
| Escudo de Fe | 80 | 3787 | Duração: 3 turno(s) | C = 0,7M + W; explosão = 0,5X | Escudo de Fe: consome 3787 MP e por 3 turnos voce nao recebe dano. Depois, explode causando 50% do dano que teria sido absorvido ao inimigo. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Vontade de Ferro | 10 | Redução fixa = piso(0,6L); cura por turno = 0,03H | Vontade de Ferro: reduz 60 de dano por ataque recebido. Alem disso, recupera 225 de vida por turno. |
| Refletir | 40 | Dano refletido = 0,4Vᵣ, mais o bônus do acessório | Refletir: reflete 40% do dano recebido para o inimigo. |
| Aura Divina | 70 | Escudo adicional por turno = piso(0,02H) | Aura Divina: a cada turno, ganha um escudo persistente de 150. |

## Berserker — nível 100

Classe: **Guerreiro**. Rota: cavaleiro → berserker. Vida máxima: 6530; mana máxima: 5340; ataque: 756.

**Atacar:** Ataque basico. Dano entre 756 e 761.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Recuperar Folego | 1 | 80 | Duração: 0 turno(s) | C = 30 + W; cura = 0,19H | Recuperar Folego: consome 80 MP e recupera 1240 de vida. |
| Esbarrao | 20 | 94 | Ataque reduzido: 3 turno(s) | C = 44 + W; D = 20 + 0,08H + 0,7A + 0,5P | Esbarrao: consome 94 MP e causa 1405 de dano. Tambem reduz o ataque do inimigo em 30% por 3 turnos. |
| Contundir | 30 | 90 | Ver efeito | C = 40 + W; D = 60 + 0,07H + 1,1A + 0,4P | Contundir: consome 90 MP e causa 1615 de dano. |
| Ira | 50 | 50 + 70% da vida máxima | Duração: 4 turno(s) | C = W MP + 0,7H de vida; dano final × 2,2; roubo de vida = 0,2V | Ira: consome 50 MP e 70% da sua vida maxima, aumentando o dano total final em 120% e concedendo 20% de roubo de vida sobre dano causado a vida do inimigo por 4 turnos. |
| Vallhala | 60 | 150 | Duração: 5 turno(s) | C = 100 + W; dano recebido × 2,5; adicional por dano causado = 0,15E | Vallhala: consome 150 MP, faz voce receber 150% de dano adicional e adiciona 15% da vida maxima do inimigo em qualquer dano causado por 5 turnos. |
| Voce Ira Me Parar? | 80 | 150 + 30% da vida máxima | Duração: 4 turno(s) | C = 100 + W MP + 0,3H de vida; A adicional = 100 | Voce Ira Me Parar?: consome 150 MP e 30% da sua vida maxima, impede pulos de turno e aumenta o ataque em 100 por 4 turnos. Pode ser usada para impedir a perda do turno atual. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Vontade de Ferro | 10 | Redução fixa = piso(0,6L); cura por turno = 0,03H | Vontade de Ferro: reduz 60 de dano por ataque recebido. Alem disso, recupera 195 de vida por turno. |
| Refletir | 40 | 50% de chance de contra-atacar ao sofrer dano | Refletir: ao sofrer dano, tem 50% de chance de responder com um ataque basico. |
| Voce Nao e Digno | 70 | Voce Nao e Digno: uma vez por combate, ao sofrer um golpe fatal, fica com 1 de vida e pode agir mais uma vez antes de morrer. | Voce Nao e Digno: uma vez por combate, ao sofrer um golpe fatal, fica com 1 de vida e pode agir mais uma vez antes de morrer. |

## Espadachim — nível 50

Classe: **Guerreiro**. Rota: espadachim. Vida máxima: 1720; mana máxima: 1420; ataque: 247.

**Atacar:** Ataque basico. Dano entre 247 e 252.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Recuperar Folego | 1 | 55 | Duração: 3 turno(s) | C = 30 + W; cura = 0,12H | Recuperar Folego: consome 55 MP e recupera 206 de vida. Tambem aumenta seu dano total final em 28% por 3 turnos. |
| Investida | 20 | 75 | Ataque reduzido: 0 turno(s) | C = 50 + W; D = 20 + 0,06H + 0,8A + 0,8P | Investida: consome 75 MP e causa 495 de dano. Pode ser usada para impedir a perda do turno atual. |
| Golpes Velozes | 30 | 69 | Ver efeito | C = 44 + W; 2 ataques básicos; cada golpe usa A + r | Golpes Velozes: consome 69 MP e executa 2 ataques basicos. |
| Corte Profundo | 50 | 77 | Sangramento: 3 turno(s) | C = 52 + W; D = 70 + 1,1A + 0,8P; sangramento por turno = Dₑ × 0,15 ÷ 3 | Corte Profundo: consome 77 MP e causa 516 de dano. Aplica sangramento equivalente a 15% do dano causado por 3 turnos. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar de um ataque, executa um contra-ataque com seu ataque basico. | Contra-Ataque: ao desviar de um ataque, executa um contra-ataque com seu ataque basico. |

## Samurai — nível 100

Classe: **Guerreiro**. Rota: espadachim → samurai. Vida máxima: 6890; mana máxima: 5340; ataque: 738.

**Atacar:** Ataque basico. Dano entre 738 e 743.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Recuperar Folego | 1 | 80 | Duração: 3 turno(s) | C = 30 + W; cura = 0,12H | Recuperar Folego: consome 80 MP e recupera 826 de vida. Tambem aumenta seu dano total final em 28% por 3 turnos. |
| Investida | 20 | 100 | Ataque reduzido: 0 turno(s) | C = 50 + W; D = 20 + 0,06H + 0,8A + 0,8P | Investida: consome 100 MP e causa 1575 de dano. Pode ser usada para impedir a perda do turno atual. |
| Golpes Velozes | 30 | 94 | Ver efeito | C = 44 + W; 2 ataques básicos; cada golpe usa A + r | Golpes Velozes: consome 94 MP e executa 2 ataques basicos. Tambem aplica sangramento por 3 turnos. |
| Corte Profundo | 50 | 102 | Sangramento: 3 turno(s) | C = 52 + W; D = 70 + 1,1A + 0,8P; sangramento por turno = Dₑ × 0,15 ÷ 3 | Corte Profundo: consome 102 MP e causa 1433 de dano. Ignora armadura. Aplica sangramento equivalente a 15% do dano causado por 3 turnos. |
| Furar Blindagem | 60 | 132 | Ver efeito | C = 82 + W; D = 80 + 1,1A + 1,1P; D × 3 se o alvo tiver escudo | Furar Blindagem: consome 132 MP e causa 1650 de dano. |
| Cortes Ultrasonicos | 80 | 340 | Duração: 3 turno(s) | C = 240 + 2W; 3 turnos de ataques básicos e esquiva; intervalo de 1 ação para reativar | Cortes Ultrasonicos: consome 340 MP. Por 3 turnos, voce so pode usar o ataque basico e nao pode ser atingido. Ao terminar, precisa realizar outra acao antes de reativar. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar, executa um ataque basico de contra-ataque e recupera 30% do dano que o golpe causaria. | Contra-Ataque: ao desviar, executa um ataque basico de contra-ataque e recupera 30% do dano que o golpe causaria. |
| Mente Limpa | 70 | Segundo golpe inicial = 0,5 × dano do primeiro | Mente Limpa: o primeiro ataque do combate acerta duas vezes, com o segundo golpe causando 50% do dano, mas repetindo os efeitos. |

## Ninja — nível 100

Classe: **Guerreiro**. Rota: espadachim → ninja. Vida máxima: 6390; mana máxima: 5340; ataque: 743.

**Atacar:** Ataque basico. Dano entre 743 e 748.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Recuperar Folego | 1 | 80 | Duração: 3 turno(s) | C = 30 + W; cura = 0,12H | Recuperar Folego: consome 80 MP e recupera 766 de vida. Tambem aumenta seu dano total final em 28% por 3 turnos. |
| Investida | 20 | 100 | Ataque reduzido: 0 turno(s) | C = 50 + W; D = 20 + 0,06H + 0,8A + 0,8P | Investida: consome 100 MP e causa 1561 de dano. Pode ser usada para impedir a perda do turno atual. |
| Golpes Velozes | 30 | 94 | Ver efeito | C = 44 + W; 3 ataques básicos; cada golpe usa A + r | Golpes Velozes: consome 94 MP e executa 3 ataques basicos. |
| Corte Profundo | 50 | 102 | Sangramento: 3 turno(s) | C = 52 + W; D = 70 + 0,9A + 1,1P; sangramento por turno = Dₑ × 0,3 ÷ 3 | Corte Profundo: consome 102 MP e causa 1513 de dano. Aplica sangramento equivalente a 30% do dano causado por 3 turnos. |
| Bomba de Fumaca | 60 | 90 | Duração: 1 turno(s) | C = 40 + W; próximo dano × 1,3; esquiva garantida no próximo ataque | Bomba de Fumaca: consome 90 MP, garante esquiva no proximo ataque do inimigo e fortalece em 30% o seu proximo dano. |
| Mata-Gigantes | 80 | 250 | Ver efeito | C = 200 + W; D = 0,32h | Mata-Gigantes: consome 250 MP e causa 6400 de dano com base na vida atual do inimigo. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar, executa um ataque basico de contra-ataque ignorando armadura e escudo. | Contra-Ataque: ao desviar, executa um ataque basico de contra-ataque ignorando armadura e escudo. |
| Eliminar | 70 | Dano × 1,5 quando h ≤ 0,5E | Eliminar: causa 50% de dano total adicional contra inimigos abaixo de 50% da vida. |

## Mago — nível 20

Classe: **Mago**. Rota: base. Vida máxima: 356; mana máxima: 340; ataque: 70.

**Misseis Magicos:** Missel Magico: consome 15 MP, dispara 5 misseis e cada um causa entre 19 e 35 de dano.

**Fórmula do ataque básico:** N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A; F é dividido entre os N projéteis.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Explosao de Mana | 20 | 30 | Ver efeito | C = 20 + W + S; B = piso(0,4mₑ); D = 30 + 0,6P + 0,08M + 3,5B + F | Explosao de Mana: consome 30 MP e causa 90 de dano. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Ultimo Recurso | 10 | Se o golpe for fatal e m ≥ 2Vᵣ: custo em mana = 2Vᵣ; dano à vida = 0 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |

## Elementalista — nível 50

Classe: **Mago**. Rota: elementalista. Vida máxima: 2355; mana máxima: 1500; ataque: 218.

**Misseis Magicos:** Missel Magico: consome 24 MP, dispara 8 misseis e cada um causa entre 69 e 115 de dano.

**Fórmula do ataque básico:** N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A + 0,09P em cada limite; F é dividido entre os N projéteis.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Explosao de Mana | 20 | 45 | Ver efeito | C = 20 + W + S; B = piso(0,4mₑ); D = 30 + 1,0P + 0,08M + 3,5B + F | Explosao de Mana: consome 45 MP e causa 384 de dano. |
| Bola de Fogo | 30 | 65 | Queimadura: 3 turno(s); Resfriamento: 0 turno(s) | C = 40 + W + S; D = 50 + 0,15A + 1,2P + F | Bola de Fogo: consome 65 MP e causa 362 de dano de fogo. A queimadura causa 600 por turno durante 3 turnos e reduz a cura recebida pelo inimigo em 30%. |
| Congelar | 50 | 65 | Queimadura: 0 turno(s); Resfriamento: 0 turno(s) | C = 40 + W + S; D = 60 + 0,08A + 0,85P + F | Congelar: consome 65 MP, causa 275 de dano e tem 30% de chance de impedir o proximo ataque do inimigo. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Ultimo Recurso | 10 | Se o golpe for fatal e m ≥ 2Vᵣ: custo em mana = 2Vᵣ; dano à vida = 0 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Mana e Vida | 40 | Vida adicional = 0,45M | Mana e Vida: converte 45% da mana maxima em vida maxima. |

## Mago Incendiario — nível 100

Classe: **Mago**. Rota: elementalista → mago_incendiario. Vida máxima: 8789; mana máxima: 5420; ataque: 674.

**Misseis Magicos:** Missel Magico: consome 39 MP, dispara 13 misseis e cada um causa entre 284 e 421 de dano.

**Fórmula do ataque básico:** N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A + 0,09P em cada limite; F é dividido entre os N projéteis.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Explosao de Mana | 20 | 70 | Ver efeito | C = 20 + W + S; B = piso(0,4mₑ); D = 30 + 1,0P + 0,08M + 3,5B + F | Explosao de Mana: consome 70 MP e causa 2080 de dano. |
| Bola de Fogo | 30 | 90 | Queimadura: 3 turno(s); Resfriamento: 0 turno(s) | C = 40 + W + S; D = 50 + 0,18A + 1,25P + 0,05h + F | Bola de Fogo: consome 90 MP e causa 3192 de dano de fogo. A queimadura causa 1000 por turno durante 3 turnos e reduz a cura recebida pelo inimigo em 30%. |
| Bafo de Fogo | 50 | 90 | Queimadura: 6 turno(s); Resfriamento: 0 turno(s) | C = 40 + W + S; D = 60 + 0,08A + 0,9P + F | Bafo de Fogo: consome 90 MP, causa 1568 de dano e aplica queimadura por 6 turnos. |
| Fenix Sagrada | 60 | 1817 | Queimadura: 1 turno(s) | C = 200 + P + S; D = 100 + 0,4A + 1,85P + F | Fenix Sagrada: consome 1817 MP e causa 3360 de dano, aplicando queimadura por 1 turno. |
| Explodir | 80 | 500 + 50% da vida máxima | Ver efeito | C = 500 + S MP + 0,5H de vida; D = 200 + 1,3P + 0,5H + 0,5E + F | Explodir: consome 500 MP, 50% da sua vida maxima e causa 16696 de dano. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Ultimo Recurso | 10 | Se o golpe for fatal e m ≥ 2Vᵣ: custo em mana = 2Vᵣ; dano à vida = 0 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Mana e Vida | 40 | Vida adicional = 0,45M; P adicional = 0,16M | Mana e Vida: converte 45% da mana maxima em vida maxima. Alem disso, concede 867 de dano de habilidade. |
| Fogo do Inferno | 70 | Queimadura por turno = 0,05E | Fogo do Inferno: aumenta o dano da queimadura de 3% para 5% da vida maxima do inimigo por turno. |

## Mago Frigido — nível 100

Classe: **Mago**. Rota: elementalista → mago_frigido. Vida máxima: 10133; mana máxima: 5820; ataque: 674.

**Misseis Magicos:** Missel Magico: consome 39 MP, dispara 13 misseis e cada um causa entre 204 e 341 de dano.

**Fórmula do ataque básico:** N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A + 0,09P em cada limite; F é dividido entre os N projéteis.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Explosao de Mana | 20 | 70 | Ver efeito | C = 20 + W + S; B = piso(0,4mₑ); D = 30 + 1,0P + 0,08M + 3,5B + F | Explosao de Mana: consome 70 MP e causa 1225 de dano. |
| Bola de Neve | 30 | 90 | Queimadura: 3 turno(s); Resfriamento: 3 turno(s) | C = 40 + W + S; D = 50 + 0,18A + 1,25P + F | Bola de Neve: consome 90 MP e causa 1083 de dano. Aplica resfriamento por 3 turnos, reduzindo em 30% o ataque do inimigo. |
| Congelar | 50 | 90 | Queimadura: 0 turno(s); Resfriamento: 2 turno(s) | C = 40 + W + S; D = 60 + 0,08A + 0,9P + F | Congelar: consome 90 MP, causa 770 de dano e tem 30% de chance de impedir o proximo ataque do inimigo. Se nao impedir o turno, aplica resfriamento por 2 turnos ou Congelamento se o alvo ja estiver resfriado. |
| Nevasca | 60 | 170 | Duração: 6 turno(s); Resfriamento: 6 turno(s) | C = 120 + W + S; ataque inimigo × 0,7; 15% de chance de impedir a ação por turno | Nevasca: consome 170 MP e faz o inimigo ter 15% de chance de perder o turno e reduz seu ataque em 30% por 6 turnos. |
| Avalanche | 80 | 450 | Resfriamento: 4 turno(s) | C = 400 + W + S; D = 200 + 1,3P + 0,38h + F | Avalanche: consome 450 MP, causa 8749 de dano e aplica resfriamento por 4 turnos. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Ultimo Recurso | 10 | Se o golpe for fatal e m ≥ 2Vᵣ: custo em mana = 2Vᵣ; dano à vida = 0 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Mana e Vida | 40 | Vida adicional = 0,65M | Mana e Vida: converte 65% da mana maxima em vida maxima. |
| Gelo Queima | 70 | Ao resfriar: queimadura = 0,03E por 1 turno | Gelo Queima: sempre que aplicar resfriamento, tambem causa queimadura de 3% da vida maxima por 1 turno. |

## Arcanista — nível 50

Classe: **Mago**. Rota: arcanista. Vida máxima: 1680; mana máxima: 1560; ataque: 228.

**Misseis Magicos:** Missel Magico: bonus fixo de 390 por acao, dividido entre os projeteis.  consome 24 MP, dispara 8 misseis e cada um causa entre 50 e 98 de dano. Cada missel tem 15% de chance de gerar 1 Carga Arcana, que dura 3 turnos a partir da primeira carga.

**Fórmula do ataque básico:** N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A; F é dividido entre os N projéteis.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Explosao de Mana | 20 | 216 | Ver efeito | C = 20 + W + S; B = piso(0,4mₑ); D = 30 + 0,6P + 0,12M + 3,5B + F | Explosao de Mana: consome 216 MP e causa 738 de dano. |
| Descarregar | 30 | 171 | Ver efeito | C = 30Q + S; D = 60 + LQ + 0,3P + 0,045M + F | Descarregar: consome 171 MP, gasta todas as cargas arcanas e causa 585 de dano. |
| Escudo de Mana | 50 | 405 | Duração: 2 turno(s) | C = 0,15M + S; escudo = 40 + 0,3M | Escudo de Mana: consome 405 MP e concede 508 de escudo por 2 turnos. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Ultimo Recurso | 10 | Se o golpe for fatal e m ≥ 2Vᵣ: custo em mana = 2Vᵣ; dano à vida = 0 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Transbordando | 40 | F = piso(0,25M); S = piso(0,11M) | Transbordando: concede 390 de dano adicional em ataques e habilidades e aumenta os custos das habilidades em 171. |

## Arquimago — nível 100

Classe: **Mago**. Rota: arcanista → arquimago. Vida máxima: 6350; mana máxima: 6280; ataque: 694.

**Misseis Magicos:** Missel Magico: bonus fixo de 2512 por acao, dividido entre os projeteis.  consome 39 MP, dispara 13 misseis e cada um causa entre 143 e 284 de dano. Cada missel tem 15% de chance de gerar 1 Carga Arcana, que dura 3 turnos a partir da primeira carga.

**Fórmula do ataque básico:** N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A; F é dividido entre os N projéteis.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Explosao de Mana | 20 | 1326 | Ver efeito | C = 20 + W + S; B = piso(0,4mₑ); D = 30 + 0,6P + 0,12M + 3,5B + F | Explosao de Mana: consome 1326 MP e causa 3706 de dano. |
| Descarregar | 30 | 1256 | Ver efeito | C = 30Q + S; D = (L + 0,0065M) × Q + F | Descarregar: consome 1256 MP, gasta todas as cargas arcanas e causa 2512 de dano. |
| Escudo de Mana | 50 | 2009 | Duração: 2 turno(s) | C = 0,12M + S; escudo = 40 + 0,4M | Escudo de Mana: consome 2009 MP e concede 2552 de escudo por 2 turnos. |
| Concentracao | 60 | 1456 | Duração: 4 turno(s) | C = 200 + S; dano final × 1,3; regeneração de mana +10% | Concentracao: consome 1456 MP, aumenta o dano total em 30% e a regeneracao de mana em 10% por 4 turnos. |
| Sobrecarregar | 80 | 5966 | Ver efeito | C = 0,75M + S; D = 200 + M + LQ + F | Sobrecarregar: consome 5966 MP e causa 8992 de dano usando sua mana maxima e as cargas arcanas. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Ultimo Recurso | 10 | Se o golpe for fatal e m ≥ 2Vᵣ: custo em mana = 2Vᵣ; dano à vida = 0 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Transbordando | 40 | F = piso(0,4M); S = piso(0,2M) | Transbordando: concede 2512 de dano adicional em ataques e habilidades e aumenta os custos das habilidades em 1256. |
| Carregar | 70 | Dano total adicional = 5% × Q | Carregar: cada carga arcana aumenta o dano total em 5%. Atualmente: 0%. |

## Corrompido — nível 100

Classe: **Mago**. Rota: arcanista → corrompido. Vida máxima: 6350; mana máxima: 5780; ataque: 709.

**Misseis Magicos:** Missel Magico: bonus fixo de 1445 por acao, dividido entre os projeteis.  consome 39 MP, dispara 13 misseis e cada um causa entre 146 e 290 de dano. Cada missel tem 15% de chance de gerar 1 Carga Arcana, que dura 3 turnos a partir da primeira carga.

**Fórmula do ataque básico:** N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A; F é dividido entre os N projéteis.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Explosao de Mana | 20 | 705 | Ver efeito | C = 20 + W + S; B = piso(0,4mₑ); D = 30 + 0,6P + 0,12M + 3,5B + F | Explosao de Mana: consome 705 MP e causa 2588 de dano. |
| Descarregar | 30 | 635 | Ver efeito | C = 30Q + S; D = 60 + LQ + 0,3P + 0,045M + F | Descarregar: consome 635 MP, gasta todas as cargas arcanas e causa 1975 de dano. |
| Escudo de Mana | 50 | 1502 | Duração: 2 turno(s) | C = 0,15M + S; escudo = 40 + 0,3M | Escudo de Mana: consome 1502 MP e concede 1774 de escudo por 2 turnos. |
| Corrupcao | 60 | 1734 | Armadura removida: 5 turno(s); Sem escudo: 5 turno(s) | C = 0,3M; D = 100 + 1,15P + 0,22M + F; armadura do alvo = 0 | Corrupcao: consome 1734 MP, causa 3620 de dano, remove toda a armadura do inimigo e impede escudos por 5 turnos. |
| Incorporar Demonio | 80 | 1734 | Duração: 3 turno(s) | C = 0,3M; dano final × 3; dano recebido × 1,4 | Incorporar Demonio: consome 1734 MP, concede 200% de dano total adicional por 3 turnos e faz voce receber 40% de dano adicional pelo mesmo tempo. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Ultimo Recurso | 10 | Se o golpe for fatal e m ≥ 2Vᵣ: custo em mana = 2Vᵣ; dano à vida = 0 | Ultimo Recurso: se um golpe fatal acertaria voce e sua mana atual for pelo menos o dobro desse dano, voce gasta o dobro em mana para anular o golpe. |
| Transbordando | 40 | F = piso(0,25M); S = piso(0,11M); escudo adicional = dano perdido na vida ou impedido por Último Recurso | Transbordando: concede 1445 de dano adicional em ataques e habilidades e aumenta os custos das habilidades em 635. Tambem converte dano perdido na vida, ou impedido por Ultimo Recurso, em escudo. |
| Canhao de Vidro | 70 | Primeiro golpe recebido × 2; duas primeiras ações de dano × 1,5 | Canhao de Vidro: sofre o dobro de dano no primeiro golpe inimigo que acertar; suas duas primeiras acoes que causarem dano recebem +50% de dano. Buffs, DOTs e projeteis extras nao gastam acoes adicionais. |

## Arqueiro — nível 20

Classe: **Arqueiro**. Rota: base. Vida máxima: 376; mana máxima: 320; ataque: 72.

**Atacar:** Ataque basico. Dano entre 72 e 77. Chance de acerto: 84%.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Mirar | 1 | 50 | Duração: 5 turno(s) | C = 30 + L; A adicional = 5 + L; P adicional = 5 + L | Mirar: consome 50 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 25. |
| Camuflagem | 20 | 50 | Duração: 5 turno(s) | C = 40 + W; esquiva adicional = 20% | Camuflagem: consome 50 MP e concede 20% de esquiva adicional por 5 turnos. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Passos Leves | 10 | Esquiva = 5% + (0,5% × L) | Passos Leves: concede 15% de chance do inimigo errar o ataque contra voce. |

## Atirador — nível 50

Classe: **Arqueiro**. Rota: atirador. Vida máxima: 1700; mana máxima: 1490; ataque: 280.

**Atacar:** Ataque basico. Dano entre 280 e 285. Chance de acerto: 84%.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Mirar | 1 | 80 | Duração: 5 turno(s) | C = 30 + L; A adicional = 5 + L; P adicional = 5 + L | Mirar: consome 80 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 55, alem de fortalecer o Headshot em 10% e dar +10% de chance de critico. |
| Camuflagem | 20 | 65 | Duração: 5 turno(s) | C = 40 + W; esquiva adicional = 20%; próximo dano × 1,3 | Camuflagem: consome 65 MP e concede 20% de esquiva adicional por 5 turnos, deixando o proximo dano causado 30% mais forte. |
| Headshot | 30 | 85 | Ver efeito | C = 60 + W; D = 30 + 0,65A + 0,65P; com Mirar, D × 1,1 | Headshot: consome 85 MP e causa 383 de dano, com 15% de chance total de critico. |
| Tiro Perfurante | 50 | 105 | Ver efeito | C = 80 + W; D = 50 + 0,8A + 0,8P | Tiro Perfurante: consome 105 MP e causa 485 de dano, ignorando armadura e escudo do inimigo. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Passos Leves | 10 | Esquiva = 5% + (0,5% × L); crítico adicional = 5% | Passos Leves: concede 30% de chance do inimigo errar o ataque contra voce e 5% de chance de critico em qualquer ataque ou habilidade. |
| Pulso Firme | 40 | A adicional = piso(0,9L); P adicional = piso(0,9L) | Pulso Firme: concede 45 de dano de ataque basico e 45 de dano de habilidade no nivel atual. |

## Atirador Arcano — nível 100

Classe: **Arqueiro**. Rota: atirador → atirador_arcano. Vida máxima: 6370; mana máxima: 5810; ataque: 781.

**Atacar:** Ataque basico. Dano entre 781 e 786. Chance de acerto: 84%.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Mirar | 1 | 130 | Duração: 5 turno(s) | C = 30 + L; A adicional = 5 + L; P adicional = 5 + L | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 105, alem de fortalecer o Headshot em 10% e dar +10% de chance de critico. |
| Camuflagem | 20 | 90 | Duração: 5 turno(s) | C = 40 + W; esquiva adicional = 20%; próximo dano × 1,3 | Camuflagem: consome 90 MP e concede 20% de esquiva adicional por 5 turnos, deixando o proximo dano causado 30% mais forte. |
| Headshot | 30 | 110 | Ver efeito | C = 60 + W; D = 60 + 0,4A + 0,85P + 0,35M; com Mirar, D × 1,1 | Headshot: consome 110 MP e causa 3378 de dano, com 15% de chance total de critico. Se nao critar, marca o alvo para receber 15% a mais no proximo golpe. |
| Tiro Perfurante | 50 | 130 | Ver efeito | C = 80 + W; D = 50 + 0,8A + 1,2P | Tiro Perfurante: consome 130 MP e causa 2048 de dano, ignorando armadura e escudo do inimigo. |
| Emergencia Arcana | 60 | 500 | Ver efeito | C = 500; D = 60 + P + 0,75(M − m) | Emergencia Arcana: consome 500 MP e causa 1205 de dano arcano. O dano aumenta conforme sua mana atual estiver abaixo da mana maxima. |
| Sobreaquecer | 80 | 5810 | Ver efeito | C = m; D = 80 + 1,6P + 0,6m | Sobreaquecer: gasta toda a mana atual (5810) e causa 5398 de dano. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Passos Leves | 10 | Esquiva = 5% + (0,5% × L); crítico adicional = 5% | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e 5% de chance de critico em qualquer ataque ou habilidade. |
| Pulso Firme | 40 | A adicional = piso(0,9L); P adicional = piso(1,3L) | Pulso Firme: concede 90 de dano de ataque basico e 130 de dano de habilidade no nivel atual. |
| Cristalizar Mana | 70 | P adicional = piso(0,05M) | Cristalizar Mana: converte 290 de mana maxima em dano de habilidade. |

## Sniper — nível 100

Classe: **Arqueiro**. Rota: atirador → sniper. Vida máxima: 6370; mana máxima: 5410; ataque: 851.

**Atacar:** Ataque basico. Dano entre 851 e 856. Chance de acerto: 84%.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Mirar | 1 | 130 | Duração: 5 turno(s) | C = 30 + L; A adicional = 5 + L; P adicional = 5 + L | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 105, alem de fortalecer o Headshot em 10% e dar +10% de chance de critico. |
| Camuflagem | 20 | 90 | Duração: 5 turno(s) | C = 40 + W; esquiva adicional = 20%; próximo dano × 1,3 | Camuflagem: consome 90 MP e concede 20% de esquiva adicional por 5 turnos, deixando o proximo dano causado 30% mais forte. |
| Headshot | 30 | 110 | Ver efeito | C = 60 + W; D = 30 + 0,85A + 0,65P; com Mirar, D × 1,1 | Headshot: consome 110 MP e causa 1250 de dano, com 104% de chance total de critico. O excedente acima de 100% de chance de critico vira dano critico adicional, deixando o critico em 104% de dano extra. |
| Tiro Perfurante | 50 | 130 | Ver efeito | C = 80 + W; D = 50 + 1,2A + 0,8P | Tiro Perfurante: consome 130 MP e causa 1683 de dano, ignorando armadura e escudo do inimigo. Alem disso, remove totalmente o escudo do alvo. |
| Executar | 60 | 120 | Ver efeito | C = 120; D = 60 + 1,1A + 0,9P; D × 3 se h < 0,4E | Executar: consome 120 MP e causa 1684 de dano. Se o inimigo estiver abaixo de 40% da vida, o dano e triplicado. |
| Ponto Fraco | 80 | 120 | Ver efeito | C = 120; D = 100 + 0,65A + 0,4P + 0,25h | Ponto Fraco: consome 120 MP e causa 5959 de dano, explorando a vida atual do alvo. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Passos Leves | 10 | Esquiva = 5% + (0,5% × L); crítico adicional = 5% | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e 5% de chance de critico em qualquer ataque ou habilidade. |
| Pulso Firme | 40 | A adicional = piso(0,9L); P adicional = piso(0,9L) | Pulso Firme: concede 90 de dano de ataque basico e 90 de dano de habilidade no nivel atual. Alem disso, seus ataques e habilidades ganham 15% de chance adicional de critico. |
| Olhos de Falcao | 70 | Olhos de Falcao: concede 15% de chance de critico e faz qualquer excedente acima de 100% virar dano critico adicional. | Olhos de Falcao: concede 15% de chance de critico e faz qualquer excedente acima de 100% virar dano critico adicional. |

## Cacador — nível 50

Classe: **Arqueiro**. Rota: cacador. Vida máxima: 1800; mana máxima: 1440; ataque: 240.

**Atacar:** Ataque basico. Dano entre 240 e 245. Chance de acerto: 84%.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Mirar | 1 | 80 | Duração: 5 turno(s) | C = 30 + L; A adicional = 5 + L; P adicional = 5 + L | Mirar: consome 80 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 55, alem de conceder 10% de chance de um disparo extra na Rajada de Flechas. |
| Camuflagem | 20 | 65 | Duração: 5 turno(s) | C = 40 + W; esquiva adicional = 28% | Camuflagem: consome 65 MP e concede 28% de esquiva adicional por 5 turnos. |
| Rajada de Flechas | 30 | 60 | Ver efeito | C = 60; 2 ataques básicos, cada um com A + r; com Mirar, 10% de chance de 1 disparo extra | Rajada de Flechas: consome 60 MP e realiza 2 ataques basicos no mesmo turno. |
| Armadilha | 50 | 105 | Ver efeito | C = 80 + W; D = 30 + 1,1P | Armadilha: consome 105 MP, causa 254 de dano e tem 30% de chance de fazer o inimigo perder o proximo turno. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Passos Leves | 10 | Esquiva = 5% + (0,5% × L); moedas × 1,18; XP × 1,12 | Passos Leves: concede 30% de chance do inimigo errar o ataque contra voce e aumenta em 18% as moedas e em 12% a XP recebidas dos inimigos. |
| Errou | 40 | Dano final × 1,12 por 2 turnos após esquivar | Errou: ao esquivar de um ataque, voce ganha 12% de dano total final por 2 turnos. |

## Espreitador — nível 100

Classe: **Arqueiro**. Rota: cacador → espreitador. Vida máxima: 6470; mana máxima: 5460; ataque: 726.

**Atacar:** Ataque basico. Dano entre 726 e 731. Chance de acerto: 84%.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Mirar | 1 | 130 | Duração: 5 turno(s) | C = 30 + L; A adicional = 5 + L; P adicional = 5 + L | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 105, alem de conceder 10% de chance de um disparo extra na Rajada de Flechas. |
| Camuflagem | 20 | 90 | Duração: 5 turno(s) | C = 40 + W; esquiva adicional = 28% | Camuflagem: consome 90 MP e concede 28% de esquiva adicional por 5 turnos. |
| Rajada de Flechas | 30 | 60 | Ver efeito | C = 60; 2 ataques básicos, cada um com A + r; com Mirar, 10% de chance de 1 disparo extra | Rajada de Flechas: consome 60 MP e realiza 2 ataques basicos no mesmo turno. Errar um disparo fortalece o proximo dano em 16%; errar dois ou mais fortalece em 40%. |
| Armadilha | 50 | 130 | Ver efeito | C = 80 + W; D = 30 + 1,1P + 0,06h | Armadilha: consome 130 MP, causa 1972 de dano e tem 30% de chance de fazer o inimigo perder o proximo turno. O dano inclui 6% da vida atual do inimigo. |
| Surpresa | 60 | 80 | Ver efeito | C = 80; D = 60 + 0,9A + 0,7P; logo após Camuflagem: D = 80 + 1,2A + 0,9P | Surpresa: consome 80 MP e causa 1185 de dano. |
| Mirar no Pe | 80 | 100 | Ataque reduzido: 3 turno(s); Armadura reduzida: 3 turno(s) | C = 100; D = 80 + 0,6P + 0,5A; ataque inimigo × 0,8; armadura inimiga × 0,5 | Mirar no Pe: consome 100 MP, causa 848 de dano, reduz em 20% o ataque, corta 50% da armadura e concede 10% de chance de impedir o ataque em cada um dos 3 turnos do debuff. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Passos Leves | 10 | Esquiva = 5% + (0,5% × L); moedas × 1,18; XP × 1,12 | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e aumenta em 18% as moedas e em 12% a XP recebidas dos inimigos. |
| Errou | 40 | Próximo dano após esquivar × 1,5 | Errou: ao esquivar de um ataque, seu proximo dano causado fica 50% mais forte. |
| Passos Silenciosos | 70 | Passos Silenciosos: concede 7% de chance do inimigo perder o turno sem atacar. | Passos Silenciosos: concede 7% de chance do inimigo perder o turno sem atacar. |

## Guarda Florestal — nível 100

Classe: **Arqueiro**. Rota: cacador → guarda_florestal. Vida máxima: 6970; mana máxima: 5360; ataque: 721.

**Atacar:** Ataque basico. Dano entre 721 e 726. Chance de acerto: 84%.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Mirar | 1 | 130 | Duração: 5 turno(s) | C = 30 + L; A adicional = 5 + L; P adicional = 5 + L | Mirar: consome 130 MP, garante 100% de acerto no ataque basico por 5 turnos e aumenta ataque e poder de habilidade em 105, alem de conceder 10% de chance de um disparo extra na Rajada de Flechas. |
| Camuflagem | 20 | 90 | Duração: 5 turno(s) | C = 40 + W; esquiva adicional = 28% | Camuflagem: consome 90 MP e concede 28% de esquiva adicional por 5 turnos. |
| Rajada de Flechas | 30 | 60 | Ver efeito | C = 60; 3 ataques básicos, cada um com A + r; com Mirar, 10% de chance de 1 disparo extra | Rajada de Flechas: consome 60 MP e realiza 3 ataques basicos no mesmo turno. |
| Armadilha | 50 | 130 | Ver efeito | C = 80 + W; D = 30 + 1,1P | Armadilha: consome 130 MP, causa 756 de dano e tem 30% de chance de fazer o inimigo perder o proximo turno. Se prender o alvo, sua proxima Rajada de Flechas causara 23% de dano adicional por disparo. |
| Tranquilizante | 60 | 80 | Ataque reduzido: 4 turno(s) | C = 80; D = 60 + 0,8A + 0,6P; dano inimigo × 0,7 | Tranquilizante: consome 80 MP, causa 1032 de dano e reduz em 30% o dano do inimigo por 4 turnos. |
| Tiro Cortante | 80 | 80 | DOT: 3 turno(s) | C = 80; T = 120 + 1,2A + 1,2P; DOT por turno = piso(T ÷ 3), durante 3 turnos | Tiro Cortante: consome 80 MP e faz o alvo sofrer 592 de dano por rodada durante 3 rodadas (1776 no total). |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Passos Leves | 10 | Esquiva = 5% + (0,5% × L); moedas × 1,18; XP × 1,12 | Passos Leves: concede 55% de chance do inimigo errar o ataque contra voce e aumenta em 18% as moedas e em 12% a XP recebidas dos inimigos. |
| Errou | 40 | Cura ao esquivar = piso(0,13H) | Errou: ao esquivar de um ataque, voce recupera 906 de vida. |
| Resistencia Florestal | 70 | Redução fixa = piso(0,46L) | Resistencia Florestal: reduz 46 de dano por ataque recebido. |

## Adepto da Natureza — nível 20

Classe: **Adepto da Natureza**. Rota: base. Vida máxima: 376; mana máxima: 340; ataque: 68.

**Atacar:** Ataque basico. Dano entre 68 e 73.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Semente Viva | 1 | 30 | Marca: 3 turno(s) | C = 20 + 0,5L; D = 10 + 0,7A + 0,3P | Semente Viva: consome 30 MP, causa 73 de dano e marca o alvo por 3 turnos. |
| Raizes | 20 | 42 | Ver efeito | C = 30 + 0,6L; D = 20 + 0,8A + 0,8P | Raizes: consome 42 MP, causa 118 de dano e tem 45% de chance de enraizar. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Ciclo Natural | 10 | Dano contra marcado × 1,10; devolução de mana = 0,1C | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |

## Druida — nível 50

Classe: **Adepto da Natureza**. Rota: druida. Vida máxima: 1800; mana máxima: 1460; ataque: 226.

**Atacar:** Ataque basico. Dano entre 226 e 231.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Semente Viva | 1 | 45 | Marca: 4 turno(s) | C = 20 + 0,5L; D = 10 + 0,7A + 0,3P; marca = 0,2P × 4 por turno | Semente Viva: consome 45 MP, causa 230 de dano e marca o alvo por 4 turnos. A marca tambem causa 167 por turno. |
| Raizes | 20 | 60 | Ver efeito | C = 30 + 0,6L; D = 20 + 0,8A + 0,8P | Raizes: consome 60 MP, causa 367 de dano e tem 60% de chance de enraizar. |
| Flor do Pantano | 30 | 40 | Veneno: 4 turno(s) | C = 20 + 0,4L; D = 10 + 0,8A + 0,8P; veneno = 0,4P por turno | Flor do Pantano: consome 40 MP e causa 357 de dano. Se o alvo estiver enraizado, aplica veneno de 83 por 4 turnos. |
| Colheita | 50 | 55 | Ver efeito | C = 40 + 0,3L; D = 30 + 1,2A + 0,3P × turnos restantes da marca; o adicional recebe os bônus de DOTs naturais | Colheita: consome 55 MP, causa 301 de dano e consome efeitos naturais ativos para explodir o dano restante. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Ciclo Natural | 10 | Dano contra marcado × 1,16; devolução de mana = 0,1C | Ciclo Natural: alvos marcados recebem 16% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |
| Seiva | 40 | Cura = 0,08 × dano dos DOTs elegíveis | Seiva: dano de marca e veneno cura 8% do dano causado. |

## Druida Sombrio — nível 100

Classe: **Adepto da Natureza**. Rota: druida → druida_sombrio. Vida máxima: 6470; mana máxima: 5580; ataque: 702.

**Atacar:** Ataque basico. Dano entre 702 e 707.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Semente Viva | 1 | 70 | Marca: 4 turno(s) | C = 20 + 0,5L; D = 10 + 0,7A + 0,3P; marca = 0,2P × 4 por turno | Semente Viva: consome 70 MP, causa 709 de dano e marca o alvo por 4 turnos. A marca tambem causa 556 por turno. |
| Raizes | 20 | 90 | Ver efeito | C = 30 + 0,6L; D = 20 + 0,8A + 0,8P | Raizes: consome 90 MP, causa 1137 de dano e tem 60% de chance de enraizar. |
| Flor do Pantano | 30 | 60 | Veneno: 7 turno(s) | C = 20 + 0,4L; D = 10 + 0,8A + 0,8P; veneno = 0,4P por turno | Flor do Pantano: consome 60 MP e causa 1127 de dano. Se o alvo estiver enraizado, aplica veneno de 278 por 7 turnos. |
| Colheita | 50 | 70 | Ver efeito | C = 40 + 0,3L; D = 30 + 1,2A + dano restante de marca, venenos e apodrecimento, com os bônus de DOTs naturais | Colheita: consome 70 MP, causa 872 de dano e consome efeitos naturais ativos para explodir o dano restante. |
| Apodrecer | 60 | 90 | Apodrecimento: 5 turno(s) | C = 40 + 0,5L; D = 50 + 1,2A; apodrecimento = máximo(1; piso(0,015E)) por turno | Apodrecer: consome 90 MP, causa 892 de dano e aplica apodrecimento por 5 turnos. |
| Colapso do Brejo | 80 | 4743 | Ver efeito | C = 0,85M; D = piso(1,8A + 1,8P) | Colapso do Brejo: consome 4743 MP e causa 2514 de dano. Se o alvo nao tiver DOT natural, aplica marca, veneno e apodrecimento por 4 turnos. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Ciclo Natural | 10 | Dano contra marcado × 1,16; devolução de mana = 0,1C | Ciclo Natural: alvos marcados recebem 16% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |
| Seiva | 40 | Cura = 0,08 × dano dos DOTs elegíveis | Seiva: dano de marca e veneno cura 8% do dano causado. Tambem considera apodrecimento. |
| Podridao | 70 | Dano dos DOTs naturais × 1,3 | Podridao: aumenta marca, veneno e apodrecimento em 30%. |

## Avatar da Natureza — nível 100

Classe: **Adepto da Natureza**. Rota: druida → avatar_da_natureza. Vida máxima: 7634; mana máxima: 5380; ataque: 702.

**Atacar:** Ataque basico. Dano entre 702 e 707.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Semente Viva | 1 | 70 | Marca: 4 turno(s) | C = 20 + 0,5L; D = 10 + 0,7A + 0,3P; marca = 0,2P × 4 por turno | Semente Viva: consome 70 MP, causa 705 de dano e marca o alvo por 4 turnos. A marca tambem causa 544 por turno. |
| Raizes | 20 | 90 | Ver efeito | C = 30 + 0,6L; D = 20 + 0,8A + 0,8P | Raizes: consome 90 MP, causa 1125 de dano e tem 60% de chance de enraizar. |
| Flor do Pantano | 30 | 60 | Veneno: 3 turno(s) | C = 20 + 0,4L; D = 10 + 1,3A + 0,8P; veneno = 0,4P por turno | Flor do Pantano: consome 60 MP e causa 1466 de dano. Se o alvo estiver enraizado, aplica veneno de 272 por 3 turnos. |
| Colheita | 50 | 70 | Ver efeito | C = 40 + 0,3L; D = 30 + 1,2A + 0,3P × turnos restantes da marca; o adicional recebe os bônus de DOTs naturais | Colheita: consome 70 MP, causa 872 de dano e consome efeitos naturais ativos para explodir o dano restante. |
| Forma Verdadeira | 60 | 5380 | Duração: 5 turno(s) | C = M; A × 1,26; dano recebido × 0,82; ataque básico usa 1,7A + r | Forma Verdadeira: consome toda a mana maxima, aumenta ataque em 26%, reduz dano sofrido em 18% e fortalece ataques basicos por 5 turnos. |
| Esmagar Invasor | 80 | 380 | Ver efeito | C = 300 + 0,8L; D = 2A; +0,6A se o alvo estiver enraizado; +A durante Forma Verdadeira | Esmagar Invasor: consome 380 MP e causa 1404 de dano, com bonus contra alvo enraizado e na Forma Verdadeira. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Ciclo Natural | 10 | Dano contra marcado × 1,16; devolução de mana = 0,1C | Ciclo Natural: alvos marcados recebem 16% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. |
| Seiva | 40 | Cura = 0,08 × dano dos DOTs elegíveis; vida máxima +12% | Seiva: dano de marca e veneno cura 8% do dano causado. Tambem aumenta sua vida maxima em 12%. |
| Casca Ancestral | 70 | Redução fixa = piso(4 + 0,5L); durante Forma Verdadeira = piso(4 + 0,7L) | Casca Ancestral: reduz 54 de dano recebido por ataque. |

## Espirito da Floresta — nível 50

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta. Vida máxima: 1700; mana máxima: 1560; ataque: 221.

**Atacar:** Ataque basico. Dano entre 221 e 226.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Semente Viva | 1 | 45 | Marca: 3 turno(s) | C = 20 + 0,5L; D = 10 + 0,7A + 0,3P; dano inimigo −24% | Semente Viva: consome 45 MP, causa 249 de dano e marca o alvo por 3 turnos. A marca reduz o dano do inimigo em 24%. |
| Raizes | 20 | 60 | Ver efeito | C = 30 + 0,6L; D = 20 + 0,8A + 0,8P | Raizes: consome 60 MP, causa 424 de dano e tem 45% de chance de enraizar. Se enraizar, tambem reduz 50% da armadura. |
| Encanto da Brisa | 30 | 45 | Ver efeito | C = 30 + 0,3L; D = 20 + 1,1P | Encanto da Brisa: consome 45 MP, causa 333 de dano e tem 20% de chance de pular o turno do inimigo. Se o alvo estiver marcado, pode enraizar. |
| Cancao Ancestral | 50 | 60 | Ver efeito | C = 40 + 0,4L; cura = 1,4P, ou 2P contra alvo enraizado | Cancao Ancestral: consome 60 MP e cura 399. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Ciclo Natural | 10 | Dano contra marcado × 1,10; devolução de mana = 0,1C; P adicional = 0,3A | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. Tambem converte 30% do ataque basico em poder de habilidade. |
| Aura Feerica | 40 | P adicional por Cadência = 4%; até 3 Cadências; com 3: curas × 1,05 | Aura Feerica: curar ou ganhar escudo concede Cadencia. Cada acumulo da 4% de poder de habilidade, ate 3. Com 3 acumulos, curas aumentam 5%. |

## Fada Monarca — nível 100

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta → fada_monarca. Vida máxima: 6370; mana máxima: 5880; ataque: 677.

**Atacar:** Ataque basico. Dano entre 677 e 682.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Semente Viva | 1 | 70 | Marca: 3 turno(s) | C = 20 + 0,5L; D = 10 + 0,7A + 0,3P; dano inimigo −24% | Semente Viva: consome 70 MP, causa 756 de dano e marca o alvo por 3 turnos. A marca reduz o dano do inimigo em 24%. |
| Raizes | 20 | 90 | Ver efeito | C = 30 + 0,6L; D = 20 + 0,8A + 0,8P | Raizes: consome 90 MP, causa 1291 de dano e tem 45% de chance de enraizar. Se enraizar, tambem reduz 50% da armadura. |
| Encanto da Brisa | 30 | 60 | Ver efeito | C = 30 + 0,3L; D = 20 + 1,1P | Encanto da Brisa: consome 60 MP, causa 1024 de dano e tem 30% de chance de pular o turno do inimigo. Se o alvo estiver marcado, pode enraizar. |
| Cancao Ancestral | 50 | 80 | Ver efeito | C = 40 + 0,4L; cura = 1,4P, ou 2P contra alvo enraizado | Cancao Ancestral: consome 80 MP e cura 1278. |
| Decreto da Rainha | 60 | 90 | Ver efeito | C = 90; D = 2P; com 3 Cadências: D = 2,9P | Decreto da Rainha: consome 90 MP e causa 1826 de dano. Com 3 Cadencias, o fator sobe para 2.9. |
| Coroar | 80 | 500 | Duração: 5 turno(s) | C = 300 + 2L; P × 1,3; curas × 1,2; chances de controle +20 pontos percentuais | Coroar: consome 500 MP e fica coroada por 5 turnos, com +30% poder de habilidade, +20% curas e +20% nas chances de controle. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Ciclo Natural | 10 | Dano contra marcado × 1,10; devolução de mana = 0,1C; P adicional = 0,3A | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. Tambem converte 30% do ataque basico em poder de habilidade. |
| Aura Feerica | 40 | P adicional por Cadência = 6%; até 3 Cadências; com 3: curas × 1,10 | Aura Feerica: curar ou ganhar escudo concede Cadencia. Cada acumulo da 6% de poder de habilidade, ate 3. Com 3 acumulos, curas aumentam 10%. |
| Asas da Realeza | 70 | Esquiva = 20%; enquanto coroada = 60% | Asas da Realeza: concede 20% de chance de esquiva. |

## Protetor da Floresta — nível 100

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta → protetor_da_floresta. Vida máxima: 6770; mana máxima: 5480; ataque: 692.

**Atacar:** Ataque basico. Dano entre 692 e 697.

**Fórmula do ataque básico:** Dano básico = A + r; na Forma Verdadeira, o Adepto usa 1,7A + r.

| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Fórmula matemática | Efeito atual |
| --- | ---: | ---: | --- | --- | --- |
| Semente Viva | 1 | 70 | Marca: 3 turno(s) | C = 20 + 0,5L; D = 10 + 0,7A + 0,3P; dano inimigo −24% | Semente Viva: consome 70 MP, causa 764 de dano e marca o alvo por 3 turnos. A marca reduz o dano do inimigo em 24%. |
| Raizes | 20 | 90 | Ver efeito | C = 30 + 0,6L; D = 20 + 0,8A + 0,8P | Raizes: consome 90 MP, causa 1294 de dano e tem 45% de chance de enraizar. Se enraizar, tambem reduz 50% da armadura. |
| Encanto da Brisa | 30 | 60 | Ver efeito | C = 30 + 0,3L; D = 20 + 1,1P | Encanto da Brisa: consome 60 MP, causa 1012 de dano e tem 20% de chance de pular o turno do inimigo. Se o alvo estiver marcado, pode enraizar. |
| Cancao Ancestral | 50 | 80 | Ver efeito | C = 40 + 0,4L; cura = 1,4P, ou 2P contra alvo enraizado; escudo = 1,6P, ou 2,2P contra alvo enraizado | Cancao Ancestral: consome 80 MP e cura 1262. Tambem concede 1443 de escudo. |
| Casulo de Vinhas | 60 | 120 | Ver efeito | C = 60 + 0,6L; escudo = piso(1,4A + 1,4P) | Casulo de Vinhas: consome 120 MP e concede 2231 de escudo. |
| Jogar Espinhos | 80 | 400 + 20% da vida máxima | Ver efeito | C = 4L MP + 0,2H de vida + todo Z; D = 2Z | Jogar Espinhos: consome 400 MP, 20% da vida maxima e todo seu escudo atual para causar 0 de dano ignorando armadura e escudo. |

| Passiva | Desbloqueio | Fórmula / regra | Efeito atual |
| --- | ---: | --- | --- |
| Ciclo Natural | 10 | Dano contra marcado × 1,10; devolução de mana = 0,1C; P adicional = 0,3A | Ciclo Natural: alvos marcados recebem 10% a mais de dano e devolvem 10% do custo da habilidade usada contra eles. Tambem converte 30% do ataque basico em poder de habilidade. |
| Aura Feerica | 40 | P adicional por Cadência = 4%; até 3 Cadências; com 3: curas × 1,05 | Aura Feerica: curar ou ganhar escudo concede Cadencia. Cada acumulo da 4% de poder de habilidade, ate 3. Com 3 acumulos, curas aumentam 5%. |
| Juramento do Bosque | 70 | Escudos × 1,06; reflexão = 0,3 × dano absorvido pelo escudo | Juramento do Bosque: aumenta escudos em 6% e reflete 30% do dano absorvido enquanto houver escudo. |


# Referência atual de habilidades

Catálogo gerado a partir do código executável atual em 04/11/2026. Não utiliza o documento antigo de balanceamento.

São 28 formas de classe/subclasse e 59 nomes distintos de habilidades ativas. Habilidades herdadas aparecem em cada rota em que estão disponíveis.

Relatório geral: nenhuma vida, mana, ataque ou nível de herói é fixado nas fórmulas. L permanece uma incógnita. Os níveis indicados nas tabelas são somente requisitos de desbloqueio; cada regra vale após desbloquear a habilidade e escolher a classe correspondente.

Cada classe tem sua fórmula própria. Custos, dano, cura e escudo são expressões matemáticas; condições de combate aparecem em linguagem natural. Não há colunas com resultados numéricos de uma build de exemplo.

Legenda: D = dano calculado pela habilidade; C = custo em mana (MP); L = nível do herói; A = ataque ativo; P = poder de habilidade ativo; H = vida máxima do herói; M = mana máxima do herói; m = mana atual do herói antes do custo; h = vida atual do inimigo; E = vida máxima do inimigo; mₑ = mana atual do inimigo; Q = cargas arcanas; Z = escudo atual do herói; X = dano acumulado que Escudo de Fé impediu; V = vida efetivamente retirada do inimigo; Vᵣ = dano recebido pelo herói após suas defesas; Dₑ = dano do golpe após as defesas; r = sorteio inteiro de 0 a 5; T = dano periódico total antes do rateio.

W = piso(0,5L). F = dano fixo adicional de Transbordando; S = acréscimo de custo de Transbordando. Para Arcanista e Corrompido: F = piso(0,25M) e S = piso(0,11M). Para Arquimago: F = piso(0,4M) e S = piso(0,2M). Sem a passiva desbloqueada, F = S = 0.

Como ler: 0,06H significa 6% da vida máxima; 0,8A significa 80% do ataque. Exemplo: na linha do Espadachim, Investida tem D = 20 + 0,06H + 0,8A + 0,8P e C = 50 + W. As variações de classe já estão resolvidas em cada tabela. Piso significa arredondar para baixo. Nas somas, cada parcela fracionária é arredondada separadamente, exceto quando piso envolve a soma inteira. O custo final do Mago é limitado à sua mana máxima. As fórmulas representam a base: buffs, crítico, conjuntos, mitigação e demais efeitos descritos podem modificar o resultado.

Condições gerais: esquiva impede novos efeitos ligados ao golpe evitado, mas não remove DOTs já ativos. Queimaduras, venenos e sangramentos acumulam com dano e prazo próprios. Canhão de Vidro conta duas ações de dano, não dois projéteis ou turnos; seu primeiro golpe recebido é um contador separado. Nevasca aplica seis turnos completos de resfriamento; aplicar resfriamento ativa Gelo Queima. Custos do Mago mantêm o teto de mana máxima. Investida e Você Irá Me Parar? podem romper perda de turno; Cortes Ultrassônicos exige uma ação de intervalo após terminar.

Revisão de 04/11/2026: Mago e subclasses rebalanceados; Canhão de Vidro usa dois contadores de eventos, resfriamento ativa Gelo Queima e rastreio usa (50 + 4 × nível²) × raridade. Detalhes: docs/balanceamento/mago_2026-11-04.md.

Para regenerar: `node scripts/generate-skill-reference.cjs`. Dados completos: [skills-reference.json](qa/2026-10-28/skills-reference.json).

Revisão de 03/11/2026: fórmulas e custos do Guerreiro e subclasses rebalanceados; esquiva bloqueia novos efeitos hostis; sangramentos acumulam com duração própria; Investida e Você Irá Me Parar? rompem perda de turno; Cortes Ultrassônicos exige intervalo após expirar. Arqueiro e subclasses também rebalanceados; rastreio passa a seis minutos com custo quadrático por nível e raridade. Análise atual: docs/analise_guerreiro_arqueiro_inimigos_2026-11-04.md.

## Guerreiro

Classe: **Guerreiro**. Rota: base.

**Atacar — fórmula:** Dano básico = A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Recuperar Folego | 1 | C = 30 + W; cura = 0,12H | Ver efeito | Cura limitada à vida que falta. |
| Esbarrao | 20 | C = 38 + W; D = 20 + 0,06H + 0,6A + 0,4P | Ver efeito | Dano direto. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Redução fixa = piso(0,6L) |

## Cavaleiro

Classe: **Guerreiro**. Rota: cavaleiro.

**Atacar — fórmula:** Dano básico = A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Recuperar Folego | 1 | C = 30 + W; cura = 0,19H | Ver efeito | Cura limitada à vida que falta. |
| Esbarrao | 20 | C = 44 + W; D = 20 + 0,08H + 0,7A + 0,5P | Ataque reduzido: 3 turno(s) | Reduz o ataque inimigo em 30% por 3 turnos. |
| Contundir | 30 | C = 40 + W; D = 30 + 0,07H + 0,6A + 0,4P | Ver efeito | 30% de chance de impedir a próxima ação inimiga. |
| Brado | 50 | C = 40 + W; dano final × 1,3 | Duração: 5 turno(s) | +30% de dano final. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Redução fixa = piso(0,6L); cura por turno = 0,03H |
| Refletir | 40 | Dano refletido = 0,2Vᵣ, mais o bônus do acessório |

## Paladino

Classe: **Guerreiro**. Rota: cavaleiro → paladino.

**Atacar — fórmula:** Dano básico = A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Recuperar Folego | 1 | C = 30 + W; cura = 0,19H | Ver efeito | Cura limitada à vida que falta. |
| Esbarrao | 20 | C = 44 + W; D = 20 + 0,08H + 0,7A + 0,5P | Ataque reduzido: 3 turno(s) | Reduz o ataque inimigo em 30% por 3 turnos. |
| Contundir | 30 | C = 40 + W; D = 30 + 0,07H + 0,6A + 0,4P | Ver efeito | 45% de chance de impedir a próxima ação inimiga. |
| Brado | 50 | C = 40 + W; dano final × 1,3 | Duração: 5 turno(s) | +30% de dano final e redução de 16% do dano recebido. |
| Julgamento | 60 | C = 100 + 3W; D = 80 + 0,4H + 0,5A + 0,8P | Ver efeito | Dano direto. |
| Escudo de Fe | 80 | C = 0,7M + W; explosão = 0,5X | Duração: 3 turno(s) | Impede dano durante 3 turnos; depois libera metade do dano acumulado. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Redução fixa = piso(0,6L); cura por turno = 0,03H |
| Refletir | 40 | Dano refletido = 0,4Vᵣ, mais o bônus do acessório |
| Aura Divina | 70 | Escudo adicional por turno = piso(0,02H) |

## Berserker

Classe: **Guerreiro**. Rota: cavaleiro → berserker.

**Atacar — fórmula:** Dano básico = A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Recuperar Folego | 1 | C = 30 + W; cura = 0,19H | Ver efeito | Cura limitada à vida que falta. |
| Esbarrao | 20 | C = 44 + W; D = 20 + 0,08H + 0,7A + 0,5P | Ataque reduzido: 3 turno(s) | Reduz o ataque inimigo em 30% por 3 turnos. |
| Contundir | 30 | C = 40 + W; D = 60 + 0,07H + 1,1A + 0,4P | Ver efeito | Dano direto. |
| Ira | 50 | C = W MP + 0,7H de vida; dano final × 2,2; roubo de vida = 0,2V | Duração: 4 turno(s) | Exige vida suficiente para pagar o sacrifício; roubo de vida usa o dano efetivamente perdido pelo alvo. |
| Vallhala | 60 | C = 100 + W; dano recebido × 2,5; adicional por dano causado = 0,15E | Duração: 5 turno(s) | O bônus usa a vida máxima do inimigo; também aumenta o dano recebido. |
| Voce Ira Me Parar? | 80 | C = 100 + W MP + 0,3H de vida; A adicional = 100 | Duração: 4 turno(s) | Pode impedir a perda do turno atual e concede imunidade a esse controle durante o efeito. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Vontade de Ferro | 10 | Redução fixa = piso(0,6L); cura por turno = 0,03H |
| Refletir | 40 | 50% de chance de contra-atacar ao sofrer dano |
| Voce Nao e Digno | 70 | Voce Nao e Digno: uma vez por combate, ao sofrer um golpe fatal, fica com 1 de vida e pode agir mais uma vez antes de morrer. |

## Espadachim

Classe: **Guerreiro**. Rota: espadachim.

**Atacar — fórmula:** Dano básico = A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Recuperar Folego | 1 | C = 30 + W; cura = 0,12H | Duração: 3 turno(s) | +28% de dano final por 3 turnos. |
| Investida | 20 | C = 50 + W; D = 20 + 0,06H + 0,8A + 0,8P | Ver efeito | Pode impedir a perda do turno atual. |
| Golpes Velozes | 30 | C = 44 + W; 2 ataques básicos; cada golpe usa A + r | Ver efeito | Cada golpe aplica sua própria mitigação. |
| Corte Profundo | 50 | C = 52 + W; D = 70 + 1,1A + 0,8P; sangramento por turno = Dₑ × 0,15 ÷ 3 | Sangramento: 3 turno(s) | Sangramento por 3 turnos; aplicações acumulam. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar de um ataque, executa um contra-ataque com seu ataque basico. |

## Samurai

Classe: **Guerreiro**. Rota: espadachim → samurai.

**Atacar — fórmula:** Dano básico = A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Recuperar Folego | 1 | C = 30 + W; cura = 0,12H | Duração: 3 turno(s) | +28% de dano final por 3 turnos. |
| Investida | 20 | C = 50 + W; D = 20 + 0,06H + 0,8A + 0,8P | Ver efeito | Pode impedir a perda do turno atual. |
| Golpes Velozes | 30 | C = 44 + W; 2 ataques básicos; cada golpe usa A + r | Ver efeito | Os golpes aplicam sangramentos independentes por 3 turnos. |
| Corte Profundo | 50 | C = 52 + W; D = 70 + 1,1A + 0,8P; sangramento por turno = Dₑ × 0,15 ÷ 3 | Sangramento: 3 turno(s) | Sangramento por 3 turnos; aplicações acumulam. |
| Furar Blindagem | 60 | C = 82 + W; D = 80 + 1,1A + 1,1P; D × 3 se o alvo tiver escudo | Ver efeito | O multiplicador extra exige escudo ativo no alvo. |
| Cortes Ultrasonicos | 80 | C = 240 + 2W; 3 turnos de ataques básicos e esquiva; intervalo de 1 ação para reativar | Duração: 3 turno(s) | Durante 3 turnos só permite ataques básicos; exige uma ação de intervalo antes de reativar. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar, executa um ataque basico de contra-ataque e recupera 30% do dano que o golpe causaria. |
| Mente Limpa | 70 | Segundo golpe inicial = 0,5 × dano do primeiro |

## Ninja

Classe: **Guerreiro**. Rota: espadachim → ninja.

**Atacar — fórmula:** Dano básico = A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Recuperar Folego | 1 | C = 30 + W; cura = 0,12H | Duração: 3 turno(s) | +28% de dano final por 3 turnos. |
| Investida | 20 | C = 50 + W; D = 20 + 0,06H + 0,8A + 0,8P | Ver efeito | Pode impedir a perda do turno atual. |
| Golpes Velozes | 30 | C = 44 + W; 3 ataques básicos; cada golpe usa A + r | Ver efeito | Cada golpe aplica sua própria mitigação. |
| Corte Profundo | 50 | C = 52 + W; D = 70 + 0,9A + 1,1P; sangramento por turno = Dₑ × 0,3 ÷ 3 | Sangramento: 3 turno(s) | Sangramento por 3 turnos; aplicações acumulam. |
| Bomba de Fumaca | 60 | C = 40 + W; próximo dano × 1,3; esquiva garantida no próximo ataque | Duração: 1 turno(s) | Garante a próxima esquiva; fortalece apenas o próximo dano. |
| Mata-Gigantes | 80 | C = 200 + W; D = 0,32h | Ver efeito | Usa a vida atual do alvo no momento da ação. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Veloz | 10 | Veloz: concede 20% de chance do inimigo errar ao atacar voce. |
| Contra-Ataque | 40 | Contra-Ataque: ao desviar, executa um ataque basico de contra-ataque ignorando armadura e escudo. |
| Eliminar | 70 | Dano × 1,5 quando h ≤ 0,5E |

## Mago

Classe: **Mago**. Rota: base.

**Misseis Magicos — fórmula:** N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A; F é dividido entre os N projéteis.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Explosao de Mana | 20 | C = 20 + W + S; B = piso(0,4mₑ); D = 30 + 0,6P + 0,08M + 3,5B + F | Ver efeito | Retira B da mana do alvo e converte esse valor em dano. Se o alvo não tiver mana, B = 0. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Se o golpe for fatal e m ≥ 2Vᵣ: custo em mana = 2Vᵣ; dano à vida = 0 |

## Elementalista

Classe: **Mago**. Rota: elementalista.

**Misseis Magicos — fórmula:** N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A + 0,09P em cada limite; F é dividido entre os N projéteis.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Explosao de Mana | 20 | C = 20 + W + S; B = piso(0,4mₑ); D = 30 + 1,0P + 0,08M + 3,5B + F | Ver efeito | Retira B da mana do alvo e converte esse valor em dano. Se o alvo não tiver mana, B = 0. |
| Bola de Fogo | 30 | C = 40 + W + S; D = 50 + 0,15A + 1,2P + F | Queimadura: 3 turno(s) | Queimadura = 3% de E por turno, durante 3 turnos; cura recebida −30%. |
| Congelar | 50 | C = 40 + W + S; D = 60 + 0,08A + 0,85P + F | Ver efeito | 30% de chance de impedir a próxima ação inimiga. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Se o golpe for fatal e m ≥ 2Vᵣ: custo em mana = 2Vᵣ; dano à vida = 0 |
| Mana e Vida | 40 | Vida adicional = 0,45M |

## Mago Incendiario

Classe: **Mago**. Rota: elementalista → mago_incendiario.

**Misseis Magicos — fórmula:** N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A + 0,09P em cada limite; F é dividido entre os N projéteis.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Explosao de Mana | 20 | C = 20 + W + S; B = piso(0,4mₑ); D = 30 + 1,0P + 0,08M + 3,5B + F | Ver efeito | Retira B da mana do alvo e converte esse valor em dano. Se o alvo não tiver mana, B = 0. |
| Bola de Fogo | 30 | C = 40 + W + S; D = 50 + 0,18A + 1,25P + 0,05h + F | Queimadura: 3 turno(s) | Queimadura = 5% de E após desbloquear Fogo do Inferno; antes disso, 3% de E por turno, durante 3 turnos; cura recebida −30%. |
| Bafo de Fogo | 50 | C = 40 + W + S; D = 60 + 0,08A + 0,9P + F | Queimadura: 6 turno(s) | Bafo de Fogo aplica queimadura por 6 turnos. |
| Fenix Sagrada | 60 | C = 200 + P + S; D = 100 + 0,4A + 1,85P + F | Queimadura: 1 turno(s) | Aplica queimadura por 1 turno e reduz cura recebida em 30%. |
| Explodir | 80 | C = 500 + S MP + 0,5H de vida; D = 200 + 1,3P + 0,5H + 0,5E + F | Ver efeito | Também paga 50% da vida máxima; exige vida suficiente. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Se o golpe for fatal e m ≥ 2Vᵣ: custo em mana = 2Vᵣ; dano à vida = 0 |
| Mana e Vida | 40 | Vida adicional = 0,45M; P adicional = 0,16M |
| Fogo do Inferno | 70 | Queimadura por turno = 0,05E |

## Mago Frigido

Classe: **Mago**. Rota: elementalista → mago_frigido.

**Misseis Magicos — fórmula:** N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A + 0,09P em cada limite; F é dividido entre os N projéteis.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Explosao de Mana | 20 | C = 20 + W + S; B = piso(0,4mₑ); D = 30 + 1,0P + 0,08M + 3,5B + F | Ver efeito | Retira B da mana do alvo e converte esse valor em dano. Se o alvo não tiver mana, B = 0. |
| Bola de Neve | 30 | C = 40 + W + S; D = 50 + 0,18A + 1,25P + F | Queimadura: 3 turno(s); Resfriamento: 3 turno(s) | Resfria: −30% de ataque por 3 turnos. |
| Congelar | 50 | C = 40 + W + S; D = 60 + 0,08A + 0,9P + F | Resfriamento: 2 turno(s) | 30% de chance de impedir o ataque; se falhar, resfria por 2 turnos; se o alvo já estiver resfriado, fortalece o próximo dano recebido em 50%. |
| Nevasca | 60 | C = 120 + W + S; ataque inimigo × 0,7; 15% de chance de impedir a ação por turno | Duração: 6 turno(s); Resfriamento: 6 turno(s) | Durante 6 turnos, −30% de ataque e 15% de chance de impedir cada ação inimiga; resfriar ativa Gelo Queima após seu desbloqueio. |
| Avalanche | 80 | C = 400 + W + S; D = 200 + 1,3P + 0,38h + F | Resfriamento: 4 turno(s) | Usa a vida atual do alvo; aplica resfriamento por 4 turnos. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Se o golpe for fatal e m ≥ 2Vᵣ: custo em mana = 2Vᵣ; dano à vida = 0 |
| Mana e Vida | 40 | Vida adicional = 0,65M |
| Gelo Queima | 70 | Ao resfriar: queimadura = 0,03E por 1 turno |

## Arcanista

Classe: **Mago**. Rota: arcanista.

**Misseis Magicos — fórmula:** N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A; F é dividido entre os N projéteis.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Explosao de Mana | 20 | C = 20 + W + S; B = piso(0,4mₑ); D = 30 + 0,6P + 0,12M + 3,5B + F | Ver efeito | Retira B da mana do alvo e converte esse valor em dano. Se o alvo não tiver mana, B = 0. |
| Descarregar | 30 | C = 30Q + S; D = 60 + LQ + 0,3P + 0,045M + F | Ver efeito | Consome todas as cargas arcanas. |
| Escudo de Mana | 50 | C = 0,15M + S; escudo = 40 + 0,3M | Duração: 2 turno(s) | Escudo por 2 turnos; não pode ser concedido se houver bloqueio de escudos. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Se o golpe for fatal e m ≥ 2Vᵣ: custo em mana = 2Vᵣ; dano à vida = 0 |
| Transbordando | 40 | F = piso(0,25M); S = piso(0,11M) |

## Arquimago

Classe: **Mago**. Rota: arcanista → arquimago.

**Misseis Magicos — fórmula:** N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A; F é dividido entre os N projéteis.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Explosao de Mana | 20 | C = 20 + W + S; B = piso(0,4mₑ); D = 30 + 0,6P + 0,12M + 3,5B + F | Ver efeito | Retira B da mana do alvo e converte esse valor em dano. Se o alvo não tiver mana, B = 0. |
| Descarregar | 30 | C = 30Q + S; D = (L + 0,0065M) × Q + F | Ver efeito | Consome todas as cargas arcanas. |
| Escudo de Mana | 50 | C = 0,12M + S; escudo = 40 + 0,4M | Duração: 2 turno(s) | Escudo por 2 turnos; não pode ser concedido se houver bloqueio de escudos. |
| Concentracao | 60 | C = 200 + S; dano final × 1,3; regeneração de mana +10% | Duração: 4 turno(s) | Aumenta o dano total e a regeneração de mana durante o efeito. |
| Sobrecarregar | 80 | C = 0,75M + S; D = 200 + M + LQ + F | Ver efeito | Consome as cargas arcanas. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Se o golpe for fatal e m ≥ 2Vᵣ: custo em mana = 2Vᵣ; dano à vida = 0 |
| Transbordando | 40 | F = piso(0,4M); S = piso(0,2M) |
| Carregar | 70 | Dano total adicional = 5% × Q |

## Corrompido

Classe: **Mago**. Rota: arcanista → corrompido.

**Misseis Magicos — fórmula:** N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A; F é dividido entre os N projéteis.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Explosao de Mana | 20 | C = 20 + W + S; B = piso(0,4mₑ); D = 30 + 0,6P + 0,12M + 3,5B + F | Ver efeito | Retira B da mana do alvo e converte esse valor em dano. Se o alvo não tiver mana, B = 0. |
| Descarregar | 30 | C = 30Q + S; D = 60 + LQ + 0,3P + 0,045M + F | Ver efeito | Consome todas as cargas arcanas. |
| Escudo de Mana | 50 | C = 0,15M + S; escudo = 40 + 0,3M | Duração: 2 turno(s) | Escudo por 2 turnos; não pode ser concedido se houver bloqueio de escudos. |
| Corrupcao | 60 | C = 0,3M; D = 100 + 1,15P + 0,22M + F; armadura do alvo = 0 | Armadura removida: 5 turno(s); Sem escudo: 5 turno(s) | Remove toda a armadura do alvo e impede novos escudos por 5 turnos. |
| Incorporar Demonio | 80 | C = 0,3M; dano final × 3; dano recebido × 1,4 | Duração: 3 turno(s) | +200% de dano total e +40% de dano recebido por 3 turnos. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Ultimo Recurso | 10 | Se o golpe for fatal e m ≥ 2Vᵣ: custo em mana = 2Vᵣ; dano à vida = 0 |
| Transbordando | 40 | F = piso(0,25M); S = piso(0,11M); escudo adicional = dano perdido na vida ou impedido por Último Recurso |
| Canhao de Vidro | 70 | Primeiro golpe recebido × 2; duas primeiras ações de dano × 1,5 |

## Arqueiro

Classe: **Arqueiro**. Rota: base.

**Atacar — fórmula:** Dano básico = A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Mirar | 1 | C = 30 + L; A adicional = 5 + L; P adicional = 5 + L | Duração: 5 turno(s) | Acerto básico garantido por 5 turnos. |
| Camuflagem | 20 | C = 40 + W; esquiva adicional = 20% | Duração: 5 turno(s) | Esquiva adicional por 5 turnos. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Passos Leves | 10 | Esquiva = 5% + (0,5% × L) |

## Atirador

Classe: **Arqueiro**. Rota: atirador.

**Atacar — fórmula:** Dano básico = A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Mirar | 1 | C = 30 + L; A adicional = 5 + L; P adicional = 5 + L | Duração: 5 turno(s) | Acerto básico garantido por 5 turnos; Headshot ganha 10% de dano e 10 pontos percentuais de crítico. |
| Camuflagem | 20 | C = 40 + W; esquiva adicional = 20%; próximo dano × 1,3 | Duração: 5 turno(s) | Esquiva adicional por 5 turnos. |
| Headshot | 30 | C = 60 + W; D = 30 + 0,65A + 0,65P; com Mirar, D × 1,1 | Ver efeito | Crítico base de 10%; Mirar fortalece o disparo. |
| Tiro Perfurante | 50 | C = 80 + W; D = 50 + 0,8A + 0,8P | Ver efeito | Ignora armadura e escudo. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Passos Leves | 10 | Esquiva = 5% + (0,5% × L); crítico adicional = 5% |
| Pulso Firme | 40 | A adicional = piso(0,9L); P adicional = piso(0,9L) |

## Atirador Arcano

Classe: **Arqueiro**. Rota: atirador → atirador_arcano.

**Atacar — fórmula:** Dano básico = A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Mirar | 1 | C = 30 + L; A adicional = 5 + L; P adicional = 5 + L | Duração: 5 turno(s) | Acerto básico garantido por 5 turnos; Headshot ganha 10% de dano e 10 pontos percentuais de crítico. |
| Camuflagem | 20 | C = 40 + W; esquiva adicional = 20%; próximo dano × 1,3 | Duração: 5 turno(s) | Esquiva adicional por 5 turnos. |
| Headshot | 30 | C = 60 + W; D = 60 + 0,4A + 0,85P + 0,35M; com Mirar, D × 1,1 | Ver efeito | Crítico base de 10%; se não critar, o próximo golpe contra o alvo causa +15%. |
| Tiro Perfurante | 50 | C = 80 + W; D = 50 + 0,8A + 1,2P | Ver efeito | Ignora armadura e escudo. |
| Emergencia Arcana | 60 | C = 500; D = 60 + P + 0,75(M − m) | Ver efeito | Quanto mais mana faltar ao herói, maior a parcela adicional de dano. |
| Sobreaquecer | 80 | C = m; D = 80 + 1,6P + 0,6m | Ver efeito | Gasta toda a mana atual. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Passos Leves | 10 | Esquiva = 5% + (0,5% × L); crítico adicional = 5% |
| Pulso Firme | 40 | A adicional = piso(0,9L); P adicional = piso(1,3L) |
| Cristalizar Mana | 70 | P adicional = piso(0,05M) |

## Sniper

Classe: **Arqueiro**. Rota: atirador → sniper.

**Atacar — fórmula:** Dano básico = A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Mirar | 1 | C = 30 + L; A adicional = 5 + L; P adicional = 5 + L | Duração: 5 turno(s) | Acerto básico garantido por 5 turnos; Headshot ganha 10% de dano e 10 pontos percentuais de crítico. |
| Camuflagem | 20 | C = 40 + W; esquiva adicional = 20%; próximo dano × 1,3 | Duração: 5 turno(s) | Esquiva adicional por 5 turnos. |
| Headshot | 30 | C = 60 + W; D = 30 + 0,85A + 0,65P; com Mirar, D × 1,1 | Ver efeito | Crítico base de 70%; Mirar e passivas somam seus bônus. |
| Tiro Perfurante | 50 | C = 80 + W; D = 50 + 1,2A + 0,8P | Ver efeito | Ignora armadura e escudo; também remove o escudo. |
| Executar | 60 | C = 120; D = 60 + 1,1A + 0,9P; D × 3 se h < 0,4E | Ver efeito | Triplica o dano se o alvo estiver abaixo de 40% de sua vida máxima. |
| Ponto Fraco | 80 | C = 120; D = 100 + 0,65A + 0,4P + 0,25h | Ver efeito | Usa a vida atual do alvo. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Passos Leves | 10 | Esquiva = 5% + (0,5% × L); crítico adicional = 5% |
| Pulso Firme | 40 | A adicional = piso(0,9L); P adicional = piso(0,9L) |
| Olhos de Falcao | 70 | Olhos de Falcao: concede 15% de chance de critico e faz qualquer excedente acima de 100% virar dano critico adicional. |

## Cacador

Classe: **Arqueiro**. Rota: cacador.

**Atacar — fórmula:** Dano básico = A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Mirar | 1 | C = 30 + L; A adicional = 5 + L; P adicional = 5 + L | Duração: 5 turno(s) | Acerto básico garantido por 5 turnos; Rajada ganha 10% de chance de disparo extra. |
| Camuflagem | 20 | C = 40 + W; esquiva adicional = 28% | Duração: 5 turno(s) | Esquiva adicional por 5 turnos. |
| Rajada de Flechas | 30 | C = 60; 2 ataques básicos, cada um com A + r; com Mirar, 10% de chance de 1 disparo extra | Ver efeito | Cada disparo tem sua própria rolagem de acerto. |
| Armadilha | 50 | C = 80 + W; D = 30 + 1,1P | Ver efeito | 30% de chance de impedir a próxima ação inimiga. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Passos Leves | 10 | Esquiva = 5% + (0,5% × L); moedas × 1,18; XP × 1,12 |
| Errou | 40 | Dano final × 1,12 por 2 turnos após esquivar |

## Espreitador

Classe: **Arqueiro**. Rota: cacador → espreitador.

**Atacar — fórmula:** Dano básico = A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Mirar | 1 | C = 30 + L; A adicional = 5 + L; P adicional = 5 + L | Duração: 5 turno(s) | Acerto básico garantido por 5 turnos; Rajada ganha 10% de chance de disparo extra. |
| Camuflagem | 20 | C = 40 + W; esquiva adicional = 28% | Duração: 5 turno(s) | Esquiva adicional por 5 turnos. |
| Rajada de Flechas | 30 | C = 60; 2 ataques básicos, cada um com A + r; com Mirar, 10% de chance de 1 disparo extra | Ver efeito | Um erro concede +16% ao próximo dano; dois ou mais erros concedem +40%. |
| Armadilha | 50 | C = 80 + W; D = 30 + 1,1P + 0,06h | Ver efeito | 30% de chance de impedir a próxima ação inimiga. |
| Surpresa | 60 | C = 80; D = 60 + 0,9A + 0,7P; logo após Camuflagem: D = 80 + 1,2A + 0,9P | Ver efeito | A versão fortalecida exige que a ação anterior tenha sido Camuflagem. |
| Mirar no Pe | 80 | C = 100; D = 80 + 0,6P + 0,5A; ataque inimigo × 0,8; armadura inimiga × 0,5 | Ataque reduzido: 3 turno(s); Armadura reduzida: 3 turno(s) | Por 3 turnos: −20% de ataque, −50% de armadura e 10% de chance de não atacar em cada turno. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Passos Leves | 10 | Esquiva = 5% + (0,5% × L); moedas × 1,18; XP × 1,12 |
| Errou | 40 | Próximo dano após esquivar × 1,5 |
| Passos Silenciosos | 70 | Passos Silenciosos: concede 7% de chance do inimigo perder o turno sem atacar. |

## Guarda Florestal

Classe: **Arqueiro**. Rota: cacador → guarda_florestal.

**Atacar — fórmula:** Dano básico = A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Mirar | 1 | C = 30 + L; A adicional = 5 + L; P adicional = 5 + L | Duração: 5 turno(s) | Acerto básico garantido por 5 turnos; Rajada ganha 10% de chance de disparo extra. |
| Camuflagem | 20 | C = 40 + W; esquiva adicional = 28% | Duração: 5 turno(s) | Esquiva adicional por 5 turnos. |
| Rajada de Flechas | 30 | C = 60; 3 ataques básicos, cada um com A + r; com Mirar, 10% de chance de 1 disparo extra | Ver efeito | Se Armadilha impedir a ação, a próxima Rajada ganha +23% por disparo. |
| Armadilha | 50 | C = 80 + W; D = 30 + 1,1P | Ver efeito | 30% de chance de impedir a próxima ação inimiga. |
| Tranquilizante | 60 | C = 80; D = 60 + 0,8A + 0,6P; dano inimigo × 0,7 | Ataque reduzido: 4 turno(s) | Reduz dano inimigo em 30% por 4 turnos. |
| Tiro Cortante | 80 | C = 80; T = 120 + 1,2A + 1,2P; DOT por turno = piso(T ÷ 3), durante 3 turnos | DOT: 3 turno(s) | Não causa dano direto; aplica o DOT por 3 rodadas. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Passos Leves | 10 | Esquiva = 5% + (0,5% × L); moedas × 1,18; XP × 1,12 |
| Errou | 40 | Cura ao esquivar = piso(0,13H) |
| Resistencia Florestal | 70 | Redução fixa = piso(0,46L) |

## Adepto da Natureza

Classe: **Adepto da Natureza**. Rota: base.

**Atacar — fórmula:** Dano básico = A + r; durante Forma Verdadeira, D = 1,7A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Semente Viva | 1 | C = 20 + 0,5L; D = 10 + 0,7A + 0,3P | Marca: 3 turno(s) | Marca por 3 turnos; habilita as sinergias naturais. |
| Raizes | 20 | C = 30 + 0,6L; D = 20 + 0,8A + 0,8P | Ver efeito | Enraizamento por 3 turnos: chance de 45%. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Ciclo Natural | 10 | Dano contra marcado × 1,10; devolução de mana = 0,1C |

## Druida

Classe: **Adepto da Natureza**. Rota: druida.

**Atacar — fórmula:** Dano básico = A + r; durante Forma Verdadeira, D = 1,7A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Semente Viva | 1 | C = 20 + 0,5L; D = 10 + 0,7A + 0,3P; marca = 0,2P × 4 por turno | Marca: 4 turno(s) | Marca por 4 turnos, com dano periódico. |
| Raizes | 20 | C = 30 + 0,6L; D = 20 + 0,8A + 0,8P | Ver efeito | Enraizamento por 3 turnos: chance de 60%. |
| Flor do Pantano | 30 | C = 20 + 0,4L; D = 10 + 0,8A + 0,8P; veneno = 0,4P por turno | Veneno: 4 turno(s) | Só envenena se o alvo estiver enraizado; duração do veneno: 4 turnos. |
| Colheita | 50 | C = 40 + 0,3L; D = 30 + 1,2A + 0,3P × turnos restantes da marca; o adicional recebe os bônus de DOTs naturais | Ver efeito | Consome a marca; Druida Sombrio também consome venenos e apodrecimento. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Ciclo Natural | 10 | Dano contra marcado × 1,16; devolução de mana = 0,1C |
| Seiva | 40 | Cura = 0,08 × dano dos DOTs elegíveis |

## Druida Sombrio

Classe: **Adepto da Natureza**. Rota: druida → druida_sombrio.

**Atacar — fórmula:** Dano básico = A + r; durante Forma Verdadeira, D = 1,7A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Semente Viva | 1 | C = 20 + 0,5L; D = 10 + 0,7A + 0,3P; marca = 0,2P × 4 por turno | Marca: 4 turno(s) | Marca por 4 turnos, com dano periódico. |
| Raizes | 20 | C = 30 + 0,6L; D = 20 + 0,8A + 0,8P | Ver efeito | Enraizamento por 3 turnos: chance de 60%. |
| Flor do Pantano | 30 | C = 20 + 0,4L; D = 10 + 0,8A + 0,8P; veneno = 0,4P por turno | Veneno: 7 turno(s) | Só envenena se o alvo estiver enraizado; duração do veneno: 7 turnos. |
| Colheita | 50 | C = 40 + 0,3L; D = 30 + 1,2A + dano restante de marca, venenos e apodrecimento, com os bônus de DOTs naturais | Ver efeito | Consome a marca; Druida Sombrio também consome venenos e apodrecimento. |
| Apodrecer | 60 | C = 40 + 0,5L; D = 50 + 1,2A; apodrecimento = máximo(1; piso(0,015E)) por turno | Apodrecimento: 5 turno(s) | Apodrecimento por 5 turnos. |
| Colapso do Brejo | 80 | C = 0,85M; D = piso(1,8A + 1,8P) | Ver efeito | Se não houver DOT natural, aplica marca, veneno e apodrecimento por 4 turnos. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Ciclo Natural | 10 | Dano contra marcado × 1,16; devolução de mana = 0,1C |
| Seiva | 40 | Cura = 0,08 × dano dos DOTs elegíveis |
| Podridao | 70 | Dano dos DOTs naturais × 1,3 |

## Avatar da Natureza

Classe: **Adepto da Natureza**. Rota: druida → avatar_da_natureza.

**Atacar — fórmula:** Dano básico = A + r; durante Forma Verdadeira, D = 1,7A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Semente Viva | 1 | C = 20 + 0,5L; D = 10 + 0,7A + 0,3P; marca = 0,2P × 4 por turno | Marca: 4 turno(s) | Marca por 4 turnos, com dano periódico. |
| Raizes | 20 | C = 30 + 0,6L; D = 20 + 0,8A + 0,8P | Ver efeito | Enraizamento por 3 turnos: chance de 60%. |
| Flor do Pantano | 30 | C = 20 + 0,4L; D = 10 + 1,3A + 0,8P; veneno = 0,4P por turno | Veneno: 3 turno(s) | Só envenena se o alvo estiver enraizado; duração do veneno: 3 turnos. |
| Colheita | 50 | C = 40 + 0,3L; D = 30 + 1,2A + 0,3P × turnos restantes da marca; o adicional recebe os bônus de DOTs naturais | Ver efeito | Consome a marca; Druida Sombrio também consome venenos e apodrecimento. |
| Forma Verdadeira | 60 | C = M; A × 1,26; dano recebido × 0,82; ataque básico usa 1,7A + r | Duração: 5 turno(s) | Forma por 5 turnos; fortalece ataques básicos. |
| Esmagar Invasor | 80 | C = 300 + 0,8L; D = 2A; +0,6A se o alvo estiver enraizado; +A durante Forma Verdadeira | Ver efeito | Os bônus por enraizamento e Forma Verdadeira podem somar. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Ciclo Natural | 10 | Dano contra marcado × 1,16; devolução de mana = 0,1C |
| Seiva | 40 | Cura = 0,08 × dano dos DOTs elegíveis; vida máxima +12% |
| Casca Ancestral | 70 | Redução fixa = piso(4 + 0,5L); durante Forma Verdadeira = piso(4 + 0,7L) |

## Espirito da Floresta

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta.

**Atacar — fórmula:** Dano básico = A + r; durante Forma Verdadeira, D = 1,7A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Semente Viva | 1 | C = 20 + 0,5L; D = 10 + 0,7A + 0,3P; dano inimigo −24% | Marca: 3 turno(s) | Marca por 3 turnos; habilita as sinergias naturais. |
| Raizes | 20 | C = 30 + 0,6L; D = 20 + 0,8A + 0,8P | Ver efeito | Enraizamento por 3 turnos: chance de 45%. Ao enraizar, reduz armadura em 50%. |
| Encanto da Brisa | 30 | C = 30 + 0,3L; D = 20 + 1,1P | Ver efeito | Pode impedir a ação; alvo marcado também pode ser enraizado. Coroação aumenta as chances em 20 pontos percentuais. |
| Cancao Ancestral | 50 | C = 40 + 0,4L; cura = 1,4P, ou 2P contra alvo enraizado | Ver efeito | Alvo enraizado fortalece a cura; Protetor também recebe escudo. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Ciclo Natural | 10 | Dano contra marcado × 1,10; devolução de mana = 0,1C; P adicional = 0,3A |
| Aura Feerica | 40 | P adicional por Cadência = 4%; até 3 Cadências; com 3: curas × 1,05 |

## Fada Monarca

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta → fada_monarca.

**Atacar — fórmula:** Dano básico = A + r; durante Forma Verdadeira, D = 1,7A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Semente Viva | 1 | C = 20 + 0,5L; D = 10 + 0,7A + 0,3P; dano inimigo −24% | Marca: 3 turno(s) | Marca por 3 turnos; habilita as sinergias naturais. |
| Raizes | 20 | C = 30 + 0,6L; D = 20 + 0,8A + 0,8P | Ver efeito | Enraizamento por 3 turnos: chance de 45%. Ao enraizar, reduz armadura em 50%. |
| Encanto da Brisa | 30 | C = 30 + 0,3L; D = 20 + 1,1P | Ver efeito | Pode impedir a ação; alvo marcado também pode ser enraizado. Coroação aumenta as chances em 20 pontos percentuais. |
| Cancao Ancestral | 50 | C = 40 + 0,4L; cura = 1,4P, ou 2P contra alvo enraizado | Ver efeito | Alvo enraizado fortalece a cura; Protetor também recebe escudo. |
| Decreto da Rainha | 60 | C = 90; D = 2P; com 3 Cadências: D = 2,9P | Ver efeito | Com 3 Cadências usa o coeficiente maior. |
| Coroar | 80 | C = 300 + 2L; P × 1,3; curas × 1,2; chances de controle +20 pontos percentuais | Duração: 5 turno(s) | Por 5 turnos, aumenta poder de habilidade, curas e chances de controle. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Ciclo Natural | 10 | Dano contra marcado × 1,10; devolução de mana = 0,1C; P adicional = 0,3A |
| Aura Feerica | 40 | P adicional por Cadência = 6%; até 3 Cadências; com 3: curas × 1,10 |
| Asas da Realeza | 70 | Esquiva = 20%; enquanto coroada = 60% |

## Protetor da Floresta

Classe: **Adepto da Natureza**. Rota: espirito_da_floresta → protetor_da_floresta.

**Atacar — fórmula:** Dano básico = A + r; durante Forma Verdadeira, D = 1,7A + r.

| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |
| --- | ---: | --- | --- | --- |
| Semente Viva | 1 | C = 20 + 0,5L; D = 10 + 0,7A + 0,3P; dano inimigo −24% | Marca: 3 turno(s) | Marca por 3 turnos; habilita as sinergias naturais. |
| Raizes | 20 | C = 30 + 0,6L; D = 20 + 0,8A + 0,8P | Ver efeito | Enraizamento por 3 turnos: chance de 45%. Ao enraizar, reduz armadura em 50%. |
| Encanto da Brisa | 30 | C = 30 + 0,3L; D = 20 + 1,1P | Ver efeito | Pode impedir a ação; alvo marcado também pode ser enraizado. Coroação aumenta as chances em 20 pontos percentuais. |
| Cancao Ancestral | 50 | C = 40 + 0,4L; cura = 1,4P, ou 2P contra alvo enraizado; escudo = 1,6P, ou 2,2P contra alvo enraizado | Ver efeito | Alvo enraizado fortalece a cura; Protetor também recebe escudo. |
| Casulo de Vinhas | 60 | C = 60 + 0,6L; escudo = piso(1,4A + 1,4P) | Ver efeito | Concede escudo; respeita o bloqueio de escudos. |
| Jogar Espinhos | 80 | C = 4L MP + 0,2H de vida + todo Z; D = 2Z | Ver efeito | Consome todo o escudo e 20% da vida máxima; ignora armadura e escudo inimigos. |

| Passiva | Desbloqueio | Fórmula / regra geral |
| --- | ---: | --- |
| Ciclo Natural | 10 | Dano contra marcado × 1,10; devolução de mana = 0,1C; P adicional = 0,3A |
| Aura Feerica | 40 | P adicional por Cadência = 4%; até 3 Cadências; com 3: curas × 1,05 |
| Juramento do Bosque | 70 | Escudos × 1,06; reflexão = 0,3 × dano absorvido pelo escudo |


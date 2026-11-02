# Habilidades das classes e subclasses

## Fórmulas e resolução

`L`: nível; `H`/`M`: HP/MP máximos com atributos, passivas e equipamentos; `m`: MP atual antes do custo; `A`: ataque ativo, com buffs; `P`: poder de habilidade ativo; `EH`/`eh`: HP máximo/atual do inimigo; `em`: MP atual do inimigo (zero sem reserva de mana); `B`: escudo inimigo; `E`: escudo do personagem; `Q`: cargas arcanas; `U`: inteiro uniforme de 0 a 5; `floor`: arredondamento para baixo. `W=floor(.2*L)`. `F` e `S` são os bônus de dano fixo e custo de Transbordando, ou zero sem a passiva. `cm(x)=min(M,max(0,floor(x)))`.

Custos das tabelas são de mana antes de descontos/acréscimos de equipamentos. Custos de HP são adicionais e exigem HP atual estritamente maior que o custo. Habilidades, buffs e consumíveis de batalha usam uma ação e permitem resposta inimiga; nenhuma habilidade abaixo concede turno gratuito. Buffs novos preservam a duração inicial; os anteriores decaem nas ações seguintes, inclusive ao beber poção.

`A=floor((Abase+bônus_fixo_ativo)*(1+bônus_percentual_ativo))`. `P=floor((Ppassivo+ganho_de_Força+bônus_fixo_ativo)*(1+bônus_percentual_ativo))`. `Abase` já inclui os atributos, subclasses e equipamento; `Ppassivo` inclui subclasses, passivas e equipamento, na ordem do motor. `Hbase` é o HP permanente da classe/atributos, antes dos bônus adicionais. Máximos, cura e escudo também podem mudar por equipamentos; as tabelas mostram as contribuições da habilidade e do ramo.

Investimentos permanentes no nível atual: HP de Vitalidade = `pontos_vitalidade*floor(10+1.8*L)`; MP de Sabedoria = `pontos_sabedoria*floor(10+1.5*L)`; ataque e poder de Força = `pontos_força*floor(5+.15*L)` cada. Todos os pontos anteriores usam esse mesmo valor do nível atual; bônus de classe, subclasse e equipamento são adicionais.

Dano direto: `AR=max(0,floor(armadura*(1-redução_de_armadura)*(1-penetração)))`; `d=max(0,floor(Dbruto)-AR)` por aplicação, salvo indicação de ignorar armadura. Depois, quando positivos e aplicáveis, entram Ciclo Natural, adicional de HP máximo de Vallhala, Eliminar, bônus passivo de dano, buff de dano total, bônus do próximo golpe, marca do próximo dano, vulnerabilidade de Congelamento e redução de dano do personagem. Cada bônus percentual faz `d=d+floor(d*bônus)` na ordem indicada; reduções subtraem sua parcela arredondada. O escudo absorve por último: HP removido `max(0,d-B)`, salvo indicação de ignorá-lo. Buffs que escrevem no mesmo campo usam o maior valor e a maior duração; não somam automaticamente. Dano bruto nas tabelas não equivale ao HP removido.

Crítico de Arqueiro: `p=max(0,crítico_local+bônus_do_ramo+bônus_do_equipamento)`, probabilidade efetiva `min(1,p)`, multiplicador em crítico `K=2+max(0,p-1)+bônus_crítico_do_conjunto`; sem crítico, `K=1`. Os tiros com crítico indicam isso na tabela. Mirar adiciona os 10 pontos de crítico especificamente ao Headshot.

Queimaduras e sangramentos comuns compartilham um campo: reaplicar mantém o maior dano por rodada e a maior duração, não cria duas pilhas. Marca, veneno e apodrecimento têm campos separados; seus ticks retiram HP diretamente, ignorando armadura/escudo e sem reaplicar todos os multiplicadores do dano direto. `Tnatural=1.3` com Podridão, senão `1`. Equipamentos podem ampliar DOT. Enraizamento impede a ação enquanto houver duração, mas não impede a resolução do DOT. Controle/esquiva de chefes não desfaz efeitos negativos que o motor já aplicou antes de cancelar o dano.

Escudos naturais acumulam e duram até consumir, salvo prazo explícito. Curas são limitadas ao HP faltante, arredondadas e afetadas por bônus/reduções; curar sem recuperar HP não gera Cadência. Escudos gerados por Aura Divina usam sua rotina própria. Regeneração padrão de mana ao final da rodada: `max(1,floor(.10*M)+bônus_fixo)`, modificável por conjuntos e buffs.

O nível de cada linha é o desbloqueio original. Cada seção apresenta o kit completo daquela forma, com as alterações herdadas já aplicadas; habilidades do nível 80 continuam exigindo chegar ao 80.


## Guerreiro

Rota: Guerreiro. Forma base, antes do nível 30.

### Ataque básico

Dbruto=A+U; custo 0 MP; sem rolagem de precisão.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Recuperar Fôlego | `30+W` | `0` | Cura floor(0.1*H) de HP. |
| 20 | Esbarrão | `38+W` | `20+floor(0.07*H)+floor(.6*A)+floor(.6*P)` | Golpe direto. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Vontade de Ferro | Redução fixa de floor(.6*L) por ataque recebido. |

## Cavaleiro

Rota: Guerreiro → Cavaleiro. Forma do nível 30, antes da especialização do 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; sem rolagem de precisão.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Recuperar Fôlego | `30+W` | `0` | Cura floor(0.15*H) de HP. |
| 20 | Esbarrão | `44+W` | `20+floor(0.09*H)+floor(.6*A)+floor(.6*P)` | Reduz o ataque do alvo em 30% por 3 turnos. |
| 30 | Contundir | `40+W` | `30+floor(.07*H)+floor(.5*A)+floor(.5*P)` | 30% de chance de impedir a próxima ação inimiga. |
| 50 | Brado | `40+W` | `0` | +30% de ataque por 5 turnos. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Vontade de Ferro | Redução fixa de floor(.6*L) por ataque recebido. Regenera floor(.03*H) de HP por turno. |
| 40 | Refletir | Reflete floor(0.18*HPperdido) após escudos e reduções; a reflexão sofre armadura e escudo inimigos. |

## Paladino

Rota: Guerreiro → Cavaleiro → Paladino. Forma a partir do nível 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; sem rolagem de precisão.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Recuperar Fôlego | `30+W` | `0` | Cura floor(0.15*H) de HP. |
| 20 | Esbarrão | `44+W` | `20+floor(0.09*H)+floor(.6*A)+floor(.6*P)` | Reduz o ataque do alvo em 30% por 3 turnos. |
| 30 | Contundir | `40+W` | `30+floor(.07*H)+floor(.5*A)+floor(.5*P)` | 30% de chance de impedir a próxima ação inimiga. |
| 50 | Brado | `40+W` | `0` | +30% de ataque por 5 turnos. Também reduz o dano recebido em 16% por 5 turnos. |
| 60 | Julgamento | `100+W` | `80+floor(.4*H)+floor(.5*A)+floor(.8*P)` | Golpe direto. |
| 80 | Escudo de Fé | `floor(.7*M)+W` | `0` | Invulnerabilidade por 3 turnos. Armazena o dano que seria recebido antes das reduções; ao terminar, aplica floor(.5*Darmazenado) ao inimigo, sujeito à armadura e ao escudo dele. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Vontade de Ferro | Redução fixa de floor(.6*L) por ataque recebido. Regenera floor(.03*H) de HP por turno. |
| 40 | Refletir | Reflete floor(0.32*HPperdido) após escudos e reduções; a reflexão sofre armadura e escudo inimigos. |
| 70 | Aura Divina | A cada ação do jogador, antes da habilidade/básico, soma floor(.02*H) de escudo persistente. |

## Berserker

Rota: Guerreiro → Cavaleiro → Berserker. Forma a partir do nível 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; sem rolagem de precisão.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Recuperar Fôlego | `30+W` | `0` | Cura floor(0.15*H) de HP. |
| 20 | Esbarrão | `44+W` | `20+floor(0.09*H)+floor(.6*A)+floor(.6*P)` | Reduz o ataque do alvo em 30% por 3 turnos. |
| 30 | Contundir | `40+W` | `60+floor(.07*H)+floor(.9*A)+floor(.9*P)+floor(.10*EH)` | Sem controle; inclui 10% do HP máximo do alvo. |
| 50 | Ira | `W` | `0` | Custa também floor(.8*H) de HP; +150% de dano total (×2,5) por 4 turnos. |
| 60 | Vallhala | `100+W` | `0` | Por 5 turnos, soma floor(.15*EH) a cada aplicação positiva de dano, depois da armadura, e recebe +200% de dano (×3). Golpes múltiplos podem disparar o bônus várias vezes. |
| 80 | Você Irá Me Parar? | `100+W` | `0` | Custa também floor(.3*H) de HP; +50 de ataque e imunidade a perder ações por 4 turnos. Remove o impedimento de ação já pendente. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Vontade de Ferro | Redução fixa de floor(.6*L) por ataque recebido. Regenera floor(.03*H) de HP por turno. |
| 40 | Refletir | Ao perder HP por dano recebido, 50% de chance de contra-atacar por A+U, sujeito à armadura/escudo. |
| 70 | Você Não é Digno | Uma vez por combate, após dano fatal recebido fica com 1 HP; permite uma última ação e morre depois dela se não derrotar o inimigo. Custos voluntários de HP continuam exigindo HP maior que o custo. |

## Espadachim

Rota: Guerreiro → Espadachim. Forma do nível 30, antes da especialização do 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; sem rolagem de precisão.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Recuperar Fôlego | `30+W` | `0` | Cura floor(0.1*H) de HP. +20% de dano total por 3 turnos. |
| 20 | Investida | `50+W` | `20+floor(.07*H)+floor(.9*A)+floor(1.2*P)` | Golpe direto. |
| 30 | Golpes Velozes | `44+W` | `2*(A+U)` | Cada golpe sofre armadura e escudo separadamente; não chama a rotina do básico nem sua Mente Limpa. |
| 50 | Corte Profundo | `52+W` | `70+floor(1.1*A)+floor(.8*P)` | Sangramento: floor(.15*Dcausado/3) por 3 rodadas; o percentual corresponde ao total, não a cada rodada. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Veloz | +20 pontos percentuais à chance de o inimigo errar. |
| 40 | Contra-Ataque | Ao esquivar, contra-ataca por A+U. Sofre armadura e escudo. |

## Samurai

Rota: Guerreiro → Espadachim → Samurai. Forma a partir do nível 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; sem rolagem de precisão.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Recuperar Fôlego | `30+W` | `0` | Cura floor(0.1*H) de HP. +20% de dano total por 3 turnos. |
| 20 | Investida | `50+W` | `20+floor(.07*H)+floor(.9*A)+floor(1.2*P)` | Golpe direto. |
| 30 | Golpes Velozes | `44+W` | `2*(A+U)` | Cada golpe sofre armadura e escudo separadamente; não chama a rotina do básico nem sua Mente Limpa. Sangramento por 3 rodadas: floor(.15*Dcausado/3) por rodada, total 3*floor(.15*Dcausado/3). |
| 50 | Corte Profundo | `52+W` | `70+floor(1.1*A)+floor(.8*P)` | Sangramento: floor(.15*Dcausado/3) por 3 rodadas; o percentual corresponde ao total, não a cada rodada. Ignora armadura, mas não escudo. |
| 60 | Furar Blindagem | `82+W` | `(80+floor(1.1*A)+floor(1.1*P))*(3 if B>0 else 1)` | Triplica o dano calculado se houver escudo no alvo. A execução atual NÃO ignora armadura nem escudo. |
| 80 | Cortes Ultrassônicos | `240+W` | `0` | Por 3 turnos, só permite o ataque básico e faz os ataques recebidos serem tratados como esquivas. Não causa dano no lançamento. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Veloz | +20 pontos percentuais à chance de o inimigo errar. |
| 40 | Contra-Ataque | Ao esquivar, contra-ataca por A+U. Sofre armadura e escudo. Cura floor(.3*Doriginal_do_ataque_recebido), antes dos bônus de cura. |
| 70 | Mente Limpa | O primeiro básico chama um segundo golpe de floor(.5*Dbásico_bruto), aplicando as defesas novamente. A execução não repete automaticamente uma habilidade inteira nem todos os efeitos dela. |

## Ninja

Rota: Guerreiro → Espadachim → Ninja. Forma a partir do nível 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; sem rolagem de precisão.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Recuperar Fôlego | `30+W` | `0` | Cura floor(0.1*H) de HP. +20% de dano total por 3 turnos. |
| 20 | Investida | `50+W` | `20+floor(.07*H)+floor(.9*A)+floor(1.2*P)` | Golpe direto. |
| 30 | Golpes Velozes | `44+W` | `3*(A+U)` | Cada golpe sofre armadura e escudo separadamente; não chama a rotina do básico nem sua Mente Limpa. |
| 50 | Corte Profundo | `52+W` | `70+floor(1.1*A)+floor(.8*P)` | Sangramento: floor(.30*Dcausado/3) por 3 rodadas; o percentual corresponde ao total, não a cada rodada. |
| 60 | Bomba de Fumaca | `40+W` | `0` | Garante uma esquiva no próximo ataque recebido; próximo dano positivo +30%. Pode ativar Contra-Ataque; bônus consumido na primeira aplicação positiva, inclusive uma reação. |
| 80 | Mata-Gigantes | `200+W` | `floor(.4*eh)` | 40% do HP atual do alvo; sofre armadura e escudo. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Veloz | +20 pontos percentuais à chance de o inimigo errar. |
| 40 | Contra-Ataque | Ao esquivar, contra-ataca por A+U. Ignora armadura e escudo. |
| 70 | Eliminar | Com eh<=floor(.5*EH), dano direto positivo após armadura ganha floor(.5*dano), antes dos demais bônus. Inclui exatamente 50%. |

## Mago

Rota: Mago. Forma base, antes do nível 30.

### Ataque básico

N=floor(3+.1*L); custa 3*N MP. Cada um dos N mísseis sorteia um inteiro entre 5+floor(.2*A) e 5+floor(.5*A), inclusive. F é dividido: floor(F/N) por míssil e +1 nos primeiros F mod N. Armadura é aplicada por míssil.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 20 | Explosão de Mana | `cm(20+floor(.2*L)+S)` | `30+floor(0.6*P)+floor(0.1*M)+4*floor(.5*em)+F` | Retira floor(.5*em) de MP do alvo, quando ele possui MP máximo positivo; essa quantidade ×4 entra no dano. Contra alvo sem mana, o termo vale zero. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Último Recurso | Se um dano após reduções/escudo seria fatal e m>=2*dano, gasta 2*dano de MP e anula esse dano. |

## Elementalista

Rota: Mago → Elementalista. Forma do nível 30, antes da especialização do 60.

### Ataque básico

N=floor(3+.1*L); custa 3*N MP. Cada um dos N mísseis sorteia um inteiro entre 5+floor(.2*A) e 5+floor(.5*A), inclusive. F é dividido: floor(F/N) por míssil e +1 nos primeiros F mod N. Armadura é aplicada por míssil. Cada míssil também recebe floor(.1*P).

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 20 | Explosão de Mana | `cm(20+floor(.2*L)+S)` | `30+floor(1*P)+floor(0.1*M)+4*floor(.5*em)+F` | Retira floor(.5*em) de MP do alvo, quando ele possui MP máximo positivo; essa quantidade ×4 entra no dano. Contra alvo sem mana, o termo vale zero. |
| 30 | Bola de Fogo | `cm(40+S)` | `50+floor(1.3*P)+F` | Queima por 3 rodadas: max(1,floor(.03*EH)) por rodada, ou 5% com Fogo do Inferno no nível 70. Reduz a cura recebida pelo alvo em 30% durante a queimadura. |
| 50 | Congelar | `cm(40+floor(.2*L)+S)` | `60+floor(.9*P)+F` | 30% de chance de impedir a próxima ação inimiga. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Último Recurso | Se um dano após reduções/escudo seria fatal e m>=2*dano, gasta 2*dano de MP e anula esse dano. Elementalista: aplica queimadura de max(1,floor(.03*EH)) por 3 rodadas e -30% à cura inimiga. |
| 40 | Mana é Vida | Vida máxima adicional = floor(0.5*M). |

## Mago Incendiário

Rota: Mago → Elementalista → Mago Incendiário. Forma a partir do nível 60.

### Ataque básico

N=floor(3+.1*L); custa 3*N MP. Cada um dos N mísseis sorteia um inteiro entre 5+floor(.2*A) e 5+floor(.5*A), inclusive. F é dividido: floor(F/N) por míssil e +1 nos primeiros F mod N. Armadura é aplicada por míssil. Cada míssil também recebe floor(.1*P).

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 20 | Explosão de Mana | `cm(20+floor(.2*L)+S)` | `30+floor(1*P)+floor(0.1*M)+4*floor(.5*em)+F` | Retira floor(.5*em) de MP do alvo, quando ele possui MP máximo positivo; essa quantidade ×4 entra no dano. Contra alvo sem mana, o termo vale zero. |
| 30 | Bola de Fogo | `cm(40+S)` | `50+floor(1.3*P)+floor(.05*eh)+F` | Queima por 3 rodadas: max(1,floor(.03*EH)) por rodada, ou 5% com Fogo do Inferno no nível 70. Reduz a cura recebida pelo alvo em 30% durante a queimadura. |
| 50 | Bafo de Fogo | `cm(40+floor(.2*L)+S)` | `60+floor(.9*P)+F` | Queimadura por 6 rodadas: max(1,floor(.03*EH)), ou 5% com Fogo do Inferno no 70; reduz cura inimiga em 30%. |
| 60 | Fênix Sagrada | `cm(200+P+S)` | `100+floor(1.8*P)+F` | Queima por 1 rodada: max(1,floor(.03*EH)), ou 5% com Fogo do Inferno no 70; reduz cura inimiga em 30% por 1 turno. |
| 80 | Explodir | `cm(500+S)` | `200+floor(1.3*P)+floor(.5*H)+floor(.5*EH)+F` | Custa também floor(.5*H) de HP. Aplica o dano calculado ao inimigo, sujeito à armadura e ao escudo, além dos custos de HP e MP. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Último Recurso | Se um dano após reduções/escudo seria fatal e m>=2*dano, gasta 2*dano de MP e anula esse dano. Elementalista: aplica queimadura de max(1,floor(.03*EH)) por 3 rodadas e -30% à cura inimiga. |
| 40 | Mana é Vida | Vida máxima adicional = floor(0.5*M). Também adiciona floor(.18*M) ao poder de habilidade. |
| 70 | Fogo do Inferno | Altera a queimadura das magias de fogo para max(1,floor(.05*EH)) por rodada; não transforma toda fonte de queimadura em 5%. |

## Mago Frígido

Rota: Mago → Elementalista → Mago Frígido. Forma a partir do nível 60.

### Ataque básico

N=floor(3+.1*L); custa 3*N MP. Cada um dos N mísseis sorteia um inteiro entre 5+floor(.2*A) e 5+floor(.5*A), inclusive. F é dividido: floor(F/N) por míssil e +1 nos primeiros F mod N. Armadura é aplicada por míssil. Cada míssil também recebe floor(.1*P).

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 20 | Explosão de Mana | `cm(20+floor(.2*L)+S)` | `30+floor(1*P)+floor(0.1*M)+4*floor(.5*em)+F` | Retira floor(.5*em) de MP do alvo, quando ele possui MP máximo positivo; essa quantidade ×4 entra no dano. Contra alvo sem mana, o termo vale zero. |
| 30 | Bola de Neve | `cm(40+S)` | `50+floor(1.3*P)+F` | Resfriamento: -30% de ataque por 3 turnos; não aplica a queimadura normal. No 70, Gelo Queima também aplica max(1,floor(.03*EH)) por 1 rodada. |
| 50 | Congelar | `cm(40+floor(.2*L)+S)` | `60+floor(.9*P)+F` | 30% de chance de impedir a próxima ação inimiga. Se a rolagem falhar: alvo já resfriado ganha +50% no próximo dano recebido; caso contrário, -30% de ataque por 2 turnos. No 70, esse ramo de resfriamento também aplica queimadura de 3% de EH por 1 rodada; o ramo que impediu a ação não aplica essa queimadura. |
| 60 | Nevasca | `cm(120+S)` | `0` | Por 6 turnos, 15% de chance de o inimigo perder a ação. Não dá dano direto nem acumula consigo mesma. |
| 80 | Avalanche | `cm(400+S)` | `200+floor(1.3*P)+floor(.5*EH)+F` | Resfria por 4 turnos (-30% de ataque). Com Gelo Queima, também queima por 1 rodada em max(1,floor(.03*EH)). |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Último Recurso | Se um dano após reduções/escudo seria fatal e m>=2*dano, gasta 2*dano de MP e anula esse dano. Elementalista: aplica queimadura de max(1,floor(.03*EH)) por 3 rodadas e -30% à cura inimiga. |
| 40 | Mana é Vida | Vida máxima adicional = floor(0.65*M). |
| 70 | Gelo Queima | Bola de Neve, ramo de resfriamento de Congelar e Avalanche também aplicam queimadura de max(1,floor(.03*EH)) por 1 rodada. |

## Arcanista

Rota: Mago → Arcanista. Forma do nível 30, antes da especialização do 60.

### Ataque básico

N=floor(3+.1*L); custa 3*N MP. Cada um dos N mísseis sorteia um inteiro entre 5+floor(.2*A) e 5+floor(.5*A), inclusive. F é dividido: floor(F/N) por míssil e +1 nos primeiros F mod N. Armadura é aplicada por míssil. Cada míssil tem 15% de chance de gerar 1 carga arcana. A primeira inicia uma janela de 3 turnos; novas cargas não a renovam.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 20 | Explosão de Mana | `cm(20+floor(.2*L)+S)` | `30+floor(0.6*P)+floor(0.14*M)+4*floor(.5*em)+F` | Retira floor(.5*em) de MP do alvo, quando ele possui MP máximo positivo; essa quantidade ×4 entra no dano. Contra alvo sem mana, o termo vale zero. |
| 30 | Descarregar | `cm(10*Q+S)` | `60+L*Q+floor(.1*P)+floor(.04*M)+F` | Consome todas as cargas arcanas. O jogo permite usar com Q=0. |
| 50 | Escudo de Mana | `cm(floor(.15*M)+S)` | `0` | Apaga o escudo anterior e concede 40+floor(0.3*M), por 2 turnos. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Último Recurso | Se um dano após reduções/escudo seria fatal e m>=2*dano, gasta 2*dano de MP e anula esse dano. Arcanista: ganha floor(MPgasto/100) cargas arcanas. |
| 40 | Transbordando | F=floor(0.3*M); S=floor(0.1*M). F entra uma vez por habilidade listada ou é repartido entre os mísseis de uma ação básica. |

## Arquimago

Rota: Mago → Arcanista → Arquimago. Forma a partir do nível 60.

### Ataque básico

N=floor(3+.1*L); custa 3*N MP. Cada um dos N mísseis sorteia um inteiro entre 5+floor(.2*A) e 5+floor(.5*A), inclusive. F é dividido: floor(F/N) por míssil e +1 nos primeiros F mod N. Armadura é aplicada por míssil. Cada míssil tem 15% de chance de gerar 1 carga arcana. A primeira inicia uma janela de 3 turnos; novas cargas não a renovam.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 20 | Explosão de Mana | `cm(20+floor(.2*L)+S)` | `30+floor(0.6*P)+floor(0.14*M)+4*floor(.5*em)+F` | Retira floor(.5*em) de MP do alvo, quando ele possui MP máximo positivo; essa quantidade ×4 entra no dano. Contra alvo sem mana, o termo vale zero. |
| 30 | Descarregar | `cm(10*Q+S)` | `floor((L+.007*M)*Q)+F` | Consome todas as cargas arcanas. O jogo permite usar com Q=0. |
| 50 | Escudo de Mana | `cm(floor(.12*M)+S)` | `0` | Apaga o escudo anterior e concede 40+floor(0.4*M), por 2 turnos. |
| 60 | Concentração | `cm(200+S)` | `0` | +20% de dano total e +10 pontos percentuais à regeneração de mana por 4 turnos. Regeneração padrão: floor(.10*M); durante o efeito: floor(.20*M), antes de outros bônus. Não causa dano ao lançar. |
| 80 | Sobrecarregar | `cm(floor(.95*M)+S)` | `200+M+L*Q+F` | Consome todas as cargas arcanas; sofre armadura e escudo. Com Transbordando do Arquimago, o custo normalmente chega a M: exige mana cheia. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Último Recurso | Se um dano após reduções/escudo seria fatal e m>=2*dano, gasta 2*dano de MP e anula esse dano. Arcanista: ganha floor(MPgasto/100) cargas arcanas. |
| 40 | Transbordando | F=floor(0.45*M); S=floor(0.2*M). F entra uma vez por habilidade listada ou é repartido entre os mísseis de uma ação básica. |
| 70 | Carregar | Cada carga arcana concede +5% de dano total: bônus = .05*Q, sem teto próprio de Q. Novas cargas não reiniciam os 3 turnos contados da primeira carga. |

## Corrompido

Rota: Mago → Arcanista → Corrompido. Forma a partir do nível 60.

### Ataque básico

N=floor(3+.1*L); custa 3*N MP. Cada um dos N mísseis sorteia um inteiro entre 5+floor(.2*A) e 5+floor(.5*A), inclusive. F é dividido: floor(F/N) por míssil e +1 nos primeiros F mod N. Armadura é aplicada por míssil. Cada míssil tem 15% de chance de gerar 1 carga arcana. A primeira inicia uma janela de 3 turnos; novas cargas não a renovam. No nível 70, Canhão de Vidro dobra todos os mísseis da primeira ação básica elegível.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 20 | Explosão de Mana | `cm(20+floor(.2*L)+S)` | `30+floor(0.6*P)+floor(0.14*M)+4*floor(.5*em)+F` | Retira floor(.5*em) de MP do alvo, quando ele possui MP máximo positivo; essa quantidade ×4 entra no dano. Contra alvo sem mana, o termo vale zero. |
| 30 | Descarregar | `cm(10*Q+S)` | `60+L*Q+floor(.1*P)+floor(.04*M)+F` | Consome todas as cargas arcanas. O jogo permite usar com Q=0. Deixa +30% para o próximo dano positivo. |
| 50 | Escudo de Mana | `cm(floor(.15*M)+S)` | `0` | Apaga o escudo anterior e concede 40+floor(0.3*M), por 2 turnos. Ativa reação que reduz em 50% o ataque inimigo por 1 turno ao receber dano ou absorvê-lo, enquanto a reação estiver ativa. |
| 60 | Corrupção | `cm(floor(.3*m))` | `100+floor(P)+floor(.3*M)+F` | Ignora armadura neste golpe. Aplica -100% de armadura e impede novos escudos por 5 turnos; não apaga automaticamente o escudo que já existia. |
| 80 | Incorporar Demônio | `cm(floor(.3*m))` | `0` | +200% de dano total (×3) e +30% de dano recebido por 3 turnos. Custo baseado no MP atual, sem S adicional. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Último Recurso | Se um dano após reduções/escudo seria fatal e m>=2*dano, gasta 2*dano de MP e anula esse dano. Arcanista: ganha floor(MPgasto/100) cargas arcanas. |
| 40 | Transbordando | F=floor(0.3*M); S=floor(0.1*M). F entra uma vez por habilidade listada ou é repartido entre os mísseis de uma ação básica. Também converte todo HP perdido por dano em igual escudo persistente, salvo bloqueio de novos escudos. |
| 70 | Canhão de Vidro | Uma vez por combate, dobra o primeiro básico completo ou a primeira habilidade que usa a rotina de bônus de primeiro dano. Recebe +50% de dano nos 2 primeiros turnos. A janela é consumida pela primeira fonte ofensiva elegível. |

## Arqueiro

Rota: Arqueiro. Forma base, antes do nível 30.

### Ataque básico

Dbruto=A+U; custo 0 MP; 84% de acerto, 100% com Mirar; pode critar com K. Bônus crítico do ramo: 0, antes de equipamentos.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Mirar | `30+L` | `0` | +5+L de ataque e 100% de acerto básico por 5 turnos. O bônus de ataque também entra nas habilidades que usam A. |
| 20 | Camuflagem | `40+floor(.5*L)` | `0` | +20% de esquiva por 4 turnos; soma à passiva, respeitando teto total de 95%. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Passos Leves | Chance passiva de esquiva = .05+.005*L; chance total, com efeitos, limitada a .95. |

## Atirador

Rota: Arqueiro → Atirador. Forma do nível 30, antes da especialização do 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; 84% de acerto, 100% com Mirar; pode critar com K. Bônus crítico do ramo: 5 pontos percentuais desde o nível 30.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Mirar | `30+L` | `0` | +5+L de ataque e 100% de acerto básico por 5 turnos. O bônus de ataque também entra nas habilidades que usam A. |
| 20 | Camuflagem | `40+floor(.5*L)` | `0` | +20% de esquiva por 4 turnos; soma à passiva, respeitando teto total de 95%. Próximo dano positivo +30%. |
| 30 | Headshot | `60+floor(.3*L)` | `30+floor(.7*A)+floor(.9*P)` | Acerta sem a rolagem de precisão do básico; crítico local de 10% mais os bônus críticos do ramo. Com Mirar: D=floor(1.1*D) e +10 pontos percentuais ao crítico local. Críticos usam K. |
| 50 | Tiro Perfurante | `80` | `50+floor(0.8*A)+floor(0.8*P)` | Acerta sem teste de precisão; pode critar com K; ignora armadura e escudo. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Passos Leves | Chance passiva de esquiva = .05+.005*L; chance total, com efeitos, limitada a .95. O ramo Atirador também recebe +5 pontos percentuais de crítico. |
| 40 | Pulso Firme | Ataque adicional floor(.9*L); poder adicional floor(0.9*L). |

## Atirador Arcano

Rota: Arqueiro → Atirador → Atirador Arcano. Forma a partir do nível 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; 84% de acerto, 100% com Mirar; pode critar com K. Bônus crítico do ramo: 5 pontos percentuais desde o nível 30.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Mirar | `30+L` | `0` | +5+L de ataque e 100% de acerto básico por 5 turnos. O bônus de ataque também entra nas habilidades que usam A. |
| 20 | Camuflagem | `40+floor(.5*L)` | `0` | +20% de esquiva por 4 turnos; soma à passiva, respeitando teto total de 95%. Próximo dano positivo +30%. |
| 30 | Headshot | `60+floor(.3*L)` | `60+floor(1.1*P)+floor(.6*M)` | Acerta sem a rolagem de precisão do básico; crítico local de 10% mais os bônus críticos do ramo. Com Mirar: D=floor(1.1*D) e +10 pontos percentuais ao crítico local. Críticos usam K. Sem crítico, marca o próximo dano contra o alvo com +15%. |
| 50 | Tiro Perfurante | `80` | `50+floor(0.8*A)+floor(1.2*P)` | Acerta sem teste de precisão; pode critar com K; ignora armadura e escudo. |
| 60 | Emergência Arcana | `100` | `60+P+floor(.75*max(0,M-m))` | Acerto garantido, pode critar com K. MP faltante é medido antes de pagar os 100 MP. |
| 80 | Sobreaquecer | `m` | `80+floor(1.6*P)+floor(.6*m)` | Gasta todo o MP atual. Funciona com m=0, sem custo; pode critar com K e não testa precisão. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Passos Leves | Chance passiva de esquiva = .05+.005*L; chance total, com efeitos, limitada a .95. O ramo Atirador também recebe +5 pontos percentuais de crítico. |
| 40 | Pulso Firme | Ataque adicional floor(.9*L); poder adicional floor(1.3*L). |
| 70 | Cristalizar Mana | Poder de habilidade adicional = floor(.05*M). |

## Sniper

Rota: Arqueiro → Atirador → Sniper. Forma a partir do nível 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; 84% de acerto, 100% com Mirar; pode critar com K. Bônus crítico do ramo: 35 pontos percentuais desde o nível 70 (5 Atirador +15 Sniper no 60 +15 Olhos de Falcão no 70).

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Mirar | `30+L` | `0` | +5+L de ataque e 100% de acerto básico por 5 turnos. O bônus de ataque também entra nas habilidades que usam A. |
| 20 | Camuflagem | `40+floor(.5*L)` | `0` | +20% de esquiva por 4 turnos; soma à passiva, respeitando teto total de 95%. Próximo dano positivo +30%. |
| 30 | Headshot | `60+floor(.3*L)` | `30+floor(.7*A)+floor(.9*P)` | Acerta sem a rolagem de precisão do básico; crítico local de 70% mais os bônus críticos do ramo. Com Mirar: D=floor(1.1*D) e +10 pontos percentuais ao crítico local. Críticos usam K. |
| 50 | Tiro Perfurante | `80` | `50+floor(1.2*A)+floor(0.8*P)` | Acerta sem teste de precisão; pode critar com K; ignora armadura e escudo. Também destrói o escudo existente. |
| 60 | Executar | `120` | `60+floor(1.1*A)+floor(.9*P)` | D é triplicado se eh<=floor(.4*EH), incluindo exatamente 40%; depois pode critar com K. Sem teste de precisão. |
| 80 | Ponto Fraco | `120` | `100+floor(.4*A)+floor(.3*P)+floor(.25*eh)` | Pode critar com K; sem teste de precisão. A parcela percentual usa HP atual, não máximo. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Passos Leves | Chance passiva de esquiva = .05+.005*L; chance total, com efeitos, limitada a .95. O ramo Atirador também recebe +5 pontos percentuais de crítico. |
| 40 | Pulso Firme | Ataque adicional floor(.9*L); poder adicional floor(0.9*L). Sniper recebe +15 pontos percentuais de crítico desde o nível 60. |
| 70 | Olhos de Falcão | +15 pontos percentuais de crítico no nível 70, além dos +15 do Sniper no 60 e dos +5 do Atirador. Excedente acima de 100% aumenta o multiplicador crítico K. |

## Caçador

Rota: Arqueiro → Caçador. Forma do nível 30, antes da especialização do 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; 84% de acerto, 100% com Mirar; pode critar com K. Bônus crítico do ramo: 0, antes de equipamentos.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Mirar | `30+L` | `0` | +5+L de ataque e 100% de acerto básico por 5 turnos. O bônus de ataque também entra nas habilidades que usam A. |
| 20 | Camuflagem | `40+floor(.5*L)` | `0` | +25% de esquiva por 4 turnos; soma à passiva, respeitando teto total de 95%. |
| 30 | Rajada de Flechas | `60` | `2*(A+U)` | Cada disparo tem 84% de acerto (100% com Mirar), pode critar com K e sofre armadura/escudo individualmente. Mirar dá 10% de chance de um disparo extra. |
| 50 | Armadilha | `80` | `30+floor(1.1*P)` | 30% de chance de impedir a próxima ação; não faz teste de precisão e não rola crítico. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Passos Leves | Chance passiva de esquiva = .05+.005*L; chance total, com efeitos, limitada a .95. Também ganha +10% de moedas de inimigos. |
| 40 | Errou | Ao esquivar, +10% de dano total por 2 turnos. |

## Espreitador

Rota: Arqueiro → Caçador → Espreitador. Forma a partir do nível 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; 84% de acerto, 100% com Mirar; pode critar com K. Bônus crítico do ramo: 0, antes de equipamentos.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Mirar | `30+L` | `0` | +5+L de ataque e 100% de acerto básico por 5 turnos. O bônus de ataque também entra nas habilidades que usam A. |
| 20 | Camuflagem | `40+floor(.5*L)` | `0` | +25% de esquiva por 4 turnos; soma à passiva, respeitando teto total de 95%. |
| 30 | Rajada de Flechas | `60` | `2*(A+U)` | Cada disparo tem 84% de acerto (100% com Mirar), pode critar com K e sofre armadura/escudo individualmente. Mirar dá 10% de chance de um disparo extra. |
| 50 | Armadilha | `80` | `30+floor(1.1*P)+floor(.08*eh)` | 30% de chance de impedir a próxima ação; não faz teste de precisão e não rola crítico. |
| 60 | Surpresa | `80` | `60+floor(.9*A)+floor(.7*P)` | Se a última ação foi Camuflagem, substitui D por 80+floor(1.2*A)+floor(.9*P). Pode critar com K; sem teste de precisão. |
| 80 | Mirar no Pé | `100` | `80+floor(.6*P)+floor(.5*A)` | Por 3 turnos: -15% de ataque e -50% de armadura inimiga; 10% de chance de impedir a próxima ação. Pode critar com K; sem teste de precisão. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Passos Leves | Chance passiva de esquiva = .05+.005*L; chance total, com efeitos, limitada a .95. Também ganha +10% de moedas de inimigos. |
| 40 | Errou | Ao esquivar, próximo dano positivo +50%. |
| 70 | Passos Silenciosos | 7% de chance passiva de o inimigo perder uma ação, sem gastar uma ação própria. |

## Guarda Florestal

Rota: Arqueiro → Caçador → Guarda Florestal. Forma a partir do nível 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; 84% de acerto, 100% com Mirar; pode critar com K. Bônus crítico do ramo: 0, antes de equipamentos.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Mirar | `30+L` | `0` | +5+L de ataque e 100% de acerto básico por 5 turnos. O bônus de ataque também entra nas habilidades que usam A. |
| 20 | Camuflagem | `40+floor(.5*L)` | `0` | +25% de esquiva por 4 turnos; soma à passiva, respeitando teto total de 95%. |
| 30 | Rajada de Flechas | `60` | `3*(A+U)` | Cada disparo tem 84% de acerto (100% com Mirar), pode critar com K e sofre armadura/escudo individualmente. Mirar dá 10% de chance de um disparo extra. |
| 50 | Armadilha | `80` | `30+floor(1.1*P)` | 30% de chance de impedir a próxima ação; não faz teste de precisão e não rola crítico. Se impedir a ação, a próxima Rajada ganha +15% por disparo. |
| 60 | Tranquilizante | `80` | `60+floor(.8*A)+floor(.6*P)` | -30% de ataque inimigo por 3 turnos. Pode critar com K; sem teste de precisão. |
| 80 | Tiro Cortante | `80` | `0` | Sem dano direto. Cada rodada: floor((120+floor(1.2*A)+floor(1.2*P))/3), por 3 rodadas. Total = 3 vezes esse valor; não rola crítico. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Passos Leves | Chance passiva de esquiva = .05+.005*L; chance total, com efeitos, limitada a .95. Também ganha +10% de moedas de inimigos. |
| 40 | Errou | Ao esquivar, cura floor(.13*H), antes de bônus de cura. |
| 70 | Resistência Florestal | Redução fixa por ataque recebido = floor(.2*L). |

## Adepto da Natureza

Rota: Adepto da Natureza. Forma base, antes do nível 30.

### Ataque básico

Dbruto=A+U; custo 0 MP; sem rolagem de precisão.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Semente Viva | `20+floor(.5*L)` | `10+floor(.7*A)+floor(.3*P)` | Aplica marca sem dano periódico por 3 turnos. O dano inicial é resolvido antes de criar a nova marca. O motor já aplica o bônus contra alvo marcado e o reembolso antes do desbloqueio nominal de Ciclo Natural no 10. |
| 20 | Raízes | `30+floor(.6*L)` | `20+floor(.8*A)+floor(.8*P)` | 45% de chance de enraizar por 3 turnos. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Ciclo Natural | Alvo marcado recebe +10% de dano direto depois da armadura. Habilidade que atinge alvo ainda marcado devolve floor(.1*C) de mana; Colheita remove a marca antes do dano e perde esse reembolso. |

## Druida

Rota: Adepto da Natureza → Druida. Forma do nível 30, antes da especialização do 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; sem rolagem de precisão.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Semente Viva | `20+floor(.5*L)` | `10+floor(.7*A)+floor(.3*P)` | Aplica marca por 4 turnos, com floor(.2*P*4) de dano natural por rodada. O dano inicial é resolvido antes de criar a nova marca. |
| 20 | Raízes | `30+floor(.6*L)` | `20+floor(.8*A)+floor(.8*P)` | 60% de chance de enraizar por 3 turnos. |
| 30 | Flor do Pântano | `20+floor(.4*L)` | `10+floor(0.8*A)+floor(.8*P)` | Se o alvo já estava enraizado, aplica floor(.4*P) de veneno por 4 rodadas. Sem raiz, dá só o dano direto. |
| 50 | Colheita | `40+floor(.3*L)` | `30+floor(1.2*A)` | Se há marca, adiciona floor(Tnatural*floor(.3*P*turnos_marca)) e a consome. Não consome veneno nem apodrecimento. O dano real da marca não é a parcela usada nesta versão. Marca removida antes do golpe: esse lançamento não recebe Ciclo Natural por essa marca. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Ciclo Natural | Alvo marcado recebe +16% de dano direto depois da armadura. Habilidade que atinge alvo ainda marcado devolve floor(.1*C) de mana; Colheita remove a marca antes do dano e perde esse reembolso. |
| 40 | Seiva | Marca e veneno curam floor(.08*DOTcausado) por rodada, antes de bônus de cura. |

## Druida Sombrio

Rota: Adepto da Natureza → Druida → Druida Sombrio. Forma a partir do nível 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; sem rolagem de precisão.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Semente Viva | `20+floor(.5*L)` | `10+floor(.7*A)+floor(.3*P)` | Aplica marca por 4 turnos, com floor(.2*P*4) de dano natural por rodada. O dano inicial é resolvido antes de criar a nova marca. |
| 20 | Raízes | `30+floor(.6*L)` | `20+floor(.8*A)+floor(.8*P)` | 60% de chance de enraizar por 3 turnos. |
| 30 | Flor do Pântano | `20+floor(.4*L)` | `10+floor(0.8*A)+floor(.8*P)` | Se o alvo já estava enraizado, aplica floor(.4*P) de veneno por 7 rodadas. Sem raiz, dá só o dano direto. |
| 50 | Colheita | `40+floor(.3*L)` | `30+floor(1.2*A)` | Adiciona floor(Tnatural*(marca_por_rodada*turnos_marca + veneno_por_rodada*turnos_veneno + apodrecimento_por_rodada*turnos_apodrecimento)), consumindo esses três efeitos. Se a marca não tem dano, sua parcela vira floor(.3*P*turnos_marca). Marca removida antes do golpe: esse lançamento não recebe Ciclo Natural por essa marca. |
| 60 | Apodrecer | `40+floor(.5*L)` | `50+floor(1.2*A)` | Aplica max(1,floor(.015*EH)) de apodrecimento por 5 rodadas, antes de Podridão e bônus de conjunto. |
| 80 | Colapso do Brejo | `floor(.85*M)` | `floor(1.8*A+1.8*P)` | Somente se o alvo não tinha nenhum DOT natural positivo: aplica por 4 rodadas marca de floor(.2*P*4), veneno de floor(.4*P) e apodrecimento de max(1,floor(.015*EH)), antes de Podridão. Não aplica esse pacote se já havia marca com dano, veneno ou apodrecimento. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Ciclo Natural | Alvo marcado recebe +16% de dano direto depois da armadura. Habilidade que atinge alvo ainda marcado devolve floor(.1*C) de mana; Colheita remove a marca antes do dano e perde esse reembolso. |
| 40 | Seiva | Marca e veneno curam floor(.08*DOTcausado) por rodada, antes de bônus de cura. Apodrecimento também pode curar. |
| 70 | Podridão | Multiplica marca, veneno e apodrecimento por 1,3: tick=floor(DOTbase*1.3), antes de bônus de conjunto. Colheita também usa Tnatural=1,3 no valor consumido. |

## Avatar da Natureza

Rota: Adepto da Natureza → Druida → Avatar da Natureza. Forma a partir do nível 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; sem rolagem de precisão. Durante Forma Verdadeira, Dbruto=floor(1.7*A)+U; A já inclui o bônus de ataque da forma.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Semente Viva | `20+floor(.5*L)` | `10+floor(.7*A)+floor(.3*P)` | Aplica marca por 4 turnos, com floor(.2*P*4) de dano natural por rodada. O dano inicial é resolvido antes de criar a nova marca. |
| 20 | Raízes | `30+floor(.6*L)` | `20+floor(.8*A)+floor(.8*P)` | 60% de chance de enraizar por 3 turnos. |
| 30 | Flor do Pântano | `20+floor(.4*L)` | `10+floor(1.3*A)+floor(.8*P)` | Se o alvo já estava enraizado, aplica floor(.4*P) de veneno por 3 rodadas. Sem raiz, dá só o dano direto. |
| 50 | Colheita | `40+floor(.3*L)` | `30+floor(1.2*A)` | Se há marca, adiciona floor(Tnatural*floor(.3*P*turnos_marca)) e a consome. Não consome veneno nem apodrecimento. O dano real da marca não é a parcela usada nesta versão. Marca removida antes do golpe: esse lançamento não recebe Ciclo Natural por essa marca. Ganha floor(.7*Dcausado) de escudo, antes de bônus de escudo. |
| 60 | Forma Verdadeira | `M` | `0` | Requer MP atual igual ao máximo. Por 5 turnos: +26% de ataque, -18% de dano recebido e básico = floor(1.7*A)+U. O A dessa fórmula já inclui o +26%. Não dá dano no lançamento. |
| 80 | Esmagar Invasor | `300+floor(.8*L)` | `floor(2*A)` | Soma floor(.6*A) se enraizado e floor(A) se Forma Verdadeira ativa. Esses bônus podem coexistir. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Ciclo Natural | Alvo marcado recebe +16% de dano direto depois da armadura. Habilidade que atinge alvo ainda marcado devolve floor(.1*C) de mana; Colheita remove a marca antes do dano e perde esse reembolso. |
| 40 | Seiva | Marca e veneno curam floor(.08*DOTcausado) por rodada, antes de bônus de cura. Adiciona floor(.12*Hbase) de vida máxima. |
| 70 | Casca Ancestral | Redução fixa = floor(4+.5*L), ou floor(4+.7*L) durante Forma Verdadeira. |

## Espírito da Floresta

Rota: Adepto da Natureza → Espírito da Floresta. Forma do nível 30, antes da especialização do 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; sem rolagem de precisão.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Semente Viva | `20+floor(.5*L)` | `10+floor(.7*A)+floor(.3*P)` | Aplica marca sem dano periódico por 3 turnos. A marca reduz ataque inimigo em .08*3=24% por 3 turnos. O dano inicial é resolvido antes de criar a nova marca. |
| 20 | Raízes | `30+floor(.6*L)` | `20+floor(.8*A)+floor(.8*P)` | 45% de chance de enraizar por 3 turnos. Se enraizar, também reduz armadura em 50% por 3 turnos. |
| 30 | Encanto da Brisa | `30+floor(.3*L)` | `20+floor(1.1*P)` | 20% de chance de impedir a próxima ação. Se o alvo já estava marcado, outra rolagem independente de igual chance enraíza por 3 turnos. Coroar soma 20 pontos percentuais a ambas. |
| 50 | Canção Ancestral | `40+floor(.4*L)` | `0` | Cura floor(1.4*P), ou floor(2*P) com inimigo enraizado, antes de bônus de cura. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Ciclo Natural | Alvo marcado recebe +10% de dano direto depois da armadura. Habilidade que atinge alvo ainda marcado devolve floor(.1*C) de mana; Colheita remove a marca antes do dano e perde esse reembolso. Converte floor(.3*Abase) em poder de habilidade. |
| 40 | Aura Feérica | Cura efetiva ou ganho de escudo concede 1 Cadência, máximo 3. Poder adicional = floor((Abase+Ppassivo)*0.04*Cadência), calculado antes do poder ganho de Força. Com 3: +5% de cura. |

## Fada Monarca

Rota: Adepto da Natureza → Espírito da Floresta → Fada Monarca. Forma a partir do nível 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; sem rolagem de precisão.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Semente Viva | `20+floor(.5*L)` | `10+floor(.7*A)+floor(.3*P)` | Aplica marca sem dano periódico por 3 turnos. A marca reduz ataque inimigo em .08*3=24% por 3 turnos. O dano inicial é resolvido antes de criar a nova marca. |
| 20 | Raízes | `30+floor(.6*L)` | `20+floor(.8*A)+floor(.8*P)` | 45% de chance de enraizar por 3 turnos. Se enraizar, também reduz armadura em 50% por 3 turnos. |
| 30 | Encanto da Brisa | `30+floor(.3*L)` | `20+floor(1.1*P)` | 30% de chance de impedir a próxima ação. Se o alvo já estava marcado, outra rolagem independente de igual chance enraíza por 3 turnos. Coroar soma 20 pontos percentuais a ambas. |
| 50 | Canção Ancestral | `40+floor(.4*L)` | `0` | Cura floor(1.4*P), ou floor(2*P) com inimigo enraizado, antes de bônus de cura. Reduz ataque inimigo em 12% por 3 turnos. |
| 60 | Decreto da Rainha | `90` | `floor(2*P)` | Com 3 Cadências, substitui D por floor(2.9*P). Não consome Cadência. |
| 80 | Coroar | `300+floor(2*L)` | `0` | Por 5 turnos: +floor(.3*(Abase+Ppassivo_após_Cadência)) de poder de habilidade, +20% em curas e +20 pontos percentuais nas rolagens de Encanto da Brisa. Ativa a esquiva de 60% de Asas da Realeza; não aumenta a chance de Raízes. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Ciclo Natural | Alvo marcado recebe +10% de dano direto depois da armadura. Habilidade que atinge alvo ainda marcado devolve floor(.1*C) de mana; Colheita remove a marca antes do dano e perde esse reembolso. Converte floor(.3*Abase) em poder de habilidade. |
| 40 | Aura Feérica | Cura efetiva ou ganho de escudo concede 1 Cadência, máximo 3. Poder adicional = floor((Abase+Ppassivo)*0.06*Cadência), calculado antes do poder ganho de Força. Com 3: +10% de cura. |
| 70 | Asas da Realeza | 20% de esquiva; passa a 60% durante Coroar. Soma a outros efeitos respeitando teto de 95%. |

## Protetor da Floresta

Rota: Adepto da Natureza → Espírito da Floresta → Protetor da Floresta. Forma a partir do nível 60.

### Ataque básico

Dbruto=A+U; custo 0 MP; sem rolagem de precisão.

### Habilidades ativas

| Nível | Habilidade | Custo MP | Dano bruto | Efeito |
| --- | --- | --- | --- | --- |
| 1 | Semente Viva | `20+floor(.5*L)` | `10+floor(.7*A)+floor(.3*P)` | Aplica marca sem dano periódico por 3 turnos. A marca reduz ataque inimigo em .08*3=24% por 3 turnos. O dano inicial é resolvido antes de criar a nova marca. |
| 20 | Raízes | `30+floor(.6*L)` | `20+floor(.8*A)+floor(.8*P)` | 45% de chance de enraizar por 3 turnos. Se enraizar, também reduz armadura em 50% por 3 turnos. |
| 30 | Encanto da Brisa | `30+floor(.3*L)` | `20+floor(1.1*P)` | 20% de chance de impedir a próxima ação. Se o alvo já estava marcado, outra rolagem independente de igual chance enraíza por 3 turnos. Coroar soma 20 pontos percentuais a ambas. Contra alvo marcado, ganha escudo igual ao dano efetivamente causado, antes dos bônus próprios de escudo. |
| 50 | Canção Ancestral | `40+floor(.4*L)` | `0` | Cura floor(1.4*P), ou floor(2*P) com inimigo enraizado, antes de bônus de cura. Também concede floor(1.6*P) de escudo, ou floor(2.2*P) com alvo enraizado, antes de bônus de escudo. |
| 60 | Casulo de Vinhas | `60+floor(.6*L)` | `0` | Escudo base floor(1.4*A+1.4*P); acumula com o escudo existente e não tem prazo próprio, antes de bônus de escudo. |
| 80 | Jogar Espinhos | `floor(4*L)` | `floor(2*E)` | Custa também floor(.2*H) de HP e consome todo o escudo E. Ignora armadura e escudo inimigos. É utilizável com E=0 e, nesse caso, causa zero dano. |

### Habilidades passivas

| Nível | Habilidade | Fórmula e efeito |
| --- | --- | --- |
| 10 | Ciclo Natural | Alvo marcado recebe +10% de dano direto depois da armadura. Habilidade que atinge alvo ainda marcado devolve floor(.1*C) de mana; Colheita remove a marca antes do dano e perde esse reembolso. Converte floor(.3*Abase) em poder de habilidade. |
| 40 | Aura Feérica | Cura efetiva ou ganho de escudo concede 1 Cadência, máximo 3. Poder adicional = floor((Abase+Ppassivo)*0.04*Cadência), calculado antes do poder ganho de Força. Com 3: +5% de cura. Com 3 também ganha +10% de escudo. |
| 70 | Juramento do Bosque | Escudos +6%; enquanto há escudo, reflete floor(.3*dano_absorvido_pelo_escudo), sujeito à defesa do alvo. |

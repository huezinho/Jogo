# Resumo de Balanceamento

## Estado atual do projeto
- Arquivo principal atual: [index.html](C:/Users/pcvas/OneDrive/Documentos/New%20project/index.html)
- Documento atualizado em linha com:
  - requisitos de regiao por derrota do boss anterior
  - dungeon online em sequencia fixa
  - classe `Adepto da Natureza`
  - sistema atual de bosses, habilidades e escalas

## Visuais conectados
- Imagens extraidas em `assets/combat-art/normalized`.
- Herois, subclasses, inimigos e chefes usam busca automatica por nome normalizado via `toCssToken`.
- Fallback continua em emoji se faltar algum arquivo.
- Alias visual especial atual: `Devorador do Eco -> devorador-de-eras`.

## Classes base
- Guerreiro: `120 HP`, `60 MP`, `18 ATQ`.
- Arqueiro: `100 HP`, `80 MP`, `16 ATQ`.
- Mago: `80 HP`, `100 MP`, `14 ATQ`.
- Adepto da Natureza: `100 HP`, `100 MP`, `12 ATQ`.

## Arvores de habilidades

### Guerreiro
- Base: `Recuperar Folego` no nivel `1`, `Vontade de Ferro` no `10`, `Esbarrao` no `20`.
- Cavaleiro: `Contundir` no `30`, `Refletir` no `40`, `Brado` no `50`.
- Paladino: `Julgamento` no `60`, `Aura Divina` no `70`, `Escudo de Fe` no `80`.
- Berserker: `Vallhala` no `60`, `Voce Nao e Digno` no `70`, `Voce Ira Me Parar?` no `80`.
- Espadachim: `Investida` substitui `Esbarrao`, depois `Golpes Velozes` no `30`, `Contra-Ataque` no `40`, `Corte Profundo` no `50`.
- Samurai: `Furar Blindagem` no `60`, `Mente Limpa` no `70`, `Cortes Ultrasonicos` no `80`.
- Ninja: `Bomba de Fumaca` no `60`, `Eliminar` no `70`, `Mata-Gigantes` no `80`.

### Mago
- Base: ataque basico `Misseis Magicos`, `Ultimo Recurso` no `10`, `Explosao de Mana` no `20`.
- Elementalista: `Bola de Fogo` no `30`, `Mana e Vida` no `40`, `Congelar` no `50`.
- Mago Incendiario: `Fenix Sagrada` no `60`, `Fogo do Inferno` no `70`, `Explodir` no `80`.
- Mago Frigido: `Nevasca` no `60`, `Gelo Queima` no `70`, `Avalanche` no `80`.
- Arcanista: `Descarregar` no `30`, `Transbordando` no `40`, `Escudo de Mana` no `50`.
- Arquimago: `Concentracao` no `60`, `Carregar` no `70`, `Sobrecarregar` no `80`.
- Corrompido: `Corrupcao` no `60`, `Canhao de Vidro` no `70`, `Incorporar Demonio` no `80`.

### Arqueiro
- Base: `Mirar` no `1`, `Passos Leves` no `10`, `Camuflagem` no `20`.
- Atirador: `Headshot` no `30`, `Pulso Firme` no `40`, `Tiro Perfurante` no `50`.
- Atirador Arcano: `Emergencia Arcana` no `60`, `Cristalizar Mana` no `70`, `Sobreaquecer` no `80`.
- Sniper: `Executar` no `60`, `Olhos de Falcao` no `70`, `Ponto Fraco` no `80`.
- Cacador: `Rajada de Flechas` no `30`, `Errou` no `40`, `Armadilha` no `50`.
- Espreitador: `Surpresa` no `60`, `Passos Silenciosos` no `70`, `Mirar no Pe` no `80`.
- Guarda Florestal: `Tranquilizante` no `60`, `Resistencia Florestal` no `70`, `Tiro Cortante` no `80`.

### Adepto da Natureza
- Base: `Semente Viva` no `1`, `Ciclo Natural` no `10`, `Raizes` no `20`.
- Druida: `Flor do Pantano` no `30`, `Seiva` no `40`, `Colheita` no `50`.
- Druida Sombrio: `Apodrecer` no `60`, `Podridao` no `70`, `Colapso do Brejo` no `80`.
- Avatar da Natureza: `Forma Verdadeira` no `60`, `Casca Ancestral` no `70`, `Esmagar Invasor` no `80`.
- Espirito da Floresta: `Encanto da Brisa` no `30`, `Aura Feerica` no `40`, `Cancao Ancestral` no `50`.
- Fada Monarca: `Decreto da Rainha` no `60`, `Asas da Realeza` no `70`, `Coroar` no `80`.
- Protetor da Floresta: `Casulo de Vinhas` no `60`, `Juramento do Bosque` no `70`, `Jogar Espinhos` no `80`.

### Fonte de verdade dos numeros
- Os nomes acima seguem a arvore atual de `assets/js/data/class-trees.js`.
- Os valores finais de dano, custo, escudo, cura e DOT continuam definidos em `assets/js/game.js`, principalmente em `getSkillInfo()`.

## Scalings completos das habilidades

### Ataques basicos
- Guerreiro: ataque basico entre `ATQ` e `ATQ + 5`.
- Arqueiro: ataque basico entre `ATQ` e `ATQ + 5`, com chance de acerto baseada em `getHitChance("basic")`.
- Mago: `Misseis Magicos`
  - quantidade: `floor(3 + 0.1 * nivel)`
  - custo: `3 * quantidade de misseis`
  - dano por missel: entre `5 + floor(0.2 * ATQ)` e `5 + floor(0.5 * ATQ)`
  - Elementalista: adiciona `floor(0.1 * poder de habilidade)` em cada missel
  - Arcanista: cada missel tem `15%` de chance de gerar `1 Carga Arcana` por `3 turnos`

### Guerreiro
- `Recuperar Folego`
  - custo: `20 MP`
  - cura base: `floor(0.07 * HP max)`
  - Cavaleiro: cura vira `floor(0.10 * HP max)`
  - Espadachim: além da cura, ganha `+10% dano total` por `3 turnos`
- `Esbarrao`
  - custo base: `38 MP`
  - dano base: `20 + floor(0.06 * HP max) + floor(0.5 * ATQ) + floor(0.5 * poder de habilidade)`
  - Cavaleiro: custo `44 MP`, ainda reduz `30%` do ataque inimigo por `3 turnos`
  - Espadachim: vira `Investida`, custo `50 MP`, dano `20 + floor(0.1 * HP max) + floor(0.9 * ATQ) + floor(1.2 * poder de habilidade)`
- `Contundir`
  - custo: `40 MP`
  - dano base: `30 + floor(0.06 * HP max) + floor(0.35 * ATQ) + floor(0.35 * poder de habilidade)`
  - chance base: `30%` de pular o turno do inimigo
  - Berserker: dano vira `60 + floor(0.06 * HP max) + floor(0.9 * ATQ) + floor(0.9 * poder de habilidade) + floor(0.1 * HP max do inimigo)` e perde a chance de controle
- `Golpes Velozes`
  - custo: `44 MP`
  - golpes: `2`
  - Ninja: `3` golpes
  - Samurai: aplica sangramento de `15% do dano causado` por `3 turnos`
- `Brado`
  - custo: `40 MP`
  - efeito: `+20% ataque` por `5 turnos`
  - Paladino: também `-16% dano sofrido` por `5 turnos`
  - Berserker: vira `Ira`, custa `80% da vida maxima`, concede `+150% dano total` por `4 turnos`
- `Corte Profundo`
  - custo: `52 MP`
  - dano: `70 + floor(1.1 * ATQ) + floor(0.8 * poder de habilidade)`
  - sangramento base: `15% do dano causado` por `3 turnos`
  - Ninja: sangramento vira `30%`
  - Samurai: ignora armadura
- `Julgamento`
  - custo: `100 MP`
  - dano: `80 + floor(0.4 * HP max) + floor(0.5 * ATQ) + floor(0.8 * poder de habilidade)`
- `Vallhala`
  - custo: `100 MP`
  - duração: `5 turnos`
  - efeito: recebe `+200% dano`, mas adiciona `15% da vida maxima do inimigo` em qualquer dano causado
- `Furar Blindagem`
  - custo: `82 MP`
  - dano base: `80 + floor(1.1 * ATQ) + floor(1.1 * poder de habilidade)`
  - se o alvo estiver com escudo: dano `x3`
- `Bomba de Fumaca`
  - custo: `40 MP`
  - efeito: esquiva garantida do próximo golpe e `+30%` no próximo dano
- `Escudo de Fe`
  - custo: `floor(0.7 * MP max)`
  - duração: `3 turnos`
  - efeito: invulnerável por `3 turnos`, depois explode com `50%` do dano absorvido
- `Voce Ira Me Parar?`
  - custo: `100 MP + 30% da vida maxima`
  - duração: `4 turnos`
  - efeito: impede perder turno e dá `+50 ATQ`
- `Cortes Ultrasonicos`
  - custo: `240 MP`
  - duração: `3 turnos`
  - efeito: só pode usar ataque básico e não pode ser atingido
- `Mata-Gigantes`
  - custo: `200 MP`
  - dano: `floor(0.4 * vida atual do inimigo)`

### Passivas do Guerreiro
- `Vontade de Ferro`: reduz `floor(0.6 * nivel)` de dano por golpe
- `Vontade de Ferro` do Cavaleiro: além disso, cura `3% da vida maxima` por turno
- `Veloz`: `20%` de chance de esquiva
- `Refletir`
  - base: reflete `18%` do dano recebido
  - Berserker: vira `50%` de chance de contra-atacar com ataque básico
- `Contra-Ataque`
  - base: contra-ataque ao esquivar
  - Samurai: também cura `30%` do dano que o golpe causaria
  - Ninja: contra-ataque ignora armadura e escudo
- `Aura Divina`: ganha escudo persistente de `2% da vida maxima` por turno
- `Voce Nao e Digno`: 1 vez por combate, sobrevive com `1 HP`
- `Mente Limpa`: primeiro ataque bate duas vezes; a segunda por `50%` do dano
- `Eliminar`: `+50% dano total` em inimigos abaixo de `50%` da vida

### Mago
- `Explosao de Mana`
  - custo: `20 + floor(0.2 * nivel) + custo extra arcano`
  - dano base: `30 + floor(0.6 * poder de habilidade) + floor(0.09 * MP max) + bonus universal`
  - Arcanista: dano vira `30 + floor(0.6 * poder de habilidade) + floor(0.13 * MP max) + bonus universal`
  - reembolso: devolve toda a mana se causar mais de `40% da vida maxima do inimigo`
- `Bola de Fogo`
  - custo: `40 MP + custo extra arcano`
  - dano: `50 + floor(1.3 * poder de habilidade) + bonus universal`
  - Mago Incendiario: soma `5% da vida atual do inimigo`
  - queimadura: `3% da vida maxima do inimigo` por `3 turnos`
  - `Fogo do Inferno`: queimadura sobe para `5%`
  - cura recebida do inimigo: `-30%`
- `Bola de Neve`
  - custo: `40 MP + custo extra arcano`
  - dano: mesmo da Bola de Fogo
  - efeito: resfriamento por `3 turnos`, reduzindo `30%` do ataque inimigo
- `Congelar`
  - custo: `40 + floor(0.2 * nivel) + custo extra arcano`
  - dano: `60 + floor(0.9 * poder de habilidade) + bonus universal`
  - chance base: `30%` de impedir o próximo ataque
  - Mago Frigido: se não impedir o turno, aplica resfriamento por `2 turnos`
- `Bafo de Fogo`
  - custo: igual ao `Congelar`
  - dano: igual ao `Congelar`
  - queimadura: `6 turnos`
- `Descarregar`
  - custo: `10 * cargas arcanas + custo extra arcano`
  - dano: `60 + (nivel * cargas) + floor(0.1 * poder de habilidade) + floor(0.04 * MP max) + bonus universal`
- `Escudo de Mana`
  - custo base: `floor(0.15 * MP max) + custo extra arcano`
  - escudo base: `40 + floor(0.3 * MP max)`
  - duração: `2 turnos`
  - Arquimago: custo `12% MP max`, escudo `40 + floor(0.4 * MP max)`
- `Concentracao`
  - custo: `200 MP + custo extra arcano`
  - duração: `4 turnos`
  - efeito: `+10% dano total` e `+10% regeneração de mana`
- `Corrupcao`
  - custo: `30% da mana atual`
  - dano: `100 + floor(1.0 * poder de habilidade) + floor(0.3 * MP max) + bonus universal`
  - efeito: remove `100%` da armadura e impede escudo por `5 turnos`
- `Sobrecarregar`
  - custo: `95% do MP max + custo extra arcano`
  - dano: `200 + MP max + 15 * cargas arcanas + bonus universal`
- `Incorporar Demonio`
  - custo: `30% da mana atual`
  - duração: `3 turnos`
  - efeito: `+200% dano total`, porém recebe `+30% dano`
- `Fenix Sagrada`
  - custo: `200 + poder de habilidade + custo extra arcano`
  - dano: `100 + floor(1.6 * poder de habilidade) + bonus universal`
  - queimadura: `1 turno`
- `Nevasca`
  - custo: `120 MP + custo extra arcano`
  - duração: `6 turnos`
  - efeito: inimigo tem `15%` de chance de perder o turno
- `Explodir`
  - custo: `500 MP + custo extra arcano + 50% da vida maxima`
  - dano: `200 + floor(1.3 * poder de habilidade) + floor(0.5 * HP max) + floor(0.5 * HP max do inimigo) + bonus universal`
- `Avalanche`
  - custo: `400 MP + custo extra arcano`
  - dano: `200 + floor(1.3 * poder de habilidade) + floor(0.6 * HP max do inimigo) + bonus universal`
  - resfriamento: `4 turnos`

### Passivas do Mago
- `Ultimo Recurso`: se o golpe seria fatal, só salva se a mana atual for pelo menos `2x` o dano; gasta esse valor em mana
- `Mana e Vida`
  - Elementalista: converte `50%` do MP max em HP max
  - Mago Frigido: converte `65%`
  - Mago Incendiario: além disso, ganha `10% do MP max` em poder de habilidade
- `Transbordando`
  - Arcanista: `+0.3 * MP max` em dano adicional e `+0.1 * MP max` no custo das skills
  - Arquimago: `+0.45 * MP max` em dano adicional e `+0.2 * MP max` no custo
- `Fogo do Inferno`: aumenta queimadura de `3%` para `5%`
- `Gelo Queima`: resfriamento também aplica queimadura de `3%` por `1 turno`
- `Carregar`: cada carga arcana dá `+5% dano total`
- `Canhao de Vidro`: primeiro ataque do combate causa `2x dano`; sofre `+50% dano` nos `2 primeiros turnos`

### Arqueiro
- `Mirar`
  - custo: `30 + nivel`
  - duração: `5 turnos`
  - efeito base: `100%` de acerto no ataque básico e `+ (5 + nivel)` no dano do ataque básico
  - Atirador: ainda fortalece `Headshot` em `10%` e dá `+10% chance de critico` nele
  - Cacador: `10%` de chance de disparo extra na `Rajada de Flechas`
- `Headshot`
  - custo: `60 + floor(0.3 * nivel)`
  - dano base atual: `30 + floor(0.7 * ATQ) + floor(0.9 * poder de habilidade)`
  - Atirador Arcano: vira `60 + floor(1.1 * poder de habilidade) + floor(0.6 * MP max)`
  - critico base: `10%`
  - Sniper: critico base vira `70%`
  - Mirar ativo no Atirador: `+10%` chance de critico e `+10% dano final`
  - Atirador Arcano: se não critar, marca o alvo para tomar `+15%` no próximo golpe
- `Camuflagem`
  - custo: `40 + floor(0.5 * nivel)`
  - duração: `4 turnos`
  - esquiva adicional: `20%`
  - Cacador: `25%`
  - Atirador: próximo dano fica `+30%`
- `Rajada de Flechas`
  - custo: `60 MP`
  - golpes base: `2`
  - Guarda Florestal: `3`
  - Mirar ativo do Cacador: `10%` de chance de um disparo adicional
- `Tiro Perfurante`
  - custo: `80 MP`
  - dano base: `50 + floor(0.8 * ATQ) + floor(0.8 * poder de habilidade)`
  - Sniper: fator de ATQ vira `1.2`
  - Atirador Arcano: fator de habilidade vira `1.2`
  - ignora armadura e escudo
  - Sniper: também destrói o escudo ativo
- `Armadilha`
  - custo: `80 MP`
  - dano: `30 + floor(1.1 * poder de habilidade)`
  - chance: `30%` de pular o turno do alvo
  - Espreitador: soma `8% da vida atual do inimigo`
  - Guarda Florestal: se prender, próxima `Rajada` causa `+15% dano`
- `Emergencia Arcana`
  - custo: `100 MP`
  - dano: `60 + poder de habilidade + floor(0.75 * (MP max - mana atual))`
- `Executar`
  - custo: `120 MP`
  - dano: `60 + floor(1.1 * ATQ) + floor(0.9 * poder de habilidade)`
  - se alvo abaixo de `40%` da vida: dano `x3`
- `Surpresa`
  - custo: `80 MP`
  - dano base: `60 + floor(0.9 * ATQ) + floor(0.7 * poder de habilidade)`
  - se a última ação foi `Camuflagem`: `80 + floor(1.2 * ATQ) + floor(0.9 * poder de habilidade)`
- `Tranquilizante`
  - custo: `80 MP`
  - dano: `60 + floor(0.8 * ATQ) + floor(0.6 * poder de habilidade)`
  - efeito: `-30% dano do inimigo` por `3 turnos`
- `Sobreaquecer`
  - custo: toda a mana atual
  - dano: `80 + floor(1.6 * poder de habilidade) + floor(0.6 * mana atual)`
- `Ponto Fraco`
  - custo: `120 MP`
  - dano: `100 + floor(0.4 * ATQ) + floor(0.3 * poder de habilidade) + floor(0.25 * vida atual do inimigo)`
- `Mirar no Pe`
  - custo: `100 MP`
  - dano: `80 + floor(0.6 * poder de habilidade) + floor(0.5 * ATQ)`
  - efeitos: `-15% dano inimigo`, `-50% armadura`, `10%` de chance de pular turno
- `Tiro Cortante`
  - custo: `80 MP`
  - dano total: `120 + floor(1.2 * ATQ) + floor(1.2 * poder de habilidade)`
  - efeito: divide em `3` ticks iguais

### Passivas do Arqueiro
- `Passos Leves`: `5% + 0.5% * nivel` de esquiva
- `Passos Leves` do Atirador: mantém a esquiva e ainda dá `5%` de chance de critico
- `Passos Leves` do Cacador: mantém a esquiva e ainda dá `+10% moedas`
- `Pulso Firme`
  - base: `floor(0.9 * nivel)` em ATQ e em poder de habilidade
  - Atirador Arcano: bônus de poder de habilidade vira `floor(1.3 * nivel)`
  - Sniper: ainda concede `+15% chance de critico`
- `Errou`
  - base: ao esquivar, `+10% dano total` por `2 turnos`
  - Espreitador: próximo dano fica `+50%`
  - Guarda Florestal: cura `13% da vida maxima`
- `Cristalizar Mana`: converte `5% do MP max` em poder de habilidade
- `Olhos de Falcao`: `+15% chance de critico`; excedente acima de `100%` vira dano critico
- `Passos Silenciosos`: `7%` de chance de o inimigo perder o turno
- `Resistencia Florestal`: reduz `floor(0.2 * nivel)` de dano por golpe

### Adepto da Natureza
- `Semente Viva`
  - custo: `20 + floor(0.5 * nivel)`
  - dano: `10 + floor(0.7 * ATQ) + floor(0.3 * poder de habilidade)`
  - marca base: `3 turnos`
  - Druida: marca vira `4 turnos` e causa `floor(0.2 * poder de habilidade * turnos da marca)` por turno
  - Espirito da Floresta: a marca reduz o dano inimigo em `8% * turnos restantes`
- `Raizes`
  - custo: `30 + floor(0.6 * nivel)`
  - dano: `20 + floor(0.8 * ATQ) + floor(0.8 * poder de habilidade)`
  - chance base de enraizar: `45%`
  - Druida: `60%`
  - Espirito da Floresta: se enraizar, reduz `50%` da armadura
- `Flor do Pantano`
  - custo: `20 + floor(0.4 * nivel)`
  - dano base: `10 + floor(0.8 * ATQ) + floor(0.8 * poder de habilidade)`
  - Avatar da Natureza: fator de ATQ vira `1.3`
  - veneno: `floor(0.4 * poder de habilidade)` por turno
  - duração base: `4 turnos`
  - Druida Sombrio: `7 turnos`
  - Avatar da Natureza: `3 turnos`
- `Encanto da Brisa`
  - custo: `30 + floor(0.3 * nivel)`
  - dano: `20 + floor(1.1 * poder de habilidade)`
  - chance base de pular turno: `20%`
  - Fada Monarca: `30%`
  - `Coroar`: soma `+20%` nas chances
  - chance de enraizar em alvo marcado: mesma lógica acima
  - Protetor da Floresta: se alvo estiver marcado, concede escudo igual a `100% do dano causado`
- `Colheita`
  - custo: `40 + floor(0.3 * nivel)`
  - dano base: `30 + floor(1.2 * ATQ)`
  - efeito: consome efeitos naturais e explode o dano restante
- `Cancao Ancestral`
  - custo: `40 + floor(0.4 * nivel)`
  - cura base: `floor(1.4 * poder de habilidade)`
  - se alvo enraizado: `floor(2.0 * poder de habilidade)`
  - Protetor da Floresta: concede escudo de `1.6 * poder de habilidade` ou `2.2 * poder de habilidade` se alvo enraizado
  - Fada Monarca: ainda reduz o dano inimigo em `12%`
- `Apodrecer`
  - custo: `40 + floor(0.5 * nivel)`
  - dano: `50 + floor(1.2 * ATQ)`
  - apodrecimento: `1.5% da vida maxima do inimigo` por `5 turnos`
- `Forma Verdadeira`
  - custo: `todo o MP max`
  - duração: `5 turnos`
  - efeito: `+26% ataque`, `-18% dano sofrido` e fortalece o ataque básico
- `Decreto da Rainha`
  - custo: `90 MP`
  - dano: `floor(2.0 * poder de habilidade)`
  - com `3 Cadencias`: `floor(2.9 * poder de habilidade)`
- `Casulo de Vinhas`
  - custo: `60 + floor(0.6 * nivel)`
  - escudo: `floor(1.4 * ATQ + 1.4 * poder de habilidade)`
- `Colapso do Brejo`
  - custo: `85% do MP max`
  - dano: `floor(1.8 * ATQ + 1.8 * poder de habilidade)`
  - se alvo sem DOT natural: aplica marca, veneno e apodrecimento por `4 turnos`
- `Esmagar Invasor`
  - custo: `300 + floor(0.8 * nivel)`
  - dano base: `floor(2 * ATQ)`
  - alvo enraizado: `+floor(0.6 * ATQ)`
  - em Forma Verdadeira: `+floor(1.0 * ATQ)`
- `Coroar`
  - custo: `300 + 2 * nivel`
  - duração: `5 turnos`
  - efeito: `+30% poder de habilidade`, `+20% curas`, `+20% chances de controle`
- `Jogar Espinhos`
  - custo: `20% da vida maxima + 4 * nivel MP`
  - dano: `2 * escudo atual`
  - consome todo o escudo e ignora armadura/escudo

### Passivas do Adepto da Natureza
- `Ciclo Natural`
  - base: alvos marcados recebem `+10% dano` e devolvem `10%` do custo da skill usada contra eles
  - Druida: bônus de dano vira `16%`
  - Espirito da Floresta: ainda converte `30% do ATQ` em poder de habilidade
- `Seiva`: cura `8%` do dano de marca e veneno
  - Avatar da Natureza: também `+12% vida maxima`
  - Druida Sombrio: também conta apodrecimento
- `Aura Feerica`
  - base: cada `Cadencia` dá `+4% poder de habilidade`, até `3`
  - com `3` stacks: `+5% curas`
  - Fada Monarca: cada stack dá `+6%` e no máximo concede `+10% curas`
  - Protetor da Floresta: com `3` stacks também dá `+10% escudos`
- `Podridao`: `+30%` em marca, veneno e apodrecimento
- `Casca Ancestral`: reduz `4 + 0.5 * nivel` de dano por golpe; em Forma Verdadeira usa `4 + 0.7 * nivel`
- `Asas da Realeza`: `20%` de esquiva, ou `60%` enquanto coroada
- `Juramento do Bosque`: `+6% escudos` e reflete `30%` do dano absorvido pelo escudo

## Distribuicao de atributos
- Todos os personagens usam os mesmos 3 atributos ao subir de nivel:
  - `Forca`: `5 + nivel * 0.15` em dano de ataque basico e dano de habilidade.
  - `Sabedoria`: `10 + 1.5 * nivel` em mana maxima.
  - `Vitalidade`: `10 + 1.8 * nivel` em vida maxima.
- Todos os calculos sao arredondados para baixo no jogo.

## Sistema de critico do Arqueiro
- O sistema antigo de `dano dobrado/triplo` foi trocado por `chance de critico + dano critico`.
- Critico padrao: `100% de dano critico`, ou seja, multiplicador final de `2.0x`.
- Formula:
  - `chance total de critico = chance base + bonus passivos + bonus de buffs`
  - `chance real de critico = min(100%, chance total)`
  - `excedente acima de 100% = dano critico adicional`
  - `multiplicador final = 1 + dano critico bonus`
- Exemplo:
  - `110%` de chance total = critico garantido
  - o excedente `10%` vira dano critico adicional
  - critico final = `210%` do dano base

## Regioes e progressao

### Requisito de desbloqueio
- Floresta: nenhum requisito
- Caverna: derrotar `Ent Ancestral`
- Ruinas: derrotar `Troll das Profundezas`
- Pantano: derrotar `Rei Espectral`
- Vulcao: derrotar `Hidra do Lodo`
- Abismo: derrotar `Draco Magmatico`
- Fortaleza: derrotar `Arauto do Vazio`
- Necropole: derrotar `General de Aco`
- Citadela: derrotar `Lorde da Cripta`
- Panteao: derrotar `Imperador do Eclipse`
- Cataclismo: derrotar `Avatar do Zenith`
- Paradoxo: derrotar `Deus da Ruina`

### Ordem das regioes
1. Floresta
2. Caverna
3. Ruinas
4. Pantano
5. Vulcao
6. Abismo
7. Fortaleza
8. Necropole
9. Citadela
10. Panteao
11. Cataclismo
12. Paradoxo

## Inimigos por regiao
- Floresta: `Lobo Sombrio 1`, `Goblin 3`, `Aranha Gigante 8`, boss `Ent Ancestral 10`
- Caverna: `Morcego de Pedra 11`, `Esqueleto Mineiro 13`, `Slime Toxico 18`, boss `Troll das Profundezas 20`
- Ruinas: `Sentinela Quebrada 21`, `Cultista Perdido 23`, `Fantasma Antigo 28`, boss `Rei Espectral 30`
- Pantano: `Sapo Colossal 31`, `Bruxa do Brejo 33`, `Serpente do Lodo 38`, boss `Hidra do Lodo 40`
- Vulcao: `Salamandra Rubra 41`, `Golem de Brasa 43`, `Fenix Sombria 48`, boss `Draco Magmatico 50`
- Abismo: `Cavaleiro Abissal 51`, `Lamia do Eclipse 53`, `Colosso do Vazio 58`, boss `Arauto do Vazio 60`
- Fortaleza: `Escudeiro de Ferro 61`, `Maga da Muralha 63`, `Carrasco de Guerra 68`, boss `General de Aco 70`
- Necropole: `Guardiao Funebre 71`, `Feiticeira Morta 73`, `Ceifador de Ossos 78`, boss `Lorde da Cripta 80`
- Citadela: `Anjo Caido 81`, `Drake Celeste 83`, `Executor Astral 88`, boss `Imperador do Eclipse 90`
- Panteao: `Guardiao Aureo 91`, `Oraculo Radiante 93`, `Quimera Solar 98`, boss `Avatar do Zenith 100`
- Cataclismo: `Arauto do Cataclismo 101`, `Titan Rachado 103`, `Serafim do Fim 108`, boss `Deus da Ruina 110`
- Paradoxo: `Guardiao Temporal 111`, `Oraculo do Zero 113`, `Devorador de Eras 118`, boss `Soberano do Paradoxo 120`

## Spawn de inimigos nas regioes normais
- Cada inimigo tem `weight` base definido na propria regiao.
- O jogo ajusta o peso pela diferenca de nivel entre heroi e inimigo.
- Regra atual:
  - se `gap <= 3`, o peso fica intacto
  - acima disso, o peso comeca a cair
  - comum perde chance mais rapido
  - incomum perde mais devagar
  - raro perde menos
- Penalidade:
  - `gapExcedente = gap - 3`
  - multiplicador por raridade:
    - `comum = 1.45`
    - `incomum = 0.9`
    - `rara = 0.55`
  - formula:
    - `penalty = 1 + (gapExcedente * 2.4 * fatorRaridade) + (gapExcedente^2 * 1.1 * fatorRaridade)`
    - `peso ajustado = max(1, pesoBase / penalty)`
- O raro tem trava adicional:
  - so comeca a ganhar espaco acima da chance base se o heroi estiver ao menos `1 nivel` acima do raro
  - a liberacao vai crescendo ate `3 niveis acima`
- Regra especial de inicio:
  - nos `3 primeiros inimigos` da campanha, a Floresta força `Lobo Sombrio`

## Dungeon online
- Nao exige mais nivel minimo.
- Continua sendo online para ate `3 jogadores`.
- Ordem dos turnos:
  - todos os herois em ordem
  - depois o inimigo
- O inimigo da dungeon ataca apenas `1 heroi aleatorio`, e nao mais todo o grupo.
- A dungeon nao usa spawn aleatorio.
- A sequencia segue exatamente a progressao do jogo:
  - todos os inimigos de uma regiao na ordem definida
  - depois o boss da regiao
  - e assim sucessivamente ate o boss final
- Escala de nivel na dungeon:
  - `nivel do inimigo da dungeon = nivel base do inimigo * quantidade de herois conectados`
- Como os status dos inimigos dependem do nivel, `HP`, `ATQ`, `armadura` e outros derivados sobem junto.

## Armadura dos inimigos por regiao
- Formula base:
  - `armadura = floor(nivel * armorScale) + armorFlat`
  - bosses recebem bonus adicional
- Perfis atuais:
  - Floresta: `0.10 * nivel + 1`
  - Caverna: `0.14 * nivel + 2`
  - Ruinas: `0.20 * nivel + 3`
  - Pantano: `0.24 * nivel + 5`
  - Vulcao: `0.46 * nivel + 16`
  - Abismo: `0.58 * nivel + 22`
  - Fortaleza: `0.72 * nivel + 30`
  - Necropole: `0.86 * nivel + 40`
  - Citadela: `1.02 * nivel + 54`
  - Panteao: `1.22 * nivel + 70`
  - Cataclismo: `1.46 * nivel + 90`
  - Paradoxo: `1.68 * nivel + 112`

## Bosses: status base por regiao
- Ent Ancestral: `nivel 10`, `170 HP`, `15 ATQ`, `60 MP`
- Troll das Profundezas: `nivel 20`, `250 HP`, `22 ATQ`, `70 MP`
- Rei Espectral: `nivel 30`, `340 HP`, `30 ATQ`, `90 MP`
- Hidra do Lodo: `nivel 40`, `470 HP`, `36 ATQ`, `120 MP`
- Draco Magmatico: `nivel 50`, `610 HP`, `48 ATQ`, `150 MP`
- Arauto do Vazio: `nivel 60`, `760 HP`, `58 ATQ`, `180 MP`
- General de Aco: `nivel 70`, `920 HP`, `68 ATQ`, `210 MP`
- Lorde da Cripta: `nivel 80`, `1100 HP`, `79 ATQ`, `240 MP`
- Imperador do Eclipse: `nivel 90`, `1320 HP`, `92 ATQ`, `280 MP`
- Avatar do Zenith: `nivel 100`, `1540 HP`, `108 ATQ`, `320 MP`
- Deus da Ruina: `nivel 110`, `1820 HP`, `130 ATQ`, `360 MP`
- Soberano do Paradoxo: `nivel 120`, `2120 HP`, `148 ATQ`, `410 MP`

## Bosses: habilidades e numeros

### Observacao importante
- Os valores abaixo sao os numeros base definidos no `bossAbilityCatalog`.
- Na batalha real, o jogo ainda aplica multiplicadores da regiao via `getBossDifficultyProfile`.
- Regioes mais avancadas tem multiplicadores maiores para:
  - `HP`
  - `ATQ`
  - `poder da skill`
  - `mana`
  - `armadura`

### Ent Ancestral
- `Raizes Esmagadoras`
  - tipo: `max_hp`
  - custo: `18`
  - poder base: `34`
  - variancia: `6`
  - dano adicional por vida maxima do heroi: `4%`
  - reduz dano do heroi em `15%` por `2 turnos`

### Troll das Profundezas
- `Eco de Pedra`
  - tipo: `shield_breaker`
  - custo: `22`
  - poder base: `54`
  - variancia: `8`
  - ignora escudo
  - bonus se o heroi estiver com escudo: `+26`
  - ganha escudo proprio de `12% da vida maxima`
  - duracao do escudo: `2 turnos`

### Rei Espectral
- `Lamento Real`
  - tipo: `nuke`
  - custo: `28`
  - poder base: `78`
  - variancia: `8`
  - reduz cura recebida pelo heroi em `40%` por `3 turnos`
  - reduz dano do heroi em `12%` por `2 turnos`

### Hidra do Lodo
- `Sopro Corrosivo`
  - tipo: `nuke`
  - custo: `32`
  - poder base: `96`
  - variancia: `10`
  - queimadura no heroi: `3%` por `3 turnos`
  - reducao de cura recebida: `50%` por `3 turnos`
- `Pele Viscosa`
  - tipo: `buff`
  - custo: `18`
  - duracao: `4 turnos`
  - bonus de ataque: `18%`
  - bonus de dano fixo: `10`
  - regeneracao: `5%`
  - escudo proprio: `10% da vida maxima`
  - duracao do escudo: `4 turnos`

### Draco Magmatico
- `Explosao Vulcanica`
  - tipo: `nuke`
  - custo: `38`
  - poder base: `124`
  - variancia: `12`
  - queimadura: `4%` por `4 turnos`
  - reducao de cura recebida: `25%` por `3 turnos`
- `Escamas Ardentes`
  - tipo: `buff`
  - custo: `24`
  - duracao: `4 turnos`
  - bonus de ataque: `22%`
  - bonus de dano fixo: `14`
  - perfuracao adicional: `6%`
  - escudo proprio: `14% da vida maxima`
  - duracao do escudo: `3 turnos`

### Arauto do Vazio
- `Dilacerar Realidade`
  - tipo: `pierce`
  - custo: `44`
  - poder base: `156`
  - variancia: `14`
  - dano adicional por vida maxima do heroi: `5%`
  - ignora escudo
  - ignora reducao fixa de dano
  - reduz dano do heroi em `15%` por `2 turnos`
- `Manto do Vazio`
  - tipo: `buff`
  - custo: `24`
  - duracao: `4 turnos`
  - bonus de ataque: `24%`
  - bonus de dano fixo: `14`
  - perfuracao adicional: `14%`
  - escudo proprio: `12% da vida maxima`
  - duracao do escudo: `4 turnos`

### General de Aco
- `Marcha de Ferro`
  - tipo: `nuke`
  - custo: `48`
  - poder base: `188`
  - variancia: `16`
  - reduz dano do heroi em `25%` por `3 turnos`
- `Ordem de Guerra`
  - tipo: `buff`
  - custo: `26`
  - duracao: `4 turnos`
  - bonus de ataque: `28%`
  - bonus de dano fixo: `22`
  - escudo proprio: `14% da vida maxima`
  - duracao do escudo: `4 turnos`
- `Estocada Rasga-Aco`
  - tipo: `shield_breaker`
  - custo: `28`
  - poder base: `108`
  - variancia: `10`
  - ignora escudo
  - bonus contra escudo: `+46`
  - chance de pular turno do heroi: `12%`

### Lorde da Cripta
- `Sentenca Funebre`
  - tipo: `nuke`
  - custo: `52`
  - poder base: `220`
  - variancia: `18`
  - reduz cura recebida em `50%` por `4 turnos`
  - reduz dano do heroi em `15%` por `2 turnos`
- `Pacto Funebre`
  - tipo: `buff`
  - custo: `28`
  - duracao: `4 turnos`
  - bonus de ataque: `22%`
  - bonus de dano fixo: `18`
  - regeneracao: `7%`
  - escudo proprio: `16% da vida maxima`
  - duracao do escudo: `4 turnos`
- `Ceifa do Desprotegido`
  - tipo: `execute_unshielded`
  - custo: `30`
  - poder base: `116`
  - variancia: `12`
  - bonus se o heroi estiver sem escudo: `+54`
  - queimadura: `4%` por `3 turnos`

### Imperador do Eclipse
- `Ruptura Estelar`
  - tipo: `nuke`
  - custo: `60`
  - poder base: `260`
  - variancia: `20`
  - chance de pular turno do heroi: `18%`
  - reduz dano do heroi em `18%` por `2 turnos`
- `Dominio Crepuscular`
  - tipo: `buff`
  - custo: `32`
  - duracao: `4 turnos`
  - bonus de ataque: `30%`
  - bonus de dano fixo: `20`
  - perfuracao adicional: `16%`
  - escudo proprio: `18% da vida maxima`
  - duracao do escudo: `4 turnos`
- `Lamina Umbra`
  - tipo: `pierce`
  - custo: `32`
  - poder base: `136`
  - variancia: `14`
  - ignora escudo
  - ignora reducao fixa
  - reduz cura recebida em `35%` por `3 turnos`

### Avatar do Zenith
- `Julgamento Solar`
  - tipo: `nuke`
  - custo: `66`
  - poder base: `305`
  - variancia: `22`
  - queimadura: `5%` por `3 turnos`
  - reduz cura recebida em `35%` por `3 turnos`
- `Aurea Divina`
  - tipo: `buff`
  - custo: `34`
  - duracao: `4 turnos`
  - bonus de ataque: `26%`
  - bonus de dano fixo: `22`
  - regeneracao: `6%`
  - escudo proprio: `20% da vida maxima`
  - duracao do escudo: `4 turnos`
- `Prisma do Zenith`
  - tipo: `shield_breaker`
  - custo: `36`
  - poder base: `152`
  - variancia: `16`
  - ignora escudo
  - bonus contra escudo: `+56`
  - reduz dano do heroi em `25%` por `2 turnos`
- `Clarao Absoluto`
  - tipo: `nuke`
  - custo: `34`
  - poder base: `128`
  - variancia: `14`
  - chance de pular turno do heroi: `35%`
  - reduz dano do heroi em `15%` por `2 turnos`

### Deus da Ruina
- `Colapso Final`
  - tipo: `max_hp`
  - custo: `74`
  - poder base: `360`
  - variancia: `24`
  - dano adicional por vida maxima do heroi: `8%`
  - reduz cura recebida em `50%` por `4 turnos`
- `Manto da Ruina`
  - tipo: `buff`
  - custo: `40`
  - duracao: `4 turnos`
  - bonus de ataque: `34%`
  - bonus de dano fixo: `34`
  - perfuracao adicional: `20%`
  - regeneracao: `4%`
  - escudo proprio: `22% da vida maxima`
  - duracao do escudo: `4 turnos`
- `Aniquilacao Perfurante`
  - tipo: `pierce`
  - custo: `40`
  - poder base: `186`
  - variancia: `18`
  - ignora escudo
  - ignora reducao fixa
  - reduz dano do heroi em `30%` por `3 turnos`
- `Fim dos Fracos`
  - tipo: `execute_unshielded`
  - custo: `42`
  - poder base: `170`
  - variancia: `18`
  - bonus contra alvo sem escudo: `+70`
  - chance de pular turno do heroi: `30%`
  - queimadura: `6%` por `3 turnos`

### Soberano do Paradoxo
- `Ruptura Temporal`
  - tipo: `nuke`
  - custo: `82`
  - poder base: `398`
  - variancia: `24`
  - chance de pular turno do heroi: `28%`
  - reduz dano do heroi em `20%` por `3 turnos`
- `Armadura de Eras`
  - tipo: `buff`
  - custo: `44`
  - duracao: `4 turnos`
  - bonus de ataque: `36%`
  - bonus de dano fixo: `38`
  - perfuracao adicional: `18%`
  - regeneracao: `5%`
  - escudo proprio: `24% da vida maxima`
  - duracao do escudo: `4 turnos`
- `Colapso do Zero`
  - tipo: `pierce`
  - custo: `46`
  - poder base: `214`
  - variancia: `18`
  - ignora escudo
  - ignora reducao fixa
  - reduz cura recebida em `45%` por `4 turnos`
- `Fim Inadiavel`
  - tipo: `execute_unshielded`
  - custo: `48`
  - poder base: `184`
  - variancia: `16`
  - dano adicional por vida maxima do heroi: `10%`
  - bonus contra alvo sem escudo: `+80`
  - queimadura: `5%` por `3 turnos`
  - chance de pular turno do heroi: `18%`

## Bosses: limite de habilidades por regiao
- Floresta ate Ruinas: `1 habilidade`
- Pantano ate Abismo: `2 habilidades`
- Fortaleza ate Citadela: `3 habilidades`
- Panteao ate Paradoxo: `4 habilidades`

## Trophies
- O jogo agora tem categorias separadas e filtro visual na Sala de Trofeus.
- Categorias atuais incluem:
  - `Combate`
  - `Chefes`
  - `Economia`
  - `Equipamentos`
  - `Colecao`
  - `Progressao`
  - `Sobrevivencia`
  - `Dungeon`

## Observacao sobre organizacao do codigo
- O `index.html` ja esta muito grande e hoje mistura:
  - estrutura HTML
  - CSS
  - dados do jogo
  - formulas de balanceamento
  - renderizacao da UI
  - multiplayer da dungeon
  - audio
  - salvamento
- Para continuar evoluindo o jogo com menos risco, o ideal e separar em varios arquivos:
  - `index.html`: so estrutura da pagina
  - `assets/styles/game.css`: todo o CSS
  - `assets/js/data/*.js`: regioes, drops, sets, bosses, trofeus
  - `assets/js/systems/*.js`: combate, inventario, dungeon, save, audio
  - `assets/js/ui/*.js`: render da batalha, acampamento, trofeus, bestiario
  - `assets/js/main.js`: bootstrap do jogo
- Beneficios esperados:
  - menos chance de quebrar partes distantes por acidente
  - mais facil de achar bugs
  - mais facil atualizar documentacao
  - mais facil mexer em classes, bosses e dungeon sem ficar num arquivo de quase `500 KB`

## Drops extras e artesao
- Cada inimigo normal agora tambem pode dropar um `material de criatura` com `20%` de chance.
- Esses materiais sao partes do monstro e ficam no inventario principal.
- O `Artesao` do vilarejo usa os materiais da `regiao atual`.
- Cada receita do artesao monta uma peca `comum` do set regional.
- Todas as receitas usam pelo menos `1 material de cada inimigo` da regiao e adicionam custos extras conforme o slot.
- O `Ferreiro` continua sendo a forma de subir a raridade depois da montagem.

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

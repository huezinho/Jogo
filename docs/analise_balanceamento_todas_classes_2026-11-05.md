# Balanceamento de todas as classes — 05/11/2026

## Escopo e régua

96 campanhas aceleradas: 16 especializações × três sementes (101, 202, 303) × antes/depois. Cada campanha começa no nível 1 e percorre os estágios de classe-base e subclasse; continua até vencer o Soberano ou acumular 11 mortes já no nível 100 com seis peças lendárias. Não envolve torre, dungeon ou arena.

A régua é o alcance mediano e o esforço observado na preparação padronizada. Concluir o jogo é registrado, mas não é requisito de equilíbrio. Uma rota pode estar próxima da maioria mesmo sem concluir nenhuma campanha.

Antes usa game.js do commit d8ea212; depois usa somente os ajustes aprovados nesta rodada. Ambas usam o mesmo restante do código e a mesma política de decisão. Essa comparação substitui comparar diretamente com os relatórios antigos, pois XP, regeneração de mana e políticas já mudaram desde aqueles testes.

## Alterações executadas

- Recuperar Fôlego: desde Cavaleiro, remove uma aplicação de queimadura, veneno ou sangramento, escolhendo o maior dano por turno. Paladino e Berserker herdam. Não remove todas as pilhas nem marcas/execuções; efeitos já podem causar dano no início do turno antes da ação.
- Ira: sacrifício de 70% → 50% da vida máxima; demais efeitos preservados.
- Sniper: crítico base do Headshot de 70% → 60%; Ponto Fraco de 25% → 20% da vida atual do inimigo.
- Incendiário: Bola de Fogo de 5% → 3% da vida atual do inimigo na parcela adicional.
- Corrompido: Incorporar Demônio de +200% → +160% de dano, mantendo custo, duração e vulnerabilidade.
- Atirador Arcano, demais classes, inimigos e equipamentos não foram rebalanceados nesta rodada.

## Método e limites

Combates, habilidades, efeitos, IA inimiga, XP e drops usam o motor real. Atributos distribuídos equilibradamente. Recuperação completa entre lutas; sem poções. Cada derrota/fuga concede um nível até 100; falhas repetidas também melhoram uma peça, e derrotas no nível 100 melhoram uma peça até seis lendários. Fabricação inicial usa recursos obtidos. Equipamentos iniciais da Floresta/Caverna são mantidos nos aprimoramentos, com acessório da Floresta. Não há otimização de conjuntos, busca de acessórios específicos ou medição de tempo de farm.

A política reconhece Pacto Fúnebre, remoção/roubo de buffs e algumas defesas contra golpes carregados. A Natureza usa uma política nova para marcas, raízes, venenos, colheita, cura e escudo. É uma estratégia heurística, não uma busca da melhor rotação. Uso baixo de uma habilidade pode indicar problema de decisão da política, e não provar falta de utilidade no jogo.

As sementes são iguais por rota, mas mudar uma ação altera o consumo de sorteios e os encontros posteriores. Diferenças são descritivas, não estimativas causais isoladas. Três sementes não estabelecem taxas populacionais. Os estágios anteriores à escolha de subclasse se repetem entre rotas; não são amostras independentes de classes-base.

**Antes:** 15344 combates, 3958 mortes, 14/48 conclusões. Mediana da região alcançada: 12,0 na ordem das 12 regiões. 30/48 chegaram ao Paradoxo.

**Depois:** 15483 combates, 3969 mortes, 14/48 conclusões. Mediana da região alcançada: 12,0 na ordem das 12 regiões. 30/48 chegaram ao Paradoxo.

## Comparação por especialização

| Especialização | Parada antes | Parada depois | Mortes medianas antes → depois | Nível final mediano antes → depois |
|---|---|---|---:|---:|
| Paladino | Deus da Ruina (3/3) | Deus da Ruina (3/3) | 85 → 83 | 100 → 100 |
| Berserker | Avatar do Zenith (3/3) | Deus da Ruina (1/3); Avatar do Zenith (2/3) | 82 → 86 | 100 → 100 |
| Samurai | Avatar do Zenith (3/3) | Avatar do Zenith (3/3) | 86 → 86 | 100 → 100 |
| Ninja | Campanha concluída (1/3); Deus da Ruina (1/3); Soberano do Paradoxo (1/3) | Campanha concluída (1/3); Deus da Ruina (1/3); Soberano do Paradoxo (1/3) | 86 → 86 | 100 → 100 |
| Mago Incendiario | Campanha concluída (3/3) | Campanha concluída (3/3) | 61 → 62 | 88 → 89 |
| Mago Frigido | Deus da Ruina (1/3); Soberano do Paradoxo (2/3) | Deus da Ruina (1/3); Soberano do Paradoxo (2/3) | 80 → 80 | 100 → 100 |
| Arquimago | Soberano do Paradoxo (3/3) | Soberano do Paradoxo (3/3) | 88 → 88 | 100 → 100 |
| Corrompido | Campanha concluída (3/3) | Campanha concluída (3/3) | 60 → 65 | 84 → 87 |
| Atirador Arcano | Campanha concluída (2/3); Soberano do Paradoxo (1/3) | Campanha concluída (2/3); Soberano do Paradoxo (1/3) | 76 → 76 | 96 → 96 |
| Sniper | Campanha concluída (3/3) | Campanha concluída (3/3) | 78 → 75 | 98 → 95 |
| Espreitador | Soberano do Paradoxo (3/3) | Soberano do Paradoxo (3/3) | 87 → 87 | 100 → 100 |
| Guarda Florestal | Soberano do Paradoxo (1/3); Campanha concluída (2/3) | Soberano do Paradoxo (1/3); Campanha concluída (2/3) | 79 → 79 | 100 → 100 |
| Druida Sombrio | Avatar do Zenith (3/3) | Avatar do Zenith (3/3) | 91 → 91 | 100 → 100 |
| Avatar da Natureza | Avatar do Zenith (3/3) | Avatar do Zenith (3/3) | 90 → 90 | 100 → 100 |
| Fada Monarca | Soberano do Paradoxo (3/3) | Soberano do Paradoxo (3/3) | 84 → 84 | 100 → 100 |
| Protetor da Floresta | Deus da Ruina (1/3); Soberano do Paradoxo (2/3) | Deus da Ruina (1/3); Soberano do Paradoxo (2/3) | 86 → 86 | 100 → 100 |

## Leitura dos resultados

A mediana continua no Paradoxo. Paladino, Berserker, Samurai, Druida Sombrio e Avatar da Natureza ainda ficaram abaixo desse alcance nas três sementes, mesmo que Berserker tenha avançado ao Cataclismo em uma. Frígido, Ninja e Protetor chegaram ao Paradoxo em duas; as demais rotas chegaram em todas. Não concluir o Soberano, isoladamente, não é tratado como fraqueza.

Os ajustes não aproximaram suficientemente os extremos nesta amostra. Sniper, Incendiário e Corrompido continuam concluindo nas três sementes. Corrompido passou de nível final mediano 84 para 87; Incendiário de 88 para 89. O Sniper passou de 98 para 95 apesar da redução, o que demonstra que três trajetórias com RNG divergente não permitem inferir o efeito causal pela mediana isolada.

Paladino reduziu a mediana de mortes de 85 para 83, mas continuou bloqueado no Deus da Ruína. Uma limpeza por ação não garante escapar de uma condição de execução já atingida antes da próxima ação. Berserker passou do Zenith em uma semente; sua mediana de mortes aumentou de 82 para 86, portanto não há melhora uniforme. As rotas não alteradas são controles: seus resultados individuais devem permanecer idênticos entre versões.

A Natureza foi incluída pela primeira vez nessa preparação. Druida Sombrio e Avatar concentram falhas no Zenith. Fada Monarca chega ao Soberano em todas; Protetor chega nele em duas, parando no Deus da Ruína na outra. A comparação não sustenta aumentar indiscriminadamente toda a classe Natureza.

Nenhum ajuste adicional foi aplicado a partir desses resultados. Antes de uma segunda rodada, testar conjuntos adequados e políticas alternativas é particularmente importante para Samurai e Druidas. A política pode subutilizar habilidades condicionais e acessórios da Floresta podem ser inadequados contra Pacto Fúnebre.

## Detalhes por rota

### Paladino

Rota: Guerreiro → cavaleiro → paladino.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Deus da Ruina → Deus da Ruina | 100 → 100 | 78 → 76 | 2286 → 2803 |
| 202 | Deus da Ruina → Deus da Ruina | 100 → 100 | 91 → 90 | 2440 → 4358 |
| 303 | Deus da Ruina → Deus da Ruina | 100 → 100 | 85 → 83 | 2140 → 2818 |

Maiores concentrações de derrotas/fugas depois: Deus da Ruina: 81; Avatar do Zenith: 66; Carrasco de Guerra: 55; Fantasma Antigo: 28.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 227 | 60 | 7 |
| 30–59 | 390 | 70 | 7,0 |
| 60–79 | 285 | 54 | 5 |
| 80–100 | 129 | 93 | 4 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Recuperar Folego | 4533 |
| Esbarrao | 1657 |
| Contundir | 1089 |
| Brado | 462 |
| Julgamento | 1035 |
| Escudo de Fe | 27 |

Ataques básicos: 1167. Passar/perder turno registrado pela política: 9.

### Berserker

Rota: Guerreiro → cavaleiro → berserker.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Avatar do Zenith → Deus da Ruina | 100 → 100 | 77 → 77 | 2887 → 2789 |
| 202 | Avatar do Zenith → Avatar do Zenith | 100 → 100 | 92 → 91 | 2640 → 4479 |
| 303 | Avatar do Zenith → Avatar do Zenith | 100 → 100 | 82 → 86 | 2683 → 2910 |

Maiores concentrações de derrotas/fugas depois: Avatar do Zenith: 98; Carrasco de Guerra: 55; Fantasma Antigo: 28; Deus da Ruina: 20.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 227 | 60 | 7 |
| 30–59 | 390 | 70 | 7,0 |
| 60–79 | 198 | 59 | 9,0 |
| 80–100 | 97 | 93 | 7 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Recuperar Folego | 5594 |
| Esbarrao | 1781 |
| Contundir | 1152 |
| Ira | 314 |
| Vallhala | 137 |
| Voce Ira Me Parar? | 0 |

Ataques básicos: 1167. Passar/perder turno registrado pela política: 33.

### Samurai

Rota: Guerreiro → espadachim → samurai.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Avatar do Zenith → Avatar do Zenith | 100 → 100 | 86 → 86 | 3080 → 3080 |
| 202 | Avatar do Zenith → Avatar do Zenith | 100 → 100 | 94 → 94 | 3033 → 3033 |
| 303 | Avatar do Zenith → Avatar do Zenith | 100 → 100 | 86 → 86 | 2808 → 2808 |

Maiores concentrações de derrotas/fugas depois: Avatar do Zenith: 64; Draco Magmatico: 34; Fantasma Antigo: 28; Guardiao Aureo: 27.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 227 | 60 | 7 |
| 30–59 | 248 | 81 | 8,0 |
| 60–79 | 142 | 60 | 9,0 |
| 80–100 | 153 | 93 | 14 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Recuperar Folego | 4516 |
| Investida | 1027 |
| Golpes Velozes | 52 |
| Corte Profundo | 267 |
| Furar Blindagem | 711 |
| Cortes Ultrasonicos | 304 |

Ataques básicos: 2030. Passar/perder turno registrado pela política: 14.

### Ninja

Rota: Guerreiro → espadachim → ninja.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Campanha concluída → Campanha concluída | 100 → 100 | 76 → 76 | 3418 → 3418 |
| 202 | Deus da Ruina → Deus da Ruina | 100 → 100 | 94 → 94 | 2626 → 2626 |
| 303 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 86 → 86 | 2858 → 2858 |

Maiores concentrações de derrotas/fugas depois: Draco Magmatico: 34; Soberano do Paradoxo: 31; Fantasma Antigo: 28; Avatar do Zenith: 28.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 227 | 60 | 7 |
| 30–59 | 248 | 81 | 8,0 |
| 60–79 | 274 | 52 | 5,0 |
| 80–100 | 260 | 91 | 8,0 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Recuperar Folego | 3972 |
| Investida | 1027 |
| Golpes Velozes | 662 |
| Corte Profundo | 668 |
| Bomba de Fumaca | 1023 |
| Mata-Gigantes | 370 |

Ataques básicos: 1167. Passar/perder turno registrado pela política: 13.

### Mago Incendiario

Rota: Mago → elementalista → mago_incendiario.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Campanha concluída → Campanha concluída | 90 → 92 | 61 → 62 | 1493 → 1524 |
| 202 | Campanha concluída → Campanha concluída | 88 → 89 | 59 → 59 | 1684 → 1689 |
| 303 | Campanha concluída → Campanha concluída | 86 → 86 | 77 → 77 | 1108 → 1071 |

Maiores concentrações de derrotas/fugas depois: Avatar do Zenith: 42; Carrasco de Guerra: 37; Draco Magmatico: 33; Slime Toxico: 20.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 286 | 51 | 5,0 |
| 30–59 | 292 | 75 | 5,0 |
| 60–79 | 230 | 56 | 5,0 |
| 80–100 | 202 | 25 | 1,0 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Explosao de Mana | 360 |
| Bola de Fogo | 1592 |
| Bafo de Fogo | 362 |
| Fenix Sagrada | 536 |
| Explodir | 202 |

Ataques básicos: 1213. Passar/perder turno registrado pela política: 19.

### Mago Frigido

Rota: Mago → elementalista → mago_frigido.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Deus da Ruina → Deus da Ruina | 100 → 100 | 79 → 79 | 3057 → 3057 |
| 202 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 80 → 80 | 1973 → 1973 |
| 303 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 102 → 102 | 1660 → 1660 |

Maiores concentrações de derrotas/fugas depois: Avatar do Zenith: 53; Carrasco de Guerra: 46; Soberano do Paradoxo: 34; Draco Magmatico: 33.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 286 | 51 | 5,0 |
| 30–59 | 292 | 75 | 5,0 |
| 60–79 | 295 | 53 | 9 |
| 80–100 | 226 | 91 | 4,0 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Explosao de Mana | 389 |
| Bola de Neve | 3383 |
| Congelar | 0 |
| Nevasca | 204 |
| Avalanche | 970 |

Ataques básicos: 1723. Passar/perder turno registrado pela política: 21.

### Arquimago

Rota: Mago → arcanista → arquimago.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 88 → 88 | 2040 → 2040 |
| 202 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 85 → 85 | 2131 → 2131 |
| 303 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 100 → 100 | 1972 → 1972 |

Maiores concentrações de derrotas/fugas depois: Avatar do Zenith: 69; Soberano do Paradoxo: 40; Slime Toxico: 20; Deus da Ruina: 20.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 286 | 51 | 5,0 |
| 30–59 | 384 | 79 | 6,0 |
| 60–79 | 207 | 59 | 5 |
| 80–100 | 209 | 93 | 5 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Explosao de Mana | 3612 |
| Descarregar | 52 |
| Escudo de Mana | 590 |
| Concentracao | 343 |
| Sobrecarregar | 35 |

Ataques básicos: 1489. Passar/perder turno registrado pela política: 22.

### Corrompido

Rota: Mago → arcanista → corrompido.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Campanha concluída → Campanha concluída | 83 → 88 | 60 → 65 | 1755 → 1772 |
| 202 | Campanha concluída → Campanha concluída | 84 → 86 | 58 → 60 | 1841 → 1876 |
| 303 | Campanha concluída → Campanha concluída | 87 → 87 | 76 → 76 | 1440 → 1441 |

Maiores concentrações de derrotas/fugas depois: Avatar do Zenith: 40; Slime Toxico: 20; Draco Magmatico: 18; Deus da Ruina: 17.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 286 | 51 | 5,0 |
| 30–59 | 384 | 79 | 6,0 |
| 60–79 | 234 | 59 | 4,0 |
| 80–100 | 84 | 21 | 2,0 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Explosao de Mana | 2617 |
| Descarregar | 56 |
| Escudo de Mana | 164 |
| Corrupcao | 828 |
| Incorporar Demonio | 75 |

Ataques básicos: 1328. Passar/perder turno registrado pela política: 21.

### Atirador Arcano

Rota: Arqueiro → atirador → atirador_arcano.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Campanha concluída → Campanha concluída | 96 → 96 | 76 → 76 | 1897 → 1897 |
| 202 | Campanha concluída → Campanha concluída | 94 → 94 | 74 → 74 | 1578 → 1578 |
| 303 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 88 → 88 | 2676 → 2676 |

Maiores concentrações de derrotas/fugas depois: Soberano do Paradoxo: 56; Fantasma Antigo: 27; Slime Toxico: 20; General de Aco: 19.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 187 | 74 | 6 |
| 30–59 | 363 | 73 | 6 |
| 60–79 | 314 | 57 | 4,0 |
| 80–100 | 148 | 61 | 5,5 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Mirar | 1213 |
| Camuflagem | 660 |
| Headshot | 2705 |
| Tiro Perfurante | 14 |
| Emergencia Arcana | 308 |
| Sobreaquecer | 148 |

Ataques básicos: 996. Passar/perder turno registrado pela política: 107.

### Sniper

Rota: Arqueiro → atirador → sniper.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Campanha concluída → Campanha concluída | 98 → 95 | 78 → 76 | 1881 → 1931 |
| 202 | Campanha concluída → Campanha concluída | 100 → 94 | 79 → 74 | 2115 → 1873 |
| 303 | Campanha concluída → Campanha concluída | 85 → 97 | 63 → 75 | 2071 → 2508 |

Maiores concentrações de derrotas/fugas depois: Avatar do Zenith: 40; Soberano do Paradoxo: 28; Fantasma Antigo: 27; Slime Toxico: 20.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 187 | 74 | 6 |
| 30–59 | 363 | 73 | 6 |
| 60–79 | 209 | 59 | 5 |
| 80–100 | 196 | 46 | 5,0 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Mirar | 1197 |
| Camuflagem | 620 |
| Headshot | 2318 |
| Tiro Perfurante | 14 |
| Executar | 319 |
| Ponto Fraco | 512 |

Ataques básicos: 996. Passar/perder turno registrado pela política: 336.

### Espreitador

Rota: Arqueiro → cacador → espreitador.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 81 → 81 | 2962 → 2962 |
| 202 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 88 → 88 | 2424 → 2424 |
| 303 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 87 → 87 | 2771 → 2771 |

Maiores concentrações de derrotas/fugas depois: Avatar do Zenith: 77; Draco Magmatico: 34; Fantasma Antigo: 25; General de Aco: 24.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 187 | 74 | 6 |
| 30–59 | 346 | 59 | 6,0 |
| 60–79 | 220 | 55 | 8,0 |
| 80–100 | 190 | 93 | 11,0 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Mirar | 1485 |
| Camuflagem | 776 |
| Rajada de Flechas | 995 |
| Armadilha | 3634 |
| Surpresa | 159 |
| Mirar no Pe | 0 |

Ataques básicos: 996. Passar/perder turno registrado pela política: 112.

### Guarda Florestal

Rota: Arqueiro → cacador → guarda_florestal.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 84 → 84 | 3565 → 3565 |
| 202 | Campanha concluída → Campanha concluída | 100 → 100 | 79 → 79 | 3187 → 3187 |
| 303 | Campanha concluída → Campanha concluída | 100 → 100 | 76 → 76 | 2919 → 2919 |

Maiores concentrações de derrotas/fugas depois: Avatar do Zenith: 47; Soberano do Paradoxo: 38; Draco Magmatico: 34; Fantasma Antigo: 25.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 187 | 74 | 6 |
| 30–59 | 346 | 59 | 6,0 |
| 60–79 | 177 | 59 | 11 |
| 80–100 | 212 | 72 | 15,0 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Mirar | 1691 |
| Camuflagem | 881 |
| Rajada de Flechas | 1388 |
| Armadilha | 1760 |
| Tranquilizante | 281 |
| Tiro Cortante | 2392 |

Ataques básicos: 996. Passar/perder turno registrado pela política: 282.

### Druida Sombrio

Rota: Adepto da Natureza → druida → druida_sombrio.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Avatar do Zenith → Avatar do Zenith | 100 → 100 | 89 → 89 | 1769 → 1769 |
| 202 | Avatar do Zenith → Avatar do Zenith | 100 → 100 | 91 → 91 | 1411 → 1411 |
| 303 | Avatar do Zenith → Avatar do Zenith | 100 → 100 | 91 → 91 | 1376 → 1376 |

Maiores concentrações de derrotas/fugas depois: Avatar do Zenith: 107; Draco Magmatico: 29; Carrasco de Guerra: 27; Fantasma Antigo: 21.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 249 | 58 | 5 |
| 30–59 | 339 | 81 | 5 |
| 60–79 | 155 | 60 | 5 |
| 80–100 | 93 | 93 | 6 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Semente Viva | 2351 |
| Raizes | 1013 |
| Flor do Pantano | 499 |
| Colheita | 570 |
| Apodrecer | 0 |
| Colapso do Brejo | 0 |

Ataques básicos: 0. Passar/perder turno registrado pela política: 123.

### Avatar da Natureza

Rota: Adepto da Natureza → druida → avatar_da_natureza.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Avatar do Zenith → Avatar do Zenith | 100 → 100 | 89 → 89 | 2212 → 2212 |
| 202 | Avatar do Zenith → Avatar do Zenith | 100 → 100 | 91 → 91 | 1364 → 1364 |
| 303 | Avatar do Zenith → Avatar do Zenith | 100 → 100 | 90 → 90 | 1663 → 1663 |

Maiores concentrações de derrotas/fugas depois: Avatar do Zenith: 106; Draco Magmatico: 29; Carrasco de Guerra: 27; Lorde da Cripta: 26.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 249 | 58 | 5 |
| 30–59 | 339 | 81 | 5 |
| 60–79 | 222 | 59 | 6,0 |
| 80–100 | 93 | 93 | 6 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Semente Viva | 2214 |
| Raizes | 1552 |
| Flor do Pantano | 803 |
| Colheita | 0 |
| Forma Verdadeira | 283 |
| Esmagar Invasor | 96 |

Ataques básicos: 0. Passar/perder turno registrado pela política: 291.

### Fada Monarca

Rota: Adepto da Natureza → espirito_da_floresta → fada_monarca.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 84 → 84 | 3375 → 3375 |
| 202 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 84 → 84 | 3195 → 3195 |
| 303 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 87 → 87 | 3347 → 3347 |

Maiores concentrações de derrotas/fugas depois: Soberano do Paradoxo: 89; Avatar do Zenith: 45; Draco Magmatico: 40; Fantasma Antigo: 21.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 249 | 58 | 5 |
| 30–59 | 303 | 72 | 6 |
| 60–79 | 302 | 53 | 10,0 |
| 80–100 | 194 | 93 | 14,0 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Semente Viva | 999 |
| Raizes | 3132 |
| Encanto da Brisa | 392 |
| Cancao Ancestral | 3066 |
| Decreto da Rainha | 1911 |
| Coroar | 381 |

Ataques básicos: 0. Passar/perder turno registrado pela política: 36.

### Protetor da Floresta

Rota: Adepto da Natureza → espirito_da_floresta → protetor_da_floresta.

| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |
|---|---|---:|---:|---:|
| 101 | Deus da Ruina → Deus da Ruina | 100 → 100 | 85 → 85 | 2135 → 2135 |
| 202 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 86 → 86 | 3032 → 3032 |
| 303 | Soberano do Paradoxo → Soberano do Paradoxo | 100 → 100 | 86 → 86 | 2786 → 2786 |

Maiores concentrações de derrotas/fugas depois: Deus da Ruina: 58; Carrasco de Guerra: 46; Draco Magmatico: 40; Soberano do Paradoxo: 32.

| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |
|---|---:|---:|---:|
| 1–29 | 249 | 58 | 5 |
| 30–59 | 303 | 72 | 6 |
| 60–79 | 197 | 55 | 8 |
| 80–100 | 210 | 93 | 12,0 |

Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.

| Habilidade da rota final | Ações |
|---|---:|
| Semente Viva | 999 |
| Raizes | 3644 |
| Encanto da Brisa | 1188 |
| Cancao Ancestral | 1858 |
| Casulo de Vinhas | 0 |
| Jogar Espinhos | 237 |

Ataques básicos: 0. Passar/perder turno registrado pela política: 27.

## Alternativa para o Atirador Arcano — proposta, não aplicada

Headshot foi escolhido 2705 vezes; Emergência Arcana 308; Sobreaquecer 148; Tiro Perfurante 14. Isso aponta para testar a frequência do Headshot, em vez de reduzir uma parcela pequena do seu coeficiente.

Proposta: após usar Headshot na especialização Atirador Arcano, exigir uma ação ofensiva diferente antes de reutilizá-lo. Ataque básico ou outra habilidade ofensiva liberariam o disparo; poções, buffs e passar turno não. Manter fórmulas e não aplicar essa regra ao Sniper. A proposta força alternância e afeta o dano sustentado; precisa de simulação própria antes de ser adotada. Não foi aplicada nem testada nesta rodada.

## Reprodução e dados

- Executar `node scripts/run-campaign-balance.cjs` e `python scripts/generate-campaign-balance-report.py`.
- Motor e política: `scripts/campaign-balance-engine.js`.
- Resumo por campanha: `docs/qa/campaign-balance-2026-11-05/summary.csv`.
- Resultados resumidos: `docs/qa/campaign-balance-2026-11-05/results.json`.
- Evidência completa por luta, equipamentos, níveis concedidos, derrotas e uso de habilidades: `results.json.gz` na mesma pasta (JSON comprimido com gzip).
- Fórmulas atualizadas: `docs/referencia_habilidades_atual.md`.

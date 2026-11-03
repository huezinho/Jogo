# Rebalanceamento do Arqueiro — 03/11/2026

## Convenções e regras aplicadas

L = nível do herói; W = piso(0,5L); A = ataque ativo; P = poder de habilidade ativo; M = mana máxima; H = vida atual do inimigo. Cada parcela numérica é arredondada para baixo, como nas fórmulas anteriores. Habilidades herdadas recebem as alterações da classe anterior; efeitos de subclasse não citados permanecem.

| Classe | Habilidade | Nova regra |
| --- | --- | --- |
| Arqueiro | Mirar | +5+L de ataque e poder de habilidade por 5 turnos; mantém acerto garantido e sinergias das subclasses. |
| Arqueiro | Camuflagem | 5 turnos. |
| Atirador | Headshot | 60+W MP; dano 30+0,65A+0,65P. |
| Atirador | Tiro Perfurante | 80+W MP. |
| Atirador Arcano | Headshot | 60+0,4A+0,85P+0,35M. |
| Atirador Arcano | Emergência Arcana | 500 MP. |
| Sniper | Headshot | 30+0,85A+0,65P. |
| Sniper | Ponto Fraco | 100+0,65A+0,4P+0,25H. |
| Caçador | Camuflagem | 28% de esquiva adicional por 5 turnos. |
| Caçador | Armadilha | 80+W MP. |
| Caçador | Passos Leves | +18% moedas e +12% XP; mantém a esquiva da passiva. |
| Caçador | Errou | +12% de dano final por 2 turnos; as versões especiais das subclasses continuam próprias. |
| Espreitador | Rajada de Flechas | Um erro: próximo dano +16%; dois ou mais erros: +40%. Consome no próximo dano positivo. |
| Espreitador | Armadilha | 30+1,1P+0,06H; parcela de 6% da vida atual corrigida. |
| Espreitador | Mirar no Pé | Ataque −20%, armadura −50% mantida, 10% de chance de impedir o ataque em cada um dos 3 turnos. |
| Guarda Florestal | Armadilha | Se prender o alvo, próxima Rajada +23% por disparo. |
| Guarda Florestal | Tranquilizante | Redução de dano por 4 turnos. |
| Guarda Florestal | Resistência Florestal | Redução fixa = piso(0,46L). |

## Rastreio e interface

Custo = teto((50 + 8 × nível²) × fator de raridade). Fatores: comum 1, incomum 2, raro 4. Duração: 6 minutos; mantém pelo menos 90% de chance do alvo e exige vitória prévia sobre o chefe da região. Exemplos: Lobo Sombrio (Nv.1 comum), 58 moedas; Goblin (Nv.3 incomum), 244; Aranha Gigante (Nv.8 rara), 2.248; inimigo Nv.98 raro, 307.528. Ao carregar, rastreios antigos são limitados a seis minutos contados da contratação; se esse prazo já passou, expiram.

Debuffs compostos aplicados por habilidades guardam sua origem, mostram o nome sob o inimigo e expõem os componentes ativos em pop-up por mouse ou teclado. A origem e Mirar no Pé persistem no salvamento. Componentes expirados desaparecem do detalhe.

## Método da análise acelerada

12 campanhas: quatro rotas, sementes 101, 202 e 303. Início como Arqueiro nível 1; subclasses aos níveis normais, pontos equilibrados. Combate, encontros, recompensas, XP, drops, armaduras, efeitos e IA dos chefes usam o jogo. Após cada derrota, concede-se um nível se abaixo de 100; se o mesmo alvo derrotar novamente, concede-se também uma melhoria em uma peça, priorizando o slot de menor raridade. No nível 100, concede-se uma melhoria por derrota até seis lendários. Repete o inimigo que causou a derrota. O limite de desistência continua sendo 11 derrotas ocorridas já no nível 100 com seis lendários; sucesso encerra ao derrotar Paradoxo.

A preparação é artificial: vida e mana são restauradas entre combates e melhorias concedidas não cobram materiais/moedas. Craft inicial só ocorre se os drops e moedas ganhos permitirem; os itens iniciais da Floresta são mantidos nas melhorias, com Colar de Raízes como acessório. Não mede tempo de farm, economia de crafting, otimização de equipamento entre regiões ou progressão natural. A política usa Mirar e Camuflagem e estima dano/utilidade das habilidades disponíveis; não é prova de estratégia ótima.

## Resultados

| Rota | Semente | Resultado | Nível final | Mortes totais | Combates | Mortes com preparação máxima |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| Sniper | 101 | Vitória | 90 | 76 | 290 | 0 |
| Sniper | 202 | Vitória | 92 | 68 | 420 | 0 |
| Sniper | 303 | Vitória | 85 | 66 | 305 | 0 |
| Atirador Arcano | 101 | Vitória | 85 | 71 | 293 | 0 |
| Atirador Arcano | 202 | Vitória | 90 | 70 | 338 | 0 |
| Atirador Arcano | 303 | Vitória | 83 | 61 | 311 | 0 |
| Espreitador | 101 | Desistência | 100 | 100 | 354 | 11 |
| Espreitador | 202 | Desistência | 100 | 98 | 295 | 11 |
| Espreitador | 303 | Desistência | 100 | 91 | 346 | 11 |
| Guarda Florestal | 101 | Vitória | 100 | 92 | 311 | 1 |
| Guarda Florestal | 202 | Vitória | 95 | 82 | 264 | 0 |
| Guarda Florestal | 303 | Vitória | 91 | 71 | 299 | 0 |

Resultados recalculados após corrigir Armadilha para 6% da vida atual e rastreio para (50 + 8 × nível²) × raridade. Foram 12 campanhas, 9 vitórias e 3826 combates.

- Sniper: nível final 85–92; 66–76 mortes.
- Atirador Arcano: nível final 83–90; 61–71 mortes.
- Espreitador: nível final 100–100; 91–100 mortes.
- Guarda Florestal: nível final 91–100; 71–92 mortes.

A conclusão anterior sobre a parcela de 60% foi substituída: a habilidade agora usa 6% da vida atual. As amostras são pequenas e os resultados dependem da política e dos equipamentos iniciais; não estabelecem uma classificação universal. A preparação acelerada concede níveis, melhorias e recuperação, portanto os resultados não medem tempo de farm nem a economia natural do jogo.

## Verificação e arquivos

- `scripts/test-archer-balance.cjs`: fórmulas, herança, custos, passivas, duração, bônus por erro, controle por três turnos, rastreio, salvamento e tooltip em desktop/mobile.
- `scripts/test-warrior-balance.cjs`: regressão das alterações do Guerreiro.
- `docs/qa/campaign/skills.cjs`: 348 casos de habilidades/conjuntos.
- `docs/qa/campaign/services.cjs`: 8 verificações de serviços, incluindo rastreio pago e expiração.
- Dados brutos: `docs/qa/archer-progression/results.json`.
- Catálogo completo de 48 inimigos e 30 habilidades de chefe: `docs/inimigos_e_chefes_atual.md` e `docs/qa/enemy-catalog.json`.
- Referência atualizada de todas as classes: `docs/referencia_habilidades_atual.md`.

Arena e dungeon não receberam alterações próprias de balanceamento nesta revisão.

# Equipamentos da campanha — 03/11/2026

Escopo: campanha e oficina. Nenhuma alteração específica na arena/dungeon, que podem herdar funções compartilhadas.

## Fórmulas atuais

```
B = (1 + nível do herói × 0,5) × peso × fator de raridade
atributo = B × proporção regional × base de conversão
```

Sem nível ou multiplicador regional. Nível do herói de 1 a 100. Bases: vida=12, mana=12, ataque=2, poder=2, redução fixa=0,4, cura/escudo=1/300. Inteiros arredondam para baixo; percentuais truncam em quatro casas fracionárias. Vida e mana têm equivalência 1:1.

Pesos: pés=0,5; cabeça=0,6; pernas=0,8; peito=1; arma=1,2; acessório=0,6.

| Raridade | Atributos | Efeitos especiais dos artefatos | Progressão do preço |
|---|---:|---:|---:|
| Comum | 1 | 3 | 1 |
| Incomum | 1,5 | 4,5 | 6 |
| Rara | 2 | 6 | 20 |
| Ultra rara | 3 | 9 | 60 |
| Lendária | 4 | 12 | 280 |

Subidas de nível atualizam os atributos armazenados dos equipamentos equipados e da bolsa. Efeitos especiais dos artefatos não escalam por nível.

## Distribuição regional

| Região | Distribuição |
|---|---|
| Floresta | 30% vida, 40% mana, 30% poder |
| Caverna | 45% vida, 35% redução fixa, 20% ataque |
| Ruínas | 50% poder, 30% mana, 20% vida |
| Pântano | 35% mana, 35% poder, 30% vida |
| Vulcão | 55% poder, 30% ataque, 15% vida |
| Abismo | 40% ataque, 40% poder, 20% mana |
| Fortaleza | 45% vida, 40% redução fixa, 15% potência de escudo |
| Necrópole | 30% mana, 40% poder, 30% vida |
| Cidadela | 55% ataque, 25% poder, 20% mana |
| Panteão | 35% mana, 30% vida, 20% potência de cura, 15% potência de escudo |
| Cataclismo | 55% ataque, 30% vida, 15% redução fixa |
| Paradoxo | 30% ataque, 35% poder, 35% mana |


Armas usam apenas ataque e poder, renormalizados para 100%. Fortaleza/Panteão: Guerreiro/Arqueiro usam 100% ataque e Mago/Adepto 100% poder. Acessórios usam 20% do orçamento para vida e 20% para mana; o restante fica reservado ao efeito exclusivo.

## Artefatos

```
efeito = mínimo(limite próprio, efeito base × fator de raridade × 3)
```

Limites próprios de dano total: Encanto do Eclipse=15%; O Fim=150%. Seus efeitos atuais são, respectivamente, 3/4,5/6/9/12% e 30/45/60/90/120%. Demais limites ficam em EquipmentData.accessoryEffectCaps, com queimadura limitada a 95%. A chance de queda comum continua 3%.

## Redução fixa

Quatro peças da Caverna: piso(redução fixa geral × 1,08), incluindo passivas e acessório. O dano após redução fixa nunca fica negativo.

## Custos

```
Preço de referência = teto(270 × progressão da raridade × multiplicador do espaço)
```

Multiplicadores: arma=1,25; peito=1,18; cabeça/pernas/pés=1; acessório=4.

Fabricação somente comum. A melhoria cobra as diferenças positivas de materiais entre as duas receitas e a diferença de preços (mínimo de 100 moedas). Materiais da receita de referência: teto(quantidade-base × fator de raridade × 1,5), ou ×3 para acessórios. Como alguns componentes mudam entre raridades, o total efetivamente consumido é a soma da fabricação e das melhorias, não apenas a receita de referência da última raridade.

Acessórios comuns vêm da queda, sem fabricação; seus totais consideram somente melhorias. Ultra raro → lendário consome também outra cópia comum do mesmo acessório na bolsa. Falhas não consomem recursos.

Não há nível mínimo para lendários; o direcionamento ao late game é econômico.

## Mercenário

Além dos materiais, o contrato paga ouro e XP base. A região atual desbloqueada ao aceitar define o pagamento, mantido após viajar. Contratos antigos recebem uma referência regional na migração.

```
R = posição da região: Floresta=1, …, Paradoxo=12
D = simples:1; média:2; difícil:3
Ouro = piso(120 × 1,5^(R−1) × D)
XP base = piso(60 × 1,5^(R−1) × D)
```

Simples: menos de 10 alvos; média: 10–15; difícil: 16 ou mais. A progressão é geométrica, com incrementos maiores em cada região. O XP passa pelo ganho normal da campanha e seus bônus. Pagamento automático e único.

## Catálogo e validação

`node scripts/export-equipment-catalog.cjs` gera o catálogo em docs/equipamentos: 540 variantes com atributos no nível 50, materiais e moedas acumulados, próxima melhoria e cópia comum adicional. Materiais/custos não dependem do nível do herói.

`node scripts/test-equipment-balance.cjs` verifica 4.800 combinações, fatores, efeitos sem escala de nível, pagamentos regionais acelerados, pagamento único de ouro/XP, subida de nível, redução geral, oficina e save/reload.

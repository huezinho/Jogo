> Histórico: perfis, fabricação por raridade e recompensas selecionáveis foram substituídos. Consulte as [regras e análise atuais da campanha](analise_campanha_nivel40.md).

# Proposta de itens, atributos e conjuntos

Especificação inicial de design, agora acompanhada pelo protótipo implementado em 28/10/2026. Consulte [implementação e validação](implementacao_2026-10-28.md) para as regras efetivamente disponíveis e as adaptações. Os números continuam sujeitos à validação de balanceamento com equipamentos; este texto não é uma certificação de equilíbrio.

## Objetivo

Dar escolhas de build, permitir trocas entre sobrevivência e dano e criar rotações interessantes. O item deve ampliar a identidade da classe e deixar claro o custo da escolha. Há três problemas atuais a resolver antes: armas/armaduras são removidas na normalização; `getSetBonusValues()` devolve bônus zerados; a raridade multiplica os atributos de comum a lendário por 12. Acessórios com efeitos percentuais também passam por essa multiplicação.

O novo sistema deve ter orçamento de poder por nível, raridade com crescimento moderado e efeitos que disparam uma vez por ação. Isso é especialmente necessário porque mana, múltiplos projéteis e percentuais de HP já produzem escalas excessivas no motor atual.

## 1. Slots e identidade

| Slot | Função principal | Exemplos de atributos secundários | Conta para set? |
|---|---|---|---|
| Arma | Ataque ou poder de habilidade, ou mistura com orçamento dividido | MP, precisão, crítico | Sim |
| Cabeça | MP/utilidade | HP, poder, resistência a controle | Sim |
| Peito | HP/resistência | MP, potência de escudo | Sim |
| Pernas | Sobrevivência equilibrada | HP, resistência, dano periódico | Sim |
| Pés | Mobilidade/utilidade | Precisão, esquiva moderada, MP | Sim |
| Acessório | Um efeito de chefe que muda uma decisão | Um atributo menor | Não |

Armas mudam de aparência/nome conforme a classe, mas usam o mesmo orçamento. Equipamentos de armadura podem ser usados por qualquer classe. Evitar atributos que não funcionam em uma classe sem sinalização: por exemplo, chance de crítico atualmente é efetivamente usada pelo arqueiro; um crítico universal exigiria mudar o motor e rebalancear as outras classes.

O acessório fica fora do set para preservar a escolha entre utilidade, sustentação e efeito de chefe. Uma mesma peça não pode ocupar dois slots nem contar duas vezes. Quantidade de itens empilhados não aumenta a contagem de peças.

## 2. Orçamento de atributos

Usar o nível do item, e não recalcular o item pelo nível atual do jogador a cada carregamento. Versões novas devem ser obtidas por melhoria explícita. Ponto de partida:

`orçamento = (1 + 0,25 × nível do item) × peso do slot × fator de raridade`

| Slot | Peso |
|---|---:|
| Arma | 1,40 |
| Peito | 1,20 |
| Cabeça | 0,80 |
| Pernas | 0,90 |
| Pés | 0,70 |
| Acessório | 0,60, reservando parte para o efeito único |

Os cinco slots de set somam peso 5. Isso permite comparar trocar uma peça ofensiva por outra defensiva sem atribuir orçamento extra escondido a uma classe.

| Compra com 1 ponto de orçamento | Valor inicial proposto |
|---|---:|
| HP máximo | 15 |
| MP máximo | 12 |
| Ataque | 2 |
| Poder de habilidade | 2 |
| Resistência, como rating | 12 |
| Precisão, quando aplicável | 1 ponto percentual por 3 pontos de orçamento |
| Chance de crítico, quando aplicável | 1 ponto percentual por 4 pontos |
| Esquiva | 1 ponto percentual por 6 pontos |
| Dano periódico adicional | 1% por 3 pontos |
| Potência de cura/escudo | 1% por 3 pontos |

Não colocar força/vitalidade/sabedoria como pontos de personagem diretamente no item: o ganho por ponto depende do nível e mistura distribuição com equipamento. O item fornece atributos finais rastreáveis. Não conceder ataque **e** poder de habilidade pelo preço de um só atributo; hoje um ponto de força melhora os dois no personagem, mas esse comportamento não precisa se repetir no equipamento.

Perfis iniciais para gastar o orçamento: ofensivo, resistente, arcano e suporte. Eles dividem o mesmo total. Exemplo arcano: 50% poder, 30% MP e 20% HP. Resistência e utilidade substituem parte desses atributos, não entram gratuitamente.

### Exemplo concreto

Um cajado raro de nível 50 recebe `(1 + 12,5) × 1,4 × 1,2 = 22,68` pontos. Pode fornecer:

- +22 de poder de habilidade: 11 pontos.
- +84 de MP: 7 pontos.
- +60 de HP: 4 pontos.

Total gasto: 22 pontos. A sobra pequena é arredondamento, não um atributo oculto. Um cajado físico do mesmo nível poderia redistribuir os 22 pontos em ataque, precisão e HP.

Esse exemplo não resolve sozinho o balanceamento do jogo atual: antes é necessário corrigir Transbordando por projétil e a duplicação do bônus percentual nos mísseis.

## 3. Raridade e melhoria

| Raridade | Fator de atributos | Papel |
|---|---:|---|
| Comum | 1,00 | Peça utilizável e referência de poder |
| Incomum | 1,10 | Melhor qualidade sem salto de build |
| Rara | 1,20 | Boa peça para desenvolver um conjunto |
| Ultra rara | 1,30 | Ajuste adicional de qualidade/afixo |
| Lendária | 1,40 | Excelente peça, preservando escolhas de build |

Os bônus de set **não** multiplicam por raridade. Efeitos de chefe não viram 12 vezes mais fortes por serem lendários. Raridade pode melhorar números dentro do orçamento; o efeito único usa sua própria faixa e limites.

Escolher o perfil de atributos no crafting. Permitir refazer um secundário com custo progressivo, sem destruir o item nem exigir sorte para toda melhoria. A melhoria de raridade aumenta o orçamento da peça existente e preserva sua identidade. Uma versão lendária não deve invalidar automaticamente todas as peças de outras regiões.

## 4. Resistência e limites

Adicionar uma resistência de jogador com retorno decrescente:

`redução = rating / (rating + 100 + 10 × nível)`

Aplicar teto inicial de 45% para essa fonte de redução em PvE, com orçamento separado para escudo, invulnerabilidade e esquiva. A fórmula exige implementação; o jogo atual usa sobretudo redução fixa. Também é preciso rever como a armadura inimiga reduz cada projétil, para habilidades multi-hit não oscilarem entre dano zerado e dano explosivo.

Limites iniciais para testar:

- Itens somam no máximo +20 pontos percentuais de crítico e +10 de esquiva. Isso é limite da contribuição do equipamento, não substitui as chances próprias das habilidades.
- Redução de custo de MP por itens/sets: até 25%; nunca gera custo negativo. Habilidades de “toda a mana” têm regra explícita e não se tornam gratuitas por desconto.
- Cura, escudo e DOT de equipamento recebem orçamento próprio. Um efeito de set não pode reativar a si mesmo, outro proc ou reflexão em cadeia.
- Aplicar bônus globais de dano uma vez, em um ponto único da resolução.
- Efeito extra de item dispara uma vez por ação ou turno, conforme descrito. Treze mísseis não representam treze ativações.

## 5. Progressão de conjuntos: 2, 4 e 5 peças

Com cinco slots válidos, há decisões reais: completar 5 peças, manter 4 peças e uma peça com atributos melhores, ou misturar 2+2. O bônus de 2 peças é simples; o de 4 define a função; o de 5 recompensa uma sequência. Não exigir cinco peças só para o equipamento começar a ajudar.

Definições para a tabela:

- `P = ataque + poder de habilidade`, calculados no começo da ação.
- Dano extra é uma ocorrência identificada como efeito de equipamento, sem gerar outro proc.
- CD significa número de turnos próprios entre ativações; não é o cooldown da habilidade.
- Aumentos de atributos de 2 peças são aditivos dentro da categoria correspondente.
- Toda cura exige vida efetivamente recuperada; todo efeito de absorção exige dano efetivamente absorvido.

| Região / conjunto | 2 peças | 4 peças | 5 peças: efeito ao completar | Builds favorecidas |
|---|---|---|---|---|
| Floresta — Raízes Vivas | +6% MP | +8% DOT | Aplicar DOT em três ações distintas prepara a próxima cura/escudo com +20% de potência; consome as cargas | Natureza, desgaste, suporte |
| Caverna — Pedra Guardiã | +6% HP | +8% resistência de rating | Após receber três golpes diretos, ganha escudo de `min(8% HP máximo, 1,0P)`; CD 3 | Cavaleiro, Paladino, Avatar |
| Ruínas — Eco Antigo | +6% poder | Usar duas habilidades diferentes prepara +8% no próximo dano direto | Esse dano gera um eco de `min(25% do dano direto, 0,6P)`; CD 3; sem repetir controle/DOT | Combos de espada, magia e natureza |
| Pântano — Seiva Tóxica | +6% MP | +10% DOT | Dano em alvo com DOT aplica veneno de `0,12P` por 2 turnos; CD 3, uma aplicação por ação | Druida Sombrio, Guarda, magos DOT |
| Vulcão — Brasas Vivas | +6% poder | +8% dano direto contra alvo com DOT | A terceira habilidade ofensiva aplica queimadura de `0,15P` por 2 turnos; CD 3 | Incendiário e builds que alternam dano |
| Abismo — Corte do Vazio | +3% ataque e +3% poder | Ignora 15% da armadura, sem acumular repetidamente | Quebrar escudo ou aplicar redução de armadura prepara +15% no próximo dano direto, limitado a `1,0P` extra; CD 3 | Samurai, Ninja, Espreitador, Corrompido |
| Fortaleza — Bastião | +6% HP | +10% potência de escudo | Absorção prepara retaliação de 25% do absorvido, limitada a `0,6P`, no próximo ataque escolhido; CD 3 | Paladino, Protetor, Arcanista defensivo |
| Necrópole — Ceifa Lenta | +8% DOT | Cura 2% do DOT causado, limitada a 2% do próprio HP por turno | Com três DOTs próprios distintos, prolonga cada um em 1 turno; CD 3 e no máximo +2 turnos por aplicação | Sombrio e builds de múltiplos DOTs |
| Citadela — Eclipse Preciso | +4 pontos percentuais de crítico | +10% ao bônus de dano crítico, de forma aditiva | Após crítico, próxima habilidade ignora 20% da armadura; uma carga; CD 2 | Sniper, Atirador Arcano |
| Panteão — Farol do Grupo | +6% MP | +10% cura e escudo | Três ações de suporte efetivo preparam `0,20P` de dano adicional na próxima ofensiva; consome cargas; CD 2 | Fada, Protetor, suporte de grupo |
| Cataclismo — Fúria Contida | +6% ataque | +10% dano direto abaixo de 50% HP | Pagar custo de HP gera escudo de 50% do HP pago, limitado a `min(12% HP máximo, 1,2P)`; CD 3 | Berserker, Incendiário, Protetor |
| Paradoxo — Ruptura do Ciclo | +3% ataque e +3% poder | Alternar habilidades diferentes prepara +8% na próxima ofensiva | Após três habilidades diferentes, a próxima custa 15% menos MP e causa +12% dano direto baseado em atributos; CD 4 | Rotação híbrida, combos longos |

Os efeitos acima são protótipos de identidade. Não é necessário implementar os 12 de uma vez: testar primeiro Pedra Guardiã, Eco Antigo, Seiva Tóxica e Farol do Grupo. Eles exercitam defesa, sequência, DOT e suporte com menos sobreposição.

“Habilidade diferente” é identificador de habilidade diferente; clicar em três níveis do mesmo item ou receber três projéteis não conta. Dano extra de percentual de HP do alvo não é copiado por Eco Antigo ou multiplicado novamente pelo bônus de Paradoxo.

## 6. Acessórios de chefe

Manter um acessório por personagem, com efeito identificável e sem contar para o set. Exemplos de protótipo:

| Perfil | Efeito proposto | Limite |
|---|---|---|
| Sobrevivência | Evita um golpe fatal, deixando 1 HP | Uma vez por combate; não cria cura em loop |
| Sustentação | Cura pequena após usar uma habilidade defensiva | Uma vez por turno; exige cura efetiva |
| Combo | Próxima ofensiva após habilidade diferente ganha dano ligado a `P` | CD e teto por ação |
| Controle | Aplicar controle prepara escudo pequeno | Uma vez por turno; resistência de chefe considerada |
| Economia | Bônus de moeda ou material | Sem multiplicar efeitos de combate |

Rever especialmente o acessório O Fim: seu `totalDamagePercent` base é 1 e a raridade atual pode levar isso a 12, isto é, +1200% de dano antes das outras multiplicações. Uma peça final pode ter efeito especial, mas precisa permanecer dentro de um orçamento que permita comparar builds.

## 7. Obtenção, crafting e continuidade

1. Inimigos comuns fornecem materiais; elites fornecem componentes menos frequentes; chefe fornece componente de set/acessório.
2. O jogador escolhe peça, conjunto, perfil e classe visual da arma. Exemplo inicial de receita: oito materiais comuns da região, três de elite, um de chefe e moedas; os números devem seguir o tempo real de farm.
3. Drops diretos continuam como surpresa. A rota de crafting garante acesso e evita depender exclusivamente de sorte para completar um conjunto.
4. Elevar nível do item exige materiais da faixa atual e confirmação do resultado. O set antigo pode continuar relevante por seu efeito, com custo para acompanhar a progressão.
5. Cataclismo e Paradoxo podem fornecer itens de nível 100 e efeitos diferentes; não precisam continuar inflando números acima do limite do personagem.
6. Proteger favorito/equipado em venda e mostrar comparação, peças `2/5`, `4/5`, `5/5`, próximo bônus e custo de melhoria.

## 8. Ordem da matemática

Uma ordem recomendada, documentada e compartilhada pelos três modos:

1. Atributos de personagem + atributos planos de item.
2. Conversões de classe com fontes explícitas.
3. Bônus percentuais de atributos por categoria, aplicados uma vez.
4. Coeficiente da habilidade, com parcela percentual de HP separada e limitada em chefes.
5. Crítico e bônus de ação, uma vez.
6. Mitigação e resistências do alvo.
7. Escudo e HP.
8. DOT, cura, reflexão e procs com origem e limites próprios.
9. Consumo de recursos/cargas e registro da ação.

Não aplicar a mesma porcentagem nos passos 4 e 5, nem distribuir o bônus fixo inteiro a cada projétil. Dano de set usa `source: equipment_proc` e `canTriggerProcs: false` para evitar recursão.

## 9. Estrutura de dados sugerida

```json
{
  "schemaVersion": 2,
  "uid": "item-unico",
  "templateId": "pantano_staff_support",
  "slot": "weapon",
  "itemLevel": 50,
  "rarity": "rara",
  "setId": "seiva_toxica",
  "profile": "arcano",
  "stats": { "skillPower": 22, "bonusMp": 84, "bonusHp": 60 },
  "uniqueEffectId": null,
  "upgrades": { "quality": 0, "level": 0 }
}
```

O texto do item é gerado desses campos e dos dados do set. Efeitos de set ficam em catálogo central declarativo, sem `eval` ou código recebido da rede. O host valida identificadores e operações permitidas; o convidado não envia seus totais finais de dano/atributos como autoridade.

## 10. Como validar a proposta

Repetir a matriz de classes em três condições: sem itens, itens de orçamento igual com 2+2 peças e set completo. Usar as mesmas sementes de combate para comparar as mudanças e um lote novo para validação. Medir vitórias, turnos, dano direto/DOT, cura efetiva, absorção, MP gasto/recuperado e número de procs.

Verificar especialmente: mísseis com bônus fixo, crítico do Sniper, HP do Paladino, sacrifício do Berserker/Incendiário, DOT seguido de Colheita e escudo seguido de Jogar Espinhos. Em grupo, confirmar dono da cura/escudo/proc. Na arena, corrigir antes as defesas e o isolamento do save; depois aplicar regras próprias de percentual de HP, controle e cura se os testes exigirem.

Uma meta inicial de design é que equipamentos melhorem a build de forma perceptível, que 5 peças e 2+2 tenham escolhas úteis e que uma peça lendária não produza sozinha um salto de ordem de grandeza. Os valores finais devem vir da nova medição, não da fórmula isolada.

# Reformulação da dungeon — requisitos em implementação

Esta especificação substitui a estrutura de quatro regiões aleatórias, níveis por sala e ouro compartilhado da primeira versão. A campanha principal continua separada. Os esclarecimentos foram respondidos e incorporados à nova estrutura.

## Regras definidas pelo jogador

- Um a três jogadores; cada personagem começa com 40 moedas individuais.
- Sem ações Defender ou Provocar. A provocação vem exclusivamente das habilidades indicadas abaixo.
- Aparência igual à campanha, reaproveitando fontes, molduras e botões; combate sem cabeçalho de expedição, percurso e linha de iniciativa acima do cenário.
- Base com ferreiro (aprimorar equipamento e vender mochila), saguão (todos presentes para iniciar) e acampamento (equipar, trocar itens/moedas e pagar descanso de vida/mana).
- Níveis dos inimigos seguem a progressão da campanha; XP por batalha deve levar o grupo, em média, ao nível do chefe final. Remover a evolução fixa de cinco níveis por sala.

## Sete encontros por região

1. Combate: comuns e incomuns.
2. Apostador: aposta escolhida pelo jogador, 50% de chance de duplicar ou perder o valor.
3. Combate: todas as três criaturas; raro com menor probabilidade.
4. Alquimista: quatro poções aleatórias; qualidade baseada no nível médio dos heróis.
5. Combate: incomuns e raros.
6. Ferreiro viajante: quatro equipamentos comuns de qualquer região; possibilidade muito rara de artefato.
7. Caverna: três combates com criaturas da região, seguidos do chefe; vitória libera a próxima região.

São sete batalhas por região. A quantidade de oponentes acompanha a quantidade de jogadores; a composição do encontro respeita sua faixa de raridade. Não usar o poder atual do grupo para aumentar os atributos inimigos em resposta aos equipamentos adquiridos.

## Provocação por habilidade

Ordem informada: Brado do Paladino, Brado do Cavaleiro, Forma Verdadeira do Avatar da Natureza, Encanto da Brisa do Protetor da Floresta, Armadilha do Guarda Florestal, Ira do Berserker, Congelar do Mago Frígido. Duração: três turnos. Esbarrão, Contundir e Você irá me parar deixam de provocar.

Esclarecer a contagem dos turnos, a interação com áreas e se o primeiro elemento da lista representa a maior prioridade. Empates podem usar a aplicação mais recente, salvo orientação diferente.

## Esclarecimentos respondidos

- Jornada da dungeon pelas 12 regiões; campanha principal inalterada.
- Primeiro item da lista tem maior prioridade. Provocação conta três ações de cada inimigo; áreas continuam no grupo.
- Sem equipamentos iniciais. Quarenta moedas e poções por jogador. Acessórios existentes, exceto O Fim; trocas com aceite.
- Uma caçada por encontro, voltando aos serviços. Caverna contínua, sem retorno entre suas quatro lutas.
- Sem bênçãos, memórias e relíquias. XP, atributos, equipamentos e poções. Caídos retornam após a vitória com 20% da vida máxima.

A implementação e as fórmulas adotadas estão em [sistema da dungeon](sistema_roguelite.md).

# Dungeon — jornada pelas 12 regiões

Implementação atual: modalidade independente da campanha, de um a três jogadores, com um herói e uma carteira por jogador. Cada participante começa no nível 1, sem equipamentos, com **40 moedas**, **duas poções de vida Instáveis** e **duas poções de mana Instáveis**. Não existem bênçãos por sala, memórias ou relíquias permanentes.

## Base e prontidão

- **Saguão:** todos precisam estar presentes e marcar **Estou pronto**. O anfitrião só inicia quando todos estão prontos e sem especialização ou troca pendente. Visitar outro local cancela a prontidão.
- **Ferreiro:** aprimora equipamentos da mochila ou equipados, uma raridade por vez, cobrando somente moedas. Também compra itens da mochila.
- **Acampamento:** mostra o personagem entre os slots e seus atributos em pergaminho. Clique em um slot para escolher equipamento na bolsa, guardar uma peça ou inspecioná-la. Permite usar poções de recuperação e pagar descanso.
- **Trocas pela bolsa:** os companheiros presentes aparecem no acampamento. Clicar no personagem abre **Ver perfil** e **Trocar**. Trocar abre a própria bolsa, onde se escolhe o item e/ou a quantidade de moedas e se envia a oferta. O destinatário vê **Oferta recebida** junto à bolsa e pode aceitar ou recusar dentro dela.
- Trocas exigem aceite do destinatário. Moedas ficam reservadas ao enviar a oferta; item oferecido não pode ser vendido, equipado ou consumido. Recusar/cancelar devolve as moedas. Aceitar transfere uma única vez.
- Descanso recupera toda a vida e mana, cobrando `ceil(HP faltante / 7) + ceil(MP faltante / 7)`, como a recuperação da campanha. Com os recursos cheios, fica desabilitado.
- Aprimoramento custa a diferença de valor de venda entre a próxima raridade e a atual, com mínimo de dez moedas. Não exige os materiais da campanha.

## Jornada fixa

As regiões são Floresta, Caverna, Ruínas, Pântano, Vulcão, Abismo, Fortaleza, Necrópole, Citadela, Panteão, Cataclismo e Paradoxo. Há sete encontros por região, nesta ordem:

| Encontro | Conteúdo |
|---|---|
| 1 | Combate com comuns/incomuns, usando seus pesos relativos de aparição. |
| 2 | Apostador: cada jogador escolhe quanto apostar, de zero ao saldo disponível; 50% de chance de duplicar o valor ou perdê-lo. |
| 3 | Combate com as três criaturas; pesos comuns/incomuns/raros 78/16/6. |
| 4 | Alquimista com quatro tipos distintos de poção sorteados, na qualidade correspondente ao nível médio do grupo. |
| 5 | Combate com incomuns e raros, preservando a proporção 16/6. |
| 6 | Ferreiro viajante com quatro peças comuns, de qualquer região. Cada oferta tem 0,5% de chance de ser um acessório raro existente. **O Fim é excluído.** |
| 7 | Caverna: três combates contra criaturas da região, seguidos do chefe. Sem retornar aos serviços entre essas lutas. |

Cada caçada resolve um encontro. Após uma vitória, o grupo permanece no cenário de combate vazio, podendo seguir para o próximo encontro ou voltar ao saguão pelo mapa. Visitar os serviços exige passar pelo saguão; se alguém sair do campo, o grupo volta a se reunir e marcar prontidão. Apostas e compras concluídas retornam ao saguão. A caverna tem quatro combates contínuos, com uma pausa para usar poções da mochila e escolher especializações, sem ferreiro, trocas ou descanso. Vencer seu chefe libera a região seguinte.

Cada confronto tem tantos inimigos quanto integrantes do grupo. No combate do chefe, há um chefe e, para dois/três jogadores, um/dois acompanhantes da região. Os níveis, ataque, armadura e mana vêm dos mesmos totais da campanha. Para acomodar o grupo, a vida do chefe recebe fator `1 + 0,65 × (jogadores − 1)`. Itens adquiridos não aumentam automaticamente os atributos dos inimigos.

## Economia e poções

Compras e apostas usam somente o saldo do herói que tomou a decisão. Ofertas são compartilhadas no encontro: comprar uma peça/poção esgota aquela oferta para o grupo. Cada participante marca que terminou suas compras; todos precisam concluir para retornar à base.

A qualidade do alquimista é `floor((nível médio − 1)/15)`, limitada às oito qualidades existentes. O preço de cada oferta é `ceil(20 + 20 × (índice da qualidade + 1)^1,7)`. Efeitos e números das poções vêm do catálogo atual da campanha. Buffs são usados em combate; recuperação pode ser usada entre lutas. Poções consomem um turno e fazem os buffs existentes perderem duração normalmente.

Equipamentos do vendedor custam três vezes seu preço de venda, com mínimo de vinte moedas. As armas oferecidas correspondem a alguma classe presente no grupo. Acessórios usam os efeitos já existentes, sem um catálogo novo de artefatos. Compras vão à mochila; equipar é uma ação do acampamento.

Cada vitória concede moedas individuais, com o bônus econômico de cada classe, e uma chance de 45% de receber equipamento comum da região. Sorte aumenta essa chance em 40%, como no sistema atual. O ganho-base de moedas é a soma de `5 + 3L` por criatura (`18 + 3L` para chefe), dividida pelo tamanho do grupo.

## XP e evolução

São **84 batalhas**, sete por região. A curva de XP usa a mesma exigência de nível da campanha:

```text
XP para o próximo nível = 100 + 25 × (nível − 1) + floor(1,5 × nível²)
```

A recompensa de cada batalha é a diferença entre dois pontos da curva acumulada de XP. Os alvos ao longo das sete vitórias de uma região são os níveis-base da região mais `[1,5; 3; 5; 6,5; 8; 10; 10,8]`, limitados ao nível 120. A primeira região parte do nível 1. A sexta vitória deixa o herói preparado para o chefe de nível 10, 20, …, 120; a sétima é a própria vitória sobre esse chefe. Arredondamento é para cima, evitando chegar um ponto de XP abaixo do nível pretendido.

Bônus de XP das classes continuam funcionando. A distribuição de atributos segue os perfis da modalidade: Guerreiro 2 força / 2 vitalidade / 1 sabedoria; Arqueiro 2 / 1 / 2; Mago e Adepto 1 / 1 / 3. Os pontos anteriores são recalculados no novo nível. As especializações são escolhidas nos níveis 30 e 60 entre os combates.

Heróis caídos retornam após a vitória com **20% da vida máxima**, conforme solicitado, e recebem XP e moedas do combate. Se todos caírem, a jornada termina. Não há recompensa transferida à campanha nem progressão permanente fora da jornada.

## Provocação

Não existem comandos **Defender** ou **Provocar**. As seguintes habilidades provocam, nesta ordem de prioridade:

1. Brado do Paladino.
2. Brado do Cavaleiro.
3. Forma Verdadeira do Avatar da Natureza.
4. Encanto da Brisa do Protetor da Floresta.
5. Armadilha do Guarda Florestal.
6. Ira do Berserker.
7. Congelar do Mago Frígido.

Cada inimigo guarda sua própria contagem de três ações. Usar uma provocação mais fraca não remove a mais forte; entre prioridades iguais, prevalece a aplicação mais recente. Um herói caído deixa de ser alvo. Ataques em área continuam atingindo o grupo. Esbarrão, Contundir e Você irá me parar não provocam.

O restante do roteamento das habilidades está na [referência das 28 classes/subclasses](referencia_habilidades.md). Selecionar habilidade e depois inimigo/aliado é obrigatório para alvo único; efeitos pessoais e áreas exigem confirmação. Ataque básico e Passar turno seguem o padrão da campanha.

## Interface e salvamento

A interface reutiliza fontes Cinzel/Leitura, molduras, pergaminhos, cenários do ferreiro e acampamento e ícones da campanha. O cabeçalho com Dungeon/Campanha/Encerrar e a faixa descritiva da jornada foram removidos. O saguão é um pátio de reunião com os heróis no cenário e os controles de prontidão embaixo.

Um mapa ilustrado de três locais ocupa a lateral esquerda; as áreas do desenho são clicáveis, com descrição ao passar o mouse. A bolsa retangular e o contador de moedas ficam na lateral direita, com os mesmos arquivos de arte da campanha. A página ocupa a janela inteira, sem rolagem externa; listas extensas rolam em seus painéis. No celular, o mapa inteiro e os recursos ficam acima do cenário. Durante uma caçada, os locais permanecem visíveis e ficam bloqueados até voltar à base.

O ferreiro não tem aba Vender: a venda acontece no detalhe de um item na bolsa. O acampamento não tem botão extra para abrir bolsa. O ferreiro usa uma coluna de peças, o item em destaque e o pergaminho com atributos atuais, melhoria e custo. As listas completas de itens foram substituídas pela bolsa de tamanho fixo, com filtros, ícones e painel de detalhes sem descrições de conjunto. Apostador, alquimista e vendedor também usam controles em pergaminho sobre os cenários; os vendedores mostram quatro ícones e os detalhes da oferta selecionada.

O botão da caçada usa a imagem de procurar inimigo da campanha e o saguão tem uma porta para sair com o progresso salvo. No combate, Itens fica à esquerda, ataque básico com ícone e habilidades ficam centralizados, e encerrar turno fica à direita. O ataque básico usa atalho 1 e as habilidades usam os atalhos seguintes. Habilidades são quadrados compactos com imagem, atalho e custo; descrições aparecem ao passar o mouse. Cabeçalho da expedição, percurso e iniciativa foram retirados da parte superior do combate.

O apostador ganhou [arte própria](../hud/dungeon-gambler-v1.json). O [mapa dos locais](../hud/dungeon-locations-v1.json) e o [pátio do saguão](../hud/dungeon-guildhall-v1.json) foram gerados com referências visuais da campanha; os demais locais aproveitam os cenários existentes. Itens, carteiras, prontidão, ofertas e resultados são resolvidos pelo anfitrião; clientes enviam intenções. A retomada mantém a jornada em armazenamento próprio `dungeon_journey_v3_*`, sem importar personagens ou moedas da campanha. Saves da estrutura antiga não são convertidos automaticamente.

## Validação

```powershell
node scripts/test-dungeon-journey.cjs
node scripts/qa-dungeon-journey-ui.cjs
node scripts/qa-dungeon-base-ui.cjs
node scripts/qa-dungeon-viewport.cjs
node scripts/test-turn-resolution-v5.cjs
node scripts/test-dungeon-journey-network.cjs
```

[Regras, alvos e curva de XP](../qa/dungeon-journey-validation.json), [interface](../qa/dungeon-journey-ui.json), [três jogadores reais via WebRTC](../qa/dungeon-journey-network.json).

A rota/XP é verificada simulando vitórias em todas as 84 batalhas, para um, dois e três integrantes. Isso verifica progressão e estados, sem afirmar que todas as classes vencem todos os confrontos. As 129 habilidades são exercitadas separadamente, abrangendo as 28 classes e subclasses.

Os efeitos usam o nome da habilidade e detalhes no popup. [Ajustes compartilhados de turnos, sangramento e interface](../qa/ajustes_combate_interface_v5.md).

## Revisão de progressão e economia v8

A distribuição automática foi substituída por um ponto livre por nível. O jogador escolhe força, vitalidade ou sabedoria entre encontros, e precisa concluir a distribuição antes de prosseguir. Investimentos existentes em jornadas salvas são preservados. O ouro de vitória é o dobro da fórmula anterior. Equipamentos continuam usando as definições e fórmulas da campanha, com normalização da mochila ao subir de nível e da oferta ao comprar. Aprimorar custa dez vezes o custo em moedas da melhoria correspondente na campanha; não exige materiais. A vida e o ataque dos inimigos usam a fórmula escalável de `getEnemyStats`, incluindo `template.hp + 18L` e `template.attack + 2L`, com os multiplicadores da região; o ajuste de vida para chefes em grupo permanece. Essas regras substituem os valores e a distribuição automática descritos nas seções históricas acima.

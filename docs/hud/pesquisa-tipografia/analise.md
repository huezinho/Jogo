# Textos integrados à arte do RPG

Pesquisa e estudo visual: 29/10/2026.

Atualização: a proposta foi aplicada ao jogo. O registro abaixo preserva o diagnóstico e as decisões da pesquisa. Confira o estado atual em ../implementacao-rpg.md e os estilos do chefe em ../chefe/index.html.

## O que já mudou no jogo

A faixa superior que continha “Crônicas da campanha” foi retirada por inteiro. A identificação da região continua junto ao mapa, e o título da tela permanece disponível semanticamente para leitores de tela. O espaço da faixa passa à área de aventura. Os mapas, a bolsa sobreposta e a posição inferior dos comandos continuam funcionando. A fonte dos títulos continua Cinzel 650; a camada de leitura agora usa EB Garamond.

As imagens de proposta são estudos feitos sobre a interface e os dados reais do jogo. A fonte de leitura, as cores, os rótulos e a apresentação de propriedades sugeridos foram aplicados à versão jogável após a solicitação do usuário. Nenhuma regra, habilidade ou fórmula de equipamento foi alterada.

## Referências examinadas

### Darkest Dungeon — identidade nas letras grandes, clareza nos dados

Nas capturas oficiais de combate e de personagem, o nome do herói tem desenho marcante e destaque, enquanto atributos e números usam formas mais simples. O painel escuro separa a informação do cenário pintado; a maior parte da ornamentação fica nas bordas, não no miolo do texto. Não identifiquei nem reproduzi a família exata da fonte: esta é uma observação visual das capturas.

Aplicação sugerida: manter a Cinzel nos nomes de habilidades, conjuntos, locais e comandos; dar menos peso visual ao custo de mana, à descrição e aos materiais. A moldura pode ser elaborada, mas a área onde as letras caem precisa ser limpa.

Fonte primária: https://store.steampowered.com/app/262060/Darkest_Dungeon/
Capturas: `ref-262060-0.jpg` (combate) e `ref-262060-2.jpg` (personagem). Os endereços originais estão em `fontes.json`.

### Slay the Spire — cada texto tem um papel

A captura oficial do evento “Council of Ghosts” mostra título destacado, narrativa com maiúsculas e minúsculas, alinhamento à esquerda e palavras específicas destacadas por cor. As opções explicam a consequência; o restante da narrativa não aparece todo na mesma cor de destaque. Nas capturas de combate, os comandos são mais curtos e a explicação detalhada ocupa as cartas ou os painéis correspondentes.

Aplicação sugerida: usar uma frase clara na descrição e números separados em propriedades. Centralizar os comandos e títulos; alinhar à esquerda os parágrafos e listas. Cor deve indicar função ou informação importante, sem pintar toda a interface de dourado.

Fonte primária: https://store.steampowered.com/app/646570/Slay_the_Spire/
Captura: `ref-646570-3.jpg`. A amostra é uma tela oficial em inglês; os textos em português do estudo são propostas nossas, não transcrições da localização do jogo.

### Diablo IV — legibilidade também faz parte da direção de arte

A Blizzard documenta três tamanhos de texto, mantendo a fidelidade visual dos menus, e controles de cor, tamanho e opacidade de fundo para legendas. Essa parte da análise se apoia na documentação da desenvolvedora, não nas imagens promocionais sem HUD da página da loja.

Aplicação sugerida: prever escala de leitura e validar a interface com textos maiores. Uma moldura que só funciona reduzindo o rótulo a 9 px precisa de mais espaço ou de um comando mais curto. Letras medievais não dispensam contraste e tamanho legível.

Fonte primária: https://news.blizzard.com/pt-br/article/23954932/combatendo-demonios-com-acessibilidade-em-diablo-iv

## Diagnóstico do jogo atual

- A regra global em `campaign-typography.css` força Cinzel 650 em todos os elementos. Um parágrafo, um número e um título recebem a mesma identidade tipográfica. Falta hierarquia, mesmo quando o texto cabe.
- A Cinzel usa formas de versaletes: nos textos extensos ela pode parecer uma sequência de letras capitais. É coerente em inscrições e nomes, mas custa mais esforço em listas longas.
- Há rótulos de 9 px no desktop e legendas de mapa de 7 px em telas estreitas. Caber na moldura não basta para ser legível.
- Nome, tipo, conjunto e raridade aparecem concatenados em alguns equipamentos. É melhor manter um nome principal e pôr as classificações numa segunda linha.
- Atributos em uma única frase dificultam comparar os bônus. Um atributo por linha, com o número destacado, é mais fácil de consultar.
- O cenário é pintado e detalhado. O texto precisa de uma base escura discreta ou de uma área limpa no pergaminho; brilho excessivo e dourado em tudo aumentam a disputa visual.

## Direção recomendada

1. **Identidade:** Cinzel 650 continua nos títulos, locais, habilidades e comandos. Não substituir tudo por outra fonte.
2. **Leitura:** experimentar EB Garamond 550 somente em descrições, materiais e história. O estudo usa um arquivo variável oficial com o eixo de peso 400–800 conferido; a licença e a origem estão junto aos exemplos. A proposta não reativa o antigo redesenho com essa fonte: muda apenas o papel do texto. Se a preferência continuar sendo uma única família, manter Cinzel e aplicar primeiro hierarquia, contraste, espaçamento e rótulos curtos, aceitando que parágrafos exigirão mais espaço.
3. **Escala inicial a validar:** nomes de painel 20–24 px; comandos e habilidades 13–15 px; descrições 16–18 px; anotações 12–14 px. São faixas propostas para este jogo, não medidas das fontes dos jogos de referência. Telas menores precisam reorganizar informação antes de reduzir abaixo dessas faixas.
4. **Cor e material:** marfim sobre base escura; tinta castanha sobre pergaminho; dourado reservado à seleção e aos títulos; verde/vermelho para disponibilidade, sempre acompanhado de texto ou quantidade.
5. **Alinhamento:** títulos e comandos centralizados; explicações e listas à esquerda; quantidades na mesma coluna, alinhadas à direita. Centralização óptica precisa considerar a área útil dentro da moldura, não só o retângulo do botão.
6. **Escrita:** conservar nomes próprios e de habilidades. Usar verbos claros nas ações. No estudo, “Passar” vira “Encerrar turno”; “Fabricar comum” vira “Forjar”, com “Resultado: equipamento comum” ao lado. Revisar acentos e termos: “máxima”, “Raízes”, “dano periódico” em vez de siglas sem explicação. Nenhum significado deve depender apenas da arte ou de uma dica que só aparece ao passar o mouse.

## Retornos visuais

- `referencias.png`: comparação das capturas e observações, com recortes de texto dos jogos examinados.
- `combate-atual.png` e `combate-proposta.png`: mesmo sistema visual, separando nome, custo e mensagem narrativa no estudo.
- `oficina-atual.png` e `oficina-proposta.png`: comparação do equipamento com nome mais curto, classificação separada, propriedades por linha e materiais em fonte de leitura.
- `index.html`: comparação visual navegável com estados atual/proposto. Usa as artes existentes do projeto; não é uma imagem gerada ou uma mudança aplicada ao jogo.

As capturas de terceiros são referências de pesquisa e pertencem aos respectivos titulares. Não são usadas como arte de produção do jogo. O estudo não pretende identificar as fontes proprietárias ou copiar interfaces inteiras.

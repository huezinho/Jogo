# Estudo de HUD e organização da campanha

28/10/2026. Entrega de análise, pesquisa e protótipos; as telas do jogo não foram modificadas nesta etapa.

## Diagnóstico

O principal problema é a distribuição da atenção. A tela mistura decisão de combate, navegação, coleção, mapa regional, materiais e histórico com pesos semelhantes. A arte dos personagens e cenários já pode sustentar uma interface mais organizada; a mudança mais importante é definir o que cada tela permite decidir.

O jogador deveria reconhecer rapidamente: onde está, de quem é a vez, quais recursos tem, o que cada ação custa e qual é o próximo objetivo. Inventário completo, mapa completo e histórico detalhado devem continuar acessíveis, mas não precisam ocupar espaço durante todo turno.

### Evidências no projeto atual

Foram abertas cinco telas em duas resoluções: 1366×768 e 390×844. A fixture usa Guerreiro com habilidades de nível 40 para testar a densidade da interface, sem representar uma build balanceada. Contextos do navegador são descartáveis. Os números são medições desta fixture, não resultados de testes com usuários.

| Evidência | Consequência de organização |
| --- | --- |
| Combate desktop: 34 botões visíveis na primeira área da tela, incluindo bloqueados | Mapas, filtros, configurações e ações competem por atenção. |
| Dois mapas permanentes, um de locais e outro de regiões | Navegação de lugar e progressão do mundo parecem pertencer à mesma categoria. |
| Inventário vazio produz uma grade comprida; combate desktop chega a 1.408 px | A extensão da página depende de conteúdo secundário, não da decisão do turno. |
| Artesão desktop: botão específico de retorno à batalha em Y≈2.152 | O retorno depende da localização da rolagem, embora exista também navegação geral. |
| Artesão móvel: altura total≈3.681 px; mercenário≈3.067 px | A informação do serviço fica diluída entre cenário, navegação e listas. |
| Troféus: 3.818 px no desktop e 5.115 px no celular | A coleção precisa de organização própria e acesso constante ao retorno. |
| Combate móvel: primeiro ataque em Y≈666; últimas ações em Y≈772 | Cabe na fixture de 844 px, com pouca margem para barras do navegador, textos maiores e mais habilidades. |

Não houve overflow horizontal ou exceções nos dez estados observados. Isso confirma encaixe básico; não confirma boa hierarquia ou eficiência. A dificuldade aqui não é apenas “o botão ficar dentro da tela”.

Outros pontos visuais observados: botões brancos de passar/fugir com destaque alto; filtros da mochila competindo com o ataque; informações relevantes de habilidades concentradas em hover; dificuldade de distinguir informação decorativa de informação acionável nos mapas; configurações flutuando em posição diferente entre desktop e celular.

## Pesquisa: o que adaptar de jogos próximos

As leituras abaixo distinguem observação visual de recomendação própria. Não são afirmações de que um desses jogos tenha uma interface perfeita ou deva ser copiado integralmente.

### Slay the Spire: separar o turno do restante da jornada

Nas capturas oficiais, os recursos globais ficam numa faixa superior, a situação do encontro no centro e as opções jogáveis perto da base. Loja, evento e coleção usam composições próprias. Minha leitura é que isso ajuda a manter uma zona previsível para cada tipo de decisão. Adaptaria essa separação e a proximidade entre custo e ação; não transformaria suas habilidades em um sistema de cartas. [Galeria oficial no Steam](https://store.steampowered.com/app/646570/Slay_the_Spire/), [press kit da Mega Crit](https://www.megacrit.com/press-kits/slay-the-spire/).

### Darkest Dungeon: comandos próximos e preparação contextual

As capturas oficiais concentram comandos junto ao personagem selecionado. As notas da Red Hook também documentam atalhos entre serviços da cidade, alternância entre mapa e inventário no mesmo painel e preservação da escolha desse painel. A adaptação sugerida é manter uma zona de comandos e reaproveitar uma área contextual, em vez de manter tudo aberto. A densidade de pequenos ícones do original não seria uma boa referência para o celular deste projeto. [Galeria oficial](https://store.steampowered.com/app/262060/Darkest_Dungeon/), [notas oficiais: Interface Improvements](https://store.steampowered.com/news/posts/?appids=262060&enddate=1453243045).

### Melvor Idle: tornar a gestão de itens legível

É uma referência para inventário e progressão, não para copiar o ritmo de combate. As notas oficiais descrevem notificações mais compactas, informação de HP visível sem depender de tooltip, indicadores de melhoria nos itens e busca por slot. Adaptaria avisos compactos de drops e pendências, seleção de item com detalhes e indicação clara do que pode ser fabricado ou melhorado. [Notas oficiais da versão 1.2](https://news.melvoridle.com/major-update-v1-2/).

### Acessibilidade como parte da estrutura

As Xbox Accessibility Guidelines enfatizam leitura configurável, contraste em diferentes cenários e alternativas de entrada. Isso apoia uma interface com texto sobre fundos estáveis, significado além da cor e operação por teclado/toque. Para este projeto, proponho texto principal de aproximadamente 15–16 px, secundário próximo de 13–14 px, controles de toque com área mínima pretendida de 44 px e ampliação da interface. São metas locais de projeto; não uma declaração de conformidade ou mínimos copiados da XAG. [Texto — XAG 101](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101), [contraste — XAG 102](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/102), [entrada — XAG 107](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/107).

## Organização recomendada

### Navegação principal

Quatro destinos estáveis: **Aventura, Personagem, Bolsa e Aldeia**. Um menu **Mais** reúne códice/bestiário, conquistas e acesso aos outros modos. Configurações ficam em um ponto constante do cabeçalho. No celular, os mesmos destinos vão para uma barra inferior com rótulos; não apenas ícones.

- **Aventura:** combate, exploração e mapa de regiões. O mapa completo abre quando necessário; fora de combate, pode ser o conteúdo principal da exploração.
- **Personagem:** atributos, equipamentos e habilidades, com divisões claras. O acampamento deixa de ser uma categoria que mistura ficha, treinador e catálogo.
- **Bolsa:** itens, materiais e consumíveis; selecionar abre inspeção. Equipar, usar e vender são ações explícitas. Comparação deve mostrar também bônus de conjunto perdidos.
- **Aldeia:** visão de serviços e acesso local a Oficina, Pousada, Mercenário e Alquimista. A ilustração da aldeia pode aparecer como ambientação, sem empurrar o serviço para outra tela de rolagem.

O acesso de navegação deve continuar visível durante o combate, com a restrição atual explicada. Um botão bloqueado pode dizer “Disponível ao terminar a batalha”. O protótipo permite alternar telas para mostrar o desenho; isso não representa autorização para sair de combate ou mudar as regras do jogo.

### Combate

1. Cabeçalho enxuto: personagem, nível, moedas e opções.
2. Região atual e próximo objetivo, com acesso ao mapa.
3. Cena de batalha com identificação dos combatentes e uma mensagem inequívoca de turno.
4. HP, MP, escudo e estados agrupados, com duração nos efeitos e informação por toque/foco.
5. Zona estável de ações: ataque, habilidades e consumíveis. Custos ficam sempre visíveis.
6. Passar e fugir visualmente secundários, separados do ataque principal.
7. Último evento em uma linha; histórico completo sob demanda.

A grade completa de mochila sai da tela de combate. Os drops possíveis ficam na inspeção do alvo e no resumo de vitória. Um contrato acompanhado pode aparecer de forma compacta; não é necessário listar o quadro inteiro.

As habilidades devem ter lugares estáveis. Uma habilidade sem mana permanece no mesmo lugar e explica por que está indisponível. Na implementação, evitar substituir toda a área por um único botão “Aguarde” durante animações: conservar o desenho e desabilitar as ações reduz saltos visuais.

No desktop, hover e foco podem atualizar a inspeção sem exigir uma confirmação extra para cada ataque. No celular, um toque informativo pode abrir efeito, custo, alvo e uso; o ataque básico repetido continua direto. Essa diferença precisa ser testada para não tornar cada turno lento. Atalhos precisam funcionar de fato antes de seus números aparecerem na versão final; os números do mockup representam essa proposta.

**Intenção inimiga é opcional e depende do motor.** Exibir “vai atacar por 12” exige uma decisão já comprometida ou previsão correta da IA. Enquanto isso não existir, mostrar apenas atributos, efeitos ativos e habilidades conhecidas. Não inventar certeza visual para uma escolha aleatória futura.

### Oficina: a mudança de maior impacto fora do combate

Reunir artesão e ferreiro numa **Oficina**, com abas **Fabricar** e **Aprimorar**. Isso reorganiza a interface; não muda as regras de fabricar comum ou melhorar uma raridade por vez.

No desktop: região à esquerda, lista compacta de cinco peças no centro, detalhe da peça à direita. No detalhe: atributos, conjunto, ingredientes com quantidade possuída/necessária, moedas e uma única ação principal. Em Aprimorar, mostrar **valor atual → próximo valor** e **raridade atual → próxima raridade**.

No celular: seletor resumido da região, peças em grade curta e um único detalhe expandido. O mapa completo abre sob demanda. A seleção de peça adiciona um passo em relação à lista atual com botões diretos, mas permite comparar e decidir sem percorrer cinco descrições longas. O trade-off deve ser medido.

O mapa continua visual. Na implementação final, incluir nomes e estados de bloqueio nos marcadores, posição consistente e alternativa em lista. Um mapa reduzido sem rótulos não pode ser o único caminho para escolher a região.

### Mercenário e objetivos

Separar **Ativos**, **Disponíveis** e **Concluídos para receber**. Cada missão mostra alvo, região, progresso, recompensa fixa e prazo de renovação do quadro. A renovação não deve parecer prazo de expiração do contrato aceito. O botão Receber precisa aparecer junto da missão concluída.

Na aventura, mostrar apenas um objetivo acompanhado e seu progresso. Se houver recompensa pronta, sinalizar na navegação da aldeia; respeitar o momento permitido para resgatar.

### Bolsa e personagem

Uma seleção deve permitir ler o item antes de equipar ou vender. A comparação precisa explicar três coisas: alteração de atributos finais, peças do conjunto antes/depois e efeito perdido ou adquirido. Não depender exclusivamente da cor da raridade.

Filtros seguem categorias reconhecíveis: Equipamentos, Materiais, Consumíveis e Baús. Espaços vazios devem ter presença pequena; não determinar a altura da página. A venda por botão explícito funciona com mouse e toque; botão direito pode ser atalho adicional.

Na ficha, separar Atributos, Equipamentos e Habilidades; indicar pontos pendentes sem exigir que o usuário procure a informação em uma coluna distante. Troféus e bestiário ficam em uma área de coleção, com filtros e progresso, sem o mapa e a mochila permanentemente repetidos.

## Duas propostas visuais

### Palco tático — recomendação principal

Cena central, recursos logo abaixo, habilidades na base e um painel lateral com objetivo e inspeção. É a direção que melhor aproveita a arte e a apresentação atual do jogo. No celular, o painel lateral sai do fluxo permanente e as informações continuam acessíveis por botões.

Trade-off: a cena recebe mais espaço; a composição completa pode exigir rolagem para o histórico em telas baixas. As ações essenciais precisam continuar dentro da área inicial, mesmo com mais habilidades e texto ampliado.

### Painel de expedição — alternativa para jogo mais repetitivo no PC

Cena à esquerda e comandos à direita, com inspeção próxima às habilidades. Objetivo e mapa ficam sob demanda. É mais compacto para decidir turnos e funciona melhor com nomes longos ou várias ações.

Trade-off: menos espaço para a cena e um olhar mais lateral entre recursos e comando. No celular, as duas propostas convergem para uma composição vertical; não tentam encolher as duas colunas.

Ambas incluem a mesma ideia de oficina contextual. Os protótipos permitem navegar para Aldeia, selecionar peça, alternar Fabricar/Aprimorar, consultar detalhes e abrir habilidades no celular. Eles não gravam saves, executam combate ou consomem materiais. Arte reaproveitada do projeto; valores, quantidades e estados são ilustrativos.

## Validação realizada e critérios para implementação

O protótipo foi aberto em larguras de viewport 1366, 1024, 390 e 320 px. Sem erros de JavaScript ou overflow horizontal nas duas variantes e na oficina. Foram exercitados seleção de peça, troca de modo de receita, mapa, fechamento de detalhes e confirmação de habilidade no celular. A margem do visualizador reduz a largura útil do produto em 32 px; as medições desse estudo não são equivalentes a uma aplicação ocupando o viewport inteiro.

No desenho compacto, a composição desktop ficou em cerca de 720 px de altura; no Palco, cerca de 818 px. São medições do protótipo, não garantias do jogo final. O objetivo de implementação é manter comandos essenciais acessíveis em 1366×768 e 390×844, com ajuste específico para alturas menores e barras do navegador.

Antes de implementar tudo, validar uma fatia: combate → vitória → bolsa → oficina → aprimorar → voltar à aventura. Testar com pessoas que não conhecem o projeto:

- Identificar turno, vida, mana e custo de uma habilidade sem orientação.
- Encontrar uma missão pronta e entender sua recompensa fixa.
- Comparar um item sem equipá-lo acidentalmente e perceber perda de conjunto.
- Fabricar uma peça comum e descobrir a próxima melhoria.
- Voltar ao combate sem procurar um botão no fim de uma página.

Medir tempo, erros, cliques, rolagem e necessidade de explicação. As sugestões são hipóteses de design sustentadas pela inspeção e pelas referências; ainda não são um estudo de usabilidade com participantes.

### Ordem de trabalho sugerida

1. Navegação estável e remoção das colunas permanentes que não pertencem ao contexto.
2. Zona de combate, recursos, efeitos e histórico compacto.
3. Bolsa com comparação e ações explícitas.
4. Oficina contextual e quadro de contratos.
5. Refinamento visual, tipografia, atalhos, áudio de feedback e acessibilidade.

Manter os pontos de localização existentes da arte, mas centralizar medidas, cores e estados da interface. Isso evita corrigir cada tela com mais uma media query isolada. Nenhuma das propostas exige reescrever as regras de combate antes de validar o novo fluxo.

## Arquivos

- `audit.cjs` e `audit-results.json`: reprodução e medidas das telas atuais; capturas `atual-*.png`.
- `hud-propostas.fragment.html`: proposta interativa utilizada na conversa.
- `prototipo.html`: visualização local independente do jogo; abrir pelo servidor local em `/docs/hud/prototipo.html`.
- `verify-prototype.cjs` e `prototype-results.json`: validações das propostas.
- `proposta-palco-*.png`, `proposta-painel-*.png` e `proposta-oficina-*.png`: capturas para comparação.
- `referencia-*.jpg`: imagens consultadas das galerias oficiais do Steam; pertencem aos respectivos jogos/desenvolvedores e não foram usadas como arte das propostas.

Executar `node docs/hud/audit.cjs` e `node docs/hud/verify-prototype.cjs` na raiz do projeto. A pesquisa usa fontes públicas dos desenvolvedores e da Microsoft, consultadas em 28/10/2026; não houve teste humano de usabilidade ou certificação de acessibilidade.

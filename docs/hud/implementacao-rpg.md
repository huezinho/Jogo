# HUD de fantasia implementada na campanha

28/10/2026.

## Habilidades e conjuntos com artes próprias — 29/10/2026

Aplicado o catálogo de 188 artes geradas individualmente com image_gen: 59 habilidades ativas, 29 passivas, 4 ataques básicos e 96 equipamentos regionais. O conjunto de cada região possui quatro peças de armadura e quatro armas específicas de classe. A mesma peça mantém sua arte quando melhora a raridade; a classificação continua indicada na interface.

Os ícones de habilidade usam classe e ID estável, em vez de agrupar por efeito. São exibidos no combate, nas descrições e no livro do personagem, incluindo passivas e desbloqueios futuros. Os equipamentos resolvem sua arte pelo conjunto regional, peça e classe da arma; oficina, bolsa, inspeção e personagem usam o mesmo caminho. A resolução também atende os saves existentes. Não houve alteração de fórmulas ou receitas.

Bolsa e marcador de acessório vazio continuam com os ícones anteriores, conforme solicitado. Catálogo e galeria: arsenal/index.html e arsenal/catalogo.json. Prompts e origem: arsenal/geracao/*.json. A instalação das cópias WebP preserva a composição completa, sem recorte ou repintura.

A conferência cobre 2.222 referências de habilidades/equipamentos em todas as classes, rotas e raridades, arquivos distintos e carga das imagens, mais o livro de habilidades em três larguras. O comando normal de regressão executa oito suítes.

## Histórico: selo progressivo e artes próprias — 29/10/2026

Aplicado o selo escolhido. O retrato circular é próprio do chefe da região, e a borda completa 0/120/240/360 graus conforme as criaturas diferentes vencidas (na região com três criaturas). A mesma regra funciona nas 12 regiões e mantém o círculo completo ao liberar ou enfrentar o chefe. Repetir uma criatura não aumenta esse progresso.

Foram gerados 12 retratos e 48 ícones de materiais secundários com image_gen. Não há mais reutilização da imagem do primeiro drop para o componente secundário. O caminho usa o ID estável do componente, inclusive para saves existentes. Artes: assets/visual/bosses e assets/visual/items/components. Prompts e origem: icones/geracao.json; galeria: icones/index.html. A revisão visual conferiu todos os ícones; a Hidra recebeu uma segunda geração específica para representar as três cabeças reptilianas.

O comando normal agora tem sete suítes, incluindo a conferência dos 60 arquivos distintos, carga das imagens, mapeamento de drops, retratos das 12 regiões em três larguras e progresso real do selo. A galeria registra os quatro estágios da borda.

## Histórico: tipografia aplicada e chefe — 29/10/2026

O estudo foi aplicado: Cinzel 650 permanece nos nomes e comandos; o arquivo variável oficial EB Garamond (eixo 400–800 conferido) foi instalado em assets/visual/fonts e é usado em descrições, custos, quantidades, materiais e histórico. A folha campaign-reading.css está limitada à campanha. Nenhuma mecânica ou fórmula foi alterada.

A oficina separa nome, tipo/conjunto e raridade; mostra uma propriedade por linha; usa Forjar com a indicação de resultado comum. Passar agora aparece como Encerrar turno, MP como mana, e os textos de apresentação corrigem acentos e explicam dano periódico sem alterar os dados persistidos.

O quadro de pergaminho do chefe foi substituído por Rastro discreto: fundo escuro contido, filete, progresso real e acesso aos detalhes. O quadro sempre trata do chefe; contratos continuam no objetivo detalhado e no mercenário. Bloqueado, liberado e em combate têm estados próprios; durante outro combate o desafio continua bloqueado. A luta com chefe recebe apenas um detalhe de cor na identificação do alvo.

As alternativas Selo de caçada e Estandarte estão em chefe/index.html, junto às capturas reais de três estados. Somente Rastro discreto é usado pelo jogo. O teste de 27 combinações de estilo/estado/largura entra no comando normal de regressão, que agora executa seis suítes. A galeria também foi verificada em três larguras, com troca de estado e carga das imagens.

## Histórico: mapas nos cantos — 29/10/2026

Correção das molduras: a área desenhada por `border-image` coincide com a borda reservada pelo layout, inclusive nos estados ativo/desabilitado e nas regras de celular. Cartões de contrato reservam 22 px verticais e 35 px laterais para a moldura, além do recuo de texto de 10/14 px. A auditoria verifica os trechos de texto dentro da borda e a largura das molduras nos botões visíveis. O mapa de regiões lateral aparece somente na tela de combate/exploração; o mapa de locais continua servindo à navegação. Nas outras telas, a lateral de bolsa/moedas ocupa menos largura.

A faixa superior “Crônicas da campanha” foi retirada; a região continua indicada no mapa, e os pixels liberados passam à aventura. O estudo de escrita e tipografia está em `pesquisa-tipografia/index.html` e `pesquisa-tipografia/analise.md`. As variações de tipografia desse estudo são demonstrações e não são carregadas pelo jogo.

A campanha ocupa toda a largura disponível: mapa dos locais à esquerda, aventura no centro e mapa das regiões à direita. O mapa dos locais usa os pontos da arte para navegar com as restrições reais do jogo. A antiga barra de navegação e o botão de abrir mapa foram removidos. Opções fica no pé da lateral esquerda; bolsa e moedas ficam abaixo do mapa das regiões.

A bolsa usa um diálogo modal sobre a tela corrente, preservando o local e a cena, com fechamento por Escape e as mesmas ações explícitas de inspecionar, equipar, usar e vender. Procurar inimigo e os comandos de combate ficam depois da cena, no rodapé da área central. A navegação anterior no topo foi substituída por essa organização. Em telas estreitas, os mapas ocupam os cantos superiores com a aventura abaixo e ao fundo, sem ocultar as imagens para trocar por uma barra de botões.

As verificações cobrem 50 telas/larguras, mapas em lados opostos e persistentes na rolagem, comandos abaixo da cena, bolsa modal sem mudança de local, navegação pelos pontos do mapa e os fluxos de crafting, equipamentos, contratos, combate e salvamento.

## Histórico: navegação no topo (substituída)

A tipografia continua em Cinzel 650. Rótulos e botões têm alinhamento central explícito. A navegação principal, as ações de combate e as abas Fabricar/Aprimorar precedem o conteúdo variável. No celular, as habilidades ocupam duas colunas, evitando uma última habilidade isolada numa terceira coluna.

O mapa de regiões fica permanentemente no painel lateral do desktop e numa faixa compacta no celular. A posição acompanha a rolagem e o botão Ampliar mapa abre a versão maior para consultar nomes e viajar; as restrições de viagem e de chefe continuam no motor da campanha.

Os hotspots das conquistas não recebem a moldura genérica dos botões: a própria ilustração fornece a moldura. O aviso persistente de falha de armazenamento foi retirado; o fallback em memória continua funcionando e a API informa a disponibilidade do armazenamento.

Verificação: 50 combinações de telas/larguras com mapa persistente, navegação acima do conteúdo, ausência de overflow, fontes e imagens; fluxo de armazenamento restrito sem banner e com preservação na sessão; 24 combinações de classe/nível/largura sem cortes nos rótulos. Regras, habilidades e progressão também passaram nesta revisão.

## Layout e tipografia de base

A revisão visual rpg2 foi desfeita após a avaliação do usuário. A campanha voltou às molduras, distribuição, botões e apresentação da oficina anteriores. As correções funcionais de progressão e acessibilidade foram preservadas.

O usuário escolheu **Cinzel, levemente mais grossa**. A campanha usa agora o arquivo variável local `assets/visual/fonts/cinzel-variable.ttf` no peso real **650**, por meio de `assets/styles/campaign-typography.css`. Não foram reativados os botões, as molduras ou a distribuição da revisão rpg2. A folha de tipografia altera somente a família, o peso e os ajustes de encaixe dos glifos.

A licença e a origem estão em `assets/visual/fonts/OFL-Cinzel.txt` e `SOURCE-Cinzel.txt`. A fonte inclui o eixo variável de peso 400–900, permitindo usar 650 sem simular negrito ou engrossar com contornos. As amostras anteriores permanecem em `docs/hud/fontes/comparacao.html` e `docs/qa/hud-v3/comparacao-fontes.png` como histórico da escolha.

O comando normal de regressão executa as suítes de regras, habilidades, interface, progressão e a nova auditoria `hud-cinzel/typography`. São 50 combinações de tela/resolução com verificação de fonte e peso, mais 24 combinações das quatro classes, níveis 40/100 e larguras 1366/390/320 para verificar cortes nos rótulos. A auditoria tipográfica rpg2 permanece fora do comando padrão porque verificava a fonte rejeitada. O histórico abaixo descreve essa revisão desfeita.

## Revisão rpg2 da tipografia (desfeita)

A segunda revisão substitui a mistura de Georgia e fontes do sistema por uma família local única, **EB Garamond**, em pesos reais de 400 a 800. O arquivo WOFF2 e a licença SIL OFL estão em `assets/visual/fonts/`; não há carregamento de fontes de terceiros durante o jogo. Origem: [repositório oficial do Google Fonts](https://github.com/google/fonts/tree/main/ofl/ebgaramond).

Títulos, habilidades, custos, barras, navegação, pergaminhos, inventário, contratos, configurações e seleção de personagens receberam uma escala coerente com a arte aprovada. Foram refeitos os botões de metal, as placas de habilidades e a navegação inferior. O título do combate foi integrado ao cenário. Atributos da oficina aparecem em linhas separadas e a fabricação usa um botão verde quando os requisitos reais estão completos.

A revisão também corrige o corte do rótulo Personagem em 320 px e torna as descrições de subclasses visíveis no próprio cartão. Nomes acessíveis dos botões permanecem estáveis ao passar o mouse. Popups antigos de troféus são fechados ao trocar a tela.

`docs/qa/hud-v2/typography.cjs` verifica 24 combinações das quatro classes, níveis 40/100 e larguras 1366/390/320: fonte local carregada, ausência de cortes nos rótulos e custos de mana legíveis. A verificação geral das 50 telas também valida a família tipográfica de todos os textos visíveis. As capturas aguardam a decodificação dos sprites e imagens, para não registrar arte ainda em carregamento. Evidências adicionais em `docs/qa/hud-v2/`.

A implementação usa imagens separadas e controles reais. Nenhuma captura conceitual foi usada como uma tela achatada com áreas clicáveis. Personagens e inimigos continuam usando os sprites e animações do jogo; a forja recebeu um cenário limpo e os equipamentos, habilidades e componentes têm imagens independentes.

## Telas

- Combate: cenário central, turno, barras vermelhas de vida e azuis de mana, escudo e efeitos existentes, retratos, habilidades com custos reais, consumíveis, confirmação de fuga, histórico e mapa em janelas.
- Oficina: seleção visual de região desbloqueada, cinco peças da classe, item sobre a bigorna, requisitos e custos reais. Fabricar cria comum; Aprimorar mostra a próxima raridade e a previsão dos atributos.
- Personagem: espaços ao redor do herói, atributos atuais, bônus de conjuntos, habilidades, subclasse e treinador.
- Bolsa: seleção apenas inspeciona; equipar, remover, usar, abrir e vender são ações explícitas. A venda exige aldeia; troca de equipamento fica indisponível durante o combate.
- Mercenário: ofertas e contratos ativos, recompensa fixa, progresso, renovação do quadro e recebimento da recompensa.
- Pousada, alquimista, bestiário, troféus e tela inicial receberam o mesmo acabamento. Arena e dungeon continuam com suas próprias interfaces.

## Personagens pintados e animações de combate

As quatro classes base e suas 24 subclasses usam agora folhas próprias no estilo pintado das habilidades. Cada personagem tem 16 quadros: repouso, ataque básico, conjuração/suporte e reação a dano. As 59 habilidades ativas têm efeitos individuais com oito quadros; os quatro ataques básicos também têm efeitos próprios. O módulo `character-motion.js` coordena os quadros, a trajetória dos efeitos, os impactos, a reação ao dano e o retorno ao repouso. O turno aguarda a conclusão e a preferência de movimento reduzido é respeitada.

As artes ficam em `assets/visual/heroes-v2/` e `assets/visual/skill-fx/`. A galeria, as capturas, os prompts da geração integrada e a documentação estão em `docs/hud/personagens/`. A suíte `personagens/verificar.cjs` verifica os 28 personagens, as 59 habilidades, ataques básicos reais das quatro classes e três larguras de tela. `python scripts/verify-character-art.py` confere transparência, dimensões e quadros distintos. A integração é exclusiva da campanha e não altera fórmulas de combate.

## Código e artes

- `assets/js/systems/campaign-hud.js`: apresentação e navegação da campanha; chama os sistemas existentes para executar as ações.
- `assets/styles/campaign-hud.css`: aparência limitada ao corpo da campanha e adaptação para celular.
- `assets/visual/hud/`: imagens WebP usadas em execução e folhas de origem.
- `scripts/prepare-hud-art.py`: recortes determinísticos e conversão das artes para uso no jogo.
- `docs/hud/artes/prompts-implementacao.json`: prompts adicionais usados com a geração integrada de imagens para a forja limpa, habilidades e equipamentos.

Os pontos de integração em `game.js` preservam a interface das páginas separadas e encaminham a renderização da campanha para a nova HUD. Foi corrigida a ocultação prematura do painel de atributos após gastar o último ponto: a confirmação permanece até concluir a distribuição, inclusive no treinador.

## Verificação

Executar `node scripts/run-regressions.cjs`.

- Regras: 1.200 variações de equipamento, 96 materiais, fabricação comum e cadeia completa de cinco raridades; contratos com recompensa fixa.
- Habilidades: 348 combinações de habilidade e conjunto, sem falhas.
- HUD: 50 combinações de tela e largura (1366, 1024, 768, 390 e 320 px), sem rolagem horizontal, IDs duplicados, imagens ausentes ou exceções.
- Fluxos: ataque real e bloqueio durante animação, modal e teclado, crafting com ingredientes, seleção e equipar, melhoria, contrato e recebimento único, custo básico do mago, descanso e save/reload.
- Progressão: gastar o último ponto e confirmar, escolher subclasse, redistribuir no treinador, confirmar fuga e debitar o custo, abrir configurações, morrer e renascer.

Evidências em `docs/qa/hud/`, incluindo `results.json`, `progression-results.json` e capturas das telas reais em desktop e celular. Os personagens das capturas são fixtures descartáveis de teste; não representam uma simulação de balanceamento.


## Janelas e informações contextuais

Os rastros das criaturas restantes aparecem junto ao selo do chefe ao passar o mouse ou focar o botão; tocar também revela a informação. O combate apresenta diretamente as habilidades disponíveis, sem o botão de lista duplicada. A bolsa é acessada pela lateral, inclusive no acampamento. A distribuição de pontos e a escolha de subclasse ficam em uma janela modal que abre automaticamente e fecha depois da conclusão. Os controles de atributos cabem em uma linha no celular. O ferreiro usa o cenário inteiro, sem recorte de fundo. Verificações em `docs/qa/hud/popups.cjs`, `progression.cjs`, `verify.cjs` e `docs/hud/chefe/capturar.cjs`.


## Detalhes visuais e avisos das ações

As habilidades exibem suas descrições em um aviso flutuante ao passar o mouse ou focar pelo teclado. A faixa inferior foi removida. O aviso do chefe no mapa apenas orienta completar o rastro. A moeda pintada é compartilhada pelos saldos, custos, ingredientes, pagamentos e registros da campanha. A pousada usa barras com vida/mana e números dentro, além de um letreiro desenhado. O acampamento tem menos escurecimento e a luz do personagem ocupa toda a área, sem borda abrupta. O cenário do ferreiro fica na área principal com escala presa à janela, e os itens têm a mesma altura de exibição ao fabricar e aprimorar.

As duas novas artes foram geradas com a ferramenta integrada image_gen; saídas em `assets/visual/hud/icon-coin.webp` e `inn-title.webp`, e prompts/origens em `docs/hud/artes/prompts-detalhes.json`. A suíte `docs/qa/hud/details.cjs` verifica os avisos, ícones, recuperação da pousada, cenário do acampamento e 30 seleções de peças em três larguras.

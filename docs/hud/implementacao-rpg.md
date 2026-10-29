# HUD de fantasia implementada na campanha

28/10/2026.

## Estado atual: layout anterior restaurado

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

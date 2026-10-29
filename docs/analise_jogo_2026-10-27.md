# Análise do jogo — 27/10/2026

Base analisada: commit `c70b9f3`, branch `main`. Relatório e testes produzidos localmente; código do jogo preservado.

## Parecer

O projeto já funciona como um RPG jogável em desenvolvimento: tem identidade visual, quatro classes, duas escolhas de especialização, 12 regiões, chefes, inventário, consumíveis, acessórios, conquistas e multiplayer real. O combate básico e a conexão entre jogadores funcionaram nos testes.

O próximo marco deve ser uma versão estável de campanha e multiplayer. Hoje existem falhas confirmadas de integridade de combate, persistência e validação da rede que impedem considerar a arena e a progressão da dungeon prontas para lançamento público. Há também sistemas de equipamento e crafting em transição, com conquistas que continuam exigindo funcionalidades indisponíveis.

As prioridades são: corrigir os problemas P1 abaixo, fechar o ciclo de recompensas/equipamentos, melhorar a experiência no celular e medir o balanceamento com builds reais. As árvores de todas as quatro classes estão implementadas; a documentação que sugere completá-las precisa ser atualizada conforme o conteúdo efetivamente existente.

## Como a análise foi feita

| Frente | Cobertura e resultado |
|---|---|
| Código e conteúdo | Inventário dos 304 arquivos originais; revisão de HTML, CSS, dados, combate, persistência, conquistas e protocolos online. |
| Sintaxe | Os nove arquivos JavaScript passaram em `node --check`. |
| Navegador | Microsoft Edge controlado por Playwright, com perfis temporários e armazenamento isolado. Nenhum save do navegador pessoal foi utilizado. |
| Fluxo inicial | Criação, ataque real pelo botão, resposta inimiga, salvamento e retomada das quatro classes. Sem erros de JavaScript nos fluxos normais observados. |
| Habilidades | 592 execuções em combinações de classe, especialização e níveis de 1 a 100; 55 tipos de habilidades ativas. Com recursos suficientes, nenhuma exceção, bloqueio inesperado ou estado numérico não finito. Isso não garante a correção de todos os efeitos combinados. |
| Interface | 35 combinações de modo/resolução: sete modos em larguras de 1920, 1366, 768, 390 e 360 pixels. Screenshots de campanha, seleção, arena, dungeon e artesão. |
| Economia | Compra sem dinheiro, compra válida, cura, consumo de poção, venda, evolução de raridade de acessório, morte e renascimento. Resultados coerentes nos casos executados. |
| Personagens | Separação de moedas entre dois saves e criação até seis personagens. A interface de seleção tolerou um save parcial em JSON válido. Recuperação completa de saves danificados não foi certificada. |
| Rede real | PeerJS/WebRTC entre contextos isolados na mesma máquina: arena com dois jogadores e dungeon com três. Ataque da arena sincronizou estado e turno igualmente nos dois clientes; grupo da dungeon venceu o primeiro encontro. |
| Protocolo | Mensagens recebidas pelos handlers reais, com conexão controlada nos testes: alteração de atributos, atualização de perfil durante duelo, HTML em nome remoto e manipulação do consumo de turno. Falhas confirmadas. |
| Dungeon completa | Máquina de estados percorreu as 84 etapas, incluindo 12 chefes e 83 intermissões, com heróis fortes e vida dos inimigos reduzida por fixture. Confirmou conclusão e problema no registro final. Não equivale a terminar a dungeon com progressão normal. |
| Simulação | 960 lutas iniciais e 576 lutas contra chefes usando fórmulas e IA do jogo; detalhes e limitações abaixo. |
| Recursos | Referências estáticas HTML/CSS e 148 caminhos dinâmicos de imagens verificados, sem arquivos ausentes nesse conjunto. |

Os testes locais e simulados substituíram animações ou transporte somente nos casos indicados. Os testes de conexão real usaram o PeerJS original. Não foi feita publicação ou alteração de regras do jogo.

## Problemas confirmados e correções necessárias

P1 significa corrigir antes de uma versão pública estável. P2 significa problema de experiência, consistência ou conteúdo a resolver no próximo ciclo. Cada item inclui um critério observável para validar a correção.

### 1. P1 — Nome recebido pela rede executa HTML na arena

**Evidência:** um convidado enviou `profile_update` com um nome contendo uma imagem com evento `onerror`. A flag de teste foi executada no navegador do host. O teste apenas marcou `window.__qaXss`; não acessou ou enviou dados.

**Causa:** `getArenaFighterListMarkup()` insere `fighter.name` e `fighter.icon` diretamente em HTML. O handler aceita esses campos do convidado.

**Impacto:** alguém com acesso à sala pode executar JavaScript no contexto do jogo, com acesso aos saves locais dessa origem.

**Modificar:** usar `textContent`/escape para texto remoto, construir ícones a partir de um catálogo local e validar o formato de todas as mensagens. Revisar os outros pontos de renderização de dados remotos.

**Aceite:** nomes com `<`, aspas e marcação aparecem como texto; nenhum evento ou elemento enviado pelo participante executa código.

**Locais:** `assets/js/systems/arena-system.js:432` e `:626`. Teste: `arena-protocolo-perfil-injetado`.

### 2. P1 — Participante pode substituir atributos aceitos pelo host

**Evidência:** na arena, durante duelo ativo, um `profile_update` elevou HP e ataque para `999999`. Na dungeon, `hero_state` também aceitou esses valores.

**Causa:** substituição de estados completos recebidos do cliente sem validar limites, momento da atualização ou relação com o estado anterior.

**Modificar:** depois de iniciar uma partida, o host deve manter o estado de combate e aceitar intenções de ação. Mudanças de inventário, cura e atributos precisam decorrer de operações permitidas. No lobby, validar classe, nível, pontos, itens, tamanho e tipos dos campos. Definir explicitamente o grau de confiança entre amigos; um host no navegador continua podendo adulterar seu próprio processo. Um modo competitivo com classificação confiável exigiria autoridade fora dos clientes.

**Aceite:** mensagem de perfil durante combate não substitui HP/ATQ/MP; valores fora das regras são rejeitados sem interromper a sala.

**Locais:** `arena-system.js:416`, `:432`; `dungeon-system.js:1153`, `:2146`. Evidências em `deep-results.json`.

### 3. P1 — Convidado decide se sua ação consome turno na dungeon

**Evidência:** uma ação válida com `turnConsumed:false` causou dano e manteve `turnIndex` em `1`. O jogador continua na vez dele.

**Causa:** o host usa `data.turnConsumed`, recebido do cliente, em vez do resultado de `resolveDungeonActionForPeer()`.

**Modificar:** o resultado da resolução deve determinar o avanço. Adicionar identificador da ação e revisão do turno para rejeitar duplicatas/ações atrasadas.

**Aceite:** uma ação normal sempre avança exatamente uma vez; repetir o mesmo pacote não aplica dano novamente.

**Local:** `assets/js/systems/dungeon-system.js:2208`. Teste: `dungeon-turnConsumed-false-e-run-completa`.

### 4. P1 — Arena ignora escudo e invulnerabilidade do defensor

**Evidência:** defensor com 1000 HP, 500 de escudo e três turnos de invulnerabilidade perdeu aproximadamente 100 HP em um ataque básico. O escudo continuou com 500.

**Causa:** efeitos defensivos vivem em `hero.effects`, enquanto o oponente é tratado como `enemy`; o dano segue `applyDamageToEnemy()`, que não percorre as mesmas defesas de `applyIncomingDamage()`. Há dois campos de escudo: `effects.shieldValue` e `shieldValue`.

**Modificar:** unificar o contrato de combatente e a resolução de dano. Aplicar defesa do alvo, consumo do escudo, invulnerabilidade, esquiva e passivas independentemente de ele ser o jogador local. Revisar redução, reflexão, Último Recurso e efeitos reativos pelo mesmo motivo.

**Aceite:** escudo perde valor antes do HP; invulnerabilidade impede dano conforme descrição; host e convidado observam o mesmo resultado.

**Locais:** `arena-system.js:23`, `:320`; `game.js:3228`, `:3296`. Teste: `arena-defesas-do-alvo`.

### 5. P1 — Derrota na arena altera o save da campanha

**Evidência:** o personagem local perdeu o duelo, terminou com `hp=0` e esse valor foi gravado na campanha. Ao recarregar, `continueCampaign()` marcou `isDead=true`.

**Causa:** o estado temporário do duelo substitui a variável global `player` e entra no autosave comum.

**Modificar:** manter snapshot da campanha e um estado independente para o duelo. Ao encerrar, aplicar somente estatísticas/recompensas que a regra permitir. Se houver intenção de penalizar a campanha, isso precisa ser uma regra visível e consistente; atualmente o efeito acontece pelo compartilhamento de estado.

**Aceite:** entrar e sair de um duelo, ganhando ou perdendo, preserva o estado de campanha definido pela regra; contabiliza a partida uma vez.

**Locais:** `arena-system.js`, funções `syncArenaSceneFromState`, `finishArenaRound`, `resetArenaState`; `game.js:5605`. Teste: `arena-derrota-contamina-campanha`.

### 6. P1 — Conclusão e melhor etapa da dungeon não sobrevivem ao encerramento

**Evidência:** o teste percorreu as 84 etapas, exibiu a mensagem de conclusão e transferiu 21.588 moedas da fixture para a campanha. Após o encerramento, tanto no estado vivo quanto no save, `dungeonClears=0` e `dungeonBestStep=0`.

**Causa identificada:** estatísticas atualizadas no personagem principal são depois mescladas com `dungeonHero.stats`; campos antigos do herói da run sobrescrevem os contadores recém-atualizados. A conclusão é incrementada pouco antes desse retorno.

**Modificar:** definir a origem de cada contador e uma única aplicação de resultado da run. Mesclar contadores de forma explícita; não copiar indistintamente todo `stats`. Gravar resultado final com identificador da run para evitar perdas ou duplicação.

**Aceite:** uma conclusão deixa `dungeonClears` incrementado em um, `dungeonBestStep=84` e conquistas correspondentes disponíveis após recarregar. Uma segunda execução não reprocessa a primeira.

**Locais:** `dungeon-system.js:493`, `:557`, `:1871`. Evidência: `acceptance-results.json`, último teste.

### 7. P1 para saves existentes — Normalização descarta armas e armaduras

**Evidência:** espada e capuz inseridos no inventário persistido desapareceram ao recarregar; acessório permaneceu. A função também zera os slots head/chest/weapon/legs/feet.

**Contexto:** parece fazer parte da reformulação de equipamentos. O jogo atual só permite equipar acessórios e o artesão informa que o restante está em preparo. Portanto, não é um caso de uma arma normalmente obtida e equipada no fluxo atual; é uma perda reproduzida de dados preexistentes/inseridos na fixture.

**Modificar:** usar migração versionada, com backup e compensação ou armazenamento dos itens antigos. Se os slots foram retirados, comunicar a mudança e retirar as exigências correspondentes de conquistas e filtros.

**Aceite:** saves de versões anteriores não perdem itens silenciosamente. Recarregar duas vezes não reaplica a migração.

**Locais:** `game.js:1660`, `:4273`. Teste: `equipamentos-persistencia`.

### 8. P2 — Habilidade bloqueada gasta turno na arena

**Evidência:** guerreiro com MP zero tentou usar a habilidade. O log registrou “Mana insuficiente!”, mas o turno mudou de host para convidado.

**Causa:** o `return` sai somente do callback de contexto; depois dele, `finishArenaRound()` executa mesmo quando a resolução foi bloqueada.

**Modificar:** devolver resultado explícito contendo `blocked` e `turnConsumed`, validado antes de avançar. Verificar condições antes de efeitos de início do turno para impedir reaplicação em tentativas inválidas.

**Aceite:** habilidade inexistente, sem mana ou sem vida não altera turno, buffs ou dano periódico. A ação válida seguinte funciona normalmente.

**Local:** `arena-system.js:320`. Teste: `arena-habilidade-bloqueada-consome-turno`.

### 9. P1 para multiplayer estável — Fechamento abrupto deixa duelo em andamento

**Evidência:** depois de fechar o contexto do convidado, o duelo permaneceu ativo por pelo menos 15 segundos. Não se afirma que permaneça assim indefinidamente; esse foi o limite observado.

**Resultado positivo relacionado:** a dungeon tratou saídas voluntárias: de três para dois membros continuou; ao sair o segundo convidado, encerrou a run e transferiu as moedas.

**Modificar:** heartbeat, prazo de inatividade, estado de desconexão visível, desistência/encerramento previsível e política de reconexão. Definir o comportamento quando o host cai.

**Aceite:** dentro do prazo definido pelo produto, o adversário vê a desconexão e tem caminho para continuar/sair sem perder a campanha. Testar perda de rede além do clique em “Sair”.

**Locais:** listeners de conexão em `arena-system.js:465` e nos fluxos de sala da dungeon. Evidência: `online-results.json`.

### 10. P2 — Card de personagem mostra atributos maiores que os reais

**Evidência:** guerreiro nível 20, com 19 pontos investidos em força ao longo dos níveis: ataque real 135; card do save apresentou 170.

**Causa:** `prepareSavedPlayerForPreview()` compara o ganho histórico com todos os pontos recalculados ao valor do nível atual, escolhendo o maior. Isso aumenta a apresentação sem alterar o personagem real da mesma forma.

**Modificar:** usar o ganho efetivamente salvo. Migração de saves incompletos deve ser separada da renderização do card. Alinhar a regra de respec com a regra escolhida para pontos por nível.

**Aceite:** card, personagem retomado e acampamento mostram os mesmos máximos e ataque.

**Local:** `game.js:5803`. Teste: `preview-save-diverge-dos-atributos-reais`.

### 11. P2 — Interface móvel prioriza os mapas acima das ações

**Evidência:** em 390×844, a primeira linha de ações ficou aproximadamente em Y=1045, fora da primeira tela. A página de combate chegou a 2685 px e a de troféus a 5441 px. Em 360 px, o bestiário apresentou largura de conteúdo de 370 px. O botão flutuante de configuração sobrepõe a área de combate em alguns enquadramentos.

**Modificar:** no celular, posicionar status, cena e ações primeiro; transformar mapas em painéis compactos/recolhíveis. Tornar ações de combate acessíveis sem rolagem repetida. Reduzir inventário vazio, revisar corte de placas de HP e manter configuração fora das ações. Corrigir o overflow específico do bestiário.

**Aceite:** em 360/390 px o jogador identifica o turno e alcança ataque/habilidades na primeira tela, sem rolagem horizontal. Verificar também teclado virtual e orientação paisagem em aparelhos reais.

**Locais:** `game.css`, especialmente regras de layout e media queries finais; `game.js:6045`. Evidências: screenshots e `telas-subsecoes-desktop-mobile`.

### 12. P2 — Conquistas exigem sistemas indisponíveis e mudam entre páginas

O artesão atual cataloga materiais, mas não cria equipamentos. Apenas acessórios podem ser equipados na campanha. Mesmo assim, existem conquistas para criar três equipamentos, equipar cinco slots e completar um set. Essas condições não têm caminho normal no estado atual.

Além disso, o módulo da dungeon adiciona quatro conquistas e substitui a sequência de 48 por 84 etapas. Ele é carregado em `index.html` e `dungeon.html`, mas não em `arena.html`. Assim, o catálogo e a base do cálculo de progresso não são únicos entre as páginas.

**Modificar:** catálogo compartilhado de conquistas e regras; sinalizar conteúdo futuro fora do total alcançável ou finalizar as funcionalidades. Separar requisitos de campanha por região de simples requisitos de nível, para que nomes como “Peregrino do Panteão” correspondam à ação realizada.

**Aceite:** o total/progresso não muda ao abrir arena; toda conquista disponível tem um fluxo alcançável e um teste de desbloqueio/persistência.

**Locais:** `achievement-system.js:41`; `dungeon-system.js`, override de `getTrophies`; `game.js:4442`, `:4273`; scripts dos três HTMLs.

### 13. P2 — Controles de desenvolvimento estão no fluxo normal

Há botão “Teste: Proximo nivel” no acampamento, opção de remover espera de renascimento e desbloqueio do bestiário nas configurações. O aumento de nível realmente concede XP e entra no save.

**Modificar:** separar modo de desenvolvimento e versão de jogador, com indicação clara de save de teste. Os controles continuam úteis para QA, mas o produto precisa decidir se fazem parte de uma experiência sandbox.

**Aceite:** a distribuição normal não apresenta ferramentas de teste sem uma opção de desenvolvimento explícita; saves de teste não entram em eventual classificação competitiva.

**Locais:** `game.js:2062`, `:568`, `:6187`.

### 14. P2 — Carga visual inicial pesada

O projeto original possui aproximadamente **240 MB** de arquivos, sem contar `.git` e os artefatos desta análise. Isso não significa que tudo seja baixado ao abrir o jogo.

No percurso local de seleção + início de combate, 21 recursos concluídos somaram aproximadamente **17,5 MB** de corpos transferidos, sem compressão do servidor de teste. Só o fundo da Floresta tem 6,2 MB; mapa de regiões 4,8 MB; mapa de locais 3,7 MB. A música tem 9,0 MB no disco e não está incluída como download completo nesse total observado.

**Modificar:** gerar formatos/tamanhos adequados à exibição, criar variantes para celular, carregar telas secundárias sob demanda, revisar arquivos de atlas/preview que precisam acompanhar a distribuição e configurar cache no ambiente de hospedagem.

**Aceite:** definir um orçamento de download por tela e comparar antes/depois em rede limitada, medindo entrada na primeira batalha e troca de região. Preservar a nitidez dos sprites e dos mapas.

**Evidências:** `static-results.json` e teste `recursos-dinamicos-e-peso-inicial`.

### 15. P2 — Estado, regras e renderização muito acoplados

`game.js` tem 7536 linhas; o sistema da dungeon, 2619. Os modos substituem funções globais e trocam temporariamente `player`, `enemy`, `playerEffects`, alocação e modo para reutilizar o motor. Isso explica parte da diferença entre dano PvE/PvP e das misturas de saves.

**Modificar:** extrair gradualmente resolução de ações, combatentes, persistência e seletores de apresentação. Ter uma função de cálculo e aplicação de dano com o mesmo contrato para campanha, dungeon e arena; manter diferenças de regras como parâmetros. Isolar o código do DOM das regras testáveis.

**Aceite:** os mesmos testes de escudo, DOT, cura, custos e morte rodam contra os três modos. A renderização de um card não muda regras nem dados salvos.

### 16. P2 — Documentação e regras exibidas precisam acompanhar o código

Exemplo concreto: o documento de balanceamento lista Recuperar Fôlego por 20 MP e cura de 7%/10%; o código atual usa custo base de 30 MP, acréscimo por nível e cura de 10%/15%. Também ainda aparecem tarefas genéricas de completar árvores que já possuem as rotas implementadas.

**Modificar:** gerar uma referência de habilidades a partir dos dados reais ou manter fixtures verificáveis de custo, duração e efeito. Definir a documentação de design separadamente de valores ativos.

**Aceite:** cada descrição e documento deixa claro qual versão/regra descreve; mudanças de habilidade atualizam a referência correspondente.

**Locais:** `docs/resumo_balanceamento.md`; `game.js:2429`; `docs/finalizacao_do_jogo.md`.

## Balanceamento e progressão

### O que as simulações mostram

Foram executadas 960 lutas de nível 1: quatro classes × três inimigos da Floresta × duas políticas de escolha × 40 sementes. Cada luta começou com recursos cheios, sem itens. As políticas foram ataque básico e escolha automática de ganho imediato, que não planeja combos futuros.

| Classe | Lobo: vitórias com básico | Média de turnos no lobo | Goblin: vitórias com básico | Aranha: vitórias com básico |
|---|---:|---:|---:|---:|
| Guerreiro | 40/40 | 5,0 | 32/40 | 0/40 |
| Arqueiro | 40/40 | 5,9 | 0/40 | 0/40 |
| Mago | 40/40 | 4,0 | 5/40 | 0/40 |
| Adepto da Natureza | 40/40 | 7,1 | 0/40 | 0/40 |

O código garante lobos nos três primeiros encontros da Floresta, o que já protege o início. Os números de Goblin/Aranha acima são testes forçados no nível 1, não a frequência natural desses encontros no começo. Servem para mostrar a necessidade de comunicar perigo e validar a transição para a tabela aleatória com HP/MP reais após as primeiras lutas.

Nas 576 simulações de chefes foram usados 16 caminhos finais, 12 chefes e três sementes por combinação. O nível do personagem acompanhou o do chefe, limitado a 100; cada ponto foi investido ao longo dos níveis alternando força/vitalidade/sabedoria. Não foram usados acessórios, poções ou armas; a política escolheu ações por dano, cura, escudo e DOT imediatos, sem planejamento de múltiplos turnos.

Houve 84 vitórias e nenhuma exceção numérica/erro de IA. Nas regiões finais, Arquimago e Corrompido concentraram as vitórias nessa configuração. Os primeiros chefes tiveram desempenho ruim com essa distribuição, enquanto algumas especializações posteriores deram saltos de poder. **Esses resultados não provam que outras classes sejam inviáveis ou que a campanha seja impossível**: faltam otimização das builds, equipamentos/acessórios, poções, estratégias e decisões humanas. Antes do nível 30/60, diferentes caminhos finais representam o mesmo personagem base/intermediário e repetem essa configuração na amostra.

O sinal útil é que a curva precisa de uma matriz deliberada de builds. Também é necessário validar chefes iniciais sem pressupor equipamentos que a campanha atual não entrega.

### O que modificar no design de progressão

- Definir builds de referência por classe em níveis 1, 10, 20, 30, 60, 80 e 100, incluindo distribuição, acessório, recursos disponíveis e estratégia esperada.
- Definir duração desejada de encontros comuns e chefes, necessidade de poções e margem de recuperação depois de uma escolha ruim.
- Verificar danos percentuais e redução fixa separadamente: podem anular vários golpes pequenos ou contornar a curva de HP de chefes. Evitar aplicar um mesmo ajuste global para corrigir classes com padrões de dano diferentes.
- Medir efeitos depois da correção das defesas da arena. Os resultados atuais de PvP não representam corretamente a força de builds defensivas.
- Explicar ganho por ponto e regra de redistribuição. Como o valor do ponto cresce com o nível, o cálculo histórico, o card de save e o respec precisam seguir uma política intencional.
- Avaliar recuperação inicial e frustração de morte. A espera normal cresce de `6 + 2 × nível` segundos e chega a 206 segundos no nível 100; medir se esse tempo contribui para a experiência.
- Definir o objetivo do endgame: o jogador termina no nível 100, mas há chefes de nível 110/120. Isso pode funcionar como desafio, desde que tenha builds, recompensas e comunicação adequadas.

## O que adicionar e melhorar no jogo

### Campanha e combate

Adicionar uma introdução curta e interativa: atacar, reconhecer o turno, usar uma habilidade, distribuir o primeiro ponto, visitar a pousada e equipar o primeiro acessório. Os mapas visuais são bons elementos de identidade, mas números precisam de nomes/legenda persistente no toque.

Mostrar a intenção do chefe antes da execução: ataque forte, preparação de escudo, dano contínuo ou controle. Exibir duração de efeitos, dano absorvido e motivo de indisponibilidade de habilidades de maneira consistente. Um botão desabilitado precisa explicar falta de MP, falta de HP ou restrição de status. Hoje o helper de disponibilidade olha mana e a renderização acrescenta uma trava específica; o custo de HP é validado somente ao executar.

Adicionar um resumo de vitória com XP, moedas, drops e próximo objetivo. No avanço regional, destacar quais criaturas faltam para liberar o chefe e permitir consultar essa informação em celular mesmo quando o botão está desabilitado.

### Equipamentos e economia

Fechar a decisão da reformulação: quais slots existem, como obter cada tipo de item e quais atributos modificam. Conectar materiais a receitas utilizáveis e a uma prévia de custo/resultado. Incluir comparação com o item equipado e explicação do bônus de conjunto.

Materiais atualmente têm coleta e venda, mas o artesão não os transforma em equipamentos. Resolver esse ciclo dará propósito aos drops já existentes. Só depois de fechar o fluxo deve-se calibrar custo de receitas, fontes de moeda e raridade.

Melhorar filtros e organização de inventário. Oferecer venda em quantidade e proteção/favorito para itens importantes, mantendo confirmação apenas onde uma perda seja difícil de recuperar. Mostrar custo e chance de melhoria da forja junto do saldo e uma mensagem de resultado persistente o suficiente para leitura.

### Dungeon

A estrutura de 84 encontros com intermissões já existe. Adicionar retomada de conexão dentro da mesma run, indicador de qualidade de conexão, confirmação visual de ação recebida e instruções de alvo. Explicar claramente o que é temporário, o que volta para a campanha e o que acontece em derrota/abandono.

Depois das correções, testar fonte e loja com estado do grupo inteiro, incluindo pedidos concorrentes. A fonte depende de pagamento compartilhado e sincronização; esses casos precisam de testes específicos. A conclusão de máquina de estados executada nesta análise não certifica todas as compras ou habilidades de suporte em grupo.

### Arena

Definir se a proposta é duelo livre entre amigos ou competição equilibrada. Para duelo livre, mostrar diferença de nível, atributos e equipamentos antes de iniciar. Para competição, planejar regras de normalização, autoridade e resultados verificáveis.

Adicionar um resultado de partida visível, revanche, desistência e prazo de turno. Exigir prontidão dos dois participantes e manter a campanha isolada do estado temporário da partida.

### Interface, áudio e acessibilidade

Manter a direção de arte das cenas e personagens; melhorar a hierarquia: ação e status primeiro, coleções e mapas em segundo plano. Os `aria-label` já presentes nos marcadores são um ponto positivo a preservar.

Permitir inspeção de skills e locais por toque e teclado, revisar foco visível e alvos pequenos dos filtros de conquistas. Evitar informação importante exclusivamente em hover ou cor. Adicionar opção para reduzir animações e ampliar texto.

Há apenas uma trilha de região configurada, na Floresta. Adicionar variedade musical por grupo de regiões e efeitos discretos para ações/vitória, com controles independentes. Revalidar autoplay e volume em dispositivos móveis reais.

### Saves e manutenção

Adicionar exportação/importação de personagem, backup anterior à migração e versão do schema. Tratar falha de armazenamento e informar quando salvar não foi possível. `localStorage.setItem()` é chamado sem recuperação em vários pontos; a falta de quota/armazenamento bloqueado é um risco de implementação identificado por leitura, não uma falha reproduzida nesta rodada.

Usar histórico de resultados de combate/run para conferir recompensas aplicadas uma vez. Unificar os dados compartilhados entre páginas, adicionar um README com execução local e manter uma suíte automática com verificações de invariantes. Os scripts desta análise coletam evidências; convém transformar os casos críticos em testes de regressão com assertions e saída de erro em CI.

## Ordem recomendada de execução

| Etapa | Entregas | Critério de saída |
|---|---|---|
| 1 — Integridade | Corrigir HTML remoto, validação de mensagens, consumo de turno, defesas PvP, isolamento de campanha e contadores da dungeon. | Todos os casos P1 correspondentes viram testes de regressão e passam. |
| 2 — Persistência e conexão | Migrações com backup, modelo de resultado único, desconexão/reconexão, tratamento de payload inválido e armazenamento indisponível. | Fechar/reabrir, perder conexão e repetir mensagens preservam dados e permitem recuperar o fluxo. |
| 3 — Produto coerente | Fechar equipamentos/crafting, revisar conquistas, remover controles de teste do fluxo normal e corrigir card de personagem. | Cada sistema anunciado tem caminho alcançável e progresso persistido. |
| 4 — Experiência e peso | Layout móvel, tooltips por toque, clareza de turno, imagens menores e carregamento por tela. | Batalha acessível em 360/390 px e orçamento de recursos medido. |
| 5 — Balanceamento e conteúdo | Builds de referência, campanha por classe, chefes, matriz PvP, fontes de moeda e recompensas de endgame. | Playtests completos e ajustes baseados em métricas, com regras de equipamento já estáveis. |

## O que ainda precisa de validação específica

- Campanha completa jogada por pessoas, do nível 1 ao 100, nas 16 especializações finais. A simulação não substitui esse teste.
- Dungeon inteira com grupo real de dois e três jogadores e níveis/equipamentos normais; a execução de 84 etapas usou fixture acelerada.
- Todos os pares de especialização no PvP após corrigir o motor defensivo.
- Latência alta, perda/duplicação/reordenação de mensagens, queda do host, mudança de rede e reconexão. A rede real aqui foi exercitada em uma mesma máquina, sem emulação de latência.
- Fonte, loja, consumíveis e suporte em grupo sob concorrência e falhas de rede.
- Navegadores adicionais e aparelhos físicos Android/iOS; nesta rodada houve emulação de viewport/toque no Edge.
- Quota de armazenamento, saves grandes, migrações reais de versões antigas e restauração de backup.
- Hospedagem de produção, cache, rede móvel e políticas de segurança. A análise usou servidor HTTP local.

## Evidências e reprodução

Pasta: `docs/qa/2026-10-27/`.

| Arquivo | Conteúdo |
|---|---|
| `smoke.cjs` / `smoke-results.json` | Fluxo inicial das quatro classes e screenshots. |
| `deep.cjs` / `deep-results.json` | Habilidades, saves, resoluções, interface e protocolo. |
| `online.cjs` / `online-results.json` | Conexões reais e comportamento de saída/desconexão. |
| `balance.cjs` / `balance-results.json` | Simulação com sementes e resultados por confronto. |
| `acceptance.cjs` / `acceptance-results.json` | Economia, preview, recursos e travessia acelerada da dungeon. |
| `static-audit.py` / `static-results.json` | Tamanho de arquivos, referências e imagens. |
| PNGs | Capturas para comparação visual. |

Executar os scripts a partir da raiz do projeto com `node docs/qa/2026-10-27/<nome>.cjs` e `python docs/qa/2026-10-27/static-audit.py`. Usam servidor local temporário e o Edge instalado. A importação do Playwright aponta para o runtime disponível nesta máquina; em outro ambiente, ajustar essa dependência. O teste `online.cjs` precisa de acesso à internet para carregar PeerJS e estabelecer sinalização.

Os testes com fixtures criam dados artificiais em perfis de navegador descartáveis. As alterações necessárias ao jogo estão descritas neste relatório e não foram implementadas nesta análise.

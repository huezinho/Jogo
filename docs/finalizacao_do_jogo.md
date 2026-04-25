# O que ainda falta para o jogo ser considerado finalizado

## 1. Responsividade e qualidade visual

- Revisar toda a HUD em telas pequenas:
  - combate principal
  - dungeon
  - arena
  - vilarejo
  - acampamento
  - inventario
  - bestiario
  - sala de trofeus
- Garantir boa leitura em resolucoes comuns:
  - 1366x768
  - 1920x1080
  - tablets
  - celulares em retrato
- Padronizar hierarquia visual:
  - acoes principais sempre mais visiveis
  - informacoes secundarias com menos peso
  - estados importantes com cor forte e consistente
- Refinar a identidade visual por area:
  - campanha
  - vilarejo
  - dungeon
  - arena
- Melhorar polimento visual de tooltips, feedbacks de hover, transicoes e estados desabilitados.

## 2. Gameplay e balanceamento

- Fechar o balanceamento de todas as classes e subclasses ate o nivel maximo.
- Revisar curva de poder:
  - early game
  - mid game
  - late game
  - end game
- Validar se todas as builds possuem:
  - burst
  - sustain
  - resposta defensiva
  - identidade clara
- Ajustar chefes e mobs para que cada regiao tenha dificuldade coerente com a progressao.
- Revisar arena PvP separadamente do PvE:
  - ordem de turno
  - burst excessivo
  - loops defensivos
  - escalas de cura
  - escudos
  - dano percentual
- Revisar dungeon para confirmar:
  - estabilidade online
  - progresso por run
  - valor real da loja
  - custo da fonte
  - ritmo entre batalhas e intermissoes

## 3. Conteudo

- Completar todas as arvores de habilidades das classes que ainda estao parciais.
- Preencher qualquer classe nova com:
  - habilidades ativas
  - passivas
  - upgrades de subclasse
  - descricoes finais
- Revisar todas as regioes para garantir:
  - 3 inimigos comuns da regiao
  - boss coerente
  - drops
  - set bonus
  - acessorio do boss
- Adicionar mais conquistas por:
  - campanha
  - colecao
  - chefes
  - dungeon
  - arena
  - economia
- Expandir crafting:
  - mais receitas
  - feedback de escassez de material
  - organizacao por categoria

## 4. Feedback ao jogador

- Padronizar feedback de combate:
  - dano
  - cura
  - ganho de escudo
  - perda de escudo
  - buffs
  - debuffs
  - DOT
  - turno pulado
  - critico
- Melhorar leitura de turno:
  - campanha
  - dungeon
  - arena
- Mostrar melhor:
  - porque uma skill nao pode ser usada
  - qual alvo foi escolhido
  - quanto de dano foi mitigado
  - quanto veio de buff, critico ou vulnerabilidade
- Dar feedback melhor em:
  - crafting
  - ferreiro
  - compra e venda
  - entrada e saida de dungeon
  - entrada e saida de arena

## 5. UX e fluxo geral

- Revisar onboarding do jogador novo:
  - escolha de classe
  - primeiro combate
  - distribuicao de pontos
  - vilarejo
  - inventario
  - crafting
- Melhorar clareza de interfaces com muito texto:
  - acampamento
  - bestiario
  - trofeus
  - documento de habilidades dentro do jogo
- Reduzir passos desnecessarios em fluxos repetidos:
  - curar
  - craftar
  - aprimorar
  - entrar em salas online
- Revisar teclas de atalho e exibi-las de forma consistente nas telas.

## 6. Multiplayer e robustez

- Validar confiabilidade de sincronizacao em:
  - dungeon
  - arena
- Testar cenarios de:
  - latencia alta
  - pacote atrasado
  - desconexao de host
  - desconexao de convidado
  - reconexao
- Garantir que toda acao online seja resolvida por estado autoritativo.
- Padronizar logs e mensagens de rede para facilitar debug.

## 7. Persistencia e integridade de dados

- Revisar tudo que deve salvar e tudo que nao deve salvar.
- Garantir consistencia de:
  - campanha
  - itens
  - equipamentos
  - trofeus
  - configuracoes
  - progresso de bosses
- Revisar o que a dungeon leva de volta para a campanha.
- Revisar o que a arena altera ou nao altera no progresso principal.

## 8. Organizacao tecnica

- Continuar quebrando arquivos grandes em modulos menores:
  - UI
  - combate
  - multiplayer
  - dados
  - inventario
  - classes
  - bosses
- Remover codigo legado e fluxos mortos conforme forem sendo substituidos.
- Criar uma camada mais clara para:
  - calculo de dano
  - aplicacao de efeitos
  - estados temporarios
  - sincronizacao online
- Padronizar nomes de funcoes, estruturas de estado e documentacao interna.

## 9. QA final

- Fazer checklist manual por classe e por subclasse.
- Fazer checklist por regiao.
- Testar chefes um a um.
- Testar arena com:
  - guerreiro vs mago
  - arqueiro vs guerreiro
  - mago vs arqueiro
  - espelhos de classe
- Testar dungeon com:
  - 2 jogadores
  - 3 jogadores
  - host trocando de sala
  - convidado saindo no meio

## 10. O que eu consideraria “pronto para release”

- Sem bugs bloqueadores no fluxo principal.
- Classes completas e legiveis.
- Progressao inteira jogavel do inicio ao fim.
- Dungeon estavel.
- Arena estavel.
- Visual consistente e responsivo.
- Feedback de combate claro.
- Sistemas de inventario, crafting, loja e ferreiro confiaveis.
- Documentacao minima de balanceamento e manutencao atualizada.

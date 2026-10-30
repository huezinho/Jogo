# Personagens pintados e animações

O repouso no jogo é estático para evitar a sensação de travamento entre poses. Os quadros de ataque, conjuração e dano continuam ativos.

Artes individuais geradas com a ferramenta integrada image_gen. São 28 folhas de personagem (quatro classes base e todas as subclasses), com 16 poses em quatro sequências de repouso, ataque básico, conjuração/suporte e dano. Há 63 folhas de efeito com oito quadros cada: 59 habilidades ativas e quatro ataques básicos.

O catálogo de caminhos está em catalogo.json. Os prompts e as origens estão em geracao/*.json. Os arquivos originais PNG gerados preservam transparência. As cópias empacotadas do projeto ficam em assets/visual/heroes-v2 e assets/visual/skill-fx. scripts/install-character-art.py separa as células, reserva o mesmo tamanho e alinha a base dos personagens, sem pintar ou sintetizar poses. Os efeitos preservam a origem nas células uniformes.

A implementação usa quadros desenhados para o corpo e efeitos próprios por ID de habilidade, não apenas deslocamento de uma imagem parada. A direção é para o inimigo à direita. Suporte aponta para o próprio personagem; ataques e controles, para o alvo. A redução de movimento é respeitada. As animações mantêm o bloqueio do turno até a conclusão e retornam ao repouso, com cancelamento seguro caso a tela seja recriada.

Nenhuma fórmula ou requisito foi alterado. As barras de dano e as reações acompanham o instante de impacto; os mísseis do mago não esperam a conjuração terminar para acertar. Os sprites antigos de inimigos permanecem como estão, e as páginas separadas de arena/dungeon mantêm seu renderizador anterior.

Verificação: `node scripts/run-regressions.cjs` executa as nove suítes da campanha. `python scripts/verify-character-art.py` confere as 91 folhas transparentes, os 448 quadros corporais e os 504 quadros de efeito. `verificar.cjs` testa as 28 classes/subclasses, as 59 habilidades ativas, os ataques básicos reais das quatro classes, a sequência de 15 mísseis do mago no nível 120, reação à queimadura, retorno ao repouso, limpeza dos efeitos, movimento reduzido e larguras 1366/390/320.

Prévia interativa: `index.html`. Prévia animada das quatro classes base: `classes-animadas.webp`. Capturas dos personagens por sequência: `personagens-pose-0.png` a `personagens-pose-3.png`. Captura do combate real: `combate-pintado.png`. Os resultados ficam em `verificacao.json` e `quadros.json`.

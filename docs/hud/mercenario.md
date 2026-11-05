# Mercenário — cenário e apresentação

Artes finais:

- `assets/visual/backgrounds/scenes/mercenary-lodge.webp`
- `assets/visual/hud/mercenary-vendor.webp`

Geradas com a ferramenta integrada `image_gen`.

Orientação do cenário: interior de alojamento medieval de mercenários, madeira e pedra, luz quente de lanternas, quadro discreto de contratos e armas guardadas. Estilo pintado realista de RPG, consistente com pousada e ferreiro. Primeiro plano esquerdo vazio para o personagem e lateral direita mais escura para o menu. Sem pessoas, texto ou interface.

Orientação do personagem: mercenário veterano adulto, barba curta, armadura de couro usada e algumas placas de aço, túnica verde apagada, capa, botas e espada embainhada. Segura um contrato enrolado e fica levemente voltado para o menu à direita. Corpo inteiro, iluminação quente, pintura realista, fundo transparente, sem texto.

Os contratos mostram apenas alvo, quantidade, região e progresso. Recompensas ficam no pop-up, também acessível por toque. Limites por raridade: comum 20, incomum 10 e raro 5. Contratos antigos são limitados sem apagar progresso; se já atingiram a nova meta, a coleta automática mantém a entrega única. Dificuldade e pagamento já aceitos são preservados.

As proporções de combate usam a área visível do primeiro quadro das imagens, calculada por `scripts/generate-combat-art-fit.py`. A tabela resultante em `assets/js/data/combat-art-fit.js` altera somente a apresentação de heróis e inimigos comuns; chefes mantêm escala maior.

Verificação: `node docs/qa/2026-11-05/mercenary-combat.cjs`.

# Guerreiro — piloto de enquadramento e animação

[Prévia interativa](index.html)

O piloto do Guerreiro base usa 15 imagens individuais, incluindo poses intermediárias e descanso no acampamento. As poses originais incluem: repouso, preparação, contato, recuperação, Esbarrão, Recuperar Fôlego e reação ao dano. Espada, escudo e capa ficam dentro de cada imagem; não há células vizinhas para invadir o recorte.

As poses são registradas em uma tela transparente de 384 × 384, com referência de apoio em (192, 376) e escala corporal consistente. O espaço superior e lateral reserva a extensão dos movimentos. O posicionamento no celular considera a ponta da arma e o escudo.

O ataque usa antecipação, contato e recuperação. O contato é mantido durante o evento de impacto. O Esbarrão usa a pose de escudo em vez da espada. O deslocamento curto acompanha o golpe, e os efeitos permanecem separados do corpo. A preferência por movimento reduzido é respeitada.

A prévia oferece câmera lenta e contorno da imagem com marcador de apoio. Esta é uma versão por poses e movimento do corpo inteiro para avaliar o resultado antes de ampliar o trabalho às subclasses e demais classes.

## Reprodução

- `fontes/*.png`: poses originais desenhadas separadamente.
- `fontes/anchors.json`: registro de cabeça, chão e pivô em cada fonte.
- `registration.json`: limites e escala de cada imagem exportada.
- `python3 scripts/pack-warrior-poses.py`: recorte e registro técnico, requer Pillow.
- `node scripts/test-warrior-art.cjs`: enquadramento em 320, 390 e 1366 pixels, poses de contato, limpeza de efeitos, movimento reduzido e renderização no jogo.
- `node scripts/test-warrior-balance.cjs`: regressão das regras de combate.

Para abrir a prévia, sirva a raiz do repositório com `python3 -m http.server 8000` e acesse `/docs/arte/guerreiro/index.html`.

## Ampliação de fluidez e descanso

O ataque de espada agora percorre oito poses diferentes; o Esbarrão percorre seis. Foram acrescentadas preparação, passagem da espada, continuidade do corte, retorno à guarda, preparação e retorno do escudo e reação intermediária ao dano. O instante do contato permanece sincronizado com o impacto.

A imagem sentada aparece quando o descanso está ativo no acampamento e desaparece ao levantar. O estado é mantido pelos salvamentos existentes. A pose pode ser vista também pelo botão de descanso da prévia.

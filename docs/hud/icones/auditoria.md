# Auditoria de imagens — 29/10/2026

Atualização concluída: o usuário autorizou artes próprias para habilidades e equipamentos e pediu preservar bolsa e marcador de acessório vazio. Foram instaladas 92 artes de habilidades e 96 de equipamentos. O catálogo e a verificação dessa implementação ficam em ../arsenal. O restante deste relatório registra o diagnóstico que motivou o trabalho.

## Conferência automatizada

Foram resolvidos os caminhos reais de 96 materiais, 12 acessórios de chefe e 48 sprites de inimigos/chefes da campanha. Após a correção descrita abaixo, nenhum desses 156 caminhos está ausente. Os arquivos desse conjunto também não apresentam conteúdo binário idêntico entre entradas distintas. Isso é uma comparação de arquivos, não uma promessa de que toda imagem do repositório seja visualmente exclusiva.

Os 12 retratos de selo e 48 drops secundários próprios também foram conferidos na suíte anterior, incluindo carga no navegador, arquivos distintos e as 12 regiões. A conferência das telas da campanha verifica imagens quebradas nas resoluções de desktop e celular. Arte não mostrada em um cenário de teste pode exigir uma inspeção específica.

## Erro encontrado e corrigido

O caminho dos 12 acessórios v2 não correspondia aos nomes reais. Por exemplo, o código procurava colar_de_raizes.png, enquanto a imagem existente é floresta_accessory_colar_de_raizes.png. Foi corrigido o gerador de caminhos para incluir a região e accessory. A correção atende também aos acessórios já salvos e não muda os itens.

## Reutilizações ainda existentes na interface

1. **Equipamentos dos conjuntos regionais:** a oficina e a bolsa usam as mesmas oito artes básicas: quatro peças de armadura e quatro armas por classe. O conjunto da Floresta e o de outras regiões mudam nome e atributos, mas não têm silhuetas próprias. As raridades também compartilham a arte-base. Esta é a maior lacuna visual restante. Referência: itemArt em campaign-hud.js.
2. **Habilidades:** skillIcon agrupa habilidades por efeito (cura, fogo, escudo, natureza etc.). Habilidades diferentes podem usar o mesmo ícone. O nome e custo são distintos, mas ainda faltam ícones individuais para diferenciá-las visualmente.
3. **Bolsa:** o botão usa item-chest.webp, que é a arte de armadura de peito. Falta um ícone próprio de bolsa/mochila. Isso não é arquivo quebrado; é uma reutilização semântica inadequada.
4. **Espaço de acessório vazio:** usa icon-holy.webp, também usado por habilidades sagradas. Um marcador neutro de acessório seria mais coerente.
5. **Alias de combate:** existe o redirecionamento explícito devorador-do-eco → devorador-de-eras. O catálogo principal de 48 inimigos/chefes tem caminhos próprios; o alias continua disponível para outros conteúdos. Não alterado nesta auditoria.

## Compartilhamentos que fazem sentido manter

Molduras normal/selecionada/desabilitada, pergaminhos, divisores, mapas e pictogramas de navegação devem conservar consistência. O mesmo material deve ter a mesma imagem na bolsa, na receita e na recompensa. Isso não representa falta de arte.

## Prioridade sugerida

Primeiro, criar um ícone de bolsa correto; depois, aparência própria para os conjuntos regionais; em seguida, ícones individuais das habilidades. Variantes de raridade e marcador de acessório vazio vêm depois. Não foram geradas novas artes nesta auditoria.

Dados brutos: auditoria-imagens.json. Reproduzir: node docs/hud/icones/auditar.cjs.

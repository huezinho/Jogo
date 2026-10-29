# Selos e novos drops

Artes geradas individualmente com a ferramenta integrada image_gen, com um prompt para cada ativo. São 12 retratos de chefes e 48 materiais secundários, identificados pelo catálogo real do jogo. Os prompts, caminhos de origem e identificadores constam em geracao.json; catalogo.json informa os arquivos usados em produção. Os arquivos originais ficam na pasta de imagens geradas do Codex; cópias completas em WebP, dimensionadas para uso como ícone, ficam no projeto.

- Retratos: assets/visual/bosses/*.webp.
- Materiais: assets/visual/items/components/*.webp.
- Embalagem das artes sem recorte ou repintura: scripts/install-generated-icons.py.
- Conferência: node docs/hud/icones/verificar.cjs.

O selo substitui o quadro discreto anterior. A borda preenche no sentido horário conforme as criaturas diferentes vencidas na região: repetir o mesmo inimigo não aumenta a porcentagem. O nome e o progresso continuam disponíveis como texto, e a barra conserva a semântica de progresso para acessibilidade. O círculo permanece completo quando o chefe está liberado e durante o combate com ele. Os estados de bloqueio do desafio não mudaram.

Os novos materiais deixam de apontar para o ícone do primeiro drop. O caminho é derivado do identificador estável do material, atendendo também aos itens já armazenados nos saves sem alterar IDs, receitas ou recompensas.

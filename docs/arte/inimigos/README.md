# Arte e animações dos inimigos — revisão por fases

[Abrir a galeria interativa](index.html) · [Amostra do Avatar do Zenith](../avatar-do-zenith/index.html)

A galeria compara cada inimigo com o Paladino atual, permite testar ataques, habilidades, passivas e transformações, e oferece miniaturas de todos os desenhos de cada fase. Ela não usa os salvamentos do jogo.

## Fases de criação

| Fase | Conteúdo | Folha por personagem |
| --- | --- | --- |
| 1 | 20 inimigos sem habilidades | 4 poses físicas: repouso, preparação, contato e reação |
| 2 | 11 inimigos com habilidades ativas e 5 com passivas | 8 poses para os ativos; 4 físicas para os passivos, com efeitos próprios |
| 3 | 12 chefes, cada um desenhado individualmente | 16 poses: repouso, ataque, habilidade e reação |

Os chefes usam imagens e enquadramento maiores. O Ent tem uma silhueta de árvore larga, com copa, raízes e tronco próprios. A escala e o enquadramento foram conferidos em telas de 320, 390 e 1366 pixels.

Cada habilidade ativa tem um efeito pintado com oito quadros. São 45 efeitos ao todo: 35 de habilidades ativas e 10 de passivas. Os gestos defensivos dos chefes não reproduzem o disparo ofensivo pintado na mesma folha. Inimigos sem habilidades não recebem poses de conjuração.

## Catálogo

| Região | Fase 1 — sem habilidades | Fase 2 — habilidades ou passivas | Fase 3 — chefe |
| --- | --- | --- | --- |
| Floresta | Lobo Sombrio; Goblin | Aranha Gigante | Ent Ancestral |
| Caverna | Morcego de Pedra; Esqueleto Mineiro | Slime Toxico | Troll das Profundezas |
| Ruinas | Sentinela Quebrada; Cultista Perdido | Fantasma Antigo | Rei Espectral |
| Pantano | Sapo Colossal; Bruxa do Brejo | Serpente do Lodo | Hidra do Lodo |
| Vulcao | Salamandra Rubra; Golem de Brasa | Fenix Sombria | Draco Magmatico |
| Abismo | Cavaleiro Abissal; Lamia do Eclipse | Colosso do Vazio | Arauto do Vazio |
| Fortaleza | Escudeiro de Ferro; Maga da Muralha | Carrasco de Guerra | General de Aco |
| Necropole | Guardiao Funebre; Feiticeira Morta | Ceifador de Ossos | Lorde da Cripta |
| Citadela | Anjo Caido; Drake Celeste | Executor Astral | Imperador do Eclipse |
| Panteao | Guardiao Aureo | Oraculo Radiante; Quimera Solar | Avatar do Zenith |
| Cataclismo | Arauto do Cataclismo | Titan Rachado; Serafim do Fim | Deus da Ruina |
| Paradoxo |  | Guardiao Temporal; Oraculo do Zero; Devorador de Eras | Soberano do Paradoxo |

## Transformações

| Personagem | Forma visual | Condição |
| --- | --- | --- |
| Fênix Sombria | Ovo, rachaduras e eclosão | A passiva revive o inimigo; o ovo permanece durante os três turnos de repouso e eclode quando o repouso termina |
| Corrompido | Demônio alado | Durante Incorporar Demônio; o contador visual acompanha a duração e a remoção do buff, inclusive com Canhão de Vidro ativo |
| Fada Monarca | Monarca coroada, asas e coroa radiantes | Enquanto Coroada estiver ativa |
| Avatar da Natureza | Forma Verdadeira | Enquanto a habilidade estiver ativa |

As três formas dos heróis têm 16 poses próprias. As imagens retornam à forma normal quando a condição expira. O ovo tem oito quadros: quatro de repouso e quatro de eclosão.

## Integração

- As ações usam o ID da habilidade real, com preparação e liberação separadas para as habilidades carregadas.
- As passivas exibem efeitos no momento de seus gatilhos e não fazem o inimigo conjurar uma habilidade inexistente.
- As reações a golpes usam as poses de impacto. Animações canceladas ou removidas da cena liberam seus efeitos.
- A preferência de movimento reduzido evita animações longas e efeitos móveis.
- Os números, custos, probabilidades e condições de combate existentes foram preservados. A única informação nova de estado é um contador visual da forma demoníaca.

## Arquivos e reprodução

- `fontes/producao.json`: organização das folhas por inimigo, fase e efeito, com limites de recorte entre linhas quando necessários.
- `fontes/*.png`: desenhos originais e recortes transparentes aprovados na conferência técnica.
- `atlas.json`: contagem e verificação dos quadros exportados.
- `assets/visual/enemies-v3/`: 48 inimigos e o ovo.
- `assets/visual/enemy-fx/`: 45 folhas de efeitos, incluindo as quatro do Avatar do Zenith.
- `assets/visual/hero-forms/`: três formas dos heróis.
- `assets/js/data/enemy-art.js`: catálogo visual utilizado pelo jogo.

Para reempacotar os desenhos, na raiz do repositório:

```sh
python3 scripts/pack-zenith-art.py
python3 scripts/pack-enemy-art.py
```

Os scripts apenas recortam e organizam os quadros desenhados; não inventam poses. Para abrir a galeria pelo servidor local:

```sh
python3 -m http.server 8000
```

Acesse `http://localhost:8000/docs/arte/inimigos/index.html`.

## Verificação

- `node scripts/test-enemy-art.cjs`: imagens decodificadas, 144 verificações de enquadramento, 48 ataques, 35 habilidades, 9 passivas do catálogo geral, formas, eclosão da Fênix após três turnos e integração no renderizador de combate. A Áurea Divina usa o módulo próprio do Avatar.
- `node scripts/test-campaign-enemy-rebalance.cjs`: 148 verificações de regras dos inimigos e interface de DOTs.
- `node scripts/test-mage-balance.cjs`: 99 verificações das fórmulas, contadores e salvamentos dos magos.

Evidências: [resultado visual automatizado](../../qa/2026-11-04-art/verification.json), [chefes](../../qa/2026-11-04-art/fase-3-catalogo.png), [Ent no celular](../../qa/2026-11-04-art/ent-390.png), [ovo da Fênix](../../qa/2026-11-04-art/phoenix-egg.png).

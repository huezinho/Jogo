> Histórico: perfis, fabricação por raridade e recompensas selecionáveis foram substituídos. Consulte as [regras e análise atuais da campanha](analise_campanha_nivel40.md).

# Correções, equipamentos e mercenário — 28/10/2026

Esta implementação parte dos defeitos reproduzidos na primeira análise. O documento antigo de balanceamento de personagens não foi usado. Os dados de classes, subclasses, ganhos de pontos dos níveis 1–100 e a definição de `getSkillInfo()` foram comparados com o código anterior e permanecem iguais. As mudanças nas habilidades corrigem aplicação, duração, autoria ou validação de efeitos.

## Habilidades e combate

- Bônus global de dano aplicado uma vez no ataque mágico; bônus fixo de Transbordando dividido entre os projéteis da mesma ação, evitando repeti-lo por míssil.
- Crítico do Sniper sem a adição duplicada; durações completas de Escudo de Fé e Cortes Ultrassônicos; imunidade a controle de Você Irá Me Parar? respeitada.
- Corrupção impede novos escudos ativos, a conversão de Transbordando e escudos de conjunto, inclusive antes da primeira ação do defensor na arena.
- Ações indisponíveis são rejeitadas antes de consumir turno ou avançar dano periódico. Na dungeon, Canto Ancestral alcança cada aliado uma vez, usa os bônus de equipamento do conjurador e contabiliza suporte efetivo aos aliados; Avalanche calcula o percentual e Gelo Queima para a vida de cada alvo.
- Autoria de DOT registrada na aplicação efetiva. Congelar sem queimadura preserva um DOT de outro personagem; os conjuntos só contabilizam aplicações reais. Nevasca, marcas e autoria de DOT sobrevivem à retomada da campanha.

## Equipamentos, drops e receitas

Há cinco slots de conjunto — cabeça, peito, arma, pernas e pés — e um acessório independente. Armas possuem identidade de cada classe; armaduras podem ser usadas por todas. Os quatro perfis são Ofensivo, Resistente, Arcano e Suporte. A interface apresenta atributos, ingredientes, custo e bônus de duas/quatro/cinco peças.

Cada região possui seu conjunto funcional: Raízes Vivas, Pedra Guardiã, Eco Antigo, Seiva Tóxica, Brasas Vivas, Corte do Vazio, Bastião, Ceifa Lenta, Eclipse Preciso, Farol do Grupo, Fúria Contida e Ruptura do Ciclo. Efeitos de ação, ecos e retaliações respeitam cargas, limites e recargas; múltiplos projéteis não viram múltiplas ativações do mesmo efeito.

O orçamento dos itens novos segue `(1 + 0,25 × nível do item) × peso do slot × fator de raridade`. O nível é fixado pela região, com teto 100; as raridades usam fatores 1/1,1/1,2/1,3/1,4. Resistência de equipamento usa rating com redução limitada a 45%. Os acessórios novos de chefe preservam sua identidade com efeitos limitados, sem entrar no conjunto. Acessórios e atributos legados são preservados no save.

Os 48 inimigos, incluindo chefes, fornecem dois componentes cada, totalizando 96 materiais canônicos. As rolagens são independentes: inimigos comuns têm 40%/24%, chefes têm 100%/55%. Ambos podem cair no mesmo abate. O primeiro componente preserva o ID antigo.

As receitas variam por peça e perfil e combinam componentes primários, secundários, materiais de chefe e moedas. Todos os 96 componentes têm uso em crafting; itens ultrarraros e lendários exigem também o segundo componente do chefe. Raridades maiores podem exigir componentes das duas regiões seguintes. O catálogo considera somente regiões desbloqueadas pelo personagem; obter um componente estrangeiro não libera uma região. Cada região oferece 100 receitas para a classe atual: cinco slots × quatro perfis × cinco raridades.

A forja dos itens novos exige a diferença positiva de ingredientes e moedas entre a receita atual e a próxima raridade. A melhoria é garantida e mantém o identificador do item. Acessórios novos também usam essa regra; acessórios legados mantêm sua regra anterior.

## Mercenário

O mercenário está no vilarejo. O quadro oferece seis contratos e renova a cada 30 minutos, com até três contratos ativos por personagem. Os alvos são inimigos comuns de regiões desbloqueadas. O pagamento permite escolher um componente de outra região, incluindo regiões seguintes necessárias ao crafting.

Contratos aceitos permanecem até conclusão ou abandono. Os abates correspondentes progridem o contrato; receber o prêmio é uma operação única. Campanha e recompensas confirmadas da dungeon contam, sem desbloquear regiões. O estado acompanha o personagem no save. Ao importar, ofertas são reconstruídas a partir do catálogo; IDs, alvos e recompensas são validados.

## Primeira análise: tratamento dos problemas

| Problema | Correção aplicada |
| --- | --- |
| HTML e perfil remoto na arena | Texto escapado, ícones locais, validação de estrutura/tamanho e combatentes reconstruídos de dados permitidos. Perfil não substitui o combatente durante o duelo. |
| Estado arbitrário e consumo de turno da dungeon | Host resolve intenções; rejeita estado bruto, revisões antigas e repetição de ação. Loja, fonte, consumíveis e evolução seguem operações validadas. |
| Defesas PvP ignoradas | Dano percorre as defesas do alvo, incluindo escudo, invulnerabilidade, esquiva, mitigação e reações. DOT usa o equipamento e as passivas do autor. |
| Arena alterava campanha | Snapshot separado; resultado registra estatísticas uma vez. HP/MP/estado da campanha são preservados na saída e no save. |
| Progresso e moedas da dungeon perdidos | Contadores e recompensas por run; transferência idempotente com registro de IDs, incluindo moedas, materiais, abates e conclusão. |
| Desconexão silenciosa | Heartbeat e prazo de inatividade de 12 segundos, conferido periodicamente; encerra o fluxo preservando campanha e último progresso confirmado. |
| Equipamentos removidos ao carregar | Migração versionada com backup, preservação de itens legados e suporte aos seis slots. |
| Preview divergente | Usa ganhos históricos salvos, sem recalcular todos os pontos pelo nível atual. |
| Celular | Navegação compacta com nomes, combate e ações na primeira tela em 360/390 px, sem overflow nos modos exercitados. |
| Conquistas inconsistentes | Catálogo compartilhado de 44 conquistas e sequência única de 84 encontros; crafting, cinco slots e conjuntos têm caminhos funcionais. |
| Ferramentas de desenvolvimento expostas | Controles exigem `?dev=1`; função de conceder nível protegida pelo mesmo modo. |
| Imagens pesadas | Fundos/mapas WebP mantêm originais. Seleção e primeira batalha mediram aproximadamente 4,4 MB locais sem áudio, ante 17,5 MB observados anteriormente. |
| Acoplamento de sistemas | Novos módulos de equipamento, armazenamento, importação/exportação e validação de rede. Resolutores online compartilham as rotinas de combate com contexto controlado; a extração do restante de `game.js` continua sendo manutenção futura. |
| Documentação obsoleta | Referência atual de habilidades gerada do código, gerador reexecutável, README e atualização das tarefas de árvores já implementadas. |

Falha de armazenamento mantém uma cópia da sessão em memória e mostra aviso para exportar antes de fechar. Exportar/importar usa JSON; a importação cria uma cópia em outro slot. Há restauração do backup de migração. Estruturas parciais e tipos inválidos são tratados antes da retomada.

## Validação e limites

As oito suites passaram na execução consolidada, incluindo as conexões reais. Os últimos ajustes de persistência e apresentação de equipamentos também passaram nas duas suites pertinentes. Evidências e scripts em [qa/2026-10-28](qa/2026-10-28/). As suites verificam mecânicas, não certificam balanceamento:

- 9.288 ações executadas: 28 formas de classe/subclasse, 59 habilidades ativas, 12 conjuntos e limiares de duas/quatro/cinco peças; sem exceções ou estados não finitos.
- 28 grupos de testes de equipamento: 4.800 combinações canônicas, 60 acessórios, 96/96 componentes com receitas, efeitos dos conjuntos, crafting/forja, drops e contratos; seis grupos de integração no navegador.
- Fluxo real de mercenário → abates → recompensa estrangeira → crafting → equipar → salvar/recarregar.
- Nove grupos de regressão da arena e dez da dungeon para mensagens inválidas, repetição, custos, defesa, suporte, progresso e saves. Travessia acelerada dos 84 encontros confirma a máquina de estados e o registro final.
- WebRTC real com dois clientes na arena e dois/três na dungeon; compras, fonte, evolução, saída, recompensa final, queda silenciosa e retomada do save.
- Saves legados, preview, backup/restauração, exportação/importação, quota indisponível e interface móvel, usando perfis descartáveis.

A travessia de 84 encontros usa fixture acelerada. Os testes de rede rodam em contextos isolados na mesma máquina; não substituem partidas em aparelhos físicos, redes móveis ou progressão normal de grupo. O encerramento por perda de conexão preserva o último estado confirmado; não há reconexão à mesma run. A autoridade continua no navegador do host, portanto não é certificação de antitrapaça para competição pública.

Próxima validação: força das builds com equipamentos, custos de farm, cura/escudo, dano percentual, combinações de conjuntos e progressão completa de campanha/PvP. Os coeficientes de personagens não foram ajustados para compensar esses números nesta etapa.

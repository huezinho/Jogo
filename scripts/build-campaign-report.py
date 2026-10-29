"""Generate the campaign assessment from reproducible test artifacts."""
from pathlib import Path
import json,statistics,collections
root=Path(__file__).resolve().parents[1]
qa=root/'docs/qa/campaign'
r=json.loads((qa/'progression-results.json').read_text(encoding='utf8'))['runs']
assert len(r)==96
matrix=json.loads((qa/'level-matrix-results.json').read_text(encoding='utf8'))
classes=['Guerreiro','Arqueiro','Mago','Adepto da Natureza']
rows=[];gear=[];front=[]
for cls in classes:
 a=[x for x in r if x['cls']==cls and x['plan']=='farm'];wins=[x for x in a if x['level']==40]
 rows.append(f"| {cls} | {len(wins)}/12 | {min(x['level'] for x in a)}–{max(x['level'] for x in a)} | {round(statistics.median(x['minutes'] for x in wins)) if wins else '—'} min |")
 first=[x['gearHistory'][0]['minutes'] for x in a if x['gearHistory']];full=[]
 for x in a:
  worn={}
  for h in x['gearHistory']:
   worn[h['slot']]=h['region']
   if len(worn)==5 and len(set(worn.values()))==1:full.append(h['minutes']);break
 gear.append(f"| {cls} | {statistics.median(first):.0f} min | {min(first)}–{max(first)} min | {str(round(statistics.median(full)))+' min' if full else 'Não completado antes de trocar peças de região'} |")
 counts=collections.Counter(x['frontier'][-1]['region'] for x in a)
 front.append(f"| {cls} | {'; '.join(f'{name}: {count}/12' for name,count in counts.items())} |")
routeRows=[]
for route in sorted(set(x['route'] for x in r)):
 a=[x for x in r if x['route']==route and x['plan']=='farm'];bad=collections.Counter(x['build'] for x in a if x['level']<40)
 routeRows.append(f"| {route} | {sum(x['level']==40 for x in a)}/6 | {', '.join(f'{build} ({n})' for build,n in bad.items()) or 'Nenhum bloqueio no limite adotado'} |")
text='''# Campanha até o nível 40 — regras atuais e avaliação

Data: 28/10/2026. Análise exclusiva da campanha. As rotinas de arena e dungeon não foram alteradas nesta rodada. Os coeficientes das habilidades e os ganhos de atributos dos personagens foram mantidos: as sugestões de balanceamento abaixo ainda não foram aplicadas.

## O que foi implementado

- **Mercenário:** cada contrato tem uma recompensa fixa, exibida antes de aceitar. Não há seletor de componente nem argumento de recompensa aceito pela operação. O esforço considera inimigo, quantidade, distância entre regiões e componente comum/secundário/de chefe; recompensas de chefe exigem mais abates e entregam uma unidade. Ofertas renovam a cada 30 minutos e até três contratos podem ficar ativos. São valores iniciais de economia, ainda sujeitos a medição de farm humano.
- **Equipamentos:** atributos fixos por região, sem variantes de perfil. Floresta prioriza vida/mana/poder; Caverna, vida/resistência/ataque; Ruínas e Vulcão, poder; Pântano e Necrópole, mana/poder/vida; Abismo, ataque/poder; Fortaleza, vida/resistência/escudo; Citadela, ataque; Panteão, cura/escudo/mana; Cataclismo, ataque/vida; Paradoxo, ataque/poder/mana. O peso do slot define o tamanho do orçamento.
- **Crafting:** cinco receitas comuns por região e classe. Seleção de região por mapa, com regiões bloqueadas visíveis e indisponíveis. Não se fabrica diretamente incomum, raro, ultrarraro ou lendário.
- **Ferreiro:** comum → incomum → rara → ultrarrara → lendária, uma operação por etapa. Cada melhoria exige moedas e materiais adicionais; material insuficiente não altera inventário ou saldo. Todos os 96 componentes têm uso em fabricação ou melhoria.
- **Limpeza:** removidos o catálogo antigo de drops de equipamento, estatísticas antigas de raridade, multiplicadores antigos, geração duplicada de conjuntos, forja probabilística e fallbacks de artesão/conjuntos/drops. Árvores de habilidades deixaram de ser copiadas para cada save, pois são derivadas do catálogo. Equipamentos salvos são reconstruídos pela mesma regra canônica. Foi mantida somente a conversão necessária para ler personagens e fazer backup; não existem duas economias de equipamentos em execução.

## Como os testes foram feitos

**96 progressões contínuas:** quatro classes × duas rotas de nível 30 × três distribuições × duas estratégias × duas sementes. Distribuições: equilibrada 1:1:1; ofensiva 6:2:2; arcana 2:2:6, em força:vitalidade:sabedoria. Pontos são investidos ao ganhar cada nível, usando o valor daquele nível.

A estratégia de avanço procura materiais e alterna combos; a conservadora evita inimigos acima da margem de segurança, usa habilidades de sustentação e trabalha contratos. Como política e alvo mudam juntos, os resultados comparam rotas completas; não isolam o efeito de uma habilidade ou do mercenário. Os inimigos-alvo são escolhidos diretamente pelo simulador: isto favorece o farm direcionado e não reproduz o sorteio de encontros e eventuais fugas do jogador.

O combate usa ataque, habilidades, defesas, regeneração, DOTs e efeitos dos equipamentos do jogo. Drops são rolados pelo sistema real. Fabricação e melhoria usam as operações e os custos reais; não se concedem conjuntos prontos. Restabelecer recursos na pousada só ocorre quando há moedas suficientes, pagando a fórmula atual de vida e mana. Morte segue recuperação de recursos e espera; não há multa monetária inventada. XP e recompensas são acumulados pelo controlador da simulação, sem clicar na tela de alocação. Não foram compradas poções nem usados acessórios aleatórios de chefe.

O relógio econômico assume **4 segundos por ação, 8 segundos de transição por combate e 20 segundos por descanso**. Ele também controla a renovação dos contratos. Os minutos são estimativas sob essas hipóteses, não tempo humano cronometrado. Cada rota para em nível 40, 15 derrotas ou 1.800 combates. Parar por derrota/cap de combate significa bloqueio daquela política; não prova impossibilidade de continuar com outra decisão.

Há ainda **11.520 lutas em checkpoints**, cobrindo cada nível de 1 a 40, com recursos cheios no início e apenas equipamento já registrado no início daquele nível na progressão correspondente. Essas lutas não são continuações da campanha: servem para separar força de combate de economia e acesso a itens. Por último, o teste de fronteira no nível 40 começa com recursos cheios e o equipamento efetivamente obtido pela rota e enfrenta chefes sequenciais até obter zero vitórias em três sementes. Zero em três é barreira observada, não prova matemática de impossibilidade.

Testes funcionais adicionais: 1.200 variantes canônicas de itens, uso dos 96 componentes, recompensa fixa, ordem das cinco raridades, falha atômica de melhoria e **348 usos de habilidades** até nível 40 com os 12 conjuntos. Não houve exceções ou valores não finitos nessas execuções. A navegação do artesão/mercenário também foi exercitada pelos botões e verificada em 390 px.

## Resultado das progressões

Na rota conservadora:

| Classe | Chegou ao 40 | Faixa de nível atingida | Tempo mediano entre as rotas que chegaram ao 40 |
| --- | ---: | ---: | ---: |
'''+ '\n'.join(rows)+'''

As rotas agressivas são registradas no JSON, mas não devem ser usadas para chamar uma classe de inviável: elas podem insistir em materiais/alvos fortes demais. O limite de 15 derrotas encerra uma política ruim, não o personagem. A rota conservadora é a referência mais útil para o ritmo pretendido da campanha.

| Rota de subclasse | Chegou ao 40 na rota conservadora | Distribuições que ficaram bloqueadas |
| --- | ---: | --- |
'''+ '\n'.join(routeRows)+'''

## Ritmo dos equipamentos

| Classe | Primeira peça: mediana | Faixa da primeira peça | Primeiro conjunto de cinco peças da mesma região: mediana entre os que completaram |
| --- | ---: | ---: | --- |
'''+ '\n'.join(gear)+'''

A política substitui peças quando fabrica algo da região mais recente. Isso pode interromper um conjunto antes da quinta peça; não é recomendação de rotação ótima. O resultado mostra a necessidade de comparar claramente o bônus perdido antes de equipar uma peça nova e de testar uma política dedicada a preservar conjuntos. Não há dados suficientes para declarar o conjunto mais forte em cada classe.

**Principal problema de entrada:** a primeira arma da Floresta ainda exige componente de Aranha e outro componente secundário. O jogador precisa vencer parte do conteúdo que o equipamento deveria ajudá-lo a vencer. A arma também herda a distribuição de vida/mana/poder da região; Guerreiro e Arqueiro não recebem ataque plano nela. Como força concede ataque e poder simultaneamente, o jogador acaba dependendo mais dos pontos do que da primeira arma.

Proposta para a próxima calibração: arma inicial em 5–10 minutos, primeiras armaduras em 10–20, conjunto comum em 25–40 e primeiro ciclo de melhoria depois disso. São metas de design, não resultados medidos. A arma inicial deveria usar componentes do Lobo; peças seguintes introduzem Goblin e Aranha. A identidade regional deve permanecer na armadura e nos secundários, enquanto a arma reserva uma parte fixa do orçamento para o atributo ofensivo apropriado da classe. Isso continua sem perfis selecionáveis.

## Até onde o nível 40 avançou

Primeira região com chefe sem vitórias em três tentativas, nas 12 rotas conservadoras de cada classe:

| Classe | Barreira observada no teste separado de nível 40 |
| --- | --- |
'''+ '\n'.join(front)+'''

A região listada é a que bloqueou o avanço, não uma região concluída. Essa fronteira usa equipamento adquirido na rota e recursos cheios; inclusive rotas que pararam antes do 40 recebem o nível 40 apenas nesta fixture. Não significa que o jogador chegou naturalmente ali. Diferenças de chefes, atributos e escolhas do controlador impedem transformar estes números diretamente em uma tier list definitiva.

## Avaliação por classe e habilidades

### Guerreiro

O início oferece Recuperar Fôlego como ativa; a primeira ofensiva chega no 20. A cura inicial de 10% por 30 MP frequentemente compra pouco tempo contra o próximo ataque. Investir demais em sabedoria aumenta recursos, mas não resolve a ausência de dano; as rotas arcanas são o principal caso a revisar. Espadachim ganha ferramentas ofensivas no 30; Cavaleiro ganha mitigação e combinações que dependem mais de sobrevivência e vida.

**Melhorar:** acesso a uma ofensiva simples antes do 20, retorno inicial de Recuperar Fôlego e ataque plano da arma. Comparar uma ofensiva de nível 5–8 com custo pequeno, sem simplesmente aumentar todos os scalings. **Enfraquecer agora:** nenhuma habilidade demonstrou excesso consistente até 40. Verificar separadamente a redução fixa que torna inimigos antigos inofensivos: não compensar um início fraco criando imunidade ao farm por horas.

### Arqueiro

Até o 20 depende de ataques e Mirar; Camuflagem chega no 20 e a primeira ofensiva de subclasse no 30. A rota conservadora funciona, mas o tempo de preparação e sequências de erros punem o começo. Atirador ganha Headshot e Pulso Firme no 40; Caçador ganha Rajada. As rotas e distribuições devem ser julgadas pelo custo da preparação e pelo dano por ação, não só pelo maior crítico.

**Melhorar:** consistência dos primeiros ataques, explicação de Mirar e ataque da arma. Testar um piso de acerto maior nos primeiros níveis ou preparação menos onerosa. **Enfraquecer agora:** não há evidência suficiente para nerfar genericamente crítico ou Rajada. Os poucos avanços mais distantes exigem mais sementes e comparações com o mesmo chefe antes de um ajuste.

### Mago

Até o 19 usa Mísseis Mágicos; a ativa Explosão de Mana chega no 20. O ponto mais forte da análise é o salto contra chefes com mana: a explosão acrescenta **quatro vezes a mana removida**, remove metade da mana atual do alvo e custa aproximadamente 20 + 0,2 × nível antes de modificadores. Ela recebe dano do recurso do adversário e simultaneamente reduz sua capacidade de responder. Equipamentos de mana também aumentam a regeneração, pois o motor recupera 10% da mana máxima por turno como base.

**Enfraquecer primeiro:** a conversão da mana inimiga em dano de Explosão de Mana, mantendo a identidade de drenagem. Experimentar um multiplicador menor ou um teto ligado ao poder do personagem; comparar com o mesmo chefe e separar o dano próprio do bônus drenado. **Melhorar:** variedade antes do 20 e transição do equipamento inicial. **Não fazer ainda:** nerf geral do Mago ou da regeneração global baseado apenas nesses resultados; isso pode piorar as outras classes e confundir economia com dano.

### Adepto da Natureza

Semente Viva usa 0,7 × ataque + 0,3 × poder. Marca com dano chega pela rota de Druida no 30; Raízes no 20; Seiva/Aura no 40. A distribuição com muita sabedoria cria reserva de mana, mas não escala diretamente o dano de Semente. Cura ativa em grupo só aparece depois deste recorte, no 50. Há uma distância entre a identidade de sustentação sugerida ao iniciante e as ferramentas realmente disponíveis antes do 30/40.

**Melhorar:** dano/eficiência inicial de Semente, feedback da marca e alguma sustentação modesta antes do 40, sem antecipar todo o kit final. Dar uma razão clara para investir em sabedoria ou avisar que força também aumenta poder de habilidade. **Enfraquecer agora:** não há base para nerfar a classe inteira. Quando o DOT está estabelecido, testar a interação de Seiva com múltiplos efeitos e conjuntos antes de ampliar sua cura.

## Ordem recomendada de ajustes

1. Destravar a primeira arma e as primeiras receitas; preservar orçamento ofensivo apropriado na arma, sem reintroduzir perfis.
2. Melhorar variedade e consistência do combate antes do 20. Explicar força/poder/sabedoria e os bônus perdidos ao trocar conjuntos.
3. Reduzir o excesso específico de Explosão de Mana contra mana de chefe; repetir confrontos com o mesmo equipamento e alvo.
4. Calibrar pousada, custo das melhorias e recompensa fixa dos contratos pelo tempo esperado de obtenção do componente. O quadro aleatório ainda precisa de proteção contra longos períodos sem o material necessário; recompensa fixa não exige oferta inútil.
5. Repetir progressões com poções, encontros sorteados, fuga, preservação de conjuntos e jogadores humanos. Só então fechar os scalings de cada classe e a progressão regional.

A campanha está mais coerente nas regras, mas estes resultados **não justificam chamá-la de 100% balanceada**. Não foram aplicados buffs/nerfs de coeficientes nesta rodada. Os pontos acima são as prioridades concretas para chegar lá.

## Reprodução e evidências

- `node scripts/run-regressions.cjs`: regras e habilidades atuais.
- `node scripts/run-regressions.cjs --analysis`: repete também as simulações; usa cache temporário para gravações frequentes e copia o resultado final ao projeto.
- [Progressões contínuas](qa/campaign/progression-results.json), [checkpoints 1–40](qa/campaign/level-matrix-results.json), [regras](qa/campaign/rules-results.json), [habilidades](qa/campaign/skills-results.json).
- Fontes do simulador: `docs/qa/campaign/simulation.js`, `progression.cjs` e `level-matrix.cjs`. O combate é real; navegação, recompensas, alocação e escolhas são controlados pela fixture.

As amostras usam duas sementes por rota e três na fronteira. Os dados são exploratórios; não medem taxa de vitória da população de jogadores. A estimativa de horas não inclui leitura, interface, obtenção aleatória do encontro desejado, pausas ou tempo humano de decisão.
'''
(root/'docs/analise_campanha_nivel40.md').write_text(text,encoding='utf8')
print('Report generated')

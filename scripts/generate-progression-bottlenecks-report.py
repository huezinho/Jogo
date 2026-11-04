import json,collections,csv,statistics
from pathlib import Path
root=Path('docs/qa/progression-bottlenecks-2026-11-04')
routes=['paladino','berserker','samurai','ninja','sniper','atirador_arcano','espreitador','guarda_florestal','mago_incendiario','mago_frigido','arquimago','corrompido']
labels=dict(zip(routes,['Paladino','Berserker','Samurai','Ninja','Sniper','Atirador Arcano','Espreitador','Guarda Florestal','Mago Incendiário','Mago Frígido','Arquimago','Corrompido']))
runs=[json.loads((root/f'{route}-{seed}.json').read_text()) for route in routes for seed in [101,202,303]]
weights={'head':.6,'chest':1,'weapon':1.2,'legs':.8,'feet':.5,'accessory':.6};rarity={'comum':1,'incomum':1.5,'rara':2,'ultra_rara':3,'lendaria':4};ranks={k:i for i,k in enumerate(rarity)}
all_encounters=[];episodes=[]
def gear_info(gear):
 values=[v for v in gear.values() if v]
 budget=sum(weights[k]*rarity[v['rarity']] for k,v in gear.items() if v)/18.8
 counts=collections.Counter(v['rarity'] for v in values)
 desc='sem equipamentos' if not values else ', '.join(f'{n} {name}' for name,n in counts.items())+f'; {6-len(values)} slots vazios'
 weak=budget<=.250001 and all(ranks[v['rarity']]<=1 for v in values)
 return budget,desc,weak
for r in runs:
 assert r['done'] and all(r['replication'].values()),(r['route'],r['seed'],'replication')
 assert len(r['encounters'])==r['fights']
 assert sum(e['outcome']=='death' for e in r['encounters'])==r['deaths']
 assert r['reason']=='Paradoxo derrotado' or r['level']==100 and r['fullLegendary'] and r['endgameDeaths']==11
 groups=collections.defaultdict(list)
 for e in r['encounters']:
  assert isinstance(e['hpMinRatio'],(int,float)) and 0<=e['hpMinRatio']<=1.00001
  if e['outcome']=='win':assert e['preReward'] is not None
  budget,desc,weak=gear_info(e['gear'])
  row={**e,'route':r['route'],'seed':r['seed'],'gap':e['level']-e['enemyLevel'],'budget':budget,'gearDescription':desc,'weak':weak}
  all_encounters.append(row);groups[e['foe']['name']].append(row)
 for name,es in groups.items():
  first=es[0];win=next((e for e in es if e['outcome']=='win'),None);end=win or es[-1];before=[e for e in es if not win or e['fight']<win['fight']]
  gifts=[g for g in r['gifts'] if first['fight']<=g['fight']<end['fight']]
  ep={'route':r['route'],'seed':r['seed'],'name':name,'region':first['foe']['region'],'boss':first['foe']['isBoss'],'enemyLevel':first['enemyLevel'],'startLevel':first['level'],'entryGap':first['gap'],'endLevel':end['level'],'gap':end['gap'],'deaths':sum(e['outcome']=='death' for e in before),'escapes':sum(e['outcome']=='escape' for e in before),'won':win is not None,'rounds':end['rounds'],'hpMinRatio':end['hpMinRatio'],'levelGain':end['level']-first['level'],'giftLevels':sum(g['to']-g['from'] for g in gifts if g['kind']=='level'),'gearGifts':sum(g['kind']=='gear' for g in gifts),'budget':end['budget'],'gearDescription':end['gearDescription'],'weak':end['weak'],'totalRoundsToFirstWinOrStop':sum(e['rounds'] for e in es if e['fight']<=end['fight']),'fight':end['fight']}
  ep['easy']=ep['won'] and ep['deaths']==0 and ep['escapes']==0 and ep['rounds']<=3 and ep['hpMinRatio']>=.7 and (ep['gap']<=-10 or ep['weak'])
  episodes.append(ep)
# CSV exports preserve all enemy matchups; the report selects highlights.
fields=['route','seed','name','region','boss','enemyLevel','startLevel','entryGap','endLevel','gap','won','deaths','escapes','levelGain','giftLevels','gearGifts','rounds','hpMinRatio','budget','gearDescription','weak','easy','totalRoundsToFirstWinOrStop','fight']
with(root/'matchups.csv').open('w',newline='')as f:
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(episodes)
with(root/'encounters.csv').open('w',newline='')as f:
 fields2=['route','seed','fight','enemy','enemyLevel','heroLevel','gap','outcome','rounds','hpMinRatio','gearBudget','gear']
 w=csv.DictWriter(f,fieldnames=fields2);w.writeheader()
 for e in all_encounters:w.writerow(dict(zip(fields2,[e['route'],e['seed'],e['fight'],e['foe']['name'],e['enemyLevel'],e['level'],e['gap'],e['outcome'],e['rounds'],e['hpMinRatio'],e['budget'],e['gearDescription']])))
maxover=max(e['gap'] for e in all_encounters if e['outcome']=='win')
audit={'runs':len(runs),'fights':sum(r['fights'] for r in runs),'allReplicatePriorOutcomes':True,'allHaveEntryLevelGearAndRounds':True,'allHaveHpObservations':True,'distinctEnemies':len({e['foe']['name'] for e in all_encounters}),'allQuitsRespectPreparationLimit':True,'maxWinningOverlevel':maxover,'easyMatchups':sum(e['easy'] for e in episodes)}
(root/'audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
def span(xs):return str(min(xs)) if min(xs)==max(xs) else f'{min(xs)}–{max(xs)}'
def strongest_case(xs):return max(xs,key=lambda e:(e['deaths']+e['escapes'],e['levelGain'],e['gearGifts']))
def rowdetail(e):return f"{e['name']} (Nv. {e['enemyLevel']}), semente {e['seed']}: herói {e['startLevel']} → {e['endLevel']}; {e['deaths']} mortes, {e['escapes']} fugas, {e['gearGifts']} melhorias; "+('venceu' if e['won'] else 'não venceu')+f"; diferença final {e['gap']:+d} níveis."
lines=['# Onde a progressão trava ou fica fácil — 04/11/2026','','## Escopo e conclusão','',f"Foram reconstruídas as **36 campanhas** de Guerreiro, Arqueiro e Mago com os mesmos inimigos, sementes, políticas e equipamentos das análises anteriores, agora com registro por luta. Os {audit['fights']} combates reproduziram os totais anteriores de lutas, mortes, nível final, fugas e resultado. O nível usado aqui é o da entrada da luta, antes do XP da vitória.",'',f"**O maior overlevel observado em qualquer vitória foi +{maxover}.** Não houve vitória com +10 ou mais níveis. As principais travas exigiram muitos níveis de recuperação e melhorias, mas frequentemente terminaram com o herói ainda abaixo do inimigo. Por isso, ficar preso por várias tentativas não equivale automaticamente a precisar ultrapassar muito o nível do alvo.",'','## Como foram classificados os casos','','- Diferença de nível = nível do herói na entrada − nível do inimigo. Positivo é overlevel; negativo é underlevel.','- Overlevel elevado: pelo menos +10; underlevel elevado: pelo menos −10. Os valores exatos são mostrados para não depender do rótulo.','- Bloqueio de preparação: seis ou mais falhas antes da primeira vitória; os bloqueios sem vitória são listados separadamente.','- Vitória muito fácil: primeira vitória sem derrota/fuga anterior contra aquele inimigo, em até três rodadas, preservando pelo menos 70% da vida máxima nos pontos observados, e com underlevel elevado ou kit básico/fraco.','- Kit básico/fraco: até 25% do orçamento-base de seis lendários do mesmo nível, sem nenhuma peça rara ou superior. Esse orçamento usa pesos e fatores atuais; não é uma porcentagem de força real, nem substitui a descrição das peças.','- Uma rodada é uma oportunidade de ação do herói, inclusive quando ele perde o turno. Vida é observada após ações e imediatamente antes das recompensas; não é um registro contínuo de todo evento interno.','','O teste continua usando recuperação completa entre lutas e níveis/melhorias concedidos após falhas. “Muito tempo” é medido por derrotas, rodadas e preparação, não por minutos de farm. Níveis e raridade sobem juntos: o nível em que passou é observado, não uma prova do menor nível possível. As rotas compartilham a classe-base e parte das mesmas trajetórias antes dos níveis 30/60.','','## Maiores travas de preparação por rota','','Cada linha seleciona, entre as três sementes, a maior sequência de falhas antes da primeira vitória em um inimigo. Esta tabela considera somente bloqueios finalmente superados; os insuperáveis vêm depois.','','| Rota final | Semente | Inimigo e nível | Nível na chegada → vitória | Mortes antes de passar | Melhorias concedidas | Diferença ao vencer |','| --- | ---: | --- | --- | ---: | ---: | ---: |']
for route in routes:
 e=strongest_case([e for e in episodes if e['route']==route and e['won']]);lines.append(f"| {labels[route]} | {e['seed']} | {e['name']} — {e['enemyLevel']} | {e['startLevel']} → {e['endLevel']} | {e['deaths']} | {e['gearGifts']} | {e['gap']:+d} |")
lines+=['','## Onde houve overlevel de fato','','Esta tabela mostra a maior diferença positiva em vitórias por rota, incluindo os casos em que o herói já chegou forte por ter travado anteriormente em outro inimigo. Não implica que o overlevel tenha sido necessário naquele combate.','','| Rota | Maior diferença positiva | Caso observado | Falhas anteriores nesse alvo |','| --- | ---: | --- | ---: |']
for route in routes:
 es=[e for e in episodes if e['route']==route and e['won'] and e['gap']>0]
 if not es:lines.append(f'| {labels[route]} | Nenhuma | Sempre venceu no mesmo nível ou abaixo | — |');continue
 e=max(es,key=lambda e:(e['gap'],e['deaths']));lines.append(f"| {labels[route]} | +{e['gap']} | {e['name']}: herói {e['endLevel']} × inimigo {e['enemyLevel']} | {e['deaths']+e['escapes']} |")
lines+=['','## Vitórias muito fáceis com underlevel','','Melhor exemplo observado por rota que atendeu a todos os critérios de facilidade. O kit pode estar forte: underlevel e equipamento fraco são critérios separados.','','| Rota | Semente | Inimigo | Herói × inimigo | Diferença | Rodadas | Menor vida observada | Equipamento |','| --- | ---: | --- | --- | ---: | ---: | ---: | --- |']
for route in routes:
 es=[e for e in episodes if e['route']==route and e['easy'] and e['gap']<=-10]
 if not es:lines.append(f'| {labels[route]} | — | Nenhum caso com os critérios adotados | — | — | — | — | — |');continue
 e=min(es,key=lambda e:(e['gap'],e['rounds']));lines.append(f"| {labels[route]} | {e['seed']} | {e['name']} | {e['endLevel']} × {e['enemyLevel']} | {e['gap']} | {e['rounds']} | {e['hpMinRatio']:.0%} | {e['gearDescription']} |")
lines+=['','## Vitórias muito fáceis com equipamento básico/fraco','','Exemplos a partir de inimigos nível 20, para não tratar a facilidade do tutorial como problema. Prioriza-se o inimigo de maior nível que passou com kit básico e cumpriu os critérios de vida/rodadas.','','| Rota | Semente | Inimigo | Herói × inimigo | Rodadas | Menor vida observada | Peças na entrada |','| --- | ---: | --- | --- | ---: | ---: | --- |']
for route in routes:
 es=[e for e in episodes if e['route']==route and e['easy'] and e['weak'] and e['enemyLevel']>=20]
 if not es:lines.append(f'| {labels[route]} | — | Nenhum caso com os critérios adotados | — | — | — | — |');continue
 e=max(es,key=lambda e:(e['enemyLevel'],-e['rounds']));lines.append(f"| {labels[route]} | {e['seed']} | {e['name']} | {e['endLevel']} × {e['enemyLevel']} | {e['rounds']} | {e['hpMinRatio']:.0%} | {e['gearDescription']} |")
lines+=['','## Barreiras não superadas','','Nessas campanhas o nível máximo impede continuar ganhando níveis. Todas as desistências cumpriram seis lendários e 11 mortes já com preparação máxima; esse contador é acumulado na campanha, não reiniciado por inimigo.','','| Rota | Semente | Último inimigo | Nível do alvo | Herói | Diferença | Falhas nesse alvo até parar |','| --- | ---: | --- | ---: | ---: | ---: | ---: |']
for r in runs:
 if r['reason']=='Paradoxo derrotado':continue
 target=r['encounters'][-1]['foe']['name'];ep=next(e for e in episodes if e['route']==r['route'] and e['seed']==r['seed'] and e['name']==target)
 lines.append(f"| {labels[r['route']]} | {r['seed']} | {target} | {ep['enemyLevel']} | {ep['endLevel']} | {ep['gap']} | {ep['deaths']+ep['escapes']} |")
lines+=['','## Combates vencidos mais longos','','Uma luta pode ser vencida sem bloqueio de progressão, mas exigir muitas rodadas. São os 12 maiores números de rodadas nas primeiras vitórias por inimigo, sem confundir essa duração com tempo de farm.','','| Rota | Semente | Inimigo | Nível herói × inimigo | Rodadas | Mortes anteriores |','| --- | ---: | --- | --- | ---: | ---: |']
for e in sorted([e for e in episodes if e['won']],key=lambda e:e['rounds'],reverse=True)[:12]:lines.append(f"| {labels[e['route']]} | {e['seed']} | {e['name']} | {e['endLevel']} × {e['enemyLevel']} | {e['rounds']} | {e['deaths']} |")
lines+=['','## Leitura prática dos gargalos','',
'O Draco é a maior exigência de overlevel real observada: Elementalista chegou a precisar do nível 58 contra o nível 50, após 24 mortes e 12 melhorias. Esses combates ocorreram antes do nível 60; portanto não medem ainda o kit de Incendiário/Frígido, apesar do nome da rota final.',
'',
'O Avatar é o maior salto de preparação em várias rotas: Paladino saiu de 66 para 97, com 31 mortes; Ninja e Espreitador também precisaram chegar a 100 em casos que começaram bem abaixo. Isso é recuperar defasagem e melhorar o kit, não ultrapassar muito o nível 100 do chefe.',
'',
'O Troll é um gargalo de duração, mesmo quando não exige muitas mortes: o Guerreiro-base chegou a levar 168 rodadas para vencer no nível 15 contra o nível 20. As quatro rotas compartilham esse prefixo. Isso aponta para um confronto/rotação de baixo progresso, não para quatro observações independentes de subclasses finais.',
'',
'Os melhores exemplos de facilidade com kit básico depois do tutorial estão no Cultista Perdido: Mago-base nível 20, cinco peças comuns e um slot vazio, três rodadas e 78% de vida preservada contra o nível 23. As quatro rotas de Mago compartilham esse início; não são quatro subclasses diferentes dominando o mesmo alvo.',
'',
'Já os casos de grande underlevel com equipamento raro/lendário são outra situação: o kit e as sinergias compensam a defasagem. Eles merecem revisão pontual se a intenção era que esses inimigos segurassem a progressão, mas não mostram facilidade com equipamento fraco.',
'',
'## Limites da leitura','','A preparação é artificial e os conjuntos não foram otimizados. A raridade lendária não garante uma build adequada: Guerreiro misturou Floresta/Caverna e Arqueiro manteve peças iniciais; a arma da Floresta favorece poder de habilidade. Refletir pode ser prejudicial contra Pacto Fúnebre. Esquiva pode produzir vitórias com vida intacta em poucas tentativas; três sementes não provam que o resultado fácil será sempre repetido.','','O nível máximo do herói é 100, enquanto os últimos inimigos chegam a 120. Parte do underlevel final é estrutural: vencer abaixo do nível do alvo, por si só, não demonstra facilidade. Por isso foram exigidas poucas rodadas e vida preservada.','','O Mago conserva a política da análise anterior; Guerreiro/Arqueiro usam a versão que reconhece Pacto, remoção/roubo de buffs e ataques carregados. São dados de progresso dessas estratégias, não uma busca por jogo perfeito. Não alterei os inimigos nem as habilidades para produzir estes resultados.','','## Dados completos e reprodução','','- `node scripts/run-progression-bottlenecks.cjs`: coleta os registros, retoma arquivos completos e confere a reprodução dos resultados antigos.','- `python3 scripts/generate-progression-bottlenecks-report.py`: audita e gera este relatório.','- Pasta `docs/qa/progression-bottlenecks-2026-11-04/`: 36 registros individuais, `encounters.csv` com todas as lutas e `matchups.csv` com cada combinação de rota/semente/inimigo.','- `audit.json` registra a cobertura, reprodução e maior diferença de níveis observada.']
Path('docs/analise_gargalos_progressao_2026-11-04.md').write_text('\n'.join(lines)+'\n')
print(json.dumps(audit,ensure_ascii=False))
for route in routes:
 hard=strongest_case([e for e in episodes if e['route']==route and e['won']]);easy=[e for e in episodes if e['route']==route and e['easy'] and e['gap']<=-10]
 print(labels[route],rowdetail(hard),'easy:',len(easy))

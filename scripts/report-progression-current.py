from pathlib import Path
import json,statistics,collections,csv,gzip,subprocess
root=Path.cwd();directory=root/'docs/qa/progression-2026-11-09';regions=['Floresta','Caverna','Ruinas','Pantano','Vulcao','Abismo','Fortaleza','Necropole','Citadela','Panteao','Cataclismo','Paradoxo']
def median(xs):return round(statistics.median(xs),1) if xs else None
ref=json.loads((root/'docs/qa/2026-10-28/skills-reference.json').read_text())
def slug(s):return s.replace('_','-')
names={slug(f['id']):f['name'] for f in ref['forms']};names.update({'guerreiro':'Guerreiro','arqueiro':'Arqueiro','mago':'Mago','adepto-da-natureza':'Adepto da Natureza'})
files=sorted(directory.glob('*.json'));archived=json.loads(gzip.decompress((directory/'results.json.gz').read_bytes())) if not files and (directory/'results.json.gz').exists() else {};runs=[json.loads(f.read_text())for f in files] if files else archived.get('runs',[]);evaluated=archived.get('commit') or subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip();assert len(runs)==96,len(runs)
assert all(r['done']for r in runs)
routes=['paladino','berserker','samurai','ninja','sniper','atirador_arcano','espreitador','guarda_florestal','mago_incendiario','mago_frigido','arquimago','corrompido','druida_sombrio','avatar_da_natureza','fada_monarca','protetor_da_floresta']
rank={'comum':1,'incomum':2,'rara':3,'ultra_rara':4,'lendaria':5}
def weak(e):return max((rank.get((i or {}).get('rarity'),0) for i in e['gear'].values()),default=0)<=2
def strength(e):return sum(rank.get((i or {}).get('rarity'),0)for i in e['gear'].values())/6
lines=['# Régua de progressão — todas as classes e subclasses — 09/11/2026','','Código avaliado: `'+evaluated[:7]+'`. 96 campanhas novas: 16 rotas finais × 3 sementes (101, 202, 303) × 2 cenários de equipamentos. As quatro classes base e oito subclasses intermediárias são observadas durante a evolução natural dessas rotas; não são mantidas artificialmente após seus níveis de evolução.','','## Método e limites','','Motor real de combate, inimigos e recompensas atuais; pontos distribuídos equilibradamente. Recuperação integral entre lutas; sem poções, arena, dungeon ou torre. Os drops e moedas pagam as primeiras fabricações quando possível. Após derrota ou fuga, recebe um nível até 100; falhas repetidas ou nível 100 concedem uma melhoria de equipamento. Só desiste após 11 mortes já no nível 100 com os seis espaços lendários. Essa preparação é gratuita e acelerada: mede capacidade de combate, não tempo de farm nem viabilidade econômica.','','Referência: mantém o conjunto inicial Floresta/Caverna e acessório da Floresta. Conjuntos por rota: substitui gratuitamente peças já existentes pelo conjunto preferido liberado, conservando raridade; não preenche espaços vazios. Não é uma busca pelo conjunto ótimo. A política de habilidades é heurística, não um jogador perfeito; sua avaliação de Raízes foi ajustada para os atuais 5% por turno, ou 25% com Coroada. Resultados antigos precedem alterações de turnos, sangramentos e Natureza, portanto não foram reaproveitados como medidas atuais. Três sementes não garantem estabilidade estatística. Como inimigos finais ultrapassam o nível 100, vencer abaixo do nível deles, isoladamente, não prova excesso de poder.','','## Alcance por rota','','Parada é a região em que encerrou a campanha; concluir o Paradoxo é indicado separadamente.']
intro=['## Leitura da régua','',f"Foram {sum(r['reason']=='Paradoxo derrotado'for r in runs)}/96 conclusões. Sniper e Atirador Arcano concluíram 6/6 campanhas cada; as outras 14 especializações somaram 7/84. É uma diferença grande de consistência nesta política e amostra, sem pressupor que todas as classes precisem concluir o último chefe.",'', 'Na Natureza, Avatar da Natureza parou no Panteão em 6/6 campanhas; Druida Sombrio parou ali em 5/6, chegando ao Cataclismo na restante. Fada Monarca chegou ao Paradoxo em todas e concluiu 1/6. Protetor da Floresta ficou no Cataclismo em 5/6 e no Paradoxo em 1/6.','', 'Os maiores degraus recorrentes são Avatar do Zenith e Deus da Ruína; antes deles, Colosso do Vazio, General de Aço e Carrasco de Guerra concentram tentativas. As tabelas abaixo mostram os números e a preparação observada.','', 'Prioridade sugerida para novos testes: investigar a capacidade de sustentar dano e mana do Druida/Avatar contra a recuperação do Zenith; comparar as ferramentas dos dois atiradores com as rotas que param no teto de preparo; testar ajustes pontuais nos degraus recorrentes antes de aumentar todas as classes. Nenhuma dessas sugestões foi aplicada ao jogo.','']
lines[4:4]=intro
summary=[]
for scenario,label in [('reference','Equipamento de referência'),('sets','Conjuntos por rota')]:
 group=[r for r in runs if r['scenario']==scenario];lines+=['','### '+label,'',f"{sum(r['fights']for r in group)} lutas; {sum(r['deaths']for r in group)} mortes; {sum(r['reason']=='Paradoxo derrotado'for r in group)}/48 conclusões; {sum(r['region']=='Paradoxo'for r in group)}/48 chegaram ao Paradoxo.",'','| Rota | Parada nas 3 sementes | Nível final mediano | Mortes medianas | Principal gargalo por derrotas |','| --- | --- | ---: | ---: | --- |']
 for route in routes:
  rs=[r for r in group if r['route']==route];stops=collections.Counter('Concluiu' if r['reason']=='Paradoxo derrotado'else r['region']for r in rs);enc=[e for r in rs for e in r['encounters']];deaths=collections.Counter(e['foe']['name']for e in enc if e['outcome']=='death');top=deaths.most_common(1);stop='; '.join(f'{k} ({v}/3)'for k,v in stops.items());name=names[slug(route)];levels=median([r['level']for r in rs]);d=median([r['deaths']for r in rs]);g=f'{top[0][0]} ({top[0][1]})'if top else 'Nenhum'
  lines.append(f'| {name} | {stop} | {levels} | {d} | {g} |');summary.append(dict(scenario=scenario,route=route,name=name,stops=stop,median_level=levels,median_deaths=d,main_bottleneck=g))
lines+=['','## Inimigos que mais exigiram novas tentativas','','Agregado das 96 campanhas; inclui inimigos comuns. Vencer depois de melhorar equipamento pode exigir muitas tentativas mesmo sem ultrapassar o nível do inimigo.','','| Inimigo / região | Derrotas | Vitórias | Nível mediano nas vitórias | Força média mediana do equipamento vencedor |','| --- | ---: | ---: | ---: | ---: |']
allenc=[e for r in runs for e in r['encounters']]
counts=collections.Counter(e['foe']['name']for e in allenc if e['outcome']=='death')
for name,deaths in counts.most_common(14):
 es=[e for e in allenc if e['foe']['name']==name];wins=[e for e in es if e['outcome']=='win']
 lines.append(f"| {name} / {es[0]['foe']['region']} | {deaths} | {len(wins)} | {median([e['level']for e in wins])} | {median([strength(e)for e in wins])} |")
lines+=['','## Classes base e intermediárias','','Contagens por fase de classe, deduplicando encontros idênticos compartilhados entre rotas. Finais constam nas tabelas anteriores. A taxa de vitória nesta tabela não indica velocidade de farm.','','| Classe/subclasse | Encontros observados | Derrotas | Fugas | Região mais avançada com vitória | Maior diferença de nível em vitória de chefe |','| --- | ---: | ---: | ---: | --- | --- |']
stages=collections.defaultdict(list);seen=set()
for r in runs:
 for e in r['encounters']:
  key=(r['scenario'],r['seed'],json.dumps(e,sort_keys=True))
  if key in seen:continue
  seen.add(key);stages[e['formId']].append(e)
assert len(stages)==28,sorted(stages)
for form,es in sorted(stages.items(),key=lambda kv:(min(e['level']for e in kv[1]),kv[0])):
 if min(e['level']for e in es)>=60:continue
 wins=[e for e in es if e['outcome']=='win'];boss=[e for e in wins if e['foe']['isBoss']];region=max((e['foe']['region']for e in wins),key=regions.index,default='Nenhuma');over=max((e['level']-e['enemyLevel']for e in boss),default=None)
 lines.append(f"| {names[form]} | {len(es)} | {sum(e['outcome']=='death'for e in es)} | {sum(e['outcome']=='escape'for e in es)} | {region} | {(f'{over:+}')if over is not None else 'Sem vitória em chefe'} |")
lines+=['','## Onde exige muito preparo','','Listamos vitórias contra chefes com pelo menos 15 níveis acima do inimigo, e o número de derrotas contra esse chefe na mesma rota e cenário. O nível mostrado é o menor nível vencedor observado, não um mínimo matemático.']
bosswins=[e for r in runs for e in r['encounters'] if e['outcome']=='win' and e['foe']['isBoss']]
largest=max(bosswins,key=lambda e:e['level']-e['enemyLevel'])
lines.append(f"\nMaior vantagem de nível observada em vitória de chefe: **+{largest['level']-largest['enemyLevel']}**, contra {largest['foe']['name']} ({largest['level']} / {largest['enemyLevel']}).")
if not any(e['level']-e['enemyLevel']>=15 for e in bosswins):lines.append('\nNenhuma vitória de chefe exigiu 15 ou mais níveis de vantagem nesta amostra. Os gargalos aparecem sobretudo em derrotas repetidas, dependência de melhorias e no teto de nível 100.')
if any(e['level']-e['enemyLevel']>=15 for e in bosswins):lines+=['','| Cenário / rota | Chefe | Menor nível vencedor / nível inimigo | Derrotas nesse chefe |','| --- | --- | --- | ---: |']
for scenario in ['reference','sets']:
 for route in routes:
  es=[e for r in runs if r['scenario']==scenario and r['route']==route for e in r['encounters']];bossnames=set(e['foe']['name']for e in es if e['foe']['isBoss']);candidates=[]
  for name in bossnames:
   attempts=[e for e in es if e['foe']['name']==name];wins=[e for e in attempts if e['outcome']=='win'];dead=sum(e['outcome']=='death'for e in attempts)
   if wins:
    best=min(wins,key=lambda e:e['level']);delta=best['level']-best['enemyLevel']
    if delta>=15:candidates.append((delta,name,best,dead))
  for delta,name,best,dead in sorted(candidates,reverse=True)[:3]:lines.append(f"| {scenario} / {names[slug(route)]} | {name} | {best['level']} / {best['enemyLevel']} (+{delta}) | {dead} |")
lines+=['','## Vitórias fáceis com desvantagem de nível ou equipamento fraco','','Sinais selecionados: chefe vencido em até 8 ações do herói, vida mínima de pelo menos 50%, e pelo menos 10 níveis abaixo do inimigo OU todas as peças no máximo incomuns, sem mais de 5 níveis acima do chefe (espaço vazio = 0, comum = 1, incomum = 2, rara = 3, ultra rara = 4, lendária = 5). Não basta estar abaixo do nível: também exigimos margem de vida e luta curta. São exemplos observados, não garantia de repetição.','','| Cenário / rota | Classe na luta | Chefe | Herói / inimigo | Ações | Menor vida | Força média do equipamento |','| --- | --- | --- | --- | ---: | ---: | ---: |']
for scenario in ['reference','sets']:
 for route in routes:
  candidates=[e for r in runs if r['scenario']==scenario and r['route']==route for e in r['encounters']if e['outcome']=='win'and e['foe']['isBoss']and e['rounds']<=8 and e['hpMinRatio']>=.5 and(e['level']-e['enemyLevel']<=-10 or(weak(e)and e['level']-e['enemyLevel']<=5))]
  for e in sorted(candidates,key=lambda e:(e['level']-e['enemyLevel'],strength(e)))[:2]:lines.append(f"| {scenario} / {names[slug(route)]} | {names[e['formId']]} | {e['foe']['name']} | {e['level']} / {e['enemyLevel']} | {e['rounds']} | {e['hpMinRatio']:.0%} | {strength(e):.2f} |")
lines+=['','## Evidências','','[Resumo CSV](qa/progression-2026-11-09/resumo.csv) · [Traços completos comprimidos](qa/progression-2026-11-09/results.json.gz). Nenhum coeficiente do jogo foi alterado pela análise.']
(root/'docs/analise_progressao_2026-11-09.md').write_text('\n'.join(lines)+'\n')
with (directory/'resumo.csv').open('w',newline='')as f:
 w=csv.DictWriter(f,fieldnames=list(summary[0]));w.writeheader();w.writerows(summary)
(directory/'results.json.gz').write_bytes(gzip.compress(json.dumps({'runs':runs,'commit':evaluated},separators=(',',':')).encode()))
print('Reported',len(runs),'campaigns;',len(stages),'class forms;',sum(r['fights']for r in runs),'fights')

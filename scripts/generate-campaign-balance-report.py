import json,gzip,csv,statistics,collections,sys
sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path
root=Path(__file__).resolve().parents[1]
folder=root/'docs/qa/campaign-balance-2026-11-05'
source=folder/'results.json.gz'
data=json.loads(gzip.decompress(source.read_bytes())) if source.exists() else json.loads((folder/'results.json').read_text())
runs=data['runs']
assert len(runs)==96 and len({(r['version'],r['route'],r['seed']) for r in runs})==96
regions=['Floresta','Caverna','Ruinas','Pantano','Vulcao','Abismo','Fortaleza','Necropole','Citadela','Panteao','Cataclismo','Paradoxo']
ref=json.loads((root/'docs/qa/2026-10-28/skills-reference.json').read_text())
forms={f['id']:f for f in ref['forms']}
routes=list(dict.fromkeys(r['route'] for r in runs))
# Stable class/route presentation regardless of worker completion order.
routes=sorted(routes,key=lambda x:list(forms).index(x))
median=lambda values:statistics.median(list(values))
win=lambda r:r['reason']=='Paradoxo derrotado'
def group(route,version):return sorted([r for r in runs if r['route']==route and r['version']==version],key=lambda r:r['seed'])
def ending(r):return 'Campanha concluída' if win(r) else r['encounters'][-1]['foe']['name']
def ends(rs):return '; '.join(f'{name} ({count}/3)' for name,count in collections.Counter(map(ending,rs)).items())
def fmt(n):return str(round(n,1)).replace('.',',')
lines=['# Balanceamento de todas as classes — 05/11/2026','',
'## Escopo e régua','',
'96 campanhas aceleradas: 16 especializações × três sementes (101, 202, 303) × antes/depois. Cada campanha começa no nível 1 e percorre os estágios de classe-base e subclasse; continua até vencer o Soberano ou acumular 11 mortes já no nível 100 com seis peças lendárias. Não envolve torre, dungeon ou arena.','',
'A régua é o alcance mediano e o esforço observado na preparação padronizada. Concluir o jogo é registrado, mas não é requisito de equilíbrio. Uma rota pode estar próxima da maioria mesmo sem concluir nenhuma campanha.','',
'Antes usa game.js do commit d8ea212; depois usa somente os ajustes aprovados nesta rodada. Ambas usam o mesmo restante do código e a mesma política de decisão. Essa comparação substitui comparar diretamente com os relatórios antigos, pois XP, regeneração de mana e políticas já mudaram desde aqueles testes.','',
'## Alterações executadas','',
'- Recuperar Fôlego: desde Cavaleiro, remove uma aplicação de queimadura, veneno ou sangramento, escolhendo o maior dano por turno. Paladino e Berserker herdam. Não remove todas as pilhas nem marcas/execuções; efeitos já podem causar dano no início do turno antes da ação.','- Ira: sacrifício de 70% → 50% da vida máxima; demais efeitos preservados.','- Sniper: crítico base do Headshot de 70% → 60%; Ponto Fraco de 25% → 20% da vida atual do inimigo.','- Incendiário: Bola de Fogo de 5% → 3% da vida atual do inimigo na parcela adicional.','- Corrompido: Incorporar Demônio de +200% → +160% de dano, mantendo custo, duração e vulnerabilidade.','- Atirador Arcano, demais classes, inimigos e equipamentos não foram rebalanceados nesta rodada.','',
'## Método e limites','',
'Combates, habilidades, efeitos, IA inimiga, XP e drops usam o motor real. Atributos distribuídos equilibradamente. Recuperação completa entre lutas; sem poções. Cada derrota/fuga concede um nível até 100; falhas repetidas também melhoram uma peça, e derrotas no nível 100 melhoram uma peça até seis lendários. Fabricação inicial usa recursos obtidos. Equipamentos iniciais da Floresta/Caverna são mantidos nos aprimoramentos, com acessório da Floresta. Não há otimização de conjuntos, busca de acessórios específicos ou medição de tempo de farm.','',
'A política reconhece Pacto Fúnebre, remoção/roubo de buffs e algumas defesas contra golpes carregados. A Natureza usa uma política nova para marcas, raízes, venenos, colheita, cura e escudo. É uma estratégia heurística, não uma busca da melhor rotação. Uso baixo de uma habilidade pode indicar problema de decisão da política, e não provar falta de utilidade no jogo.','',
'As sementes são iguais por rota, mas mudar uma ação altera o consumo de sorteios e os encontros posteriores. Diferenças são descritivas, não estimativas causais isoladas. Três sementes não estabelecem taxas populacionais. Os estágios anteriores à escolha de subclasse se repetem entre rotas; não são amostras independentes de classes-base.','']
for version,label in [('before','Antes'),('after','Depois')]:
 rs=[r for r in runs if r['version']==version]
 reach=median(regions.index(r['region'])+1 for r in rs)
 lines += [f'**{label}:** {sum(r["fights"] for r in rs)} combates, {sum(r["deaths"] for r in rs)} mortes, {sum(win(r) for r in rs)}/48 conclusões. Mediana da região alcançada: {fmt(reach)} na ordem das 12 regiões. {sum(r["region"]=="Paradoxo" for r in rs)}/48 chegaram ao Paradoxo.']
 lines+=['']
lines+=['## Comparação por especialização','', '| Especialização | Parada antes | Parada depois | Mortes medianas antes → depois | Nível final mediano antes → depois |','|---|---|---|---:|---:|']
summary=[]
for route in routes:
 a,b=group(route,'before'),group(route,'after')
 lines.append(f'| {forms[route]["name"]} | {ends(a)} | {ends(b)} | {fmt(median(r["deaths"] for r in a))} → {fmt(median(r["deaths"] for r in b))} | {fmt(median(r["level"] for r in a))} → {fmt(median(r["level"] for r in b))} |')
 for r in a+b:summary.append({k:r[k] for k in ['version','route','seed','region','level','fights','turns','deaths','retreats','endgameDeaths','reason']})
lines+=['','## Leitura dos resultados','',
'A mediana continua no Paradoxo. Paladino, Berserker, Samurai, Druida Sombrio e Avatar da Natureza ainda ficaram abaixo desse alcance nas três sementes, mesmo que Berserker tenha avançado ao Cataclismo em uma. Frígido, Ninja e Protetor chegaram ao Paradoxo em duas; as demais rotas chegaram em todas. Não concluir o Soberano, isoladamente, não é tratado como fraqueza.','',
'Os ajustes não aproximaram suficientemente os extremos nesta amostra. Sniper, Incendiário e Corrompido continuam concluindo nas três sementes. Corrompido passou de nível final mediano 84 para 87; Incendiário de 88 para 89. O Sniper passou de 98 para 95 apesar da redução, o que demonstra que três trajetórias com RNG divergente não permitem inferir o efeito causal pela mediana isolada.','',
'Paladino reduziu a mediana de mortes de 85 para 83, mas continuou bloqueado no Deus da Ruína. Uma limpeza por ação não garante escapar de uma condição de execução já atingida antes da próxima ação. Berserker passou do Zenith em uma semente; sua mediana de mortes aumentou de 82 para 86, portanto não há melhora uniforme. As rotas não alteradas são controles: seus resultados individuais devem permanecer idênticos entre versões.','',
'A Natureza foi incluída pela primeira vez nessa preparação. Druida Sombrio e Avatar concentram falhas no Zenith. Fada Monarca chega ao Soberano em todas; Protetor chega nele em duas, parando no Deus da Ruína na outra. A comparação não sustenta aumentar indiscriminadamente toda a classe Natureza.','',
'Nenhum ajuste adicional foi aplicado a partir desses resultados. Antes de uma segunda rodada, testar conjuntos adequados e políticas alternativas é particularmente importante para Samurai e Druidas. A política pode subutilizar habilidades condicionais e acessórios da Floresta podem ser inadequados contra Pacto Fúnebre.','',
'## Detalhes por rota','']
for route in routes:
 a,b=group(route,'before'),group(route,'after');f=forms[route]
 lines += [f'### {f["name"]}','',f'Rota: {f["className"]} → {f["tier30"]} → {route}.','', '| Semente | Parada antes → depois | Nível antes → depois | Mortes antes → depois | Turnos antes → depois |','|---|---|---:|---:|---:|']
 for x,y in zip(a,b):lines.append(f'| {x["seed"]} | {ending(x)} → {ending(y)} | {x["level"]} → {y["level"]} | {x["deaths"]} → {y["deaths"]} | {x["turns"]} → {y["turns"]} |')
 encounters=[e for r in b for e in r['encounters']]
 failures=collections.Counter(e['foe']['name'] for e in encounters if e['outcome']!='win')
 lines+=['','Maiores concentrações de derrotas/fugas depois: '+ '; '.join(f'{name}: {count}' for name,count in failures.most_common(4))+'.','', '| Nível de entrada depois | Lutas | Derrotas/fugas | Rodadas medianas |','|---|---:|---:|---:|']
 for low,high in [(1,29),(30,59),(60,79),(80,100)]:
  es=[e for e in encounters if low<=e['level']<=high]
  lines.append(f'| {low}–{high} | {len(es)} | {sum(e["outcome"]!="win" for e in es)} | {fmt(median(e["rounds"] for e in es)) if es else "—"} |')
 counts=collections.Counter();[counts.update(r['skills']) for r in b]
 lines+=['','Uso de habilidades depois, somando as três campanhas completas. O total inclui os estágios anteriores às especializações.','', '| Habilidade da rota final | Ações |','|---|---:|']
 for skill in f['active']:lines.append(f'| {skill["name"]} | {counts[skill["type"]]} |')
 lines+=['',f'Ataques básicos: {counts["basic"]}. Passar/perder turno registrado pela política: {counts["pass"]}.','']
lines+=['## Alternativa para o Atirador Arcano — proposta, não aplicada','']
arc=group('atirador_arcano','after');c=collections.Counter();[c.update(r['skills']) for r in arc]
lines += [f'Headshot foi escolhido {c["archer_headshot"]} vezes; Emergência Arcana {c["archer_arcane_shot"]}; Sobreaquecer {c["archer_overcharge"]}; Tiro Perfurante {c["archer_piercing_shot"]}. Isso aponta para testar a frequência do Headshot, em vez de reduzir uma parcela pequena do seu coeficiente.','',
'Proposta: após usar Headshot na especialização Atirador Arcano, exigir uma ação ofensiva diferente antes de reutilizá-lo. Ataque básico ou outra habilidade ofensiva liberariam o disparo; poções, buffs e passar turno não. Manter fórmulas e não aplicar essa regra ao Sniper. A proposta força alternância e afeta o dano sustentado; precisa de simulação própria antes de ser adotada. Não foi aplicada nem testada nesta rodada.','',
'## Reprodução e dados','',
'- Executar `node scripts/run-campaign-balance.cjs` e `python scripts/generate-campaign-balance-report.py`.','- Motor e política: `scripts/campaign-balance-engine.js`.','- Resumo por campanha: `docs/qa/campaign-balance-2026-11-05/summary.csv`.','- Resultados resumidos: `docs/qa/campaign-balance-2026-11-05/results.json`.','- Evidência completa por luta, equipamentos, níveis concedidos, derrotas e uso de habilidades: `results.json.gz` na mesma pasta (JSON comprimido com gzip).','- Fórmulas atualizadas: `docs/referencia_habilidades_atual.md`.','']
(root/'docs/analise_balanceamento_todas_classes_2026-11-05.md').write_text('\n'.join(lines),encoding='utf-8')
with (folder/'summary.csv').open('w',newline='',encoding='utf-8') as file:
 writer=csv.DictWriter(file,fieldnames=list(summary[0]));writer.writeheader();writer.writerows(summary)
print('\n'.join(lines[lines.index('## Comparação por especialização'):lines.index('## Detalhes por rota')]))

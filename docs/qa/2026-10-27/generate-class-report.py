import json, pathlib, collections

HERE=pathlib.Path(__file__).resolve().parent
DOCS=HERE.parents[1]
d=json.loads((HERE/'class-lab-results.json').read_text(encoding='utf-8'))
notes=json.loads((HERE/'skill-notes.json').read_text(encoding='utf-8'))
group=json.loads((HERE/'dungeon-class-results.json').read_text(encoding='utf-8'))
missing={s['type'] for c in d['catalog'] for kind in ('active','passive') for s in c[kind]}-notes.keys()
assert not missing,missing
assert len(d['rows'])==6400
assert not [x for x in d['probes'] if x['error']]
assert all(x['pass'] for x in d['passiveProbes'])

BUILD={'equilibrada':'33/33/33','forca_pura':'100/0/0','vida_pura':'0/100/0','mana_pura':'0/0/100','ofensiva':'60/20/20','resistente':'20/60/20','arcana':'20/20/60','hibrida':'40/20/40'}
STRAT={'basico':'básico','dano_direto':'dano direto','combo':'roteiro de combo','sustentacao':'sustentação'}
def strat(s):return STRAT.get(s,s.replace('combo:','combo: ').replace('_',' '))
def rank(x):return (-x['wins']/x['n'],-x['damageFraction'],x['winTurns'] if x['winTurns'] is not None else 999,-x['remainingHpFraction'])
def best_validation(fid):return sorted([x for x in d['validation'] if x['id']==fid and x['encounter']=='boss'],key=rank)[0]
def related(row,encounter):return next(x for x in d['validation'] if x['id']==row['id'] and x['role']==row['role'] and x['encounter']==encounter)
def wins(x):return f"{x['wins']}/{x['n']}"
def fmt(n):return f'{n:,}'.replace(',','.')
def table(headers,rows):return '\n'.join(['| '+' | '.join(headers)+' |','| '+' | '.join(['---']*len(headers))+' |']+['| '+' | '.join(map(str,r))+' |' for r in rows])

profiles={
'paladino':('Consistente em vida','Julgamento transforma vida em dano, enquanto redução fixa, cura e Aura Divina sustentam a rota. A distribuição resistente foi melhor que simplesmente maximizar força. No Paradoxo ainda perdeu na configuração escolhida.','Brado → Julgamento → Esbarrão; Escudo de Fé e Recuperar Fôlego conforme a ameaça.','Preservar o tanque ofensivo, revisar custo/duração da invulnerabilidade e limitar acúmulo de escudo; não compensar tudo com mais dano por HP.'),
'berserker':('Risco alto, retorno inconsistente','Mostrou dano enorme em alvo sem resposta, mas não venceu o Panteão na matriz verificada. Ira deixa pouca vida e Vallhala triplica o dano recebido. O básico/dano direto resistente sobreviveu melhor que as preparações mais arriscadas.','Vallhala → Contundir ou Ira → Contundir são explosões distintas; não juntar sacrifícios sem proteção.','Reduzir custo de HP e vulnerabilidade, com orçamento menor de bônus; dar uma janela utilizável de risco. Corrigir a imunidade a controle de Você Irá Me Parar?.'),
'samurai':('Precisa converter preparação em sobrevivência','Corte Profundo contra armadura é útil, mas a build ofensiva ficou dependente de sobreviver poucos turnos. Cortes Ultrassônicos restringe a básicos; uma rotação que tente habilidades durante a trava não executa a sequência imaginada.','Recuperar Fôlego → Corte Profundo → Golpes Velozes; ou Cortes Ultrassônicos → básico → básico → Corte Profundo.','Rever mitigação por golpe, custo da janela segura e retorno da cura do contra-ataque; clarificar que Mente Limpa duplica parte do primeiro básico.'),
'ninja':('Forte interação, muita variância','Dano de vida atual e finalização combinam bem, mas dependem da sobrevivência. A busca de curto prazo escolheu um combo ofensivo que só venceu 2/30 no lote novo; a configuração resistente de dano direto venceu 18/30. Esse contraste impede chamar a maior pontuação da triagem de melhor build universal.','Bomba de Fumaça → Mata-Gigantes → Corte Profundo; aproveitar Contra-Ataque e Eliminar.','Informar consumo do bônus pela reação de esquiva e colocar teto por ação no dano percentual contra chefes.'),
'mago_incendiario':('Mana tem vários retornos simultâneos','Mana pura também vira HP e poder por Mana e Vida, então essa build não representa um personagem sem defesa. Queimadura e Explodir dão valor em chefes. A vantagem cai no Paradoxo.','Bafo de Fogo → Bola de Fogo/básico → Explodir quando finalizar ou houver margem de vida.','Separar os benefícios de MP e limitar a parcela percentual; dar função mais eficiente à Fênix Sagrada frente às outras opções.'),
'mago_frigido':('Muito forte em chefe','A combinação de vida, HP convertido de mana, mitigação e Avalanche foi eficiente. A configuração resistente venceu 29/30 contra o Paradoxo. Não é só uma classe de controle: o dano de 50% do HP máximo é determinante.','Bola de Neve → Congelar → Avalanche; Avalanche repetida também foi testada.','Rebalancear o percentual de HP e o preparo de resfriamento. Na dungeon, recalcular a parcela percentual por alvo ou documentar uma regra de área própria.'),
'arquimago':('Distorção estrutural de dano','Com distribuição equilibrada, o básico encerrou os três chefes testados em um turno nas 30 sementes. A mana adiciona dano fixo a cada míssil e a recuperação por turno cobre o custo baixo do básico.','A combinação saudável seria Concentração → mísseis → acumular cargas → Descarregar/Sobrecarregar; atualmente muitas vezes o primeiro básico já encerra a luta.','Distribuir o bônus fixo por ação e aplicar Carregar uma única vez. Recalibrar as skills ativas depois, para não apenas transferir o excesso de um botão para outro.'),
'corrompido':('A abertura elimina o risco previsto','Transbordando multi-hit e Canhão de Vidro encerraram os chefes em uma ação no lote verificado. Isso impede avaliar a vulnerabilidade como contrapeso real.','Corrupção → Incorporar Demônio → mísseis é uma rotação de defesa quebrada; abrir com mísseis foi outra sequência testada.','Corrigir a base do dano e o custo mínimo de Corrupção. Depois ajustar a janela demoníaca e o risco da abertura.'),
'atirador_arcano':('Explosão por mana, defesa frágil','Mana pura fortalece Headshot, Cristalizar Mana e o ataque baseado em mana faltante. Venceu o chefe do Panteão, mas perdeu boa parte das lutas contra o inimigo comum e o alvo de teste com resposta constante.','Headshot para gastar reserva → Sobreaquecer → recuperação → Emergência Arcana; comparar com guardar mana para controle.','Distribuir o benefício de MP entre opções, evitar duas escalas de mana excessivas na mesma habilidade e preservar alguma escolha defensiva.'),
'sniper':('Bom papel de abertura e execução','A distribuição equilibrada funcionou melhor do que presumir força pura. Ponto Fraco, Headshot e Executar ocupam momentos diferentes da luta. O crítico total alto participa muito do resultado.','Mirar → Ponto Fraco → Headshot → Executar abaixo de 40%; Tiro Perfurante em alvo blindado.','Centralizar as parcelas de crítico e auditar o acréscimo duplicado de 15% ao entrar no Sniper. Reservar espaço de orçamento para itens.'),
'espreitador':('Identidade boa, conversão de dano insuficiente','Camuflagem → Surpresa funciona na campanha, mas os roteiros testados não venceram o chefe do Panteão. Reduzir armadura antes da rajada tem lógica, porém exige sobreviver à preparação.','Mirar no Pé → Camuflagem → Surpresa → Armadilha/Rajada.','Reduzir o custo de oportunidade da preparação ou melhorar o retorno defensivo. Na arena, preservar o tipo da última ação para não perder a sinergia.'),
'guarda_florestal':('Sustentação sem pressão suficiente','A build resistente com sustentação venceu o inimigo comum, mas não o chefe. Sobrevive por muitos turnos; isso não é o mesmo que conseguir vencer. Parte de sua utilidade em grupo não aparece nesta taxa solo.','Tranquilizante → Tiro Cortante → Armadilha → Rajada; Camuflagem quando a proteção compensar o turno.','Melhorar pressão de DOT/rajada e tornar a mitigação útil contra chefes, sem criar um ciclo infinito de esquiva e cura.'),
'druida_sombrio':('Explosão especializada e frágil','Força pura com Colapso/Colheita venceu o Panteão, mas tinha apenas 200 HP e perdeu todas contra o inimigo comum nessa validação. O chefe às vezes prepara buffs, concedendo a janela; não recomendar isso como build geral.','Colapso do Brejo → Colheita é abertura; Semente → Raízes → Flor → Apodrecer → Colheita é desgaste/preparo.','Preservar as duas rotações, limitar dano percentual e oferecer defesa utilizável sem depender de a IA gastar o primeiro turno em buff.'),
'avatar_da_natureza':('Conceito de transformação com economia difícil','A build precisa pagar toda a mana para se transformar e ainda reservar ações/recuperação para Raízes e Esmagar Invasor. As rotações adicionais não resolveram sua dificuldade contra os chefes testados sem itens.','Forma Verdadeira → básicos para recuperar MP → Raízes → Esmagar Invasor; ou Semente → Raízes → Flor → Colheita para escudo.','Testar custo parcial da forma ou desconto de Esmagar durante transformação, com aumento defensivo mensurável. Não confundir o bônus de casca com invulnerabilidade.'),
'fada_monarca':('Sustentação funciona, lutas podem ficar longas','Sustentação ofensiva venceu 24/30 no Panteão com média alta de turnos, mas empatou por limite de 120 turnos no Cataclismo. Curas vazias não geram Cadência. Seu suporte em grupo precisa ser avaliado separadamente.','Curas efetivas → Cadência → Coroar → Raízes/Decreto; escolher ofensiva quando a vida estiver segura.','Transformar preparação em pressão suficiente para fechar a luta e impedir loops intermináveis de cura/esquiva. Corrigir o dono da cura de grupo quando quem conjura é convidado.'),
'protetor_da_floresta':('Precisa de roteiro de escudo','O dano direto isolado não representa a proposta da classe. Canção/Casulo → Jogar Espinhos melhorou bastante a atuação contra inimigo comum e alvo de teste, embora não tenha resolvido o chefe do Panteão.','Raízes → Canção Ancestral → Casulo de Vinhas → Jogar Espinhos; comparar com dois Casulos antes de gastar escudo.','Dar tempo e recursos para construir escudo, mostrar o valor que será consumido e revisar o custo de HP/MP. Corrigir a origem do suporte cooperativo antes de balancear por números.'),
}

lines=['# Classes, distribuições e combos — avaliação ampliada','',
'Base: código atual do projeto, commit `c70b9f3`. O código do jogo foi preservado. Esta avaliação descreve o comportamento atual; alterações e números de itens são propostas para um ciclo posterior.','',
'## Cobertura e leitura dos resultados','',
f"Foram executadas **{fmt(sum(x['n'] for x in d['rows'])+sum(x['n'] for x in d['alternativeRows'])+sum(x['n'] for x in d['validation']))} lutas simuladas** e **{fmt(sum(x['n'] for x in d['sequenceProbes']))} janelas de rotação**, além de 516 sondagens de habilidades ativas, 68 verificações de gatilhos passivos e 12 cenários de cura/área na dungeon. A matriz cobre quatro classes-base, oito especializações intermediárias e 16 finais: 28 formas, em 100 combinações de forma e nível.",'',
'Ações passam pelas funções reais `attack`, `useSkill` e `passTurn`, com a IA inimiga original. Animação, DOM, espera, XP e recompensa foram desativados para medir combate. Cada ponto foi distribuído no nível em que seria ganho, com os valores daquele nível. Sem respec para inflar atributos, sem equipamento, sem poções e com HP/MP cheios no início de cada luta.','',
'A triagem principal usa cinco sementes por célula. As duas rotações adicionais de cada especialização final usam dez. A validação usa 30 sementes diferentes, incluindo Panteão, Cataclismo, Paradoxo, inimigo comum do Panteão e um alvo de teste com resposta constante. Configurações repetidas como referência não viram amostras independentes; algumas builds são idênticas no nível 1 por ainda não terem pontos.','',
'As políticas são heurísticas, não um jogador perfeito nem prova de inviabilidade. A escolha de dano usa sondagem independente da aleatoriedade futura da luta. Companheiros não participam da matriz solo. Não se deve usar estas taxas como ranking PvP: o motor defensivo da arena ainda tem os problemas identificados no relatório anterior.','',
'A janela de rotação usa até seis turnos, ou termina ao matar o alvo. O alvo tem 100.000 HP, 80 de armadura e não ataca; portanto mede sequência/dano e disponibilidade de recurso, sem validar sobrevivência. Resultados que chegam a 100.000 são limitados pelo HP do alvo. Não comparar formas de níveis diferentes como se estivessem no mesmo patamar.','',
'## O que os pontos realmente fazem','',
'Força melhora ataque **e** poder de habilidade pelo ganho investido; sabedoria melhora MP máximo, que também alimenta regeneração e conversões de algumas rotas; vitalidade melhora HP. Portanto, “mana pura” no mago pode trazer vida e dano, enquanto no guerreiro pode deixar pouco dano direto. A regeneração normal de 10% do MP máximo por turno torna muitas habilidades sustentáveis sem gasto líquido nas builds com mana.','',
table(['Distribuição','Força / Vitalidade / Sabedoria','Objetivo'],[(k,v,{'equilibrada':'referência geral','forca_pura':'extremo ofensivo','vida_pura':'extremo de HP','mana_pura':'extremo de MP/conversões','ofensiva':'dano com alguma reserva','resistente':'sobrevivência com recursos','arcana':'reserva/escala de MP','hibrida':'força e mana'}[k]) for k,v in BUILD.items()]),'',
'Os percentuais são alvos de proporção; os 99 pontos do nível 100 são inteiros. Na equilibrada são 33/33/33 pontos. A política resistente termina com aproximadamente 20/59/20 pontos, por arredondamento cronológico.','',
'Quatro estilos gerais foram comparados: básico; dano direto imediato; roteiro de combo; sustentação com reação a HP, escudo e debuffs. Foram adicionadas duas rotações específicas por especialização final. Se faltar recurso ou a habilidade estiver travada, o roteiro registra/substitui a tentativa por uma ação legal; não é contado como se o combo tivesse sido executado.','',
'## Comparação das oito distribuições','',
'Triagem contra o chefe do Panteão, personagem nível 100. Cada célula mostra vitórias/tentativas da melhor política observada para aquela distribuição: cinco sementes nas políticas gerais ou dez nas rotações específicas. É uma comparação exploratória com amostras pequenas; a tabela seguinte de especializações traz a validação com sementes novas. F/V/S são força/vitalidade/sabedoria.','',
table(['Forma','33/33/33','100/0/0','0/100/0','0/0/100','60/20/20','20/60/20','20/20/60','40/20/40'],[[f['name']]+[wins(sorted([r for r in [*d['rows'],*d['alternativeRows']] if r['id']==f['id'] and r['level']==100 and r['encounter']=='boss' and r['build']==build],key=rank)[0]) for build in BUILD] for f in d['forms'] if f['tier']==2]),'',
'## Principais conclusões','',
'1. **Arquimago e Corrompido estão estruturalmente acima da curva.** O básico matou os três chefes em uma ação nas sementes de validação. MP gera dano fixo por míssil, e o custo do básico é coberto pela recuperação.','2. **Carregar aplica mais dano do que o bônus nominal indica.** Em teste controlado, três cargas nominalmente +15% levaram o básico de 25.636 a 33.891 de dano: cerca de +32,2%. O percentual entra antes e dentro da aplicação de dano.','3. **Boa build depende da rota.** Paladino resistente, Sniper equilibrado e Atirador Arcano de mana obtiveram resultados diferentes de simplesmente escolher força para todos.','4. **Dano alto em alvo parado não garante build boa.** Berserker perde sobrevivência; Sombrio força pura vence uma abertura específica e morre para o inimigo comum; Protetor exige preparação real de escudo.','5. **Suporte precisa funcionar corretamente antes de receber números finais.** Canção Ancestral lançada por convidado da dungeon pode deixar o host sem cura e aplicar novamente o benefício ao conjurador.','6. **Os itens devem premiar decisões por ação e mistura de atributos.** Multiplicar MP/dano fixo/percentuais por raridade e por cada projétil agravaria as distorções.','',
'## Classes-base e especializações intermediárias','',
'Tabela de triagem: melhor resultado observado contra o chefe da faixa na última etapa da forma, sem itens. Cada resultado é de cinco sementes; não comparar a coluna de vitórias entre níveis diferentes como ranking geral.','',]
stage=[]
for f in d['forms']:
    if f['tier']==2:continue
    lev=max(f['levels']);r=sorted([x for x in d['rows'] if x['id']==f['id'] and x['level']==lev and x['encounter']=='boss'],key=rank)[0]
    stage.append([f['name'],lev,BUILD[r['build']],strat(r['strategy']),wins(r),f"{r['damageFraction']*100:.0f}%"])
lines += [table(['Forma','Nível','F/V/S','Estilo','Vitórias','HP do chefe removido, média'],stage),'',
'Nas formas-base o kit ainda é curto; defesa, cura e escolha de alvo pesam muito. Cavaleiro desenvolve vida/regeneração; Espadachim depende de acertar sua janela; Elementalista acrescenta DOT/controle; Arcanista já começa a distorção do dano por mana; Atirador ganha burst, Caçador ganha desgaste/economia; Druida ganha a sequência de DOT, Espírito passa a construir suporte/Cadência.','',
'## Especializações finais — validação com sementes novas','',
'Para cada forma, a tabela mostra uma das configurações testadas que teve melhor resultado no Panteão, entre as finalistas e a referência. A mesma configuração é então comparada nos outros dois chefes. A seleção é exploratória; não significa que seja a melhor contra todo adversário. Suportes estão sendo medidos solo.','',]
finals=[]
for f in d['forms']:
    if f['tier']!=2:continue
    r=best_validation(f['id'])
    finals.append([f['name'],BUILD[r['build']],strat(r['strategy']),wins(r),wins(related(r,'boss:Cataclismo')),wins(related(r,'boss:Paradoxo'))])
lines += [table(['Forma','F/V/S','Estilo','Panteão','Cataclismo','Paradoxo'],finals),'',
'Chefes: Avatar do Zenith (nível 100), Deus da Ruína (110) e Soberano do Paradoxo (120). Personagem sempre nível 100. Zero vitórias é resultado deste conjunto de testes, não prova de que a classe não possa vencer com outra estratégia, itens ou apoio de grupo.','',
'## Avaliação por especialização','',]
for f in d['forms']:
    if f['tier']!=2:continue
    title,assessment,combo,change=profiles[f['id']]
    lines += [f"### {f['name']}: {title.lower()}",'',assessment,'',f'**Sequência a entender:** {combo}','',f'**Ajuste recomendado:** {change}','']

lines += ['## Rotações adicionais executadas','',
'Cada uma das sequências abaixo foi testada com as oito distribuições, três chefes e dez sementes. São roteiros comparados, não recomendações para repetir sem olhar o estado da luta. Uma raiz, esquiva ou controle pode falhar; custos podem impedir etapas.','']
for f in d['forms']:
    if f['tier']!=2:continue
    c=next(c for c in d['catalog'] if c['form']['id']==f['id'])
    names={s['type']:s['name'] for s in c['active']}
    lines += [f"**{f['name']}**",'']
    for name,chain in d['alternatives'][f['id']].items():
        lines.append('- '+name.replace('_',' ')+': '+' → '.join('básico' if t=='basic' else names.get(t,t) for t in chain)+'.')
    lines.append('')

lines += ['## Comparação da ordem dos combos','',
'Abaixo, a mesma distribuição equilibrada contra o mesmo alvo de teste. As linhas com 100.000 atingiram o limite de vida do alvo. Inverter ordem também pode tornar uma habilidade indisponível; conferir as ações efetivas no JSON. A janela sem resposta inimiga favorece sacrifícios e não prevê vitória contra chefe.','']
seq=[]
for f in d['forms']:
    if f['tier']!=2:continue
    rr={x['order']:x for x in d['sequenceProbes'] if x['id']==f['id'] and x['build']=='equilibrada'}
    seq.append([f['name'],f"{rr['roteiro']['damage']:.0f}",f"{rr['invertida']['damage']:.0f}",f"{rr['basico']['damage']:.0f}"])
lines += [table(['Forma','Roteiro','Ordem invertida','Só básico'],seq),'',
'Exemplos práticos: Frígido se beneficia de preparar resfriamento; o Sombrio pode abrir com Colapso e colher ou preparar uma sequência longa de DOT; o Protetor perde boa parte do dano se gasta Jogar Espinhos antes de construir escudo. No Espreitador, a sequência de Camuflagem precisa ser preservada pela implementação. No Avatar, gastar toda a mana na forma exige planejar a recuperação dentro da duração restante.','',
'## Falhas/interações verificadas nas habilidades','',
'- **Transbordando + mísseis:** um orçamento fixo inteiro de dano em cada projétil, com custo baixo do básico. Corrigir por ação.','- **Carregar:** bônus percentual passa por duas etapas de multiplicação no básico. O aumento controlado foi +32,2% para três cargas de +5%.','- **Você Irá Me Parar?:** no teste, conjurar a habilidade e depois receber `skipNextTurn` ainda fez o jogador perder a ação. O código aplica ataque, mas não guarda/consulta imunidade de controle.','- **Canção Ancestral na dungeon:** quando o host conjura, os três recebem benefício. Quando um convidado conjura, o host ficou com o mesmo HP e o conjurador recebeu o benefício novamente. No Protetor, o convidado chegou a 2417 de escudo contra 1154 do outro convidado e zero do host na fixture. Corrigir `sourceId` para o ator real, não o peer do host.','- **Avalanche em área:** alvos com 20.000, 50.000 e 90.000 HP máximos receberam o mesmo dano, 10.928, porque o coeficiente foi calculado a partir do primeiro alvo. Definir regra de área e recalcular por alvo quando a descrição depender do HP dele.','- **Duração de Escudo de Fé:** três turnos nominais protegeram duas respostas; o contador cai na conjuração. Uniformizar a convenção e o texto.','- **Sets atuais:** o getter de bônus devolveu zero mesmo para Paradoxo. Ter perfis regionais declarados não equivale a bônus ativo.','',
'Nevasca e Decreto da Rainha aplicaram seu efeito/dano nos três alvos dos testes de área, tanto para host quanto para convidado. A sinergia Camuflagem→Surpresa foi confirmada na campanha; na arena, o código que substitui a última ação por `skill` precisa ser corrigido para preservar essa informação.','',
'## Entregáveis e próximos passos','',
'- [Avaliação de todas as habilidades](avaliacao_habilidades.md): quatro ataques básicos, 59 ativas nomeadas e 31 variantes passivas, com descrição extraída e avaliação individual.','- [Proposta de itens e conjuntos](proposta_itens_e_sets.md): slots, orçamento, atributos, raridades, crafting e 12 conjuntos com bônus de 2/4/5 peças.','- `docs/qa/2026-10-27/class-lab-results.json`: matriz agregada, finalistas, ações, rotações e sondagens.','- `docs/qa/2026-10-27/dungeon-class-results.json`: cura em grupo e habilidades de área.','',
'Corrigir primeiro dano por ação, bônus duplicado, imunidade prometida e origem de cura/escudo. Depois prototipar quatro sets e repetir a mesma matriz com orçamento igual de itens. A proposta de equipamento não deve ser usada para mascarar um básico que já mata qualquer chefe nem para decidir sozinha a viabilidade de uma classe de suporte.','',
'Reprodução: `node docs/qa/2026-10-27/class-lab.cjs`, depois `node docs/qa/2026-10-27/class-lab-extra.cjs` e `node docs/qa/2026-10-27/dungeon-class-probes.cjs`. O Playwright usa o runtime desta máquina e Edge em perfis descartáveis. `--resume` reaproveita apenas a triagem já salva e repete os testes posteriores. Esta avaliação não substitui playtest humano completo, balanço PvP com o motor corrigido, testes de rede nem campanha contínua com recursos carregados de uma luta para a seguinte.','']
(DOCS/'avaliacao_classes_e_combos.md').write_text('\n'.join(lines),encoding='utf-8')

# Individual skill catalogue. Every key must have editorial evaluation and actual engine coverage.
lines=['# Avaliação de todas as habilidades','',
'Complemento da avaliação de classes e combos. São quatro ataques básicos, um por classe, 59 nomes/variantes ativas e 31 variantes passivas. As ativas representam 55 tipos de implementação; Bola de Neve/Fogo, Congelar/Bafo, Brado/Ira e Esbarrão/Investida são variantes do mesmo tipo. Todas as entradas abaixo têm avaliação; nenhum tipo ficou sem nota.','',
'Descrições numéricas foram extraídas do motor em distribuição equilibrada, sem itens: classe-base nível 20, intermediária 50 e final 100. O alvo de referência tem 20.000 HP, 80 de armadura e 200 de ataque. Coeficientes de HP, mana atual, escudo e cargas dependem desse estado. Não interpretar esses valores contextuais como fórmula universal.','',
'As 516 sondagens ativas cobrem estados normal, preparado, recursos altos e alvo com escudo, executando a ação real e a resposta inimiga. A condição normal usa 70% de HP para exercitar cura/custos de vida. Uma skill indisponível por custo é um bloqueio esperado, não erro. As 68 verificações passivas confirmam gatilhos/valores específicos nas formas que possuem cada passiva; não certificam todas as interações possíveis. Problemas de matemática de Carregar e de dono de suporte aparecem nos testes adicionais, mesmo com seu gatilho básico funcionando.','']
for className in ['Guerreiro','Mago','Arqueiro','Adepto da Natureza']:
    cats=[c for c in d['catalog'] if c['form']['className']==className]
    lines += [f'## {className}','', '### Ataque básico','']
    basic=next(c for c in cats if c['form']['tier']==0)['basic']
    basicNote={'Guerreiro':'Confiável e sem custo de MP; depende de força e sofre contra armadura. É referência para medir se uma preparação realmente compensa.',
      'Mago':'Custa MP por míssil, mas a regeneração de 10% do máximo por turno frequentemente cobre o custo. Arcanista e suas rotas recebem dano fixo por míssil; corrigir essa escala antes de itens.',
      'Arqueiro':'Chance básica de acerto é 84%; Mirar garante acerto e aumenta ataque. Equipamentos de precisão precisam ter valor sem tornar Mirar inútil.',
      'Adepto da Natureza':'Usa ataque e recebe bônus na Forma Verdadeira; não substitui a preparação de marca/raiz. Serve também para recuperar MP dentro da forma.'}[className]
    lines += [basic['description'],'',basicNote,'']
    for kind,label in [('active','Ativas'),('passive','Passivas')]:
        lines += [f'### {label}','']
        entries=collections.defaultdict(list)
        for c in cats:
            for s in c[kind]:entries[(s['name'],s['type'])].append((c,s))
        for (name,typ),variants in sorted(entries.items(),key=lambda t:(min(s['level'] for c,s in t[1]),t[0][0])):
            representative=max(variants,key=lambda pair:pair[0]['level'])
            c,s=representative
            title=name+(' — '+typ.replace('archer_dodge_','') if name=='Passos Leves' else '')
            unlock=min(max(s['level'],60 if c['form']['tier']==2 else 30 if c['form']['tier']==1 else 1) for c,s in variants)
            lines += [f'#### {title}', '',f"**Desbloqueio da entrada/variante:** nível {unlock}. **Formas com esta entrada:** {', '.join(c['form']['name'] for c,s in variants)}.",'',
              f"**Referência extraída — {c['form']['name']}, nível {c['level']}:** {s['description']}",'',f"**Avaliação e ajuste:** {notes[typ]}",'']
            if kind=='active':
                probes=[x for x in d['probes'] if x['className']==className and x['skill']==name and x['type']==typ]
                conditions=sorted(set(x['condition'] for x in probes))
                lines += [f"**Teste executado:** {len(probes)} sondagens em {len(conditions)} condições; {sum(bool(x['error']) for x in probes)} exceções. Inclui custos, aplicação de estado e resposta do inimigo. Valores de cura/escudo observados também podem incluir passivas/reação nesse ciclo.",'']
            else:
                probes=[x for x in d['passiveProbes'] if x['className']==className and x['name']==name and x['type']==typ]
                lines += [f"**Gatilho verificado:** {sum(x['pass'] for x in probes)}/{len(probes)} verificações passaram.",'']
                for p in probes:
                    lines += [f"- {p['form']}: `{json.dumps(p.get('detail',{}),ensure_ascii=False)}`."]
                lines.append('')
lines += ['## Correções que devem preceder o ajuste de números','',
'Centralizar dano percentual/fixo por ação; eliminar multiplicação duplicada de Carregar; respeitar a imunidade anunciada do Berserker; corrigir a origem de Canção Ancestral quando lançada pelo convidado; recalcular percentual de área por alvo quando aplicável; padronizar duração e preservar o tipo específico da última ação. Os valores propostos de itens e conjuntos só devem ser medidos depois dessas correções.','']
(DOCS/'avaliacao_habilidades.md').write_text('\n'.join(lines),encoding='utf-8')

summary={'forms':len(d['forms']),'formLevelCases':len({(x['id'],x['level']) for x in d['rows']}),
'fights':sum(x['n'] for x in d['rows'])+sum(x['n'] for x in d['alternativeRows'])+sum(x['n'] for x in d['validation']),
'sequenceRuns':sum(x['n'] for x in d['sequenceProbes']),'activeProbes':len(d['probes']),'passiveProbes':len(d['passiveProbes']),
'uniqueActiveNames':len({(s['name'],s['type']) for c in d['catalog'] for s in c['active']}),
'uniquePassiveVariants':len({(s['name'],s['type']) for c in d['catalog'] for s in c['passive']}),'dungeonCases':len(group)}
(HERE/'class-lab-summary.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False),encoding='utf-8')
print(json.dumps(summary,ensure_ascii=False,indent=2))

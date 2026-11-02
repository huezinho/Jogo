"""Render the complete per-form skill catalogue from the native runtime audit."""
import json, math
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
data = json.loads((HERE / 'audit.json').read_text(encoding='utf-8'))
names = {
    'Recuperar Folego':'Recuperar Fôlego','Esbarrao':'Esbarrão','Escudo de Fe':'Escudo de Fé',
    'Voce Ira Me Parar?':'Você Irá Me Parar?','Cortes Ultrasonicos':'Cortes Ultrassônicos',
    'Voce Nao e Digno':'Você Não é Digno','Ultimo Recurso':'Último Recurso','Mana e Vida':'Mana é Vida',
    'Explosao de Mana':'Explosão de Mana','Concentracao':'Concentração','Corrupcao':'Corrupção',
    'Mago Incendiario':'Mago Incendiário','Mago Frigido':'Mago Frígido','Fenix Sagrada':'Fênix Sagrada',
    'Incorporar Demonio':'Incorporar Demônio','Canhao de Vidro':'Canhão de Vidro','Olhos de Falcao':'Olhos de Falcão',
    'Cacador':'Caçador','Emergencia Arcana':'Emergência Arcana','Mirar no Pe':'Mirar no Pé',
    'Resistencia Florestal':'Resistência Florestal','Raizes':'Raízes','Flor do Pantano':'Flor do Pântano',
    'Cancao Ancestral':'Canção Ancestral','Espirito da Floresta':'Espírito da Floresta',
    'Aura Feerica':'Aura Feérica','Podridao':'Podridão',
}
def name(value): return names.get(value,value)

def active(f, s):
    t, a, b = s['type'], f['tier30'], f['tier60']
    # Cost and damage expressions are also evaluated against the native metadata below.
    c, d, effect = '0', '0', ''
    if t == 'warrior_second_wind':
        c='30+W'; effect=f'Cura floor({0.15 if a=="cavaleiro" else 0.10}*H) de HP.'
        if a=='espadachim': effect+=' +20% de dano total por 3 turnos.'
    elif t == 'warrior_shove':
        c=('50' if a=='espadachim' else '44' if a=='cavaleiro' else '38')+'+W'
        d='20+floor(.07*H)+floor(.9*A)+floor(1.2*P)' if a=='espadachim' else f'20+floor({.09 if a=="cavaleiro" else .07}*H)+floor(.6*A)+floor(.6*P)'
        effect='Reduz o ataque do alvo em 30% por 3 turnos.' if a=='cavaleiro' else 'Golpe direto.'
    elif t == 'warrior_stagger':
        c='40+W'; d='60+floor(.07*H)+floor(.9*A)+floor(.9*P)+floor(.10*EH)' if b=='berserker' else '30+floor(.07*H)+floor(.5*A)+floor(.5*P)'
        effect='Sem controle; inclui 10% do HP máximo do alvo.' if b=='berserker' else '30% de chance de impedir a próxima ação inimiga.'
    elif t == 'warrior_swift_strikes':
        c='44+W'; d='3*(A+U)' if b=='ninja' else '2*(A+U)'; effect='Cada golpe sofre armadura e escudo separadamente; não chama a rotina do básico nem sua Mente Limpa.'
        if b=='samurai': effect+=' Sangramento por 3 rodadas: floor(.15*Dcausado/3) por rodada, total 3*floor(.15*Dcausado/3).'
    elif t == 'warrior_warcry':
        c='W' if b=='berserker' else '40+W'
        effect='Custa também floor(.8*H) de HP; +150% de dano total (×2,5) por 4 turnos.' if b=='berserker' else '+30% de ataque por 5 turnos.'
        if b=='paladino': effect+=' Também reduz o dano recebido em 16% por 5 turnos.'
    elif t == 'warrior_deep_cut':
        c='52+W'; d='70+floor(1.1*A)+floor(.8*P)'; pct='.30' if b=='ninja' else '.15'
        effect=f'Sangramento: floor({pct}*Dcausado/3) por 3 rodadas; o percentual corresponde ao total, não a cada rodada.'
        if b=='samurai': effect+=' Ignora armadura, mas não escudo.'
    elif t == 'warrior_judgment': c='100+W'; d='80+floor(.4*H)+floor(.5*A)+floor(.8*P)'; effect='Golpe direto.'
    elif t == 'warrior_valhalla': c='100+W'; effect='Por 5 turnos, soma floor(.15*EH) a cada aplicação positiva de dano, depois da armadura, e recebe +200% de dano (×3). Golpes múltiplos podem disparar o bônus várias vezes.'
    elif t == 'warrior_armor_piercer': c='82+W'; d='(80+floor(1.1*A)+floor(1.1*P))*(3 if B>0 else 1)'; effect='Triplica o dano calculado se houver escudo no alvo. A execução atual NÃO ignora armadura nem escudo.'
    elif t == 'warrior_smoke_bomb': c='40+W'; effect='Garante uma esquiva no próximo ataque recebido; próximo dano positivo +30%. Pode ativar Contra-Ataque; bônus consumido na primeira aplicação positiva, inclusive uma reação.'
    elif t == 'warrior_faith_shield': c='floor(.7*M)+W'; effect='Invulnerabilidade por 3 turnos. Armazena o dano que seria recebido antes das reduções; ao terminar, aplica floor(.5*Darmazenado) ao inimigo, sujeito à armadura e ao escudo dele.'
    elif t == 'warrior_unstoppable': c='100+W'; effect='Custa também floor(.3*H) de HP; +50 de ataque e imunidade a perder ações por 4 turnos. Remove o impedimento de ação já pendente.'
    elif t == 'warrior_ultrasonic_cuts': c='240+W'; effect='Por 3 turnos, só permite o ataque básico e faz os ataques recebidos serem tratados como esquivas. Não causa dano no lançamento.'
    elif t == 'warrior_giant_slayer': c='200+W'; d='floor(.4*eh)'; effect='40% do HP atual do alvo; sofre armadura e escudo.'
    elif t == 'mage_mana_burst':
        c='cm(20+floor(.2*L)+S)'; d=f'30+floor({1 if a=="elementalista" else .6}*P)+floor({.14 if a=="arcanista" else .1}*M)+4*floor(.5*em)+F'
        effect='Retira floor(.5*em) de MP do alvo, quando ele possui MP máximo positivo; essa quantidade ×4 entra no dano. Contra alvo sem mana, o termo vale zero.'
    elif t == 'mage_fireball':
        c='cm(40+S)'; d='50+floor(1.3*P)'+('+floor(.05*eh)' if b=='mago_incendiario' else '')+'+F'
        effect='Resfriamento: -30% de ataque por 3 turnos; não aplica a queimadura normal.' if b=='mago_frigido' else 'Queima por 3 rodadas: max(1,floor(.03*EH)) por rodada, ou 5% com Fogo do Inferno no nível 70. Reduz a cura recebida pelo alvo em 30% durante a queimadura.'
        if b=='mago_frigido': effect+=' No 70, Gelo Queima também aplica max(1,floor(.03*EH)) por 1 rodada.'
    elif t == 'mage_concentration': c='cm(200+S)'; effect='+20% de dano total e +10 pontos percentuais à regeneração de mana por 4 turnos. Regeneração padrão: floor(.10*M); durante o efeito: floor(.20*M), antes de outros bônus. Não causa dano ao lançar.'
    elif t == 'mage_mana_shield':
        c='cm(floor(.12*M)+S)' if b=='arquimago' else 'cm(floor(.15*M)+S)'
        effect=f'Apaga o escudo anterior e concede 40+floor({.4 if b=="arquimago" else .3}*M), por 2 turnos.'
        if b=='corrompido': effect+=' Ativa reação que reduz em 50% o ataque inimigo por 1 turno ao receber dano ou absorvê-lo, enquanto a reação estiver ativa.'
    elif t == 'mage_freeze':
        c='cm(40+floor(.2*L)+S)'; d='60+floor(.9*P)+F'
        effect='Queimadura por 6 rodadas: max(1,floor(.03*EH)), ou 5% com Fogo do Inferno no 70; reduz cura inimiga em 30%.' if b=='mago_incendiario' else '30% de chance de impedir a próxima ação inimiga.'
        if b=='mago_frigido': effect+=' Se a rolagem falhar: alvo já resfriado ganha +50% no próximo dano recebido; caso contrário, -30% de ataque por 2 turnos. No 70, esse ramo de resfriamento também aplica queimadura de 3% de EH por 1 rodada; o ramo que impediu a ação não aplica essa queimadura.'
    elif t == 'mage_discharge':
        c='cm(10*Q+S)'; d='floor((L+.007*M)*Q)+F' if b=='arquimago' else '60+L*Q+floor(.1*P)+floor(.04*M)+F'
        effect='Consome todas as cargas arcanas. O jogo permite usar com Q=0.'
        if b=='corrompido': effect+=' Deixa +30% para o próximo dano positivo.'
    elif t == 'mage_sacred_phoenix': c='cm(200+P+S)'; d='100+floor(1.8*P)+F'; effect='Queima por 1 rodada: max(1,floor(.03*EH)), ou 5% com Fogo do Inferno no 70; reduz cura inimiga em 30% por 1 turno.'
    elif t == 'mage_blizzard': c='cm(120+S)'; effect='Por 6 turnos, 15% de chance de o inimigo perder a ação. Não dá dano direto nem acumula consigo mesma.'
    elif t == 'mage_corruption': c='cm(floor(.3*m))'; d='100+floor(P)+floor(.3*M)+F'; effect='Ignora armadura neste golpe. Aplica -100% de armadura e impede novos escudos por 5 turnos; não apaga automaticamente o escudo que já existia.'
    elif t == 'mage_overcharge': c='cm(floor(.95*M)+S)'; d='200+M+L*Q+F'; effect='Consome todas as cargas arcanas; sofre armadura e escudo. Com Transbordando do Arquimago, o custo normalmente chega a M: exige mana cheia.'
    elif t == 'mage_demon_form': c='cm(floor(.3*m))'; effect='+200% de dano total (×3) e +30% de dano recebido por 3 turnos. Custo baseado no MP atual, sem S adicional.'
    elif t == 'mage_explode': c='cm(500+S)'; d='200+floor(1.3*P)+floor(.5*H)+floor(.5*EH)+F'; effect='Custa também floor(.5*H) de HP. Aplica o dano calculado ao inimigo, sujeito à armadura e ao escudo, além dos custos de HP e MP.'
    elif t == 'mage_avalanche': c='cm(400+S)'; d='200+floor(1.3*P)+floor(.5*EH)+F'; effect='Resfria por 4 turnos (-30% de ataque). Com Gelo Queima, também queima por 1 rodada em max(1,floor(.03*EH)).'
    elif t == 'archer_focus': c='30+L'; effect='+5+L de ataque e 100% de acerto básico por 5 turnos. O bônus de ataque também entra nas habilidades que usam A.'
    elif t == 'archer_headshot':
        c='60+floor(.3*L)'; d='60+floor(1.1*P)+floor(.6*M)' if b=='atirador_arcano' else '30+floor(.7*A)+floor(.9*P)'
        effect='Acerta sem a rolagem de precisão do básico; crítico local de 70%' if b=='sniper' else 'Acerta sem a rolagem de precisão do básico; crítico local de 10%'
        effect+=' mais os bônus críticos do ramo. Com Mirar: D=floor(1.1*D) e +10 pontos percentuais ao crítico local. Críticos usam K.'
        if b=='atirador_arcano': effect+=' Sem crítico, marca o próximo dano contra o alvo com +15%.'
    elif t == 'archer_camouflage': c='40+floor(.5*L)'; effect=f'+{25 if a=="cacador" else 20}% de esquiva por 4 turnos; soma à passiva, respeitando teto total de 95%.'; effect+=(' Próximo dano positivo +30%.' if a=='atirador' else '')
    elif t == 'archer_barrage': c='60'; d=('3' if b=='guarda_florestal' else '2')+'*(A+U)'; effect='Cada disparo tem 84% de acerto (100% com Mirar), pode critar com K e sofre armadura/escudo individualmente. Mirar dá 10% de chance de um disparo extra.'
    elif t == 'archer_piercing_shot': c='80'; d=f'50+floor({1.2 if b=="sniper" else .8}*A)+floor({1.2 if b=="atirador_arcano" else .8}*P)'; effect='Acerta sem teste de precisão; pode critar com K; ignora armadura e escudo.'; effect+=(' Também destrói o escudo existente.' if b=='sniper' else '')
    elif t == 'archer_trap': c='80'; d='30+floor(1.1*P)'+('+floor(.08*eh)' if b=='espreitador' else ''); effect='30% de chance de impedir a próxima ação; não faz teste de precisão e não rola crítico.'; effect+=(' Se impedir a ação, a próxima Rajada ganha +15% por disparo.' if b=='guarda_florestal' else '')
    elif t == 'archer_arcane_shot': c='100'; d='60+P+floor(.75*max(0,M-m))'; effect='Acerto garantido, pode critar com K. MP faltante é medido antes de pagar os 100 MP.'
    elif t == 'archer_execute': c='120'; d='60+floor(1.1*A)+floor(.9*P)'; effect='D é triplicado se eh<=floor(.4*EH), incluindo exatamente 40%; depois pode critar com K. Sem teste de precisão.'
    elif t == 'archer_surprise': c='80'; d='60+floor(.9*A)+floor(.7*P)'; effect='Se a última ação foi Camuflagem, substitui D por 80+floor(1.2*A)+floor(.9*P). Pode critar com K; sem teste de precisão.'
    elif t == 'archer_tranquilizer': c='80'; d='60+floor(.8*A)+floor(.6*P)'; effect='-30% de ataque inimigo por 3 turnos. Pode critar com K; sem teste de precisão.'
    elif t == 'archer_overcharge': c='m'; d='80+floor(1.6*P)+floor(.6*m)'; effect='Gasta todo o MP atual. Funciona com m=0, sem custo; pode critar com K e não testa precisão.'
    elif t == 'archer_weak_spot': c='120'; d='100+floor(.4*A)+floor(.3*P)+floor(.25*eh)'; effect='Pode critar com K; sem teste de precisão. A parcela percentual usa HP atual, não máximo.'
    elif t == 'archer_aim_leg': c='100'; d='80+floor(.6*P)+floor(.5*A)'; effect='Por 3 turnos: -15% de ataque e -50% de armadura inimiga; 10% de chance de impedir a próxima ação. Pode critar com K; sem teste de precisão.'
    elif t == 'archer_cutting_shot': c='80'; effect='Sem dano direto. Cada rodada: floor((120+floor(1.2*A)+floor(1.2*P))/3), por 3 rodadas. Total = 3 vezes esse valor; não rola crítico.'
    elif t == 'nature_living_seed':
        c='20+floor(.5*L)'; d='10+floor(.7*A)+floor(.3*P)'
        effect='Aplica marca por 4 turnos, com floor(.2*P*4) de dano natural por rodada.' if a=='druida' else 'Aplica marca sem dano periódico por 3 turnos.'
        if a=='espirito_da_floresta': effect+=' A marca reduz ataque inimigo em .08*3=24% por 3 turnos.'
        effect+=' O dano inicial é resolvido antes de criar a nova marca.'
        if f['tier']==0: effect+=' O motor já aplica o bônus contra alvo marcado e o reembolso antes do desbloqueio nominal de Ciclo Natural no 10.'
    elif t == 'nature_roots': c='30+floor(.6*L)'; d='20+floor(.8*A)+floor(.8*P)'; effect=f'{60 if a=="druida" else 45}% de chance de enraizar por 3 turnos.'; effect+=(' Se enraizar, também reduz armadura em 50% por 3 turnos.' if a=='espirito_da_floresta' else '')
    elif t == 'nature_swamp_flower': c='20+floor(.4*L)'; d=f'10+floor({1.3 if b=="avatar_da_natureza" else .8}*A)+floor(.8*P)'; effect=f'Se o alvo já estava enraizado, aplica floor(.4*P) de veneno por {3 if b=="avatar_da_natureza" else 7 if b=="druida_sombrio" else 4} rodadas. Sem raiz, dá só o dano direto.'
    elif t == 'nature_breeze_charm': c='30+floor(.3*L)'; d='20+floor(1.1*P)'; effect=f'{30 if b=="fada_monarca" else 20}% de chance de impedir a próxima ação. Se o alvo já estava marcado, outra rolagem independente de igual chance enraíza por 3 turnos. Coroar soma 20 pontos percentuais a ambas.'; effect+=(' Contra alvo marcado, ganha escudo igual ao dano efetivamente causado, antes dos bônus próprios de escudo.' if b=='protetor_da_floresta' else '')
    elif t == 'nature_harvest':
        c='40+floor(.3*L)'; d='30+floor(1.2*A)'
        effect='Adiciona floor(Tnatural*(marca_por_rodada*turnos_marca + veneno_por_rodada*turnos_veneno + apodrecimento_por_rodada*turnos_apodrecimento)), consumindo esses três efeitos. Se a marca não tem dano, sua parcela vira floor(.3*P*turnos_marca).' if b=='druida_sombrio' else 'Se há marca, adiciona floor(Tnatural*floor(.3*P*turnos_marca)) e a consome. Não consome veneno nem apodrecimento. O dano real da marca não é a parcela usada nesta versão.'
        effect+=' Marca removida antes do golpe: esse lançamento não recebe Ciclo Natural por essa marca.'
        if b=='avatar_da_natureza': effect+=' Ganha floor(.7*Dcausado) de escudo, antes de bônus de escudo.'
    elif t == 'nature_ancestral_song': c='40+floor(.4*L)'; effect='Cura floor(1.4*P), ou floor(2*P) com inimigo enraizado, antes de bônus de cura.'; effect+=(' Também concede floor(1.6*P) de escudo, ou floor(2.2*P) com alvo enraizado, antes de bônus de escudo.' if b=='protetor_da_floresta' else ''); effect+=(' Reduz ataque inimigo em 12% por 3 turnos.' if b=='fada_monarca' else '')
    elif t == 'nature_decay': c='40+floor(.5*L)'; d='50+floor(1.2*A)'; effect='Aplica max(1,floor(.015*EH)) de apodrecimento por 5 rodadas, antes de Podridão e bônus de conjunto.'
    elif t == 'nature_true_form': c='M'; effect='Requer MP atual igual ao máximo. Por 5 turnos: +26% de ataque, -18% de dano recebido e básico = floor(1.7*A)+U. O A dessa fórmula já inclui o +26%. Não dá dano no lançamento.'
    elif t == 'nature_queen_decree': c='90'; d='floor(2*P)'; effect='Com 3 Cadências, substitui D por floor(2.9*P). Não consome Cadência.'
    elif t == 'nature_vine_cocoon': c='60+floor(.6*L)'; effect='Escudo base floor(1.4*A+1.4*P); acumula com o escudo existente e não tem prazo próprio, antes de bônus de escudo.'
    elif t == 'nature_swamp_collapse': c='floor(.85*M)'; d='floor(1.8*A+1.8*P)'; effect='Somente se o alvo não tinha nenhum DOT natural positivo: aplica por 4 rodadas marca de floor(.2*P*4), veneno de floor(.4*P) e apodrecimento de max(1,floor(.015*EH)), antes de Podridão. Não aplica esse pacote se já havia marca com dano, veneno ou apodrecimento.'
    elif t == 'nature_crush_invader': c='300+floor(.8*L)'; d='floor(2*A)'; effect='Soma floor(.6*A) se enraizado e floor(A) se Forma Verdadeira ativa. Esses bônus podem coexistir.'
    elif t == 'nature_crown': c='300+floor(2*L)'; effect='Por 5 turnos: +floor(.3*(Abase+Ppassivo_após_Cadência)) de poder de habilidade, +20% em curas e +20 pontos percentuais nas rolagens de Encanto da Brisa. Ativa a esquiva de 60% de Asas da Realeza; não aumenta a chance de Raízes.'
    elif t == 'nature_throw_thorns': c='floor(4*L)'; d='floor(2*E)'; effect='Custa também floor(.2*H) de HP e consome todo o escudo E. Ignora armadura e escudo inimigos. É utilizável com E=0 e, nesse caso, causa zero dano.'
    else: raise ValueError(t)
    return c,d,effect

def passive(f,s):
    t,a,b=s['type'],f['tier30'],f['tier60']
    if t=='warrior_flat_reduction': return 'Redução fixa de floor(.6*L) por ataque recebido.'+(' Regenera floor(.03*H) de HP por turno.' if a=='cavaleiro' else '')
    if t=='warrior_enemy_miss': return '+20 pontos percentuais à chance de o inimigo errar.'
    if t=='warrior_reflect': return 'Ao perder HP por dano recebido, 50% de chance de contra-atacar por A+U, sujeito à armadura/escudo.' if b=='berserker' else f'Reflete floor({.32 if b=="paladino" else .18}*HPperdido) após escudos e reduções; a reflexão sofre armadura e escudo inimigos.'
    if t=='warrior_counter_on_dodge': return 'Ao esquivar, contra-ataca por A+U.'+(' Ignora armadura e escudo.' if b=='ninja' else ' Sofre armadura e escudo.')+(' Cura floor(.3*Doriginal_do_ataque_recebido), antes dos bônus de cura.' if b=='samurai' else '')
    if t=='warrior_aura_shield': return 'A cada ação do jogador, antes da habilidade/básico, soma floor(.02*H) de escudo persistente.'
    if t=='warrior_last_stand': return 'Uma vez por combate, após dano fatal recebido fica com 1 HP; permite uma última ação e morre depois dela se não derrotar o inimigo. Custos voluntários de HP continuam exigindo HP maior que o custo.'
    if t=='warrior_first_strike_echo': return 'O primeiro básico chama um segundo golpe de floor(.5*Dbásico_bruto), aplicando as defesas novamente. A execução não repete automaticamente uma habilidade inteira nem todos os efeitos dela.'
    if t=='warrior_execute_bonus': return 'Com eh<=floor(.5*EH), dano direto positivo após armadura ganha floor(.5*dano), antes dos demais bônus. Inclui exatamente 50%.'
    if t=='mage_last_resort': return 'Se um dano após reduções/escudo seria fatal e m>=2*dano, gasta 2*dano de MP e anula esse dano.'+(' Arcanista: ganha floor(MPgasto/100) cargas arcanas.' if a=='arcanista' else '')+(' Elementalista: aplica queimadura de max(1,floor(.03*EH)) por 3 rodadas e -30% à cura inimiga.' if a=='elementalista' else '')
    if t=='mage_mana_to_life': return f'Vida máxima adicional = floor({.65 if b=="mago_frigido" else .5}*M).'+(' Também adiciona floor(.18*M) ao poder de habilidade.' if b=='mago_incendiario' else '')
    if t=='mage_overflowing': return f'F=floor({.45 if b=="arquimago" else .3}*M); S=floor({.2 if b=="arquimago" else .1}*M). F entra uma vez por habilidade listada ou é repartido entre os mísseis de uma ação básica.'+(' Também converte todo HP perdido por dano em igual escudo persistente, salvo bloqueio de novos escudos.' if b=='corrompido' else '')
    if t=='mage_hellfire': return 'Altera a queimadura das magias de fogo para max(1,floor(.05*EH)) por rodada; não transforma toda fonte de queimadura em 5%.'
    if t=='mage_frostburn': return 'Bola de Neve, ramo de resfriamento de Congelar e Avalanche também aplicam queimadura de max(1,floor(.03*EH)) por 1 rodada.'
    if t=='mage_charge_damage': return 'Cada carga arcana concede +5% de dano total: bônus = .05*Q, sem teto próprio de Q. Novas cargas não reiniciam os 3 turnos contados da primeira carga.'
    if t=='mage_glass_cannon': return 'Uma vez por combate, dobra o primeiro básico completo ou a primeira habilidade que usa a rotina de bônus de primeiro dano. Recebe +50% de dano nos 2 primeiros turnos. A janela é consumida pela primeira fonte ofensiva elegível.'
    if t in ['archer_dodge_level_scaling','archer_dodge_double_bonus','archer_dodge_coin_bonus']: return 'Chance passiva de esquiva = .05+.005*L; chance total, com efeitos, limitada a .95.'+(' O ramo Atirador também recebe +5 pontos percentuais de crítico.' if a=='atirador' else '')+(' Também ganha +10% de moedas de inimigos.' if a=='cacador' else '')
    if t=='archer_attack_level_bonus': return f'Ataque adicional floor(.9*L); poder adicional floor({1.3 if b=="atirador_arcano" else .9}*L).'+(' Sniper recebe +15 pontos percentuais de crítico desde o nível 60.' if b=='sniper' else '')
    if t=='archer_dodge_damage_buff': return 'Ao esquivar, próximo dano positivo +50%.' if b=='espreitador' else 'Ao esquivar, cura floor(.13*H), antes de bônus de cura.' if b=='guarda_florestal' else 'Ao esquivar, +10% de dano total por 2 turnos.'
    if t=='archer_mana_to_skill_bonus': return 'Poder de habilidade adicional = floor(.05*M).'
    if t=='archer_sniper_bonus_crit': return '+15 pontos percentuais de crítico no nível 70, além dos +15 do Sniper no 60 e dos +5 do Atirador. Excedente acima de 100% aumenta o multiplicador crítico K.'
    if t=='archer_enemy_skip_chance': return '7% de chance passiva de o inimigo perder uma ação, sem gastar uma ação própria.'
    if t=='archer_flat_reduction_level': return 'Redução fixa por ataque recebido = floor(.2*L).'
    if t=='nature_cycle': return f'Alvo marcado recebe +{16 if a=="druida" else 10}% de dano direto depois da armadura. Habilidade que atinge alvo ainda marcado devolve floor(.1*C) de mana; Colheita remove a marca antes do dano e perde esse reembolso.'+(' Converte floor(.3*Abase) em poder de habilidade.' if a=='espirito_da_floresta' else '')
    if t=='nature_sap': return 'Marca e veneno curam floor(.08*DOTcausado) por rodada, antes de bônus de cura.'+(' Apodrecimento também pode curar.' if b=='druida_sombrio' else '')+(' Adiciona floor(.12*Hbase) de vida máxima.' if b=='avatar_da_natureza' else '')
    if t=='nature_fairy_aura': return f'Cura efetiva ou ganho de escudo concede 1 Cadência, máximo 3. Poder adicional = floor((Abase+Ppassivo)*{.06 if b=="fada_monarca" else .04}*Cadência), calculado antes do poder ganho de Força. Com 3: +{10 if b=="fada_monarca" else 5}% de cura.'+(' Com 3 também ganha +10% de escudo.' if b=='protetor_da_floresta' else '')
    if t=='nature_dot_mastery': return 'Multiplica marca, veneno e apodrecimento por 1,3: tick=floor(DOTbase*1.3), antes de bônus de conjunto. Colheita também usa Tnatural=1,3 no valor consumido.'
    if t=='nature_ancestral_bark': return 'Redução fixa = floor(4+.5*L), ou floor(4+.7*L) durante Forma Verdadeira.'
    if t=='nature_royal_wings': return '20% de esquiva; passa a 60% durante Coroar. Soma a outros efeitos respeitando teto de 95%.'
    if t=='nature_forest_oath': return 'Escudos +6%; enquanto há escudo, reflete floor(.3*dano_absorvido_pelo_escudo), sujeito à defesa do alvo.'
    raise ValueError(t)

def basic(f):
    if f['className']=='Mago':
        text='N=floor(3+.1*L); custa 3*N MP. Cada um dos N mísseis sorteia um inteiro entre 5+floor(.2*A) e 5+floor(.5*A), inclusive. F é dividido: floor(F/N) por míssil e +1 nos primeiros F mod N. Armadura é aplicada por míssil.'
        if f['tier30']=='elementalista': text+=' Cada míssil também recebe floor(.1*P).'
        if f['tier30']=='arcanista': text+=' Cada míssil tem 15% de chance de gerar 1 carga arcana. A primeira inicia uma janela de 3 turnos; novas cargas não a renovam.'
        if f['tier60']=='corrompido': text+=' No nível 70, Canhão de Vidro dobra todos os mísseis da primeira ação básica elegível.'
        return text
    if f['className']=='Arqueiro': return 'Dbruto=A+U; custo 0 MP; 84% de acerto, 100% com Mirar; pode critar com K. Bônus crítico do ramo: '+('35 pontos percentuais desde o nível 70 (5 Atirador +15 Sniper no 60 +15 Olhos de Falcão no 70).' if f['tier60']=='sniper' else '5 pontos percentuais desde o nível 30.' if f['tier30']=='atirador' else '0, antes de equipamentos.')
    return 'Dbruto=A+U; custo 0 MP; sem rolagem de precisão.'+(' Durante Forma Verdadeira, Dbruto=floor(1.7*A)+U; A já inclui o bônus de ataque da forma.' if f['tier60']=='avatar_da_natureza' else '')

legend='''# Habilidades das classes e subclasses

## Fórmulas e resolução

`L`: nível; `H`/`M`: HP/MP máximos com atributos, passivas e equipamentos; `m`: MP atual antes do custo; `A`: ataque ativo, com buffs; `P`: poder de habilidade ativo; `EH`/`eh`: HP máximo/atual do inimigo; `em`: MP atual do inimigo (zero sem reserva de mana); `B`: escudo inimigo; `E`: escudo do personagem; `Q`: cargas arcanas; `U`: inteiro uniforme de 0 a 5; `floor`: arredondamento para baixo. `W=floor(.2*L)`. `F` e `S` são os bônus de dano fixo e custo de Transbordando, ou zero sem a passiva. `cm(x)=min(M,max(0,floor(x)))`.

Custos das tabelas são de mana antes de descontos/acréscimos de equipamentos. Custos de HP são adicionais e exigem HP atual estritamente maior que o custo. Habilidades, buffs e consumíveis de batalha usam uma ação e permitem resposta inimiga; nenhuma habilidade abaixo concede turno gratuito. Buffs novos preservam a duração inicial; os anteriores decaem nas ações seguintes, inclusive ao beber poção.

`A=floor((Abase+bônus_fixo_ativo)*(1+bônus_percentual_ativo))`. `P=floor((Ppassivo+ganho_de_Força+bônus_fixo_ativo)*(1+bônus_percentual_ativo))`. `Abase` já inclui os atributos, subclasses e equipamento; `Ppassivo` inclui subclasses, passivas e equipamento, na ordem do motor. `Hbase` é o HP permanente da classe/atributos, antes dos bônus adicionais. Máximos, cura e escudo também podem mudar por equipamentos; as tabelas mostram as contribuições da habilidade e do ramo.

Investimentos permanentes no nível atual: HP de Vitalidade = `pontos_vitalidade*floor(10+1.8*L)`; MP de Sabedoria = `pontos_sabedoria*floor(10+1.5*L)`; ataque e poder de Força = `pontos_força*floor(5+.15*L)` cada. Todos os pontos anteriores usam esse mesmo valor do nível atual; bônus de classe, subclasse e equipamento são adicionais.

Dano direto: `AR=max(0,floor(armadura*(1-redução_de_armadura)*(1-penetração)))`; `d=max(0,floor(Dbruto)-AR)` por aplicação, salvo indicação de ignorar armadura. Depois, quando positivos e aplicáveis, entram Ciclo Natural, adicional de HP máximo de Vallhala, Eliminar, bônus passivo de dano, buff de dano total, bônus do próximo golpe, marca do próximo dano, vulnerabilidade de Congelamento e redução de dano do personagem. Cada bônus percentual faz `d=d+floor(d*bônus)` na ordem indicada; reduções subtraem sua parcela arredondada. O escudo absorve por último: HP removido `max(0,d-B)`, salvo indicação de ignorá-lo. Buffs que escrevem no mesmo campo usam o maior valor e a maior duração; não somam automaticamente. Dano bruto nas tabelas não equivale ao HP removido.

Crítico de Arqueiro: `p=max(0,crítico_local+bônus_do_ramo+bônus_do_equipamento)`, probabilidade efetiva `min(1,p)`, multiplicador em crítico `K=2+max(0,p-1)+bônus_crítico_do_conjunto`; sem crítico, `K=1`. Os tiros com crítico indicam isso na tabela. Mirar adiciona os 10 pontos de crítico especificamente ao Headshot.

Queimaduras e sangramentos comuns compartilham um campo: reaplicar mantém o maior dano por rodada e a maior duração, não cria duas pilhas. Marca, veneno e apodrecimento têm campos separados; seus ticks retiram HP diretamente, ignorando armadura/escudo e sem reaplicar todos os multiplicadores do dano direto. `Tnatural=1.3` com Podridão, senão `1`. Equipamentos podem ampliar DOT. Enraizamento impede a ação enquanto houver duração, mas não impede a resolução do DOT. Controle/esquiva de chefes não desfaz efeitos negativos que o motor já aplicou antes de cancelar o dano.

Escudos naturais acumulam e duram até consumir, salvo prazo explícito. Curas são limitadas ao HP faltante, arredondadas e afetadas por bônus/reduções; curar sem recuperar HP não gera Cadência. Escudos gerados por Aura Divina usam sua rotina própria. Regeneração padrão de mana ao final da rodada: `max(1,floor(.10*M)+bônus_fixo)`, modificável por conjuntos e buffs.

O nível de cada linha é o desbloqueio original. Cada seção apresenta o kit completo daquela forma, com as alterações herdadas já aplicadas; habilidades do nível 80 continuam exigindo chegar ao 80.
'''
out=[legend]; validated=0
for f in data['forms']:
    parent=next((name(x['name']) for x in data['forms'] if x['id']==f['tier30']),None)
    route=name(f['className'])+(' → '+parent if parent else '')+(' → '+name(f['name']) if f['tier']==2 else '')
    out += [f'\n## {name(f["name"])}\n',f'Rota: {route}. Forma '+('base, antes do nível 30.' if f['tier']==0 else 'do nível 30, antes da especialização do 60.' if f['tier']==1 else 'a partir do nível 60.')+'\n', '### Ataque básico\n',basic(f)+'\n','### Habilidades ativas\n','| Nível | Habilidade | Custo MP | Dano bruto | Efeito |\n| --- | --- | --- | --- | --- |']
    for s in f['active']:
        c,d,e=active(f,s);out.append(f'| {s["level"]} | {name(s["name"])} | `{c}` | `{d}` | {e} |')
        row=next(r for r in data['rows'] if r['form']==f['id'] and r['level']==f['atLevel'] and r['build']=='equilibrada' and not r['armored'] and r['id']==s['id'])
        st=row['stats']; M=st['mp'];a,b=f['tier30'],f['tier60']
        ctx=dict(L=f['atLevel'],H=st['hp'],M=M,m=M,A=st['attack'],P=st['power'],EH=st['enemyHp'],eh=st['enemyHp'],em=0,B=0,E=0,Q=0,U=0,W=math.floor(.2*f['atLevel']),S=math.floor(M*(.2 if b=='arquimago' else .1)) if a=='arcanista' and f['atLevel']>=40 else 0,F=math.floor(M*(.45 if b=='arquimago' else .3)) if a=='arcanista' and f['atLevel']>=40 else 0,floor=math.floor,max=max,min=min)
        ctx['cm']=lambda x,M=M:min(M,max(0,math.floor(x)))
        expected_c=eval(c,{'__builtins__':{}},ctx)
        assert expected_c==s['cost'],(f['id'],s['id'],'cost',expected_c,s['cost'])
        if 'damage' in s:
            expected_d=eval(d,{'__builtins__':{}},ctx)
            assert expected_d==s['damage'],(f['id'],s['id'],'damage',expected_d,s['damage'])
        validated+=1
    out += ['\n### Habilidades passivas\n','| Nível | Habilidade | Fórmula e efeito |\n| --- | --- | --- |']
    for s in f['passive']:out.append(f'| {s["level"]} | {name(s["name"])} | {passive(f,s)} |')
(ROOT/'docs/habilidades_classes_subclasses.md').write_text('\n'.join(out)+'\n',encoding='utf-8')
assert len(data['forms'])==28
print(f'PASS catálogo: {len(data["forms"])} formas; {validated} entradas ativas verificadas; {sum(len(f["passive"]) for f in data["forms"])} passivas')

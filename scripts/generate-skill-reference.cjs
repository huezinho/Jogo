// Run with: node scripts/generate-skill-reference.cjs
// Uses the same real-browser harness as the regression suite.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { server, root, chromium } = require('../docs/qa/2026-10-27/smoke.cjs');

async function main(){
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try{
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || (process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':'/usr/bin/chromium') });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/\.(png|webp|jpg|mp3)(\?|$)/, route => route.abort());
    await page.goto('http://127.0.0.1:' + server.address().port + '/index.html');
    await page.addScriptTag({ content: fs.readFileSync(path.join(root, 'docs/qa/2026-10-27/class-lab-engine.js'), 'utf8') });
    const forms = await page.evaluate(() => ClassLab.forms.map(form => {
      const level = form.tier === 2 ? 100 : form.tier === 1 ? 50 : 20;
      ClassLab.make(form, level, 'equilibrada', 'dummy');
      return {
        ...form, level, stats: getPreviewStats(), invested: player.stats.invested,
        basic: { name: getBasicAttackLabel(), description: getBasicAttackTooltip() },
        active: getSkillInfo().map(skill => ({ ...skill, effectiveCost: useSkillCost(skill) })),
        passive: getUnlockedPassiveSkills().map(skill => ({ ...skill, description: getPassiveStatusDescription(skill) })),
        modifiers: getPassiveModifiers()
      };
    }));
    assert.equal(forms.length, 28);
    assert.equal(errors.length, 0, errors.join('\n'));
    const activeIds = new Set(forms.flatMap(form => form.active.map(skill => skill.name)));
    const passiveIds = new Set(forms.flatMap(form => form.passive.map(skill => skill.id)));
    const reference = {
      source: ['assets/js/game.js:getSkillInfo', 'assets/js/game.js:getPassiveStatusDescription', 'assets/js/data/class-trees.js'],
      conditions: { build: 'equilibrada', equipment: 'nenhum', enemyMaxHp: 20000, arcaneCharges: 0, natureCadence: 0, shield: 0, tierLevels: [20, 50, 100] },
      counts: { forms: forms.length, activeNames: activeIds.size, passiveIds: passiveIds.size }, forms
    };
    const clean = value => String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
    const duration = skill => Object.entries(skill).filter(([key, value]) => /turns|duration/i.test(key) && typeof value === 'number' && value > 0).map(([key, value]) => `${({turns:"Duração",bleedTurns:"Sangramento",burnTurns:"Queimadura",chillTurns:"Resfriamento",dotTurns:"DOT",poisonTurns:"Veneno",decayTurns:"Apodrecimento",markTurns:"Marca",enemyAttackDownTurns:"Ataque reduzido",enemyArmorDownTurns:"Armadura reduzida",armorBreakTurns:"Armadura removida",noShieldTurns:"Sem escudo"})[key] || "Duração do efeito"}: ${value} turno(s)`).join('; ') || 'Ver efeito';
    const readableFormula = require('./skill-formulas.cjs');
    const conditions = require('./skill-conditions.cjs');
    const lines = [
      '# Referência atual de habilidades', '',
      'Catálogo gerado a partir do código executável atual em 06/11/2026. Não utiliza o documento antigo de balanceamento.', '',
      `São ${forms.length} formas de classe/subclasse e ${activeIds.size} nomes distintos de habilidades ativas. Habilidades herdadas aparecem em cada rota em que estão disponíveis.`, '',
      'Relatório geral: nenhuma vida, mana, ataque ou nível de herói é fixado nas fórmulas. L permanece uma incógnita. Os níveis indicados nas tabelas são somente requisitos de desbloqueio; cada regra vale após desbloquear a habilidade e escolher a classe correspondente.', '',
      'Crítico é um atributo universal: todos os heróis começam com 1%. Ataques e habilidades ofensivas podem critar; DOTs e efeitos adicionais dos equipamentos não fazem nova rolagem de crítico. Somam-se os bônus de equipamentos, conjuntos, passivas e da habilidade. O multiplicador básico é 2; o excesso de chance acima de 100% aumenta o dano crítico, preservando a regra anterior. Ataques múltiplos rolam por impacto. O acampamento mostra a chance geral, sem o bônus exclusivo de uma habilidade.', '',
      'Cada classe tem sua fórmula própria. Custos, dano, cura e escudo são expressões matemáticas; condições de combate aparecem em linguagem natural. Não há colunas com resultados numéricos de uma build de exemplo.', '',
      'Legenda: D = dano calculado pela habilidade; C = custo em mana (MP); L = nível do herói; A = ataque ativo; P = poder de habilidade ativo; H = vida máxima do herói; M = mana máxima do herói; m = mana atual do herói antes do custo; h = vida atual do inimigo; E = vida máxima do inimigo; mₑ = mana atual do inimigo; Q = cargas arcanas; Z = escudo atual do herói; X = dano acumulado que Escudo de Fé impediu; V = vida efetivamente retirada do inimigo; Vᵣ = dano recebido pelo herói após suas defesas; Dₑ = dano do golpe após as defesas; r = sorteio inteiro de 0 a 5; T = dano periódico total antes do rateio.', '',
      'W = piso(0,5L). F = dano fixo adicional de Transbordando; S = acréscimo de custo de Transbordando. Para Arcanista e Corrompido: F = piso(0,25M) e S = piso(0,11M). Para Arquimago: F = piso(0,4M) e S = piso(0,2M). Sem a passiva desbloqueada, F = S = 0.', '',
      'Como ler: 0,06H significa 6% da vida máxima; 0,8A significa 80% do ataque. Exemplo: na linha do Espadachim, Investida tem D = 20 + 0,06H + 0,8A + 0,8P e C = 50 + W. As variações de classe já estão resolvidas em cada tabela. Piso significa arredondar para baixo. Nas somas, cada parcela fracionária é arredondada separadamente, exceto quando piso envolve a soma inteira. O custo final do Mago é limitado à sua mana máxima. As fórmulas representam a base: buffs, crítico, conjuntos, mitigação e demais efeitos descritos podem modificar o resultado.', '',
      'Condições gerais: esquiva impede novos efeitos ligados ao golpe evitado, mas não remove DOTs já ativos. Queimaduras, venenos e sangramentos acumulam com dano e prazo próprios. Canhão de Vidro conta duas ações de dano, não dois projéteis ou turnos; seu primeiro golpe recebido é um contador separado. Nevasca aplica seis turnos completos de resfriamento; aplicar resfriamento ativa Gelo Queima. Custos do Mago mantêm o teto de mana máxima. Investida e Você Irá Me Parar? podem romper perda de turno; Cortes Ultrassônicos exige uma ação de intervalo após terminar.', '',
      'Revisão de 05/11/2026: Recuperar Fôlego remove uma aplicação de dano periódico desde Cavaleiro; Ira sacrifica 50% de H; Sniper tem 60% de crítico base e Ponto Fraco usa 20% de h; Bola de Fogo do Incendiário usa 3% de h; Incorporar Demônio concede +160% de dano. Demais fórmulas preservadas.', '',
      'Revisão de 04/11/2026: Mago e subclasses rebalanceados; Canhão de Vidro usa dois contadores de eventos, resfriamento ativa Gelo Queima e rastreio usa (50 + 4 × nível²) × raridade. Detalhes: docs/balanceamento/mago_2026-11-04.md.', '',
      'Para regenerar: `node scripts/generate-skill-reference.cjs`. Dados completos: [skills-reference.json](qa/2026-10-28/skills-reference.json).', '',
      'Revisão de 03/11/2026: fórmulas e custos do Guerreiro e subclasses rebalanceados; esquiva bloqueia novos efeitos hostis; sangramentos acumulam com duração própria; Investida e Você Irá Me Parar? rompem perda de turno; Cortes Ultrassônicos exige intervalo após expirar. Arqueiro e subclasses também rebalanceados; rastreio passa a seis minutos com custo quadrático por nível e raridade. Análise atual: docs/analise_guerreiro_arqueiro_inimigos_2026-11-04.md.', ''
    ];
    for(const form of forms){
      form.basic.formula = form.className==='Mago' ? `N = piso(3 + 0,1L) mísseis; C = 3N; cada míssil entre 5 + 0,2A e 7 + 0,4A${form.tier30==='elementalista'?' + 0,09P em cada limite':''}; F é dividido entre os N projéteis` : form.className==='Adepto da Natureza' ? 'Dano básico = A + r; durante Forma Verdadeira, D = 1,7A + r' : 'Dano básico = A + r';
      for(const skill of form.active)skill.mathematicalFormula=readableFormula(form,skill);
      for(const skill of form.passive)skill.mathematicalFormula=readableFormula.passive(form,skill);
      lines.push(`## ${form.name}`, '', `Classe: **${form.className}**. Rota: ${form.tier30 || 'base'}${form.tier60 ? ' → ' + form.tier60 : ''}.`, '', `**${clean(form.basic.name)} — fórmula:** ${form.basic.formula}.`, '',
        '| Ativa | Desbloqueio | Fórmula geral de custo e efeito | Duração | Condições |', '| --- | ---: | --- | --- | --- |');
      for(const skill of form.active) lines.push(`| ${clean(skill.name)} | ${skill.level} | ${clean(skill.mathematicalFormula)} | ${clean(duration(skill))} | ${clean(conditions(form,skill))} |`);
      lines.push('', '| Passiva | Desbloqueio | Fórmula / regra geral |', '| --- | ---: | --- |');
      for(const skill of form.passive) lines.push(`| ${clean(skill.name)} | ${skill.level} | ${clean(skill.mathematicalFormula)} |`);
      lines.push('');
    }
    reference.conditions = { mode:'symbolic', heroLevel:'L (variável)', unlockLevelsOnly:true };
    reference.forms=forms.map(form=>({id:form.id,name:form.name,className:form.className,tier30:form.tier30,tier60:form.tier60,basic:{name:form.basic.name,formula:form.basic.formula},active:form.active.map(skill=>({name:skill.name,type:skill.type,unlockLevel:skill.level,formula:skill.mathematicalFormula,conditions:conditions(form,skill)})),passive:form.passive.map(skill=>({name:skill.name,type:skill.type,unlockLevel:skill.level,formula:skill.mathematicalFormula}))}));
    fs.writeFileSync(path.join(root, 'docs/qa/2026-10-28/skills-reference.json'), JSON.stringify(reference, null, 2) + '\n');
    fs.writeFileSync(path.join(root, 'docs/referencia_habilidades_atual.md'), lines.join('\n') + '\n');
    console.log(JSON.stringify(reference.counts));
  } finally {
    if(browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

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
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
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
    const duration = skill => Object.entries(skill).filter(([key, value]) => /turns|duration/i.test(key) && typeof value === 'number').map(([key, value]) => `${key}: ${value}`).join('; ') || 'Ver efeito';
    const lines = [
      '# Referência atual de habilidades', '',
      'Catálogo gerado a partir do código executável atual em 28/10/2026. Não utiliza o documento antigo de balanceamento.', '',
      `São ${forms.length} formas de classe/subclasse e ${activeIds.size} nomes distintos de habilidades ativas. Habilidades herdadas aparecem em cada rota em que estão disponíveis.`, '',
      'Os exemplos usam distribuição equilibrada dos pontos, sem equipamentos, níveis 20/50/100 conforme o estágio da árvore, vida e mana cheias, zero Cargas Arcanas, zero Cadência e alvo com 20.000 de vida máxima. As passivas iniciais de combate permanecem ativas. Valores dependentes de vida, mana, ataque, alvo e estado são fotografias desse contexto; não são coeficientes fixos nem uma avaliação de balanceamento.', '',
      'Custos e descrições vêm de `getSkillInfo()` e `useSkillCost()`; passivas vêm de `getUnlockedPassiveSkills()` e `getPassiveStatusDescription()`. O JSON contém também os campos numéricos dos descritores e os modificadores passivos. A aplicação final ocorre em `applySkillLocally()`, no ataque básico e nos resolvedores de combate: buffs globais, crítico, mitigação e efeitos de equipamentos podem alterar o resultado. A coluna de duração reproduz os campos retornados pelo código; detalhes condicionais estão no texto.', '',
      'Para regenerar: `node scripts/generate-skill-reference.cjs`. Dados completos: [skills-reference.json](qa/2026-10-28/skills-reference.json).', '',
      'Correções verificadas nesta revisão: bônus global aplicado uma vez; bônus fixo de Transbordando aplicado uma vez por ação de mísseis; crítico do Sniper sem duplicação; Escudo de Fé com três respostas inimigas; Cortes Ultrassônicos com três ataques básicos; imunidade a controle de Você Irá Me Parar?; Corrupção bloqueando escudos ativos e a conversão passiva de Transbordando. Os coeficientes de definição das classes, subclasses, pontos e `getSkillInfo()` foram comparados com o HEAD anterior e preservados.', ''
    ];
    for(const form of forms){
      lines.push(`## ${form.name} — nível ${form.level}`, '', `Classe: **${form.className}**. Rota: ${form.tier30 || 'base'}${form.tier60 ? ' → ' + form.tier60 : ''}. Vida máxima: ${form.stats.maxHp}; mana máxima: ${form.stats.maxMp}; ataque: ${form.stats.attack}.`, '', `**${clean(form.basic.name)}:** ${clean(form.basic.description)}`, '',
        '| Ativa | Desbloqueio | Custo em MP neste contexto | Duração nos campos | Efeito atual |', '| --- | ---: | ---: | --- | --- |');
      for(const skill of form.active) lines.push(`| ${clean(skill.name)} | ${skill.level} | ${skill.effectiveCost}${skill.hpCostPercent ? ` + ${Math.round(skill.hpCostPercent * 100)}% da vida máxima` : ''} | ${clean(duration(skill))} | ${clean(skill.description)} |`);
      lines.push('', '| Passiva | Desbloqueio | Efeito atual |', '| --- | ---: | --- |');
      for(const skill of form.passive) lines.push(`| ${clean(skill.name)} | ${skill.level} | ${clean(skill.description)} |`);
      lines.push('');
    }
    fs.writeFileSync(path.join(root, 'docs/qa/2026-10-28/skills-reference.json'), JSON.stringify(reference, null, 2) + '\n');
    fs.writeFileSync(path.join(root, 'docs/referencia_habilidades_atual.md'), lines.join('\n') + '\n');
    console.log(JSON.stringify(reference.counts));
  } finally {
    if(browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

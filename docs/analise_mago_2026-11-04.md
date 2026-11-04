# Análise acelerada do Mago — 04/11/2026

Usa as fórmulas de `balanceamento/mago_2026-11-04.md`, os inimigos revistos de 04/11 e os equipamentos atuais. Não é comparável diretamente aos resultados de Guerreiro/Arqueiro de 03/11, que enfrentaram a versão anterior dos inimigos.

## Método

12 campanhas: quatro rotas e sementes 101, 202 e 303. Início como Mago nível 1; subclasses nos níveis normais e pontos equilibrados. Combate, inimigos, XP, recompensas e drops usam as funções nativas. A política estima dano por ação e utiliza Escudo de Mana, Concentração, Nevasca e Incorporar Demônio conforme vida, mana e estado. Não consulta os futuros valores do RNG.

Preparação acelerada: vida e mana completas entre lutas. Cada derrota concede um nível, até 100; uma segunda falha consecutiva também concede melhoria na peça de menor raridade. Ao nível 100, melhora uma peça por derrota até completar seis lendários. Fugas forçadas por Assombrar contam separadamente e acionam a mesma preparação, sem serem registradas como mortes. O alvo é repetido após falha. Craft inicial só usa moedas/drops obtidos; melhorias concedidas depois não cobram materiais. Os itens iniciais são mantidos ao melhorar, com acessório Colar de Raízes da Floresta. Não mede tempo de farm nem viabilidade econômica das receitas.

Em luta prolongada sem progresso, a política tenta pressão ofensiva; após 100 ações sem reduzir a vida mínima do alvo, passa turnos para deixar a luta resolver, sem editar artificialmente a vida ou registrar uma morte fictícia. Nenhuma run encerra por esse motivo. Vitória encerra ao derrotar o Soberano. Desistência exige 11 mortes ocorridas já no nível 100, com seis equipamentos lendários.

## Resultados

| Rota | Semente | Resultado | Nível | Mortes totais | Fugas forçadas | Combates | Mortes no nível 100 com seis lendários |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: |
| Mago Incendiário | 101 | Vitória | 94 | 64 | 6 | 333 | 0 |
| Mago Incendiário | 202 | Vitória | 94 | 67 | 2 | 317 | 0 |
| Mago Incendiário | 303 | Vitória | 86 | 65 | 0 | 287 | 0 |
| Mago Frígido | 101 | Desistência no Soberano | 100 | 82 | 6 | 348 | 11 |
| Mago Frígido | 202 | Desistência no Soberano | 100 | 83 | 2 | 361 | 11 |
| Mago Frígido | 303 | Vitória | 100 | 81 | 0 | 325 | 1 |
| Arquimago | 101 | Desistência no Soberano | 100 | 75 | 6 | 367 | 11 |
| Arquimago | 202 | Desistência no Soberano | 100 | 82 | 2 | 362 | 11 |
| Arquimago | 303 | Desistência no Soberano | 100 | 90 | 0 | 302 | 11 |
| Corrompido | 101 | Vitória | 85 | 49 | 6 | 344 | 0 |
| Corrompido | 202 | Vitória | 87 | 56 | 2 | 340 | 0 |
| Corrompido | 303 | Vitória | 83 | 64 | 0 | 255 | 0 |

Foram 3941 combates, 7 vitórias e 5 desistências. Todas as rotas chegaram ao Paradoxo. Todas as desistências cumpriram o critério de preparação máxima.

O Incendiário venceu nas três sementes, entre os níveis 86 e 94. O Corrompido venceu nas três, entre os níveis 83 e 87. O Frígido venceu uma de três, sempre chegando ao nível 100. O Arquimago não venceu o Soberano nessas três amostras, mesmo com nível 100 e seis lendários.

Esses resultados dependem da política, das sementes e da escolha de equipamentos. Os dados não demonstram impossibilidade de vitória com outra build ou estratégia. Não incluem busca exaustiva por conjuntos ou acessórios de outras regiões.

## Dados e reprodução

- `node scripts/run-mage-progression.cjs`
- Motor: `scripts/mage-progression-engine.js`
- Dados brutos por luta, chefe, equipamento, preparação e habilidades utilizadas: `docs/qa/mage-progression/results.json`
- O runner verifica distribuição equilibrada e condição válida de encerramento em todas as campanhas.

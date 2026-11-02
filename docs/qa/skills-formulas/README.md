# Catálogo e incentivos das habilidades

Fontes de saída: `docs/habilidades_classes_subclasses.md` (somente habilidades, efeitos e fórmulas por forma) e `docs/analise_incentivos_habilidades.md` (diagnóstico e propostas).

Em 02/11/2026, Explodir foi corrigido e os pontos passaram a ser reavaliados pelo nível atual. O catálogo e os JSONs sem sufixo refletem o código atual. Os arquivos `*-20261030.json` preservam os dados originais do relatório de incentivos, agora explicitamente histórico; seus números não descrevem o novo scaling. Regenerar evidências não reescreve a análise estática automaticamente.

Da raiz, com Node, Python, Edge e Playwright do projeto:

```powershell
node docs/qa/skills-formulas/audit.cjs
node docs/qa/skills-formulas/windows.cjs
python docs/qa/skills-formulas/verify.py
```

O audit sempre recalcula, em contexto descartável e sem saves reais: 28 formas, quatro builds, níveis legais 1–100, alvo sem MP/escudo e com HP/armadura do chefe correspondente; 16 sementes por habilidade/estado e dez sondagens condicionais. A matriz compara valores de uma ação e DOT potencial, não vitórias. Sem apresentação ou animações; as rotinas de execução são as de produção.

As janelas usam os turnos nativos, com ataque inimigo zerado, HP inimigo de um milhão e sem armadura. Medem a oportunidade ofensiva de preparar antes de atacar; não estimam sobrevivência. Os custos de HP e a falta de mana continuam valendo. Resultados de percentual de HP nesse alvo não são medidas de dano contra um chefe real.

`catalog.py` tem expressões legíveis por tipo e variante. Verifica seus custos e danos calculados contra os metadados nativos, incluindo fórmulas herdadas; não substitui as regras de combate. A análise de efeitos condicionais também usa as rotinas de aplicação e o código, pois um valor no tooltip não garante que o golpe seja executado.

`verify.py` recusa hashes de produção alterados, confirma cobertura, números finitos, fórmulas do catálogo e sondagens críticas. Após mudanças nas fórmulas, regenere os dois JSONs e revise as propostas e valores do relatório; não interprete o texto estático como atualizado automaticamente.

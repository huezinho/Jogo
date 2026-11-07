# Validação da jornada da dungeon

## Regras e combate

`node scripts/test-dungeon-journey.cjs` verifica a estrutura nova, carteiras individuais, inventário inicial, consentimento nas trocas, reservas, venda/aprimoramento, apostas, habilidades e provocação. O relatório estruturado está em [dungeon-journey-validation.json](dungeon-journey-validation.json).

- 1.864 verificações, abrangendo 28 classes/subclasses e 129 lançamentos de habilidade.
- Caídos voltam com 20% da vida máxima após a vitória, inclusive quando o XP aumenta o nível; a mana anterior é preservada.
- Usar poção consome turno e reduz a duração de buffs existentes; descanso e serviços são bloqueados durante a caverna.
- As sete prioridades de provocação; aplicações mais fracas não substituem as mais fortes; caídos são ignorados; duração individual de três ações por inimigo.
- Mil sementes de aposta: 502 vitórias e 498 derrotas no teste registrado.
- Jornadas com um, dois e três integrantes: 12 regiões, 84 batalhas e 12 chefes em cada roteiro.
- Níveis antes dos chefes: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110 e 120.

O teste de XP registra vitórias para percorrer o roteiro e medir os ganhos. Não é uma prova de vitória real com todas as composições. Os lançamentos de habilidade verificam o núcleo de combate separadamente.

## Interface e rede

`node scripts/qa-dungeon-journey-ui.cjs`: seleção real de poção e alvo; saguão, ferreiro, acampamento, combate, apostador, alquimista, vendedor e pausa da caverna; 320, 390 e 1366 px; ausência dos comandos Defender/Provocar e das faixas acima do combate; retomada e armazenamento independente. [Resultado](dungeon-journey-ui.json).

`node scripts/test-dungeon-journey-network.cjs`: três navegadores isolados com PeerJS/WebRTC real; saldos 40/40/40, reserva e aceite de dez moedas, saldos finais 30/50/40; todos presentes/prontos; combate com três inimigos e resolução por cada proprietário; igualdade dos snapshots. [Resultado](dungeon-journey-network.json).

`node scripts/qa-dungeon-base-ui.cjs`: 25 verificações da nova base, incluindo mapa na esquerda e recursos na direita, bolsa/moedas na ordem da campanha, remoção do cabeçalho, clique em companheiro, perfil, oferta de item e moedas pela bolsa, reserva até aceite, cancelamento com devolução, mochila fixa, equipamento por slot, aprimoramento, venda, descanso, compras e aposta. Layout em 320, 390, 768 e 1366 px; navegação pelo desenho do mapa também conferida em 320 px. [Resultado](dungeon-base-ui.json).

O teste em rede também executa a troca pela interface: o anfitrião clica no convidado presente, abre **Trocar**, seleciona a poção na bolsa e oferece dez moedas. Antes do aceite, os inventários continuam com 4/4/4 itens; depois de o convidado clicar em **Oferta recebida → Aceitar**, ficam com 3/5/4. As carteiras ficam em 30/50/40.

## Imagens

- [Combate](../hud/dungeon-journey-battle-1366.png)
- [Saguão](../hud/dungeon-journey-hall-1366.png)
- [Ferreiro](../hud/dungeon-journey-forge-1366.png)
- [Acampamento no celular](../hud/dungeon-journey-camp-390.png)
- [Apostador](../hud/dungeon-journey-gambler-1366.png)

O apostador usa [arte original gerada para o projeto](../hud/dungeon-gambler-v1.json); molduras, fontes, cenários de serviços e ícones reutilizam o catálogo da campanha.

Capturas da base refeita: [saguão](../hud/dungeon-base-hall-1366.png), [acampamento](../hud/dungeon-base-camp-1366.png), [ferreiro com peça](../hud/dungeon-base-forge-equipped-1366.png), [troca pela bolsa](../hud/dungeon-base-trade-1366.png) e [bolsa no celular](../hud/dungeon-base-bag-320.png).

## Fluxo completo

A jornada parte da seleção de personagem, passa pelo saguão e resolve ações locais ou intenções enviadas ao anfitrião; o estado validado volta aos participantes e é salvo separadamente da campanha.

| Etapa | Evidência |
|---|---|
| Interface → ação | Seleção real de poção e aliado, prontidão e início da caçada no teste de interface. |
| Cliente → anfitrião | Três contextos de navegador conectados por WebRTC; cada proprietário executou seu turno. |
| Regra → estado | Carteiras individuais, reserva/aceite de troca e 1.864 verificações do motor. |
| Estado → clientes | Snapshots iguais nos três participantes, sem erros de página. |
| Salvamento → retomada | Jornada retomada pelo mesmo identificador; chave sentinela da campanha preservada. |

O jogo é estático e o anfitrião resolve as regras no navegador; não há API de aplicação ou banco de dados remoto neste fluxo. Os testes foram locais e não representam publicação no GitHub Pages.

## Revisão de tela e turnos

[Regras e evidências atuais da revisão v5](ajustes_combate_interface_v5.md): 53 verificações da janela e comandos, 21 de resolução e animação; locais à esquerda, venda pela bolsa, pausa no campo após a vitória e botão de porta com salvamento.

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

folder=Path(__file__).parent
regular='C:/Windows/Fonts/segoeui.ttf'
semibold='C:/Windows/Fonts/seguisb.ttf'
titlefont=ImageFont.truetype(semibold,38)
labelfont=ImageFont.truetype(semibold,25)
smallfont=ImageFont.truetype(regular,23)
screens=[('combate','COMBATE'),('equipamentos','PERSONAGEM E EQUIPAMENTOS'),('oficina','OFICINA · FABRICAR E APRIMORAR'),('mercenario','MERCENÁRIO · RECOMPENSA FIXA')]
for prefix,title,subtitle in [('palco','PALCO TÁTICO','Navegação no topo · cena em destaque · comandos abaixo do combate'),('painel','PAINEL DE EXPEDIÇÃO','Navegação lateral · comandos à direita · serviços em colunas')]:
    images=[Image.open(folder/f'{prefix}-{name}-1366.png').convert('RGB') for name,_ in screens]
    cellwidth=1334
    rowheights=[max(image.height for image in images[:2]),max(image.height for image in images[2:])]
    gutter=32
    heading=132
    label=52
    width=cellwidth*2+gutter*3
    height=heading+sum(rowheights)+2*(label+gutter)+42
    canvas=Image.new('RGB',(width,height),'#18252a')
    draw=ImageDraw.Draw(canvas)
    draw.text((gutter,22),title,font=titlefont,fill='#e5c281')
    draw.text((gutter,76),subtitle,font=smallfont,fill='#d1dbdc')
    for index,((name,caption),image) in enumerate(zip(screens,images)):
        x=gutter+(index%2)*(cellwidth+gutter)
        y=heading+(0 if index<2 else rowheights[0]+label+gutter)
        cellheight=rowheights[index//2]
        draw.text((x,y),caption,font=labelfont,fill='#f4f0e5')
        draw.rounded_rectangle((x,y+label,x+cellwidth,y+label+cellheight),radius=10,fill='#0d171a')
        canvas.paste(image,(x,y+label))
    draw.text((gutter,height-43),'Conceito visual com a arte do jogo · valores, estoques e recompensas ilustrativos',font=smallfont,fill='#b7c3c4')
    destination=folder/f'exemplos-{prefix}.png'
    canvas.save(destination,optimize=True)
    print(destination.name,canvas.size)

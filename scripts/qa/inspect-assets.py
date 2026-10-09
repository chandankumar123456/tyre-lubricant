from pathlib import Path
from PIL import Image, ImageDraw
files=sorted(Path('GPT Image').glob('*.png'))+sorted(Path('Nano Banana Image').glob('*.jpeg'))
sheet=Image.new('RGB',(1200,((len(files)+3)//4)*190),'#e8e8e8')
d=ImageDraw.Draw(sheet)
for i,f in enumerate(files):
 im=Image.open(f);im.thumbnail((292,163));x=(i%4)*300;y=(i//4)*190
 sheet.paste(im,(x,y));d.text((x+5,y+165),str(f),fill='black')
sheet.save('docs/reference-contact-sheet.jpg')

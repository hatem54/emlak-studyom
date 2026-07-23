import re
import time

with open('app.html', 'r', encoding='utf-8') as f:
    text = f.read()

v = str(int(time.time()))
text = re.sub(r'src="js/main\.js(\?v=\d+)?"', f'src="js/main.js?v={v}"', text)
text = re.sub(r'src="core/drag\.js(\?v=\d+)?"', f'src="core/drag.js?v={v}"', text)
text = re.sub(r'src="modules/draw\.js(\?v=\d+)?"', f'src="modules/draw.js?v={v}"', text)

with open('app.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('Cache busters added to app.html')

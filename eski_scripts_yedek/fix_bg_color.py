import os

file = r'C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\modules\photo.js'
with open(file, 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("photoLayer.style.backgroundColor='transparent';", "photoLayer.style.backgroundColor='#12122a';")
code = code.replace("photoLayer.style.backgroundColor='#ffffff';", "photoLayer.style.backgroundColor='#12122a';")

# As per the issue: we don't want other photo panels turning transparent/white either
# but maybe it's fine. Wait, let's fix the specific one:
code = code.replace("p.style.backgroundColor='transparent';", "p.style.backgroundColor='#12122a';")
code = code.replace("p.style.backgroundColor='#ffffff';", "p.style.backgroundColor='#12122a';")

with open(file, 'w', encoding='utf-8') as f:
    f.write(code)
print('Fixed photo background color in photo.js to #12122a')

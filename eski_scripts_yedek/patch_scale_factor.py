import os
import re

core_file = r'C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\core.js'
draw_file = r'C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\modules\draw.js'

with open(core_file, 'r', encoding='utf-8') as f:
    core_code = f.read()

core_code = core_code.replace('(window.scaleFactor || 1)', '(typeof scaleFactor !== "undefined" ? scaleFactor : 1)')

with open(core_file, 'w', encoding='utf-8') as f:
    f.write(core_code)
print('Patched scaleFactor in core.js')

with open(draw_file, 'r', encoding='utf-8') as f:
    draw_code = f.read()

draw_code = draw_code.replace('(window.scaleFactor || 1)', '(typeof scaleFactor !== "undefined" ? scaleFactor : 1)')
# Also fix any other usages in draw.js where window.scaleFactor is used directly
draw_code = draw_code.replace('window.scaleFactor', '(typeof scaleFactor !== "undefined" ? scaleFactor : 1)')

with open(draw_file, 'w', encoding='utf-8') as f:
    f.write(draw_code)
print('Patched scaleFactor in modules/draw.js')

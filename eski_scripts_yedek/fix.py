
import os
with open('js/main.js', 'r', encoding='utf-8') as f:
    code = f.read()

target = '''document.addEventListener('mousedown', function(e){
    var el = _getZoomTarget(e.target);
    if(!el) return;
    if(e.button !== 0) return;'''

rep = '''window.spaceBarPressed = false;
window.addEventListener('keydown', e => { 
    if (e.code === 'Space') { 
        window.spaceBarPressed = true; 
        if(document.activeElement && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') e.preventDefault(); 
    } 
});
window.addEventListener('keyup', e => { 
    if (e.code === 'Space') window.spaceBarPressed = false; 
});

document.addEventListener('mousedown', function(e){
    var el = _getZoomTarget(e.target);
    if(!el) return;
    
    if(e.button === 0 && !window.spaceBarPressed) return;
    if(e.button !== 0 && e.button !== 1) return;'''

if target in code:
    code = code.replace(target, rep)
    with open('js/main.js', 'w', encoding='utf-8') as f:
        f.write(code)
    print('Patched successfully!')
else:
    print('Target not found')


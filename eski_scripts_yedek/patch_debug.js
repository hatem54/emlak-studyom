const fs = require('fs');
let code = fs.readFileSync('C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js', 'utf8');

const debugSnippet = `
    if(!document.getElementById('debug-points')){
        let d=document.createElement('div');
        d.id='debug-points';
        d.style.position='fixed';
        d.style.top='50px';
        d.style.right='10px';
        d.style.background='rgba(0,0,0,0.8)';
        d.style.color='white';
        d.style.zIndex='999999';
        d.style.padding='10px';
        d.style.maxHeight='500px';
        d.style.overflow='auto';
        d.style.pointerEvents='none';
        d.style.fontSize='12px';
        document.body.appendChild(d);
    }
    document.getElementById('debug-points').innerHTML = "DrawPaths: " + (window.drawPaths ? window.drawPaths.length : 0) + "<br>" + points.map(pt => pt.type + ': ' + pt.x.toFixed(1) + ',' + pt.y.toFixed(1)).join('<br>');
    let minPointDist = pointSnapThreshold;
`;

code = code.replace(/let minPointDist = pointSnapThreshold;/g, debugSnippet);
fs.writeFileSync('C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js', code);
console.log('Added debug points logic');

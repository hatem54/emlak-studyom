const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /allEls\.forEach\(el => \{[\s\S]*?const currObj = window\.getCurrentPhotoState \? window/g;

const replacement = `allEls.forEach(el => {
        if (el === excludeEl || el.dataset.locked === 'true' || el.style.display === 'none') return;
        let left = parseFloat(el.style.left);
        let top = parseFloat(el.style.top);
        let w = el.offsetWidth;
        let h = el.offsetHeight;
        if (!isNaN(left) && !isNaN(top) && w > 0 && h > 0) {
            points.push({x: left + w/2, y: top + h/2, type: 'obj-center'});
            
            let svg = el.querySelector('svg');
            let isVector = false;
            if (svg) {
                let line = svg.querySelector('line');
                if (line) {
                    isVector = true;
                    let x1 = parseFloat(line.getAttribute('x1'));
                    let y1 = parseFloat(line.getAttribute('y1'));
                    let x2 = parseFloat(line.getAttribute('x2'));
                    let y2 = parseFloat(line.getAttribute('y2'));
                    if(!isNaN(x1) && !isNaN(y1)) points.push({x: left + x1, y: top + y1, type: 'line-end'});
                    if(!isNaN(x2) && !isNaN(y2)) points.push({x: left + x2, y: top + y2, type: 'line-end'});
                }
                let polyline = svg.querySelector('polyline');
                if (polyline) {
                    isVector = true;
                    let ptsStr = polyline.getAttribute('points');
                    if (ptsStr) {
                        let pts = ptsStr.split(' ').map(p => {
                            let coords = p.split(',');
                            return {x: parseFloat(coords[0]), y: parseFloat(coords[1])};
                        }).filter(p => !isNaN(p.x) && !isNaN(p.y));
                        if (pts.length > 0) {
                            points.push({x: left + pts[0].x, y: top + pts[0].y, type: 'path-end'});
                            points.push({x: left + pts[pts.length-1].x, y: top + pts[pts.length-1].y, type: 'path-end'});
                            if (el.dataset.polygonPoints) {
                                pts.forEach(pt => points.push({x: left + pt.x, y: top + pt.y, type: 'polygon-vertex'}));
                            }
                        }
                    }
                }
            }

            if (isDrawingMode && !isVector) {
                // When drawing, allow snapping to corners of non-vector objects (rects, text, images)
                points.push({x: left, y: top, type: 'obj-corner'});
                points.push({x: left + w, y: top, type: 'obj-corner'});
                points.push({x: left, y: top + h, type: 'obj-corner'});
                points.push({x: left + w, y: top + h, type: 'obj-corner'});
                // And edge midpoints
                points.push({x: left + w/2, y: top, type: 'obj-edge'});
                points.push({x: left + w/2, y: top + h, type: 'obj-edge'});
                points.push({x: left, y: top + h/2, type: 'obj-edge'});
                points.push({x: left + w, y: top + h/2, type: 'obj-edge'});
            }

            if (!isDrawingMode) {
                // Sadece obje ortalarina ve kenarlarina cizgi cek (karmasikligi onlemek icin köselere nokta atama)
                vLines.push(left, left + w / 2, left + w);
                hLines.push(top, top + h / 2, top + h);
            }
        }
    });

    const currObj = window.getCurrentPhotoState ? window`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
    console.log('Patched successfully.');
} else {
    console.log('Regex did not match.');
}

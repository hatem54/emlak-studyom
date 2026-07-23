const fs = require('fs');
const file = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core/drag.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                    if (selEl.classList.contains('editable-draw')) {
                        selEl.dataset.baseLeft = parseFloat(selEl.style.left);
                        selEl.dataset.baseTop = parseFloat(selEl.style.top);
                        
                        if (typeof drawPaths !== 'undefined' && currentRef) {
                            const pathObj = drawPaths.find(p => p.el === selEl);
                            if (pathObj) {
                                pathObj.photoRef = currentRef;
                                photoRefUpdated = true;
                            }
                        }
                    }`;

const newStr = `                    if (selEl.classList.contains('editable-draw')) {
                        selEl.dataset.baseLeft = parseFloat(selEl.style.left);
                        selEl.dataset.baseTop = parseFloat(selEl.style.top);
                        
                        if (typeof drawPaths !== 'undefined') {
                            const pathObj = drawPaths.find(p => p.el === selEl);
                            if (pathObj) {
                                if (currentRef) pathObj.photoRef = currentRef;
                                photoRefUpdated = true;
                                
                                // UPDATE ABSOLUTE POINTS TO KEEP CANVAS IN SYNC!
                                const dx = parseFloat(selEl.style.left) - il;
                                const dy = parseFloat(selEl.style.top) - it;
                                if (pathObj.type === 'free' || pathObj.type === 'polygon') {
                                    if(pathObj.points) {
                                        pathObj.points.forEach(pt => {
                                            pt.x += dx;
                                            pt.y += dy;
                                        });
                                    }
                                } else if (pathObj.type === 'rect' || pathObj.type === 'line' || pathObj.type === 'circle' || pathObj.type === 'arrow') {
                                    pathObj.x1 += dx;
                                    pathObj.y1 += dy;
                                    pathObj.x2 += dx;
                                    pathObj.y2 += dy;
                                }
                            }
                        }
                    }`;

content = content.replace(targetStr, newStr);
fs.writeFileSync(file, content);

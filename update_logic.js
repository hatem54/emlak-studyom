const fs = require('fs');
let content = fs.readFileSync('modules/export.js', 'utf8');

const oldLogic =                     const p = panels[i];
                    const bg = p.style.backgroundImage;
                    if (bg && bg !== 'none' && bg !== '') {;

const newLogic =                     let p = panels[i];
                    const innerZoom = p.querySelector('.photo-inner-zoom');
                    if (innerZoom && innerZoom.style.backgroundImage && innerZoom.style.backgroundImage !== 'none') {
                        p = innerZoom;
                    }
                    const bg = p.style.backgroundImage;
                    if (bg && bg !== 'none' && bg !== '') {;

content = content.split(oldLogic).join(newLogic);

fs.writeFileSync('modules/export.js', content, 'utf8');
console.log('Update successful');

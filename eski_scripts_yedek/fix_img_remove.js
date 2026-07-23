const fs = require('fs');
let mainJs = fs.readFileSync('main.js', 'utf8');

// 1. Update imageInput change handler
mainJs = mainJs.replace(
    /photoLayer\.style\.backgroundImage=`url\('\$\{ev\.target\.result\}'\)`;/g,
    "photoLayer.style.backgroundImage=`url('${ev.target.result}')`;\n                      const iz = photoLayer.querySelector('.photo-inner-zoom');\n                      if(iz){ photoLayer.removeChild(iz); photoLayer.dataset.zpReady='0'; }"
);

// 2. Update removeBackgroundImage
mainJs = mainJs.replace(
    /photoLayer\.style\.backgroundImage = 'none';/g,
    "photoLayer.style.backgroundImage = 'none';\n        const iz = photoLayer.querySelector('.photo-inner-zoom');\n        if(iz){ photoLayer.removeChild(iz); photoLayer.dataset.zpReady='0'; }"
);

fs.writeFileSync('main.js', mainJs, 'utf8');
console.log('Successfully updated main.js to handle .photo-inner-zoom');

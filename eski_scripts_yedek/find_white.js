const fs = require('fs');
const d = 'C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0';
function walk(dir){
    for(let f of fs.readdirSync(dir)){
        let p = dir+'/'+f;
        if(fs.statSync(p).isDirectory()) {
            walk(p);
        } else if(p.endsWith('.js')){
            let c = fs.readFileSync(p, 'utf8');
            if(c.match(/\.style\.backgroundColor\s*=\s*['"]#(fff|ffffff)['"]/i)) {
                console.log("Found in: " + p);
            }
        }
    }
}
walk(d);

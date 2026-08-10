$head = @"
// Katmanlar (Layers) Modülü
// Ekranda bulunan öğeleri yönetmek, sıralamak ve seçmek için kullanılır

window.layerToggleVisibility = function(uid, isDrawPath = false, pathIndex = 0) {
    if (isDrawPath) {
        if (typeof drawPaths !== 'undefined') {
            let paths = drawPaths;
            if (paths[pathIndex]) {
                paths[pathIndex].hidden = !paths[pathIndex].hidden;
                if (paths[pathIndex].el) {
                    paths[pathIndex].el.style.display = paths[pathIndex].hidden ? 'none' : '';
                }
                if (window.forceRedrawAll) window.forceRedrawAll();
                window.renderLayers();
            }
        }
        return;
    }
    
    if (uid === 'canva-render-layer') {
        const el = document.getElementById(uid);
        if (!el) return;
"@
$content = Get-Content modules\layers.js -Raw
$content = $head + "`n" + $content
Set-Content modules\layers.js $content
node -c modules\layers.js

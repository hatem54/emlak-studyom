import os

draw_file = r'C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\modules\draw.js'

with open(draw_file, 'r', encoding='utf-8') as f:
    draw_code = f.read()

# Fix polygon double-click extra point issue
target = """
        const now = Date.now();
        if (now - lastClickTime < 300) {
            if (drawMode === 'polygon' && polygonBuilding) {
                closePolygon();
                return;
            }
        }
        lastClickTime = now;
"""

replacement = """
        const now = Date.now();
        if (now - lastClickTime < 300) {
            if (drawMode === 'polygon' && polygonBuilding) {
                // If the user double clicked, the first click added a point.
                // We should remove that point before closing, so they don't get an unwanted extra vertex.
                if (polygonPoints.length > 0) {
                    polygonPoints.pop();
                }
                closePolygon();
                return;
            }
        }
        lastClickTime = now;
"""

if target in draw_code:
    draw_code = draw_code.replace(target, replacement)
    print("Patched double-click in draw.js")
else:
    print("Could not find target for double-click patch")

with open(draw_file, 'w', encoding='utf-8') as f:
    f.write(draw_code)

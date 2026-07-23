const fs = require('fs');

const replacement = `
// RECENT & FAVORITE FONTS LOGIC
let favFonts = [];
let recentFonts = [];

function loadFontPreferences() {
    try {
        favFonts = JSON.parse(localStorage.getItem('emlakstudiom_fav_fonts')) || [];
        recentFonts = JSON.parse(localStorage.getItem('emlakstudiom_recent_fonts')) || [];
    } catch(e) {
        favFonts = [];
        recentFonts = [];
    }
}

function saveFontPreferences() {
    localStorage.setItem('emlakstudiom_fav_fonts', JSON.stringify(favFonts));
    localStorage.setItem('emlakstudiom_recent_fonts', JSON.stringify(recentFonts));
}

function toggleFavFont(family, e) {
    if(e) e.stopPropagation();
    if(favFonts.includes(family)) {
        favFonts = favFonts.filter(f => f !== family);
    } else {
        favFonts.push(family);
    }
    saveFontPreferences();
    buildFontUI(); // re-render
}

function addRecentFont(family) {
    recentFonts = recentFonts.filter(f => f !== family);
    recentFonts.unshift(family);
    if(recentFonts.length > 5) recentFonts = recentFonts.slice(0, 5);
    saveFontPreferences();
    // We don't re-render immediately to avoid UI jumping while clicking
}

function buildFontUI(){
    const sel=$('fontQuickSelect'), grid=$('fontGrid');
    if(!sel || !grid) return;
    
    sel.innerHTML = '<option value="">-- Font Seçin --</option>';
    grid.innerHTML = '';
    
    loadFontPreferences();
    
    // Group fonts
    const grouped = {};
    FONTS.forEach(f => {
        if(!grouped[f.cat]) grouped[f.cat] = [];
        grouped[f.cat].push(f);
        
        const opt=document.createElement('option');
        opt.value=f.family;
        opt.textContent=f.name;
        sel.appendChild(opt);
    });

    // Helper to render a font item
    const renderFontItem = (f, container) => {
        const prev = document.createElement('div');
        prev.className = 'font-preview' + (f.family === currentFont ? ' active' : '');
        prev.style.fontFamily = f.family;
        prev.dataset.family = f.family;
        prev.style.position = 'relative';
        
        // Heart icon
        const isFav = favFonts.includes(f.family);
        const heart = document.createElement('i');
        heart.className = isFav ? 'fas fa-heart' : 'far fa-heart';
        heart.style.position = 'absolute';
        heart.style.right = '10px';
        heart.style.top = '50%';
        heart.style.transform = 'translateY(-50%)';
        heart.style.color = isFav ? '#ef4444' : '#64748b';
        heart.style.cursor = 'pointer';
        heart.onclick = (e) => toggleFavFont(f.family, e);
        
        const textSpan = document.createElement('span');
        textSpan.textContent = f.name.replace(/[^\x00-\x7F]/g, '').trim() + ' - Emlak 123';
        
        prev.appendChild(textSpan);
        prev.appendChild(heart);
        
        prev.onclick = () => {
            document.querySelectorAll('.font-preview').forEach(x => x.classList.remove('active'));
            prev.classList.add('active');
            sel.value = f.family;
            currentFont = f.family;
            addRecentFont(f.family);
            applyFontSettings();
        };
        container.appendChild(prev);
    };

    // 1. Render Favorites
    if(favFonts.length > 0) {
        const tit = document.createElement('div');
        tit.className = 'font-cat-title';
        tit.innerHTML = '<i class="fas fa-star" style="color:#fbbf24"></i> Favori Fontlar';
        grid.appendChild(tit);
        
        favFonts.forEach(fam => {
            const f = FONTS.find(x => x.family === fam);
            if(f) renderFontItem(f, grid);
        });
    }

    // 2. Render Recent
    if(recentFonts.length > 0) {
        const tit = document.createElement('div');
        tit.className = 'font-cat-title';
        tit.innerHTML = '<i class="fas fa-clock" style="color:#38bdf8"></i> Son Kullanılanlar';
        grid.appendChild(tit);
        
        recentFonts.forEach(fam => {
            const f = FONTS.find(x => x.family === fam);
            if(f) renderFontItem(f, grid);
        });
    }

    // 3. Render All Categories
    Object.keys(grouped).forEach(cat => {
        const tit = document.createElement('div');
        tit.className = 'font-cat-title';
        tit.textContent = cat;
        grid.appendChild(tit);
        
        grouped[cat].forEach(f => renderFontItem(f, grid));
    });
}
`;

let js = fs.readFileSync('ui/fonts.js', 'utf8');

// Replace buildFontUI and the var defs
js = js.replace(/function buildFontUI\(\)\{[\s\S]*?\}\s*function buildElFontSelect\(\)/, replacement + "\nfunction buildElFontSelect()");

fs.writeFileSync('ui/fonts.js', js);
console.log("Updated fonts.js");

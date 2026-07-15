const fs = require('fs');

// 1. UPDATE APP.HTML
let html = fs.readFileSync('app.html', 'utf8');

const oldHeaderRegex = /<div style="width: 100%; max-width: 1800px; display: flex; justify-content: center; margin: 15px 0 10px 0; align-items: center;">\s*<a href="index\.html" class="logo">\s*<img src="assets\/logo\/logo\.jpg"[^>]*>\s*<\/a>\s*<a href="admin\.html" id="adminNavBtn"[^>]*>🛡️ Admin<\/a>\s*<\/div>/;

const newHeader = `<div class="app-header">
  <div class="header-left">
    <a href="index.html" class="logo">
      <img src="assets/logo/logo.jpg" alt="EmlakStüdyom" height="35" style="border-radius: 8px;">
    </a>
    <div class="mobile-undo-redo">
      <button class="icon-btn" onclick="undoGlobal()">↩️</button>
      <button class="icon-btn" onclick="redoGlobal()">↪️</button>
    </div>
  </div>
  <div class="header-right">
    <a href="admin.html" id="adminNavBtn" class="admin-nav-btn" style="display:none; margin-left:10px; padding:6px 14px; border-radius:20px; background:linear-gradient(135deg,#8b5cf6,#7c3aed); color:white; text-decoration:none; font-size:12px; font-weight:600; vertical-align:middle;" title="Admin Panel">🛡️ Admin</a>
    <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
        <i class="fas fa-bars"></i>
    </button>
  </div>
</div>`;

if (!html.includes('class="app-header"')) {
    html = html.replace(oldHeaderRegex, newHeader);
}

// Ensure overlay exists
if (!html.includes('id="mobileSheetOverlay"')) {
    html = html.replace('<body>', '<body>\n    <div id="mobileSheetOverlay" class="mobile-overlay" onclick="closeBottomSheet()"></div>');
}

fs.writeFileSync('app.html', html, 'utf8');


// 2. UPDATE STYLES.CSS
let css = fs.readFileSync('styles.css', 'utf8');

const appHeaderCSS = `
/* ===== APP.HTML DESKTOP HEADER ===== */
.app-header { width: 100%; max-width: 1800px; display: flex; justify-content: space-between; margin: 15px auto 10px auto; align-items: center; padding: 0 20px; box-sizing: border-box; }
.app-header .header-left { display: flex; align-items: center; }
.app-header .header-right { display: flex; align-items: center; gap: 10px; }
@media (min-width: 769px) {
    .mobile-undo-redo, .mobile-menu-btn { display: none !important; }
    .app-header { justify-content: center; } /* keep logo center on desktop like before */
    .app-header .header-right { position: absolute; right: 20px; }
}

/* ===== APP.HTML MOBILE FULL RESTRUCTURE ===== */
@media (max-width: 768px) {
    /* 1. Header Layout */
    .app-header {
        height: 50px !important; padding: 0 10px !important; margin: 0 !important; background: var(--dark) !important;
        justify-content: space-between !important; z-index: 50; position: relative;
    }
    .header-left, .header-right { gap: 10px !important; }
    .mobile-undo-redo { display: flex !important; gap: 5px !important; }
    .mobile-undo-redo .icon-btn {
        width: 32px !important; height: 32px !important; border-radius: 8px !important;
        background: rgba(255,255,255,0.1) !important; color: white !important;
        border: none !important; font-size: 14px !important; cursor: pointer;
        display: flex; justify-content: center; align-items: center;
    }
    .mobile-menu-btn {
        background: transparent !important; border: none !important; color: white !important;
        font-size: 24px !important; padding: 0 5px !important; cursor: pointer; display: block !important;
    }
    #modeBanner { position: static !important; transform: none !important; font-size: 10px !important; padding: 4px 8px !important; margin: 0 !important; }
    .tour-restart-btn, .info-text, #canvasHint { display: none !important; }
    .controls, .sidebar, .settings-panel { display: none !important; }

    /* 2. Container & Canvas Vertical Flow */
    .container { flex-direction: column !important; gap: 0 !important; display: flex !important; height: calc(100vh - 50px - 60px); overflow: hidden; }
    
    .preview-area {
        padding: 0 !important; margin: 0 !important; width: 100% !important; order: 1 !important; flex: 1 1 auto !important; 
        display: flex !important; justify-content: center !important; align-items: center !important; overflow: hidden !important; 
    }
    .canvas-wrapper {
        width: 100% !important; min-width: 100vw !important; height: 100% !important; padding: 0 !important; margin: 0 !important;
        display: flex !important; justify-content: center !important; align-items: center !important; 
    }
    canvas {
        width: 100% !important; height: auto !important; max-height: 100% !important; transform: none !important; display: block !important; margin: 0 auto !important;
    }

    /* 3. Bottom Tab Bar */
    .panel {
        order: 2 !important; flex: none !important; max-width: 100% !important; width: 100% !important; background: transparent !important;
        padding: 0 !important; margin: 0 !important; border: none !important; position: relative !important; z-index: 100;
    }
    #mainTabs {
        display: flex !important; flex-wrap: nowrap !important; overflow-x: auto !important; height: 60px !important; margin: 0 !important; padding: 0 !important;
        background: #16162a !important; scrollbar-width: none; align-items: center; position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
    }
    #mainTabs::-webkit-scrollbar { display: none; }
    .tab-btn {
        flex-shrink: 0 !important; min-width: 75px !important; padding: 8px 12px !important; font-size: 11px !important;
        border-radius: 6px !important; margin-right: 5px !important; white-space: nowrap !important;
    }
    .panel::after {
        content: ''; position: fixed; right: 0; bottom: 0; height: 60px; width: 30px; background: linear-gradient(to right, transparent, #16162a); pointer-events: none; z-index: 101 !important;
    }
    /* Hide desktop Undo/Redo in tab bar */
    #mainTabs .tab-btn[onclick="undoGlobal()"], #mainTabs .tab-btn[onclick="redoGlobal()"] { display: none !important; }

    /* 4. Bottom Sheet Panels */
    .dynamic-field {
        position: fixed !important; bottom: -100vh !important; left: 0 !important; right: 0 !important; width: 100% !important; height: 65vh !important;
        background: var(--dark-2) !important; z-index: 200 !important; border-radius: 20px 20px 0 0 !important;
        box-shadow: 0 -5px 25px rgba(0,0,0,0.5) !important; transition: bottom 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
        padding: 30px 20px 20px 20px !important; overflow-y: auto !important; display: block !important; box-sizing: border-box !important;
    }
    .dynamic-field.show { bottom: 0 !important; }
    
    /* Drag Handle for Bottom Sheet */
    .dynamic-field::before {
        content: ''; position: absolute; top: 10px; left: 50%; transform: translateX(-50%); width: 40px; height: 5px;
        background: rgba(255,255,255,0.3); border-radius: 3px;
    }

    .mobile-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(3px);
        z-index: 199; display: none; opacity: 0; transition: opacity 0.3s;
    }
    .mobile-overlay.active { display: block; opacity: 1; }
}
`;

if (!css.includes('APP.HTML DESKTOP HEADER')) {
    css += '\n' + appHeaderCSS;
    fs.writeFileSync('styles.css', css, 'utf8');
}

// 3. UPDATE CORE.JS / MAIN.JS
let corejs = fs.readFileSync('core.js', 'utf8');

if (!corejs.includes('mobileSheetOverlay')) {
    const oldSwitchTab = `function switchTab(name){
    document.querySelectorAll('#mainTabs .tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
    document.querySelectorAll('.panel>.dynamic-field').forEach(f=>f.classList.remove('show'));
    $('tab-'+name).classList.add('show');
    if(name!=='draw'&&drawMode!=='off')setDrawMode('off');
    if(name!=='draw'&&typeof cancelDrawEdit==='function')cancelDrawEdit();
}`;

    const newSwitchTab = `function switchTab(name){
    document.querySelectorAll('#mainTabs .tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
    document.querySelectorAll('.panel>.dynamic-field').forEach(f=>f.classList.remove('show'));
    $('tab-'+name).classList.add('show');
    if(name!=='draw'&&drawMode!=='off')setDrawMode('off');
    if(name!=='draw'&&typeof cancelDrawEdit==='function')cancelDrawEdit();
    
    // Mobile Bottom Sheet Trigger
    if (window.innerWidth <= 768) {
        const overlay = document.getElementById('mobileSheetOverlay');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
}

function closeBottomSheet() {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.panel>.dynamic-field').forEach(f=>f.classList.remove('show'));
        document.querySelectorAll('#mainTabs .tab-btn').forEach(b=>b.classList.remove('active'));
        const overlay = document.getElementById('mobileSheetOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

// Auto-close on load for mobile
window.addEventListener('load', () => {
    if (window.innerWidth <= 768) {
        setTimeout(closeBottomSheet, 100);
    }
});
`;
    corejs = corejs.replace(oldSwitchTab, newSwitchTab);
    fs.writeFileSync('core.js', corejs, 'utf8');
}

console.log('Mobile layout restructuring completed successfully!');

const fs = require('fs');
let js = fs.readFileSync('js/searchManager.js', 'utf8');

js = js.replace(/openSearch: function\(\) {[\s\S]*?closeSearch: function\(\) {/, `openSearch: function() {
        const modal = document.getElementById('omniSearchModal');
        const box = document.getElementById('omniSearchBox');
        modal.style.display = 'flex';
        
        const btnContainer = document.getElementById('searchButtonsContainer');
        if(btnContainer && box) {
            const rect = btnContainer.getBoundingClientRect();
            box.style.top = (rect.bottom + 5) + 'px';
            box.style.left = rect.left + 'px';
            box.style.width = rect.width + 'px';
            // left sidebar genelde 360px civari
        }
        
        const input = document.getElementById('omniSearchInput');
        input.value = '';
        this.performSearch('');
        setTimeout(() => input.focus(), 100);
    },

    closeSearch: function() {`);

js = js.replace(/openRecent: function\(\) {[\s\S]*?closeRecent: function\(\) {/, `openRecent: function() {
        const modal = document.getElementById('recentToolsModal');
        const box = document.getElementById('recentToolsBox');
        modal.style.display = 'flex';
        
        const btnContainer = document.getElementById('searchButtonsContainer');
        if(btnContainer && box) {
            const rect = btnContainer.getBoundingClientRect();
            box.style.top = (rect.bottom + 5) + 'px';
            box.style.left = rect.left + 'px';
            box.style.width = rect.width + 'px';
        }
        
        this.renderRecent();
    },

    closeRecent: function() {`);

fs.writeFileSync('js/searchManager.js', js);
console.log("Updated searchManager.js");

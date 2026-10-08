// brandManager.js
// Handles Brand Templates (Marka Şablonları) logic

let editingBrandId = null;
let currentLogoDataUrl = null;

function getBrands() {
    try {
        let brands = JSON.parse(localStorage.getItem('canvaBrandTemplates'));
        if (!brands || brands.length === 0) {
            brands = [{
                id: 'default_emlak_studiom',
                name: 'Emlak Stüdyom',
                phone: '',
                insta: '',
                website: 'www.emlakstudyom.com',
                color1: '#0f172a',
                color2: '#f59e0b',
                logo: 'assets/logo/logo.png' // Default logo
            }];
            localStorage.setItem('canvaBrandTemplates', JSON.stringify(brands));
        }
        return brands;
    } catch(e) { return []; }
}

function saveBrands(brands) {
    localStorage.setItem('canvaBrandTemplates', JSON.stringify(brands));
}

function initBrandManager() {
    const logoInput = document.getElementById('brandLogoInput');
    if (logoInput) {
        logoInput.addEventListener('change', (e) => {
            const f = e.target.files[0];
            if (f) {
                if (typeof window.showAppLoading === 'function') {
                    window.showAppLoading('Logo Yükleniyor...', 'Firma logosu optimize ediliyor...');
                }
                const r = new FileReader();
                r.onload = ev => {
                    currentLogoDataUrl = ev.target.result;
                    const preview = document.getElementById('brandLogoPreview');
                    if (preview) {
                        preview.src = currentLogoDataUrl;
                        preview.style.display = 'block';
                    }
                    if (typeof window.hideAppLoading === 'function') {
                        window.hideAppLoading(60);
                    }
                };
                r.onerror = () => {
                    if (typeof window.hideAppLoading === 'function') window.hideAppLoading();
                };
                r.readAsDataURL(f);
            }
        });
    }
    renderBrandList();
}

window.showBrandForm = function(brandId = null) {
    document.getElementById('brand-list-view').style.display = 'none';
    document.getElementById('brand-form-view').style.display = 'block';
    
    const preview = document.getElementById('brandLogoPreview');
    document.getElementById('brandLogoInput').value = '';
    
    if (brandId) {
        editingBrandId = brandId;
        const brand = getBrands().find(b => b.id === brandId);
        if (brand) {
            document.getElementById('brandNameInput').value = brand.name || '';
            document.getElementById('brandPhoneInput').value = brand.phone || '';
            document.getElementById('brandInstaInput').value = brand.insta || '';
            const webInput = document.getElementById('brandWebInput');
            if(webInput) webInput.value = brand.website || '';
            if(document.getElementById('brandFbInput')) document.getElementById('brandFbInput').value = brand.fb || '';
            if(document.getElementById('brandTwitterInput')) document.getElementById('brandTwitterInput').value = brand.twitter || '';
            if(document.getElementById('brandYoutubeInput')) document.getElementById('brandYoutubeInput').value = brand.youtube || '';
            if(document.getElementById('brandAddressInput')) document.getElementById('brandAddressInput').value = brand.address || '';
            document.getElementById('brandColor1Input').value = brand.color1 || '#06b6d4';
            document.getElementById('brandColor2Input').value = brand.color2 || '#000000';
            currentLogoDataUrl = brand.logo || null;
            
            if (currentLogoDataUrl) {
                preview.src = currentLogoDataUrl;
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        }
    } else {
        editingBrandId = null;
        currentLogoDataUrl = null;
        document.getElementById('brandNameInput').value = '';
        document.getElementById('brandPhoneInput').value = '';
        document.getElementById('brandInstaInput').value = '';
        const webInput = document.getElementById('brandWebInput');
        if(webInput) webInput.value = '';
        if(document.getElementById('brandFbInput')) document.getElementById('brandFbInput').value = '';
        if(document.getElementById('brandTwitterInput')) document.getElementById('brandTwitterInput').value = '';
        if(document.getElementById('brandYoutubeInput')) document.getElementById('brandYoutubeInput').value = '';
        if(document.getElementById('brandAddressInput')) document.getElementById('brandAddressInput').value = '';
        document.getElementById('brandColor1Input').value = '#06b6d4';
        document.getElementById('brandColor2Input').value = '#000000';
        preview.style.display = 'none';
    }
};

window.hideBrandForm = function() {
    document.getElementById('brand-list-view').style.display = 'block';
    document.getElementById('brand-form-view').style.display = 'none';
};

window.saveBrand = function() {
    const name = document.getElementById('brandNameInput').value.trim() || 'İsimsiz Marka';
    const phone = document.getElementById('brandPhoneInput').value.trim();
    const insta = document.getElementById('brandInstaInput').value.trim();
    const webInput = document.getElementById('brandWebInput');
    const website = webInput ? webInput.value.trim() : '';
    const fb = document.getElementById('brandFbInput') ? document.getElementById('brandFbInput').value.trim() : '';
    const twitter = document.getElementById('brandTwitterInput') ? document.getElementById('brandTwitterInput').value.trim() : '';
    const youtube = document.getElementById('brandYoutubeInput') ? document.getElementById('brandYoutubeInput').value.trim() : '';
    const address = document.getElementById('brandAddressInput') ? document.getElementById('brandAddressInput').value.trim() : '';
    const color1 = document.getElementById('brandColor1Input').value;
    const color2 = document.getElementById('brandColor2Input').value;
    
    let brands = getBrands();
    
    if (editingBrandId) {
        const idx = brands.findIndex(b => b.id === editingBrandId);
        if (idx >= 0) {
            brands[idx] = { ...brands[idx], name, phone, insta, website, fb, twitter, youtube, address, color1, color2, logo: currentLogoDataUrl };
        }
    } else {
        brands.push({
            id: Date.now().toString(),
            name,
            phone,
            insta,
            website, fb, twitter, youtube, address, color1, color2,
            logo: currentLogoDataUrl
        });
    }
    
    saveBrands(brands);
    hideBrandForm();
    renderBrandList();
};

window.deleteBrand = function(id) {
    let brands = getBrands();
    brands = brands.filter(b => b.id !== id);
    saveBrands(brands);
    renderBrandList();
};

window.renderBrandList = function() {
    const list = document.getElementById('brand-list');
    if (!list) return;
    
    const brands = getBrands();
    list.innerHTML = '';
    
    if (brands.length === 0) {
        list.innerHTML = '<div style="color:#94a3b8; font-size:12px; text-align:center; padding:10px;">Henüz kaydedilmiş marka yok. Yeni ekle butonuna tıklayın.</div>';
        return;
    }
    
    if (brands.length > 5 && !document.getElementById('brandSearchInput')) {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'brandSearchInput';
        searchInput.placeholder = 'Marka Ara...';
        searchInput.style.width = '100%';
        searchInput.style.padding = '8px';
        searchInput.style.marginBottom = '10px';
        searchInput.style.borderRadius = '4px';
        searchInput.style.border = '1px solid #cbd5e1';
        searchInput.style.background = '#ffffff';
        searchInput.style.color = '#0f172a';
        searchInput.oninput = (e) => filterBrandList(e.target.value.toLowerCase());
        
        list.parentElement.insertBefore(searchInput, list);
    } else if (brands.length <= 5 && document.getElementById('brandSearchInput')) {
        document.getElementById('brandSearchInput').remove();
    }
    
    brands.forEach(b => {
        const item = document.createElement('div');
        item.className = 'brand-item';
        item.style.background = '#ffffff';
        item.style.border = '1px solid #cbd5e1';
        item.style.padding = '8px 12px';
        item.style.borderRadius = '8px';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.marginBottom = '8px';
        item.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
        
        item.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; flex:1; cursor:pointer;" onclick="applyBrand('${b.id}')" title="Tuvale Uygula">
                ${b.logo ? `<img src="${b.logo}" style="width:30px; height:30px; border-radius:4px; object-fit:contain; border:1px solid #e2e8f0; background:#fff;">` : `<div style="width:30px; height:30px; border-radius:4px; background:${b.color1}; border:1px solid #cbd5e1"></div>`}
                <div style="font-size:12px; font-weight:700; color:#0f172a;">${b.name}</div>
            </div>
            <div style="display:flex; gap:6px;">
                <button type="button" onclick="showBrandForm('${b.id}')" style="background:transparent; border:none; color:#2563eb; cursor:pointer; font-size:11.5px; font-weight:600; padding:2px 4px;">Düzenle</button>
                <button type="button" onclick="deleteBrand('${b.id}')" style="background:transparent; border:none; color:#dc2626; cursor:pointer; font-size:11.5px; font-weight:600; padding:2px 4px;">Sil</button>
            </div>
        `;
        list.appendChild(item);
    });
};

function filterBrandList(query) {
    const list = document.getElementById('brand-list');
    if (!list) return;
    const items = list.querySelectorAll('.brand-item');
    items.forEach(item => {
        const name = item.querySelector('div > div').innerText.toLowerCase();
        if (name.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

window.applyBrand = function(brandId) {
    const brand = getBrands().find(b => b.id === brandId);
    if (!brand) return;
    
    const uiLayer = document.getElementById('ui-layer');
    if (!uiLayer) return;
    if (typeof window.CanvasEmptyState !== 'undefined') window.CanvasEmptyState.dismiss();

    const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let addedElements = [];
    let currentTop = 50;

        if (brand.logo) {
        const el = document.createElement('div');
        el.className = 'draggable canvas-el brand-element';
        el.dataset.label = 'Marka Logo';
        el.dataset.layerUid = 'layer_' + Math.random().toString(36).substr(2, 9);
        el.dataset.storedBorderWidth = '0';
        el.dataset.storedBorderColor = 'transparent';
        el.dataset.rotation = '0';
        el.style.left = '50px';
        el.style.top = currentTop + 'px';
        el.style.width = '80px';
        el.style.height = 'auto';
        el.style.zIndex = '9999';
        
        const img = document.createElement('img');
        img.src = brand.logo;
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.pointerEvents = 'none';
        el.appendChild(img);
        
        uiLayer.appendChild(el);
        if (typeof bindDrag === 'function') bindDrag(el);
        addedElements.push(el);
        currentTop += 90;
    }
    
    const createTextElement = (icon, text, label) => {
        const el = document.createElement('div');
        el.className = 'draggable canvas-el brand-element editable-text';
        el.innerHTML = `${icon} ${escapeHtml(text)}`;
        el.dataset.label = label;
        el.dataset.layerUid = 'layer_' + Math.random().toString(36).substr(2, 9);
        el.dataset.defaultFont = '24';
        el.dataset.rotation = '0';
        el.dataset.shadowVal = '0';
        el.dataset.blurVal = '0';
        el.dataset.storedBgHex = brand.color1 && brand.color1 !== 'transparent' ? brand.color1 : 'transparent';
        el.dataset.storedBgOpacity = brand.color1 && brand.color1 !== 'transparent' ? '1' : '0';
        el.dataset.storedBorderColor = 'transparent';
        el.dataset.storedBorderWidth = '0';
        el.style.left = '50px';
        el.style.top = currentTop + 'px';
        el.style.fontSize = '24px';
        el.style.padding = '5px 10px';
        el.style.background = 'transparent';
        el.style.color = brand.color1 || '#06b6d4';
        el.style.border = 'none';
        el.style.zIndex = '9999';
        el.style.borderRadius = '4px';
        if (typeof currentFont !== 'undefined') el.style.fontFamily = currentFont;
        
        uiLayer.appendChild(el);
        if (typeof bindDrag === 'function') bindDrag(el);
        if (typeof enableInlineEdit === 'function') enableInlineEdit(el);
        addedElements.push(el);
        currentTop += 50;
    };

    if (brand.phone) createTextElement('<i class="fa-solid fa-phone"></i>', brand.phone, 'Marka Telefon');
    if (brand.website) createTextElement('<i class="fa-solid fa-globe"></i>', brand.website, 'Marka Web Sitesi');
    if (brand.insta) createTextElement('<i class="fa-brands fa-instagram"></i>', brand.insta, 'Marka Instagram');
    if (brand.fb) createTextElement('<i class="fa-brands fa-facebook"></i>', brand.fb, 'Marka Facebook');
    if (brand.twitter) createTextElement('<i class="fa-brands fa-x-twitter"></i>', brand.twitter, 'Marka Twitter');
    if (brand.youtube) createTextElement('<i class="fa-brands fa-youtube"></i>', brand.youtube, 'Marka YouTube');
    if (brand.address) createTextElement('<i class="fa-solid fa-location-dot"></i>', brand.address, 'Marka Adres');
    
        if (addedElements.length > 1) {
        const groupId = 'brand_group_' + Math.random().toString(36).substr(2, 9);
        addedElements.forEach(el => {
            el.dataset.groupId = groupId;
        });
    }
    if (addedElements.length > 0 && typeof selectElement === 'function') {
        selectElement(addedElements[0]);
    }
    
    if (typeof renderLayers === 'function') renderLayers();
};

document.addEventListener('DOMContentLoaded', initBrandManager);










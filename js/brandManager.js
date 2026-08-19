// brandManager.js
// Handles Brand Templates (Marka Şablonları) logic

let editingBrandId = null;
let currentLogoDataUrl = null;

function getBrands() {
    try {
        return JSON.parse(localStorage.getItem('canvaBrandTemplates')) || [];
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
            document.getElementById('brandColor1Input').value = brand.color1 || '#ffffff';
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
        document.getElementById('brandColor1Input').value = '#ffffff';
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
    const color1 = document.getElementById('brandColor1Input').value;
    const color2 = document.getElementById('brandColor2Input').value;
    
    let brands = getBrands();
    
    if (editingBrandId) {
        const idx = brands.findIndex(b => b.id === editingBrandId);
        if (idx >= 0) {
            brands[idx] = { ...brands[idx], name, phone, insta, color1, color2, logo: currentLogoDataUrl };
        }
    } else {
        brands.push({
            id: Date.now().toString(),
            name,
            phone,
            insta,
            color1,
            color2,
            logo: currentLogoDataUrl
        });
    }
    
    saveBrands(brands);
    hideBrandForm();
    renderBrandList();
};

window.deleteBrand = function(id) {
    if (confirm('Bu markayı silmek istediğinize emin misiniz?')) {
        let brands = getBrands();
        brands = brands.filter(b => b.id !== id);
        saveBrands(brands);
        renderBrandList();
    }
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
        searchInput.style.border = '1px solid #334155';
        searchInput.style.background = '#1e293b';
        searchInput.style.color = '#fff';
        searchInput.oninput = (e) => filterBrandList(e.target.value.toLowerCase());
        
        list.parentElement.insertBefore(searchInput, list);
    } else if (brands.length <= 5 && document.getElementById('brandSearchInput')) {
        document.getElementById('brandSearchInput').remove();
    }
    
    brands.forEach(b => {
        const item = document.createElement('div');
        item.className = 'brand-item';
        item.style.background = '#334155';
        item.style.padding = '10px';
        item.style.borderRadius = '6px';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        
        item.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; flex:1; cursor:pointer;" onclick="applyBrand('${b.id}')" title="Tuvale Uygula">
                ${b.logo ? `<img src="${b.logo}" style="width:30px; height:30px; border-radius:4px; object-fit:contain; background:#fff;">` : `<div style="width:30px; height:30px; border-radius:4px; background:${b.color1}; border:1px solid ${b.color2}"></div>`}
                <div style="font-size:12px; font-weight:600; color:#fff;">${b.name}</div>
            </div>
            <div style="display:flex; gap:5px;">
                <button onclick="showBrandForm('${b.id}')" style="background:transparent; border:none; color:#3b82f6; cursor:pointer; font-size:12px;">Düzenle</button>
                <button onclick="deleteBrand('${b.id}')" style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:12px;">Sil</button>
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
    
    const uiLayer = document.getElementById('uiLayer');
    if (!uiLayer) return;

    let addedElements = [];

    if (brand.logo) {
        const el = document.createElement('img');
        el.className = 'draggable canvas-el brand-element';
        el.src = brand.logo;
        el.dataset.label = 'Marka Logo';
        el.dataset.storedBorderWidth = '0';
        el.dataset.storedBorderColor = 'transparent';
        el.dataset.rotation = '0';
        el.style.left = '50px';
        el.style.top = '50px';
        el.style.maxWidth = '150px';
        el.style.maxHeight = '150px';
        el.style.zIndex = '9999';
        uiLayer.appendChild(el);
        if (typeof bindDrag === 'function') bindDrag(el);
        addedElements.push(el);
    }
    
    if (brand.phone) {
        const el = document.createElement('div');
        el.className = 'draggable canvas-el brand-element editable-text';
        el.innerHTML = `📞 ${brand.phone}`;
        el.dataset.label = 'Marka Telefon';
        el.dataset.defaultFont = '24';
        el.dataset.rotation = '0';
        el.dataset.shadowVal = '0';
        el.dataset.blurVal = '0';
        el.dataset.storedBgHex = 'transparent';
        el.dataset.storedBgOpacity = '0';
        el.dataset.storedBorderColor = 'transparent';
        el.dataset.storedBorderWidth = '0';
        el.style.left = '50px';
        el.style.top = brand.logo ? '210px' : '50px';
        el.style.fontSize = '24px';
        el.style.padding = '5px 10px';
        el.style.background = brand.color1 || 'transparent';
        el.style.color = brand.color2 || '#ffffff';
        el.style.border = 'none';
        el.style.zIndex = '9999';
        el.style.borderRadius = '4px';
        if (typeof currentFont !== 'undefined') el.style.fontFamily = currentFont;
        
        uiLayer.appendChild(el);
        if (typeof bindDrag === 'function') bindDrag(el);
        if (typeof enableInlineEdit === 'function') enableInlineEdit(el);
        addedElements.push(el);
    }
    
    if (brand.insta) {
        const el = document.createElement('div');
        el.className = 'draggable canvas-el brand-element editable-text';
        el.innerHTML = `📸 ${brand.insta}`;
        el.dataset.label = 'Marka Instagram';
        el.dataset.defaultFont = '24';
        el.dataset.rotation = '0';
        el.dataset.shadowVal = '0';
        el.dataset.blurVal = '0';
        el.dataset.storedBgHex = 'transparent';
        el.dataset.storedBgOpacity = '0';
        el.dataset.storedBorderColor = 'transparent';
        el.dataset.storedBorderWidth = '0';
        el.style.left = '50px';
        el.style.top = brand.logo ? (brand.phone ? '260px' : '210px') : (brand.phone ? '100px' : '50px');
        el.style.fontSize = '24px';
        el.style.padding = '5px 10px';
        el.style.background = brand.color1 || 'transparent';
        el.style.color = brand.color2 || '#ffffff';
        el.style.border = 'none';
        el.style.zIndex = '9999';
        el.style.borderRadius = '4px';
        if (typeof currentFont !== 'undefined') el.style.fontFamily = currentFont;
        
        uiLayer.appendChild(el);
        if (typeof bindDrag === 'function') bindDrag(el);
        if (typeof enableInlineEdit === 'function') enableInlineEdit(el);
        addedElements.push(el);
    }
    
    if (addedElements.length > 0 && typeof selectElement === 'function') {
        selectElement(addedElements[0]);
    }
    
    alert(`${brand.name} bilgileri tuvale eklendi. İlgili ögeleri sürükleyip istediğiniz yere bırakabilirsiniz.`);
};

document.addEventListener('DOMContentLoaded', initBrandManager);

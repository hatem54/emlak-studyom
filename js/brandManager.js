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
                email: 'emlakstudyomtr@gmail.com',
                phone: '',
                insta: '',
                website: 'www.emlakstudyom.com',
                color1: '#0f172a',
                color2: '#f59e0b',
                logo: 'assets/logo/logo.png' // Default logo
            }];
            localStorage.setItem('canvaBrandTemplates', JSON.stringify(brands));
        } else {
            const defBrand = brands.find(b => b.id === 'default_emlak_studiom');
            if (defBrand) {
                let updated = false;
                if (!defBrand.email || defBrand.email !== 'emlakstudyomtr@gmail.com') {
                    defBrand.email = 'emlakstudyomtr@gmail.com';
                    updated = true;
                }
                if (defBrand.phone) {
                    defBrand.phone = '';
                    updated = true;
                }
                if (updated) {
                    localStorage.setItem('canvaBrandTemplates', JSON.stringify(brands));
                }
            }
        }
        return brands;
    } catch(e) { return []; }
}

function saveBrands(brands) {
    try {
        localStorage.setItem('canvaBrandTemplates', JSON.stringify(brands));
        return true;
    } catch (e) {
        console.warn('Marka şablonu kaydedilemedi (Depolama kotası):', e);
        if (typeof window.showAppToast === 'function') {
            window.showAppToast('Tarayıcı hafızası dolu! Lütfen daha küçük bir logo seçin veya eski markaları silin.', 'error', 4000);
        } else {
            alert('Tarayıcı hafızası dolu! Lütfen daha küçük bir logo seçin veya eski markaları silin.');
        }
        return false;
    }
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
                    const rawDataUrl = ev.target.result;
                    const img = new Image();
                    img.onload = () => {
                        let finalDataUrl = rawDataUrl;
                        const maxDim = 512;
                        const w = img.naturalWidth || img.width || 0;
                        const h = img.naturalHeight || img.height || 0;
                        if (w > maxDim || h > maxDim || rawDataUrl.length > 250000) {
                            try {
                                const scale = (w > maxDim || h > maxDim) ? Math.min(maxDim / w, maxDim / h) : 1;
                                const cw = Math.max(1, Math.round(w * scale));
                                const ch = Math.max(1, Math.round(h * scale));
                                const cvs = document.createElement('canvas');
                                cvs.width = cw;
                                cvs.height = ch;
                                const ctx = cvs.getContext('2d');
                                ctx.imageSmoothingEnabled = true;
                                ctx.imageSmoothingQuality = 'high';
                                ctx.drawImage(img, 0, 0, cw, ch);
                                finalDataUrl = cvs.toDataURL('image/png');
                                cvs.width = 0;
                                cvs.height = 0;
                            } catch (errOpt) {}
                        }
                        currentLogoDataUrl = finalDataUrl;
                        const preview = document.getElementById('brandLogoPreview');
                        if (preview) {
                            preview.src = currentLogoDataUrl;
                            preview.style.display = 'block';
                        }
                        if (typeof window.hideAppLoading === 'function') {
                            window.hideAppLoading(60);
                        }
                    };
                    img.onerror = () => {
                        currentLogoDataUrl = rawDataUrl;
                        const preview = document.getElementById('brandLogoPreview');
                        if (preview) {
                            preview.src = currentLogoDataUrl;
                            preview.style.display = 'block';
                        }
                        if (typeof window.hideAppLoading === 'function') {
                            window.hideAppLoading(60);
                        }
                    };
                    img.src = rawDataUrl;
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
            const emailInput = document.getElementById('brandEmailInput');
            if (emailInput) emailInput.value = brand.email || '';
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
        const emailInput = document.getElementById('brandEmailInput');
        if (emailInput) emailInput.value = '';
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

window.useActiveCompanyLogoForBrand = function() {
    const activeLogo = (typeof window.companyLogo === 'string' && window.companyLogo.trim())
        ? window.companyLogo.trim()
        : (window.PhotoStagingArchive && typeof window.PhotoStagingArchive.getCurrentLogoUrl === 'function'
            ? window.PhotoStagingArchive.getCurrentLogoUrl()
            : '');

    if (!activeLogo) {
        if (typeof window.showAppToast === 'function') {
            window.showAppToast('Aktif firma logosu bulunamadı. Yukarıdan dosya seçebilir veya Görseller/Ekstra Araçlar üzerinden yükleyebilirsiniz.', 'info', 3500);
        }
        return;
    }

    currentLogoDataUrl = activeLogo;
    const preview = document.getElementById('brandLogoPreview');
    if (preview) {
        preview.src = activeLogo;
        preview.style.display = 'block';
    }
    if (typeof window.showAppToast === 'function') {
        window.showAppToast('Aktif firma logosu marka formuna aktarıldı.', 'success', 2200);
    }
};

window.hideBrandForm = function() {
    document.getElementById('brand-list-view').style.display = 'block';
    document.getElementById('brand-form-view').style.display = 'none';
};

window.saveBrand = function() {
    const name = document.getElementById('brandNameInput').value.trim() || 'İsimsiz Marka';
    const emailInput = document.getElementById('brandEmailInput');
    const email = emailInput ? emailInput.value.trim() : '';
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
            brands[idx] = { ...brands[idx], name, email, phone, insta, website, fb, twitter, youtube, address, color1, color2, logo: currentLogoDataUrl };
        }
    } else {
        brands.push({
            id: Date.now().toString(),
            name,
            email,
            phone,
            insta,
            website, fb, twitter, youtube, address, color1, color2,
            logo: currentLogoDataUrl
        });
    }
    
    if (saveBrands(brands)) {
        hideBrandForm();
        renderBrandList();
    }
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
        searchInput.style.borderRadius = '6px';
        searchInput.style.border = '1px solid var(--border, #cbd5e1)';
        searchInput.style.background = 'var(--dark-3, #ffffff)';
        searchInput.style.color = 'var(--text, #0f172a)';
        searchInput.style.boxSizing = 'border-box';
        searchInput.oninput = (e) => filterBrandList(e.target.value.toLowerCase());
        
        list.parentElement.insertBefore(searchInput, list);
    } else if (brands.length <= 5 && document.getElementById('brandSearchInput')) {
        document.getElementById('brandSearchInput').remove();
    }
    
    const escBrandHtml = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    brands.forEach(b => {
        const item = document.createElement('div');
        item.className = 'brand-item';
        item.style.background = 'var(--dark-3, #ffffff)';
        item.style.border = '1px solid var(--border, #cbd5e1)';
        item.style.padding = '8px 10px';
        item.style.borderRadius = '8px';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.marginBottom = '6px';

        const safeId = escBrandHtml(b.id);
        const safeName = escBrandHtml(b.name);
        const safeColor = /^#[0-9a-fA-F]{3,8}$|^rgb/.test(String(b.color1 || '')) ? String(b.color1) : '#0284c7';
        const safeLogo = (typeof b.logo === 'string' && /^(data:image\/|https?:\/\/|assets\/)/.test(b.logo)) ? escBrandHtml(b.logo) : '';

        item.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0; cursor:pointer;" onclick="applyBrand('${safeId}')" title="Tuvale Uygula">
                ${safeLogo ? `<img src="${safeLogo}" style="width:30px; height:30px; border-radius:4px; object-fit:contain; border:1px solid rgba(148,163,184,0.4); background:#ffffff; flex:0 0 30px;">` : `<div style="width:30px; height:30px; border-radius:4px; background:${safeColor}; border:1px solid rgba(148,163,184,0.4); flex:0 0 30px;"></div>`}
                <div style="font-size:12px; font-weight:700; color:var(--text, #0f172a); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${safeName}</div>
            </div>
            <div style="display:flex; gap:5px; flex:0 0 auto; margin-left:6px;">
                <button type="button" class="btn-action" onclick="showBrandForm('${safeId}')" style="width:auto; flex:0 0 auto; height:26px; padding:0 8px; margin:0 !important; font-size:10.5px; white-space:nowrap;">Düzenle</button>
                <button type="button" class="btn-action btn-red" onclick="deleteBrand('${safeId}')" style="width:auto; flex:0 0 auto; height:26px; padding:0 8px; margin:0 !important; font-size:10.5px; white-space:nowrap;">Sil</button>
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

    if (brand.email) createTextElement('<i class="fa-solid fa-envelope"></i>', brand.email, 'Marka E-posta');
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










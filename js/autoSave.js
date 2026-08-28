// autoSave.js
// Handles background Auto-Save using IndexedDB to prevent localStorage limits

const DB_NAME = 'CanvaAutoSaveDB';
const DB_VERSION = 1;
const STORE_NAME = 'autosave_store';

let dbInstance = null;
let autoSaveInterval = null;

// Track unsaved changes
window.autoSaveTimeout = null;

window.requestAutoSave = function() {
    if (window.isRestoringState) return;
    if (window.autoSaveTimeout) clearTimeout(window.autoSaveTimeout);
    window.autoSaveTimeout = setTimeout(() => {
        if(typeof performAutoSave === 'function') performAutoSave();
    }, 1000);
};

// Initialize IndexedDB
function initAutoSaveDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        
        request.onsuccess = (e) => {
            dbInstance = e.target.result;
            resolve(dbInstance);
        };
        
        request.onerror = (e) => {
            console.error('IndexedDB error:', e.target.error);
            reject(e.target.error);
        };
    });
}

function saveStateToDB(state) {
    if (!dbInstance) return Promise.reject('DB not initialized');
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id: 'latest_save', timestamp: Date.now(), state: state });
        
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

function loadStateFromDB() {
    if (!dbInstance) return Promise.reject('DB not initialized');
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('latest_save');
        
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

function deleteStateFromDB() {
    if (!dbInstance) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete('latest_save');
        
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

function saveHistoryToDB(state) {
    if (!dbInstance) return Promise.reject('DB not initialized');
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const timestamp = Date.now();
        const request = store.put({ id: 'history_' + timestamp, timestamp: timestamp, state: state, isHistory: true });
        
        request.onsuccess = () => {
            cleanupOldHistory().then(resolve).catch(reject);
        };
        request.onerror = (e) => reject(e.target.error);
    });
}

function cleanupOldHistory() {
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = (e) => {
            const records = e.target.result;
            const historyRecords = records.filter(r => r.id && r.id.startsWith('history_')).sort((a,b) => b.timestamp - a.timestamp);
            
            if (historyRecords.length > 3) {
                const toDelete = historyRecords.slice(3);
                toDelete.forEach(r => store.delete(r.id));
            }
            resolve();
        };
        request.onerror = (e) => reject(e.target.error);
    });
}

function getHistoryFromDB() {
    if (!dbInstance) return Promise.reject('DB not initialized');
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = (e) => {
            const records = e.target.result;
            const historyRecords = records.filter(r => r.id && r.id.startsWith('history_')).sort((a,b) => b.timestamp - a.timestamp);
            resolve(historyRecords);
        };
        request.onerror = (e) => reject(e.target.error);
    });
}

function loadHistoryStateFromDB(id) {
    if (!dbInstance) return Promise.reject('DB not initialized');
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        
        request.onsuccess = (e) => {
            if(e.target.result) resolve(e.target.result);
            else reject('Not found');
        };
        request.onerror = (e) => reject(e.target.error);
    });
}

let lastHistorySaveTime = 0;
const HISTORY_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Background Task
async function performAutoSave() {
    if (window.isRestoringState) return;
    try {
        const isCanvaModeActive = typeof isCanvaMode !== 'undefined' ? isCanvaMode : (window.isCanvaMode || false);
        
        // Check if there is anything to save
        const photoEl = document.getElementById('photo-layer');
        const hasPhoto = (photoEl && photoEl.style.backgroundImage !== 'none' && photoEl.style.backgroundImage !== '');
        const activeDrawPaths = typeof drawPaths !== 'undefined' ? drawPaths : (window.drawPaths || []);
        const hasDrawings = activeDrawPaths && activeDrawPaths.length > 0;
        
        let hasInputs = false;
        const formContainer = document.getElementById('dynamicFormContainer');
        if(formContainer) {
            const inputs = formContainer.querySelectorAll('input[type="text"]');
            for(let i=0; i<inputs.length; i++) {
                if(inputs[i].value.trim() !== '') {
                    hasInputs = true;
                    break;
                }
            }
        }
        
        const kolajWrap = document.getElementById('kolaj-wrapper');
        const hasKolaj = kolajWrap && kolajWrap.children.length > 0;
        const canvaLayer = document.getElementById('canva-render-layer');
        const hasCanva = canvaLayer && canvaLayer.children.length > 0 && canvaLayer.style.display !== 'none';
        
        if (!hasPhoto && !isCanvaModeActive && !hasDrawings && !hasInputs && !hasKolaj && !hasCanva) return; // Nothing meaningful to save
        
        const activeUploadedImgUrl = typeof uploadedImgUrl !== 'undefined' ? uploadedImgUrl : window.uploadedImgUrl;
        const state = {
            version: 1,
            currentMode: typeof currentMode !== 'undefined' ? currentMode : window.currentMode,
            propertyType: typeof currentMode !== 'undefined' ? currentMode : (window.currentMode || 'satilik_daire'),
            activeLayout: typeof activeLayout !== 'undefined' ? activeLayout : window.activeLayout, 
            hasStandardTemplate: (typeof elDetails !== 'undefined' && elDetails && elDetails.style.visibility === 'visible' && elDetails.style.display !== 'none'),
            isCanvaMode: isCanvaModeActive, 
            activeCanvaId: typeof activeCanvaId !== 'undefined' ? activeCanvaId : window.activeCanvaId,
            canvaHtml: hasCanva ? canvaLayer.innerHTML : null,
            isKolajMode: !!hasKolaj,
            kolajAktif: typeof _kolajAktif !== 'undefined' ? _kolajAktif : null,
            kolajHtml: hasKolaj ? kolajWrap.innerHTML : null,
            kolajBg: hasKolaj ? (kolajWrap.style.background || kolajWrap.style.backgroundColor || '') : '',
            lastAppliedPalette: window.lastAppliedPalette ? Object.assign({}, window.lastAppliedPalette) : null,
            currentFont: typeof currentFont !== 'undefined' ? currentFont : (window.currentFont || localStorage.getItem('emlakstudiom_currentFont') || ''),
            canvasBgColor: (document.getElementById('canvasBgColor') && document.getElementById('canvasBgColor').value) || (document.getElementById('canvas-container') ? document.getElementById('canvas-container').style.backgroundColor : '') || localStorage.getItem('emlakstudiom_canvasBgColor') || '',
            uploadedImgW: typeof uploadedImgW !== 'undefined' ? uploadedImgW : window.uploadedImgW, 
            uploadedImgH: typeof uploadedImgH !== 'undefined' ? uploadedImgH : window.uploadedImgH,
            drawMode: typeof drawMode !== 'undefined' ? drawMode : window.drawMode, 
            drawPaths: activeDrawPaths.map(p => {
                const clone = Object.assign({}, p);
                if (clone.el) {
                    if (!clone.el.id) clone.el.id = 'draw_el_' + Math.random().toString(36).substr(2, 9);
                    clone.elId = clone.el.id;
                    delete clone.el;
                }
                return clone;
            }), 
            extraFieldCounter: typeof extraFieldCounter !== 'undefined' ? extraFieldCounter : (window.extraFieldCounter || 0), 
            extraFieldsData: typeof extraFieldsData !== 'undefined' ? extraFieldsData : (window.extraFieldsData || {konut:[], arazi:[]}),
            inputs: {},
            customItems: []
        };

        // Resimleri doğrudan orijinal kalitesinde koru (Sıkıştırma ve kalite kaybı olmadan)
        if (activeUploadedImgUrl) {
            if (activeUploadedImgUrl.startsWith('blob:') && typeof getBase64FromBlobUrl === 'function') {
                state.uploadedImgUrl = await getBase64FromBlobUrl(activeUploadedImgUrl);
            } else {
                state.uploadedImgUrl = activeUploadedImgUrl;
            }
        }

        const elLogo = document.getElementById('elLogo');
        const logoUrl = elLogo && elLogo.src ? elLogo.src : (elLogo && elLogo.style.backgroundImage !== 'none' ? elLogo.style.backgroundImage : '');
        if (typeof getBase64FromCSSUrl === 'function' && logoUrl) {
            state.logoImgUrl = await getBase64FromCSSUrl(logoUrl);
        }

        // Tüm inputları tara
        document.querySelectorAll('input, select, textarea').forEach(el => {
            if(el.id && el.type !== 'file') {
                state.inputs[el.id] = (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value;
            }
        });

        // Preview format
        const formatSelect = document.getElementById('previewFormat');
        state.previewFormat = formatSelect ? formatSelect.value : '16:9 Full HD (YouTube/Banner)';
        state.lastParsedData = window.lastParsedData || null;
        state.smartBadges = window.smartBadges || [];
        state.smartMatchedCallouts = window.smartMatchedCallouts || [];

        // 6. Özel Tasarım Elemanlarını Saf Veri Olarak Kaydet (DOM klonlama yerine!)
        const customItems = [];
        const canvasW = (typeof canvasEl !== 'undefined' && canvasEl && parseInt(canvasEl.style.width)) ? parseInt(canvasEl.style.width) : 1920;
        const canvasH = (typeof canvasEl !== 'undefined' && canvasEl && parseInt(canvasEl.style.height)) ? parseInt(canvasEl.style.height) : 1080;
        state.canvasW = canvasW;
        state.canvasH = canvasH;

        // A. İkonlar
        document.querySelectorAll('#ui-layer .added-icon, #photo-layer .added-icon, #canvas-container .added-icon, #ui-layer .is-svg-icon').forEach(icon => {
            if (icon.closest('.callout-wrap') || icon.closest('.co-neon-block')) return;
            if (icon.classList.contains('editable-draw')) return;
            const isSvg = icon.classList.contains('is-svg-icon') || !!icon.querySelector('svg');
            const clone = icon.cloneNode(true);
            clone.querySelectorAll('.text-handle').forEach(h => h.remove());
            const char = isSvg ? clone.innerHTML : (clone.textContent || '');
            const left = parseFloat(icon.style.left) || 0;
            const top = parseFloat(icon.style.top) || 0;
            customItems.push({
                kind: 'icon',
                char: char,
                isSvg: isSvg,
                left: left,
                top: top,
                xPercent: canvasW > 0 ? (left / canvasW) : 0,
                yPercent: canvasH > 0 ? (top / canvasH) : 0,
                fontSize: parseFloat(icon.style.fontSize) || 60,
                background: icon.style.background || icon.style.backgroundColor || 'rgba(15,23,42,0.6)',
                color: icon.style.color || '#ffffff',
                borderRadius: icon.style.borderRadius || '50%',
                padding: icon.style.padding || '0.28em',
                label: icon.dataset.label || '',
                dataset: Object.assign({}, icon.dataset)
            });
        });

        // B. Metinler, Rozetler & Çerçeveli Kartlar
        document.querySelectorAll('#ui-layer .canvas-el.draggable, #photo-layer .canvas-el.draggable').forEach(el => {
            if (['elBadge', 'elPrice', 'elDetails', 'elLogo', 'badge', 'price', 'details', 'logo_overlay'].includes(el.id)) return;
            if (el.classList.contains('added-icon') || el.classList.contains('is-svg-icon')) return;
            if (el.closest('.callout-wrap') || el.closest('.co-neon-block') || el.closest('.callout-wrapper')) return;
            if (el.classList.contains('normal-el') || el.classList.contains('canva-generated') || el.classList.contains('canva-panel')) return;
            if (el.classList.contains('editable-draw')) return;
            
            const isBadge = el.dataset.label && (el.dataset.label.startsWith('Rozet:') || el.dataset.label.includes('Çerçeveli'));
            const isBox = (el.dataset.label === 'Özel Kutu');
            const text = el.innerText || el.textContent || '';
            const left = parseFloat(el.style.left) || 0;
            const top = parseFloat(el.style.top) || 0;

            customItems.push({
                kind: 'text',
                text: text,
                isBox: isBox,
                isBadge: isBadge,
                label: el.dataset.label || (isBox ? 'Özel Kutu' : 'Serbest Yazı'),
                left: left,
                top: top,
                xPercent: canvasW > 0 ? (left / canvasW) : 0,
                yPercent: canvasH > 0 ? (top / canvasH) : 0,
                fontSize: parseFloat(el.style.fontSize) || 36,
                width: el.style.width || '',
                minWidth: el.style.minWidth || '',
                maxWidth: el.style.maxWidth || '',
                minHeight: el.style.minHeight || '',
                height: el.style.height || '',
                color: el.style.color || '#ffffff',
                background: el.style.background || el.style.backgroundColor || (isBox ? 'rgba(255,255,255,0.9)' : 'transparent'),
                border: el.style.border || (isBox ? '2px solid #000000' : 'none'),
                borderRadius: el.style.borderRadius || (isBox ? '12px' : '0px'),
                padding: el.style.padding || (isBox ? '20px 30px' : '10px'),
                boxShadow: el.style.boxShadow || 'none',
                textShadow: el.style.textShadow || 'none',
                backdropFilter: el.style.backdropFilter || el.style.webkitBackdropFilter || '',
                webkitBackdropFilter: el.style.webkitBackdropFilter || '',
                fontFamily: el.style.fontFamily || '',
                fontWeight: el.style.fontWeight || '',
                textAlign: el.style.textAlign || '',
                whiteSpace: el.style.whiteSpace || '',
                lineHeight: el.style.lineHeight || '',
                letterSpacing: el.style.letterSpacing || '',
                rotation: parseFloat(el.dataset.rotation) || 0,
                dataset: Object.assign({}, el.dataset)
            });
        });

        // C. Callout'lar (SVG ve Neon)
        document.querySelectorAll('#canvas-container .callout-wrap, #workArea .callout-wrap, #canvas-container .co-neon-block').forEach(wrap => {
            const left = parseFloat(wrap.style.left) || 0;
            const top = parseFloat(wrap.style.top) || 0;
            const width = parseFloat(wrap.style.width) || (wrap.offsetWidth || 240);
            const height = parseFloat(wrap.style.height) || (wrap.offsetHeight || 120);
            const scale = parseFloat(wrap.dataset.scale) || 1.0;
            const userScale = parseFloat(wrap.dataset.userScale) || scale;
            const rotation = parseFloat(wrap.dataset.rotation) || 0;
            const isNeon = wrap.classList.contains('co-neon-block');
            
            customItems.push({
                kind: 'callout',
                isNeon: isNeon,
                html: wrap.innerHTML,
                left: left,
                top: top,
                xPercent: canvasW > 0 ? (left / canvasW) : 0,
                yPercent: canvasH > 0 ? (top / canvasH) : 0,
                width: width,
                height: height,
                scale: scale,
                userScale: userScale,
                rotation: rotation,
                dataset: Object.assign({}, wrap.dataset)
            });
        });

        state.customItems = customItems;
        await saveStateToDB(state);
        
        if (Date.now() - lastHistorySaveTime > HISTORY_INTERVAL) {
            await saveHistoryToDB(state);
            lastHistorySaveTime = Date.now();
        }
        
        // Show subtle indicator
        showAutoSaveIndicator();
    } catch(err) {
        console.error("AutoSave error:", err);
    }
}

function showAutoSaveIndicator() {
    // Taslak kaydedildi bildirimi gizlendi - arka planda sessizce kaydedilmeye devam eder
    return;
}

// Restore Logic
async function applyRestoredState(state) {
    try {
        window.isRestoringState = true;
        window._hasRestoredState = true;
        if(!state || !state.version) throw new Error("Geçersiz proje dosyası");

        // Yükleme ekranını göster
        if (typeof window.showAppLoading === 'function') {
            window.showAppLoading('Çalışmanız Yükleniyor...', 'Lütfen bekleyin, tasarım ve katmanlar hazırlanıyor...');
        } else if (typeof showExportLoading === 'function') {
            showExportLoading('Çalışmanız Yükleniyor...', 'Lütfen bekleyin, tasarım ve katmanlar hazırlanıyor...');
        }

        // 1. Tuvaldeki tüm eski canva panellerini ve oluşturulmuş öğeleri sıfırla
        document.querySelectorAll('.canva-generated, .canva-panel').forEach(e => e.remove());
        const crl = document.getElementById('canva-render-layer');
        if (crl) crl.innerHTML = '';
        if (typeof _kolajTemizle === 'function') _kolajTemizle();
        if (typeof clearCanvaTemplate === 'function') clearCanvaTemplate(true);

        document.querySelectorAll('#canvas-container .callout-wrap, #canvas-container .co-neon-block, #canvas-container .callout-wrapper, #ui-layer .added-icon, #photo-layer .added-icon, #canvas-container .added-icon, #canvas-container .editable-draw, #ui-layer .editable-draw').forEach(el => el.remove());
        document.querySelectorAll('#ui-layer .canvas-el.draggable, #photo-layer .canvas-el.draggable').forEach(el => {
            if (['elBadge', 'elPrice', 'elDetails', 'elLogo', 'badge', 'price', 'details', 'logo_overlay'].includes(el.id)) return;
            if (el.classList.contains('normal-el') || el.classList.contains('canva-generated') || el.classList.contains('canva-panel')) return;
            el.remove();
        });

        if (typeof allIcons !== 'undefined') window.allIcons = [];
        const countEl = document.getElementById('iconCount');
        if (countEl) countEl.textContent = '0';

        // 2. Format ve Tuval Boyutlarını Senkron Ayarla
        const savedFormat = state.previewFormat || '16:9 Full HD (YouTube/Banner)';
        const formatEl = document.getElementById('previewFormat');
        if (formatEl && typeof EXPORT_FORMATS !== 'undefined') {
            if (savedFormat === 'Orijinal Görsel Boyutu' && state.uploadedImgW && state.uploadedImgH) {
                if (EXPORT_FORMATS['Orijinal Görsel Boyutu']) {
                    EXPORT_FORMATS['Orijinal Görsel Boyutu'].w = state.uploadedImgW;
                    EXPORT_FORMATS['Orijinal Görsel Boyutu'].h = state.uploadedImgH;
                }
            }
            if (EXPORT_FORMATS[savedFormat]) {
                formatEl.value = savedFormat;
                const format = EXPORT_FORMATS[savedFormat];
                if (typeof canvasEl !== 'undefined' && canvasEl) {
                    canvasEl.style.width = format.w + 'px';
                    canvasEl.style.height = format.h + 'px';
                }
                if (typeof drawCanvas !== 'undefined' && drawCanvas) {
                    drawCanvas.width = format.w;
                    drawCanvas.height = format.h;
                    drawCanvas.style.width = format.w + 'px';
                    drawCanvas.style.height = format.h + 'px';
                }
            }
        }

        // 3. Mod ve Form Alanlarını Hazırla
        const modeToRestore = state.currentMode || state.propertyType || 'satilik_daire';
        if (typeof currentMode !== 'undefined') currentMode = modeToRestore;
        window.currentMode = modeToRestore;

        if (state.propertyType && typeof window.switchPropertyType === 'function') {
            window.switchPropertyType(state.propertyType);
            document.querySelectorAll('.cat-item').forEach(item => item.classList.remove('active'));
            const targetEl = document.querySelector('.cat-item[onclick*="' + state.propertyType + '"]');
            if(targetEl) targetEl.classList.add('active');
        } else if (typeof window.switchMode === 'function') {
            window.switchMode(modeToRestore);
        }

        // 4. Form Girdilerini (Inputları) Geri Yükle
        if(state.inputs) {
            Object.keys(state.inputs).forEach(id => {
                const el = document.getElementById(id);
                if(el && el.type !== 'file') {
                    if(el.type === 'checkbox' || el.type === 'radio') {
                        el.checked = state.inputs[id];
                    } else {
                        el.value = state.inputs[id];
                    }
                }
            });
        }

        // Dinamik Ekstra Alanları Geri Yükle
        if (window.extraFieldsData && state.extraFieldsData) {
            window.extraFieldsData = state.extraFieldsData;
            Object.keys(window.extraFieldsData).forEach(mode => {
                const c = document.getElementById(mode+'ExtraFields');
                if(c) {
                    c.innerHTML = '';
                    window.extraFieldsData[mode].forEach(id => {
                        const row = document.createElement('div');
                        row.className = 'extra-field-row';
                        row.id = 'row_'+id;
                        row.innerHTML = '<input type="text" id="lbl_'+id+'" placeholder="Başlık"><input type="text" id="val_'+id+'" placeholder="Değer"><button class="remove-field" onclick="removeExtraField(\''+id+'\',\''+mode+'\')">➖</button>';
                        c.appendChild(row);
                        document.getElementById('lbl_'+id).addEventListener('input', window.renderData || function(){});
                        document.getElementById('val_'+id).addEventListener('input', window.renderData || function(){});
                        
                        if(state.inputs && state.inputs['lbl_'+id]) document.getElementById('lbl_'+id).value = state.inputs['lbl_'+id];
                        if(state.inputs && state.inputs['val_'+id]) document.getElementById('val_'+id).value = state.inputs['val_'+id];
                    });
                }
            });
        }

        // 5. Boyutlar, Çizim Yolları ve Resim Geri Yükleme
        if (typeof uploadedImgW !== 'undefined') uploadedImgW = state.uploadedImgW || 1920;
        window.uploadedImgW = state.uploadedImgW || 1920;
        
        if (typeof uploadedImgH !== 'undefined') uploadedImgH = state.uploadedImgH || 1080;
        window.uploadedImgH = state.uploadedImgH || 1080;

        const activeDrawPaths = state.drawPaths || [];
        if (typeof drawPaths !== 'undefined') drawPaths = activeDrawPaths;
        window.drawPaths = activeDrawPaths;

        const urlToRestore = state.uploadedImgUrl || '';
        if (typeof uploadedImgUrl !== 'undefined') uploadedImgUrl = urlToRestore;
        window.uploadedImgUrl = urlToRestore;
        window._globalNativeImgSrc = urlToRestore;
        if (window._globalNativeImg) window._globalNativeImg.src = urlToRestore;
        
        const pl = document.getElementById('photo-layer');
        if(urlToRestore) {
            if(pl) {
                pl.style.backgroundImage = "url('" + urlToRestore + "')";
                pl.style.display = 'block';
                pl.dataset.naturalW = state.uploadedImgW || 1920;
                pl.dataset.naturalH = state.uploadedImgH || 1080;
            }
            const clearBgBtn = document.getElementById('clearBgBtn');
            if (clearBgBtn) clearBgBtn.style.display = 'block';
        } else {
            if(pl) pl.style.backgroundImage = "none";
        }

        // Tuval Arka Plan Rengini Geri Yükle (Fotoğraf yokken seçilen renk)
        const bgColorToRestore = state.canvasBgColor || (state.inputs && state.inputs['canvasBgColor']) || localStorage.getItem('emlakstudiom_canvasBgColor') || '';
        if (bgColorToRestore) {
            const canvasContainer = document.getElementById('canvas-container');
            if (canvasContainer) canvasContainer.style.setProperty('background-color', bgColorToRestore, 'important');
            const canvBg = document.getElementById('canvasBgColor');
            if (canvBg) canvBg.value = bgColorToRestore;
            const expBg = document.getElementById('exportBgColor');
            if (expBg) expBg.value = bgColorToRestore;
        }

        const elLogo = document.getElementById('elLogo');
        if(state.logoImgUrl && typeof elLogo !== 'undefined' && elLogo) {
            const img = elLogo.querySelector('img');
            if (img) {
                img.src = state.logoImgUrl;
                img.style.display = 'block';
            }
            elLogo.src = state.logoImgUrl; 
            elLogo.style.display = 'block';
            elLogo.style.visibility = 'visible';
            elLogo.style.zIndex = '9999';
            // Logo her zaman en üstte: canvas-container'ın son çocuğuna taşı
            const _cc = document.getElementById('canvas-container');
            if (_cc && _cc.lastChild !== elLogo) {
                _cc.appendChild(elLogo);
            }
            if (document.getElementById('clearLogoBtn')) document.getElementById('clearLogoBtn').style.display = 'flex';
            if (document.getElementById('logoUploadBtnText')) document.getElementById('logoUploadBtnText').innerText = 'Logoyu Değiştir';
        }

        // 6. Şablon Durumu (Kolaj vs Canva vs Standart)
        const isCanva = (state.isCanvaMode === true);
        const canvaId = state.activeCanvaId || null;
        const stdLayout = state.activeLayout || null;

        if (typeof isCanvaMode !== 'undefined') isCanvaMode = isCanva;
        window.isCanvaMode = isCanva;

        if (typeof activeCanvaId !== 'undefined') activeCanvaId = canvaId;
        window.activeCanvaId = canvaId;

        if (typeof activeLayout !== 'undefined') activeLayout = stdLayout;
        window.activeLayout = stdLayout;

        if (state.isKolajMode && state.kolajHtml) {
            document.querySelectorAll('.normal-el').forEach(el => el.style.visibility = 'hidden');
            let kolajWrap = document.getElementById('kolaj-wrapper');
            if (!kolajWrap) {
                kolajWrap = document.createElement('div');
                kolajWrap.id = 'kolaj-wrapper';
                kolajWrap.style.position = 'absolute';
                kolajWrap.style.left = '0';
                kolajWrap.style.top = '0';
                kolajWrap.style.width = '100%';
                kolajWrap.style.height = '100%';
                kolajWrap.style.overflow = 'hidden';
                kolajWrap.style.zIndex = '5';
                const canvasContainer = document.getElementById('canvas-container');
                if (canvasContainer) canvasContainer.appendChild(kolajWrap);
            }
            kolajWrap.innerHTML = state.kolajHtml;
            if (state.kolajBg) kolajWrap.style.background = state.kolajBg;
            if (state.kolajAktif && typeof _kolajAktif !== 'undefined') _kolajAktif = state.kolajAktif;
            if (typeof _kolajFormatGuncelle === 'function') _kolajFormatGuncelle();
        } else if (isCanva && canvaId) {
            document.querySelectorAll('.normal-el').forEach(el => el.style.visibility = 'hidden');
            if (state.canvaHtml) {
                const crl = document.getElementById('canva-render-layer');
                if (crl) {
                    crl.innerHTML = state.canvaHtml;
                    crl.style.display = 'block';
                    crl.querySelectorAll('.photo-panel').forEach(p => {
                        if (typeof _preparePhoto === 'function') _preparePhoto(p);
                        if (typeof _applyPhotoTransform === 'function') _applyPhotoTransform(p);
                    });
                    crl.querySelectorAll('.editable-text').forEach(el => {
                        if (typeof enableInlineEdit === 'function') enableInlineEdit(el);
                        if (typeof bindDrag === 'function') bindDrag(el);
                    });
                }
            } else if (typeof refreshActiveCanvaTemplate === 'function') {
                refreshActiveCanvaTemplate();
            }
        } else if (state.hasStandardTemplate && stdLayout && stdLayout !== 'none' && stdLayout !== 'empty') {
            document.querySelectorAll('.canva-generated, .canva-panel').forEach(e => e.remove());
            if (typeof setTemplate === 'function') {
                setTemplate(stdLayout);
            } else if (typeof TPL !== 'undefined' && TPL[stdLayout]) {
                const t = TPL[stdLayout];
                if (typeof elBadge !== 'undefined' && elBadge && t.badge) applyStylePos(elBadge, t.badge);
                if (typeof elPrice !== 'undefined' && elPrice && t.price) applyStylePos(elPrice, t.price);
                if (typeof elDetails !== 'undefined' && elDetails && t.details) applyStylePos(elDetails, t.details);
                if (typeof elLogo !== 'undefined' && elLogo && t.logo) applyStylePos(elLogo, t.logo);
            }
            if (typeof elBadge !== 'undefined' && elBadge) { elBadge.style.visibility = 'visible'; elBadge.style.display = 'block'; }
            if (typeof elPrice !== 'undefined' && elPrice) { elPrice.style.visibility = 'visible'; elPrice.style.display = 'block'; }
            if (typeof elDetails !== 'undefined' && elDetails) { elDetails.style.visibility = 'visible'; elDetails.style.display = 'block'; }
            const il = document.getElementById('infoLineText');
            if (il) { il.style.visibility = 'visible'; il.style.display = 'block'; }
            document.querySelectorAll('.template-btn').forEach(b => b.classList.toggle('active', b.id === 'tpl-' + stdLayout));
        } else {
            if (typeof clearAllTemplates === 'function') clearAllTemplates();
            if (typeof elBadge !== 'undefined' && elBadge) { elBadge.style.visibility = 'hidden'; elBadge.style.display = 'none'; }
            if (typeof elPrice !== 'undefined' && elPrice) { elPrice.style.visibility = 'hidden'; elPrice.style.display = 'none'; }
            if (typeof elDetails !== 'undefined' && elDetails) { elDetails.style.visibility = 'hidden'; elDetails.style.display = 'none'; }
            const il = document.getElementById('infoLineText');
            if (il) { il.style.visibility = 'hidden'; il.style.display = 'none'; }
        }

        // 6.1. Uygulanan Pro Renk Paletini Geri Yükle
        if (state.lastAppliedPalette) {
            window.lastAppliedPalette = state.lastAppliedPalette;
            if (typeof applyTemplateTheme === 'function' && state.lastAppliedPalette.bg) {
                applyTemplateTheme(
                    state.lastAppliedPalette.bg,
                    state.lastAppliedPalette.accent,
                    state.lastAppliedPalette.titleText || state.lastAppliedPalette.accent || '#ffffff',
                    state.lastAppliedPalette.text,
                    state.lastAppliedPalette.applyBg !== false,
                    state.lastAppliedPalette.glow,
                    state.lastAppliedPalette.name
                );
            }
        }

        // 6.1. Global Font Ayarını Geri Yükle
        const fontToRestore = state.currentFont || localStorage.getItem('emlakstudiom_currentFont') || '';
        if (fontToRestore) {
            if (typeof currentFont !== 'undefined') currentFont = fontToRestore;
            window.currentFont = fontToRestore;
            const sel = document.getElementById('fontQuickSelect');
            if (sel) sel.value = fontToRestore;
            document.querySelectorAll('.font-preview').forEach(x => x.classList.toggle('active', x.dataset.family === fontToRestore));
            if (typeof applyFontSettings === 'function') applyFontSettings();
        }

        // 7. Özel Tasarım Elemanlarını Saf Veri Olarak Yeniden Oluştur (100% Temiz & Hatasız)
        const targetCanvasW = (typeof canvasEl !== 'undefined' && canvasEl && parseInt(canvasEl.style.width)) ? parseInt(canvasEl.style.width) : 1920;
        const targetCanvasH = (typeof canvasEl !== 'undefined' && canvasEl && parseInt(canvasEl.style.height)) ? parseInt(canvasEl.style.height) : 1080;
        const uiLayer = document.getElementById('ui-layer') || document.getElementById('canvas-container');

        if (state.customItems && Array.isArray(state.customItems)) {
            state.customItems.forEach(item => {
                if (!item || !item.kind) return;
                
                if (item.kind === 'icon') {
                    const icon = document.createElement('div');
                    icon.className = 'draggable added-icon canvas-el' + (item.isSvg ? ' is-svg-icon' : '');
                    if (item.isSvg) {
                        icon.innerHTML = item.char;
                    } else {
                        icon.textContent = item.char;
                    }
                    icon.dataset.label = item.label || ('İkon: ' + (item.isSvg ? 'SVG' : item.char));
                    if (item.dataset) {
                        Object.keys(item.dataset).forEach(k => { icon.dataset[k] = item.dataset[k]; });
                    }
                    const posX = typeof item.left !== 'undefined' ? item.left : Math.round(item.xPercent * targetCanvasW);
                    const posY = typeof item.top !== 'undefined' ? item.top : Math.round(item.yPercent * targetCanvasH);
                    icon.style.position = 'absolute';
                    icon.style.left = posX + 'px';
                    icon.style.top = posY + 'px';
                    icon.style.fontSize = (item.fontSize || 60) + 'px';
                    icon.style.padding = item.padding || '0.28em';
                    icon.style.borderRadius = item.borderRadius || '50%';
                    icon.style.background = item.background || 'rgba(15,23,42,0.6)';
                    icon.style.color = item.color || '#ffffff';
                    icon.style.opacity = '1';
                    icon.style.border = 'none';
                    icon.style.zIndex = '10';
                    icon.style.display = 'inline-flex';
                    icon.style.alignItems = 'center';
                    icon.style.justifyContent = 'center';
                    icon.style.aspectRatio = '1 / 1';
                    icon.style.lineHeight = '1';
                    icon.style.textAlign = 'center';
                    icon.style.visibility = 'visible';
                    icon.style.boxSizing = 'border-box';
                    
                    if (uiLayer) uiLayer.appendChild(icon);
                    if (typeof bindDrag === 'function') bindDrag(icon);
                    if (typeof enableInlineEdit === 'function') enableInlineEdit(icon);
                    if (typeof allIcons !== 'undefined' && Array.isArray(allIcons)) {
                        allIcons.push(icon);
                        if (countEl) countEl.textContent = allIcons.length;
                    }
                } else if (item.kind === 'text') {
                    const el = document.createElement('div');
                    el.className = 'draggable canvas-el';
                    el.textContent = item.text || 'METİN';
                    el.dataset.label = item.label || (item.isBox ? 'Özel Kutu' : 'Serbest Yazı');
                    el.dataset.defaultFont = item.fontSize || '36';
                    el.dataset.rotation = item.rotation || '0';
                    if (item.dataset) {
                        Object.keys(item.dataset).forEach(k => { el.dataset[k] = item.dataset[k]; });
                    }
                    const posX = typeof item.left !== 'undefined' ? item.left : Math.round(item.xPercent * targetCanvasW);
                    const posY = typeof item.top !== 'undefined' ? item.top : Math.round(item.yPercent * targetCanvasH);
                    el.style.position = 'absolute';
                    el.style.left = posX + 'px';
                    el.style.top = posY + 'px';
                    el.style.fontSize = (item.fontSize || 36) + 'px';
                    if (item.width) el.style.width = item.width;
                    if (item.minWidth) el.style.minWidth = item.minWidth;
                    if (item.maxWidth) el.style.maxWidth = item.maxWidth;
                    if (item.minHeight) el.style.minHeight = item.minHeight;
                    if (item.height) el.style.height = item.height;
                    if (item.padding) el.style.padding = item.padding;
                    if (item.borderRadius) el.style.borderRadius = item.borderRadius;
                    if (item.background) el.style.background = item.background;
                    if (item.color) el.style.color = item.color;
                    if (item.border) el.style.border = item.border;
                    if (item.boxShadow) el.style.boxShadow = item.boxShadow;
                    if (item.textShadow) el.style.textShadow = item.textShadow;
                    if (item.backdropFilter) el.style.backdropFilter = item.backdropFilter;
                    if (item.webkitBackdropFilter) el.style.webkitBackdropFilter = item.webkitBackdropFilter;
                    if (item.fontFamily) el.style.fontFamily = item.fontFamily;
                    if (item.fontWeight) el.style.fontWeight = item.fontWeight;
                    if (item.textAlign) el.style.textAlign = item.textAlign;
                    if (item.whiteSpace) el.style.whiteSpace = item.whiteSpace;
                    if (item.lineHeight) el.style.lineHeight = item.lineHeight;
                    if (item.letterSpacing) el.style.letterSpacing = item.letterSpacing;
                    el.style.zIndex = '9999';
                    el.style.display = 'block';
                    el.style.boxSizing = 'border-box';
                    el.style.overflow = 'visible';
                    el.style.visibility = 'visible';
                    
                    if (uiLayer) uiLayer.appendChild(el);
                    if (typeof bindDrag === 'function') bindDrag(el);
                    if (typeof enableInlineEdit === 'function') enableInlineEdit(el);
                    el.addEventListener('dblclick', () => {
                        if (typeof switchTab === 'function') switchTab('element');
                    });
                } else if (item.kind === 'callout') {
                    const workArea = document.getElementById('canvas-container') || document.getElementById('workArea');
                    if (workArea && item.html) {
                        const wrap = document.createElement('div');
                        wrap.className = item.isNeon ? 'co-neon-block draggable' : 'callout-wrap svg-callout draggable';
                        wrap.innerHTML = item.html;
                        const posX = typeof item.left !== 'undefined' ? item.left : Math.round(item.xPercent * targetCanvasW);
                        const posY = typeof item.top !== 'undefined' ? item.top : Math.round(item.yPercent * targetCanvasH);
                        wrap.style.position = 'absolute';
                        wrap.style.left = posX + 'px';
                        wrap.style.top = posY + 'px';
                        wrap.style.width = (item.width || 240) + 'px';
                        wrap.style.height = (item.height || 120) + 'px';
                        wrap.style.transform = `rotate(${item.rotation || 0}deg) scale(${item.scale || 1.0})`;
                        wrap.style.zIndex = '500';
                        wrap.style.cursor = 'move';
                        wrap.style.display = 'block';
                        wrap.style.visibility = 'visible';

                        wrap.dataset.origCanvasW = targetCanvasW;
                        wrap.dataset.origCanvasH = targetCanvasH;
                        wrap.dataset.userScale = item.userScale || item.scale || 1.0;
                        wrap.dataset.scale = item.scale || 1.0;
                        wrap.dataset.rotation = item.rotation || 0;
                        if (item.dataset) {
                            Object.keys(item.dataset).forEach(k => { wrap.dataset[k] = item.dataset[k]; });
                        }

                        workArea.appendChild(wrap);
                        if (!item.isNeon && typeof window.rebindSVGCallout === 'function') {
                            window.rebindSVGCallout(wrap);
                        } else if (item.isNeon && typeof window.rebindNeonCallout === 'function') {
                            window.rebindNeonCallout(wrap);
                        }
                    }
                }
            });
        }
        
        // Re-create DOM SVG elements for drawPaths
        if (activeDrawPaths && activeDrawPaths.length > 0) {
            document.querySelectorAll('#canvas-container .editable-draw, #ui-layer .editable-draw').forEach(el => el.remove());
            activeDrawPaths.forEach((p, idx) => {
                const createFn = (typeof createSVGFromPath === 'function') ? createSVGFromPath : window.createSVGFromPath;
                if (typeof createFn === 'function') {
                    const el = createFn(p);
                    if (el) {
                        p.el = el;
                        el.dataset.pathIndex = idx;
                        if (p.elId) el.id = p.elId;
                        if (typeof allIcons !== 'undefined' && !allIcons.includes(el)) {
                            allIcons.push(el);
                        }
                    }
                }
            });
            if (typeof allIcons !== 'undefined') {
                const countEl = document.getElementById('iconCount');
                if (countEl) countEl.textContent = allIcons.length;
            }
        }

        // 7.1. İlana Hazır Ögeler (Smart Suggestions) Geri Yükleme
        if (state.lastParsedData) window.lastParsedData = state.lastParsedData;
        window.smartBadges = (state.smartBadges && Array.isArray(state.smartBadges)) ? state.smartBadges : [];
        window.smartMatchedCallouts = (state.smartMatchedCallouts && Array.isArray(state.smartMatchedCallouts)) ? state.smartMatchedCallouts : [];
        window.smartMatchedIcons = (state.smartMatchedIcons && Array.isArray(state.smartMatchedIcons)) ? state.smartMatchedIcons : [];
        window.smartDefaultFramedText = state.smartDefaultFramedText || '';

        if (typeof window.renderSmartSuggestionsUI === 'function') {
            window.renderSmartSuggestionsUI();
        }

        // 8. Render & Redraw Güncellemeleri
        if(typeof renderData === 'function') renderData();
        if(typeof applyPhotoPos === 'function') applyPhotoPos();
        if(typeof resizeCanvas === 'function') resizeCanvas();
        if(typeof redrawAll === 'function') redrawAll();
        if(typeof updateDrawHistory === 'function') updateDrawHistory();
        if(typeof window.renderLayers === 'function') window.renderLayers();
        if(fontToRestore && typeof applyFontSettings === 'function') applyFontSettings();
        if(typeof window.resetCanvasZoom === 'function') window.resetCanvasZoom();

        // 9. Çizim Modunu Kapat ve Çizimleri Tıklanabilir Yap
        if (typeof setDrawMode === 'function') setDrawMode('off');

        showAutoSaveIndicator();
        const autoInd = document.getElementById('autosave-indicator');
        if (autoInd) autoInd.innerHTML = '✓ Çalışmanız geri yüklendi';

    } catch(e) {
        console.error("AutoSave Restore error:", e);
        alert("Kurtarma başarısız: " + e.message);
    } finally {
        setTimeout(() => {
            if (typeof window.hideAppLoading === 'function') {
                window.hideAppLoading();
            } else if (typeof hideExportLoading === 'function') {
                hideExportLoading();
            }
            setTimeout(() => {
                window.isRestoringState = false;
            }, 200);
        }, 500);
    }
}

function showRecoveryModal(savedData) {
    // Başlangıç yükleyicisini hemen kaldır ki modalın üstünü kapatmasın
    const initLoader = document.getElementById('initialAppLoader');
    if (initLoader) initLoader.remove();

    const modalHtml = `
        <div id="recoveryModal" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(10,14,26,0.96); z-index:100000000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);">
            <div class="export-loader-card" style="max-width:420px; padding:32px 36px; text-align:center; border:1px solid rgba(0,210,255,0.35); box-shadow:0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(0,210,255,0.2); border-radius:20px; background:rgba(18,22,38,0.95); animation:loaderPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);">
                <div style="width:58px; height:58px; border-radius:50%; background:rgba(0,210,255,0.1); border:1.5px solid rgba(0,210,255,0.4); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; box-shadow:0 0 20px rgba(0,210,255,0.25);">
                    <i class="fa-solid fa-clock-rotate-left" style="font-size:24px; color:#00d2ff;"></i>
                </div>
                <h3 style="color:#ffffff; margin:0 0 8px 0; font-size:18px; font-weight:700; letter-spacing:-0.2px; font-family:'Plus Jakarta Sans','Space Grotesk',sans-serif;">Yarım Kalan Çalışmanız Var</h3>
                <p style="color:#94a3b8; font-size:13.5px; margin:0 0 24px 0; line-height:1.55;">Önceki oturumunuzdan kaydedilmiş bir taslak bulundu. Kaldığınız yerden devam etmek ister misiniz?</p>
                <div style="display:flex; gap:12px; width:100%;">
                    <button id="btnRecover" style="flex:1; background:linear-gradient(135deg, #0ea5e9, #6366f1); color:#fff; border:none; padding:12px 16px; border-radius:10px; font-weight:700; font-size:13px; cursor:pointer; box-shadow:0 8px 20px rgba(14,165,233,0.35); transition:all 0.2s;">✨ Evet, Geri Yükle</button>
                    <button id="btnDiscard" style="flex:1; background:rgba(30,41,59,0.85); color:#cbd5e1; border:1px solid rgba(255,255,255,0.12); padding:12px 16px; border-radius:10px; font-weight:600; font-size:13px; cursor:pointer; transition:all 0.2s;">🗑️ Hayır, Temizle</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('btnRecover').onclick = async () => {
        // 1. Önce ANINDA yeni şık yükleme ekranını aç
        if (typeof window.showAppLoading === 'function') {
            window.showAppLoading('Çalışmanız Yükleniyor...', 'Lütfen bekleyin, tasarım ve katmanlar hazırlanıyor...');
        } else if (typeof showExportLoading === 'function') {
            showExportLoading('Çalışmanız Yükleniyor...', 'Lütfen bekleyin, tasarım ve katmanlar hazırlanıyor...');
        }
        
        // 2. Modalı kaldır
        const modal = document.getElementById('recoveryModal');
        if (modal) modal.remove();
        
        await new Promise(r => setTimeout(r, 60));
        
        // 3. Durumu geri yükle
        await applyRestoredState(savedData.state);
        
        // 4. Otomatik kaydı tekrar başlat
        startAutoSaveTimer();
    };
    
    document.getElementById('btnDiscard').onclick = async () => {
        if (typeof window.showAppLoading === 'function') {
            window.showAppLoading('Yeni Çalışma Başlatılıyor...', 'Tuval ve alanlar sıfırlanıyor...');
        }
        const modal = document.getElementById('recoveryModal');
        if (modal) modal.remove();
        await deleteStateFromDB();
        startAutoSaveTimer();
        setTimeout(() => {
            if (typeof window.hideAppLoading === 'function') {
                window.hideAppLoading(150);
            }
        }, 300);
    };
}

function startAutoSaveTimer() {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    autoSaveInterval = setInterval(performAutoSave, 5000); // 5 seconds
}

// Boot Sequence
async function bootAutoSave() {
    try {
        await initAutoSaveDB();
        const savedData = await loadStateFromDB();
        
        if (savedData && savedData.state && savedData.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
            // Kullanıcıyı açılışta pop-up ile rahatsız etmeden arka planda taslağı sakla
            window._lastAutoSavedDraft = savedData;
            console.log('[AutoSave] Kayıtlı son taslak hazır:', new Date(savedData.timestamp).toLocaleTimeString());
        }
        startAutoSaveTimer();
    } catch(err) {
        console.error('AutoSave boot failed:', err);
    }
}

window.restoreLastAutoSave = async function() {
    try {
        const savedData = window._lastAutoSavedDraft || await loadStateFromDB();
        if (savedData && savedData.state) {
            if (typeof window.showAppLoading === 'function') {
                window.showAppLoading('Çalışmanız Yükleniyor...', 'Lütfen bekleyin, tasarım ve katmanlar hazırlanıyor...');
            }
            await applyRestoredState(savedData.state);
            startAutoSaveTimer();
            return true;
        } else {
            alert('Kayıtlı otomatik taslak bulunamadı.');
            return false;
        }
    } catch(e) {
        console.error('Taslak geri yüklenemedi:', e);
        return false;
    }
};

// Add event listener safely
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAutoSave);
} else {
    bootAutoSave();
}

window.addEventListener('beforeunload', () => {
    if (!window.isRestoringState && typeof performAutoSave === 'function') {
        performAutoSave();
    }
});

window.addEventListener('pagehide', () => {
    if (!window.isRestoringState && typeof performAutoSave === 'function') {
        performAutoSave();
    }
});




// --- PROJE GEÇMİŞİ (UI YÖNETİMİ) ---

function formatTimestamp(ts) {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    
    if (d.toDateString() === today.toDateString()) {
        return "Bugün " + timeStr;
    } else if (d.toDateString() === yesterday.toDateString()) {
        return "Dün " + timeStr;
    } else {
        return d.toLocaleDateString('tr-TR') + " " + timeStr;
    }
}

async function renderProjectHistory() {
    const container = document.getElementById('projectHistoryContainer');
    if (!container) return;
    
    container.innerHTML = '<div style="font-size:11px; color:#94a3b8; text-align:center; padding:10px;">Geçmiş kayıtlar yükleniyor...</div>';
    
    try {
        const history = await getHistoryFromDB();
        if (!history || history.length === 0) {
            container.innerHTML = '<div style="font-size:11px; color:#94a3b8; text-align:center; padding:10px;">Henüz geçmiş kayıt bulunmuyor. Sistem arka planda otomatik kayıt aldıkça burada listelenecektir.</div>';
            return;
        }
        
        container.innerHTML = '';
        history.forEach((record, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-action';
            if (index === 0) {
                btn.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
            } else {
                btn.style.background = '#1e293b';
                btn.style.border = '1px solid #334155';
            }
            btn.style.color = '#fff';
            btn.style.textAlign = 'left';
            btn.style.padding = '8px 12px';
            btn.style.display = 'flex';
            btn.style.justifyContent = 'space-between';
            btn.style.alignItems = 'center';
            
            const dateStr = formatTimestamp(record.timestamp);
            btn.innerHTML = '<span>⏳ ' + dateStr + '</span> <span style="font-size:10px; color:#cbd5e1;">Geri Dön</span>';
            
            btn.onclick = async () => {
                if(confirm(dateStr + ' tarihli projeye geri dönmek istediğinize emin misiniz? Mevcut değişiklikleriniz kaybolabilir.')) {
                    try {
                        const state = await loadHistoryStateFromDB(record.id);
                        await applyRestoredState(state.state);
                        alert('Proje geçmişten başarıyla yüklendi!');
                    } catch(e) {
                        alert('Hata: Kayıt yüklenemedi! ' + e);
                    }
                }
            };
            container.appendChild(btn);
        });
        
    } catch(err) {
        container.innerHTML = '<div style="font-size:11px; color:#ef4444; text-align:center; padding:10px;">Geçmiş yüklenirken hata oluştu.</div>';
    }
}


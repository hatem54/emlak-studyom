// autoSave.js
// Handles background Auto-Save using IndexedDB to prevent localStorage limits

const DB_NAME = 'CanvaAutoSaveDB';
const DB_VERSION = 1;
const STORE_NAME = 'autosave_store';

let dbInstance = null;
let autoSaveInterval = null;

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
            
            if (historyRecords.length > 10) {
                const toDelete = historyRecords.slice(10);
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
        
        if (!hasPhoto && !isCanvaModeActive && !hasDrawings && !hasInputs) return; // Nothing meaningful to save
        
        const activeUploadedImgUrl = typeof uploadedImgUrl !== 'undefined' ? uploadedImgUrl : window.uploadedImgUrl;
        const state = {
            version: 1,
            currentMode: typeof currentMode !== 'undefined' ? currentMode : window.currentMode,
            propertyType: typeof currentMode !== 'undefined' ? currentMode : (window.currentMode || 'satilik_daire'),
            activeLayout: typeof activeLayout !== 'undefined' ? activeLayout : window.activeLayout, 
            isCanvaMode: isCanvaModeActive, 
            activeCanvaId: typeof activeCanvaId !== 'undefined' ? activeCanvaId : window.activeCanvaId,
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
            customElements: []
        };

        // Resimleri Base64'e çevir (Eğer getBase64FromBlobUrl tanımlıysa)
        if (typeof getBase64FromBlobUrl === 'function' && activeUploadedImgUrl) {
            state.uploadedImgUrl = await getBase64FromBlobUrl(activeUploadedImgUrl);
        }

        const elLogo = document.getElementById('elLogo');
        const logoUrl = elLogo && elLogo.style.backgroundImage !== 'none' ? elLogo.style.backgroundImage : '';
        if (typeof getBase64FromCSSUrl === 'function') {
            state.logoImgUrl = await getBase64FromCSSUrl(logoUrl);
        }

        // Tüm inputları tara
        document.querySelectorAll('input, select, textarea').forEach(el => {
            if(el.id && el.type !== 'file') {
                state.inputs[el.id] = (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value;
            }
        });

        // Tüm özel elemanları kaydet
        document.querySelectorAll('#photo-layer .draggable, #ui-layer .draggable, #photo-layer .cvi-item, #ui-layer .cvi-item, #photo-layer .canvas-el, #ui-layer .canvas-el, #ui-layer .callout-wrapper, #photo-layer .callout-wrapper, #ui-layer .saber-text, #photo-layer .saber-text, #ui-layer .dynamic-box, #photo-layer .dynamic-box, #ui-layer .svg-icon, #photo-layer .svg-icon, #ui-layer .icon-wrapper, #photo-layer .icon-wrapper').forEach(el => {
            if(['badge', 'price', 'details', 'logo_overlay', 'elLogo'].includes(el.id)) return;
            if(el.classList.contains('editable-draw')) return; // Zaten drawPaths üzerinden yeniden oluşturuluyor, DOM kopyasını kaydetme!
            
            // Remove selection handles before saving
            const handles = Array.from(el.querySelectorAll('.text-handle'));
            handles.forEach(h => h.remove());
            
            state.customElements.push({
                id: el.id,
                parentId: el.parentElement ? el.parentElement.id : 'ui-layer',
                className: el.className,
                innerHTML: el.innerHTML,
                style: el.getAttribute('style'),
                dataset: Object.assign({}, el.dataset)
            });
            
            // Restore handles
            handles.forEach(h => el.appendChild(h));
        });        await saveStateToDB(state);
        
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
    let ind = document.getElementById('autosave-indicator');
    if (!ind) {
        ind = document.createElement('div');
        ind.id = 'autosave-indicator';
        ind.style.position = 'fixed';
        ind.style.bottom = '10px';
        ind.style.right = '10px';
        ind.style.background = 'rgba(0,0,0,0.6)';
        ind.style.color = '#fff';
        ind.style.padding = '5px 10px';
        ind.style.borderRadius = '4px';
        ind.style.fontSize = '11px';
        ind.style.zIndex = '999999';
        ind.style.pointerEvents = 'none';
        ind.innerHTML = '✓ Taslak kaydedildi';
        document.body.appendChild(ind);
    }
    ind.style.opacity = '1';
    ind.style.transition = 'none';
    
    setTimeout(() => {
        ind.style.transition = 'opacity 1s ease';
        ind.style.opacity = '0';
    }, 2000);
}

// Restore Logic
async function applyRestoredState(state) {
    try {
        if(!state.version) throw new Error("Geçersiz proje dosyası");

        if(typeof currentMode !== 'undefined') {
            currentMode = state.currentMode || 'daire';
            if(currentMode === 'konut') currentMode = 'daire';
        } else {
            window.currentMode = state.currentMode || 'daire';
            if(window.currentMode === 'konut') window.currentMode = 'daire';
        }
        
        if(state.propertyType) {
            // Restore accordion active state
            document.querySelectorAll('.cat-item').forEach(item => item.classList.remove('active'));
            const targetEl = document.querySelector('.cat-item[onclick*="' + state.propertyType + '"]');
            if(targetEl) {
                targetEl.classList.add('active');
            }
            if(typeof switchPropertyType === 'function') switchPropertyType(state.propertyType);
            else if(window.switchPropertyType) window.switchPropertyType(state.propertyType);
        }
        
        if(typeof activeLayout !== 'undefined') activeLayout = typeof state.activeLayout !== 'undefined' ? state.activeLayout : 't1';
        else window.activeLayout = typeof state.activeLayout !== 'undefined' ? state.activeLayout : 't1';
        
        let activeIsCanvaMode = !!state.isCanvaMode;
        let activeCanvaIdVal = state.activeCanvaId || '';
        if (activeIsCanvaMode && !activeCanvaIdVal) activeIsCanvaMode = false;
        
        if (typeof isCanvaMode !== 'undefined') isCanvaMode = activeIsCanvaMode;
        else window.isCanvaMode = activeIsCanvaMode;
        
        if (typeof activeCanvaId !== 'undefined') activeCanvaId = activeCanvaIdVal;
        else window.activeCanvaId = activeCanvaIdVal;
        
        if (typeof uploadedImgW !== 'undefined') uploadedImgW = state.uploadedImgW || 1920;
        else window.uploadedImgW = state.uploadedImgW || 1920;
        
        if (typeof uploadedImgH !== 'undefined') uploadedImgH = state.uploadedImgH || 1080;
        else window.uploadedImgH = state.uploadedImgH || 1080;
        
        if (typeof drawPaths !== 'undefined') {
            drawPaths = state.drawPaths || [];
        } else {
            window.drawPaths = state.drawPaths || [];
        }
        
        if (typeof extraFieldCounter !== 'undefined') extraFieldCounter = state.extraFieldCounter || 0;
        else window.extraFieldCounter = state.extraFieldCounter || 0;
        
        const newExtra = state.extraFieldsData || {konut:[],arazi:[]};
        if(typeof extraFieldsData !== 'undefined') {
            extraFieldsData.konut = newExtra.konut || [];
            extraFieldsData.arazi = newExtra.arazi || [];
        } else if (window.extraFieldsData) {
            window.extraFieldsData.konut = newExtra.konut || [];
            window.extraFieldsData.arazi = newExtra.arazi || [];
        }

        document.querySelectorAll('#photo-layer .draggable, #ui-layer .draggable, #photo-layer .cvi-item, #ui-layer .cvi-item, #photo-layer .canvas-el, #ui-layer .canvas-el').forEach(el => {
            if(['badge', 'price', 'details', 'logo_overlay', 'elLogo'].includes(el.id)) return;
            el.remove();
        });
        
        if (typeof allIcons !== 'undefined') window.allIcons = [];

        if(state.inputs) {
            Object.keys(state.inputs).forEach(id => {
                const el = document.getElementById(id);
                if(el && el.type !== 'file') {
                    if(el.type === 'checkbox' || el.type === 'radio') {
                        el.checked = state.inputs[id];
                    } else {
                        el.value = state.inputs[id];
                    }
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        }

        if (window.extraFieldsData) {
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

        if(state.customElements) {
            state.customElements.forEach(data => {
                const el = document.createElement('div');
                if(data.id) el.id = data.id;
                el.className = data.className;
                el.innerHTML = data.innerHTML;
                if(data.style) el.setAttribute('style', data.style);
                if(data.dataset) {
                    Object.keys(data.dataset).forEach(k => el.dataset[k] = data.dataset[k]);
                }
                const parent = document.getElementById(data.parentId || 'ui-layer');
                if (parent) parent.appendChild(el);
                else {
                    const pl = document.getElementById('photo-layer');
                    if (pl) pl.appendChild(el);
                }
                if (typeof window.makeDraggable === 'function') window.makeDraggable(el);
                if (el.classList.contains('canvas-el') && typeof window.enableInlineEdit === 'function') window.enableInlineEdit(el);
                if (el.classList.contains('icon-el') && typeof allIcons !== 'undefined') {
                    window.allIcons.push(el);
                }
            });
        }
        
        // Re-link DOM elements in drawPaths
        const activeDrawPaths = typeof drawPaths !== 'undefined' ? drawPaths : (window.drawPaths || []);
        if (activeDrawPaths && activeDrawPaths.length > 0) {
            activeDrawPaths.forEach(p => {
                if (p.elId) p.el = document.getElementById(p.elId);
            });
        }

        const urlToRestore = state.uploadedImgUrl || '';
        if (typeof uploadedImgUrl !== 'undefined') uploadedImgUrl = urlToRestore;
        else window.uploadedImgUrl = urlToRestore;
        
        const pl = document.getElementById('photo-layer');
        if(urlToRestore) {
            if(pl) pl.style.backgroundImage = "url('" + urlToRestore + "')";
            if(typeof trackImageSize === 'function') trackImageSize(urlToRestore);
        } else {
            if(pl) pl.style.backgroundImage = "none";
        }

        const elLogo = document.getElementById('elLogo');
        if(state.logoImgUrl && typeof elLogo !== 'undefined' && elLogo) {
            elLogo.style.backgroundImage = "url('" + state.logoImgUrl + "')";
            elLogo.src = state.logoImgUrl; 
        }

        const restoredCurrentMode = typeof currentMode !== 'undefined' ? currentMode : window.currentMode;
        if(typeof switchMode === 'function') switchMode(restoredCurrentMode);
        
        const restoredIsCanvaMode = typeof isCanvaMode !== 'undefined' ? isCanvaMode : window.isCanvaMode;
        const restoredActiveLayout = typeof activeLayout !== 'undefined' ? activeLayout : window.activeLayout;
        
        if(restoredIsCanvaMode) {
            if(typeof refreshActiveCanvaTemplate === 'function') refreshActiveCanvaTemplate();
        } else {
            if(restoredActiveLayout) {
                if(typeof setTemplate === 'function') setTemplate(restoredActiveLayout);
            } else {
                if(typeof clearAllTemplates === 'function') clearAllTemplates();
                const elBadge = document.getElementById('badge');
                const elPrice = document.getElementById('price');
                const elDetails = document.getElementById('details');
                if(elBadge) elBadge.style.visibility='hidden';
                if(elPrice) elPrice.style.visibility='hidden';
                if(elDetails) elDetails.style.visibility='hidden';
            }
        }

        if(typeof renderData === 'function') renderData();
        if(typeof redrawAll === 'function') redrawAll();
        if(typeof updateDrawHistory === 'function') updateDrawHistory();

        // Optional: show success toast
        showAutoSaveIndicator();
        document.getElementById('autosave-indicator').innerHTML = '✓ Çalışmanız geri yüklendi';

    } catch(e) {
        console.error("AutoSave Restore error:", e);
        alert("Kurtarma başarısız: " + e.message);
    }
}

function showRecoveryModal(savedData) {
    const modalHtml = `
        <div id="recoveryModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.9); z-index:9999999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px);">
            <div style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:25px; max-width:400px; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
                <div style="font-size:40px; margin-bottom:15px;">🕒</div>
                <h3 style="color:#fff; margin:0 0 10px 0; font-family:'Space Grotesk',sans-serif;">Yarım Kalan Çalışmanız Var</h3>
                <p style="color:#94a3b8; font-size:14px; margin-bottom:20px; line-height:1.5;">Beklenmedik bir kapanma veya yenileme tespiti yaptık. En son kaldığınız yerden devam etmek ister misiniz?</p>
                <div style="display:flex; gap:10px;">
                    <button id="btnRecover" style="flex:1; background:#3b82f6; color:#fff; border:none; padding:12px; border-radius:6px; font-weight:bold; cursor:pointer;">Evet, Geri Yükle</button>
                    <button id="btnDiscard" style="flex:1; background:#475569; color:#cbd5e1; border:none; padding:12px; border-radius:6px; font-weight:bold; cursor:pointer;">Hayır, Temizle</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('btnRecover').onclick = async () => {
        document.getElementById('recoveryModal').remove();
        await applyRestoredState(savedData.state);
        // Start auto saving again
        startAutoSaveTimer();
    };
    
    document.getElementById('btnDiscard').onclick = async () => {
        document.getElementById('recoveryModal').remove();
        await deleteStateFromDB();
        // Start auto saving again
        startAutoSaveTimer();
    };
}

function startAutoSaveTimer() {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    autoSaveInterval = setInterval(performAutoSave, 30000); // 30 seconds
}

// Boot Sequence
async function bootAutoSave() {
    try {
        await initAutoSaveDB();
        const savedData = await loadStateFromDB();
        
        // If there is a saved state that is less than 24 hours old
        if (savedData && savedData.state && savedData.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
            // Stop immediate auto-saves to prevent overwriting before user decides
            showRecoveryModal(savedData);
        } else {
            // If expired or missing, delete and start fresh
            if (savedData) await deleteStateFromDB();
            startAutoSaveTimer();
        }
    } catch(err) {
        console.error('AutoSave boot failed:', err);
    }
}

// Add event listener safely
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAutoSave);
} else {
    bootAutoSave();
}




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


/**
 * ============================================
 * FONTS UI MODULE
 * ui/fonts.js
 * ============================================
 * 
 * Bağımlılıklar:
 * - config.js
 * 
 * Kullanılan yerler:
 * - ui/element.js
 * - main.js vb.
 */

function buildFontUI(){
    const sel=$('fontQuickSelect'),grid=$('fontGrid');
    if(!sel||!grid)return;
    let currentCat='';
    FONTS.forEach(f=>{
        const opt=document.createElement('option');opt.value=f.family;opt.textContent=f.name;sel.appendChild(opt);
        if(f.cat!==currentCat){
            const tit=document.createElement('div');tit.className='font-cat-title';tit.textContent=f.cat;grid.appendChild(tit);
            currentCat=f.cat;
        }
        const prev=document.createElement('div');
        prev.className='font-preview'+(f.family===currentFont?' active':'');
        prev.style.fontFamily=f.family;prev.textContent=f.name+' — Emlak 123';prev.dataset.family=f.family;
        prev.onclick=()=>{document.querySelectorAll('.font-preview').forEach(x=>x.classList.remove('active'));prev.classList.add('active');sel.value=f.family;currentFont=f.family;applyFontSettings()};
                grid.appendChild(prev);
    });
}

function buildElFontSelect(){
    const s=$('elFontFamily');if(!s)return;
    FONTS.forEach(f=>{const o=document.createElement('option');o.value=f.family;o.textContent=f.name;s.appendChild(o)});
}

function applyFontFromSelect(){
    const v=$('fontQuickSelect').value;
    if(!v)return;
    currentFont=v;
    document.querySelectorAll('.font-preview').forEach(x=>x.classList.toggle('active',x.dataset.family===v));
    applyFontSettings();
}

function applyFontSettings(){
    const weight=$('fontWeight').value,style=$('fontStyle').value,spacing=$('letterSpacing').value;
    const lh=($('lineHeight').value/10).toFixed(1),align=$('textAlign').value;
    const tsc=$('textShadowColor').value,tsv=$('textShadow').value,tt=$('textTransform').value;
    $('letterSpacingVal').textContent=spacing+'px';
    $('lineHeightVal').textContent=lh;
    $('textShadowVal').textContent=tsv;
    const shadow=parseInt(tsv)>0?tsv+'px '+tsv+'px '+(tsv*2)+'px '+tsc:'none';
    document.querySelectorAll('#canvas-container .canvas-el, #canvas-container .draggable').forEach(el=>{
        if(el.dataset.customFont)return;
        el.style.fontFamily=currentFont;
        el.style.fontWeight=weight;
        el.style.fontStyle=style;
        el.style.letterSpacing=spacing+'px';
        el.style.lineHeight=lh;
        el.style.textAlign=align;
        el.style.textShadow=shadow;
        el.style.textTransform=tt;
    });
}

function applyElFont(){
    if(!selectedEl)return;
    if(window._loadingElSettings)return;
    const ff=$('elFontFamily').value,fw=$('elFontWeight2').value,fs=$('elFontStyle2').value,ls=$('elLetterSp').value;
    $('elLetterSpVal').textContent=ls;
    if(ff||fw||fs||parseInt(ls)!==0){
        selectedEl.dataset.customFont='1';
        if(ff)selectedEl.style.fontFamily=ff;
        if(fw){selectedEl.style.fontWeight=fw;$('elWeightSlider').value=fw;$('elWeightVal').textContent=fw}
        if(fs)selectedEl.style.fontStyle=fs;
        selectedEl.style.letterSpacing=ls+'px';
    }else{
        delete selectedEl.dataset.customFont;
        applyFontSettings();
    }
}

function applyElWeight(){
    if(!selectedEl)return;
    if(window._loadingElSettings)return;
    const w=$('elWeightSlider').value;
    $('elWeightVal').textContent=w;
    selectedEl.style.fontWeight=w;
    selectedEl.dataset.customFont='1';
    $('elFontWeight2').value=w;
}

function loadElFont(el){
    window._loadingElSettings=true;
    if(el.dataset.customFont){
        $('elFontFamily').value='';
        FONTS.forEach(f=>{if(el.style.fontFamily.includes(f.name.replace(/[✒️👑🚀💥🎯 ]/g,'')))$('elFontFamily').value=f.family});
        $('elFontWeight2').value=el.style.fontWeight||'';
        $('elFontStyle2').value=el.style.fontStyle||'';
    }else{
        $('elFontFamily').value='';
        $('elFontWeight2').value='';
        $('elFontStyle2').value='';
    }
    const ls=parseInt(el.style.letterSpacing)||0;
    $('elLetterSp').value=ls;
    $('elLetterSpVal').textContent=ls;
    const w=parseInt(el.style.fontWeight)||700;
    $('elWeightSlider').value=w;
    $('elWeightVal').textContent=w;
    setTimeout(()=>{window._loadingElSettings=false},100);
}


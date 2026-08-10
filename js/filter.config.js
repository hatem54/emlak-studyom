// ========== FOTO FİLTRE PRESET'LERİ ==========
const PRESETS={
    original:{exposure:100,contrast:100,saturate:100,fblur:0,sepia:0,hueRotate:0,grayscale:0,invertCtrl:0,vignette:0,shadowsCtrl:0,highlightsCtrl:0,blacksCtrl:0,whitesCtrl:0,tempCtrl:0,tintCtrl:0,vibranceCtrl:0,sharpnessCtrl:0,clarityCtrl:0,dehazeCtrl:0},
    bright:{exposure:110,contrast:110,saturate:105,shadowsCtrl:5,highlightsCtrl:-10,clarityCtrl:10},
    dark:{exposure:90,contrast:115,saturate:100,shadowsCtrl:-15,blacksCtrl:-5,vignette:25,clarityCtrl:10},
    vivid:{saturate:115,contrast:115,vibranceCtrl:30,clarityCtrl:15,sharpnessCtrl:15},
    warm:{saturate:105,vibranceCtrl:15,exposure:105,contrast:110,tempCtrl:20,tintCtrl:5},
    cool:{tempCtrl:-20,tintCtrl:-5,saturate:105,contrast:110,clarityCtrl:15},
    indoor:{exposure:110,contrast:120,saturate:100,shadowsCtrl:10,highlightsCtrl:-15,tempCtrl:10,clarityCtrl:15},
    outdoor:{exposure:105,contrast:115,saturate:110,vibranceCtrl:20,shadowsCtrl:5,highlightsCtrl:-20,clarityCtrl:15,tempCtrl:-5},
    luxury:{exposure:100,contrast:120,saturate:95,vibranceCtrl:10,tempCtrl:10,shadowsCtrl:5,highlightsCtrl:-15,clarityCtrl:25,sharpnessCtrl:20,vignette:20}
};

const FILTER_IDS=['exposure','contrast','saturate','fblur','sepia','hueRotate','grayscale','invertCtrl','vignette','shadowsCtrl','highlightsCtrl','blacksCtrl','whitesCtrl','tempCtrl','tintCtrl','vibranceCtrl','sharpnessCtrl','clarityCtrl','dehazeCtrl'];
const FILTER_DEFAULTS={exposure:100,contrast:100,saturate:100,fblur:0,sepia:0,hueRotate:0,grayscale:0,invertCtrl:0,vignette:0,shadowsCtrl:0,highlightsCtrl:0,blacksCtrl:0,whitesCtrl:0,tempCtrl:0,tintCtrl:0,vibranceCtrl:0,sharpnessCtrl:0,clarityCtrl:0,dehazeCtrl:0};

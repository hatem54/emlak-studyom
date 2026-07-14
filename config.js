/* ============================================================
   config.js — Tüm sabit veriler (fontlar, ikonlar, şablonlar)
   Bu dosyada sadece VERİ değişir, fonksiyon YOK
============================================================ */

// ========== FONTLAR ==========
const FONTS=[
    {name:'✒️ Dancing Script',family:"'Dancing Script',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Great Vibes',family:"'Great Vibes',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Pacifico',family:"'Pacifico',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Satisfy',family:"'Satisfy',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Allura',family:"'Allura',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Sacramento',family:"'Sacramento',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Yellowtail',family:"'Yellowtail',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Kaushan Script',family:"'Kaushan Script',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Alex Brush',family:"'Alex Brush',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Parisienne',family:"'Parisienne',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Marck Script',family:"'Marck Script',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Cookie',family:"'Cookie',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Tangerine',family:"'Tangerine',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Berkshire Swash',family:"'Berkshire Swash',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Yesteryear',family:"'Yesteryear',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'✒️ Caveat',family:"'Caveat',cursive",cat:'✒️ Kıvrımlı & Zarif'},
    {name:'👑 Playfair Display',family:"'Playfair Display',serif",cat:'👑 Klasik & Lüks'},
    {name:'👑 Cormorant Garamond',family:"'Cormorant Garamond',serif",cat:'👑 Klasik & Lüks'},
    {name:'👑 Cinzel',family:"'Cinzel',serif",cat:'👑 Klasik & Lüks'},
    {name:'👑 Cinzel Decorative',family:"'Cinzel Decorative',serif",cat:'👑 Klasik & Lüks'},
    {name:'👑 Italiana',family:"'Italiana',serif",cat:'👑 Klasik & Lüks'},
    {name:'👑 Prata',family:"'Prata',serif",cat:'👑 Klasik & Lüks'},
    {name:'👑 Abril Fatface',family:"'Abril Fatface',cursive",cat:'👑 Klasik & Lüks'},
    {name:'👑 Yeseva One',family:"'Yeseva One',serif",cat:'👑 Klasik & Lüks'},
    {name:'👑 Libre Baskerville',family:"'Libre Baskerville',serif",cat:'👑 Klasik & Lüks'},
    {name:'👑 Lora',family:"'Lora',serif",cat:'👑 Klasik & Lüks'},
    {name:'👑 Merriweather',family:"'Merriweather',serif",cat:'👑 Klasik & Lüks'},
    {name:'👑 Georgia',family:"Georgia,serif",cat:'👑 Klasik & Lüks'},
    {name:'🚀 Montserrat',family:"'Montserrat',sans-serif",cat:'🚀 Modern Sans-Serif'},
    {name:'🚀 Poppins',family:"'Poppins',sans-serif",cat:'🚀 Modern Sans-Serif'},
    {name:'🚀 Raleway',family:"'Raleway',sans-serif",cat:'🚀 Modern Sans-Serif'},
    {name:'🚀 Inter',family:"'Inter',sans-serif",cat:'🚀 Modern Sans-Serif'},
    {name:'🚀 Nunito',family:"'Nunito',sans-serif",cat:'🚀 Modern Sans-Serif'},
    {name:'🚀 Roboto',family:"'Roboto',sans-serif",cat:'🚀 Modern Sans-Serif'},
    {name:'🚀 Josefin Sans',family:"'Josefin Sans',sans-serif",cat:'🚀 Modern Sans-Serif'},
    {name:'💥 Bebas Neue',family:"'Bebas Neue',sans-serif",cat:'💥 Bold & Impact'},
    {name:'💥 Oswald',family:"'Oswald',sans-serif",cat:'💥 Bold & Impact'},
    {name:'💥 Archivo Black',family:"'Archivo Black',sans-serif",cat:'💥 Bold & Impact'},
    {name:'💥 Shrikhand',family:"'Shrikhand',cursive",cat:'💥 Bold & Impact'},
    {name:'🎯 Amatic SC',family:"'Amatic SC',cursive",cat:'🎯 Dekoratif'}
];

// ========== İKONLAR (Kategorize) - EMLAK PRO ==========
const ICON_CATEGORIES={
    // ✨ EMLAK (Lucide SVG)
    '✨ Emlak (Lucide SVG)': [],

    // 🏠 EV & KONUT (Zenginleştirildi)
    '🏠 Ev & Konut':['🏠','🏡','🏢','🏬','🏘️','🏰','🏯','🏛️','⛪','🏗️','🕌','🕍','🛕','⛩️','🏦','🏪','🏫','🏥','🏨','🏤','🏣','🏭','🏟️','💒','🗼','🗽','🏚️','🛖'],
    
    // 📍 KONUM & HARİTA (Zenginleştirildi)
    '📍 Konum & Harita':['📍','🗺️','🧭','📌','🚩','⛳','🏁','🎯','📮','🗾','🚏','🛣️','🛤️','🌐','🧿','📡','🛰️','🗿','🏳️','🏴','🏳️‍🌈','⚑','🅿️','♿'],
    
    // 🏗️ İNŞAAT & YAPI (YENİ KATEGORİ)
    '🏗️ İnşaat & Yapı':['🏗️','🧱','🪟','🚪','🪜','🔨','⛏️','🪚','🔧','🪛','🔩','⚒️','🛠️','⚙️','🏭','🚧','🦺','⛑️','📐','📏','🔲','🔳','⬜','⬛'],
    
    // 🌾 ARSA & ARAZİ (YENİ KATEGORİ)
    '🌾 Arsa & Arazi':['🌾','🌱','🌿','🍃','🌳','🌲','🏞️','🏜️','🏝️','🏖️','🗻','⛰️','🏔️','🌄','🌅','🌋','🪴','☘️','🍀','🌴','🌵','🍂','🪵','🪨'],
    
    // 💼 EMLAK İŞLEMLERİ (YENİ KATEGORİ)
    '💼 Emlak İşlemleri':['💼','📑','📄','📃','📜','🖋️','✍️','🖊️','✒️','📝','🗂️','🗃️','🗄️','📁','📂','🔖','📎','🖇️','📊','📈','📉','💹','🏷️','🔖'],
    
    // 💰 PARA & FİYAT (Zenginleştirildi)
    '💰 Para & Fiyat':['💰','💵','💴','💶','💷','💸','🪙','💳','🧾','🏦','💎','👑','🏆','🥇','🎖️','🏅','🤝','💱','💲','💯','🎁','🛍️','🧧','💠'],
    
    // 🚗 ULAŞIM & OTOPARK (Zenginleştirildi)
    '🚗 Ulaşım & Otopark':['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚚','🚐','🚛','🛻','🏍️','🛵','🚲','✈️','🚂','🚉','🚄','🚅','⛴️','⚓','🚁','🚀','🅿️','🚦','🚥','🛑','🚏','🛣️','🛤️','🏁'],
    
    // 🔑 EV DETAYI & OLANAKLAR (Zenginleştirildi)
    '🔑 Ev Detayı & Olanaklar':['🔑','🗝️','🚪','🛋️','🛏️','🛁','🚿','🚽','🪑','🪞','🖼️','🕯️','💡','🔦','🪟','🧺','🧻','🧴','🧼','🪥','🪒','🧹','🧽','🪣','🧊','🌡️','📺','☎️','🖥️','💻','🎛️','🔌','🔋'],
    
    // 🍳 MUTFAK & YEMEK
    '🍳 Mutfak':['🍳','🍽️','🥘','🥗','🍕','🍔','☕','🍷','🥂','🍾','🧊','🔥','🧂','🥄','🍴','🫖','🍰','🥃','🍺','🧋','🥤','🧃','🍹','🫙'],
    
    // 🏊 SOSYAL ALAN & TESİS (Zenginleştirildi)
    '🏊 Sosyal & Tesis':['🏊','🎾','🎳','🎱','⛳','🎢','🎡','🎪','🎭','🎬','🎤','🎧','🎼','🎹','🥁','🎮','🕹️','🎲','⛹️','🏋️','🚴','🏌️','🤸','🧘','⚽','🏀','🏐','🎿','🏄','🚣'],
    
    // 🛡️ GÜVENLİK & KORUMA (Zenginleştirildi)
    '🛡️ Güvenlik':['🛡️','🔒','🔓','🔐','🚨','🚔','👮','💂','🕵️','🔧','🔨','⚒️','🛠️','⚙️','🧰','🧯','🚧','📹','🎥','🔍','🔎','⚠️','🚸','⛔','🚫','📷','🏮'],
    
    // 🌳 DOĞA & BİTKİLER
    '🌳 Doğa':['🌳','🌲','🌴','🌵','🌱','🌿','☘️','🍀','🌻','🌸','🌹','🌺','🌷','💐','🌾','🍃','🍂','🌰','🦋','🐝','🐞','🌼','🌽','🍄','🌊','🌈'],
    
    // 🏔️ COĞRAFYA & MANZARA
    '🏔️ Manzara':['🏔️','⛰️','🗻','🌋','🏜️','🏝️','🏖️','🌅','🌄','🌇','🌆','🌃','🌌','🌠','🌊','🏞️','🌁','🌉','🎑','🗾','🏟️','⛺','🏕️','🎪'],
    
    // ☀️ HAVA & İKLİM
    '☀️ Hava':['☀️','🌤️','⛅','🌥️','☁️','🌧️','⛈️','🌩️','❄️','☃️','⛄','🌈','💧','💦','🌪️','🌫️','🌬️','☔','⚡','🌡️','🌞','🌝','🌜','🌚','🌛'],
    
    // 📐 ÖLÇÜ & PLAN (Zenginleştirildi)
    '📐 Ölçü & Plan':['📐','📏','📊','📈','📉','📋','📝','✏️','🖊️','🖌️','🎨','📅','📆','🗓️','⏰','⌛','🧱','🔢','🔤','📇','📔','📕','📗','📘','📙','📚','📖'],
    
    // 📞 İLETİŞİM & REKLAM (Zenginleştirildi)
    '📞 İletişim & Reklam':['📞','☎️','📱','📲','💬','📧','✉️','📨','📤','📥','📇','🔔','📢','📣','🌐','📡','💭','🗨️','🗯️','📯','📻','📺','📰','🗞️','📸','🎥','📹'],
    
    // ⭐ VURGU & SÜSLEME (Zenginleştirildi)
    '⭐ Vurgu & Süsleme':['⭐','🌟','✨','💫','⚡','🔥','💥','💯','✅','❤️','💚','💙','💛','🧡','💜','🖤','🤍','🤎','💖','💗','💓','💕','💘','❣️','♥️','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔶','🔷','🔸','🔹'],
    
    // 🎁 REKLAM & KAMPANYA (YENİ KATEGORİ)
    '🎁 Reklam & Kampanya':['🎁','🏵️','🎖️','🎗️','🏅','🎯','🎊','🎉','🪅','🎀','🎇','🎆','🎃','🎄','🪄','🎪','🆕','🆓','🆒','🆙','🆗','🆘','🔝','🔥','💯','⚡','🎯','📢','📣','💥','🌟'],
    
    // 🏅 KALİTE & PRESTİJ (YENİ KATEGORİ)
    '🏅 Kalite & Prestij':['🏅','🥇','🥈','🥉','🏆','👑','💎','⚜️','🎖️','🏵️','🌟','⭐','✨','💫','🔱','⚡','💯','🆕','✅','☑️','✔️','🎯','🎪','🏛️','🎨','🖼️'],
    
    // ⏰ ZAMAN & DURUM (YENİ KATEGORİ)
    '⏰ Zaman & Durum':['⏰','⌚','⏱️','⏲️','⏳','⌛','📅','📆','🗓️','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛','🌙','🌚','☀️','🌞'],
    
    // 👨‍👩‍👧 AİLE & YAŞAM (YENİ KATEGORİ)
    '👨‍👩‍👧 Aile & Yaşam':['👨‍👩‍👧','👨‍👩‍👦','👪','👨‍👩‍👧‍👦','👶','🧒','👦','👧','🧑','👨','👩','🧓','👴','👵','🐶','🐱','🐕','🐈','🎓','💼','🏥','🏫','⛪','🎂']
,
    
    // 🌐 SOSYAL MEDYA
    '🌐 Sosyal Medya': ['<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>','<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>','<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>','<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>','<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>','<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>','<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>','📱','💻','🌐','📸','🐦','📘','▶️','🎵','💼','📌','💬','📧','👍','❤️','🔔','📢','🔗','#','@'],
    
    // 📞 İLETİŞİM & TELEFON
    '📞 İletişim': ['📞','☎️','📱','📲','🤙','📠','✉️','📧','📨','📩','📤','📥','📦','📬','📭','📝','✅','💬','💭','🗯️','📢','📣','🎤','🎧']
};

// ========== STANDART ŞABLONLAR - PRO ==========
const TPL={
    t1:{
        name:'1. Modern Elit',
        badge:{top:50,left:50,bg:'linear-gradient(135deg,#334155,#0f172a)',color:'#fff',radius:8,padding:'16px 36px',fontSize:36,fontFamily:"'Montserrat',sans-serif",fontWeight:800,letterSpacing:'3px',boxShadow:'0 8px 24px rgba(15,23,42,.5), inset 0 1px 0 rgba(255,255,255,.15)',textShadow:'0 2px 4px rgba(0,0,0,.3)'},
        price:{bottom:60,left:60,bg:'linear-gradient(135deg,rgba(0,0,0,.75),rgba(15,23,42,.65))',color:'#fff',radius:12,padding:'18px 40px',fontSize:72,fontFamily:"'Montserrat',sans-serif",fontWeight:900,boxShadow:'0 12px 32px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.1)',textShadow:'0 2px 8px rgba(0,0,0,.5)',backdropFilter:'blur(10px)'},
        details:{bottom:60,right:50,bg:'linear-gradient(135deg,rgba(15,23,42,.94),rgba(30,41,59,.9))',color:'#e2e8f0',radius:16,border:'1px solid rgba(148,163,184,.35)',padding:'24px 36px',fontSize:26,fontFamily:"'Montserrat',sans-serif",fontWeight:600,lineHeight:1.8,boxShadow:'0 20px 40px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.08)',backdropFilter:'blur(12px)'}
    },
    t2:{
        name:'2. Altın Lüks',
        badge:{top:50,right:50,bg:'linear-gradient(135deg,#fbbf24,#d97706)',color:'#1a1a1a',radius:6,padding:'16px 34px',fontSize:36,fontFamily:"'Playfair Display',serif",fontWeight:900,letterSpacing:'2px',boxShadow:'0 8px 24px rgba(217,119,6,.5), inset 0 2px 4px rgba(255,255,255,.4)',textShadow:'0 1px 2px rgba(255,255,255,.3)'},
        price:{bottom:60,right:60,bg:'linear-gradient(135deg,rgba(0,0,0,.85),rgba(30,20,0,.75))',color:'#fcd34d',radius:12,padding:'18px 36px',fontSize:64,fontFamily:"'Playfair Display',serif",fontWeight:900,boxShadow:'0 12px 32px rgba(0,0,0,.5), 0 0 0 1px rgba(245,158,11,.3)',textShadow:'0 2px 8px rgba(245,158,11,.4)',backdropFilter:'blur(10px)'},
        details:{bottom:60,left:60,bg:'linear-gradient(135deg,rgba(0,0,0,.88),rgba(30,20,0,.82))',color:'#fef3c7',radius:14,border:'2px solid rgba(245,158,11,.6)',padding:'26px 40px',fontSize:26,fontFamily:"'Playfair Display',serif",fontWeight:600,lineHeight:1.8,boxShadow:'0 20px 40px rgba(0,0,0,.6), 0 0 30px rgba(245,158,11,.15), inset 0 1px 0 rgba(245,158,11,.2)',backdropFilter:'blur(12px)'}
    },
    t3:{
        name:'3. Neon Gece',
        badge:{top:50,left:50,bg:'linear-gradient(135deg,#ec4899,#8b5cf6)',color:'#fff',radius:40,padding:'16px 38px',fontSize:34,fontFamily:"'Poppins',sans-serif",fontWeight:800,letterSpacing:'3px',boxShadow:'0 8px 24px rgba(139,92,246,.5), 0 0 20px rgba(236,72,153,.3), inset 0 1px 0 rgba(255,255,255,.2)',textShadow:'0 0 10px rgba(255,255,255,.3)'},
        price:{bottom:80,right:60,bg:'linear-gradient(135deg,rgba(30,10,60,.9),rgba(60,20,90,.85))',color:'#c4b5fd',radius:16,padding:'18px 36px',fontSize:60,fontFamily:"'Poppins',sans-serif",fontWeight:900,boxShadow:'0 12px 32px rgba(139,92,246,.4), 0 0 40px rgba(168,85,247,.2), inset 0 1px 0 rgba(255,255,255,.1)',textShadow:'0 0 15px rgba(168,85,247,.6)',backdropFilter:'blur(15px)'},
        details:{bottom:80,left:60,bg:'linear-gradient(135deg,rgba(15,5,30,.92),rgba(30,10,60,.88))',color:'#e9d5ff',radius:20,border:'1px solid rgba(168,85,247,.5)',padding:'26px 40px',fontSize:26,fontFamily:"'Poppins',sans-serif",fontWeight:600,lineHeight:1.8,boxShadow:'0 20px 40px rgba(0,0,0,.6), 0 0 30px rgba(168,85,247,.2), inset 0 1px 0 rgba(255,255,255,.1)',backdropFilter:'blur(15px)'}
    },
    t4:{
        name:'4. Minimalist',
        badge:{top:60,right:60,bg:'#111827',color:'#f9fafb',radius:0,padding:'14px 32px',fontSize:32,fontFamily:"'Inter',sans-serif",fontWeight:700,letterSpacing:'4px',boxShadow:'0 6px 20px rgba(0,0,0,.4), 0 0 0 1px rgba(255,255,255,.05)',textShadow:'0 1px 2px rgba(0,0,0,.3)'},
        price:{bottom:60,left:60,bg:'linear-gradient(180deg,rgba(17,24,39,.9),rgba(0,0,0,.85))',color:'#fff',radius:0,padding:'16px 32px',fontSize:64,fontFamily:"'Inter',sans-serif",fontWeight:900,boxShadow:'0 10px 30px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.05)',textShadow:'0 2px 6px rgba(0,0,0,.4)',backdropFilter:'blur(8px)'},
        details:{bottom:60,right:60,bg:'linear-gradient(180deg,rgba(17,24,39,.94),rgba(0,0,0,.9))',color:'#d1d5db',radius:4,border:'1px solid #374151',padding:'26px 40px',fontSize:26,fontFamily:"'Inter',sans-serif",fontWeight:500,lineHeight:1.8,boxShadow:'0 15px 35px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.05)',backdropFilter:'blur(10px)'}
    },
    t5:{
        name:'5. Cam Efekt',
        badge:{top:50,left:50,bg:'rgba(255,255,255,.18)',color:'#fff',radius:50,padding:'16px 38px',fontSize:32,fontFamily:"'Raleway',sans-serif",fontWeight:700,letterSpacing:'3px',backdropFilter:'blur(25px)',boxShadow:'0 8px 32px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.3), inset 0 -1px 0 rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.3)',textShadow:'0 2px 8px rgba(0,0,0,.3)'},
        price:{top:50,right:50,bg:'rgba(255,255,255,.15)',color:'#fff',radius:24,padding:'22px 38px',fontSize:60,fontFamily:"'Raleway',sans-serif",fontWeight:900,backdropFilter:'blur(25px)',boxShadow:'0 12px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.3)',border:'1px solid rgba(255,255,255,.25)',textShadow:'0 2px 10px rgba(0,0,0,.4)'},
        details:{bottom:50,left:50,bg:'rgba(255,255,255,.14)',color:'#fff',radius:24,border:'1px solid rgba(255,255,255,.3)',padding:'26px 40px',fontSize:26,fontFamily:"'Raleway',sans-serif",fontWeight:600,lineHeight:1.8,backdropFilter:'blur(30px)',boxShadow:'0 20px 50px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.25)',textShadow:'0 1px 4px rgba(0,0,0,.3)'}
    },
    t6:{
        name:'6. Doğa Yeşil',
        badge:{top:60,left:60,bg:'linear-gradient(135deg,#059669,#10b981)',color:'#fff',radius:10,padding:'16px 36px',fontSize:34,fontFamily:"'Nunito',sans-serif",fontWeight:800,letterSpacing:'2px',boxShadow:'0 8px 24px rgba(5,150,105,.45), inset 0 1px 0 rgba(255,255,255,.2)',textShadow:'0 2px 4px rgba(0,0,0,.3)'},
        price:{bottom:60,left:60,bg:'linear-gradient(135deg,rgba(6,78,59,.92),rgba(4,120,87,.85))',color:'#a7f3d0',radius:14,padding:'18px 36px',fontSize:64,fontFamily:"'Nunito',sans-serif",fontWeight:900,boxShadow:'0 12px 32px rgba(6,78,59,.5), inset 0 1px 0 rgba(16,185,129,.2)',textShadow:'0 2px 8px rgba(0,0,0,.4)',backdropFilter:'blur(10px)'},
        details:{bottom:60,right:60,bg:'linear-gradient(135deg,rgba(6,78,59,.94),rgba(4,120,87,.88))',color:'#d1fae5',radius:16,border:'1px solid rgba(16,185,129,.5)',padding:'26px 40px',fontSize:26,fontFamily:"'Nunito',sans-serif",fontWeight:600,lineHeight:1.8,boxShadow:'0 20px 40px rgba(0,0,0,.4), 0 0 30px rgba(16,185,129,.1), inset 0 1px 0 rgba(16,185,129,.15)',backdropFilter:'blur(12px)'}
    },
    t7:{
        name:'7. Safir Mavi',
        badge:{top:50,left:50,bg:'linear-gradient(135deg,#1d4ed8,#3b82f6)',color:'#fff',radius:10,padding:'16px 36px',fontSize:34,fontFamily:"'Montserrat',sans-serif",fontWeight:800,letterSpacing:'2px',boxShadow:'0 8px 24px rgba(29,78,216,.5), inset 0 1px 0 rgba(255,255,255,.2)',textShadow:'0 2px 4px rgba(0,0,0,.3)'},
        price:{top:50,right:50,bg:'linear-gradient(135deg,rgba(30,58,138,.92),rgba(29,78,216,.85))',color:'#bfdbfe',radius:14,padding:'18px 36px',fontSize:60,fontFamily:"'Montserrat',sans-serif",fontWeight:900,boxShadow:'0 12px 32px rgba(30,58,138,.5), inset 0 1px 0 rgba(96,165,250,.2)',textShadow:'0 2px 8px rgba(0,0,0,.4)',backdropFilter:'blur(10px)'},
        details:{bottom:60,left:60,bg:'linear-gradient(135deg,rgba(30,58,138,.94),rgba(29,78,216,.88))',color:'#dbeafe',radius:16,border:'1px solid rgba(96,165,250,.5)',padding:'26px 40px',fontSize:26,fontFamily:"'Montserrat',sans-serif",fontWeight:600,lineHeight:1.8,boxShadow:'0 20px 40px rgba(0,0,0,.4), 0 0 30px rgba(59,130,246,.1), inset 0 1px 0 rgba(96,165,250,.15)',backdropFilter:'blur(12px)'}
    },
    t8:{
        name:'8. VIP Bordo',
        badge:{top:50,left:50,bg:'linear-gradient(135deg,#991b1b,#dc2626)',color:'#fff',radius:6,padding:'16px 36px',fontSize:34,fontFamily:"'Playfair Display',serif",fontWeight:900,letterSpacing:'3px',boxShadow:'0 8px 24px rgba(153,27,27,.5), inset 0 1px 0 rgba(255,255,255,.15)',textShadow:'0 2px 4px rgba(0,0,0,.4)'},
        price:{bottom:60,right:60,bg:'linear-gradient(135deg,rgba(127,29,29,.92),rgba(153,27,27,.85))',color:'#fecaca',radius:10,padding:'18px 36px',fontSize:60,fontFamily:"'Playfair Display',serif",fontWeight:900,boxShadow:'0 12px 32px rgba(127,29,29,.5), inset 0 1px 0 rgba(220,38,38,.2)',textShadow:'0 2px 8px rgba(0,0,0,.4)',backdropFilter:'blur(10px)'},
        details:{bottom:60,left:60,bg:'linear-gradient(135deg,rgba(127,29,29,.94),rgba(153,27,27,.88))',color:'#fee2e2',radius:14,border:'2px solid rgba(220,38,38,.5)',padding:'26px 40px',fontSize:26,fontFamily:"'Playfair Display',serif",fontWeight:600,lineHeight:1.8,boxShadow:'0 20px 40px rgba(0,0,0,.4), 0 0 30px rgba(220,38,38,.15), inset 0 1px 0 rgba(220,38,38,.15)',backdropFilter:'blur(12px)'}
    },
    t9:{
        name:'9. Prestij',
        badge:{top:60,left:60,bg:'linear-gradient(135deg,#18181b,#3f3f46)',color:'#fafafa',radius:8,padding:'16px 36px',fontSize:34,fontFamily:"'Cinzel',serif",fontWeight:700,letterSpacing:'4px',boxShadow:'0 8px 24px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.1), 0 0 0 1px rgba(161,161,170,.2)',textShadow:'0 2px 4px rgba(0,0,0,.4)'},
        price:{bottom:60,right:60,bg:'linear-gradient(135deg,rgba(0,0,0,.92),rgba(24,24,27,.88))',color:'#fafafa',radius:10,padding:'20px 40px',fontSize:64,fontFamily:"'Cinzel',serif",fontWeight:900,boxShadow:'0 15px 35px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(161,161,170,.2)',textShadow:'0 2px 8px rgba(0,0,0,.5)',backdropFilter:'blur(10px)'},
        details:{bottom:60,left:60,bg:'linear-gradient(135deg,rgba(0,0,0,.94),rgba(24,24,27,.9))',color:'#d4d4d8',radius:14,border:'1px solid rgba(161,161,170,.35)',padding:'26px 40px',fontSize:26,fontFamily:"'Cinzel',serif",fontWeight:500,lineHeight:1.8,boxShadow:'0 20px 40px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.05)',backdropFilter:'blur(12px)'}
    },
    t10:{
        name:'10. Sunset',
        badge:{top:60,left:60,bg:'linear-gradient(135deg,#ea580c,#f97316)',color:'#fff',radius:12,padding:'16px 36px',fontSize:34,fontFamily:"'Poppins',sans-serif",fontWeight:800,letterSpacing:'3px',boxShadow:'0 8px 24px rgba(234,88,12,.5), inset 0 1px 0 rgba(255,255,255,.2)',textShadow:'0 2px 4px rgba(0,0,0,.3)'},
        price:{bottom:60,left:60,bg:'linear-gradient(135deg,rgba(124,45,18,.92),rgba(154,52,18,.85))',color:'#fed7aa',radius:14,padding:'18px 36px',fontSize:60,fontFamily:"'Poppins',sans-serif",fontWeight:900,boxShadow:'0 12px 32px rgba(124,45,18,.5), inset 0 1px 0 rgba(251,146,60,.2)',textShadow:'0 2px 8px rgba(0,0,0,.4)',backdropFilter:'blur(10px)'},
        details:{bottom:60,right:60,bg:'linear-gradient(135deg,rgba(124,45,18,.94),rgba(154,52,18,.88))',color:'#ffedd5',radius:16,border:'1px solid rgba(251,146,60,.5)',padding:'26px 40px',fontSize:26,fontFamily:"'Poppins',sans-serif",fontWeight:600,lineHeight:1.8,boxShadow:'0 20px 40px rgba(0,0,0,.4), 0 0 30px rgba(251,146,60,.12), inset 0 1px 0 rgba(251,146,60,.15)',backdropFilter:'blur(12px)'}
    }
};

// ========== CANVA ŞABLON KARTLARI ==========
const CANVA_CARDS=[
    {id:'canva1',name:'1. Bej Gri Modern Konut',tag:'Konut',bg1:'#e6dfd5',bg2:'#94a3b8',accent:'#b45309'},
    {id:'canva2',name:'2. Sarı Modern Arsa',tag:'Arsa',bg1:'#f4f4f5',bg2:'#f59e0b',accent:'#18181b'},
    {id:'canva3',name:'3. Gece Mavisi Geometrik',tag:'Lüks',bg1:'#0f172a',bg2:'#38bdf8',accent:'#38bdf8'},
    {id:'canva4',name:'4. Zümrüt Cam Villa',tag:'Villa',bg1:'#064e3b',bg2:'#10b981',accent:'#a7f3d0'},
    {id:'canva5',name:'5. Altın Çerçeveli VIP',tag:'VIP',bg1:'#0f172a',bg2:'#f59e0b',accent:'#fbbf24'},
    {id:'canva6',name:'6. Minimal Beyaz Grid',tag:'Minimal',bg1:'#ffffff',bg2:'#e2e8f0',accent:'#0f172a'},
    {id:'canva7',name:'7. Bordo Kraliyet',tag:'Prestij',bg1:'#450a0a',bg2:'#fbbf24',accent:'#fef08a'},
    {id:'canva8',name:'8. Cam Loft',tag:'Loft',bg1:'#334155',bg2:'#64748b',accent:'#38bdf8'},
    {id:'canva9',name:'9. Endüstriyel Beton',tag:'Ofis',bg1:'#18181b',bg2:'#06b6d4',accent:'#22d3ee'},
    {id:'canva10',name:'10. Terracotta Sahil',tag:'Yazlık',bg1:'#fff7ed',bg2:'#ea580c',accent:'#c2410c'}
];

const MINIMAL_CARDS=[
    {id:'canvaM1',name:'M1. Minimal Tasarım',tag:'Minimal',bg1:'#ffffff',bg2:'#f3f4f6',accent:'#374151'},
    {id:'canvaM2',name:'M2. Minimal Tasarım',tag:'Minimal',bg1:'#ffffff',bg2:'#f3f4f6',accent:'#374151'},
    {id:'canvaM3',name:'M3. Minimal Tasarım',tag:'Minimal',bg1:'#ffffff',bg2:'#f3f4f6',accent:'#374151'},
    {id:'canvaM4',name:'M4. Minimal Tasarım',tag:'Minimal',bg1:'#ffffff',bg2:'#f3f4f6',accent:'#374151'},
    {id:'canvaM5',name:'M5. Minimal Tasarım',tag:'Minimal',bg1:'#ffffff',bg2:'#f3f4f6',accent:'#374151'},
    {id:'canvaM6',name:'M6. Minimal Tasarım',tag:'Minimal',bg1:'#ffffff',bg2:'#f3f4f6',accent:'#374151'},
    {id:'canvaM7',name:'M7. Minimal Tasarım',tag:'Minimal',bg1:'#ffffff',bg2:'#f3f4f6',accent:'#374151'},
    {id:'canvaM8',name:'M8. Minimal Tasarım',tag:'Minimal',bg1:'#ffffff',bg2:'#f3f4f6',accent:'#374151'},
    {id:'canvaM9',name:'M9. Minimal Tasarım',tag:'Minimal',bg1:'#ffffff',bg2:'#f3f4f6',accent:'#374151'},
    {id:'canvaM10',name:'M10. Minimal Tasarım',tag:'Minimal',bg1:'#ffffff',bg2:'#f3f4f6',accent:'#374151'}
];
const LUKS_CARDS=[
    {id:'canvaL1',name:'L1. Lüks Tasarım',tag:'Lüks',bg1:'#0f172a',bg2:'#d4af37',accent:'#d4af37'},
    {id:'canvaL2',name:'L2. Lüks Tasarım',tag:'Lüks',bg1:'#0f172a',bg2:'#d4af37',accent:'#d4af37'},
    {id:'canvaL3',name:'L3. Lüks Tasarım',tag:'Lüks',bg1:'#0f172a',bg2:'#d4af37',accent:'#d4af37'},
    {id:'canvaL4',name:'L4. Lüks Tasarım',tag:'Lüks',bg1:'#0f172a',bg2:'#d4af37',accent:'#d4af37'},
    {id:'canvaL5',name:'L5. Lüks Tasarım',tag:'Lüks',bg1:'#0f172a',bg2:'#d4af37',accent:'#d4af37'},
    {id:'canvaL6',name:'L6. Lüks Tasarım',tag:'Lüks',bg1:'#0f172a',bg2:'#d4af37',accent:'#d4af37'},
    {id:'canvaL7',name:'L7. Lüks Tasarım',tag:'Lüks',bg1:'#0f172a',bg2:'#d4af37',accent:'#d4af37'},
    {id:'canvaL8',name:'L8. Lüks Tasarım',tag:'Lüks',bg1:'#0f172a',bg2:'#d4af37',accent:'#d4af37'},
    {id:'canvaL9',name:'L9. Lüks Tasarım',tag:'Lüks',bg1:'#0f172a',bg2:'#d4af37',accent:'#d4af37'},
    {id:'canvaL10',name:'L10. Lüks Tasarım',tag:'Lüks',bg1:'#0f172a',bg2:'#d4af37',accent:'#d4af37'}
];
const KURUMSAL_CARDS=[
    {id:'canvaK1',name:'K1. Kurumsal Tasarım',tag:'Kurumsal',bg1:'#1e293b',bg2:'#475569',accent:'#38bdf8'},
    {id:'canvaK2',name:'K2. Kurumsal Tasarım',tag:'Kurumsal',bg1:'#1e293b',bg2:'#475569',accent:'#38bdf8'},
    {id:'canvaK3',name:'K3. Kurumsal Tasarım',tag:'Kurumsal',bg1:'#1e293b',bg2:'#475569',accent:'#38bdf8'},
    {id:'canvaK4',name:'K4. Kurumsal Tasarım',tag:'Kurumsal',bg1:'#1e293b',bg2:'#475569',accent:'#38bdf8'},
    {id:'canvaK5',name:'K5. Kurumsal Tasarım',tag:'Kurumsal',bg1:'#1e293b',bg2:'#475569',accent:'#38bdf8'},
    {id:'canvaK6',name:'K6. Kurumsal Tasarım',tag:'Kurumsal',bg1:'#1e293b',bg2:'#475569',accent:'#38bdf8'},
    {id:'canvaK7',name:'K7. Kurumsal Tasarım',tag:'Kurumsal',bg1:'#1e293b',bg2:'#475569',accent:'#38bdf8'},
    {id:'canvaK8',name:'K8. Kurumsal Tasarım',tag:'Kurumsal',bg1:'#1e293b',bg2:'#475569',accent:'#38bdf8'},
    {id:'canvaK9',name:'K9. Kurumsal Tasarım',tag:'Kurumsal',bg1:'#1e293b',bg2:'#475569',accent:'#38bdf8'},
    {id:'canvaK10',name:'K10. Kurumsal Tasarım',tag:'Kurumsal',bg1:'#1e293b',bg2:'#475569',accent:'#38bdf8'}
];
const DINAMIK_CARDS=[
    {id:'canvaD1',name:'D1. Dinamik Tasarım',tag:'Dinamik',bg1:'#4c1d95',bg2:'#e11d48',accent:'#fbbf24'},
    {id:'canvaD2',name:'D2. Dinamik Tasarım',tag:'Dinamik',bg1:'#4c1d95',bg2:'#e11d48',accent:'#fbbf24'},
    {id:'canvaD3',name:'D3. Dinamik Tasarım',tag:'Dinamik',bg1:'#4c1d95',bg2:'#e11d48',accent:'#fbbf24'},
    {id:'canvaD4',name:'D4. Dinamik Tasarım',tag:'Dinamik',bg1:'#4c1d95',bg2:'#e11d48',accent:'#fbbf24'},
    {id:'canvaD5',name:'D5. Dinamik Tasarım',tag:'Dinamik',bg1:'#4c1d95',bg2:'#e11d48',accent:'#fbbf24'},
    {id:'canvaD6',name:'D6. Dinamik Tasarım',tag:'Dinamik',bg1:'#4c1d95',bg2:'#e11d48',accent:'#fbbf24'},
    {id:'canvaD7',name:'D7. Dinamik Tasarım',tag:'Dinamik',bg1:'#4c1d95',bg2:'#e11d48',accent:'#fbbf24'},
    {id:'canvaD8',name:'D8. Dinamik Tasarım',tag:'Dinamik',bg1:'#4c1d95',bg2:'#e11d48',accent:'#fbbf24'},
    {id:'canvaD9',name:'D9. Dinamik Tasarım',tag:'Dinamik',bg1:'#4c1d95',bg2:'#e11d48',accent:'#fbbf24'},
    {id:'canvaD10',name:'D10. Dinamik Tasarım',tag:'Dinamik',bg1:'#4c1d95',bg2:'#e11d48',accent:'#fbbf24'}
];
const KLASIK_CARDS=[
    {id:'canvaC1',name:'C1. Klasik Tasarım',tag:'Klasik',bg1:'#450a0a',bg2:'#b45309',accent:'#fef3c7'},
    {id:'canvaC2',name:'C2. Klasik Tasarım',tag:'Klasik',bg1:'#450a0a',bg2:'#b45309',accent:'#fef3c7'},
    {id:'canvaC3',name:'C3. Klasik Tasarım',tag:'Klasik',bg1:'#450a0a',bg2:'#b45309',accent:'#fef3c7'},
    {id:'canvaC4',name:'C4. Klasik Tasarım',tag:'Klasik',bg1:'#450a0a',bg2:'#b45309',accent:'#fef3c7'},
    {id:'canvaC5',name:'C5. Klasik Tasarım',tag:'Klasik',bg1:'#450a0a',bg2:'#b45309',accent:'#fef3c7'},
    {id:'canvaC6',name:'C6. Klasik Tasarım',tag:'Klasik',bg1:'#450a0a',bg2:'#b45309',accent:'#fef3c7'},
    {id:'canvaC7',name:'C7. Klasik Tasarım',tag:'Klasik',bg1:'#450a0a',bg2:'#b45309',accent:'#fef3c7'},
    {id:'canvaC8',name:'C8. Klasik Tasarım',tag:'Klasik',bg1:'#450a0a',bg2:'#b45309',accent:'#fef3c7'},
    {id:'canvaC9',name:'C9. Klasik Tasarım',tag:'Klasik',bg1:'#450a0a',bg2:'#b45309',accent:'#fef3c7'},
    {id:'canvaC10',name:'C10. Klasik Tasarım',tag:'Klasik',bg1:'#450a0a',bg2:'#b45309',accent:'#fef3c7'}
];
const SOSYAL_CARDS=[
    {id:'canvaS1',name:'S1. Sosyal Medya Tasarım',tag:'Sosyal',bg1:'#be185d',bg2:'#1d4ed8',accent:'#ffffff'},
    {id:'canvaS2',name:'S2. Sosyal Medya Tasarım',tag:'Sosyal',bg1:'#be185d',bg2:'#1d4ed8',accent:'#ffffff'},
    {id:'canvaS3',name:'S3. Sosyal Medya Tasarım',tag:'Sosyal',bg1:'#be185d',bg2:'#1d4ed8',accent:'#ffffff'},
    {id:'canvaS4',name:'S4. Sosyal Medya Tasarım',tag:'Sosyal',bg1:'#be185d',bg2:'#1d4ed8',accent:'#ffffff'},
    {id:'canvaS5',name:'S5. Sosyal Medya Tasarım',tag:'Sosyal',bg1:'#be185d',bg2:'#1d4ed8',accent:'#ffffff'},
    {id:'canvaS6',name:'S6. Sosyal Medya Tasarım',tag:'Sosyal',bg1:'#be185d',bg2:'#1d4ed8',accent:'#ffffff'},
    {id:'canvaS7',name:'S7. Sosyal Medya Tasarım',tag:'Sosyal',bg1:'#be185d',bg2:'#1d4ed8',accent:'#ffffff'},
    {id:'canvaS8',name:'S8. Sosyal Medya Tasarım',tag:'Sosyal',bg1:'#be185d',bg2:'#1d4ed8',accent:'#ffffff'},
    {id:'canvaS9',name:'S9. Sosyal Medya Tasarım',tag:'Sosyal',bg1:'#be185d',bg2:'#1d4ed8',accent:'#ffffff'},
    {id:'canvaS10',name:'S10. Sosyal Medya Tasarım',tag:'Sosyal',bg1:'#be185d',bg2:'#1d4ed8',accent:'#ffffff'}
];
const PORTFOY_CARDS=[
    {id:'canvaP1',name:'P1. Portföy Tasarım',tag:'Portföy',bg1:'#14532d',bg2:'#166534',accent:'#bbf7d0'},
    {id:'canvaP2',name:'P2. Portföy Tasarım',tag:'Portföy',bg1:'#14532d',bg2:'#166534',accent:'#bbf7d0'},
    {id:'canvaP3',name:'P3. Portföy Tasarım',tag:'Portföy',bg1:'#14532d',bg2:'#166534',accent:'#bbf7d0'},
    {id:'canvaP4',name:'P4. Portföy Tasarım',tag:'Portföy',bg1:'#14532d',bg2:'#166534',accent:'#bbf7d0'},
    {id:'canvaP5',name:'P5. Portföy Tasarım',tag:'Portföy',bg1:'#14532d',bg2:'#166534',accent:'#bbf7d0'},
    {id:'canvaP6',name:'P6. Portföy Tasarım',tag:'Portföy',bg1:'#14532d',bg2:'#166534',accent:'#bbf7d0'},
    {id:'canvaP7',name:'P7. Portföy Tasarım',tag:'Portföy',bg1:'#14532d',bg2:'#166534',accent:'#bbf7d0'},
    {id:'canvaP8',name:'P8. Portföy Tasarım',tag:'Portföy',bg1:'#14532d',bg2:'#166534',accent:'#bbf7d0'},
    {id:'canvaP9',name:'P9. Portföy Tasarım',tag:'Portföy',bg1:'#14532d',bg2:'#166534',accent:'#bbf7d0'},
    {id:'canvaP10',name:'P10. Portföy Tasarım',tag:'Portföy',bg1:'#14532d',bg2:'#166534',accent:'#bbf7d0'}
];
const OZEL_CARDS=[
    {id:'canvaO1',name:'O1. Özel Tasarım',tag:'Özel',bg1:'#000000',bg2:'#27272a',accent:'#a78bfa'},
    {id:'canvaO2',name:'O2. Özel Tasarım',tag:'Özel',bg1:'#000000',bg2:'#27272a',accent:'#a78bfa'},
    {id:'canvaO3',name:'O3. Özel Tasarım',tag:'Özel',bg1:'#000000',bg2:'#27272a',accent:'#a78bfa'},
    {id:'canvaO4',name:'O4. Özel Tasarım',tag:'Özel',bg1:'#000000',bg2:'#27272a',accent:'#a78bfa'},
    {id:'canvaO5',name:'O5. Özel Tasarım',tag:'Özel',bg1:'#000000',bg2:'#27272a',accent:'#a78bfa'},
    {id:'canvaO6',name:'O6. Özel Tasarım',tag:'Özel',bg1:'#000000',bg2:'#27272a',accent:'#a78bfa'},
    {id:'canvaO7',name:'O7. Özel Tasarım',tag:'Özel',bg1:'#000000',bg2:'#27272a',accent:'#a78bfa'},
    {id:'canvaO8',name:'O8. Özel Tasarım',tag:'Özel',bg1:'#000000',bg2:'#27272a',accent:'#a78bfa'},
    {id:'canvaO9',name:'O9. Özel Tasarım',tag:'Özel',bg1:'#000000',bg2:'#27272a',accent:'#a78bfa'},
    {id:'canvaO10',name:'O10. Özel Tasarım',tag:'Özel',bg1:'#000000',bg2:'#27272a',accent:'#a78bfa'}
];

// ========== FOTO FİLTRE PRESET'LERİ ==========
const PRESETS={
    original:{exposure:100,contrast:100,saturate:100,fblur:0,sepia:0,hueRotate:0,grayscale:0,invertCtrl:0,vignette:0,shadowsCtrl:0,highlightsCtrl:0,blacksCtrl:0,whitesCtrl:0,tempCtrl:0,tintCtrl:0,vibranceCtrl:0,sharpnessCtrl:0,clarityCtrl:0,dehazeCtrl:0},
    bright:{exposure:130,contrast:110,saturate:115,shadowsCtrl:30,highlightsCtrl:-15,clarityCtrl:20,vibranceCtrl:15},
    dark:{exposure:80,contrast:130,saturate:110,shadowsCtrl:-40,blacksCtrl:-30,vignette:40,clarityCtrl:30},
    vivid:{saturate:180,contrast:120,vibranceCtrl:60,clarityCtrl:25,sharpnessCtrl:20},
    warm:{tempCtrl:40,tintCtrl:15,saturate:115,exposure:105,contrast:105},
    cool:{tempCtrl:-40,tintCtrl:-10,saturate:110,contrast:110},
    cinematic:{contrast:135,saturate:85,tempCtrl:-15,shadowsCtrl:-30,vignette:60,clarityCtrl:30,blacksCtrl:-40,highlightsCtrl:-20},
    vintage:{sepia:40,saturate:70,contrast:90,tempCtrl:30,vignette:50,exposure:110},
    luxury:{contrast:120,saturate:105,tempCtrl:20,shadowsCtrl:20,highlightsCtrl:-25,clarityCtrl:35,sharpnessCtrl:15,vignette:30}
};

const FILTER_IDS=['exposure','contrast','saturate','fblur','sepia','hueRotate','grayscale','invertCtrl','vignette','shadowsCtrl','highlightsCtrl','blacksCtrl','whitesCtrl','tempCtrl','tintCtrl','vibranceCtrl','sharpnessCtrl','clarityCtrl','dehazeCtrl'];
const FILTER_DEFAULTS={exposure:100,contrast:100,saturate:100,fblur:0,sepia:0,hueRotate:0,grayscale:0,invertCtrl:0,vignette:0,shadowsCtrl:0,highlightsCtrl:0,blacksCtrl:0,whitesCtrl:0,tempCtrl:0,tintCtrl:0,vibranceCtrl:0,sharpnessCtrl:0,clarityCtrl:0,dehazeCtrl:0};

// ========== ÇIKTI FORMATLARI (Sosyal Medya + Baskı) ==========
const EXPORT_FORMATS={
    '16:9 Full HD (YouTube/Banner)':{w:1920,h:1080,icon:'🖥️'},
    '1:1 Instagram Post (Kare)':{w:1080,h:1080,icon:'📷'},
    '4:5 Instagram Portrait':{w:1080,h:1350,icon:'📱'},
    '9:16 Instagram/TikTok Story':{w:1080,h:1920,icon:'📲'},
    '3:4 Facebook Portrait':{w:1200,h:1500,icon:'👥'},
    '1200x630 Facebook/LinkedIn Kapak':{w:1200,h:630,icon:'💼'},
    '2:3 Pinterest':{w:1000,h:1500,icon:'📌'},
    '3:2 Twitter/X Post':{w:1200,h:800,icon:'🐦'},
    '4:3 Klasik':{w:1600,h:1200,icon:'🖼️'},
    'A4 Dikey (Print)':{w:2480,h:3508,icon:'📄'},
    'A4 Yatay (Print)':{w:3508,h:2480,icon:'📃'},
    '1920x1920 Kare HD':{w:1920,h:1920,icon:'⬛'}
};

// Kadraj (Fit) modları
const FIT_MODES={
    'cover':'📐 Doldur (Kırpma olabilir)',
    'contain':'🔲 Sığdır (Boşluk kalabilir)',
    'stretch':'↔️ Ger (Deforme olabilir)'
};

// ========== CALLOUT ŞABLONLARI - GENİŞ (100+) ==========
const CALLOUT_CATEGORIES = {

    '📏 Çizgi Oklu (Açılı Sol)': [
        { text: 'DETAY', bg: 'transparent', color: '#000', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-sl-lb', '--co-bc': '#000000', '--co-bw': '2px', '--co-dot': '#000000', '--co-len': '30px', shadow:'none' },
        { text: 'AÇIKLAMA', bg: 'transparent', color: '#dc2626', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-sl-lb', '--co-bc': '#dc2626', '--co-bw': '2px', '--co-dot': '#dc2626', '--co-len': '40px', shadow:'none' },
        { text: 'ÖZELLİK', bg: 'transparent', color: '#2563eb', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-sl-lb', '--co-bc': '#2563eb', '--co-bw': '3px', '--co-dot': '#2563eb', '--co-len': '25px', shadow:'none' },
        { text: 'BİLGİ', bg: 'transparent', color: '#059669', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-sl-lb', '--co-bc': '#059669', '--co-bw': '2px', '--co-dot': '#059669', '--co-len': '35px', shadow:'none' },
        { text: 'NOT', bg: 'transparent', color: '#d97706', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-sl-lb', '--co-bc': '#d97706', '--co-bw': '2px', '--co-dot': '#d97706', '--co-len': '20px', shadow:'none' }
    ],
    '📏 Çizgi Oklu (Açılı Sağ)': [
        { text: 'DETAY', bg: 'transparent', color: '#000', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-sl-rb', '--co-bc': '#000000', '--co-bw': '2px', '--co-dot': '#000000', '--co-len': '30px', shadow:'none' },
        { text: 'AÇIKLAMA', bg: 'transparent', color: '#dc2626', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-sl-rb', '--co-bc': '#dc2626', '--co-bw': '2px', '--co-dot': '#dc2626', '--co-len': '40px', shadow:'none' },
        { text: 'ÖZELLİK', bg: 'transparent', color: '#2563eb', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-sl-rb', '--co-bc': '#2563eb', '--co-bw': '3px', '--co-dot': '#2563eb', '--co-len': '25px', shadow:'none' },
        { text: 'BİLGİ', bg: 'transparent', color: '#059669', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-sl-rb', '--co-bc': '#059669', '--co-bw': '2px', '--co-dot': '#059669', '--co-len': '35px', shadow:'none' },
        { text: 'NOT', bg: 'transparent', color: '#d97706', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-sl-rb', '--co-bc': '#d97706', '--co-bw': '2px', '--co-dot': '#d97706', '--co-len': '20px', shadow:'none' }
    ],
    '📏 Çizgi Oklu (Düz İnen Sol)': [
        { text: 'DETAY', bg: 'transparent', color: '#000', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-lb', '--co-bc': '#000000', '--co-bw': '2px', '--co-dot': '#000000', '--co-len': '30px', shadow:'none' },
        { text: 'AÇIKLAMA', bg: 'transparent', color: '#dc2626', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-lb', '--co-bc': '#dc2626', '--co-bw': '2px', '--co-dot': '#dc2626', '--co-len': '40px', shadow:'none' },
        { text: 'ÖZELLİK', bg: 'transparent', color: '#2563eb', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-lb', '--co-bc': '#2563eb', '--co-bw': '3px', '--co-dot': '#2563eb', '--co-len': '25px', shadow:'none' },
        { text: 'BİLGİ', bg: 'transparent', color: '#059669', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-lb', '--co-bc': '#059669', '--co-bw': '2px', '--co-dot': '#059669', '--co-len': '35px', shadow:'none' },
        { text: 'NOT', bg: 'transparent', color: '#d97706', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-lb', '--co-bc': '#d97706', '--co-bw': '2px', '--co-dot': '#d97706', '--co-len': '20px', shadow:'none' }
    ],
    '📏 Çizgi Oklu (Düz İnen Orta)': [
        { text: 'DETAY', bg: 'transparent', color: '#000', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-c', '--co-bc': '#000000', '--co-bw': '2px', '--co-dot': '#000000', '--co-len': '30px', shadow:'none' },
        { text: 'AÇIKLAMA', bg: 'transparent', color: '#dc2626', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-c', '--co-bc': '#dc2626', '--co-bw': '2px', '--co-dot': '#dc2626', '--co-len': '40px', shadow:'none' },
        { text: 'ÖZELLİK', bg: 'transparent', color: '#2563eb', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-c', '--co-bc': '#2563eb', '--co-bw': '3px', '--co-dot': '#2563eb', '--co-len': '25px', shadow:'none' },
        { text: 'BİLGİ', bg: 'transparent', color: '#059669', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-c', '--co-bc': '#059669', '--co-bw': '2px', '--co-dot': '#059669', '--co-len': '35px', shadow:'none' },
        { text: 'NOT', bg: 'transparent', color: '#d97706', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-c', '--co-bc': '#d97706', '--co-bw': '2px', '--co-dot': '#d97706', '--co-len': '20px', shadow:'none' }
    ],
    '📏 Çizgi Oklu (Düz İnen Sağ)': [
        { text: 'DETAY', bg: 'transparent', color: '#000', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-rb', '--co-bc': '#000000', '--co-bw': '2px', '--co-dot': '#000000', '--co-len': '30px', shadow:'none' },
        { text: 'AÇIKLAMA', bg: 'transparent', color: '#dc2626', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-rb', '--co-bc': '#dc2626', '--co-bw': '2px', '--co-dot': '#dc2626', '--co-len': '40px', shadow:'none' },
        { text: 'ÖZELLİK', bg: 'transparent', color: '#2563eb', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-rb', '--co-bc': '#2563eb', '--co-bw': '3px', '--co-dot': '#2563eb', '--co-len': '25px', shadow:'none' },
        { text: 'BİLGİ', bg: 'transparent', color: '#059669', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-rb', '--co-bc': '#059669', '--co-bw': '2px', '--co-dot': '#059669', '--co-len': '35px', shadow:'none' },
        { text: 'NOT', bg: 'transparent', color: '#d97706', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-st-rb', '--co-bc': '#d97706', '--co-bw': '2px', '--co-dot': '#d97706', '--co-len': '20px', shadow:'none' }
    ],
    '🎯 Çift Halkalı (Bullseye)': [
        { text: 'MERKEZ', bg: 'transparent', color: '#000', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-dr-lb', '--co-bc': '#000000', '--co-bw': '2px', '--co-len': '30px', shadow:'none' },
        { text: 'HEDEF', bg: 'transparent', color: '#dc2626', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-dr-lb', '--co-bc': '#dc2626', '--co-bw': '2px', '--co-len': '40px', shadow:'none' },
        { text: 'NOKTA', bg: 'transparent', color: '#2563eb', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-dr-lb', '--co-bc': '#2563eb', '--co-bw': '3px', '--co-len': '25px', shadow:'none' },
        { text: 'BİLGİ', bg: 'transparent', color: '#059669', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-dr-lb', '--co-bc': '#059669', '--co-bw': '2px', '--co-len': '35px', shadow:'none' },
        { text: 'VURGU', bg: 'transparent', color: '#d97706', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, customClass: 'co-line-dr-lb', '--co-bc': '#d97706', '--co-bw': '2px', '--co-len': '20px', shadow:'none' }
    ],
    '🔲 Offset Gölge Çerçeve (Sağ Alt)': [
        { text: 'MODERN', bg: '#ffffff', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-offset', '--co-bg': '#facc15', '--co-bc': '#000', shadow:'none' },
        { text: 'KUTU', bg: '#ffffff', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-offset', '--co-bg': '#38bdf8', '--co-bc': '#000', shadow:'none' },
        { text: 'BLOK', bg: '#000000', color: '#fff', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-offset', '--co-bg': '#ef4444', '--co-bc': '#000', shadow:'none' },
        { text: 'TASARIM', bg: '#ffffff', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-offset', '--co-bg': '#10b981', '--co-bc': '#000', shadow:'none' },
        { text: 'VİTRİN', bg: '#ffffff', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-offset', '--co-bg': '#000000', '--co-bc': '#000', shadow:'none' }
    ],
    '🔲 Offset Gölge Çerçeve (Sağ Üst)': [
        { text: 'MODERN', bg: '#ffffff', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-offset-tr', '--co-bg': '#facc15', '--co-bc': '#000', shadow:'none' },
        { text: 'KUTU', bg: '#ffffff', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-offset-tr', '--co-bg': '#38bdf8', '--co-bc': '#000', shadow:'none' },
        { text: 'BLOK', bg: '#000000', color: '#fff', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-offset-tr', '--co-bg': '#ef4444', '--co-bc': '#000', shadow:'none' },
        { text: 'TASARIM', bg: '#ffffff', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-offset-tr', '--co-bg': '#10b981', '--co-bc': '#000', shadow:'none' },
        { text: 'VİTRİN', bg: '#ffffff', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-offset-tr', '--co-bg': '#000000', '--co-bc': '#000', shadow:'none' }
    ],
    '🟩 Kutu Çizgi Oklu (Brutalist)': [
        { text: 'ÖNE ÇIKAN', bg: '#ffffff', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-box-line', '--co-bg': '#facc15', '--co-bc': '#000', shadow:'none' },
        { text: 'ETİKET', bg: '#ffffff', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-box-line', '--co-bg': '#38bdf8', '--co-bc': '#000', shadow:'none' },
        { text: 'DİKKAT', bg: '#000000', color: '#fff', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-box-line', '--co-bg': '#ef4444', '--co-bc': '#000', shadow:'none' },
        { text: 'YENİ', bg: '#ffffff', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-box-line', '--co-bg': '#10b981', '--co-bc': '#000', shadow:'none' },
        { text: 'FIRSAT', bg: '#ffffff', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-box-line', '--co-bg': '#000000', '--co-bc': '#000', shadow:'none' }
    ],
    '🟪 Çift Katmanlı Kutu': [
        { text: 'ÇİFT KATMAN', bg: 'transparent', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-double', '--co-bg': '#facc15', '--co-bc': '#000', shadow:'none' },
        { text: 'KUTU', bg: 'transparent', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-double', '--co-bg': '#38bdf8', '--co-bc': '#000', shadow:'none' },
        { text: 'BLOK', bg: 'transparent', color: '#fff', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-double', '--co-bg': '#ef4444', '--co-bc': '#000', shadow:'none' },
        { text: 'TASARIM', bg: 'transparent', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-double', '--co-bg': '#10b981', '--co-bc': '#000', shadow:'none' },
        { text: 'ÇERÇEVE', bg: 'transparent', color: '#fff', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-double', '--co-bg': '#000000', '--co-bc': '#000', shadow:'none' }
    ],
    '💠 Kesik Köşeli (Poligon)': [
        { text: 'YANA YATIK', bg: '#000000', color: '#fff', border: 'none', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-cut', '--co-bg': '#000', shadow:'none' },
        { text: 'DİNAMİK', bg: '#ef4444', color: '#fff', border: 'none', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-cut-2', '--co-bg': '#ef4444', shadow:'none' },
        { text: 'HIZLI', bg: '#38bdf8', color: '#fff', border: 'none', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-cut', '--co-bg': '#38bdf8', shadow:'none' },
        { text: 'İLERİ', bg: '#10b981', color: '#fff', border: 'none', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-cut-2', '--co-bg': '#10b981', shadow:'none' },
        { text: 'FIRSAT', bg: '#facc15', color: '#000', border: 'none', radius: 0, padding: '15px 30px', fontSize: 22, fontWeight: 800, customClass: 'co-shape-cut', '--co-bg': '#facc15', shadow:'none' }
    ],
    '🔲 Minimal Kutu (Çizgi Oklu)': [
        { text: 'SADE BİLGİ', bg: '#ffffff', color: '#000', border: '1px solid #000', radius: 4, padding: '10px 20px', fontSize: 18, fontWeight: 600, customClass: 'co-shape-minimal-ptr', '--co-bc': '#000', shadow:'none' },
        { text: 'İPUCU', bg: '#ffffff', color: '#dc2626', border: '1px solid #dc2626', radius: 4, padding: '10px 20px', fontSize: 18, fontWeight: 600, customClass: 'co-shape-minimal-ptr', '--co-bc': '#dc2626', shadow:'none' },
        { text: 'ÖZELLİK', bg: '#ffffff', color: '#2563eb', border: '1px solid #2563eb', radius: 4, padding: '10px 20px', fontSize: 18, fontWeight: 600, customClass: 'co-shape-minimal-ptr', '--co-bc': '#2563eb', shadow:'none' },
        { text: 'BİLGİ', bg: '#ffffff', color: '#059669', border: '1px solid #059669', radius: 4, padding: '10px 20px', fontSize: 18, fontWeight: 600, customClass: 'co-shape-minimal-ptr', '--co-bc': '#059669', shadow:'none' },
        { text: 'NOT', bg: '#ffffff', color: '#d97706', border: '1px solid #d97706', radius: 4, padding: '10px 20px', fontSize: 18, fontWeight: 600, customClass: 'co-shape-minimal-ptr', '--co-bc': '#d97706', shadow:'none' }
    ],

    '🗨️ Boş Çerçeveler (Oklu)': [
        { text: 'METİN EKLE', bg: '#ffffff', color: '#000000', border: '3px solid #000', radius: 10, padding: '20px 30px', fontSize: 24, fontWeight: 700, letterSpacing: '0', shadow: 'none', customClass: 'co-outline-tail-b', '--co-bg-color': '#ffffff', '--co-border-color': '#000000', '--co-border-width': '3px', '--co-tail-size': '12px', '--co-tail-pos': '30px' },
        { text: 'METİN EKLE', bg: '#ffffff', color: '#dc2626', border: '4px solid #dc2626', radius: 20, padding: '20px 30px', fontSize: 24, fontWeight: 800, letterSpacing: '0', shadow: 'none', customClass: 'co-outline-tail-t', '--co-bg-color': '#ffffff', '--co-border-color': '#dc2626', '--co-border-width': '4px', '--co-tail-size': '15px', '--co-tail-pos': '50%' },
        { text: 'METİN EKLE', bg: '#ffffff', color: '#059669', border: '3px dashed #059669', radius: 15, padding: '20px 30px', fontSize: 24, fontWeight: 700, letterSpacing: '0', shadow: 'none', customClass: 'co-outline-tail-l', '--co-bg-color': '#ffffff', '--co-border-color': '#059669', '--co-border-width': '3px', '--co-tail-size': '12px', '--co-tail-pos': '50%' },
        { text: 'METİN EKLE', bg: '#ffffff', color: '#2563eb', border: '2px solid #2563eb', radius: 0, padding: '20px 30px', fontSize: 24, fontWeight: 700, letterSpacing: '0', shadow: 'none', customClass: 'co-outline-tail-r', '--co-bg-color': '#ffffff', '--co-border-color': '#2563eb', '--co-border-width': '2px', '--co-tail-size': '15px', '--co-tail-pos': '50%' },
        { text: 'METİN EKLE', bg: '#ffffff', color: '#000000', border: '2px solid #000000', radius: 50, padding: '20px 40px', fontSize: 24, fontWeight: 700, letterSpacing: '0', shadow: '5px 5px 0px rgba(0,0,0,0.2)', customClass: 'co-outline-tail-b', '--co-bg-color': '#ffffff', '--co-border-color': '#000000', '--co-border-width': '2px', '--co-tail-size': '15px', '--co-tail-pos': '70%' }
    ],

    '💬 Balon (Klasik)': [
        { text: 'DİKKAT', bg: '#ffffff', color: '#000000', border: '3px solid #000', radius: 15, padding: '15px 30px', fontSize: 24, fontWeight: 800, letterSpacing: '1px', shadow: '0 4px 0 #000', customClass: 'co-tail-b', '--co-bg': '#000' },
        { text: 'YENİ!', bg: '#38bdf8', color: '#ffffff', border: 'none', radius: 20, padding: '15px 30px', fontSize: 24, fontWeight: 800, letterSpacing: '1px', shadow: '0 5px 15px rgba(56,189,248,0.4)', customClass: 'co-tail-br', '--co-bg': '#38bdf8' },
        { text: 'ÖNEMLİ', bg: '#ef4444', color: '#ffffff', border: 'none', radius: 5, padding: '15px 30px', fontSize: 24, fontWeight: 800, letterSpacing: '1px', shadow: 'none', customClass: 'co-tail-l', '--co-bg': '#ef4444' },
        { text: 'BİLGİ', bg: '#10b981', color: '#ffffff', border: '2px solid #059669', radius: 15, padding: '15px 30px', fontSize: 24, fontWeight: 800, letterSpacing: '1px', shadow: '0 4px 10px rgba(16,185,129,0.3)', customClass: 'co-tail-b', '--co-bg': '#059669' },
        { text: 'SATILIK', bg: '#0f172a', color: '#f59e0b', border: '2px solid #f59e0b', radius: 15, padding: '15px 30px', fontSize: 24, fontWeight: 800, letterSpacing: '1px', shadow: '0 4px 10px rgba(0,0,0,0.5)', customClass: 'co-tail-br', '--co-bg': '#f59e0b' }
    ],
    '📍 Pointer (Çizgili)': [
        { text: 'DETAY 1', bg: 'transparent', color: '#000', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, letterSpacing: '0', shadow: 'none', customClass: 'co-pointer-lb', '--co-bg': '#000' },
        { text: 'DETAY 2', bg: 'transparent', color: '#ef4444', border: 'none', radius: 0, padding: '5px 10px', fontSize: 20, fontWeight: 700, letterSpacing: '0', shadow: 'none', customClass: 'co-pointer-tr', '--co-bg': '#ef4444' },
        { text: 'ÖZELLİK', bg: '#fff', color: '#000', border: '2px solid #000', radius: 0, padding: '10px 20px', fontSize: 20, fontWeight: 700, letterSpacing: '0', shadow: 'none', customClass: 'co-pointer-lb', '--co-bg': '#000' },
        { text: 'VURGU', bg: '#38bdf8', color: '#fff', border: 'none', radius: 5, padding: '10px 20px', fontSize: 20, fontWeight: 700, letterSpacing: '0', shadow: 'none', customClass: 'co-pointer-tr', '--co-bg': '#38bdf8' },
        { text: 'EKSTRA', bg: '#000', color: '#fff', border: 'none', radius: 0, padding: '10px 20px', fontSize: 20, fontWeight: 700, letterSpacing: '0', shadow: 'none', customClass: 'co-pointer-lb', '--co-bg': '#000' }
    ],
    '🗯️ Balon (Çizgi Roman)': [
        { text: 'ŞOK FİYAT', bg: '#fbbf24', color: '#000', border: '4px solid #000', radius: 0, padding: '20px 30px', fontSize: 28, fontWeight: 900, letterSpacing: '1px', shadow: '4px 4px 0 #000', customClass: 'co-comic', '--co-bg': '#000' },
        { text: 'KAÇIRMA', bg: '#ef4444', color: '#fff', border: '4px solid #000', radius: 0, padding: '20px 30px', fontSize: 28, fontWeight: 900, letterSpacing: '1px', shadow: '4px 4px 0 #000', customClass: 'co-comic', '--co-bg': '#000' },
        { text: 'FIRSAT', bg: '#ffffff', color: '#000', border: '4px dashed #000', radius: 0, padding: '20px 30px', fontSize: 28, fontWeight: 900, letterSpacing: '1px', shadow: 'none', customClass: 'co-tail-b', '--co-bg': '#000' },
        { text: 'SON GÜN', bg: '#000', color: '#fbbf24', border: 'none', radius: 0, padding: '20px 30px', fontSize: 28, fontWeight: 900, letterSpacing: '1px', shadow: '6px 6px 0 #fbbf24', customClass: 'co-tail-br', '--co-bg': '#fbbf24' },
        { text: 'YENİ', bg: '#10b981', color: '#000', border: '3px solid #000', radius: 0, padding: '20px 30px', fontSize: 28, fontWeight: 900, letterSpacing: '1px', shadow: '4px 4px 0 #000', customClass: 'co-comic', '--co-bg': '#000' }
    ],
    '💭 Balon (Bulut)': [
        { text: 'DÜŞÜN...', bg: '#ffffff', color: '#334155', border: '3px solid #cbd5e1', radius: 50, padding: '20px 40px', fontSize: 24, fontWeight: 800, letterSpacing: '1px', shadow: '0 10px 20px rgba(0,0,0,0.1)', customClass: 'co-cloud' },
        { text: 'HAYAL ET', bg: '#fdf4ff', color: '#c026d3', border: '3px solid #f0abfc', radius: 50, padding: '20px 40px', fontSize: 24, fontWeight: 800, letterSpacing: '1px', shadow: '0 10px 20px rgba(0,0,0,0.1)', customClass: 'co-cloud' },
        { text: 'MÜKEMMEL', bg: '#ecfeff', color: '#0891b2', border: '3px solid #67e8f9', radius: 50, padding: '20px 40px', fontSize: 24, fontWeight: 800, letterSpacing: '1px', shadow: '0 10px 20px rgba(0,0,0,0.1)', customClass: 'co-cloud' },
        { text: 'HARİKA', bg: '#fffbeb', color: '#d97706', border: '3px solid #fcd34d', radius: 50, padding: '20px 40px', fontSize: 24, fontWeight: 800, letterSpacing: '1px', shadow: '0 10px 20px rgba(0,0,0,0.1)', customClass: 'co-cloud' },
        { text: 'İNANILMAZ', bg: '#fef2f2', color: '#e11d48', border: '3px solid #fda4af', radius: 50, padding: '20px 40px', fontSize: 24, fontWeight: 800, letterSpacing: '1px', shadow: '0 10px 20px rgba(0,0,0,0.1)', customClass: 'co-cloud' }
    ],
    '📝 Çerçeve (Kıvrımlı)': [
        { text: 'NOT:', bg: '#fff', color: '#000', border: '1px solid #000', radius: '20px 0 20px 0', padding: '15px 30px', fontSize: 22, fontWeight: 700, letterSpacing: '0', shadow: '2px 2px 0 #000' },
        { text: 'ÖZEL:', bg: '#fff', color: '#0f172a', border: '2px solid #0f172a', radius: '0 20px 0 20px', padding: '15px 30px', fontSize: 22, fontWeight: 700, letterSpacing: '0', shadow: '-2px 2px 0 #0f172a' },
        { text: 'DİKKAT:', bg: '#fef08a', color: '#854d0e', border: '1px dashed #854d0e', radius: 15, padding: '15px 30px', fontSize: 22, fontWeight: 700, letterSpacing: '0', shadow: 'none' },
        { text: 'İPUCU:', bg: '#e0f2fe', color: '#0369a1', border: '1px dotted #0369a1', radius: 15, padding: '15px 30px', fontSize: 22, fontWeight: 700, letterSpacing: '0', shadow: 'none' },
        { text: 'BİLGİ:', bg: '#fce7f3', color: '#be185d', border: '2px solid #be185d', radius: '30px 0 30px 0', padding: '15px 30px', fontSize: 22, fontWeight: 700, letterSpacing: '0', shadow: 'none' }
    ],
    '🏷️ Etiket (Modern)': [
        { text: '#YENİ', bg: '#000', color: '#fff', border: 'none', radius: 20, padding: '10px 25px', fontSize: 18, fontWeight: 600, letterSpacing: '2px', shadow: 'none' },
        { text: '#FIRSAT', bg: '#38bdf8', color: '#fff', border: 'none', radius: 20, padding: '10px 25px', fontSize: 18, fontWeight: 600, letterSpacing: '2px', shadow: 'none' },
        { text: '#SATILIK', bg: '#ef4444', color: '#fff', border: 'none', radius: 20, padding: '10px 25px', fontSize: 18, fontWeight: 600, letterSpacing: '2px', shadow: 'none' },
        { text: '#KİRALIK', bg: '#10b981', color: '#fff', border: 'none', radius: 20, padding: '10px 25px', fontSize: 18, fontWeight: 600, letterSpacing: '2px', shadow: 'none' },
        { text: '#ACİL', bg: '#f59e0b', color: '#000', border: 'none', radius: 20, padding: '10px 25px', fontSize: 18, fontWeight: 600, letterSpacing: '2px', shadow: 'none' }
    ],
    '⚡ Dinamik Çizgiler': [
        { text: 'VURGULA', bg: 'transparent', color: '#000', border: 'none', radius: 0, padding: '5px', fontSize: 26, fontWeight: 900, letterSpacing: '1px', shadow: 'none', borderBottom: '5px solid #38bdf8' },
        { text: 'ÖNE ÇIKAR', bg: 'transparent', color: '#ef4444', border: 'none', radius: 0, padding: '5px', fontSize: 26, fontWeight: 900, letterSpacing: '1px', shadow: 'none', borderBottom: '5px solid #ef4444' },
        { text: 'ALTINI ÇİZ', bg: 'transparent', color: '#10b981', border: 'none', radius: 0, padding: '5px', fontSize: 26, fontWeight: 900, letterSpacing: '1px', shadow: 'none', borderBottom: '5px dashed #10b981' },
        { text: 'ÜSTÜNÜ ÇİZ', bg: 'transparent', color: '#f59e0b', border: 'none', radius: 0, padding: '5px', fontSize: 26, fontWeight: 900, letterSpacing: '1px', shadow: 'none', borderTop: '5px solid #f59e0b' },
        { text: 'ÇİFT ÇİZGİ', bg: 'transparent', color: '#8b5cf6', border: 'none', radius: 0, padding: '5px', fontSize: 26, fontWeight: 900, letterSpacing: '1px', shadow: 'none', borderBottom: '5px double #8b5cf6' }
    ],
    '🎯 Odak Çerçeveleri': [
        { text: 'ODAKLAN', bg: 'transparent', color: '#000', border: '2px solid #000', radius: 0, padding: '15px 30px', fontSize: 24, fontWeight: 900, letterSpacing: '4px', shadow: 'none' },
        { text: 'MERKEZ', bg: 'transparent', color: '#38bdf8', border: '4px solid #38bdf8', radius: 10, padding: '15px 30px', fontSize: 24, fontWeight: 900, letterSpacing: '4px', shadow: 'none' },
        { text: 'HEDEF', bg: 'transparent', color: '#ef4444', border: '2px dashed #ef4444', radius: 0, padding: '15px 30px', fontSize: 24, fontWeight: 900, letterSpacing: '4px', shadow: 'none' },
        { text: 'KADRAJ', bg: 'transparent', color: '#10b981', border: '4px double #10b981', radius: 0, padding: '15px 30px', fontSize: 24, fontWeight: 900, letterSpacing: '4px', shadow: 'none' },
        { text: 'ZİRVEYE', bg: 'transparent', color: '#f59e0b', border: '2px solid #f59e0b', radius: 50, padding: '15px 30px', fontSize: 24, fontWeight: 900, letterSpacing: '4px', shadow: 'none' }
    ],
    '🌟 Premium Etiketler': [
        { text: 'PREMIUM', bg: 'linear-gradient(45deg, #fbbf24, #d97706)', color: '#fff', border: 'none', radius: 4, padding: '10px 25px', fontSize: 20, fontWeight: 800, letterSpacing: '2px', shadow: '0 4px 15px rgba(217,119,6,0.5)' },
        { text: 'VIP', bg: 'linear-gradient(45deg, #000, #333)', color: '#fbbf24', border: '1px solid #fbbf24', radius: 4, padding: '10px 25px', fontSize: 20, fontWeight: 800, letterSpacing: '2px', shadow: '0 4px 15px rgba(0,0,0,0.5)' },
        { text: 'LUXURY', bg: 'linear-gradient(45deg, #e2e8f0, #94a3b8)', color: '#0f172a', border: 'none', radius: 4, padding: '10px 25px', fontSize: 20, fontWeight: 800, letterSpacing: '2px', shadow: '0 4px 15px rgba(148,163,184,0.5)' },
        { text: 'EXCLUSIVE', bg: 'linear-gradient(45deg, #1e3a8a, #3b82f6)', color: '#fff', border: 'none', radius: 4, padding: '10px 25px', fontSize: 20, fontWeight: 800, letterSpacing: '2px', shadow: '0 4px 15px rgba(59,130,246,0.5)' },
        { text: 'ELİT', bg: 'linear-gradient(45deg, #7f1d1d, #ef4444)', color: '#fff', border: 'none', radius: 4, padding: '10px 25px', fontSize: 20, fontWeight: 800, letterSpacing: '2px', shadow: '0 4px 15px rgba(239,68,68,0.5)' }
    ],
    '✨ Modern Şeffaf': [
        { text: 'ŞEFFAF 1', bg: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', radius: 10, padding: '15px 30px', fontSize: 22, fontWeight: 600, letterSpacing: '1px', shadow: 'none', backdropFilter: 'blur(10px)' },
        { text: 'ŞEFFAF 2', bg: 'rgba(255,255,255,0.8)', color: '#000', border: '1px solid rgba(0,0,0,0.2)', radius: 10, padding: '15px 30px', fontSize: 22, fontWeight: 600, letterSpacing: '1px', shadow: '0 4px 10px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)' },
        { text: 'ŞEFFAF 3', bg: 'rgba(56,189,248,0.5)', color: '#fff', border: '1px solid rgba(56,189,248,0.8)', radius: 10, padding: '15px 30px', fontSize: 22, fontWeight: 600, letterSpacing: '1px', shadow: 'none', backdropFilter: 'blur(10px)' },
        { text: 'ŞEFFAF 4', bg: 'rgba(16,185,129,0.5)', color: '#fff', border: '1px solid rgba(16,185,129,0.8)', radius: 10, padding: '15px 30px', fontSize: 22, fontWeight: 600, letterSpacing: '1px', shadow: 'none', backdropFilter: 'blur(10px)' },
        { text: 'ŞEFFAF 5', bg: 'rgba(239,68,68,0.5)', color: '#fff', border: '1px solid rgba(239,68,68,0.8)', radius: 10, padding: '15px 30px', fontSize: 22, fontWeight: 600, letterSpacing: '1px', shadow: 'none', backdropFilter: 'blur(10px)' }
    ],
    '🔥 Fırsat & Aciliyet': [
        { text: 'ACİL SATILIK', bg: 'linear-gradient(135deg,#dc2626,#991b1b)', color: '#fff', border: '2px solid #fff', radius: 8, padding: '14px 32px', fontSize: 28, fontWeight: 900, letterSpacing: '2px', shadow: '0 8px 20px rgba(220,38,38,.5)' },
        { text: 'SON FIRSAT!', bg: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000', border: 'none', radius: 40, padding: '14px 32px', fontSize: 26, fontWeight: 800, letterSpacing: '1px', shadow: '0 8px 20px rgba(245,158,11,.5)' },
        { text: 'FIRSATI KAÇIRMA', bg: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', border: 'none', radius: 6, padding: '12px 28px', fontSize: 24, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(239,68,68,.5)' },
        { text: 'STOK BİTİYOR', bg: '#000', color: '#fbbf24', border: '2px dashed #fbbf24', radius: 4, padding: '12px 28px', fontSize: 22, fontWeight: 800, letterSpacing: '3px', shadow: '0 6px 18px rgba(0,0,0,.4)' },
        { text: '⏰ SÜRE DOLUYOR', bg: 'linear-gradient(135deg,#7c2d12,#dc2626)', color: '#fff', border: '2px solid #fbbf24', radius: 10, padding: '14px 30px', fontSize: 24, fontWeight: 800, letterSpacing: '2px', shadow: '0 8px 20px rgba(220,38,38,.6)' },
        { text: 'BUGÜN SON GÜN', bg: '#fff', color: '#dc2626', border: '3px dashed #dc2626', radius: 8, padding: '12px 26px', fontSize: 22, fontWeight: 900, letterSpacing: '2px', shadow: '0 6px 18px rgba(0,0,0,.15)' },
        { text: 'HEMEN AL', bg: 'linear-gradient(135deg,#ea580c,#dc2626)', color: '#fff', border: 'none', radius: 50, padding: '14px 34px', fontSize: 24, fontWeight: 800, letterSpacing: '2px', shadow: '0 8px 20px rgba(234,88,12,.5)' },
        { text: '🔥 KAÇIRMA', bg: '#dc2626', color: '#fff', border: 'none', radius: 4, padding: '12px 28px', fontSize: 24, fontWeight: 900, letterSpacing: '3px', shadow: '0 6px 18px rgba(220,38,38,.5)' }
    ],
    
    '⭐ Yenilik & Vurgu': [
        { text: 'YENİ!', bg: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', radius: 50, padding: '14px 34px', fontSize: 28, fontWeight: 900, letterSpacing: '2px', shadow: '0 8px 20px rgba(16,185,129,.5)' },
        { text: '★ ÖZEL FIRSAT', bg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: '#fff', border: 'none', radius: 10, padding: '14px 32px', fontSize: 26, fontWeight: 800, letterSpacing: '1px', shadow: '0 8px 20px rgba(139,92,246,.5)' },
        { text: 'YENİ İLAN', bg: '#fff', color: '#dc2626', border: '3px solid #dc2626', radius: 0, padding: '12px 30px', fontSize: 24, fontWeight: 900, letterSpacing: '3px', shadow: '0 6px 18px rgba(0,0,0,.2)' },
        { text: 'ÖNE ÇIKAN', bg: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', radius: 8, padding: '12px 28px', fontSize: 24, fontWeight: 800, letterSpacing: '2px', shadow: '0 6px 18px rgba(249,115,22,.5)' },
        { text: '✨ POPÜLER', bg: 'linear-gradient(135deg,#8b5cf6,#ec4899)', color: '#fff', border: 'none', radius: 30, padding: '12px 28px', fontSize: 22, fontWeight: 800, letterSpacing: '2px', shadow: '0 6px 18px rgba(139,92,246,.5)' },
        { text: 'TREND', bg: '#000', color: '#10b981', border: '2px solid #10b981', radius: 6, padding: '12px 26px', fontSize: 22, fontWeight: 800, letterSpacing: '3px', shadow: '0 6px 18px rgba(16,185,129,.3)' },
        { text: 'SIFIR', bg: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', border: '2px solid #fff', radius: 4, padding: '14px 32px', fontSize: 26, fontWeight: 900, letterSpacing: '4px', shadow: '0 8px 20px rgba(5,150,105,.5)' },
        { text: 'YENİ BİNA', bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', border: 'none', radius: 6, padding: '12px 26px', fontSize: 22, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(59,130,246,.4)' }
    ],
    
    '👑 Prestij & VIP': [
        { text: '★ VIP', bg: 'linear-gradient(135deg,#fbbf24,#d97706)', color: '#000', border: '2px solid rgba(255,255,255,.4)', radius: 6, padding: '14px 36px', fontSize: 30, fontWeight: 900, letterSpacing: '4px', shadow: '0 8px 24px rgba(217,119,6,.6)' },
        { text: '◆ LÜKS', bg: 'linear-gradient(135deg,#0f172a,#1e293b)', color: '#fbbf24', border: '1px solid #fbbf24', radius: 4, padding: '14px 34px', fontSize: 26, fontWeight: 800, letterSpacing: '3px', shadow: '0 8px 20px rgba(0,0,0,.5)' },
        { text: 'PREMIUM', bg: 'linear-gradient(135deg,#18181b,#3f3f46)', color: '#fafafa', border: '1px solid rgba(255,255,255,.2)', radius: 8, padding: '14px 32px', fontSize: 24, fontWeight: 700, letterSpacing: '4px', shadow: '0 8px 20px rgba(0,0,0,.5)' },
        { text: '👑 ELİT', bg: 'linear-gradient(135deg,#7f1d1d,#991b1b)', color: '#fef3c7', border: '2px solid #fbbf24', radius: 10, padding: '14px 32px', fontSize: 26, fontWeight: 800, letterSpacing: '3px', shadow: '0 8px 20px rgba(127,29,29,.5)' },
        { text: '💎 EXCLUSIVE', bg: 'linear-gradient(135deg,#0369a1,#0284c7)', color: '#fff', border: '2px solid #7dd3fc', radius: 6, padding: '14px 32px', fontSize: 24, fontWeight: 800, letterSpacing: '3px', shadow: '0 8px 20px rgba(2,132,199,.5)' },
        { text: 'ROYAL', bg: 'linear-gradient(135deg,#581c87,#7e22ce)', color: '#fbbf24', border: '2px solid #fbbf24', radius: 8, padding: '14px 34px', fontSize: 26, fontWeight: 900, letterSpacing: '4px', shadow: '0 8px 20px rgba(88,28,135,.5)' },
        { text: 'GOLD EDITION', bg: 'linear-gradient(135deg,#78350f,#a16207)', color: '#fef3c7', border: '2px solid #fbbf24', radius: 6, padding: '14px 30px', fontSize: 22, fontWeight: 800, letterSpacing: '3px', shadow: '0 8px 20px rgba(120,53,15,.5)' },
        { text: '🏆 ÖZEL SEÇİM', bg: '#000', color: '#fbbf24', border: '2px solid #fbbf24', radius: 30, padding: '14px 32px', fontSize: 22, fontWeight: 800, letterSpacing: '2px', shadow: '0 8px 20px rgba(0,0,0,.5)' }
    ],
    
    '✅ Durum Bilgisi': [
        { text: 'SATILDI', bg: '#dc2626', color: '#fff', border: '3px solid #fff', radius: 0, padding: '14px 40px', fontSize: 32, fontWeight: 900, letterSpacing: '6px', shadow: '0 8px 20px rgba(0,0,0,.4)' },
        { text: 'REZERVE', bg: '#f59e0b', color: '#000', border: '2px solid #000', radius: 0, padding: '12px 32px', fontSize: 26, fontWeight: 800, letterSpacing: '4px', shadow: '0 6px 18px rgba(245,158,11,.4)' },
        { text: 'BOŞ / MÜSAİT', bg: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', radius: 6, padding: '12px 28px', fontSize: 22, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(16,185,129,.4)' },
        { text: 'ANAHTAR TESLİM', bg: '#fff', color: '#059669', border: '2px solid #059669', radius: 30, padding: '12px 28px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(0,0,0,.15)' },
        { text: 'KİRALIK', bg: 'linear-gradient(135deg,#0284c7,#0369a1)', color: '#fff', border: 'none', radius: 8, padding: '14px 32px', fontSize: 26, fontWeight: 800, letterSpacing: '3px', shadow: '0 8px 20px rgba(2,132,199,.5)' },
        { text: 'DEVREN', bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', radius: 8, padding: '14px 32px', fontSize: 26, fontWeight: 800, letterSpacing: '3px', shadow: '0 8px 20px rgba(124,58,237,.5)' },
        { text: 'İSKANLI', bg: 'linear-gradient(135deg,#059669,#047857)', color: '#fff', border: 'none', radius: 6, padding: '12px 26px', fontSize: 22, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(5,150,105,.4)' },
        { text: 'TAPULU', bg: '#fff', color: '#0f172a', border: '2px solid #0f172a', radius: 4, padding: '12px 28px', fontSize: 22, fontWeight: 800, letterSpacing: '3px', shadow: '0 6px 18px rgba(0,0,0,.15)' }
    ],
    
    '💰 Fiyat & İndirim': [
        { text: 'İNDİRİM %20', bg: 'linear-gradient(135deg,#dc2626,#991b1b)', color: '#fff', border: '3px dashed #fff', radius: 50, padding: '18px 32px', fontSize: 28, fontWeight: 900, letterSpacing: '2px', shadow: '0 8px 24px rgba(220,38,38,.5)' },
        { text: 'PAZARLIKLI', bg: '#000', color: '#fbbf24', border: '2px solid #fbbf24', radius: 8, padding: '14px 32px', fontSize: 24, fontWeight: 800, letterSpacing: '2px', shadow: '0 6px 18px rgba(0,0,0,.4)' },
        { text: 'UYGUN FİYAT', bg: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', border: 'none', radius: 10, padding: '14px 30px', fontSize: 26, fontWeight: 800, letterSpacing: '1px', shadow: '0 8px 20px rgba(5,150,105,.5)' },
        { text: 'YATIRIMLIK', bg: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', border: 'none', radius: 6, padding: '14px 30px', fontSize: 24, fontWeight: 800, letterSpacing: '2px', shadow: '0 8px 20px rgba(29,78,216,.5)' },
        { text: 'İNDİRİM %10', bg: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: '2px dashed #fff', radius: 40, padding: '16px 30px', fontSize: 24, fontWeight: 900, letterSpacing: '2px', shadow: '0 8px 20px rgba(249,115,22,.5)' },
        { text: 'İNDİRİM %30', bg: 'linear-gradient(135deg,#b91c1c,#7f1d1d)', color: '#fff', border: '3px dashed #fbbf24', radius: 50, padding: '18px 34px', fontSize: 28, fontWeight: 900, letterSpacing: '2px', shadow: '0 10px 26px rgba(185,28,28,.6)' },
        { text: 'KAMPANYA', bg: 'linear-gradient(135deg,#ec4899,#be185d)', color: '#fff', border: 'none', radius: 8, padding: '14px 30px', fontSize: 24, fontWeight: 800, letterSpacing: '2px', shadow: '0 8px 20px rgba(236,72,153,.5)' },
        { text: 'FİYATTA İNDİRİM', bg: '#fbbf24', color: '#000', border: '2px solid #000', radius: 6, padding: '14px 30px', fontSize: 22, fontWeight: 900, letterSpacing: '2px', shadow: '0 8px 20px rgba(251,191,36,.5)' },
        { text: 'KREDİYE UYGUN', bg: '#0284c7', color: '#fff', border: 'none', radius: 6, padding: '12px 28px', fontSize: 22, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(2,132,199,.4)' },
        { text: 'SENETLE', bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', radius: 6, padding: '12px 28px', fontSize: 22, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(124,58,237,.4)' }
    ],
    
    '📞 İletişim & CTA': [
        { text: '📞 HEMEN ARA', bg: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', radius: 40, padding: '16px 36px', fontSize: 26, fontWeight: 800, letterSpacing: '1px', shadow: '0 10px 24px rgba(16,185,129,.5)' },
        { text: '👉 BİLGİ AL', bg: '#000', color: '#fff', border: '2px solid #fbbf24', radius: 6, padding: '14px 32px', fontSize: 24, fontWeight: 700, letterSpacing: '2px', shadow: '0 8px 20px rgba(0,0,0,.4)' },
        { text: '💬 WHATSAPP', bg: '#25D366', color: '#fff', border: 'none', radius: 30, padding: '14px 32px', fontSize: 24, fontWeight: 800, letterSpacing: '1px', shadow: '0 8px 20px rgba(37,211,102,.5)' },
        { text: '📍 KEŞFET', bg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: '#fff', border: 'none', radius: 8, padding: '14px 30px', fontSize: 24, fontWeight: 800, letterSpacing: '2px', shadow: '0 8px 20px rgba(139,92,246,.5)' },
        { text: '📲 MESAJ ATIN', bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', border: 'none', radius: 30, padding: '14px 32px', fontSize: 22, fontWeight: 700, letterSpacing: '1px', shadow: '0 8px 20px rgba(59,130,246,.5)' },
        { text: '🔔 BİLGİ İSTE', bg: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000', border: 'none', radius: 8, padding: '14px 30px', fontSize: 22, fontWeight: 800, letterSpacing: '2px', shadow: '0 8px 20px rgba(245,158,11,.5)' },
        { text: '✆ İLETİŞİM', bg: '#0f172a', color: '#fbbf24', border: '2px solid #fbbf24', radius: 6, padding: '14px 32px', fontSize: 24, fontWeight: 800, letterSpacing: '3px', shadow: '0 6px 18px rgba(0,0,0,.5)' },
        { text: '🎯 RANDEVU AL', bg: 'linear-gradient(135deg,#0284c7,#0369a1)', color: '#fff', border: 'none', radius: 10, padding: '14px 30px', fontSize: 22, fontWeight: 700, letterSpacing: '2px', shadow: '0 8px 20px rgba(2,132,199,.5)' },
        { text: '📧 E-POSTA', bg: '#fff', color: '#0f172a', border: '2px solid #0f172a', radius: 6, padding: '12px 28px', fontSize: 22, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(0,0,0,.15)' },
        { text: 'GEZ / GÖR', bg: 'linear-gradient(135deg,#059669,#047857)', color: '#fff', border: 'none', radius: 30, padding: '14px 30px', fontSize: 22, fontWeight: 800, letterSpacing: '2px', shadow: '0 6px 18px rgba(5,150,105,.4)' }
    ],
    
    '🏆 Özellik & Rozet': [
        { text: '4+1', bg: 'rgba(0,0,0,.85)', color: '#fff', border: '2px solid #fbbf24', radius: 50, padding: '18px 24px', fontSize: 36, fontWeight: 900, letterSpacing: '0px', shadow: '0 8px 20px rgba(0,0,0,.5)' },
        { text: '3+1', bg: 'rgba(0,0,0,.85)', color: '#fff', border: '2px solid #10b981', radius: 50, padding: '18px 24px', fontSize: 36, fontWeight: 900, letterSpacing: '0px', shadow: '0 8px 20px rgba(0,0,0,.5)' },
        { text: '2+1', bg: 'rgba(0,0,0,.85)', color: '#fff', border: '2px solid #3b82f6', radius: 50, padding: '18px 24px', fontSize: 36, fontWeight: 900, letterSpacing: '0px', shadow: '0 8px 20px rgba(0,0,0,.5)' },
        { text: '5+1', bg: 'rgba(0,0,0,.85)', color: '#fff', border: '2px solid #dc2626', radius: 50, padding: '18px 24px', fontSize: 36, fontWeight: 900, letterSpacing: '0px', shadow: '0 8px 20px rgba(0,0,0,.5)' },
        { text: 'DENİZ MANZARALI', bg: 'linear-gradient(135deg,#0284c7,#0369a1)', color: '#fff', border: 'none', radius: 6, padding: '12px 26px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(2,132,199,.4)' },
        { text: 'SITE İÇİ', bg: 'linear-gradient(135deg,#059669,#047857)', color: '#fff', border: 'none', radius: 6, padding: '12px 26px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(5,150,105,.4)' },
        { text: 'FULL EŞYALI', bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', radius: 6, padding: '12px 26px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(124,58,237,.4)' },
        { text: 'DOĞALGAZ', bg: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', radius: 6, padding: '12px 26px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(249,115,22,.4)' },
        { text: 'ASANSÖRLÜ', bg: 'linear-gradient(135deg,#475569,#334155)', color: '#fff', border: 'none', radius: 6, padding: '12px 26px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(71,85,105,.4)' },
        { text: 'OTOPARKLI', bg: 'linear-gradient(135deg,#0f766e,#134e4a)', color: '#fff', border: 'none', radius: 6, padding: '12px 26px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(15,118,110,.4)' },
        { text: 'GÜVENLİKLİ', bg: 'linear-gradient(135deg,#991b1b,#7f1d1d)', color: '#fff', border: 'none', radius: 6, padding: '12px 26px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(153,27,27,.4)' },
        { text: 'HAVUZLU', bg: 'linear-gradient(135deg,#0891b2,#0e7490)', color: '#fff', border: 'none', radius: 6, padding: '12px 26px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(8,145,178,.4)' }
    ],
    
    '🎯 Modern Rozet': [
        { text: '✓ ONAYLI', bg: '#fff', color: '#059669', border: '2px solid #059669', radius: 30, padding: '10px 22px', fontSize: 18, fontWeight: 700, letterSpacing: '1px', shadow: '0 4px 14px rgba(0,0,0,.15)' },
        { text: '⚡ HIZLI TESLİM', bg: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b', radius: 4, padding: '10px 22px', fontSize: 18, fontWeight: 700, letterSpacing: '1px', shadow: '0 4px 14px rgba(0,0,0,.1)' },
        { text: '🔒 GÜVENLİ', bg: '#dbeafe', color: '#1d4ed8', border: '1px solid #3b82f6', radius: 4, padding: '10px 22px', fontSize: 18, fontWeight: 700, letterSpacing: '1px', shadow: '0 4px 14px rgba(0,0,0,.1)' },
        { text: '🌟 5 YILDIZ', bg: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#000', border: 'none', radius: 4, padding: '10px 22px', fontSize: 18, fontWeight: 800, letterSpacing: '1px', shadow: '0 4px 14px rgba(245,158,11,.4)' },
        { text: '♿ ERİŞİLEBİLİR', bg: '#e0f2fe', color: '#0369a1', border: '1px solid #0284c7', radius: 4, padding: '10px 22px', fontSize: 18, fontWeight: 700, letterSpacing: '1px', shadow: '0 4px 14px rgba(0,0,0,.1)' },
        { text: '🌱 ÇEVRE DOSTU', bg: '#dcfce7', color: '#047857', border: '1px solid #059669', radius: 4, padding: '10px 22px', fontSize: 18, fontWeight: 700, letterSpacing: '1px', shadow: '0 4px 14px rgba(0,0,0,.1)' },
        { text: '🏛️ DEPREME DAYANIKLI', bg: '#fee2e2', color: '#991b1b', border: '1px solid #dc2626', radius: 4, padding: '10px 22px', fontSize: 18, fontWeight: 700, letterSpacing: '1px', shadow: '0 4px 14px rgba(0,0,0,.1)' },
        { text: '📶 FIBER İNTERNET', bg: '#f3e8ff', color: '#6d28d9', border: '1px solid #7c3aed', radius: 4, padding: '10px 22px', fontSize: 18, fontWeight: 700, letterSpacing: '1px', shadow: '0 4px 14px rgba(0,0,0,.1)' }
    ],
    
    '🏗️ Yeni Kategori': [
        { text: 'YENİ PROJE', bg: 'linear-gradient(135deg,#1e40af,#3b82f6)', color: '#fff', border: '2px solid #fff', radius: 8, padding: '14px 32px', fontSize: 26, fontWeight: 900, letterSpacing: '3px', shadow: '0 8px 20px rgba(30,64,175,.5)' },
        { text: 'İNŞAAT HALİNDE', bg: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000', border: '3px solid #000', radius: 4, padding: '14px 30px', fontSize: 22, fontWeight: 900, letterSpacing: '2px', shadow: '0 8px 20px rgba(245,158,11,.5)' },
        { text: 'TESLİM 2026', bg: '#0f172a', color: '#fbbf24', border: '2px solid #fbbf24', radius: 30, padding: '14px 32px', fontSize: 22, fontWeight: 800, letterSpacing: '3px', shadow: '0 8px 20px rgba(0,0,0,.5)' },
        { text: 'ARSA YATIRIMI', bg: 'linear-gradient(135deg,#166534,#15803d)', color: '#fff', border: 'none', radius: 6, padding: '14px 30px', fontSize: 22, fontWeight: 800, letterSpacing: '2px', shadow: '0 8px 20px rgba(22,101,52,.5)' },
        { text: 'İMARLI ARSA', bg: 'linear-gradient(135deg,#059669,#065f46)', color: '#fff', border: '2px solid #a7f3d0', radius: 6, padding: '12px 28px', fontSize: 22, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(5,150,105,.4)' },
        { text: 'TARLA', bg: 'linear-gradient(135deg,#65a30d,#4d7c0f)', color: '#fff', border: 'none', radius: 4, padding: '12px 30px', fontSize: 22, fontWeight: 800, letterSpacing: '3px', shadow: '0 6px 18px rgba(101,163,13,.4)' },
        { text: 'BAĞ - BAHÇE', bg: 'linear-gradient(135deg,#84cc16,#65a30d)', color: '#fff', border: 'none', radius: 6, padding: '12px 28px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(132,204,22,.4)' },
        { text: 'ANAYOLA CEPHE', bg: 'linear-gradient(135deg,#0369a1,#075985)', color: '#fff', border: 'none', radius: 6, padding: '12px 28px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(3,105,161,.4)' }
    ],
    
    '📍 Konum & Bölge': [
        { text: '📍 MERKEZ', bg: 'linear-gradient(135deg,#dc2626,#991b1b)', color: '#fff', border: 'none', radius: 30, padding: '12px 28px', fontSize: 22, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(220,38,38,.4)' },
        { text: '🌊 SAHİL', bg: 'linear-gradient(135deg,#0891b2,#0e7490)', color: '#fff', border: 'none', radius: 30, padding: '12px 28px', fontSize: 22, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(8,145,178,.4)' },
        { text: '🌲 ORMAN İÇİ', bg: 'linear-gradient(135deg,#166534,#14532d)', color: '#fff', border: 'none', radius: 30, padding: '12px 28px', fontSize: 22, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(22,101,52,.4)' },
        { text: '🏔️ MANZARALI', bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', radius: 30, padding: '12px 28px', fontSize: 22, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(124,58,237,.4)' },
        { text: '🏫 OKULA YAKIN', bg: 'linear-gradient(135deg,#0284c7,#0369a1)', color: '#fff', border: 'none', radius: 6, padding: '12px 26px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(2,132,199,.4)' },
        { text: '🛒 AVM YANI', bg: 'linear-gradient(135deg,#ec4899,#be185d)', color: '#fff', border: 'none', radius: 6, padding: '12px 26px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(236,72,153,.4)' },
        { text: '🏥 HASTANE YAKINI', bg: 'linear-gradient(135deg,#dc2626,#991b1b)', color: '#fff', border: 'none', radius: 6, padding: '12px 26px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(220,38,38,.4)' },
        { text: '🚇 METRO ÇOK YAKIN', bg: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff', border: 'none', radius: 6, padding: '12px 26px', fontSize: 20, fontWeight: 700, letterSpacing: '2px', shadow: '0 6px 18px rgba(124,58,237,.4)' }
    ]
};
if(typeof window.CALLOUT_LIBRARY === "undefined") window.CALLOUT_LIBRARY = {};
Object.assign(window.CALLOUT_LIBRARY, {
    "arsa": {
        title: "🌳 Arsa / Arazi",
        items: [
            {
                name: "İmarlı Damga",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" fill="none" stroke="#2a9d8f" stroke-width="4"/><circle cx="100" cy="100" r="78" fill="none" stroke="#2a9d8f" stroke-width="1"/><text x="100" y="70" text-anchor="middle" fill="#2a9d8f" font-size="11" letter-spacing="4">İMARLI</text><line x1="60" y1="80" x2="140" y2="80" stroke="#2a9d8f" stroke-width="1"/><text x="100" y="115" text-anchor="middle" fill="white" font-size="28" font-weight="700">1.250</text><text x="100" y="140" text-anchor="middle" fill="#2a9d8f" font-size="12" letter-spacing="3">m²</text></svg>`
            },
            {
                name: "Tarla Kart",
                svg: `<svg width="260" height="160" viewBox="0 0 260 160"><rect x="10" y="10" width="240" height="140" rx="12" fill="#264653"/><rect x="10" y="10" width="70" height="140" fill="#2a9d8f"/><path d="M45 40 L30 70 L60 70 Z" fill="white"/><path d="M45 55 L28 85 L62 85 Z" fill="white"/><rect x="42" y="85" width="6" height="15" fill="white"/><text x="165" y="55" text-anchor="middle" fill="#2a9d8f" font-size="10" letter-spacing="3">ARAZİ</text><text x="165" y="95" text-anchor="middle" fill="white" font-size="26" font-weight="700">3.500 m²</text><text x="165" y="120" text-anchor="middle" fill="#2a9d8f" font-size="9">TARLA · SULU</text></svg>`
            },
            {
                name: "Tapu Belgesi",
                svg: `<svg width="220" height="180" viewBox="0 0 220 180"><rect x="20" y="15" width="180" height="150" fill="#f8f5e6" stroke="#8b6914" stroke-width="2"/><rect x="30" y="25" width="160" height="130" fill="none" stroke="#8b6914" stroke-width="0.5" stroke-dasharray="3 2"/><text x="110" y="50" text-anchor="middle" fill="#8b6914" font-size="10" letter-spacing="4">TAPU KAYITLI</text><line x1="60" y1="60" x2="160" y2="60" stroke="#8b6914" stroke-width="0.5"/><text x="110" y="95" text-anchor="middle" fill="#1a1a2e" font-size="24" font-weight="700">850 m²</text><text x="110" y="120" text-anchor="middle" fill="#8b6914" font-size="9">Pafta: 12 · Ada: 456</text></svg>`
            },
            {
                name: "Ölçülü Sınır",
                svg: `<svg width="280" height="200" viewBox="0 0 280 200"><polygon points="40,40 240,40 240,160 40,160" fill="none" stroke="#00ff88" stroke-width="2" stroke-dasharray="8 4"/><polygon points="40,40 240,40 240,160 40,160" fill="#00ff88" fill-opacity="0.1"/><line x1="40" y1="30" x2="240" y2="30" stroke="#00ff88"/><polygon points="40,30 48,26 48,34" fill="#00ff88"/><polygon points="240,30 232,26 232,34" fill="#00ff88"/><text x="140" y="22" text-anchor="middle" fill="#00ff88" font-size="9">50 m</text><text x="140" y="105" text-anchor="middle" fill="white" font-size="26" font-weight="700">1.500 m²</text></svg>`
            },
            {
                name: "Yatırım Şerit",
                svg: `<svg width="300" height="120" viewBox="0 0 300 120"><defs><linearGradient id="a5" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#2a9d8f"/><stop offset="100%" stop-color="#264653"/></linearGradient></defs><polygon points="0,25 280,25 300,60 280,95 0,95 20,60" fill="url(#a5)"/><polygon points="0,25 20,60 0,95 15,60" fill="#FFD700" opacity="0.4"/><text x="155" y="52" text-anchor="middle" fill="white" font-size="10" letter-spacing="4">YATIRIMLIK ARSA</text><text x="155" y="78" text-anchor="middle" fill="#FFD700" font-size="20" font-weight="700">2.750 m²</text></svg>`
            },
            {
                name: "Harita Blok",
                svg: `<svg width="240" height="200" viewBox="0 0 240 200"><rect x="20" y="20" width="200" height="160" fill="#2a9d8f" fill-opacity="0.15" stroke="#2a9d8f" stroke-width="2"/><path d="M20 60 L220 60 M20 100 L220 100 M20 140 L220 140" stroke="#2a9d8f" stroke-width="0.3"/><path d="M60 20 L60 180 M110 20 L110 180 M170 20 L170 180" stroke="#2a9d8f" stroke-width="0.3"/><polygon points="60,60 170,60 170,140 60,140" fill="#2a9d8f" fill-opacity="0.4" stroke="#2a9d8f" stroke-width="2"/><text x="115" y="105" text-anchor="middle" fill="white" font-size="16" font-weight="700">450 m²</text></svg>`
            },
            {
                name: "Sarı Uyarı Üçgen",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><polygon points="110,20 200,170 20,170" fill="#ffc300" stroke="#1a1a2e" stroke-width="3"/><text x="110" y="110" text-anchor="middle" fill="#1a1a2e" font-size="10" letter-spacing="3">ARSA</text><text x="110" y="145" text-anchor="middle" fill="#1a1a2e" font-size="20" font-weight="700">920 m²</text></svg>`
            },
            {
                name: "İkili Karşılaştırma",
                svg: `<svg width="300" height="140" viewBox="0 0 300 140"><rect x="10" y="10" width="280" height="120" rx="8" fill="white"/><line x1="150" y1="20" x2="150" y2="120" stroke="#e0e0e0"/><text x="80" y="45" text-anchor="middle" fill="#2a9d8f" font-size="10" letter-spacing="2">TOPLAM ARSA</text><text x="80" y="85" text-anchor="middle" fill="#1a1a2e" font-size="24" font-weight="700">1.850</text><text x="80" y="105" text-anchor="middle" fill="#666" font-size="10">m²</text><text x="220" y="45" text-anchor="middle" fill="#e63946" font-size="10" letter-spacing="2">İMAR ORANI</text><text x="220" y="85" text-anchor="middle" fill="#1a1a2e" font-size="24" font-weight="700">%40</text><text x="220" y="105" text-anchor="middle" fill="#666" font-size="10">TAKS</text></svg>`
            },
            {
                name: "Neon Çerçeve",
                svg: `<svg width="240" height="180" viewBox="0 0 240 180"><defs><filter id="a9"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect x="20" y="20" width="200" height="140" fill="#0a0e27" stroke="#00ff88" stroke-width="2" filter="url(#a9)"/><text x="120" y="65" text-anchor="middle" fill="#00ff88" font-size="10" letter-spacing="4" filter="url(#a9)">SATILIK ARSA</text><text x="120" y="110" text-anchor="middle" fill="white" font-size="28" font-weight="700" filter="url(#a9)">1.250 m²</text><text x="120" y="135" text-anchor="middle" fill="#00ff88" font-size="9" letter-spacing="3" filter="url(#a9)">İMARA AÇIK</text></svg>`
            },
            {
                name: "Doğa Manzara",
                svg: `<svg width="260" height="180" viewBox="0 0 260 180"><rect x="10" y="10" width="240" height="160" rx="12" fill="#1a1a2e"/><polygon points="10,120 60,80 110,110 160,60 210,90 250,70 250,170 10,170" fill="#2a9d8f" fill-opacity="0.5"/><polygon points="10,140 50,110 100,130 150,100 200,120 250,110 250,170 10,170" fill="#2a9d8f"/><text x="130" y="45" text-anchor="middle" fill="#FFD700" font-size="10" letter-spacing="3">MANZARALI ARAZİ</text><text x="130" y="75" text-anchor="middle" fill="white" font-size="22" font-weight="700">5.000 m²</text></svg>`
            },
            {
                name: "Kadastro",
                svg: `<svg width="240" height="180" viewBox="0 0 240 180"><rect x="20" y="20" width="200" height="140" fill="none" stroke="#003566" stroke-width="2"/><line x1="20" y1="60" x2="220" y2="60" stroke="#003566" stroke-width="0.5"/><text x="30" y="45" fill="#003566" font-size="9" letter-spacing="2">KADASTRO NO</text><text x="210" y="45" text-anchor="end" fill="#003566" font-size="12" font-weight="700">#2456</text><text x="120" y="105" text-anchor="middle" fill="#003566" font-size="10" letter-spacing="3">ARSA ALANI</text><text x="120" y="140" text-anchor="middle" fill="#1a1a2e" font-size="28" font-weight="700">3.400 m²</text></svg>`
            },
            {
                name: "Dönüm Rozet",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="#8b6914"/><circle cx="100" cy="100" r="75" fill="#c9a227"/><circle cx="100" cy="100" r="60" fill="#0a0e27"/><text x="100" y="80" text-anchor="middle" fill="#FFD700" font-size="9" letter-spacing="3">TARIM</text><text x="100" y="105" text-anchor="middle" fill="white" font-size="18" font-weight="700">1.5</text><text x="100" y="128" text-anchor="middle" fill="#FFD700" font-size="10" letter-spacing="2">DÖNÜM</text></svg>`
            },
            {
                name: "Cam Yeşil",
                svg: `<svg width="280" height="140" viewBox="0 0 280 140"><rect x="10" y="10" width="260" height="120" rx="16" fill="white" fill-opacity="0.15" stroke="white" stroke-opacity="0.4"/><text x="140" y="50" text-anchor="middle" fill="white" font-size="10" letter-spacing="4" opacity="0.9">İMARLI ARSA</text><text x="140" y="90" text-anchor="middle" fill="white" font-size="32" font-weight="700">2.100 m²</text><text x="140" y="115" text-anchor="middle" fill="white" font-size="10" opacity="0.8">KONUT + TİCARİ</text></svg>`
            },
            {
                name: "Panorama Şerit",
                svg: `<svg width="340" height="100" viewBox="0 0 340 100"><rect x="10" y="20" width="320" height="60" fill="#264653"/><rect x="10" y="20" width="12" height="60" fill="#e9c46a"/><rect x="318" y="20" width="12" height="60" fill="#e9c46a"/><text x="170" y="45" text-anchor="middle" fill="#e9c46a" font-size="9" letter-spacing="4">GENİŞ CEPHELİ ARSA</text><text x="170" y="70" text-anchor="middle" fill="white" font-size="18" font-weight="700">60 m CEPHE · 2.400 m²</text></svg>`
            },
            {
                name: "Yol Cepheli",
                svg: `<svg width="240" height="200" viewBox="0 0 240 200"><rect x="20" y="60" width="200" height="120" fill="#2a9d8f" fill-opacity="0.3" stroke="#2a9d8f" stroke-width="2"/><rect x="20" y="30" width="200" height="20" fill="#666"/><line x1="30" y1="40" x2="60" y2="40" stroke="white" stroke-width="2" stroke-dasharray="8 8"/><line x1="80" y1="40" x2="110" y2="40" stroke="white" stroke-width="2" stroke-dasharray="8 8"/><line x1="130" y1="40" x2="160" y2="40" stroke="white" stroke-width="2" stroke-dasharray="8 8"/><line x1="180" y1="40" x2="210" y2="40" stroke="white" stroke-width="2" stroke-dasharray="8 8"/><text x="120" y="115" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">YOL CEPHELİ</text><text x="120" y="150" text-anchor="middle" fill="white" font-size="22" font-weight="700">1.800 m²</text></svg>`
            },
            {
                name: "İmar Detay",
                svg: `<svg width="280" height="140" viewBox="0 0 280 140"><rect x="10" y="10" width="280" height="120" rx="6" fill="#1a1a2e"/><rect x="10" y="10" width="280" height="30" fill="#2a9d8f"/><text x="145" y="30" text-anchor="middle" fill="white" font-size="10" letter-spacing="4">İMAR DURUMU: KONUT</text><text x="70" y="70" fill="white" font-size="9">TAKS</text><text x="70" y="90" fill="#2a9d8f" font-size="18" font-weight="700">0.30</text><text x="140" y="70" fill="white" font-size="9">KAKS</text><text x="140" y="90" fill="#2a9d8f" font-size="18" font-weight="700">1.20</text><text x="220" y="70" fill="white" font-size="9">KAT</text><text x="220" y="90" fill="#2a9d8f" font-size="18" font-weight="700">4</text></svg>`
            },
            {
                name: "Deniz Manzaralı",
                svg: `<svg width="260" height="180" viewBox="0 0 260 180"><rect x="10" y="10" width="240" height="160" rx="12" fill="#003566"/><path d="M10 100 Q65 90 130 100 T250 100 L250 170 L10 170 Z" fill="#0077b6"/><path d="M10 120 Q65 110 130 120 T250 120 L250 170 L10 170 Z" fill="#00b4d8"/><circle cx="200" cy="45" r="15" fill="#ffc300"/><text x="130" y="55" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">DENİZ MANZARALI</text><text x="130" y="90" text-anchor="middle" fill="white" font-size="22" font-weight="700">6.500 m²</text></svg>`
            },
            {
                name: "Kupon Etiket",
                svg: `<svg width="300" height="140" viewBox="0 0 300 140"><path d="M20 30 L280 30 L280 110 L20 110 Z" fill="white"/><g stroke="#e0e0e0" stroke-width="1" stroke-dasharray="3 3"><line x1="150" y1="30" x2="150" y2="110"/></g><circle cx="20" cy="70" r="8" fill="#1a1f3a"/><circle cx="280" cy="70" r="8" fill="#1a1f3a"/><text x="85" y="55" text-anchor="middle" fill="#e63946" font-size="9" letter-spacing="3">FIRSAT</text><text x="85" y="85" text-anchor="middle" fill="#1a1a2e" font-size="22" font-weight="700">%20</text><text x="215" y="55" text-anchor="middle" fill="#2a9d8f" font-size="9" letter-spacing="3">TOPLAM</text><text x="215" y="85" text-anchor="middle" fill="#1a1a2e" font-size="18" font-weight="700">4.500m²</text></svg>`
            },
            {
                name: "Zarf Fırsat",
                svg: `<svg width="260" height="180" viewBox="0 0 260 180"><rect x="20" y="30" width="220" height="120" fill="#e63946"/><polygon points="20,30 130,110 240,30" fill="none" stroke="white" stroke-width="2"/><text x="130" y="130" text-anchor="middle" fill="white" font-size="10" letter-spacing="4">SICAK FIRSAT ARSA</text><text x="130" y="155" text-anchor="middle" fill="#ffc300" font-size="14" font-weight="700">1.100 m²</text></svg>`
            },
            {
                name: "Exclusive Villa",
                svg: `<svg width="260" height="200" viewBox="0 0 260 200"><defs><linearGradient id="a20" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#8b6914"/></linearGradient></defs><rect x="10" y="10" width="240" height="180" fill="#0a0e27"/><rect x="10" y="10" width="240" height="180" fill="none" stroke="url(#a20)" stroke-width="3"/><polygon points="10,10 40,10 10,40" fill="url(#a20)"/><polygon points="250,10 220,10 250,40" fill="url(#a20)"/><polygon points="10,190 40,190 10,160" fill="url(#a20)"/><polygon points="250,190 220,190 250,160" fill="url(#a20)"/><text x="130" y="65" text-anchor="middle" fill="url(#a20)" font-size="10" letter-spacing="6">EXCLUSIVE</text><line x1="70" y1="75" x2="190" y2="75" stroke="url(#a20)" stroke-width="0.5"/><text x="130" y="115" text-anchor="middle" fill="white" font-size="30" font-weight="700">5.000</text><text x="130" y="140" text-anchor="middle" fill="url(#a20)" font-size="12" letter-spacing="4">m²</text><text x="130" y="170" text-anchor="middle" fill="url(#a20)" font-size="9" letter-spacing="4">VİLLA ARSASI</text></svg>`
            },
            {
                name: "A1  Yeşil Arsa",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <rect x="5" y="10" width="190" height="75" rx="10" fill="#2d6a4f"/> <text x="100" y="35" text-anchor="middle" fill="#b7e4c7" font-size="9" letter-spacing="3">ARSA</text> <text x="100" y="65" text-anchor="middle" fill="white" font-size="24" font-weight="700">1.500 m²</text> </svg>`
            },
            {
                name: "A2  Arazi Detay",
                svg: `<svg width="220" height="120" viewBox="0 0 220 120"> <rect x="10" y="10" width="200" height="95" rx="12" fill="#1a1a2e" stroke="#2a9d8f" stroke-width="1.5"/> <text x="110" y="30" text-anchor="middle" fill="#2a9d8f" font-size="8" letter-spacing="4">ARAZİ BİLGİSİ</text> <line x1="30" y1="40" x2="190" y2="40" stroke="#2a9d8f" stroke-width="0.5"/> <text x="40" y="60" fill="#8b9dc3" font-size="9">Alan:</text> <text x="180" y="60" text-anchor="end" fill="white" font-size="11" font-weight="700">2.500 m²</text> <text x="40" y="78" fill="#8b9dc3" font-size="9">İmar:</text> <text x="180" y="78" text-anchor="end" fill="#00ff88" font-size="11" font-weight="700">Konut</text> <text x="40" y="96" fill="#8b9dc3" font-size="9">TAKS/KAKS:</text> <text x="180" y="96" text-anchor="end" fill="white" font-size="11" font-weight="700">0.30 / 1.50</text> </svg>`
            },
            {
                name: "A3  Parsel Harita",
                svg: `<svg width="180" height="160" viewBox="0 0 180 160"> <polygon points="30,130 20,50 70,20 140,30 160,80 120,140" fill="none" stroke="#2a9d8f" stroke-width="2" stroke-dasharray="6 3"/> <text x="90" y="75" text-anchor="middle" fill="white" font-size="18" font-weight="700">3.200</text> <text x="90" y="95" text-anchor="middle" fill="#2a9d8f" font-size="12">m²</text> <text x="90" y="115" text-anchor="middle" fill="#8b9dc3" font-size="8" letter-spacing="1">PARSEL</text> <circle cx="30" cy="130" r="3" fill="#2a9d8f"/> <circle cx="20" cy="50" r="3" fill="#2a9d8f"/> <circle cx="70" cy="20" r="3" fill="#2a9d8f"/> <circle cx="140" cy="30" r="3" fill="#2a9d8f"/> <circle cx="160" cy="80" r="3" fill="#2a9d8f"/> <circle cx="120" cy="140" r="3" fill="#2a9d8f"/> </svg>`
            },
            {
                name: "A4  Tarla",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <rect x="5" y="15" width="190" height="65" rx="8" fill="#264653" stroke="#e9c46a" stroke-width="1.5"/> <text x="30" y="55" fill="white" font-size="24">🌾</text> <text x="130" y="42" text-anchor="middle" fill="#e9c46a" font-size="8" letter-spacing="3">TARLA</text> <text x="130" y="65" text-anchor="middle" fill="white" font-size="20" font-weight="700">15 Dönüm</text> </svg>`
            },
            {
                name: "A5  İmarlı Altıgen",
                svg: `<svg width="180" height="100" viewBox="0 0 180 100"> <polygon points="0,50 15,15 165,15 180,50 165,85 15,85" fill="#2d6a4f"/> <text x="90" y="42" text-anchor="middle" fill="#b7e4c7" font-size="8" letter-spacing="3">İMARLI ARSA</text> <text x="90" y="66" text-anchor="middle" fill="white" font-size="22" font-weight="700">850 m²</text> </svg>`
            },
            {
                name: "A6  Manzaralı Arsa",
                svg: `<svg width="200" height="120" viewBox="0 0 200 120"> <defs><linearGradient id="a6g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#87ceeb"/><stop offset="50%" stop-color="#87ceeb"/><stop offset="50%" stop-color="#2d6a4f"/><stop offset="100%" stop-color="#1a472a"/></linearGradient></defs> <rect x="10" y="10" width="180" height="95" rx="12" fill="url(#a6g)"/> <text x="100" y="35" text-anchor="middle" fill="white" font-size="9" letter-spacing="3">DENİZ MANZARALI</text> <text x="100" y="82" text-anchor="middle" fill="white" font-size="22" font-weight="700">5.000 m²</text> <text x="100" y="98" text-anchor="middle" fill="#b7e4c7" font-size="8" letter-spacing="1">ARAZİ</text> </svg>`
            },
            {
                name: "A7  Ticari Arsa",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <rect x="5" y="10" width="190" height="75" rx="10" fill="#0a0e27" stroke="#FFD700" stroke-width="2"/> <text x="100" y="32" text-anchor="middle" fill="#FFD700" font-size="8" letter-spacing="4">TİCARİ ARSA</text> <text x="100" y="60" text-anchor="middle" fill="white" font-size="22" font-weight="700">4.200 m²</text> <text x="100" y="78" text-anchor="middle" fill="#FFD700" font-size="9">ANA CADDE ÜZERİ</text> </svg>`
            },
            {
                name: "A8  Satılık Arsa",
                svg: `<svg width="180" height="100" viewBox="0 0 180 100"> <rect x="5" y="10" width="170" height="75" rx="10" fill="#e63946"/> <text x="90" y="30" text-anchor="middle" fill="white" font-size="7" letter-spacing="3">SATILIK</text> <text x="90" y="55" text-anchor="middle" fill="white" font-size="26" font-weight="700">ARSA</text> <text x="90" y="75" text-anchor="middle" fill="white" font-size="11">750 m² · ₺ 2.8M</text> </svg>`
            },
            {
                name: "A9  TAKS/KAKS",
                svg: `<svg width="220" height="100" viewBox="0 0 220 100"> <rect x="5" y="10" width="100" height="75" rx="8" fill="#2d6a4f"/> <rect x="115" y="10" width="100" height="75" rx="8" fill="#264653"/> <text x="55" y="32" text-anchor="middle" fill="#b7e4c7" font-size="7" letter-spacing="2">TAKS</text> <text x="55" y="60" text-anchor="middle" fill="white" font-size="24" font-weight="700">0.30</text> <text x="165" y="32" text-anchor="middle" fill="#00d4ff" font-size="7" letter-spacing="2">KAKS</text> <text x="165" y="60" text-anchor="middle" fill="white" font-size="24" font-weight="700">1.50</text> <text x="55" y="78" text-anchor="middle" fill="#b7e4c7" font-size="7">%30</text> <text x="165" y="78" text-anchor="middle" fill="#00d4ff" font-size="7">E:1.50</text> </svg>`
            },
            {
                name: "A10  Neon Arazi",
                svg: `<svg width="180" height="100" viewBox="0 0 180 100"> <defs><filter id="a10"><feGaussianBlur stdDeviation="2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs> <rect x="5" y="10" width="170" height="75" rx="10" fill="none" stroke="#00ff88" stroke-width="2" filter="url(#a10)"/> <text x="90" y="35" text-anchor="middle" fill="#00ff88" font-size="8" letter-spacing="3" filter="url(#a10)">ZEYTİNLİK</text> <text x="90" y="65" text-anchor="middle" fill="#00ff88" font-size="22" font-weight="700" filter="url(#a10)">25 Dönüm</text> </svg>`
            },
            {
                name: "A11  İnşaat İzinli",
                svg: `<svg width="200" height="120" viewBox="0 0 200 120"> <rect x="10" y="10" width="180" height="95" rx="12" fill="#1a3c34" stroke="#00ff88" stroke-width="1"/> <text x="35" y="55" fill="white" font-size="28">🏗️</text> <text x="130" y="38" text-anchor="middle" fill="#00ff88" font-size="8" letter-spacing="3">İNŞAAT</text> <text x="130" y="58" text-anchor="middle" fill="white" font-size="8">İZNİ</text> <text x="130" y="80" text-anchor="middle" fill="#00ff88" font-size="18" font-weight="700">VAR ✓</text> <text x="130" y="98" text-anchor="middle" fill="#8b9dc3" font-size="8">1.200 m² Arsa</text> </svg>`
            },
            {
                name: "A12  Orman Arsa",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <rect x="5" y="10" width="190" height="75" rx="10" fill="#264653"/> <circle cx="35" cy="47" r="18" fill="#2a9d8f"/> <text x="35" y="53" text-anchor="middle" fill="white" font-size="18">🌲</text> <text x="125" y="38" text-anchor="middle" fill="#2a9d8f" font-size="8" letter-spacing="2">ORMAN KENARI</text> <text x="125" y="62" text-anchor="middle" fill="white" font-size="20" font-weight="700">8.500 m²</text> <text x="125" y="78" text-anchor="middle" fill="#8b9dc3" font-size="8">Doğa İçinde</text> </svg>`
            },
            {
                name: "A13  Köşe Parsel",
                svg: `<svg width="160" height="160" viewBox="0 0 160 160"> <circle cx="80" cy="80" r="70" fill="#264653"/> <circle cx="80" cy="80" r="60" fill="none" stroke="#2a9d8f" stroke-width="1" stroke-dasharray="4 3"/> <text x="80" y="60" text-anchor="middle" fill="#2a9d8f" font-size="8" letter-spacing="3">KÖŞE</text> <text x="80" y="65" text-anchor="middle" fill="#2a9d8f" font-size="8" letter-spacing="3">PARSEL</text> <text x="80" y="90" text-anchor="middle" fill="white" font-size="24" font-weight="700">600</text> <text x="80" y="110" text-anchor="middle" fill="#2a9d8f" font-size="12">m²</text> </svg>`
            },
            {
                name: "A14  Bağlık Arazi",
                svg: `<svg width="220" height="100" viewBox="0 0 220 100"> <polygon points="0,50 15,10 205,10 220,50 205,90 15,90" fill="#0a0e27" stroke="#e9c46a" stroke-width="2"/> <text x="110" y="38" text-anchor="middle" fill="#e9c46a" font-size="9" letter-spacing="3">BAĞLIK</text> <text x="110" y="65" text-anchor="middle" fill="white" font-size="22" font-weight="700">🍇 12 Dönüm</text> </svg>`
            },
            {
                name: "A15  Kadastro",
                svg: `<svg width="200" height="110" viewBox="0 0 200 110"> <rect x="10" y="10" width="180" height="85" rx="8" fill="#1a1a2e" stroke="#00d4ff" stroke-width="1"/> <text x="100" y="28" text-anchor="middle" fill="#00d4ff" font-size="7" letter-spacing="4">ADA / PARSEL</text> <line x1="30" y1="38" x2="170" y2="38" stroke="#00d4ff" stroke-width="0.5"/> <text x="65" y="55" text-anchor="middle" fill="#8b9dc3" font-size="8">Ada No:</text> <text x="65" y="72" text-anchor="middle" fill="white" font-size="16" font-weight="700">1245</text> <line x1="100" y1="45" x2="100" y2="85" stroke="#00d4ff" stroke-width="0.5"/> <text x="140" y="55" text-anchor="middle" fill="#8b9dc3" font-size="8">Parsel No:</text> <text x="140" y="72" text-anchor="middle" fill="white" font-size="16" font-weight="700">18</text> <text x="100" y="90" text-anchor="middle" fill="#00d4ff" font-size="8">Kadastro Bilgisi</text> </svg>`
            },
            {
                name: "A16  Acil Satılık",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <rect x="5" y="10" width="190" height="75" rx="10" fill="#e63946"/> <text x="100" y="32" text-anchor="middle" fill="white" font-size="8" letter-spacing="3" opacity="0.8">ACİL SATILIK</text> <text x="100" y="55" text-anchor="middle" fill="white" font-size="18" font-weight="700">ARSA</text> <text x="100" y="75" text-anchor="middle" fill="white" font-size="11">2.000 m² · ₺ 5.5M</text> </svg>`
            },
            {
                name: "A17  Sahil Arazisi",
                svg: `<svg width="200" height="120" viewBox="0 0 200 120"> <rect x="10" y="10" width="180" height="95" rx="10" fill="#264653"/> <rect x="10" y="10" width="180" height="30" fill="#2a9d8f" rx="10"/> <rect x="10" y="28" width="180" height="12" fill="#2a9d8f"/> <text x="100" y="30" text-anchor="middle" fill="white" font-size="9" letter-spacing="3">🌊 SAHİL ARAZİSİ</text> <text x="100" y="65" text-anchor="middle" fill="white" font-size="24" font-weight="700">10.000 m²</text> <text x="100" y="85" text-anchor="middle" fill="#2a9d8f" font-size="9">Denize Sıfır</text> <text x="100" y="100" text-anchor="middle" fill="#FFD700" font-size="11" font-weight="700">₺ 45.000.000</text> </svg>`
            },
            {
                name: "A18  Üçlü Bilgi",
                svg: `<svg width="220" height="100" viewBox="0 0 220 100"> <rect x="5" y="10" width="60" height="75" rx="8" fill="#2d6a4f"/> <rect x="70" y="10" width="60" height="75" rx="8" fill="#264653"/> <rect x="135" y="10" width="80" height="75" rx="8" fill="#1a1a2e" stroke="#FFD700" stroke-width="1"/> <text x="35" y="35" text-anchor="middle" fill="#b7e4c7" font-size="7">CİNS</text> <text x="35" y="62" text-anchor="middle" fill="white" font-size="12" font-weight="700">ARSA</text> <text x="100" y="35" text-anchor="middle" fill="#00d4ff" font-size="7">İMAR</text> <text x="100" y="62" text-anchor="middle" fill="white" font-size="12" font-weight="700">KONUT</text> <text x="175" y="35" text-anchor="middle" fill="#FFD700" font-size="7">GABARİ</text> <text x="175" y="62" text-anchor="middle" fill="white" font-size="12" font-weight="700">5 KAT</text> </svg>`
            },
            {
                name: "A19  Pin Arazi",
                svg: `<svg width="180" height="180" viewBox="0 0 180 180"> <defs><linearGradient id="a19g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2d6a4f"/><stop offset="100%" stop-color="#1a472a"/></linearGradient></defs> <path d="M90 15 C50 15,20 45,20 85 C20 135,90 175,90 175 C90 175,160 135,160 85 C160 45,130 15,90 15 Z" fill="url(#a19g)" stroke="#b7e4c7" stroke-width="2"/> <text x="90" y="70" text-anchor="middle" fill="#b7e4c7" font-size="8" letter-spacing="3">ARAZİ</text> <text x="90" y="95" text-anchor="middle" fill="white" font-size="18" font-weight="700">4.800</text> <text x="90" y="115" text-anchor="middle" fill="#b7e4c7" font-size="12">m²</text> </svg>`
            },
            {
                name: "A20  Premium Yatırım",
                svg: `<svg width="220" height="120" viewBox="0 0 220 120"> <defs><linearGradient id="a20g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c9a227"/><stop offset="100%" stop-color="#8b6914"/></linearGradient></defs> <rect x="10" y="10" width="200" height="95" rx="12" fill="#0a0e27" stroke="url(#a20g)" stroke-width="2"/> <text x="110" y="30" text-anchor="middle" fill="url(#a20g)" font-size="8" letter-spacing="4">★ YATIRIM FIRSATI ★</text> <line x1="30" y1="40" x2="190" y2="40" stroke="url(#a20g)" stroke-width="0.5"/> <text x="110" y="62" text-anchor="middle" fill="white" font-size="10">İstanbul · Çekmeköy</text> <text x="110" y="82" text-anchor="middle" fill="white" font-size="20" font-weight="700">6.500 m² Arsa</text> <text x="110" y="98" text-anchor="middle" fill="url(#a20g)" font-size="12" font-weight="700">₺ 22.000.000</text> </svg>`
            },
        ]
    },
    "ozellik": {
        title: "⭐ Özellik Rozetleri",
        items: [
            {
                name: "Yeni Bina Yıldız",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><polygon points="100,15 122,75 185,75 133,112 152,175 100,138 48,175 67,112 15,75 78,75" fill="#e63946"/><text x="100" y="95" text-anchor="middle" fill="white" font-size="9" letter-spacing="2">YENİ</text><text x="100" y="120" text-anchor="middle" fill="white" font-size="11" font-weight="700">BİNA</text></svg>`
            },
            {
                name: "Krediye Uygun",
                svg: `<svg width="220" height="120" viewBox="0 0 220 120"><rect x="10" y="20" width="200" height="80" rx="40" fill="#2a9d8f"/><circle cx="45" cy="60" r="20" fill="white"/><path d="M35 60 L42 68 L58 52" fill="none" stroke="#2a9d8f" stroke-width="4" stroke-linecap="round"/><text x="130" y="55" text-anchor="middle" fill="white" font-size="9" letter-spacing="3">KREDİYE</text><text x="130" y="80" text-anchor="middle" fill="white" font-size="16" font-weight="700">UYGUN</text></svg>`
            },
            {
                name: "Eşyalı Daire",
                svg: `<svg width="220" height="140" viewBox="0 0 220 140"><rect x="10" y="10" width="200" height="120" rx="10" fill="white"/><rect x="10" y="10" width="60" height="120" fill="#8e2de2"/><rect x="20" y="60" width="40" height="30" rx="3" fill="white"/><rect x="20" y="45" width="15" height="20" fill="white"/><rect x="45" y="45" width="15" height="20" fill="white"/><text x="140" y="55" text-anchor="middle" fill="#666" font-size="10" letter-spacing="3">FULL</text><text x="140" y="90" text-anchor="middle" fill="#1a1a2e" font-size="20" font-weight="700">EŞYALI</text></svg>`
            },
            {
                name: "Site İçinde",
                svg: `<svg width="180" height="200" viewBox="0 0 180 200"><path d="M90 15 L160 40 L160 100 C160 140,130 175,90 190 C50 175,20 140,20 100 L20 40 Z" fill="#003566" stroke="#ffc300" stroke-width="3"/><text x="90" y="80" text-anchor="middle" fill="#ffc300" font-size="10" letter-spacing="3">SİTE</text><text x="90" y="115" text-anchor="middle" fill="white" font-size="14" font-weight="700">İÇİNDE</text><text x="90" y="140" text-anchor="middle" fill="#ffc300" font-size="9">7/24 GÜVENLİK</text></svg>`
            },
            {
                name: "Kapalı Otopark",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="12" fill="#1a1a2e" stroke="#00d4ff" stroke-width="2"/><g transform="translate(35,55)" fill="#00d4ff"><rect x="0" y="10" width="50" height="15" rx="3"/><path d="M5 10 L12 0 L38 0 L45 10 Z"/><circle cx="12" cy="28" r="6" fill="#0a0e27" stroke="#00d4ff" stroke-width="2"/><circle cx="38" cy="28" r="6" fill="#0a0e27" stroke="#00d4ff" stroke-width="2"/></g><text x="150" y="55" text-anchor="middle" fill="#00d4ff" font-size="10" letter-spacing="3">KAPALI</text><text x="150" y="90" text-anchor="middle" fill="white" font-size="18" font-weight="700">OTOPARK</text></svg>`
            },
            {
                name: "Asansörlü",
                svg: `<svg width="180" height="200" viewBox="0 0 180 200"><rect x="40" y="20" width="100" height="160" rx="6" fill="#264653" stroke="#e9c46a" stroke-width="2"/><line x1="90" y1="20" x2="90" y2="180" stroke="#e9c46a" stroke-width="1"/><rect x="50" y="80" width="35" height="60" rx="2" fill="#e9c46a"/><rect x="95" y="80" width="35" height="60" rx="2" fill="#e9c46a" opacity="0.3"/><text x="90" y="195" text-anchor="middle" fill="#e9c46a" font-size="10" letter-spacing="3">ASANSÖRLÜ</text></svg>`
            },
            {
                name: "Sıfır Daire",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="#ffc300"/><circle cx="100" cy="100" r="80" fill="none" stroke="#1a1a2e" stroke-width="3" stroke-dasharray="6 3"/><text x="100" y="75" text-anchor="middle" fill="#1a1a2e" font-size="10" letter-spacing="4">DAİRE</text><text x="100" y="120" text-anchor="middle" fill="#1a1a2e" font-size="42" font-weight="700">0</text><text x="100" y="145" text-anchor="middle" fill="#1a1a2e" font-size="10" letter-spacing="4">KM · SIFIR</text></svg>`
            },
            {
                name: "Havuzlu Site",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="12" fill="#0077b6"/><path d="M10 80 Q60 70 120 80 T230 80 L230 130 L10 130 Z" fill="#00b4d8"/><path d="M10 100 Q60 90 120 100 T230 100 L230 130 L10 130 Z" fill="#90e0ef"/><text x="120" y="45" text-anchor="middle" fill="white" font-size="10" letter-spacing="4">SİTE İÇİNDE</text><text x="120" y="75" text-anchor="middle" fill="white" font-size="22" font-weight="700">HAVUZLU</text></svg>`
            },
            {
                name: "Fitness 7/24",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="12" fill="#1a1a2e"/><rect x="10" y="10" width="220" height="30" fill="#ff006e"/><text x="120" y="30" text-anchor="middle" fill="white" font-size="10" letter-spacing="4">FITNESS SALONU</text><g transform="translate(50,65)" fill="#ff006e"><rect x="0" y="10" width="10" height="20"/><rect x="60" y="10" width="10" height="20"/><rect x="10" y="15" width="50" height="10"/></g><text x="170" y="80" text-anchor="middle" fill="white" font-size="16" font-weight="700">7/24</text><text x="170" y="100" text-anchor="middle" fill="#ff006e" font-size="9">AÇIK</text></svg>`
            },
            {
                name: "Deniz Manzara",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="12" fill="#023e8a"/><circle cx="200" cy="45" r="12" fill="#ffc300"/><path d="M10 90 Q60 80 120 90 T230 90 L230 130 L10 130 Z" fill="#0077b6"/><path d="M10 110 Q60 100 120 110 T230 110 L230 130 L10 130 Z" fill="#00b4d8"/><text x="120" y="45" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">FULL DENİZ</text><text x="120" y="75" text-anchor="middle" fill="white" font-size="20" font-weight="700">MANZARALI</text></svg>`
            },
            {
                name: "Eşyasız Boş",
                svg: `<svg width="220" height="120" viewBox="0 0 220 120"><rect x="10" y="20" width="200" height="80" rx="10" fill="white" stroke="#666" stroke-width="2" stroke-dasharray="6 3"/><text x="110" y="55" text-anchor="middle" fill="#666" font-size="10" letter-spacing="3">TESLİME HAZIR</text><text x="110" y="85" text-anchor="middle" fill="#1a1a2e" font-size="18" font-weight="700">EŞYASIZ</text></svg>`
            },
            {
                name: "Güvenlik Kalkan",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><path d="M100 20 L170 45 L170 105 C170 145,140 175,100 185 C60 175,30 145,30 105 L30 45 Z" fill="#264653" stroke="#e9c46a" stroke-width="3"/><text x="100" y="115" text-anchor="middle" fill="white" font-size="20" font-weight="700">7/24</text><text x="100" y="140" text-anchor="middle" fill="#e9c46a" font-size="10" letter-spacing="3">GÜVENLİK</text></svg>`
            },
            {
                name: "Bahçeli Müstakil",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="12" fill="#264653"/><rect x="10" y="90" width="220" height="40" fill="#2a9d8f"/><rect x="40" y="75" width="15" height="15" fill="#e9c46a"/><polygon points="35,75 60,60 60,75" fill="#e63946"/><text x="130" y="45" text-anchor="middle" fill="#e9c46a" font-size="10" letter-spacing="3">MÜSTAKİL BAHÇELİ</text><text x="130" y="75" text-anchor="middle" fill="white" font-size="18" font-weight="700">250 m² BAHÇE</text></svg>`
            },
            {
                name: "Enerji A+",
                svg: `<svg width="200" height="180" viewBox="0 0 200 180"><rect x="10" y="10" width="180" height="160" rx="8" fill="white"/><rect x="10" y="10" width="180" height="30" fill="#1a1a2e"/><text x="100" y="30" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">ENERJİ KİMLİĞİ</text><rect x="25" y="55" width="150" height="18" fill="#00ff00"/><text x="35" y="68" fill="white" font-size="10" font-weight="700">A+</text><rect x="25" y="75" width="130" height="14" fill="#66cc00"/><rect x="25" y="91" width="110" height="14" fill="#ccff00"/><rect x="25" y="107" width="90" height="14" fill="#ffcc00"/><rect x="25" y="123" width="70" height="14" fill="#ff6600"/><rect x="25" y="139" width="50" height="14" fill="#ff0000"/><text x="100" y="163" text-anchor="middle" fill="#1a1a2e" font-size="10" font-weight="700">TASARRUFLU</text></svg>`
            },
            {
                name: "Doğalgaz Kombi",
                svg: `<svg width="220" height="140" viewBox="0 0 220 140"><rect x="10" y="10" width="200" height="120" rx="10" fill="#e63946"/><circle cx="60" cy="70" r="30" fill="white"/><path d="M60 55 Q52 65 55 75 Q60 85 65 75 Q68 65 60 55" fill="#e63946"/><text x="145" y="55" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">MERKEZİ</text><text x="145" y="80" text-anchor="middle" fill="white" font-size="14" font-weight="700">DOĞALGAZ</text><text x="145" y="100" text-anchor="middle" fill="white" font-size="9" opacity="0.9">KOMBİLİ</text></svg>`
            },
            {
                name: "Klimalı Daire",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="12" fill="white"/><rect x="30" y="35" width="80" height="35" rx="4" fill="#00d4ff"/><line x1="35" y1="55" x2="105" y2="55" stroke="white" stroke-width="1"/><line x1="35" y1="60" x2="105" y2="60" stroke="white" stroke-width="1"/><path d="M50 75 Q55 85 60 90 M70 75 Q75 85 80 90 M90 75 Q95 85 100 90" stroke="#00d4ff" stroke-width="2" fill="none"/><text x="170" y="55" text-anchor="middle" fill="#666" font-size="10" letter-spacing="3">TÜM ODALAR</text><text x="170" y="90" text-anchor="middle" fill="#1a1a2e" font-size="18" font-weight="700">KLİMALI</text></svg>`
            },
            {
                name: "Ankastre Mutfak",
                svg: `<svg width="220" height="160" viewBox="0 0 220 160"><rect x="10" y="10" width="200" height="140" rx="10" fill="#1a1a2e"/><rect x="10" y="10" width="200" height="35" fill="#c9a227"/><text x="110" y="32" text-anchor="middle" fill="#1a1a2e" font-size="10" letter-spacing="3">ANKASTRE</text><rect x="30" y="65" width="30" height="30" rx="3" fill="#c9a227"/><rect x="70" y="65" width="30" height="30" rx="3" fill="#c9a227"/><rect x="110" y="65" width="30" height="30" rx="3" fill="#c9a227"/><rect x="150" y="65" width="30" height="30" rx="3" fill="#c9a227"/><text x="110" y="125" text-anchor="middle" fill="white" font-size="14" font-weight="700">FULL MUTFAK</text></svg>`
            },
            {
                name: "Geniş Teras",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="12" fill="#2a9d8f"/><rect x="30" y="60" width="180" height="10" fill="#e9c46a"/><rect x="30" y="70" width="10" height="40" fill="#e9c46a"/><rect x="200" y="70" width="10" height="40" fill="#e9c46a"/><line x1="60" y1="70" x2="60" y2="110" stroke="#e9c46a" stroke-width="1"/><line x1="90" y1="70" x2="90" y2="110" stroke="#e9c46a" stroke-width="1"/><line x1="120" y1="70" x2="120" y2="110" stroke="#e9c46a" stroke-width="1"/><line x1="150" y1="70" x2="150" y2="110" stroke="#e9c46a" stroke-width="1"/><line x1="180" y1="70" x2="180" y2="110" stroke="#e9c46a" stroke-width="1"/><text x="120" y="40" text-anchor="middle" fill="white" font-size="12" font-weight="700">GENİŞ TERAS · 40m²</text></svg>`
            },
            {
                name: "Yeni Yapı 2024",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="oz19" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e63946"/><stop offset="100%" stop-color="#8e2de2"/></linearGradient></defs><polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="url(#oz19)"/><polygon points="100,25 175,63 175,137 100,175 25,137 25,63" fill="none" stroke="white" stroke-width="1" stroke-dasharray="3 3"/><text x="100" y="90" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">YENİ</text><text x="100" y="120" text-anchor="middle" fill="white" font-size="20" font-weight="700">2024</text><text x="100" y="140" text-anchor="middle" fill="white" font-size="9" letter-spacing="2">YAPILDI</text></svg>`
            },
            {
                name: "Full Yenilenmiş",
                svg: `<svg width="260" height="140" viewBox="0 0 260 140"><defs><linearGradient id="oz20" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ff006e"/><stop offset="50%" stop-color="#8338ec"/><stop offset="100%" stop-color="#3a86ff"/></linearGradient></defs><rect x="10" y="30" width="240" height="80" rx="40" fill="url(#oz20)"/><circle cx="55" cy="70" r="22" fill="white"/><text x="160" y="60" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">FULL YENİLENDİ</text><text x="160" y="88" text-anchor="middle" fill="white" font-size="16" font-weight="700">SIFIR GİBİ</text></svg>`
            },
            {
                name: "R1  Havuzlu",
                svg: `<svg width="140" height="60" viewBox="0 0 140 60"> <rect x="2" y="5" width="136" height="45" rx="22" fill="#2a9d8f"/> <text x="70" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">🏊 HAVUZLU</text> </svg>`
            },
            {
                name: "R2  Otoparklı",
                svg: `<svg width="140" height="60" viewBox="0 0 140 60"> <rect x="2" y="5" width="136" height="45" rx="22" fill="#0077b6"/> <text x="70" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">🅿️ OTOPARKLI</text> </svg>`
            },
            {
                name: "R3  Deniz Manzarası",
                svg: `<svg width="140" height="60" viewBox="0 0 140 60"> <rect x="2" y="5" width="136" height="45" rx="22" fill="#e63946"/> <text x="70" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">🌊 DENİZ MANZ.</text> </svg>`
            },
            {
                name: "R4  Bahçeli",
                svg: `<svg width="140" height="60" viewBox="0 0 140 60"> <rect x="2" y="5" width="136" height="45" rx="22" fill="#264653"/> <text x="70" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">🌳 BAHÇE</text> </svg>`
            },
            {
                name: "R5  Güvenlikli",
                svg: `<svg width="140" height="60" viewBox="0 0 140 60"> <rect x="2" y="5" width="136" height="45" rx="22" fill="#8e2de2"/> <text x="70" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">🔒 GÜVENLİK</text> </svg>`
            },
            {
                name: "R6  Güneşe Bakıyor",
                svg: `<svg width="140" height="60" viewBox="0 0 140 60"> <rect x="2" y="5" width="136" height="45" rx="22" fill="#e9c46a"/> <text x="70" y="34" text-anchor="middle" fill="#1a1a2e" font-size="11" font-weight="700">☀️ GÜNEŞE BAK.</text> </svg>`
            },
            {
                name: "R7  Asansörlü",
                svg: `<svg width="140" height="60" viewBox="0 0 140 60"> <rect x="2" y="5" width="136" height="45" rx="22" fill="none" stroke="#00ff88" stroke-width="2"/> <text x="70" y="34" text-anchor="middle" fill="#00ff88" font-size="11" font-weight="700">🛗 ASANSÖR</text> </svg>`
            },
            {
                name: "R8  Şömineli",
                svg: `<svg width="140" height="60" viewBox="0 0 140 60"> <rect x="2" y="5" width="136" height="45" rx="22" fill="#c9a227"/> <text x="70" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">🔥 ŞÖMINE</text> </svg>`
            },
            {
                name: "R9  Klimalı",
                svg: `<svg width="140" height="60" viewBox="0 0 140 60"> <rect x="2" y="5" width="136" height="45" rx="22" fill="#457b9d"/> <text x="70" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">❄️ KLİMA</text> </svg>`
            },
            {
                name: "R10  Fitness",
                svg: `<svg width="160" height="60" viewBox="0 0 160 60"> <rect x="2" y="5" width="156" height="45" rx="22" fill="#2d6a4f"/> <text x="80" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">🏋️ FİTNESS</text> </svg>`
            },
            {
                name: "R11  Saunalı",
                svg: `<svg width="140" height="60" viewBox="0 0 140 60"> <rect x="2" y="5" width="136" height="45" rx="22" fill="#d62828"/> <text x="70" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">🧖 SAUNA</text> </svg>`
            },
            {
                name: "R12  Akıllı Ev",
                svg: `<svg width="160" height="60" viewBox="0 0 160 60"> <rect x="2" y="5" width="156" height="45" rx="22" fill="#0a0e27" stroke="#00d4ff" stroke-width="2"/> <text x="80" y="34" text-anchor="middle" fill="#00d4ff" font-size="11" font-weight="700">📡 AKILLI EV</text> </svg>`
            },
            {
                name: "R13  Güneş Enerjisi",
                svg: `<svg width="160" height="60" viewBox="0 0 160 60"> <rect x="2" y="5" width="156" height="45" rx="22" fill="#6a994e"/> <text x="80" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">☀️ GÜNEŞ ENERJİ</text> </svg>`
            },
            {
                name: "R14  Teraslı",
                svg: `<svg width="140" height="60" viewBox="0 0 140 60"> <rect x="2" y="5" width="136" height="45" rx="22" fill="#023e8a"/> <text x="70" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">🏗️ TERAS</text> </svg>`
            },
            {
                name: "R15  Sinema Odası",
                svg: `<svg width="160" height="60" viewBox="0 0 160 60"> <rect x="2" y="5" width="156" height="45" rx="22" fill="#9b2226"/> <text x="80" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">🎬 SİNEMA ODASI</text> </svg>`
            },
            {
                name: "R16  Çocuk Parkı",
                svg: `<svg width="170" height="60" viewBox="0 0 170 60"> <rect x="2" y="5" width="166" height="45" rx="22" fill="#264653"/> <text x="85" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">👶 ÇOCUK PARKI</text> </svg>`
            },
            {
                name: "R17  Giyinme Odası",
                svg: `<svg width="160" height="60" viewBox="0 0 160 60"> <rect x="2" y="5" width="156" height="45" rx="22" fill="#bb3e03"/> <text x="80" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">🧺 GİYİNME OD.</text> </svg>`
            },
            {
                name: "R18  Müstakil",
                svg: `<svg width="160" height="60" viewBox="0 0 160 60"> <rect x="2" y="5" width="156" height="45" rx="22" fill="none" stroke="#FFD700" stroke-width="2"/> <text x="80" y="34" text-anchor="middle" fill="#FFD700" font-size="11" font-weight="700">🏰 MÜSTAKIL</text> </svg>`
            },
            {
                name: "R19  Krediye Uygun",
                svg: `<svg width="170" height="60" viewBox="0 0 170 60"> <rect x="2" y="5" width="166" height="45" rx="22" fill="#495057"/> <text x="85" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">🔑 KREDİYE UYGUN</text> </svg>`
            },
            {
                name: "R20  Sıfır Bina",
                svg: `<svg width="140" height="60" viewBox="0 0 140 60"> <rect x="2" y="5" width="136" height="45" rx="22" fill="#e63946"/> <text x="70" y="34" text-anchor="middle" fill="white" font-size="11" font-weight="700">🆕 SIFIR BİNA</text> </svg>`
            },
        ]
    },
    "luks": {
        title: "🏊 Lüks Özellikler",
        items: [
            {
                name: "Sonsuzluk Havuzu",
                svg: `<svg width="260" height="180" viewBox="0 0 260 180"><defs><linearGradient id="l1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#00b4d8"/><stop offset="100%" stop-color="#023e8a"/></linearGradient></defs><rect x="10" y="10" width="240" height="160" rx="14" fill="url(#l1)"/><ellipse cx="130" cy="130" rx="90" ry="18" fill="#caf0f8" opacity="0.6"/><ellipse cx="130" cy="130" rx="70" ry="12" fill="white" opacity="0.5"/><text x="130" y="55" text-anchor="middle" fill="#FFD700" font-size="10" letter-spacing="4">INFINITY POOL</text><text x="130" y="90" text-anchor="middle" fill="white" font-size="22" font-weight="700">SONSUZLUK</text><text x="130" y="110" text-anchor="middle" fill="white" font-size="14" font-weight="700">HAVUZU</text></svg>`
            },
            {
                name: "Türk Hamamı",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><defs><linearGradient id="l2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c9a227"/><stop offset="100%" stop-color="#8b6914"/></linearGradient></defs><path d="M40 180 L40 100 C40 60,80 30,110 30 C140 30,180 60,180 100 L180 180 Z" fill="url(#l2)"/><circle cx="110" cy="70" r="8" fill="#0a0e27"/><text x="110" y="195" text-anchor="middle" fill="url(#l2)" font-size="11" letter-spacing="3">TÜRK HAMAMI</text></svg>`
            },
            {
                name: "Şömineli Salon",
                svg: `<svg width="240" height="180" viewBox="0 0 240 180"><rect x="10" y="10" width="220" height="160" rx="12" fill="#1a1a2e"/><rect x="80" y="60" width="80" height="90" rx="4" fill="#8b6914"/><rect x="90" y="80" width="60" height="60" fill="#0a0e27"/><path d="M105 130 Q110 100 115 130 Q120 105 125 130 Q130 100 135 130 Q140 110 145 130 Z" fill="#ff6b00"/><text x="120" y="45" text-anchor="middle" fill="#ff6b00" font-size="10" letter-spacing="4">ŞÖMİNELİ</text><text x="120" y="170" text-anchor="middle" fill="#ffc300" font-size="12" font-weight="700">LÜKS SALON</text></svg>`
            },
            {
                name: "Panoramik Manzara",
                svg: `<svg width="280" height="140" viewBox="0 0 280 140"><rect x="10" y="10" width="260" height="120" rx="12" fill="#023e8a"/><path d="M10 80 L60 50 L110 65 L160 40 L210 55 L270 45 L270 130 L10 130 Z" fill="#264653"/><path d="M10 100 L60 75 L110 85 L160 65 L210 80 L270 70 L270 130 L10 130 Z" fill="#2a9d8f"/><circle cx="220" cy="35" r="14" fill="#ffc300"/><text x="140" y="35" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">360° PANORAMİK</text><text x="140" y="120" text-anchor="middle" fill="white" font-size="12" font-weight="700">ŞEHİR MANZARASI</text></svg>`
            },
            {
                name: "Akıllı Ev",
                svg: `<svg width="240" height="180" viewBox="0 0 240 180"><rect x="10" y="10" width="220" height="160" rx="12" fill="#1a1a2e" stroke="#00d4ff" stroke-width="2"/><circle cx="120" cy="80" r="35" fill="none" stroke="#00d4ff" stroke-width="2"/><circle cx="120" cy="80" r="20" fill="none" stroke="#00d4ff" stroke-width="1"/><circle cx="120" cy="80" r="6" fill="#00d4ff"/><text x="120" y="155" text-anchor="middle" fill="#00d4ff" font-size="11" letter-spacing="3">SMART HOME</text></svg>`
            },
            {
                name: "Concierge",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><defs><linearGradient id="l6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient></defs><circle cx="110" cy="100" r="90" fill="#0a0e27" stroke="url(#l6)" stroke-width="3"/><text x="110" y="70" text-anchor="middle" fill="url(#l6)" font-size="10" letter-spacing="4">7/24</text><text x="110" y="105" text-anchor="middle" fill="white" font-size="20" font-weight="700">CONCIERGE</text><text x="110" y="140" text-anchor="middle" fill="url(#l6)" font-size="10" letter-spacing="3">SERVICE</text></svg>`
            },
            {
                name: "Spa Wellness",
                svg: `<svg width="240" height="160" viewBox="0 0 240 160"><rect x="10" y="10" width="220" height="140" rx="12" fill="#264653"/><path d="M120 40 Q100 55 100 75 Q100 95 120 100 Q140 95 140 75 Q140 55 120 40" fill="#2a9d8f"/><circle cx="120" cy="55" r="6" fill="#e9c46a"/><text x="120" y="130" text-anchor="middle" fill="#e9c46a" font-size="10" letter-spacing="4">SPA · WELLNESS</text><text x="120" y="150" text-anchor="middle" fill="white" font-size="10" opacity="0.7">SAUNA · JAKUZİ · MASAJ</text></svg>`
            },
            {
                name: "Boğaz Manzaralı",
                svg: `<svg width="280" height="160" viewBox="0 0 280 160"><defs><linearGradient id="l8" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#023e8a"/><stop offset="100%" stop-color="#0077b6"/></linearGradient></defs><rect x="10" y="10" width="260" height="140" rx="12" fill="url(#l8)"/><path d="M10 80 L50 60 L80 75 L110 55 L145 70 L175 50 L210 65 L270 55 L270 100 L10 100" fill="#264653"/><path d="M10 100 Q40 95 80 100 T160 100 T270 100 L270 150 L10 150 Z" fill="#00b4d8" opacity="0.7"/><text x="140" y="40" text-anchor="middle" fill="#FFD700" font-size="11" letter-spacing="3">BOĞAZ MANZARALI</text><text x="140" y="135" text-anchor="middle" fill="white" font-size="14" font-weight="700">VİLLA</text></svg>`
            },
            {
                name: "Şarap Mahzeni",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><rect x="10" y="10" width="200" height="180" rx="8" fill="#1a0f0a"/><path d="M40 40 L40 80 C40 90,50 100,60 100 L60 130 L50 130 L50 140 L70 140 L70 130 L60 130 L60 100 C70 100,80 90,80 80 L80 40 Z" fill="#8b0000"/><path d="M100 40 L100 80 C100 90,110 100,120 100 L120 130 L110 130 L110 140 L130 140 L130 130 L120 130 L120 100 C130 100,140 90,140 80 L140 40 Z" fill="#8b0000"/><path d="M160 40 L160 80 C160 90,170 100,180 100 L180 130 L170 130 L170 140 L190 140 L190 130 L180 130 L180 100 C190 100,200 90,200 80 L200 40 Z" fill="#8b0000"/><text x="110" y="170" text-anchor="middle" fill="#c9a227" font-size="10" letter-spacing="4">ŞARAP MAHZENİ</text></svg>`
            },
            {
                name: "Ev Sineması",
                svg: `<svg width="240" height="160" viewBox="0 0 240 160"><rect x="10" y="10" width="220" height="140" rx="12" fill="#0a0e27"/><rect x="40" y="35" width="160" height="70" fill="#8338ec"/><path d="M40 105 L200 105 L215 130 L25 130 Z" fill="#5a189a"/><text x="120" y="70" text-anchor="middle" fill="white" font-size="9" letter-spacing="3">CINEMA</text><text x="120" y="90" text-anchor="middle" fill="white" font-size="14" font-weight="700">HOME</text><text x="120" y="150" text-anchor="middle" fill="#8338ec" font-size="10" letter-spacing="3">ÖZEL SİNEMA ODASI</text></svg>`
            },
            {
                name: "Özel Asansör",
                svg: `<svg width="180" height="220" viewBox="0 0 180 220"><rect x="30" y="20" width="120" height="180" rx="6" fill="#0a0e27" stroke="#FFD700" stroke-width="2"/><line x1="90" y1="20" x2="90" y2="200" stroke="#FFD700" stroke-width="1"/><rect x="40" y="60" width="45" height="120" fill="#FFD700" fill-opacity="0.9"/><rect x="95" y="60" width="45" height="120" fill="#FFD700" fill-opacity="0.4"/><rect x="20" y="30" width="140" height="15" fill="#FFD700"/><text x="90" y="42" text-anchor="middle" fill="#0a0e27" font-size="9" letter-spacing="2" font-weight="700">PRIVATE</text><text x="90" y="215" text-anchor="middle" fill="#FFD700" font-size="9" letter-spacing="3">ÖZEL ASANSÖR</text></svg>`
            },
            {
                name: "Helikopter Pisti",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><circle cx="110" cy="100" r="90" fill="none" stroke="#FFD700" stroke-width="4"/><circle cx="110" cy="100" r="70" fill="#0a0e27"/><text x="110" y="115" text-anchor="middle" fill="#FFD700" font-size="60" font-weight="700">H</text><text x="110" y="145" text-anchor="middle" fill="#FFD700" font-size="9" letter-spacing="4">HELIPAD</text></svg>`
            },
            {
                name: "Golf Sahası Yakın",
                svg: `<svg width="240" height="160" viewBox="0 0 240 160"><rect x="10" y="10" width="220" height="140" rx="12" fill="#2a9d8f"/><path d="M10 90 Q60 80 120 90 T230 90 L230 150 L10 150 Z" fill="#264653"/><line x1="140" y1="30" x2="140" y2="90" stroke="white" stroke-width="2"/><polygon points="140,30 165,40 140,50" fill="#e63946"/><circle cx="90" cy="115" r="6" fill="white"/><text x="120" y="55" text-anchor="middle" fill="white" font-size="10" letter-spacing="4">GOLF SAHASINA</text><text x="120" y="140" text-anchor="middle" fill="#e9c46a" font-size="16" font-weight="700">2 DAKİKA</text></svg>`
            },
            {
                name: "Özel Marina",
                svg: `<svg width="240" height="180" viewBox="0 0 240 180"><rect x="10" y="10" width="220" height="160" rx="12" fill="#023e8a"/><path d="M10 100 Q60 90 120 100 T230 100 L230 170 L10 170 Z" fill="#00b4d8"/><text x="120" y="35" text-anchor="middle" fill="#FFD700" font-size="10" letter-spacing="4">ÖZEL MARİNA</text><text x="120" y="140" text-anchor="middle" fill="white" font-size="14" font-weight="700">TEKNE BAĞLAMA</text></svg>`
            },
            {
                name: "Ödüllü Mimar",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><defs><linearGradient id="l15" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient></defs><path d="M110 20 L135 70 L190 78 L150 115 L160 170 L110 145 L60 170 L70 115 L30 78 L85 70 Z" fill="url(#l15)"/><circle cx="110" cy="95" r="30" fill="#0a0e27"/><text x="110" y="90" text-anchor="middle" fill="url(#l15)" font-size="9" letter-spacing="2">ÖDÜLLÜ</text><text x="110" y="108" text-anchor="middle" fill="white" font-size="10" font-weight="700">MİMAR</text></svg>`
            },
            {
                name: "VIP Rezidans",
                svg: `<svg width="280" height="160" viewBox="0 0 280 160"><defs><linearGradient id="l16" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#000"/><stop offset="50%" stop-color="#FFD700"/><stop offset="100%" stop-color="#000"/></linearGradient></defs><rect x="10" y="10" width="260" height="140" fill="#0a0e27"/><rect x="10" y="10" width="260" height="140" fill="none" stroke="url(#l16)" stroke-width="4"/><text x="140" y="55" text-anchor="middle" fill="#FFD700" font-size="14" letter-spacing="10">V I P</text><line x1="60" y1="70" x2="220" y2="70" stroke="#FFD700" stroke-width="1"/><text x="140" y="100" text-anchor="middle" fill="white" font-size="24" font-weight="700">RESIDENCE</text><text x="140" y="130" text-anchor="middle" fill="#FFD700" font-size="9" letter-spacing="6">EXCLUSIVE MEMBERSHIP</text></svg>`
            },
            {
                name: "5 Yıldız Otel",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="12" fill="#0a0e27" stroke="#FFD700" stroke-width="2"/><text x="120" y="90" text-anchor="middle" fill="white" font-size="14" font-weight="700">OTEL KONSEPTİ</text><text x="120" y="115" text-anchor="middle" fill="#FFD700" font-size="9" letter-spacing="3">5 YILDIZ STANDARTLAR</text></svg>`
            },
            {
                name: "Peyzaj Bahçe",
                svg: `<svg width="240" height="180" viewBox="0 0 240 180"><rect x="10" y="10" width="220" height="160" rx="12" fill="#1a1a2e"/><rect x="10" y="100" width="220" height="70" fill="#2a9d8f"/><rect x="40" y="80" width="20" height="20" fill="#8b6914"/><circle cx="50" cy="70" r="15" fill="#2a9d8f"/><text x="120" y="45" text-anchor="middle" fill="#e9c46a" font-size="10" letter-spacing="3">PEYZAJ TASARIMLI</text><text x="120" y="75" text-anchor="middle" fill="white" font-size="12" font-weight="700">LÜKS BAHÇE</text></svg>`
            },
            {
                name: "Milyar $ Manzara",
                svg: `<svg width="280" height="160" viewBox="0 0 280 160"><defs><linearGradient id="l19" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ff006e"/><stop offset="50%" stop-color="#8338ec"/><stop offset="100%" stop-color="#3a86ff"/></linearGradient></defs><rect x="10" y="10" width="260" height="140" rx="12" fill="url(#l19)"/><rect x="30" y="90" width="15" height="50" fill="#0a0e27"/><rect x="55" y="70" width="20" height="70" fill="#0a0e27"/><rect x="85" y="85" width="18" height="55" fill="#0a0e27"/><rect x="115" y="65" width="22" height="75" fill="#0a0e27"/><rect x="150" y="80" width="18" height="60" fill="#0a0e27"/><rect x="180" y="70" width="20" height="70" fill="#0a0e27"/><rect x="210" y="90" width="15" height="50" fill="#0a0e27"/><rect x="235" y="75" width="18" height="65" fill="#0a0e27"/><text x="140" y="35" text-anchor="middle" fill="white" font-size="11" letter-spacing="4">BILLION $ VIEW</text><text x="140" y="55" text-anchor="middle" fill="#FFD700" font-size="14" font-weight="700">EŞSİZ MANZARA</text></svg>`
            },
            {
                name: "Ultra Lüks Sertifika",
                svg: `<svg width="240" height="240" viewBox="0 0 240 240"><defs><linearGradient id="l20" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#8b6914"/></linearGradient></defs><circle cx="120" cy="120" r="110" fill="none" stroke="url(#l20)" stroke-width="4"/><circle cx="120" cy="120" r="95" fill="none" stroke="url(#l20)" stroke-width="1"/><circle cx="120" cy="120" r="80" fill="#0a0e27"/><text x="120" y="115" text-anchor="middle" fill="url(#l20)" font-size="10" letter-spacing="4">ULTRA</text><text x="120" y="145" text-anchor="middle" fill="white" font-size="18" font-weight="700">LÜKS</text><line x1="80" y1="155" x2="160" y2="155" stroke="url(#l20)" stroke-width="0.5"/><text x="120" y="175" text-anchor="middle" fill="url(#l20)" font-size="9" letter-spacing="3">CERTIFIED</text></svg>`
            },
            {
                name: "L1  Premium Rozet",
                svg: `<svg width="220" height="80" viewBox="0 0 220 80"> <defs><linearGradient id="l1g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#c9a227"/><stop offset="100%" stop-color="#8b6914"/></linearGradient></defs> <rect x="5" y="10" width="210" height="55" rx="27" fill="#0a0e27" stroke="url(#l1g)" stroke-width="2"/> <text x="110" y="44" text-anchor="middle" fill="url(#l1g)" font-size="13" font-weight="700" letter-spacing="3">★ PREMIUM ★</text> </svg>`
            },
            {
                name: "L2  Gold Lüks",
                svg: `<svg width="220" height="80" viewBox="0 0 220 80"> <defs><linearGradient id="l2g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#c9a227"/><stop offset="50%" stop-color="#FFD700"/><stop offset="100%" stop-color="#c9a227"/></linearGradient></defs> <rect x="5" y="10" width="210" height="55" rx="6" fill="url(#l2g)"/> <text x="110" y="44" text-anchor="middle" fill="#0a0e27" font-size="13" font-weight="700" letter-spacing="3">LÜKS VİLLA</text> </svg>`
            },
            {
                name: "L3  Exclusive",
                svg: `<svg width="160" height="160" viewBox="0 0 160 160"> <defs><linearGradient id="l3g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c9a227"/><stop offset="100%" stop-color="#8b6914"/></linearGradient></defs> <circle cx="80" cy="80" r="70" fill="#0a0e27" stroke="url(#l3g)" stroke-width="3"/> <circle cx="80" cy="80" r="60" fill="none" stroke="url(#l3g)" stroke-width="0.5"/> <text x="80" y="70" text-anchor="middle" fill="url(#l3g)" font-size="30">💎</text> <text x="80" y="100" text-anchor="middle" fill="url(#l3g)" font-size="9" letter-spacing="3">EXCLUSIVE</text> </svg>`
            },
            {
                name: "L4  Infinity Havuz",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#c9a227" stroke-width="1.5"/> <text x="30" y="44" fill="#c9a227" font-size="22">🏛️</text> <text x="120" y="35" text-anchor="middle" fill="#c9a227" font-size="8" letter-spacing="3">İNFİNİTY</text> <text x="120" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">HAVUZ</text> </svg>`
            },
            {
                name: "L5  Şarap Mahzeni",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#c9a227" stroke-width="1.5"/> <text x="30" y="44" fill="#c9a227" font-size="22">🍷</text> <text x="120" y="35" text-anchor="middle" fill="#c9a227" font-size="8" letter-spacing="3">ÖZEL</text> <text x="120" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">ŞARAP MAHZENİ</text> </svg>`
            },
            {
                name: "L6  Müzik Stüdyo",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#c9a227" stroke-width="1.5"/> <text x="30" y="44" fill="#c9a227" font-size="22">🎹</text> <text x="120" y="35" text-anchor="middle" fill="#c9a227" font-size="8" letter-spacing="3">MÜZİK</text> <text x="120" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">STÜDYO</text> </svg>`
            },
            {
                name: "L7  Helipad",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#c9a227" stroke-width="1.5"/> <text x="30" y="44" fill="#c9a227" font-size="22">🚁</text> <text x="120" y="35" text-anchor="middle" fill="#c9a227" font-size="8" letter-spacing="3">HELİKOPTER</text> <text x="120" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">PİSTİ</text> </svg>`
            },
            {
                name: "L8  Özel Garaj",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#c9a227" stroke-width="1.5"/> <text x="30" y="44" fill="#c9a227" font-size="22">🏎️</text> <text x="120" y="35" text-anchor="middle" fill="#c9a227" font-size="8" letter-spacing="3">ÖZEL</text> <text x="120" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">GARAJ</text> </svg>`
            },
            {
                name: "L9  Tenis Kortu",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#c9a227" stroke-width="1.5"/> <text x="30" y="44" fill="#c9a227" font-size="22">🎾</text> <text x="120" y="35" text-anchor="middle" fill="#c9a227" font-size="8" letter-spacing="3">TENİS</text> <text x="120" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">KORTU</text> </svg>`
            },
            {
                name: "L10  Panoramik",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#c9a227" stroke-width="1.5"/> <text x="30" y="44" fill="#c9a227" font-size="22">🌅</text> <text x="120" y="35" text-anchor="middle" fill="#c9a227" font-size="8" letter-spacing="3">PANORAMİK</text> <text x="120" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">MANZARA</text> </svg>`
            },
            {
                name: "L11  Kapalı Havuz",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#c9a227" stroke-width="1.5"/> <text x="30" y="44" fill="#c9a227" font-size="22">🏊</text> <text x="120" y="35" text-anchor="middle" fill="#c9a227" font-size="8" letter-spacing="3">KAPALI</text> <text x="120" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">HAVUZ</text> </svg>`
            },
            {
                name: "L12  Özel Spa",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#c9a227" stroke-width="1.5"/> <text x="30" y="44" fill="#c9a227" font-size="22">💆</text> <text x="120" y="35" text-anchor="middle" fill="#c9a227" font-size="8" letter-spacing="3">ÖZEL</text> <text x="120" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">SPA</text> </svg>`
            },
            {
                name: "L13  Multi Lüks",
                svg: `<svg width="220" height="110" viewBox="0 0 220 110"> <defs><linearGradient id="l13g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c9a227"/><stop offset="100%" stop-color="#8b6914"/></linearGradient></defs> <rect x="10" y="10" width="200" height="85" rx="12" fill="#0a0e27" stroke="url(#l13g)" stroke-width="2"/> <text x="110" y="30" text-anchor="middle" fill="url(#l13g)" font-size="7" letter-spacing="5">LUXURY LIVING</text> <line x1="30" y1="38" x2="190" y2="38" stroke="url(#l13g)" stroke-width="0.5"/> <text x="45" y="60" text-anchor="middle" fill="white" font-size="14">🏊</text> <text x="80" y="60" text-anchor="middle" fill="white" font-size="14">🧖</text> <text x="115" y="60" text-anchor="middle" fill="white" font-size="14">🏋️</text> <text x="150" y="60" text-anchor="middle" fill="white" font-size="14">🎾</text> <text x="185" y="60" text-anchor="middle" fill="white" font-size="14">🎬</text> <text x="110" y="85" text-anchor="middle" fill="url(#l13g)" font-size="8" letter-spacing="3">5 STAR YAŞAM</text> </svg>`
            },
            {
                name: "L14  Concierge",
                svg: `<svg width="180" height="80" viewBox="0 0 180 80"> <defs><linearGradient id="l14g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#0a0e27"/><stop offset="50%" stop-color="#1a1a2e"/><stop offset="100%" stop-color="#0a0e27"/></linearGradient></defs> <rect x="0" y="10" width="180" height="55" fill="url(#l14g)" stroke="#c9a227" stroke-width="1"/> <text x="90" y="28" text-anchor="middle" fill="#c9a227" font-size="7" letter-spacing="5">CONCIERGE</text> <text x="90" y="48" text-anchor="middle" fill="white" font-size="14" font-weight="700">7/24 HİZMET</text> </svg>`
            },
            {
                name: "L15  Özel İskele",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#c9a227" stroke-width="1.5"/> <text x="30" y="44" fill="#c9a227" font-size="22">⛵</text> <text x="120" y="35" text-anchor="middle" fill="#c9a227" font-size="8" letter-spacing="3">ÖZEL</text> <text x="120" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">İSKELE</text> </svg>`
            },
            {
                name: "L16  Kış Bahçesi",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#c9a227" stroke-width="1.5"/> <text x="30" y="44" fill="#c9a227" font-size="22">🏡</text> <text x="120" y="35" text-anchor="middle" fill="#c9a227" font-size="8" letter-spacing="3">ÖZEL</text> <text x="120" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">WINTER GARDEN</text> </svg>`
            },
            {
                name: "L17  Mermer Zemin",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#c9a227" stroke-width="1.5"/> <text x="30" y="44" fill="#c9a227" font-size="22">🪨</text> <text x="120" y="35" text-anchor="middle" fill="#c9a227" font-size="8" letter-spacing="3">MERMER</text> <text x="120" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">ZEMİN</text> </svg>`
            },
            {
                name: "L18  Kasa Odası",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#c9a227" stroke-width="1.5"/> <text x="30" y="44" fill="#c9a227" font-size="22">🔐</text> <text x="120" y="35" text-anchor="middle" fill="#c9a227" font-size="8" letter-spacing="3">ÖZEL</text> <text x="120" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">KASA ODASI</text> </svg>`
            },
            {
                name: "L19  Çatı Teras",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#c9a227" stroke-width="1.5"/> <text x="30" y="44" fill="#c9a227" font-size="22">🌿</text> <text x="120" y="35" text-anchor="middle" fill="#c9a227" font-size="8" letter-spacing="3">ÇATI</text> <text x="120" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">TERAS BAHÇE</text> </svg>`
            },
            {
                name: "L20  Saray Konsepti",
                svg: `<svg width="220" height="80" viewBox="0 0 220 80"> <defs><linearGradient id="l20g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#c9a227"/><stop offset="50%" stop-color="#FFD700"/><stop offset="100%" stop-color="#c9a227"/></linearGradient></defs> <rect x="5" y="10" width="210" height="55" rx="27" fill="url(#l20g)"/> <text x="110" y="44" text-anchor="middle" fill="#0a0e27" font-size="13" font-weight="700" letter-spacing="2">👑 SARAY KONSEPTİ</text> </svg>`
            },
        ]
    },
    "numarali": {
        title: "🔢 Numaralı İşaretleyiciler",
        items: [
            {
                name: "Klasik Kırmızı",
                svg: `<svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="#e63946" stroke="white" stroke-width="4"/><text x="60" y="75" text-anchor="middle" fill="white" font-size="42" font-weight="700">1</text></svg>`
            },
            {
                name: "Altın Elmas",
                svg: `<svg width="140" height="140" viewBox="0 0 140 140"><defs><linearGradient id="n2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient></defs><polygon points="70,15 125,70 70,125 15,70" fill="url(#n2)"/><polygon points="70,25 115,70 70,115 25,70" fill="none" stroke="white" stroke-width="1"/><text x="70" y="85" text-anchor="middle" fill="#0a0e27" font-size="36" font-weight="700">2</text></svg>`
            },
            {
                name: "Neon Halka",
                svg: `<svg width="140" height="140" viewBox="0 0 140 140"><defs><filter id="n3"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="70" cy="70" r="55" fill="#0a0e27" stroke="#00ff88" stroke-width="3" filter="url(#n3)"/><circle cx="70" cy="70" r="45" fill="none" stroke="#00ff88" stroke-width="1" filter="url(#n3)"/><text x="70" y="85" text-anchor="middle" fill="#00ff88" font-size="38" font-weight="700" filter="url(#n3)">3</text></svg>`
            },
            {
                name: "Damla Pin",
                svg: `<svg width="120" height="160" viewBox="0 0 120 160"><path d="M60 10 C30 10,15 40,15 70 C15 105,60 150,60 150 C60 150,105 105,105 70 C105 40,90 10,60 10 Z" fill="#8e2de2"/><circle cx="60" cy="60" r="25" fill="white"/><text x="60" y="70" text-anchor="middle" fill="#8e2de2" font-size="24" font-weight="700">4</text></svg>`
            },
            {
                name: "Kurumsal Kare",
                svg: `<svg width="120" height="120" viewBox="0 0 120 120"><rect x="15" y="15" width="90" height="90" rx="12" fill="#003566"/><rect x="15" y="15" width="90" height="30" fill="#ffc300"/><text x="60" y="35" text-anchor="middle" fill="#003566" font-size="10" letter-spacing="2">ADIM</text><text x="60" y="90" text-anchor="middle" fill="white" font-size="36" font-weight="700">5</text></svg>`
            },
            {
                name: "Yıldız Sarı",
                svg: `<svg width="140" height="140" viewBox="0 0 140 140"><polygon points="70,10 87,55 135,55 97,82 112,130 70,100 28,130 43,82 5,55 53,55" fill="#e9c46a"/><text x="70" y="90" text-anchor="middle" fill="#1a1a2e" font-size="30" font-weight="700">6</text></svg>`
            },
            {
                name: "Altıgen Yeşil",
                svg: `<svg width="140" height="140" viewBox="0 0 140 140"><polygon points="70,15 120,45 120,95 70,125 20,95 20,45" fill="#2a9d8f" stroke="white" stroke-width="3"/><text x="70" y="85" text-anchor="middle" fill="white" font-size="40" font-weight="700">7</text></svg>`
            },
            {
                name: "Kalkan Rozet",
                svg: `<svg width="130" height="150" viewBox="0 0 130 150"><path d="M65 10 L120 30 L120 80 C120 115,95 140,65 145 C35 140,10 115,10 80 L10 30 Z" fill="#e63946" stroke="white" stroke-width="2"/><text x="65" y="90" text-anchor="middle" fill="white" font-size="42" font-weight="700">8</text></svg>`
            },
            {
                name: "3D Kutu Mor",
                svg: `<svg width="150" height="140" viewBox="0 0 150 140"><polygon points="30,40 100,40 120,20 50,20" fill="#5a189a"/><polygon points="100,40 100,110 120,90 120,20" fill="#3c096c"/><rect x="30" y="40" width="70" height="70" fill="#8e2de2"/><text x="65" y="85" text-anchor="middle" fill="white" font-size="30" font-weight="700">9</text></svg>`
            },
            {
                name: "Balon Cyan",
                svg: `<svg width="140" height="140" viewBox="0 0 140 140"><path d="M20 20 L120 20 Q130 20 130 30 L130 90 Q130 100 120 100 L80 100 L60 125 L65 100 L20 100 Q10 100 10 90 L10 30 Q10 20 20 20 Z" fill="#00d4ff"/><text x="70" y="75" text-anchor="middle" fill="#0a0e27" font-size="32" font-weight="700">10</text></svg>`
            },
            {
                name: "Çift Halka Altın",
                svg: `<svg width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="60" fill="none" stroke="#FFD700" stroke-width="3"/><circle cx="70" cy="70" r="48" fill="#0a0e27" stroke="#FFD700" stroke-width="1"/><text x="70" y="85" text-anchor="middle" fill="#FFD700" font-size="36" font-weight="700">11</text></svg>`
            },
            {
                name: "Şerit Yatay",
                svg: `<svg width="180" height="80" viewBox="0 0 180 80"><polygon points="0,15 160,15 180,40 160,65 0,65 20,40" fill="#e63946"/><text x="90" y="52" text-anchor="middle" fill="white" font-size="26" font-weight="700">12</text></svg>`
            },
            {
                name: "Türk Bayrak",
                svg: `<svg width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="60" fill="#e30a17"/><circle cx="60" cy="70" r="30" fill="white"/><circle cx="66" cy="70" r="24" fill="#e30a17"/><text x="90" y="82" text-anchor="middle" fill="white" font-size="28" font-weight="700">13</text></svg>`
            },
            {
                name: "Cam Şeffaf",
                svg: `<svg width="130" height="130" viewBox="0 0 130 130"><circle cx="65" cy="65" r="55" fill="white" fill-opacity="0.2" stroke="white" stroke-opacity="0.5" stroke-width="2"/><circle cx="65" cy="65" r="45" fill="white" fill-opacity="0.15"/><text x="65" y="80" text-anchor="middle" fill="white" font-size="36" font-weight="700">14</text></svg>`
            },
            {
                name: "Yönlü Ok",
                svg: `<svg width="180" height="100" viewBox="0 0 180 100"><path d="M10 30 L130 30 L130 15 L170 50 L130 85 L130 70 L10 70 Z" fill="#00ff88"/><text x="60" y="60" text-anchor="middle" fill="#0a0e27" font-size="28" font-weight="700">15</text></svg>`
            },
            {
                name: "Vintage Bronz",
                svg: `<svg width="140" height="140" viewBox="0 0 140 140"><defs><linearGradient id="n16" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#cd7f32"/><stop offset="100%" stop-color="#8b4513"/></linearGradient></defs><circle cx="70" cy="70" r="60" fill="url(#n16)"/><circle cx="70" cy="70" r="42" fill="#1a0f0a"/><text x="70" y="85" text-anchor="middle" fill="url(#n16)" font-size="30" font-weight="700">16</text></svg>`
            },
            {
                name: "Splash Pembe",
                svg: `<svg width="150" height="150" viewBox="0 0 150 150"><path d="M75 10 Q100 20 115 45 Q140 60 130 90 Q140 115 110 130 Q90 145 65 130 Q35 140 25 110 Q5 90 20 65 Q15 35 45 25 Q60 5 75 10 Z" fill="#ff006e"/><text x="75" y="90" text-anchor="middle" fill="white" font-size="34" font-weight="700">17</text></svg>`
            },
            {
                name: "Mühür Damga",
                svg: `<svg width="160" height="160" viewBox="0 0 160 160"><circle cx="80" cy="80" r="70" fill="none" stroke="#8b0000" stroke-width="3"/><circle cx="80" cy="80" r="60" fill="none" stroke="#8b0000" stroke-width="1"/><text x="80" y="95" text-anchor="middle" fill="#8b0000" font-size="30" font-weight="700">18</text></svg>`
            },
            {
                name: "Ödül Kokard",
                svg: `<svg width="140" height="180" viewBox="0 0 140 180"><circle cx="70" cy="60" r="45" fill="#FFD700" stroke="#B8860B" stroke-width="3"/><text x="70" y="75" text-anchor="middle" fill="#0a0e27" font-size="30" font-weight="700">19</text><polygon points="45,100 30,170 55,150 70,170 85,150 110,170 95,100" fill="#e63946"/></svg>`
            },
            {
                name: "Modern Minimal",
                svg: `<svg width="160" height="120" viewBox="0 0 160 120"><rect x="10" y="30" width="140" height="60" rx="4" fill="white"/><rect x="10" y="30" width="8" height="60" fill="#1a1a2e"/><text x="35" y="55" fill="#666" font-size="9" letter-spacing="3">NO</text><text x="90" y="75" text-anchor="middle" fill="#1a1a2e" font-size="36" font-weight="300">20</text></svg>`
            },
            {
                name: "N1  Daire Kırmızı Set",
                svg: `<svg width="240" height="80" viewBox="0 0 240 80"> <circle cx="30" cy="40" r="25" fill="#e63946"/><text x="30" y="47" text-anchor="middle" fill="white" font-size="20" font-weight="700">1</text> <circle cx="90" cy="40" r="25" fill="#e63946"/><text x="90" y="47" text-anchor="middle" fill="white" font-size="20" font-weight="700">2</text> <circle cx="150" cy="40" r="25" fill="#e63946"/><text x="150" y="47" text-anchor="middle" fill="white" font-size="20" font-weight="700">3</text> <circle cx="210" cy="40" r="25" fill="#e63946"/><text x="210" y="47" text-anchor="middle" fill="white" font-size="20" font-weight="700">4</text> </svg>`
            },
            {
                name: "N2  Kare Mavi Set",
                svg: `<svg width="240" height="80" viewBox="0 0 240 80"> <rect x="5" y="10" width="50" height="50" rx="8" fill="#0077b6"/><text x="30" y="43" text-anchor="middle" fill="white" font-size="20" font-weight="700">1</text> <rect x="65" y="10" width="50" height="50" rx="8" fill="#0077b6"/><text x="90" y="43" text-anchor="middle" fill="white" font-size="20" font-weight="700">2</text> <rect x="125" y="10" width="50" height="50" rx="8" fill="#0077b6"/><text x="150" y="43" text-anchor="middle" fill="white" font-size="20" font-weight="700">3</text> <rect x="185" y="10" width="50" height="50" rx="8" fill="#0077b6"/><text x="210" y="43" text-anchor="middle" fill="white" font-size="20" font-weight="700">4</text> </svg>`
            },
            {
                name: "N3  Çerçeve Gold Set",
                svg: `<svg width="240" height="80" viewBox="0 0 240 80"> <circle cx="30" cy="40" r="25" fill="none" stroke="#FFD700" stroke-width="2"/><text x="30" y="47" text-anchor="middle" fill="#FFD700" font-size="20" font-weight="700">1</text> <circle cx="90" cy="40" r="25" fill="none" stroke="#FFD700" stroke-width="2"/><text x="90" y="47" text-anchor="middle" fill="#FFD700" font-size="20" font-weight="700">2</text> <circle cx="150" cy="40" r="25" fill="none" stroke="#FFD700" stroke-width="2"/><text x="150" y="47" text-anchor="middle" fill="#FFD700" font-size="20" font-weight="700">3</text> <circle cx="210" cy="40" r="25" fill="none" stroke="#FFD700" stroke-width="2"/><text x="210" y="47" text-anchor="middle" fill="#FFD700" font-size="20" font-weight="700">4</text> </svg>`
            },
            {
                name: "N4  Pin Numaralar",
                svg: `<svg width="200" height="180" viewBox="0 0 200 180"> <path d="M30 10 C10 10,0 20,0 35 C0 55,30 80,30 80 C30 80,60 55,60 35 C60 20,50 10,30 10Z" fill="#e63946"/> <text x="30" y="40" text-anchor="middle" fill="white" font-size="16" font-weight="700">1</text> <path d="M100 10 C80 10,70 20,70 35 C70 55,100 80,100 80 C100 80,130 55,130 35 C130 20,120 10,100 10Z" fill="#0077b6"/> <text x="100" y="40" text-anchor="middle" fill="white" font-size="16" font-weight="700">2</text> <path d="M170 10 C150 10,140 20,140 35 C140 55,170 80,170 80 C170 80,200 55,200 35 C200 20,190 10,170 10Z" fill="#2a9d8f"/> <text x="170" y="40" text-anchor="middle" fill="white" font-size="16" font-weight="700">3</text> <path d="M60 95 C40 95,30 105,30 120 C30 140,60 165,60 165 C60 165,90 140,90 120 C90 105,80 95,60 95Z" fill="#8e2de2"/> <text x="60" y="125" text-anchor="middle" fill="white" font-size="16" font-weight="700">4</text> <path d="M140 95 C120 95,110 105,110 120 C110 140,140 165,140 165 C140 165,170 140,170 120 C170 105,160 95,140 95Z" fill="#e9c46a"/> <text x="140" y="125" text-anchor="middle" fill="#1a1a2e" font-size="16" font-weight="700">5</text> </svg>`
            },
            {
                name: "N5  Pentagon Set",
                svg: `<svg width="240" height="80" viewBox="0 0 240 80"> <polygon points="30,8 55,25 48,55 12,55 5,25" fill="#e63946"/><text x="30" y="42" text-anchor="middle" fill="white" font-size="14" font-weight="700">1</text> <polygon points="90,8 115,25 108,55 72,55 65,25" fill="#e63946"/><text x="90" y="42" text-anchor="middle" fill="white" font-size="14" font-weight="700">2</text> <polygon points="150,8 175,25 168,55 132,55 125,25" fill="#e63946"/><text x="150" y="42" text-anchor="middle" fill="white" font-size="14" font-weight="700">3</text> <polygon points="210,8 235,25 228,55 192,55 185,25" fill="#e63946"/><text x="210" y="42" text-anchor="middle" fill="white" font-size="14" font-weight="700">4</text> </svg>`
            },
            {
                name: "N6  Gold Numaralar",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <defs><linearGradient id="n6g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c9a227"/><stop offset="100%" stop-color="#8b6914"/></linearGradient></defs> <circle cx="30" cy="40" r="25" fill="url(#n6g)"/><text x="30" y="47" text-anchor="middle" fill="#0a0e27" font-size="18" font-weight="700">01</text> <circle cx="100" cy="40" r="25" fill="url(#n6g)"/><text x="100" y="47" text-anchor="middle" fill="#0a0e27" font-size="18" font-weight="700">02</text> <circle cx="170" cy="40" r="25" fill="url(#n6g)"/><text x="170" y="47" text-anchor="middle" fill="#0a0e27" font-size="18" font-weight="700">03</text> </svg>`
            },
            {
                name: "N7  Neon Numaralar",
                svg: `<svg width="240" height="80" viewBox="0 0 240 80"> <defs><filter id="n7glow"><feGaussianBlur stdDeviation="2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs> <circle cx="30" cy="40" r="22" fill="none" stroke="#00ff88" stroke-width="2" filter="url(#n7glow)"/><text x="30" y="47" text-anchor="middle" fill="#00ff88" font-size="18" font-weight="700" filter="url(#n7glow)">1</text> <circle cx="90" cy="40" r="22" fill="none" stroke="#00ff88" stroke-width="2" filter="url(#n7glow)"/><text x="90" y="47" text-anchor="middle" fill="#00ff88" font-size="18" font-weight="700" filter="url(#n7glow)">2</text> <circle cx="150" cy="40" r="22" fill="none" stroke="#00ff88" stroke-width="2" filter="url(#n7glow)"/><text x="150" y="47" text-anchor="middle" fill="#00ff88" font-size="18" font-weight="700" filter="url(#n7glow)">3</text> <circle cx="210" cy="40" r="22" fill="none" stroke="#00ff88" stroke-width="2" filter="url(#n7glow)"/><text x="210" y="47" text-anchor="middle" fill="#00ff88" font-size="18" font-weight="700" filter="url(#n7glow)">4</text> </svg>`
            },
            {
                name: "N8  Büyük 1",
                svg: `<svg width="120" height="120" viewBox="0 0 120 120"> <circle cx="60" cy="60" r="55" fill="#e63946"/> <circle cx="60" cy="60" r="48" fill="none" stroke="white" stroke-width="1"/> <text x="60" y="75" text-anchor="middle" fill="white" font-size="48" font-weight="700">1</text> </svg>`
            },
            {
                name: "N9  Büyük 2",
                svg: `<svg width="120" height="120" viewBox="0 0 120 120"> <circle cx="60" cy="60" r="55" fill="#0077b6"/> <circle cx="60" cy="60" r="48" fill="none" stroke="white" stroke-width="1"/> <text x="60" y="75" text-anchor="middle" fill="white" font-size="48" font-weight="700">2</text> </svg>`
            },
            {
                name: "N10  Büyük 3",
                svg: `<svg width="120" height="120" viewBox="0 0 120 120"> <circle cx="60" cy="60" r="55" fill="#2a9d8f"/> <circle cx="60" cy="60" r="48" fill="none" stroke="white" stroke-width="1"/> <text x="60" y="75" text-anchor="middle" fill="white" font-size="48" font-weight="700">3</text> </svg>`
            },
            {
                name: "N11  Büyük 4",
                svg: `<svg width="120" height="120" viewBox="0 0 120 120"> <circle cx="60" cy="60" r="55" fill="#8e2de2"/> <circle cx="60" cy="60" r="48" fill="none" stroke="white" stroke-width="1"/> <text x="60" y="75" text-anchor="middle" fill="white" font-size="48" font-weight="700">4</text> </svg>`
            },
            {
                name: "N12  Büyük 5",
                svg: `<svg width="120" height="120" viewBox="0 0 120 120"> <circle cx="60" cy="60" r="55" fill="#e9c46a"/> <circle cx="60" cy="60" r="48" fill="none" stroke="#1a1a2e" stroke-width="1"/> <text x="60" y="75" text-anchor="middle" fill="#1a1a2e" font-size="48" font-weight="700">5</text> </svg>`
            },
            {
                name: "N13  Harf İşaretler",
                svg: `<svg width="240" height="80" viewBox="0 0 240 80"> <defs><linearGradient id="n13a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#764ba2"/></linearGradient></defs> <rect x="5" y="10" width="50" height="55" rx="10" fill="url(#n13a)"/><text x="30" y="45" text-anchor="middle" fill="white" font-size="22" font-weight="700">A</text> <rect x="65" y="10" width="50" height="55" rx="10" fill="url(#n13a)"/><text x="90" y="45" text-anchor="middle" fill="white" font-size="22" font-weight="700">B</text> <rect x="125" y="10" width="50" height="55" rx="10" fill="url(#n13a)"/><text x="150" y="45" text-anchor="middle" fill="white" font-size="22" font-weight="700">C</text> <rect x="185" y="10" width="50" height="55" rx="10" fill="url(#n13a)"/><text x="210" y="45" text-anchor="middle" fill="white" font-size="22" font-weight="700">D</text> </svg>`
            },
            {
                name: "N14  Oda Numaralar",
                svg: `<svg width="240" height="100" viewBox="0 0 240 100"> <rect x="5" y="10" width="50" height="75" rx="8" fill="#264653"/> <text x="30" y="35" text-anchor="middle" fill="#2a9d8f" font-size="8">SALON</text> <text x="30" y="62" text-anchor="middle" fill="white" font-size="24" font-weight="700">①</text> <rect x="65" y="10" width="50" height="75" rx="8" fill="#264653"/> <text x="90" y="35" text-anchor="middle" fill="#e63946" font-size="8">YATAK</text> <text x="90" y="62" text-anchor="middle" fill="white" font-size="24" font-weight="700">②</text> <rect x="125" y="10" width="50" height="75" rx="8" fill="#264653"/> <text x="150" y="35" text-anchor="middle" fill="#0077b6" font-size="8">BANYO</text> <text x="150" y="62" text-anchor="middle" fill="white" font-size="24" font-weight="700">③</text> <rect x="185" y="10" width="50" height="75" rx="8" fill="#264653"/> <text x="210" y="35" text-anchor="middle" fill="#e9c46a" font-size="8">MUTFAK</text> <text x="210" y="62" text-anchor="middle" fill="white" font-size="24" font-weight="700">④</text> </svg>`
            },
            {
                name: "N15  Elmas Şekil",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <polygon points="25,5 45,5 50,40 45,75 25,75 20,40" fill="#e63946"/><text x="35" y="47" text-anchor="middle" fill="white" font-size="16" font-weight="700">1</text> <polygon points="85,5 105,5 110,40 105,75 85,75 80,40" fill="#0077b6"/><text x="95" y="47" text-anchor="middle" fill="white" font-size="16" font-weight="700">2</text> <polygon points="145,5 165,5 170,40 165,75 145,75 140,40" fill="#2a9d8f"/><text x="155" y="47" text-anchor="middle" fill="white" font-size="16" font-weight="700">3</text> </svg>`
            },
            {
                name: "N16  Beyaz Kapsül",
                svg: `<svg width="240" height="80" viewBox="0 0 240 80"> <rect x="5" y="10" width="50" height="55" rx="27" fill="white"/><text x="30" y="45" text-anchor="middle" fill="#e63946" font-size="20" font-weight="700">01</text> <rect x="65" y="10" width="50" height="55" rx="27" fill="white"/><text x="90" y="45" text-anchor="middle" fill="#0077b6" font-size="20" font-weight="700">02</text> <rect x="125" y="10" width="50" height="55" rx="27" fill="white"/><text x="150" y="45" text-anchor="middle" fill="#2a9d8f" font-size="20" font-weight="700">03</text> <rect x="185" y="10" width="50" height="55" rx="27" fill="white"/><text x="210" y="45" text-anchor="middle" fill="#8e2de2" font-size="20" font-weight="700">04</text> </svg>`
            },
            {
                name: "N17  Etiketli Numara",
                svg: `<svg width="240" height="90" viewBox="0 0 240 90"> <rect x="5" y="10" width="105" height="65" rx="8" fill="#e63946"/> <text x="35" y="50" text-anchor="middle" fill="white" font-size="28" font-weight="700">01</text> <text x="85" y="40" text-anchor="middle" fill="white" font-size="8" letter-spacing="1">YATAK</text> <text x="85" y="55" text-anchor="middle" fill="white" font-size="8" letter-spacing="1">ODASI</text> <rect x="120" y="10" width="105" height="65" rx="8" fill="#0077b6"/> <text x="150" y="50" text-anchor="middle" fill="white" font-size="28" font-weight="700">02</text> <text x="200" y="40" text-anchor="middle" fill="white" font-size="8" letter-spacing="1">BANYO</text> </svg>`
            },
            {
                name: "N18  Hedef Numara",
                svg: `<svg width="160" height="160" viewBox="0 0 160 160"> <circle cx="80" cy="80" r="70" fill="none" stroke="#00d4ff" stroke-width="2"/> <circle cx="80" cy="80" r="60" fill="none" stroke="#00d4ff" stroke-width="1" stroke-dasharray="4 4"/> <circle cx="80" cy="80" r="40" fill="#00d4ff"/> <text x="80" y="90" text-anchor="middle" fill="#0a0e27" font-size="30" font-weight="700">7</text> <text x="80" y="135" text-anchor="middle" fill="#00d4ff" font-size="8" letter-spacing="2">NOKTA</text> </svg>`
            },
            {
                name: "N19  Listeli Numara",
                svg: `<svg width="240" height="80" viewBox="0 0 240 80"> <rect x="5" y="10" width="230" height="55" rx="8" fill="#264653"/> <circle cx="40" cy="37" r="18" fill="#e63946"/><text x="40" y="43" text-anchor="middle" fill="white" font-size="14" font-weight="700">1</text> <text x="80" y="42" fill="white" font-size="11">Giriş Holü</text> <line x1="140" y1="20" x2="140" y2="55" stroke="#2a9d8f" stroke-width="0.5"/> <circle cx="160" cy="37" r="18" fill="#0077b6"/><text x="160" y="43" text-anchor="middle" fill="white" font-size="14" font-weight="700">2</text> <text x="195" y="42" fill="white" font-size="11">Salon</text> </svg>`
            },
            {
                name: "N20  Pin Numara",
                svg: `<svg width="120" height="160" viewBox="0 0 120 160"> <path d="M60 10 C35 10,15 30,15 55 C15 85,60 120,60 120 C60 120,105 85,105 55 C105 30,85 10,60 10Z" fill="#e63946" stroke="white" stroke-width="2"/> <circle cx="60" cy="52" r="22" fill="white"/> <text x="60" y="60" text-anchor="middle" fill="#e63946" font-size="22" font-weight="700">10</text> <text x="60" y="145" text-anchor="middle" fill="#8b9dc3" font-size="8" letter-spacing="2">NOKTA</text> </svg>`
            },
        ]
    },
    "ok": {
        title: "➡️ Ok / Yönlendirme",
        items: [
            {
                name: "Kırmızı Ok + Etiket",
                svg: `<svg width="300" height="120" viewBox="0 0 300 120"><path d="M10 60 L60 30 L60 45 L190 45 L190 75 L60 75 L60 90 Z" fill="#e63946"/><rect x="190" y="30" width="100" height="60" rx="6" fill="#0a0e27" stroke="#e63946" stroke-width="2"/><text x="240" y="55" text-anchor="middle" fill="#e63946" font-size="9" letter-spacing="2">BURADA</text><text x="240" y="75" text-anchor="middle" fill="white" font-size="14" font-weight="700">GİRİŞ</text></svg>`
            },
            {
                name: "Elle Çizim Sarı",
                svg: `<svg width="280" height="140" viewBox="0 0 280 140"><path d="M20 100 Q80 40 150 80 Q200 100 250 60" fill="none" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/><polygon points="250,60 235,55 245,72" fill="#FFD700"/><text x="140" y="130" text-anchor="middle" fill="#FFD700" font-size="12" letter-spacing="3">ŞURAYA BAKIN</text></svg>`
            },
            {
                name: "Neon Yeşil",
                svg: `<svg width="260" height="120" viewBox="0 0 260 120"><defs><filter id="ok3"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M20 60 L200 60 L200 30 L240 60 L200 90 L200 60" fill="none" stroke="#00ff88" stroke-width="3" filter="url(#ok3)"/><text x="100" y="105" text-anchor="middle" fill="#00ff88" font-size="11" letter-spacing="4" filter="url(#ok3)">DEVAM</text></svg>`
            },
            {
                name: "Çift Yönlü Mor",
                svg: `<svg width="300" height="80" viewBox="0 0 300 80"><path d="M40 40 L60 25 L60 33 L240 33 L240 25 L260 40 L240 55 L240 47 L60 47 L60 55 Z" fill="#8e2de2"/><text x="150" y="75" text-anchor="middle" fill="#8e2de2" font-size="10" letter-spacing="3">15 METRE MESAFE</text></svg>`
            },
            {
                name: "Aşağı Uyarı",
                svg: `<svg width="140" height="200" viewBox="0 0 140 200"><rect x="30" y="15" width="80" height="35" rx="4" fill="#e63946"/><text x="70" y="38" text-anchor="middle" fill="white" font-size="10" letter-spacing="2">DİKKAT</text><path d="M70 55 L70 140" stroke="#e63946" stroke-width="4"/><polygon points="70,180 45,140 95,140" fill="#e63946"/></svg>`
            },
            {
                name: "Yuvarlak İkon",
                svg: `<svg width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="55" fill="#003566"/><circle cx="70" cy="70" r="45" fill="none" stroke="#ffc300" stroke-width="2" stroke-dasharray="4 3"/><path d="M50 70 L85 70 L85 55 L100 75 L85 95 L85 80 L50 80 Z" fill="#ffc300"/></svg>`
            },
            {
                name: "Kavisli Vintage",
                svg: `<svg width="280" height="140" viewBox="0 0 280 140"><path d="M30 110 Q30 30 140 30 Q250 30 250 100" fill="none" stroke="#c9a227" stroke-width="4" stroke-linecap="round"/><polygon points="250,100 240,85 260,88" fill="#c9a227"/><text x="140" y="128" text-anchor="middle" fill="#c9a227" font-size="11" letter-spacing="4">MERAK ETTİĞİN NOKTA</text></svg>`
            },
            {
                name: "Zigzag Yol",
                svg: `<svg width="280" height="140" viewBox="0 0 280 140"><path d="M20 40 L80 90 L140 40 L200 90 L240 60" fill="none" stroke="#ff006e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><polygon points="240,60 225,50 235,72" fill="#ff006e"/><text x="140" y="120" text-anchor="middle" fill="#ff006e" font-size="10" letter-spacing="3">TAKİP EDİN</text></svg>`
            },
            {
                name: "Blok Ok Yeşil",
                svg: `<svg width="280" height="120" viewBox="0 0 280 120"><path d="M10 40 L180 40 L180 15 L270 60 L180 105 L180 80 L10 80 Z" fill="#2a9d8f" stroke="white" stroke-width="2"/><text x="95" y="65" text-anchor="middle" fill="white" font-size="14" font-weight="700">İLERİ</text></svg>`
            },
            {
                name: "Nokta Yol",
                svg: `<svg width="280" height="140" viewBox="0 0 280 140"><circle cx="30" cy="70" r="4" fill="#00d4ff"/><circle cx="55" cy="65" r="5" fill="#00d4ff"/><circle cx="85" cy="60" r="6" fill="#00d4ff"/><circle cx="120" cy="60" r="7" fill="#00d4ff"/><circle cx="160" cy="65" r="8" fill="#00d4ff"/><circle cx="200" cy="70" r="9" fill="#00d4ff"/><polygon points="250,70 220,55 220,85" fill="#00d4ff"/><text x="140" y="115" text-anchor="middle" fill="#00d4ff" font-size="10" letter-spacing="3">YÖNÜ TAKİP EDİN</text></svg>`
            },
            {
                name: "Yukarı Vurgu",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><polygon points="100,20 60,70 85,70 85,150 115,150 115,70 140,70" fill="#e9c46a"/><rect x="45" y="155" width="110" height="30" rx="4" fill="#1a1a2e"/><text x="100" y="175" text-anchor="middle" fill="#e9c46a" font-size="11" letter-spacing="3">YUKARIDA</text></svg>`
            },
            {
                name: "3D Boyutlu",
                svg: `<svg width="280" height="140" viewBox="0 0 280 140"><path d="M20 55 L170 55 L170 30 L260 65 L170 100 L170 75 L20 75 Z" fill="#003566"/><path d="M20 75 L170 75 L170 100 L20 100 Z" fill="#001d3d" opacity="0.5"/><path d="M170 100 L260 65 L260 70 L170 105 Z" fill="#001d3d" opacity="0.5"/><text x="95" y="72" text-anchor="middle" fill="white" font-size="14" font-weight="700">TIKLA</text></svg>`
            },
            {
                name: "Daire Vurgu",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><ellipse cx="100" cy="100" rx="80" ry="60" fill="none" stroke="#e63946" stroke-width="4" stroke-dasharray="10 5"/><ellipse cx="100" cy="100" rx="65" ry="45" fill="none" stroke="#e63946" stroke-width="2"/><text x="100" y="107" text-anchor="middle" fill="#e63946" font-size="11" font-weight="700" letter-spacing="2">DİKKAT!</text></svg>`
            },
            {
                name: "Marker + Bilgi",
                svg: `<svg width="300" height="140" viewBox="0 0 300 140"><path d="M40 70 C40 45,60 25,85 25 C110 25,130 45,130 70 C130 100,85 130,85 130 C85 130,40 100,40 70 Z" fill="#8338ec"/><circle cx="85" cy="65" r="14" fill="white"/><text x="85" y="72" text-anchor="middle" fill="#8338ec" font-size="14" font-weight="700">!</text><line x1="130" y1="65" x2="180" y2="65" stroke="#8338ec" stroke-width="2"/><rect x="180" y="35" width="110" height="60" rx="8" fill="#0a0e27" stroke="#8338ec" stroke-width="2"/><text x="235" y="60" text-anchor="middle" fill="#8338ec" font-size="9" letter-spacing="2">ÖNEMLİ</text><text x="235" y="82" text-anchor="middle" fill="white" font-size="14" font-weight="700">NOKTA</text></svg>`
            },
            {
                name: "Fırça Ok",
                svg: `<svg width="300" height="120" viewBox="0 0 300 120"><path d="M20 60 Q80 30 150 55 Q220 75 260 50" fill="none" stroke="#ff006e" stroke-width="8" stroke-linecap="round" opacity="0.9"/><path d="M20 65 Q80 35 150 60 Q220 80 260 55" fill="none" stroke="#ff006e" stroke-width="3" stroke-linecap="round"/><polygon points="270,45 255,40 260,60 245,58" fill="#ff006e"/></svg>`
            },
            {
                name: "Adım Yolu",
                svg: `<svg width="300" height="120" viewBox="0 0 300 120"><circle cx="40" cy="60" r="18" fill="#2a9d8f"/><text x="40" y="66" text-anchor="middle" fill="white" font-size="14" font-weight="700">1</text><line x1="60" y1="60" x2="100" y2="60" stroke="#2a9d8f" stroke-width="2" stroke-dasharray="4 4"/><circle cx="120" cy="60" r="18" fill="#2a9d8f"/><text x="120" y="66" text-anchor="middle" fill="white" font-size="14" font-weight="700">2</text><line x1="140" y1="60" x2="180" y2="60" stroke="#2a9d8f" stroke-width="2" stroke-dasharray="4 4"/><circle cx="200" cy="60" r="18" fill="#2a9d8f"/><text x="200" y="66" text-anchor="middle" fill="white" font-size="14" font-weight="700">3</text><line x1="220" y1="60" x2="255" y2="60" stroke="#2a9d8f" stroke-width="2"/><polygon points="275,60 255,50 255,70" fill="#2a9d8f"/></svg>`
            },
            {
                name: "Konum + Ok",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><path d="M100 25 C70 25,50 45,50 75 C50 105,100 165,100 165 C100 165,150 105,150 75 C150 45,130 25,100 25 Z" fill="#e63946"/><circle cx="100" cy="70" r="18" fill="white"/><path d="M85 70 L110 70 L108 62 L118 72 L108 82 L110 74 L85 74 Z" fill="#e63946"/><text x="100" y="190" text-anchor="middle" fill="#e63946" font-size="10" letter-spacing="3">YÖN</text></svg>`
            },
            {
                name: "Yaldızlı Elegant",
                svg: `<svg width="280" height="120" viewBox="0 0 280 120"><defs><linearGradient id="ok18" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient></defs><path d="M20 55 Q140 20 240 55" fill="none" stroke="url(#ok18)" stroke-width="2"/><polygon points="240,55 225,45 230,68" fill="url(#ok18)"/><text x="140" y="105" text-anchor="middle" fill="url(#ok18)" font-size="10" letter-spacing="5">ELEGANT DIRECTION</text></svg>`
            },
            {
                name: "Uyarı + Fırsat",
                svg: `<svg width="280" height="140" viewBox="0 0 280 140"><polygon points="60,20 100,90 20,90" fill="#ffc300" stroke="#1a1a2e" stroke-width="2"/><text x="60" y="80" text-anchor="middle" fill="#1a1a2e" font-size="26" font-weight="700">!</text><line x1="105" y1="55" x2="180" y2="55" stroke="#ffc300" stroke-width="3"/><polygon points="180,55 170,50 170,60" fill="#ffc300"/><rect x="185" y="35" width="85" height="45" rx="6" fill="#1a1a2e" stroke="#ffc300" stroke-width="2"/><text x="228" y="55" text-anchor="middle" fill="#ffc300" font-size="9" letter-spacing="2">FIRSAT</text><text x="228" y="72" text-anchor="middle" fill="white" font-size="11" font-weight="700">%20 İND</text></svg>`
            },
            {
                name: "Ok + Fiyat",
                svg: `<svg width="320" height="120" viewBox="0 0 320 120"><defs><linearGradient id="ok20" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#8338ec"/><stop offset="100%" stop-color="#3a86ff"/></linearGradient></defs><path d="M10 40 L200 40 L200 15 L290 60 L200 105 L200 80 L10 80 Z" fill="url(#ok20)"/><text x="100" y="58" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">SATIŞTA</text><text x="100" y="78" text-anchor="middle" fill="white" font-size="14" font-weight="700">4.5M ₺</text></svg>`
            },
            {
                name: "OK1  Klasik Ok Kırmızı",
                svg: `<svg width="200" height="60" viewBox="0 0 200 60"> <polygon points="5,30 140,15 140,5 195,30 140,55 140,45 5,30" fill="#e63946"/> </svg>`
            },
            {
                name: "OK2  Yuvarlak Ok",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="22" width="140" height="36" rx="18" fill="#0077b6"/> <polygon points="145,10 195,40 145,70" fill="#0077b6"/> <text x="75" y="47" text-anchor="middle" fill="white" font-size="11" font-weight="700">GİRİŞ →</text> </svg>`
            },
            {
                name: "OK3  Gradient Ok",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <defs><linearGradient id="ok3g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#764ba2"/></linearGradient></defs> <path d="M10 40 L150 40" stroke="url(#ok3g)" stroke-width="6" stroke-linecap="round"/> <polygon points="150,20 190,40 150,60" fill="#764ba2"/> <text x="80" y="30" text-anchor="middle" fill="white" font-size="10" font-weight="700">BURAYA</text> </svg>`
            },
            {
                name: "OK4  Eğri Ok",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <path d="M10 40 Q100 -20 190 40" fill="none" stroke="#e63946" stroke-width="3" stroke-linecap="round"/> <polygon points="183,30 195,42 180,45" fill="#e63946"/> <text x="100" y="70" text-anchor="middle" fill="white" font-size="10" font-weight="700">SALON</text> </svg>`
            },
            {
                name: "OK5  Aşağı Ok",
                svg: `<svg width="60" height="200" viewBox="0 0 60 200"> <polygon points="30,5 55,140 45,140 45,195 15,195 15,140 5,140" fill="#e63946"/> <text x="30" y="175" text-anchor="middle" fill="white" font-size="9" font-weight="700" transform="rotate(-90,30,175)">AŞAĞI</text> </svg>`
            },
            {
                name: "OK6  Yukarı Ok",
                svg: `<svg width="60" height="200" viewBox="0 0 60 200"> <polygon points="30,195 55,60 45,60 45,5 15,5 15,60 5,60" fill="#00ff88"/> </svg>`
            },
            {
                name: "OK7  Sol Ok Gold",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <polygon points="195,40 60,15 60,5 5,40 60,75 60,65 195,40" fill="#FFD700"/> <text x="120" y="45" text-anchor="middle" fill="#0a0e27" font-size="10" font-weight="700">← SOL</text> </svg>`
            },
            {
                name: "OK8  Neon Ok",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <defs><filter id="ok8"><feGaussianBlur stdDeviation="2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs> <line x1="20" y1="50" x2="160" y2="50" stroke="#00d4ff" stroke-width="3" filter="url(#ok8)"/> <polygon points="160,30 190,50 160,70" fill="#00d4ff" filter="url(#ok8)"/> <text x="90" y="35" text-anchor="middle" fill="#00d4ff" font-size="10" letter-spacing="3" filter="url(#ok8)">DEVAM</text> </svg>`
            },
            {
                name: "OK9  Buton Ok",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="15" width="190" height="50" rx="25" fill="#e63946"/> <text x="80" y="48" text-anchor="middle" fill="white" font-size="12" font-weight="700">GİRİŞ</text> <text x="160" y="48" text-anchor="middle" fill="white" font-size="22">→</text> </svg>`
            },
            {
                name: "OK10  Rota Ok",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <path d="M30 80 Q30 20 100 20 L170 20" fill="none" stroke="white" stroke-width="2" stroke-dasharray="6 4"/> <polygon points="170,10 190,20 170,30" fill="white"/> <circle cx="30" cy="80" r="6" fill="#e63946"/> <text x="110" y="60" text-anchor="middle" fill="#8b9dc3" font-size="9">YÜRÜME YOLU</text> </svg>`
            },
            {
                name: "OK11  Daire Yukarı",
                svg: `<svg width="120" height="120" viewBox="0 0 120 120"> <circle cx="60" cy="60" r="50" fill="#264653"/> <polygon points="60,25 85,60 70,60 70,90 50,90 50,60 35,60" fill="white"/> </svg>`
            },
            {
                name: "OK12  Daire Aşağı",
                svg: `<svg width="120" height="120" viewBox="0 0 120 120"> <circle cx="60" cy="60" r="50" fill="#e63946"/> <polygon points="60,95 85,60 70,60 70,30 50,30 50,60 35,60" fill="white"/> </svg>`
            },
            {
                name: "OK13  Daire Sağ",
                svg: `<svg width="120" height="120" viewBox="0 0 120 120"> <circle cx="60" cy="60" r="50" fill="#2a9d8f"/> <polygon points="95,60 60,35 60,50 25,50 25,70 60,70 60,85" fill="white"/> </svg>`
            },
            {
                name: "OK14  Daire Sol",
                svg: `<svg width="120" height="120" viewBox="0 0 120 120"> <circle cx="60" cy="60" r="50" fill="#8e2de2"/> <polygon points="25,60 60,35 60,50 95,50 95,70 60,70 60,85" fill="white"/> </svg>`
            },
            {
                name: "OK15  Zigzag Ok",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <path d="M10 40 L60 40 L80 15 L100 40 L140 40 L160 15 L180 40 L190 40" fill="none" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/> <polygon points="185,25 200,40 185,55" fill="#FFD700"/> </svg>`
            },
            {
                name: "OK16  Mesafe Ok",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <line x1="20" y1="40" x2="70" y2="40" stroke="white" stroke-width="2" stroke-dasharray="6 4"/> <line x1="80" y1="40" x2="130" y2="40" stroke="white" stroke-width="2" stroke-dasharray="6 4"/> <line x1="140" y1="40" x2="170" y2="40" stroke="white" stroke-width="2"/> <polygon points="170,28 190,40 170,52" fill="white"/> <text x="100" y="65" text-anchor="middle" fill="#8b9dc3" font-size="9" letter-spacing="2">100m</text> </svg>`
            },
            {
                name: "OK17  Çoklu Yön",
                svg: `<svg width="160" height="160" viewBox="0 0 160 160"> <path d="M80 140 L80 40" fill="none" stroke="#e63946" stroke-width="3"/> <polygon points="65,45 80,20 95,45" fill="#e63946"/> <path d="M80 140 L140 80" fill="none" stroke="#0077b6" stroke-width="3"/> <polygon points="135,68 150,72 138,85" fill="#0077b6"/> <path d="M80 140 L20 80" fill="none" stroke="#2a9d8f" stroke-width="3"/> <polygon points="25,68 10,72 22,85" fill="#2a9d8f"/> <circle cx="80" cy="140" r="8" fill="white"/> </svg>`
            },
            {
                name: "OK18  Etiket Ok Sağ",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <rect x="10" y="25" width="130" height="50" rx="8" fill="#264653"/> <text x="75" y="56" text-anchor="middle" fill="white" font-size="12" font-weight="700">MUTFAK</text> <polygon points="140,25 180,50 140,75" fill="#264653"/> </svg>`
            },
            {
                name: "OK19  Etiket Ok Sol",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <polygon points="60,25 20,50 60,75" fill="#e63946"/> <rect x="60" y="25" width="130" height="50" rx="8" fill="#e63946"/> <text x="125" y="56" text-anchor="middle" fill="white" font-size="12" font-weight="700">← BALKON</text> </svg>`
            },
            {
                name: "OK20  Patika Ok",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <path d="M20 50 C50 20,80 20,100 50 C120 80,150 80,180 50" fill="none" stroke="#00ff88" stroke-width="3"/> <polygon points="175,38 190,50 175,60" fill="#00ff88"/> <circle cx="20" cy="50" r="5" fill="#00ff88"/> <text x="100" y="90" text-anchor="middle" fill="#8b9dc3" font-size="9">YÜRÜYÜŞ PATİKASI</text> </svg>`
            },
        ]
    },
    "kurdele": {
        title: "🎗️ Kurdele / Şerit",
        items: [
            {
                name: "Klasik Kırmızı Şerit",
                svg: `<svg width="320" height="100" viewBox="0 0 320 100"><polygon points="0,20 300,20 320,50 300,80 0,80 20,50" fill="#e63946"/><polygon points="0,20 20,50 0,80 15,50" fill="#8b0000"/><text x="160" y="58" text-anchor="middle" fill="white" font-size="18" font-weight="700" letter-spacing="4">SATILIK</text></svg>`
            },
            {
                name: "Köşe Yıldız",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><rect x="20" y="20" width="160" height="160" rx="10" fill="#1a1a2e"/><polygon points="20,20 90,20 20,90" fill="#FFD700"/><text x="42" y="55" text-anchor="middle" fill="#0a0e27" font-size="9" font-weight="700" transform="rotate(-45 42 55)">YENİ</text></svg>`
            },
            {
                name: "Katlı Şerit",
                svg: `<svg width="320" height="100" viewBox="0 0 320 100"><polygon points="10,30 30,10 300,10 320,30 320,70 300,90 30,90 10,70" fill="#2a9d8f"/><text x="165" y="58" text-anchor="middle" fill="white" font-size="16" font-weight="700" letter-spacing="4">FIRSAT</text></svg>`
            },
            {
                name: "Altın Dikey Kurdele",
                svg: `<svg width="120" height="240" viewBox="0 0 120 240"><defs><linearGradient id="kr4" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient></defs><polygon points="30,10 90,10 90,180 60,160 30,180" fill="url(#kr4)"/><text x="60" y="70" text-anchor="middle" fill="#0a0e27" font-size="10" font-weight="700" letter-spacing="2">TOP</text><text x="60" y="95" text-anchor="middle" fill="#0a0e27" font-size="10" font-weight="700" letter-spacing="2">SEÇİM</text><text x="60" y="130" text-anchor="middle" fill="#0a0e27" font-size="24" font-weight="700">1</text></svg>`
            },
            {
                name: "Neon Yeşil",
                svg: `<svg width="320" height="100" viewBox="0 0 320 100"><defs><filter id="kr5"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><polygon points="0,25 300,25 320,50 300,75 0,75 20,50" fill="none" stroke="#00ff88" stroke-width="2" filter="url(#kr5)"/><text x="160" y="57" text-anchor="middle" fill="#00ff88" font-size="16" font-weight="700" letter-spacing="4" filter="url(#kr5)">HOT DEAL</text></svg>`
            },
            {
                name: "Sivri Uç Mavi",
                svg: `<svg width="320" height="80" viewBox="0 0 320 80"><path d="M20 15 L300 15 L310 40 L300 65 L20 65 L30 40 Z" fill="#003566"/><path d="M300 15 L310 40 L300 65" fill="#001d3d"/><text x="160" y="48" text-anchor="middle" fill="#ffc300" font-size="14" font-weight="700" letter-spacing="4">LÜKS</text></svg>`
            },
            {
                name: "Diagonal Köşe",
                svg: `<svg width="220" height="140" viewBox="0 0 220 140"><rect x="10" y="10" width="200" height="120" rx="8" fill="#1a1a2e"/><path d="M120 10 L210 10 L210 100 Z" fill="#e63946"/><text x="180" y="45" text-anchor="middle" fill="white" font-size="10" font-weight="700" transform="rotate(45 180 45)">SATILDI</text></svg>`
            },
            {
                name: "Çift Kuyruk Mor",
                svg: `<svg width="320" height="120" viewBox="0 0 320 120"><polygon points="0,30 300,30 320,60 300,90 0,90" fill="#8e2de2"/><polygon points="60,90 40,120 20,90" fill="#5a189a"/><polygon points="280,90 260,120 240,90" fill="#5a189a"/><text x="160" y="68" text-anchor="middle" fill="white" font-size="16" font-weight="700" letter-spacing="3">PREMIUM</text></svg>`
            },
            {
                name: "Vintage Ödül",
                svg: `<svg width="280" height="180" viewBox="0 0 280 180"><defs><linearGradient id="kr9" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#8b0000"/><stop offset="100%" stop-color="#4a0000"/></linearGradient></defs><polygon points="80,20 200,20 220,45 200,70 80,70 60,45" fill="url(#kr9)"/><polygon points="60,45 40,60 60,80 80,70" fill="#2a0000"/><polygon points="220,45 240,60 220,80 200,70" fill="#2a0000"/><path d="M100 90 L100 160 L120 145 L140 160 L140 90 Z" fill="url(#kr9)"/><path d="M160 90 L160 160 L180 145 L200 160 L200 90 Z" fill="url(#kr9)"/><text x="140" y="50" text-anchor="middle" fill="#FFD700" font-size="12" font-weight="700" letter-spacing="3">ÖDÜLLÜ</text></svg>`
            },
            {
                name: "Cam Efekti",
                svg: `<svg width="300" height="100" viewBox="0 0 300 100"><polygon points="0,25 280,25 300,50 280,75 0,75 20,50" fill="white" fill-opacity="0.2" stroke="white" stroke-opacity="0.4" stroke-width="1"/><text x="150" y="58" text-anchor="middle" fill="white" font-size="16" font-weight="700" letter-spacing="4">EXCLUSIVE</text></svg>`
            },
            {
                name: "3D Perspektif",
                svg: `<svg width="300" height="140" viewBox="0 0 300 140"><polygon points="10,40 260,40 280,60 260,80 10,80 30,60" fill="#e63946"/><polygon points="10,80 260,80 260,90 10,90 20,85" fill="#8b0000"/><polygon points="260,40 280,60 280,70 260,90 260,80" fill="#5a0000"/><text x="145" y="68" text-anchor="middle" fill="white" font-size="16" font-weight="700" letter-spacing="3">İNDİRİM</text></svg>`
            },
            {
                name: "Yıldız Şerit",
                svg: `<svg width="300" height="100" viewBox="0 0 300 100"><polygon points="0,25 280,25 300,50 280,75 0,75 20,50" fill="#264653"/><polygon points="45,50 40,42 30,42 38,50 35,60 45,55 55,60 52,50 60,42 50,42" fill="#e9c46a"/><polygon points="255,50 250,42 240,42 248,50 245,60 255,55 265,60 262,50 270,42 260,42" fill="#e9c46a"/><text x="150" y="58" text-anchor="middle" fill="#e9c46a" font-size="14" font-weight="700" letter-spacing="3">PRESTİJ</text></svg>`
            },
            {
                name: "Kalın Blok Bant",
                svg: `<svg width="320" height="100" viewBox="0 0 320 100"><rect x="10" y="20" width="300" height="60" fill="#1a1a2e"/><rect x="10" y="20" width="300" height="10" fill="#FFD700"/><rect x="10" y="70" width="300" height="10" fill="#FFD700"/><text x="160" y="58" text-anchor="middle" fill="#FFD700" font-size="14" font-weight="700" letter-spacing="6">VIP OFFER</text></svg>`
            },
            {
                name: "Kupon Şerit",
                svg: `<svg width="320" height="120" viewBox="0 0 320 120"><path d="M20 20 L300 20 L300 100 L20 100 Z" fill="#e63946"/><circle cx="20" cy="60" r="10" fill="#1a1f3a"/><circle cx="300" cy="60" r="10" fill="#1a1f3a"/><line x1="40" y1="35" x2="280" y2="35" stroke="white" stroke-dasharray="3 3" opacity="0.4"/><line x1="40" y1="85" x2="280" y2="85" stroke="white" stroke-dasharray="3 3" opacity="0.4"/><text x="160" y="55" text-anchor="middle" fill="white" font-size="9" letter-spacing="4">İNDİRİM KUPONU</text><text x="160" y="80" text-anchor="middle" fill="#FFD700" font-size="20" font-weight="700">%30 OFF</text></svg>`
            },
            {
                name: "Çift Çizgi Elegant",
                svg: `<svg width="320" height="100" viewBox="0 0 320 100"><line x1="10" y1="30" x2="310" y2="30" stroke="#c9a227" stroke-width="1"/><polygon points="0,40 300,40 320,60 300,80 0,80 20,60" fill="#0a0e27" stroke="#c9a227" stroke-width="2"/><line x1="10" y1="88" x2="310" y2="88" stroke="#c9a227" stroke-width="1"/><text x="160" y="65" text-anchor="middle" fill="#c9a227" font-size="14" font-weight="700" letter-spacing="6">EXCLUSIVE</text></svg>`
            },
            {
                name: "Alt Diagonal",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><rect x="20" y="20" width="180" height="160" rx="8" fill="#1a1a2e"/><polygon points="20,120 90,190 200,190 200,180 90,180" fill="#ffc300"/><text x="130" y="176" text-anchor="middle" fill="#0a0e27" font-size="10" font-weight="700" letter-spacing="3">SATILIK</text></svg>`
            },
            {
                name: "Rozet + Şerit",
                svg: `<svg width="220" height="240" viewBox="0 0 220 240"><circle cx="110" cy="80" r="60" fill="#e63946" stroke="white" stroke-width="4"/><text x="110" y="70" text-anchor="middle" fill="white" font-size="9" letter-spacing="2">SATILIK</text><text x="110" y="95" text-anchor="middle" fill="white" font-size="18" font-weight="700">%20</text><polygon points="50,130 110,150 170,130 170,220 130,190 110,220 90,190 50,220" fill="#e63946"/></svg>`
            },
            {
                name: "İki Renk Karşıt",
                svg: `<svg width="320" height="100" viewBox="0 0 320 100"><polygon points="0,25 155,25 165,50 155,75 0,75 20,50" fill="#e63946"/><polygon points="155,25 320,25 300,50 320,75 155,75 165,50" fill="#0a0e27"/><text x="80" y="58" text-anchor="middle" fill="white" font-size="12" font-weight="700" letter-spacing="2">ÖNCE</text><text x="235" y="58" text-anchor="middle" fill="#e63946" font-size="12" font-weight="700" letter-spacing="2">SONRA</text></svg>`
            },
            {
                name: "Fırça Bant",
                svg: `<svg width="320" height="100" viewBox="0 0 320 100"><path d="M10 40 Q30 30 60 45 L280 45 Q300 35 315 50 Q305 60 285 55 L60 55 Q35 65 15 55 Z" fill="#ff006e"/><text x="160" y="55" text-anchor="middle" fill="white" font-size="14" font-weight="700" letter-spacing="4">TREND</text></svg>`
            },
            {
                name: "Ultra Premium",
                svg: `<svg width="320" height="120" viewBox="0 0 320 120"><defs><linearGradient id="kr20" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#000"/><stop offset="50%" stop-color="#FFD700"/><stop offset="100%" stop-color="#000"/></linearGradient></defs><polygon points="0,30 290,30 320,60 290,90 0,90 30,60" fill="url(#kr20)"/><polygon points="0,30 30,60 0,90 20,60" fill="#000"/><text x="160" y="65" text-anchor="middle" fill="white" font-size="14" font-weight="700" letter-spacing="8">ULTRA VIP</text></svg>`
            },
            {
                name: "K1  Klasik Şerit",
                svg: `<svg width="240" height="70" viewBox="0 0 240 70"> <polygon points="0,10 220,10 240,35 220,60 0,60 20,35" fill="#e63946"/> <text x="120" y="42" text-anchor="middle" fill="white" font-size="14" font-weight="700" letter-spacing="3">SATILIK</text> </svg>`
            },
            {
                name: "K2  Mavi Şerit",
                svg: `<svg width="240" height="70" viewBox="0 0 240 70"> <polygon points="10,10 230,10 240,35 230,60 10,60 0,35" fill="#0077b6"/> <text x="120" y="42" text-anchor="middle" fill="white" font-size="14" font-weight="700" letter-spacing="3">KİRALIK</text> </svg>`
            },
            {
                name: "K3  Gold Premium",
                svg: `<svg width="240" height="70" viewBox="0 0 240 70"> <defs><linearGradient id="k3g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#c9a227"/><stop offset="100%" stop-color="#FFD700"/></linearGradient></defs> <polygon points="0,10 220,10 240,35 220,60 0,60 20,35" fill="url(#k3g)"/> <text x="120" y="42" text-anchor="middle" fill="#0a0e27" font-size="14" font-weight="700" letter-spacing="3">PREMIUM</text> </svg>`
            },
            {
                name: "K4  Katlanmış Şerit",
                svg: `<svg width="240" height="80" viewBox="0 0 240 80"> <rect x="0" y="15" width="240" height="45" fill="#e63946"/> <polygon points="0,15 8,15 0,25" fill="#a4161a"/> <polygon points="240,15 232,15 240,25" fill="#a4161a"/> <polygon points="0,60 8,60 0,50" fill="#a4161a"/> <polygon points="240,60 232,60 240,50" fill="#a4161a"/> <text x="120" y="45" text-anchor="middle" fill="white" font-size="14" font-weight="700" letter-spacing="3">SATILDI</text> </svg>`
            },
            {
                name: "K5  Bayrak Şerit",
                svg: `<svg width="240" height="80" viewBox="0 0 240 80"> <rect x="20" y="15" width="200" height="45" fill="#2d6a4f"/> <polygon points="20,15 0,15 20,37" fill="#2d6a4f"/> <polygon points="20,60 0,60 20,37" fill="#2d6a4f"/> <polygon points="220,15 240,15 220,37" fill="#2d6a4f"/> <polygon points="220,60 240,60 220,37" fill="#2d6a4f"/> <text x="120" y="44" text-anchor="middle" fill="white" font-size="14" font-weight="700" letter-spacing="3">OPSİYONLU</text> </svg>`
            },
            {
                name: "K6  Tek Taraf Şerit",
                svg: `<svg width="240" height="70" viewBox="0 0 240 70"> <polygon points="0,10 220,10 240,35 220,60 0,60" fill="#8e2de2"/> <text x="115" y="42" text-anchor="middle" fill="white" font-size="14" font-weight="700" letter-spacing="2">REZERVE</text> </svg>`
            },
            {
                name: "K7  Çerçeve Şerit",
                svg: `<svg width="240" height="70" viewBox="0 0 240 70"> <rect x="0" y="12" width="240" height="40" fill="none" stroke="#e63946" stroke-width="2"/> <rect x="5" y="17" width="230" height="30" fill="none" stroke="#e63946" stroke-width="0.5"/> <text x="120" y="40" text-anchor="middle" fill="#e63946" font-size="14" font-weight="700" letter-spacing="3">SATILIK</text> </svg>`
            },
            {
                name: "K8  Neon Çerçeve",
                svg: `<svg width="240" height="70" viewBox="0 0 240 70"> <rect x="0" y="12" width="240" height="40" fill="#0a0e27" stroke="#00d4ff" stroke-width="2"/> <text x="120" y="40" text-anchor="middle" fill="#00d4ff" font-size="14" font-weight="700" letter-spacing="5">YENİ İLAN</text> </svg>`
            },
            {
                name: "K9  Köşe Sol Üst",
                svg: `<svg width="160" height="160" viewBox="0 0 160 160"> <polygon points="0,0 120,0 0,120" fill="#e63946"/> <text x="35" y="45" text-anchor="middle" fill="white" font-size="10" font-weight="700" transform="rotate(-45,35,45)">SATILIK</text> </svg>`
            },
            {
                name: "K10  Köşe Sağ Üst",
                svg: `<svg width="160" height="160" viewBox="0 0 160 160"> <polygon points="40,0 160,0 160,120" fill="#0077b6"/> <text x="120" y="48" text-anchor="middle" fill="white" font-size="10" font-weight="700" transform="rotate(45,120,45)">KİRALIK</text> </svg>`
            },
            {
                name: "K11  Çift Uçlu",
                svg: `<svg width="240" height="80" viewBox="0 0 240 80"> <path d="M0 20 L50 20 L60 40 L50 60 L0 60 Z" fill="#e63946"/> <rect x="55" y="20" width="130" height="40" fill="#c1121f"/> <path d="M180 20 L190 20 L240 20 L240 60 L190 60 L180 40 Z" fill="#e63946"/> <text x="120" y="47" text-anchor="middle" fill="white" font-size="13" font-weight="700" letter-spacing="3">FIRSAT</text> </svg>`
            },
            {
                name: "K12  3D Şerit",
                svg: `<svg width="240" height="80" viewBox="0 0 240 80"> <defs><filter id="k12s"><feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/></filter></defs> <polygon points="0,15 220,15 240,40 220,65 0,65 20,40" fill="#e63946" filter="url(#k12s)"/> <polygon points="0,10 220,10 240,35 220,60 0,60 20,35" fill="#ff6b6b" filter="url(#k12s)"/> <text x="120" y="42" text-anchor="middle" fill="white" font-size="14" font-weight="700" letter-spacing="3">İNDİRİM</text> </svg>`
            },
            {
                name: "K13  Kapsül Şerit",
                svg: `<svg width="240" height="70" viewBox="0 0 240 70"> <rect x="0" y="10" width="240" height="45" rx="22" fill="#2a9d8f"/> <text x="120" y="40" text-anchor="middle" fill="white" font-size="13" font-weight="700" letter-spacing="3">HEMEN TESLİM</text> </svg>`
            },
            {
                name: "K14  Dekorlu Şerit",
                svg: `<svg width="240" height="70" viewBox="0 0 240 70"> <rect x="0" y="10" width="240" height="45" fill="#e63946"/> <text x="120" y="22" text-anchor="middle" fill="white" font-size="6" letter-spacing="8">● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●</text> <text x="120" y="42" text-anchor="middle" fill="white" font-size="16" font-weight="700" letter-spacing="4">ACİL SATILIK</text> <text x="120" y="53" text-anchor="middle" fill="white" font-size="6" letter-spacing="8">● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●</text> </svg>`
            },
            {
                name: "K15  Çift Satır",
                svg: `<svg width="240" height="70" viewBox="0 0 240 70"> <rect x="0" y="10" width="240" height="20" fill="#e63946"/> <rect x="0" y="35" width="240" height="20" fill="#0077b6"/> <text x="120" y="26" text-anchor="middle" fill="white" font-size="10" font-weight="700" letter-spacing="3">SATILIK</text> <text x="120" y="51" text-anchor="middle" fill="white" font-size="10" font-weight="700" letter-spacing="3">₺ 3.500.000</text> </svg>`
            },
            {
                name: "K16  Oval Şerit",
                svg: `<svg width="240" height="80" viewBox="0 0 240 80"> <path d="M5 40 C5 20,20 10,40 10 L200 10 C220 10,235 20,235 40 C235 60,220 70,200 70 L40 70 C20 70,5 60,5 40 Z" fill="none" stroke="white" stroke-width="2"/> <text x="120" y="30" text-anchor="middle" fill="white" font-size="8" letter-spacing="4">EMLAK OFİSİ</text> <text x="120" y="50" text-anchor="middle" fill="white" font-size="14" font-weight="700">TAVSIYE EDİLİR</text> </svg>`
            },
            {
                name: "K17  Split Şerit",
                svg: `<svg width="240" height="70" viewBox="0 0 240 70"> <rect x="0" y="10" width="120" height="45" fill="#e63946"/> <rect x="120" y="10" width="120" height="45" fill="#264653"/> <text x="60" y="40" text-anchor="middle" fill="white" font-size="12" font-weight="700">SATILIK</text> <text x="180" y="40" text-anchor="middle" fill="white" font-size="12" font-weight="700">₺ 2.9M</text> </svg>`
            },
            {
                name: "K18  Gradient Şerit",
                svg: `<svg width="240" height="80" viewBox="0 0 240 80"> <defs><linearGradient id="k18g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#e63946"/><stop offset="100%" stop-color="#ff6b6b"/></linearGradient></defs> <rect x="0" y="15" width="240" height="45" fill="url(#k18g)"/> <text x="120" y="45" text-anchor="middle" fill="white" font-size="16" font-weight="700" letter-spacing="5">SATIŞ İLANI</text> </svg>`
            },
            {
                name: "K19  V-Kesim Şerit",
                svg: `<svg width="240" height="100" viewBox="0 0 240 100"> <path d="M0 20 L240 20 L240 75 L120 90 L0 75 Z" fill="#264653"/> <text x="120" y="42" text-anchor="middle" fill="#2a9d8f" font-size="8" letter-spacing="4">İLAN DURUMU</text> <text x="120" y="65" text-anchor="middle" fill="white" font-size="18" font-weight="700">GÜNCELLENDİ</text> </svg>`
            },
            {
                name: "K20  Elit Gold",
                svg: `<svg width="240" height="70" viewBox="0 0 240 70"> <defs><linearGradient id="k20g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#c9a227"/><stop offset="50%" stop-color="#FFD700"/><stop offset="100%" stop-color="#c9a227"/></linearGradient></defs> <rect x="0" y="10" width="240" height="45" fill="url(#k20g)"/> <rect x="3" y="13" width="234" height="39" fill="none" stroke="#0a0e27" stroke-width="0.5"/> <text x="120" y="40" text-anchor="middle" fill="#0a0e27" font-size="14" font-weight="700" letter-spacing="5">★ ELİT ★</text> </svg>`
            },
        ]
    },
    "kat": {
        title: "🏢 Kat Numaraları",
        items: [
            {
                name: "Bina Kat",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><rect x="40" y="20" width="120" height="160" fill="#003566" stroke="#ffc300" stroke-width="3"/><rect x="55" y="40" width="30" height="30" fill="#ffc300" opacity="0.7"/><rect x="115" y="40" width="30" height="30" fill="#ffc300" opacity="0.7"/><rect x="55" y="80" width="30" height="30" fill="#ffc300" opacity="0.5"/><rect x="115" y="80" width="30" height="30" fill="#ffc300" opacity="0.5"/><text x="100" y="150" text-anchor="middle" fill="#ffc300" font-size="42" font-weight="700">3/5</text></svg>`
            },
            {
                name: "Yuvarlak Kat",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="#0a0e27" stroke="#FFD700" stroke-width="3"/><text x="100" y="80" text-anchor="middle" fill="#FFD700" font-size="10" letter-spacing="3">BULUNDUĞUNUZ</text><text x="100" y="125" text-anchor="middle" fill="white" font-size="40" font-weight="700">2. KAT</text></svg>`
            },
            {
                name: "Bilgi Kat",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="10" fill="white"/><rect x="10" y="10" width="70" height="120" fill="#e63946"/><text x="45" y="80" text-anchor="middle" fill="white" font-size="36" font-weight="700">5</text><text x="160" y="55" text-anchor="middle" fill="#666" font-size="10" letter-spacing="3">KAT NUMARASI</text><text x="160" y="90" text-anchor="middle" fill="#1a1a2e" font-size="18" font-weight="700">DUBLEKS</text></svg>`
            },
            {
                name: "Asansör Panel",
                svg: `<svg width="180" height="200" viewBox="0 0 180 200"><rect x="30" y="20" width="120" height="160" rx="6" fill="#264653"/><line x1="30" y1="60" x2="150" y2="60" stroke="#e9c46a"/><line x1="30" y1="100" x2="150" y2="100" stroke="#e9c46a"/><line x1="30" y1="140" x2="150" y2="140" stroke="#e9c46a"/><text x="90" y="52" text-anchor="middle" fill="#e9c46a" font-size="12">4</text><text x="90" y="92" text-anchor="middle" fill="#e9c46a" font-size="12">3</text><rect x="35" y="105" width="110" height="30" fill="#e9c46a"/><text x="90" y="127" text-anchor="middle" fill="#264653" font-size="16" font-weight="700">2 . KAT</text><text x="90" y="167" text-anchor="middle" fill="#e9c46a" font-size="12">1</text></svg>`
            },
            {
                name: "Neon Son Kat",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><defs><filter id="k5f"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect x="10" y="30" width="220" height="80" rx="40" fill="#0a0e27" stroke="#00d4ff" stroke-width="2" filter="url(#k5f)"/><text x="120" y="60" text-anchor="middle" fill="#00d4ff" font-size="10" letter-spacing="3" filter="url(#k5f)">KAT</text><text x="120" y="90" text-anchor="middle" fill="white" font-size="24" font-weight="700" filter="url(#k5f)">7. KAT · SON KAT</text></svg>`
            },
            {
                name: "Zemin Kat",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><polygon points="100,15 175,55 175,145 100,185 25,145 25,55" fill="#8e2de2"/><text x="100" y="90" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">GİRİŞ</text><text x="100" y="130" text-anchor="middle" fill="white" font-size="36" font-weight="700">ZEMİN</text></svg>`
            },
            {
                name: "Penthouse",
                svg: `<svg width="240" height="160" viewBox="0 0 240 160"><rect x="10" y="10" width="220" height="140" rx="8" fill="#1a1a2e"/><rect x="10" y="10" width="220" height="35" fill="#FFD700"/><text x="120" y="32" text-anchor="middle" fill="#1a1a2e" font-size="10" letter-spacing="4">PENTHOUSE</text><text x="120" y="90" text-anchor="middle" fill="#FFD700" font-size="36" font-weight="700">12. KAT</text><text x="120" y="120" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">EN ÜST KAT</text></svg>`
            },
            {
                name: "Ev Silueti Kat",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><path d="M40 180 L40 100 L110 40 L180 100 L180 180 Z" fill="none" stroke="#00ff88" stroke-width="3"/><rect x="70" y="130" width="30" height="50" fill="#00ff88"/><rect x="120" y="130" width="30" height="50" fill="#00ff88" opacity="0.4"/><text x="110" y="105" text-anchor="middle" fill="#00ff88" font-size="10" letter-spacing="2">DAİRE</text><text x="110" y="80" text-anchor="middle" fill="white" font-size="18" font-weight="700">3/5</text></svg>`
            },
            {
                name: "Minimal Kat",
                svg: `<svg width="200" height="140" viewBox="0 0 200 140"><rect x="10" y="10" width="180" height="120" rx="8" fill="white"/><rect x="10" y="10" width="180" height="8" fill="#e63946"/><text x="100" y="55" text-anchor="middle" fill="#666" font-size="9" letter-spacing="4">D A İ R E</text><text x="100" y="95" text-anchor="middle" fill="#1a1a2e" font-size="32" font-weight="300">4 / 6</text></svg>`
            },
            {
                name: "Bina Toplam",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><rect x="30" y="20" width="160" height="160" fill="#003566"/><rect x="45" y="35" width="130" height="130" fill="none" stroke="#ffc300" stroke-width="2" stroke-dasharray="4 3"/><text x="110" y="80" text-anchor="middle" fill="#ffc300" font-size="10" letter-spacing="3">TOPLAM</text><text x="110" y="115" text-anchor="middle" fill="white" font-size="30" font-weight="700">10</text><text x="110" y="140" text-anchor="middle" fill="#ffc300" font-size="10" letter-spacing="3">KATLI BİNA</text></svg>`
            },
            {
                name: "KAT1  Basit Kat",
                svg: `<svg width="120" height="100" viewBox="0 0 120 100"> <rect x="10" y="10" width="100" height="75" rx="10" fill="#264653"/> <text x="60" y="38" text-anchor="middle" fill="#8b9dc3" font-size="8" letter-spacing="2">KAT</text> <text x="60" y="70" text-anchor="middle" fill="white" font-size="32" font-weight="700">3</text> </svg>`
            },
            {
                name: "KAT2  Kat / Toplam",
                svg: `<svg width="140" height="100" viewBox="0 0 140 100"> <rect x="10" y="10" width="120" height="75" rx="10" fill="#0077b6"/> <text x="70" y="35" text-anchor="middle" fill="white" font-size="8" letter-spacing="2" opacity="0.8">KAT NO</text> <text x="50" y="70" text-anchor="middle" fill="white" font-size="36" font-weight="700">5</text> <text x="95" y="62" text-anchor="middle" fill="white" font-size="10">/12</text> </svg>`
            },
            {
                name: "KAT3  Yuvarlak Kat",
                svg: `<svg width="120" height="100" viewBox="0 0 120 100"> <circle cx="60" cy="50" r="45" fill="#e63946"/> <text x="60" y="38" text-anchor="middle" fill="white" font-size="8" letter-spacing="2">KAT</text> <text x="60" y="68" text-anchor="middle" fill="white" font-size="30" font-weight="700">7</text> </svg>`
            },
            {
                name: "KAT4  Çerçeve Kat",
                svg: `<svg width="120" height="100" viewBox="0 0 120 100"> <rect x="10" y="10" width="100" height="75" rx="0" fill="none" stroke="#FFD700" stroke-width="2"/> <text x="60" y="35" text-anchor="middle" fill="#FFD700" font-size="8" letter-spacing="3">FLOOR</text> <text x="60" y="70" text-anchor="middle" fill="white" font-size="32" font-weight="300">12</text> </svg>`
            },
            {
                name: "KAT5  Çatı Katı",
                svg: `<svg width="160" height="100" viewBox="0 0 160 100"> <rect x="10" y="10" width="140" height="75" rx="37" fill="#0a0e27" stroke="#00d4ff" stroke-width="2"/> <text x="55" y="55" text-anchor="middle" fill="#00d4ff" font-size="28" font-weight="700">8</text> <line x1="80" y1="22" x2="80" y2="72" stroke="#00d4ff" stroke-width="0.5"/> <text x="115" y="42" text-anchor="middle" fill="white" font-size="8">KAT</text> <text x="115" y="62" text-anchor="middle" fill="#00d4ff" font-size="10">ÇATI</text> </svg>`
            },
            {
                name: "KAT6  Kat Listesi",
                svg: `<svg width="100" height="180" viewBox="0 0 100 180"> <rect x="10" y="5" width="80" height="25" rx="4" fill="#264653" stroke="#2a9d8f" stroke-width="1"/> <text x="50" y="22" text-anchor="middle" fill="white" font-size="10" font-weight="700">5.KAT</text> <rect x="10" y="35" width="80" height="25" rx="4" fill="#264653"/> <text x="50" y="52" text-anchor="middle" fill="#8b9dc3" font-size="10">4.KAT</text> <rect x="10" y="65" width="80" height="25" rx="4" fill="#264653"/> <text x="50" y="82" text-anchor="middle" fill="#8b9dc3" font-size="10">3.KAT</text> <rect x="10" y="95" width="80" height="25" rx="4" fill="#264653"/> <text x="50" y="112" text-anchor="middle" fill="#8b9dc3" font-size="10">2.KAT</text> <rect x="10" y="125" width="80" height="25" rx="4" fill="#264653"/> <text x="50" y="142" text-anchor="middle" fill="#8b9dc3" font-size="10">1.KAT</text> <rect x="10" y="155" width="80" height="25" rx="4" fill="#1a472a"/> <text x="50" y="172" text-anchor="middle" fill="#00ff88" font-size="10">ZEMİN</text> </svg>`
            },
            {
                name: "KAT7  Penthouse",
                svg: `<svg width="140" height="100" viewBox="0 0 140 100"> <polygon points="70,8 130,40 130,90 10,90 10,40" fill="#264653" stroke="#2a9d8f" stroke-width="1.5"/> <text x="70" y="55" text-anchor="middle" fill="#2a9d8f" font-size="8" letter-spacing="2">KAT</text> <text x="70" y="80" text-anchor="middle" fill="white" font-size="24" font-weight="700">PH</text> </svg>`
            },
            {
                name: "KAT8  Toplam Kat",
                svg: `<svg width="140" height="100" viewBox="0 0 140 100"> <rect x="10" y="10" width="120" height="75" rx="10" fill="#e63946"/> <text x="70" y="32" text-anchor="middle" fill="white" font-size="7" letter-spacing="3">TOPLAM</text> <text x="70" y="62" text-anchor="middle" fill="white" font-size="28" font-weight="700">20</text> <text x="70" y="78" text-anchor="middle" fill="white" font-size="8">KATLI BİNA</text> </svg>`
            },
            {
                name: "KAT9  Bodrum Kat",
                svg: `<svg width="120" height="100" viewBox="0 0 120 100"> <rect x="10" y="10" width="100" height="75" rx="10" fill="#1a472a"/> <text x="60" y="35" text-anchor="middle" fill="#00ff88" font-size="8" letter-spacing="2">BODRUM</text> <text x="60" y="68" text-anchor="middle" fill="white" font-size="28" font-weight="700">-1</text> </svg>`
            },
            {
                name: "KAT10  Zemin Kat",
                svg: `<svg width="120" height="100" viewBox="0 0 120 100"> <rect x="10" y="10" width="100" height="75" rx="10" fill="#264653"/> <text x="60" y="35" text-anchor="middle" fill="#e9c46a" font-size="8" letter-spacing="2">ZEMİN</text> <text x="60" y="68" text-anchor="middle" fill="white" font-size="28" font-weight="700">0</text> </svg>`
            },
            {
                name: "KAT11  Gold Penthouse",
                svg: `<svg width="160" height="100" viewBox="0 0 160 100"> <defs><linearGradient id="kat11g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c9a227"/><stop offset="100%" stop-color="#8b6914"/></linearGradient></defs> <rect x="10" y="10" width="140" height="75" rx="10" fill="#0a0e27" stroke="url(#kat11g)" stroke-width="2"/> <text x="80" y="32" text-anchor="middle" fill="url(#kat11g)" font-size="7" letter-spacing="4">PENTHOUSE</text> <text x="60" y="68" text-anchor="middle" fill="white" font-size="30" font-weight="700">25</text> <text x="105" y="60" text-anchor="middle" fill="url(#kat11g)" font-size="10">.KAT</text> </svg>`
            },
            {
                name: "KAT12  Asansör Kat",
                svg: `<svg width="140" height="100" viewBox="0 0 140 100"> <rect x="10" y="10" width="120" height="75" rx="8" fill="#0077b6"/> <text x="70" y="30" text-anchor="middle" fill="white" font-size="7" letter-spacing="2">ASANSÖRLÜ</text> <text x="70" y="58" text-anchor="middle" fill="white" font-size="22" font-weight="700">3/8</text> <text x="70" y="75" text-anchor="middle" fill="white" font-size="8" opacity="0.7">KAT</text> </svg>`
            },
            {
                name: "KAT13  Düblex Kat",
                svg: `<svg width="140" height="100" viewBox="0 0 140 100"> <polygon points="70,10 130,35 130,85 10,85 10,35" fill="#8e2de2"/> <text x="70" y="48" text-anchor="middle" fill="white" font-size="8" letter-spacing="2">DÜBLEX</text> <text x="70" y="72" text-anchor="middle" fill="white" font-size="18" font-weight="700">4-5.KAT</text> </svg>`
            },
            {
                name: "KAT14  Tripleks",
                svg: `<svg width="140" height="100" viewBox="0 0 140 100"> <rect x="10" y="10" width="120" height="75" rx="10" fill="#2d6a4f"/> <text x="70" y="30" text-anchor="middle" fill="#b7e4c7" font-size="7" letter-spacing="3">TRİPLEKS</text> <text x="70" y="62" text-anchor="middle" fill="white" font-size="16" font-weight="700">1-2-3</text> <text x="70" y="78" text-anchor="middle" fill="#b7e4c7" font-size="8">KATLAR</text> </svg>`
            },
            {
                name: "KAT15  Neon Kat",
                svg: `<svg width="120" height="100" viewBox="0 0 120 100"> <defs><filter id="kat15"><feGaussianBlur stdDeviation="2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs> <rect x="10" y="10" width="100" height="75" rx="10" fill="none" stroke="#00d4ff" stroke-width="2" filter="url(#kat15)"/> <text x="60" y="38" text-anchor="middle" fill="#00d4ff" font-size="8" letter-spacing="2" filter="url(#kat15)">KAT</text> <text x="60" y="68" text-anchor="middle" fill="#00d4ff" font-size="28" font-weight="700" filter="url(#kat15)">15</text> </svg>`
            },
            {
                name: "KAT16  Beyaz Kat",
                svg: `<svg width="140" height="100" viewBox="0 0 140 100"> <rect x="10" y="10" width="120" height="75" rx="10" fill="white"/> <text x="70" y="32" text-anchor="middle" fill="#1a1a2e" font-size="7" letter-spacing="3">KAT</text> <text x="70" y="68" text-anchor="middle" fill="#e63946" font-size="36" font-weight="700">6</text> </svg>`
            },
            {
                name: "KAT17  Pentagon Kat",
                svg: `<svg width="140" height="100" viewBox="0 0 140 100"> <polygon points="70,5 135,50 110,95 30,95 5,50" fill="#e63946"/> <text x="70" y="50" text-anchor="middle" fill="white" font-size="8" letter-spacing="1">KAT</text> <text x="70" y="75" text-anchor="middle" fill="white" font-size="22" font-weight="700">9</text> </svg>`
            },
            {
                name: "KAT18  Karşılaştırma",
                svg: `<svg width="160" height="100" viewBox="0 0 160 100"> <rect x="10" y="10" width="55" height="75" rx="8" fill="#264653"/> <rect x="75" y="10" width="75" height="75" rx="8" fill="#e63946"/> <text x="37" y="38" text-anchor="middle" fill="#8b9dc3" font-size="7">BULUNDUĞU</text> <text x="37" y="65" text-anchor="middle" fill="white" font-size="22" font-weight="700">4</text> <text x="112" y="38" text-anchor="middle" fill="white" font-size="7" opacity="0.8">BİNA TOPLAM</text> <text x="112" y="65" text-anchor="middle" fill="white" font-size="22" font-weight="700">12</text> <text x="112" y="78" text-anchor="middle" fill="white" font-size="7">KAT</text> </svg>`
            },
            {
                name: "KAT19  İkonlu Kat",
                svg: `<svg width="140" height="100" viewBox="0 0 140 100"> <rect x="10" y="10" width="120" height="35" rx="8" fill="#e63946"/> <rect x="10" y="50" width="120" height="35" rx="8" fill="#264653"/> <text x="70" y="34" text-anchor="middle" fill="white" font-size="12" font-weight="700">🏢 11.KAT</text> <text x="70" y="74" text-anchor="middle" fill="#8b9dc3" font-size="10">MANZARALI</text> </svg>`
            },
            {
                name: "KAT20  Son Kat",
                svg: `<svg width="140" height="100" viewBox="0 0 140 100"> <rect x="10" y="10" width="120" height="75" rx="10" fill="#0a0e27" stroke="#e63946" stroke-width="2"/> <text x="70" y="35" text-anchor="middle" fill="#e63946" font-size="7" letter-spacing="3">SON KAT</text> <text x="70" y="65" text-anchor="middle" fill="white" font-size="26" font-weight="700">30</text> <text x="70" y="78" text-anchor="middle" fill="#e63946" font-size="8">🔝 EN ÜSTÜNDE</text> </svg>`
            },
        ]
    },
    "anahtar": {
        title: "🔑 Anahtar Teslim / Tapu",
        items: [
            {
                name: "Anahtar İkon",
                svg: `<svg width="220" height="140" viewBox="0 0 220 140"><rect x="10" y="20" width="200" height="100" rx="50" fill="#FFD700"/><circle cx="55" cy="70" r="20" fill="#0a0e27"/><circle cx="55" cy="70" r="8" fill="#FFD700"/><rect x="70" y="65" width="35" height="10" fill="#0a0e27"/><rect x="95" y="65" width="6" height="18" fill="#0a0e27"/><text x="150" y="60" text-anchor="middle" fill="#0a0e27" font-size="10" letter-spacing="3">ANAHTAR</text><text x="150" y="85" text-anchor="middle" fill="#0a0e27" font-size="16" font-weight="700">TESLİM</text></svg>`
            },
            {
                name: "Tapu Hazır",
                svg: `<svg width="220" height="180" viewBox="0 0 220 180"><rect x="20" y="20" width="180" height="140" fill="#f8f5e6" stroke="#8b6914" stroke-width="2"/><text x="110" y="55" text-anchor="middle" fill="#8b6914" font-size="10" letter-spacing="4">TAPU</text><line x1="60" y1="65" x2="160" y2="65" stroke="#8b6914" stroke-width="0.5"/><text x="110" y="100" text-anchor="middle" fill="#1a1a2e" font-size="20" font-weight="700">HAZIR</text><text x="110" y="125" text-anchor="middle" fill="#8b6914" font-size="10" letter-spacing="3">HEMEN DEVREDİLİR</text></svg>`
            },
            {
                name: "Temiz Tapu",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="12" fill="#2a9d8f"/><circle cx="55" cy="70" r="26" fill="white"/><path d="M43 70 L52 78 L68 60" stroke="#2a9d8f" stroke-width="4" fill="none" stroke-linecap="round"/><text x="150" y="60" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">SIFIR SORUN</text><text x="150" y="90" text-anchor="middle" fill="white" font-size="14" font-weight="700">TEMİZ TAPU</text></svg>`
            },
            {
                name: "Hemen Taşın",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" fill="none" stroke="#e63946" stroke-width="3"/><circle cx="100" cy="100" r="78" fill="none" stroke="#e63946" stroke-width="1"/><text x="100" y="80" text-anchor="middle" fill="#e63946" font-size="10" letter-spacing="3">HEMEN</text><text x="100" y="115" text-anchor="middle" fill="white" font-size="22" font-weight="700">TAŞIN</text><text x="100" y="140" text-anchor="middle" fill="#e63946" font-size="10" letter-spacing="3">TESLİME HAZIR</text></svg>`
            },
            {
                name: "Full Hazır",
                svg: `<svg width="240" height="160" viewBox="0 0 240 160"><rect x="10" y="10" width="220" height="140" rx="10" fill="#1a1a2e" stroke="#FFD700" stroke-width="2"/><text x="120" y="45" text-anchor="middle" fill="#FFD700" font-size="10" letter-spacing="4">İSKAN + TAPU</text><line x1="60" y1="55" x2="180" y2="55" stroke="#FFD700" stroke-width="0.5"/><text x="120" y="95" text-anchor="middle" fill="white" font-size="20" font-weight="700">%100 HAZIR</text><text x="120" y="125" text-anchor="middle" fill="#FFD700" font-size="9" letter-spacing="3">TAM TESLİM</text></svg>`
            },
            {
                name: "Güvenli Teslim",
                svg: `<svg width="220" height="180" viewBox="0 0 220 180"><path d="M110 20 L170 45 L170 100 C170 135,140 165,110 175 C80 165,50 135,50 100 L50 45 Z" fill="#003566" stroke="#ffc300" stroke-width="3"/><circle cx="90" cy="85" r="15" fill="#ffc300"/><circle cx="90" cy="85" r="5" fill="#003566"/><rect x="100" y="82" width="30" height="7" fill="#ffc300"/><text x="110" y="130" text-anchor="middle" fill="#ffc300" font-size="10" letter-spacing="3">ANAHTAR</text><text x="110" y="150" text-anchor="middle" fill="white" font-size="11" font-weight="700">GÜVENDE</text></svg>`
            },
            {
                name: "Hızlı Devir",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="10" fill="white"/><rect x="10" y="10" width="80" height="120" fill="#8e2de2"/><circle cx="50" cy="60" r="14" fill="white"/><rect x="46" y="60" width="20" height="18" fill="white"/><text x="160" y="55" text-anchor="middle" fill="#8e2de2" font-size="10" letter-spacing="3">1 GÜNDE</text><text x="160" y="90" text-anchor="middle" fill="#1a1a2e" font-size="16" font-weight="700">DEVİR</text></svg>`
            },
            {
                name: "İpoteksiz",
                svg: `<svg width="240" height="160" viewBox="0 0 240 160"><rect x="10" y="10" width="220" height="140" rx="10" fill="#264653"/><text x="120" y="50" text-anchor="middle" fill="#e9c46a" font-size="10" letter-spacing="3">İPOTEKSİZ</text><text x="120" y="90" text-anchor="middle" fill="white" font-size="22" font-weight="700">SORUNSUZ</text><text x="120" y="120" text-anchor="middle" fill="#e9c46a" font-size="10" letter-spacing="3">TAPU</text></svg>`
            },
            {
                name: "Altın Anahtar",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><polygon points="110,20 175,50 175,110 110,180 45,110 45,50" fill="#FFD700"/><circle cx="110" cy="85" r="18" fill="#0a0e27"/><circle cx="110" cy="85" r="6" fill="#FFD700"/><rect x="120" y="82" width="30" height="6" fill="#0a0e27"/><text x="110" y="140" text-anchor="middle" fill="#0a0e27" font-size="10" letter-spacing="3">ANAHTAR</text><text x="110" y="160" text-anchor="middle" fill="#0a0e27" font-size="12" font-weight="700">SİZE</text></svg>`
            },
            {
                name: "Teslim Süresi",
                svg: `<svg width="260" height="120" viewBox="0 0 260 120"><polygon points="0,25 240,25 260,60 240,95 0,95 20,60" fill="#e63946"/><text x="130" y="55" text-anchor="middle" fill="white" font-size="9" letter-spacing="3">ANAHTAR TESLİM</text><text x="130" y="80" text-anchor="middle" fill="#FFD700" font-size="16" font-weight="700">30 GÜN İÇİNDE</text></svg>`
            },
            {
                name: "AT1  Klasik",
                svg: `<svg width="180" height="80" viewBox="0 0 180 80"> <rect x="5" y="10" width="170" height="55" rx="27" fill="#2a9d8f"/> <text x="90" y="44" text-anchor="middle" fill="white" font-size="13" font-weight="700">🔑 ANAHTAR TESLİM</text> </svg>`
            },
            {
                name: "AT2  Gold Teslim",
                svg: `<svg width="180" height="80" viewBox="0 0 180 80"> <rect x="5" y="10" width="170" height="55" rx="8" fill="#0a0e27" stroke="#FFD700" stroke-width="2"/> <text x="90" y="44" text-anchor="middle" fill="#FFD700" font-size="12" font-weight="700">🔑 HEMEN TESLİM</text> </svg>`
            },
            {
                name: "AT3  Taşınmaya Hazır",
                svg: `<svg width="180" height="80" viewBox="0 0 180 80"> <rect x="5" y="10" width="170" height="55" rx="27" fill="#e63946"/> <text x="90" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">🏠 TAŞINMAYA HAZIR</text> </svg>`
            },
            {
                name: "AT4  Teslim Tarihi",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <rect x="10" y="10" width="180" height="75" rx="10" fill="#264653"/> <text x="100" y="35" text-anchor="middle" fill="#2a9d8f" font-size="8" letter-spacing="3">TESLİM TARİHİ</text> <text x="100" y="62" text-anchor="middle" fill="white" font-size="18" font-weight="700">ARALIK 2025</text> <text x="100" y="78" text-anchor="middle" fill="#00ff88" font-size="9">✓ ZAMANINDA TESLİM</text> </svg>`
            },
            {
                name: "AT5  Daire Anahtar",
                svg: `<svg width="160" height="160" viewBox="0 0 160 160"> <circle cx="80" cy="80" r="70" fill="#2a9d8f"/> <circle cx="80" cy="80" r="60" fill="none" stroke="white" stroke-width="1"/> <text x="80" y="65" text-anchor="middle" fill="white" font-size="28">🔑</text> <text x="80" y="95" text-anchor="middle" fill="white" font-size="9" letter-spacing="2">ANAHTAR</text> <text x="80" y="110" text-anchor="middle" fill="white" font-size="9" letter-spacing="2">TESLİM</text> </svg>`
            },
            {
                name: "AT6  Teslim Edildi",
                svg: `<svg width="180" height="80" viewBox="0 0 180 80"> <rect x="5" y="10" width="170" height="55" rx="8" fill="#1a472a" stroke="#00ff88" stroke-width="1"/> <text x="90" y="30" text-anchor="middle" fill="#00ff88" font-size="8" letter-spacing="2">DURUM</text> <text x="90" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">✅ TESLİM EDİLDİ</text> </svg>`
            },
            {
                name: "AT7  Süre Bilgisi",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <rect x="10" y="10" width="180" height="75" rx="10" fill="#264653"/> <rect x="10" y="10" width="50" height="75" rx="10" fill="#2a9d8f"/> <text x="35" y="55" text-anchor="middle" fill="white" font-size="24">🔑</text> <text x="130" y="38" text-anchor="middle" fill="white" font-size="8" letter-spacing="2">TESLİM SÜRESİ</text> <text x="130" y="62" text-anchor="middle" fill="white" font-size="20" font-weight="700">6 AY</text> <text x="130" y="78" text-anchor="middle" fill="#2a9d8f" font-size="8">SONRA TESLİM</text> </svg>`
            },
            {
                name: "AT8  İskan Alındı",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <rect x="10" y="10" width="180" height="75" rx="10" fill="#0a0e27" stroke="#00ff88" stroke-width="1"/> <circle cx="50" cy="47" r="25" fill="#00ff88" fill-opacity="0.1" stroke="#00ff88" stroke-width="1"/> <text x="50" y="53" text-anchor="middle" fill="#00ff88" font-size="20">✓</text> <text x="135" y="38" text-anchor="middle" fill="#00ff88" font-size="8" letter-spacing="3">YAPI KULLANMA</text> <text x="135" y="58" text-anchor="middle" fill="white" font-size="14" font-weight="700">İZNİ VAR</text> <text x="135" y="74" text-anchor="middle" fill="#00ff88" font-size="8">İSKAN ALINDI</text> </svg>`
            },
            {
                name: "AT9  Tapulu",
                svg: `<svg width="180" height="80" viewBox="0 0 180 80"> <rect x="5" y="10" width="170" height="55" rx="27" fill="#0077b6"/> <text x="90" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">📋 TAPULU</text> </svg>`
            },
            {
                name: "AT10  İnşaat Aşaması",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="27" fill="#e9c46a"/> <text x="100" y="44" text-anchor="middle" fill="#1a1a2e" font-size="12" font-weight="700">🏗️ İNŞAAT AŞAMASINDA</text> </svg>`
            },
            {
                name: "AT11  İlerleme Çubuğu",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <rect x="10" y="10" width="180" height="75" rx="10" fill="#264653"/> <text x="100" y="32" text-anchor="middle" fill="#2a9d8f" font-size="7" letter-spacing="4">PROJE DURUMU</text> <rect x="25" y="42" width="150" height="12" rx="6" fill="#1a1a2e"/> <rect x="25" y="42" width="112" height="12" rx="6" fill="#00ff88"/> <text x="100" y="50" text-anchor="middle" fill="#0a0e27" font-size="7" font-weight="700">%75</text> <text x="100" y="74" text-anchor="middle" fill="white" font-size="10" font-weight="700">2025 Q2 TESLİM</text> </svg>`
            },
            {
                name: "AT12  Kat Mülkiyeti",
                svg: `<svg width="180" height="80" viewBox="0 0 180 80"> <rect x="5" y="10" width="170" height="55" rx="8" fill="#2d6a4f"/> <text x="90" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">🔑 KAT MÜLKİYETİ</text> </svg>`
            },
            {
                name: "AT13  Kat İrtifakı",
                svg: `<svg width="180" height="80" viewBox="0 0 180 80"> <rect x="5" y="10" width="170" height="55" rx="8" fill="#0077b6"/> <text x="90" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">📜 KAT İRTİFAKI</text> </svg>`
            },
            {
                name: "AT14  Sıfır Teslim",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#e63946"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">🆕 SIFIR TESLİM</text> </svg>`
            },
            {
                name: "AT15  Eşyalı",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#264653"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">🛋️ EŞYALI TESLİM</text> </svg>`
            },
            {
                name: "AT16  Dekorlu",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#8e2de2"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">🎨 DEKORLU TESLİM</text> </svg>`
            },
            {
                name: "AT17  Kaba İnşaat",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#0a0e27" stroke="#e63946" stroke-width="2"/> <text x="100" y="44" text-anchor="middle" fill="#e63946" font-size="12" font-weight="700">⏰ KABA İNŞAAT</text> </svg>`
            },
            {
                name: "AT18  Sıfır Gecikme",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#2a9d8f"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">✅ SIFIR GECİKME</text> </svg>`
            },
            {
                name: "AT19  Premium Teslim",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <defs><linearGradient id="at19g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c9a227"/><stop offset="100%" stop-color="#8b6914"/></linearGradient></defs> <rect x="10" y="10" width="180" height="75" rx="10" fill="#0a0e27" stroke="url(#at19g)" stroke-width="2"/> <text x="100" y="30" text-anchor="middle" fill="url(#at19g)" font-size="7" letter-spacing="4">TURNKEY DELIVERY</text> <text x="100" y="55" text-anchor="middle" fill="white" font-size="22">🔑</text> <text x="100" y="78" text-anchor="middle" fill="url(#at19g)" font-size="10" font-weight="700">PREMIUM TESLİM</text> </svg>`
            },
            {
                name: "AT20  Akış Teslim",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <rect x="10" y="10" width="180" height="75" rx="10" fill="#264653"/> <text x="60" y="40" text-anchor="middle" fill="white" font-size="22">🏠</text> <text x="100" y="40" text-anchor="middle" fill="#2a9d8f" font-size="18">→</text> <text x="140" y="40" text-anchor="middle" fill="white" font-size="22">🔑</text> <text x="100" y="65" text-anchor="middle" fill="white" font-size="10" font-weight="700">ANAHTAR TESLİM</text> <text x="100" y="78" text-anchor="middle" fill="#2a9d8f" font-size="8">HAZIR DAİRE</text> </svg>`
            },
        ]
    },
    "iletisim": {
        title: "📞 İletişim",
        items: [
            {
                name: "Telefon Yeşil",
                svg: `<svg width="220" height="120" viewBox="0 0 220 120"><rect x="10" y="20" width="200" height="80" rx="40" fill="#2a9d8f"/><circle cx="50" cy="60" r="22" fill="white"/><path d="M40 55 C40 50,45 47,50 50 L58 58 C56 62,52 65,48 63 Z" fill="#2a9d8f"/><text x="140" y="55" text-anchor="middle" fill="white" font-size="9" letter-spacing="2">HEMEN ARA</text><text x="140" y="80" text-anchor="middle" fill="white" font-size="14" font-weight="700">0532 xxx xx xx</text></svg>`
            },
            {
                name: "WhatsApp",
                svg: `<svg width="220" height="120" viewBox="0 0 220 120"><rect x="10" y="20" width="200" height="80" rx="10" fill="#25D366"/><text x="140" y="55" text-anchor="middle" fill="white" font-size="9" letter-spacing="3">WHATSAPP</text><text x="140" y="80" text-anchor="middle" fill="white" font-size="14" font-weight="700">MESAJ AT</text></svg>`
            },
            {
                name: "7/24 Hat",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="12" fill="#1a1a2e" stroke="#FFD700" stroke-width="2"/><text x="120" y="45" text-anchor="middle" fill="#FFD700" font-size="10" letter-spacing="4">7/24 İLETİŞİM</text><line x1="50" y1="55" x2="190" y2="55" stroke="#FFD700" stroke-width="0.5"/><text x="120" y="88" text-anchor="middle" fill="white" font-size="18" font-weight="700">0850 xxx xx xx</text><text x="120" y="110" text-anchor="middle" fill="#FFD700" font-size="9" letter-spacing="3">ÜCRETSİZ ARA</text></svg>`
            },
            {
                name: "E-posta",
                svg: `<svg width="220" height="140" viewBox="0 0 220 140"><rect x="10" y="10" width="200" height="120" rx="12" fill="#003566"/><rect x="35" y="45" width="150" height="55" rx="4" fill="white"/><polygon points="35,45 110,80 185,45" fill="none" stroke="#003566" stroke-width="2"/><text x="110" y="120" text-anchor="middle" fill="#ffc300" font-size="10" letter-spacing="3">E-POSTA GÖNDER</text></svg>`
            },
            {
                name: "Yuvarlak Ara",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" fill="#e63946"/><text x="100" y="130" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">HEMEN</text><text x="100" y="150" text-anchor="middle" fill="white" font-size="14" font-weight="700">ARAYIN</text></svg>`
            },
            {
                name: "WhatsApp Şerit",
                svg: `<svg width="260" height="120" viewBox="0 0 260 120"><path d="M0 25 L240 25 L260 60 L240 95 L0 95 L20 60 Z" fill="#25D366"/><text x="130" y="55" text-anchor="middle" fill="white" font-size="9" letter-spacing="3">WHATSAPP HATTI</text><text x="130" y="80" text-anchor="middle" fill="white" font-size="14" font-weight="700">DETAY ALIN</text></svg>`
            },
            {
                name: "Pin İletişim",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><path d="M100 15 C60 15,30 45,30 85 C30 140,100 190,100 190 C100 190,170 140,170 85 C170 45,140 15,100 15 Z" fill="#8e2de2"/><circle cx="100" cy="80" r="30" fill="white"/><text x="100" y="155" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">İLETİŞİM</text></svg>`
            },
            {
                name: "Danışman Kartı",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="10" fill="white"/><rect x="10" y="10" width="220" height="30" fill="#1a1a2e"/><text x="120" y="30" text-anchor="middle" fill="#FFD700" font-size="10" letter-spacing="3">DANIŞMAN</text><text x="120" y="75" text-anchor="middle" fill="#1a1a2e" font-size="14" font-weight="700">Ahmet YILMAZ</text><text x="120" y="100" text-anchor="middle" fill="#666" font-size="10">Emlak Uzmanı</text><text x="120" y="120" text-anchor="middle" fill="#e63946" font-size="11" font-weight="700">0532 xxx xx xx</text></svg>`
            },
            {
                name: "Online İletişim",
                svg: `<svg width="240" height="120" viewBox="0 0 240 120"><rect x="10" y="20" width="220" height="80" rx="8" fill="#00d4ff"/><text x="150" y="55" text-anchor="middle" fill="white" font-size="9" letter-spacing="3">ONLİNE RANDEVU</text><text x="150" y="80" text-anchor="middle" fill="white" font-size="12" font-weight="700">ŞİMDİ AL</text></svg>`
            },
            {
                name: "Neon Call",
                svg: `<svg width="220" height="140" viewBox="0 0 220 140"><defs><filter id="ir10"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect x="10" y="20" width="200" height="100" rx="50" fill="#0a0e27" stroke="#ff006e" stroke-width="2" filter="url(#ir10)"/><text x="110" y="60" text-anchor="middle" fill="#ff006e" font-size="10" letter-spacing="3" filter="url(#ir10)">CALL NOW</text><text x="110" y="90" text-anchor="middle" fill="white" font-size="18" font-weight="700" filter="url(#ir10)">HEMEN ARA</text></svg>`
            },
            {
                name: "İ1  Telefon",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="27" fill="#2a9d8f"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="13" font-weight="700">📞 0532 XXX XX XX</text> </svg>`
            },
            {
                name: "İ2  WhatsApp",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="27" fill="#25D366"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">💬 WhatsApp Yaz</text> </svg>`
            },
            {
                name: "İ3  E-posta",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#e63946"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">📧 BİLGİ AL</text> </svg>`
            },
            {
                name: "İ4  Web",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#0077b6"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">🌐 WEB SİTESİ</text> </svg>`
            },
            {
                name: "İ5  Çerçeve Ara",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="27" fill="none" stroke="#e63946" stroke-width="2"/> <text x="100" y="44" text-anchor="middle" fill="#e63946" font-size="12" font-weight="700">📞 HEMEN ARA</text> </svg>`
            },
            {
                name: "İ6  Danışman Kartı",
                svg: `<svg width="220" height="100" viewBox="0 0 220 100"> <rect x="10" y="10" width="200" height="75" rx="10" fill="#264653"/> <text x="110" y="30" text-anchor="middle" fill="#2a9d8f" font-size="7" letter-spacing="3">DANIŞMANINIZ</text> <text x="110" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">Ahmet YILMAZ</text> <text x="110" y="72" text-anchor="middle" fill="#2a9d8f" font-size="10">📞 0532 XXX XX XX</text> </svg>`
            },
            {
                name: "İ7  Instagram",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <defs><linearGradient id="i7g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#833ab4"/><stop offset="50%" stop-color="#fd1d1d"/><stop offset="100%" stop-color="#fcb045"/></linearGradient></defs> <rect x="5" y="10" width="190" height="55" rx="27" fill="url(#i7g)"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">📸 @emlakofisi</text> </svg>`
            },
            {
                name: "İ8  Facebook",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1877F2"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">👍 Facebook</text> </svg>`
            },
            {
                name: "İ9  Harita",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#264653"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">📍 HARİTADA GÖR</text> </svg>`
            },
            {
                name: "İ10  VIP İletişim",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <defs><linearGradient id="i10g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c9a227"/><stop offset="100%" stop-color="#8b6914"/></linearGradient></defs> <rect x="5" y="10" width="190" height="55" rx="8" fill="#0a0e27" stroke="url(#i10g)" stroke-width="2"/> <text x="100" y="44" text-anchor="middle" fill="url(#i10g)" font-size="12" font-weight="700">👑 VIP İLETİŞİM</text> </svg>`
            },
            {
                name: "İ11  Ofis Daveti",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#e63946"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">🏢 OFİSE GEL</text> </svg>`
            },
            {
                name: "İ12  Telegram",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="27" fill="#0088cc"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">✈️ Telegram</text> </svg>`
            },
            {
                name: "İ13  Form",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#2a9d8f"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">📋 FORM DOLDUR</text> </svg>`
            },
            {
                name: "İ14  QR Kod",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#264653"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">📱 QR KOD TARA</text> </svg>`
            },
            {
                name: "İ15  Profil Kartı",
                svg: `<svg width="240" height="100" viewBox="0 0 240 100"> <rect x="10" y="10" width="220" height="75" rx="10" fill="#264653"/> <circle cx="45" cy="47" r="22" fill="#2a9d8f"/> <text x="45" y="53" text-anchor="middle" fill="white" font-size="18">👤</text> <text x="150" y="32" text-anchor="middle" fill="white" font-size="12" font-weight="700">Ayşe Emlak</text> <text x="150" y="50" text-anchor="middle" fill="#2a9d8f" font-size="9">Gayrimenkul Danışmanı</text> <text x="150" y="68" text-anchor="middle" fill="white" font-size="9">📞 0555 XXX XX XX</text> </svg>`
            },
            {
                name: "İ16  Neon Ara",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <defs><filter id="i16glow"><feGaussianBlur stdDeviation="2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs> <rect x="5" y="10" width="190" height="55" rx="27" fill="none" stroke="#00ff88" stroke-width="2" filter="url(#i16glow)"/> <text x="100" y="44" text-anchor="middle" fill="#00ff88" font-size="12" font-weight="700" filter="url(#i16glow)">📞 BİZİ ARAYIN</text> </svg>`
            },
            {
                name: "İ17  YouTube",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#c0392b"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">▶️ YouTube Kanalımız</text> </svg>`
            },
            {
                name: "İ18  Twitter",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1DA1F2"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">🐦 Twitter/X</text> </svg>`
            },
            {
                name: "İ19  LinkedIn",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#0A66C2"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">💼 LinkedIn</text> </svg>`
            },
            {
                name: "İ20  TikTok",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#000000" stroke="white" stroke-width="1"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">🎵 TikTok</text> </svg>`
            },
        ]
    },
    "video": {
        title: "🎥 Video Var",
        items: [
            {
                name: "Play Video",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="12" fill="#0a0e27" stroke="#e63946" stroke-width="2"/><circle cx="80" cy="70" r="30" fill="#e63946"/><polygon points="72,55 72,85 95,70" fill="white"/><text x="160" y="60" text-anchor="middle" fill="#e63946" font-size="10" letter-spacing="3">VİDEO TURU</text><text x="160" y="90" text-anchor="middle" fill="white" font-size="16" font-weight="700">İZLEYİN</text></svg>`
            },
            {
                name: "YouTube",
                svg: `<svg width="220" height="140" viewBox="0 0 220 140"><rect x="10" y="10" width="200" height="120" rx="10" fill="#FF0000"/><rect x="80" y="45" width="60" height="50" rx="10" fill="white"/><polygon points="102,60 102,80 122,70" fill="#FF0000"/><text x="110" y="120" text-anchor="middle" fill="white" font-size="12" font-weight="700" letter-spacing="3">YOUTUBE</text></svg>`
            },
            {
                name: "Sanal Tur",
                svg: `<svg width="240" height="160" viewBox="0 0 240 160"><rect x="10" y="10" width="220" height="140" rx="12" fill="#1a1a2e"/><rect x="30" y="40" width="180" height="80" rx="6" fill="#000"/><polygon points="112,68 112,92 132,80" fill="white"/><text x="120" y="140" text-anchor="middle" fill="#FFD700" font-size="10" letter-spacing="3">360° SANAL TUR</text></svg>`
            },
            {
                name: "Play Yeşil",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><circle cx="110" cy="100" r="88" fill="#0a0e27" stroke="#00ff88" stroke-width="3"/><polygon points="90,75 90,125 135,100" fill="#00ff88"/><text x="110" y="160" text-anchor="middle" fill="#00ff88" font-size="11" letter-spacing="3">VİDEO İZLE</text></svg>`
            },
            {
                name: "HD Video",
                svg: `<svg width="260" height="140" viewBox="0 0 260 140"><rect x="10" y="10" width="240" height="120" rx="12" fill="white"/><rect x="30" y="30" width="80" height="80" rx="6" fill="#e63946"/><polygon points="60,55 60,85 82,70" fill="white"/><text x="180" y="55" text-anchor="middle" fill="#666" font-size="10" letter-spacing="3">EVİN İÇİ</text><text x="180" y="85" text-anchor="middle" fill="#1a1a2e" font-size="16" font-weight="700">VİDEO</text><text x="180" y="105" text-anchor="middle" fill="#e63946" font-size="9">HD KALİTE</text></svg>`
            },
            {
                name: "Drone Çekim",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><rect x="20" y="20" width="160" height="160" rx="16" fill="#8e2de2"/><rect x="45" y="55" width="110" height="70" rx="4" fill="white"/><polygon points="85,75 85,105 115,90" fill="#8e2de2"/><text x="100" y="150" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">DRONE ÇEKİMİ</text><text x="100" y="170" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">MEVCUT</text></svg>`
            },
            {
                name: "Canlı Yayın",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><polygon points="0,30 220,30 240,60 220,90 0,90" fill="#e63946"/><circle cx="45" cy="60" r="18" fill="white"/><polygon points="40,52 40,68 52,60" fill="#e63946"/><text x="140" y="55" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">CANLI YAYIN</text><text x="140" y="80" text-anchor="middle" fill="white" font-size="14" font-weight="700">RANDEVU AL</text></svg>`
            },
            {
                name: "Pin Video",
                svg: `<svg width="200" height="200" viewBox="0 0 200 200"><path d="M100 15 C60 15,30 45,30 85 C30 140,100 190,100 190 C100 190,170 140,170 85 C170 45,140 15,100 15 Z" fill="#003566"/><circle cx="100" cy="80" r="30" fill="white"/><polygon points="90,65 90,95 115,80" fill="#003566"/><text x="100" y="155" text-anchor="middle" fill="#ffc300" font-size="10" letter-spacing="3">VİDEO KONUM</text></svg>`
            },
            {
                name: "Sinema Video",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="10" fill="#1a1a2e"/><rect x="10" y="10" width="220" height="8" fill="#FF0000"/><rect x="10" y="122" width="220" height="8" fill="#FF0000"/><polygon points="105,60 105,90 130,75" fill="white"/><circle cx="117" cy="75" r="26" fill="none" stroke="white" stroke-width="2"/><text x="180" y="80" text-anchor="middle" fill="white" font-size="12" font-weight="700">İZLE</text></svg>`
            },
            {
                name: "Live Gezi",
                svg: `<svg width="240" height="160" viewBox="0 0 240 160"><rect x="10" y="10" width="220" height="140" rx="10" fill="#0a0e27"/><text x="30" y="45" fill="#e63946" font-size="14">●</text><text x="50" y="45" fill="white" font-size="10" letter-spacing="3">LIVE</text><rect x="30" y="60" width="180" height="70" rx="4" fill="#1a1a2e" stroke="#e63946" stroke-width="1"/><polygon points="112,80 112,110 138,95" fill="#e63946"/><text x="120" y="145" text-anchor="middle" fill="#e63946" font-size="10" letter-spacing="3">CANLI EV GEZİSİ</text></svg>`
            },
            {
                name: "V1  Play Button",
                svg: `<svg width="160" height="100" viewBox="0 0 160 100"> <rect x="5" y="10" width="150" height="75" rx="10" fill="#e63946"/> <polygon points="60,30 60,65 95,47" fill="white"/> <text x="125" y="52" text-anchor="middle" fill="white" font-size="9" font-weight="700">VİDEO</text> </svg>`
            },
            {
                name: "V2  Video Tur",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="27" fill="#e63946"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">▶ VİDEO TUR</text> </svg>`
            },
            {
                name: "V3  Video İzle",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#0a0e27" stroke="#e63946" stroke-width="2"/> <circle cx="45" cy="37" r="18" fill="#e63946"/> <polygon points="40,28 40,47 55,37" fill="white"/> <text x="130" y="34" text-anchor="middle" fill="white" font-size="8" letter-spacing="2">VİDEO</text> <text x="130" y="50" text-anchor="middle" fill="#e63946" font-size="12" font-weight="700">İZLE</text> </svg>`
            },
            {
                name: "V4  Büyük Play",
                svg: `<svg width="120" height="120" viewBox="0 0 120 120"> <circle cx="60" cy="60" r="50" fill="#e63946"/> <circle cx="60" cy="60" r="42" fill="none" stroke="white" stroke-width="1"/> <polygon points="50,38 50,82 82,60" fill="white"/> </svg>`
            },
            {
                name: "V5  360 Video",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#264653"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">🎥 360° VİDEO</text> </svg>`
            },
            {
                name: "V6  Drone",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#8e2de2"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">🚁 DRONE ÇEKİMİ</text> </svg>`
            },
            {
                name: "V7  Sanal Tur",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#0077b6"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">🏠 SANAL TUR</text> </svg>`
            },
            {
                name: "V8  Canlı Yayın",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="27" fill="#c0392b"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">▶ CANLI YAYIN</text> </svg>`
            },
            {
                name: "V9  Neon Play",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <defs><filter id="v9"><feGaussianBlur stdDeviation="2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs> <rect x="5" y="10" width="190" height="55" rx="8" fill="none" stroke="#e63946" stroke-width="2" filter="url(#v9)"/> <circle cx="100" cy="37" r="15" fill="none" stroke="#e63946" stroke-width="2" filter="url(#v9)"/> <polygon points="95,30 95,45 108,37" fill="#e63946" filter="url(#v9)"/> </svg>`
            },
            {
                name: "V10  Galeri",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#2a9d8f"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">📷 FOTOĞRAF GALERİ</text> </svg>`
            },
            {
                name: "V11  Pro Çekim",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#1a1a2e" stroke="#FFD700" stroke-width="1.5"/> <text x="100" y="44" text-anchor="middle" fill="#FFD700" font-size="12" font-weight="700">🎬 PROFESİYONEL ÇEKİM</text> </svg>`
            },
            {
                name: "V12  3D Model",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#264653"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">📐 3D MODEL</text> </svg>`
            },
            {
                name: "V13  Reel",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#e63946"/> <text x="100" y="30" text-anchor="middle" fill="white" font-size="8" letter-spacing="2">REEL</text> <text x="100" y="52" text-anchor="middle" fill="white" font-size="14" font-weight="700">📱 KISA VİDEO</text> </svg>`
            },
            {
                name: "V14  Detay İnceleme",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"> <rect x="5" y="10" width="190" height="55" rx="8" fill="#0077b6"/> <text x="100" y="44" text-anchor="middle" fill="white" font-size="12" font-weight="700">🔍 DETAYLI İNCELEME</text> </svg>`
            },
            {
                name: "V15  Tanıtım",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"> <rect x="10" y="10" width="180" height="75" rx="10" fill="#264653"/> <circle cx="50" cy="47" r="22" fill="#e63946"/> <polygon points="44,36 44,58 62,47" fill="white"/> <text x="130" y="38" text-anchor="middle" fill="white" font-size="10" font-weight="700">TANITIM</text> <text x="130" y="56" text-anchor="middle" fill="white" font-size="10" font-weight="700">VİDEOSU</text> <text x="130" y="72" text-anchor="middle" fill="#2a9d8f" font-size="8">3:45 dk</text> </svg>`
            },
        ]
    },
    "randevu": {
        title: "📅 Randevu Al",
        items: [
            {
                name: "Takvim Rozet",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><rect x="20" y="30" width="180" height="150" rx="8" fill="white"/><rect x="20" y="30" width="180" height="35" fill="#e63946"/><circle cx="60" cy="20" r="8" fill="#1a1a2e"/><circle cx="160" cy="20" r="8" fill="#1a1a2e"/><text x="110" y="52" text-anchor="middle" fill="white" font-size="10" letter-spacing="4">RANDEVU</text><text x="110" y="120" text-anchor="middle" fill="#1a1a2e" font-size="42" font-weight="700">15</text><text x="110" y="150" text-anchor="middle" fill="#666" font-size="10">TEMMUZ · SALI</text></svg>`
            },
            {
                name: "Ücretsiz Randevu",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="60" fill="#003566"/><text x="150" y="60" text-anchor="middle" fill="#ffc300" font-size="9" letter-spacing="3">ÜCRETSİZ</text><text x="150" y="85" text-anchor="middle" fill="white" font-size="14" font-weight="700">RANDEVU AL</text></svg>`
            },
            {
                name: "Kısa Randevu",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="12" fill="#2a9d8f"/><circle cx="60" cy="70" r="26" fill="white"/><path d="M60 55 L60 70 L70 75" stroke="#2a9d8f" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="60" cy="70" r="20" fill="none" stroke="#2a9d8f" stroke-width="2"/><text x="150" y="60" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">30 DAKİKA</text><text x="150" y="90" text-anchor="middle" fill="white" font-size="14" font-weight="700">GEZ TANIŞ</text></svg>`
            },
            {
                name: "Altıgen Randevu",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><polygon points="110,20 175,50 175,110 110,180 45,110 45,50" fill="#e9c46a"/><text x="110" y="80" text-anchor="middle" fill="#1a1a2e" font-size="10" letter-spacing="3">HEMEN</text><text x="110" y="115" text-anchor="middle" fill="#1a1a2e" font-size="18" font-weight="700">RANDEVU</text><text x="110" y="140" text-anchor="middle" fill="#1a1a2e" font-size="10" letter-spacing="3">AL</text></svg>`
            },
            {
                name: "Neon Randevu",
                svg: `<svg width="260" height="120" viewBox="0 0 260 120"><defs><filter id="r5f"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect x="10" y="20" width="240" height="80" rx="40" fill="#0a0e27" stroke="#00d4ff" stroke-width="2" filter="url(#r5f)"/><text x="130" y="55" text-anchor="middle" fill="#00d4ff" font-size="10" letter-spacing="3" filter="url(#r5f)">ONLİNE RANDEVU</text><text x="130" y="80" text-anchor="middle" fill="white" font-size="16" font-weight="700" filter="url(#r5f)">1 DKDA AL</text></svg>`
            },
            {
                name: "Müsait Günler",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><rect x="20" y="30" width="180" height="150" rx="10" fill="#8e2de2"/><rect x="20" y="30" width="180" height="35" fill="#5a189a"/><text x="110" y="52" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">MÜSAİT GÜNLER</text><text x="45" y="90" text-anchor="middle" fill="white" font-size="9">PZT</text><text x="80" y="90" text-anchor="middle" fill="white" font-size="9">SAL</text><text x="115" y="90" text-anchor="middle" fill="white" font-size="9">ÇAR</text><text x="150" y="90" text-anchor="middle" fill="white" font-size="9">PER</text><text x="185" y="90" text-anchor="middle" fill="white" font-size="9">CUM</text><circle cx="80" cy="120" r="12" fill="#FFD700"/><circle cx="115" cy="120" r="12" fill="#FFD700"/><text x="110" y="165" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">HEMEN SEÇ</text></svg>`
            },
            {
                name: "VIP Randevu",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><polygon points="0,25 220,25 240,60 220,95 0,95 20,60" fill="#FFD700"/><text x="120" y="55" text-anchor="middle" fill="#0a0e27" font-size="9" letter-spacing="4">VIP RANDEVU</text><text x="120" y="80" text-anchor="middle" fill="#0a0e27" font-size="14" font-weight="700">ÖZEL DAVETLİ</text></svg>`
            },
            {
                name: "Yuvarlak Randevu",
                svg: `<svg width="220" height="200" viewBox="0 0 220 200"><circle cx="110" cy="100" r="88" fill="#e63946"/><text x="110" y="130" text-anchor="middle" fill="white" font-size="10" letter-spacing="3">RANDEVU</text><text x="110" y="150" text-anchor="middle" fill="white" font-size="12" font-weight="700">ŞİMDİ AL</text></svg>`
            },
            {
                name: "Saat Randevu",
                svg: `<svg width="240" height="140" viewBox="0 0 240 140"><rect x="10" y="10" width="220" height="120" rx="10" fill="white"/><rect x="10" y="10" width="220" height="30" fill="#1a1a2e"/><text x="120" y="30" text-anchor="middle" fill="#FFD700" font-size="10" letter-spacing="3">AJANDA</text><text x="120" y="70" text-anchor="middle" fill="#1a1a2e" font-size="10" letter-spacing="3">MÜSAİT SAAT</text><text x="120" y="105" text-anchor="middle" fill="#e63946" font-size="20" font-weight="700">14:30</text></svg>`
            },
            {
                name: "Saha Randevu",
                svg: `<svg width="260" height="120" viewBox="0 0 260 120"><polygon points="0,25 240,25 260,60 240,95 0,95 20,60" fill="#2a9d8f"/><polygon points="0,25 20,60 0,95 15,60" fill="#e9c46a"/><text x="140" y="55" text-anchor="middle" fill="white" font-size="9" letter-spacing="3">SAHA GEZİSİ</text><text x="140" y="80" text-anchor="middle" fill="white" font-size="14" font-weight="700">YERİNDE İNCELEME</text></svg>`
            },
        ]
    },
    "oklar": {
        title: "🎯 Sadece Oklar",
        items: [
            {
                name: "Klasik Sağ",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"><path d="M10 40 L160 40 L160 20 L195 40 L160 60 L160 40" fill="#e63946"/></svg>`
            },
            {
                name: "İnce Neon",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"><path d="M10 40 L180 40" stroke="#00d4ff" stroke-width="4"/><polygon points="195,40 175,28 175,52" fill="#00d4ff"/></svg>`
            },
            {
                name: "Kavisli Altın",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><path d="M20 80 Q100 20 180 60" fill="none" stroke="#FFD700" stroke-width="4" stroke-linecap="round"/><polygon points="180,60 165,52 172,72" fill="#FFD700"/></svg>`
            },
            {
                name: "Zigzag Pembe",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><path d="M20 50 L60 30 L100 50 L140 30 L180 50" fill="none" stroke="#ff006e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><polygon points="180,50 165,42 168,60" fill="#ff006e"/></svg>`
            },
            {
                name: "Yay Mor",
                svg: `<svg width="200" height="120" viewBox="0 0 200 120"><path d="M20 60 C60 20,140 20,180 60" fill="none" stroke="#8e2de2" stroke-width="4"/><polygon points="180,60 165,52 168,70" fill="#8e2de2"/></svg>`
            },
            {
                name: "Kesik Yeşil",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"><path d="M10 40 L170 40" stroke="#00ff88" stroke-width="6" stroke-dasharray="10 5"/><polygon points="195,40 170,25 170,55" fill="#00ff88"/></svg>`
            },
            {
                name: "S Kıvrım",
                svg: `<svg width="200" height="120" viewBox="0 0 200 120"><path d="M20 100 Q60 20 100 60 T180 40" fill="none" stroke="#e63946" stroke-width="4" stroke-linecap="round"/><polygon points="180,40 168,32 172,52" fill="#e63946"/></svg>`
            },
            {
                name: "L Şeklinde",
                svg: `<svg width="180" height="180" viewBox="0 0 180 180"><path d="M40 40 L140 40 L140 20 L170 50 L140 80 L140 60 L60 60 L60 140 L80 140 L50 170 L20 140 L40 140 Z" fill="#FFD700"/></svg>`
            },
            {
                name: "Neon Glow",
                svg: `<svg width="200" height="120" viewBox="0 0 200 120"><defs><filter id="a9x"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M20 60 L170 60" stroke="#00ff88" stroke-width="4" filter="url(#a9x)"/><polygon points="195,60 168,45 168,75" fill="#00ff88" filter="url(#a9x)"/></svg>`
            },
            {
                name: "Dalga Altın",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><path d="M15 50 Q30 20 60 45 Q90 65 130 40 Q160 20 185 50" fill="none" stroke="#c9a227" stroke-width="3"/><polygon points="185,50 172,42 172,60" fill="#c9a227"/></svg>`
            },
            {
                name: "Aşağı Sabit",
                svg: `<svg width="120" height="180" viewBox="0 0 120 180"><path d="M60 20 L60 130 L30 130 L60 170 L90 130 L60 130" fill="#e63946"/></svg>`
            },
            {
                name: "Yukarı Sabit",
                svg: `<svg width="120" height="180" viewBox="0 0 120 180"><path d="M60 170 L60 60 L30 60 L60 20 L90 60 L60 60" fill="#00d4ff"/></svg>`
            },
            {
                name: "Çapraz Ok",
                svg: `<svg width="180" height="180" viewBox="0 0 180 180"><path d="M20 20 L120 20 L120 40 L160 40 L100 100 L40 40 L80 40 L80 20 Z" fill="#8e2de2" transform="rotate(45 90 90)"/></svg>`
            },
            {
                name: "Çift Çizgi",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"><path d="M10 40 L190 40" stroke="#FFD700" stroke-width="2"/><path d="M10 46 L190 46" stroke="#FFD700" stroke-width="1" opacity="0.6"/><polygon points="195,43 175,32 175,54" fill="#FFD700"/></svg>`
            },
            {
                name: "Fırça Vuruşu",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><path d="M15 50 Q80 10 150 50" fill="none" stroke="#ff006e" stroke-width="10" stroke-linecap="round" opacity="0.9"/><path d="M15 55 Q80 15 155 55" fill="none" stroke="#ff006e" stroke-width="3"/><polygon points="175,50 155,42 160,65 145,60" fill="#ff006e"/></svg>`
            },
            {
                name: "İçi Boş",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"><path d="M10 40 L140 40 L140 15 L190 40 L140 65 L140 40" fill="none" stroke="#00ff88" stroke-width="3"/></svg>`
            },
            {
                name: "Nokta İz",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><circle cx="30" cy="50" r="4" fill="#00d4ff"/><circle cx="55" cy="45" r="5" fill="#00d4ff"/><circle cx="85" cy="45" r="6" fill="#00d4ff"/><circle cx="120" cy="50" r="7" fill="#00d4ff"/><circle cx="155" cy="55" r="8" fill="#00d4ff"/><polygon points="190,55 165,40 165,70" fill="#00d4ff"/></svg>`
            },
            {
                name: "3D Perspektif",
                svg: `<svg width="220" height="100" viewBox="0 0 220 100"><path d="M10 50 L180 50 L180 25 L210 50 L180 75 L180 50" fill="#003566"/><path d="M180 75 L180 85 L200 65 L180 45" fill="#001d3d" opacity="0.6"/></svg>`
            },
            {
                name: "Noktalı Kavis",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><path d="M20 50 Q100 20 180 50" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 8"/><polygon points="180,50 165,42 168,60" fill="white"/></svg>`
            },
            {
                name: "Gradient Kavis",
                svg: `<svg width="200" height="120" viewBox="0 0 200 120"><defs><linearGradient id="a20gx" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#ff006e"/><stop offset="100%" stop-color="#ffbe0b"/></linearGradient></defs><path d="M15 60 Q100 15 180 60" fill="none" stroke="url(#a20gx)" stroke-width="6" stroke-linecap="round"/><polygon points="180,60 162,48 168,72" fill="#ffbe0b"/></svg>`
            },
            {
                name: "Dönen Ok",
                svg: `<svg width="180" height="180" viewBox="0 0 180 180"><circle cx="90" cy="90" r="70" fill="none" stroke="#e9c46a" stroke-width="3" stroke-dasharray="200 300" transform="rotate(-90 90 90)"/><polygon points="90,10 80,30 100,30" fill="#e9c46a" transform="rotate(90 90 90)"/></svg>`
            },
            {
                name: "Kalın Blok",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><path d="M10 60 L60 30 L60 45 L160 45 L160 15 L190 50 L160 85 L160 55 L60 55 L60 70 Z" fill="#2a9d8f"/></svg>`
            },
            {
                name: "Karışık Çizgi",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"><path d="M10 40 L170 40" stroke="#e63946" stroke-width="1"/><path d="M10 40 L170 40" stroke="#e63946" stroke-width="3" stroke-dasharray="5 5"/><polygon points="195,40 170,25 170,55" fill="#e63946"/></svg>`
            },
            {
                name: "Çoklu Yukarı",
                svg: `<svg width="180" height="180" viewBox="0 0 180 180"><path d="M90 20 L90 100 M40 60 L90 20 L140 60 M40 120 L140 120 M90 100 L90 140" stroke="#FFD700" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`
            },
            {
                name: "Segmentli",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><path d="M20 50 L60 50 M80 50 L120 50 M140 50 L170 50" stroke="#00ff88" stroke-width="5" stroke-linecap="round"/><polygon points="190,50 168,38 168,62" fill="#00ff88"/></svg>`
            },
            {
                name: "Refresh Dönüş",
                svg: `<svg width="180" height="180" viewBox="0 0 180 180"><path d="M90 40 A50 50 0 1 1 40 90" fill="none" stroke="#00d4ff" stroke-width="5" stroke-linecap="round"/><polygon points="40,90 30,70 55,75" fill="#00d4ff"/></svg>`
            },
            {
                name: "L Dönüşü",
                svg: `<svg width="200" height="140" viewBox="0 0 200 140"><path d="M20 100 Q20 40 90 40 L150 40" fill="none" stroke="#e63946" stroke-width="5" stroke-linecap="round"/><polygon points="150,40 130,30 130,50" fill="#e63946"/></svg>`
            },
            {
                name: "Çift Yön Blok",
                svg: `<svg width="180" height="180" viewBox="0 0 180 180"><path d="M40 55 L140 55 L140 35 L170 60 L140 85 L140 65 L40 65 Z" fill="#FFD700"/><path d="M140 100 L40 100 L40 80 L10 105 L40 130 L40 110 L140 110 Z" fill="#FFD700"/></svg>`
            },
            {
                name: "Sinüs Dalga",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><path d="M15 50 Q40 30 70 50 Q100 70 130 50 Q160 30 185 50" fill="none" stroke="#ff006e" stroke-width="4"/><polygon points="185,50 170,42 172,60" fill="#ff006e"/></svg>`
            },
            {
                name: "Kalın Basit",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><path d="M20 50 L170 50" stroke="#8e2de2" stroke-width="6" stroke-linecap="round"/><polygon points="195,50 170,30 170,70" fill="#8e2de2"/></svg>`
            },
            {
                name: "İnce Minimal",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><path d="M10 50 L170 50" stroke="white" stroke-width="1"/><polygon points="195,50 175,40 175,60" fill="none" stroke="white" stroke-width="2"/></svg>`
            },
            {
                name: "Ok + Yazı",
                svg: `<svg width="220" height="100" viewBox="0 0 220 100"><path d="M15 50 Q30 20 60 45 Q90 65 130 40 Q160 20 195 50" fill="none" stroke="#c9a227" stroke-width="4" stroke-linecap="round"/><polygon points="195,50 180,42 182,62" fill="#c9a227"/><text x="105" y="90" text-anchor="middle" fill="#c9a227" font-size="9" letter-spacing="3">BURADAN</text></svg>`
            },
            {
                name: "Neon Pembe Glow",
                svg: `<svg width="200" height="120" viewBox="0 0 200 120"><defs><filter id="a33x"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M20 60 L170 60" stroke="#ff006e" stroke-width="4" filter="url(#a33x)"/><polygon points="195,60 170,45 170,75" fill="#ff006e" filter="url(#a33x)"/></svg>`
            },
            {
                name: "Aşağı Basit",
                svg: `<svg width="180" height="180" viewBox="0 0 180 180"><path d="M90 30 L90 130 M50 100 L90 140 L130 100" fill="none" stroke="#e9c46a" stroke-width="5" stroke-linecap="round"/></svg>`
            },
            {
                name: "Yukarı Basit",
                svg: `<svg width="180" height="180" viewBox="0 0 180 180"><path d="M90 150 L90 50 M50 80 L90 40 L130 80" fill="none" stroke="#00ff88" stroke-width="5" stroke-linecap="round"/></svg>`
            },
            {
                name: "Elmas Kesim",
                svg: `<svg width="200" height="140" viewBox="0 0 200 140"><path d="M20 70 L100 20 L180 70 L100 120 Z" fill="none" stroke="#FFD700" stroke-width="3" stroke-dasharray="5 3"/><polygon points="180,70 165,60 165,80" fill="#FFD700"/></svg>`
            },
            {
                name: "Kalp Ritmi",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><path d="M10 50 L60 50 L80 30 L100 50 L120 30 L140 50 L190 50" stroke="#00d4ff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polygon points="190,50 175,42 175,58" fill="#00d4ff"/></svg>`
            },
            {
                name: "İnce Kesik",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"><path d="M10 40 L170 40" stroke="#e63946" stroke-width="4" stroke-dasharray="2 4"/><polygon points="190,40 172,30 172,50" fill="#e63946"/></svg>`
            },
            {
                name: "Zirve Dağ",
                svg: `<svg width="200" height="120" viewBox="0 0 200 120"><path d="M20 90 L100 30 L180 90" stroke="#8e2de2" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polygon points="180,90 170,75 195,80" fill="#8e2de2"/></svg>`
            },
            {
                name: "Yaldızlı",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><defs><linearGradient id="a40gx" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient></defs><path d="M15 50 L170 50" stroke="url(#a40gx)" stroke-width="5" stroke-linecap="round"/><polygon points="190,50 168,35 172,65" fill="url(#a40gx)"/></svg>`
            },
            {
                name: "Kontürlü Beyaz",
                svg: `<svg width="220" height="80" viewBox="0 0 220 80"><path d="M10 40 L190 40 L190 20 L215 40 L190 60 L190 40" fill="white" stroke="#e63946" stroke-width="2"/></svg>`
            },
            {
                name: "U Dönüşü",
                svg: `<svg width="180" height="180" viewBox="0 0 180 180"><path d="M50 90 A40 40 0 1 1 130 90" fill="none" stroke="#00d4ff" stroke-width="5" stroke-linecap="round"/><polygon points="130,90 115,80 115,105" fill="#00d4ff"/></svg>`
            },
            {
                name: "Karşılıklı",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><path d="M20 30 L60 50 L20 70 M170 30 L130 50 L170 70" stroke="#e9c46a" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="60" y1="50" x2="130" y2="50" stroke="#e9c46a" stroke-width="4"/></svg>`
            },
            {
                name: "Yumuşak Kavis",
                svg: `<svg width="200" height="140" viewBox="0 0 200 140"><path d="M20 100 C40 40,120 40,140 90 L180 90" fill="none" stroke="#ff006e" stroke-width="4" stroke-linecap="round"/><polygon points="180,90 165,82 168,100" fill="#ff006e"/></svg>`
            },
            {
                name: "Uzayan Segment",
                svg: `<svg width="200" height="80" viewBox="0 0 200 80"><line x1="10" y1="40" x2="30" y2="40" stroke="#00ff88" stroke-width="5"/><line x1="45" y1="40" x2="75" y2="40" stroke="#00ff88" stroke-width="5"/><line x1="90" y1="40" x2="130" y2="40" stroke="#00ff88" stroke-width="5"/><line x1="145" y1="40" x2="170" y2="40" stroke="#00ff88" stroke-width="5"/><polygon points="192,40 172,30 172,50" fill="#00ff88"/></svg>`
            },
            {
                name: "Üç Çizgi",
                svg: `<svg width="220" height="100" viewBox="0 0 220 100"><path d="M15 50 L175 50" stroke="#c9a227" stroke-width="1"/><path d="M15 46 L175 46" stroke="#c9a227" stroke-width="0.5"/><path d="M15 54 L175 54" stroke="#c9a227" stroke-width="0.5"/><polygon points="200,50 175,35 175,65" fill="#c9a227"/></svg>`
            },
            {
                name: "Noktalı Başlangıç",
                svg: `<svg width="200" height="120" viewBox="0 0 200 120"><path d="M20 60 L170 60" stroke="#e63946" stroke-width="6" stroke-linecap="round"/><polygon points="180,60 155,42 155,78" fill="#e63946"/><circle cx="20" cy="60" r="6" fill="#e63946"/></svg>`
            },
            {
                name: "Sol Alt Çapraz",
                svg: `<svg width="180" height="180" viewBox="0 0 180 180"><path d="M20 20 L120 20 L120 40 L160 40 L100 100 L40 40 L80 40 L80 20 Z" fill="#8e2de2" transform="rotate(135 90 90)"/></svg>`
            },
            {
                name: "Yılan Ok",
                svg: `<svg width="200" height="100" viewBox="0 0 200 100"><path d="M10 50 Q60 50 90 30 T170 50" fill="none" stroke="#FFD700" stroke-width="6" stroke-linecap="round"/><polygon points="190,50 168,38 172,62" fill="#FFD700"/></svg>`
            },
            {
                name: "Ultra Yaldızlı",
                svg: `<svg width="220" height="120" viewBox="0 0 220 120"><defs><linearGradient id="a50gx" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#000"/><stop offset="50%" stop-color="#FFD700"/><stop offset="100%" stop-color="#000"/></linearGradient></defs><path d="M10 55 L180 55 L180 30 L215 60 L180 90 L180 65 L10 65 Z" fill="url(#a50gx)"/><text x="90" y="70" text-anchor="middle" fill="white" font-size="12" font-weight="700" letter-spacing="3">PREMIUM</text></svg>`
            },
        ]
    }
});

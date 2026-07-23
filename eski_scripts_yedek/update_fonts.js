const fs = require('fs');

const NEW_FONTS = [
    // 1. Kurumsal (10)
    {name:'📌 Open Sans', family:"'Open Sans', sans-serif", cat:'🏢 1. Kurumsal'},
    {name:'📌 Lato', family:"'Lato', sans-serif", cat:'🏢 1. Kurumsal'},
    {name:'📌 Source Sans Pro', family:"'Source Sans 3', sans-serif", cat:'🏢 1. Kurumsal'},
    {name:'📌 PT Sans', family:"'PT Sans', sans-serif", cat:'🏢 1. Kurumsal'},
    {name:'📌 Fira Sans', family:"'Fira Sans', sans-serif", cat:'🏢 1. Kurumsal'},
    {name:'📌 Ubuntu', family:"'Ubuntu', sans-serif", cat:'🏢 1. Kurumsal'},
    {name:'📌 Mukta', family:"'Mukta', sans-serif", cat:'🏢 1. Kurumsal'},
    {name:'📌 Asap', family:"'Asap', sans-serif", cat:'🏢 1. Kurumsal'},
    {name:'📌 Hind', family:"'Hind', sans-serif", cat:'🏢 1. Kurumsal'},
    {name:'📌 Heebo', family:"'Heebo', sans-serif", cat:'🏢 1. Kurumsal'},

    // 2. Modern (10)
    {name:'✨ Montserrat', family:"'Montserrat', sans-serif", cat:'🚀 2. Modern'},
    {name:'✨ Poppins', family:"'Poppins', sans-serif", cat:'🚀 2. Modern'},
    {name:'✨ Raleway', family:"'Raleway', sans-serif", cat:'🚀 2. Modern'},
    {name:'✨ Inter', family:"'Inter', sans-serif", cat:'🚀 2. Modern'},
    {name:'✨ Nunito', family:"'Nunito', sans-serif", cat:'🚀 2. Modern'},
    {name:'✨ Roboto', family:"'Roboto', sans-serif", cat:'🚀 2. Modern'},
    {name:'✨ Josefin Sans', family:"'Josefin Sans', sans-serif", cat:'🚀 2. Modern'},
    {name:'✨ Quicksand', family:"'Quicksand', sans-serif", cat:'🚀 2. Modern'},
    {name:'✨ Rubik', family:"'Rubik', sans-serif", cat:'🚀 2. Modern'},
    {name:'✨ Jost', family:"'Jost', sans-serif", cat:'🚀 2. Modern'},

    // 3. Minimal (10)
    {name:'➖ Lexend', family:"'Lexend', sans-serif", cat:'🍃 3. Minimal'},
    {name:'➖ Manrope', family:"'Manrope', sans-serif", cat:'🍃 3. Minimal'},
    {name:'➖ Questrial', family:"'Questrial', sans-serif", cat:'🍃 3. Minimal'},
    {name:'➖ Space Grotesk', family:"'Space Grotesk', sans-serif", cat:'🍃 3. Minimal'},
    {name:'➖ Syne', family:"'Syne', sans-serif", cat:'🍃 3. Minimal'},
    {name:'➖ Alata', family:"'Alata', sans-serif", cat:'🍃 3. Minimal'},
    {name:'➖ Epilogue', family:"'Epilogue', sans-serif", cat:'🍃 3. Minimal'},
    {name:'➖ DM Sans', family:"'DM Sans', sans-serif", cat:'🍃 3. Minimal'},
    {name:'➖ Outfit', family:"'Outfit', sans-serif", cat:'🍃 3. Minimal'},
    {name:'➖ Plus Jakarta Sans', family:"'Plus Jakarta Sans', sans-serif", cat:'🍃 3. Minimal'},

    // 4. Premium / Luks (10)
    {name:'💎 Playfair Display', family:"'Playfair Display', serif", cat:'💎 4. Premium / Lüks'},
    {name:'💎 Cormorant Garamond', family:"'Cormorant Garamond', serif", cat:'💎 4. Premium / Lüks'},
    {name:'💎 Cinzel', family:"'Cinzel', serif", cat:'💎 4. Premium / Lüks'},
    {name:'💎 Prata', family:"'Prata', serif", cat:'💎 4. Premium / Lüks'},
    {name:'💎 Lora', family:"'Lora', serif", cat:'💎 4. Premium / Lüks'},
    {name:'💎 Merriweather', family:"'Merriweather', serif", cat:'💎 4. Premium / Lüks'},
    {name:'💎 EB Garamond', family:"'EB Garamond', serif", cat:'💎 4. Premium / Lüks'},
    {name:'💎 Bodoni Moda', family:"'Bodoni Moda', serif", cat:'💎 4. Premium / Lüks'},
    {name:'💎 Marcellus', family:"'Marcellus', serif", cat:'💎 4. Premium / Lüks'},
    {name:'💎 Gilda Display', family:"'Gilda Display', serif", cat:'💎 4. Premium / Lüks'},

    // 5. Emlak Basliklari (10)
    {name:'🏠 Oswald', family:"'Oswald', sans-serif", cat:'🏠 5. Emlak Başlıkları'},
    {name:'🏠 Bebas Neue', family:"'Bebas Neue', sans-serif", cat:'🏠 5. Emlak Başlıkları'},
    {name:'🏠 Archivo Black', family:"'Archivo Black', sans-serif", cat:'🏠 5. Emlak Başlıkları'},
    {name:'🏠 Anton', family:"'Anton', sans-serif", cat:'🏠 5. Emlak Başlıkları'},
    {name:'🏠 Karantina', family:"'Karantina', cursive", cat:'🏠 5. Emlak Başlıkları'},
    {name:'🏠 Fjalla One', family:"'Fjalla One', sans-serif", cat:'🏠 5. Emlak Başlıkları'},
    {name:'🏠 Teko', family:"'Teko', sans-serif", cat:'🏠 5. Emlak Başlıkları'},
    {name:'🏠 Six Caps', family:"'Six Caps', sans-serif", cat:'🏠 5. Emlak Başlıkları'},
    {name:'🏠 Francois One', family:"'Francois One', sans-serif", cat:'🏠 5. Emlak Başlıkları'},
    {name:'🏠 Staatliches', family:"'Staatliches', cursive", cat:'🏠 5. Emlak Başlıkları'},

    // 6. Sosyal Medya (10)
    {name:'📱 Caveat', family:"'Caveat', cursive", cat:'📱 6. Sosyal Medya'},
    {name:'📱 Amatic SC', family:"'Amatic SC', cursive", cat:'📱 6. Sosyal Medya'},
    {name:'📱 Shrikhand', family:"'Shrikhand', cursive", cat:'📱 6. Sosyal Medya'},
    {name:'📱 Permanent Marker', family:"'Permanent Marker', cursive", cat:'📱 6. Sosyal Medya'},
    {name:'📱 Patrick Hand', family:"'Patrick Hand', cursive", cat:'📱 6. Sosyal Medya'},
    {name:'📱 Just Another Hand', family:"'Just Another Hand', cursive", cat:'📱 6. Sosyal Medya'},
    {name:'📱 Shadows Into Light', family:"'Shadows Into Light', cursive", cat:'📱 6. Sosyal Medya'},
    {name:'📱 Knewave', family:"'Knewave', cursive", cat:'📱 6. Sosyal Medya'},
    {name:'📱 Indie Flower', family:"'Indie Flower', cursive", cat:'📱 6. Sosyal Medya'},
    {name:'📱 Kalam', family:"'Kalam', cursive", cat:'📱 6. Sosyal Medya'},

    // 7. Kalin Basliklar (10)
    {name:'💥 Alfa Slab One', family:"'Alfa Slab One', cursive", cat:'💥 7. Kalın Başlıklar'},
    {name:'💥 Lilita One', family:"'Lilita One', cursive", cat:'💥 7. Kalın Başlıklar'},
    {name:'💥 Righteous', family:"'Righteous', cursive", cat:'💥 7. Kalın Başlıklar'},
    {name:'💥 Black Ops One', family:"'Black Ops One', cursive", cat:'💥 7. Kalın Başlıklar'},
    {name:'💥 Bungee', family:"'Bungee', cursive", cat:'💥 7. Kalın Başlıklar'},
    {name:'💥 Titan One', family:"'Titan One', cursive", cat:'💥 7. Kalın Başlıklar'},
    {name:'💥 Paytone One', family:"'Paytone One', sans-serif", cat:'💥 7. Kalın Başlıklar'},
    {name:'💥 Carter One', family:"'Carter One', cursive", cat:'💥 7. Kalın Başlıklar'},
    {name:'💥 Fredoka One', family:"'Fredoka One', cursive", cat:'💥 7. Kalın Başlıklar'},
    {name:'💥 Changa One', family:"'Changa One', cursive", cat:'💥 7. Kalın Başlıklar'},

    // 8. Zarif / Elegant (10)
    {name:'🌸 Italiana', family:"'Italiana', serif", cat:'🌸 8. Zarif / Elegant'},
    {name:'🌸 Yeseva One', family:"'Yeseva One', serif", cat:'🌸 8. Zarif / Elegant'},
    {name:'🌸 Libre Baskerville', family:"'Libre Baskerville', serif", cat:'🌸 8. Zarif / Elegant'},
    {name:'🌸 Cinzel Decorative', family:"'Cinzel Decorative', serif", cat:'🌸 8. Zarif / Elegant'},
    {name:'🌸 Alice', family:"'Alice', serif", cat:'🌸 8. Zarif / Elegant'},
    {name:'🌸 Forum', family:"'Forum', cursive", cat:'🌸 8. Zarif / Elegant'},
    {name:'🌸 Niconne', family:"'Niconne', cursive", cat:'🌸 8. Zarif / Elegant'},
    {name:'🌸 Antic Didone', family:"'Antic Didone', serif", cat:'🌸 8. Zarif / Elegant'},
    {name:'🌸 Varela Round', family:"'Varela Round', sans-serif", cat:'🌸 8. Zarif / Elegant'},
    {name:'🌸 Parisienne', family:"'Parisienne', cursive", cat:'🌸 8. Zarif / Elegant'},

    // 9. El Yazisi (Okunabilir) (10)
    {name:'✍️ Dancing Script', family:"'Dancing Script', cursive", cat:'✍️ 9. El Yazısı'},
    {name:'✍️ Pacifico', family:"'Pacifico', cursive", cat:'✍️ 9. El Yazısı'},
    {name:'✍️ Satisfy', family:"'Satisfy', cursive", cat:'✍️ 9. El Yazısı'},
    {name:'✍️ Cookie', family:"'Cookie', cursive", cat:'✍️ 9. El Yazısı'},
    {name:'✍️ Kaushan Script', family:"'Kaushan Script', cursive", cat:'✍️ 9. El Yazısı'},
    {name:'✍️ Great Vibes', family:"'Great Vibes', cursive", cat:'✍️ 9. El Yazısı'},
    {name:'✍️ Yellowtail', family:"'Yellowtail', cursive", cat:'✍️ 9. El Yazısı'},
    {name:'✍️ Marck Script', family:"'Marck Script', cursive", cat:'✍️ 9. El Yazısı'},
    {name:'✍️ Gochi Hand', family:"'Gochi Hand', cursive", cat:'✍️ 9. El Yazısı'},
    {name:'✍️ Homemade Apple', family:"'Homemade Apple', cursive", cat:'✍️ 9. El Yazısı'},

    // 10. Turkce Dostu Genel Kullanim (10)
    {name:'🇹🇷 Kanit', family:"'Kanit', sans-serif", cat:'🇹🇷 10. Türkçe Dostu'},
    {name:'🇹🇷 Barlow', family:"'Barlow', sans-serif", cat:'🇹🇷 10. Türkçe Dostu'},
    {name:'🇹🇷 Mulish', family:"'Mulish', sans-serif", cat:'🇹🇷 10. Türkçe Dostu'},
    {name:'🇹🇷 Nunito Sans', family:"'Nunito Sans', sans-serif", cat:'🇹🇷 10. Türkçe Dostu'},
    {name:'🇹🇷 Work Sans', family:"'Work Sans', sans-serif", cat:'🇹🇷 10. Türkçe Dostu'},
    {name:'🇹🇷 Cabin', family:"'Cabin', sans-serif", cat:'🇹🇷 10. Türkçe Dostu'},
    {name:'🇹🇷 Zilla Slab', family:"'Zilla Slab', serif", cat:'🇹🇷 10. Türkçe Dostu'},
    {name:'🇹🇷 Inconsolata', family:"'Inconsolata', monospace", cat:'🇹🇷 10. Türkçe Dostu'},
    {name:'🇹🇷 Dosis', family:"'Dosis', sans-serif", cat:'🇹🇷 10. Türkçe Dostu'},
    {name:'🇹🇷 Signika', family:"'Signika', sans-serif", cat:'🇹🇷 10. Türkçe Dostu'},
];

// Rebuild Google Fonts URL
// Format: family=Font+Name:wght@400;700&family=Another+Font...
const uniqueFamilies = [...new Set(NEW_FONTS.map(f => {
    let raw = f.family.split(',')[0].replace(/'/g, '').trim();
    return raw;
}))];

let urlParams = [];
uniqueFamilies.forEach(f => {
    let encoded = f.replace(/ /g, '+');
    urlParams.push(`family=${encoded}:wght@300;400;500;600;700;800;900`);
});

const gFontsUrl = `https://fonts.googleapis.com/css2?${urlParams.join('&')}&display=swap`;

// 1. Update config.js
let config = fs.readFileSync('config.js', 'utf8');
let fontsArrayStr = "const FONTS=[\n" + NEW_FONTS.map(f => `    {name:'${f.name}',family:"${f.family}",cat:'${f.cat}'}`).join(",\n") + "\n];";
config = config.replace(/const FONTS=\[[\s\S]*?\];/, fontsArrayStr);
fs.writeFileSync('config.js', config);
console.log("Updated config.js");

// 2. Update app.html Google Fonts link
let html = fs.readFileSync('app.html', 'utf8');
html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=[^"]+" rel="stylesheet">/, `<link href="${gFontsUrl}" rel="stylesheet">`);
fs.writeFileSync('app.html', html);
console.log("Updated app.html");

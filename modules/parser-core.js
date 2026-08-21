/**
 * ============================================================================
 * SMART PARSER PRO 2.0 - EMLAK İLAN AYRIŞTIRICI
 * modules/parser-core.js
 * ============================================================================
 * Sahibinden.com, Hepsiemlak, Emlakjet, Zingat ve WhatsApp formatındaki
 * ilan metinlerini derinlemesine analiz edip tüm form alanlarına, standart
 * şablon kutularına ve Canva şablonlarına aktarır.
 */

(function(window) {
    'use strict';

    // 1. Türkçe Yazıyla Yazılmış Sayıları Rakamlara Çevirici
    const TURKISH_NUMS = {
        'sıfır': 0, 'bir': 1, 'iki': 2, 'üç': 3, 'dört': 4, 'beş': 5,
        'altı': 6, 'yedi': 7, 'sekiz': 8, 'dokuz': 9, 'on': 10,
        'yirmi': 20, 'otuz': 30, 'kırk': 40, 'elli': 50, 'altmış': 60,
        'yetmiş': 70, 'seksen': 80, 'doksan': 90, 'yüz': 100, 'bin': 1000,
        'milyon': 1000000, 'milyar': 1000000000
    };

    function convertWrittenNumbers(text) {
        if (!text) return '';
        const words = text.split(/\s+/);
        let result = [];
        let i = 0;

        while (i < words.length) {
            let cleanWord = words[i].toLowerCase().replace(/[^a-zçğıöşü]/g, '');
            if (TURKISH_NUMS[cleanWord] !== undefined) {
                let currentVal = 0;
                let totalVal = 0;
                let isNumSeq = false;

                while (i < words.length) {
                    let w = words[i].toLowerCase().replace(/[^a-zçğıöşü]/g, '');
                    let num = TURKISH_NUMS[w];
                    if (num === undefined) break;

                    isNumSeq = true;
                    if (num === 100) {
                        currentVal = currentVal === 0 ? 100 : currentVal * 100;
                    } else if (num === 1000) {
                        currentVal = currentVal === 0 ? 1000 : currentVal * 1000;
                        totalVal += currentVal;
                        currentVal = 0;
                    } else if (num === 1000000) {
                        currentVal = currentVal === 0 ? 1000000 : currentVal * 1000000;
                        totalVal += currentVal;
                        currentVal = 0;
                    } else {
                        currentVal += num;
                    }
                    i++;
                }

                if (isNumSeq) {
                    totalVal += currentVal;
                    result.push(totalVal.toString());
                    continue;
                }
            }
            result.push(words[i]);
            i++;
        }
        return result.join(' ');
    }

    function toTrLower(str) {
        if (!str) return '';
        return str.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
    }

    // 2. Satır Bazlı Tablo / Key-Value Ayrıştırıcı
    function extractKeyValueMap(rawText) {
        const map = {};
        const lines = rawText.split(/\r?\n/);

        lines.forEach(line => {
            let l = line.trim();
            if (!l) return;

            // "Anahtar : Değer" veya "Anahtar\tDeğer" formatı
            let splitIdx = l.indexOf(':');
            if (splitIdx === -1 && l.includes('\t')) {
                splitIdx = l.indexOf('\t');
            }

            if (splitIdx !== -1) {
                let key = toTrLower(l.substring(0, splitIdx).trim());
                let val = l.substring(splitIdx + 1).trim();
                if (key && val) {
                    map[key] = val;
                }
            } else {
                // Sahibinden kopyalamalarında yan yana gelebilen etiketler
                const knownLabels = [
                    'ilan no', 'ilan tarihi', 'emlak tipi', 'm² fiyatı', 'm2 fiyatı', 'm² (brüt)', 'm² (net)', 'brüt m²', 'net m²', 'm²', 
                    'oda sayısı', 'bina yaşı', 'bulunduğu kat', 'kat sayısı', 'ısıtma',
                    'banyo sayısı', 'balkon', 'asansör', 'otopark', 'eşyalı', 'kullanım durumu',
                    'site içerisinde', 'site adı', 'aidat (tl)', 'aidat', 'depozito',
                    'krediye uygunluk', 'tapu durumu', 'kimden', 'takas', 'fiyat',
                    'ada no', 'parsel no', 'pafta no', 'kaks (emsal)', 'kaks', 'emsal', 
                    'gabari', 'imar durumu', 'imar', 'il / ilçe / mahalle', 'konum'
                ];
                knownLabels.sort((a, b) => b.length - a.length);

                let lLower = toTrLower(l);
                for (let lbl of knownLabels) {
                    if (lLower.startsWith(lbl)) {
                        let rest = l.substring(lbl.length).trim();
                        if (rest.startsWith(':')) rest = rest.substring(1).trim();
                        if (rest) {
                            map[lbl] = rest;
                            break;
                        }
                    }
                }
            }
        });

        return map;
    }

    // 3. Akıllı Fiyat Ayrıştırıcı
    function parsePrice(text, tableMap) {
        let tablePrice = tableMap['fiyat'] || tableMap['fiyatı'] || tableMap['kira'] || tableMap['kira bedeli'] || tableMap['başlangıç fiyatı'];
        
        // m² birim fiyatını (örn: "m2 fiyatı: 21.667 TL/m2" veya "21.667 TL/m2") temizle
        let cleanText = text.replace(/m[2²]\s*fiyat[ıi]?[^:\n\r]*[:=]?\s*[\d\.,]+\s*(?:tl|lira|₺)?(?:\/m[2²])?/gi, '')
                            .replace(/[\d\.,]+\s*(?:tl|lira|₺)?\/m[2²]/gi, '');

        let src = tablePrice || cleanText;

        // 1. "8.5 Milyon" veya "8,5 Milyon TL" veya "750 Bin TL"
        let mMilyon = src.match(/(\d+(?:[\.\,]\d+)?)\s*(buçuk|yarım)?\s*(milyon|bin)\s*(?:tl|lira|euro|dolar|€|\$|₺)?/i);
        if (mMilyon) {
            let baseNum = parseFloat(mMilyon[1].replace(',', '.'));
            if (mMilyon[2] && /buçuk|yarım/i.test(mMilyon[2])) baseNum += 0.5;
            let isMilyon = mMilyon[3].toLowerCase() === 'milyon';
            let finalVal = Math.round(baseNum * (isMilyon ? 1000000 : 1000));
            let curr = 'TL';
            let rawCurr = (mMilyon[0].match(/(tl|lira|euro|dolar|€|\$|₺)/i) || [])[1];
            if (rawCurr) {
                let c = rawCurr.toUpperCase();
                if (c === 'LİRA' || c === '₺') curr = 'TL';
                else if (c === '€') curr = 'EURO';
                else if (c === '$') curr = 'DOLAR';
                else curr = c;
            }
            return finalVal.toLocaleString('tr-TR') + ' ' + curr;
        }

        // 2. Noktalı/Virgüllü veya Düz Rakam: "6.500.000 TL", "40.000 TL", "25000 TL", "Fiyat: 6.750.000"
        let mExplicit = src.match(/(?:fiyat[ıi]?|bedel[i]?|kira(?:lık|sı|sı\s*bedeli)?|ücret[i]?)\s*[:=]?\s*((?:\d{1,3}(?:[\.\,]\d{3})+|\d{4,}))\s*(tl|lira|euro|dolar|€|\$|₺)?/i) ||
                        src.match(/((?:\d{1,3}(?:[\.\,]\d{3})+|\d{4,}))\s*(tl|lira|euro|dolar|€|\$|₺)/i);
        if (mExplicit) {
            let cleanNumStr = mExplicit[1].replace(/[\.\,]/g, '');
            let num = parseInt(cleanNumStr, 10);
            if (!isNaN(num) && num > 100) {
                let curr = 'TL';
                let rawCurr = mExplicit[2];
                if (rawCurr) {
                    let c = rawCurr.toUpperCase();
                    if (c === 'LİRA' || c === '₺') curr = 'TL';
                    else if (c === '€') curr = 'EURO';
                    else if (c === '$') curr = 'DOLAR';
                    else curr = c;
                }
                return num.toLocaleString('tr-TR') + ' ' + curr;
            }
        }

        return '';
    }

    // 4. Emlak Tipi & Kategori Tespiti (Weighted Context Scoring & Özne Analizi)
    function detectPropertyType(text, tableMap) {
        const rawLower = toTrLower(text);
        const emlakTipi = toTrLower(tableMap['emlak tipi'] || '');
        const isKiralik = /kiralık|kira\b|kiralama|aylık kira/i.test(emlakTipi + ' ' + rawLower);

        // 1. Eğer tabloda açıkça "Emlak Tipi" belirtilmişse doğrudan oraya bak
        if (emlakTipi) {
            if (/tarla/i.test(emlakTipi)) return 'satilik_tarla';
            if (/bağ|bahçe/i.test(emlakTipi)) return 'satilik_bag_bahce';
            if (/sanayi arsası/i.test(emlakTipi)) return 'satilik_sanayi_arsasi';
            if (/ticari arsa/i.test(emlakTipi)) return 'satilik_ticari_arsa';
            if (/arsa/i.test(emlakTipi)) return 'satilik_arsa';
            if (/villa/i.test(emlakTipi)) return isKiralik ? 'kiralik_villa' : 'satilik_villa';
            if (/bungalov/i.test(emlakTipi)) return 'satilik_bungalov';
            if (/rezidans|residence/i.test(emlakTipi)) return 'satilik_residence';
            if (/müstakil/i.test(emlakTipi)) return 'satilik_mustakil_ev';
            if (/köy evi/i.test(emlakTipi)) return 'satilik_koy_evi';
            if (/yazlık/i.test(emlakTipi)) return 'satilik_yazlik';
            if (/dükkan|mağaza/i.test(emlakTipi)) return isKiralik ? 'kiralik_dukkan' : 'satilik_dukkan';
            if (/ofis|büro/i.test(emlakTipi)) return isKiralik ? 'kiralik_ofis' : 'satilik_ofis';
            if (/daire/i.test(emlakTipi)) return isKiralik ? 'kiralik_daire' : 'satilik_daire';
        }

        // 2. Metin İçinde "Uygunluk / Öneri / Potansiyel" İfadelerini Ayıkla
        // Örn: "bungalov ve hobi bahçesine uygundur", "villa yapımına müsait", "tiny house yapılabilir"
        let sanitizedText = rawLower.replace(/(?:bungalov|tiny\s*house|hobi\s*bahçesi|villa|prefabrik|otel|turizm|tesis)\s*(?:ve\s*[^\n\r,\.]+)?\s*(?:yapımına|için|olarak)?\s*(?:uygundur|müsaittir|yapılabilir|elverişlidir|düşünülebilir|konseptli|uygun)/gi, ' [POTANSIYEL_KULLANIM] ');

        const scores = {
            tarla: 0,
            arsa: 0,
            ticari_arsa: 0,
            sanayi_arsasi: 0,
            bag_bahce: 0,
            daire: 0,
            villa: 0,
            bungalov: 0,
            mustakil: 0,
            koy_evi: 0,
            residence: 0,
            yazlik: 0,
            dukkan: 0,
            ofis: 0,
            proje: 0
        };

        // A. Özne ve Başlık Kelimeleri (Metnin ilk 150 karakteri veya ilk cümlesi)
        const firstPart = sanitizedText.substring(0, 150);
        if (/tarlamız|satılık tarla|tarladır|tarlanın/i.test(firstPart)) scores.tarla += 40;
        if (/arsamız|satılık arsa|arsadır|arsanın/i.test(firstPart)) scores.arsa += 40;
        if (/dairemiz|satılık daire|kiralık daire|dairedir/i.test(firstPart)) scores.daire += 40;
        if (/villamız|satılık villa|kiralık villa|villadır/i.test(firstPart)) scores.villa += 40;
        if (/dükkanımız|satılık dükkan|kiralık dükkan|mağazamız/i.test(firstPart)) scores.dukkan += 40;
        if (/ofisimiz|satılık ofis|kiralık ofis|büromuz/i.test(firstPart)) scores.ofis += 40;
        if (/bungalovumuz|satılık bungalov|bungalov ev/i.test(firstPart)) scores.bungalov += 40;
        if (/müstakil evimiz|satılık müstakil/i.test(firstPart)) scores.mustakil += 40;
        if (/köy evimiz|satılık köy evi/i.test(firstPart)) scores.koy_evi += 40;
        if (/yazlığımız|satılık yazlık/i.test(firstPart)) scores.yazlik += 40;
        if (/rezidansımız|satılık rezidans/i.test(firstPart)) scores.residence += 40;

        // B. Metin Geneli İpuçları
        if (/\btarla\b|tarlanın|tarlaya|tarlamız/i.test(sanitizedText)) scores.tarla += 20;
        if (/ekili|dikili|sulu tarla|kuru tarla|tarımsal|köy yolu|kadastro yolu/i.test(sanitizedText)) scores.tarla += 15;
        if (/cevizlik|fındıklık|fındık bahçesi|zeytinlik/i.test(sanitizedText)) scores.bag_bahce += 25;

        if (/\barsa\b|arsanın|arsaya|arsamız/i.test(sanitizedText)) scores.arsa += 20;
        if (/imar|imarlı|kaks|emsal|gabari|taks|parselasyon|ifraz/i.test(sanitizedText)) scores.arsa += 20;
        if (/ticari imar|ticari arsa/i.test(sanitizedText)) scores.ticari_arsa += 35;
        if (/sanayi imar|sanayi arsası|fabrika alanı|osb/i.test(sanitizedText)) scores.sanayi_arsasi += 30;

        if (/ada\s*[:=]?\s*\d+[\s,\/]+parsel\s*[:=]?\s*\d+|\d+\s*ada\s*\d+\s*parsel/i.test(sanitizedText)) {
            if (!/katta|bina yaşı|kat sayısı|oda sayısı|3\+1|2\+1|1\+1/i.test(sanitizedText)) {
                scores.tarla += 15;
                scores.arsa += 15;
            }
        }

        if (/\bdaire\b|dairemiz|apartman/i.test(sanitizedText)) scores.daire += 20;
        if (/\d\s*[\+]\s*\d/i.test(sanitizedText)) scores.daire += 20;
        if (/bulunduğu kat|ara kat|yüksek giriş|çatı dubleks|bahçe kat/i.test(sanitizedText)) scores.daire += 15;
        if (/kombi|doğalgaz|yerden ısıtma|aidat|bina yaşı|asansör/i.test(sanitizedText)) scores.daire += 10;

        if (/\bvilla\b|villamız|müstakil villa/i.test(sanitizedText)) scores.villa += 25;
        if (/özel havuz|sonsuzluk havuzu|müştemilat|özel bahçeli villa|tripleks/i.test(sanitizedText)) scores.villa += 20;

        if (/\bbungalov\b|ahşap ev|kütük ev|dağ evi/i.test(sanitizedText)) scores.bungalov += 25;
        if (/\bdükkan\b|mağaza|işyeri|tabela değeri|vitrin cephe/i.test(sanitizedText)) scores.dukkan += 30;
        if (/\bofis\b|büro|plaza ofis|plaza katı/i.test(sanitizedText)) scores.ofis += 30;
        if (/lansman|teslim tarihi|projemiz|taksitli|peşinatla/i.test(sanitizedText)) scores.proje += 25;

        let bestKey = 'daire';
        let maxScore = -1;
        for (let k in scores) {
            if (scores[k] > maxScore) {
                maxScore = scores[k];
                bestKey = k;
            }
        }

        switch(bestKey) {
            case 'tarla': return 'satilik_tarla';
            case 'bag_bahce': return 'satilik_bag_bahce';
            case 'sanayi_arsasi': return 'satilik_sanayi_arsasi';
            case 'ticari_arsa': return 'satilik_ticari_arsa';
            case 'arsa': return 'satilik_arsa';
            case 'villa': return isKiralik ? 'kiralik_villa' : 'satilik_villa';
            case 'bungalov': return 'satilik_bungalov';
            case 'mustakil': return 'satilik_mustakil_ev';
            case 'koy_evi': return 'satilik_koy_evi';
            case 'residence': return 'satilik_residence';
            case 'yazlik': return 'satilik_yazlik';
            case 'dukkan': return isKiralik ? 'kiralik_dukkan' : 'satilik_dukkan';
            case 'ofis': return isKiralik ? 'kiralik_ofis' : 'satilik_ofis';
            case 'proje': return 'satilik_konut_projesi';
            default: return isKiralik ? 'kiralik_daire' : 'satilik_daire';
        }
    }

    // 5. Oda Sayısı Ayrıştırıcı
    function parseRooms(text, tableMap) {
        let tVal = tableMap['oda sayısı'] || tableMap['oda'] || tableMap['oda + salon sayısı'];
        if (tVal) {
            let m = tVal.match(/(\d+)\s*[\+\,]\s*(\d+)/);
            if (m) return `${m[1]}+${m[2]}`;
            if (/stüdyo|1\+0/i.test(tVal)) return '1+0';
            return tVal.trim();
        }

        let mText = text.match(/(\d+)\s*[\+\,]\s*(\d+)/);
        if (mText) return `${mText[1]}+${mText[2]}`;
        if (/stüdyo|1\+0/i.test(text)) return '1+0';
        return '';
    }

    // 6. Alan (m² Brüt, Net, Arsa) Ayrıştırıcı
    function parseSizes(text, tableMap) {
        let brut = tableMap['m² (brüt)'] || tableMap['brüt m²'] || tableMap['brüt alan'] || tableMap['m²'];
        let net = tableMap['m² (net)'] || tableMap['net m²'] || tableMap['net alan'];
        let arsa = tableMap['arsa alanı'] || tableMap['arsa m²'] || tableMap['toplam alan'];

        let brutVal = '', netVal = '', arsaVal = '';

        if (brut) {
            let m = brut.match(/(\d[\d\.\,]*)/);
            if (m) brutVal = m[1].replace(',', '.') + ' m²';
        }
        if (net) {
            let m = net.match(/(\d[\d\.\,]*)/);
            if (m) netVal = m[1].replace(',', '.') + ' m²';
        }
        if (arsa) {
            let m = arsa.match(/(\d[\d\.\,]*)/);
            if (m) arsaVal = m[1].replace(',', '.') + ' m²';
        }

        if (!brutVal) {
            let mBrut = text.match(/(\d[\d\.\,]*)\s*(?:m2|m²)?\s*(?:brüt)/i) || text.match(/(?:brüt)\s*[:=]?\s*(\d[\d\.\,]*)\s*(?:m2|m²)?/i);
            if (mBrut) brutVal = mBrut[1].replace(',', '.') + ' m²';
        }
        if (!netVal) {
            let mNet = text.match(/(\d[\d\.\,]*)\s*(?:m2|m²)?\s*(?:net)/i) || text.match(/(?:net)\s*[:=]?\s*(\d[\d\.\,]*)\s*(?:m2|m²)?/i);
            if (mNet) netVal = mNet[1].replace(',', '.') + ' m²';
        }
        if (!brutVal && !netVal) {
            let mGeneric = text.match(/(\d[\d\.\,]*)\s*(?:m2|m²|metrekare|metre\s*kare|dönüm)/i);
            if (mGeneric) {
                let unit = /dönüm/i.test(mGeneric[0]) ? 'Dönüm' : 'm²';
                brutVal = mGeneric[1].replace(',', '.') + ' ' + unit;
            }
        }

        return { brut: brutVal, net: netVal, arsa: arsaVal };
    }

    // 7. Bulunduğu Kat Ayrıştırıcı
    function parseFloor(text, tableMap) {
        let tVal = tableMap['bulunduğu kat'] || tableMap['kat'] || tableMap['katı'];
        if (tVal) {
            let clean = tVal.trim();
            if (/bahçe dubleks/i.test(clean)) return 'Bahçe Dubleksi';
            if (/çatı dubleks/i.test(clean)) return 'Çatı Dubleksi';
            if (/ters dubleks/i.test(clean)) return 'Ters Dubleks';
            if (/dubleks/i.test(clean)) return 'Dubleks';
            if (/bahçe kat/i.test(clean)) return 'Bahçe Katı';
            if (/yüksek giriş/i.test(clean)) return 'Yüksek Giriş';
            if (/giriş kat/i.test(clean)) return 'Giriş Katı';
            if (/zemin kat|zemin/i.test(clean)) return 'Zemin Kat';
            if (/ara kat/i.test(clean)) return 'Ara Kat';
            if (/en üst kat|son kat/i.test(clean)) return 'En Üst Kat';
            if (/müstakil/i.test(clean)) return 'Müstakil';
            if (/kot\s*1/i.test(clean)) return 'Kot 1';
            if (/kot\s*2/i.test(clean)) return 'Kot 2';
            if (/bodrum/i.test(clean)) return 'Bodrum Kat';
            let m = clean.match(/(\d+)/);
            if (m) return `${m[1]}. Kat`;
            return clean;
        }

        let mNamed = text.match(/(bahçe dubleksi|çatı dubleksi|ters dubleks|dubleks|bahçe katı|yüksek giriş|giriş katı|zemin kat|ara kat|en üst kat|kot 1|kot 2|bodrum kat)/i);
        if (mNamed) {
            let f = mNamed[1];
            return f.charAt(0).toUpperCase() + f.slice(1).toLowerCase();
        }

        let mNum = text.match(/(\d+)\.?\s*kat/i);
        if (mNum) return `${mNum[1]}. Kat`;

        return '';
    }

    // 8. Bina Yaşı Ayrıştırıcı
    function parseBuildingAge(text, tableMap) {
        let tVal = tableMap['bina yaşı'] || tableMap['yaş'] || tableMap['yapım yılı'];
        if (tVal) {
            let clean = tVal.trim();
            if (/0\s*\(yeni\)|sıfır|^0$/i.test(clean)) return 'Sıfır';
            return clean;
        }

        let mRange = text.match(/(\d+[\s\-]+(?:veya|\-|ila)?\s*\d+\s*(?:arası|yaş)?)/i);
        if (mRange && /yaş|bina/i.test(text)) return mRange[1].trim();

        let mSifir = text.match(/(sıfır bina|sıfır daire|sıfır yapı|yeni bina|0 yaşında)/i);
        if (mSifir) return 'Sıfır';

        let mAge = text.match(/(?:yaş|yaşı)\s*[:=]?\s*(\d+)/i) || text.match(/(\d+)\s*(?:yıllık|yaşında)/i);
        if (mAge) {
            return mAge[1] === '0' ? 'Sıfır' : `${mAge[1]} Yaşında`;
        }

        return '';
    }

    // 9. Isıtma Tipi Ayrıştırıcı
    function parseHeating(text, tableMap) {
        let tVal = tableMap['ısıtma'] || tableMap['ısıtma tipi'];
        if (tVal) return tVal.trim();

        if (/yerden ısıtma/i.test(text)) return 'Yerden Isıtma';
        if (/doğalgaz|kombi/i.test(text)) return 'Doğalgaz (Kombi)';
        if (/merkezi\s*\(pay\s*ölçer\)/i.test(text)) return 'Merkezi (Pay Ölçer)';
        if (/merkezi/i.test(text)) return 'Merkezi Isıtma';
        if (/ısı pompası/i.test(text)) return 'Isı Pompası';
        if (/kat kaloriferi/i.test(text)) return 'Kat Kaloriferi';
        if (/klima/i.test(text)) return 'Klima';
        if (/şömine/i.test(text)) return 'Şömine';
        if (/soba/i.test(text)) return 'Sobalı';

        return '';
    }

    // 10. Banyo Sayısı Ayrıştırıcı
    function parseBathrooms(text, tableMap) {
        let tVal = tableMap['banyo sayısı'] || tableMap['banyo'];
        if (tVal) {
            let m = tVal.match(/(\d+)/);
            if (m) return m[1];
            return tVal.trim();
        }

        let mText = text.match(/(\d+)\s*(?:adet\s*)?banyo/i);
        if (mText) return mText[1];
        if (/ebeveyn banyo/i.test(text)) return 'Ebeveyn Banyolu';
        if (/çift banyo/i.test(text)) return '2';
        return '';
    }

    // 11. Aidat ve Depozito
    function parseAidatDepozito(text, tableMap) {
        let aidat = tableMap['aidat (tl)'] || tableMap['aidat'];
        let depozito = tableMap['depozito'];

        let aidatVal = '', depozitoVal = '';
        if (aidat) {
            let m = aidat.match(/(\d[\d\.\,]*)/);
            if (m) aidatVal = m[1].replace(/[\.\,]/g, '') + ' TL';
        }
        if (depozito) {
            depozitoVal = depozito.trim();
        }

        if (!aidatVal) {
            let mAidat = text.match(/aidat\s*[:=]?\s*(\d[\d\.\,]*)\s*(?:tl)?/i);
            if (mAidat) aidatVal = mAidat[1].replace(/[\.\,]/g, '') + ' TL';
        }
        if (!depozitoVal) {
            let mDep = text.match(/depozito\s*[:=]?\s*([^\n\r,\.]+)/i);
            if (mDep) depozitoVal = mDep[1].trim();
        }

        return { aidat: aidatVal, depozito: depozitoVal };
    }

    // 12. Arsa / İmar Detayları (Ada, Parsel, İmar, Kaks, Gabari)
    function parseLandDetails(text, tableMap) {
        let ada = tableMap['ada no'] || tableMap['ada'];
        let parsel = tableMap['parsel no'] || tableMap['parsel'];
        let imar = tableMap['imar durumu'] || tableMap['imar'];
        let kaks = tableMap['kaks (emsal)'] || tableMap['kaks'] || tableMap['emsal'];
        let gabari = tableMap['gabari'];
        let tapu = tableMap['tapu durumu'] || tableMap['tapu'];

        let adaVal = '', parselVal = '', imarVal = '', kaksVal = '', gabariVal = '', tapuVal = '';

        if (ada) { let m = ada.match(/(\d+)/); if (m) adaVal = m[1]; }
        if (parsel) { let m = parsel.match(/(\d+)/); if (m) parselVal = m[1]; }
        if (imar) {
            let imarClean = imar.trim();
            if (/villa/i.test(imarClean) && !/imar/i.test(imarClean)) {
                imarClean = 'Villa İmarlı';
            } else if (/konut/i.test(imarClean) && !/imar/i.test(imarClean)) {
                imarClean = 'Konut İmarlı';
            } else if (/ticari/i.test(imarClean) && !/imar/i.test(imarClean)) {
                imarClean = 'Ticari İmarlı';
            } else if (/sanayi/i.test(imarClean) && !/imar/i.test(imarClean)) {
                imarClean = 'Sanayi İmarlı';
            }
            imarVal = imarClean;
        }
        if (kaks) { let m = kaks.match(/(\d+(?:[\.\,]\d+)?)/); if (m) kaksVal = m[1].replace(',', '.'); }
        if (gabari) { let m = gabari.match(/(\d+(?:[\.\,]\d+)?)/); if (m) gabariVal = m[1].replace(',', '.'); }
        if (tapu) tapuVal = tapu.trim();

        if (!adaVal || !parselVal) {
            let mAdaParsel = text.match(/ada\s*[:=]?\s*(\d+)[\s,\/]+parsel\s*[:=]?\s*(\d+)/i) || 
                             text.match(/(\d+)\s*ada\s*(\d+)\s*parsel/i) ||
                             text.match(/(\d+)\s*\/\s*(\d+)\s*ada\s*parsel/i);
            if (mAdaParsel) {
                adaVal = mAdaParsel[1];
                parselVal = mAdaParsel[2];
            }
        }

        if (!imarVal) {
            let mImar = text.match(/(konut|ticari|sanayi|turizm|tarım|bağ|bahçe)\s*imar(?:lı)?/i);
            if (mImar) {
                let s = mImar[1];
                imarVal = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() + ' İmarlı';
            } else if (/imarsız|hisse/i.test(text)) {
                imarVal = 'İmarsız (Tarla)';
            }
        }

        if (!kaksVal) {
            let mKaks = text.match(/(?:emsal|kaks)\s*[:=]?\s*(\d+(?:[\.\,]\d+)?)/i);
            if (mKaks) kaksVal = mKaks[1].replace(',', '.');
        }

        if (!gabariVal) {
            let mGab = text.match(/gabari\s*[:=]?\s*(\d+(?:[\.\,]\d+)?)/i);
            if (mGab) gabariVal = mGab[1].replace(',', '.');
        }

        return { ada: adaVal, parsel: parselVal, imar: imarVal, kaks: kaksVal, gabari: gabariVal, tapu: tapuVal };
    }

    // 13. Konum Ayrıştırıcı (İl / İlçe / Mahalle)
    function parseLocation(text, tableMap) {
        let tLoc = tableMap['il / ilçe / mahalle'] || tableMap['konum'] || tableMap['adres'] || tableMap['lokasyon'];
        if (tLoc) {
            let cleanLoc = tLoc.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[\[\]]/g, '').trim();
            return cleanLoc.split('\n')[0].trim().replace(/\bMh\.?$/i, 'Mah.');
        }

        // Markdown linklerini temizle: [Çanakkale](url) -> Çanakkale
        let cleanText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

        // 1. "Bolu / Mudurnu / Tımaraktaş Köyü" formatı (Satır bazlı kesin arama)
        let lines = cleanText.split(/\r?\n/);
        for (let line of lines) {
            let l = line.trim();
            let mSlash = l.match(/^([a-zA-ZçğıöşüÇĞİÖŞÜ\s]+)\s*\/\s*([a-zA-ZçğıöşüÇĞİÖŞÜ\s]+)\s*\/\s*([a-zA-ZçğıöşüÇĞİÖŞÜ\s]+)$/i);
            if (mSlash) {
                let p1 = mSlash[1].trim();
                let p2 = mSlash[2].trim();
                let p3 = mSlash[3].trim().replace(/\bMh\.?$/i, 'Mah.').replace(/\bMahallesi$/i, 'Mah.');
                return `${p1} / ${p2} / ${p3}`;
            }
        }

        // 2. "Sakarya, Kaynarca, Gaziler Mahallesinde..." formatı
        let mProse = cleanText.match(/([a-zA-ZçğıöşüÇĞİÖŞÜ]+(?:\s*,\s*[a-zA-ZçğıöşüÇĞİÖŞÜ]+)*\s*(?:Mahallesi|Mah\.|Mh\.|Köyü|Mevkii|İlçesi|Merkez)(?:'nde|'nda|nde|nda|'de|'da|de|da)?)/i);
        if (mProse) {
            let loc = mProse[1].replace(/(?:'nde|'nda|nde|nda|'de|'da|de|da)$/i, '').trim();
            return loc.split(',').map(s => s.trim().replace(/Mahallesi|Mh\.?/i, 'Mah.')).join(' / ');
        }

        return '';
    }

    // 14. Ek Özellikler (Otopark, Asansör, Balkon, Site, Havuz, Manzara, Cephe, Önemli Noktalar)
    function parseExtraFeatures(text, tableMap) {
        let otopark = tableMap['otopark'];
        let asansor = tableMap['asansör'];
        let balkon = tableMap['balkon'];
        let site = tableMap['site adı'] || tableMap['site içerisinde'];
        let cephe = tableMap['cephe'] || tableMap['yola cephe'];
        let kullanim = tableMap['kullanım durumu'];

        let otoparkVal = otopark || (/kapalı otopark/i.test(text) ? 'Kapalı Otopark' : (/otopark/i.test(text) ? 'Açık Otopark' : ''));
        let asansorVal = asansor || (/çift asansör/i.test(text) ? 'Çift Asansör' : (/asansör/i.test(text) ? 'Var' : ''));
        let balkonVal = balkon || (/çift balkon/i.test(text) ? 'Çift Balkon' : (/balkon/i.test(text) ? 'Geniş Balkon' : ''));
        let havuzVal = /sonsuzluk havuzu/i.test(text) ? 'Sonsuzluk Havuzu' : (/özel havuz/i.test(text) ? 'Özel Havuzlu' : (/ortak havuz|havuz/i.test(text) ? 'Havuzlu' : ''));
        let manzaraVal = /deniz manzara/i.test(text) ? 'Deniz Manzaralı' : (/doğa manzara/i.test(text) ? 'Doğa Manzaralı' : (/şehir manzara/i.test(text) ? 'Şehir Manzaralı' : ''));
        let cepheVal = cephe || (/resmi yol|kadastro yol|kapanmaz yol|yolu vardır|yola cephe|asfalt/i.test(text) ? 'Yola Cepheli' : '');
        let siteVal = site || (/site içeris/i.test(text) ? 'Site İçi' : '');
        let kullanimVal = kullanim || (/kiracılı/i.test(text) ? 'Kiracılı' : (/boş/i.test(text) ? 'Boş' : ''));

        // Akıllı Önemli Noktalar / Vurgular (Highlights)
        let highlights = [];
        let mDistCenter = text.match(/(?:merkez[e]?\s*(\d+\s*km|\d+\s*dk|\d+\s*dakika))/i);
        if (mDistCenter) highlights.push(`📍 Merkeze ${mDistCenter[1]}`);

        let mOSB = text.match(/(?:organize\s*sanayi|osb)[^\d]*(\d+\s*dakika|\d+\s*dk|\d+\s*km|\d+\s*m)/i);
        if (mOSB) highlights.push(`🏭 OSB'ye ${mOSB[1]}`);

        let mRoad = text.match(/(?:duble\s*yol|otoyol|anayol)[^\d]*(\d+\s*metre|\d+\s*m|\d+\s*km)/i);
        if (mRoad) highlights.push(`🚗 Duble Yola ${mRoad[1]}`);

        if (/bungalov.*hobi bahçesi|hobi bahçesi.*bungalov/i.test(text)) {
            highlights.push(`🌿 Bungalov & Hobi Bahçesine Uygun`);
        } else if (/hobi bahçesi/i.test(text)) {
            highlights.push(`🌿 Hobi Bahçesine Uygun`);
        } else if (/bungalov/i.test(text) && /uygun/i.test(text)) {
            highlights.push(`🏡 Bungalov Yapımına Uygun`);
        }

        if (/yatırım/i.test(text) && /kazanç|fırsat|değerlen/i.test(text)) {
            highlights.push(`📈 Yüksek Yatırım Potansiyeli`);
        }

        return {
            otopark: otoparkVal,
            asansor: asansorVal,
            balkon: balkonVal,
            havuz: havuzVal,
            manzara: manzaraVal,
            cephe: cepheVal,
            site: siteVal,
            kullanim: kullanimVal,
            highlights: highlights
        };
    }

    // ========================================================================
    // ANA SMART PARSE FONKSİYONU
    // ========================================================================
    function executeSmartParse() {
        const aiTextEl = document.getElementById('aiText');
        if (!aiTextEl) return;
        const rawText = aiTextEl.value;
        if (!rawText || !rawText.trim()) {
            alert("Lütfen önce ayrıştırılacak ilan metnini yapıştırın!");
            return;
        }

        try {
            // Adım 1: Yazıyla yazılmış sayıları dönüştür
            const normalizedText = convertWrittenNumbers(rawText);

            // Adım 2: Anahtar-Değer Tablo Haritasını Çıkar
            const tableMap = extractKeyValueMap(rawText);

            // Adım 3: Emlak Tipini Belirle ve Kategoriye Geç
            const detectedType = detectPropertyType(normalizedText, tableMap);
            
            // Kategori Değiştir ve Accordion'ı Aç
            if (typeof window.switchPropertyType === 'function') {
                window.switchPropertyType(detectedType);
                document.querySelectorAll('.cat-item').forEach(item => item.classList.remove('active'));
                const targetEl = document.querySelector(`.cat-item[onclick*="${detectedType}"]`);
                if (targetEl) {
                    targetEl.classList.add('active');
                    const catBody = targetEl.closest('.cat-body');
                    if (catBody) catBody.classList.add('open');
                    const icon = targetEl.closest('.cat-group')?.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    }
                }
            }

            // Adım 4: Varlıkların Çıkarılması
            const price = parsePrice(normalizedText, tableMap);
            const rooms = parseRooms(normalizedText, tableMap);
            const sizes = parseSizes(normalizedText, tableMap);
            const floor = parseFloor(normalizedText, tableMap);
            const age = parseBuildingAge(normalizedText, tableMap);
            const heating = parseHeating(normalizedText, tableMap);
            const bathrooms = parseBathrooms(normalizedText, tableMap);
            const { aidat, depozito } = parseAidatDepozito(normalizedText, tableMap);
            const land = parseLandDetails(normalizedText, tableMap);
            const location = parseLocation(rawText, tableMap);
            const extras = parseExtraFeatures(normalizedText, tableMap);

            // Adım 5: Form Alanlarını Akıllıca Doldur & Boş Kalanları Yedek Bilgilerle Dengele
            const directMap = {
                'priceInput': price,
                'f_m2': sizes.brut || sizes.arsa,
                'f_brut': sizes.brut,
                'f_net': sizes.net,
                'f_alan': sizes.brut,
                'f_arsa': sizes.arsa,
                'sizeInput': sizes.brut || sizes.arsa,
                'c_size': sizes.brut || sizes.arsa,
                'canvaSize': sizes.brut || sizes.arsa,
                'araziSizeInput': sizes.brut || sizes.arsa,
                'f_ada': land.ada,
                'f_parsel': land.parsel,
                'f_imar': land.imar,
                'imarInput': land.imar,
                'c_imar': land.imar,
                'f_kaks': land.kaks,
                'f_gabari': land.gabari,
                'f_emsal': land.kaks,
                'kaksInput': land.kaks,
                'c_kaks': land.kaks,
                'gabariInput': land.gabari,
                'c_gabari': land.gabari,
                'f_oda': rooms,
                'roomsInput': rooms,
                'c_rooms': rooms,
                'canvaRooms': rooms,
                'f_kat': floor,
                'floorInput': floor,
                'c_floor': floor,
                'canvaFloor': floor,
                'f_yas': age,
                'ageInput': age,
                'c_age': age,
                'canvaAge': age,
                'f_isitma': heating,
                'f_konum': location,
                'f_lokasyon': location,
                'f_banyo': bathrooms,
                'f_aidat': aidat,
                'f_depozito': depozito,
                'f_cephe': extras.cephe,
                'cepheInput': extras.cephe,
                'c_cephe': extras.cephe,
                'f_havuz': extras.havuz,
                'f_otopark': extras.otopark,
                'f_asansor': extras.asansor,
                'f_site': extras.site,
                'f_manzara': extras.manzara,
                'f_kullanim': extras.kullanim
            };

            if (land.ada && land.parsel) {
                const adaParselVal = `${land.ada} / ${land.parsel}`;
                directMap['adaParselInput'] = adaParselVal;
                directMap['c_adaParsel'] = adaParselVal;
            }

            const usedSurplus = new Set();
            const emptySlots = [];

            const activeConfig = (window.propertyForms && window.propertyForms[detectedType]) ? window.propertyForms[detectedType] : null;

            if (activeConfig && activeConfig.fields) {
                activeConfig.fields.forEach(f => {
                    const el = document.getElementById(f.id);
                    if (!el) return;

                    if (f.id === 'priceInput') {
                        if (price) {
                            el.value = price;
                            const priceInputs = ['canvaPrice', 'canvaDPrice', 'canvaCPrice', 'canvaKPrice', 'canvaLPrice', 'canvaMPrice', 'canvaOPrice', 'canvaPPrice', 'canvaSPrice'];
                            priceInputs.forEach(pid => { const pel = document.getElementById(pid); if (pel) pel.value = price; });
                        }
                        return;
                    }

                    let val = directMap[f.id] || '';
                    // "Belirtilmemiş", "Bilinmiyor", "Yok" gibi değerleri temizle
                    if (/belirtilmemiş|bilinmiyor|^yok$/i.test(val.trim())) {
                        val = '';
                    }

                    if (val) {
                        el.value = val;
                        if (f.id === 'f_konum' || f.id === 'f_lokasyon') usedSurplus.add('location');
                        if (f.id === 'f_cephe') usedSurplus.add('cephe');
                        if (f.id === 'f_otopark') usedSurplus.add('otopark');
                        if (f.id === 'f_asansor') usedSurplus.add('asansor');
                        if (f.id === 'f_site') usedSurplus.add('site');
                        if (f.id === 'f_banyo') usedSurplus.add('banyo');
                        if (f.id === 'f_aidat') usedSurplus.add('aidat');
                        if (f.id === 'f_depozito') usedSurplus.add('depozito');
                        if (f.id === 'f_havuz') usedSurplus.add('havuz');
                        if (f.id === 'f_manzara') usedSurplus.add('manzara');
                    } else {
                        emptySlots.push({ field: f, element: el });
                    }
                });
            }

            // 2. İlanda Var Olan Yedek Bilgi Havuzu (Önem Sırasına Göre)
            const surplusPool = [];
            if (land.tapu && !usedSurplus.has('tapu') && !/belirtilmemiş|bilinmiyor/i.test(land.tapu)) {
                let cleanTapu = land.tapu.replace(/tapulu/i, 'Tapu');
                surplusPool.push({ label: 'Tapu Durumu', value: cleanTapu });
                usedSurplus.add('tapu');
            }
            if (location && !usedSurplus.has('location')) {
                surplusPool.push({ label: 'Konum', value: location });
                usedSurplus.add('location');
            }
            if (extras.cephe && !usedSurplus.has('cephe')) {
                surplusPool.push({ label: 'Yola Cephe', value: extras.cephe });
                usedSurplus.add('cephe');
            }
            if (extras.otopark && !usedSurplus.has('otopark')) {
                surplusPool.push({ label: 'Otopark', value: extras.otopark });
                usedSurplus.add('otopark');
            }
            if (extras.asansor && !usedSurplus.has('asansor')) {
                surplusPool.push({ label: 'Asansör', value: extras.asansor });
                usedSurplus.add('asansor');
            }
            if (extras.balkon && !usedSurplus.has('balkon')) {
                surplusPool.push({ label: 'Balkon', value: extras.balkon });
                usedSurplus.add('balkon');
            }
            if (extras.site && !usedSurplus.has('site')) {
                surplusPool.push({ label: 'Site İçi', value: extras.site });
                usedSurplus.add('site');
            }
            if (extras.havuz && !usedSurplus.has('havuz')) {
                surplusPool.push({ label: 'Havuz', value: extras.havuz });
                usedSurplus.add('havuz');
            }
            if (bathrooms && !usedSurplus.has('banyo')) {
                surplusPool.push({ label: 'Banyo', value: bathrooms + ' Banyo' });
                usedSurplus.add('banyo');
            }
            if (aidat && !usedSurplus.has('aidat')) {
                surplusPool.push({ label: 'Aidat', value: aidat });
                usedSurplus.add('aidat');
            }

            // 3. Boş kalan yuvaları yedek gerçek bilgilerle doldur
            emptySlots.forEach(slot => {
                if (surplusPool.length > 0) {
                    const surplus = surplusPool.shift();
                    slot.element.value = surplus.value;
                    if (slot.element.previousElementSibling && slot.element.previousElementSibling.tagName === 'LABEL') {
                        slot.element.previousElementSibling.innerText = surplus.label;
                    }
                } else {
                    // Yedek bilgi yoksa sahte varsayılan değeri temizle
                    slot.element.value = '';
                }
            });

            // Açıklama Kutusu (`descInput`)
            const descLines = [];
            if (location) descLines.push('📍 ' + location);
            if (land.ada && land.parsel) descLines.push(`📐 Ada: ${land.ada} | Parsel: ${land.parsel}`);
            if (rooms && sizes.brut) descLines.push(`🏠 ${rooms} | ${sizes.brut}`);
            if (floor) descLines.push(`🏢 ${floor}`);
            if (heating) descLines.push(`🔥 ${heating}`);
            if (extras.cephe) descLines.push(`🛣️ ${extras.cephe}`);
            if (extras.highlights && extras.highlights.length > 0) {
                extras.highlights.forEach(h => descLines.push(h));
            }
            if (extras.havuz) descLines.push(`🏊 ${extras.havuz}`);
            if (extras.otopark) descLines.push(`🚗 ${extras.otopark}`);

            const descInput = document.getElementById('descInput');
            if (descInput && descLines.length > 0) {
                descInput.value = descLines.join('\n');
            }

            // Adım 6: Canlı Tuval Güncellemesi ve Otomatik Kayıt
            if (typeof window.renderData === 'function') window.renderData();
            if (typeof window.refreshActiveCanvaTemplate === 'function') window.refreshActiveCanvaTemplate();
            if (typeof window.applyParsedDataToJsonTemplate === 'function') {
                window.applyParsedDataToJsonTemplate(result);
            }

            // Eğer kullanıcı standart şablon modundaysa elemanları görünür yap ve güncelle
            if (typeof activeLayout !== 'undefined' && activeLayout && (!window.isCanvaMode)) {
                if (typeof elBadge !== 'undefined' && elBadge) elBadge.style.visibility = 'visible';
                if (typeof elPrice !== 'undefined' && elPrice) elPrice.style.visibility = 'visible';
                if (typeof elDetails !== 'undefined' && elDetails) elDetails.style.visibility = 'visible';
                const il = document.getElementById('infoLineText');
                if (il) il.style.visibility = 'visible';
            }

            if (typeof window.requestAutoSave === 'function') window.requestAutoSave();

            // Adım 7: İlana Özel Akıllı Öneriler & Rozetler Üret
            if (typeof window.generateSmartSuggestions === 'function') {
                window.generateSmartSuggestions({
                    price: price,
                    m2Price: (land && land.m2Price) ? land.m2Price : '',
                    location: location,
                    size: sizes.brut || sizes.net || sizes.arsa,
                    rooms: rooms,
                    imar: land.imar,
                    ada: land.ada,
                    parsel: land.parsel,
                    tapu: (land && land.tapu) ? land.tapu : (extras && extras.tapu ? extras.tapu : ''),
                    floor: floor,
                    heating: heating,
                    cephe: extras && extras.cephe ? extras.cephe : '',
                    age: age || '',
                    aidat: extras && extras.aidat ? extras.aidat : '',
                    kullanim: extras && extras.kullanim ? extras.kullanim : '',
                    type: detectedType
                }, rawText);
            }

            // Kullanıcıya bildirim
            let ind = document.getElementById('autosave-indicator');
            if (ind) {
                ind.innerHTML = `✓ İlan başarıyla süzüldü (${detectedType.replace('_', ' ').toUpperCase()})`;
                ind.style.opacity = '1';
                ind.style.transition = 'none';
                setTimeout(() => {
                    ind.style.transition = 'opacity 1s ease';
                    ind.style.opacity = '0';
                }, 3000);
            }
        } catch (err) {
            console.error("Metni süzme hatası:", err);
        } finally {
            if (typeof window.hideAppLoading === 'function') {
                window.hideAppLoading();
            }
        }
    }

    // Global Dışa Aktarma
    window.SmartParserPro = {
        execute: executeSmartParse,
        convertWrittenNumbers: convertWrittenNumbers,
        extractKeyValueMap: extractKeyValueMap,
        parsePrice: parsePrice,
        detectPropertyType: detectPropertyType
    };

    window.smartParse = executeSmartParse;

})(window);

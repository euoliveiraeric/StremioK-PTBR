/* Player, part 3 of 7 — languages: the spellings a track language comes in, display names, and
   reading a track's details.
   Parts share one namespace, PlayerParts (P): see js/player-core.js. */
(function (P) {
    'use strict';

    // A track's details (the player's extra_info). Normally JSON; when it isn't (some
    // firmware), its "key": value pairs are read out of the text, so the language survives.
    function trackInfo(tr) {
        var info = tr && tr.extra_info;
        if (typeof info === 'string') {
            try { info = JSON.parse(info); } catch (e) {
                var out = Object.create(null), re = /["']?([A-Za-z_]+)["']?\s*[:=]\s*["']?([^"',}]*)/g, m;   // (no inherited names)
                while ((m = re.exec(info))) { out[m[1]] = m[2].trim(); }
                info = out;
            }
        }
        return (info && typeof info === 'object') ? info : {};
    }
    // Its language, under whichever name the player uses: audio usually "language",
    // subtitles "track_lang" (either can turn up on either, depending on the TV / file).
    function infoLang(info) {
        info = info || {};
        return '' + (info.language || info.track_lang || info.lang || info.language_code || info.languageCode || '');
    }
    function trackLang(tr) { return infoLang(trackInfo(tr)); }

    // Spellings a track's language can arrive in for each language code (audio tracks,
    // and subtitle addons, which don't all use OpenSubtitles' 3-letter codes):
    // ISO 639-2 (both B and T forms), ISO 639-1 (HLS uses it, e.g. "es-419"), and names.
    var LANG_ALIASES = {
        eng: ['eng', 'en', 'english'],
        spa: ['spa', 'spn', 'spl', 'es', 'esl', 'spanish', 'español', 'espanol', 'castellano', 'latino'],
        fre: ['fre', 'fra', 'fr', 'french', 'français', 'francais'],
        ger: ['ger', 'deu', 'de', 'german', 'deutsch'],
        ita: ['ita', 'it', 'italian', 'italiano'],
        por: ['por', 'pob', 'pom', 'pt', 'portuguese', 'português', 'portugues'],
        dut: ['dut', 'nld', 'nl', 'dutch', 'nederlands'],
        rus: ['rus', 'ru', 'russian'],
        ara: ['ara', 'ar', 'arabic'],
        tur: ['tur', 'tr', 'turkish'],
        pol: ['pol', 'pl', 'polish', 'polski'],
        jpn: ['jpn', 'ja', 'japanese', '日本語'],
        kor: ['kor', 'ko', 'korean', '한국어'],
        chi: ['chi', 'zho', 'zh', 'cmn', 'zht', 'zhe', 'chinese', 'mandarin', '中文'],   // (zht / zhe: OpenSubtitles' traditional and bilingual)
        hin: ['hin', 'hi', 'hindi'],
        swe: ['swe', 'sv', 'swedish', 'svenska'],
        nor: ['nor', 'nob', 'nno', 'nb', 'nn', 'norwegian', 'norsk'],
        dan: ['dan', 'da', 'danish', 'dansk'],
        fin: ['fin', 'fi', 'finnish', 'suomi'],
        gre: ['gre', 'ell', 'el', 'greek'],
        heb: ['heb', 'he', 'iw', 'hebrew'],
        hun: ['hun', 'hu', 'hungarian', 'magyar'],
        cze: ['cze', 'ces', 'cs', 'czech', 'čeština'],
        slo: ['slo', 'slk', 'sk', 'slovak'],
        slv: ['slv', 'sl', 'slovenian', 'slovene'],
        rum: ['rum', 'ron', 'ro', 'romanian', 'română'],
        ukr: ['ukr', 'uk', 'ukrainian'],
        tha: ['tha', 'th', 'thai'],
        vie: ['vie', 'vi', 'vietnamese'],
        ind: ['ind', 'id', 'indonesian', 'indonesia'],   // ("Bahasa Indonesia": its last word)
        may: ['may', 'msa', 'ms', 'malay'],
        fil: ['fil', 'tgl', 'tl', 'filipino', 'tagalog'],
        cat: ['cat', 'ca', 'catalan', 'català'],
        baq: ['baq', 'eus', 'eu', 'basque', 'euskara'],
        glg: ['glg', 'gl', 'galician', 'galego'],
        bul: ['bul', 'bg', 'bulgarian'],
        hrv: ['hrv', 'hr', 'croatian', 'hrvatski'],
        srp: ['srp', 'scc', 'sr', 'serbian'],
        per: ['per', 'fas', 'fa', 'persian', 'farsi'],
        est: ['est', 'et', 'estonian'],
        lav: ['lav', 'lv', 'latvian'],
        lit: ['lit', 'lt', 'lithuanian'],
        ice: ['ice', 'isl', 'is', 'icelandic'],
        tam: ['tam', 'ta', 'tamil'],
        tel: ['tel', 'te', 'telugu'],
        ben: ['ben', 'bn', 'bengali'],
        // (2.2.0.2) the rest of OpenSubtitles' languages; two-letter codes that are also everyday
        // words or labels (my, be, or, so, an, se, si, ne, mr, SD, BR…) left out
        afr: ['afr', 'af', 'afrikaans'],
        alb: ['alb', 'sqi', 'sq', 'albanian', 'shqip'],
        arg: ['arg', 'aragonese'],
        arm: ['arm', 'hye', 'hy', 'armenian'],
        ast: ['ast', 'asturian'],
        aze: ['aze', 'az', 'azerbaijani'],
        bel: ['bel', 'belarusian'],
        bos: ['bos', 'bs', 'bosnian'],
        bre: ['bre', 'breton'],
        bur: ['bur', 'mya', 'burmese'],
        prs: ['prs', 'dari'],
        epo: ['epo', 'eo', 'esperanto'],
        ext: ['ext', 'extremaduran'],
        gla: ['gla', 'gd', 'gaelic'],
        geo: ['geo', 'kat', 'ka', 'georgian'],
        ibo: ['ibo', 'ig', 'igbo'],
        ina: ['ina', 'interlingua'],
        gle: ['gle', 'ga', 'irish'],
        kan: ['kan', 'kn', 'kannada'],
        kaz: ['kaz', 'kk', 'kazakh'],
        khm: ['khm', 'km', 'khmer'],
        kur: ['kur', 'ku', 'kurdish'],
        ltz: ['ltz', 'lb', 'luxembourgish'],
        mac: ['mac', 'mkd', 'mk', 'macedonian'],
        mal: ['mal', 'ml', 'malayalam'],
        mni: ['mni', 'manipuri'],
        mar: ['mar', 'marathi'],
        mon: ['mon', 'mn', 'mongolian'],
        mne: ['mne', 'montenegrin'],
        nav: ['nav', 'nv', 'navajo'],
        nep: ['nep', 'nepali'],
        sme: ['sme', 'sami'],
        oci: ['oci', 'oc', 'occitan'],
        ori: ['ori', 'odia', 'oriya'],
        pan: ['pan', 'pa', 'punjabi', 'panjabi'],
        pus: ['pus', 'pashto'],
        sat: ['sat', 'santali'],
        snd: ['snd', 'sindhi'],
        sin: ['sin', 'sinhala', 'sinhalese'],
        som: ['som', 'somali'],
        swa: ['swa', 'sw', 'swahili'],
        syr: ['syr', 'syriac'],
        tat: ['tat', 'tt', 'tatar'],
        tok: ['tok', 'toki'],
        tuk: ['tuk', 'tk', 'turkmen'],
        urd: ['urd', 'ur', 'urdu'],
        uzb: ['uzb', 'uz', 'uzbek'],
        wel: ['wel', 'cym', 'cy', 'welsh']
    };
    function langMatches(pref, lang) {
        var names = LANG_ALIASES[pref] || [pref];
        // "es-419" -> ["es"], "Spanish (Latin America)" -> ["spanish", "latin", "america"]
        var words = ('' + (lang || '')).toLowerCase().split(/[^a-zà-ÿ]+/);
        for (var i = 0; i < words.length; i++) { if (words[i] && names.indexOf(words[i]) !== -1) { return true; } }
        return false;
    }

    // Display names for language codes (the aliases above, plus other common ones).
    var LANG_NAMES = { eng: I18n.t('English'), spa: I18n.t('Spanish'), fre: I18n.t('French'), ger: I18n.t('German'), ita: I18n.t('Italian'), por: I18n.t('Portuguese'),
        dut: I18n.t('Dutch'), rus: I18n.t('Russian'), ara: I18n.t('Arabic'), tur: I18n.t('Turkish'), pol: I18n.t('Polish'),
        jpn: I18n.t('Japanese'), ja: I18n.t('Japanese'), kor: I18n.t('Korean'), ko: I18n.t('Korean'), chi: I18n.t('Chinese'), zho: I18n.t('Chinese'), zh: I18n.t('Chinese'),
        hin: I18n.t('Hindi'), hi: I18n.t('Hindi'), swe: I18n.t('Swedish'), sv: I18n.t('Swedish'), nor: I18n.t('Norwegian'), no: I18n.t('Norwegian'), nob: I18n.t('Norwegian'),
        dan: I18n.t('Danish'), da: I18n.t('Danish'), fin: I18n.t('Finnish'), fi: I18n.t('Finnish'), gre: I18n.t('Greek'), ell: I18n.t('Greek'), el: I18n.t('Greek'),
        heb: I18n.t('Hebrew'), he: I18n.t('Hebrew'), hun: I18n.t('Hungarian'), hu: I18n.t('Hungarian'), cze: I18n.t('Czech'), ces: I18n.t('Czech'), cs: I18n.t('Czech'),
        rum: I18n.t('Romanian'), ron: I18n.t('Romanian'), ro: I18n.t('Romanian'), ukr: I18n.t('Ukrainian'), uk: I18n.t('Ukrainian'), tha: I18n.t('Thai'), th: I18n.t('Thai'),
        vie: I18n.t('Vietnamese'), vi: I18n.t('Vietnamese'), ind: I18n.t('Indonesian'), id: 'Indonesian', cat: I18n.t('Catalan'), ca: I18n.t('Catalan'),
        bul: I18n.t('Bulgarian'), bg: I18n.t('Bulgarian'), hrv: I18n.t('Croatian'), hr: I18n.t('Croatian'), srp: I18n.t('Serbian'), sr: I18n.t('Serbian'),
        per: I18n.t('Persian'), fas: I18n.t('Persian'), fa: I18n.t('Persian'), slo: I18n.t('Slovak'), slv: I18n.t('Slovenian'), may: I18n.t('Malay'), fil: I18n.t('Filipino'),
        baq: I18n.t('Basque'), glg: I18n.t('Galician'), est: I18n.t('Estonian'), lav: I18n.t('Latvian'), lit: I18n.t('Lithuanian'), ice: I18n.t('Icelandic'),
        tam: I18n.t('Tamil'), tel: I18n.t('Telugu'), ben: I18n.t('Bengali'), mul: I18n.t('Multiple languages'), zxx: I18n.t('No language'),
        afr: I18n.t('Afrikaans'), alb: I18n.t('Albanian'), arg: I18n.t('Aragonese'), arm: I18n.t('Armenian'), ast: I18n.t('Asturian'), aze: I18n.t('Azerbaijani'),
        bel: I18n.t('Belarusian'), bos: I18n.t('Bosnian'), bre: I18n.t('Breton'), bur: I18n.t('Burmese'), prs: I18n.t('Dari'), epo: I18n.t('Esperanto'), ext:
        I18n.t('Extremaduran'), gla: I18n.t('Scottish Gaelic'), geo: I18n.t('Georgian'), ibo: I18n.t('Igbo'), ina: I18n.t('Interlingua'), gle: I18n.t('Irish'), kan:
        I18n.t('Kannada'), kaz: I18n.t('Kazakh'), khm: I18n.t('Khmer'), kur: I18n.t('Kurdish'), ltz: I18n.t('Luxembourgish'), mac: I18n.t('Macedonian'), mal:
        I18n.t('Malayalam'), mni: I18n.t('Manipuri'), mar: I18n.t('Marathi'), mon: I18n.t('Mongolian'), mne: I18n.t('Montenegrin'), nav: I18n.t('Navajo'), nep:
        I18n.t('Nepali'), sme: I18n.t('Northern Sami'), oci: I18n.t('Occitan'), ori: I18n.t('Odia'), pan: I18n.t('Punjabi'), pus: I18n.t('Pashto'), sat: I18n.t('Santali'),
        snd: I18n.t('Sindhi'), sin: I18n.t('Sinhala'), som: I18n.t('Somali'), swa: I18n.t('Swahili'), syr: I18n.t('Syriac'), tat: I18n.t('Tatar'), tok: I18n.t('Toki Pona'),
        tuk: I18n.t('Turkmen'), urd: I18n.t('Urdu'), uzb: I18n.t('Uzbek'), wel: I18n.t('Welsh'),
        und: I18n.t('Unknown language'), '': I18n.t('Unknown language') };
    function langName(lang) {
        var k = langKey(lang);
        if (LANG_NAMES[k]) { return LANG_NAMES[k]; }
        var raw = ('' + (lang || '')).trim();
        return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : I18n.t('Unknown language');
    }
    // Order for language groups: current choice, then the preferred languages, then by name.
    function langRank(k, prefs) {
        var i = prefs.indexOf(k);
        return i === -1 ? prefs.length : i;
    }

    // A track language in comparable form: the language code when a known spelling
    // ("es-419", "Spanish") is recognized, else the raw lowercased text.
    function langKey(lang) {
        for (var k in LANG_ALIASES) {
            if (Object.prototype.hasOwnProperty.call(LANG_ALIASES, k) && langMatches(k, lang)) { return k; }
        }
        return ('' + (lang || '')).toLowerCase().trim();
    }

    // ----- for the other parts (and js/player.js) -----
    P.languageChoices = function () { return Object.keys(LANG_ALIASES).map(function (key) { return [key, langName(key)]; }).sort(function (a, b) { return a[1].localeCompare(b[1]); }); };
    P.trackInfo = trackInfo; P.infoLang = infoLang; P.trackLang = trackLang; P.langMatches = langMatches;
    P.langName = langName; P.langRank = langRank; P.langKey = langKey;
    // A track that doesn't say its language (by its key): none, "und", "unknown"…, or no letters.
    // (A language StremioK has no name for is still a language.)
    P.langUnstated = function (k) { k = ('' + (k || '')).trim(); return !/[a-zà-ÿ]/i.test(k) || /^(und|unk|unknown|unknown language|mul|zxx|n\/a|none)$/i.test(k); };
    // A language code's two-letter form (ISO 639-1: "spa" -> "es"), or '' (TMDB asks by it).
    P.lang2 = function (key) { var a = LANG_ALIASES[key] || []; for (var i = 0; i < a.length; i++) { if (/^[a-z]{2}$/.test(a[i])) { return a[i]; } } return ''; };
})(PlayerParts);

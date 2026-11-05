/* Original-language audio + PT-BR for series. No country, title-name or anime-language guessing. ES5. */
var AnimePrefs = (function () {
    'use strict';
    // Keep the historical anime key untouched; native audio is now the default for every series.
    var OFF_KEY = 'stremiokptbr.native.off', LANG_KEY = 'stremiokptbr.native.languages', MAX = 150;
    function title(ctx) { return ctx && ctx.type === 'series' && !ctx.yt && !/^(ytk|yt_id):/.test(ctx.parent || ctx.id || '') ? '' + (ctx.parent || ctx.id || '') : ''; }
    function enabled(ctx) {
        var id = title(ctx), off = U.store.get(OFF_KEY, []);
        return !!id && (!Array.isArray(off) || off.indexOf(id) === -1);
    }
    function set(ctx, on) {
        var id = title(ctx), off = U.store.get(OFF_KEY, []);
        if (!id) { return false; }
        off = (Array.isArray(off) ? off : []).filter(function (v) { return v !== id; });
        if (!on) { off.push(id); }
        return U.store.set(OFF_KEY, off.slice(-MAX));
    }
    var ALIASES = {
        'japonês': 'jpn', japones: 'jpn', 'francês': 'fre', frances: 'fre', 'alemão': 'ger', alemao: 'ger', 'inglês': 'eng', ingles: 'eng',
        en: 'eng', eng: 'eng', english: 'eng', fr: 'fre', fra: 'fre', fre: 'fre', french: 'fre', 'français': 'fre',
        de: 'ger', deu: 'ger', ger: 'ger', german: 'ger', deutsch: 'ger', ja: 'jpn', jpn: 'jpn', japanese: 'jpn',
        es: 'spa', spa: 'spa', spanish: 'spa', pt: 'por', por: 'por', portuguese: 'por', it: 'ita', ita: 'ita', italian: 'ita',
        ko: 'kor', kor: 'kor', korean: 'kor', zh: 'chi', zho: 'chi', chi: 'chi', chinese: 'chi', ru: 'rus', rus: 'rus', russian: 'rus'
    };
    function languageKey(value) {
        if (value && typeof value === 'object') { value = value.iso_639_1 || value.code || value.lang || ''; }
        if (typeof value !== 'string') { return ''; }
        var v = value.toLowerCase().trim(), key;
        if (typeof PlayerParts !== 'undefined' && PlayerParts.langKey) { key = PlayerParts.langKey(v); }
        else { key = ALIASES[v] || ALIASES[v.split(/[-_]/)[0]] || v; }
        key = ALIASES[key] || key;
        return /^[a-z]{2,3}$/.test(key) && !/^(und|unk|mul|zxx)$/.test(key) ? key : '';
    }
    function metadataLanguage(meta) {
        meta = meta || {};
        var values = [meta.original_language, meta.originalLanguage, meta.originalLang, meta.originalLanguageCode], found = [];
        values.forEach(function (v) { var k = languageKey(v); if (k && found.indexOf(k) < 0) { found.push(k); } });
        return found.length === 1 ? found[0] : '';
    }
    function originalLanguage(ctx) {
        var all = U.store.get(LANG_KEY, []), id = title(ctx);
        if (id && Array.isArray(all)) {
            for (var i = 0; i < all.length; i++) { if (all[i].id === id) { return languageKey(all[i].language); } }
        }
        return languageKey(ctx && ctx.originalLanguage) || metadataLanguage(ctx && ctx.meta);
    }
    function setOriginalLanguage(ctx, value) {
        var id = title(ctx), key = languageKey(value), all = U.store.get(LANG_KEY, []);
        if (!id || (value && !key)) { return false; }
        all = (Array.isArray(all) ? all : []).filter(function (v) { return v.id !== id; });
        if (key) { all.push({ id: id, language: key }); }
        return U.store.set(LANG_KEY, all.slice(-MAX));
    }
    function audioMatches(want, value) {
        if (!want) { return false; }
        if (typeof PlayerParts !== 'undefined' && PlayerParts.langMatches && PlayerParts.langMatches(want, value)) { return true; }
        var flags = { fre: ['🇫🇷'], ger: ['🇩🇪'], jpn: ['🇯🇵'], eng: ['🇬🇧', '🇺🇸'], spa: ['🇪🇸'], por: ['🇵🇹', '🇧🇷'], ita: ['🇮🇹'], kor: ['🇰🇷'], chi: ['🇨🇳'], rus: ['🇷🇺'] };
        if ((flags[want] || []).some(function (flag) { return ('' + value).indexOf(flag) !== -1; })) { return true; }
        if (want === 'jpn' && /日本語/.test(value)) { return true; }
        var words = ('' + value).toLowerCase().split(/[^a-zà-ÿ]+/);
        return words.some(function (word) { return !!word && languageKey(word) === want; });
    }
    function portugueseRank(lang) {
        var s = ('' + (lang || '')).toLowerCase().replace(/_/g, '-');
        if (/\b(pob|pt-br|pt-bra|brazilian|brazil|brasil|brasileir[oa])\b/.test(s)) { return 0; }
        if (/\b(pt-pt|portugal|european)\b/.test(s)) { return 2; }
        return 1;
    }
    function orderSubtitles(list) {
        // Stable sort: a provider's release matches stay in their original order within a region.
        return list.map(function (t, i) { return { t: t, i: i }; }).sort(function (a, b) {
            return portugueseRank(a.t.lang) - portugueseRank(b.t.lang) || a.i - b.i;
        }).map(function (x) { return x.t; });
    }
    function sourceScore(st, ctx) { return sourceEvidence(st, ctx).matches ? 1 : 0; }
    function brazilian(value) {
        return /(^|[^a-z0-9])(pt[-_ ]?br|pt-bra|pob|brazilian(?: portuguese)?|portugu[eê]s brasileiro|portuguese \(brazil\)|portugu[eê]s \(brasil\))(?=$|[^a-z0-9])/i.test(value) || /🇧🇷/.test(value);
    }
    function languages(value, match) {
        var list = Array.isArray(value) ? value.slice(0, 64) : [value];
        return list.some(function (v) {
            if (v && typeof v === 'object') { v = v.lang || v.language || v.code || ''; }
            return typeof v === 'string' && match(v.slice(0, 1000));
        });
    }
    function sourceEvidence(st, ctx) {
        st = st || {};
        var hints = st.behaviorHints || {}, audio = false, subtitles = false, wanted = originalLanguage(ctx);
        function nativeAudio(value) { return audioMatches(wanted, value); }
        [st.audioLanguages, st.audioTracks, st.audio, hints.audioLanguages, hints.audioTracks].forEach(function (v) {
            if (languages(v, nativeAudio)) { audio = true; }
        });
        [st.subtitleLanguages, st.subtitleTracks, hints.subtitleLanguages, hints.subtitleTracks].forEach(function (v) {
            if (languages(v, brazilian)) { subtitles = true; }
        });
        // A source's own subtitle files are evidence for that source. Episode-wide subtitle
        // search results and generic "Portuguese" do not establish a Brazilian release match.
        (Array.isArray(st.subtitles) ? st.subtitles.slice(0, 64) : []).forEach(function (t) {
            if (t && /^https?:\/\//i.test(t.url || '') && brazilian(t.lang || t.language || '')) { subtitles = true; }
        });
        var text = [st.name, st.title, st.description].filter(function (v) { return typeof v === 'string'; }).join('\n').slice(0, 8000);
        text = text.replace(/(?:🗣️?|🔊)\s*/g, '\nAudio: ').replace(/💬\s*/g, '\nSubtitles: ');
        // Require explicitly labelled fields. Bare filenames, flags, "dual" and "multi"
        // cannot distinguish audio from captions and therefore remain unconfirmed.
        text = text.replace(/\b(audio|áudio|subtitles?|subs?|legendas?)\s*[:=]/gi, '\n$1:');
        text.split(/[\n|;]/).slice(0, 80).forEach(function (line) {
            var m = /^\s*(audio|áudio|subtitles?|subs?|legendas?)\s*:\s*(.*)$/i.exec(line);
            if (!m) { return; }
            if (/^(audio|áudio)$/i.test(m[1])) { if (nativeAudio(m[2])) { audio = true; } }
            else if (brazilian(m[2])) { subtitles = true; }
        });
        return { originalLanguage: wanted, originalAudio: audio, brazilianSubtitles: subtitles, matches: !!wanted && audio && subtitles };
    }
    return { prefersNative: function (ctx) { return !!title(ctx); }, enabled: enabled, set: set, orderSubtitles: orderSubtitles, portugueseRank: portugueseRank, sourceScore: sourceScore,
        sourceEvidence: sourceEvidence, matchesSource: function (st, ctx) { return sourceEvidence(st, ctx).matches; }, isBrazilian: brazilian,
        languageKey: languageKey, metadataLanguage: metadataLanguage, originalLanguage: originalLanguage, setOriginalLanguage: setOriginalLanguage };
})();

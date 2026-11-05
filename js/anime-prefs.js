/* Opt-in per-title preferences. No season/id guessing and no changes to other titles. ES5. */
var AnimePrefs = (function () {
    'use strict';
    var KEY = 'stremiokptbr.anime', MAX = 150;
    function title(ctx) { return ctx && ctx.type === 'series' ? '' + (ctx.parent || ctx.id || '') : ''; }
    function all() { var a = U.store.get(KEY, []); return Array.isArray(a) ? a : []; }
    function enabled(ctx) { var id = title(ctx); return !!id && all().indexOf(id) !== -1; }
    function set(ctx, on) {
        var id = title(ctx), a = all().filter(function (v) { return v !== id; });
        if (!id) { return false; }
        if (on) { a.push(id); }
        return U.store.set(KEY, a.slice(-MAX));
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
    function sourceScore(st) {
        var text = [st.name, st.title, st.description, (st.behaviorHints || {}).filename].join(' ');
        return /\b(jpn|japanese|japon[eê]s|ja)\b/i.test(text) ? 1 : 0;
    }
    return { enabled: enabled, set: set, orderSubtitles: orderSubtitles, portugueseRank: portugueseRank, sourceScore: sourceScore };
})();

/* Views, part 5 of 6 — text-entry pages (add addon / playlist) and Settings with its sections.
   Parts share one namespace, ViewParts (V): each part publishes the functions the
   others use, and borrows theirs through the small forwarders below (resolved when
   called, so load order only matters for js/views.js, which assembles Views). */
(function (V) {
    'use strict';

    // ----- from the other parts -----
    function addonActions() { return V.addonActions.apply(null, arguments); }   // core
    function buildTopMenu() { return V.buildTopMenu.apply(null, arguments); }   // core
    function clearCatalogCache() { return V.clearCatalogCache.apply(null, arguments); }   // home
    function refreshAddonRows() { return V.refreshAddonRows.apply(null, arguments); }   // home
    function closeModal() { return V.closeModal.apply(null, arguments); }   // core
    function confirm() { return V.confirm.apply(null, arguments); }   // core
    function header() { return V.header.apply(null, arguments); }   // core
    function isModalOpen() { return V.isModalOpen.apply(null, arguments); }   // core
    function markHomeDirty() { return V.markHomeDirty.apply(null, arguments); }   // home
    function onModalClose() { return V.onModalClose.apply(null, arguments); }   // core
    function pickList() { return V.pickList.apply(null, arguments); }   // core
    function playlistActions() { return V.playlistActions.apply(null, arguments); }   // core
    function scr() { return V.scr.apply(null, arguments); }   // core
    function showModal() { return V.showModal.apply(null, arguments); }   // core
    function pickMany() { return V.pickMany.apply(null, arguments); }   // core

    // ================= GENERIC TEXT-ENTRY PAGE =================
    // cfg = { title, hint, value, placeholder, validate(v)->err|null, onConfirm(v) }
    // Field kept high on its own page so the on-screen keyboard never covers it.
    function renderEntry(cfg) {
        var s = scr('addaddon');
        U.clear(s);
        s.appendChild(header(cfg.title || I18n.t('Enter value')));

        var wrap = U.el('div', 'add-wrap');
        if (cfg.hint) { wrap.appendChild(U.el('div', 'add-hint', cfg.hint)); }

        var input = document.createElement('input');
        input.id = 'entry-input';
        input.type = cfg.secret ? 'password' : 'text';
        input.className = 'focusable add-input';
        input.value = cfg.value || '';
        if (cfg.placeholder) { input.placeholder = cfg.placeholder; }
        input.__onselect = function () {
            input.focus();
            var n = input.value.length;
            try { input.setSelectionRange(n, n); } catch (e) {}
        };
        input.onkeydown = function (ev) {
            if (ev.keyCode === 13) { if (ev.stopPropagation) { ev.stopPropagation(); } doConfirm(); }
        };
        wrap.appendChild(input);

        var row = U.el('div', 'add-btn-row');
        var confirmBtn = U.el('div', 'pill focusable', I18n.t('Confirm'));
        var cancelBtn = U.el('div', 'pill focusable', I18n.t('Cancel'));
        confirmBtn.__onselect = doConfirm;
        cancelBtn.__onselect = function () { App.back(); };

        // Order: Validate · Confirm · Cancel
        var valBtn = null;
        if (cfg.validator) {
            valBtn = U.el('div', 'pill focusable', I18n.t('Validate'));
            valBtn.__onselect = function () {
                var v = ('' + input.value).trim();
                if (!v) { U.toast(I18n.t('Enter a key first')); return; }
                U.toast(I18n.t('Validating…'), 4000);
                cfg.validator(v).then(function (ok) {
                    U.toast(ok ? I18n.t('✓ Key is valid') : I18n.t('✗ Key rejected (or unreachable)'), 3500);
                });
            };
            row.appendChild(valBtn);
        }
        row.appendChild(confirmBtn);
        // From your phone (cfg.phone: what it's for): what's sent fills the field, to check and Confirm
        if (cfg.phone && V.phoneEntry) {
            var phoneBtn = U.el('div', 'pill focusable', I18n.t('▣  From your phone'));
            phoneBtn.__onselect = function () {
                var takes = cfg.phoneText;   // (text the caller takes as it is from the phone: an import's pasted file)
                V.phoneEntry({ title: cfg.title || I18n.t('Enter value'), what: cfg.phone, validate: function (t) { return takes && takes.accepts(t) ? null : (cfg.validate ? cfg.validate(t) : null); },
                    onText: function (t) { if (takes && takes.accepts(t)) { takes.take(t); return; } input.value = t; Focus.setFocus(confirmBtn); U.toast(I18n.t('From your phone: check it, then Confirm'), 3500); },
                    onType: function () { Focus.setFocus(input); } });
            };
            row.appendChild(phoneBtn);
        }
        row.appendChild(cancelBtn);
        wrap.appendChild(row);

        // DOWN from the field lands on Validate (or Confirm when there's no validator)
        input.__navDOWN = function () { Focus.setFocus(valBtn || confirmBtn); return true; };

        s.appendChild(wrap);
        Focus.setScope(s, input);

        function doConfirm() {
            var v = ('' + input.value).trim();
            var err = cfg.validate ? cfg.validate(v) : null;
            if (err) { U.toast(err); return; }
            cfg.onConfirm(v);
        }
    }

    // ================= SUBTITLE CONFIG =================
    // Every language player-lang recognizes on a track (its LANG_ALIASES), by name.
    var SUB_LANGS = [['off', I18n.t('Off')], ['afr', I18n.t('Afrikaans')], ['alb', I18n.t('Albanian')], ['ara', I18n.t('Arabic')],
        ['arg', I18n.t('Aragonese')], ['arm', I18n.t('Armenian')], ['ast', I18n.t('Asturian')], ['aze', I18n.t('Azerbaijani')],
        ['baq', I18n.t('Basque')], ['bel', I18n.t('Belarusian')], ['ben', I18n.t('Bengali')], ['bos', I18n.t('Bosnian')],
        ['bre', I18n.t('Breton')], ['bul', I18n.t('Bulgarian')], ['bur', I18n.t('Burmese')], ['cat', I18n.t('Catalan')],
        ['chi', I18n.t('Chinese')], ['hrv', I18n.t('Croatian')], ['cze', I18n.t('Czech')], ['dan', I18n.t('Danish')], ['prs', I18n.t('Dari')],
        ['dut', I18n.t('Dutch')], ['eng', I18n.t('English')], ['epo', I18n.t('Esperanto')], ['est', I18n.t('Estonian')],
        ['ext', I18n.t('Extremaduran')], ['fil', I18n.t('Filipino')], ['fin', I18n.t('Finnish')], ['fre', I18n.t('French')],
        ['glg', I18n.t('Galician')], ['geo', I18n.t('Georgian')], ['ger', I18n.t('German')], ['gre', I18n.t('Greek')],
        ['heb', I18n.t('Hebrew')], ['hin', I18n.t('Hindi')], ['hun', I18n.t('Hungarian')], ['ice', I18n.t('Icelandic')],
        ['ibo', I18n.t('Igbo')], ['ind', I18n.t('Indonesian')], ['ina', I18n.t('Interlingua')], ['gle', I18n.t('Irish')],
        ['ita', I18n.t('Italian')], ['jpn', I18n.t('Japanese')], ['kan', I18n.t('Kannada')], ['kaz', I18n.t('Kazakh')],
        ['khm', I18n.t('Khmer')], ['kor', I18n.t('Korean')], ['kur', I18n.t('Kurdish')], ['lav', I18n.t('Latvian')],
        ['lit', I18n.t('Lithuanian')], ['ltz', I18n.t('Luxembourgish')], ['mac', I18n.t('Macedonian')], ['may', I18n.t('Malay')],
        ['mal', I18n.t('Malayalam')], ['mni', I18n.t('Manipuri')], ['mar', I18n.t('Marathi')], ['mon', I18n.t('Mongolian')],
        ['mne', I18n.t('Montenegrin')], ['nav', I18n.t('Navajo')], ['nep', I18n.t('Nepali')], ['sme', I18n.t('Northern Sami')],
        ['nor', I18n.t('Norwegian')], ['oci', I18n.t('Occitan')], ['ori', I18n.t('Odia')], ['pus', I18n.t('Pashto')],
        ['per', I18n.t('Persian')], ['pol', I18n.t('Polish')], ['por', I18n.t('Portuguese')], ['pan', I18n.t('Punjabi')],
        ['rum', I18n.t('Romanian')], ['rus', I18n.t('Russian')], ['sat', I18n.t('Santali')], ['gla', I18n.t('Scottish Gaelic')],
        ['srp', I18n.t('Serbian')], ['snd', I18n.t('Sindhi')], ['sin', I18n.t('Sinhala')], ['slo', I18n.t('Slovak')],
        ['slv', I18n.t('Slovenian')], ['som', I18n.t('Somali')], ['spa', I18n.t('Spanish')], ['swa', I18n.t('Swahili')],
        ['swe', I18n.t('Swedish')], ['syr', I18n.t('Syriac')], ['tam', I18n.t('Tamil')], ['tat', I18n.t('Tatar')], ['tel', I18n.t('Telugu')],
        ['tha', I18n.t('Thai')], ['tok', I18n.t('Toki Pona')], ['tur', I18n.t('Turkish')], ['tuk', I18n.t('Turkmen')],
        ['ukr', I18n.t('Ukrainian')], ['urd', I18n.t('Urdu')], ['uzb', I18n.t('Uzbek')], ['vie', I18n.t('Vietnamese')],
        ['wel', I18n.t('Welsh')]];
    // A second choice, turned on when nothing is in the default language (from any source).
    var SUB_LANGS2 = [['none', I18n.t('None')]].concat(SUB_LANGS.slice(1));
    // The subtitle menu with only the three languages above (and tracks of no known language).
    var SUB_ONLY = [['off', I18n.t('Off')], ['on', I18n.t('On')]];
    var SUB_SIZES = [['small', I18n.t('Small')], ['medium', I18n.t('Medium')], ['large', I18n.t('Large')], ['xlarge', I18n.t('Extra Large')]];

    function labelFor(list, v) {
        for (var i = 0; i < list.length; i++) { if (list[i][0] === v) { return list[i][1]; } }
        return v;
    }
    // A player setting row; OK opens a scrollable list picker. `store` ({get, set})
    // defaults to the subtitle settings.
    function subPickRow(caption, list, key, store) {
        store = store || { get: Player.getSubCfg, set: Player.setSubCfg };
        var row = U.el('div', 'addon-item focusable cfg-row');
        var name = U.el('div', 'a-name');
        function render() { name.textContent = caption + ':  ' + labelFor(list, store.get()[key]); }
        render();
        row.appendChild(name);
        row.appendChild(U.el('div', 'a-url', I18n.t('Press OK to choose') + (store.warning ? '. ' + store.warning : '')));
        row.__onselect = function () {
            pickList(caption, list, store.get()[key], function (v) {
                var cfg = store.get(); cfg[key] = v; store.set(cfg);
                render();
            });
        };
        return row;
    }

    // Audio: same languages as subtitles, with "use the first track" in place of Off, and
    // a second choice for when the first isn't on the stream.
    var AUDIO_LANGS = [['default', I18n.t('Default (first track)')]].concat(SUB_LANGS.slice(1));
    var AUDIO_LANGS2 = [['none', I18n.t('None')]].concat(SUB_LANGS.slice(1));
    // Switching to it, one choice: Quick (picked before it plays; a later switch reloads at
    // once), or Safe (picked once it plays) whose reload waits 3, 6 or 10 s after a start or a
    // jump: the 2017 TV's player crashes on a jump made right after another (10 s it needed).
    var AUDIO_SWITCH = [['quick', I18n.t('Quick (no wait)')], ['safe3', I18n.t('Safe, waits 3 seconds')], ['safe6', I18n.t('Safe, waits 6 seconds')], ['safe10', I18n.t('Safe, waits 10 seconds (safest)')]];
    function settingsAudio(wrap) {
        var store = { get: Player.getAudioCfg, set: Player.setAudioCfg };
        var switching = {
            get: function () { var a = Player.getAudioCfg(); return { mode: a.switch === 'quick' ? 'quick' : 'safe' + a.wait }; },
            set: function (cfg) {
                var a = Player.getAudioCfg(), quick = cfg.mode === 'quick';
                a.switch = quick ? 'quick' : 'safe';
                a.wait = quick ? 0 : (parseInt(('' + cfg.mode).slice(4), 10) || 10);
                Player.setAudioCfg(a);
            }
        };
        wrap.appendChild(U.el('h2', null, I18n.t('Audio')));
        wrap.appendChild(subPickRow(I18n.t('Preferred language'), AUDIO_LANGS, 'lang', store));
        wrap.appendChild(subPickRow(I18n.t('Second choice'), AUDIO_LANGS2, 'lang2', store));
        wrap.appendChild(subPickRow(I18n.t('Switching to it'), AUDIO_SWITCH, 'mode', switching));
        wrap.appendChild(U.el('div', 'hint',
            I18n.t('The track in your preferred language plays on its own; with none, the second choice. The red key switches while watching. ') +
            I18n.t('Switching to it: Quick starts in your language at once. Safe is for files where Quick names your language but you hear another (the 2017 TV needs 10 seconds).')));
        focusSettings();
    }

    // Appearance: background and accent color, applied right away and at every launch.
    var ACCENT_NAMES = { indigo: I18n.t('Indigo (default)'), sky: I18n.t('Sky'), teal: I18n.t('Teal'), emerald: I18n.t('Emerald'),
        amber: I18n.t('Amber'), orange: I18n.t('Orange'), rose: I18n.t('Rose'), violet: I18n.t('Violet'), gray: I18n.t('Gray'), darkgray: I18n.t('Dark gray') };
    // darkest to lightest (Dark is the default)
    var BACKGROUNDS = [['black', I18n.t('Black'), null, '#000000'], ['dark', I18n.t('Dark'), null, '#0e1117'],
        ['gray', I18n.t('Light Gray'), null, '#e4e6ea'], ['white', I18n.t('White'), null, '#ffffff']];
    function appearance() {
        var p = Stremio.getPrefs();
        var accent = p.accent, bg = p.bg;
        var bgs = { dark: 1, black: 1, gray: 1, white: 1 };
        return { accent: ACCENT_NAMES[accent] ? accent : 'indigo', bg: bgs[bg] ? bg : 'dark' };
    }
    // Zoom: everything bigger (see U.setZoom), in percent.
    var ZOOMS = [['100', '100%'], ['110', '110%'], ['120', '120%'], ['130', '130%'], ['140', '140%']];
    function zoomPct() { return Stremio.getPrefs().zoom; }
    function applyAppearance() {
        var a = appearance();
        U.applyTheme(a.accent, a.bg);
        U.setZoom(zoomPct() / 100);
    }
    function settingsAppearance(wrap) {
        var store = { get: appearance, set: function (cfg) {
            Stremio.setPref('accent', cfg.accent);
            Stremio.setPref('bg', cfg.bg);
            applyAppearance();
        } };
        var accents = U.ACCENT_KEYS.map(function (k) { return [k, ACCENT_NAMES[k] || k, null, U.accentColor(k)]; });
        wrap.appendChild(U.el('h2', null, I18n.t('Appearance')));
        var language = U.el('div', 'addon-item focusable cfg-row');
        language.setAttribute('data-action', 'interface-language');
        language.appendChild(U.el('div', 'a-name', I18n.t('Interface language') + ': ' + (I18n.language() === 'en' ? I18n.t('English') : 'Português (Brasil)')));
        language.appendChild(U.el('div', 'a-url', I18n.t('Choose the interface language. The app will restart.')));
        language.__onselect = function () {
            pickList(I18n.t('Interface language'), [['pt-BR', 'Português (Brasil)'], ['en', I18n.t('English')]], I18n.language(), function (v) {
                if (I18n.setLanguage(v)) { window.location.reload(); }
                else { U.toast(I18n.t('Could not save the language: storage is full or unavailable.')); }
            });
        };
        wrap.appendChild(language);
        wrap.appendChild(subPickRow(I18n.t('Background'), BACKGROUNDS, 'bg', store));
        wrap.appendChild(subPickRow(I18n.t('Accent color'), accents, 'accent', store));
        wrap.appendChild(subPickRow(I18n.t('Zoom'), ZOOMS, 'zoom', {
            get: function () { return { zoom: '' + zoomPct() }; },
            set: function (cfg) { Stremio.setPref('zoom', +cfg.zoom); applyAppearance(); }
        }));
        wrap.appendChild(subPickRow(I18n.t('Poster orientation'), POSTER_SHAPES, 'posterShape', {
            get: function () { return { posterShape: Stremio.getPrefs().posterShape }; },
            set: function (cfg) { Stremio.setPref('posterShape', cfg.posterShape); markHomeDirty(); }   // Home redraws on return
        }));
        wrap.appendChild(subPickRow(I18n.t('Ratings on posters'), [['off', I18n.t('Off')], ['on', I18n.t('On')]], 'posterRatings', {
            get: function () { return { posterRatings: Stremio.getPrefs().posterRatings ? 'on' : 'off' }; },
            set: function (cfg) { Stremio.setPref('posterRatings', cfg.posterRatings === 'on'); markHomeDirty(); }
        }));
        wrap.appendChild(subPickRow(I18n.t('Hide spoilers'), [['off', I18n.t('Off')], ['pictures', I18n.t('Pictures')], ['all', I18n.t('Pictures and synopses')]], 'spoilers', {
            get: function () { return { spoilers: Stremio.getPrefs().spoilers }; },
            set: function (cfg) { Stremio.setPref('spoilers', cfg.spoilers); }
        }));
        focusSettings();
    }
    // Home: the tab a launch opens on, how many titles a row holds, the TV's home bar, and the
    // pages ordering the top menu, the Home rows and the Search rows.
    function settingsHome(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Home')));
        wrap.appendChild(subPickRow(I18n.t('Start on'), V.HOME_TABS.map(function (t) { return [t.key, t.label]; }), 'startTab', {
            get: function () { return { startTab: Stremio.getPrefs().startTab }; },
            set: function (cfg) { Stremio.setPref('startTab', cfg.startTab); }   // (the next launch: Home stays where it is now)
        }));
        wrap.appendChild(subPickRow(I18n.t('Titles in a Home row'), [['30', '30'], ['50', '50'], ['100', '100'], ['200', '200'], ['all', I18n.t('Unlimited')]], 'rowCards', {
            warning: I18n.t('Unlimited: Home can take much longer to load, an addon may refuse so many requests, and very long rows can slow an older TV'),
            get: function () { return { rowCards: '' + Stremio.getPrefs().rowCards }; },
            set: function (cfg) { Stremio.setPref('rowCards', cfg.rowCards === 'all' ? 'all' : +cfg.rowCards); clearCatalogCache(); }   // (the rows read again, with more pages or fewer)
        }));
        if (typeof HubPreview !== 'undefined' && HubPreview.available()) {   // (the sideloaded app: see js/hubpreview.js)
            // one choice: the tiles' order, or none (sent at once, whatever the wait)
            wrap.appendChild(subPickRow(I18n.t('Home bar preview'), [['recent', I18n.t('Most recent first')], ['watching', I18n.t('As in Watching')], ['off', I18n.t('Off')]], 'homeBar', {
                get: function () { var p = Stremio.getPrefs(); return { homeBar: p.homePreview ? p.homePreviewOrder : 'off' }; },
                set: function (cfg) {
                    Stremio.setPref('homePreview', cfg.homeBar !== 'off');
                    if (cfg.homeBar !== 'off') { Stremio.setPref('homePreviewOrder', cfg.homeBar === 'watching' ? 'watching' : 'recent'); }
                    HubPreview.send(true);
                }
            }));
        }
        var menu = sectionRow(I18n.t('Menu  ›'), I18n.t('Order the top menu, and show or hide its tabs'), 'menuorder');
        menu.className += ' cfg-row';
        wrap.appendChild(menu);
        var feeds = sectionRow(I18n.t('Home feeds  ›'), I18n.t('Order the Home rows, and show or hide each one'), 'feeds');
        feeds.className += ' cfg-row';
        wrap.appendChild(feeds);
        var sfeeds = sectionRow(I18n.t('Search results  ›'), I18n.t('Order the Search rows (one per catalog that can search), and show or hide each one'), 'searchfeeds');
        sfeeds.className += ' cfg-row';
        wrap.appendChild(sfeeds);
        var back = _focusChild === 'menuorder' ? menu : _focusChild === 'feeds' ? feeds : _focusChild === 'searchfeeds' ? sfeeds : null;
        _focusChild = null;
        if (back) { Focus.setScope(scr('settings'), back); } else { focusSettings(); }
    }

    // Formats: what plays on this TV. At the top, your settings: whether failures mark
    // formats "Not working" on their own, and which resolutions are allowed. Below, what's
    // been learned, filling in as sources are played: a format is "Working" once a source
    // with it plays, "Not working" after failed starts that point at it. OK switches one
    // between Working and Not working (your choice then sticks); sources with a "Not
    // working" format or a resolution you don't allow go to the bottom of the source list.
    var FORMAT_GROUPS = [I18n.t('Video profile'), I18n.t('Video'), 'HDR', I18n.t('Audio'), I18n.t('File'), I18n.t('Other')];
    var FORMAT_STATUS = { ok: I18n.t('Working'), bad: I18n.t('Not working'), unknown: I18n.t('Not sure yet') };
    function settingsFormats(wrap, focusKey) {
        wrap.appendChild(U.el('h2', null, I18n.t('Formats')));
        var pref = null;
        function row(key, name, sub, cls, onSelect) {
            var r = U.el('div', 'addon-item focusable cfg-row format-row ' + cls);
            r.setAttribute('data-fk', key);
            r.appendChild(U.el('div', 'a-name', name));
            r.appendChild(U.el('div', 'a-url', sub));
            r.__onselect = function () { onSelect(); redrawFormats(key); };
            if (key === focusKey) { pref = r; }
            wrap.appendChild(r);
            return r;
        }
        // automatic "Not working" (what's already known stays either way)
        var auto = Stremio.getPrefs().formatsAuto;
        row('auto', I18n.t('Mark “Not working” automatically:  ') + (auto ? I18n.t('On') : I18n.t('Off')),
            auto ? I18n.t('Formats that keep failing to start are marked Not working   ·   OK to turn off')
                 : I18n.t('Failures aren’t recorded; what’s marked stays, and what plays still counts   ·   OK to turn on'),
            'format-' + (auto ? 'ok' : 'unknown'), function () { Stremio.setPref('formatsAuto', !auto); });

        // allowed resolutions: yours to set, all allowed to begin with
        wrap.appendChild(U.el('div', 'formats-group', I18n.t('Resolutions')));
        Stremio.resList().forEach(function (r) {
            row('res:' + r.res, r.label + ':  ' + (r.allowed ? I18n.t('Allowed') : I18n.t('Not allowed')),
                (r.res === 0 ? I18n.t('Sources that don’t say   ·   ') : '') + I18n.t('OK to ') + (r.allowed ? I18n.t('not allow it') : I18n.t('allow it')),
                'format-' + (r.allowed ? 'ok' : 'bad'), function () { Stremio.setResAllowed(r.res, !r.allowed); });
        });

        var list = Stremio.formatList();
        if (!list.length) {
            wrap.appendChild(U.el('div', 'hint',
                I18n.t('No formats yet. Each time you play a source, its formats are added here: its video profile ') +
                I18n.t('(resolution, codec, bit depth, HDR), audio and file type, as working, or not working if it won’t start.')));
        }
        FORMAT_GROUPS.forEach(function (g) {
            var items = list.filter(function (f) { return f.group === g; });
            if (!items.length) { return; }
            items.sort(function (a, b) { return (a.order - b.order) || (a.label < b.label ? -1 : 1); });   // profiles: 4K first
            wrap.appendChild(U.el('div', 'formats-group', g));
            items.forEach(function (f) {
                var sub = [];
                if (f.ok) { sub.push(I18n.t('played ') + f.ok + (f.ok > 1 ? I18n.t(' times') : I18n.t(' time'))); }
                if (f.fail) { sub.push(I18n.t('didn’t start ') + f.fail + (f.fail > 1 ? I18n.t(' times') : I18n.t(' time'))); }
                sub.push(f.set ? I18n.t('set by you') : I18n.t('OK to mark it ') + (f.status === 'ok' ? I18n.t('Not working') : I18n.t('Working')));
                row(f.key, f.label + ':  ' + FORMAT_STATUS[f.status], sub.join('   ·   '), 'format-' + f.status, function () {
                    Stremio.setFormat(f.key, f.status === 'ok' ? 'bad' : 'ok');
                });
            });
        });
        if (list.length) {
            var reset = U.el('div', 'addon-item focusable');
            reset.appendChild(U.el('div', 'a-name', I18n.t('Forget all formats')));
            reset.appendChild(U.el('div', 'a-url', I18n.t('Start learning again from the next source you play (resolutions stay as set)')));
            reset.__onselect = function () {
                confirm(I18n.t('Forget what’s known about every format?'), I18n.t('Forget'), function () { Stremio.resetFormats(); redrawFormats(null); });
            };
            wrap.appendChild(reset);
        }
        wrap.appendChild(U.el('div', 'hint',
            I18n.t('Sources at a resolution that isn’t allowed, or with a “Not working” format, go to the bottom of the ') +
            I18n.t('source list; ▶ Play best and Next episode skip them.')));
        if (pref) { Focus.setScope(scr('settings'), pref); } else { focusSettings(); }
    }
    function redrawFormats(focusKey) {
        var s = scr('settings'), wrap = s.querySelector('.settings-wrap');
        U.clear(wrap);
        settingsFormats(wrap, focusKey);
    }

    // ================= SETTINGS (sectioned) =================
    var _settingsSection = 'menu';

    function settingsRoot() { _settingsSection = 'menu'; renderSettings(); }

    // Focus the first item in the settings content (not the top menu) so UP reaches the menu.
    function focusSettings() {
        var s = scr('settings');
        Focus.setScope(s, s.querySelector('.settings-wrap .focusable') || undefined);
    }

    // Settings is five groups (Content, Playback, Appearance, Home, Diagnostics); each opens a page
    // of its sections. [title, description, section] rows; Appearance and Home are pages of their
    // own (their settings right on them; Home's Menu, Home feeds and Search results open pages).
    var SETTINGS_GROUPS = {
        content: { title: I18n.t('Content'), rows: [
            [I18n.t('Addons'), I18n.t('Catalog, stream & subtitle addons'), 'addons'],
            [I18n.t('Streaming server'), I18n.t('Stremio’s streaming server or TorrServer on your network: torrents, and videos the TV can’t play'), 'server'],
            [I18n.t('Integrations'), I18n.t('API keys (OMDb, TMDB, MDBList), where-to-watch country'), 'integrations'],
            ['IPTV', I18n.t('Manage M3U playlist URLs'), 'iptv'],
            ['YouTube', I18n.t('Your YouTube channels, playlists and searches; YouTube in Search'), 'youtube'],
            [I18n.t('Streaming apps'), I18n.t('Your apps (Prime Video, Netflix, …) that open a title\'s "where to watch" sources'), 'appshortcuts'],
            [I18n.t('USB drive'), I18n.t('The Local tab: what\'s on your drive, matched to titles; hidden files'), 'usb'],
            [I18n.t('Import configuration file'), I18n.t('Import addons, API keys & IPTV playlists'), 'import'],
            [I18n.t('Export configuration'), I18n.t('Your addons, playlists, API keys and settings, to your phone'), 'export']] },
        playback: { title: I18n.t('Playback'), rows: [
            [I18n.t('Audio'), I18n.t('Preferred and second-choice audio language'), 'audio'],
            [I18n.t('Subtitles'), I18n.t('Default language, size, color, background, position, font'), 'subtitles'],
            [I18n.t('Skipping'), I18n.t('Intros, recaps and previews, and the next episode at the credits: ask, or on their own after a countdown'), 'skipping'],
            [I18n.t('Seeking & buffering'), I18n.t('How far ◀ ▶ jump; a bigger buffer for slow connections; reconnecting live channels'), 'seeking'],
            [I18n.t('Source ranking'), I18n.t('How sources are ordered (played before, resolution, release type…), and your addons: their order, on or off'), 'ranking'],
            [I18n.t('Formats'), I18n.t('Allowed resolutions, and what plays on this TV, learned as you watch'), 'formats'],
            [I18n.t('Private viewing'), I18n.t('Play without anything recorded: no progress, Continue Watching, watched marks or Trakt'), 'private']] },
        diagnostics: { title: I18n.t('Diagnostics'), rows: [
            [I18n.t('Logs'), I18n.t('Recent problems (failed downloads, playback and script errors), secrets masked; how long launches took'), 'logs'],
            [I18n.t('Storage'), I18n.t('What StremioK keeps on the TV; the TV’s database: on or off, tidying it up; clearing saved copies'), 'storage'],
            [I18n.t('Installed apps'), I18n.t('The TV’s apps with their IDs; OK on one opens it'), 'tvapps']] }
    };

    // Return true if BACK stepped a settings section back to the menu.
    // BACK goes up one level, onto the row it came from: from a section to its group (on
    // that section, not the first one), from Menu / Home feeds / Search results to Home,
    // from a group to the Settings list (on that group).
    var SECTION_PARENT = { menuorder: 'home', feeds: 'home', searchfeeds: 'home', aiomanager: 'addons', subtitlelook: 'subtitles', rankfilters: 'ranking', rankplay: 'ranking' };
    Object.keys(SETTINGS_GROUPS).forEach(function (g) {
        SETTINGS_GROUPS[g].rows.forEach(function (row) { SECTION_PARENT[row[2]] = g; });
    });
    var _focusChild = null;   // the section whose row to focus when back on its parent
    function backInSettings() {
        if (_settingsSection === 'menu') { return false; }
        _focusChild = _settingsSection;
        _settingsSection = SECTION_PARENT[_settingsSection] || 'menu';
        renderSettings();
        return true;
    }

    var _crumbSection = null;
    function renderSettings() {
        if (_settingsSection !== _crumbSection) { _crumbSection = _settingsSection; U.crumb('settings: ' + _settingsSection); }
        var s = scr('settings');
        U.clear(s);
        s.appendChild(buildTopMenu('settings'));   // shared top menu (UP reaches it; no Back button)
        var wrap = U.el('div', 'settings-wrap');
        s.appendChild(wrap);
        if (_settingsSection === 'addons') { settingsAddons(wrap); }
        else if (_settingsSection === 'iptv') { settingsIptv(wrap); }
        else if (_settingsSection === 'youtube') { settingsYouTube(wrap); }
        else if (_settingsSection === 'integrations') { settingsIntegrations(wrap); }
        else if (_settingsSection === 'audio') { settingsAudio(wrap); }
        else if (_settingsSection === 'subtitles') { settingsSubtitles(wrap); }
        else if (_settingsSection === 'subtitlelook') { settingsSubtitleLook(wrap); }
        else if (_settingsSection === 'skipping') { settingsSkipping(wrap); }
        else if (_settingsSection === 'seeking') { settingsSeeking(wrap); }
        else if (_settingsSection === 'menuorder') { settingsFeeds(wrap, 'menu'); }
        else if (_settingsSection === 'feeds') { settingsFeeds(wrap, 'home'); }
        else if (_settingsSection === 'searchfeeds') { settingsFeeds(wrap, 'search'); }
        else if (_settingsSection === 'ranking') { settingsFeeds(wrap, 'ranking'); }
        else if (_settingsSection === 'rankfilters') { settingsRankFilters(wrap); }
        else if (_settingsSection === 'rankplay') { settingsRankPlay(wrap); }
        else if (SETTINGS_GROUPS[_settingsSection]) { settingsGroup(wrap, _settingsSection); }
        else if (_settingsSection === 'logs') { settingsLogs(wrap); }
        else if (_settingsSection === 'storage') { settingsStorage(wrap); }
        else if (_settingsSection === 'tvapps') { settingsTvApps(wrap); }
        else if (_settingsSection === 'usb') { settingsUsb(wrap); }
        else if (_settingsSection === 'private') { settingsPrivate(wrap); }
        else if (_settingsSection === 'appshortcuts') { settingsAppShortcuts(wrap); }
        else if (_settingsSection === 'import') { settingsImport(wrap); }
        else if (_settingsSection === 'export') { settingsExport(wrap); }
        else if (_settingsSection === 'aiomanager') { settingsAiom(wrap); }
        else if (_settingsSection === 'server') { settingsServer(wrap); }
        else if (_settingsSection === 'appearance') { settingsAppearance(wrap); }
        else if (_settingsSection === 'home') { settingsHome(wrap); }
        else if (_settingsSection === 'formats') { settingsFormats(wrap); }
        else { settingsMenu(wrap); }
        var ver = appVersion();
        if (ver) { s.appendChild(U.el('div', 'settings-version', I18n.t('StremioK ') + ver)); }
    }

    // The app version, from the ?v= cache-buster build.sh stamps on every script tag
    // (kept in sync with package.json / config.xml; works on TizenBrew and desktop too).
    function appVersion() {
        var tag = document.querySelector('script[src*="views.js"]');
        var m = tag && /[?&]v=([0-9][0-9A-Za-z.-]*)/.exec(tag.getAttribute('src') || '');
        return m ? m[1] : '';
    }

    function sectionRow(title, sub, section) {
        var r = U.el('div', 'addon-item focusable');
        r.setAttribute('data-section', section);
        r.appendChild(U.el('div', 'a-name', title));
        if (sub) { r.appendChild(U.el('div', 'a-url', sub)); }
        r.__onselect = function () { _settingsSection = section; renderSettings(); };
        return r;
    }

    // Settings > IPTV's status line while playlists are read (one listener for the app).
    var _iptvStatusEl = null;
    if (typeof IPTV !== 'undefined' && IPTV.onProgress) {
        IPTV.onProgress(function (n) {
            var el = _iptvStatusEl;
            if (el && document.documentElement.contains(el) && /^(Checking|Reading)/.test(el.textContent)) {
                el.textContent = I18n.t('Reading playlists…  ') + ('' + n).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + I18n.t(' channels');
            }
        });
    }

    // TizenBrew serves every module from the same address, so they all share one storage:
    // another module you install can read what StremioK saves (see the README).
    var TIZENBREW_NOTE = I18n.t('⚠ Installed with TizenBrew: other TizenBrew modules can read what StremioK saves, including API keys and addon links with their tokens. Only install modules you trust; the sideloaded app keeps its data to itself.');
    function settingsMenu(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Settings')));
        wrap.appendChild(sectionRow(I18n.t('Content'), I18n.t('Addons, API keys, IPTV playlists, streaming apps, importing a configuration file'), 'content'));
        wrap.appendChild(sectionRow(I18n.t('Playback'), I18n.t('Audio and subtitles, source ranking, feed sources, formats'), 'playback'));
        wrap.appendChild(sectionRow(I18n.t('Appearance'), I18n.t('Background, accent color, zoom, posters, spoilers'), 'appearance'));
        wrap.appendChild(sectionRow(I18n.t('Home'), I18n.t('The tab it opens on, the top menu, Home feeds, Search results'), 'home'));
        wrap.appendChild(sectionRow(I18n.t('Diagnostics'), I18n.t('Logs, storage, installed apps; how StremioK was installed'), 'diagnostics'));
        if (typeof YTPlay !== 'undefined' && YTPlay.installMode && YTPlay.installMode() === 'tizenbrew') { wrap.appendChild(U.el('div', 'hint', TIZENBREW_NOTE)); }
        focusBack(wrap);
    }
    // Back from a section: on its row (not the first one).
    function focusBack(wrap) {
        var backTo = null, rowsNow = wrap.querySelectorAll('.addon-item');
        for (var bi = 0; _focusChild && bi < rowsNow.length; bi++) { if (rowsNow[bi].getAttribute('data-section') === _focusChild) { backTo = rowsNow[bi]; } }
        _focusChild = null;
        if (backTo) { Focus.setScope(scr('settings'), backTo); } else { focusSettings(); }
    }
    // A group's page: its sections; Diagnostics also says how StremioK was installed.
    function settingsGroup(wrap, key) {
        var g = SETTINGS_GROUPS[key];
        wrap.appendChild(U.el('h2', null, g.title));
        g.rows.forEach(function (row) { wrap.appendChild(sectionRow(row[0], row[1], row[2])); });
        if (key === 'diagnostics') {
            if (typeof YTPlay !== 'undefined' && YTPlay.installMode && YTPlay.installMode() === 'tizenbrew') { wrap.appendChild(U.el('div', 'hint', TIZENBREW_NOTE)); }
            // How StremioK was installed, and whether its YouTube service (channels, trailers) answers
            if (typeof YTPlay !== 'undefined' && YTPlay.installLabel) {
                var about = U.el('div', 'hint settings-about', I18n.t('Installed as: ') + YTPlay.installLabel() + I18n.t('   ·   YouTube service: checking…'));
                wrap.appendChild(about);
                YTPlay.isRunning().then(function (up) {
                    about.textContent = I18n.t('Installed as: ') + YTPlay.installLabel() + I18n.t('   ·   YouTube service: ') +
                        (up ? 'running' : YTPlay.installMode() === 'wgt' ? I18n.t('starts when needed') : I18n.t('not running'));
                });
            }
        }
        focusBack(wrap);
    }

    var _addonFocus = null;   // { url, ctl }: the ▲ / ▼ just pressed, focused again once redrawn
    // What an addon gives StremioK, from its manifest: catalogs (how many), search, details,
    // sources, subtitles; and the kinds of titles.
    var TYPE_NAMES = { movie: I18n.t('Movies'), series: I18n.t('Series'), anime: I18n.t('Anime'), tv: 'TV', channel: I18n.t('Channels'), events: I18n.t('Events'), sport: I18n.t('Sports'), radio: I18n.t('Radio'), other: I18n.t('Other') };
    function addonGives(m) {
        var res = (m.resources || []).map(function (r) { return typeof r === 'string' ? r : r && r.name; });
        var cats = m.catalogs || [], bits = [], types = [];
        if (cats.length) { bits.push(I18n.t('Catalogs (') + cats.length + ')'); }
        if (cats.some(function (c) { return (c.extra || []).some(function (e) { return e && e.name === 'search'; }) || (c.extraSupported || []).indexOf('search') !== -1; })) { bits.push(I18n.t('Search')); }
        if (res.indexOf('meta') !== -1) { bits.push(I18n.t('Details')); }
        if (res.indexOf('stream') !== -1) { bits.push(I18n.t('Sources')); }
        if (res.indexOf('subtitles') !== -1) { bits.push(I18n.t('Subtitles')); }
        (m.types || []).forEach(function (t) {
            var n = TYPE_NAMES[t] || (('' + t).charAt(0).toUpperCase() + ('' + t).slice(1));
            if (types.indexOf(n) === -1) { types.push(n); }
        });
        return I18n.t('Gives: ') + (bits.length ? bits.join(' · ') : I18n.t('nothing StremioK uses')) + (types.length ? '   ·   ' + types.slice(0, 8).join(', ') : '');
    }
    // An addon's logo tile: its initial (the first character, an emoji whole; "?" for one that
    // didn't load; drawn by the CSS from data-initial, so the row's text is still its name),
    // and over it the logo from its manifest (Stremio.addonLogo), loaded with the other
    // artwork; one that can't load is taken away, leaving the initial.
    function addonTile(m, url) {
        var name = ('' + ((m && m.name) || '')).replace(/^\s+/, ''), c = name.charCodeAt(0);
        var tile = U.el('div', 'addon-logo');
        tile.setAttribute('data-initial', !m ? '?' : name ? name.slice(0, c >= 0xD800 && c <= 0xDBFF ? 2 : 1).toUpperCase() : 'A');
        var src = Stremio.addonLogo ? Stremio.addonLogo(m, url) : null;
        if (src) {
            var img = document.createElement('img');
            img.onload = function () { tile.className = 'addon-logo loaded'; };
            img.onerror = function () { if (img.parentNode) { img.parentNode.removeChild(img); } tile.className = 'addon-logo'; };
            tile.appendChild(img);
            U.deferImage(img, src);
        }
        return tile;
    }
    function settingsAddons(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Addons')));
        // Home-network links from addons on the internet (see Stremio.blocksLocal)
        var allow = !!Stremio.getPrefs().allowLocal;
        var lan = U.el('div', 'addon-item focusable cfg-row');
        lan.appendChild(U.el('div', 'a-name', I18n.t('Local-network links from internet addons:  ') + (allow ? I18n.t('Allowed') : I18n.t('Blocked'))));
        lan.appendChild(U.el('div', 'a-url', (allow ? I18n.t('An addon on the internet may send links into your home network (router, NAS, cameras…)')
            : I18n.t('Links an internet addon points into your home network are left out (your own network’s addons and playlists aren’t affected)')) +
            I18n.t('   ·   OK to ') + (allow ? 'block' : 'allow')));
        lan.__onselect = function () { Stremio.setAllowLocal(!allow); clearCatalogCache(); renderSettings(); };
        wrap.appendChild(lan);
        wrap.appendChild(subPickRow(I18n.t('Wait for addons'), ADDON_WAITS, 'addonWait', {
            get: function () { return { addonWait: '' + Stremio.getPrefs().addonWait }; },
            set: function (cfg) { Stremio.setPref('addonWait', +cfg.addonWait || 0); }
        }));
        Stremio.loadAddons().then(function (addons) {
            var urls = Stremio.getAddonUrls(), want = null;
            if (urls.length > 1) { wrap.appendChild(U.el('div', 'hint', I18n.t('▲ / ▼ set the order: a title\'s details come from the highest addon that has them (its page says which), and the higher addon comes first where several answer.'))); }
            urls.forEach(function (url) {
                var off = !!(Stremio.isAddonOff && Stremio.isAddonOff(url)), kept = off && Stremio.savedManifest ? Stremio.savedManifest(url) : null;
                var loaded = addons.find(function (a) { return a.url === url; }) || (kept ? { url: url, manifest: kept } : null);   // (one that's off: its saved manifest)
                var frow = U.el('div', 'feed-row playlist-row' + (off ? ' feed-off' : ''));
                var btns = orderButtons(function (dir, ctl) { if (Stremio.moveAddon(url, dir)) { _addonFocus = { url: url, ctl: ctl }; refreshAddonRows(); renderSettings(); } });
                var item = U.el('div', 'addon-item focusable playlist-item has-logo');
                item.appendChild(addonTile(loaded && loaded.manifest, url));
                var why = !loaded && Stremio.manifestProblem ? Stremio.manifestProblem(url) : '';   // "too large (over 2 MB)", "not an addon manifest"…
                var nm = U.el('div', 'a-name', (loaded ? (loaded.manifest.name || I18n.t('Addon')) : off ? I18n.t('Addon') : I18n.t('(failed to load') + (why ? ': ' + why : '') + ')') + (off ? I18n.t('   (off)') : ''));
                var origin = Stremio.addonOrigin ? Stremio.addonOrigin(url) : '', ob = originBadge(origin);
                if (ob) { nm.appendChild(ob); }
                item.appendChild(nm);
                item.appendChild(U.el('div', 'a-url', U.redactUrl(url) + (origin ? '   ·   ' + ORIGIN_BADGE[origin][2] : '')));   // (personal tokens masked)
                if (loaded) { item.appendChild(U.el('div', 'a-url addon-gives', addonGives(loaded.manifest))); }
                var said = !loaded && Stremio.manifestDetail ? Stremio.manifestDetail(url) : '';   // the addon's own error message
                if (said) { item.appendChild(U.el('div', 'a-url addon-said', I18n.t('The addon says: ') + said)); }
                var note = Stremio.thirdPartyNote ? Stremio.thirdPartyNote(loaded ? loaded.manifest.id : url) : '';   // (WatchHub)
                if (note) { item.appendChild(U.el('div', 'a-url addon-said', '⚠ ' + note)); }
                var name = loaded ? (loaded.manifest.name || I18n.t('Addon')) : I18n.t('this addon');
                item.__onselect = function () {
                    addonActions(name, url);
                };
                if (urls.length > 1) { btns.forEach(function (b) { frow.appendChild(b); }); }
                frow.appendChild(item);
                wrap.appendChild(frow);
                if (_addonFocus && _addonFocus.url === url) { want = btns[ctlIndex(_addonFocus.ctl)]; }
            });

            var addRow = U.el('div', 'addon-item focusable add-row');
            addRow.appendChild(U.el('div', 'a-name', I18n.t('+  Add addon')));
            addRow.appendChild(U.el('div', 'a-url', I18n.t('Enter a Stremio addon manifest URL on its own page')));
            addRow.__onselect = function () {
                App.openEntry({
                    title: I18n.t('Add addon'), phone: 'addon',
                    hint: I18n.t('Type a Stremio addon manifest URL. Nothing is saved until you Confirm.'),
                    value: 'https://', placeholder: 'https://addon.example/manifest.json',
                    validate: function (v) { return U.urlProblem(v) || null; },   // (U.parseUrl: http(s), a real host, no user:password@)
                    onConfirm: function (v) {
                        var added = Stremio.addAddon(v), note = Stremio.thirdPartyNote(added || v);
                        refreshAddonRows(added || null);
                        U.toast(note ? I18n.t('Addon added. ') + note : I18n.t('Addon added'), note ? 8000 : undefined);
                        App.back(); renderSettings();
                    }
                });
            };
            wrap.appendChild(addRow);
            if (typeof StremioAccount !== 'undefined') {
                var acct = U.el('div', 'addon-item focusable add-row');
                var an = U.el('div', 'a-name', I18n.t('Import addons from your Stremio account'));
                an.appendChild(originBadge('stremio'));
                acct.appendChild(an);
                acct.appendChild(U.el('div', 'a-url', I18n.t('Sign in on your phone with a QR code, then tick the addons to add (StremioK signs out straight after)')));
                acct.__onselect = stremioImport;
                wrap.appendChild(acct);
            }
            if (typeof YTPlay !== 'undefined' && YTPlay.aiomAddons && YTPlay.installMode() !== 'browser') {
                var am = aiomSaved();
                var aio = U.el('div', 'addon-item focusable');
                aio.setAttribute('data-section', 'aiomanager');
                var aname = U.el('div', 'a-name', 'AIOManager' + (am.base ? '  ·  ' + shortHost(am.base) : ''));
                aname.appendChild(originBadge('aiomanager'));
                aio.appendChild(aname);
                aio.appendChild(U.el('div', 'a-url', am.base && am.key ? (am.at ? I18n.t('Last synced ') + U.dayLabel(am.at) + '   ·   ' : '') + I18n.t('OK for ↻ Sync: refresh, add new, remove the ones gone from it')
                    : I18n.t('Your AIOManager’s address and API key, then ↻ Sync your addons with it')));
                aio.__onselect = function () { _settingsSection = 'aiomanager'; renderSettings(); };
                wrap.appendChild(aio);
                if (_focusChild === 'aiomanager') { want = aio; _focusChild = null; }
            }

            wrap.appendChild(U.el('div', 'hint',
                I18n.t('StremioK hosts no content — add Stremio addon manifest URLs for catalogs, streams and subtitles.')));
            _addonFocus = null;
            if (want) { Focus.setScope(scr('settings'), want); } else { focusSettings(); }
        });
    }

    // Import addons from your Stremio account (js/stremio-account.js): a QR code of Stremio's
    // sign-in link, asked until you approve on your phone; then the account's addons to tick
    // (none ticked; yours already shown as such); the account signed out as soon as it's read.
    function stremioImport() {
        var existing = document.querySelector('.modal-overlay');
        if (existing) { existing.parentNode.removeChild(existing); }
        var overlay = U.el('div', 'modal-overlay'), box = U.el('div', 'modal-box');
        box.appendChild(U.el('div', 'modal-msg', I18n.t('Import addons from your Stremio account')));
        var body = U.el('div', 'trakt-connect');
        body.appendChild(U.el('div', 'tc-line', I18n.t('Asking Stremio for a code…')));
        box.appendChild(body);
        var row = U.el('div', 'modal-row'), cancel = U.el('div', 'pill focusable modal-btn', I18n.t('Cancel'));
        cancel.__onselect = function () { closeModal(); };
        row.appendChild(cancel);
        box.appendChild(row);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        showModal(overlay, cancel);
        var gone = false;
        onModalClose(function () { gone = true; });
        function stopped() { return gone; }
        function fail(e) {
            if (gone) { return; }
            U.clear(body);
            body.appendChild(U.el('div', 'tc-line', I18n.t('Couldn’t import: ') + ((e && e.message) || 'unknown')));
        }
        StremioAccount.start().then(function (c) {
            if (gone) { return; }
            U.clear(body);
            var qrSpot = U.el('div', 'tc-qr-spot');
            body.appendChild(qrSpot);
            var goTo = body.appendChild(U.el('div', 'tc-line', I18n.t('On your phone or computer, go to:')));
            (typeof qrcode !== 'undefined' ? Promise.resolve() : U.loadScript('js/qrcode.js')).then(function () {
                var qr = U.qrCanvas(c.link, 8);
                if (!qr || !qrSpot.parentNode) { return; }
                qr.className = 'tc-qr';
                qrSpot.appendChild(U.el('div', 'tc-line', I18n.t('Scan with your phone:')));
                qrSpot.appendChild(qr);
                goTo.textContent = I18n.t('or go to');
            }, function () {});
            body.appendChild(U.el('div', 'tc-url', c.link));
            body.appendChild(U.el('div', 'tc-line', I18n.t('Code:')));
            body.appendChild(U.el('div', 'tc-code', c.code));
            body.appendChild(U.el('div', 'tc-line small', I18n.t('Sign in to Stremio there and approve. Waiting…')));
            return StremioAccount.wait(c.code, stopped).then(function (key) {
                if (gone) { StremioAccount.signOut(key); return; }
                U.clear(body);
                body.appendChild(U.el('div', 'tc-line', I18n.t('Reading your addons…')));
                var read = StremioAccount.addons(key);
                read.then(function () { StremioAccount.signOut(key); }, function () { StremioAccount.signOut(key); });   // (signed out as soon as it's read)
                return read.then(function (list) {
                    if (gone) { return; }
                    if (!list.length) { fail(new Error('your account has no addons StremioK can use')); return; }
                    var mine = Stremio.getAddonUrls();
                    var items = list.map(function (x, i) {
                        var have = mine.indexOf(x.url) !== -1 || mine.indexOf(Stremio.normalizeUrl ? Stremio.normalizeUrl(x.url) : x.url) !== -1;
                        return { key: '' + i, label: x.name + '  ·  ' + shortHost(x.url), have: have };
                    });
                    closeModal();
                    pickMany(I18n.t('Your Stremio addons: tick the ones to add'), items, { button: function (n) { return I18n.t('Import ') + n + I18n.t(' addon') + (n === 1 ? '' : 's'); } }, function (keys) {
                        var n = 0, last = null;
                        keys.forEach(function (k) { var added = Stremio.addAddon(list[+k].url); if (added) { n++; last = added; if (Stremio.setAddonOrigin) { Stremio.setAddonOrigin(added, 'stremio'); } } });
                        clearCatalogCache();
                        refreshAddonRows(last);
                        U.toast(I18n.t('Imported ') + n + I18n.t(' addon') + (n === 1 ? '' : 's'), 3000);
                        renderSettings();
                    });
                });
            });
        }).then(null, function (e) { if (!e || e.message !== 'stopped') { fail(e); } });
    }
    function shortHost(u) { var p = U.parseUrl(u); return p ? p.host : ''; }

    // Settings › Addons › AIOManager (YTPlay.aiomAddons, through the service): its address and
    // the account's API key (kept, AIOM_KEY: { base, key, synced, at, count }), then ↻ Sync:
    // what it would do, none ticked: refresh the addons you share, add the ones you haven't
    // got, remove the ones that came from it (synced) and are gone or off there now. A key it
    // refuses is forgotten (the address stays) and asked for again.
    var AIOM_KEY = 'stremiokptbr.aiomanager';
    // Where an addon came from (Stremio.addonOrigin): a letter badge, and the words for it.
    var ORIGIN_BADGE = { stremio: ['S', 'src-s', I18n.t('From Stremio')], aiomanager: ['A', 'src-a', I18n.t('From AIOManager')], config: ['C', 'src-c', I18n.t('From a configuration file')] };
    function originBadge(kind) { var b = ORIGIN_BADGE[kind]; return b ? U.el('span', 'src-badge ' + b[1], b[0]) : null; }
    function aiomSaved() {
        var x = U.store.get(AIOM_KEY, {}) || {};
        return { base: typeof x.base === 'string' ? x.base : '', key: typeof x.key === 'string' ? x.key : '',
            synced: Array.isArray(x.synced) ? x.synced.filter(function (u) { return typeof u === 'string'; }) : [], at: +x.at || 0, count: +x.count || 0 };
    }
    function aiomSave(patch) {
        var x = aiomSaved();
        Object.keys(patch).forEach(function (k) { x[k] = patch[k]; });
        var out = {};
        Object.keys(x).forEach(function (k) { if (x[k] !== '' && x[k] !== 0 && !(Array.isArray(x[k]) && !x[k].length)) { out[k] = x[k]; } });
        U.store.set(AIOM_KEY, out);
    }
    // AIOManager's public instances (as its own docs list them: src/lib/instances.ts), beta ones
    // left out; then your own address (typed, or from your phone).
    var AIOM_PUBLIC = [['https://aiomanager.elfhosted.com', 'ElfHosted'], ['https://aiomanagerfortheweebs.midnightignite.me', 'Midnight’s'],
        ['https://aiomanager.fortheweak.cloud', 'Yeb’s'], ['https://aiomanager.stremio.ru', 'Kuu’s']];
    function aiomAskAddress(then) {
        var am = aiomSaved();
        pickList(I18n.t('Your AIOManager'), AIOM_PUBLIC.map(function (x) { return [x[0], x[1] + '  ·  ' + shortHost(x[0])]; })
            .concat([['other', I18n.t('Another address…  (your own: type it, or ▣ from your phone)')]]), am.base || null, function (k) {
            if (k === 'other') { aiomTypeAddress(then); return; }
            aiomSetBase(k);
            if (then) { then(); } else { renderSettings(); }
        });
    }
    // Another instance: its key and what came from the old one don't carry over.
    function aiomSetBase(base) {
        var am = aiomSaved();
        if (am.base && am.base !== base) { aiomSave({ base: base, key: '', synced: [], at: 0, count: 0 }); } else { aiomSave({ base: base }); }
    }
    function aiomTypeAddress(then) {
        var am = aiomSaved();
        App.openEntry({
            title: I18n.t('Your AIOManager’s address'), phone: 'aiom',
            hint: I18n.t('The address you open AIOManager at (your instance), e.g. https://aiomanager.example.com. Kept on the TV.'),
            value: am.base || 'https://', placeholder: 'https://aiomanager.example.com',
            validate: function (v) { return U.urlProblem(v) || null; },
            onConfirm: function (v) { aiomSetBase(('' + v).trim().replace(/\/+$/, '')); App.back(); if (then) { then(); } else { renderSettings(); } }
        });
    }
    function aiomAskKey(then) {
        App.openEntry({
            title: I18n.t('Your AIOManager API key'), phone: 'aiomkey', secret: true,
            hint: I18n.t('Your account’s API key, from AIOManager (the account’s settings). Kept on the TV like your other API keys; StremioK only reads your addons with it.'),
            value: '', placeholder: I18n.t('API key'),
            validate: function (v) { return /^[\x21-\x7e]{6,300}$/.test(('' + v).trim()) ? null : I18n.t('That doesn’t look like an API key'); },
            onConfirm: function (v) { aiomSave({ key: ('' + v).trim() }); App.back(); if (then) { then(); } else { renderSettings(); } }
        });
    }
    function settingsAiom(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Addons  ›  AIOManager')));
        wrap.appendChild(U.el('div', 'hint', I18n.t('Your addons from AIOManager: its address and your account’s API key, then ↻ Sync. Each change is yours to tick; nothing is sent back to AIOManager.')));
        var am = aiomSaved();
        function row(name, sub, fn) {
            var r = U.el('div', 'addon-item focusable cfg-row');
            r.appendChild(U.el('div', 'a-name', name));
            if (sub) { r.appendChild(U.el('div', 'a-url', sub)); }
            r.__onselect = fn;
            wrap.appendChild(r);
            return r;
        }
        row(I18n.t('Address:  ') + (am.base || I18n.t('Not set')), I18n.t('Your AIOManager instance   ·   OK to ') + (am.base ? 'change' : 'set'), function () { aiomAskAddress(); });
        row(I18n.t('API key:  ') + (am.key ? '••••' + am.key.slice(-4) : I18n.t('Not set')), I18n.t('Your account’s, from AIOManager   ·   OK to ') + (am.key ? 'change' : 'set'), function () { aiomAskKey(); });
        if (am.base && am.key) {
            row(I18n.t('↻  Sync with AIOManager'), (am.at ? I18n.t('Last synced ') + U.dayLabel(am.at) + (am.count ? '   ·   ' + am.count + I18n.t(' addon') + (am.count === 1 ? '' : 's') + I18n.t(' in AIOManager') : '') : I18n.t('Not synced yet')) +
                I18n.t('   ·   refresh, add new, remove the ones gone from it'), aiomSync);
        }
        if (am.base || am.key) {
            row(I18n.t('Forget AIOManager'), I18n.t('Its address, your API key and what came from it, cleared (your addons stay)'), function () { U.store.remove(AIOM_KEY); U.toast(I18n.t('AIOManager forgotten'), 2500); renderSettings(); });
        }
        focusSettings();
    }
    function aiomSync() {
        var am = aiomSaved();
        if (!am.base) { aiomAskAddress(aiomSync); return; }
        if (!am.key) { aiomAskKey(aiomSync); return; }
        function norm(u) { return (Stremio.normalizeAddonUrl && Stremio.normalizeAddonUrl(u)) || u; }
        U.toast(I18n.t('Reading your AIOManager addons…'), 4000);
        YTPlay.aiomAddons(am.base, am.key).then(function (r) {
            var there = (r && Array.isArray(r.addons) ? r.addons : []).filter(function (x) { return x && U.parseUrl(x.url); });
            var byNorm = {};
            there.forEach(function (x) { byNorm[norm(x.url)] = x; });
            var mine = Stremio.getAddonUrls(), mineNorm = mine.map(norm);
            // Only what came from AIOManager is its to refresh or remove (am.synced: the ones a sync
            // added); an addon you added yourself stays yours, even when AIOManager has it too.
            function fromIt(u) { return am.synced.indexOf(norm(u)) !== -1; }
            var shared = mine.filter(function (u) { var x = byNorm[norm(u)]; return fromIt(u) && x && x.enabled !== false; });
            var add = there.filter(function (x) { return x.enabled !== false && mineNorm.indexOf(norm(x.url)) === -1; });
            var gone = mine.filter(function (u) { var x = byNorm[norm(u)]; return fromIt(u) && (!x || x.enabled === false); });
            var items = [];
            if (shared.length) { items.push({ key: 'refresh', label: I18n.t('↻ Refresh the ') + shared.length + I18n.t(' addon') + (shared.length === 1 ? '' : 's') + I18n.t(' you have from AIOManager') }); }
            add.forEach(function (x, i) { items.push({ key: 'add:' + i, label: I18n.t('+ Add  ·  ') + U.drawable(x.name || shortHost(x.url)).slice(0, 50) + '  ·  ' + shortHost(x.url) }); });
            gone.forEach(function (u, i) {
                var x = byNorm[norm(u)];
                items.push({ key: 'rm:' + i, label: I18n.t('− Remove  ·  ') + (x && x.name ? U.drawable(x.name).slice(0, 50) + '  ·  ' : '') + shortHost(u), note: x ? I18n.t('off in AIOManager') : I18n.t('gone from AIOManager') });
            });
            function done(n, addedUrls) {   // what came from it: as before, and what this sync added (still in your list)
                var now = (addedUrls || []).map(norm);
                var keptUrls = Stremio.getAddonUrls().filter(function (u) { return fromIt(u) || now.indexOf(norm(u)) !== -1; });
                aiomSave({ synced: keptUrls.map(norm), at: Date.now(), count: there.length });
                if (n) { clearCatalogCache(); refreshAddonRows(null); }
                renderSettings();
            }
            if (!items.length) { U.toast(I18n.t('Nothing to sync: AIOManager has no addons StremioK can use'), 4000); done(0); return; }
            pickMany(I18n.t('Sync with AIOManager: tick what to do'), items, { button: function (n) { return I18n.t('Apply ') + n; } }, function (keys) {
                var added = 0, removed = 0, addedUrls = [];
                keys.forEach(function (k) {
                    if (k.indexOf('add:') === 0) { var got = Stremio.addAddon(add[+k.slice(4)].url); if (got) { added++; addedUrls.push(got); Stremio.setAddonOrigin(got, 'aiomanager'); } }
                    else if (k.indexOf('rm:') === 0) { Stremio.removeAddon(gone[+k.slice(3)]); removed++; }
                });
                var refreshing = keys.indexOf('refresh') !== -1 ? shared.filter(function (u) { return Stremio.getAddonUrls().indexOf(u) !== -1; }) : [];
                U.settleAll(refreshing.map(function (u) { return function () { return Stremio.refreshAddon(u); }; }), 2).then(function (rs) {
                    var refreshed = (rs || []).filter(function (x) { return x && x.ok; }).length, parts = [];
                    if (added) { parts.push(added + I18n.t(' added')); }
                    if (removed) { parts.push(removed + I18n.t(' removed')); }
                    if (refreshing.length) { parts.push(refreshed + I18n.t(' refreshed') + (refreshed < refreshing.length ? ' (' + (refreshing.length - refreshed) + I18n.t(' didn’t answer)') : '')); }
                    U.toast(I18n.t('Synced: ') + (parts.join(', ') || I18n.t('nothing changed')), 4000);
                    done(added + removed + refreshed, addedUrls);
                });
            });
        }, function (e) {
            var why = (e && e.message) || '';
            if (/HTTP 401\b/.test(why) || (e && e.status === 401)) {
                aiomSave({ key: '' });
                U.toast(I18n.t('AIOManager refused the API key: enter it again'), 4500);
                aiomAskKey(aiomSync);
                return;
            }
            U.toast(I18n.t('Couldn’t read your AIOManager addons (') + (U.problem ? U.problem(e) : why) + ')', 5000);
        });
    }

    // The last configuration-file URL, kept so it can be imported again with one Confirm.
    var IMPORT_URL_KEY = 'stremiokptbr.importurl';

    var _importGen = 0;   // (the configuration file being imported, the latest)
    // A configuration file's text: what it has listed, none ticked, to tick and import. here():
    // the entry screen still showing (back to Settings from it). Imported settings: StremioK
    // starts again with them.
    function importText(text, here) {
        var parsed = Stremio.parseSetupList(text);
        if (!parsed.items.length) { U.toast(I18n.t('No supported entries found in that file') + (parsed.ignored ? ' (' + parsed.ignored + I18n.t(' ignored)') : ''), 4500); return; }
        if (here()) { App.back(); renderSettings(); }
        pickMany(I18n.t('In that file: tick what to import'), parsed.items.map(function (it, i) { return { key: '' + i, label: it.label, have: it.have, note: it.note }; }),
            { button: function (n) { return I18n.t('Import ') + n; } }, function (keys) {
                var imported = Stremio.applySetupEntries(keys.map(function (k) { return parsed.items[+k]; })), parts = [];
                if (imported.addons) { parts.push(imported.addons + I18n.t(' addon') + (imported.addons === 1 ? '' : 's')); }
                if (imported.playlists) { parts.push(imported.playlists + I18n.t(' playlist') + (imported.playlists === 1 ? '' : 's')); }
                if (imported.omdb) { parts.push(I18n.t('OMDb key')); }
                if (imported.tmdb) { parts.push(I18n.t('TMDB key')); }
                if (imported.mdblist) { parts.push(I18n.t('MDBList key')); }
                if (imported.settings) { parts.push(I18n.t('your settings')); }
                if (imported.addons || imported.playlists) { clearCatalogCache(); }
                var message = parts.length ? (I18n.t('Imported: ') + parts.join(', ')) : I18n.t('Nothing imported');
                if (parsed.ignored) { message += ' (' + parsed.ignored + I18n.t(' ignored)'); }
                if (imported.settings) {   // (every part of StremioK reads them afresh)
                    U.toast(message + '. StremioK starts again with them…', 4000);
                    setTimeout(function () { try { window.location.reload(); } catch (e) {} }, 2500);
                    return;
                }
                U.toast(message, 4500);
                renderSettings();
            });
    }
    // Settings › Content › Export configuration: what goes in, all ticked at first, given to your
    // phone (V.phoneGive) as the file Import configuration file reads (Stremio.exportSetup).
    function settingsExport(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Export configuration')));
        var row = U.el('div', 'addon-item focusable add-row');
        row.appendChild(U.el('div', 'a-name', I18n.t('⇧  Export to your phone')));
        row.appendChild(U.el('div', 'a-url', I18n.t('Your addons, IPTV playlists, API keys and settings, as a file to import later')));
        row.__onselect = function () {
            var groups = Stremio.exportGroups();
            pickMany(I18n.t('Tick what to export'), groups.map(function (g) { return { key: g.key, label: g.label }; }),
                { on: groups.map(function (g) { return g.key; }), button: function (n) { return I18n.t('Export ') + n; } }, function (keys) {
                    V.phoneGive(I18n.t('Export configuration'), Stremio.exportSetup(keys, appVersion()),
                        I18n.t('It holds your addon links, playlist logins, API keys and MAC addresses: keep the file private. Not in it: your Trakt sign-in, history and progress.'));
                });
        };
        wrap.appendChild(row);
        wrap.appendChild(U.el('div', 'hint', I18n.t('To restore it (after a reinstall, or on another TV): Import configuration file › ▣ From your phone, then choose the file there (or paste it).')));
        focusSettings();
    }
    function settingsImport(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Import configuration file')));
        var lastUrl = U.store.get(IMPORT_URL_KEY, '') || '';
        var listRow = U.el('div', 'addon-item focusable add-row');
        var ln = U.el('div', 'a-name', I18n.t('+  Import configuration file'));
        ln.appendChild(originBadge('config'));
        listRow.appendChild(ln);
        listRow.appendChild(U.el('div', 'a-url', lastUrl ? (I18n.t('Last used: ') + lastUrl + I18n.t('  ·  OK to import again'))
            : I18n.t('Addon URLs, API keys and IPTV playlist URLs')));
        listRow.__onselect = function () {
            App.openEntry({
                title: I18n.t('Import configuration file'), phone: 'config',
                hint: I18n.t('Enter a text-file URL containing one addon URL, API key or M3U/M3U8 playlist URL per line. Lines starting with # are ignored. The URL is remembered for next time.'),
                value: lastUrl || 'https://', placeholder: 'https://example.com/stremiokptbr.txt',
                validate: function (v) { return U.urlProblem(v) || null; },   // (U.parseUrl: http(s), a real host, no user:password@)
                onConfirm: function (v) {
                    // Saved even if the fetch fails, so a typo can be fixed instead of retyped.
                    U.store.set(IMPORT_URL_KEY, v);
                    lastUrl = v;
                    U.toast(I18n.t('Fetching configuration file…'), 5000);
                    // (what you confirmed is imported even if you've moved on; only the screen
                    // you're on stays: back to Settings only from this entry, still showing)
                    var entry = scr('addaddon'), mine = ++_importGen;
                    function here() { return mine === _importGen && !/\bhidden\b/.test(entry.className); }
                    U.getText(v, 15000, 256 * 1024).then(function (text) {   // (a list of URLs and keys: 256 KB is plenty)
                        importText(text, here);
                    }, function (err) {
                        if (!here()) { return; }
                        var why = U.problem(err);
                        U.toast(/^too large/.test(why) ? I18n.t('That file is ') + why + I18n.t(': a configuration file is a short list of URLs and keys.')
                            : I18n.t('Could not fetch that configuration file (') + why + I18n.t('; check the URL / CORS).'), 5000);
                    });
                },
                // From your phone, the file itself pasted (not a link): imported as it is
                phoneText: { accepts: function (t) { return /\n/.test(t) || !/^https?:\/\//i.test(('' + t).trim()); },
                    take: function (t) { ++_importGen; importText(t, function () { return true; }); } }
            });
        };
        wrap.appendChild(listRow);
        wrap.appendChild(U.el('div', 'hint',
            I18n.t('Accepted lines: addon URLs, M3U/M3U8 URLs, and OMDb, TMDB or MDBList API keys.')));
        focusSettings();
    }

    // Settings › IPTV: each playlist with ▲ / ▼ (order: a channel in two comes from the
    // first; rows follow it), its name, link, channels, when it was last downloaded and
    // what went wrong; OK for its actions (Rename, Turn off / on, Edit link, Reload, Remove).
    var _iptvFocus = null;   // { id, ctl } to focus once the page is drawn again
    function two(n) { return (n < 10 ? '0' : '') + n; }
    function thousands(n) { return ('' + n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    // The playlist rows IPTV Settings drew last: their guide lines kept current by one listener
    // (one added each time it was drawn used to pile up, each holding its rows).
    var _guideRows = [];
    if (typeof EPG !== 'undefined' && EPG.onChange) {
        EPG.onChange(function () {
            _guideRows = _guideRows.filter(function (r) { return document.documentElement.contains(r.info); });
            _guideRows.forEach(function (r) { r.info.textContent = playlistInfo(r.p); });
        });
    }
    function playlistInfo(p) {
        if (p.off) { return I18n.t('Off — its channels aren’t shown'); }
        var st = Stremio.iptvStatus(p.id), parts = [];
        if (!st.url) { return I18n.t('Not read yet'); }
        parts.push(thousands(st.count || 0) + I18n.t(' channel') + (st.count === 1 ? '' : 's') + (st.groups ? I18n.t(' in ') + st.groups + I18n.t(' group') + (st.groups === 1 ? '' : 's') : ''));
        if (st.fetchedAt) { var d = new Date(st.fetchedAt); parts.push(I18n.t('downloaded ') + U.dayLabel(st.fetchedAt) + ' ' + two(d.getHours()) + ':' + two(d.getMinutes())); }
        if (st.dropped) { parts.push(thousands(st.dropped) + I18n.t(' more left out (a playlist keeps its first 30,000)')); }
        if (p.genres) { parts.push(p.genres.length + I18n.t(' group') + (p.genres.length === 1 ? '' : 's') + I18n.t(' chosen')); }
        if (st.cut) { parts.push(I18n.t('stopped short') + (st.cut > 0 ? I18n.t(' of ') + thousands(st.cut) : '') + I18n.t(': OK on it, then Channel groups, reads only what you want')); }
        if (st.uncached) { parts.push(I18n.t('too large to save on the TV: downloaded each launch')); }
        var g = guideInfo(p);
        if (g) { parts.push(g); }
        return parts.join('   ·   ');
    }
    // Its TV guide (js/epg.js): being read, read (for how many of its channels), or why not.
    function guideInfo(p) {
        var g = typeof EPG !== 'undefined' && EPG.status ? EPG.status(p.id) : null;
        if (!g) { return typeof EPG !== 'undefined' && EPG.available && EPG.available() ? I18n.t('no TV guide') : ''; }
        if (g.state === 'ready') {
            var d = new Date(g.at);
            return I18n.t('TV guide: ') + thousands(g.channels) + I18n.t(' channel') + (g.channels === 1 ? '' : 's') + ', ' + thousands(g.programmes) + I18n.t(' programs') + (g.partial ? I18n.t(' (part of it: too large)') : '') +
                (g.at ? I18n.t(', read ') + U.dayLabel(g.at) + ' ' + two(d.getHours()) + ':' + two(d.getMinutes()) : '') + (g.error ? I18n.t(' (the last read failed: ') + g.error + ')' : '');
        }
        if (g.state === 'failed') { return I18n.t('⚠ TV guide: ') + (g.error || I18n.t('couldn’t be read')); }
        return I18n.t('TV guide: reading…');
    }
    function playlistProblem(p) {
        var st = Stremio.iptvStatus(p.id);
        if (p.off || !st.error) { return ''; }
        return '⚠ ' + (st.stale ? I18n.t('Couldn’t refresh it (showing the saved copy): ') : '') + st.error;
    }
    // + Add Xtream account: its server, username and password, a page each (a whole Xtream link
    // in the server's fills the rest); checked with the server, then added (Stremio.iptvAddXtream).
    function addXtream() {
        function done(base, user, pass) {
            U.toast(I18n.t('Checking the account…'), 15000);
            IPTV.xtreamCheck(base, user, pass).then(function (r) {
                if (r.unreachable) { U.toast(I18n.t('Couldn’t reach the server: check its address (nothing was saved)'), 5000); return; }
                if (r.refused) { U.toast(I18n.t('The server refused that username and password') + (r.status ? ' (' + r.status + ')' : '') + I18n.t(': nothing was saved'), 5000); return; }
                Stremio.iptvAddXtream(base, user, pass);
                refreshAddonRows('local:iptv');
                U.toast(I18n.t('Xtream account added: reading its channels and TV guide…'), 4000);
                renderSettings();
            });
        }
        App.openEntry({
            title: I18n.t('Xtream account: server'), phone: 'playlist',
            hint: I18n.t('The server address your provider gave you (http://line.example.com:8080), or a whole Xtream link. RETURN cancels.'),
            value: 'http://', placeholder: 'http://line.example.com:8080',
            validate: function (v) { return IPTV.xtreamParts(v) ? null : I18n.t('That isn’t a server address'); },
            onConfirm: function (v) {
                var x = IPTV.xtreamParts(v);
                App.back();
                if (x.user && x.pass) { done(x.base, x.user, x.pass); return; }
                App.openEntry({
                    title: I18n.t('Xtream account: username'), hint: I18n.t('Your account’s username. RETURN cancels.'), value: x.user, placeholder: 'username',
                    validate: function (u) { return ('' + u).trim() ? null : I18n.t('Type the username'); },
                    onConfirm: function (u) {
                        App.back();
                        App.openEntry({
                            title: I18n.t('Xtream account: password'), hint: I18n.t('Your account’s password (kept on the TV, in the playlist’s link). RETURN cancels.'), value: '', placeholder: 'password', secret: true,
                            validate: function (p) { return ('' + p) ? null : I18n.t('Type the password'); },
                            onConfirm: function (p) { App.back(); done(x.base, ('' + u).trim(), '' + p); }
                        });
                    }
                });
            }
        });
    }
    // + Add Stalker portal: its address, then its MAC address; checked (its channels read through
    // the service), then added (Stremio.iptvAddStalker).
    function addStalker() {
        function done(portal, mac) {
            U.toast(I18n.t('Checking the portal…'), 60000);
            IPTV.stalkerCheck(portal, mac).then(function (r) {
                if (r.noService) { U.toast(I18n.t('Stalker portals are read by StremioK’s service, which a desktop browser doesn’t have (nothing was saved)'), 5000); return; }
                if (r.unreachable) { U.toast(I18n.t('Couldn’t read the portal') + (r.why ? ' (' + r.why + ')' : '') + I18n.t(': nothing was saved'), 6000); return; }
                if (r.refused) { U.toast(I18n.t('The portal refused that MAC address') + (r.why ? ' (' + r.why + ')' : '') + I18n.t(': nothing was saved'), 6000); return; }
                Stremio.iptvAddStalker(portal, mac);
                refreshAddonRows('local:iptv');
                U.toast(I18n.t('Stalker portal added: ') + r.count + I18n.t(' channels') + (r.cut ? (r.cut.total ? I18n.t(' of ') + r.cut.total : I18n.t(' so far')) + I18n.t(': see Stalker channels') : ''), r.cut ? 6000 : 4000);
                renderSettings();
            });
        }
        App.openEntry({
            title: I18n.t('Stalker portal: address'), phone: 'playlist',
            hint: I18n.t('The portal address your provider gave you (http://portal.example.com/c/). RETURN cancels.'),
            value: 'http://', placeholder: 'http://portal.example.com/c/',
            validate: function (v) { return IPTV.stalkerPortal(v) ? null : I18n.t('That isn’t a portal address'); },
            onConfirm: function (v) {
                var portal = IPTV.stalkerPortal(v);
                App.back();
                App.openEntry({
                    title: I18n.t('Stalker portal: MAC address'), phone: 'mac',
                    hint: I18n.t('The MAC address your provider registered for you (00:1A:79:…), kept on the TV. RETURN cancels.'), value: '00:1A:79:', placeholder: '00:1A:79:00:00:00',
                    validate: function (m) { return IPTV.macOf(m) ? null : I18n.t('A MAC address is six pairs, like 00:1A:79:12:34:56'); },
                    onConfirm: function (m) { App.back(); done(portal, IPTV.macOf(m)); }
                });
            }
        });
    }
    // Streaming server: Stremio's or TorrServer, on your network (see Stremio.server). Picking one
    // asks for its address; Test says whether it answers.
    var SERVERS = [['', I18n.t('Off')], ['stremio', I18n.t('Stremio server')], ['torrserver', 'TorrServer']];
    var SERVER_PORT = { stremio: 11470, torrserver: 8090 };
    var TORRENT_WAITS = [['45', I18n.t('45 seconds')], ['60', I18n.t('1 minute')], ['120', I18n.t('2 minutes')], ['180', I18n.t('3 minutes')], ['300', I18n.t('5 minutes')]];
    function askServerAddress(kind, url) {
        var eg = 'http://192.168.0.10:' + SERVER_PORT[kind];
        App.openEntry({
            title: (kind === 'stremio' ? I18n.t('Stremio server') : 'TorrServer') + I18n.t(': address'),
            hint: I18n.t('Its address on your network, like ') + eg + '. RETURN cancels.',
            value: url || 'http://', placeholder: eg, phone: 'server',
            validate: function (v) { return Stremio.serverAddressProblem(v); },
            onConfirm: function (v) { Stremio.setServer({ kind: kind, url: v }); App.back(); renderSettings(); }
        });
    }
    function settingsServer(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Streaming server')));
        wrap.appendChild(U.el('div', 'hint', I18n.t('Torrent-only sources play through it; Stremio’s can also convert a video the TV can’t play.')));
        var sv = Stremio.server();
        wrap.appendChild(subPickRow(I18n.t('Server'), SERVERS, 'kind', {
            get: function () { return { kind: Stremio.server().kind }; },
            set: function (cfg) {
                var cur = Stremio.server();
                if (!cfg.kind) { Stremio.setServer({ kind: '' }); renderSettings(); return; }
                askServerAddress(cfg.kind, cur.kind === cfg.kind ? cur.url : '');
            }
        }));
        if (!sv.kind) { return; }
        var addr = U.el('div', 'addon-item focusable cfg-row');
        addr.appendChild(U.el('div', 'a-name', I18n.t('Address:  ') + sv.url));
        addr.appendChild(U.el('div', 'a-url', I18n.t('Press OK to change')));
        addr.__onselect = function () { askServerAddress(sv.kind, sv.url); };
        wrap.appendChild(addr);
        var test = U.el('div', 'addon-item focusable cfg-row'), said = U.el('div', 'a-url', I18n.t('Press OK to see whether it answers'));
        test.appendChild(U.el('div', 'a-name', I18n.t('Test')));
        test.appendChild(said);
        test.__onselect = function () {
            said.textContent = I18n.t('Asking…');
            Stremio.testServer().then(function (r) { said.textContent = (r.ok ? '✓ ' : '✗ ') + r.text; });
        };
        wrap.appendChild(test);
        wrap.appendChild(subPickRow(I18n.t('Wait for a torrent to start'), TORRENT_WAITS, 'wait', {
            get: function () { return { wait: '' + Stremio.server().wait }; },
            set: function (cfg) { Stremio.setServer({ kind: Stremio.server().kind, wait: +cfg.wait }); }
        }));
        if (sv.kind === 'stremio') {
            wrap.appendChild(subPickRow(I18n.t('Convert videos the TV can’t play'), [['on', I18n.t('On')], ['off', I18n.t('Off')]], 'convert', {
                get: function () { return { convert: Stremio.server().convert ? 'on' : 'off' }; },
                set: function (cfg) { Stremio.setServer({ kind: 'stremio', convert: cfg.convert === 'on' }); }
            }));
        }
    }

    var IPTV_EVERY = [['0', I18n.t('Off')], ['1', I18n.t('Every hour')], ['3', I18n.t('Every 3 hours')], ['6', I18n.t('Every 6 hours')], ['12', I18n.t('Every 12 hours')]];
    function settingsIptv(wrap) {
        wrap.appendChild(U.el('h2', null, 'IPTV'));
        var playlists = Stremio.iptvGetPlaylists ? Stremio.iptvGetPlaylists() : [];
        var rows = [];

        // Combined load status — turns silent per-playlist fetch failures into a visible message.
        var statusEl = null;
        if (playlists.some(function (p) { return !p.off; }) && Stremio.iptvLoad) {
            statusEl = U.el('div', 'hint', I18n.t('Checking playlists…'));
            wrap.appendChild(statusEl);
            _iptvStatusEl = statusEl;   // (updated as big playlists are read, see below)
        }

        playlists.forEach(function (playlist, idx) {
            var label = Stremio.iptvLabel(playlist.id);
            var frow = U.el('div', 'feed-row playlist-row' + (playlist.off ? ' feed-off' : ''));
            function ctl(node, name) { node.setAttribute('data-pl', playlist.id); node.setAttribute('data-ctl', name); return node; }
            function move(dir, name) {
                return function () {
                    if (!Stremio.iptvMovePlaylist(playlist.id, dir)) { return; }
                    refreshAddonRows('local:iptv');
                    _iptvFocus = { id: playlist.id, ctl: name };
                    renderSettings();
                };
            }
            var btns = orderButtons(function (dir, name) { move(dir, name)(); }, ctl);
            var item = ctl(U.el('div', 'addon-item focusable playlist-item'), 'item');
            item.appendChild(U.el('div', 'a-name', label + (playlist.off ? I18n.t('   (off)') : '')));
            item.appendChild(U.el('div', 'a-url', U.redactUrl(playlist.url) + (playlist.mac ? I18n.t('  ·  MAC ') + playlist.mac.slice(0, 8) + ':••:••:••' : '')));   // (credentials masked; a Stalker portal's MAC too)
            var info = U.el('div', 'a-url playlist-info', playlistInfo(playlist));
            var problem = U.el('div', 'a-url addon-said', playlistProblem(playlist));
            item.appendChild(info);
            item.appendChild(problem);
            item.__onselect = function () {
                _iptvFocus = { id: playlist.id, ctl: 'item' };
                playlistActions(playlist, label);
            };
            btns.forEach(function (b) { frow.appendChild(b); });
            frow.appendChild(item);
            wrap.appendChild(frow);
            rows.push({ p: playlist, info: info, problem: problem, idx: idx });
        });

        _guideRows = rows;   // (their guide lines kept current as guides are read: _guideRows)
        if (statusEl) {
            Stremio.iptvLoad().then(function () {
                var channels = 0, groups = 0, failed = 0, on = 0;
                rows.forEach(function (r) {
                    r.info.textContent = playlistInfo(r.p);
                    r.problem.textContent = playlistProblem(r.p);
                    if (r.p.off) { return; }
                    var st = Stremio.iptvStatus(r.p.id);
                    on++;
                    channels += st.count || 0;
                    groups += st.groups || 0;
                    if (st.error) { failed++; }
                });
                statusEl.textContent = (failed ? '⚠ ' : '✓ ') + I18n.t('Loaded ') + thousands(channels) + I18n.t(' channels from ') +
                    on + I18n.t(' playlist(s) in ') + groups + I18n.t(' group(s).') + (failed ? (' ' + failed + I18n.t(' playlist(s) reported an error.')) : '') +
                    (on < playlists.length ? ' ' + (playlists.length - on) + I18n.t(' switched off.') : '');
            });
        }

        var add = U.el('div', 'addon-item focusable add-row');
        add.appendChild(U.el('div', 'a-name', I18n.t('+  Add playlist')));
        add.appendChild(U.el('div', 'a-url', I18n.t('Enter another M3U/M3U8 playlist URL')));
        add.__onselect = function () {
            App.openEntry({
                title: I18n.t('Add IPTV playlist'), phone: 'playlist',
                hint: I18n.t('Type an M3U/M3U8 playlist URL. Nothing is saved until you Confirm.'),
                value: 'https://', placeholder: 'https://example.com/playlist.m3u',
                validate: function (v) { return U.urlProblem(v) || null; },   // (U.parseUrl: http(s), a real host, no user:password@)
                onConfirm: function (v) {
                    Stremio.iptvAddPlaylist(v);
                    refreshAddonRows('local:iptv');
                    U.toast(I18n.t('Playlist added'));
                    App.back(); renderSettings();
                }
            });
        };
        wrap.appendChild(add);
        var xt = U.el('div', 'addon-item focusable add-row');
        xt.appendChild(U.el('div', 'a-name', I18n.t('+  Add Xtream account')));
        xt.appendChild(U.el('div', 'a-url', I18n.t('Its server, username and password: its channels and TV guide added')));
        xt.__onselect = addXtream;
        wrap.appendChild(xt);
        var sk = U.el('div', 'addon-item focusable add-row');
        sk.appendChild(U.el('div', 'a-name', I18n.t('+  Add Stalker portal')));
        sk.appendChild(U.el('div', 'a-url', I18n.t('Its address and MAC address: its channels added')));
        sk.__onselect = addStalker;
        wrap.appendChild(sk);
        if (playlists.length && Stremio.iptvRefreshEvery) {   // (all of them, with their guides, as Reload does)
            wrap.appendChild(subPickRow('Auto-refresh', IPTV_EVERY, 'every',
                { get: function () { return { every: String(Stremio.iptvRefreshEvery()) }; }, set: function (c) { Stremio.iptvSetRefreshEvery(+c.every); } }));
        }
        wrap.appendChild(subPickRow(I18n.t('Stalker channels'), [['pages', I18n.t('First 100 pages (about 1,400 channels)')], ['all', I18n.t('Whole portal (up to 30,000 channels)')]], 'stalker', {
            warning: I18n.t('Whole portal can take many minutes on every Reload and Auto-refresh, the IPTV rows wait for a first read, and a portal may slow down, cut off or block a MAC address that asks so much'),
            get: function () { return { stalker: IPTV.stalkerAll() ? 'all' : 'pages' }; },
            set: function (c) {
                var on = c.stalker === 'all', was = IPTV.stalkerAll();
                IPTV.setStalkerAll(on);
                if (!on || was) { return; }
                var mine = playlists.filter(IPTV.isStalker);   // (read again now: leave StremioK open meanwhile)
                if (!mine.length) { return; }
                U.toast(I18n.t('Reading the whole portal: this can take many minutes, leave StremioK open'), 6000);
                mine.forEach(function (p) { Stremio.iptvReload(p.id).then(function () { refreshAddonRows('local:iptv'); }); });
            }
        }));

        wrap.appendChild(U.el('div', 'hint',
            I18n.t('Channels are grouped into IPTV and Radio rows on Home. ▲ / ▼ set the playlists\' order: a channel in two playlists comes from the first.')));
        var s = scr('settings'), want = null;
        if (_iptvFocus) {
            var nodes = wrap.querySelectorAll('.playlist-row .focusable');
            for (var k = 0; k < nodes.length; k++) {
                if (nodes[k].getAttribute('data-pl') === _iptvFocus.id && nodes[k].getAttribute('data-ctl') === _iptvFocus.ctl) { want = nodes[k]; break; }
            }
            _iptvFocus = null;
        }
        Focus.setScope(s, want || wrap.querySelector('.playlist-item') || wrap.querySelector('.focusable') || undefined);   // (the playlist, not its ▲)
    }

    // Settings › Content › YouTube: YouTube in Search (Videos and Channels rows), and your
    // YouTube catalogs (a channel, a playlist or a search each, a row on Home and a catalog in
    // Discover): ▲ / ▼ for their order, OK for what to change. (Channels and playlists can
    // also be added by holding OK on one, wherever it's shown.)
    var _ytFocus = null;   // { id, ctl } to focus once the page is drawn again
    function ytDescribe(x) {
        var what = { channel: I18n.t('Channel'), playlist: I18n.t('Playlist'), search: I18n.t('Search') }[YouTube.sourceKind(x.src)];
        var bits = [what + ':  ' + x.src.replace(/^search:/i, '')];
        if (x.kind !== 'auto') { bits.push(YouTube.KIND_NAMES[x.kind]); }
        if (what === 'Search' && x.sort !== 'relevance') { bits.push(I18n.t('by ') + YouTube.SORT_NAMES[x.sort].toLowerCase()); }
        if (x.type !== 'YouTube') { bits.push(I18n.t('type “') + x.type + '”'); }
        return bits.join('   ·   ');
    }
    function ytChanged(focus) {
        refreshAddonRows('local:youtube');
        _ytFocus = focus || null;
        renderSettings();
    }
    function ytEntry(title, hint, value, placeholder, validate, onConfirm) {
        App.openEntry({ title: title, hint: hint, value: value, placeholder: placeholder, phone: 'youtube',
            validate: validate || function () { return null; },
            onConfirm: function (v) { App.back(); onConfirm(('' + v).trim()); } });   // (back on Settings, then redrawn on the change)
    }
    var YT_SOURCE_HINT = I18n.t('A channel (like @ScreenJunkies, or its link), a playlist link, or words to search YouTube for (like “honest trailers”).');
    // YouTubio's catalogs as yours (its own feeds need its sign-in: left out), then its
    // addon can go.
    function copyFrom(y) {
        var info = YouTube.fromYouTubio(y.url);
        confirm(I18n.t('Copy ') + info.list.length + I18n.t(' catalog') + (info.list.length === 1 ? '' : 's') + I18n.t(' from YouTubio (') + y.host + I18n.t(') to your YouTube?') +
            (info.left ? '  ' + info.left + I18n.t(' of its own (subscriptions, its search…) need its sign-in or are YouTube in Search already: left out.') : ''), I18n.t('Copy'), function () {
            var r = YouTube.copyYouTubio(y.url);
            ytChanged(OPT('copy'));
            U.toast(r.added + I18n.t(' catalog') + (r.added === 1 ? '' : 's') + I18n.t(' copied') + (r.already ? ', ' + r.already + I18n.t(' you had already') : ''), 3500);
            setTimeout(function () {
                confirm(I18n.t('Remove the YouTubio addon? Its catalogs are in your YouTube now.'), I18n.t('Remove'), function () {
                    Stremio.removeAddon(y.url);
                    refreshAddonRows();
                    ytChanged(null);
                    U.toast(I18n.t('YouTubio removed'));
                });
            }, 400);
        });
    }
    function OPT(name) { return { id: 'opt', ctl: name }; }   // (a settings row, to come back to)
    function optRow(node, name) { node.setAttribute('data-pl', 'opt'); node.setAttribute('data-ctl', name); return node; }
    function sbModeShort(cat, mode) { return mode === 'show' && (cat === 'poi_highlight' || cat === 'exclusive_access') ? I18n.t('On') : YouTube.SB_MODE_NAMES[mode].split(' (')[0]; }
    // SponsorBlock sections: each, and what's done with it.
    function sbSections(focusCat) {
        var modes = YouTube.sbModes();
        pickList(I18n.t('SponsorBlock sections'), YouTube.SB_CATS.map(function (k) { return [k, YouTube.SB_NAMES[k] + '  ·  ' + sbModeShort(k, modes[k])]; }), focusCat || null, function (cat) {
            var names = cat === 'poi_highlight' ? { show: I18n.t('On: “◆ Highlight” on the UP bar goes to it'), off: I18n.t('Off') }
                : cat === 'exclusive_access' ? { show: I18n.t('On: a note when the video starts'), off: I18n.t('Off') } : YouTube.SB_MODE_NAMES;
            pickList(YouTube.SB_NAMES[cat], YouTube.sbModesFor(cat).map(function (m) { return [m, names[m]]; }), modes[cat], function (m) {
                YouTube.setSbMode(cat, m);
                ytChanged(OPT('sbcats'));
                sbSections(cat);
            });
        });
    }
    function ytActions(x) {
        var opts = [['rename', I18n.t('Rename  ·  ') + x.name], ['src', I18n.t('Source  ·  ') + x.src.replace(/^search:/i, '')],
            ['kind', I18n.t('Search type  ·  ') + YouTube.KIND_NAMES[x.kind]], ['sort', I18n.t('Sort order  ·  ') + YouTube.SORT_NAMES[x.sort]],
            ['type', I18n.t('Type  ·  ') + x.type], ['off', x.off ? I18n.t('Turn on') : I18n.t('Turn off')], ['remove', I18n.t('Remove')]];
        pickList(x.name, opts, null, function (a) {
            var focus = { id: x.id, ctl: 'item' };
            if (a === 'rename') {
                ytEntry(I18n.t('Rename YouTube catalog'), I18n.t('Its name on Home and in Discover.'), x.name, x.name,
                    function (v) { return ('' + v).trim() ? null : I18n.t('Type a name'); }, function (v) { YouTube.update(x.id, { name: v }); ytChanged(focus); });
            } else if (a === 'src') {
                ytEntry(I18n.t('YouTube catalog source'), YT_SOURCE_HINT, x.src.replace(/^search:/i, ''), '@channel, a playlist link, or words',
                    function (v) { return ('' + v).trim() ? null : I18n.t('Type a channel, a playlist or words'); }, function (v) { YouTube.update(x.id, { src: v }); ytChanged(focus); });
            } else if (a === 'kind') {
                pickList(I18n.t('Search type'), YouTube.KINDS.map(function (k) { return [k, YouTube.KIND_NAMES[k]]; }), x.kind, function (k) { YouTube.update(x.id, { kind: k }); ytChanged(focus); });
            } else if (a === 'sort') {
                pickList(I18n.t('Sort order (searches)'), YouTube.SORTS.map(function (k) { return [k, YouTube.SORT_NAMES[k]]; }), x.sort, function (k) { YouTube.update(x.id, { sort: k }); ytChanged(focus); });
            } else if (a === 'type') {
                ytEntry(I18n.t('YouTube catalog type'), I18n.t('Where it\'s listed: its Home tab and Discover type, like “Podcasts”. Leave it empty for “YouTube”.'), x.type, 'YouTube',
                    null, function (v) { YouTube.update(x.id, { type: v || 'YouTube' }); ytChanged(focus); });
            } else if (a === 'off') {
                YouTube.update(x.id, { off: !x.off }); ytChanged(focus);
            } else if (a === 'remove') {
                confirm(I18n.t('Remove the YouTube catalog “') + x.name + '”?', I18n.t('Remove'), function () { YouTube.remove(x.id); ytChanged(null); });
            }
        });
    }
    function settingsYouTube(wrap) {
        wrap.appendChild(U.el('h2', null, 'YouTube'));
        if (typeof YouTube === 'undefined') { wrap.appendChild(U.el('div', 'hint', I18n.t('Not available here.'))); focusSettings(); return; }
        var on = YouTube.searchOn();
        var srch = U.el('div', 'addon-item focusable cfg-row');
        srch.appendChild(U.el('div', 'a-name', I18n.t('YouTube in Search:  ') + (on ? I18n.t('On') : I18n.t('Off'))));
        srch.appendChild(U.el('div', 'a-url', (on ? I18n.t('Search shows YouTube videos and channels (as rows: YouTube · Videos, YouTube · Channels)') : I18n.t('Search leaves YouTube out')) + I18n.t('   ·   OK to turn ') + (on ? 'off' : 'on')));
        srch.__onselect = function () { YouTube.setSearch(!on); ytChanged(OPT('search')); };
        wrap.appendChild(optRow(srch, 'search'));
        var orig = YouTube.originalTitles(), tRow = U.el('div', 'addon-item focusable cfg-row');
        tRow.appendChild(U.el('div', 'a-name', I18n.t('Video titles:  ') + (orig ? I18n.t('Original') : I18n.t('English'))));
        tRow.appendChild(U.el('div', 'a-url', (orig ? I18n.t('In the language they were uploaded in') : I18n.t('In English where YouTube has a translation (the uploader\'s, or its own)')) + I18n.t('   ·   OK for ') + (orig ? I18n.t('English') : I18n.t('the original'))));
        tRow.__onselect = function () { YouTube.setOriginalTitles(!orig); ytChanged(OPT('titles')); };
        wrap.appendChild(optRow(tRow, 'titles'));

        // SponsorBlock (sections viewers marked) and DeArrow (titles / thumbnails they wrote)
        var sb = YouTube.sbOn(), modes = YouTube.sbModes();
        var sbRow = U.el('div', 'addon-item focusable cfg-row');
        sbRow.appendChild(U.el('div', 'a-name', I18n.t('SponsorBlock:  ') + (sb ? I18n.t('On') : I18n.t('Off'))));
        sbRow.appendChild(U.el('div', 'a-url', (sb ? I18n.t('Sponsors, self-promotion and other sections other viewers marked in a video: skipped, offered or shown on the bar, as set below') : I18n.t('Videos play as they are')) + I18n.t('   ·   OK to turn ') + (sb ? 'off' : 'on')));
        sbRow.__onselect = function () { YouTube.setSbOn(!sb); ytChanged(OPT('sb')); };
        wrap.appendChild(optRow(sbRow, 'sb'));
        if (sb) {
            var cats = U.el('div', 'addon-item focusable cfg-row');
            cats.appendChild(U.el('div', 'a-name', I18n.t('SponsorBlock sections')));
            cats.appendChild(U.el('div', 'a-url', YouTube.SB_CATS.filter(function (k) { return modes[k] !== 'off'; }).map(function (k) { return YouTube.SB_NAMES[k] + ': ' + sbModeShort(k, modes[k]); }).join('   ·   ') || I18n.t('All off')));
            cats.__onselect = function () { sbSections(); };
            wrap.appendChild(optRow(cats, 'sbcats'));
        }
        var da = YouTube.dearrow();
        [['titles', I18n.t('DeArrow titles'), I18n.t('Titles other viewers rewrote to say what a video is (the original on its page)'), I18n.t('YouTube\'s titles')],
         ['thumbs', I18n.t('DeArrow thumbnails'), I18n.t('A still from the video in place of a clickbait thumbnail, where viewers chose one'), I18n.t('YouTube\'s thumbnails')]].forEach(function (d) {
            var onD = da[d[0]], r = U.el('div', 'addon-item focusable cfg-row');
            r.appendChild(U.el('div', 'a-name', d[1] + ':  ' + (onD ? I18n.t('On') : I18n.t('Off'))));
            r.appendChild(U.el('div', 'a-url', (onD ? d[2] : d[3]) + I18n.t('   ·   OK to turn ') + (onD ? 'off' : 'on')));
            r.__onselect = function () { var p = {}; p[d[0]] = !onD; YouTube.setDearrow(p); ytChanged(OPT('da' + d[0])); };
            wrap.appendChild(optRow(r, 'da' + d[0]));
        });

        var list = YouTube.catalogs();
        if (list.length) { wrap.appendChild(U.el('div', 'hint', I18n.t('Your YouTube catalogs: a row on Home and a catalog in Discover each; a channel or playlist opens as a series of its videos.'))); }
        list.forEach(function (x) {
            var frow = U.el('div', 'feed-row playlist-row' + (x.off ? ' feed-off' : ''));
            function ctl(node, name) { node.setAttribute('data-pl', x.id); node.setAttribute('data-ctl', name); return node; }
            var btns = orderButtons(function (dir, name) { if (YouTube.move(x.id, dir)) { ytChanged({ id: x.id, ctl: name }); } }, ctl);
            var item = ctl(U.el('div', 'addon-item focusable playlist-item yt-catalog'), 'item');
            item.appendChild(U.el('div', 'a-name', x.name + (x.off ? I18n.t('   (off)') : '')));
            item.appendChild(U.el('div', 'a-url', ytDescribe(x)));
            item.__onselect = function () { ytActions(x); };
            btns.forEach(function (b) { frow.appendChild(b); }); frow.appendChild(item);
            wrap.appendChild(frow);
        });

        var add = U.el('div', 'addon-item focusable add-row');
        add.appendChild(U.el('div', 'a-name', I18n.t('+  Add catalog')));
        add.appendChild(U.el('div', 'a-url', I18n.t('A channel, a playlist or a search (or hold OK on a channel / playlist wherever it\'s shown)')));
        add.__onselect = function () {
            ytEntry(I18n.t('Add YouTube catalog'), YT_SOURCE_HINT, '', '@channel, a playlist link, or words', function (v) { return ('' + v).trim() ? null : I18n.t('Type a channel, a playlist or words'); }, function (src) {
                var id = YouTube.add({ src: src });
                if (!id) { U.toast(I18n.t('Couldn\'t add it (40 catalogs at most)')); return; }
                U.toast(I18n.t('Added: OK on it to rename it or change what it lists'), 3500);
                ytChanged({ id: id, ctl: 'item' });
            });
        };
        wrap.appendChild(add);
        var ytb = YouTube.youTubioAddons();
        if (ytb.length) {   // (a YouTubio addon installed: its catalogs can come over)
            var copy = optRow(U.el('div', 'addon-item focusable add-row'), 'copy');
            copy.appendChild(U.el('div', 'a-name', I18n.t('+  Copy from YouTubio')));
            copy.appendChild(U.el('div', 'a-url', ytb.map(function (y) { return y.host + ': ' + y.count + I18n.t(' catalog') + (y.count === 1 ? '' : 's'); }).join('   ·   ')));
            copy.__onselect = function () {
                if (ytb.length === 1) { copyFrom(ytb[0]); return; }
                pickList(I18n.t('Copy from which YouTubio?'), ytb.map(function (y, i) { return ['' + i, y.host + '  ·  ' + y.count + I18n.t(' catalogs  ·  addon ') + (i + 1)]; }), null, function (i) { copyFrom(ytb[+i]); });
            };
            wrap.appendChild(copy);
        }
        wrap.appendChild(U.el('div', 'hint', I18n.t('These work without any addon, through StremioK’s YouTube service. Search type and Sort order are for searches; Live now with a channel shows what it’s streaming.')));
        var s = scr('settings'), want = null;
        if (_ytFocus) {
            var nodes = wrap.querySelectorAll('.focusable');
            for (var k = 0; k < nodes.length; k++) {
                if (nodes[k].getAttribute('data-pl') === _ytFocus.id && nodes[k].getAttribute('data-ctl') === _ytFocus.ctl) { want = nodes[k]; break; }
            }
            _ytFocus = null;
        }
        Focus.setScope(s, want || wrap.querySelector('.focusable') || undefined);
    }

    function maskKey(v) { v = '' + v; return v.length <= 4 ? '••••' : ('••••' + v.slice(-4)); }

    function keyRow(title, key, placeholder, validator) {
        var val = Stremio.getIntegrations()[key] || '';
        var r = U.el('div', 'addon-item focusable');
        r.appendChild(U.el('div', 'a-name', title));
        r.appendChild(U.el('div', 'a-url', val ? (I18n.t('Set — ') + maskKey(val)) : I18n.t('Not set — press OK to enter')));
        r.__onselect = function () {
            App.openEntry({
                title: title,
                hint: I18n.t('Paste your key, then Confirm. Use Validate to test it. Leave blank and Confirm to clear.'),
                value: val, placeholder: placeholder, validator: validator,
                onConfirm: function (v) { Stremio.setIntegration(key, v); U.toast(v ? I18n.t('Saved') : I18n.t('Cleared')); App.back(); renderSettings(); }
            });
        };
        return r;
    }

    function settingsIntegrations(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Integrations')));
        if (typeof YTPlay !== 'undefined' && YTPlay.installMode && YTPlay.installMode() === 'tizenbrew') { wrap.appendChild(U.el('div', 'hint', TIZENBREW_NOTE)); }
        wrap.appendChild(keyRow(I18n.t('OMDb API key'), 'omdb', I18n.t('OMDb API key'), Stremio.omdbValidate));
        wrap.appendChild(keyRow(I18n.t('TMDB API key (v3)'), 'tmdb', I18n.t('TMDB v3 API key'), Stremio.tmdbValidate));
        wrap.appendChild(keyRow(I18n.t('MDBList API key'), 'mdblist', I18n.t('MDBList API key'), Stremio.mdblistValidate));
        if (Stremio.autoWatchRegion) { wrap.appendChild(regionRow()); }

        // Trakt: your account (StremioK is the Trakt app: nothing to set up)
        if (typeof Trakt !== 'undefined') {
            wrap.appendChild(U.el('h2', null, I18n.t('Trakt')));
            wrap.appendChild(traktAccountRow());
            if (Trakt.connectStatus().connected) { wrap.appendChild(traktSyncRow()); }
            wrap.appendChild(U.el('div', 'hint', I18n.t('Connect your Trakt account (a free one will do): the TV shows a code to enter on Trakt\'s site. ') +
                I18n.t('Your watched marks and Continue Watching then sync with Trakt.')));
        }

        wrap.appendChild(U.el('div', 'hint',
            I18n.t('Keys are stored on this TV only. OMDb gives real IMDb per-episode ratings (used first when set); TMDB adds episode images & ratings.')));
        focusSettings();
    }

    // The country TMDB's "where to watch" services are for (a title's sources). Automatic:
    // the TV's language region, which a language-only setting ("en") doesn't have.
    var WATCH_REGIONS = [['AR', I18n.t('Argentina')], ['AU', I18n.t('Australia')], ['AT', I18n.t('Austria')], ['BE', I18n.t('Belgium')], ['BR', I18n.t('Brazil')],
        ['BG', I18n.t('Bulgaria')], ['CA', I18n.t('Canada')], ['CL', I18n.t('Chile')], ['CO', I18n.t('Colombia')], ['CZ', I18n.t('Czech Republic')], ['DK', I18n.t('Denmark')],
        ['EC', I18n.t('Ecuador')], ['EG', I18n.t('Egypt')], ['EE', I18n.t('Estonia')], ['FI', I18n.t('Finland')], ['FR', I18n.t('France')], ['DE', I18n.t('Germany')],
        ['GR', I18n.t('Greece')], ['HK', I18n.t('Hong Kong')], ['HU', I18n.t('Hungary')], ['IS', I18n.t('Iceland')], ['IN', I18n.t('India')], ['ID', I18n.t('Indonesia')],
        ['IE', I18n.t('Ireland')], ['IL', I18n.t('Israel')], ['IT', I18n.t('Italy')], ['JP', I18n.t('Japan')], ['LV', I18n.t('Latvia')], ['LT', I18n.t('Lithuania')],
        ['MY', I18n.t('Malaysia')], ['MX', I18n.t('Mexico')], ['NL', I18n.t('Netherlands')], ['NZ', I18n.t('New Zealand')], ['NO', I18n.t('Norway')], ['PE', I18n.t('Peru')],
        ['PH', I18n.t('Philippines')], ['PL', I18n.t('Poland')], ['PT', I18n.t('Portugal')], ['RO', I18n.t('Romania')], ['SA', I18n.t('Saudi Arabia')],
        ['SG', I18n.t('Singapore')], ['SK', I18n.t('Slovakia')], ['ZA', I18n.t('South Africa')], ['KR', I18n.t('South Korea')], ['ES', I18n.t('Spain')],
        ['SE', I18n.t('Sweden')], ['CH', I18n.t('Switzerland')], ['TW', I18n.t('Taiwan')], ['TH', I18n.t('Thailand')], ['TR', I18n.t('Turkey')], ['UA', I18n.t('Ukraine')],
        ['AE', I18n.t('United Arab Emirates')], ['GB', I18n.t('United Kingdom')], ['US', I18n.t('United States')], ['VE', I18n.t('Venezuela')]];
    function regionRow() {
        var auto = Stremio.autoWatchRegion();
        var list = [['', I18n.t('Automatic (') + (labelFor(WATCH_REGIONS, auto) || auto) + I18n.t(', from the TV\'s language)')]].concat(WATCH_REGIONS.map(function (c) { return [c[0], c[1] + '  (' + c[0] + ')']; }));
        var row = U.el('div', 'addon-item focusable cfg-row');
        var name = U.el('div', 'a-name');
        function render() { name.textContent = I18n.t('Where to watch: country:  ') + labelFor(list, Stremio.getPrefs().watchRegion); }
        render();
        row.appendChild(name);
        row.appendChild(U.el('div', 'a-url', I18n.t('The services TMDB lists on a title\'s page are for this country   ·   OK to choose')));
        row.__onselect = function () {
            pickList(I18n.t('Where to watch: country'), list, Stremio.getPrefs().watchRegion, function (v) { Stremio.setPref('watchRegion', v); render(); });
        };
        return row;
    }

    function traktAccountRow() {
        var st = Trakt.connectStatus();
        var r = U.el('div', 'addon-item focusable');
        r.appendChild(U.el('div', 'a-name', I18n.t('Trakt account')));
        r.appendChild(U.el('div', 'a-url',
            st.connected && st.reconnect ? (I18n.t('Trakt needs reconnecting (') + (st.user || I18n.t('Trakt')) + I18n.t('): its sign-in no longer works — press OK to connect again'))
                : st.connected ? (I18n.t('Connected as ') + (st.user || I18n.t('Trakt')) + I18n.t(' — press OK to disconnect'))
                : I18n.t('Not connected — press OK to connect')));
        r.__onselect = function () {
            if (st.connected && st.reconnect) { traktConnect(); return; }
            if (st.connected) {
                confirm(I18n.t('Disconnect Trakt account?'), I18n.t('Disconnect'), function () {
                    Trakt.disconnect();
                    U.toast(I18n.t('Trakt disconnected'));
                    markHomeDirty();
                    renderSettings();
                });
            } else {
                traktConnect();
            }
        };
        return r;
    }

    // When Trakt last answered, and the changes waiting to reach it, and each one not sent (by
    // title, with what Trakt said): OK to send everything now, or let the ones not sent go.
    function traktSyncRow() {
        var st = Trakt.connectStatus(), r = U.el('div', 'addon-item focusable cfg-row trakt-sync');
        function two(n) { return (n < 10 ? '0' : '') + n; }
        var d = st.lastSync ? new Date(st.lastSync) : null;
        var last = d ? I18n.t('Last synced ') + (U.dayLabel ? U.dayLabel(st.lastSync) + ' ' : '') + two(d.getHours()) + ':' + two(d.getMinutes()) : I18n.t('Not synced yet');
        var bits = [last];
        if (st.pending) { bits.push(st.pending + I18n.t(' change') + (st.pending === 1 ? '' : 's') + I18n.t(' waiting to reach Trakt')); }
        if (st.failed) { bits.push('⚠ ' + st.failed + I18n.t(' change') + (st.failed === 1 ? '' : 's') + I18n.t(' not sent')); }
        r.appendChild(U.el('div', 'a-name', I18n.t('Trakt sync:  ') + (st.failed ? I18n.t('some changes not sent') : st.pending ? I18n.t('changes waiting') : I18n.t('up to date'))));
        r.appendChild(U.el('div', 'a-url', bits.join('   ·   ') + I18n.t('   ·   OK for options')));
        (st.failedItems || []).slice(0, 6).forEach(function (f) {
            r.appendChild(U.el('div', 'a-url', '⚠ ' + f.what.charAt(0).toUpperCase() + f.what.slice(1) + (f.title ? '  ·  ' + f.title : '') + (f.err ? '  ·  ' + f.err : '')));
        });
        if ((st.failedItems || []).length > 6) { r.appendChild(U.el('div', 'a-url', I18n.t('and ') + (st.failedItems.length - 6) + I18n.t(' more'))); }
        r.__onselect = function () {
            var opts = [['now', st.failed ? I18n.t('Sync now (the ') + st.failed + I18n.t(' not sent too)') : I18n.t('Sync now')]];
            if (st.failed) { opts.push(['discard', I18n.t('Let them go (not sent to Trakt)')]); }
            pickList(I18n.t('Trakt sync'), opts, null, function (v) {
                if (v === 'now') { Trakt.sendNow(); Trakt.refreshCaches(); U.toast(I18n.t('Syncing with Trakt…')); }
                else if (v === 'discard') { Trakt.discardFailed(); U.toast(I18n.t('Not sent: left out')); }
                setTimeout(renderSettings, 1500);
            });
        };
        return r;
    }

    // Device-code connect overlay: shows the code + URL, polls, updates on success.
    function traktConnect() {
        var existing = document.querySelector('.modal-overlay');
        if (existing) { existing.parentNode.removeChild(existing); }
        var overlay = U.el('div', 'modal-overlay');
        var box = U.el('div', 'modal-box');
        box.appendChild(U.el('div', 'modal-msg', I18n.t('Connect Trakt')));
        var body = U.el('div', 'trakt-connect');
        body.appendChild(U.el('div', 'tc-line', I18n.t('Starting…')));
        box.appendChild(body);
        var row = U.el('div', 'modal-row');
        var cancel = U.el('div', 'pill focusable modal-btn', I18n.t('Cancel'));
        cancel.__onselect = function () { closeModal(); };
        row.appendChild(cancel);
        box.appendChild(row);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        showModal(overlay, cancel);

        var cancelFlow = Trakt.startDeviceFlow({
            onCode: function (code, url) {
                U.clear(body);
                // a QR of Trakt's activate page with the code in it (Trakt keeps it through
                // signing in): scan, sign in if asked, confirm; the code and link for typing
                var qrText = /\/activate\/?$/.test(url) ? url.replace(/\/+$/, '') + '/' + encodeURIComponent(code) : url;
                var qrSpot = U.el('div', 'tc-qr-spot');
                body.appendChild(qrSpot);
                var goTo = body.appendChild(U.el('div', 'tc-line', I18n.t('On your phone or computer, go to:')));
                // (the QR library is loaded the first time this box opens: nothing else uses it)
                (typeof qrcode !== 'undefined' ? Promise.resolve() : U.loadScript('js/qrcode.js')).then(function () {
                    var qr = U.qrCanvas(qrText, 8);
                    if (!qr || !qrSpot.parentNode) { return; }
                    qr.className = 'tc-qr';
                    qrSpot.appendChild(U.el('div', 'tc-line', I18n.t('Scan with your phone:')));
                    qrSpot.appendChild(qr);
                    goTo.textContent = I18n.t('or go to');
                }, function () {});
                body.appendChild(U.el('div', 'tc-url', url));
                body.appendChild(U.el('div', 'tc-line', I18n.t('and enter this code:')));
                body.appendChild(U.el('div', 'tc-code', code));
                body.appendChild(U.el('div', 'tc-line small', I18n.t('Waiting for you to authorize…')));
            },
            onSuccess: function (user) {
                U.clear(body);
                body.appendChild(U.el('div', 'tc-line', I18n.t('✓ Connected as ') + user));
                markHomeDirty();
                setTimeout(function () { if (isModalOpen()) { onModalClose(null); closeModal(); renderSettings(); } }, 1500);
            },
            onError: function (msg) {
                U.clear(body);
                body.appendChild(U.el('div', 'tc-line', msg || I18n.t('Could not connect.')));
            }
        });
        onModalClose(cancelFlow);   // canceling the overlay stops polling
    }

    function settingsSubtitles(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Subtitles')));
        wrap.appendChild(subPickRow(I18n.t('Default language'), SUB_LANGS, 'lang'));
        wrap.appendChild(subPickRow(I18n.t('Second choice'), SUB_LANGS2, 'lang2'));
        wrap.appendChild(subPickRow(I18n.t('Second subtitle (at the top)'), SUB_LANGS, 'second'));
        wrap.appendChild(subPickRow(I18n.t('Only my languages'), SUB_ONLY, 'only'));
        // lines to leave out: those with one of your words (a subtitle site's ads, a file's name…)
        var skip = Player.getSubCfg().skip || [];
        var sk = U.el('div', 'addon-item focusable cfg-row');
        sk.appendChild(U.el('div', 'a-name', I18n.t('Skip lines with:  ') + (skip.length ? skip.join(', ') : I18n.t('None'))));
        sk.appendChild(U.el('div', 'a-url', I18n.t('Press OK to change   ·   a subtitle line with one of these in it isn’t shown (capitals or not)')));
        sk.__onselect = function () {
            App.openEntry({ title: I18n.t('Skip subtitle lines with'), value: skip.join(', '), placeholder: I18n.t('OPENSUBTITLES, .SRT'),
                hint: I18n.t('Words (or bits of them) separated by commas, capitals or not: lines with one aren’t shown. For example OPENSUBTITLES (ads) and .SRT (file names). Leave it empty for none.'),
                validate: function () { return null; },
                onConfirm: function (v) { var c = Player.getSubCfg(); c.skip = ('' + v).split(','); Player.setSubCfg(c); App.back(); renderSettings(); } });
        };
        wrap.appendChild(sk);
        var look = sectionRow(I18n.t('Appearance  ›'), I18n.t('Size, color, background, edge, position, font'), 'subtitlelook');   // (their own page: settingsSubtitleLook)
        wrap.appendChild(look);
        if (_focusChild === 'subtitlelook') { _focusChild = null; Focus.setScope(scr('settings'), look); } else { focusSettings(); }
    }
    // Subtitles › Appearance: how subtitles look.
    function settingsSubtitleLook(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Subtitle appearance')));
        wrap.appendChild(subPickRow(I18n.t('Size'), SUB_SIZES, 'size'));
        // [id, label] for the picker (colors with a swatch)
        function plain(list) { return list.map(function (x) { return [x[0], x[1]]; }); }
        wrap.appendChild(subPickRow(I18n.t('Color'), Player.SUB_COLORS.map(function (x) { return [x[0], x[1], null, x[2]]; }), 'color'));
        wrap.appendChild(subPickRow(I18n.t('Background'), plain(Player.SUB_BGS), 'bg'));
        wrap.appendChild(subPickRow(I18n.t('Edge'), plain(Player.SUB_EDGES), 'edge'));
        wrap.appendChild(subPickRow(I18n.t('Position'), plain(Player.SUB_POSITIONS), 'pos'));
        wrap.appendChild(subPickRow(I18n.t('Font'), Player.SUB_FONTS, 'font'));
        focusSettings();
    }

    // Skipping: intros and recaps skipped on their own after a countdown (with Cancel), or asked.
    var SKIP_CHOICES = [['0', I18n.t('Ask (a Skip button)')], ['5', I18n.t('After 5 seconds')], ['10', I18n.t('After 10 seconds')], ['15', I18n.t('After 15 seconds')], ['30', I18n.t('After 30 seconds')]];
    // Settings › Addons: how long an addon's answer is waited for (an addon that sleeps when
    // unused fails the first time while it wakes up).
    var ADDON_WAITS = [['0', I18n.t('Normal (12 s; sources 15, search 25)')], ['20', I18n.t('20 seconds')], ['30', I18n.t('30 seconds')], ['45', I18n.t('45 seconds')], ['60', I18n.t('60 seconds')]];
    var NEXT_CHOICES = [['0', I18n.t('Ask')], ['5', I18n.t('After 5 seconds')], ['10', I18n.t('After 10 seconds')], ['15', I18n.t('After 15 seconds')], ['30', I18n.t('After 30 seconds')]];
    // Seeking & buffering: how far LEFT / RIGHT jump; a bigger buffer for slow connections; how
    // often a live channel that drops is opened again.
    var RECONNECTS = [['off', I18n.t('Off')], ['few', I18n.t('A few times (3 in 5 minutes)')], ['always', I18n.t('Keep trying')]];
    function settingsSeeking(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Seeking & buffering')));
        var store = { get: function () { var c = Player.playerCfg(); return { seek: '' + c.seek, buffer: c.buffer, reconnect: c.reconnect }; },
            set: function (cfg) { Player.setPlayerCfg({ seek: +cfg.seek || 10, buffer: cfg.buffer, reconnect: cfg.reconnect }); } };
        wrap.appendChild(subPickRow(I18n.t('Seek step'), [['5', I18n.t('5 s')], ['10', I18n.t('10 s')], ['15', I18n.t('15 s')], ['30', I18n.t('30 s')]], 'seek', store));
        wrap.appendChild(subPickRow(I18n.t('Buffer'), [['normal', I18n.t('Normal (the TV’s own)')], ['more', I18n.t('More')], ['most', I18n.t('Most')]], 'buffer', store));
        wrap.appendChild(subPickRow(I18n.t('Reconnect live channels'), RECONNECTS, 'reconnect', store));
        wrap.appendChild(U.el('div', 'hint', I18n.t('Seek step: how far LEFT / RIGHT jump (FF / REW jump three steps). Buffer: More or Most starts a little slower but stops less on a slow connection, from the next video you play. Reconnect: a live channel that drops opens again; Keep trying waits a little longer each time (BACK stops it).')));
        focusSettings();
    }
    function settingsSkipping(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Skipping')));
        wrap.appendChild(subPickRow(I18n.t('Intros, recaps and previews'), SKIP_CHOICES, 'autoSkip', {
            get: function () { return { autoSkip: '' + Stremio.getPrefs().autoSkip }; },
            set: function (cfg) { Stremio.setPref('autoSkip', +cfg.autoSkip || 0); }
        }));
        wrap.appendChild(subPickRow(I18n.t('Next episode'), NEXT_CHOICES, 'autoNext', {
            get: function () { return { autoNext: '' + Stremio.getPrefs().autoNext }; },
            set: function (cfg) { Stremio.setPref('autoNext', +cfg.autoNext || 0); }
        }));
        wrap.appendChild(U.el('div', 'hint', I18n.t('Ask shows a Skip button at an intro, recap or preview, and Skip Credits → Next at the credits. With a time, it counts down and skips (or plays the next episode) on its own; Cancel keeps watching.')));
        focusSettings();
    }

    var POSTER_SHAPES = [['portrait', I18n.t('Portrait')], ['landscape', I18n.t('Landscape')]];
    // ----- Diagnostics › Logs: the recent problems U.log kept (in memory, URLs masked), and
    // how long launches took -----
    function settingsLogs(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Diagnostics  ›  Logs')));
        var list = U.logEntries ? U.logEntries() : [];
        wrap.appendChild(U.el('div', 'hint', list.length
            ? I18n.t('The last ') + list.length + I18n.t(' problem') + (list.length === 1 ? '' : 's') + I18n.t(' since StremioK started, newest first, with keys and passwords masked. After a crash, what came just before is here too. Nothing here leaves the TV.')
            : I18n.t('No problems since StremioK started.')));
        function two(n) { return (n < 10 ? '0' : '') + n; }
        list.forEach(function (e) {
            var d = new Date(e.t);
            var r = U.el('div', 'addon-item focusable diag-row');
            r.appendChild(U.el('div', 'a-name', two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()) + '   ' + e.src + (e.n > 1 ? '   ×' + e.n : '')));
            r.appendChild(U.el('div', 'a-url', e.msg));
            wrap.appendChild(r);
        });
        if (list.length) {
            var clear = U.el('div', 'addon-item focusable');
            clear.appendChild(U.el('div', 'a-name', I18n.t('Clear log')));
            clear.__onselect = function () { U.clearLog(); renderSettings(); };
            wrap.appendChild(clear);
        }
        startupLines(wrap);
        focusSettings();
    }
    // ----- Diagnostics › Storage: the database on or off, what's using the storage, tidying the
    // database up, giving up the copies that can be made again -----
    function settingsStorage(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Diagnostics  ›  Storage')));
        var was = Focus.current(), wasName = was && was.querySelector && was.querySelector('.a-name');   // (drawn again: on the same row)
        var wasKey = wasName ? wasName.textContent.split(/:|   —/)[0] : '';
        var on = !!(U.bigStore && U.bigStore.enabled && U.bigStore.enabled());
        var db = U.el('div', 'addon-item focusable');
        db.appendChild(U.el('div', 'a-name', I18n.t('Use the TV’s database: ') + (on ? I18n.t('On') : I18n.t('Off'))));
        db.appendChild(U.el('div', 'a-url', I18n.t('Holds StremioK’s big copies (saved Home rows, playlists, USB indexes, your Trakt history). Off: they go in the smaller settings storage, and the database is deleted')));
        db.__onselect = function () {
            function apply(v) {
                U.bigStore.setEnabled(v).then(function (r) {
                    _storageInfo = null;
                    U.toast(!r ? I18n.t('Couldn’t change it (Diagnostics › Logs says why)') : v ? I18n.t('Using the TV’s database') : I18n.t('The TV’s database is off and deleted') + (r.total ? ': ' + r.moved + I18n.t(' of ') + r.total + I18n.t(' copies kept in the settings storage') : ''));
                    if (_settingsSection === 'storage') { renderSettings(); }
                });
            }
            if (!on) { apply(true); return; }
            confirm(I18n.t('Stop using the TV’s database? It’s deleted, and StremioK’s copies are kept in the settings storage (what doesn’t fit is made again when needed).'), I18n.t('Turn off'), function () { apply(false); });
        };
        wrap.appendChild(db);
        storageLines(wrap, on);
        var rows = wrap.querySelectorAll('.addon-item'), back = db;
        for (var i = 0; wasKey && i < rows.length; i++) { var nm = rows[i].querySelector('.a-name'); if (nm && nm.textContent.split(/:|   —/)[0] === wasKey) { back = rows[i]; break; } }
        Focus.setScope(scr('settings'), back);
    }
    // ----- Diagnostics › Installed apps -----
    function settingsTvApps(wrap) {
        var firstApp = tvAppsSection(wrap);
        if (firstApp && _tvApps.fresh) {   // just read: land on the list
            _tvApps.fresh = false;
            Focus.setScope(scr('settings'), firstApp);
        } else {
            focusSettings();
        }
    }

    // ----- Private viewing (see player-store): on or off; also on the player's quick bar (UP). -----
    function settingsPrivate(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Private viewing')));
        var on = Player.isPrivate();
        var r = U.el('div', 'addon-item focusable');
        r.appendChild(U.el('div', 'a-name', I18n.t('Private viewing: ') + (on ? I18n.t('On') : I18n.t('Off'))));
        r.appendChild(U.el('div', 'a-url', on ? I18n.t('What you play isn’t recorded (StremioK, at the top, drawn as an outline meanwhile)') : I18n.t('What you play is recorded as usual')));
        r.__onselect = function () { Player.setPrivate(!on); markHomeDirty(); renderSettings(); };
        wrap.appendChild(r);
        wrap.appendChild(U.el('div', 'hint', I18n.t('While it’s on, what you play isn’t recorded: no progress, Continue Watching, watched marks, Trakt or remembered choices. What you do by hand still counts. Addons and other services are contacted as usual. UP › ◐ Private switches it while something plays.')));
        Focus.setScope(scr('settings'), r);
    }

    // ----- USB drive: each drive's index (what it has, how much is matched to titles), the
    // hidden-files switch, and forgetting the matches. -----
    var _usbListening = false;
    function usbDriveLine(st) {
        if (st.state === 'scanning') { return st.phase === 'matching' ? I18n.t('Indexing: matching ') + st.done + I18n.t(' of ') + st.total + I18n.t(' titles   ·   OK: stop') : I18n.t('Indexing: listing the drive…   ·   OK: stop'); }
        if (st.state === 'failed') { return I18n.t('Indexing failed: ') + st.error; }
        if (st.state === 'none') { return I18n.t('Not indexed yet'); }
        return st.videos + I18n.t(' video') + (st.videos === 1 ? '' : 's') + ', ' + st.matched + I18n.t(' matched to titles') + (st.truncated ? I18n.t(' (a very large drive: only part of it)') : '') +
            (st.left ? ', ' + st.left + I18n.t(' titles left to match') : '') + I18n.t('   ·   indexed ') + U.dayLabel(st.at) + ' ' + new Date(st.at).toTimeString().slice(0, 5);
    }
    function settingsUsb(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('USB drive')));
        if (typeof LocalMedia === 'undefined' || !LocalMedia.available()) {
            wrap.appendChild(U.el('div', 'hint', I18n.t('Only on the TV: this install can’t see USB drives.')));
            focusSettings();
            return;
        }
        if (!_usbListening) {
            _usbListening = true;
            LocalMedia.onChange(function (what) {
                if (_settingsSection !== 'usb' || /\bhidden\b/.test(scr('settings').className || '') || isModalOpen()) { return; }
                if (what === 'drives') { renderSettings(); return; }
                if (what === 'status' || what === 'matches') {   // (indexing progress: the drives' lines updated where they are, focus untouched)
                    var rows = scr('settings').querySelectorAll('.settings-wrap .addon-item');
                    for (var i = 0; i < rows.length; i++) {   // (a NodeList: no forEach on Tizen 3)
                        if (rows[i].__usbDrive) { rows[i].querySelector('.a-url').textContent = usbDriveLine(LocalMedia.status(rows[i].__usbDrive)); }
                    }
                }
            });
        }
        wrap.appendChild(U.el('div', 'hint', I18n.t('Home › Local shows your drive. Videos are matched to titles by their names, and a matched one plays as that title. Index a drive to have its videos and subtitle files offered on their title pages.')));
        if (!LocalMedia.isRead()) {   // (read when asked, not at launch)
            wrap.appendChild(U.el('div', 'hint', I18n.t('Reading USB drives…')));
            LocalMedia.ensure().then(function () { if (_settingsSection === 'usb') { renderSettings(); } });
            focusSettings();
            return;
        }
        var ds = LocalMedia.knownDrives(), first = null;
        if (!ds.length) { wrap.appendChild(U.el('div', 'hint', I18n.t('No USB drive plugged in.'))); }
        ds.forEach(function (d) {
            var r = U.el('div', 'addon-item focusable');
            r.__usbDrive = d;
            r.appendChild(U.el('div', 'a-name', '💾  ' + d.label.replace(/^removable_/, '') + I18n.t('   —   Index')));
            r.appendChild(U.el('div', 'a-url', usbDriveLine(LocalMedia.status(d))));
            r.__onselect = function () {
                var st = LocalMedia.status(d);
                if (st.state === 'scanning') { V.confirmStopIndexing(d, st, renderSettings); return; }
                if (st.left) {
                    pickList(I18n.t('Index this drive'), [['more', I18n.t('Continue matching (') + st.left + I18n.t(' titles left)')], ['again', I18n.t('Index again (list the drive afresh)')]], 'more', function (k) {
                        if (k === 'more') { LocalMedia.continueMatching(d); } else { LocalMedia.scan(d); }
                        renderSettings();
                    });
                    return;
                }
                LocalMedia.scan(d); renderSettings();
            };
            wrap.appendChild(r);
            first = first || r;
        });
        var mt = U.el('div', 'addon-item focusable');
        mt.appendChild(U.el('div', 'a-name', I18n.t('Match videos to titles: ') + (LocalMedia.matchingAllowed() ? I18n.t('On') : LocalMedia.matchingAsked() ? I18n.t('Off') : I18n.t('Off (not asked yet)'))));
        mt.appendChild(U.el('div', 'a-url', I18n.t('On: titles worked out from your videos’ names (not the files) are looked up with your search addons, which see them. Off: Local just browses')));
        mt.__onselect = function () { LocalMedia.setMatching(!LocalMedia.matchingAllowed()); markHomeDirty(); renderSettings(); Focus.setScope(scr('settings'), scr('settings').querySelectorAll('.settings-wrap .addon-item')[ds.length]); };
        wrap.appendChild(mt);
        var hid = U.el('div', 'addon-item focusable');
        hid.appendChild(U.el('div', 'a-name', I18n.t('Show hidden files: ') + (LocalMedia.showHidden() ? I18n.t('On') : I18n.t('Off'))));
        hid.appendChild(U.el('div', 'a-url', I18n.t('Names starting with “.” (a Mac leaves ._… copies, .DS_Store, .Spotlight-V100…), $RECYCLE.BIN, System Volume Information')));
        hid.__onselect = function () { LocalMedia.setShowHidden(!LocalMedia.showHidden()); markHomeDirty(); renderSettings(); Focus.setScope(scr('settings'), scr('settings').querySelectorAll('.settings-wrap .addon-item')[ds.length + 1]); };
        wrap.appendChild(hid);
        var clr = U.el('div', 'addon-item focusable');
        clr.appendChild(U.el('div', 'a-name', I18n.t('Clear the USB index')));
        clr.appendChild(U.el('div', 'a-url', I18n.t('What StremioK listed of your drives: title pages stop offering their files until a drive is indexed again (Local still browses them)')));
        clr.__onselect = function () {
            confirm(I18n.t('Clear the index of your USB drives?'), I18n.t('Clear'), function () { LocalMedia.clearIndex(); U.toast(I18n.t('USB index cleared')); renderSettings(); });
        };
        wrap.appendChild(clr);
        var forget = U.el('div', 'addon-item focusable');
        forget.appendChild(U.el('div', 'a-name', I18n.t('Forget matches')));
        forget.appendChild(U.el('div', 'a-url', I18n.t('Every video matched again from its name, as you browse or index (the ones you matched by hand too)')));
        forget.__onselect = function () {
            confirm(I18n.t('Forget which title each video is (yours too)? They’re matched again as you browse, or when a drive is indexed.'), I18n.t('Forget'), function () {
                LocalMedia.forgetMatches();
                markHomeDirty();
                renderSettings();
            });
        };
        wrap.appendChild(forget);
        if (first) { Focus.setScope(scr('settings'), first); } else { focusSettings(); }
    }


    // What's using the TV's storage for StremioK (checked when asked: it reads every saved copy),
    // and giving up the copies that can be made again.
    var _storageInfo = null, STORAGE_ITEMS = 20;
    // An item in the TV's database by what it is: { name, unused: why it's no longer used, if so }
    function storageItem(key) {
        var m;
        if (key === 'stremiokptbr.homecache') { return { name: I18n.t('Home’s saved rows') }; }
        if (key === 'stremiokptbr.trakt.watched') { return { name: I18n.t('Trakt watched history') }; }
        if ((m = key.match(/^stremiokptbr\.iptv\.cache\.(.+)$/))) {
            var p = (typeof IPTV !== 'undefined' ? IPTV.getPlaylists() : []).filter(function (x) { return x.id === m[1]; })[0];
            return p ? { name: I18n.t('IPTV playlist copy: ') + (p.name || (('' + p.url).match(/^[a-z]+:\/\/(?:[^\/@]*@)?([^\/?#:]+)/i) || [])[1] || I18n.t('a playlist')) }
                : { name: I18n.t('IPTV playlist copy (') + key + ')', unused: I18n.t('its playlist was removed') };
        }
        if ((m = key.match(/^stremiokptbr\.local\.index\.(.+)$/))) {
            var kept = U.store.get('stremiokptbr.local.indexes', {}) || {};
            return kept[m[1]] ? { name: I18n.t('USB drive index: ') + m[1] } : { name: I18n.t('USB drive index: ') + m[1], unused: I18n.t('not one of the drives kept') };
        }
        if (key === 'stremiokptbr.local.index') { return { name: I18n.t('USB index (') + key + ')', unused: I18n.t('kept by an earlier version') }; }
        return { name: key };
    }
    function fmtBytes(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + I18n.t(' MB') : Math.max(1, Math.round(n / 1024)) + I18n.t(' KB'); }
    function storageLines(wrap, dbOn) {
        var r = U.el('div', 'addon-item focusable startup-row');
        r.appendChild(U.el('div', 'a-name', I18n.t('TV storage') + (_storageInfo ? '' : I18n.t('   —   check what’s using it'))));
        if (_storageInfo === 'busy') { r.appendChild(U.el('div', 'a-url', I18n.t('Checking…'))); }
        else if (_storageInfo) {
            var inf = _storageInfo;
            var line = function (t) { r.appendChild(U.el('div', 'a-url', t)); };
            var mine = inf.entries.reduce(function (n, e) { return n + e.bytes; }, 0);
            if (inf.quota) { line(I18n.t('The TV’s database: ') + fmtBytes(inf.usage || 0) + I18n.t(' used of ') + fmtBytes(inf.quota) + I18n.t(' it allows StremioK')); }
            if (inf.entries.length) {
                var own = I18n.t('StremioK’s own data: about ') + fmtBytes(mine) + I18n.t(' in ') + inf.entries.length + (inf.entries.length === 1 ? I18n.t(' item') : I18n.t(' items'));
                line((inf.usage || 0) > mine + 65536 ? I18n.t('Of that, ') + own + I18n.t('; the other ') + fmtBytes(inf.usage - mine) + I18n.t(' is the database’s own: old versions of items saved again, which it clears out over time on its own (not copies StremioK keeps)') : own);
            }
            var sorted = inf.entries.slice().sort(function (a, b) { return b.bytes - a.bytes; });
            sorted.slice(0, STORAGE_ITEMS).forEach(function (e) {
                var d = storageItem(e.key), notes = [];
                if (e.saves) { notes.push(e.saves === 1 ? I18n.t('saved once since StremioK started') : I18n.t('saved ') + e.saves + I18n.t(' times since StremioK started')); }
                if (d.unused) { notes.push(I18n.t('no longer used: ') + d.unused); }
                if (inf.lsKeys[e.key]) { notes.push(I18n.t('also in the settings storage')); }
                line(fmtBytes(e.bytes) + '   ' + d.name + notes.map(function (n) { return '   ·   ' + n; }).join(''));
            });
            if (sorted.length > STORAGE_ITEMS) {
                line(I18n.t('and ') + (sorted.length - STORAGE_ITEMS) + I18n.t(' more: ') + fmtBytes(sorted.slice(STORAGE_ITEMS).reduce(function (n, e) { return n + e.bytes; }, 0)));
            }
            if (!inf.entries.length) { line(dbOn ? I18n.t('Nothing in the TV’s database.') : I18n.t('The TV’s database isn’t used (turned off above).')); }
            line(I18n.t('Settings storage: ') + fmtBytes(inf.ls) + I18n.t(' (progress, watched marks, settings…)') + (inf.lsTop.length ? I18n.t('; the largest:') : ''));
            inf.lsTop.forEach(function (e) { line('   ' + fmtBytes(e.bytes) + '   ' + e.key); });
            if (inf.guides && inf.guides.count) { line(I18n.t('Saved TV guides (in StremioK’s folder): ') + fmtBytes(inf.guides.bytes) + I18n.t(' in ') + inf.guides.count + (inf.guides.count === 1 ? I18n.t(' file') : I18n.t(' files'))); }
            if (inf.guides && inf.guides.xtv && inf.guides.xtv.count) { line(I18n.t('Saved Xtream film and series lists (in StremioK’s folder): ') + fmtBytes(inf.guides.xtv.bytes) + I18n.t(' in ') + inf.guides.xtv.count + (inf.guides.xtv.count === 1 ? I18n.t(' file') : I18n.t(' files'))); }
            if (inf.disk) { line(I18n.t('The TV’s own disk: ') + fmtBytes(inf.disk.free) + I18n.t(' free of ') + fmtBytes(inf.disk.total) + I18n.t('  (what the TV allows StremioK follows it: freeing space, unused apps for one, raises it)')); }
        }
        r.__onselect = function () {
            if (!U.bigStore || !U.bigStore.info || _storageInfo === 'busy') { return; }
            _storageInfo = 'busy'; renderSettings();
            var guides = (typeof YTPlay !== 'undefined' && YTPlay.epgFiles) ? YTPlay.epgFiles().then(null, function () { return null; }) : null;
            Promise.all([U.bigStore.info(), U.diskInfo ? U.diskInfo() : null, guides]).then(function (both) {
                var inf = both[0], ls = 0, lsAll = [];
                inf.disk = both[1];
                inf.guides = both[2];   // ({ count, bytes }: the TV guides StremioK's service saved)
                inf.lsKeys = {};
                try {
                    for (var i = 0; i < window.localStorage.length; i++) {
                        var k = window.localStorage.key(i), n = (k.length + (window.localStorage.getItem(k) || '').length) * 2;
                        ls += n; lsAll.push({ key: k, bytes: n }); inf.lsKeys[k] = true;
                    }
                } catch (e) {}
                inf.ls = ls;
                inf.lsTop = lsAll.sort(function (a, b) { return b.bytes - a.bytes; }).slice(0, 5);
                _storageInfo = inf;
                if (_settingsSection === 'storage') { renderSettings(); }
            }, function () { _storageInfo = null; U.toast(I18n.t('Couldn’t check')); renderSettings(); });
        };
        wrap.appendChild(r);
        if (dbOn) {   // (tidying up: only while it's used)
            var tidy = U.el('div', 'addon-item focusable');
            tidy.appendChild(U.el('div', 'a-name', I18n.t('Tidy up the TV’s database')));
            tidy.appendChild(U.el('div', 'a-url', I18n.t('Gives back the space of old versions of what StremioK saved, which the TV’s database keeps (StremioK’s data stays). Done on its own when they take over half of what the TV allows')));
            tidy.__onselect = function () {
                if (!U.bigStore || !U.bigStore.tidy) { return; }
                U.toast(I18n.t('Tidying up the TV’s database…'));
                U.bigStore.tidy().then(function (res) {
                    U.toast(!res ? I18n.t('Couldn’t tidy it up (Diagnostics › Logs says why)') : res.before != null && res.after != null ? I18n.t('The TV’s database: ') + fmtBytes(res.before) + ' → ' + fmtBytes(res.after) : I18n.t('Tidied up'));
                    _storageInfo = null;
                    if (_settingsSection === 'storage') { renderSettings(); }
                });
            };
            wrap.appendChild(tidy);
        }
        var clr = U.el('div', 'addon-item focusable');
        clr.appendChild(U.el('div', 'a-name', I18n.t('Clear saved copies')));
        clr.appendChild(U.el('div', 'a-url', I18n.t('Home’s saved rows, IPTV playlist copies, saved TV guides and Xtream lists, the USB index: made again when needed (playlists, guides and lists download again)')));
        clr.__onselect = function () {
            confirm(I18n.t('Clear the copies StremioK can make again (Home rows, playlist copies, TV guides, Xtream lists, USB index)?'), I18n.t('Clear'), function () {
                U.bigStore.keys().then(function (ks) {
                    return Promise.all(ks.filter(function (k) { return /^stremiokptbr\.(homecache|local\.index|iptv\.cache\.)/.test(k); }).map(function (k) { return U.bigStore.remove(k); }));
                }).then(function () {
                    return (typeof YTPlay !== 'undefined' && YTPlay.epgClear) ? YTPlay.epgClear().then(null, function () {}) : null;   // (the saved guides: read again as they're needed)
                }).then(function () {
                    if (typeof EPG !== 'undefined' && EPG.reset) { EPG.reset(); }
                    if (typeof LocalMedia !== 'undefined') { LocalMedia.clearIndex(); }
                    _storageInfo = null;
                    U.toast(I18n.t('Saved copies cleared'));
                    renderSettings();
                });
            });
        };
        wrap.appendChild(clr);
    }

    // How long this launch (and the one before) took to get going, from when the TV
    // started loading the app.
    var STARTUP_STEPS = [['css', 'stylesheet'], ['firstScreen', I18n.t('first screen')], ['addons', 'addons'], ['firstCard', I18n.t('first title')]];
    function startupText(m) {
        var parts = [];
        STARTUP_STEPS.forEach(function (st) { if (m && typeof m[st[0]] === 'number') { parts.push(st[1] + ' ' + (m[st[0]] / 1000).toFixed(1) + I18n.t(' s')); } });
        return parts.join('   ·   ');
    }
    function startupLines(wrap) {
        if (!U.startupMarks) { return; }
        var now = startupText(U.startupMarks()), before = startupText(U.startupMarks(true));
        if (!now && !before) { return; }
        var r = U.el('div', 'addon-item focusable startup-row');
        r.appendChild(U.el('div', 'a-name', I18n.t('Startup')));
        if (now) { r.appendChild(U.el('div', 'a-url', I18n.t('This launch: ') + now)); }
        if (before) { r.appendChild(U.el('div', 'a-url', I18n.t('Launch before: ') + before)); }
        wrap.appendChild(r);
    }

    // ----- Streaming apps: your apps on this TV that a title's "where to watch" sources
    // open (TVApps.appForService), then this TV's apps to add. OK on one of yours removes it. -----
    var _appsFocus = null;   // { id, ctl } to focus after a change
    var _appsAll = false;    // the add list includes hidden (system) apps
    function settingsAppShortcuts(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Streaming apps')));
        if (!canListApps()) {
            wrap.appendChild(U.el('div', 'hint', I18n.t('Only on the TV: this install can\'t see or open the TV\'s apps.')));
            focusSettings();
            return;
        }
        wrap.appendChild(U.el('div', 'hint feeds-hint', I18n.t('A title\'s "where to watch" sources open these apps. Most are found by name; list one only where the TV has several for a service (like Netflix). OK on one of yours removes it.')));
        function redo(id, ctl) { _appsFocus = { id: id, ctl: ctl }; renderSettings(); }
        var mine = TVApps.shortcuts(), nameOf = {};
        if (!mine.length) { wrap.appendChild(U.el('div', 'hint', I18n.t('None listed yet: pick apps below.'))); }
        mine.forEach(function (a, i) {
            var r = U.el('div', 'addon-item focusable app-mine');
            r.setAttribute('data-fk', a.id); r.setAttribute('data-ctl', 'name');
            r.appendChild(U.el('div', 'a-name', a.name));
            nameOf[a.id] = U.el('div', 'a-url', a.id);
            r.appendChild(nameOf[a.id]);
            r.__onselect = function () {
                TVApps.remove(a.id);
                U.toast(a.name + I18n.t(' removed'), 1500);
                var next = mine[i + 1] || mine[i - 1];   // focus stays in the list
                redo(next ? next.id : null, next ? 'name' : 'add');
            };
            wrap.appendChild(r);
        });
        wrap.appendChild(U.el('div', 'formats-group', I18n.t('Add an app')));
        var status = U.el('div', 'hint', I18n.t('Reading this TV\'s apps…'));
        wrap.appendChild(status);
        function focusNow() {
            var want = _appsFocus, pref = null;
            _appsFocus = null;
            var nodes = wrap.querySelectorAll('.app-mine, .app-add');
            for (var k = 0; want && k < nodes.length; k++) {
                if (nodes[k].getAttribute('data-fk') === (want.id || '') && nodes[k].getAttribute('data-ctl') === want.ctl) { pref = nodes[k]; break; }
            }
            if (!pref && want && want.ctl === 'add') { pref = wrap.querySelector('.app-add'); }
            Focus.setScope(scr('settings'), pref || wrap.querySelector('.app-mine, .app-add') || undefined);
        }
        TVApps.installed().then(function (apps) {
            if (_settingsSection !== 'appshortcuts' || !wrap.parentNode) { return; }   // left meanwhile
            var onTv = {};
            apps.forEach(function (a) { onTv[a.id] = true; });
            mine.forEach(function (a) { if (!onTv[a.id]) { nameOf[a.id].textContent += I18n.t('   ·   not on this TV any more'); } });
            var hidden = 0;
            var list = apps.filter(function (a) {
                if (TVApps.has(a.id)) { return false; }
                if (!_appsAll && !a.show) { hidden++; return false; }
                return true;
            });
            status.textContent = list.length ? I18n.t('OK adds one. Where an app is listed more than once, pick the one that opens (Settings › Diagnostics › Installed apps tries them).')
                : I18n.t('Every app on this TV is already listed.');
            list.forEach(function (a, i) {
                var r = U.el('div', 'addon-item focusable app-add');
                r.setAttribute('data-fk', a.id); r.setAttribute('data-ctl', 'add');
                r.appendChild(U.el('div', 'a-name', a.name));
                r.appendChild(U.el('div', 'a-url', a.id + (a.show ? '' : I18n.t('   ·   hidden (system) app'))));
                r.__onselect = function () {
                    if (!TVApps.add(a)) { U.toast(I18n.t('That\'s the most apps StremioK keeps (') + TVApps.MAX + ')'); return; }
                    U.toast(a.name + I18n.t(' added'), 1500);
                    var next = list[i + 1] || list[i - 1];   // keep adding from here
                    redo(next ? next.id : a.id, next ? 'add' : 'name');
                };
                wrap.appendChild(r);
            });
            if (_appsAll || hidden) {
                var more = U.el('div', 'addon-item focusable app-add');
                more.setAttribute('data-fk', '*hidden'); more.setAttribute('data-ctl', 'hidden');
                more.appendChild(U.el('div', 'a-name', _appsAll ? I18n.t('Hide the hidden (system) apps') : I18n.t('Also show ') + hidden + I18n.t(' hidden (system) app') + (hidden === 1 ? '' : 's')));
                more.__onselect = function () { _appsAll = !_appsAll; redo('*hidden', 'hidden'); };
                wrap.appendChild(more);
            }
            focusNow();
        }, function (e) {
            if (_settingsSection !== 'appshortcuts' || !wrap.parentNode) { return; }
            status.textContent = I18n.t('The TV didn\'t list its apps: ') + e.message;
            focusNow();
        });
    }

    // ----- Diagnostics › Installed apps: what the TV has installed, with each app's ID, read
    // on request. OK on one opens it, to check StremioK may launch it from this install. -----
    var _tvApps = null;   // null: not read yet; else { list, hidden, error, all, fresh }
    function canListApps() { return typeof TVApps !== 'undefined' && TVApps.available(); }
    function readTvApps(all) {
        function done(v) {
            v.all = !!all; v.fresh = true; _tvApps = v;
            if (_settingsSection === 'tvapps') { renderSettings(); }
        }
        TVApps.installed().then(function (apps) {
            var list = apps.filter(function (a) { return all || a.show; });
            done({ list: list, hidden: apps.length - list.length });
        }, function (e) { done({ error: e.message }); });
    }
    function launchTvApp(a) {
        TVApps.launch(a).then(null, function (e) { U.toast(I18n.t('Couldn\'t open ') + a.name + ': ' + e.message, 4000); });
    }
    // Returns the first app row (to focus), if the list is showing.
    function tvAppsSection(wrap) {
        wrap.appendChild(U.el('h2', null, I18n.t('Diagnostics  ›  Installed apps')));
        if (!canListApps()) {
            wrap.appendChild(U.el('div', 'hint', I18n.t('Only on the TV: this install can\'t see the TV\'s apps.')));
            return null;
        }
        if (!_tvApps) {
            var show = U.el('div', 'addon-item focusable');
            show.appendChild(U.el('div', 'a-name', I18n.t('Show installed apps')));
            show.appendChild(U.el('div', 'a-url', I18n.t('Their names and IDs, as the TV reports them')));
            show.__onselect = function () { readTvApps(false); };
            wrap.appendChild(show);
            return null;
        }
        if (_tvApps.error) {
            wrap.appendChild(U.el('div', 'hint', I18n.t('The TV didn\'t list its apps: ') + _tvApps.error));
            return null;
        }
        wrap.appendChild(U.el('div', 'hint', _tvApps.list.length + I18n.t(' app') + (_tvApps.list.length === 1 ? '' : 's') +
            (_tvApps.all ? I18n.t(', including hidden ones') : '') + '. OK on one opens it (to check StremioK can launch it).'));
        var first = null;
        _tvApps.list.forEach(function (a) {
            var r = U.el('div', 'addon-item focusable diag-row');
            r.appendChild(U.el('div', 'a-name', a.name));
            r.appendChild(U.el('div', 'a-url', a.id + (a.version ? I18n.t('   ·   version ') + a.version : '')));
            r.__onselect = function () { launchTvApp(a); };
            wrap.appendChild(r);
            if (!first) { first = r; }
        });
        if (!_tvApps.all && _tvApps.hidden > 0) {
            var more = U.el('div', 'addon-item focusable');
            more.appendChild(U.el('div', 'a-name', I18n.t('Also show ') + _tvApps.hidden + I18n.t(' hidden (system) app') + (_tvApps.hidden === 1 ? '' : 's')));
            more.__onselect = function () { readTvApps(true); };
            wrap.appendChild(more);
        }
        return first;
    }

    // ----- Home feeds and Search results (Settings > Home): order, show / hide -----
    // kind 'home': the Home rows (every catalog); 'search': the Search rows (every catalog
    // that can search, IPTV as one per type). ▲/▼ moves one; OK on its name shows / hides it.
    // 'menu': the top menu between Watching and Settings (the tabs, Discover, Search: ViewParts'
    // menuOrder); OK on a tab shows / hides it, Discover and Search always show.
    var MENU_FIXED = { discover: I18n.t('Discover'), search: I18n.t('Search') };
    function menuHidden(k) { return !MENU_FIXED[k] && (Stremio.getPrefs().hiddenTabs || []).indexOf(k) !== -1; }
    var FEED_KINDS = {
        menu: { section: 'menuorder', title: I18n.t('Home  ›  Menu'), hint: I18n.t('Watching comes first and Settings last: ⇈ ▲ ▼ ⇊ put the rest in your order · OK on a tab shows/hides it.'),
            list: function () {
                return Promise.resolve(V.menuOrder().map(function (k) {
                    var t = (V.HOME_TABS || []).filter(function (x) { return x.key === k; })[0];
                    return { key: k, name: MENU_FIXED[k] || (t ? t.label : k) + (k === 'local' ? I18n.t(' (with a USB drive in)') : k === 'guide' ? I18n.t(' (once a TV guide is read)') : '') };
                }));
            },
            keyOf: function (x) { return x.key; },
            move: function (k, d) { V.moveMenuItem(k, d); markHomeDirty(); return Promise.resolve(); },
            toggle: function (k) {
                if (MENU_FIXED[k]) { U.toast(MENU_FIXED[k] + I18n.t(' is always in the menu')); return; }
                var now = (Stremio.getPrefs().hiddenTabs || []).filter(function (x) { return x !== k; });
                if (!menuHidden(k)) { now.push(k); }
                Stremio.setPref('hiddenTabs', now);
                markHomeDirty();
            },
            hidden: menuHidden },
        home: { section: 'feeds', title: I18n.t('Home  ›  Home feeds'), hint: I18n.t('▲/▼ reorder a feed · OK on the name shows/hides it on Home.'),
            list: function () { return Stremio.listCatalogsOrdered(); }, keyOf: function (c) { return Stremio.catalogKey(c); },
            move: function (k, d) { return Stremio.moveFeed(k, d); }, toggle: function (k) { Stremio.toggleFeed(k); },
            hidden: function (k) { return Stremio.isFeedHidden(k); } },
        search: { section: 'searchfeeds', title: I18n.t('Home  ›  Search results'), hint: I18n.t('▲/▼ reorder the Search rows · OK on the name shows/hides one in Search.'),
            list: function () { return Stremio.searchSourcesOrdered(); }, keyOf: function (src) { return src.key; },
            move: function (k, d) { return Stremio.moveSearchFeed(k, d); }, toggle: function (k) { Stremio.toggleSearchFeed(k); },
            hidden: function (k) { return Stremio.isSearchFeedHidden(k); } },
        ranking: { section: 'ranking', title: I18n.t('Playback  ›  Source ranking'), off: 'off',
            hint: I18n.t('Sources are ordered by these, top first: ▲/▼ moves one, OK turns it off or on. Resolution at the top groups the list by resolution. Your addons are below.'),
            list: function () { return Promise.resolve(Stremio.getRanking().criteria); }, keyOf: function (c) { return c.key; },
            move: function (k, d) { Stremio.moveRanking(k, d); return Promise.resolve(); }, toggle: function (k) { Stremio.toggleRanking(k); },
            hidden: function (k) { return !Stremio.getRanking().criteria.some(function (c) { return c.key === k && c.on; }); },
            before: function (wrap) {   // played before, above the resolution groups; then the two pages
                var played = Stremio.getRanking().played;
                var r = U.el('div', 'addon-item focusable cfg-row feed-extra');
                r.setAttribute('data-fk', 'played'); r.setAttribute('data-ctl', 'extra');
                r.appendChild(U.el('div', 'a-name', I18n.t('Played before first:  ') + (played ? I18n.t('On') : I18n.t('Off'))));
                r.appendChild(U.el('div', 'a-url', (played ? I18n.t('Sources you played for a title (for a series, its release) come before the resolution groups')
                    : I18n.t('Sources you played rank like any other')) + I18n.t('   ·   OK to turn ') + (played ? 'off' : 'on')));
                r.__onselect = function () { Stremio.setPlayedFirst(!played); refeed('ranking', 'played', 'extra'); };
                wrap.appendChild(r);
                wrap.appendChild(rankPageRow(I18n.t('Filters  ›'), filtersSummary(), 'rankfilters'));
                wrap.appendChild(rankPageRow(I18n.t('When you press Play  ›'), onPlaySummary(), 'rankplay'));
                if (_focusChild === 'rankfilters' || _focusChild === 'rankplay') { _feedFocus = { key: _focusChild, ctl: 'extra' }; _focusChild = null; }   // (BACK from one: on its row)
                wrap.appendChild(U.el('div', 'formats-group', I18n.t('Then, in this order')));
            },
            after: function (wrap) {
                var r = U.el('div', 'addon-item focusable feed-extra');
                r.setAttribute('data-fk', 'reset'); r.setAttribute('data-ctl', 'extra');
                r.appendChild(U.el('div', 'a-name', I18n.t('Restore defaults')));
                r.appendChild(U.el('div', 'a-url', I18n.t('Played before first; then resolution, not yet cached last, release type, HDR before SDR, Feed sources order, each addon\'s own order (your addons stay as they are)')));
                r.__onselect = function () { Stremio.resetRanking(); refeed('ranking', 'reset', 'extra'); U.toast(I18n.t('Source ranking restored')); };
                wrap.appendChild(r);
                // The addons that provide sources (Feed sources): their order, and on / off
                wrap.appendChild(U.el('div', 'formats-group', I18n.t('Addons')));
                wrap.appendChild(U.el('div', 'hint', I18n.t('The addons that give sources: ▲/▼ sets their order, OK turns one off (it isn\'t asked).')));
                return Stremio.feedSourcesOrdered().then(function (items) {
                    if (!items.length) { wrap.appendChild(U.el('div', 'hint', I18n.t('None of your addons provide sources: add a stream addon in Settings › Content › Addons.'))); }
                    feedRows(wrap, 'ranking', items, SOURCE_ROWS);
                }, function () { wrap.appendChild(U.el('div', 'hint', I18n.t('Your addons couldn\'t be read just now.'))); });
            } }
    };
    // Source ranking's two pages (rankfilters, rankplay): a row on it that opens one, saying
    // what's set there.
    function rankPageRow(title, summary, section) {
        var r = U.el('div', 'addon-item focusable cfg-row feed-extra');
        r.setAttribute('data-fk', section); r.setAttribute('data-ctl', 'extra');
        r.appendChild(U.el('div', 'a-name', title));
        r.appendChild(U.el('div', 'a-url', summary));
        r.__onselect = function () { _settingsSection = section; renderSettings(); };
        return r;
    }
    function filtersSummary() {
        var P = Stremio.getPrefs(), bits = [I18n.t('Sources the TV can’t play: ') + (P.hideUnplayable ? I18n.t('Hidden') : I18n.t('Shown'))], sizes = [];
        [['movie', I18n.t('Movies')], ['series', I18n.t('Series')]].forEach(function (k) { var L = P.sizeLimits[k[0]]; if (L.min || L.max || L.perHour) { sizes.push(k[1] + ' ' + sizeSummary(L)); } });
        bits.push(sizes.length ? sizes.join(', ') : I18n.t('No size limits'));
        bits.push(P.hideWords.length ? I18n.t('Words: ') + P.hideWords.join(', ') : I18n.t('No words'));
        return bits.join('   ·   ');
    }
    function onPlaySummary() {
        var P = Stremio.getPrefs();
        return I18n.t('Source list: ') + (P.skipSourceList ? 'skipped' : 'shown') + I18n.t('   ·   The next source if one doesn’t start: ') + (P.nextOnFail ? I18n.t('On') : I18n.t('Off'));
    }
    // A page of its own: its title, a hint, its rows; focus back on the one just changed.
    function rankPage(wrap, title, hint, rows) {
        wrap.appendChild(U.el('h2', null, I18n.t('Playback  ›  Source ranking  ›  ') + title));
        wrap.appendChild(U.el('div', 'hint feeds-hint', hint));
        rows.forEach(function (r) { wrap.appendChild(r); });
        var pref = null;
        if (_feedFocus) { pref = rows.filter(function (r) { return r.getAttribute('data-fk') === _feedFocus.key; })[0] || null; _feedFocus = null; }
        Focus.setScope(scr('settings'), pref || rows[0]);
    }
    // Filters: what's left out, or sent to the bottom.
    function settingsRankFilters(wrap) {
        rankPage(wrap, I18n.t('Filters'), I18n.t('Sources these leave out, or send to the bottom of the list: never picked on their own.'),
            [unplayableRow(), sizeRow('movie', I18n.t('Movies’ sizes')), sizeRow('series', I18n.t('Series’ sizes (an episode)')), wordsRow()]);
    }
    // When you press Play: whether the list shows, and a source that doesn't start.
    function settingsRankPlay(wrap) {
        rankPage(wrap, I18n.t('When you press Play'), I18n.t('What ▶ Play does with the ranked list.'), [skipListRow(), nextOnFailRow()]);
    }
    // direct links only: the sources the TV can't play left out of the list
    function unplayableRow() {
        var hideUn = Stremio.getPrefs().hideUnplayable;
        var un = U.el('div', 'addon-item focusable cfg-row feed-extra');
        un.setAttribute('data-fk', 'unplayable'); un.setAttribute('data-ctl', 'extra');
        un.appendChild(U.el('div', 'a-name', I18n.t('Sources the TV can’t play:  ') + (hideUn ? I18n.t('Hidden') : I18n.t('Shown'))));
        un.appendChild(U.el('div', 'a-url', (hideUn ? I18n.t('Left out (torrents, links it can’t open): direct links only; where-to-watch apps stay')
            : I18n.t('Listed, dimmed, at the bottom (torrents, links it can’t open)')) + I18n.t('   ·   OK to ') + (hideUn ? I18n.t('show them') : I18n.t('hide them'))));
        un.__onselect = function () { Stremio.setPref('hideUnplayable', !hideUn); refeed('ranking', 'unplayable', 'extra'); };
        return un;
    }
    // skip the source list: Play plays the top source at once
    function skipListRow() {
        var skipList = Stremio.getPrefs().skipSourceList;
        var sl = U.el('div', 'addon-item focusable cfg-row feed-extra');
        sl.setAttribute('data-fk', 'skiplist'); sl.setAttribute('data-ctl', 'extra');
        sl.appendChild(U.el('div', 'a-name', I18n.t('Skip the source list:  ') + (skipList ? I18n.t('On') : I18n.t('Off'))));
        sl.appendChild(U.el('div', 'a-url', (skipList ? I18n.t('▶ Play, OK on an episode and ▶ Play SxEx play the top source at once (hold OK on an episode › Details for the list)')
            : I18n.t('▶ Play and OK on an episode show the sources to pick from (the remote’s Play key plays the top one)')) + I18n.t('   ·   OK to turn ') + (skipList ? 'off' : 'on')));
        sl.__onselect = function () { Stremio.setPref('skipSourceList', !skipList); refeed('ranking', 'skiplist', 'extra'); };
        return sl;
    }
    // a source that doesn't start: the next one
    function nextOnFailRow() {
        var nextOn = Stremio.getPrefs().nextOnFail;
        var nx = U.el('div', 'addon-item focusable cfg-row feed-extra');
        nx.setAttribute('data-fk', 'nextonfail'); nx.setAttribute('data-ctl', 'extra');
        nx.appendChild(U.el('div', 'a-name', I18n.t('The next source if one doesn’t start:  ') + (nextOn ? I18n.t('On') : I18n.t('Off'))));
        nx.appendChild(U.el('div', 'a-url', (nextOn ? I18n.t('A source the TV refuses, or that hasn’t started after 45 s, gives way to the next best one (up to 3 more)')
            : I18n.t('A source that doesn’t start takes you back to the list')) + I18n.t('   ·   OK to turn ') + (nextOn ? 'off' : 'on')));
        nx.__onselect = function () { Stremio.setPref('nextOnFail', !nextOn); refeed('ranking', 'nextonfail', 'extra'); };
        return nx;
    }
    // your words: sources with one of them at the bottom, for every title
    function wordsRow() {
        var words = Stremio.getPrefs().hideWords;
        var w = U.el('div', 'addon-item focusable cfg-row feed-extra');
        w.setAttribute('data-fk', 'words'); w.setAttribute('data-ctl', 'extra');
        w.appendChild(U.el('div', 'a-name', I18n.t('Hide sources with these words:  ') + (words.length ? words.join(', ') : I18n.t('None'))));
        w.appendChild(U.el('div', 'a-url', I18n.t('A source with one of them in its name, description or file name (a whole word: “CAM” isn’t in “CAMERA”) goes to the bottom, for every title   ·   OK to change')));
        w.__onselect = function () {
            App.openEntry({ title: I18n.t('Hide sources with these words'), value: words.join(', '), placeholder: I18n.t('CAM, HDTS, TELESYNC'),
                hint: I18n.t('Words separated by commas, capitals or not. Sources with one go to the bottom and are never picked on their own. Leave it empty for none.'),
                validate: function () { return null; },
                onConfirm: function (v) { App.back(); Stremio.setHideWords(v); refeed('ranking', 'words', 'extra'); } });
        };
        return w;
    }
    // Size limits (Settings › Source ranking › Filters): smallest, largest and most per hour, for movies or
    // series; OK on the row: which one, then its value.
    var SIZE_CHOICES = {
        min: { label: I18n.t('Smallest'), none: I18n.t('None'), values: [0.1, 0.3, 0.5, 1, 2] },
        max: { label: I18n.t('Largest'), none: I18n.t('None'), values: [2, 4, 8, 15, 20, 30, 50, 80] },
        perHour: { label: I18n.t('Most per hour'), none: I18n.t('None'), values: [1, 1.5, 2, 3, 4, 6, 10], unit: I18n.t(' an hour') }
    };
    function sizeSummary(L) {
        var bits = [];
        if (L.min) { bits.push(I18n.t('at least ') + Stremio.gbText(L.min)); }
        if (L.max) { bits.push(I18n.t('up to ') + Stremio.gbText(L.max)); }
        if (L.perHour) { bits.push(I18n.t('up to ') + Stremio.gbText(L.perHour) + I18n.t(' an hour')); }
        return bits.length ? bits.join(', ') : I18n.t('No limits');
    }
    function sizeRow(kind, title) {
        var L = Stremio.getPrefs().sizeLimits[kind];
        var r = U.el('div', 'addon-item focusable cfg-row feed-extra');
        r.setAttribute('data-fk', 'size-' + kind); r.setAttribute('data-ctl', 'extra');
        r.appendChild(U.el('div', 'a-name', title + ':  ' + sizeSummary(L)));
        r.appendChild(U.el('div', 'a-url', I18n.t('Sources outside them go to the bottom (Outside your size limits) and are never picked on their own; a source without a size isn’t held to them   ·   OK to change')));
        r.__onselect = function () {
            var which = ['min', 'max', 'perHour'].map(function (w) {
                var C = SIZE_CHOICES[w];
                return [w, C.label + ':  ' + (L[w] ? Stremio.gbText(L[w]) + (C.unit || '') : C.none)];
            });
            pickList(title, which, null, function (w) {
                var C = SIZE_CHOICES[w];
                var opts = [['0', C.none]].concat(C.values.map(function (v) { return ['' + v, Stremio.gbText(v) + (C.unit || '')]; }));
                pickList(title + '  ›  ' + C.label, opts, '' + (L[w] || 0), function (v) {
                    Stremio.setSizeLimit(kind, w, +v);
                    refeed('ranking', 'size-' + kind, 'extra');
                });
            });
        };
        return r;
    }
    var _feedFocus = null;   // { key, ctl } of the control that made the last change
    function refeed(kind, key, ctl) {
        _feedFocus = { key: key, ctl: ctl };
        if (kind === 'home') { refreshAddonRows(); }   // the same rows, reordered / shown / hidden: nothing fetched
        renderSettings();
    }

    // The addons list at the bottom of Source ranking (Feed sources). Their keys are
    // prefixed, apart from the criteria's above them.
    var SOURCE_ROWS = { prefix: 'src:', off: 'off', keyOf: function (x) { return x.key; },
        move: function (k, d) { return Stremio.moveFeedSource(k, d); }, toggle: function (k) { Stremio.toggleFeedSource(k); },
        hidden: function (k) { return Stremio.isFeedSourceOff(k); } };
    // ⇈ ▲ ▼ ⇊ for a row of a list you put in order: to the top, one place up, one down, to the
    // bottom. move(dir, ctl) moves it (dir -Infinity / -1 / 1 / Infinity: see U.moveIn); mark(node,
    // ctl) tags each button, so the page can focus the one used once it's drawn again.
    var ORDER_BTNS = [['top', '⇈', -Infinity], ['up', '▲', -1], ['down', '▼', 1], ['bottom', '⇊', Infinity]];
    function orderButtons(move, mark) {
        return ORDER_BTNS.map(function (b) {
            var n = U.el('div', 'feed-btn focusable', b[1]);
            if (mark) { mark(n, b[0]); }
            n.__onselect = function () { move(b[2], b[0]); };
            return n;
        });
    }
    function ctlIndex(ctl) { for (var i = 0; i < ORDER_BTNS.length; i++) { if (ORDER_BTNS[i][0] === ctl) { return i; } } return 1; }
    // ⇈ ▲ ▼ ⇊ / name rows for an ordered list (L: keyOf, hidden, move, toggle, off, prefix).
    // After a change the page is drawn again, focused on the control used (refeed).
    function feedRows(wrap, kind, items, L) {
        items.forEach(function (item) {
            var key = L.keyOf(item), fk = (L.prefix || '') + key;
            var hidden = L.hidden(key);
            var frow = U.el('div', 'feed-row' + (hidden ? ' feed-off' : ''));

            var btns = orderButtons(function (dir, ctl) { L.move(key, dir).then(function () { refeed(kind, fk, ctl); }); },
                function (n, ctl) { n.setAttribute('data-fk', fk); n.setAttribute('data-ctl', ctl); });

            var name = U.el('div', 'feed-name focusable', item.name + (hidden ? '   (' + (L.off || 'hidden') + ')' : ''));
            name.setAttribute('data-fk', fk); name.setAttribute('data-ctl', 'name');
            name.__onselect = function () { L.toggle(key); refeed(kind, fk, 'name'); };

            btns.forEach(function (b) { frow.appendChild(b); });
            frow.appendChild(name);
            wrap.appendChild(frow);
        });
    }

    function settingsFeeds(wrap, kind) {
        var K = FEED_KINDS[kind];
        wrap.appendChild(U.el('h2', null, K.title));
        wrap.appendChild(U.el('div', 'hint feeds-hint', K.hint));
        if (K.before) { K.before(wrap); }
        K.list().then(function (items) {
            if (!items.length) { wrap.appendChild(U.el('div', 'hint', kind === 'search' ? I18n.t('None of your addons can search.') : I18n.t('No feeds yet: add catalog addons in Settings › Content › Addons.'))); }
            feedRows(wrap, kind, items, K);
            return K.after ? K.after(wrap) : null;
        }).then(function () {
            // restore focus to the control that triggered the last change
            var pref = null;
            if (_feedFocus) {
                var nodes = wrap.querySelectorAll('.feed-btn, .feed-name, .feed-extra');
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].getAttribute('data-fk') === _feedFocus.key && nodes[i].getAttribute('data-ctl') === _feedFocus.ctl) { pref = nodes[i]; break; }
                }
                _feedFocus = null;
            }
            Focus.setScope(scr('settings'), pref || wrap.querySelector('.feed-name') || undefined);
        });
    }

    // ----- published for the other parts (and js/views.js) -----
    V.applyAppearance = applyAppearance;
    V.backInSettings = backInSettings;
    V.renderEntry = renderEntry;
    V.renderSettings = renderSettings;
    V.settingsRoot = settingsRoot;
})(ViewParts);

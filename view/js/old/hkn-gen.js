/*
 * @package   hkn_calculator
 * @author    Pashted http://www.slashfocus.ru
 * @copyright Copyright (C) slashfocus.ru
 * @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
 */
(function ($) {
    $.fn.LimitInput = function (type) {
        if (type == 'number') {
            var prev;

            return this.on({
                /*focus:   function () {
                 $(this).select();
                 },*/
                input:   function () {
                    var obj = $(this),
                        val = parseInt(obj.val().replace(/\D/g, ''), 10), // удаляю из строки всё, что не является цифрой
                        min = obj.data('min'),
                        max = obj.data('max');

                    if (val < min || !val) { // если значение ниже минимального
                        obj.val(min).select();

                    } else if (val > max) { // если выше максимального
                        obj.val(prev === undefined ? max : prev);

                    } else {
                        obj.val(val);
                    }
                },
                keydown: function (e) {
                    var obj = $(this),
                        val = parseInt(obj.val(), 10);

                    prev = val; // сохраняю предыдущее значение

                    if (e.which != 38 && e.which != 40)
                        return;

                    e.preventDefault();

                    var min = obj.data('min'),
                        max = obj.data('max'),
                        mult = e.shiftKey ? 10 : 1;

                    if (e.which == 38) { // up
                        val = val + mult;
                        if (val > max)
                            val = max;

                    } else if (e.which == 40) { // down
                        val = val - mult;
                        if (val < min)
                            val = min;
                    }
                    obj.val(val).trigger('input').select();
                }
            });
        }
    };

    var default_params, // значения инпутов, загруженные с сервера
        user_params = JSON.parse(localStorage.getItem('_hkn_gen')), // значения, сохранённые в хранилище
        input = {},
        acc = {},
        animate = 0, // анимация отключена до тех пор, пока не будут сформированы параметры
        tab_headers,
        active_tab = 0,
        progress = 0,
        article, form, tabs, reset, next, prev, locale, lang, /*modal_closed,*/
        script_params = {
            large_text:     false,
            highlight_code: true,
            show_comments:  true // window.location.host === 'www.slashfocus.ru'
        },
        input_str = [
            'scheme',
            'path', 'win-name', 'win-prefix',
            'main-keys', 'except-main-keys', 'movement-keys', 'launch-key', 'exit-key', 'rename-windows-key', 'pause-hotkeys-key',
            'mouse-mod-key', 'mouse-keys',
            'type-accounts', 'acc', 'type-accounts-key',
            'hide-taskbar', 'win-track', 'add-switch-panel', 'add-control-panel',
            'win-count', 'win-track-delay', 'bg-focus-delay', 'affinity',
            'switch-panel-size', 'control-panel-size',
            'switch-panel-position', 'control-panel-position',
            'switch-panel-active-color', 'switch-panel-inactive-color',
            'control-panel-hotkeys-color', 'control-panel-keystrokes-color', 'control-panel-launch-color', 'control-panel-exit-color',
            'sendmode'
        ];

    var method = {
        /*animate_text: function (opacity) {
         var spd = modal_closed ? 0 : opacity ? 800 : 200;

         $('#key-modal').find('.uk-form-large').stop(true, false).css({
         transition: 'color cubic-bezier(.02, .01, .47, 1) ' + spd + 'ms',
         color:      opacity ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.1)'
         });
         setTimeout(function () {
         method.animate_text(!opacity);
         }, opacity ? spd + 200 : spd);
         },*/
        get_key: function (event) {
            var key = event.originalEvent.code ? event.originalEvent.code : event.which,
                key_codes = {
                    Escape:         'Esc',
                    Equal:          'Plus',
                    ControlLeft:    'Ctrl', /*L*/
                    ControlRight:   'Ctrl', /*R*/
                    AltLeft:        'Alt', /*L*/
                    AltRight:       'Alt', /*R*/
                    ShiftLeft:      'Shift', /*L*/
                    ShiftRight:     'Shift', /*R*/
                    MetaLeft:       'LWin', /*L*/
                    MetaRight:      'RWin', /*R*/
                    PageUp:         'PgUp',
                    PageDown:       'PgDn',
                    NumpadDivide:   'Divide',
                    NumpadMultiply: 'Multiply',
                    NumpadSubtract: 'NumpadMinus',
                    NumpadAdd:      'NumpadPlus',
                    NumpadDecimal:  event.key == ',' ? 'Decimal' : 'NumpadDelete',
                    Numpad0:        event.key == '0' ? key : 'NumpadInsert',
                    Numpad1:        event.key == '1' ? key : 'NumpadEnd',
                    Numpad2:        event.key == '2' ? key : 'NumpadDown',
                    Numpad3:        event.key == '3' ? key : 'NumpadPgDn',
                    Numpad4:        event.key == '4' ? key : 'NumpadLeft',
                    Numpad5:        event.key == '5' ? key : 'Clear',
                    Numpad6:        event.key == '6' ? key : 'NumpadRight',
                    Numpad7:        event.key == '7' ? key : 'NumpadHome',
                    Numpad8:        event.key == '8' ? key : 'NumpadUp',
                    Numpad9:        event.key == '9' ? key : 'NumpadPgUp',
                    Semicolon:      'Oem1',
                    Slash:          'Oem2',
                    Backquote:      'Oem3',
                    BracketLeft:    'Oem4',
                    Backslash:      'Oem5',
                    BracketRight:   'Oem6',
                    Quote:          'Oem7',
                    IntlBackslash:  'Oem102',
                    ContextMenu:    'Apps',
                    166:            'BrowserBack',
                    167:            'BrowserForward',
                    168:            'BrowserRefresh',
                    169:            'BrowserStop',
                    170:            'BrowserSearch',
                    171:            'BrowserFavorites',
                    172:            'BrowserHome',
                    173:            'Mute',
                    174:            'VolumeDown',
                    175:            'VolumeUp',
                    176:            'MediaNextTrack',
                    177:            'MediaPrevTrack',
                    178:            'MediaStop',
                    179:            'MediaPlayPause',
                    180:            'Mail',
                    181:            'MediaSelect',
                    182:            'LaunchApp1',
                    183:            'LaunchApp2',
                    1:              'LButton',
                    2:              'MButton',
                    3:              'RButton'
                };

            return key_codes.hasOwnProperty(key) ? key_codes[key] : key.replace(/(Digit|Key|Arrow)/, '');
        },

        open_key_modal: function (data) {
            console.log(data);
            var key_modal = $('<div id="key-modal" class="uk-modal"></div>'),
                edit_mode = data.title == lang.edit_key;

            key_modal.html('<div class="uk-modal-dialog">' +
                '<a class="uk-close uk-modal-close"></a>' +
                '<div class="uk-modal-header uk-text-center"><h3>' + data.title + '</h3></div>' +
                '<form class="uk-form">' +
                '<p><input type="text" class="uk-width-1-1 uk-form-large uk-text-center" placeholder="' + lang.enter_key + '"/></p>' +

                (data.many ? '<p class="uk-text-muted">' + lang.allow_many_keys + '</p>' : '') +

                /*'<div class="uk-grid uk-text-center">' +

                 '<div class="uk-width-1-2 modifiers"><h5>Обычные модификаторы:</h5>' +
                 '<p>' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="c">Ctrl</span> ' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="lc">LCtrl</span> ' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="rc">RCtrl</span>' +
                 '</p><p>' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="a">Alt</span> ' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="la">LAlt</span> ' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="ra">RAlt</span>' +
                 '</p><p>' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="s">Shift</span> ' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="ls">LShift</span> ' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="rs">RShift</span>' +
                 '</p></div>' +

                 '<div class="uk-width-1-2 toggle-modifiers"><h5>Переключаемые модификаторы:</h5>' +
                 '<p data-uk-button-radio>' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="n1">NumLockOn</span> ' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="n0">NumLockOff</span>' +
                 '</p><p data-uk-button-radio>' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="s1">ScrollLockOn</span> ' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="s0">ScrollLockOff</span>' +
                 '</p><p data-uk-button-radio>' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="c1">CapsLockOn</span> ' +
                 '<span class="uk-button uk-button-mini" data-uk-button data-key="c0">CapsLockOff</span>' +
                 '</p></div>' +

                 '</div><hr>' +*/
                /*'<p><label for="mod_diff_1">' + lang.mod_diff + '</label> ' +
                 '<span class="radio uk-button-group">' +
                 '<input type="radio" id="mod_diff_0" name="mod_diff" value="0" checked>' +
                 '<label for="mod_diff_0">Нет</label>' +
                 '<input type="radio" id="mod_diff_1" name="mod_diff" value="1">' +
                 '<label for="mod_diff_1">Да</label>' +
                 '</span></p>' +*/
                '<p><span class="uk-float-right">' +
                (edit_mode && data.many ? '<button type="button" class="uk-button uk-button-small">' + lang.delete + '</button> ' : '') +
                '<button type="button" class="uk-button uk-button-small">' + lang.save + '</button> ' +
                '</span>' +

                '<label for="result" title="' + lang.edit_key_desc + '" data-uk-tooltip><abbr>' + lang.result + ':</abbr></label>&nbsp;&nbsp;' +
                '<input id="result" type="text" class="uk-width-' + (edit_mode && data.many ? '1-2' : '2-3') + ' uk-text-primary" ' +
                'value="' + (edit_mode ? data.key.text() : '') + '"/></p>' +
                '</form>' +
                '</div>').on({
                'show.uk.modal': function () {

                    //modal_closed = 0;
                    //method.animate_text(0);

                    function mod_clear(event) {
                        // TODO: сделать более надежный способ через созданный объект, а не эвент. это сделает возможным добавлять разные модификаторы и удалит баг с левым и правым модификатором

                        if (!event.ctrlKey) {
                            press.mod.Ctrl = '';
                            press.mod.LCtrl = '';
                            press.mod.RCtrl = '';
                        }

                        if (!event.altKey) {
                            press.mod.Alt = '';
                            press.mod.LAlt = '';
                            press.mod.RAlt = '';
                        }

                        if (!event.shiftKey) {
                            press.mod.Shift = '';
                            press.mod.LShift = '';
                            press.mod.RShift = '';
                        }
                    }

                    function set_btn_result(nomod) {
                        var result = '';

                        // добавление модификаторов к строке новой комбинации
                        $.each(press.mod, function (i, v) {
                            if (v)
                                result += i + ' ';
                        });
                        key_modal.find('#result').val(result + press.key);

                        if (nomod)
                            delete press.key;
                    }


                    var press = {
                        mod:     {},
                        key:     '',
                        lastkey: ''
                    };

                    key_modal.find('.uk-form-large').on({
                        contextmenu: function () {
                            return false;
                        },
                        keydown:     function (e) {
                            e.preventDefault();

                            var btn = method.get_key(e); // получаем готовое имя только что нажатой кнопки

                            // если кнопка удерживается или это принтскрин, второй раз функция не выполоняется
                            if (press.lastkey == btn)
                                return false;

                            // сохраняю предыдущее нажатие
                            press.lastkey = btn;

                            var mod = btn.search(/(Ctrl)|(Alt)|(Shift)/gi) >= 0;

                            if (mod) {
                                // сохраняю точное имя нажимаемой кнопки (для левых и правых модификаторов)
                                press.mod[btn] = true;
                            } else {
                                press.key = btn;

                                mod_clear(e); // удаляем те модификаторы, которые в итоге были отпущены
                            }

                            /*if (!modal_closed) {
                             modal_closed = 1;
                             method.animate_text(1);
                             }*/
                        },
                        keyup:       function (e) {
                            e.preventDefault();
                            press.lastkey = '';

                            if (e.which == 44) // prtscn
                                press.key = method.get_key(e);

                            if (!press.key)
                                return false;

                            var btn = method.get_key(e),
                                mod = btn.search(/(Ctrl)|(Alt)|(Shift)/) >= 0;

                            set_btn_result(!mod);
                        },
                        mousedown:   function (e) {
                            e.preventDefault();

                            var obj = $(this);
                            if (!obj.is(':focus')) {
                                obj.focus();
                                return false;
                            }

                            press.key = method.get_key(e);

                            mod_clear(e); // удаляем те модификаторы, которые в итоге были отпущены

                            set_btn_result(true);
                        },
                        wheel:       function (e) {
                            press.key = e.originalEvent.wheelDelta > 0 ? 'WheelForward' : 'WheelBackward';

                            mod_clear(e); // удаляем те модификаторы, которые в итоге были отпущены

                            set_btn_result(true);
                        }
                    }).focus();
                },
                'hide.uk.modal': function () {
                    //modal_closed = 1;
                    key_modal.remove();
                }
            }).appendTo('body');

            var result = key_modal.find('#result');

            key_modal.find('.uk-button').on({
                click: function () {
                    var obj = $(this);

                    if (!obj.next().length) {
                        // если это кнопка сохранения

                        // для диапазонов клавиш разрешены дефисы
                        var text = result.val().replace(data.many ? /[^a-z0-9\s-]/gi : /[^a-z0-9\s]/gi, '').trim();

                        result.val(text);

                        if (!text) {
                            UIkit.modal('#key-modal').hide();
                            //key_modal.find('.uk-form-large').focus();
                            return;
                        }

                        if (edit_mode) {
                            data.key.text(text);
                        } else {
                            data.key.before('<li class="uk-badge' + (data.key.hasClass('add-except') ? ' uk-badge-success' : '') + '">' + text + '</li>');
                        }

                        // TODO: сделать проверку наличия добавляемой комбинации во избежание конфликтов. искать в user params. разрешить добавление, делать на выходе except, но выделять красным добавленную кнопку + title

                    } else {
                        // кнопка удаления
                        var param = user_params[data.key.parent().attr('id')];
                        $.each(param, function (i, text) {
                            if (text == data.key.text()) {
                                param[i] = '';
                            }
                        });

                        data.key.remove();
                    }
                    UIkit.modal('#key-modal').hide();
                }
            });

            UIkit.modal('#key-modal', {
                modal:  false,
                center: true
            }).show();
        },

        init: function () {

            article = $('#generator');
            form = article.find('form');

            locale = article.find('#locale');
            lang = JSON.parse(article.find('#lang').html());

            if (!user_params)
                user_params = {};

            // через php нельзя увидеть local_storage, поэтому сохраненная ранее схема подгружается аяксом
            if (user_params.hasOwnProperty('scheme') && !progress) {
                method.submit_form(true);
                return;
            }

            default_params = {};

            tabs = article.children('ul');
            tab_headers = [];

            reset = article.find('#reset');
            next = article.find('#next-tab');
            prev = article.find('#prev-tab');

            var data_linked = form.find('[data-linked]'),
                linked = [];

            $.each(input_str, function (i, name) {
                input[name] = form.find('.' + name); // добавляю инпут в общий объект

                // прилинкованные элементы для их скрытия/показа в определенных положениях select'a или radio
                var get_linked_input = input[name].is(data_linked) ? input[name] : input[name].find('[data-linked]');

                if (get_linked_input.length)
                    linked.push({
                        handler_target: input[name],
                        inputs:         get_linked_input,
                        need_show:      {},
                        need_hide:      {}
                    });
            });

            $.each(linked, function (i, elem) { // разбор множественных полей
                var unique_objects = {}; // полный список уникальных имен объектов, которые участвуют в прилинковке текущего множ. поля генератора

                elem.inputs.each(function () { // разбираю пачку radio/option текущего поля
                    var split = $(this).data('linked').split(' ');
                    $.each(split, function (i, str) { // перебираю классы, перечисленные в каждом data-linked
                        if (str && !unique_objects[str]) // если строка не пустая и элемента еще нет в списке уникальных
                            unique_objects[str] = true;
                    });
                });

                elem.inputs.each(function () { // еще раз разбираю пачку radio/option текущего поля для сравнения со списком уникальных классов
                    var obj = $(this), val = obj.val(),
                        data = obj.data('linked');

                    elem.need_show[val] = data ? data.split(' ') : []; // array - массив классов
                    elem.need_hide[val] = JSON.parse(JSON.stringify(unique_objects)); // создание независимой копии объекта

                    $.each(elem.need_show[val], function (i, str) { // перебираю все возможные классы из аттрибутов...
                        if (str)  // если строка не пустая, ее надо исключить из списка скрываемых
                            delete elem.need_hide[val][str];
                    });

                    elem.need_hide[val] = Object.keys(elem.need_hide[val]); // конвертирую объект в массив
                });

                elem.handler_target.on('change', function () {
                    var obj = $(this), val = obj.val();
                    //console.clear();
                    console.log('___ ___ ___');
                    console.log('_Show', elem.need_show[val]);
                    $.each(elem.need_show[val], function (i, name) {
                        input[name].parentsUntil('fieldset', '.uk-form-row').slideDown(animate);
                    });
                    console.log('_Hide', elem.need_hide[val]);
                    $.each(elem.need_hide[val], function (i, name) {
                        input[name].parentsUntil('fieldset', '.uk-form-row').slideUp(animate);
                    });

                });
                //console.log(elem);
            });

            /* // конструктор
             form.find('#testbtn').on({
             click: function () {
             console.log(111);
             }
             });*/

            console.log(active_tab);
            console.log(tabs);
            UIkit.switcher(tabs, {
                connect: '#gen',
                swiping: false,
                active:  active_tab
            });

            // сохранение ширины вкладок для прогресс-бара
            tabs.children('li').each(function () {
                tab_headers.push(parseFloat($(this).attr('style').match(/(\d+.*)\D/)[1]));
            });

            tabs.on({
                'show.uk.switcher': method.check_tabs
            });

            next.click(function () {
                var next_menu_item = tabs.children('.uk-active').next();

                if (!next_menu_item.next().length)
                    next.attr('disabled', 'true');

                prev.removeAttr('disabled');
                UIkit.switcher(tabs).show(next_menu_item);
            });

            prev.click(function () {
                var prev_menu_item = tabs.children('.uk-active').prev();

                if (!prev_menu_item.prev().length)
                    prev.attr('disabled', 'true');

                next.removeAttr('disabled');
                UIkit.switcher(tabs).show(prev_menu_item);
            });

            locale.chosen({
                disable_search: true,
                width:          '120px'
            }).on({
                change: function () {
                    locale.nextAll().filter('label').removeClass('ru en').addClass(locale.val());
                    method.submit_form(false, false, !tabs.children('.uk-active').next().length);
                }
            });

            input['win-count'].LimitInput('number').on({input: method.add_accounts});

            input['win-track-delay'].LimitInput('number');
            input['bg-focus-delay'].LimitInput('number');
            input['switch-panel-size'].LimitInput('number');
            input['control-panel-size'].LimitInput('number');
            input.affinity.LimitInput('number');


            // Keys
            form
                .on({
                    click: function () {
                        var obj = $(this);
                        method.open_key_modal({
                            title: lang.add_key,
                            key:   obj.parent(),
                            many:  obj.parentsUntil('div', 'ul').attr('class').search(/keys$/) >= 0 ? 1 : 0
                        });
                    }
                }, '.add a, .add-except a')

                .on({
                    mouseenter: function () {
                        $(this).addClass('uk-badge-warning');
                    },
                    mouseout:   function () {
                        $(this).removeClass('uk-badge-warning');
                    },
                    click:      function () {
                        method.open_key_modal({
                            title: lang.edit_key,
                            key:   $(this),
                            many:  0
                        });
                    }
                }, '[class$=key] .uk-badge')

                .on({
                    mouseenter: function () {
                        $(this).addClass('uk-badge-warning');
                    },
                    mouseout:   function () {
                        $(this).removeClass('uk-badge-warning');
                    },
                    click:      function () {
                        method.open_key_modal({
                            title: lang.edit_key,
                            key:   $(this),
                            many:  1
                        });
                    }
                }, '[class$=keys] .uk-badge, [class$=keys] ~ ul .uk-badge')

                .on({
                    blur:    function () {
                        var item = $(this),
                            val = item.val(),
                            name = item.attr('name');

                        if (val && val != acc[name]) { // если поле не пустое и не равно сохранённому ранее

                            acc[name] = val;
                            console.log('...add acc - ' + name);

                        } else if (!val && acc[name]) { // если поле стало пустое и было сохранено ранее

                            delete acc[name];
                            console.log('...delete acc - ' + name);
                        }
                    },
                    keydown: function (e) {
                        if (e.which == 13) {
                            $(this).parent().next().children('input').focus().select();
                        }
                    }

                }, '.acc')

                .on({
                    click: function () {
                        var pre = form.find('pre');

                        if ($(this).hasClass('uk-active')) {
                            pre.addClass('larger');
                            script_params.large_text = true;
                        } else {
                            pre.removeClass('larger');
                            script_params.large_text = false;
                        }
                    }
                }, '.large-text')

                .on({
                    click: function () {
                        var pre = form.find('pre');

                        if ($(this).hasClass('uk-active')) {
                            pre.addClass('colored');
                            script_params.highlight_code = true;
                        } else {
                            pre.removeClass('colored');
                            script_params.highlight_code = false;
                        }
                    }
                }, '.highl-code')

                .on({
                    click: function () {
                        var pre = form.find('pre');

                        if ($(this).hasClass('uk-active')) {
                            pre.removeClass('no-comments');
                            script_params.show_comments = true;
                        } else {
                            pre.addClass('no-comments');
                            script_params.show_comments = false;
                        }

                        form.find('.copy-script').text(lang.copy).removeAttr('disabled');
                    }
                }, '.show-com');

            if (script_params.large_text)
                form.find('.large-text').click();

            if (!script_params.highlight_code)
                form.find('.highl-code').click();

            if (!script_params.show_comments)
                form.find('.show-com').click();

            /*input.launch_key.find('.uk-close').click(function () {
             var elem = $(this),
             parent = elem.parent();

             parent.css({
             width:         parent.width(),
             'white-space': 'nowrap',
             'overflow':    'hidden'
             });
             elem.css('position', 'absolute');
             parent.animate({
             width:           0,
             'margin-right':  0,
             'padding-right': 0,
             'padding-left':  0,
             opacity:         0
             }, {
             duration: 1500,
             complete: function () {
             elem.remove();
             }
             });
             }
             );*/

            /*input.type_accounts.on({
             change: function () {
             var inp = $(this), val = parseInt(inp.val(), 10);
             method.open_spoiler(inp, val);
             }
             });*/

            input.sendmode.on({
                change: function () {
                    var sel = $(this)/*, val = sel.val()*/;
                    method.select_suffix(sel/*, {condition: (val == 'sendwinsf' || val == 'sendwinmf')}*/);
                }
            });

            input.scheme.on({
                change: function () {
                    if (animate) {
                        method.submit_form();
                    } else {
                        method.select_suffix($(this));
                    }
                }
            });

            /*input.win_track.on({
             change: function () {
             var inp = $(this);
             method.open_spoiler(inp, parseInt(inp.val(), 10));
             }
             });*/


            reset.click(function () {
                UIkit.modal.confirm('<h4 class="uk-alert uk-alert-warning uk-alert-large">' + lang.delete_confirm + '</h4>', method.clear_params, method.save_params, {
                    labels: {'Ok': lang.delete, 'Cancel': lang.cancel},
                    center: true
                });
            });


            $('.pick-color').ColorPicker();

            //if (form.length)
            method.build_params();
            form.find('select').chosen({'disable_search': true});

            setTimeout(function () {
                article.removeClass('no-ani');


            }, 1);
        },

        add_accounts: function () {
            if (!input['type-accounts'].length)
                return;

            var prefix = input.acc.eq(0).attr('placeholder').replace(/\d+/, '');

            for (var i = 1, result = ''; i <= input['win-count'].val(); i++) {
                var text = (acc['acc_' + i]) ? acc['acc_' + i] : '';

                result += '<p class="uk-form-controls-condensed">' +
                    '<input type="text" name="acc_' + i + '" class="acc" placeholder="' + prefix + i + '" value="' + text + '"></p>';
            }

            input.acc.parentsUntil('fieldset', '.uk-form-row').find('.uk-form-controls').html(result);
            // здесь ссылка на объект .acc становится устаревшей, поэтому пересоздаем ее
            input.acc = form.find('.acc');
        },

        parse_input: function (key) {
            var elem = input[key],
                arr = [];

            if (!elem.length) {
                // если элемента нет на странице, его значение делаем пустым
                return '';

            } else if (key.search(/(key|keys)$/i) >= 0) {
                // если элемент содержит горячие клавиши, перебираю найденные клавиши в этом списке

                elem.children('.uk-badge').each(function (i, item) {
                    arr.push($(item).text());
                });
                return arr;

            } else if (elem.length > 1) {
                // если найден множественный элемент...
                if (elem[0].type == 'radio') {
                    // ...и если это радио кнопка, то сохраняю ссылку на чекнутый инпут
                    elem = form.find('.' + key + ':checked');

                } else {
                    // все остальные множественные элементы

                    elem.each(function (i, item) {
                        var value = $(item).val();
                        arr.push($.isNumeric(value) ? parseInt(value, 10) : value);
                    });
                    return arr;
                }
            }

            var value = elem.val();
            return key !== 'win_prefix' && $.isNumeric(value) ? parseInt(value, 10) : value;
        },

        build_params: function () {
            animate = 0;
            default_params = {};

            $.each(input, function (key, elem) {
                if (!elem.length || key == 'acc')
                    return;

                if (key == 'scheme') {
                    // стандартная схема прописывается жестко, потому что после аякс-запроса с сервака приходит селект с другим значением
                    default_params[key] = form.data('scheme');
                } else {
                    // записываю то, что изначально пришло с сервера
                    default_params[key] = method.parse_input(key);
                }

                if (user_params.hasOwnProperty(key)) {
                    // если в хранилище есть эта запись


                    if (key.search(/(key|keys)$/i) >= 0) {
                        // и она является списком клавиш
                        var row = '',
                            badge = key.search(/^except.*keys$/) >= 0 ? ' uk-badge-success' : '';

                        console.log('...найдены кнопки ' + key + ' - заполняю список!');


                        $.each(user_params[key], function (i, text) {
                            row += '<li class="uk-badge' + badge + '">' + text + '</li>';
                        });

                        elem.children('.uk-badge').remove();
                        elem.prepend(row);

                    } else if (elem.length > 1) {
                        // если запись связана с несколькими элементами

                        if (elem[0].type == 'radio') {
                            // и если эти элементы являются радио-кнопкой
                            elem.eq(user_params[key]).next().click();
                            console.log('...найдено radio - выполняю клик!');

                        } else {
                            // если эти элементы представляют собой множественный объект

                            elem.each(function (index) {
                                elem.eq(index).val(user_params[key][index]);
                                console.log('...найден массив значений - ввожу в инпут ' + index);

                                if (key.substr(-5) == 'color') {
                                    var attr = index ? 'color' : 'background-color';
                                    elem.eq(index).nextAll().filter('span').css(attr, user_params[key][index]);
                                }
                            });
                        }

                    } else {
                        // единичный экземпляр

                        if (elem[0].type == 'select-one') {
                            elem.val(user_params[key]);
                            elem.trigger('change');

                            console.log('...найден select - вызываю change!');
                        } else {
                            elem.val(user_params[key]);
                            console.log('...найден параметр ' + key + ' = ' + user_params[key] + '. записываю его в инпут');
                        }
                    }
                }
            });

            user_params.__proto__ = default_params;

            method.add_accounts();
            animate = 200;

            console.log('default_params', default_params);
            console.log('user_params   ', user_params);
            console.log('[build params completed]');
            console.log(' ');
        },

        save_params: function () {
            //console.clear();
            //return;

            var before = JSON.stringify(user_params);
            console.log('[BEFORE] >_', before);
            //key.search(/(_key|_keys)$/i) >= 0 ? method.parse_input('keys')[key] :

            $.each(default_params, function (key, item) {

                var current_val = method.parse_input(key),
                    current_val_str = JSON.stringify(current_val);

                if (current_val_str != JSON.stringify(item)) {
                    // если текущее значение не равно дефолтному

                    if (current_val_str != JSON.stringify(user_params[key])) {
                        // и не равно сохранённому ранее

                        user_params[key] = current_val;
                        console.log('...add param - ' + key);
                    }

                } else if (user_params.hasOwnProperty(key)) {
                    // если значение равно дефолтному и присутствует в хранилище

                    // удаляем его, чтобы дефолтные настройки не перезаписывались в случае их изменения в исходниках
                    delete user_params[key];
                    console.log('...delete param - ' + key);
                }
            });

            var after = JSON.stringify(user_params);
            console.log('[AFTER]  >_', after);
            console.log(' ');

            if (before != after) {
                localStorage.setItem('_hkn_gen', after);

                console.log('...user_params СОХРАНЕНЫ!');

            } else {
                console.log('...user_params не изменились. сохранение отменено');
            }

            console.log('[save_params]');
            console.log(' ');
        },

        clear_params: function () {
            var callback = function () {
                UIkit.switcher(tabs).show(tabs.children('li:first-child'));
            };

            script_params = {
                large_text:     false,
                highlight_code: true,
                show_comments:  true
            };
            if (Object.keys(user_params).length) { // если пользовательские настройки не пустые
                localStorage.removeItem('_hkn_gen');

                user_params = {};
                user_params.__proto__ = default_params;
                /*$.each(input, function (key, item) {

                 if (item.length > 1) { // если инпут связан с несколькими элементами

                 if (item[0].type == 'radio') { // и если эти элементы являются радио-кнопкой

                 item = (default_params[key] == '1') ? item.eq(1) : item.eq(0);
                 item.next().click();

                 console.log('...default radio [' + key + '] = ' + default_params[key] + '. Выполняю клик!');
                 }
                 } else {
                 item.val(default_params[key]);
                 console.log('...default ' + item[0].type + ' [' + key + '] = ' + default_params[key] + '. Записываю его в инпут');
                 }
                 });

                 method.add_accounts();*/

                method.submit_form(true, callback);
                console.log('...user_params УДАЛЕНЫ!');
                console.log(' ');
            } else {
                callback();
            }
        },

        /*open_spoiler: function (obj, open) {
         var row = obj.parentsUntil('fieldset', '.uk-form-row');

         if (open)
         row.next().slideDown(animate);
         else
         row.next().slideUp(animate);
         },*/

        select_suffix: function (obj/*, callback*/) {
            var suffix = obj.nextAll('.uk-form-help-inline'),
                span = suffix.children('span'),
                index = obj[0].selectedIndex;

            if (!animate) {
                span.removeClass('active').eq(index).addClass('active');
                //if (callback) method.open_spoiler(obj, callback.condition)

            } else {

                suffix.css('height', span.filter('.active').height() + 'px');

                span.filter('.active').fadeOut(animate, function () {
                    $(this).removeClass('active');
                    span.css('display', 'none').eq(index).addClass('active').fadeIn(animate);

                    suffix.clearQueue().animate({
                        height: span.eq(index).height() + 'px'
                    }, animate);

                    //if (callback) method.open_spoiler(obj, callback.condition)
                });
            }
        },

        check_tabs: function () {
            var production = window.location.hostname === 'www.slashfocus.ru';

            if (!progress && production)
                method.save_params();

            var count = tabs.children('li').length,
                act = tabs.children('.uk-active'),
                prevAll = act.prevAll(),
                result,
                offset = tabs.offset().top;


            active_tab = prevAll.length;
            console.log(active_tab);
            prevAll.addClass('active');
            act.removeClass('active').nextAll().removeClass('active');

            if (!prevAll.length) {
                // первая вкладка
                prev.attr('disabled', 'true');
                next.removeAttr('disabled');
                result = 0;

            } else if (prevAll.length == count - 1) {
                // последняя вкладка
                prev.removeAttr('disabled');
                next.attr('disabled', 'true');
                result = 100;
                method.submit_form(production, false, true);
                form.find('.copy-script').text(lang.copy).removeAttr('disabled');

            } else {
                prev.removeAttr('disabled').fadeIn(100);
                next.removeAttr('disabled');
                result = tab_headers[prevAll.length] / 4;
                tabs.find('.active').each(function (index) {
                    result += tab_headers[index];
                });
            }

            /*var per = 0;
             $.each(tab_headers, function (i, percent) {
             per += percent;
             });
             console.log(per);*/

            // скролл к вкладкам, если они находятся за пределами экрана
            if ($(window).scrollTop() > offset) {
                $('html, body').animate({
                    scrollTop: offset - 15
                }, 200);
            }

            tabs.next().find('.uk-progress-bar').css('width', result + '%');
        },

        submit_form: function (no_save, callback, script) {
            if (progress)
                return;
            console.log('[sumbit form started]');

            if (!no_save)
                method.save_params();

            //var data = JSON.parse(JSON.stringify(user_params)); // чистка от прото
            var data = {
                format:    'raw',
                locale:    locale.val(),
                scheme:    user_params.scheme,
                win_count: user_params['win-count']
            };

            if (script)
                data.script = true;

            // TODO: хавать ROOT из script json
            $.ajax({
                // url:        window.location.host === 'slashfocus.localhost' || window.location.host === 'www.slashfocus.ru' ? '/gen/index.php' : '/',
                method:     'post',
                data:       data,
                beforeSend: function () {
                    progress = 1;
                    article.addClass('loading');
                },
                success:    function (resp) {
                    var response = $(resp);
                    console.log(response);

                    if (script) {
                        // lang = locale.val() === 'en' ? en_locale : ru_locale;
                        form.find('fieldset:last-child pre').html(method[user_params.scheme + '_script'](response));
                    } else {
                        article.addClass('no-ani');
                        article.html(response.html());
                        method.init();
                        method.check_tabs();
                        form.find('select').chosen({'disable_search': true});
                        // form.find('.mod a, a.mod').append('<i title="Откроется во всплывающем окне" class="uk-icon-external-link-square"></i>');
                    }

                },
                complete:   function () {
                    setTimeout(function () {
                        // переход на первую вкладку
                        if (callback)
                            callback();

                        article.removeClass('loading');
                        progress = 0;
                        console.log('[sumbit form finished]');
                    }, 1);
                }
            });
        },

        is_mod: function (key) {
            return key === 'Ctrl' || key === 'Alt' || key === 'Shift';
        },

        is_toggle_mod: function (key) {
            return key === 'ScrollLock' || key === 'CapsLock' || key === 'NumLock';
        },

        // определение подходящей группы для кнопки
        key_remap: function (elem, pause_mod) {
            var ctrl = elem.match(/Ctrl/i) !== null,
                alt = elem.match(/Alt/i) !== null,
                shift = elem.match(/Shift/i) !== null,
                result = pause_mod;

            if (ctrl && alt && shift) result += 'Ctrl Alt Shift';
            else if (ctrl && alt) result += 'Ctrl Alt';
            else if (ctrl && shift) result += 'Ctrl Shift';
            else if (alt && shift) result += 'Alt Shift';
            else if (ctrl) result += 'Ctrl';
            else if (alt) result += 'Alt';
            else if (shift) result += 'Shift';
            else result = 'nomod';

            return result;
        },

        rebuild_keys: function (param, pause_mod) {

            var data = user_params[param],
                keys = {nomod: []}, // нужно добавить главную группу заранее, чтобы она всегда была первой
                except_keys = {};

            // раскидываю добавленные клавиши по группам
            $.each(data, function (i, elem) {
                var mod = method.key_remap(elem, pause_mod);

                // создание группы для модификатора
                if (!keys[mod])
                    keys[mod] = [];

                // добавление в группу TriggerMainKey
                keys[mod].push(elem.replace(/(Ctrl|Alt|Shift)/gi, '').trim());
            });

            console.log('data', data);
            console.log('keys', keys);

            if (user_params['except-' + param] && user_params['except-' + param].length) {
                console.log('except-' + param, user_params['except-' + param]);

                $.each(user_params['except-' + param], function (i, elem) {
                    var mod = method.key_remap(elem, pause_mod);

                    // если этой группы модификаторов нет в основном списке, то делать исключение не из чего - пропускаем клавишу
                    if (!keys[mod] || (keys[mod] && !keys[mod].length))
                        return;

                    // создание группы для модификатора
                    if (!except_keys[mod])
                        except_keys[mod] = [];

                    // добавление в группу TriggerMainKey
                    except_keys[mod].push(elem.replace(/(Ctrl|Alt|Shift)/gi, '').trim());
                })
            }

            console.log('except_keys', except_keys);
            console.log(' ');

            var result = '', count = 1, keys_length = Object.keys(keys).length,
                delete_next_pause_mod = false;

            // скливаю группы клавиш точкой с запятой ;
            $.each(keys, function (mod, elem) {
                var keys_nomod = mod === 'nomod';

                // если сейчас добавляется группа без модификаторов и она оказалась пустая
                if (keys_nomod && !keys.nomod.length) {

                    // и если для выключения горячих клавиш используется переключаемый модификатор, по типу ScrollLockOn
                    // у следующей группы этот переключаемый модификатор нужно удалить, потому что он уже был добавлен шаблонизатором скрипта
                    if (pause_mod)
                        delete_next_pause_mod = true;

                    count++;
                    return;
                }

                if (delete_next_pause_mod)
                    mod = mod.replace(new RegExp(pause_mod), '');

                // чтобы не добавлялось слово nomod и добавленный ранее переключаемый модификатор
                result += !keys_nomod ? '<span class="num">' + mod + '</span> ' : '';

                result += elem.join('<span class="num">,</span> '); // склейка кнопок запятыми

                // если для этой группы есть исключения, дописываем их сюда
                if (except_keys[mod] && except_keys[mod].length)
                    result += ' <span class="tag"><abbr title="' + lang.except + '" data-uk-tooltip="{\'pos\':\'top-left\'}">except</abbr></span> ' +
                        except_keys[mod].join('<span class="num">,</span> ');

                // в конце точка с запятой не нужна
                if (count++ < keys_length)
                    result += '<span class="num">;</span> ';

                delete_next_pause_mod = false;
            });

            return result;
        },

        simple_script: function (pre) {
            var pause_mod_str = '',
                mouse_mod_str = '',
                mouse_equal_pause = user_params['mouse-mod-key'][0] === user_params['pause-hotkeys-key'][0],
                dynamic_win_prefix = user_params['win-prefix'].replace(/[^a-z0-9\s]/gi, '').trim(),
                params = ['win-name', 'win-prefix', 'rename-windows-key', 'main-keys', /*'except-main-keys', */'movement-keys', 'path', 'launch-key', 'sendmode', 'mouse-mod-key', 'mouse-keys'];

            // Object
            if (!user_params['main-keys'].length) pre.find('[data-section="main-keys"]').remove();
            if (!user_params['movement-keys'].length) pre.find('[data-section="movement-keys"]').remove();
            if (!user_params['mouse-keys'].length) pre.find('[data-section="mouse-keys"]').remove();

            if (method.is_toggle_mod(user_params['pause-hotkeys-key'][0])) {
                pre.find('[data-section="nomod-pause-hotkeys-key"]').remove();
                pause_mod_str = user_params['pause-hotkeys-key'][0] + 'On ';
            }

            if (mouse_equal_pause) {
                pre.find('[data-section="mouse-mod-key"]').remove();

            } else if (method.is_mod(user_params['mouse-mod-key'][0])) { // если mouse_mod - модификат
                pre.find('[data-section="mouse-mod-key"]').remove();
                mouse_mod_str = '<span class="num">' + user_params['mouse-mod-key'][0] + '</span>';

            } else if (method.is_toggle_mod(user_params['mouse-mod-key'][0])) {
                pre.find('[data-section="mouse-mod-key"]').remove();
                mouse_mod_str = '<span class="num">' + user_params['mouse-mod-key'][0] + 'On</span>';

            } else {
                mouse_mod_str = '<span class="num">' + user_params['mouse-mod-key'][0] + '</span>';
            }

            // Inner Html
            var html = pre.html();

            if (!mouse_mod_str)
                html = html.replace(/\{mouse-mod-key}/, user_params['pause-hotkeys-key'][0]);

            html = html
                .replace(/\{nomod-pause-hotkeys-key}/g, user_params['pause-hotkeys-key'][0])
                .replace(/\{mouse-mod-key}/g, mouse_mod_str)
                .replace(/\{pause-hotkeys-key}/g, pause_mod_str)
                .replace(/\{dynamic-win-prefix}/g, dynamic_win_prefix ? dynamic_win_prefix : user_params['win-name']);


            $.each(params, function (i, param) {
                var replace = '';

                if (param.substr(-5) === '-keys') {
                    replace = method.rebuild_keys(param, pause_mod_str);

                    //if (param.substr(0, 6) === 'except')
                    //    replace = user_params[param].length ? '</span> <span class="tag">except</span> <span class="ex">' + replace : '';

                } else if ($.isArray(user_params[param])) {
                    // пока это только одиночные клавиши _key, но могут появиться и другие параметры
                    replace = user_params[param].join('<span class="num">,</span> ');

                } else {
                    replace = user_params[param];
                }

                // если в списке клавиш для мыши стоит модификатор тот же, что включает/отключает горячие клавиши
                if (param === 'mouse-keys' && !mouse_equal_pause) replace = ' ' + replace;

                html = html.replace(new RegExp('{' + param + '}', 'g'), replace);
            });

            html = html.replace(/"str">"(\S*?)"<\//g, '"str">$1</'); // удаление кавычек

            return html;
        },
        base_script:   function (pre) {
            return pre.html();
        },
        expert_script: function (pre) {
            return pre.html();
        }
    };


    $(document).ready(method.init);

    $(document)
    // Copy to clipboard button
        .on({
            click: function () {
                var target = $('#gen').find('fieldset:last-child pre'),
                    selection = window.getSelection(),
                    range = document.createRange();

                range.selectNodeContents(target[0]);
                selection.removeAllRanges();
                selection.addRange(range);

                try {
                    if (document.execCommand('copy')) {
                        $(this).text(lang.copied).attr('disabled', true);
                    }

                } catch (err) {
                    console.log('Oops, unable to copy');
                }

                selection.removeAllRanges();
            }
        }, '.copy-script');
})(jQuery);
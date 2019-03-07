/*
 * @package   hkn_calculator
 * @author    Pashted http://www.slashfocus.ru
 * @copyright Copyright (C) slashfocus.ru
 * @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
 */
(function ($) {
    $(document).ready(function () {

        // калькулятор макетов HotkeyNet
        var calc = $('#res_calc'),
            calc_btn = calc.find('button'),
            w_field = calc.find('#w_res'),
            h_field = calc.find('#h_res'),
            scr_width = window.screen.width,
            scr_height = window.screen.height,
            layout_color = {
                1:  '#981616',
                2:  '#aa1818',
                3:  '#bb1b1b',
                4:  '#cd1d1d',
                5:  '#df2020',
                6:  '#169816',
                7:  '#18aa18',
                8:  '#1bbb1b',
                9:  '#1dcd1d',
                10: '#20df20'
            };

        function validate(fail, success) {
            var w = w_field.val(), h = h_field.val();

            if (w < 100 || h < 50 || !$.isNumeric(w) || !$.isNumeric(h))
                fail();
            else
                success();
        }

        w_field.val(scr_width).on({
            input:   function () {

                if ($.isNumeric(w_field.val()))
                    h_field.val(w_field.val() / (16 / 9));
                else
                    h_field.val('');

                validate(function () {
                    calc_btn.attr('disabled', 'true');
                }, function () {
                    calc_btn.removeAttr('disabled');
                });

                calc_btn.next().css('display', 'none');
            },
            focus:   function () {
                w_field.select();
            },
            keydown: function (e) {
                if (e.which == 13) {
                    h_field.focus().select();
                } else {
                    calc_btn.next().css('display', 'none');
                }
            }
        });

        h_field.val(scr_height).on({
            input:   function () {
                validate(function () {
                    calc_btn.attr('disabled', 'true');
                }, function () {
                    calc_btn.removeAttr('disabled');
                });

                calc_btn.next().css('display', 'none');
            },
            focus:   function () {
                h_field.select();
            },
            keydown: function (e) {
                if (e.which == 13) {
                    validate(function () {
                        calc_btn.next().html('Введено неверное значение!').removeClass('uk-text-success').addClass('uk-text-danger').fadeIn(200);
                    }, function () {
                        calc_btn.click();
                    });

                } else {
                    calc_btn.next().css('display', 'none');
                }
            }
        });


        function build_layout(lay, win_count, grid, ar) {
            var w_small, h_small, w_big, h_big, match = '', result = {}, i = 2;

            if (!win_count)
                win_count = params.win_count;

            if (!grid)
                grid = params.grid;

            if (!ar)
                ar = params.screens.SCR_1.W / params.screens.SCR_1.H;

            if (lay == 1) {
                w_small = params.screens.SCR_1.W / grid;
                h_small = w_small / ar;
                h_big = params.screens.SCR_1.H - h_small;
                w_big = h_big * ar;

                match = w_big <= params.screens.SCR_1.W;

                if (!match) {
                    w_big = params.screens.SCR_1.W;
                    h_big = w_big / ar;
                }
                result.WIN_1 = {
                    X: (match) ? (params.screens.SCR_1.W - w_big) / 2 : 0, Y: 0
                };
                for (; i <= win_count; i++) {
                    result['WIN_' + i] = {
                        X: w_small * (i - 2),
                        Y: h_big
                    };
                }

            } else if (lay == 3) {
                h_small = params.screens.SCR_1.H / grid;
                w_small = h_small * ar;
                w_big = params.screens.SCR_1.W - w_small;
                h_big = w_big / ar;

                match = params.screens.SCR_1.H >= h_big;
                if (!match) {
                    h_big = params.screens.SCR_1.H;
                    w_big = h_big * ar;
                }
                result.WIN_1 = {
                    X: (match) ? 0 : params.screens.SCR_1.W - (w_big + w_small), Y: 0
                };
                for (; i <= win_count; i++) {
                    result['WIN_' + i] = {
                        X: params.screens.SCR_1.W - w_small,
                        Y: h_small * (i - 2)
                    };
                }

            } else if (lay == 4) {
                w_small = params.screens.SCR_1.W / grid;
                h_small = w_small / ar;
                w_big = w_small * (grid - 1);
                h_big = w_big / ar;

                match = params.screens.SCR_1.H >= h_big + h_small;
                if (!match) {
                    h_small = params.screens.SCR_1.H / grid;
                    w_small = h_small * ar;
                    h_big = h_small * (grid - 1);
                    w_big = h_big * ar;
                }
                result.WIN_1 = {
                    X: params.screens.SCR_1.W - (w_big + w_small), Y: 0
                };
                for (; i <= win_count; i++) {
                    if (i <= 5) {
                        result['WIN_' + i] = {
                            X: (params.order == 1) ? result.WIN_1.X + w_small * (i - 2) : result.WIN_1.X + w_big,
                            Y: (params.order == 1) ? h_big : h_small * (i - 2)
                        };

                    } else {
                        result['WIN_' + i] = {
                            X: (params.order == 1) ? result.WIN_1.X + w_big : result.WIN_1.X + w_small * (i - 6),
                            Y: (params.order == 1) ? h_small * (i - 6) : h_big
                        };
                    }
                }

            } else if (lay == 5) {
                h_small = params.screens.SCR_1.H / grid;
                w_small = h_small * ar;
                w_big = params.screens.SCR_1.W - (w_small * 2);
                h_big = w_big / ar;

                match = params.screens.SCR_1.H >= h_big; // влезает ли главное окно в высоту

                if (!match) {
                    w_big = params.screens.SCR_1.H * ar;
                    h_big = params.screens.SCR_1.H;
                }

                result.WIN_1 = {
                    X: (match) ? 0 : params.screens.SCR_1.W - (w_big + (w_small * 2)), Y: 0
                };
                for (; i <= win_count; i++) {
                    if (params.order == 1) {
                        var h_small_mod = (i <= 3) ? 0 : (i <= 5) ? 1 : (i == 6) ? 2 : (i <= 8) ? 4 : 5;

                        result['WIN_' + i] = {
                            X: ((i <= 6 && i % 2 == 0) || (i > 6 && i % 2 != 0)) ? params.screens.SCR_1.W - (w_small * 2) : params.screens.SCR_1.W - w_small,
                            Y: h_small * h_small_mod
                        };
                    } else {
                        result['WIN_' + i] = {
                            X: (i <= 6) ? params.screens.SCR_1.W - (w_small * 2) : params.screens.SCR_1.W - w_small,
                            Y: (i == 6) ? 0 : (i <= 5) ? h_small * i : h_small * (i - 5)
                        };
                    }
                }

            } else if (lay == 6) {
                w_big = params.screens.SCR_1.W;
                h_big = params.screens.SCR_1.H;
                h_small = h_big / grid;
                w_small = Math.floor(h_small * ar);
                h_small = Math.floor(h_small);

                //match = w_big <= params.screens.SCR_1.W;
                //
                //if (!match) {
                //    w_big = params.screens.SCR_1.W;
                //    h_big = w_big / ar;
                //}
                result.WIN_1 = {
                    X: 0, Y: 0
                };
                for (; i <= win_count; i++) {
                    result['WIN_' + i] = {
                        X: Math.round((w_big / 100) * 68.8),
                        Y: Math.round((h_big / 100) * 63.33)
                    };
                }
            }


            result.WIN_1.W = w_big;
            result.WIN_1.H = h_big;

            for (var j = 2; j <= win_count; j++) {
                if (lay == 5 && j == 6) {
                    result['WIN_' + j].W = w_small * 2;
                    result['WIN_' + j].H = h_small * 2;
                } else {
                    result['WIN_' + j].W = w_small;
                    result['WIN_' + j].H = h_small;
                }
            }

            result.WIN_A = {
                X: result['WIN_1'].X,
                Y: result['WIN_1'].Y,
                W: result['WIN_1'].W,
                H: result['WIN_1'].H
            };

            return result;
        }

        /*        function parse_vals(lay, win_count) {
         var result = {};
         if (!win_count)
         win_count = params.win_count;

         for (var i = 1; i <= win_count; i++) {
         var win = lay.next().find('.win_' + i).html().split(' ');
         result['WIN_' + i] = {
         X: parseInt(win[0], 10),
         Y: parseInt(win[1], 10),
         W: parseInt(win[2], 10),
         H: parseInt(win[3], 10)
         }
         }

         return result;
         }*/

        function set_vals(lay, win_count, arr) {
            for (var i = 1; i <= win_count; i++) {
                lay.next().find('.win_' + i).css('color', layout_color[i]).html(
                    Math.floor(arr['WIN_' + i].X) + ' ' +
                    Math.floor(arr['WIN_' + i].Y) + ' ' +
                    Math.floor(arr['WIN_' + i].W) + ' ' +
                    Math.floor(arr['WIN_' + i].H));
            }
        }

        function load_layout(prop) {
            params.scr_count = 1;
            params.win_count = prop.win_count;
            params.grid = prop.grid;
            params.pip = prop.pip;
            params.auto = ' uk-active';
            params.order = prop.order;
            params.order_vals = ['', ''];
            params.order_vals[order - 1] = ' selected';
            params.ar = prop.ar;
            params.ar_vals = ['', '', '', '', '', '', '', '', ''];
            params.ar_vals[prop.ar_vals] = ' selected';
            params.prefix = 'WoW';
            params.sendwin = ['', '', ' selected', '', '', '', ''];
            params.screens = {
                SCR_1: {X: 0, Y: 0, W: scr_width, H: scr_height}
            };
            params.windows = build_layout(prop.layout, prop.win_count, prop.grid, prop.ar);
            params.switcher.active = prop.imp_switcher;

            load_modal();
        }

        var layout_1 = $('#lay_1'),
            layout_2 = $('#lay_2'),
            layout_3 = $('#lay_3'),
            layout_4 = $('#lay_4'),
            layout_5 = $('#lay_5'),
            layout_6 = $('#lay_6');

        layout_1.children('.uk-thumbnail').click(function () {
            load_layout({
                layout:       1,
                win_count:    5,
                grid:         4,
                ar:           16 / 9,
                ar_vals:      6,
                order:        1,
                pip:          '',
                imp_switcher: ''
            });
        });
        layout_2.children('.uk-thumbnail').click(function () {
            load_layout({
                layout:       3,
                win_count:    5,
                grid:         4,
                ar:           16 / 9,
                ar_vals:      6,
                order:        2,
                pip:          '',
                imp_switcher: ''
            });
        });
        layout_3.children('.uk-thumbnail').click(function () {
            load_layout({
                layout:       3,
                win_count:    5,
                grid:         4,
                ar:           4 / 3,
                ar_vals:      4,
                order:        2,
                pip:          '',
                imp_switcher: ''
            });
        });
        layout_4.children('.uk-thumbnail').click(function () {
            load_layout({
                layout:       4,
                win_count:    10,
                grid:         5,
                ar:           16 / 9,
                ar_vals:      6,
                order:        1,
                pip:          '',
                imp_switcher: ''
            });
        });
        layout_5.children('.uk-thumbnail').click(function () {
            load_layout({
                layout:       5,
                win_count:    10,
                grid:         6,
                ar:           4 / 3,
                ar_vals:      4,
                order:        2,
                pip:          '',
                imp_switcher: ''
            });
        });
        layout_6.children('.uk-thumbnail').click(function () {
            load_layout({
                layout:       6,
                win_count:    2,
                grid:         4,
                ar:           16 / 9,
                ar_vals:      6,
                order:        2,
                pip:          ' uk-active',
                imp_switcher: ''
            });
        });

        calc_btn.click(function () {
            calc_btn.attr('disabled', 'true');
            scr_width = parseInt(w_field.val(), 10);
            scr_height = parseInt(h_field.val(), 10);

            build(); // пересчитываю размеры на случай, если конструктор был закрыт и откроется снова

            set_vals(layout_1, 5, build_layout(1, 5, 4, 16 / 9));
            set_vals(layout_2, 5, build_layout(3, 5, 4, 16 / 9));
            set_vals(layout_3, 5, build_layout(3, 5, 4, 4 / 3));
            set_vals(layout_4, 10, build_layout(4, 10, 5, 16 / 9));
            set_vals(layout_5, 10, build_layout(5, 10, 6, 4 / 3));

            // 6-й пример ==============================================================================================
            var layout_6_pre = layout_6.next(),
                h6_small = scr_height / 4,
                w6_small = Math.floor(h6_small * (scr_width / scr_height)),
                x_small = Math.round((scr_width / 100) * 68.8),
                y_small = Math.round((scr_height / 100) * 63.33);

            h6_small = Math.floor(h6_small);

            layout_6_pre.find('.win_1').css('color', layout_color[1]).html('0 0 ' + scr_width + ' ' + scr_height);
            layout_6_pre.find('.win_2').css('color', layout_color[6]).html(x_small + ' ' + y_small + ' ' + w6_small + ' ' + h6_small);
            layout_6_pre.find('.win_3').css('color', layout_color[6]).html(x_small + ' ' + y_small + ' ' + w6_small + ' ' + h6_small);


            calc_btn.next().html('Готово!').removeClass('uk-text-danger').addClass('uk-text-success').fadeIn(200);
        });


        // конструктор макетов HotkeyNet
        var page = $('html'),
            const_btn = $('#construct'),
            modal = $('<div id="hkn-modal" class="uk-modal"></div>'),
            locale = (navigator.language || navigator.systemLanguage || navigator.userLanguage).substr(0, 2).toLowerCase() == 'ru' ? 'ru' : 'en',
            const_body, const_form, block,
            disp, wins, rows, snap, table, language,
            pip, switcher, auto, scale, order, ar, keep_ar,

            params = {
                mult:        scr_width > 2150 ? 1 / 4 : 1 / 2,
                scale_vals:  scr_width > 2150 ? ['', ' selected'] : [' selected', ''],
                scr_count:   1,
                scr_limit:   50,
                win_count:   5,
                win_limit:   99,
                grid:        4,
                grid_limit:  10,
                snap:        '',
                magnetic:    true,
                pip:         '',
                auto:        ' uk-active',
                order:       1,
                order_vals:  [' selected', ''],
                ar:          16 / 9,
                ar_vals:     ['', '', '', '', '', '', ' selected', '', ''],
                keep_ar:     '',
                keep_ar_tmp: false,
                table:       ' uk-active',
                table_vals:  '',
                prefix:      'WoW',
                sendwin:     ['', '', ' selected', '', '', '', ''],
                many_func:   [' selected', '', ''],
                custom_code: '',
                tooltip:     'animation:false,delay:0,pos:\'bottom\'',
                select:      {'disable_search': true},
                switcher:    {
                    active:        '',
                    mod:           ['RShift ', '', 'Ctrl ', 'Alt ', 'Ctrl Alt ', 'Numpad', 'Ctrl Numpad', 'Alt Numpad', 'Ctrl Alt Numpad', 'F', 'Ctrl F', 'Alt F', 'Ctrl Alt F'],
                    mod_target:    ['', 'Ctrl ', 'Alt ', 'Shift ', 'Ctrl Alt '],
                    target:        ['Oem4', 'Oem6', 'Oem5', 'Oem1', 'Oem7', 'Comma', 'Period', 'F8', 'F9', 'F10', 'F11', 'F12'],
                    ui_hide:       'PgDn',
                    ui_show_main:  'PgUp',
                    ui_show_slave: 'Home'
                }
            },

            lang = {
                ru: {
                    lang:           'Язык',
                    coord_x:        'Координата X',
                    coord_y:        'Координата Y',
                    width:          'Ширина',
                    height:         'Высота',
                    scr:            'Экран',
                    screens:        'Экраны:',
                    screens_desc:   'Число мониторов в макете. Используйте стрелки для быстрого изменения.',
                    win:            'Окно',
                    windows:        'Окна:',
                    windows_desc:   'Число игровых окон в макете. Используйте стрелки для быстрого изменения.',
                    rows:           'Шаг сетки:',
                    rows_desc:      'Чем меньше это число, тем точнее можно размещать окна с включённой «привязкой к сетке», и тем меньших размеров будут создаваться новые окна. Используйте стрелки для быстрого изменения.',
                    scale:          'Масштаб:',
                    scale_desc:     'Определяет размер элементов в рабочей области конструктора.',
                    //axis:           'по оси',
                    pip:            'Картинка в картинке',
                    pip_desc:       'Вырезает внутри главного окна прозрачные области. Не рекомендуется располагать другие уменьшенные окна в левом верхнем углу.',
                    order:          ['Располагать окна:', 'вручную', 'слева направо', 'сверху вниз'],
                    order_desc:     'Порядок добавления окон во время авторасчёта.',
                    ar:             ['Соотношение сторон:', 'авто'],
                    ar_desc:        'Автоматически перестроить окна по новому соотношению сторон.',
                    keep_ar:        'Сохранять пропорции',
                    keep_ar_desc:   'Сохранять пропорции окон при изменении их размеров. Удерживайте Shift во время изменения размеров для быстрого переключения опции.',
                    snap:           'Привязка к сетке',
                    snap_desc:      'Позволяет перемещать окна и изменять их размеры с некоторым шагом (шаг сетки).',
                    auto:           'Авто-расчёт',
                    auto_desc:      'Автоматически пересчитывать размеры и отступы окон в макете. Сбрасывает ваши текущие изменения.',
                    table:          'Таблица',
                    table_desc:     'Показать метрику всех экранов и окон. Если вы не видите какое-то окно на макете, кликните по его строке в таблице и используйте стрелки для перемещения.',
                    reset:          'Сброс',
                    save:           'Сохранить',
                    save_desc:      'Сформировать код этого макета для скрипта HotkeyNet.',
                    load:           'Загрузить',
                    load_desc:      'Импортировать координаты и размеры окон из созданного ранее скрипта HotkeyNet.',
                    code:           'Ваш код',
                    code_desc:      'Вставьте в это поле код, содержащий команды "SetWinRect",<br>или код улучшенного переключателя с операторами "If&nbsp;WinSizeIs/WinSizeIsNot".<br><br>Не импортируйте сюда <b>весь</b> свой скрипт, иначе могут возникнуть проблемы с распознаванием значений.<br><br>Конфигурация мониторов автоматически <b>не распознаётся</b> - укажите их количество и разрешение в конструкторе перед импортом.',
                    code_error:     [
                        'Код не может быть пустым.',
                        'Подходящие параметры не найдены.',
                        'Параметры окон содержат критические ошибки.',
                        'Подходящие параметры главного окна не найдены.'
                    ],
                    close:          'Закрыть',
                    heading:        'Конструктор оконных макетов для скриптов HotkeyNet',
                    author:         'автор',
                    prefix:         'Префикс',
                    prefix_desc:    'Начальные символы в новом заголовке окна.',
                    sendmode:       ['Режим отправки'],
                    sendmode_desc:  'Сбособ связи с окнами. Подробности смотрите в описании команды.',
                    command_help:   ['Открыть описание команды {command} в новой вкладке', '/hotkeynet/commands/item/{command}/'],
                    many_func:      ["Количество команд", "Одна", "Несколько", "Улучшенный переключатель"],
                    many_func_desc: 'Позволяет разбить код на несколько команд, если количество окон превышает 10.',
                    switcher:       {
                        name:               'Улучшенный переключатель',
                        desc:               'Быстрый переключатель окон для экспериментальных скриптов. Поддерживает не более 60 окон.',
                        replace_win_tmpl:   '// Пользовательская команда для перемещения окон на свои исходные (миниатюрные) позиции.\n',
                        ui_hide:            'скрытие интерфейса',
                        ui_show_slave:      'показ интерфейса + понижение графики',
                        ui_show_main:       'показ интерфейса + повышение графики',
                        fast_switch_tmpl:   '// Шаблон для увеличения окна, на которое мы хотим переключиться.\n',
                        bind_buttons:       '// Добавление горячих клавиш для переключения.\n',
                        wow_macro_examples: 'Примеры макросов для этого переключателя в игре World of Warcraft',
                        select_1:           'выбор главного из первой группы',
                        select_2:           'выбор главного из второй группы'
                    }
                },
                en: {
                    lang:           'Language',
                    coord_x:        'X coordinate',
                    coord_y:        'Y coordinate',
                    width:          'Width',
                    height:         'Height',
                    scr:            'Screen',
                    screens:        'Screens:',
                    screens_desc:   'Number of monitors in the layout. Use arrows for quick changing.',
                    win:            'Window',
                    windows:        'Windows:',
                    windows_desc:   'Number of game windows in the layout. Use arrows for quick changing.',
                    rows:           'Grid spacing:',
                    rows_desc:      'The smaller this number, the more accurate you can place windows with enabled «snap to grid», and the smaller will be the new windows. Use arrows for quick changing.',
                    scale:          'Scale:',
                    scale_desc:     'Determines the size of the elements in workspace.',
                    scale_str:      ['1 : 2', '1 : 4'],
                    //axis:           'for axis',
                    pip:            'Picture in picture',
                    pip_desc:       'Cuts transparent regions inside the main window. Not recommended to place other small windows in the upper left corner.',
                    order:          ['Place windows:', 'manually', 'from left to right', 'from top to bottom'],
                    order_desc:     'The order of adding windows during the auto-calculation.',
                    ar:             ['Aspect ratio:', 'auto', '1 : 1', '2 : 1', '3 : 2', '4 : 3', '5 : 4', '16 : 9', '16 : 10', '21 : 9'],
                    ar_desc:        'Automatically rearrange windows on new aspect ratio.',
                    keep_ar:        'Keep aspect ratio',
                    keep_ar_desc:   'Keep the proportions of windows while resizing. Hold Shift while resizing to quickly switch this option.',
                    snap:           'Snap to grid',
                    snap_desc:      'Allows you to move and resize windows with a certain step (grid spacing).',
                    auto:           'Auto-calculation',
                    auto_desc:      'Automatically recalculate the sizes and indentation of windows in the layout. Resets your current changes.',
                    table:          'Table',
                    table_desc:     'Show the metric of all screens and windows. If you do not see a window on the layout, click on its line in the table and use arrows to move.',
                    reset:          'Reset',
                    save:           'Save',
                    save_desc:      'Build code of this layout for HotkeyNet script.',
                    load:           'Load',
                    load_desc:      'Import coordinates and sizes of the windows from your HotkeyNet script.',
                    code:           'Your code',
                    code_desc:      'Paste here your code, that contains "SetWinRect" commands,<br>or code of the improved switcher with "If&nbsp;WinSizeIs/WinSizeIsNot" operators.<br><br>Don\'t put your <b>entire</b> script here, otherwise there may be problems with recognizing the values.<br><br>Setup monitor configuration in the constructor before importing, because it\'s <b>can\'t be determined</b> automatically.',
                    code_error:     [
                        'The code field can\'t be empty.',
                        'Suitable code not found.',
                        'Windows parameters contain critical errors.',
                        'Suitable code of the main window not found.'
                    ],
                    close:          'Close',
                    heading:        'Window layout builder for HotkeyNet scripts',
                    author:         'author',
                    prefix:         'Prefix',
                    prefix_desc:    "Beginning symbols in the new heading of window.",
                    sendmode:       ["Send mode", 'TargetWin', 'SendWin', 'SendWinM', 'SendWinMF', 'SendWinS', 'SendWinSF', 'SendWinX'],
                    sendmode_desc:  'Method of communication with windows. See more info in description of the command.',
                    command_help:   ['Open description for {command} in new tab', 'http://www.hotkeynet.com/ref/{command}.html'],
                    many_func:      ["Number of commands", "One", "Several", "Improved switcher"],
                    many_func_desc: 'Allows to split code into several commands, if number of windows is more than 10.',
                    switcher:       {
                        name:               'Improved switcher',
                        desc:               'Fast window switcher for experimental scripts. Supports up to 60 windows.',
                        comment_line:       '//----------------------------------------------------------------------\n',
                        replace_win_tmpl:   '// User-defined command for moving windows to their original (miniature) positions.\n',
                        ui_hide:            'hide user interface',
                        ui_show_slave:      'show user interface + reduce graphic details',
                        ui_show_main:       'show user interface + increase graphic details',
                        fast_switch_tmpl:   '// Template for enlargement the window to which we want to switch.\n',
                        bind_buttons:       '// Adding hotkeys fow switching.\n',
                        wow_macro_examples: 'Examples of macros for World of Warcraft',
                        select_1:           'select main character from the 1st group',
                        select_2:           'select main character from the 2nd group'
                    }
                }
            };


        function get_grid_mod(w, h) {
            return {
                normal: h / ((w / params.grid) / params.ar),
                floor:  h / Math.floor((w / params.grid) / params.ar)
            };
        }

        function build() {
            // сброс параметров
            params.screens = {};
            params.windows = {};

            const_form = modal.find('#res_const');

            if (const_form.length) { // если конструктор уже открыт
                params.scr_count = parseInt(disp.val(), 10);
                params.win_count = parseInt(wins.val(), 10);
            }

            if (params.scr_count < 1 || params.win_count < 1 || params.grid < 1)
                return;

            for (var i = 1, x = 0, y = 0, w = scr_width, h = scr_height; i <= params.scr_count; i++) {

                if (const_form.length && const_form.find('#SCR_' + i + '_X').length) { // если конструктор уже открыт
                    x = parseInt(const_form.find('#SCR_' + i + '_X').val(), 10);
                    y = parseInt(const_form.find('#SCR_' + i + '_Y').val(), 10);
                    w = parseInt(const_form.find('#SCR_' + i + '_W').val(), 10);
                    h = parseInt(const_form.find('#SCR_' + i + '_H').val(), 10);
                }

                if (i >= 2)  // если строится не первый экран, следующее окно смещается на ширину предыдущего
                    x = params.screens['SCR_' + (i - 1)].X + params.screens['SCR_' + (i - 1)].W;

                // сохраняем параметры экрана
                params.screens['SCR_' + i] = {
                    X: x, Y: y, W: w, H: h
                };

            }

            function build_row(done, s, r, x, y, w, h) {

                var grid_mod = params.ar ? get_grid_mod(w, h) : {normal: params.grid, floor: params.grid},
                    w_inc = w / params.grid,
                    h_inc = h / grid_mod.normal;

                if (params.ar)
                    grid_mod.floor = Math.floor(grid_mod.floor);

                if (params.order == 1) { // слева направо

                    x += w_inc; // прибавляем каждый раз к X ширину окна

                    // если строка уже заполнена, начинаем новую - увеличиваем Y на высоту окна, а X обнуляем
                    if (done % params.grid == 0) {

                        // если место на экране исчерпано, следующее окно будет смещено в начало
                        if (done % (grid_mod.floor * params.grid) == 0) {
                            y = 0;
                            if (params.screens['SCR_' + (s + 1)]) {
                                s++;
                            }
                        } else {
                            y += h_inc;
                        }

                        x = 0;
                        r++;
                    }

                } else { // сверху вниз

                    y += h_inc; // прибавляем каждый раз к Y высоту окна

                    // если столбец уже заполнен, начинаем новый - увеличиваем X на ширину окна, а Y обнуляем
                    if (done % grid_mod.floor == 0) {

                        // если место на экране исчерпано, следующее окно будет смещено в начало
                        if (done % (grid_mod.floor * params.grid) == 0) {
                            x = 0;
                            if (params.screens['SCR_' + (s + 1)]) {
                                s++;
                            }
                        } else {
                            x += w_inc;
                        }

                        y = 0;
                        r++;
                    }
                }

                return {scr: s, row: r, X: x, Y: y};
            }

            if (params.scr_count >= 2) {

                params.windows.WIN_1 = {
                    X: params.screens.SCR_1.X,
                    Y: params.screens.SCR_1.Y,
                    W: params.screens.SCR_1.W
                };

                if (params.ar) {
                    params.windows.WIN_1.H = params.screens.SCR_1.W / params.ar;

                    if (params.windows.WIN_1.H > params.screens.SCR_1.H) {
                        params.windows.WIN_1.W = params.screens.SCR_1.H * params.ar;
                        params.windows.WIN_1.H = params.screens.SCR_1.H;
                    }
                } else {
                    params.windows.WIN_1.H = params.screens.SCR_1.H;
                }

                // row - счётчик столбцов/строк
                for (var i2 = 1, s = 2, r = 0, x2 = 0, y2 = 0; (i2 + 1) <= params.win_count; i2++) {

                    var w2 = params.screens['SCR_' + s].W,
                        h2 = params.screens['SCR_' + s].H,
                        ar = params.ar ? params.ar : w2 / h2;

                    // первое окно на текущем экране всегда должно быть с нулевыми координатами
                    if (i2 >= 2) {
                        var new_row = build_row(i2 - 1, s, r, x2, y2, w2, h2);

                        s = new_row.scr;
                        r = new_row.row;
                        x2 = new_row.X;
                        y2 = new_row.Y;

                        w2 = params.screens['SCR_' + s].W;
                        h2 = params.screens['SCR_' + s].H;
                        ar = params.ar ? params.ar : w2 / h2;
                    }

                    // сохраняем параметры окна
                    params.windows['WIN_' + (i2 + 1)] = {
                        X: x2 + params.screens['SCR_' + s].X,
                        Y: y2 + params.screens['SCR_' + s].Y,
                        W: w2 / params.grid,
                        H: (w2 / params.grid) / ar
                    };
                }

            } else {
                // разметка одного экрана

                // высчитываю значения готового макета
                if (params.win_count <= 5) {

                    if (params.order == 1) { // слева направо
                        params.grid = 4;
                        params.windows = build_layout(1, 0, 0, params.ar);

                    } else { // сверху вниз
                        params.grid = (params.win_count <= 4) ? 3 : 4;
                        params.windows = build_layout(3, 0, 0, params.ar);
                    }

                } else if (params.win_count <= 9) {

                    if (params.ar == 4 / 3 || params.ar == 5 / 4 || params.ar == 3 / 2) {
                        params.grid = 6;
                        params.windows = build_layout(5, 0, 0, params.ar);

                    } else {
                        params.grid = 5;
                        params.windows = build_layout(4, 0, 0, params.ar);
                    }

                } else {

                    if (params.ar == 4 / 3 || params.ar == 5 / 4 || params.ar == 3 / 2) {
                        params.grid = 6;
                        params.windows = build_layout(5, 10, 0, params.ar);

                    } else {
                        params.grid = 5;
                        params.windows = build_layout(4, 10, 0, params.ar);
                    }
                }

                if (params.win_count >= 11) {
                    var AR = params.ar ? params.ar : params.screens.SCR_1.W / params.screens.SCR_1.H;

                    for (var i3 = 1, row = 0, x3 = 0, y3 = 0; i3 + 10 <= params.win_count; i3++) {

                        // первое окно на текущем экране всегда должно быть с нулевыми координатами
                        if (i3 >= 2) {
                            var n_row = build_row(i3 - 1, 1, row, x3, y3, params.screens.SCR_1.W, params.screens.SCR_1.H);

                            row = n_row.row;
                            x3 = n_row.X;
                            y3 = n_row.Y;
                        }

                        // сохраняем параметры окна
                        params.windows['WIN_' + (i3 + 10)] = {
                            X: x3,
                            Y: y3,
                            W: params.screens.SCR_1.W / params.grid,
                            H: (params.screens.SCR_1.W / params.grid) / AR
                        };
                    }
                }
            }
            params.windows.WIN_A = {
                X: params.windows.WIN_1.X,
                Y: params.windows.WIN_1.Y,
                W: params.windows.WIN_1.W,
                H: params.windows.WIN_1.H
            };
        }

        // вставка окон
        function win(num) {
            return '<div id="WIN_' + num + '" class="win uk-flex uk-flex-center uk-flex-middle">' +
                '<span class="lt"></span><span class="t"></span><span class="rt"></span>' +
                '<span class="l"></span><span class="r"></span>' +
                '<span class="lb"></span><span class="b"></span><span class="rb"></span>' +
                (num == 'A' ? 'Active' : num) + '</div>';
        }

        // построение инпута
        function inp(str) {
            var str1 = 'windows',
                str2 = '<h5>win&nbsp;<span>' + str.split('_')[1] + '</span></h5>',
                str3 = lang[locale].win + ' ' + (str.split('_')[1] == 'A' ? 'Active' : str.split('_')[1]),
                disabled_x = '',
                disabled_y = '';

            if (str.split('_')[0] == 'SCR') {
                str1 = 'screens';
                str2 = '<h5>scr&nbsp;<span>' + str.split('_')[1] + '</span></h5>';
                str3 = lang[locale].scr + ' ' + str.split('_')[1];
                if (str.split('_')[1] > 1)
                    disabled_x = ' readonly';

                if (params.scr_count <= 1) {
                    disabled_x += ' readonly';
                    disabled_y += ' readonly';
                }
            }

            var x = params[str1][str]['X'],
                y = params[str1][str]['Y'],
                w = params[str1][str]['W'],
                h = params[str1][str]['H'];

            var fx = Math.floor(x),
                fy = Math.floor(y),
                fw = Math.floor(w),
                fh = Math.floor(h);

            if (fx != x)
                x = fx;

            if (fy != y)
                y = fy;

            if (fw != w)
                w = fw;

            if (fh != h)
                h = fh;

            var result = '<label title="' + str3 + '" data-uk-tooltip="{' + params.tooltip + ',pos:\'left\'}" for="' + str;

            if (disabled_y) {
                result += '_W">';
            } else if (disabled_x) {
                result += '_Y">';
            } else {
                result += '_X">';
            }

            result += str2 + '</label><p>' +
                '<input id="' + str + '_X" class="uk-form-large" type="text" autocomplete="off" value="' + x + '" title="' + lang[locale].coord_x + '" data-uk-tooltip="{' + params.tooltip + '}"' + disabled_x + ' />' +
                '<input id="' + str + '_Y" class="uk-form-large" type="text" autocomplete="off" value="' + y + '" title="' + lang[locale].coord_y + '" data-uk-tooltip="{' + params.tooltip + '}"' + disabled_y + ' />' +
                '<input id="' + str + '_W" class="uk-form-large" type="text" autocomplete="off" value="' + w + '" title="' + lang[locale].width + '" data-uk-tooltip="{' + params.tooltip + '}" />' +
                '<input id="' + str + '_H" class="uk-form-large" type="text" autocomplete="off" value="' + h + '" title="' + lang[locale].height + '" data-uk-tooltip="{' + params.tooltip + '}" />' +
                '</p>';

            return '<span class="uk-flex GRP_' + str + '">' + result + '</span>';
        }

        function draw(grid_down) {

            if (params.scr_count < 1 || params.win_count < 1 || params.grid < 1)
                return;

            const_body = '<div class="uk-panel uk-margin"><div id="SCR_1" class="scr">' + win('A');

            if (const_form /*&& params.scr_count >= 2*/)
                rows.val(params.grid_limit + 1 - params.grid);

            if (params.scr_count >= 2) { // если экранов больше одного
                var win_now = 2;

                for (var scr_now = 1; scr_now <= params.scr_count; scr_now++) { // рисую экраны начиная с первого

                    var grid_mod = params.ar ? Math.floor(get_grid_mod(params.screens['SCR_' + scr_now].W, params.screens['SCR_' + scr_now].H).floor) : params.grid;

                    if (scr_now == 1) {
                        // добавляю единственное окно на первый экран и начинаю рисовать новый
                        const_body += win(1) + '</div><div id="SCR_' + (scr_now + 1) + '" class="scr">';
                        continue;
                    }

                    for (var i = 1; win_now <= params.win_count; i++) {
                        var no_free_place = i - 1 == grid_mod * params.grid;

                        // если это не последний экран и на нём нет места, рисую новый экран
                        if (scr_now != params.scr_count && no_free_place)
                            break;

                        const_body += win(win_now); // добавляю окно
                        win_now++;

                        if (grid_down) {
                            // если я уменьшил число рядов, то продолжаю выводить окна на последний экран (пока не выведутся все)
                            continue;
                        }

                        if (scr_now == params.scr_count && no_free_place) {
                            // если справа экраны кончились, а места на последнем больше нет, увеличиваем шаг сетки
                            params.grid++;
                            rows.val(params.grid_limit + 1 - params.grid);
                            //state(1, rows.prev(), 'rows', 0);
                            build();
                            draw();
                            return;
                        }
                    }

                    // если это не последний экран, рисую следующий
                    if (scr_now != params.scr_count)
                        const_body += '</div><div id="SCR_' + (scr_now + 1) + '" class="scr">'; // начало следующего экрана
                }
                const_body += '</div>'; // закрываю последний экран

            } else {
                for (var a = 1; a <= params.win_count; a++) // расставляю окна на одном экране согласно существующим параметрам
                    const_body += win(a);

                const_body += '</div>';
            }

            const_body += '</div><div class="uk-grid"' + params.table_vals + '>';

            for (var s = 1; s <= params.scr_count; s++)
                const_body += inp('SCR_' + s);

            const_body += '</div><div class="uk-grid"' + params.table_vals + '>' +
                '<div class="uk-width-1-1">' + inp('WIN_A') + '<hr class="uk-margin-small-bottom"></div>' +
                '<div class="uk-width-medium-1-2 uk-width-large-1-3">';

            for (var w = 1; w <= params.win_count; w++) {

                const_body += inp('WIN_' + w);
                if (w % 5 == 0)
                    const_body += '</div><div class="uk-width-medium-1-2 uk-width-large-1-3">'
            }


            const_body += '</div></div>';

            // добавляю разметку в форму
            const_form.children('.uk-margin-top').html(const_body);

            init_form();
            css();

            if (params.pip)
                const_form.find('#WIN_1').trigger('dblclick');

            setTimeout(function () {
                if (params.switcher.active) { // нужно при перерисовке модального окна (не закрытого) с авторасчетом
                    switcher.trigger('click');
                    switcher.trigger('click');
                }
            }, 1);
        }

        function parse_computed_style(obj) {
            var computed = getComputedStyle(obj);

            return {
                scr:    $(obj).parent().attr('id'),
                left:   parseFloat(computed.left),
                top:    parseFloat(computed.top),
                width:  parseFloat(computed.width),
                height: parseFloat(computed.height)
            };
        }

        // установка биндов на форме
        function init_form() {

            // действия с окнами
            var windows = const_form.find('.win');

            windows.unbind().on({
                dblclick: function (e) {
                    e.stopPropagation();
                    block = $(this);

                    //if (block.hasClass('scr'))
                    //    return;

                    block.css({
                        left:   0,
                        top:    0,
                        width:  block.parent().width(),
                        height: block.parent().height()
                    });

                    var computed = parse_computed_style(block[0]);

                    write(block.attr('id'), {
                        X: 0,
                        Y: 0,
                        W: computed.width,
                        H: computed.height
                    });
                    store('windows', block.attr('id'));
                },

                // drag'n'drop
                mousedown: function (e) {
                    e.stopPropagation();

                    if (e.which != 1) // если кликнули правой кнопкой мыши
                        return;


                    function move(prop, resize) {

                        // TODO: сделать универсальный детач на любое окно .scr
                        function detach(place, stat, val) {
                            style[stat] = val;
                            block.detach().appendTo(place);

                            current_scr = block.parent();
                            current_scr_offset = current_scr.offset();
                            computed.current_scr = parse_computed_style(current_scr[0]);

                            prev_scr = current_scr.prev();
                            if (prev_scr.length)
                                computed.prev_scr = parse_computed_style(prev_scr[0]);

                            next_scr = current_scr.next();
                            if (next_scr.length)
                                computed.next_scr = parse_computed_style(next_scr[0]);

                            // пересчет шага сетки после переноса окна на другой экран
                            if (snap_pad_x !== 1) {
                                pad_x = computed.current_scr.width / params.grid;
                                pad_y = params.ar ? (computed.current_scr.width / params.grid) / params.ar : computed.current_scr.height / params.grid;
                            }
                            clear_selection(block.attr('id'));
                        }

                        console.clear();
                        console.log(computed);
                        console.log('prop', prop);
                        console.log('resize', resize);

                        var style = {};

                        // операция с округлением создаёт привязку к сетке с шагом, определённым в переменной pad
                        if (prop.left !== undefined)
                            style.left = snap_pad_x === 1
                                ? prop.left
                                : Math.round(prop.left / snap_pad_x) * snap_pad_x;

                        if (prop.top !== undefined)
                            style.top = snap_pad_y === 1
                                ? prop.top
                                : Math.round(prop.top / snap_pad_y) * snap_pad_y;


                        if (prop.width !== undefined)
                            style.width = prop.width + computed.current_block.left > computed.current_scr.width && resize.X_stop
                                ? computed.current_scr.width - computed.current_block.left
                                : Math.round(prop.width / snap_pad_x) * snap_pad_x;

                        if (prop.height !== undefined)
                            style.height = prop.height + computed.current_block.top > computed.current_scr.height && resize.Y_stop
                                ? computed.current_scr.height - computed.current_block.top
                                : Math.round(prop.height / snap_pad_y) * snap_pad_y;


                        if (snap_pad_x === 1 && params.magnetic) {
                            // прилипание к другим окнам
                            var i, ls, ts, rs, bs, l, t, r, b,
                                w = prop.width === undefined
                                    ? computed.old_block.width
                                    : prop.width > delta
                                        ? prop.width
                                        : delta,

                                h = prop.height === undefined
                                    ? computed.old_block.height
                                    : prop.height > delta
                                        ? prop.height
                                        : delta,

                                x1 = prop.left === undefined
                                    ? computed.old_block.left
                                    : resize.X
                                         ? computed.current_scr.width - computed.old_block.right - w
                                         : prop.left,

                                y1 = prop.top === undefined
                                    ? computed.old_block.top
                                    : resize.Y
                                         ? computed.current_scr.height - computed.old_block.bottom - h
                                         : prop.top,

                                x2 = x1 + w,
                                y2 = y1 + h;

                            //console.log('old_block', computed.old_block);
                            //console.log('current_block', computed.current_block);

                            console.log('x1', x1, 'x2', x2, 'w', w);
                            console.log('y1', y1, 'y2', y2, 'h', h);


                            // цикл начинается с текущего экрана для того, чтобы к экрану прилипало в последнюю очередь
                            for (i = params.win_count + 1; i >= 0; i--) {
                                // к текущему окну прилипать не нужно
                                if (i == current_index)
                                    continue;

                                // с улучшенным переключателем затрагивается также окно с индексом 0
                                if (!params.switcher.active && i === 0)
                                    continue;

                                if (i === params.win_count + 1) {
                                    // прилипание к краям текущего экрана
                                    l = 0;
                                    r = computed.current_scr.width;
                                    t = 0;
                                    b = computed.current_scr.height;

                                } else {
                                    // если окно имеет подходящие координаты, но оно на другом экране, пропускаем его
                                    if (current_scr.attr('id') != computed[i].scr)
                                        continue;

                                    l = computed[i].left;
                                    r = l + computed[i].width;
                                    t = computed[i].top;
                                    b = t + computed[i].height;
                                }

                                // если какой-либо край текущего блока слишком далеко от объекта склеивания
                                if (x2 < l - delta || x1 > r + delta || y2 < t - delta || y1 > b + delta)
                                    continue;

                                if (resize.X) { // ресайз слева
                                    rs = Math.abs(r - x1) <= delta;
                                    ls = Math.abs(l - x1) <= delta;
                                    if (rs) style.width = x2 - r;
                                    if (ls) style.width = x2 - l;

                                } else if (style.left !== undefined) { // перемещение по горизонтали
                                    ls = Math.abs(l - x2) <= delta;
                                    rs = Math.abs(r - x1) <= delta;
                                    if (ls) style.left = l - w;
                                    if (rs) style.left = r;

                                    ls = Math.abs(l - x1) <= delta;
                                    rs = Math.abs(r - x2) <= delta;
                                    if (ls) style.left = l;
                                    if (rs) style.left = r - w;

                                } else if (resize.X_stop) { // ресайз справа
                                    ls = Math.abs(l - x2) <= delta;
                                    rs = Math.abs(r - x2) <= delta;
                                    if (ls) style.width = l - x1;
                                    if (rs) style.width = r - x1;
                                }


                                if (resize.Y) { // ресайз сверху
                                    bs = Math.abs(b - y1) <= delta;
                                    ts = Math.abs(t - y1) <= delta;
                                    if (bs) style.height = y2 - b;
                                    if (ts) style.height = y2 - t;

                                } else if (style.top !== undefined) { // перемещение по вертикали
                                    ts = Math.abs(t - y2) <= delta;
                                    bs = Math.abs(b - y1) <= delta;
                                    if (ts) style.top = t - h;
                                    if (bs) style.top = b;

                                    ts = Math.abs(t - y1) <= delta;
                                    bs = Math.abs(b - y2) <= delta;
                                    if (ts) style.top = t;
                                    if (bs) style.top = b - h;

                                } else if (resize.Y_stop) { // ресайз снизу
                                    ts = Math.abs(t - y2) <= delta;
                                    bs = Math.abs(b - y2) <= delta;
                                    if (ts) style.height = t - y1;
                                    if (bs) style.height = b - y1;
                                }
                            }
                        }

                        console.log('style 1', style);

                        if (params.keep_ar_tmp) {
                            if (style.width !== undefined)
                                style.height = style.width / block_ar;
                            else if (style.height !== undefined)
                                style.width = style.height * block_ar;
                        }

                        if (prop.left !== undefined) {
                            if (prop.left <= 0) {
                                // ограничитель у левого края экрана
                                if (prop.left < computed.current_block.width / -2 && !resize.X) {

                                    if (prev_scr.length && computed.prev_scr.left < computed.current_scr.left)
                                        detach(prev_scr, 'left', computed.prev_scr.width - computed.current_block.width);
                                    else if (next_scr.length && computed.next_scr.left < computed.current_scr.left)
                                        detach(next_scr, 'left', computed.next_scr.width - computed.current_block.width);
                                    else
                                        style.left = 0;

                                } else {
                                    style.left = 0;
                                }

                                if (resize.X)
                                    style.width = computed.old_block.left + computed.old_block.width;

                            } else if (prop.left > computed.current_scr.width - computed.current_block.width && resize.X_stop) {
                                // ограничитель у правого края экрана при перемещении
                                if (prop.left > computed.current_scr.width - (computed.current_block.width / 2)) {

                                    if (next_scr.length && computed.next_scr.left > computed.current_scr.left)
                                        detach(next_scr, 'left', 0);
                                    else if (prev_scr.length && computed.prev_scr.left > computed.current_scr.left)
                                        detach(prev_scr, 'left', 0);
                                    else
                                        style.left = computed.current_scr.width - computed.current_block.width;

                                } else {
                                    style.left = computed.current_scr.width - computed.current_block.width;
                                }
                            }
                        }


                        if (prop.top !== undefined) {
                            if (prop.top <= 0) {
                                // ограничитель сверху
                                style.top = 0;

                                if (resize.Y)
                                    style.height = computed.old_block.top + computed.old_block.height;

                            } else if (style.top >= computed.current_scr.height - computed.current_block.height && resize.Y_stop) {
                                // ограничитель снизу при перемещении
                                style.top = computed.current_scr.height - computed.current_block.height;
                            }
                        }

                        if (prop.width !== undefined && style.width <= delta)
                            style.width = delta; // минимальная ширина

                        if (prop.height !== undefined && style.height <= delta)
                            style.height = delta; // минимальная высота

                        console.log('style 2', style);

                        // при ресайзе слева или сверху блок должен быть зафиксирован с противоположной стороны, иначе будет прыгать
                        if (resize.X) {
                            style.left = 'auto';
                            style.right = computed.old_block.right;
                        }

                        if (resize.Y) {
                            style.top = 'auto';
                            style.bottom = computed.old_block.bottom;
                        }


                        console.log('style 3', style);
                        block.css(style);

                        if (resize.X || resize.Y) {
                            var new_position = block.position(),
                                new_style = {};

                            if (resize.X) {
                                new_style.left = new_position.left;
                                new_style.right = 'auto';
                            }

                            if (resize.Y) {
                                new_style.top = new_position.top;
                                new_style.bottom = 'auto';
                            }

                            block.css(new_style);
                        }

                        computed.current_block = parse_computed_style(block[0]);
                        write(block.attr('id'), {
                            X: computed.current_block.left,
                            Y: computed.current_block.top,
                            W: computed.current_block.width,
                            H: computed.current_block.height
                        });
                    }

                    // отключаю браузерный drag'n'drop
                    this.ondragstart = function () {
                        return false;
                    };

                    block = $(this);

                    var current_index = windows.index(block), // номер текущего блока
                        computed = {},

                        current_scr = block.parent(), // текущий экран
                        current_scr_offset = current_scr.offset(),

                        prev_scr = current_scr.prev(), // предыдущий экран
                        next_scr = current_scr.next(); // следующий экран

                    // запоминаю старые размеры блоков
                    $.each(windows, function (i, element) {
                        computed[i != current_index ? i : 'current_block'] = parse_computed_style(element);
                    });

                    computed.current_scr = parse_computed_style(current_scr[0]);

                    computed.old_block = parse_computed_style(block[0]);
                    computed.old_block.right = computed.current_scr.width - (computed.old_block.left + computed.old_block.width);
                    computed.old_block.bottom = computed.current_scr.height - (computed.old_block.top + computed.old_block.height);

                    if (prev_scr.length)
                        computed.prev_scr = parse_computed_style(prev_scr[0]);

                    if (next_scr.length)
                        computed.next_scr = parse_computed_style(next_scr[0]);

                    // запоминаю старое положение курсора перед изменением размера
                    var old_pageX = e.pageX, old_pageY = e.pageY, // старая позиция курсора

                        block_offset = block.offset(),
                        block_ar = computed.old_block.width / computed.old_block.height,
                        shiftX = old_pageX - block_offset.left, // нахожу точку, за которую блок был захвачен
                        shiftY = old_pageY - block_offset.top,

                        pad_x = computed.current_scr.width / params.grid,
                        pad_y = params.ar ? (computed.current_scr.width / params.grid) / params.ar : computed.current_scr.height / params.grid,
                        snap_pad_x, snap_pad_y, prop, resize,

                        pad = 9, // толщина рамки, в пределах которой можно менять размер блока
                        delta = params.mult == 1 / 4 ? 14 : 20, // зона прилипания

                        resize_l = shiftX < pad,                              // левый край
                        resize_t = shiftY < pad,                              // верхний край
                        resize_r = shiftX >= computed.old_block.width - pad,  // правый край
                        resize_b = shiftY >= computed.old_block.height - pad, // нижний край

                        resize_lt = resize_l && resize_t, // левый верхний угол
                        resize_rb = resize_r && resize_b, // правый нижний угол
                        resize_rt = resize_r && resize_t, // правый верхний угол
                        resize_lb = resize_l && resize_b; // левый нижний угол

                    $(document).on({
                        mousemove: function (e) {
                            if (!block.hasClass('active'))
                                clear_selection(block.attr('id'));

                            computed.current_block = parse_computed_style(block[0]);
                            page.addClass('move');

                            if (params.auto)
                                auto.click(); // отключаю авто-расчёт

                            if (!e.ctrlKey && ((params.snap && !e.altKey) || (!params.snap && e.altKey))) {
                                snap_pad_x = pad_x / 4;
                                snap_pad_y = pad_y / 4;
                            } else {
                                params.magnetic = !e.ctrlKey; // прилипание включается, только если выключена сетка и отпущен ctrl
                                snap_pad_x = 1;
                                snap_pad_y = 1;
                            }

                            params.keep_ar_tmp = (params.keep_ar && !e.shiftKey) || (!params.keep_ar && e.shiftKey);


                            if (resize_lt) {
                                prop = {
                                    left:   e.pageX - current_scr_offset.left - shiftX,
                                    top:    e.pageY - current_scr_offset.top - shiftY,
                                    width:  old_pageX + computed.old_block.width - e.pageX,
                                    height: old_pageY + computed.old_block.height - e.pageY
                                };
                                resize = {X: true, Y: true}

                            } else if (resize_rb) {
                                prop = {
                                    width:  e.pageX - (old_pageX - computed.old_block.width),
                                    height: e.pageY - (old_pageY - computed.old_block.height)
                                };
                                resize = {X_stop: true, Y_stop: true}

                            } else if (resize_rt) {
                                prop = {
                                    top:    e.pageY - current_scr_offset.top - shiftY,
                                    width:  e.pageX - (old_pageX - computed.old_block.width),
                                    height: old_pageY + computed.old_block.height - e.pageY
                                };
                                resize = {X_stop: true, Y: true}

                            } else if (resize_lb) {
                                prop = {
                                    left:   e.pageX - current_scr_offset.left - shiftX,
                                    width:  old_pageX + computed.old_block.width - e.pageX,
                                    height: e.pageY - (old_pageY - computed.old_block.height)
                                };
                                resize = {Y_stop: true, X: true}

                            } else if (resize_l) {
                                prop = {
                                    left:  e.pageX - current_scr_offset.left - shiftX,
                                    width: old_pageX + computed.old_block.width - e.pageX
                                };
                                resize = {X: true}

                            } else if (resize_t) {
                                prop = {
                                    top:    e.pageY - current_scr_offset.top - shiftY,
                                    height: old_pageY + computed.old_block.height - e.pageY
                                };
                                resize = {Y: true}

                            } else if (resize_r) {
                                prop = {
                                    width: e.pageX - (old_pageX - computed.old_block.width)
                                };
                                resize = {X_stop: true};

                            } else if (resize_b) {
                                prop = {
                                    height: e.pageY - (old_pageY - computed.old_block.height)
                                };
                                resize = {Y_stop: true}

                            } else {
                                prop = {
                                    left: e.pageX - current_scr_offset.left - shiftX,
                                    top:  e.pageY - current_scr_offset.top - shiftY
                                };
                                resize = {X_stop: true, Y_stop: true}
                            }

                            move(prop, resize);
                        },
                        mouseup:   function (e) {

                            // если позиция изменилась
                            if (e.pageX != old_pageX || e.pageY != old_pageY) {
                                if (block.attr('id').split('_')[0] === 'SCR') {
                                    store('screens', block.attr('id'));
                                } else {
                                    store('windows', block.attr('id'));
                                }

                                // если был сдвинут невыделенный блок, выделяю его, выбор с остальных пропадёт
                                if (!block.hasClass('active'))
                                    clear_selection(block.attr('id'));

                            } else {
                                // если был простой клик по блоку, передаём эвент.кей для выбора нескольких окон
                                clear_selection(block.attr('id'), e.ctrlKey);
                            }

                            // отключаю претаскивание
                            page.removeClass('move');
                            $(document).unbind('mousemove mouseup');
                        }
                    });
                }
            });

            // действия с инпутами
            var old = '';

            const_form.find('p input').unbind().on({
                blur:    function () {
                    var input = $(this);

                    if (old != input.val()) { // если значение поменялось
                        var inp_split = input.attr('id').split('_');

                        if (inp_split[0] == 'SCR') {
                            if (params.auto) {
                                build();
                                draw();
                            } else {
                                store('screens', inp_split[0] + '_' + inp_split[1]);
                                style('screens', inp_split[0] + '_' + inp_split[1]);
                            }
                        } else {
                            if (params.keep_ar && inp_split[2] === 'W') {
                                var next_input = input.next();
                                next_input.val(Math.floor(input.val() / (old / next_input.val())));
                            }
                            store('windows', inp_split[0] + '_' + inp_split[1]);
                            style('windows', inp_split[0] + '_' + inp_split[1]);
                        }
                    }

                },
                focus:   function () {
                    var input = $(this),
                        id = input.attr('id').split('_');

                    old = input.val();

                    if (input.is('[readonly]'))
                        input.blur();
                    else
                        input.select();

                    clear_selection(id[0] + '_' + id[1]);
                },
                keydown: function (e) {
                    var input = $(this),
                        id = input.attr('id'),
                        inp_split = id.split('_'),
                        multiply = e.shiftKey ? 32 : e.ctrlKey ? 1 : 8; // шаг смещения

                    // TODO: сделать сдвиг по сетке стрелками. трудность в том, что мешаются дроби
                    /*                        current_scr = inp_split[0] == 'WIN' ? params.screens[const_form.find('#WIN_' + inp_split[1]).parent().attr('id')] : params.screens['SCR_' + inp_split[1]],
                     current_win = inp_split[0] == 'WIN' ? params.windows['WIN_' + inp_split[1]] : params.screens['SCR_' + inp_split[1]],

                     multiply_x = current_scr.W / params.grid,
                     multiply_y = params.ar ? (current_scr.W / params.grid) / params.ar : (current_scr.H / params.grid)
                     multiply = (inp_split[2] == 'X' || inp_split[2] == 'W') ? multiply_x / 4 : multiply_y / 4;*/

                    if (e.which == 13 || e.which == 9) { // enter или tab
                        e.preventDefault();
                        if (inp_split[0] !== 'SCR' && inp_split[2] !== 'H') {
                            input.next().focus();

                        } else {
                            input.blur();
                            const_form.find('#' + id).next().focus();
                        }

                    } else if (e.which == 37) { // left
                        e.preventDefault();
                        input.prev().focus();

                    } else if (e.which == 38) { // up
                        e.preventDefault();
                        input.val(parseInt(input.val(), 10) + multiply);

                        if (inp_split[0] === 'WIN') {
                            store('windows', inp_split[0] + '_' + inp_split[1]);
                            style('windows', inp_split[0] + '_' + inp_split[1]);
                            input.select();
                        } else {
                            store('screens', inp_split[0] + '_' + inp_split[1]);
                            style('screens', inp_split[0] + '_' + inp_split[1]);
                            input.blur();
                            const_form.find('#' + id).focus();
                        }

                    } else if (e.which == 39) { // right
                        e.preventDefault();
                        input.next().focus();

                    } else if (e.which == 40) { // down
                        e.preventDefault();
                        input.val(parseInt(input.val(), 10) - multiply);

                        if (inp_split[0] === 'WIN') {
                            store('windows', inp_split[0] + '_' + inp_split[1]);
                            style('windows', inp_split[0] + '_' + inp_split[1]);
                            input.select();
                        } else {
                            store('screens', inp_split[0] + '_' + inp_split[1]);
                            style('screens', inp_split[0] + '_' + inp_split[1]);
                            input.blur();
                            const_form.find('#' + id).focus();
                        }
                    }
                }
            });
        }

        // запись значений в инпуты
        function write(cell, prop) {

            // иногда размеры окон принимают дробные значения, например, при сетке, равной 7, а нам нужны только целые числа
            var fx = Math.floor(prop.X / params.mult),
                fy = Math.floor(prop.Y / params.mult),
                fw = Math.floor(prop.W / params.mult),
                fh = Math.floor(prop.H / params.mult);

            if (fx != prop.X) {
                prop.X = fx;
            }
            if (fy != prop.Y) {
                prop.Y = fy;
            }
            if (fw != prop.W) {
                prop.W = fw;
            }
            if (fh != prop.H) {
                prop.H = fh;
            }

            if (cell.split('_')[0] == 'WIN') {
                var scr = const_form.find('#' + cell).parent().attr('id');

                prop.X += params.screens[scr].X;
                prop.Y += params.screens[scr].Y;
            }

            const_form.find('#' + cell + '_X').val(prop.X);
            const_form.find('#' + cell + '_Y').val(prop.Y);
            const_form.find('#' + cell + '_W').val(prop.W);
            const_form.find('#' + cell + '_H').val(prop.H);
        }

        // сохранение значений одной конкретной группы инпутов в массив
        function store(type, cell) {
            params[type][cell] = {
                X: parseInt(const_form.find('#' + cell + '_X').val(), 10),
                Y: parseInt(const_form.find('#' + cell + '_Y').val(), 10),
                W: parseInt(const_form.find('#' + cell + '_W').val(), 10),
                H: parseInt(const_form.find('#' + cell + '_H').val(), 10)
            };

        }

        function style(type, cell) {

            var obj = const_form.find('#' + cell);
            var left = params[type][cell].X;
            var top = params[type][cell].Y;

            if (type == 'windows') {
                var scr = obj.parent().attr('id');
                left -= params.screens[scr].X;
                top -= params.screens[scr].Y;
            }

            obj.css({
                left:   left * params.mult,
                top:    top * params.mult,
                width:  params[type][cell].W * params.mult,
                height: params[type][cell].H * params.mult
            });
        }

        // оформление блоков на основе их данных в инпутах
        function css() {
            var panel_width = 0, panel_height = 0;

            for (var i = 1; i <= params.scr_count; i++) {
                var new_height = params.screens['SCR_' + i].Y + params.screens['SCR_' + i].H;

                if (new_height > panel_height)
                    panel_height = new_height;

                panel_width += params.screens['SCR_' + i].W;
                style('screens', 'SCR_' + i);
            }

            for (var j = 1; j <= params.win_count; j++) {
                style('windows', 'WIN_' + j);
            }
            const_form.find('.uk-panel').css({
                display: 'inline-block',
                width:   panel_width * params.mult,
                height:  panel_height * params.mult
            });

        }

        function clear_selection(id, ctrl) {

            // мультивыделение окон
            if (ctrl && const_form.find('#' + id).hasClass('active')) {
                console.log('deselect ' + id);
                const_form.find('#' + id).removeClass('active');
                const_form.find('.GRP_' + id).removeClass('uk-text-success').find('.uk-form-success').removeClass('uk-form-success');

            } else {
                if (!ctrl) {
                    const_form.find('.uk-text-success').removeClass('uk-text-success');
                    const_form.find('.uk-form-success').removeClass('uk-form-success');
                    const_form.find('.active').removeClass('active');
                }

                if (id) {
                    const_form.find('.GRP_' + id).addClass('uk-text-success').find('input:not([readonly])').addClass('uk-form-success');

                    var win = const_form.find('#' + id);
                    win.addClass('active');

                    if (params.scr_count >= 2)
                        win.filter('.win').parent().addClass('active');
                }
            }

        }

        function build_code() {
            var region = params.pip && params.win_count > 1 && !params.many_func[2]
                ? '\n    <' + lang.en.sendmode[params.sendwin.indexOf(' selected') + 1] + ' ' + params.prefix + '%1%>'
                : '';

            function add_win(num, str) {
                var result = '',
                    X_val = const_form.find('#WIN_' + num + '_X').val(),
                    Xr_val = X_val - const_form.find('#WIN_1_X').val(),
                    Y_val = const_form.find('#WIN_' + num + '_Y').val(),
                    Yr_val = Y_val - const_form.find('#WIN_1_Y').val(),
                    W_val = const_form.find('#WIN_' + num + '_W').val(),
                    H_val = const_form.find('#WIN_' + num + '_H').val();

                result += '\n    <' + lang.en.sendmode[params.sendwin.indexOf(' selected') + 1] + ' ' + params.prefix + str + '>' +
                    '	<SetWinRect ' + X_val + ' ' + Y_val + ' ' + W_val + ' ' + H_val + '>';

                if (params.pip && num > 1) {

                    // поиск минимальных отступов
                    $.each(params.windows, function (i, w) {
                        if (i == 'WIN_1' || i == 'WIN_A')
                            return;

                        if (w.X - const_form.find('#WIN_1_X').val() < W_val &&
                            w.Y - const_form.find('#WIN_1_Y').val() < H_val) {
                            result += '\n        <SetWinRegion None>';
                            return false;
                        }
                    });

                    region += '\n        <SetWinRegion ' + Xr_val + ' ' + Yr_val + ' ' + W_val + ' ' + H_val + '>';

                }
                return result;
            }

            var code = '',
                many = params.many_func.indexOf(' selected');

            if (!many) { // если применяется одна функция

                code += '<Command ResizeAndPosition>';

                if (params.win_count > 10)
                    for (var a = params.win_count; a >= 11; a--)
                        code += add_win(a, a);

                for (var b = 1; b <= params.win_count && b <= 10; b++)
                    code += add_win(b, '%' + b + '%');

                code += '{region}';

            } else if (many == 1) { // если код делится на несколько функций

                for (var c = 1, com = 1, d = 1; c <= params.win_count; c++) {

                    if (c % 10 == 1) {

                        if (c > 1)
                            code += '\n\n';

                        code += '<Command ResizeAndPosition' + com++ + '>';

                        d = 1;
                    }
                    code += add_win(c, '%' + d++ + '%');

                    if (c == 10)
                        code += '{region}';
                }

            } else { // если код строится для альтернативного переключателя

                code += lang.en.switcher.comment_line + lang[locale].switcher.replace_win_tmpl + lang.en.switcher.comment_line +
                    '<Template ReplaceWin>\n' +
                    '    <SetButtonColors Button%1% 0x0B0B0B 0xED1C24>\n' +
                    '    <' + lang.en.sendmode[params.sendwin.indexOf(' selected') + 1] + ' ' + params.prefix + '%1%>\n' +
                    '        <Key ' + params.switcher.ui_hide + '> // ' + lang[locale].switcher.ui_hide + '\n' +
                    '        <SetWinRect %2%>\n' +
                    '        <Key ' + params.switcher.ui_show_slave + '> // ' + lang[locale].switcher.ui_show_slave + '\n' +
                    '<EndTemplate>\n\n';

                code += '<Hotkey Clear>\n';
                $.each(params.windows, function (i) {
                    if (i == 'WIN_A')
                        return;

                    var num = i.replace('WIN_', '');
                    if (num > 60)
                        return false;

                    code += num == 1 ? '    <If ' : '    <Else If ';
                    code += 'WinSizeIs ' + params.prefix + num + ' ' + (params.win_count >= 10 && num > 1 && num < 10 ? ' ' : '') + const_form.find('#WIN_A_W').val() + ' ' + const_form.find('#WIN_A_H').val() + '>	' +
                        '<ApplyTemplate ReplaceWin ' + num + (params.win_count >= 10 && num < 10 ? ' ' : '') + ' "' +
                        const_form.find('#WIN_' + num + '_X').val() + ' ' +
                        const_form.find('#WIN_' + num + '_Y').val() + ' ' +
                        const_form.find('#WIN_' + num + '_W').val() + ' ' +
                        const_form.find('#WIN_' + num + '_H').val() + '">\n';
                });


                code += '\n\n' + lang.en.switcher.comment_line + lang[locale].switcher.fast_switch_tmpl + lang.en.switcher.comment_line +
                    '<Template FastSwitch>\n' +
                    '    <If WinSizeIsNot ' + params.prefix + '%1% ' + const_form.find('#WIN_A_W').val() + ' ' + const_form.find('#WIN_A_H').val() + '>\n' +
                    '        <SaveMousePos>\n' +
                    '        <DoHotkey Hotkey Clear>\n\n' +
                    '        <SendWin ' + params.prefix + '%1%>\n' +
                    '            <Key ' + params.switcher.ui_hide + '> // ' + lang[locale].switcher.ui_hide + '\n' +

                    '            <SetWinRect ' +
                    const_form.find('#WIN_A_X').val() + ' ' +
                    const_form.find('#WIN_A_Y').val() + ' ' +
                    const_form.find('#WIN_A_W').val() + ' ' +
                    const_form.find('#WIN_A_H').val() + '>\n' +

                    '            <Key ' + params.switcher.ui_show_main + '> // ' + lang[locale].switcher.ui_show_main + '\n' +
                    '\n        <RestoreMousePos>\n' +
                    '    <EndIf>\n\n' +
                    '    <SetButtonColors Button%1% 0xAA1515 0xFFFFFF>\n' +
                    '    <SendLabel %2%>\n' +
                    '        <Key %3%>\n' +
                    '<EndTemplate>\n\n\n';


                code += lang.en.switcher.comment_line + lang[locale].switcher.bind_buttons + lang.en.switcher.comment_line;

                var parties = Math.ceil(params.win_count / 5), player = 1;

                // виртуальные хоткеи по группам
                for (var p = 1; p <= parties; p++) {
                    if (player > params.win_count || p > 12)
                        break;

                    // 5 виртуальных хоткеев по персонажам внутри группы
                    for (var w = 1; w <= 5; w++) {
                        if (player > params.win_count)
                            break;
                        code += '<Hotkey ScrollLockOff ' + params.switcher.mod[0] + params.switcher.mod[p] + w + '>\n';

                        //if (p == 1)
                        //    code += '			';
                        //else if (p == 2 || p == 3 || p == 5 || p == 9 || p == 10 || p == 11)
                        //    code += '		';
                        //else if (p == 4 || p == 6 || p == 7 || p == 8 || p == 12)
                        //    code += '	';

                        var win_labels = [];
                        for (var l = 1; l <= params.win_count; l++) {
                            if (l > 60)
                                break;

                            if (l == player)
                                continue;

                            win_labels.push(((player == 10 && l == 11) || (player > 10 && l == 10) ? ' w' : 'w') + l);

                        }

                        code += '    <ApplyTemplate FastSwitch ' + player + (params.win_count >= 10 && player < 10 ? ' ' : '') + ' "' + win_labels.join(',' + (params.win_count <= 20 ? ' ' : '')) + '" ' +
                            (!params.switcher.mod_target[w - 1]
                                ? params.switcher.mod_target[w - 1] + params.switcher.target[p - 1]
                                : '"' + params.switcher.mod_target[w - 1] + params.switcher.target[p - 1] + '"') +
                            '>\n';

                        player++;
                    }
                }

                code += '\n';


                // 5 хоткеев для ручного переключения с клавиатуры
                code += '<Hotkey ScrollLockOff LShift 1-5>\n';

                for (p = 1; p <= parties; p++) {
                    if (p > 12)
                        break;

                    if (p == 1) {

                        if (p != parties) // если пати не одна
                            code += '    <If ActiveParty Is 1>	';
                        else
                            code += '    ';

                    } else if (p == parties) {
                        code += '    <Else>			';

                    } else {
                        code += '    <Else If ActiveParty Is ' + p + '>	';
                    }
                    code += '<DoHotkey Hotkey ScrollLockOff ' + params.switcher.mod[0] + params.switcher.mod[p] + '%TriggerMainKey%>\n';
                }

                code += '\n';

                // переключатель между группами
                if (params.win_count > 5) {

                    code += '<Command ForceSwitch>\n' +
                        '    <SetVar ActiveParty %1%>\n' +
                        '    <DoHotkey Hotkey ScrollLockOff LShift %2%>\n\n' +
                        '<Hotkey Alt Tab>\n';

                    for (p = 1; p <= parties; p++) {
                        if (p > 12)
                            break;

                        if (p == 1)
                            code += '    <If ActiveParty Is 1>	';
                        else if (p == parties)
                            code += '    <Else>			';
                        else
                            code += '    <Else If ActiveParty Is ' + p + '>	';

                        code += '<ForceSwitch ' + (p == parties ? 1 : p + 1) + ' 1>\n';
                    }

                    code += '\n<Hotkey Shift Tab>\n';

                    for (p = 1; p <= parties; p++) {
                        if (p > 12)
                            break;

                        if (p == 1)
                            code += '    <If ActiveParty Is 1>	';
                        else if (p == parties)
                            code += '    <Else>			';
                        else
                            code += '    <Else If ActiveParty Is ' + p + '>	';

                        code += '<ForceSwitch ' + (p == 1 ? parties : p - 1) + ' 1>\n';
                    }

                } else {
                    // переключатель между окнами для одной пати
                    code += '<Hotkey Alt Tab>\n';

                    for (p = 1; p <= params.win_count; p++) {
                        code += '    <Toggle> <DoHotkey Hotkey ScrollLockOff ' + params.switcher.mod[0] + p + '>\n';
                    }
                }

            }

            return code.replace('{region}', region);
        }

        function load_modal() {
            var body = '<div class="uk-modal-dialog uk-modal-dialog-large"><a class="uk-modal-close uk-close"></a>' +
                '<div class="uk-modal-header"><h2>' + lang[locale].heading + '</h2></div>' +

                '<form id="res_const" class="uk-form uk-form-horizontal uk-margin-top' + (params.pip ? ' pip' : '') + (params.switcher.active ? ' fast_switcher' : '') + '">' +


                '<div class="uk-align-right">' +
                '<select id="lang" class="uk-form-small" title="' + lang[locale].lang + '">' +
                (locale == 'ru' ?
                 '<option selected value="ru">Русский</option><option value="en">English</option>' :
                 '<option value="ru">Русский</option><option selected value="en">English</option>') +
                '</select>' +

                '<label class="' + locale + '" for="lang"></label>' +
                '<button id="save" type="button" class="uk-button uk-button-small uk-margin-small-left" title="' + lang[locale].save_desc + '" data-uk-tooltip="\'pos\':\'bottom-right\'">' + lang[locale].save + '</button> ' +
                '<button id="load" type="button" class="uk-button uk-button-small" title="' + lang[locale].load_desc + '" data-uk-tooltip="\'pos\':\'bottom-right\'">' + lang[locale].load + '</button>' +
                '</div>' +

                '<div style="display:inline-block" title="' + lang[locale].screens_desc + '" data-uk-tooltip="\'pos\':\'bottom-left\'">' +
                '<label for="disp">' + lang[locale].screens + '</label> ' +
                '<input id="disp" type="text" value="' + params.scr_count + '" autocomplete="off" />' +
                '</div>' +

                '<div style="display:inline-block" title="' + lang[locale].windows_desc + '" data-uk-tooltip="\'pos\':\'bottom-left\'">' +
                '<label for="wins">' + lang[locale].windows + '</label> ' +
                '<input id="wins" type="text" value="' + params.win_count + '" autocomplete="off" />' +
                '</div>' +


                '<div style="display:inline-block" title="' + lang[locale].scale_desc + '" data-uk-tooltip="\'pos\':\'bottom-left\'">' +
                '<label for="scale">' + lang[locale].scale + '</label>' +
                '</div> ' +
                '<select id="scale">' +
                '<option value="0" ' + params.scale_vals[0] + '>' + lang.en.scale_str[0] + '</option>' +
                '<option value="1" ' + params.scale_vals[1] + '>' + lang.en.scale_str[1] + '</option>' +
                '</select>' +

                '<br><br>' +

                    //'<button id="table" class="uk-button uk-button-mini' + params.table + '" type="button" title="' + lang[locale].table_desc + '" data-uk-tooltip="\'pos\':\'bottom-left\'">' + lang[locale].table + '</button>' +
                '<button id="auto" class="uk-button uk-button-mini uk-margin-right' + params.auto + '" type="button" title="' + lang[locale].auto_desc + '" data-uk-tooltip="\'pos\':\'bottom-left\'">' + lang[locale].auto + '</button>' +

                '<label class="uk-text-small' + (params.auto ? '' : ' uk-text-muted') + '" title="' + lang[locale].order_desc + '" data-uk-tooltip="\'pos\':\'bottom-left\'">' + lang[locale].order[0] + '</label> ' +
                (!params.auto ?
                 '<select id="order" class="uk-form-small" disabled>' +
                 '<option value="1">' + lang[locale].order[2] + '</option>' +
                 '<option value="2">' + lang[locale].order[3] + '</option>' +
                 '<option selected value="0">' + lang[locale].order[1] + '</option>' +
                 '</select>' :

                 '<select id="order" class="uk-form-small">' +
                 '<option' + params.order_vals[0] + ' value="1">' + lang[locale].order[2] + '</option>' +
                 '<option' + params.order_vals[1] + ' value="2">' + lang[locale].order[3] + '</option>' +
                 '</select>') +

                '<label class="uk-text-small uk-margin-left' + (params.auto ? '' : ' uk-text-muted') + '" title="' + lang[locale].ar_desc + '" data-uk-tooltip="\'pos\':\'bottom-left\'">' + lang[locale].ar[0] + '</label> ' +
                '<select id="ar" class="uk-form-small"' + (params.auto ? '' : ' disabled') + '>' +
                '<option' + (params.auto ? params.ar_vals[0] : ' selected') + ' value="0">' + lang[locale].ar[1] + '</option>' +
                '<option' + (params.auto ? params.ar_vals[1] : '') + ' value="1">' + lang.en.ar[2] + '</option>' +
                '<option' + (params.auto ? params.ar_vals[2] : '') + ' value="2">' + lang.en.ar[3] + '</option>' +
                '<option' + (params.auto ? params.ar_vals[3] : '') + ' value="3">' + lang.en.ar[4] + '</option>' +
                '<option' + (params.auto ? params.ar_vals[4] : '') + ' value="4">' + lang.en.ar[5] + '</option>' +
                '<option' + (params.auto ? params.ar_vals[5] : '') + ' value="5">' + lang.en.ar[6] + '</option>' +
                '<option' + (params.auto ? params.ar_vals[6] : '') + ' value="6">' + lang.en.ar[7] + '</option>' +
                '<option' + (params.auto ? params.ar_vals[7] : '') + ' value="7">' + lang.en.ar[8] + '</option>' +
                '<option' + (params.auto ? params.ar_vals[8] : '') + ' value="8">' + lang.en.ar[9] + '</option>' +
                '</select>' +

                '<br><br>' +

                '<button id="keep-ar" class="uk-button uk-button-mini' + params.keep_ar + '" type="button" title="' + lang[locale].keep_ar_desc + '" data-uk-tooltip="\'pos\':\'bottom-left\'">' + lang[locale].keep_ar + '</button>' +
                '<button id="switch" class="uk-button uk-button-mini' + params.switcher.active + '" type="button" title="' + lang[locale].switcher.desc + '" data-uk-tooltip="\'pos\':\'bottom-left\'">' + lang[locale].switcher.name + '</button>' +
                '<button id="pip" class="uk-button uk-button-mini' + params.pip + '" type="button" title="' + lang[locale].pip_desc + '" data-uk-tooltip="\'pos\':\'bottom-left\'">' + lang[locale].pip + '</button>' +
                '<button id="snap" class="uk-button uk-button-mini uk-margin-right' + params.snap + '" type="button" title="' + lang[locale].snap_desc + '" data-uk-tooltip="\'pos\':\'bottom-left\'">' + lang[locale].snap + '</button>' +
                '<div style="display:inline-block" title="' + lang[locale].rows_desc + '" data-uk-tooltip="\'pos\':\'bottom-left\'">' +
                '<label for="rows"' + (params.auto && params.scr_count < 2 ? ' class="uk-text-muted"' : '') + '>' + lang[locale].rows + '</label> ' +
                '<input id="rows" type="text" value="' + params.grid + '" autocomplete="off"' + (params.auto && params.scr_count < 2 ? ' disabled' : '') + '/>' +

                    //'<div class="uk-button-group radio">' +
                    //'<span>' + lang[locale].axis + ' </span>' +
                    //'<input type="radio" name="snap" id="snap_x" value="x"> <label for="snap_x">X</label>' +
                    //'<input type="radio" name="snap" id="snap_y" value="y" checked=""> <label for="snap_y">Y</label>' +
                    //'</div>' +
                '</div>' +

                '<div class="uk-margin-top uk-text-center"></div>' +

                '<div class="uk-flex uk-flex-center"><span class="uk-text-muted uk-text-small">' + lang[locale].author +
                ' <a href="/profile/userprofile/pashted" title="Pashted" target="_blank">@pashted</a></span></div>' +
                '<hr class="uk-margin-bottom">' +

                '</form></div>';

            // добавление разметки в модальное окно
            modal.html(body).unbind('hide.uk.modal').on({
                'hide.uk.modal': function () {
                    $(document).unbind('keydown'); // прекращаю отслеживать нажатия на стрелки
                    $(this).html('').remove();
                }
            }).appendTo('body');

            // показ модального окна
            UIkit.modal('#hkn-modal', {bgclose: false, keyboard: false/*, center: true*/}).show();


            const_form = modal.find('#res_const');

            disp = const_form.find('#disp');
            wins = const_form.find('#wins');
            rows = const_form.find('#rows');
            pip = const_form.find('#pip');
            switcher = const_form.find('#switch');
            scale = const_form.find('#scale');
            order = const_form.find('#order');
            ar = const_form.find('#ar');
            keep_ar = const_form.find('#keep-ar');
            snap = modal.find('#snap');
            table = modal.find('#table');
            language = modal.find('#lang');
            auto = modal.find('#auto');

            draw();

            if (params.switcher.active)
                switcher.trigger('click').trigger('click');

            // отслеживание нажатий на стрелки
            $(document).on({
                keydown: function (e) {
                    // выделенный блок
                    var active_block = const_form.find('.win.active');

                    // если выбран блок и он не зажат мышкой
                    if (active_block.length && !page.hasClass('move')) {
                        var input_X = $('#' + active_block.attr('id') + '_X'),
                            input_Y = $('#' + active_block.attr('id') + '_Y'),
                            not_focus = !const_form.find('input, select').is(':focus'),
                            multiply = e.shiftKey ? 32 : e.ctrlKey ? 1 : 8; // шаг смещения


                        if (not_focus) {
                            // перемещение выделенного блока стрелками
                            if (e.which == 37) { // left
                                e.preventDefault();
                                input_X.val(parseInt(input_X.val(), 10) - multiply);
                                store('windows', active_block.attr('id'));
                                style('windows', active_block.attr('id'));

                            } else if (e.which == 38) { // up
                                e.preventDefault();
                                input_Y.val(parseInt(input_Y.val(), 10) - multiply);
                                store('windows', active_block.attr('id'));
                                style('windows', active_block.attr('id'));

                            } else if (e.which == 39) { // right
                                e.preventDefault();
                                input_X.val(parseInt(input_X.val(), 10) + multiply);
                                store('windows', active_block.attr('id'));
                                style('windows', active_block.attr('id'));

                            } else if (e.which == 40) { // down
                                e.preventDefault();
                                input_Y.val(parseInt(input_Y.val(), 10) + multiply);
                                store('windows', active_block.attr('id'));
                                style('windows', active_block.attr('id'));
                            }
                        }
                    }
                }
            });

            disp.on({
                focus:     function () {
                    $(this).select();
                },
                input:     function () {
                    var obj = $(this),
                        val = obj.val().replace(/\D/g, '');

                    if (val < 1) {
                        val = 1;
                        obj.val(val).select();

                    } else if (val > params.scr_limit) {
                        obj.val(params.scr_count);
                        return false;

                    } else {
                        obj.val(val);
                    }

                    params.scr_count = parseInt(val, 10);
                },
                blur:      function () {
                    var obj = $(this),
                        val = obj.val().replace(/\D/g, ''),
                        count = const_form.find('.scr').length;

                    if (val < count)
                        obj.trigger('decrement');
                    else if (val > count)
                        obj.trigger('increment');

                    if (params.scr_count > 1) {
                        rows.removeAttr('disabled').prev().removeClass('uk-text-muted');
                    } else {
                        rows.attr('disabled', true).prev().addClass('uk-text-muted');
                    }
                },
                keydown:   function (e) {
                    var obj = $(this);

                    if (e.which == 38) { // up
                        e.preventDefault();
                        obj.val(parseInt(obj.val(), 10) + 1).trigger('input').blur().select();

                    } else if (e.which == 40) { // down
                        e.preventDefault();
                        obj.val(parseInt(obj.val(), 10) - 1).trigger('input').blur().select();

                    } else if (e.which == 13) { // enter
                        e.preventDefault();
                        obj.blur().select();
                    }
                },
                increment: function () {
                    params.grid = 1;

                    if (!params.auto) {
                        auto.click();
                    } else {
                        build();
                        draw();
                    }

                    clear_selection('SCR_' + params.scr_count);
                },
                decrement: function () {
                    if (!params.auto) {
                        auto.click();
                    } else {
                        build();
                        draw();
                    }

                    clear_selection('SCR_' + params.scr_count);
                }
            });

            wins.on({
                focus:     function () {
                    $(this).select();
                },
                input:     function () {
                    var obj = $(this),
                        val = obj.val().replace(/\D/g, '');

                    if (val < 1) {
                        val = 1;
                        obj.val(val).select();

                    } else if (val > params.win_limit) {
                        obj.val(params.win_count);
                        return false;

                    } else {
                        obj.val(val);
                    }

                    params.win_count = parseInt(val, 10);
                },
                blur:      function () {
                    var obj = $(this),
                        val = obj.val().replace(/\D/g, ''),
                        count = const_form.find('.win:not(#WIN_A)').length;

                    if (val < count)
                        obj.trigger('decrement');
                    else if (val > count)
                        obj.trigger('increment');

                },
                keydown:   function (e) {
                    var obj = $(this);

                    if (e.which == 38) { // up
                        e.preventDefault();
                        obj.val(parseInt(obj.val(), 10) + 1).trigger('input').blur().select();
                    } else if (e.which == 40) { // down
                        e.preventDefault();
                        obj.val(parseInt(obj.val(), 10) - 1).trigger('input').blur().select();
                    } else if (e.which == 13) { // enter
                        e.preventDefault();
                        obj.blur().select();
                    }
                },
                increment: function () {
                    if (params.auto) {
                        build();
                        draw();

                    } else {

                        var act_scr = const_form.find('.scr.active'),
                            input_table = const_form.children('.uk-margin-top').children('.uk-grid').eq(1);

                        if (!act_scr.length)
                            act_scr = const_form.find('#SCR_' + params.scr_count);

                        for (var r = const_form.find('.win:not(#WIN_A)').length + 1; r <= params.win_count; r++) {
                            params.windows['WIN_' + r] = {
                                X: params.screens[act_scr.attr('id')].X,
                                Y: params.screens[act_scr.attr('id')].Y,
                                W: params.screens[act_scr.attr('id')].W / params.grid,
                                H: params.ar ? (params.screens[act_scr.attr('id')].W / params.grid) / params.ar : params.screens[act_scr.attr('id')].H / params.grid
                            };
                            act_scr.append(win(r));

                            input_table.children('div:last-child').append(inp('WIN_' + r));

                            if (r % 5 == 0)
                                input_table.append('</div><div class="uk-width-medium-1-2 uk-width-large-1-3">');

                            style('windows', 'WIN_' + r);
                        }
                        init_form();
                    }

                    clear_selection('WIN_' + params.win_count);
                },
                decrement: function () {
                    for (var d = const_form.find('.win:not(#WIN_A)').length; d > params.win_count; d--) {
                        const_form.find('#WIN_' + d).remove();
                        const_form.find('.GRP_WIN_' + d).remove();
                        delete params.windows['WIN_' + d];
                    }

                    const_form.children('.uk-margin-top').children('.uk-grid').eq(1).children('div:empty').remove();

                    if (params.auto && params.scr_count == 1 && (params.win_count == 5 || (params.win_count == 4 && params.order == 2))) {
                        build();
                        draw();
                    } else {
                        init_form();
                    }

                    clear_selection('WIN_' + params.win_count);
                }
            });

            rows.on({
                focus:     function () {
                    $(this).select();
                },
                input:     function () {
                    var obj = $(this),
                        val = obj.val().replace(/\D/g, '');

                    if (val < 1) {
                        val = 1;
                        obj.val(val).select();

                    } else if (val > params.grid_limit) {
                        obj.val(params.grid_limit);
                        return false;

                    } else {
                        obj.val(val);
                    }

                    if (val < params.grid_limit + 1 - params.grid) {
                        params.grid = params.grid_limit + 1 - parseInt(val, 10);
                        obj.trigger('increment');

                    } else if (val > params.grid_limit + 1 - params.grid) {
                        params.grid = params.grid_limit + 1 - parseInt(val, 10);
                        obj.trigger('decrement');
                    }
                },
                keydown:   function (e) {
                    var obj = $(this);

                    if (e.which == 38) { // up
                        e.preventDefault();
                        obj.val(parseInt(obj.val(), 10) + 1).trigger('input').select();

                    } else if (e.which == 40) { // down
                        e.preventDefault();
                        obj.val(parseInt(obj.val(), 10) - 1).trigger('input').select();

                    } else if (e.which == 13) { // enter
                        e.preventDefault();
                        obj.trigger('input').select();
                    }
                },
                increment: function () {
                    if (params.auto) {
                        build();
                        draw();
                    }
                },
                decrement: function () {
                    if (params.auto) {
                        build();
                        draw(true);
                    }
                }
            });

            /*table.click(function () {
             var btn = $(this),
             tables = const_form.children('.uk-margin-top').children('.uk-grid')/!*.eq(1)*!/;

             if (btn.hasClass('uk-active')) {
             btn.removeClass('uk-active');
             tables.stop(true, false).slideUp(400);
             params.table = '';
             params.table_vals = ' style="display:none"';

             } else {
             btn.addClass('uk-active');
             tables.stop(true, false).slideDown(300, function () {
             modal.animate({scrollTop: modal.find('.uk-modal-dialog').outerHeight() + 50 - $(window).height()}, 200);
             });
             params.table = ' uk-active';
             params.table_vals = '';
             }
             });
             */
            auto.click(function () {
                //var r = rows.val();

                if (params.auto) {
                    $(this).removeClass('uk-active');
                    params.auto = '';

                    order.append('<option value="0">' + lang[locale].order[1] + '</option>');
                    order.val(0).attr('disabled', 'true').prev().addClass('uk-text-muted');

                    ar.val(0).attr('disabled', 'true').prev().addClass('uk-text-muted');


                    if (params.scr_count < 2)
                        rows.removeAttr('disabled').prev().removeClass('uk-text-muted');

                    /*if (params.scr_count < 2) {
                     if (r > 1)
                     state(1, rows.prev(), 'rows', 0);
                     if (r < params.grid_limit)
                     state(1, rows.next(), 'rows', 1);
                     }*/

                } else {
                    $(this).addClass('uk-active');
                    params.auto = ' uk-active';

                    //params.grid = 1;

                    build();
                    draw();

                    /*if (params.scr_count < 2) {
                     if (r > 1)
                     state(0, rows.prev(), 'rows', 0);
                     if (r < params.grid_limit)
                     state(0, rows.next(), 'rows', 1);
                     }*/

                    order.val(params.order).removeAttr('disabled').find('option:last-child').remove();
                    order.prev().removeClass('uk-text-muted');

                    ar.val(params.ar_vals.indexOf(' selected')).removeAttr('disabled').prev().removeClass('uk-text-muted');

                    if (params.scr_count < 2)
                        rows.attr('disabled', true).prev().addClass('uk-text-muted');

                }
                order.trigger("liszt:updated");
                ar.trigger("liszt:updated");
            });

            snap.click(function () {
                var btn = $(this);
                if (btn.hasClass('uk-active')) {
                    btn.removeClass('uk-active');
                    params.snap = '';
                } else {
                    btn.addClass('uk-active');
                    params.snap = ' uk-active';
                }
            });

            switcher.click(function () {
                var btn = $(this);

                if (btn.hasClass('uk-active')) {
                    btn.removeClass('uk-active');
                    params.switcher.active = '';
                    const_form.removeClass('fast_switcher');
                    pip.removeAttr('disabled');
                    params.many_func = [' selected', '', ''];
                    // окно 1 превращается в развернутое окно
                    const_form.find('#WIN_1_X').val(const_form.find('#WIN_A_X').val());
                    const_form.find('#WIN_1_Y').val(const_form.find('#WIN_A_Y').val());
                    const_form.find('#WIN_1_W').val(const_form.find('#WIN_A_W').val());
                    const_form.find('#WIN_1_H').val(const_form.find('#WIN_A_H').val()).trigger('blur');

                } else {
                    btn.addClass('uk-active');
                    if (params.pip)
                        pip.click();

                    params.switcher.active = ' uk-active';

                    pip.attr('disabled', true);
                    params.many_func = ['', '', ' selected'];
                    const_form.addClass('fast_switcher');

                    // развернутое окно превращается в окно 1
                    const_form.find('#WIN_A_X').val(const_form.find('#WIN_1_X').val());
                    const_form.find('#WIN_A_Y').val(const_form.find('#WIN_1_Y').val());
                    const_form.find('#WIN_A_W').val(const_form.find('#WIN_1_W').val());
                    const_form.find('#WIN_A_H').val(const_form.find('#WIN_1_H').val()).trigger('blur');

                    // окно 1 уменьшается
                    if (params.win_count > 1) {
                        const_form.find('#WIN_1_W').val(const_form.find('#WIN_2_W').val());
                        const_form.find('#WIN_1_H').val(const_form.find('#WIN_2_H').val()).trigger('blur');
                    } else {
                        const_form.find('#WIN_1_W').val(const_form.find('#SCR_1_W').val() / params.grid);

                        if (params.ar)
                            const_form.find('#WIN_1_H').val(const_form.find('#WIN_1_W').val() / params.ar).trigger('blur');
                        else
                            const_form.find('#WIN_1_H').val(const_form.find('#WIN_1_W').val() / (const_form.find('#SCR_1_W').val() / const_form.find('#SCR_1_H').val())).trigger('blur');
                    }
                    clear_selection('WIN_1');
                }
            });

            pip.click(function () {
                var btn = $(this);

                if (btn.hasClass('uk-active')) {
                    btn.removeClass('uk-active');
                    switcher.removeAttr('disabled');
                    const_form.removeClass('pip');
                    params.pip = '';
                    if (params.auto) {
                        auto.trigger('click');
                        auto.trigger('click');
                    }
                } else {
                    const_form.find('#WIN_1').trigger('dblclick');
                    btn.addClass('uk-active');
                    switcher.attr('disabled', true);
                    const_form.addClass('pip');
                    params.pip = ' uk-active';
                }
            });

            keep_ar.click(function () {
                var btn = $(this);
                if (btn.hasClass('uk-active')) {
                    btn.removeClass('uk-active');
                    params.keep_ar = '';
                } else {
                    btn.addClass('uk-active');
                    params.keep_ar = ' uk-active';
                }
            });


            scale.chosen({
                'disable_search': true, width: '85px'
            }).on({
                change: function () {
                    var index = this.selectedIndex;

                    params.mult = 1 / lang.en.scale_str[index].split(' : ')[1];

                    params.scale_vals = ['', ''];
                    params.scale_vals[index] = ' selected';

                    load_modal();
                }
            });

            order.chosen({
                'disable_search': true, width: locale === 'ru' ? '150px' : '170px'
            }).on('change', function () {
                var select = this;

                params.order = parseInt($(select).val(), 10);

                params.order_vals = ['', ''];
                params.order_vals[select.selectedIndex] = ' selected';

                //params.grid = 1;

                build();
                draw();
            });

            ar.chosen({
                'disable_search': true, width: '85px'
            }).on('change', function () {
                var index = this.selectedIndex;

                if (index && lang.en.ar[index + 1] == '21 : 9') {
                    params.ar = 64 / 27;

                } else if (index) {
                    var ar_str = lang.en.ar[index + 1].split(' : ');
                    params.ar = ar_str[0] / ar_str[1];

                } else {
                    params.ar = 0;
                }

                params.ar_vals = ['', '', '', '', '', '', '', '', ''];
                params.ar_vals[index] = ' selected';

                params.grid = 1;

                // TODO: изменение размера меньшей стороны каждого окна на основе нового ar
                if (params.auto) {
                    //auto.click();
                    //} else {
                    build();
                    draw();
                }
            });

            language.chosen({
                'disable_search': true, width: '120px'
            }).on('change', function () {
                locale = $(this).val();
                load_modal();
            });

            modal.find('#save').click(function () {
                function get_help(number) {
                    return '<a ' +
                        (params.sendwin[number - 1] ? 'style="display:inline-block"' : '') +
                        'href="' + lang[locale].command_help[1].replace('{command}', lang.en.sendmode[number].toLowerCase()) + '" ' +
                        'target="_blank" ' +
                        'title="' + lang[locale].command_help[0].replace('{command}', lang.en.sendmode[number]) + '" ' +
                        'data-uk-tooltip="{\'pos\':\'bottom-left\'}"><i class="uk-icon-question-circle"></i></a>';
                }

                // сброс селекта на случай, если ранее был выбран параметр "несколько команд" или "картинка в картинке"
                if ((params.win_count <= 10 && params.many_func[1] === ' selected') || (params.pip && params.many_func[2]))
                    params.many_func = [' selected', '', ''];

                if (params.win_count > 10 && params.many_func[0] === ' selected')
                    params.many_func = ['', ' selected', ''];

                var code_modal = $('<div id="code-modal" class="uk-modal"><div class="uk-modal-dialog' + (params.many_func[2] ? ' uk-modal-dialog-large' : '' ) + '">' +
                    '<a class="uk-modal-close uk-close"></a>' +

                    '<form class="uk-form uk-form-horizontal">' +

                    '<div class="uk-form-row">' +
                    '<label class="uk-form-label" for="prefix" title="' + lang[locale].prefix_desc + '" data-uk-tooltip="\'pos\':\'bottom-right\'">' + lang[locale].prefix + '</label>' +
                    '<div class="uk-form-controls"><input id="prefix" type="text" value="' + params.prefix + '"/></div>' +
                    '</div>' +

                    '<div class="uk-form-row">' +
                    '<label class="uk-form-label" for="sendwin" title="' + lang[locale].sendmode_desc + '" data-uk-tooltip="\'pos\':\'bottom-right\'">' + lang[locale].sendmode[0] + '</label>' +
                    '<div class="uk-form-controls">' +
                    '<select id="sendwin">' +
                    '<option' + params.sendwin[0] + ' value="' + lang.en.sendmode[1] + '">' + lang.en.sendmode[1] + '</option>' +
                    '<option' + params.sendwin[1] + ' value="' + lang.en.sendmode[2] + '">' + lang.en.sendmode[2] + '</option>' +
                    '<option' + params.sendwin[2] + ' value="' + lang.en.sendmode[3] + '">' + lang.en.sendmode[3] + '</option>' +
                    '<option' + params.sendwin[3] + ' value="' + lang.en.sendmode[4] + '">' + lang.en.sendmode[4] + '</option>' +
                    '<option' + params.sendwin[4] + ' value="' + lang.en.sendmode[5] + '">' + lang.en.sendmode[5] + '</option>' +
                    '<option' + params.sendwin[5] + ' value="' + lang.en.sendmode[6] + '">' + lang.en.sendmode[6] + '</option>' +
                    '<option' + params.sendwin[6] + ' value="' + lang.en.sendmode[7] + '">' + lang.en.sendmode[7] + '</option>' +
                    '</select>' +
                    get_help(1) + get_help(2) + get_help(3) + get_help(4) + get_help(5) + get_help(6) + get_help(7) +
                    '</div>' +
                    '</div>' +

                    '<div class="uk-form-row">' +
                    '<label class="uk-form-label" for="many_func" title="' + lang[locale].many_func_desc + '" data-uk-tooltip="\'pos\':\'bottom-right\'">' + lang[locale].many_func[0] + '</label>' +
                    '<div class="uk-form-controls">' +

                    '<select id="many_func">' +

                    (params.win_count > 10
                        ? '<option value="' + lang[locale].many_func[1] + '" disabled>' + lang[locale].many_func[1] + '</option>' +
                     '<option' + params.many_func[1] + ' value="' + lang[locale].many_func[2] + '">' + lang[locale].many_func[2] + '</option>'

                        : '<option' + params.many_func[0] + ' value="' + lang[locale].many_func[1] + '">' + lang[locale].many_func[1] + '</option>' +
                     '<option value="' + lang[locale].many_func[2] + '" disabled>' + lang[locale].many_func[2] + '</option>') +

                    (!params.pip
                        ? '<option' + params.many_func[2] + ' value="' + lang[locale].many_func[3] + '">' + lang[locale].many_func[3] + '</option>'
                        : '<option value="' + lang[locale].many_func[3] + '" disabled>' + lang[locale].many_func[3] + '</option>') +

                    '</select>' +

                    '</div>' +
                    '</div>' +

                    '<p></p>' +
                    '<textarea rows="28">' + build_code() + '</textarea>' +
                    '<h2 class="uk-margin-large-top">' + lang[locale].switcher.wow_macro_examples + '</h2>' +

                    '<p class="uk-margin-small-bottom"><span class="uk-badge">PageDown</span> - ' + lang[locale].switcher.ui_hide + ':</p>' +
                    '<pre>/script UIParent:Hide()</pre>' +

                    '<p class="uk-margin-small-bottom"><span class="uk-badge">Home</span> - ' + lang[locale].switcher.ui_show_slave + ':</p>' +
                    '<pre>/console maxFPS 15' +
                    '\n/console farclip 177' +
                    '\n/console spellEffectLevel 0' +
                    '\n/console SmallCull 0.07' +
                    '\n/console groundEffectDensity 16' +
                    '\n/console groundEffectDist 70' +
                    '\n/console weatherDensity 0' +
                    '\n/console ffxGlow 0' +
                    '\n/console shadowLOD 0' +
                    '\n/script UIParent:Show()</pre>' +

                    '<p class="uk-margin-small-bottom"><span class="uk-badge">PageUp</span> - ' + lang[locale].switcher.ui_show_main + ':</p>' +
                    '<pre>/console maxFPS 60' +
                    '\n/console farclip 357' +
                    '\n/console spellEffectLevel 9' +
                    '\n/console SmallCull 0.01' +
                    '\n/console groundEffectDensity 64' +
                    '\n/console groundEffectDist 140' +
                    '\n/console weatherDensity 3' +
                    '\n/console ffxGlow 1' +
                    '\n/console shadowLOD 1' +
                    '\n/script UIParent:Show()</pre>' +

                    '<p class="uk-margin-small-bottom"><span class="uk-badge">[</span> (Oem4) - ' + lang[locale].switcher.select_1 + ':</p>' +
                    '<pre>/target [nomod,target=Nickname_1][mod:ctrl,nomod:alt,target=Nickname_2][nomod:ctrl,mod:alt,target=Nickname_3][mod:shift,target=Nickname_4][mod:ctrl,mod:alt,target=Nickname_5]' +
                    '\n/follow' +
                    '\n/script SetView(4);SetView(4)</pre>' +

                    '<p class="uk-margin-small-bottom"><span class="uk-badge">]</span> (Oem6) - ' + lang[locale].switcher.select_2 + ':</p>' +
                    '<pre>/target [nomod,target=Nickname_6][mod:ctrl,nomod:alt,target=Nickname_7][nomod:ctrl,mod:alt,target=Nickname_8][mod:shift,target=Nickname_9][mod:ctrl,mod:alt,target=Nickname_10]' +
                    '\n/follow' +
                    '\n/script SetView(4);SetView(4)</pre>' +

                    '<p>&nbsp;</p>' +

                    '</form>' +

                        //'<p class="uk-text-center"><a class="uk-modal-close uk-button">' + lang[locale].close + '</a></p>' +
                    '</div></div>'
                );


                code_modal.on({
                    'show.uk.modal': function () {
                        var text = code_modal.find('textarea');

                        text.on({
                            keydown: function (e) {
                                if (e.which == 27) {
                                    UIkit.modal('#code-modal').hide();
                                }
                            }
                        });

                        code_modal.find('#prefix').on('input', function () {
                            params.prefix = $(this).val();
                            text.val(build_code());
                        });

                        code_modal.find('#sendwin').chosen(params.select).on('change', function () {
                            var obj = $(this);
                            params.sendwin = ['', '', '', '', '', '', ''];
                            params.sendwin[obj[0].selectedIndex] = ' selected';
                            text.val(build_code());

                            obj.nextAll('a').removeAttr('style').eq([obj[0].selectedIndex]).css('display', 'inline-block');
                        });

                        code_modal.find('#many_func').chosen(params.select).on('change', function () {
                            params.many_func = ['', '', ''];
                            params.many_func[$(this)[0].selectedIndex] = ' selected';

                            if (params.many_func[2])
                                code_modal.children('.uk-modal-dialog').addClass('uk-modal-dialog-large');
                            else
                                code_modal.children('.uk-modal-dialog').removeClass('uk-modal-dialog-large');

                            text.val(build_code());
                        });

                        clear_selection();
                        text.select();

                    },
                    'hide.uk.modal': function () {
                        code_modal.remove();
                    }
                }).appendTo('body');

                UIkit.modal('#code-modal', {modal: false, center: true}).show();

            });

            modal.find('#load').click(function () {

                var code_modal = $('<div id="code-modal" class="uk-modal"><div class="uk-modal-dialog' + '">' +
                    '<a class="uk-modal-close uk-close"></a>' +

                    '<form class="uk-form uk-form-horizontal"><p><i class="uk-text-small">' + lang[locale].code_desc + '</i></p>' +

                    '<div class="uk-form-row">' +
                    '<textarea rows="12" placeholder="' + lang[locale].code + '">' + params.custom_code + '</textarea>' +
                    '</div>' +

                    '<div class="uk-form-row">' +
                    '<button type="button" class="uk-button uk-float-right">' + lang[locale].load + '</button> <span style="line-height:40px" class="uk-text-danger"></span>' +
                    '</div>' +
                    '</form>' +

                        //'<p class="uk-text-center"><a class="uk-modal-close uk-button">' + lang[locale].close + '</a></p>' +
                    '</div></div>'
                );

                code_modal.on({
                    'show.uk.modal': function () {
                        var text = code_modal.find('textarea'),
                            btn = code_modal.find('button'),
                            error_log = btn.next('span');

                        text.on({
                            keydown: function (e) {
                                if (e.which == 27) {
                                    UIkit.modal('#code-modal').hide();
                                }
                            },
                            input:   function () {
                                error_log.html('');
                            }
                        });


                        btn.on({
                            click: function () {
                                var code = text.val();

                                // если поле кода пустое
                                if (!code) {
                                    error_log.html(lang[locale].code_error[0]);
                                    return false;
                                }
                                // replace win
                                var parsed_params = code.match(/WinSizeIs[^"]+"\d+(\s+\d+){3}"/gi),
                                    improved_mode = 1;

                                // если в коде нет улучшенного переключателя окон, значит есть простые параметры setwinrect
                                if (parsed_params === null) {
                                    improved_mode = 0;
                                    parsed_params = code.match(/SetWinRect(\s+\d+){4}/gi);

                                    // если и простых параметров нет, выводим ошибку и останавливаемся
                                    if (parsed_params === null) {
                                        error_log.html(lang[locale].code_error[1]);
                                        return false;
                                    }
                                }

                                if ((improved_mode && !params.switcher.active) || (!improved_mode && params.switcher.active))
                                    switcher.click();

                                var win_params = [];

                                // перебираю параметры окон и сохраняю их в массив
                                $.each(parsed_params, function (i, e) {
                                    win_params.push(e.match(/\d+/g).slice(-4));
                                    //    error_log.html(lang[locale].code_error[2]);
                                });

                                console.log(win_params);

                                // если хотя бы одна из строк оказалась неверной
                                if (!error_log.is(':empty'))
                                    return false;


                                // сохраняю последний загруженный код и устанавливаю число окон в конструкторе
                                params.custom_code = code;
                                wins.val(parsed_params.length);

                                // перерисовываю весь макет
                                build();
                                draw();


                                setTimeout(function () {

                                    // заполняю все инпуты новыми значениями и применяю их
                                    $.each(win_params, function (i, e) {
                                        const_form.find('#WIN_' + (i + 1) + '_X').val(e[0]);
                                        const_form.find('#WIN_' + (i + 1) + '_Y').val(e[1]);
                                        const_form.find('#WIN_' + (i + 1) + '_W').val(e[2]);
                                        const_form.find('#WIN_' + (i + 1) + '_H').val(e[3]).trigger('blur');
                                    });

                                    if (improved_mode) {
                                        var win_a = code.match(/WinSizeIsNot(.|\n)+SetWinRect(\s+\d+){4}/i);

                                        if (win_a === null) {
                                            error_log.html(lang[locale].code_error[3]);
                                            return false;
                                        }

                                        win_a = win_a[0].match(/\d+/g).slice(-4);
                                        console.log(win_a);
                                        const_form.find('#WIN_A_X').val(win_a[0]);
                                        const_form.find('#WIN_A_Y').val(win_a[1]);
                                        const_form.find('#WIN_A_W').val(win_a[2]);
                                        const_form.find('#WIN_A_H').val(win_a[3]).trigger('blur');

                                    }

                                    UIkit.modal('#code-modal').hide();
                                }, 2);


                            }
                        });

                        text.select();

                    },
                    'hide.uk.modal': function () {
                        code_modal.remove();
                    }
                }).appendTo('body');

                UIkit.modal('#code-modal', {modal: false, center: true}).show();

            });
        }

        const_btn.click(function () {
            load_modal();
        });

        const_btn.next().click(function () {
            locale = 'en';
            load_modal();
        });

        calc_btn.click();

    });
})(jQuery);
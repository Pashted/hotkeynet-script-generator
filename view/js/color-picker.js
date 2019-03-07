console.log('COLOR-PICKER MODULE');

$.fn.ColorPicker = function () {
    let data = {
            size:  256,
            math:  [
                { liter: ['R', 'R', ''], max: '255', title: '<strong>Red</strong> <i>Красный</i>' },
                { liter: ['G', 'G', ''], max: '255', title: '<strong>Green</strong> <i>Зелёный</i>' },
                { liter: ['B', 'B', ''], max: '255', title: '<strong>Blue</strong> <i>Синий</i>' },
                { liter: ['H', 'H', '&deg;'], max: '360', title: '<strong>Hue</strong> <i>Цветовой тон</i>' },
                { liter: ['S', 'S', '%'], max: '100', title: '<strong>Saturation</strong> <i>Насыщенность</i>' },
                { liter: ['V', 'B', '%'], max: '100', title: '<strong>Brightness</strong> <i>Яркость</i>' }
            ],
            color: {
                hex: ['ff', '00', '00'],
                rgb: [255, 0, 0],
                hsv: [0, 100, 100]
            }
        },

        elem = {
            doc:  $(document),
            page: $('html')
        },

        go = {
            convert: {
                hex: function (hex) {
                    data.color.hex = [
                        hex.substr(1, 2), hex.substr(3, 2), hex.substr(5, 2)
                    ];

                    data.color.rgb = [
                        parseInt(data.color.hex[0], 16), parseInt(data.color.hex[1], 16), parseInt(data.color.hex[2], 16)
                    ];

                    let red = data.color.rgb[0] / 255,
                        green = data.color.rgb[1] / 255,
                        blue = data.color.rgb[2] / 255,
                        cmax = Math.max(red, green, blue),
                        cmin = Math.min(red, green, blue),
                        delta = cmax - cmin,
                        hue = 0, sat = 0;

                    if (delta) {
                        if (cmax === red)
                            hue = (green - blue) / delta;

                        else if (cmax === green)
                            hue = 2 + (blue - red) / delta;

                        else if (cmax === blue)
                            hue = 4 + (red - green) / delta;

                        if (cmax)
                            sat = delta / cmax;
                    }

                    hue = Math.round(60 * hue);
                    if (hue < 0)
                        hue += 360;

                    data.color.hsv = [hue, Math.round(sat * 100), Math.round(cmax * 100)];
                },

                hsv: function (hue_only, hue_bar) {

                    let sat = hue_only ? 1 : data.color.hsv[1] / 100,
                        val = hue_only ? 1 : data.color.hsv[2] / 100,
                        C = sat * val,
                        H = data.color.hsv[0] / 60,
                        X = C * (1 - Math.abs(H % 2 - 1)),
                        m = val - C,
                        RGB = [255, 0, 0];

                    C = hue_bar ? Math.ceil((C + m) * 255) : Math.round((C + m) * 255);
                    X = hue_bar ? Math.ceil((X + m) * 255) : Math.round((X + m) * 255);
                    m = hue_bar ? Math.ceil(m * 255) : Math.round(m * 255);

                    if (H >= 0 && H < 1)
                        RGB = [C, X, m];

                    else if (H >= 1 && H < 2)
                        RGB = [X, C, m];

                    else if (H >= 2 && H < 3)
                        RGB = [m, C, X];

                    else if (H >= 3 && H < 4)
                        RGB = [m, X, C];

                    else if (H >= 4 && H < 5)
                        RGB = [X, m, C];

                    else if (H >= 5 && H <= 6)
                        RGB = [C, m, X];

                    if (hue_only) {
                        return RGB;

                    } else {
                        data.color.rgb = RGB;

                        for (let i = 0; i < 3; i++) {
                            data.color.hex[i] = RGB[i].toString(16);
                            if (data.color.hex[i].length < 2)
                                data.color.hex[i] = '0' + data.color.hex[i];
                        }
                    }
                },

                rgb: function () {
                    let hex = '#';

                    for (let i = 0; i < 3; i++) {
                        let color_code = data.color.rgb[i].toString(16);

                        if (color_code.length < 2)
                            hex += '0';

                        hex += color_code;
                    }

                    go.convert.hex(hex);
                }
            },

            open_picker: function () {
                go.close_pickers();
                go.convert.hex(elem.input.val());

                let get_hue = go.convert.hsv(true),
                    dialog = '';

                for (let i = 0; i < 6; i++) {

                    dialog += '<div title="' + data.math[i].title + '" data-uk-tooltip="{pos:\'right\',delay:0}">' +
                        '<label for="' + data.math[i].liter[0] + '_val">' + data.math[i].liter[1] + '</label>' +
                        '<input type="text" id="' + data.math[i].liter[0] + '_val" data-min="0" data-max="' + data.math[i].max + '" size="2" autocomplete="off" />';

                    if (data.math[i].liter[2])
                        dialog += ' <span>' + data.math[i].liter[2] + '</span>';

                    dialog += '</div>';
                }

                dialog = $('<div id="hkn-picker">' +
                    '<div id="gradient" class="cross" style="background-color:rgb(' + get_hue[0] + ',' + get_hue[1] + ',' + get_hue[2] + ')"><div id="dot"></div></div>' +
                    '<div id="hue-bar" class="pointer"><div id="slider"></div></div>' +
                    '<div id="math">' + dialog + '</div>' +
                    '</div>');


                elem.btn.addClass('uk-active').parent().css('position', 'relative').prepend(dialog);
                //elem.input.LimitInput('hex');

                elem.grad = dialog.find('#gradient');
                elem.dot = elem.grad.find('#dot');

                elem.hue = dialog.find('#hue-bar');
                elem.slider = elem.hue.find('#slider');

                elem.value = {
                    0: dialog.find('#R_val'),
                    1: dialog.find('#G_val'),
                    2: dialog.find('#B_val'),
                    3: dialog.find('#H_val'),
                    4: dialog.find('#S_val'),
                    5: dialog.find('#V_val')
                };

                go.set_color(true);

                dialog.on('mousedown', '#gradient, #hue-bar', function (e) {
                    go.move($(this), e);
                }).fadeIn(200);

                dialog.find('input').LimitInput('number').on({
                    input: function () {
                        let $this = $(this),
                            val = parseInt($this.val(), 10),
                            id = $this.attr('id').split('_')[0];

                        switch (id) {
                            case 'R':
                                data.color.rgb[0] = val;
                                go.convert.rgb();
                                break;
                            case 'G':
                                data.color.rgb[1] = val;
                                go.convert.rgb();
                                break;
                            case 'B':
                                data.color.rgb[2] = val;
                                go.convert.rgb();
                                break;
                            case 'H':
                                data.color.hsv[0] = val;
                                go.convert.hsv();
                                break;
                            case 'S':
                                data.color.hsv[1] = val;
                                go.convert.hsv();
                                break;
                            case 'V':
                                data.color.hsv[2] = val;
                                go.convert.hsv();
                                break;
                        }

                        go.set_color(true);
                        elem.input.val('#' + data.color.hex[0] + data.color.hex[1] + data.color.hex[2]);

                    }
                });

            },

            close_pickers: function () {
                let picker = $('#hkn-picker');
                if (!picker.length)
                    return;

                picker.nextAll().filter('input, a').removeAttr('style').removeClass('uk-active');
                picker.remove();
            },

            move: function (obj, event) {
                if (event.which != 1)
                    return;

                let offset = obj.offset(),
                    cursor = 'move ' + obj.attr('class'),
                    element = obj.children('div').attr('id');

                go.set_position(element, offset, event.pageY, event.pageX);
                elem.page.addClass(cursor);

                elem.doc.on({
                    mousemove: function (e) {
                        go.set_position(element, offset, e.pageY, e.pageX);
                    },
                    mouseup:   function () {
                        elem.page.removeClass(cursor);
                        elem.doc.unbind('mousemove');
                    }
                });
            },

            set_position: function (obj, off, y, x) {
                y -= off.top;
                x -= off.left;

                let css = { top: y < 0 ? 0 : y > data.size ? data.size : y };

                if (obj == 'dot') {
                    css.left = x < 0 ? 0 : x > data.size ? data.size : x;

                    data.color.hsv[1] = 100 * (css.left / data.size);
                    data.color.hsv[2] = (data.size - css.top) * (100 / data.size);

                    go.convert.hsv();
                } else {
                    data.color.hsv[0] = (data.size - elem.slider.position().top) * (360 / data.size);

                    let get_hue = go.convert.hsv(true);
                    elem.grad.css('background-color', 'rgb(' + get_hue[0] + ',' + get_hue[1] + ',' + get_hue[2] + ')');

                    go.convert.hsv(false, true);
                }

                elem[obj].css(css);
                go.set_color(false);
            },

            set_color: function (move_position) {
                $.each(elem.value, function (index, input) {
                    let color_code = index < 3 ? data.color.rgb[index] : data.color.hsv[index - 3];
                    input.val(Math.round(color_code));
                });

                let hex = '#' + data.color.hex[0] + data.color.hex[1] + data.color.hex[2],
                    attr = elem.input.attr('id').substr(-7) == 'color-0' ? 'background-color' : 'color';

                elem.input.css('border-color', hex);
                elem.btn.css('background-color', hex);
                elem.sample.css(attr, hex);

                if (move_position) {
                    elem.dot.css({
                        left: data.color.hsv[1] + '%',
                        top:  (100 - data.color.hsv[2]) + '%'
                    });

                    elem.slider.css('top', data.size - (data.color.hsv[0] * (data.size / 360)));

                    let get_hue = go.convert.hsv(true);
                    elem.grad.css('background-color', 'rgb(' + get_hue[0] + ',' + get_hue[1] + ',' + get_hue[2] + ')');

                } else {
                    elem.input.val(hex);
                }
            }

        };

    elem.doc.on({
        keydown: function (e) {
            if (e.which == 27) {
                if (!elem.input)
                    return;

                elem.input.blur();
                go.close_pickers();
            }
        }
    });

    // поле с 16-ричным значением цвета
    this.prev().on({
        input: function () {
            let $this = $(this),
                val = ('#' + $this.val().replace(/[^0-9A-F]+/gi, '')).substr(0, 7);

            $this.val(val);

            let valid = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(val); // проверка на соответствие выражению

            if (valid) {
                if (val.length == 4)
                    val = val.replace(/([0-9A-F])([0-9A-F])([0-9A-F])/i, '$1$1$2$2$3$3');

                go.convert.hex(val);
                go.set_color(true);
            }

        },

        blur: function () {
            let $this = $(this),
                val = $this.val();

            if (val.length == 4) {
                $this.val(val.replace(/([0-9A-F])([0-9A-F])([0-9A-F])/i, '$1$1$2$2$3$3'));
            } else {
                $this.val('#' + data.color.hex[0] + data.color.hex[1] + data.color.hex[2]);
            }
        },

        focus: function () {
            elem.input = $(this);
            elem.btn = elem.input.next();
            elem.sample = elem.input.nextAll().filter('span');

            if (!elem.btn.hasClass('uk-active'))
                go.open_picker();
        }
    });

    // кнопка с изображением пипетки
    return this.on({
        click: function () {
            elem.btn = $(this);
            elem.input = elem.btn.prev();
            elem.sample = elem.btn.nextAll().filter('span');

            if (elem.btn.hasClass('uk-active')) {
                go.close_pickers();
            } else {
                go.open_picker();
            }
        }
    });
};

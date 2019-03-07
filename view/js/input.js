console.log('INPUT MODULE');

$.fn.LimitInput = function (type) {
    if (type === 'number') {
        let prev;

        return this.on({
            /*focus:   function () {
             $(this).select();
             },*/
            input() {
                let $this = $(this),
                    val = parseInt($this.val().replace(/\D/g, ''), 10), // удаляю из строки всё, что не является цифрой
                    min = $this.data('min'),
                    max = $this.data('max');

                if (val < min || !val) { // если значение ниже минимального
                    $this.val(min).select();

                } else if (val > max) { // если выше максимального
                    $this.val(prev === undefined ? max : prev);

                } else {
                    $this.val(val);
                }
            },
            keydown(e) {
                let $this = $(this),
                    val = parseInt($this.val(), 10);

                prev = val; // сохраняю предыдущее значение

                if (e.which != 38 && e.which != 40)
                    return;

                e.preventDefault();

                let min = $this.data('min'),
                    max = $this.data('max'),
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
                $this.val(val).trigger('input').select();
            }
        });
    }
};
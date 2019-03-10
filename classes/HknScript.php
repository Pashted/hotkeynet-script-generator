<?php
/**
 * Created by PhpStorm.
 * User: Pashted
 * Date: 16.02.2018
 * Time: 0:18
 */

defined('_JEXEC') or die('Restricted access');


class HknScript extends HknController
{
    /**
     * @var string
     */
    private $win_count;


    public function __construct()
    {
        parent::__construct();


        $this->win_count = isset($_POST['win_count'])
            ? preg_replace('/[^0-9]+/', '', $_POST['win_count'])
            : $this->params->{'win-count'}->options[0];

        // ограничение количества окон
        if ($this->win_count < $this->params->{'win-count'}->min)
            $this->win_count = $this->params->{'win-count'}->min;

        else if ($this->win_count > $this->params->{'win-count'}->max)
            $this->win_count = $this->params->{'win-count'}->max;

        if ($this->locale === 'en' && $this->win_count > 1)
            $this->lang['win'] = 'windows';

        $this->set_templates();
    }


    protected function set_templates()
    {
        parent::set_templates();

        $this->params->_template['win_count'] = $this->win_count;

        $this->params->_template['text'] = $this->parse_json(_GEN_ROOT . "/data/lang/scripts/$this->scheme/$this->locale.json", true);
//        $this->params->_template['text'] = $this->parse_json(_GEN_ROOT . "/data/lang/scripts/simple/ru.json", true);

        $this->params->_template['text']['_head'][0] = sprintf(
            $this->params->_template['text']['_head'][0],
            $this->win_count,
            self::_decline($this->win_count) ? $this->lang['wins'] : $this->lang['win']
        );
    }


    private function get_script()
    {
        $html = $this->view->render("scripts/_$this->scheme.twig", $this->params->_template);

        return htmlspecialchars($html);
    }


    public function render()
    {
        $modifiers = '{pause-hotkeys-key}|,';
        $triggers  = '%Trigger%|%TriggerMainKey%';
        $commands  = 'LaunchAndRename';
        $keywords  = 'TurnHotkeysOn|TurnHotkeysOff|Else';

        $pattern = array();
        $replace = array();

        $pattern[] = '#(//.*\v+|\s//.*)#m'; // закрашивание однострочных комментариев
        $replace[] = "<span class='com'>$1</span>";

        $pattern[] = '/\[([a-z-]+?)\]/'; // создание секций, которые могут быть скрыты в зависимости от пользовательских настроек генератора
        $replace[] = '<span data-section="$1">';
        $pattern[] = '#\[/[a-z-]+?\]#';
        $replace[] = '$1</span>';

        $pattern[] = '/(%(\d+|All)%)/i'; // выделение переменных красным
        $replace[] = '<span class="var">$1</span>';

        $pattern[] = "/Hotkey\s(.*)&gt;/i"; // выделение клавиш жёлтым
        $replace[] = 'Hotkey <span class="ex">$1</span><span class="tag">&gt;</span>';

        //        $pattern[] = "/\s(except)/i";
        //        $replace[] = ' <span class="txt">$1</span>';

        $pattern[] = "/($modifiers)/i";
        $replace[] = '<span class="num">$1</span>';

        $pattern[] = "/($triggers)/i";
        $replace[] = '<span class="ex">$1</span>';

        $pattern[] = "/([a-su-z0-9]);\s/i"; //
        $replace[] = '$1<span class="num">;</span> ';

        $pattern[] = "/($commands)&gt;/i"; // объявление пользовательской команды выделяем голубым
        $replace[] = '<span class="fn">$1</span>&gt;';

        $pattern[] = "/&lt;($commands)\s(.*)&gt;/i"; // вызов пользовательской команды выделяем голубым
        $replace[] = '<span class="tag">&lt;</span><span class="fn">$1</span> <span class="var">$2</span><span class="tag">&gt;</span>';

        $pattern[] = '/&lt;(\w+\s)(.*)&gt;/'; // обрамление фиолетовыми тегами ключевых слов с параметрами
        $replace[] = '<span class="tag">&lt;$1</span>$2<span class="tag">&gt;</span>';

        $pattern[] = "/&lt;($keywords)&gt;/"; // обрамление фиолетовыми тегами простых ключевых слов без параметров
        $replace[] = '<span class="tag">&lt;$1&gt;</span>';

        $pattern[] = '/(&quot;.*?&quot;)/'; // выделение строк зеленым
        $replace[] = '<span class="str">$1</span>';

        foreach ($this->params->_template['text']['_script_tips'] as $key => $text) { // вставка подсказок в скрипт
            $pattern[] = "/(&lt;|>)($key)(\s|&gt;|<)/";
            $replace[] = "$1<abbr title='<strong>{$this->params->_template['text']['command']}</strong><br><i>$text</i>' data-uk-tooltip='{\"pos\":\"top-left\"}'>$2</abbr>$3";
        }

        echo "<pre>" . preg_replace($pattern, $replace, self::get_script()) . "</pre>";

    }


    /**
     * Определение окончаний слов в паре с числительными
     *
     * @example 1 комментарий, 2 комментария, 5 комментариев
     * @param int $number
     * @return int
     */
    private function _decline($number)
    {
        $cases = [2, 0, 1, 1, 1, 2];
        return ($number % 100 > 4 && $number % 100 < 20) ? 2 : $cases[min($number % 10, 5)];
    }

}
<?php
/**
 * Created by PhpStorm.
 * User: Pashted
 * Date: 16.02.2018
 * Time: 0:18
 */

defined('_JEXEC') or die('Restricted access');

if (!class_exists("Plural")) {
    require "Plural.php";
}

class HknScript extends HknController
{
    protected $win_count;
    protected $code = array();

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
    }

    function render()
    {
        echo "<pre>" . self::filter_code($this->code) . "</pre>";
    }

    function filter_code($code)
    {
        // TODO: нужно вставлять тег abbr с тайтлами (опционально)

        $modifiers = '{pause-hotkeys-key}|,';
        $triggers = '%Trigger%|%TriggerMainKey%';
        $commands = 'LaunchAndRename';
        $keywords = 'TurnHotkeysOn|TurnHotkeysOff|Else';

        $pattern = array();
        $matches = array();

        $pattern[] = '/\[([a-z-]+)\]/'; // создание секций, которые могут быть скрыты в зависимости от пользовательских настроек генератора
        $matches[] = '<span data-section="$1">';
        $pattern[] = '/\[\/[a-z-]+\]/';
        $matches[] = '</span>';

        $pattern[] = '/%(\d+|All)%/i'; // выделение переменных красным
        $matches[] = '<span class="var">%$1%</span>';

        $pattern[] = '/^(\/\/.*[\r\n]+)/m'; // закрашивание комментариев
        $matches[] = '<span class="com">$1</span>';

        $pattern[] = '/(\s\/\/.*)(\r\n)/'; // закрашивание однострочных комментариев
        $matches[] = "<span class='com'>$1</span>$2";

        $pattern[] = "/Hotkey\s(.*)&gt;/i"; // выделение клавиш жёлтым
        $matches[] = 'Hotkey <span class="ex">$1</span><span class="tag">&gt;</span>';

        //        $pattern[] = "/\s(except)/i";
        //        $matches[] = ' <span class="txt">$1</span>';

        $pattern[] = "/($modifiers)/i";
        $matches[] = '<span class="num">$1</span>';

        $pattern[] = "/($triggers)/i";
        $matches[] = '<span class="ex">$1</span>';

        $pattern[] = "/([a-su-z0-9]);\s/i"; //
        $matches[] = '$1<span class="num">;</span> ';

        $pattern[] = "/($commands)&gt;/i"; // объявление пользовательской команды выделяем голубым
        $matches[] = '<span class="fn">$1</span>&gt;';

        $pattern[] = "/&lt;($commands)\s(.*)&gt;/i"; // вызов пользовательской команды выделяем голубым
        $matches[] = '<span class="tag">&lt;</span><span class="fn">$1</span> <span class="var">$2</span><span class="tag">&gt;</span>';

        $pattern[] = '/&lt;(\w+\s)(.*)&gt;/'; // обрамление фиолетовыми тегами ключевых слов с параметрами
        $matches[] = '<span class="tag">&lt;$1</span>$2<span class="tag">&gt;</span>';

        $pattern[] = "/&lt;($keywords)&gt;/"; // обрамление фиолетовыми тегами простых ключевых слов без параметров
        $matches[] = '<span class="tag">&lt;$1&gt;</span>';

        $pattern[] = '/(&quot;.*?&quot;)/'; // выделение строк зеленым
        $matches[] = '<span class="str">$1</span>';

        foreach ($this->lang['script-tips'] as $key => $text) { // вставка подсказок в скрипт
            $pattern[] = "/(&lt;|>)($key)(\s|&gt;|<)/";
            $matches[] = "$1<abbr title='<strong>{$this->lang['command']}</strong><br><i>$text</i>' data-uk-tooltip='{\"pos\":\"top-left\"}'>$2</abbr>$3";
        }
        return preg_replace($pattern, $matches, htmlspecialchars(implode("\r\n", $code)));
//        return htmlspecialchars(implode("\r\n", $code));
    }
}
<?php

defined('_JEXEC') or die('Restricted access');

/**
 * Main class, provides basic functionality
 *
 * @package   hkn_gen
 * @author    Pashted http://www.slashfocus.ru
 * @copyright Copyright (C) slashfocus.ru
 * @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
 * @since     1.0.0
 */
class HknController
{

    /**
     * Content of json-file with all default field values
     *
     * @var stdClass
     * @since 1.0.0
     */
    protected $params;

    /**
     * Map of fields from the selected scheme's layout
     *
     * @var stdClass
     * @since 1.0.0
     */
    private $map;

    /**
     * User-selected level of settings from predefined list
     *
     * @var string
     * @since 1.0.0
     */
    public $scheme;

    /**
     * Language file as array
     *
     * @var array
     * @since 1.0.0
     */
    protected $lang;

    /**
     * User-selected locale
     *
     * @var string
     * @since 1.0.0
     */
    protected $locale;

    /**
     * Twig template engine
     *
     * @var Twig_Environment
     * @since 2.0.0
     */
    protected $view;


    public function __construct()
    {
        self::set_lang();
        self::set_params();
    }


    /**
     * Starting point
     *
     * @since 2.0.0
     */
    public function execute()
    {
        if (isset($_POST['script']) && $_POST['script'] === 'true') {
            require __DIR__ . "/HknScript.php";
            $script = new HknScript();
            $script->render();
        } else {
            self::render();
        }
    }


    /**
     * Set language strings for view
     *
     * @since 1.0.0
     */
    private function set_lang()
    {
        // TODO: keep locale in browser
        // TODO: add sef urls for scheme, active tab and locale

        $this->lang   = self::parse_json(_GEN_ROOT . '/data/lang/ru.json', true);
        $this->locale = isset($_POST['locale']) && $_POST['locale'] === 'en' ? "en" : "ru";
//        $this->locale = "en";

        // cheat/hack for creating strings, that doesn't exist in eng version (only 1st depth lvl)
        if ($this->locale === 'en') {
            $eng = self::parse_json(_GEN_ROOT . '/data/lang/en.json');

            foreach ($this->lang as $prop => $value) {

                if (isset($eng->$prop))
                    $this->lang[$prop] = $eng->$prop;

                // clean russian variant for non existent eng description
                else if (substr($prop, -4) == 'desc')
                    $this->lang[$prop] = '';

                // format text for non existent eng phrase
                else
                    $this->lang[$prop] = strtoupper($prop[0]) . str_replace('-', ' ', substr($prop, 1));
            }
        }
        $this->lang['_js'] = json_encode($this->lang['_js'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }


    /**
     * Set base parameters form json-files
     *
     * @since 1.0.0
     */
    private function set_params()
    {
        $this->params = self::parse_json(_GEN_ROOT . "/data/params.json");

        $this->scheme = isset($_POST['scheme']) && in_array(preg_replace('/[^A-Za-z]*/', '', $_POST['scheme']), $this->params->scheme->options)
            ? $_POST['scheme']
            : $this->params->scheme->options[$this->params->scheme->value];

        $this->map = self::parse_json(_GEN_ROOT . "/data/maps/$this->scheme.json");

        if ($this->locale === 'en') {
            $this->params->_template->locale = $this->params->_template->en->locale;
            $this->map->_tabs->width         = $this->map->_tabs->width_eng;
        }
    }

    /**
     * Get clean json (w/o comments)
     *
     * @param $path string
     * @param $make_array bool
     * @since 2.0.0
     * @return stdClass|array
     */
    protected function parse_json($path, $make_array = false)
    {
        $result = preg_replace(
            array('#(?<!:)//.*\r\n#', '#/\*(.|\r\n)*?\*/#'),
            array('', ''),
            file_get_contents($path)
        );

        return json_decode($result, $make_array);
    }

    /**
     * Show all available field types only for tests
     *
     * @since 2.0.0
     */
    private function show_types()
    {
        $result = [];
        foreach ($this->params as $name => $param) {
            if ($name == '_template')
                continue;
            $result[$param->type] = isset($result[$param->type]) ? $result[$param->type] + 1 : 1;

        }
        echo "<pre>";
        print_r($result);
        echo "</pre>";
    }


    /**
     * Initialize Twig engine and its templates
     *
     * @since 2.0.0
     */
    protected function set_templates()
    {
        $this->params->_template->ver            = _GEN_VER;
        $this->params->_template->root           = _GEN_URI_ROOT;
        $this->params->_template->lang           = $this->lang;
        $this->params->_template->default_scheme = $this->params->scheme->options[$this->params->scheme->value];

        $this->params->_template = (array)$this->params->_template;

        require_once _GEN_ROOT . '/vendor/autoload.php';

        $loader     = new Twig_Loader_Filesystem(_GEN_ROOT . '/view/templates');
        $this->view = new Twig_Environment($loader, array(
            'autoescape' => false,
            //            'cache'      => _GEN_ROOT . '/view/cache',
            //            'debug'      => _GEN_DEBUG
        ));

    }


    /**
     * Pass scripts and stylesheets to the template for view in its head tag
     *
     * @since 2.0.0
     */
    protected function set_head()
    {

//        if (_GEN_JOOMLA_INTEGRATION) {
//            $doc = JFactory::getDocument();
//            JHtml::_('formbehavior.chosen', 'select');
//        } else {
//        }
        require __DIR__ . "/HknDocument.php";
        $doc = new HknDocument();

        $doc->setMetaData('og:image', 'view/images/generator_full.png');

//        if (!_GEN_JOOMLA_INTEGRATION)
        $this->params->_template = array_merge(
            $this->params->_template,
            [
                'min'  => _GEN_DEBUG ? '' : '.min',
                'head' => $doc->head
            ]
        );

    }


    /**
     * Build html-form and pass it to the main template
     *
     * @throws Twig_Error_Loader
     * @throws Twig_Error_Runtime
     * @throws Twig_Error_Syntax
     * @since 1.0.0
     */
    protected function render()
    {

        self::set_templates();

        if ($_SERVER['REQUEST_METHOD'] != 'POST')
            self::set_head();


        // TODO: replace form by twig-template
        $tabs       = "";
        $form       = "";
        $script_tab = count($this->map->_tabs->width) - 1;

        foreach ($this->map->tabs as $tab => $fields) {

            $tabs .= "<li style='width:{$this->map->_tabs->width[$tab]}%'>"
                . "<a><i class='uk-icon-{$this->map->_tabs->icon[$tab]}'></i>"
                . "&nbsp;&nbsp;{$this->lang[$this->map->_tabs->name[$tab]]}</a></li>";

            $form .= "<fieldset class='uk-margin-top'>";

            if ($tab == $script_tab)
                $form .= $this->view->render('scripts/_tab.twig', $this->params->_template);

            foreach ($fields as $index => $field) {

                if (is_array($field)) {

                    if (isset($field[1])) {
                        $form .= $this->view->render('fields/_heading.twig', [
                            'not_first' => $index,
                            'tag'       => $field[0],
                            'label'     => $this->lang[$field[1]]
                        ]);
                    } else {
                        $form .= $this->view->render('fields/_tag.twig', ['tag' => $field[0]]);
                    }

                    $params['tag'] = $field[0];

                } else {
                    $form .= self::view_field($field);
                }
            }
            $form .= "</fieldset>";
        }

        $template        = /*_GEN_JOOMLA_INTEGRATION || */
            $_SERVER['REQUEST_METHOD'] == 'POST' ? 'generator.twig' : 'index.twig';
        $template_params = array_merge($this->params->_template, ['form' => $form, 'tabs' => $tabs]);

        echo $this->view->render($template, $template_params);

    }


    /**
     * Builds requested field via Twig template engine
     *
     * @param $name
     *
     * @return string
     * @throws Twig_Error_Loader
     * @throws Twig_Error_Runtime
     * @throws Twig_Error_Syntax
     * @since 2.0.0
     */
    protected function view_field($name)
    {
        // TODO: сделать всплывающее окно "изменение списка горячих клавиш" и отменить "поштучное" редактирование в списке вне модального окна

        $field        = $this->params->$name;
        $field->name  = $name;
        $field->class = isset($field->class) && $field->class ? "$name $field->class" : $name;

        if ((isset($field->label) && $field->label) || !isset($field->label)) {
            $field->label = $this->lang[$name] ?? $name;
        }

        if ($field->type == "keys" && !isset($field->except)) {
            // needs for properly working of rebuilding keys in js
            $field->except = [];
        }

        $template_params = array_merge($this->params->_template, ['field' => $field]);

        $result = $this->view->render("fields/$field->type.twig", $template_params);

        return $result;
    }

    /**
     * @param string $name
     *
     * @return string
     * @since      1.0.0
     * @deprecated 2.0.0
     */
    private function build_field($name)
    {
        $field       = $this->params->$name;
        $field->name = $name;

        $attr = isset($field->class) ? "class='$name $field->class'" : "class='$name'";

        if (isset($field->placeholder) && !is_array($field->placeholder))
            $attr .= " placeholder='{$this->lang[$field->placeholder]}'";

        $is_color = false;
        $except   = '';
        $result   = '';
        $title    = '';

        switch ($field->type) {
            case 'color':
                $is_color = true;

            case 'number':
                foreach ($field->options as $n => $option) {

                    if (isset($field->prefix[$n]))
                        $attr .= " title='{$this->lang[$field->prefix[$n]]}' data-uk-tooltip";

                    $result .= "<input type='text' id='{$name}_$n' value='$option' autocomplete='off' $attr";

                    if ($is_color)
                        $result .= "><a type='button' class='pick-color uk-icon-button' title='{$this->lang['select_color']}' data-uk-tooltip>"
                            . "<i class='uk-icon-eyedropper'></i></a> ";
                    else
                        $result .= " size='" . strlen($field->max) . "' data-min='$field->min' data-max='$field->max'>";

                    if (isset($field->suffix[$n]))
                        $result .= "<span class='uk-form-help-inline uk-text-muted'>{$this->lang[$field->suffix[$n]]}</span>";
                }

                if ($is_color)
                    $result .= " <span style='background-color:{$field->options[0]};color:{$field->options[1]}' title='{$this->lang['example']}'>$field->example</span>";
                break;

            case 'radio':
                $result .= "<div class='radio uk-button-group'>";

                $attr .= " type='radio' name='$name'";

                foreach ($field->options as $n => $option) {
                    $checked = $field->value == $n ? ' checked' : '';

                    if (isset($field->linked))
                        $checked .= " data-linked='{$field->linked[$n]}'";

                    $result .= "<input $attr id='{$name}_$n' value='$n'$checked><label for='{$name}_$n'>{$this->lang[$option]}</label>";
                }

                $result .= "</div>";
                break;

            case 'select':
                $desc = '';
                foreach ($field->options as $n => $option) {

                    $text     = isset($this->lang[$option]) ? $this->lang[$option] : $option;
                    $selected = $field->value == $n ? [' selected', ' class="active"'] : ['', ''];

                    if (isset($field->linked))
                        $selected[0] .= " data-linked='{$field->linked[$n]}'";

                    $result .= "<option value='$option'$selected[0]>$text</option>";

                    if (isset($this->lang[$option . '_desc'])) {
                        if (isset($field->links))
                            $this->lang[$option . '_desc'] = sprintf(
                                $this->lang[$option . '_desc'],
                                "<a class='mod' href='index.php?option=com_zoo&task=item&item_id={$field->links[$n]}&Itemid=117'>$option</a>"
                            );


                        $desc .= "<span$selected[1]>{$this->lang[$option . '_desc']}</span>";
                    }
                }

                $result = "<select id='$name' $attr>$result</select>";

                if ($desc)
                    $result .= "<span class='uk-form-help-inline uk-text-muted'>$desc</span>";
                break;

            case 'keys':
                $except = '';

                if (!isset($field->except) || (isset($field->except) && $field->except !== false)) {
                    $except = "<abbr title='{$this->lang['except_desc']}' data-uk-tooltip='{pos:\"top-right\"}'>{$this->lang['except']}</abbr><ul class='except_$name'>";

                    if (isset($field->except))
                        foreach ($field->except as $key)
                            $except .= "<li class='uk-badge uk-badge-success'>$key</li>";


                    $except .= "<li class='add_except'><a>{$this->lang['add']}</a></li></ul>";
                }

            case 'key':
                $result .= "<ul $attr>";

                foreach ($field->options as $value) {
                    $result .= "<li class='uk-badge'>$value</li>";
                }

                $result .= "<li class='add'><a>{$this->lang['add']}</a></li></ul>$except";

                break;

            case 'button':
                $text   = isset($this->lang[$field->value]) ? $this->lang[$field->value] : $field->value;
                $result .= "<a id='testbtn' $attr>$text</a>";
                break;

            case 'text':

                $has_placeholder = isset($field->placeholder) && is_array($field->placeholder);

                foreach ($field->options as $n => $option) {
                    $text = '';
                    if ($has_placeholder && strlen($field->placeholder[$n])) {
                        $text .= ' placeholder="';
                        $text .= isset($this->lang[$field->placeholder[$n]]) ? $this->lang[$field->placeholder[$n]] : $field->placeholder[$n];
                        $text .= '"';
                    }

                    $result .= "<p class='uk-form-controls-condensed'><input $attr type='text' id='$name' value='$option'$text></p>";
                }
                break;

            default:
                $result = '';

//                if (isset($field->suffix))
//                    $result .= "<span class='uk-form-help-inline uk-text-muted'>{$this->lang[$field->suffix]}</span>";
        }

        if (!isset($field->label) || (isset($field->label) && $field->label)) {
            $for = isset($field->for) ? $field->for : $name;

            $title = isset($this->lang[$name]) ? $this->lang[$name] : $name;

            if (isset($this->lang[$name . '_desc']) && strlen($this->lang[$name . '_desc']))
                $title = "<abbr title='<strong>{$this->lang[$name]}</strong><br>"
                    . "<i>{$this->lang[$name . '_desc']}</i>' data-uk-tooltip='{pos:\"top-right\"}'>$title</abbr>";

            $title = "<label class='uk-form-label' for='$for'>$title</label>";
        }

        $hide = isset($field->hidden) && $field->hidden ? ' style="display:none"' : '';

        return "<div class='uk-form-row'$hide>$title<div class='uk-form-controls'>$result</div></div>";
    }

}
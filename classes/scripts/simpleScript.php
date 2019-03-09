<?php
/**
 * Created by PhpStorm.
 * User: Pashted
 * Date: 21.05.2017
 * Time: 13:25
 */

defined('_JEXEC') or die('Restricted access');

class simpleScript extends HknScript
{
    /**
     * @var array
     */
    public $result;
    
    public function __construct()
    {
        parent::__construct();

        $tpl = array(
            'comment-line'            => "//----------------------------------------------------------------------",
            'title'                   => "//======================================================================
// {$this->lang['script-simple-title-1']}
//
// {$this->lang['script-simple-title-2']}
// {$this->lang['script-simple-title-3']}
//
// {$this->lang['script-simple-title-4']}
// {$this->lang['script-simple-title-5']}
//
// {$this->lang['script-simple-title-6']}
//======================================================================",
            'rename-windows-key'      => [
                '// ' . $this->lang['script-simple-rename-windows-key'],
                "<Hotkey {pause-hotkeys-key}{rename-windows-key}>",
                "    <SendPC local>",
                "        <RenameWin \"{win-name}\" \"{win-prefix}%d\">"
            ],
            'path'                    => [
                '// ' . $this->lang['script-simple-path'],
                "<Command LaunchAndRename>",
                "    <SendPC local>",
                "        <Run \"{path}\">",
                "        <RenameTargetWin %1%>"
            ],
            'launch-key'              => [
                '// ' . $this->lang['script-simple-launch-key'],
                "<Hotkey {pause-hotkeys-key}{launch-key}>",
                "    <LaunchAndRename \"{win-prefix}%d\">"
            ],
            'label'                   => [
                '// ' . $this->lang['script-simple-label'],
                "<Label w%d local {sendmode} \"{win-prefix}%d\">"
            ],
            'main-keys'               => [
                "// {$this->lang['script-simple-main-keys']}",
                "<Hotkey {pause-hotkeys-key}{main-keys}>", // {except-main-keys}
                "    <SendLabel %s>",
                "        <Key %Trigger%>"
            ],
            'movement-keys'           => [
                "// {$this->lang['script-simple-movement-keys']}",
                "<MovementHotkey {pause-hotkeys-key}{movement-keys}>",
                "    <SendLabel %s>",
                "        <Key %Trigger%>"
            ],
            'mouse-mod-key'           => [
                "// {$this->lang['script-simple-mouse-mod-key-1']}\r\n// {$this->lang['script-simple-mouse-mod-key-2']}",
                "<UseKeyAsModifier {mouse-mod-key}>"
            ],
            'mouse-keys'              => [
                "<Hotkey {pause-hotkeys-key}{mouse-mod-key}{mouse-keys}>",
                "    <SendLabel %s>",
                "        <ClickMouse %TriggerMainKey%>"
            ],
            'nomod-pause-hotkeys-key' => [
                '// ' . $this->lang['script-simple-nomod-pause-hotkeys-key'],
                "<Hotkey {nomod-pause-hotkeys-key}>",
                "    <If HotkeysAreOn> // {$this->lang['script-simple-nomod-pause-hotkeys-key-if']}",
                "        <TurnHotkeysOff>",
                "    <Else>",
                "        <TurnHotkeysOn>"
            ]
        );

        $send_label = [];

        $this->result[] = sprintf($tpl['title'], $this->win_count, (parent::_decline($this->win_count) ? $this->lang['wins'] : $this->lang['win']));

        $this->result[] = "";

        $this->result[] = $tpl['comment-line'];
        $this->result[] = $tpl['rename-windows-key'][0];
        $this->result[] = $tpl['comment-line'];
        $this->result[] = $tpl['rename-windows-key'][1];
        $this->result[] = $tpl['rename-windows-key'][2];
        for ($i = 1; $i <= $this->win_count; $i++) {
            $this->result[] = sprintf($tpl['rename-windows-key'][3], $i);
            $send_label[] = "w$i";
        }
        $send_label = implode(', ', $send_label);

        $this->result[] = "";

        $this->result[] = $tpl['comment-line'];
        $this->result[] = $tpl['path'][0];
        $this->result[] = $tpl['comment-line'];
        $this->result[] = $tpl['path'][1];
        $this->result[] = $tpl['path'][2];
        $this->result[] = $tpl['path'][3];
        $this->result[] = $tpl['path'][4];

        $this->result[] = "";

        $this->result[] = $tpl['comment-line'];
        $this->result[] = $tpl['launch-key'][0];
        $this->result[] = $tpl['comment-line'];
        $this->result[] = $tpl['launch-key'][1];
        for ($i = 1; $i <= $this->win_count; $i++)
            $this->result[] = sprintf($tpl['launch-key'][2], $i);

        $this->result[] = "";

        $this->result[] = $tpl['comment-line'];
        $this->result[] = $tpl['label'][0];
        $this->result[] = $tpl['comment-line'];
        for ($i = 1; $i <= $this->win_count; $i++)
            $this->result[] = sprintf($tpl['label'][1], $i, $i);

        $this->result[] = "[main-keys]";

        $this->result[] = $tpl['comment-line'];
        $this->result[] = $tpl['main-keys'][0];
        $this->result[] = $tpl['comment-line'];
        $this->result[] = $tpl['main-keys'][1];
        $this->result[] = sprintf($tpl['main-keys'][2], $send_label);
        $this->result[] = $tpl['main-keys'][3];
        $this->result[] = "[/main-keys][movement-keys]";

        $this->result[] = $tpl['comment-line'];
        $this->result[] = $tpl['movement-keys'][0];
        $this->result[] = $tpl['comment-line'];
        $this->result[] = $tpl['movement-keys'][1];
        $this->result[] = sprintf($tpl['movement-keys'][2], $send_label);
        $this->result[] = $tpl['movement-keys'][3];

        $this->result[] = "[/movement-keys][mouse-keys]";

        $this->result[] = $tpl['comment-line'];
        $this->result[] = $tpl['mouse-mod-key'][0];
        $this->result[] = $tpl['comment-line'];
        $this->result[] = '[mouse-mod-key]' . $tpl['mouse-mod-key'][1];

        $this->result[] = "";

        $this->result[] = "[/mouse-mod-key]{$tpl['mouse-keys'][0]}";
        $this->result[] = sprintf($tpl['mouse-keys'][1], $send_label);
        $this->result[] = $tpl['mouse-keys'][2];

        $this->result[] = "[/mouse-keys][nomod-pause-hotkeys-key]";

        $this->result[] = $tpl['comment-line'];
        $this->result[] = $tpl['nomod-pause-hotkeys-key'][0];
        $this->result[] = $tpl['comment-line'];
        $this->result[] = $tpl['nomod-pause-hotkeys-key'][1];
        $this->result[] = $tpl['nomod-pause-hotkeys-key'][2];
        $this->result[] = $tpl['nomod-pause-hotkeys-key'][3];
        $this->result[] = $tpl['nomod-pause-hotkeys-key'][4];
        $this->result[] = $tpl['nomod-pause-hotkeys-key'][5] . '[/nomod-pause-hotkeys-key]';

    }
}
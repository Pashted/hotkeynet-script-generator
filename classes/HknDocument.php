<?php
/**
 * Created by PhpStorm.
 * User: Pashted
 * Date: 15.02.2018
 * Time: 22:32
 */

defined('_JEXEC') or die('Restricted access');

/**
 * Class Document
 */
class HknDocument
{
    public $head = [];


    public function setMetaData($name, $value)
    {
        $this->head[] = "<meta name='$name' content='$value'>";

        return $this;
    }

    public function addStyleSheet($file_path)
    {
        $this->head[] = "<link href='$file_path' rel='stylesheet' type='text/css'>";

        return $this;
    }

    public function addScript($file_path, $options = array(), $attribs = array())
    {
        if (!isset($attribs['type']))
            $attribs['type'] = "text/javascript";

        $id = isset($attribs['id']) ? "id='{$attribs['id']}'" : "";
        $async = isset($attribs['async']) ? "async" : "";

        $this->head[] = "<script src='$file_path' type='{$attribs['type']}' $id $async></script>";

        return $this;
    }

    public function addScriptDeclaration($content, $type = 'text/javascript')
    {
        $this->head[] = "<script type='$type'>$content</script>";

        return $this;
    }

}
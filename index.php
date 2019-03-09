<?php
/**
 * Created by PhpStorm.
 * User: Pashted
 * Date: 15.02.2018
 * Time: 21:17
 */

define('_GEN_VER', '2.0.0');
define('_GEN_DEBUG', 1);
define('_GEN_JOOMLA_INTEGRATION', preg_match('/slashfocus/', $_SERVER['HTTP_HOST']));
define('_GEN_URI_ROOT', _GEN_JOOMLA_INTEGRATION ? "/gen/" : "/");
define('_GEN_ROOT', __DIR__);
define('_JEXEC', 1);


require _GEN_ROOT . "/classes/HknController.php";

$gen = new HknController();

if (isset($_POST['script']) && $_POST['script'] === 'true') {
    require _GEN_ROOT . "/classes/$gen->scheme/Script.php";
    $script = new Script();
    $script->render();
} else {
    $gen->render();
}

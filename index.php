<?php
/**
 * Created by PhpStorm.
 * User: Pashted
 * Date: 15.02.2018
 * Time: 21:17
 */

define('_GEN_JOOMLA_INTEGRATION', false);
define('_GEN_VER', '2.0.0');
define('_GEN_ROOT', __DIR__);
define('_GEN_URI_ROOT', "/hkn-gen/");
define('_GEN_DEBUG', 1);

if (_GEN_JOOMLA_INTEGRATION) {

    if ($_SERVER['REQUEST_METHOD'] == 'POST')
        define('_JEXEC', 1);

} else {
    define('_JEXEC', 1);
}


require _GEN_ROOT . "/classes/HknController.php";

$gen = new HknController();

if (isset($_POST['script']) && $_POST['script'] === 'true') {
    require _GEN_ROOT . "/classes/$gen->scheme/Script.php";
    $script = new Script();
    $script->render();
} else {
    $gen->render();
}

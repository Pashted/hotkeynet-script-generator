<?php
/**
 * Created by PhpStorm.
 * User: Pashted
 * Date: 17.02.2018
 * Time: 13:31
 */

defined('_JEXEC') or die('Restricted access');

class Plural
{
    /**
     * Определение окончаний слов в паре с числительными
     *
     * @example 1 комментарий, 2 комментария, 5 комментариев
     * @param int $number
     * @return int
     */
    public static function _decline($number)
    {
        $cases = [2, 0, 1, 1, 1, 2];
        return ($number % 100 > 4 && $number % 100 < 20) ? 2 : $cases[min($number % 10, 5)];
    }
}
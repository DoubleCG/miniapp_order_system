<?php

namespace App\Logic;


class Random
{
    public static function number($length = 6)
    {
        $random = '';
        for ($i = 0; $i < $length; $i++) {
            $random = $random . random_int(0, 9);
        }
        return $random;
    }
}

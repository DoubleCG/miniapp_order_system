<?php

namespace App\Http\Controllers;

use App\Model\Address;
use App\Model\Food;
use App\Model\Menu;
use App\Model\Session;
use App\Model\Miniuser;
use Illuminate\Http\Request;
use Carbon\Carbon;

class MenuController extends Controller
{
    public function list()
    {
        $food = Food::all()->toArray();
        $menu = Menu::all()->toArray();
//        return $food;
        return response()->json([
            '0' => $food,
            '1' => $menu
        ]);
    }


    public function add()
    {

    }
}



<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Model\Menu;
use Illuminate\Http\Request;

class MenuAdminController extends Controller
{
    public function add(Request $request)
    {
        $test = true;
        $tag = $request->input('tag');
        $name = $request->input('name');

        Menu::create([
            'tag' => $tag,
            'name' => $name
        ]);
        return response()->json([
            'success' => 'add succeed'
        ]);
    }

    public function list()
    {
        return Menu::all();
    }

    public function delete(Request $request)
    {
        $id = $request->input('id');
               
        Menu::where('id', '=', $id)->delete();

        return response()->json([
            'success' => 'delete succeed'
        ]);
    }

    public function update(Request $request)
    {
        $id = $request->input('id');
        $tag = $request->input('tag');
        $name = $request->input('name');


        if (!empty($tag)) {
            Menu::where('id', '=', $id)->update([
                'tag' => $tag,
            ]);
        }

        if (!empty($name)) {
            Menu::where('id', '=', $id)->update([
                'name' => $name,
            ]);
        }

        return response()->json([
            'success' => 'update succeed'
        ]);
    }

}



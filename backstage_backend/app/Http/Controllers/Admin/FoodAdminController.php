<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Model\Food;
use Carbon\Carbon;
use Illuminate\Http\Request;

class FoodAdminController extends Controller
{
    public function add(Request $request)
    {
        $type = $request->input('type');
        $name = $request->input('name');
        $description = $request->input('description');
        $price = $request->input('price');
        $path = basename($request->file('photo')->store('public'));
        $created_at = Carbon::now()->toDateTimeString();


        Food::create([
            'type' => $type,
            'name' => $name,
            'description' => $description,
            'price' => $price,
            'pic' => $path,
            'created_at' => $created_at
        ]);


        return response()->json([
            'success' => 'add succeed'
        ]);


    }

    public function list(Request $request)
    {
        $keyword = $request->input('keyword');
        $type = $request->input('type');
        $time = $request->input('time');
        $price_st = $request->input('price_st');
        $price_en = $request->input('price_en');
        $price_or = $request->input('price_or');
        $sale = $request->input('sale');
        $comment = $request->input('comment');


        if (!empty($keyword)) {
            return Food::where('name', 'like', '%' . $keyword . '%')->OrderBy('id', 'desc')->get();
        }

        if (!empty($type)) {
            return Food::where('type', '=', $type)->OrderBy('id', 'desc')->get();
        }

        if ($time == 1) {
            return Food::OrderBy('created_at', 'desc')->get();
        }

        if (!empty($price_or)) {
            if ($price_or == 1) {
                $result = Food::OrderBy('price', 'desc');
            } elseif ($price_or == 0) {
                $result = Food::OrderBy('price', 'asc');
            }

            if (!empty($price_st)) {
                $result = $result->where('price', '>=', $price_st);
            }


            if (!empty($price_en)) {
                $result = $result->where('price', '<=', $price_en);
            }

            return $result->get();
        }


        if (!empty($sale)) {
            return Food::OrderBy('sales', 'desc')->get();
        }


        if (!empty($comment)) {
            return Food::OrderBy('judge_times', 'desc')->get();
        }


        if (empty($request->all())) {
            return Food::all();
        }


    }


    public function delete(Request $request)
    {
        $id = $request->input('id');
        Food::where('id', '=', $id)->delete();

        return response()->json([
            'success' => 'delete succeed'
        ]);
    }


    public function update(Request $request)
    {
        $id = $request->input('id');
        $type = $request->input('type');
        $name = $request->input('name');
        $description = $request->input('description');
        $price = $request->input('price');
        $path = basename($request->file('photo')->store('public'));


        if (!empty($tag)) {
            Food::where('id', '=', $id)->update([
                'type' => $type,
            ]);
        }

        if (!empty($name)) {
            Food::where('id', '=', $id)->update([
                'name' => $name,
            ]);
        }
        if (!empty($description)) {
            Food::where('id', '=', $id)->update([
                'description' => $description,
            ]);
        }
        if (!empty($price)) {
            Food::where('id', '=', $id)->update([
                'price' => $price,
            ]);
        }
        if (!empty($path)) {
            Food::where('id', '=', $id)->update([
                'path' => $path,
            ]);
        }

        return response()->json([
            'success' => 'update succeed'
        ]);
    }

}






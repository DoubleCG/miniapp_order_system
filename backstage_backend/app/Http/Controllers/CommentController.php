<?php

namespace App\Http\Controllers;

use App\Model\Address;
use App\Model\Comment;
use App\Model\Food;
use App\Model\Order;
use App\Model\Session;
use App\Model\Miniuser;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CommentController extends Controller
{

    public function create(Request $request)
    {
        $level = $request->input('level');
        $content = $request->input('content');
        $orderid = $request->input('orderid');
        $order = Order::where('id', '=', $orderid)->select('openid', 'food', 'price', 'address')->first();
        $food = json_decode($order['food'], true);
        Order::where('id', '=', $orderid)->update([
            'comment' => $level
        ]);

        for ($i = 0; $i < count($food); $i++) {
            $item = Food::where('id', '=', $food[$i]['foodid'])->select('level', 'judge_times')->first();
            Food::where('id', '=', $food[$i]['foodid'])->update([
                'level' => $item['level'] + $level,
                'judge_times' => $item['judge_times'] + 1
            ]);
        }


        if (!empty($content)) {
            Comment::create([
                'id' => $orderid,
                'content' => $content,
                'created_at' => Carbon::now()->toDateTimeString()
            ]);
        }


        return response()->json([
            'success' => 'comment created'
        ]);


    }


}



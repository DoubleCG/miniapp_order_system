<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Model\Comment;
use App\Model\Food;
use App\Model\Order;
use App\Model\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CommentAdminController extends Controller
{

    public function list(Request $request)
    {
        $limit = $request->input('limit');
        $skip = $request->input('skip');
        $result = Comment::OrderBy('created_at', 'desc');
        if (!empty($limit)) {
            $result = $result->limit($limit);
        }


        if (!empty($skip)) {
            $result = $result->skip($skip);

        }

        return $result->get();
    }

    public function reply(Request $request)
    {
        $id = $request->input('id');
        $comment = Comment::where('id', '=', $id)->select('reply', 'content')->first();
//        return $comment['reply'];
        if (!$comment['reply']) {

            $reply = $request->input('reply');
            if (!empty($reply)) {

                $templateid = '1nFaBVsT3reV0gplMMeR0C_SXOPqDN3y6oN4Q8IjjzI';
                $payment = Payment::where('id', '=', $id)->select('prepay_id')->first();
                $order = Order::where('id', '=', $id)->select('openid')->first();

                $prepay_id = $payment['prepay_id'];
                $openid = $order['openid'];
                $app2 = app('wechat.mini_program');

                $app2->template_message->send([
                    'touser' => $openid,
                    'template_id' => $templateid,
                    'page' => '',
                    'form_id' => $prepay_id,
                    'data' => [
                        'keyword1' => $comment['content'],
                        'keyword2' => $reply,
                        // ...
                    ],
                ]);


                Comment::where('id', '=', $id)->update([

                    'reply' => $reply
                ]);

                return response()->json([
                    'success' => 'reply created succeed'

                ]);


            } else {
                return response()->json([
                    'error' => 'empty reply, check the parameter'
                ]);
            }
        } else {
            return response()->json([
                'error' => 'comment has been replied'
            ]);
        }


    }


}






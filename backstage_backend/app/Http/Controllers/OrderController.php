<?php

namespace App\Http\Controllers;

use App\Logic\Random;
use App\Model\Coupon;
use App\Model\Food;
use App\Model\Order;
use App\Model\Payment;
use App\Model\Session;
use App\Model\Miniuser;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function create(Request $request)
    {
        $third_session = $request->input('third_session');
        $openid = Session::where('third_session', '=', $third_session)
            ->select('openid')->first();
        $openid = $openid['openid'];
        $name = $request->input('name');
        $address = $request->input('address');
        $orderid = '001' . (microtime(true) * 10000) . Random::number();
        $food = $request->input('food');
        $phone = $request->input('phone');

        $arrayFood = json_decode($food, true);
        $price = 0;

        for ($i = 0; $i < count($arrayFood); $i++) {
            $item = Food::where('id', '=', $arrayFood[$i]['foodid'])->select('price')->first();
            $item = $item['price'];
            $price = $price + $item * $arrayFood[$i]['number'];
        }

        $theCoupon = $request->input('couponid');
        if (!empty($theCoupon)) {
            $user = Miniuser::where('openid', '=', $openid)->select('coupons')->first();
            $coupons = json_decode($user['coupons'], true);
            for ($i = 0; $i < count($coupons); $i++) {
                if ($theCoupon == $coupons[$i]['id']) {
                    Miniuser::where('openid', '=', $openid)
                        ->update([
                            'coupons' => json_encode(array_splice($coupons, $i, 1))
                        ]);

                    $result = Coupon::where('id', '=', $theCoupon)->select('money')->first();
                    $minus = $result['money'];
                    $price = $price - $minus;
                }
            }
        }


        $result = Order::create([
            'id' => $orderid,
            'openid' => $openid,
            'name' => $name,
            'address' => $address,
            'food' => $food,
            'price' => $price,
            'phone' => $phone,
            'created_at' => Carbon::now()->toDateTimeString()
        ]);

        $body = '五宫格-外卖';

        $app = app('wechat.payment');

        $timeStamp = time();

        $result = $app->order->unify([
            'body' => $body,
            'out_trade_no' => $orderid,
            'total_fee' => $price,
            'spbill_create_ip' => '', // 可选，如不传该参数，SDK 将会自动获取相应 IP 地址
            'notify_url' => 'https://mini.wggai.com/api/order/notice', // 支付结果通知网址，如果不设置则会使用配置里的默认地址
            'trade_type' => 'JSAPI',
            'openid' => $openid,
        ]);

        if ($result['return_code'] == 'SUCCESS' && $result['return_msg'] == 'OK' && $result['result_code'] == 'SUCCESS') {

            $appId = env('WECHAT_PAYMENT_APPID', '');
            $nonceStr = $result['nonce_str'];
            $package = 'prepay_id=' . $result['prepay_id'];
            $signType = 'MD5';
            $key = env('WECHAT_PAYMENT_KEY', 'key-for-signature');

            $string = 'appId=' . $appId . '&nonceStr=' . $nonceStr . '&package=' . $package . '&signType=' . $signType . '&timeStamp=' . $timeStamp . '&key=' . $key;

            $string = strtoupper(md5($string));
            Payment::create([
                'id' => $orderid,
                'timeStamp' => $timeStamp,
                'nonceStr' => $nonceStr,
                'sign' => $string,
                'prepay_id' => $result['prepay_id'],
                'status' => 0,
                'expired_date' => Carbon::createFromTimestamp($timeStamp)->addHours(2)->toDateTimeString()
            ]);

            return response()->json([
                'timeStamp' => $timeStamp,
                'nonce_str' => $nonceStr,
                'sign' => $string,
                'prepay_id' => $result['prepay_id'],
                'trade_type' => $result['trade_type'],
            ]);
        } else {
            Log::info('result : ' . $result['return_code']);
            Log::info('result : ' . $result['return_msg']);
            Log::info('result : ' . $result['result_code']);


            return response()->json([
                'error' => 'order create fail, please contact backend',
            ]);
        }
    }

    public function list(Request $request)
    {
        $third_session = $request->input('third_session');
        $openid = Session::where('third_session', '=', $third_session)
            ->select('openid')->first();
        $openid = $openid['openid'];
        $time = $request->input('time');
        $method = $request->input('method');

//        $openid = 'o3fhF4_gqg-DSwPWace_OanijqDQ';
        $result = Order::where('openid', '=', $openid)
            ->join('payments', 'payments.id', '=', 'orders.id')
            ->take(5)
            ->select('orders.id', 'orders.name', 'orders.address', 'orders.food', 'orders.price', 'orders.phone', 'orders.comment', 'payments.created_at', 'payments.updated_at', 'payments.expired_date', 'payments.status');

        if (empty($time)) {
            return $result->orderBy('payments.created_at', 'desc')->get();
        } else {
            if (empty($method) || $method == 'down') {
                $result = $result->orderBy('payments.created_at', 'desc')->where('payments.created_at', '<', $time);
                return $result->get();
            } else if ($method == 'up') {
                $result = $result->orderBy('payments.created_at', 'asc')->where('payments.created_at', '>', $time);
                return $result->get();
            }
        }
    }

    public function notice()
    {

        $app = app('wechat.payment');

        $response = $app->handlePaidNotify(function ($message, $fail) {
            // 使用通知里的 "微信支付订单号" 或者 "商户订单号" 去自己的数据库找到订单

            $order = Order::where('orders.id', '=', $message['out_trade_no'])
                ->join('payments', 'payments.id', '=', 'orders.id')
                ->select('orders.id', 'payments.status')
                ->first();

            if (empty($order) || $order['status'] == '1') { // 如果订单不存在 或者 订单已经支付过了
                return true; // 告诉微信，我已经处理完了，订单没找到，别再通知我了
            }


            ///////////// <- 建议在这里调用微信的【订单查询】接口查一下该笔订单的情况，确认是已经支付 /////////////

            if ($message['return_code'] === 'SUCCESS') { // return_code 表示通信状态，不代表支付状态
                // 用户是否支付成功
                if (array_get($message, 'result_code') === 'SUCCESS') {


                    $app = app('wechat.payment');
                    $result = $app->order->queryByOutTradeNumber($message['out_trade_no']);
                    if ($result['trade_state'] == 'SUCCESS') {

                        $templateid = 'IEQmVrGIhWsbFz_TISjtzSku24FHjGO4cCJAXH7nTl8';
                        $payment = Payment::where('id', '=', $message['out_trade_no'])->select('prepay_id')->first();
                        $order = Order::where('id', '=', $message['out_trade_no'])->select('openid', 'food', 'price', 'address')->first();
                        $openid = $order['openid'];
                        $price = $order['price'] / 100;
                        $address = $order['address'];
                        $food = json_decode($order['food'], true);
                        $foodResult = '';
                        for ($i = 0; $i < count($food); $i++) {
                            $tmp = $food[$i]['foodid'];
                            Food::where('id', '=', $tmp)->increment('sales');
                            $item = Food::where('id', '=', $tmp)->select('name')->first();
                            $item = $item['name'];
                            $foodResult = $foodResult . $item . '*' . $food[$i]['number'] . ' ';
                        }

                        $prepay_id = $payment['prepay_id'];
                        $app2 = app('wechat.mini_program');

                        $app2->template_message->send([
                            'touser' => $openid,
                            'template_id' => $templateid,
                            'page' => '',
                            'form_id' => $prepay_id,
                            'data' => [
                                'keyword1' => $message['out_trade_no'],
                                'keyword2' => $foodResult,
                                'keyword3' => $price,
                                'keyword4' => $address
                                // ...
                            ],
                        ]);

                        Payment::where('id', '=', $message['out_trade_no'])
                            ->update(['status' => 1]);
                    }

                    // 用户支付失败
                } elseif (array_get($message, 'result_code') === 'FAIL') {
                    Payment::where('id', '=', $message['out_trade_no'])
                        ->update(['status' => 2]);
                }
            } else {
                return $fail('通信失败，请稍后再通知我');
            }

            return true; // 返回处理完成
        });

        $response->send(); // return $response;
    }
}



<?php

namespace App\Http\Controllers;

use App\Model\Address;
use App\Model\Order;
use App\Model\Payment;
use App\Model\Session;
use App\Model\Miniuser;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function check(Request $request)
    {
        $third_session = $request->input('third_session');
        $openid = Session::where('third_session', '=', $third_session)->select('openid')->first();
        $openid = $openid['openid'];
        $orderid = $request->input('orderid');


        $result = Payment::where('payments.id', '=', $orderid)
            ->join('orders', 'orders.id', '=', 'payments.id')
            ->select('payments.status', 'orders.openid', 'payments.expired_date')->first();

        $expired_date = Carbon::parse($result['expired_date']);
        if (Carbon::now()->gte($expired_date)) {

            $result = Payment::where('id', '=', $orderid)
                ->update(['status' => 2]);

            return response()->json([
                'status' => 2
            ]);
        }


        if ($result['openid'] !== $openid) {
            return response()->json([
                'error' => 'unauthorized third_session, please login again or check the parameter',
            ]);
        }


        if ($result['status'] == 1) {
            return response()->json([
                'status' => 1
            ]);
        } else {
            $app = app('wechat.payment');
            $result = $app->order->queryByOutTradeNumber($orderid);
            if ($result['trade_state'] == 'SUCCESS') {
                $result = Payment::where('id', '=', $orderid)
                    ->update(['status' => 1]);


                return response()->json([
                    'status' => 1
                ]);

            } elseif ($result['trade_state'] == 'NOTPAY') {
                return response()->json([
                    'status' => 0
                ]);
            }
        }
    }

    public function pay(Request $request)
    {
        $third_session = $request->input('third_session');
        $openid = Session::where('third_session', '=', $third_session)->select('openid')->first();
        $openid = $openid['openid'];
        $orderid = $request->input('orderid');


        $result = Payment::where('payments.id', '=', $orderid)
            ->join('orders', 'orders.id', '=', 'payments.id')
            ->select('payments.status', 'orders.openid', 'payments.expired_date',
                'payments.timeStamp', 'payments.nonceStr', 'payments.sign',
                'payments.prepay_id'
            )->first();
        $expired_date = Carbon::parse($result['expired_date']);

        if ($result['openid'] !== $openid) {
            return response()->json([
                'error' => 'unauthorized third_session, please login again or check the parameter',
            ]);
        }


        if ($result['status'] == 1) {
            return response()->json([
                'status' => 1
            ]);
        } else {

            if (Carbon::now()->gte($expired_date)) {

                $result = Payment::where('id', '=', $orderid)
                    ->update(['status' => 2]);

                return response()->json([
                    'status' => 2
                ]);
            } else {

                return response()->json([
                    'timeStamp' => $result['timeStamp'],
                    'nonce_str' => $result['nonceStr'],
                    'sign' => $result['sign'],
                    'prepay_id' => $result['prepay_id']
                ]);
            }


        }
    }


    public function refund(Request $request)
    {
        $app = app('wechat.payment');
        $number = $request->input('orderid');

        $result = $app->order->queryByOutTradeNumber($number);
//        dd($result);
        if ($result['trade_state'] != 'SUCCESS') {
            return response()->json([
                'error' => 'order has not been paid',
            ]);
        }
        $refundNumber = $number;

        $refundFee = $request->input('refundFee');
        if (empty($refundFee)) {
            $refundFee = $result['total_fee'];
        }

        $result = $app->refund->byOutTradeNumber($number, $refundNumber, $result['total_fee'], $refundFee, [
            'refund_desc' => '测试退款',
        ]);


//        array:18 [
//        "return_code" => "SUCCESS"
//          "return_msg" => "OK"
//          "appid" => "wxa93b223ee6a00589"
//          "mch_id" => "1341926801"
//          "nonce_str" => "tNeC3rSJk8e2cp85"
//          "sign" => "6FA40AB0111EB02B1CD5A9C128835A7D"
//          "result_code" => "SUCCESS"
//          "transaction_id" => "4200000073201803106299434327"
//          "out_trade_no" => "0011520678264652831929"
//          "out_refund_no" => "0011520678264652831929"
//          "refund_id" => "50000705842018031103822063923"
//          "refund_channel" => null
//          "refund_fee" => "1"
//          "coupon_refund_fee" => "0"
//          "total_fee" => "1"
//          "cash_fee" => "1"
//          "coupon_refund_count" => "0"
//          "cash_refund_fee" => "1"
//        ]

        if ($result['return_code'] == 'SUCCESS' && $result['return_msg'] == 'OK' && $result['result_code'] == 'SUCCESS') {
            Payment::where('id', '=', $number)
                ->update(['status' => 3]);

            return response()->json([
                'status' => 3
            ]);
        } else {
            return response()->json([
                'error' => 'refund fail, please contact backend',
            ]);
        }
    }


}



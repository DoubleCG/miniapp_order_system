<?php

namespace App\Http\Controllers;

use App\Model\Session;
use App\Model\Miniuser;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Logic\wxBizDataCrypt;

class MiniPayController extends Controller
{
    public function minipay(Request $request)
    {
        $app = app('wechat.payment');



        $result = $app->order->unify([
            'body' => '腾讯充值中心-QQ会员充值',
            'out_trade_no' => '20150806125346',
            'total_fee' => 88,
            'spbill_create_ip' => '', // 可选，如不传该参数，SDK 将会自动获取相应 IP 地址
            'notify_url' => 'https://pay.weixin.qq.com/wxpay/pay.action', // 支付结果通知网址，如果不设置则会使用配置里的默认地址
            'trade_type' => 'JSAPI',
            'openid' => 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6o',
        ]);

        dd($result);

// $result:
//{
//  "xml": {
//    "return_code": "SUCCESS",
//    "return_msg": "OK",
//    "appid": "wx2421b1c4390ec4sb",
//    "mch_id": "10000100",
//    "nonce_str": "IITRi8Iabbblz1J",
//    "openid": "oUpF8uMuAJO_M2pxb1Q9zNjWeSs6o",
//    "sign": "7921E432F65EB8ED0CE9755F0E86D72F2",
//    "result_code": "SUCCESS",
//    "prepay_id": "wx201411102639507cbf6ffd8b0779950874",
//    "trade_type": "JSAPI"
//  }
//}


        dd($app);

    }
}



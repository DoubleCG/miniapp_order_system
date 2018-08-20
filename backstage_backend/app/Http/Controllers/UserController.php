<?php

namespace App\Http\Controllers;

use App\Model\Coupon;
use App\Model\Miniuser;
use App\Model\Session;
use Illuminate\Http\Request;
use Carbon\Carbon;

class UserController extends Controller
{
    public function login(Request $request)
    {
        $code = $request->input('code');

        $app = app('wechat.mini_program');

        $result = $app->auth->session($code);
        if (array_key_exists('errcode', $result) && $result['errcode'] == '40163') {
            return response()->json([
                'error' => 'code has been used, please get a new one',
            ], 202);
        }

        $openid = $result['openid'];
        $session_key = $result['session_key'];
        $third_session = encrypt($openid);
        $expired_date_new = Carbon::now()->addDays(7)->toDateTimeString();
        $return = Session::firstOrCreate(
            ['openid' => $openid],
            [
                'session_key' => $session_key,
                'third_session' => $third_session,
                'expired_date' => $expired_date_new
            ]
        );

        if ($return->wasRecentlyCreated) {
            return response()->json([
                'third_session' => $third_session,
                'expired_date' => $expired_date_new
            ], 200);
        } else {
            $origin = $return[0];
            $expired_date = Carbon::parse($origin['expired_date']);
            if (Carbon::now()->lt($expired_date)) {
                return response()->json([
                    'third_session' => $origin['third_session'],
                    'expired_date' => $origin['expired_date']
                ], 200);
            } else {
                Session::where('openid', '=', $openid)
                    ->update([
                        'session_key' => $session_key,
                        'third_session' => $third_session,
                        'expired_date' => $expired_date_new
                    ]);
                return response()->json([
                    'third_session' => $third_session,
                    'expired_date' => $expired_date_new
                ], 200);
            }
        }
    }


    public function get(Request $request)
    {
        $encryptedData = $request->input('encryptedData');
        $iv = $request->input('iv');
        $third_session = $request->input('third_session');
        $result = Session::where('third_session', '=', $third_session)->select('session_key', 'openid')->get();

        $session_key = $result[0]['session_key'];
        $openid = $result[0]['openid'];

        $appid = env('WECHAT_MINI_PROGRAM_APPID', '');
        $pc = new wxBizDataCrypt($appid, $session_key);
        $errCode = $pc->decryptData($encryptedData, $iv, $data);
        if ($errCode == 0) {
            $data = json_decode($data);
            $phone = $data->purePhoneNumber;
            $countryCode = $data->countryCode;

            Miniuser::updateOrCreate(
                ['openid' => $openid],
                [
                    'phone' => $phone,
                    'countryCode' => $countryCode
                ]
            );

            return response()->json([
                'success' => 'get phoneNum successfully',
            ], 202);
        } else {
            Log::info('decrypt data error, errorcode: ' . $errCode);
            return response()->json([
                'error' => 'decrypt user phone fail, please contact backend',
            ], 202);
        }
    }


    public function check(Request $request)
    {
        $third_session = $request->input('third_session');
        $result = Session::where('third_session', '=', $third_session)->select('openid')->first();
        $user = Miniuser::where('openid', '=', $result['openid'])->select('created_at', 'score', 'coupons', 'phone')->first()->toArray();

        $phone = $user['phone'];
        $first = substr($phone, 0, 3);
        $second = "******";
        $third = substr($phone, 9);
        $user['phone'] = $first . $second . $third;

        $coupons = json_decode($user['coupons'], true);
        for ($i = 0; $i < count($coupons); $i++) {
            $coupons_tmp = Coupon::where('id', '=', $coupons[$i]['id'])->first();
            $coupons[$i]['name'] = $coupons_tmp['name'];
            $coupons[$i]['pic'] = $coupons_tmp['pic'];
            $coupons[$i]['all'] = $coupons_tmp['all'];
            $coupons[$i]['types'] = $coupons_tmp['types'];
            $coupons[$i]['dishs'] = $coupons_tmp['dishs'];
            $coupons[$i]['money'] = $coupons_tmp['money'];
        }
        $user['coupons'] = $coupons;
        return $user;

    }


}



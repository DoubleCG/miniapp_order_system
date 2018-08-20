<?php

namespace App\Http\Controllers;

use App\Model\Session;
use App\Model\Miniuser;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Logic\wxBizDataCrypt;
use Illuminate\Support\Facades\Log;

class PhoneController extends Controller
{
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

            return Miniuser::where('openid', '=', $openid)->select('score', 'coupons')->first();
        } else {
            Log::info('decrypt data error, errorcode: ' . $errCode);
            Log::info('third_session: ' . $third_session);
            Log::info('encryptedData: ' . $encryptedData);
            Log::info('iv: ' . $iv);

            return response()->json([
                'error' => 'decrypt fail, please contact backend',
            ], 202);
        }
    }


    public function check(Request $request)
    {
        $third_session = $request->input('third_session');
        $session = Session::where('third_session', '=', $third_session)
            ->join('users', 'users.openid', '=', 'sessions.openid')
            ->select('users.openid')
            ->first();
        if (empty($session)) {
            return response()->json([
                'success' => 'No phone yet',
            ]);
        } else {
            $result = Session::where('third_session', '=', $third_session)->select('session_key', 'openid')->get();
            $openid = $result[0]['openid'];

            return Miniuser::where('openid', '=', $openid)->select('score', 'coupons')->first();
        }
    }
}



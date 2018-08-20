<?php

namespace App\Http\Middleware;

use App\Model\Session;
use Closure;
use Carbon\Carbon;

class CheckThirdSession
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {


        $third_session = $request->input('third_session');

        if (empty($third_session)) {
            return response()->json([
                'error' => 'No third_session, please check the parameter',
            ]);


//            return response()->json([
//
//                'error' => $request->all()
//            ]);
        }
        $expired_date = Session::where('third_session', '=', $third_session)->select('expired_date')->first();
        if (empty($expired_date)) {
            return response()->json([
                'error' => 'illegal third_session, please check the parameter or login again',
            ]);
        }
        $expired_date = Carbon::parse($expired_date['expired_date']);
        if (Carbon::now()->gt($expired_date)) {
            return response()->json([
                'error' => 'third_session has been expried, please login again',
            ]);
        }

        return $next($request);
    }
}

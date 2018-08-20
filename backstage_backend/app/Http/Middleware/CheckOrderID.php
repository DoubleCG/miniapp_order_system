<?php

namespace App\Http\Middleware;

use App\Model\Payment;
use App\Model\Session;
use Closure;
use Carbon\Carbon;

class CheckOrderID
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
        $orderid = $request->input('orderid');
        if (empty($orderid)) {
            return response()->json([
                'error' => 'No orderid, please check the parameter',
            ]);
        }

        $result = Payment::where('id', '=', $orderid)
            ->select('status')->first();
        if (empty($result)) {
            return response()->json([
                'error' => 'illegal orderid, please check the parameter',
            ]);
        }

        return $next($request);
    }
}

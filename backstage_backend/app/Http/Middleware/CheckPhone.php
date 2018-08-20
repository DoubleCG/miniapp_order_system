<?php

namespace App\Http\Middleware;

use App\Model\Session;
use Closure;
use Carbon\Carbon;

class CheckPhone
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
        $third_session = $request->input('phone');
        if (empty($third_session)) {
            return response()->json([
                'error' => 'No phone, please check the parameter',
            ]);
        }

        return $next($request);
    }
}

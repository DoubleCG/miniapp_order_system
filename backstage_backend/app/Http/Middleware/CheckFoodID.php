<?php

namespace App\Http\Middleware;

use App\Model\Food;
use Closure;

class CheckFoodID
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

        $foodID = $request->input('id');

        if (empty($foodID)) {
            return response()->json([
                'error' => 'empty foodID, please check the parameter'
            ]);
        }


        $result = Food::where('id', '=', $foodID)->select('id')->first();

        if (empty($result)) {
            return response()->json([
                'error' => 'invalid foodID, please check the parameter',
                'parameter' => $foodID
            ]);
        }

        return $next($request);
    }
}

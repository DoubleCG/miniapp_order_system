<?php

namespace App\Http\Middleware;

use App\Model\Menu;
use Closure;

class CheckMenuID
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

        $menuID = $request->input('id');

        if (empty($menuID)) {
            return response()->json([
                'error' => 'empty foodID, please check the parameter'
            ]);
        }


        $result = Menu::where('id', '=', $menuID)->select('id')->first();

        if (empty($result)) {
            return response()->json([
                'error' => 'invalid foodID, please check the parameter',
                'parameter' => $menuID
            ]);
        }

        return $next($request);
    }
}

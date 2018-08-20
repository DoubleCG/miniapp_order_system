<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});


Route::prefix('user')->group(function () {
    Route::get('login', 'UserController@login');
    Route::post('check', 'UserController@check');
    Route::group(['middleware' => ['checkthirdsession']], function () {


        Route::get('profile', 'UserController@profile');

        Route::prefix('phone')->group(function () {
            Route::post('get', 'PhoneController@get');
            Route::post('check', 'PhoneController@check');
        });

//        Route::prefix('address')->group(function () {
//            Route::post('save', 'AddressController@save');
//            Route::post('get', 'AddressController@get');
//        });
    });

});


Route::prefix('order')->group(function () {

    Route::group(['middleware' => ['checkthirdsession']], function () {
        Route::post('list', 'OrderController@list');
        Route::post('create', 'OrderController@create');
    });
    Route::post('notice', 'OrderController@notice');
});

Route::prefix('comment')->group(function () {
    Route::group(['middleware' => ['checkthirdsession']], function () {
        Route::post('create', 'CommentController@create');
    });
});


Route::prefix('payment')->group(function () {
    Route::group(['middleware' => ['checkthirdsession', 'checkorderid']], function () {
        Route::post('check', 'PaymentController@check');
        Route::post('pay', 'PaymentController@pay');
    });
    Route::post('notice', 'OrderController@notice');

    Route::post('refund', 'PaymentController@refund');

    Route::group(['middleware' => ['checkorderid']], function () {
    });

});


Route::prefix('menu')->group(function () {
    Route::get('list', 'MenuController@list');

});

Route::prefix('comment')->group(function () {

    Route::group(['middleware' => ['checkorderid']], function () {
        Route::post('create', 'CommentController@create');

    });


});


Route::post('test', function (Request $request) {

    $path = $request->file('photo')->store('public');
    dd($path);
});


Route::post('register', 'Auth\RegisterController@register');
Route::post('login', 'Auth\LoginController@login');
Route::post('logout', 'Auth\LoginController@logout');
Route::post('token/refresh', 'Auth\LoginController@refresh');


Route::middleware(['auth:api'])->group(function () {
    Route::prefix('admin')->group(function () {
        Route::prefix('menu')->group(function () {
            Route::post('add', 'Admin\MenuAdminController@add');
            Route::get('list', 'Admin\MenuAdminController@list');
            Route::middleware(['checkmenuid'])->group(function () {
                Route::post('delete', 'Admin\MenuAdminController@delete');
                Route::post('update', 'Admin\MenuAdminController@update');
            });
        });

        Route::prefix('food')->group(function () {
            Route::post('add', 'Admin\FoodAdminController@add');
            Route::get('list', 'Admin\FoodAdminController@list');
            Route::middleware(['checkfoodid'])->group(function () {
                Route::post('delete', 'Admin\FoodAdminController@delete');
                Route::post('update', 'Admin\FoodAdminController@update');
            });
        });


        Route::prefix('comment')->group(function () {
            Route::get('list', 'Admin\CommentAdminController@list');
            Route::post('reply', 'Admin\CommentAdminController@reply');

        });


    });
});

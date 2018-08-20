<?php

namespace App\Http\Proxy;


class TokenProxy
{
    protected $http;


    public function __construct(\GuzzleHttp\Client $http)
    {
        $this->http = $http;
    }


    public function login($email, $password)
    {

        if (auth()->attempt([
            'email' => $email,
            'password' => $password
        ])) {
            return $this->proxy('password', [
                'username' => $email,
                'password' => $password,
                'scpoe' => ''
            ]);
        } else {
            return response()->json([
                'error' => 'wrong email or password'
            ]);
        }
    }


    public function logout()
    {
        $user = auth()->guard('api')->user();
        if (is_null($user)) {
            app('cookie')->queue(app('cookie')->forget('refreshToken'));
            return response()->json([
                'success' => 'logout'
            ]);
        }
        $accessToken = $user->token();

        app('db')->table('oauth_refresh_tokens')
            ->where('access_token_id', '=', $accessToken->id)
            ->update([
                'revoked' => true
            ]);

        app('cookie')->queue(app('cookie')->forget('refreshToken'));

        $accessToken->revoke();

        return response()->json([
            'success' => 'logout'
        ]);

    }


    public function proxy($grantType, array $data = [])
    {


        $data = array_merge($data, [
            'client_id' => env('PASSPORT_CLIENT_ID'),
            'client_secret' => env('PASSPORT_CLIENT_SECRET'),
            'grant_type' => $grantType,
        ]);


        $response = $this->http->post('https://mini.wggai.com/oauth/token', [
            'form_params' => $data
        ]);


        $token = json_decode((string)$response->getBody(), true);

        return response()->json([
            'token' => $token['access_token'],
            'expires_in' => $token['expires_in']
        ])->cookie('refreshToken', $token['refresh_token'], 43200, null, null, false, true);

    }


    public function refresh()
    {
        $refreshToken = request()->cookie('refreshToken');


        return $this->proxy('refresh_token', [
            'refresh_token' => $refreshToken
        ]);
    }

}
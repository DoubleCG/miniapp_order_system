<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    //
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['openid', 'session_key', 'third_session', 'expired_date'];

}

<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Miniuser extends Model
{
    //

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['openid', 'phone', 'countryCode', 'created_at', 'updated_at'];

}

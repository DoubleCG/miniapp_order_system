<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    //


    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['id', 'openid', 'name', 'address', 'food', 'price', 'phone', 'created_at'];

}

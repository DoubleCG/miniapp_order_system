<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    //


    public $incrementing = false;

    protected $fillable = ['id', 'timeStamp', 'nonceStr', 'sign', 'prepay_id', 'status', 'created_at', 'updated_at', 'expired_date'];

}

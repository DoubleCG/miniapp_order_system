<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    //

    public $incrementing = false;
    public $timestamps = false;


    protected $fillable = ['id', 'name', 'pic', 'all', 'types', 'dishs'];

}

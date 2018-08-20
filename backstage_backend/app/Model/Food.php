<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Food extends Model
{
    //

    public $timestamps = false;

    protected $fillable = ['id', 'type', 'name', 'description', 'price', 'pic',

        'sales', 'level', 'judge_times', 'created_at'

    ];

}

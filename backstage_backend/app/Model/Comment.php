<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    //
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = ['id', 'content', 'created_at'];

}

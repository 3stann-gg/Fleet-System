<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [
        'plate_number',
        'vehicle_type',
        'brand',
        'model',
        'year_model',
        'capacity',
        'fuel_type',
        'status',
    ];
}

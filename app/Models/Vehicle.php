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
        'purchase_date',
        'insurance_expiry',
        'capacity',
        'fuel_type',
        'status',
        'notes',
        //'last_service',
    ];
    
     public function drivers()
    {
        return $this->hasMany(Driver::class, 'assigned_vehicle_id');
    }
}

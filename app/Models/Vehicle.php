<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Reservation;
use App\Models\Maintenance;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function maintenances(): HasMany
    {
        return $this->hasMany(Maintenance::class);
    }
}

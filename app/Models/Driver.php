<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'license_number',
        'license_class',
        'license_expiry',
        'contact_number',
        'email',
        'experience',
        'address',
        'emergency_contact',
        'notes',
        'photo',
        'assigned_vehicle_id',
        'status',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'assigned_vehicle_id');
    }
}

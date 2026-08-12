<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Dispatch;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_number',
        'patient_name',
        'request_type',
        'vehicle_id',
        'driver_id',
        'pickup_location',
        'destination',
        'schedule_date',
        'schedule_time',
        'priority',
        'status',
        'contact_number',
        'notes',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function dispatch()
    {
        return $this->hasOne(Dispatch::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Maintenance extends Model
{
    use HasFactory;

    protected $fillable = [
        'maintenance_number',
        'vehicle_id',
        'maintenance_type',
        'description',
        'maintenance_date',
        'completion_date',
        'next_schedule',
        'technician',
        'priority',
        'odometer',
        'parts_used',
        'cost',
        'status',
        'notes',
    ];

    protected $casts = [
        'maintenance_date' => 'date',
        'completion_date' => 'date',
        'next_schedule' => 'date',
        'cost' => 'decimal:2',
        'odometer' => 'integer',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
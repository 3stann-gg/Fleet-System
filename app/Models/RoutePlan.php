<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoutePlan extends Model
{
    protected $fillable = [
        'route_number',
        'reservation_id',
        'origin',
        'destination',
        'priority',
        'department',
        'status',
        'departure_date',
        'departure_time',
        'estimated_distance',
        'estimated_time',
        'optimization_strategy',
        'optimization_score',
        'purpose',
        'notes',
    ];

    protected $casts = [
        'departure_date' => 'date',
        'estimated_distance' => 'decimal:2',
        'optimization_score' => 'decimal:2',
        'estimated_time' => 'integer',
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function stops(): HasMany
    {
        return $this->hasMany(RouteStop::class)
            ->orderBy('stop_order');
    }
}
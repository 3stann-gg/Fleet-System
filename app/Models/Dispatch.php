<?php

namespace App\Models;

use App\Models\Reservation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispatch extends Model
{
    protected $table = 'dispatch';

    protected $fillable = [
        'dispatch_number',
        'reservation_id',
        'dispatch_date',
        'departure_time',
        'arrival_time',
        'trip_status',
        'remarks',
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

}
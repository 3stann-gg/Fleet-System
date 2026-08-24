<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Reservation;
use App\Models\Dispatch;
use App\Models\Maintenance;
use App\Models\FleetNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        /*
        |--------------------------------------------------------------------------
        | PRIMARY KPIs
        |--------------------------------------------------------------------------
        */

        $availableVehicles = Vehicle::query()
            ->where('status', 'Available')
            ->count();

        $activeDispatches = Dispatch::query()
            ->whereIn('trip_status', [
                'Assigned',
                'En Route',
                'Arrived',
            ])
            ->count();

        $driversOnDuty = Driver::query()
            ->where('status', 'On Duty')
            ->count();


        /*
        |--------------------------------------------------------------------------
        | AVERAGE FUEL LEVEL
        |--------------------------------------------------------------------------
        */

        $vehiclesWithFuel = Vehicle::query()
            ->whereNotNull('tank_capacity')
            ->where('tank_capacity', '>', 0)
            ->whereNotNull('current_fuel')
            ->get([
                'tank_capacity',
                'current_fuel',
            ]);

        $averageFuelLevel = $vehiclesWithFuel->isNotEmpty()
            ? (int) round(
                $vehiclesWithFuel->avg(function ($vehicle) {
                    return min(
                        100,
                        max(
                            0,
                            (
                                (float) $vehicle->current_fuel /
                                (float) $vehicle->tank_capacity
                            ) * 100
                        )
                    );
                })
            )
            : 0;


        /*
        |--------------------------------------------------------------------------
        | TODAY'S DISPATCH QUEUE
        |--------------------------------------------------------------------------
        */

        $dispatchQueue = Dispatch::query()
            ->with([
                'reservation.vehicle',
                'reservation.driver',
            ])
            ->whereDate(
                'dispatch_date',
                today()
            )
            ->whereIn('trip_status', [
                'Pending',
                'Assigned',
                'En Route',
                'Arrived',
            ])
            ->orderByRaw("
                CASE trip_status
                    WHEN 'En Route' THEN 1
                    WHEN 'Arrived' THEN 2
                    WHEN 'Assigned' THEN 3
                    WHEN 'Pending' THEN 4
                    ELSE 5
                END
            ")
            ->orderBy('departure_time')
            ->limit(5)
            ->get();


        /*
        |--------------------------------------------------------------------------
        | VEHICLE STATUS
        |--------------------------------------------------------------------------
        */

        $vehicles = Vehicle::query()
            ->with('drivers')
            ->orderByRaw("
                CASE status
                    WHEN 'On Trip' THEN 1
                    WHEN 'Maintenance' THEN 2
                    WHEN 'Available' THEN 3
                    WHEN 'Out of Service' THEN 4
                    ELSE 5
                END
            ")
            ->latest('id')
            ->limit(5)
            ->get();


        /*
        |--------------------------------------------------------------------------
        | MAINTENANCE ALERTS
        |--------------------------------------------------------------------------
        |
        | next_schedule is intentionally not used yet.
        |--------------------------------------------------------------------------
        */

        $maintenanceAlerts = Maintenance::query()
            ->with('vehicle')
            ->whereIn('status', [
                'Scheduled',
                'In Progress',
            ])
            ->orderByRaw("
                CASE priority
                    WHEN 'Emergency' THEN 1
                    WHEN 'High' THEN 2
                    WHEN 'Normal' THEN 3
                    WHEN 'Low' THEN 4
                    ELSE 5
                END
            ")
            ->orderBy('maintenance_date')
            ->limit(5)
            ->get();


        /*
        |--------------------------------------------------------------------------
        | WEEKLY FLEET ACTIVITY
        |--------------------------------------------------------------------------
        */

        $weekStart = now()
            ->startOfWeek(Carbon::MONDAY);

        $weekEnd = now()
            ->endOfWeek(Carbon::SUNDAY);

        $weeklyRaw = Dispatch::query()
            ->selectRaw(
                'dispatch_date, COUNT(*) AS total'
            )
            ->whereBetween(
                'dispatch_date',
                [
                    $weekStart->toDateString(),
                    $weekEnd->toDateString(),
                ]
            )
            ->groupBy('dispatch_date')
            ->pluck(
                'total',
                'dispatch_date'
            );

        $weeklyActivity = collect();

        for ($day = 0; $day < 7; $day++) {
            $date = $weekStart
                ->copy()
                ->addDays($day);

            $weeklyActivity->push([
                'date' => $date->toDateString(),
                'day' => $date->format('D'),
                'total' => (int) (
                    $weeklyRaw[
                        $date->toDateString()
                    ] ?? 0
                ),
            ]);
        }

        $weeklyActivityMax = max(
            1,
            (int) $weeklyActivity->max('total')
        );


        /*
        |--------------------------------------------------------------------------
        | RECENT ACTIVITY
        |--------------------------------------------------------------------------
        */

        $recentActivity = FleetNotification::query()
            ->where(
                'user_id',
                Auth::id()
            )
            ->latest('id')
            ->limit(5)
            ->get();


        return view(
            'dashboard.index',
            compact(
                'availableVehicles',
                'activeDispatches',
                'driversOnDuty',
                'averageFuelLevel',
                'dispatchQueue',
                'vehicles',
                'maintenanceAlerts',
                'weeklyActivity',
                'weeklyActivityMax',
                'recentActivity'
            )
        );
    }
}
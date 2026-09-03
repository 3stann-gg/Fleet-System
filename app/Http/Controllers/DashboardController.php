<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Dispatch;
use App\Models\Maintenance;
use App\Models\FleetNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Dashboard Access
        |--------------------------------------------------------------------------
        */
        abort_unless(
            $user?->canViewModule('dashboard'),
            403
        );

        $role = $user->role;
        $department = $user->department;

        /*
        |--------------------------------------------------------------------------
        | Dashboard UI Permissions
        |--------------------------------------------------------------------------
        */
        $dashboardPermissions = [
            'role' => $role,

            'canSeeDispatchQueue' =>
                $user->hasRole(
                    'fleet_manager',
                    'dispatcher',
                    'driver',
                    'department_head',
                    'finance',
                    'it_admin'
                ),

            'canSeeDriverPool' =>
                $user->hasRole(
                    'fleet_manager',
                    'dispatcher',
                    'finance',
                    'it_admin'
                ),

            'canSeeMaintenance' =>
                $user->hasRole(
                    'fleet_manager',
                    'dispatcher',
                    'finance',
                    'maintenance',
                    'it_admin'
                ),

            'canSeeFleetStatus' => true,

            'canOpenVehicles' =>
                $user->canViewModule('vehicles'),

            'canOpenDispatch' =>
                $user->canViewModule('dispatch'),

            'canOpenMaintenance' =>
                $user->canViewModule('maintenance'),
        ];

        /*
        |--------------------------------------------------------------------------
        | Vehicle Scope
        |--------------------------------------------------------------------------
        |
        | Fleet Manager / Dispatcher / Finance / Maintenance / IT Admin
        |     -> fleet-wide
        |
        | Driver
        |     -> assigned vehicle only
        |
        | Department Head
        |     -> own department only
        |--------------------------------------------------------------------------
        */
        $vehicleScope = function () use (
            $user,
            $department
        ) {
            $query = Vehicle::query();

            /*
            |--------------------------------------------------------------------------
            | Driver
            |--------------------------------------------------------------------------
            */
            if ($user->hasRole('driver')) {
                $vehicleId =
                    $user->driverProfile
                        ?->assigned_vehicle_id;

                if ($vehicleId) {
                    $query->where(
                        'id',
                        $vehicleId
                    );
                } else {
                    $query->whereRaw('1 = 0');
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Department Head
            |--------------------------------------------------------------------------
            */
            elseif (
                $user->hasRole(
                    'department_head'
                )
            ) {
                if ($department) {
                    $query->where(
                        'department',
                        $department
                    );
                } else {
                    $query->whereRaw('1 = 0');
                }
            }

            return $query;
        };

        /*
        |--------------------------------------------------------------------------
        | Dispatch Scope
        |--------------------------------------------------------------------------
        |
        | Fleet Manager / Dispatcher / Finance / IT Admin
        |     -> fleet-wide read
        |
        | Driver
        |     -> own assignments only
        |
        | Department Head
        |     -> own department only
        |
        | Maintenance
        |     -> no dispatch data on dashboard
        |--------------------------------------------------------------------------
        */
        $dispatchScope = function () use (
            $user,
            $department
        ) {
            $query = Dispatch::query();

            /*
            |--------------------------------------------------------------------------
            | Driver
            |--------------------------------------------------------------------------
            */
            if ($user->hasRole('driver')) {
                $driverId =
                    $user->driverProfile?->id;

                if ($driverId) {
                    $query->whereHas(
                        'reservation',
                        function ($reservationQuery) use ($driverId) {
                            $reservationQuery->where(
                                'driver_id',
                                $driverId
                            );
                        }
                    );
                } else {
                    $query->whereRaw('1 = 0');
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Department Head
            |--------------------------------------------------------------------------
            */
            elseif (
                $user->hasRole(
                    'department_head'
                )
            ) {
                if (!$department) {
                    $query->whereRaw('1 = 0');

                    return $query;
                }

                $query->whereHas(
                    'reservation',
                    function ($reservationQuery) use ($department) {
                        $reservationQuery->where(
                            function ($scope) use ($department) {
                                $scope
                                    ->where(
                                        'department',
                                        $department
                                    )
                                    ->orWhereHas(
                                        'routePlan',
                                        function ($routeQuery) use ($department) {
                                            $routeQuery->where(
                                                'department',
                                                $department
                                            );
                                        }
                                    )
                                    ->orWhereHas(
                                        'vehicle',
                                        function ($vehicleQuery) use ($department) {
                                            $vehicleQuery->where(
                                                'department',
                                                $department
                                            );
                                        }
                                    );
                            }
                        );
                    }
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Maintenance
            |--------------------------------------------------------------------------
            */
            elseif (
                $user->hasRole(
                    'maintenance'
                )
            ) {
                $query->whereRaw('1 = 0');
            }

            return $query;
        };

        /*
        |--------------------------------------------------------------------------
        | Primary KPI - Available Vehicles
        |--------------------------------------------------------------------------
        */
        $availableVehicles =
            $vehicleScope()
                ->where(
                    'status',
                    'Available'
                )
                ->count();

        /*
        |--------------------------------------------------------------------------
        | Primary KPI - Active Dispatches
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        | Must use scoped dispatch query.
        |--------------------------------------------------------------------------
        */
        $activeDispatches =
            $dispatchScope()
                ->whereIn(
                    'trip_status',
                    [
                        'Assigned',
                        'En Route',
                        'Arrived',
                    ]
                )
                ->count();

        /*
        |--------------------------------------------------------------------------
        | Primary KPI - Drivers On Duty
        |--------------------------------------------------------------------------
        */
        if (
            $user->hasRole(
                'fleet_manager',
                'dispatcher',
                'finance',
                'it_admin'
            )
        ) {
            $driversOnDuty =
                Driver::query()
                    ->where(
                        'status',
                        'On Duty'
                    )
                    ->count();
        }

        /*
        |--------------------------------------------------------------------------
        | Driver - own duty status only
        |--------------------------------------------------------------------------
        */
        elseif (
            $user->hasRole('driver')
        ) {
            $driverProfile =
                $user->driverProfile;

            $driversOnDuty =
                $driverProfile &&
                $driverProfile->status === 'On Duty'
                    ? 1
                    : 0;
        }

        /*
        |--------------------------------------------------------------------------
        | Department Head - department vehicle drivers only
        |--------------------------------------------------------------------------
        */
        elseif (
            $user->hasRole(
                'department_head'
            )
        ) {
            if ($department) {
                $driversOnDuty =
                    Driver::query()
                        ->where(
                            'status',
                            'On Duty'
                        )
                        ->whereHas(
                            'vehicle',
                            function ($query) use ($department) {
                                $query->where(
                                    'department',
                                    $department
                                );
                            }
                        )
                        ->count();
            } else {
                $driversOnDuty = 0;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Maintenance
        |--------------------------------------------------------------------------
        */
        else {
            $driversOnDuty = 0;
        }

        /*
        |--------------------------------------------------------------------------
        | Average Fuel Level
        |--------------------------------------------------------------------------
        */
        $vehiclesWithFuel =
            $vehicleScope()
                ->whereNotNull(
                    'tank_capacity'
                )
                ->where(
                    'tank_capacity',
                    '>',
                    0
                )
                ->whereNotNull(
                    'current_fuel'
                )
                ->get([
                    'tank_capacity',
                    'current_fuel',
                ]);

        $averageFuelLevel =
            $vehiclesWithFuel->isNotEmpty()
                ? (int) round(
                    $vehiclesWithFuel->avg(
                        function ($vehicle) {
                            return min(
                                100,
                                max(
                                    0,
                                    (
                                        (float) $vehicle->current_fuel
                                        /
                                        (float) $vehicle->tank_capacity
                                    ) * 100
                                )
                            );
                        }
                    )
                )
                : 0;

        /*
        |--------------------------------------------------------------------------
        | Today's Dispatch Queue
        |--------------------------------------------------------------------------
        */
        $dispatchQueue =
            $dispatchScope()
                ->with([
                    'reservation.vehicle',
                    'reservation.driver',
                ])
                ->whereDate(
                    'dispatch_date',
                    today()
                )
                ->whereIn(
                    'trip_status',
                    [
                        'Pending',
                        'Assigned',
                        'En Route',
                        'Arrived',
                    ]
                )
                ->orderByRaw("
                    CASE trip_status
                        WHEN 'En Route' THEN 1
                        WHEN 'Arrived' THEN 2
                        WHEN 'Assigned' THEN 3
                        WHEN 'Pending' THEN 4
                        ELSE 5
                    END
                ")
                ->orderBy(
                    'departure_time'
                )
                ->limit(5)
                ->get();

        /*
        |--------------------------------------------------------------------------
        | Vehicle Status
        |--------------------------------------------------------------------------
        */
        $vehicles =
            $vehicleScope()
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
        | Maintenance Alerts
        |--------------------------------------------------------------------------
        */
        $maintenanceQuery =
            Maintenance::query()
                ->with('vehicle')
                ->whereIn(
                    'status',
                    [
                        'Scheduled',
                        'In Progress',
                    ]
                );

        /*
        |--------------------------------------------------------------------------
        | Driver
        |--------------------------------------------------------------------------
        |
        | Dashboard currently does not display Maintenance Alerts
        | for Driver, so do not load unrelated service records.
        |--------------------------------------------------------------------------
        */
        if (
            $user->hasRole('driver')
        ) {
            $maintenanceQuery
                ->whereRaw('1 = 0');
        }

        /*
        |--------------------------------------------------------------------------
        | Department Head
        |--------------------------------------------------------------------------
        */
        elseif (
            $user->hasRole(
                'department_head'
            )
        ) {
            $maintenanceQuery
                ->whereRaw('1 = 0');
        }

        $maintenanceAlerts =
            $maintenanceQuery
                ->orderByRaw("
                    CASE priority
                        WHEN 'Emergency' THEN 1
                        WHEN 'High' THEN 2
                        WHEN 'Normal' THEN 3
                        WHEN 'Low' THEN 4
                        ELSE 5
                    END
                ")
                ->orderBy(
                    'maintenance_date'
                )
                ->limit(5)
                ->get();

        /*
        |--------------------------------------------------------------------------
        | Weekly Fleet Activity
        |--------------------------------------------------------------------------
        */
        $weekStart =
            now()->startOfWeek(
                Carbon::MONDAY
            );

        $weekEnd =
            now()->endOfWeek(
                Carbon::SUNDAY
            );

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        |
        | Your previous version accidentally repeated $dispatchQueue here.
        | This must be $weeklyRaw.
        |--------------------------------------------------------------------------
        */
        $weeklyRaw =
            $dispatchScope()
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
                ->groupBy(
                    'dispatch_date'
                )
                ->pluck(
                    'total',
                    'dispatch_date'
                );

        $weeklyActivity =
            collect();

        for (
            $day = 0;
            $day < 7;
            $day++
        ) {
            $date =
                $weekStart
                    ->copy()
                    ->addDays($day);

            $dateKey =
                $date->toDateString();

            $weeklyActivity->push([
                'date' =>
                    $dateKey,

                'day' =>
                    $date->format('D'),

                'total' =>
                    (int) (
                        $weeklyRaw[
                            $dateKey
                        ] ?? 0
                    ),
            ]);
        }

        $weeklyActivityMax =
            max(
                1,
                (int)
                $weeklyActivity->max(
                    'total'
                )
            );

        /*
        |--------------------------------------------------------------------------
        | Recent Activity
        |--------------------------------------------------------------------------
        |
        | User-specific notifications only.
        |--------------------------------------------------------------------------
        */
        $recentActivity =
            FleetNotification::query()
                ->where(
                    'user_id',
                    $user->id
                )
                ->latest('id')
                ->limit(5)
                ->get();

        /*
        |--------------------------------------------------------------------------
        | Return Dashboard
        |--------------------------------------------------------------------------
        */
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
                'recentActivity',
                'dashboardPermissions'
            )
        );
    }
}
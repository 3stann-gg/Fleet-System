<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Reservation;
use App\Models\Dispatch;
use Illuminate\Http\Request;

class FleetSearchController extends Controller
{
    public function search(Request $request)
    {
        $query = trim(
            (string) $request->get('q', '')
        );

        if ($query === '') {
            return response()->json([
                'results' => [],
            ]);
        }

        $results = collect();

        /*
        |--------------------------------------------------------------------------
        | Vehicles
        |--------------------------------------------------------------------------
        */

        $vehicles = Vehicle::query()
            ->where(function ($q) use ($query) {
                $q
                    ->where(
                        'plate_number',
                        'like',
                        "%{$query}%"
                    )
                    ->orWhere(
                        'brand',
                        'like',
                        "%{$query}%"
                    )
                    ->orWhere(
                        'model',
                        'like',
                        "%{$query}%"
                    );
            })
            ->limit(5)
            ->get();

        foreach ($vehicles as $vehicle) {
            $vehicleName = trim(
                ($vehicle->brand ?? '') .
                ' ' .
                ($vehicle->model ?? '')
            );

            $results->push([
                'type' => 'Vehicle',
                'label' =>
                    $vehicleName !== ''
                        ? $vehicleName
                        : 'Vehicle',

                'detail' =>
                    $vehicle->plate_number ?? '',

                'url' =>
                    url('/fleet'),
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Drivers
        |--------------------------------------------------------------------------
        */

        $drivers = Driver::query()
            ->where(function ($q) use ($query) {
                $q
                    ->where(
                        'first_name',
                        'like',
                        "%{$query}%"
                    )
                    ->orWhere(
                        'last_name',
                        'like',
                        "%{$query}%"
                    )
                    ->orWhere(
                        'license_number',
                        'like',
                        "%{$query}%"
                    );
            })
            ->limit(5)
            ->get();

        foreach ($drivers as $driver) {
            $driverName = trim(
                ($driver->first_name ?? '') .
                ' ' .
                ($driver->last_name ?? '')
            );

            $results->push([
                'type' => 'Driver',

                'label' =>
                    $driverName !== ''
                        ? $driverName
                        : 'Driver',

                'detail' =>
                    $driver->license_number ?? '',

                'url' =>
                    url('/driver'),
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Reservations
        |--------------------------------------------------------------------------
        */

        $reservations = Reservation::query()
            ->where(function ($q) use ($query) {
                $q
                    ->where(
                        'reservation_number',
                        'like',
                        "%{$query}%"
                    )
                    ->orWhere(
                        'patient_name',
                        'like',
                        "%{$query}%"
                    )
                    ->orWhere(
                        'pickup_location',
                        'like',
                        "%{$query}%"
                    )
                    ->orWhere(
                        'destination',
                        'like',
                        "%{$query}%"
                    );
            })
            ->limit(5)
            ->get();

        foreach ($reservations as $reservation) {
            $results->push([
                'type' =>
                    'Reservation',

                'label' =>
                    $reservation->reservation_number,

                'detail' =>
                    $reservation->patient_name ??
                    $reservation->status ??
                    '',

                'url' =>
                    url('/reservation'),
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Dispatch
        |--------------------------------------------------------------------------
        */

        $dispatches = Dispatch::query()
            ->where(
                'dispatch_number',
                'like',
                "%{$query}%"
            )
            ->limit(5)
            ->get();

        foreach ($dispatches as $dispatch) {
            $results->push([
                'type' =>
                    'Dispatch',

                'label' =>
                    $dispatch->dispatch_number,

                'detail' =>
                    $dispatch->trip_status ?? '',

                'url' =>
                    url('/dispatch'),
            ]);
        }

        return response()->json([
            'results' =>
                $results
                    ->take(8)
                    ->values(),
        ]);
    }
}
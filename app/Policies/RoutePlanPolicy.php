<?php

namespace App\Policies;

use App\Models\RoutePlan;
use App\Models\User;

class RoutePlanPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canViewModule('route_planning');
    }

    public function view(
        User $user,
        RoutePlan $routePlan
    ): bool {
        /*
        |--------------------------------------------------------------------------
        | System-wide viewers
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole(
            'fleet_manager',
            'dispatcher',
            'it_admin'
        )) {
            return true;
        }

        /*
        |--------------------------------------------------------------------------
        | Driver - own assigned route only
        |--------------------------------------------------------------------------
        */

        if ($user->hasRole('driver')) {
            $driverId =
                $user->driverProfile?->id;

            return
                $driverId !== null &&
                (int) $routePlan->reservation?->driver_id ===
                    (int) $driverId;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(
            'fleet_manager',
            'dispatcher'
        );
    }

    public function update(
        User $user,
        RoutePlan $routePlan
    ): bool {
        return $user->hasRole(
            'fleet_manager',
            'dispatcher'
        );
    }

    public function delete(
        User $user,
        RoutePlan $routePlan
    ): bool {
        return $user->hasRole(
            'fleet_manager',
            'dispatcher'
        );
    }

    public function deleteAny(User $user): bool
    {
        return $user->hasRole(
            'fleet_manager',
            'dispatcher'
        );
    }
}
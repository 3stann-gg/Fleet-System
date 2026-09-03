<?php

namespace App\Policies;

use App\Models\Maintenance;
use App\Models\User;

class MaintenancePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canViewModule('maintenance');
    }

    public function view(
        User $user,
        Maintenance $maintenance
    ): bool {
        return $user->hasRole(
            'fleet_manager',
            'dispatcher',
            'finance',
            'maintenance',
            'it_admin'
        );
    }

    public function create(User $user): bool
    {
        return $user->hasRole(
            'fleet_manager',
            'maintenance'
        );
    }

    public function update(
        User $user,
        Maintenance $maintenance
    ): bool {
        return $user->hasRole(
            'fleet_manager',
            'maintenance'
        );
    }

    public function delete(
        User $user,
        Maintenance $maintenance
    ): bool {
        return $user->hasRole(
            'fleet_manager',
            'maintenance'
        );
    }

    public function deleteAny(User $user): bool
    {
        return $user->hasRole(
            'fleet_manager',
            'maintenance'
        );
    }
}
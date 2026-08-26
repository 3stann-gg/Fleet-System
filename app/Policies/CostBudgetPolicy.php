<?php

namespace App\Policies;

use App\Models\CostBudget;
use App\Models\User;

class CostBudgetPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canViewModule(
            'cost_analysis'
        );
    }

    public function view(
        User $user,
        CostBudget $costBudget
    ): bool {
        return $user->hasRole(
            'fleet_manager',
            'dispatcher',
            'department_head',
            'finance',
            'maintenance',
            'it_admin'
        );
    }

    public function manage(User $user): bool
    {
        return $user->hasRole(
            'fleet_manager',
            'finance'
        );
    }
}
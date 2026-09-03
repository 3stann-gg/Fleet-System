<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'System Administrator',
            'email' => 'admin@talahospital.com',
            'password' => Hash::make('admin123'),
            'role' => 'fleet_manager',
            'status' => true,
        ]);
    }
}

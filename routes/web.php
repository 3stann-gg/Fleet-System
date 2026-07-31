<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VehicleController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard.index');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

Route::get('/fleet/search', [VehicleController::class, 'index']);

Route::get('/fleet/stats', [VehicleController::class, 'stats'])
    ->name('vehicles.stats');

Route::delete('/fleet/bulk-delete', [VehicleController::class, 'bulkDelete'])
    ->name('vehicles.bulkDelete');

Route::get('/fleet', [VehicleController::class, 'index'])->name('fleet');

Route::post('/fleet', [VehicleController::class, 'store'])
    ->name('vehicles.store');

Route::get('/fleet/{vehicle}', [VehicleController::class, 'show'])
    ->name('vehicles.show');

Route::put('/fleet/{vehicle}', [VehicleController::class, 'update'])
    ->name('vehicles.update');

Route::delete('/fleet/{vehicle}', [VehicleController::class, 'destroy'])
    ->name('vehicles.destroy');

Route::view('/reservation', 'reservation.index')->name('reservation');

Route::view('/dispatch', 'dispatch.index')->name('dispatch');

Route::view('/driver', 'driver.index')->name('driver');

Route::view('/maintenance', 'maintenance.index')->name('maintenance');

Route::view('/fuel', 'fuel.index')->name('fuel');

Route::view('/route-planning', 'route-planning.index')->name('route-planning');

Route::view('/cost-analysis', 'cost-analysis.index')->name('cost-analysis');

Route::view('/reports', 'reports.index')->name('reports');

Route::view('/settings', 'settings.index')->name('settings');

Route::view('/profile', 'profile.index')->name('profile');
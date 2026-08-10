<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\ReservationController;

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

// ***VEHICLE MODULE***
Route::get('/fleet/search', [VehicleController::class, 'index']);

Route::get('/fleet/stats', [VehicleController::class, 'stats'])
    ->name('vehicles.stats');

Route::delete('/fleet/bulk-delete', [VehicleController::class, 'bulkDelete'])
    ->name('vehicles.bulkDelete');

Route::get('/fleet', [VehicleController::class, 'index']) ->name('fleet');
Route::get('/fleet/available', [VehicleController::class, 'available']);

Route::post('/fleet', [VehicleController::class, 'store'])
    ->name('vehicles.store');

Route::get('/fleet/{vehicle}', [VehicleController::class, 'show'])
    ->name('vehicles.show');

Route::put('/fleet/{vehicle}', [VehicleController::class, 'update'])
    ->name('vehicles.update');

Route::delete('/fleet/{vehicle}', [VehicleController::class, 'destroy'])
    ->name('vehicles.destroy');


// ***RESERVATION MODULE***
//Route::view('/reservation', 'reservation.index')->name('reservation');

Route::get('/reservation/stats', [ReservationController::class, 'stats'])
    ->name('reservation.stats');

Route::delete('/reservation/bulk-delete', [ReservationController::class, 'bulkDelete'])
    ->name('reservation.bulkDelete');
    
Route::resource('reservation', ReservationController::class);


Route::view('/dispatch', 'dispatch.index')->name('dispatch');

// ***DRIVER MODULE***
Route::delete('/drivers/bulk-delete', [DriverController::class, 'bulkDelete'])
    ->name('drivers.bulkDelete');

Route::get('/driver', [DriverController::class, 'index']) ->name('driver');
Route::get('/drivers', [DriverController::class, 'getDrivers']);
Route::get('/drivers/available', [DriverController::class, 'available']);

Route::post('/drivers', [DriverController::class, 'store'])
    ->name('drivers.store');

Route::get('/drivers/{driver}', [DriverController::class, 'show'])
    ->name('drivers.show');

Route::put('/drivers/{driver}', [DriverController::class, 'update'])
    ->name('drivers.update');

Route::delete('/drivers/{driver}', [DriverController::class, 'destroy'])
    ->name('drivers.destroy');


Route::view('/maintenance', 'maintenance.index')->name('maintenance');


Route::view('/fuel', 'fuel.index')->name('fuel');


Route::view('/route-planning', 'route-planning.index')->name('route-planning');


Route::view('/cost-analysis', 'cost-analysis.index')->name('cost-analysis');


Route::view('/reports', 'reports.index')->name('reports');


Route::view('/settings', 'settings.index')->name('settings');

Route::view('/profile', 'profile.index')->name('profile');


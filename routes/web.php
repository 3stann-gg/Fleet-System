<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\DispatchController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\FuelLogController;

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


// *** DISPATCH MODULE ***
Route::get('/dispatch', [DispatchController::class, 'index'])
    ->name('dispatch');

Route::get('/dispatch/available-reservations', [DispatchController::class, 'availableReservations'])
    ->name('dispatch.availableReservations');

Route::post('/dispatch', [DispatchController::class, 'store'])
    ->name('dispatch.store');

Route::delete('/dispatch/bulk-delete', [DispatchController::class, 'bulkDelete'])
    ->name('dispatch.bulkDelete');

Route::get('/dispatch/{dispatch}', [DispatchController::class, 'show'])
    ->name('dispatch.show');

Route::put('/dispatch/{dispatch}', [DispatchController::class, 'update'])
    ->name('dispatch.update');

Route::delete('/dispatch/{dispatch}', [DispatchController::class, 'destroy'])
    ->name('dispatch.destroy');


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


// ***MAINTENANCE MODULE***
Route::get('/maintenance', [MaintenanceController::class, 'index'])
    ->name('maintenance');

Route::get('/maintenance/available-vehicles', [MaintenanceController::class, 'availableVehicles'])
    ->name('maintenance.availableVehicles');

Route::post('/maintenance', [MaintenanceController::class, 'store'])
    ->name('maintenance.store');

Route::get('/maintenance/{maintenance}', [MaintenanceController::class, 'show'])
    ->name('maintenance.show');

Route::put('/maintenance/{maintenance}', [MaintenanceController::class, 'update'])
    ->name('maintenance.update');

Route::delete('/maintenance/bulk-delete', [MaintenanceController::class, 'bulkDelete'])
    ->name('maintenance.bulkDelete');   

Route::delete('/maintenance/{maintenance}', [MaintenanceController::class, 'destroy'])
    ->name('maintenance.destroy');


// ***FUEL MANAGEMENT MODULE***
Route::view('/fuel', 'fuel.index')->name('fuel');

Route::get('/fuel-records', [FuelLogController::class, 'index'])
    ->name('fuel.index');

Route::get('/fuel-records/next-number', [FuelLogController::class, 'nextNumber'])
    ->name('fuel.next-number');

Route::post('/fuel-records', [FuelLogController::class, 'store'])
    ->name('fuel.store');

Route::delete('/fuel-records/bulk-delete', [FuelLogController::class, 'bulkDelete'])
    ->name('fuel.bulk-delete');

Route::get('/fuel-records/{fuelLog}', [FuelLogController::class, 'show'])
    ->name('fuel.show');

Route::put('/fuel-records/{fuelLog}', [FuelLogController::class, 'update'])
    ->name('fuel.update');
        
Route::delete('/fuel-records/{fuelLog}', [FuelLogController::class, 'destroy'])
    ->name('fuel.destroy');


// ***ROUTE PLANNING MODULE***
Route::view('/route-planning', 'route-planning.index')->name('route-planning');


// ***COST ANALYSIS MODULE***
Route::view('/cost-analysis', 'cost-analysis.index')->name('cost-analysis');


// ***REPORTS MODULE***
Route::view('/reports', 'reports.index')->name('reports');


// ***SETTINGS***
Route::view('/settings', 'settings.index')->name('settings');

// ***PROFILE***
Route::view('/profile', 'profile.index')->name('profile');


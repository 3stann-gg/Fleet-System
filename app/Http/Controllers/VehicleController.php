<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vehicle;
use App\Models\Driver;
use Illuminate\Support\Facades\Validator;

class VehicleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Vehicle::with('drivers');

        if ($request->filled('search')) {

            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('brand', 'like', "%{$search}%")
                ->orWhere('model', 'like', "%{$search}%")
                ->orWhere('plate_number', 'like', "%{$search}%")

                    ->orWhereHas('drivers', function ($driver) use ($search) {
                    $driver->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                });
            });
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('vehicle_type', $request->type);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'asc');

        $query->orderBy($sort, $direction);

        $vehicles = $query->get()->map(function ($vehicle) {
            $driver = $vehicle->drivers->first();
            return [
                'id'                => $vehicle->id,
                'plate_number'      => $vehicle->plate_number,
                'vehicle_type'      => $vehicle->vehicle_type,
                'brand'             => $vehicle->brand,
                'model'             => $vehicle->model,
                'purchase_date'     => $vehicle->purchase_date,
                'insurance_expiry'  => $vehicle->insurance_expiry,
                'capacity'          => $vehicle->capacity,
                'fuel_type'         => $vehicle->fuel_type,
                'status'            => $vehicle->status,

                'driver_name'  => $driver
                    ? $driver->first_name . ' ' . $driver->last_name
                    : null,

                'driver_license'=> $driver?->license_number,

                'notes' => $vehicle->notes,
                //'last_service' => $vehicle->last_service,
            ];
        });

        // if AJAX request
        if ($request->expectsJson()) {

            return response()->json([
                'vehicles' => $vehicles
            ]);

        }

        return view('fleet.index',);
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'plate_number'      => 'required|unique:vehicles,plate_number',
                'vehicle_type'      => 'required',
                'brand'             => 'required',
                'model'             => 'required',
                'purchase_date'     => 'nullable|date',
                'insurance_expiry'  => 'nullable|date',
                'capacity'          => 'required|integer',
                'fuel_type'         => 'required',
                'status'            => 'required',
                'assigned_driver_id'=> 'nullable|exists:drivers,id',
                'notes'             => 'nullable|string',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the vehicle information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $driverId = $validated['assigned_driver_id'] ?? null;

        unset($validated['assigned_driver_id']);

        $vehicle = Vehicle::create($validated);

        if ($driverId) {
            Driver::where('id', $driverId)
                ->update([
                    'assigned_vehicle_id' => $vehicle->id,
                ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Vehicle added successfully.',
            'vehicle' => $vehicle->load('drivers'),
        ]);
    }
    /**
     * Display the specified resource.
     */
    public function show(Vehicle $vehicle)
    {
        $vehicle->load('drivers');

        $availableDrivers = Driver::whereNull('assigned_vehicle_id')
            ->orWhere('assigned_vehicle_id', $vehicle->id)
            ->get();

        return response()->json([
            'vehicle' => $vehicle,
            'drivers' => $availableDrivers,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'plate_number'      => 'required|unique:vehicles,plate_number,' . $vehicle->id,
            'vehicle_type'      => 'required',
            //'brand'             => 'required',
            //'model'             => 'required',
            //'purchase_date'     => 'nullable|date',
            //'insurance_expiry'  => 'nullable|date',
            'capacity'          => 'required|integer',
            'fuel_type'         => 'required',
            'status'            => 'required',
            'assigned_driver_id'=> 'nullable|exists:drivers,id',
            'notes'             => 'nullable|string',
        ]);

        $driverId = $validated['assigned_driver_id'] ?? null;

        unset($validated['assigned_driver_id']);

        $vehicle->update($validated);

        Driver::where('assigned_vehicle_id', $vehicle->id)
            ->update([
                'assigned_vehicle_id' => null,
            ]);

        if ($request->filled('assigned_driver_id')) {

            Driver::where('id', $request->assigned_driver_id)
                ->update([
                    'assigned_vehicle_id' => $vehicle->id,
                ]);

        }

        return response()->json([
            'success' => true,
            'message' => 'Vehicle updated successfully.',
            'vehicle' => $vehicle->load('drivers'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vehicle deleted successfully.'
        ]);
    }

    // Bulk Delete
    public function bulkDelete(Request $request)
    {   
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:vehicles,id',
        ]);

        Vehicle::whereIn('id', $request->ids)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vehicle(s) deleted successfully.',
        ]);
    }

    public function stats()
    {
        return response()->json([
            'total' => Vehicle::count(),

            'available' => Vehicle::where('status', 'Available')->count(),

            'on_trip' => Vehicle::where('status', 'On Trip')->count(),

            'maintenance' => Vehicle::where('status', 'Maintenance')->count(),

            'out_of_service' => Vehicle::where('status', 'Out of Service')->count(),
        ]);
    }

    public function available()
    {
        $vehicles = Vehicle::with('drivers')
            ->where('status', 'Available')
            ->orderBy('brand')
            ->orderBy('model')
            ->get([
                'id',
                'brand',
                'model',
                'vehicle_type',
                'status',
            ]);

        return response()->json($vehicles);
    }
}


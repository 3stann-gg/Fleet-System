<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vehicle;

class VehicleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Vehicle::query();

        if ($request->filled('search')) {

            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('brand', 'like', "%{$search}%")
                ->orWhere('model', 'like', "%{$search}%")
                ->orWhere('plate_number', 'like', "%{$search}%");
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

        $vehicles = $query
            ->get();

        // if AJAX request
        if ($request->expectsJson()) {

            return response()->json([
                'vehicles' => $vehicles
            ]);

        }

        return view('fleet.index', compact('vehicles'));
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
        $validated = $request->validate([
            'plate_number' => 'required|unique:vehicles',
            'vehicle_type' => 'required',
            'brand' => 'required',
            'model' => 'required',
            'year_model' => 'required|integer',
            'capacity' => 'required|integer',
            'fuel_type' => 'required',
            'status' => 'required',
        ]);

        Vehicle::create($validated);

        $vehicles = Vehicle::latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Vehicle added successfully.',
            'vehicles' => Vehicle::latest()->get(),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Vehicle $vehicle)
    {
        return response()->json($vehicle);
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
            'plate_number' => 'required|unique:vehicles,plate_number,' . $vehicle->id,
            'vehicle_type' => 'required',
            'brand' => 'required',
            'model' => 'required',
            'year_model' => 'required|integer',
            'capacity' => 'required|integer',
            'fuel_type' => 'required',
            'status' => 'required',
        ]);

        $vehicle->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Vehicle updated successfully.',
            'vehicle' => $vehicle,
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
}


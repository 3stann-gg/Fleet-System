<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class DriverController extends Controller
{
    public function index()
{
    return view('driver.index');
}

    public function store(Request $request)
    {
       $validator = Validator::make($request->all(), [
            'first_name'          => 'required|string|max:255',
            'last_name'           => 'required|string|max:255',
            'license_number'      => 'required|string|unique:drivers,license_number',
            'license_class'       => 'required|string',
            'license_expiry'      => 'required|date',
            'contact_number'      => 'required|string|max:20',
            'email'               => 'nullable|email|max:255',
            'experience'          => 'nullable|integer|min:0',
            'address'             => 'nullable|string',
            'emergency_contact'   => 'nullable|string|max:20',
            'notes'               => 'nullable|string',
            'assigned_vehicle_id' => 'nullable|exists:vehicles,id',
            'status'              => 'required|string',
            'photo'               => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('drivers', 'public');
        }

        Driver::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Driver added successfully!',
        ]);
    }

    public function show(Driver $driver)
    {
        return response()->json($driver);
    }

    public function update(Request $request, Driver $driver)
    {
        $validated = $request->validate([
            'first_name'         => 'required|string|max:255',
            'last_name'          => 'required|string|max:255',
            'license_number'     => ['required', 'string',
                                        Rule::unique('drivers')->ignore($driver->id),
                                    ],
            'license_class'      => 'required|string',
            'license_expiry'     => 'required|date',
            'contact_number'     => 'required|string|max:20',
            'email'              => 'nullable|email|max:255',
            'experience'         => 'nullable|integer|min:0',
            'address'            => 'nullable|string',
            'emergency_contact'  => 'nullable|string|max:20',
            'notes'              => 'nullable|string',
            'photo'              => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'assigned_vehicle_id'=> 'nullable|exists:vehicles,id',
            'status'             => 'required|string',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request
                ->file('photo')
                ->store('drivers', 'public');
        }

        $driver->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Driver updated successfully!',
        ]);
    }

    public function destroy(Driver $driver)
    {
        $driver->delete();

        return response()->json([
            'success' => true,
            'message' => 'Driver deleted successfully.',
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:drivers,id',
        ]);

        Driver::whereIn('id', $request->ids)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Driver(s) deleted successfully.',
        ]);
    }

    public function getDrivers()
    {
        $drivers = Driver::with('vehicle')
            ->latest()
            ->get();

        return response()->json($drivers);
    }

    public function available()
    {
        $drivers = Driver::whereNull('assigned_vehicle_id')
            ->orderBy('first_name')
            ->get([
                'id',
                'first_name',
                'last_name',
                'license_number'
            ]);

        return response()->json($drivers);
    }
}

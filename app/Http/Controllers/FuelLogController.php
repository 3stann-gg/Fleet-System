<?php

namespace App\Http\Controllers;

use App\Models\FuelLog;
use App\Models\Vehicle;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class FuelLogController extends Controller
{
    /**
     * Display a listing of fuel records.
     */
    public function index(Request $request)
    {
        $fuelLogs = FuelLog::with([
            'vehicle',
            'driver',
        ])
            ->orderBy('date', 'desc')
            ->orderBy('refuel_time', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'fuelLogs' => $fuelLogs,
        ]);
    }

    /**
     * Store a newly created fuel record.
     */
    public function store(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'vehicle_id' => [
                    'required',
                    'exists:vehicles,id',
                ],
                'driver_id' => [
                    'nullable',
                    'exists:drivers,id',
                ],
                'fuel_amount' => [
                    'required',
                    'numeric',
                    'min:0.01',
                ],
                'cost_per_liter' => [
                    'required',
                    'numeric',
                    'min:0.01',
                ],
                'cost' => [
                    'required',
                    'numeric',
                    'min:0',
                ],
                'odometer' => [
                    'required',
                    'numeric',
                    'min:0',
                ],
                'date' => [
                    'required',
                    'date',
                ],
                'refuel_time' => [
                    'nullable',
                    'date_format:H:i',
                ],
                'fuel_type' => [
                    'required',
                    'in:Diesel,Gasoline,Premium Gasoline',
                ],
                'fuel_station' => [
                    'required',
                    'string',
                    'max:255',
                ],
                'receipt_number' => [
                    'nullable',
                    'string',
                    'max:40',
                ],
                'payment_method' => [
                    'nullable',
                    'in:Fleet Card,Cash,Company Account,Other',
                ],
                'notes' => [
                    'nullable',
                    'string',
                ],
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the fuel record information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $fuelLog = DB::transaction(function () use (
                $validator
            ) {
                $validated = $validator->validated();
                
                $validated['fuel_number'] =
                    $this->generateFuelNumber();
                /*
                |--------------------------------------------------------------------------
                | Lock Vehicle
                |--------------------------------------------------------------------------
                */
                $vehicle = Vehicle::lockForUpdate()
                    ->findOrFail(
                        $validated['vehicle_id']
                    );
                /*
                |--------------------------------------------------------------------------
                | Validate Vehicle Fuel Type
                |--------------------------------------------------------------------------
                |
                | Electric vehicles are not supported by this
                | liquid-fuel module.
                |
                */
                if (
                    $vehicle->fuel_type === 'Electric'
                ) {
                    throw new \Exception(
                        'Electric vehicles cannot be processed by the fuel refueling module.'
                    );
                }
                /*
                |--------------------------------------------------------------------------
                | Prevent Invalid Fuel Type
                |--------------------------------------------------------------------------
                */
                $allowedFuelTypes = [
                    'Diesel',
                    'Gasoline',
                    'Premium Gasoline',
                ];

                if (
                    !in_array(
                        $validated['fuel_type'],
                        $allowedFuelTypes,
                        true
                    )
                ) {
                    throw new \Exception(
                        'Invalid fuel type.'
                    );
                }
                /*
                |--------------------------------------------------------------------------
                | Validate Fuel Capacity
                |--------------------------------------------------------------------------
                */
                $currentFuel = (float) $vehicle->current_fuel;
                $tankCapacity = (float) $vehicle->tank_capacity;
                $fuelAmount = (float) $validated['fuel_amount'];

                $newFuelLevel =
                    $currentFuel + $fuelAmount;

                if (
                    $tankCapacity <= 0
                ) {
                    throw new \Exception(
                        'Vehicle tank capacity is not configured.'
                    );
                }

                if (
                    $newFuelLevel > $tankCapacity
                ) {
                    throw new \Exception(
                        "Fuel amount exceeds the vehicle's available tank capacity."
                    );
                }
                /*
                |--------------------------------------------------------------------------
                | Validate Odometer
                |--------------------------------------------------------------------------
                */
                if (
                    (float) $validated['odometer'] <
                    (float) $vehicle->current_odometer
                ) {
                    throw new \Exception(
                        'Odometer reading cannot be lower than the vehicle\'s current mileage.'
                    );
                }
                /*
                |--------------------------------------------------------------------------
                | Calculate Total Cost
                |--------------------------------------------------------------------------
                */
                $calculatedCost =
                    round(
                        $fuelAmount *
                        (float) $validated['cost_per_liter'],
                        2
                    );
                /*
                |--------------------------------------------------------------------------
                | Use server-calculated total cost
                |--------------------------------------------------------------------------
                */
                $validated['cost'] =
                    $calculatedCost;
                /*
                |--------------------------------------------------------------------------
                | Save Fuel Record
                |--------------------------------------------------------------------------
                */
                $fuelLog = FuelLog::create(
                    $validated
                );
                /*
                |--------------------------------------------------------------------------
                | Update Vehicle Current Fuel + Mileage
                |--------------------------------------------------------------------------
                */
                $vehicle->update([
                    'current_fuel' =>
                        $newFuelLevel,

                    'current_odometer' =>
                        $validated['odometer'],
                ]);
                /*
                |--------------------------------------------------------------------------
                | Load Relationships
                |--------------------------------------------------------------------------
                */
                $fuelLog->load([
                    'vehicle',
                    'driver',
                ]);

                return $fuelLog;
            });

            return response()->json([
                'success' => true,
                'message' =>
                    'Fuel record added successfully.',
                'fuelLog' => $fuelLog,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified fuel record.
     */
    public function show(FuelLog $fuelLog)
    {
        $fuelLog->load([
            'vehicle',
            'driver',
        ]);

        return response()->json([
            'fuelLog' => $fuelLog,
        ]);
    }

    /**
     * Update the specified fuel record.
     *
     * Only transaction details that do not affect the vehicle's
     * recorded fuel balance and mileage can be edited.
     */
    public function update(Request $request, FuelLog $fuelLog)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'date' => [
                    'required',
                    'date',
                ],
                'refuel_time' => [
                    'nullable',
                    'date_format:H:i',
                ],
                'cost_per_liter' => [
                    'required',
                    'numeric',
                    'min:0.01',
                ],
                'fuel_station' => [
                    'required',
                    'string',
                    'max:255',
                ],
                'receipt_number' => [
                    'nullable',
                    'string',
                    'max:40',
                ],
                'payment_method' => [
                    'nullable',
                    'in:Fleet Card,Cash,Company Account,Other',
                ],
                'notes' => [
                    'nullable',
                    'string',
                ],
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the fuel record information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $result = DB::transaction(function () use (
                $validator,
                $fuelLog
            ) {
                /*
                |--------------------------------------------------------------------------
                | Lock Fuel Record
                |--------------------------------------------------------------------------
                */
                $fuelLog = FuelLog::lockForUpdate()
                    ->findOrFail($fuelLog->id);

                $validated = $validator->validated();

                /*
                |--------------------------------------------------------------------------
                | Recalculate Total Cost
                |--------------------------------------------------------------------------
                |
                | Quantity is preserved from the original transaction.
                | Only Cost/L can be edited.
                |
                */
                $calculatedCost = round(
                    (float) $fuelLog->fuel_amount *
                    (float) $validated['cost_per_liter'],
                    2
                );

                $validated['cost'] =
                    $calculatedCost;

                /*
                |--------------------------------------------------------------------------
                | Update Fuel Transaction
                |--------------------------------------------------------------------------
                |
                | vehicle_id
                | driver_id
                | fuel_type
                | fuel_amount
                | odometer
                | fuel_number
                |
                | are intentionally NOT changed.
                |
                */
                $fuelLog->update($validated);

                $fuelLog->load([
                    'vehicle',
                    'driver',
                ]);

                return $fuelLog;
            });

            return response()->json([
                'success' => true,
                'message' =>
                    'Fuel record updated successfully.',
                'fuelLog' => $result,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remove the specified fuel record.
     */
    public function destroy(FuelLog $fuelLog)
    {
        /*
        |--------------------------------------------------------------------------
        | Important:
        | We should NOT simply delete a fuel record after it has
        | changed the vehicle's current_fuel/current_odometer.
        |
        | For now this endpoint is intentionally restricted.
        |--------------------------------------------------------------------------
        */
        return response()->json([
            'success' => false,
            'message' =>
                'Fuel records cannot be deleted because they affect vehicle fuel and mileage history.',
        ], 422);
    }

    /**
     * Bulk delete fuel records.
     *
     * Fuel records are intentionally protected because they affect
     * vehicle fuel and mileage history.
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'ids' => [
                    'required',
                    'array',
                    'min:1',
                ],
                'ids.*' => [
                    'integer',
                    'exists:fuel_logs,id',
                ],
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please select valid fuel records.',
                'errors' => $validator->errors(),
            ], 422);
        }

        return response()->json([
            'success' => false,
            'message' =>
                'Fuel records cannot be deleted because they affect vehicle fuel and mileage history.',
        ], 422);
    }

    private function generateFuelNumber(): string
    {
        $year = now()->format('Y');
        $month = now()->format('m');

        $prefix = "FUEL-{$year}-{$month}";

        $lastFuel = FuelLog::where(
            'fuel_number',
            'like',
            $prefix . '%'
        )
        ->orderByDesc('fuel_number')
        ->first();

        $nextSequence = 1;

        if ($lastFuel) {
            $lastNumber = (int) substr(
                $lastFuel->fuel_number,
                strlen($prefix)
            );

            $nextSequence = $lastNumber + 1;
        }

        return $prefix . str_pad(
            $nextSequence,
            3,
            '0',
            STR_PAD_LEFT
        );
    }
    
    public function nextNumber()
    {
        return response()->json([
            'fuel_number' => $this->generateFuelNumber(),
        ]);
    }
}

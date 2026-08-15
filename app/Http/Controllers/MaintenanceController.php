<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MaintenanceController extends Controller
{
    /**
     * Display a listing of maintenance records.
     */
    public function index(Request $request)
    {
        $maintenances = Maintenance::with('vehicle')
            ->orderBy('id', 'asc')
            ->get();

        if ($request->expectsJson()) {
            return response()->json([
                'maintenances' => $maintenances,
            ]);
        }

        return view('maintenance.index');
    }

    /**
     * Get vehicles available for maintenance scheduling.
     */
    public function availableVehicles()
    {
        $vehicles = Vehicle::where('status', 'Available')
            ->orderBy('brand')
            ->orderBy('model')
            ->get();

        return response()->json([
            'vehicles' => $vehicles,
        ]);
    }

    /**
     * Store a newly created maintenance record.
     */
    public function store(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'maintenance_number' => [
                    'required',
                    'string',
                    'max:50',
                    'unique:maintenances,maintenance_number',
                ],

                'vehicle_id' => [
                    'required',
                    'exists:vehicles,id',
                ],

                'maintenance_type' => [
                    'required',
                    'string',
                    'max:100',
                ],

                'description' => [
                    'required',
                    'string',
                ],

                'maintenance_date' => [
                    'required',
                    'date',
                ],

                'completion_date' => [
                    'nullable',
                    'date',
                    'after_or_equal:maintenance_date',
                ],

                'next_schedule' => [
                    'nullable',
                    'date',
                ],

                'technician' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'priority' => [
                    'required',
                    'in:Low,Normal,High,Emergency',
                ],

                'odometer' => [
                    'nullable',
                    'integer',
                    'min:0',
                ],

                'parts_used' => [
                    'nullable',
                    'string',
                ],

                'cost' => [
                    'nullable',
                    'numeric',
                    'min:0',
                ],

                'status' => [
                    'required',
                    'in:Scheduled,In Progress,Completed,Cancelled',
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
                'message' => 'Please check the maintenance information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $result = DB::transaction(function () use (
                $validator
            ) {
                $validated = $validator->validated();

                $vehicle = Vehicle::lockForUpdate()
                    ->findOrFail($validated['vehicle_id']);

                /*
                |--------------------------------------------------------------------------
                | Vehicle must be Available for a new maintenance record
                |--------------------------------------------------------------------------
                */
                if ($vehicle->status !== 'Available') {
                    throw new \Exception(
                        "Vehicle {$vehicle->brand} {$vehicle->model} is currently {$vehicle->status} and cannot be scheduled for maintenance."
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Create Maintenance
                |--------------------------------------------------------------------------
                */
                $maintenance = Maintenance::create(
                    $validated
                );

                /*
                |--------------------------------------------------------------------------
                | If created directly as In Progress,
                | set Vehicle to Maintenance.
                |--------------------------------------------------------------------------
                */
                if ($validated['status'] === 'In Progress') {
                    $vehicle->update([
                        'status' => 'Maintenance',
                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | If created as Completed,
                | keep Vehicle Available.
                |--------------------------------------------------------------------------
                */
                if ($validated['status'] === 'Completed') {
                    $vehicle->update([
                        'status' => 'Available',
                    ]);
                }

                $maintenance->load('vehicle');

                return $maintenance;
            });

            return response()->json([
                'success' => true,
                'message' => 'Maintenance record added successfully.',
                'maintenance' => $result,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified maintenance record.
     */
    public function show(Maintenance $maintenance)
    {
        $maintenance->load('vehicle');

        return response()->json([
            'maintenance' => $maintenance,
        ]);
    }

    /**
 * Update the specified maintenance record.
 */
public function update(
    Request $request,
    Maintenance $maintenance
) {
    $validator = Validator::make(
        $request->all(),
        [
            'maintenance_number' => [
                'required',
                'string',
                'max:50',
                'unique:maintenances,maintenance_number,' . $maintenance->id,
            ],
            'vehicle_id' => [
                'required',
                'exists:vehicles,id',
            ],
            'maintenance_type' => [
                'required',
                'string',
                'max:100',
            ],
            'description' => [
                'required',
                'string',
            ],
            'maintenance_date' => [
                'required',
                'date',
            ],
            'completion_date' => [
                'nullable',
                'date',
                'after_or_equal:maintenance_date',
            ],
            'next_schedule' => [
                'nullable',
                'date',
            ],
            'technician' => [
                'nullable',
                'string',
                'max:255',
            ],
            'priority' => [
                'required',
                'in:Low,Normal,High,Emergency',
            ],
            'odometer' => [
                'nullable',
                'integer',
                'min:0',
            ],
            'parts_used' => [
                'nullable',
                'string',
            ],
            'cost' => [
                'nullable',
                'numeric',
                'min:0',
            ],
            'status' => [
                'required',
                'in:Scheduled,In Progress,Completed,Cancelled',
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
            'message' => 'Please check the maintenance information.',
            'errors' => $validator->errors(),
        ], 422);
    }

    try {
        $result = DB::transaction(function () use (
            $validator,
            $maintenance
        ) {
            /*
            |--------------------------------------------------------------------------
            | Lock Maintenance
            |--------------------------------------------------------------------------
            */
            $maintenance = Maintenance::lockForUpdate()
                ->findOrFail($maintenance->id);

            /*
            |--------------------------------------------------------------------------
            | Get Current + Requested Vehicle
            |--------------------------------------------------------------------------
            */
            $currentVehicle = Vehicle::lockForUpdate()
                ->findOrFail($maintenance->vehicle_id);

            $validated = $validator->validated();

            $newVehicleId = (int) $validated['vehicle_id'];
            $currentVehicleId = (int) $maintenance->vehicle_id;

            $currentStatus = $maintenance->status;
            $newStatus = $validated['status'];

            /*
            |--------------------------------------------------------------------------
            | Maintenance Status Lifecycle
            |--------------------------------------------------------------------------
            */
            $allowedTransitions = [
                'Scheduled' => [
                    'In Progress',
                    'Cancelled',
                ],
                'In Progress' => [
                    'Completed',
                    'Cancelled',
                ],
                'Completed' => [],
                'Cancelled' => [],
            ];
            /*
            |--------------------------------------------------------------------------
            | Prevent Invalid Status Transition
            |--------------------------------------------------------------------------
            */
            if (
                $currentStatus !== $newStatus &&
                !in_array(
                    $newStatus,
                    $allowedTransitions[$currentStatus] ?? []
                )
            ) {
                throw new \Exception(
                    "Cannot change maintenance status from {$currentStatus} to {$newStatus}."
                );
            }
            /*
            |--------------------------------------------------------------------------
            | Vehicle Change Rules
            |--------------------------------------------------------------------------
            |
            | Only Scheduled maintenance may change vehicle.
            |
            */
            if ($newVehicleId !== $currentVehicleId) {

                if ($currentStatus !== 'Scheduled') {
                    throw new \Exception(
                        'The vehicle cannot be changed once maintenance has started or has already been completed or cancelled.'
                    );
                }

                $newVehicle = Vehicle::lockForUpdate()
                    ->findOrFail($newVehicleId);

                if ($newVehicle->status !== 'Available') {
                    throw new \Exception(
                        "Vehicle {$newVehicle->brand} {$newVehicle->model} is currently {$newVehicle->status} and cannot be assigned."
                    );
                }
                /*
                | Current vehicle remains Available because Scheduled
                | maintenance has not started yet.
                |
                */
                $maintenance->vehicle_id = $newVehicleId;
            }
            /*
            |--------------------------------------------------------------------------
            | Start Maintenance
            |--------------------------------------------------------------------------
            |
            | Scheduled → In Progress
            | Vehicle: Available → Maintenance
            |
            */
            if (
                $currentStatus !== 'In Progress' &&
                $newStatus === 'In Progress'
            ) {
                /*
                | If vehicle was changed above, use the new vehicle.
                */
                $activeVehicle = $newVehicleId !== $currentVehicleId
                    ? Vehicle::lockForUpdate()
                        ->findOrFail($newVehicleId)
                    : $currentVehicle;

                if ($activeVehicle->status !== 'Available') {
                    throw new \Exception(
                        "Vehicle {$activeVehicle->brand} {$activeVehicle->model} is currently {$activeVehicle->status} and cannot start maintenance."
                    );
                }

                $activeVehicle->update([
                    'status' => 'Maintenance',
                ]);
            }
            /*
            |--------------------------------------------------------------------------
            | Complete Maintenance
            |--------------------------------------------------------------------------
            |
            | In Progress → Completed
            | Vehicle: Maintenance → Available
            |
            */
            if (
                $currentStatus !== 'Completed' &&
                $newStatus === 'Completed'
            ) {
                /*
                | The vehicle associated with this maintenance becomes
                | available again.
                */
                $completionVehicle = $newVehicleId !== $currentVehicleId
                    ? Vehicle::lockForUpdate()
                        ->findOrFail($newVehicleId)
                    : $currentVehicle;

                if ($completionVehicle->status === 'Maintenance') {
                    $completionVehicle->update([
                        'status' => 'Available',
                    ]);
                }

                if (empty($validated['completion_date'])) {
                    $validated['completion_date'] =
                        now()->toDateString();
                }
            }
            /*
            |--------------------------------------------------------------------------
            | Cancel Maintenance
            |--------------------------------------------------------------------------
            |
            | If maintenance was In Progress:
            | Vehicle: Maintenance → Available
            |
            */
            if (
                $currentStatus !== 'Cancelled' &&
                $newStatus === 'Cancelled'
            ) {
                if (
                    $currentVehicle->status === 'Maintenance'
                ) {
                    $currentVehicle->update([
                        'status' => 'Available',
                    ]);
                }
                /*
                | If it was never started, its vehicle stays Available.
                */
            }
            /*
            |--------------------------------------------------------------------------
            | Update Maintenance
            |--------------------------------------------------------------------------
            */
            $maintenance->fill($validated);
            $maintenance->save();

            /*
            |--------------------------------------------------------------------------
            | Load Updated Vehicle
            |--------------------------------------------------------------------------
            */
            $maintenance->load('vehicle');

            return $maintenance;
        });

        return response()->json([
            'success' => true,
            'message' => 'Maintenance record updated successfully.',
            'maintenance' => $result,
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
        ], 422);
    }
}

    /**
     * Remove the specified maintenance record.
     */
    public function destroy(Maintenance $maintenance)
    {
        try {
            DB::transaction(function () use ($maintenance) {
                $maintenance->load('vehicle');

                /*
                |--------------------------------------------------------------------------
                | Do not delete active maintenance
                |--------------------------------------------------------------------------
                */
                if ($maintenance->status === 'In Progress') {
                    throw new \Exception(
                        'In-progress maintenance cannot be deleted.'
                    );
                }

                $vehicle = $maintenance->vehicle;

                $maintenance->delete();

                /*
                |--------------------------------------------------------------------------
                | If the deleted record was controlling the vehicle,
                | release the vehicle.
                |--------------------------------------------------------------------------
                */
                if (
                    $vehicle &&
                    $vehicle->status === 'Maintenance'
                ) {
                    $vehicle->update([
                        'status' => 'Available',
                    ]);
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Maintenance record deleted successfully.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Bulk delete maintenance records.
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'maintenance_ids' => [
                    'required',
                    'array',
                    'min:1',
                ],

                'maintenance_ids.*' => [
                    'integer',
                    'exists:maintenances,id',
                ],
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please select valid maintenance records.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $deletedIds = [];

            DB::transaction(function () use (
                $validator,
                &$deletedIds
            ) {
                $maintenanceIds =
                    $validator->validated()['maintenance_ids'];

                $maintenances = Maintenance::with('vehicle')
                    ->whereIn('id', $maintenanceIds)
                    ->lockForUpdate()
                    ->get();

                foreach ($maintenances as $maintenance) {
                    if ($maintenance->status === 'In Progress') {
                        continue;
                    }

                    $vehicle = $maintenance->vehicle;

                    $maintenance->delete();

                    if (
                        $vehicle &&
                        $vehicle->status === 'Maintenance'
                    ) {
                        $vehicle->update([
                            'status' => 'Available',
                        ]);
                    }

                    $deletedIds[] = $maintenance->id;
                }
            });

            if (empty($deletedIds)) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'In-progress maintenance records cannot be deleted.',
                    'deleted_ids' => [],
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' =>
                    count($deletedIds) === 1
                        ? 'Maintenance record deleted successfully.'
                        : count($deletedIds) . ' maintenance records deleted successfully.',
                'deleted_ids' => $deletedIds,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete maintenance records.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
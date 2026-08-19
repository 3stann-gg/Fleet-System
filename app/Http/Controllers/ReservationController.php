<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Vehicle;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReservationController extends Controller
{
    private function validateVehicleAndDriverAvailability(
        ?int $vehicleId,
        ?int $driverId
    ): void {
        /*
        |--------------------------------------------------------------------------
        | Vehicle is required if a driver is assigned
        |--------------------------------------------------------------------------
        */
        if (!$vehicleId && $driverId) {
            throw new \Exception(
                'A driver cannot be assigned without a vehicle.'
            );
        }
        /*
        |--------------------------------------------------------------------------
        | Vehicle Validation
        |--------------------------------------------------------------------------
        */
        if ($vehicleId) {
            $vehicle = Vehicle::find($vehicleId);

            if (!$vehicle) {
                throw new \Exception(
                    'Selected vehicle was not found.'
                );
            }

            if ($vehicle->status !== 'Available') {
                throw new \Exception(
                    "Vehicle {$vehicle->brand} {$vehicle->model} is currently {$vehicle->status} and cannot be assigned."
                );
            }
        }
        /*
        |--------------------------------------------------------------------------
        | Driver Validation
        |--------------------------------------------------------------------------
        */
        if ($driverId) {
            $driver = Driver::find($driverId);

            if (!$driver) {
                throw new \Exception(
                    'Selected driver was not found.'
                );
            }

            if ($driver->status !== 'Available') {
                $driverName = trim(
                    ($driver->first_name ?? '') . ' ' .
                    ($driver->last_name ?? '')
                );

                throw new \Exception(
                    "Driver {$driverName} is currently {$driver->status} and cannot be assigned."
                );
            }
            /*
            |--------------------------------------------------------------------------
            | Driver must belong to selected vehicle
            |--------------------------------------------------------------------------
            */
            if (
                !$vehicleId ||
                (int) $driver->assigned_vehicle_id !== (int) $vehicleId
            ) {
                throw new \Exception(
                    'The selected driver is not assigned to the selected vehicle.'
                );
            }
        }
    }

    /**
     * Display a listing of reservations.
     */
    public function index(Request $request)
    {
        $query = Reservation::with([
            'vehicle',
            'driver'
        ]);

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where(
                    'reservation_number',
                    'like',
                    "%{$search}%"
                )
                ->orWhere(
                    'patient_name',
                    'like',
                    "%{$search}%"
                )
                ->orWhere(
                    'pickup_location',
                    'like',
                    "%{$search}%"
                )
                ->orWhere(
                    'destination',
                    'like',
                    "%{$search}%"
                )
                ->orWhereHas('vehicle', function ($vehicle) use ($search) {
                    $vehicle
                        ->where('brand', 'like', "%{$search}%")
                        ->orWhere('model', 'like', "%{$search}%")
                        ->orWhere('plate_number', 'like', "%{$search}%");
                })
                ->orWhereHas('driver', function ($driver) use ($search) {
                    $driver
                        ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
            });
        }
        if (
            $request->filled('request_type') &&
            $request->request_type !== 'all'
        ) {
            $query->where(
                'request_type',
                $request->request_type
            );
        }
        if (
            $request->filled('priority') &&
            $request->priority !== 'all'
        ) {
            $query->where(
                'priority',
                $request->priority
            );
        }
        if (
            $request->filled('status') &&
            $request->status !== 'all'
        ) {
            $query->where(
                'status',
                $request->status
            );
        }

        $allowedSorts = [
            'id',
            'reservation_number',
            'patient_name',
            'schedule_date',
            'schedule_time',
            'priority',
            'status',
        ];

        $sort = $request->get('sort', 'id');

        if (!in_array($sort, $allowedSorts)) {
            $sort = 'id';
        }

        $direction = $request->get('direction', 'asc');

        if (!in_array($direction, ['asc', 'desc'])) {
            $direction = 'asc';
        }

        $query->orderBy($sort, $direction);

        $reservations = $query->get();

        if ($request->expectsJson()) {
            return response()->json([
                'reservations' => $reservations
            ]);
        }

        return view('reservation.index');
    }

    /**
     * Store a newly created reservation.
     */
    public function store(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'reservation_number' => [
                    'nullable',
                    'string',
                    'max:50',
                    'unique:reservations,reservation_number',
                ],
                'patient_name' => [
                    'required',
                    'string',
                    'max:255',
                ],
                'request_type' => [
                    'required',
                    'in:Patient Transport,Emergency Transfer,Medical Appointment,Laboratory Transport,Staff Transport,Supply Delivery',
                ],
                'vehicle_id' => [
                    'nullable',
                    'exists:vehicles,id',
                ],
                'driver_id' => [
                    'nullable',
                    'exists:drivers,id',
                ],
                'pickup_location' => [
                    'required',
                    'string',
                    'max:255',
                ],
                'destination' => [
                    'required',
                    'string',
                    'max:255',
                ],
                'schedule_date' => [
                    'required',
                    'date',
                    'after_or_equal:today',
                ],
                'schedule_time' => [
                    'required',
                ],
                'priority' => [
                    'required',
                    'in:Low,Normal,High,Emergency',
                ],
                'status' => [
                    'required',
                    'in:Pending,Approved,Scheduled,Completed,Rejected,Cancelled',
                ],
                'contact_number' => [
                    'nullable',
                    'string',
                    'max:50',
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
                'message' => 'Please check the reservation information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $validated = $validator->validated();
            
            $validated['status'] = 'Pending';
            
            $validated['reservation_number'] = $validated['reservation_number']
                ?? $this->generateReservationNumber();

            $this->validateVehicleAndDriverAvailability(
                $validated['vehicle_id'] ?? null,
                $validated['driver_id'] ?? null
            );

            $reservation = Reservation::create(
                $validated
            );

            $reservation->load([
                'vehicle',
                'driver'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reservation added successfully.',
                'reservation' => $reservation,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified reservation.
     */
    public function show(Reservation $reservation)
    {
        $reservation->load([
            'vehicle',
            'driver'
        ]);

        return response()->json([
            'reservation' => $reservation,
        ]);
    }

    /**
     * Update the specified reservation.
     */
    public function update(
        Request $request,
        Reservation $reservation
    ) {
        $validator = Validator::make(
            $request->all(),
            [
                'reservation_number' => [
                    'required',
                    'string',
                    'max:50',
                    'unique:reservations,reservation_number,' . $reservation->id,
                ],
                'patient_name' => [
                    'required',
                    'string',
                    'max:255',
                ],
                'request_type' => [
                    'required',
                    'in:Patient Transport,Emergency Transfer,Medical Appointment,Laboratory Transport,Staff Transport,Supply Delivery',
                ],
                'vehicle_id' => [
                    'nullable',
                    'exists:vehicles,id',
                ],
                'driver_id' => [
                    'nullable',
                    'exists:drivers,id',
                ],
                'pickup_location' => [
                    'required',
                    'string',
                    'max:255',
                ],
                'destination' => [
                    'required',
                    'string',
                    'max:255',
                ],
                'schedule_date' => [
                    'required',
                    'date',
                    'after_or_equal:today',
                ],
                'schedule_time' => [
                    'required',
                ],
                'priority' => [
                    'required',
                    'in:Low,Normal,High,Emergency',
                ],
                'status' => [
                    'required',
                    'in:Pending,Approved,Scheduled,Completed,Rejected,Cancelled',
                ],
                'contact_number' => [
                    'nullable',
                    'string',
                    'max:50',
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
                'message' => 'Please check the reservation information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $validated = $validator->validated();

            $this->validateVehicleAndDriverAvailability(
                $validated['vehicle_id'] ?? null,
                $validated['driver_id'] ?? null
            );

            $reservation->update(
                $validated
            );

            $reservation->load([
                'routePlan',
                'vehicle',
                'driver'
            ]);
            
            if ($reservation->dispatch) {
                throw new \Exception(
                    'This reservation can no longer be modified because a dispatch has already been created.'
                );
            }
            if ($reservation->routePlan) {
                throw new \Exception(
                    'This reservation can no longer be modified because a route plan has already been created.'
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Reservation updated successfully.',
                'reservation' => $reservation,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remove the specified reservation.
     */
    public function destroy(Reservation $reservation)
    {
        try {
            $reservation->load([
                'routePlan',
                'dispatch',
            ]);
            if ($reservation->dispatch) {
                throw new \Exception(
                    'This reservation cannot be deleted because it already has a dispatch.'
                );
            }
            if ($reservation->routePlan) {
                throw new \Exception(
                    'This reservation cannot be deleted because it already has a route plan.'
                );
            }
            $reservation->delete();
            return response()->json([
                'success' => true,
                'message' => 'Reservation deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Bulk delete reservations.
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
                    'exists:reservations,id',
                ],
            ]
        );
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please select valid reservations.',
                'errors' => $validator->errors(),
            ], 422);
        }
        $deletedIds = [];
        try {
            $reservations = Reservation::with([
                'routePlan',
                'dispatch',
            ])
                ->whereIn(
                    'id',
                    $validator->validated()['ids']
                )
                ->get();
            foreach ($reservations as $reservation) {
                if (
                    $reservation->routePlan ||
                    $reservation->dispatch
                ) {
                    continue;
                }
                $deletedIds[] =
                    $reservation->id;
                $reservation->delete();
            }
            if (empty($deletedIds)) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'Selected reservations cannot be deleted because they are already linked to route planning or dispatch.',
                    'deleted_ids' => [],
                ], 422);
            }
            return response()->json([
                'success' => true,
                'message' =>
                    count($deletedIds) === 1
                        ? 'Reservation deleted successfully.'
                        : count($deletedIds) . ' reservations deleted successfully.',
                'deleted_ids' => $deletedIds,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete reservations.',
            ], 500);
        }
    }

    /**
     * Reservation statistics.
     */
    public function stats()
    {
        return response()->json([
            'total' => Reservation::count(),
            'pending' => Reservation::where(
                'status',
                'Pending'
            )->count(),
            'approved' => Reservation::where(
                'status',
                'Approved'
            )->count(),
            'scheduled' => Reservation::where(
                'status',
                'Scheduled'
            )->count(),
            'completed' => Reservation::where(
                'status',
                'Completed'
            )->count(),
            'cancelled' => Reservation::where(
                'status',
                'Cancelled'
            )->count(),
        ]);
    }

    private function generateReservationNumber(): string
    {
        $year = now()->format('Y');
        $month = now()->format('m');
        $prefix = "RES-{$year}-{$month}";
        $latestReservation = Reservation::query()
            ->where(
                'reservation_number',
                'like',
                $prefix . '%'
            )
            ->orderByDesc('id')
            ->first();

        if (!$latestReservation) {
            $nextSequence = 1;
        } else {
            $lastSequence = (int) substr(
                $latestReservation->reservation_number,
                -3
            );
            $nextSequence = $lastSequence + 1;
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
            'success' => true,
            'reservation_number' =>
                $this->generateReservationNumber(),
        ]);
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Dispatch;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DispatchController extends Controller
{   
    /**
     * Display a listing of dispatches.
     */
    public function index(Request $request)
    {
        $dispatches = Dispatch::with([
            'reservation.vehicle',
            'reservation.driver',
        ])
        ->orderBy('id', 'asc')
        ->get();

        if ($request->expectsJson()) {
            return response()->json([
                'dispatches' => $dispatches,
            ]);
        }

        return view('dispatch.index');
    }

    /**
     * Get reservations available for dispatch.
     */
    public function availableReservations()
    {
        $reservations = Reservation::with([
            'vehicle',
            'driver',
        ])
        ->whereIn('status', [
            'Approved',
            //'Scheduled',
        ])
        ->whereDoesntHave('dispatch')
        ->orderBy('schedule_date', 'asc')
        ->orderBy('schedule_time', 'asc')
        ->get();

        return response()->json([
            'reservations' => $reservations,
        ]);
    }

    /**
     * Store a newly created dispatch.
     */
    public function store(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'dispatch_number' => [
                    'required',
                    'string',
                    'max:50',
                    'unique:dispatch,dispatch_number',
                ],
                'reservation_id' => [
                    'required',
                    'exists:reservations,id',
                ],
                'dispatch_date' => [
                    'required',
                    'date',
                ],
                'departure_time' => [
                    'required',
                ],
                'arrival_time' => [
                    'nullable',
                ],
                'trip_status' => [
                    'required',
                    'string',
                    'max:50',
                    'in:Assigned',
                ],
                'remarks' => [
                    'nullable',
                    'string',
                ],
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the dispatch information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $dispatch = DB::transaction(function () use ($request, $validator) {
                /*
                |--------------------------------------------------------------------------
                | Find Reservation
                |--------------------------------------------------------------------------
                */
                $reservation = Reservation::with([
                    'vehicle',
                    'driver',
                ])
                ->lockForUpdate()
                ->findOrFail($request->reservation_id);
                /*
                |--------------------------------------------------------------------------
                | Reservation must be Approved
                |--------------------------------------------------------------------------
                */
                if ($reservation->status !== 'Approved') {
                    throw new \Exception(
                        'Only approved reservations can be dispatched.'
                    );
                }
                /*
                |--------------------------------------------------------------------------
                | Prevent Duplicate Dispatch
                |--------------------------------------------------------------------------
                */
                if ($reservation->dispatch()->exists()) {
                    throw new \Exception(
                        'This reservation already has a dispatch.'
                    );
                }
                /*
                |--------------------------------------------------------------------------
                | Create Dispatch
                |--------------------------------------------------------------------------
                |
                | New dispatch always starts at Assigned.
                |
                */
                $dispatch = Dispatch::create([
                    'dispatch_number' => $validator->validated()['dispatch_number'],
                    'reservation_id' => $reservation->id,
                    'dispatch_date' => $validator->validated()['dispatch_date'],
                    'departure_time' => $validator->validated()['departure_time'],
                    'arrival_time' => $validator->validated()['arrival_time'] ?? null,
                    'trip_status' => 'Assigned',
                    'remarks' => $validator->validated()['remarks'] ?? null,
                ]);
                /*
                |--------------------------------------------------------------------------
                | Reservation: Approved → Scheduled
                |--------------------------------------------------------------------------
                */
                $reservation->update([
                    'status' => 'Scheduled',
                ]);
                /*
                |--------------------------------------------------------------------------
                | Load Relationships
                |--------------------------------------------------------------------------
                */
                $dispatch->load([
                    'reservation.vehicle',
                    'reservation.driver',
                ]);

                return $dispatch;
            });

            return response()->json([
                'success' => true,
                'message' => 'Dispatch added successfully.',
                'dispatch' => $dispatch,
            ], 201);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Update the specified dispatch.
     */
    public function update(Request $request, Dispatch $dispatch)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'dispatch_number' => [
                    'required',
                    'string',
                    'max:50',
                    'unique:dispatch,dispatch_number,' . $dispatch->id,
                ],

                'trip_status' => [
                    'required',
                    'string',
                    'max:50',
                    'in:Assigned,En Route,Arrived,Completed,Cancelled',
                ],
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the dispatch information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {

            $result = DB::transaction(function () use (
                $request,
                $validator,
                $dispatch
            ) {
                /*
                |--------------------------------------------------------------------------
                | Lock Dispatch
                |--------------------------------------------------------------------------
                */
                $dispatch = Dispatch::lockForUpdate()
                    ->with('reservation')
                    ->findOrFail($dispatch->id);

                $reservation = $dispatch->reservation;
                /*
                |--------------------------------------------------------------------------
                | Reservation Must Exist
                |--------------------------------------------------------------------------
                */
                if (!$reservation) {
                    throw new \Exception(
                        'Reservation associated with this dispatch was not found.'
                    );
                }
                /*
                |--------------------------------------------------------------------------
                | Dispatch Status Lifecycle
                |--------------------------------------------------------------------------
                |
                | Assigned > En Route > Arrived > Completed 
                
                | Assigned / En Route → Cancelled
                |
                */
                $allowedTransitions = [
                    'Assigned' => [
                        'En Route',
                        'Cancelled',
                    ],
                    'En Route' => [
                        'Arrived',
                        'Cancelled',
                    ],
                    'Arrived' => [
                        'Completed',
                    ],
                    'Completed' => [],
                    'Cancelled' => [],
                ];
                $currentStatus = $dispatch->trip_status;
                $newStatus = $validator->validated()['trip_status'];
                /*
                |--------------------------------------------------------------------------
                | Prevent Invalid Transition
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
                        "Cannot change dispatch status from {$currentStatus} to {$newStatus}."
                    );
                }
                /*
                |--------------------------------------------------------------------------
                | Update Dispatch
                |--------------------------------------------------------------------------
                */
                $dispatch->update([
                    'dispatch_number' =>
                        $validator->validated()['dispatch_number'],

                    'trip_status' => $newStatus,
                ]);
                /*
                |--------------------------------------------------------------------------
                | Synchronize Reservation Status
                |--------------------------------------------------------------------------
                */
                if ($newStatus === 'Completed') {
                    /*
                    |--------------------------------------------------------------------------
                    | Dispatch Completed → Reservation Completed
                    |--------------------------------------------------------------------------
                    */
                    $reservation->update([
                        'status' => 'Completed',
                    ]);

                } elseif ($newStatus === 'Cancelled') {

                    /*
                    |--------------------------------------------------------------------------
                    | Dispatch Cancelled → Reservation Cancelled
                    |--------------------------------------------------------------------------
                    */

                    $reservation->update([
                        'status' => 'Cancelled',
                    ]);
                }
                /*
                |--------------------------------------------------------------------------
                | Load Updated Relationships
                |--------------------------------------------------------------------------
                */
                $dispatch->load([
                    'reservation.vehicle',
                    'reservation.driver',
                ]);

                return $dispatch;
            });

            return response()->json([
                'success' => true,
                'message' => 'Dispatch updated successfully.',
                'dispatch' => $result,
            ]);


        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Remove the specified dispatch.
     */
    public function destroy(Dispatch $dispatch)
    {
        $dispatch->load('reservation');
        $reservation = $dispatch->reservation;

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation associated with this dispatch was not found.',
            ], 404);
        }
        /*
        |--------------------------------------------------------------------------
        | Only Assigned dispatches can be deleted
        |--------------------------------------------------------------------------
        */
        if ($dispatch->trip_status !== 'Assigned') {
            return response()->json([
                'success' => false,
                'message' => "Dispatch {$dispatch->dispatch_number} cannot be deleted because its current status is {$dispatch->trip_status}.",
            ], 422);
        }
        /*
        |--------------------------------------------------------------------------
        | Delete Dispatch
        |--------------------------------------------------------------------------
        */
        $dispatch->delete();
        /*
        |--------------------------------------------------------------------------
        | Return Reservation to Approved
        |--------------------------------------------------------------------------
        */
        $reservation->update([
            'status' => 'Approved',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dispatch deleted successfully.',
        ]);
    }

    /**
     * Bulk delete selected dispatches.
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'dispatch_ids' => [
                    'required',
                    'array',
                    'min:1',
                ],

                'dispatch_ids.*' => [
                    'integer',
                    'exists:dispatch,id',
                ],
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please select valid dispatches.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $dispatchIds = $validator->validated()['dispatch_ids'];

        try {

            $deletedIds = [];

            DB::transaction(function () use (
                $dispatchIds,
                &$deletedIds
            ) {

                $dispatches = Dispatch::with('reservation')
                    ->whereIn('id', $dispatchIds)
                    ->lockForUpdate()
                    ->get();

                foreach ($dispatches as $dispatch) {

                    /*
                    |--------------------------------------------------------------------------
                    | Only Assigned dispatches can be deleted
                    |--------------------------------------------------------------------------
                    | Assigned = dispatch has been created but trip has not started.
                    */
                    if ($dispatch->trip_status !== 'Assigned') {
                        continue;
                    }
                    /*
                    |--------------------------------------------------------------------------
                    | Return Reservation to Approved
                    |--------------------------------------------------------------------------
                    | Dispatch deletion means the reservation is available
                    | for dispatching again.
                    */
                    if ($dispatch->reservation) {
                        $dispatch->reservation->update([
                            'status' => 'Approved',
                        ]);
                    }
                    /*
                    |--------------------------------------------------------------------------
                    | Delete Dispatch
                    |--------------------------------------------------------------------------
                    */
                    $deletedIds[] = $dispatch->id;

                    $dispatch->delete();
                }
            });
            /*
            |--------------------------------------------------------------------------
            | Nothing was deleted
            |--------------------------------------------------------------------------
            */
            if (empty($deletedIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only Assigned dispatches can be deleted.',
                    'deleted_ids' => [],
                ], 422);
            }
            /*
            |--------------------------------------------------------------------------
            | Success
            |--------------------------------------------------------------------------
            */
            return response()->json([
                'success' => true,
                'message' => count($deletedIds) === 1
                    ? 'Dispatch(es) deleted successfully.'
                    : count($deletedIds) . ' dispatches deleted successfully.',
                'deleted_ids' => $deletedIds,
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete dispatches.',
                'error' => $e->getMessage(),
            ], 500);
        }
}

    /**
     * Display the specified dispatch.
     */
    public function show(Dispatch $dispatch)
    {
        $dispatch->load([
            'reservation.vehicle',
            'reservation.driver',
        ]);

        return response()->json([
            'dispatch' => $dispatch,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Vehicle;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReservationController extends Controller
{
    /**
     * Display a listing of reservations.
     */
    public function index(Request $request)
    {
        $query = Reservation::with([
            'vehicle',
            'driver'
        ]);

        // Search
        if ($request->filled('search')) {

            $search = $request->search;

            $query->where(function ($q) use ($search) {

                $q->where('reservation_number', 'like', "%{$search}%")
                    ->orWhere('patient_name', 'like', "%{$search}%")
                    ->orWhere('pickup_location', 'like', "%{$search}%")
                    ->orWhere('destination', 'like', "%{$search}%")

                    ->orWhereHas('vehicle', function ($vehicle) use ($search) {
                        $vehicle->where('brand', 'like', "%{$search}%")
                            ->orWhere('model', 'like', "%{$search}%")
                            ->orWhere('plate_number', 'like', "%{$search}%");
                    })

                    ->orWhereHas('driver', function ($driver) use ($search) {
                        $driver->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    });
            });
        }

        // Request Type filter
        if ($request->filled('request_type') && $request->request_type !== 'all') {
            $query->where('request_type', $request->request_type);
        }

        // Priority filter
        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Sorting
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

        // AJAX / JSON request
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
                'reservation_number'=> 'required|string|max:50|unique:reservations,reservation_number',
                'patient_name'      => 'required|string|max:255',
                'request_type' => [
                    'required',
                    'in:Patient Transport,Emergency Transfer,Medical Appointment,Laboratory Transport,Staff Transport,Supply Delivery'
                ],
                'vehicle_id'        => 'nullable|exists:vehicles,id',
                'driver_id'         => 'nullable|exists:drivers,id',
                'pickup_location'   => 'required|string|max:255',
                'destination'       => 'required|string|max:255',
                'schedule_date'     => 'required|date',
                'schedule_time'     => 'required',
                'priority' => [
                    'required',
                    'in:Low,Normal,High,Emergency'
                ],
                'status' => [
                    'required',
                    'in:Pending,Approved,Scheduled,Completed,Rejected,Cancelled'
                ],
                'contact_number'    => 'nullable|string|max:50',
                'notes'             => 'nullable|string',
            ]
        );

        if ($validator->fails()) {

            return response()->json([
                'success' => false,
                'message' => 'Please check the reservation information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $reservation = Reservation::create(
            $validator->validated()
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
    public function update(Request $request, Reservation $reservation)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'reservation_number'=>
                    'required|string|max:50|unique:reservations,reservation_number,' . $reservation->id,
                'patient_name'      => 'required|string|max:255',
                'request_type' => [
                    'required',
                    'in:Patient Transport,Emergency Transfer,Medical Appointment,Laboratory Transport,Staff Transport,Supply Delivery'
                ],
                'vehicle_id'        => 'nullable|exists:vehicles,id',
                'driver_id'         => 'nullable|exists:drivers,id',
                'pickup_location'   => 'required|string|max:255',
                'destination'       => 'required|string|max:255',
                'schedule_date'     => 'required|date',
                'schedule_time'     => 'required',
                'priority' => [
                    'required',
                    'in:Low,Normal,High,Emergency'
                ],
                'status' => [
                    'required',
                    'in:Pending,Approved,Scheduled,Completed,Rejected,Cancelled'
                ],
                'contact_number'    => 'nullable|string|max:50',
                'notes'             => 'nullable|string',
            ]
        );

        if ($validator->fails()) {

            return response()->json([
                'success' => false,
                'message' => 'Please check the reservation information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $reservation->update(
            $validator->validated()
        );

        $reservation->load([
            'vehicle',
            'driver'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservation updated successfully.',
            'reservation' => $reservation,
        ]);
    }


    /**
     * Remove the specified reservation.
     */
    public function destroy(Reservation $reservation)
    {
        $reservation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reservation deleted successfully.',
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:reservations,id',
        ]);

        Reservation::whereIn('id', $request->ids)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reservation(s) deleted successfully.',
        ]);
    }
    /**
     * Reservation statistics.
     */
    public function stats()
    {
        return response()->json([
            'total' => Reservation::count(),
            'pending' => Reservation::where('status', 'Pending')->count(),
            'approved' => Reservation::where('status', 'Approved')->count(),
            'scheduled' => Reservation::where('status', 'Scheduled')->count(),
            'completed' => Reservation::where('status', 'Completed')->count(),
            'cancelled' => Reservation::where('status', 'Cancelled')->count(),
        ]);
    }
}
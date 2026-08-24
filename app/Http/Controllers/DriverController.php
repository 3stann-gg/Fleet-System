<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\FleetSetting;
use App\Services\FleetNotificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class DriverController extends Controller
{
    private function getDriverSettings(): array
    {
        $record = FleetSetting::query()
            ->latest('id')
            ->first();
        $settings = $record?->settings ?? [];
        $driverSettings =
            $settings['drivers'] ?? [];
        $allowedDefaultStatuses = [
            'Available',
            'On Leave',
            'Inactive',
        ];
        $defaultStatus =
            $driverSettings['defaultStatus']
            ?? 'Available';
        if (
            !in_array(
                $defaultStatus,
                $allowedDefaultStatuses,
                true
            )
        ) {
            $defaultStatus = 'Available';
        }
        return [
            'requireLicenseExpiry' =>
                $driverSettings['requireLicenseExpiry'] ?? true,
            'warnLicenseDays' =>
                max(
                    1,
                    min(
                        180,
                        (int) (
                            $driverSettings['warnLicenseDays']
                            ?? 30
                        )
                    )
                ),
            'defaultStatus' =>
                $defaultStatus,
        ];
    }

    private function isLicenseExpiringSoon(
        ?string $expiryDate,
        int $warningDays
    ): bool {
        if (!$expiryDate) {
            return false;
        }

        $expiry = Carbon::parse(
            $expiryDate
        )->startOfDay();

        $today = now()->startOfDay();

        $daysUntilExpiry =
            $today->diffInDays(
                $expiry,
                false
            );

        return
            $daysUntilExpiry >= 0 &&
            $daysUntilExpiry <= $warningDays;
    }

    private function createLicenseExpiryNotification(
        Driver $driver,
        int $warningDays
    ): void {
        if (
            !$this->isLicenseExpiringSoon(
                $driver->license_expiry
                    ? Carbon::parse(
                        $driver->license_expiry
                    )->format('Y-m-d')
                    : null,
                $warningDays
            )
        ) {
            return;
        }

        $expiry = Carbon::parse(
            $driver->license_expiry
        )->startOfDay();

        $daysUntilExpiry =
            now()
                ->startOfDay()
                ->diffInDays(
                    $expiry,
                    false
                );

        $driverName = trim(
            ($driver->first_name ?? '') .
            ' ' .
            ($driver->last_name ?? '')
        );

        if ($driverName === '') {
            $driverName = 'Driver';
        }

        $dayLabel =
            $daysUntilExpiry === 0
                ? 'today'
                : "in {$daysUntilExpiry} day" .
                    ($daysUntilExpiry === 1 ? '' : 's');

        $eventKey =
            'driver_license_expiring:' .
            $driver->id .
            ':' .
            $expiry->format('Y-m-d');

        FleetNotificationService::createUniqueWhenEnabled(
            'licenseExpiring',
            "{$driver->driver_number} · Driver License Expiring",
            "{$driverName}'s license ({$driver->license_number}) expires {$dayLabel}.",
            $eventKey,
            true,
            route('driver')
        );
    }

    public function index()
    {
        return view('driver.index');
    }

    public function store(Request $request)
    {
        $driverSettings =
        $this->getDriverSettings();
        $requireLicenseExpiry =
            (bool) $driverSettings['requireLicenseExpiry'];
        if (!$request->filled('status')) {
            $request->merge([
                'status' =>
                    $driverSettings['defaultStatus'],
            ]);
        }

       $validator = Validator::make($request->all(), [
            'first_name'          => 'required|string|max:255',
            'last_name'           => 'required|string|max:255',
            'license_number'      => 'required|string|unique:drivers,license_number',
            'license_class'       => 'required|string',
            'license_expiry' => [
                $requireLicenseExpiry
                    ? 'required'
                    : 'nullable',
                'date',
            ],
            'contact_number'      => 'required|string|max:20',
            'email'               => 'nullable|email|max:255',
            'experience'          => 'nullable|integer|min:0',
            'address'             => 'nullable|string',
            'emergency_contact'   => 'nullable|string|max:20',
            'notes'               => 'nullable|string',
            'assigned_vehicle_id' => 'nullable|exists:vehicles,id',
            'status' => [
                'required',
                Rule::in([
                    'Available',
                    'On Leave',
                    'Inactive',
                ]),
            ],
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

        $driver = Driver::create($validated);
        /*
        |--------------------------------------------------------------------------
        | Generate Permanent Driver Number
        |--------------------------------------------------------------------------
        | Uses the database primary key so numbers stay unique and are not reused.
        */
        $driver->forceFill([
            'driver_number' =>
                'DRV-' .
                str_pad(
                    (string) $driver->id,
                    3,
                    '0',
                    STR_PAD_LEFT
                ),
        ])->save();

        $driver->refresh();

        $this->createLicenseExpiryNotification(
            $driver,
            $driverSettings['warnLicenseDays']
        );

        return response()->json([
            'success' => true,
            'message' =>
                'Driver added successfully!',
        ]);
    }

    public function show(Driver $driver)
    {
        return response()->json($driver);
    }

    public function update(Request $request, Driver $driver)
    {
        $driverSettings =
            $this->getDriverSettings();
        $requireLicenseExpiry =
            (bool) $driverSettings['requireLicenseExpiry'];

        $previousLicenseExpiry =
            $driver->license_expiry
                ? Carbon::parse(
                    $driver->license_expiry
                )->format('Y-m-d')
                : null;
        $wasExpiringSoon =
            $this->isLicenseExpiringSoon(
                $previousLicenseExpiry,
                $driverSettings['warnLicenseDays']
            );

        $validated = $request->validate([
            'first_name'         => 'required|string|max:255',
            'last_name'          => 'required|string|max:255',
            'license_number'     => ['required', 'string',
                                        Rule::unique('drivers')->ignore($driver->id),
                                    ],
            'license_class'      => 'required|string',
            'license_expiry' => [
                $requireLicenseExpiry
                    ? 'required'
                    : 'nullable',
                'date',
            ],
            'contact_number'     => 'required|string|max:20',
            'email'              => 'nullable|email|max:255',
            'experience'         => 'nullable|integer|min:0',
            'address'            => 'nullable|string',
            'emergency_contact'  => 'nullable|string|max:20',
            'notes'              => 'nullable|string',
            'photo'              => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'assigned_vehicle_id'=> 'nullable|exists:vehicles,id',
            'status' => [
                'required',
                Rule::in([
                    'Available',
                    'On Duty',
                    'On Leave',
                    'Inactive',
                ]),
            ],
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request
                ->file('photo')
                ->store('drivers', 'public');
        }

        $driver->update($validated);

        $driver->refresh();

        $currentLicenseExpiry =
            $driver->license_expiry
                ? Carbon::parse(
                    $driver->license_expiry
                )->format('Y-m-d')
                : null;

        $isExpiringSoon =
            $this->isLicenseExpiringSoon(
                $currentLicenseExpiry,
                $driverSettings['warnLicenseDays']
            );

        /*
        |--------------------------------------------------------------------------
        | License Expiry Notification
        |--------------------------------------------------------------------------
        |
        | Notify only when:
        | - license has entered the warning window, OR
        | - expiry date was changed to another date inside the warning window.
        |
        */
        $expiryChanged =
            $previousLicenseExpiry !==
            $currentLicenseExpiry;

        if (
            $isExpiringSoon &&
            (
                !$wasExpiringSoon ||
                $expiryChanged
            )
        ) {
            $this->createLicenseExpiryNotification(
                $driver,
                $driverSettings['warnLicenseDays']
            );
        }

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
        $driverSettings =
            $this->getDriverSettings();
        $warningDays =
            $driverSettings['warnLicenseDays'];
        $drivers = Driver::with('vehicle')
            ->latest()
            ->get()
            ->map(function ($driver) use ($warningDays) {
                $daysUntilExpiry = null;
                $licenseExpired = false;
                $licenseExpiringSoon = false;

                if ($driver->license_expiry) {
                    $expiry =
                        Carbon::parse(
                            $driver->license_expiry
                        )->startOfDay();
                    $today =
                        now()->startOfDay();
                    $daysUntilExpiry =
                        $today->diffInDays(
                            $expiry,
                            false
                        );
                    $licenseExpired =
                        $daysUntilExpiry < 0;
                    $licenseExpiringSoon =
                        !$licenseExpired &&
                        $daysUntilExpiry <=
                            $warningDays;
                }
                $driver->setAttribute(
                    'days_until_license_expiry',
                    $daysUntilExpiry
                );
                $driver->setAttribute(
                    'license_expired',
                    $licenseExpired
                );
                $driver->setAttribute(
                    'license_expiring_soon',
                    $licenseExpiringSoon
                );
                return $driver;
            });

        return response()->json($drivers);
    }

    public function available()
    {
        $drivers = Driver::whereNull('assigned_vehicle_id')
            ->orderBy('first_name')
            ->get([
                'id',
                'driver_number',
                'first_name',
                'last_name',
                'license_number'
            ]);

        return response()->json($drivers);
    }
}

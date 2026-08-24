<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\Maintenance;
use App\Models\FleetSetting;
use Carbon\Carbon;

class FleetNotificationCheckService
{
    private function settings(): array
    {
        $record = FleetSetting::query()
            ->latest('id')
            ->first();

        $settings =
            $record?->settings ?? [];

        return [
            'licenseWarnDays' => max(
                1,
                min(
                    180,
                    (int) (
                        $settings['drivers']['warnLicenseDays']
                        ?? 30
                    )
                )
            ),

            'maintenanceWarnDays' => max(
                1,
                min(
                    90,
                    (int) (
                        $settings['maintenance']['overdueWarnDays']
                        ?? 3
                    )
                )
            ),
        ];
    }

    public function check(): void
    {
        $settings =
            $this->settings();

        $this->checkDriverLicenses(
            $settings['licenseWarnDays']
        );

        $this->checkMaintenanceSchedules(
            $settings['maintenanceWarnDays']
        );
    }

    private function checkDriverLicenses(
        int $warningDays
    ): void {
        $today =
            now()->startOfDay();

        $maximumDate =
            now()
                ->startOfDay()
                ->addDays($warningDays);

        $drivers = Driver::query()
            ->whereNotNull('license_expiry')
            ->whereDate(
                'license_expiry',
                '>=',
                $today->toDateString()
            )
            ->whereDate(
                'license_expiry',
                '<=',
                $maximumDate->toDateString()
            )
            ->get();

        foreach ($drivers as $driver) {
            $expiry =
                Carbon::parse(
                    $driver->license_expiry
                )->startOfDay();

            $days =
                $today->diffInDays(
                    $expiry,
                    false
                );

            $name = trim(
                ($driver->first_name ?? '') .
                ' ' .
                ($driver->last_name ?? '')
            );

            if ($name === '') {
                $name = 'Driver';
            }

            $when =
                $days === 0
                    ? 'today'
                    : "in {$days} day" .
                        ($days === 1 ? '' : 's');

            $message =
                "{$name}'s license ({$driver->license_number}) expires {$when}.";

            $eventKey =
                'driver_license_expiring:' .
                $driver->id .
                ':' .
                $expiry->format('Y-m-d');

            FleetNotificationService::createUniqueWhenEnabled(
                'licenseExpiring',
                "{$driver->driver_number} · Driver License Expiring",
                $message,
                $eventKey,
                true
            );
        }
    }

    private function checkMaintenanceSchedules(
        int $warningDays
    ): void {
        /*
        |--------------------------------------------------------------------------
        | Only records with next_schedule can generate reminders
        |--------------------------------------------------------------------------
        */

        $maintenances = Maintenance::with('vehicle')
            ->whereNotNull('next_schedule')
            ->whereNotIn(
                'status',
                [
                    'Completed',
                    'Cancelled',
                ]
            )
            ->get();

        $today =
            now()->startOfDay();

        foreach ($maintenances as $maintenance) {
            $nextSchedule =
                Carbon::parse(
                    $maintenance->next_schedule
                )->startOfDay();

            $days =
                $today->diffInDays(
                    $nextSchedule,
                    false
                );

            /*
            |--------------------------------------------------------------------------
            | Ignore future records outside warning period
            |--------------------------------------------------------------------------
            */

            if ($days > $warningDays) {
                continue;
            }

            $vehicleName = trim(
                ($maintenance->vehicle?->brand ?? '') .
                ' ' .
                ($maintenance->vehicle?->model ?? '')
            );

            if ($vehicleName === '') {
                $vehicleName = 'Vehicle';
            }

            if ($days < 0) {
                $daysOverdue =
                    abs($days);

                $title =
                    'Maintenance Overdue';

                $message =
                    "{$vehicleName} maintenance {$maintenance->maintenance_number} is overdue by {$daysOverdue} day" .
                    ($daysOverdue === 1 ? '' : 's') .
                    '.';
            } else {
                $when =
                    $days === 0
                        ? 'today'
                        : "in {$days} day" .
                            ($days === 1 ? '' : 's');

                $title =
                    'Maintenance Due Soon';

                $message =
                    "{$vehicleName} maintenance {$maintenance->maintenance_number} is due {$when}.";
            }

            $eventKey =
                'maintenance_due:' .
                $maintenance->id .
                ':' .
                $nextSchedule->format('Y-m-d');

            FleetNotificationService::createUniqueWhenEnabled(
                'maintenanceDue',
                $title,
                $message,
                $eventKey,
                true
            );
        }
    }
}
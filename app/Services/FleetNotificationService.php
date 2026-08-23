<?php

namespace App\Services;

use App\Models\FleetNotification;
use App\Models\FleetSetting;

class FleetNotificationService
{
    /**
     * Check if a notification preference is enabled.
     */
    public static function enabled(
        string $key,
        bool $default = true
    ): bool {
        $record = FleetSetting::query()
            ->latest('id')
            ->first();

        $settings =
            $record?->settings ?? [];

        $notificationSettings =
            $settings['notifications'] ?? [];

        if (
            !array_key_exists(
                $key,
                $notificationSettings
            )
        ) {
            return $default;
        }

        return (bool)
            $notificationSettings[$key];
    }

    /**
     * Create notification for current user.
     */
    public static function create(
        string $title,
        string $message,
        ?string $link = null
    ): ?FleetNotification {
        $userId = auth()->id();

        if (!$userId) {
            return null;
        }

        return FleetNotification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'status' => 'Unread',
            'link' => $link,
        ]);
    }

    /**
     * Create notification if setting is enabled.
     */
    public static function createWhenEnabled(
        string $settingKey,
        string $title,
        string $message,
        bool $default = true,
        ?string $link = null
    ): ?FleetNotification {
        if (!self::enabled($settingKey, $default)) {
            return null;
        }

        return self::create(
            title: $title,
            message: $message,
            link: $link,
        );
    }

    /**
     * Create unique notification if setting is enabled.
     */
    public static function createUniqueWhenEnabled(
        string $settingKey,
        string $title,
        string $message,
        string $eventKey,
        bool $default = true,
        ?string $link = null
    ): ?FleetNotification {
        if (!self::enabled($settingKey, $default)) {
            return null;
        }

        $userId = auth()->id();

        if (!$userId) {
            return null;
        }

        $existing = FleetNotification::query()
            ->where('user_id', $userId)
            ->where('event_key', $eventKey)
            ->first();

        /*
        |--------------------------------------------------------------------------
        | Existing notification
        |--------------------------------------------------------------------------
        |
        | Do not create a duplicate, but repair/update missing metadata such
        | as the destination link.
        |--------------------------------------------------------------------------
        */

        if ($existing) {
            $updates = [];

            if (
                (!$existing->link || trim((string) $existing->link) === '') &&
                $link
            ) {
                $updates['link'] = $link;
            }

            if (!empty($updates)) {
                $existing->update($updates);
                $existing->refresh();
            }

            return $existing;
        }

        return FleetNotification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'status' => 'Unread',
            'event_key' => $eventKey,
            'link' => $link,
        ]);
    }
}
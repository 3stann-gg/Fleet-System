<?php

namespace App\Http\Controllers;

use App\Models\FleetNotification;
use App\Services\FleetNotificationCheckService;
use Illuminate\Support\Facades\Auth;

class FleetNotificationController extends Controller
{
    /**
     * Get notifications for the current user.
     */
    public function index(
        FleetNotificationCheckService $checker
    ) {
        $checker->check();

        $notifications =
            FleetNotification::query()
                ->where(
                    'user_id',
                    Auth::id()
                )
                ->latest('id')
                ->limit(30)
                ->get();

        return response()->json([
            'notifications' =>
                $notifications,

            'unread_count' =>
                $notifications
                    ->where(
                        'status',
                        'Unread'
                    )
                    ->count(),
        ]);
    }

    /**
     * Mark one notification as read.
     */
    public function markRead(
        FleetNotification $notification
    ) {
        if (
            (int) $notification->user_id !==
            (int) Auth::id()
        ) {
            abort(403);
        }

        $notification->update([
            'status' => 'Read',
        ]);

        return response()->json([
            'success' => true,
            'message' =>
                'Notification marked as read.',
        ]);
    }

    /**
     * Mark all current user's notifications as read.
     */
    public function markAllRead()
    {
        FleetNotification::query()
            ->where(
                'user_id',
                Auth::id()
            )
            ->where(
                'status',
                'Unread'
            )
            ->update([
                'status' => 'Read',
            ]);

        return response()->json([
            'success' => true,
            'message' =>
                'All notifications marked as read.',
        ]);
    }
}
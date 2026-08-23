<?php

namespace App\Http\Controllers;

use App\Models\FleetSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class SettingsController extends Controller
{
    public function index(): View
    {
        return view('settings.index');
    }

    public function show(): JsonResponse
    {
        $record = FleetSetting::query()
            ->latest('id')
            ->first();

        return response()->json([
            'settings' => $record?->settings,
            'updated_at' => $record?->updated_at,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => [
                'required',
                'array',
            ],
        ]);

        $record = FleetSetting::query()
            ->latest('id')
            ->first();

        if (!$record) {
            $record = new FleetSetting();
        }

        $record->settings =
            $validated['settings'];

        $record->updated_by =
            $request->user()?->id;

        $record->save();

        return response()->json([
            'message' =>
                'Fleet settings saved successfully.',

            'settings' =>
                $record->settings,

            'updated_at' =>
                $record->updated_at,
        ]);
    }

    public function reset(Request $request): JsonResponse
    {
        $record = FleetSetting::query()
            ->latest('id')
            ->first();

        if ($record) {
            $record->delete();
        }

        return response()->json([
            'message' =>
                'Fleet settings reset successfully.',
        ]);
    }
}
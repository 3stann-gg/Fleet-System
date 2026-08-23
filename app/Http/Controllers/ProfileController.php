<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class ProfileController extends Controller
{
    /**
     * Display the user's profile page.
     */
    public function edit(Request $request): View
    {
        return view('profile.index', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(
        ProfileUpdateRequest $request
    ): RedirectResponse {
        $user = $request->user();

        $validated = $request->validated();

        /*
        |--------------------------------------------------------------------------
        | Remove profile photo if requested
        |--------------------------------------------------------------------------
        */

        if (
            $request->boolean(
                'remove_profile_photo'
            )
        ) {
            if (
                $user->profile_photo &&
                Storage::disk('public')
                    ->exists(
                        $user->profile_photo
                    )
            ) {
                Storage::disk('public')
                    ->delete(
                        $user->profile_photo
                    );
            }

            $user->profile_photo = null;
        }

        /*
        |--------------------------------------------------------------------------
        | Upload new profile photo
        |--------------------------------------------------------------------------
        */

        if (
            $request->hasFile(
                'profile_photo'
            )
        ) {
            if (
                $user->profile_photo &&
                Storage::disk('public')
                    ->exists(
                        $user->profile_photo
                    )
            ) {
                Storage::disk('public')
                    ->delete(
                        $user->profile_photo
                    );
            }

            $validated[
                'profile_photo'
            ] =
                $request
                    ->file(
                        'profile_photo'
                    )
                    ->store(
                        'profile-photos',
                        'public'
                    );
        } else {
            unset(
                $validated[
                    'profile_photo'
                ]
            );
        }

        unset(
            $validated[
                'remove_profile_photo'
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Email verification reset
        |--------------------------------------------------------------------------
        */

        if (
            isset(
                $validated['email']
            ) &&
            $validated['email'] !==
                $user->email
        ) {
            $user->email_verified_at =
                null;
        }

        /*
        |--------------------------------------------------------------------------
        | Update allowed profile information
        |--------------------------------------------------------------------------
        */

        $user->fill(
            $validated
        );

        $user->save();

        return Redirect::route(
            'profile.edit'
        )->with(
            'status',
            'profile-updated'
        );
    }

    /**
     * Delete the user's account.
     */
    public function destroy(
        Request $request
    ): RedirectResponse {
        $request->validateWithBag(
            'userDeletion',
            [
                'password' => [
                    'required',
                    'current_password',
                ],
            ]
        );

        $user =
            $request->user();

        /*
        |--------------------------------------------------------------------------
        | Delete stored profile photo
        |--------------------------------------------------------------------------
        */

        if (
            $user->profile_photo &&
            Storage::disk('public')
                ->exists(
                    $user->profile_photo
                )
        ) {
            Storage::disk('public')
                ->delete(
                    $user->profile_photo
                );
        }

        Auth::logout();

        $user->delete();

        $request
            ->session()
            ->invalidate();

        $request
            ->session()
            ->regenerateToken();

        return Redirect::to('/');
    }
}
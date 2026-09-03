<section
    class="card profile-card"
    aria-labelledby="updatePasswordHeading"
>
    <div class="card-header">
        <div>
            <h3 id="updatePasswordHeading">
                Update Password
            </h3>

            <p class="card-subtitle">
                Use a strong and unique password to keep your account secure.
            </p>
        </div>
    </div>

    <form
        method="POST"
        action="{{ route('password.update') }}"
        id="updatePasswordForm"
        class="profile-password-form"
    >
        @csrf
        @method('put')

        <div class="form-grid">

            {{-- Current Password --}}
            <div class="form-group full-width">
                <label for="update_password_current_password">
                    Current Password *
                </label>

                <div class="password-input-wrapper">
                    <input
                        id="update_password_current_password"
                        name="current_password"
                        type="password"
                        autocomplete="current-password"
                        required
                        class="@if($errors->updatePassword->has('current_password')) is-invalid @endif"
                    >

                    <button
                        type="button"
                        class="password-toggle-btn"
                        data-password-toggle="update_password_current_password"
                        aria-label="Show current password"
                    >
                        <i class="ph ph-eye"></i>
                    </button>
                </div>

                @if ($errors->updatePassword->has('current_password'))
                    <p
                        class="profile-field-error"
                        id="update_password_current_passwordError"
                    >
                        {{ $errors->updatePassword->first('current_password') }}
                    </p>
                @endif
            </div>

            {{-- New Password --}}
            <div class="form-group">
                <label for="update_password_password">
                    New Password *
                </label>

                <div class="password-input-wrapper">
                    <input
                        id="update_password_password"
                        name="password"
                        type="password"
                        autocomplete="new-password"
                        required
                        class="@if($errors->updatePassword->has('password')) is-invalid @endif"
                    >

                    <button
                        type="button"
                        class="password-toggle-btn"
                        data-password-toggle="update_password_password"
                        aria-label="Show new password"
                    >
                        <i class="ph ph-eye"></i>
                    </button>
                </div>

                @if ($errors->updatePassword->has('password'))
                    <p
                        class="profile-field-error"
                        id="update_password_passwordError"
                    >
                        {{ $errors->updatePassword->first('password') }}
                    </p>
                @endif
            </div>

            {{-- Confirm Password --}}
            <div class="form-group">
                <label for="update_password_password_confirmation">
                    Confirm New Password *
                </label>

                <div class="password-input-wrapper">
                    <input
                        id="update_password_password_confirmation"
                        name="password_confirmation"
                        type="password"
                        autocomplete="new-password"
                        required
                    >

                    <button
                        type="button"
                        class="password-toggle-btn"
                        data-password-toggle="update_password_password_confirmation"
                        aria-label="Show password confirmation"
                    >
                        <i class="ph ph-eye"></i>
                    </button>
                </div>

                @if ($errors->updatePassword->has('password_confirmation'))
                    <p
                        class="profile-field-error"
                        id="update_password_password_confirmationError"
                    >
                        {{ $errors->updatePassword->first('password_confirmation') }}
                    </p>
                @endif
            </div>

        </div>

        <div class="profile-password-actions">
            <button
                type="submit"
                class="btn-primary"
                id="updatePasswordSubmitBtn"
            >
                <i
                    class="ph ph-lock-key"
                    aria-hidden="true"
                ></i>

                Update Password
            </button>
        </div>
    </form>
</section>
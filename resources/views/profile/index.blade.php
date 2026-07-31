@extends('layouts.app')

@section('title', 'My Profile | HIMS Fleet')

@section('content')

        <section class="page-wrapper">
          <div class="vehicle-page profile-page" id="userProfilePage">
            <div class="page-header">
              <div>
                <h1>My Profile</h1>
                <p>View and manage your Fleet account information.</p>
                <p class="profile-last-updated" id="profileLastUpdated">
                  Last updated: —
                </p>
              </div>
            </div>

            <form class="profile-layout" id="userProfileForm" novalidate>
              <!-- Overview -->
              <aside class="card profile-overview-card" aria-labelledby="profileOverviewName">
                <div class="profile-overview-body">
                  <div class="profile-avatar-preview" id="profileAvatarPreview">
                    <span id="profileAvatarInitials">TD</span>
                    <img id="profileAvatarImage" alt="" hidden />
                  </div>
                  <h2 class="profile-overview-name" id="profileOverviewName">
                    Tristan Dave
                  </h2>
                  <p class="profile-overview-meta" id="profileOverviewRole">
                    Fleet Administrator
                  </p>
                  <p class="profile-overview-meta" id="profileOverviewDepartment">
                    Fleet &amp; Transportation Management
                  </p>
                  <p class="profile-overview-meta" id="profileOverviewEmail">
                    No email on file
                  </p>
                  <span class="status-badge available" id="profileOverviewStatus">
                    Active
                  </span>
                  <div class="profile-photo-actions">
                    <button type="button" class="btn-outline btn-sm" id="profileChangePhotoBtn">
                      <i class="ph ph-camera" aria-hidden="true"></i>
                      Change Photo
                    </button>
                    <button
                      type="button"
                      class="btn-outline btn-sm"
                      id="profileRemovePhotoBtn"
                      hidden
                    >
                      Remove Photo
                    </button>
                    <input
                      type="file"
                      id="profilePhotoInput"
                      accept="image/*"
                      hidden
                      aria-label="Choose profile photo"
                    />
                  </div>
                </div>
              </aside>

              <div class="profile-main">
                <!-- Personal -->
                <section class="card profile-card" aria-labelledby="personalHeading">
                  <div class="card-header">
                    <div>
                      <h3 id="personalHeading">Personal Information</h3>
                      <p class="card-subtitle">Name and operational assignment details.</p>
                    </div>
                  </div>
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="profileFirstName">First Name *</label>
                      <input type="text" id="profileFirstName" maxlength="60" required autocomplete="given-name" />
                      <p class="profile-field-error" id="profileFirstNameError" hidden></p>
                    </div>
                    <div class="form-group">
                      <label for="profileMiddleName">Middle Name</label>
                      <input type="text" id="profileMiddleName" maxlength="60" autocomplete="additional-name" />
                    </div>
                    <div class="form-group">
                      <label for="profileLastName">Last Name *</label>
                      <input type="text" id="profileLastName" maxlength="60" required autocomplete="family-name" />
                      <p class="profile-field-error" id="profileLastNameError" hidden></p>
                    </div>
                    <div class="form-group">
                      <label for="profileDisplayName">Display Name *</label>
                      <input type="text" id="profileDisplayName" maxlength="120" required autocomplete="name" />
                      <p class="profile-field-error" id="profileDisplayNameError" hidden></p>
                    </div>
                    <div class="form-group">
                      <label for="profileEmployeeId">Employee ID</label>
                      <input type="text" id="profileEmployeeId" maxlength="40" placeholder="Optional sample ID" />
                      <p class="form-helper">Frontend sample field only — not a hospital-issued ID.</p>
                    </div>
                    <div class="form-group">
                      <label for="profileDepartment">Department *</label>
                      <input type="text" id="profileDepartment" maxlength="120" required />
                      <p class="profile-field-error" id="profileDepartmentError" hidden></p>
                    </div>
                    <div class="form-group full-width">
                      <label for="profileJobTitle">Job Title *</label>
                      <input type="text" id="profileJobTitle" maxlength="120" required />
                      <p class="profile-field-error" id="profileJobTitleError" hidden></p>
                    </div>
                  </div>
                </section>

                <!-- Contact -->
                <section class="card profile-card" aria-labelledby="contactHeading">
                  <div class="card-header">
                    <div>
                      <h3 id="contactHeading">Contact Information</h3>
                      <p class="card-subtitle">How the operations team can reach you.</p>
                    </div>
                  </div>
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="profileEmail">Email Address</label>
                      <input type="email" id="profileEmail" maxlength="120" autocomplete="email" />
                      <p class="profile-field-error" id="profileEmailError" hidden></p>
                    </div>
                    <div class="form-group">
                      <label for="profileMobile">Mobile Number</label>
                      <input type="tel" id="profileMobile" maxlength="40" autocomplete="tel" />
                      <p class="profile-field-error" id="profileMobileError" hidden></p>
                    </div>
                    <div class="form-group">
                      <label for="profileExtension">Office Extension</label>
                      <input type="text" id="profileExtension" maxlength="20" />
                    </div>
                    <div class="form-group">
                      <label for="profileLocation">Office Location</label>
                      <input type="text" id="profileLocation" maxlength="200" />
                    </div>
                  </div>
                </section>

                <!-- Account (read-only) -->
                <section class="card profile-card" aria-labelledby="accountHeading">
                  <div class="card-header">
                    <div>
                      <h3 id="accountHeading">Account Information</h3>
                      <p class="card-subtitle">Read-only account metadata for this frontend session.</p>
                    </div>
                    <a href="../settings/index.html" class="btn-outline">
                      Account Settings
                    </a>
                  </div>
                  <div class="profile-readonly-grid">
                    <div class="profile-readonly-item">
                      <label>Username</label>
                      <p id="profileAccountUsername">tdave</p>
                    </div>
                    <div class="profile-readonly-item">
                      <label>Role</label>
                      <p id="profileAccountRole">Fleet Administrator</p>
                    </div>
                    <div class="profile-readonly-item">
                      <label>Account Status</label>
                      <p id="profileAccountStatus">Active</p>
                    </div>
                    <div class="profile-readonly-item">
                      <label>Last Sign-in</label>
                      <p id="profileAccountLastSignIn">—</p>
                    </div>
                    <div class="profile-readonly-item">
                      <label>Theme Preference</label>
                      <p id="profileAccountTheme">Light</p>
                    </div>
                  </div>
                </section>

                <div class="profile-action-bar" id="profileActionBar">
                  <div class="profile-action-meta">
                    <span id="profileDirtyHint">All changes saved</span>
                    <span class="profile-unsaved-badge" id="profileDirtyBadge" hidden>
                      Unsaved changes
                    </span>
                  </div>
                  <div class="profile-action-buttons">
                    <button type="button" class="btn-outline" id="profileResetBtn" disabled>
                      Reset Changes
                    </button>
                    <button type="submit" class="btn-primary" id="profileSaveBtn" disabled>
                      <i class="ph ph-floppy-disk" aria-hidden="true"></i>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>

    @push('scripts')
    
    <script src="{{ asset('assets/js/core/user-profile.js') }}"></script>
    <script src="{{ asset('assets/js/profile/profile-page.js') }}"></script>
    
    @endpush

@endsection
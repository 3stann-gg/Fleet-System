/* ==========================================
   User Profile Page Controller

   Laravel / MySQL backed.
   JavaScript handles UI behavior only.
========================================== */

let profilePageInitialized = false;
let profileBaseline = null;
let profileDirty = false;
let profileSaving = false;
let profilePhotoChanged = false;
let profilePhotoRemoved = false;
let profilePreviewUrl = null;

/* ==========================================
   COMMON HELPERS
========================================== */
function profileToast(message, type = "info") {
    if (typeof showToast === "function") {
        showToast(message, type);
    }
}

function profileSetText(id, text) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = text ?? "";
    }
}

function profileGetValue(id) {
    const element = document.getElementById(id);
    return element ? String(element.value || "").trim() : "";
}

function profileSetError(id, message) {
    const input = document.getElementById(id);
    const errorElement = document.getElementById(id + "Error");

    if (input) {
        if (message) {
            input.setAttribute("aria-invalid", "true");
            input.classList.add("is-invalid");
        } else {
            input.removeAttribute("aria-invalid");
            input.classList.remove("is-invalid");
        }
    }

    if (errorElement) {
        errorElement.textContent = message || "";

        errorElement.hidden = !message;
    }
}

function profileClearErrors() {
    [
        "profileFirstName",
        "profileLastName",
        "profileDisplayName",
        "profileDepartment",
        "profileJobTitle",
        "profileEmail",
        "profileMobile",
    ].forEach((id) => {
        profileSetError(id, "");
    });
}

// LARAVEL PASSWORDTOGGLE
function initPasswordToggles() {
    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
        button.addEventListener("click", () => {
            const inputId = button.getAttribute("data-password-toggle");
            const input = document.getElementById(inputId);
            if (!input) {
                return;
            }
            const showing = input.type === "text";
            input.type = showing ? "password" : "text";
            const icon = button.querySelector("i");
            if (icon) {
                icon.className = showing ? "ph ph-eye" : "ph ph-eye-slash";
            }
            button.setAttribute(
                "aria-label",
                showing ? "Show password" : "Hide password",
            );
        });
    });
}

/* ==========================================
   PROFILE STATE
========================================== */
function readProfileFormState() {
    return {
        firstName: profileGetValue("profileFirstName"),
        middleName: profileGetValue("profileMiddleName"),
        lastName: profileGetValue("profileLastName"),
        displayName: profileGetValue("profileDisplayName"),
        employeeId: profileGetValue("profileEmployeeId"),
        department: profileGetValue("profileDepartment"),
        jobTitle: profileGetValue("profileJobTitle"),
        email: profileGetValue("profileEmail"),
        mobile: profileGetValue("profileMobile"),
        extension: profileGetValue("profileExtension"),
        location: profileGetValue("profileLocation"),
    };
}

function captureProfileBaseline() {
    profileBaseline = JSON.stringify(readProfileFormState());
    profilePhotoChanged = false;
    profilePhotoRemoved = false;
    profileDirty = false;
    updateProfileDirtyUi();
}

function calculateProfileDirty() {
    const current = JSON.stringify(readProfileFormState());

    return (
        current !== profileBaseline ||
        profilePhotoChanged ||
        profilePhotoRemoved
    );
}

function updateProfileDirtyUi() {
    profileDirty = calculateProfileDirty();

    const saveButton = document.getElementById("profileSaveBtn");
    const resetButton = document.getElementById("profileResetBtn");
    const badge = document.getElementById("profileDirtyBadge");
    const hint = document.getElementById("profileDirtyHint");

    if (saveButton) {
        saveButton.disabled = !profileDirty || profileSaving;
    }
    if (resetButton) {
        resetButton.disabled = !profileDirty || profileSaving;
    }
    if (badge) {
        badge.hidden = !profileDirty;
    }
    if (hint) {
        hint.textContent = profileDirty
            ? "You have unsaved changes"
            : "All changes saved";
    }
}

/* ==========================================
   VALIDATION
========================================== */
function isValidProfileEmail(value) {
    if (!value) {
        return false;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidProfilePhone(value) {
    if (!value) {
        return true;
    }
    const digits = value.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
}

function validateProfileForm() {
    profileClearErrors();
    let valid = true;

    const firstName = profileGetValue("profileFirstName");
    const lastName = profileGetValue("profileLastName");
    const displayName = profileGetValue("profileDisplayName");
    const department = profileGetValue("profileDepartment");
    const jobTitle = profileGetValue("profileJobTitle");
    const email = profileGetValue("profileEmail");
    const mobile = profileGetValue("profileMobile");

    if (!firstName) {
        profileSetError("profileFirstName", "First name is required.");
        valid = false;
    }
    if (!lastName) {
        profileSetError("profileLastName", "Last name is required.");
        valid = false;
    }
    if (!displayName) {
        profileSetError("profileDisplayName", "Display name is required.");
        valid = false;
    }
    if (!department) {
        profileSetError("profileDepartment", "Department is required.");
        valid = false;
    }
    if (!jobTitle) {
        profileSetError("profileJobTitle", "Job title is required.");
        valid = false;
    }
    if (!isValidProfileEmail(email)) {
        profileSetError("profileEmail", "Enter a valid email address.");
        valid = false;
    }
    if (!isValidProfilePhone(mobile)) {
        profileSetError("profileMobile", "Enter a valid mobile number.");
        valid = false;
    }
    if (!valid) {
        document.querySelector("#userProfileForm .is-invalid")?.focus();
    }
    return valid;
}

/* ==========================================
   LIVE PROFILE OVERVIEW
========================================== */
function getProfileInitialsFromForm() {
    const firstName = profileGetValue("profileFirstName");
    const lastName = profileGetValue("profileLastName");
    const displayName = profileGetValue("profileDisplayName");
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    if (initials) {
        return initials;
    }
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (
            parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase() || "U";
}

function applyProfileLivePreview() {
    const displayName = profileGetValue("profileDisplayName") || "User";
    const department =
        profileGetValue("profileDepartment") || "No department assigned";
    const email = profileGetValue("profileEmail") || "No email on file";
    profileSetText("profileOverviewName", displayName);
    profileSetText("profileOverviewDepartment", department);
    profileSetText("profileOverviewEmail", email);
    profileSetText("profileAccountUsername", displayName);
    const initials = document.getElementById("profileAvatarInitials");
    const image = document.getElementById("profileAvatarImage");
    const preview = document.getElementById("profileAvatarPreview");
    if (!image || !initials || !preview) {
        return;
    }
    if (!image.hidden && image.src) {
        initials.hidden = true;
        preview.classList.add("has-photo");
    } else {
        initials.textContent = getProfileInitialsFromForm();
        initials.hidden = false;
        preview.classList.remove("has-photo");
    }
}

/* ==========================================
   PROFILE PHOTO PREVIEW
========================================== */
function clearProfilePreviewUrl() {
    if (profilePreviewUrl) {
        URL.revokeObjectURL(profilePreviewUrl);
        profilePreviewUrl = null;
    }
}

function previewProfilePhoto(file) {
    if (!file) {
        return false;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
        profileToast("Profile photo must be JPG, PNG, or WEBP.", "warning");
        return false;
    }

    if (file.size > 2 * 1024 * 1024) {
        profileToast("Profile photo must not exceed 2 MB.", "warning");
        return false;
    }

    clearProfilePreviewUrl();
    profilePreviewUrl = URL.createObjectURL(file);
    const image = document.getElementById("profileAvatarImage");
    const initials = document.getElementById("profileAvatarInitials");
    const preview = document.getElementById("profileAvatarPreview");
    if (image) {
        image.src = profilePreviewUrl;
        image.alt =
            (profileGetValue("profileDisplayName") || "User") +
            " profile photo";
        image.hidden = false;
    }
    if (initials) {
        initials.hidden = true;
    }
    if (preview) {
        preview.classList.add("has-photo");
    }
    const removeButton = document.getElementById("profileRemovePhotoBtn");
    if (removeButton) {
        removeButton.hidden = false;
        removeButton.disabled = false;
    }
    const removeInput = document.getElementById("removeProfilePhoto");
    if (removeInput) {
        removeInput.value = "0";
    }
    profilePhotoChanged = true;
    profilePhotoRemoved = false;
    updateProfileDirtyUi();
    return true;
}

function removeProfilePhotoPreview() {
    clearProfilePreviewUrl();
    const photoInput = document.getElementById("profilePhotoInput");
    if (photoInput) {
        photoInput.value = "";
    }
    const image = document.getElementById("profileAvatarImage");
    const initials = document.getElementById("profileAvatarInitials");
    const preview = document.getElementById("profileAvatarPreview");
    if (image) {
        image.removeAttribute("src");
        image.hidden = true;
    }
    if (initials) {
        initials.textContent = getProfileInitialsFromForm();
        initials.hidden = false;
    }
    if (preview) {
        preview.classList.remove("has-photo");
    }
    const removeButton = document.getElementById("profileRemovePhotoBtn");
    if (removeButton) {
        removeButton.hidden = true;
        removeButton.disabled = true;
    }
    const removeInput = document.getElementById("removeProfilePhoto");
    if (removeInput) {
        removeInput.value = "1";
    }
    profilePhotoChanged = false;
    profilePhotoRemoved = true;
    updateProfileDirtyUi();
}

/* ==========================================
   RESET
========================================== */
function resetUserProfilePage() {
    const form = document.getElementById("userProfileForm");
    if (!form) {
        return;
    }
    clearProfilePreviewUrl();
    form.reset();
    const removeInput = document.getElementById("removeProfilePhoto");
    if (removeInput) {
        removeInput.value = "0";
    }
    /*
     * Because form.reset() restores the
     * server-rendered original image state,
     * reload is the cleanest way to restore
     * the full profile preview exactly.
     */
    window.location.reload();
}

/* ==========================================
   FORM SUBMISSION
========================================== */
function prepareProfileSubmission(event) {
    if (profileSaving) {
        event.preventDefault();
        return;
    }
    if (!validateProfileForm()) {
        event.preventDefault();
        profileToast("Please correct the highlighted fields.", "warning");
        return;
    }
    profileSaving = true;

    /*
  |--------------------------------------------------------------------------
  | IMPORTANT
  |--------------------------------------------------------------------------
  |
  | DO NOT preventDefault here.
  |
  | Browser submits the real multipart form:
  |
  | PATCH /profile
  | → ProfileUpdateRequest
  | → ProfileController@update
  | → MySQL / storage
  |
  */
    profileDirty = false;
    const saveButton = document.getElementById("profileSaveBtn");
    const resetButton = document.getElementById("profileResetBtn");
    const hint = document.getElementById("profileDirtyHint");
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = `
      <i class="ph ph-spinner"></i>
      Saving...
    `;
    }
    if (resetButton) {
        resetButton.disabled = true;
    }
    if (hint) {
        hint.textContent = "Saving changes...";
    }
}

// LARAVEL DELETE 
function initDeleteAccountModal() {
    const modal = document.getElementById("deleteAccountModal");
    const openButton = document.getElementById("openDeleteAccountModal");
    const closeButton = document.getElementById("closeDeleteAccountModal");
    const cancelButton = document.getElementById("cancelDeleteAccountBtn");
    const passwordInput = document.getElementById("delete_account_password");
    if (!modal) {
        return;
    }
    function openModal() {
        modal.hidden = false;
        document.body.classList.add("modal-open");
        setTimeout(() => {
            passwordInput?.focus();
        }, 50);
    }
    function closeModal() {
        modal.hidden = true;
        document.body.classList.remove("modal-open");
        if (passwordInput) {
            passwordInput.value = "";
        }
    }
    openButton?.addEventListener("click", openModal);
    closeButton?.addEventListener("click", closeModal);
    cancelButton?.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });
    /*
     * If Laravel redirects back because
     * the entered password was incorrect,
     * automatically reopen the modal.
     */
    const hasDeletionError = document.getElementById(
        "deleteAccountPasswordError",
    );
    if (hasDeletionError) {
        openModal();
    }
}

function initProfilePage() {
    if (profilePageInitialized) {
        return;
    }
    if (!document.getElementById("userProfilePage")) {
        return;
    }
    profilePageInitialized = true;
    const form = document.getElementById("userProfileForm");
    const photoInput = document.getElementById("profilePhotoInput");

    /*
  |--------------------------------------------------------------------------
  | Baseline is server-rendered DB data
  |--------------------------------------------------------------------------
  */
    captureProfileBaseline();
    applyProfileLivePreview();
    if (typeof syncUserProfileUI === "function") {
        syncUserProfileUI();
    }

    /*
  |--------------------------------------------------------------------------
  | Form Changes
  |--------------------------------------------------------------------------
  */
    form?.addEventListener("input", () => {
        applyProfileLivePreview();
        updateProfileDirtyUi();
    });
    form?.addEventListener("change", () => {
        applyProfileLivePreview();
        updateProfileDirtyUi();
    });

    /*
  |--------------------------------------------------------------------------
  | Real Laravel submission
  |--------------------------------------------------------------------------
  */
    form?.addEventListener("submit", prepareProfileSubmission);

    /*
  |--------------------------------------------------------------------------
  | Reset Changes
  |--------------------------------------------------------------------------
  */
    document
        .getElementById("profileResetBtn")
        ?.addEventListener("click", (event) => {
            event.preventDefault();
            if (!profileDirty) {
                return;
            }
            resetUserProfilePage();
        });

    /*
  |--------------------------------------------------------------------------
  | Change Photo
  |--------------------------------------------------------------------------
  */
    document
        .getElementById("profileChangePhotoBtn")
        ?.addEventListener("click", (event) => {
            event.preventDefault();

            photoInput?.click();
        });

    /*
  |--------------------------------------------------------------------------
  | Photo Selected
  |--------------------------------------------------------------------------
  */
    photoInput?.addEventListener("change", (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        const valid = previewProfilePhoto(file);

        /*
         * Clear only invalid selections.
         * Valid file MUST stay in the input
         * so Laravel receives it.
         */
        if (!valid) {
            event.target.value = "";
        } else {
            profileToast(
                "Photo preview ready. Save changes to upload it.",
                "success",
            );
        }
    });

    /*
  |--------------------------------------------------------------------------
  | Remove Photo
  |--------------------------------------------------------------------------
  */
    document
        .getElementById("profileRemovePhotoBtn")
        ?.addEventListener("click", (event) => {
            event.preventDefault();
            removeProfilePhotoPreview();
            profileToast(
                "Profile photo marked for removal. Save changes to continue.",
                "info",
            );
        });

    /*
  |--------------------------------------------------------------------------
  | Warn before leaving with unsaved changes
  |--------------------------------------------------------------------------
  */
    window.addEventListener("beforeunload", (event) => {
        if (!profileDirty || profileSaving) {
            return;
        }
        event.preventDefault();
        event.returnValue = "";
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProfilePage);
} else {
    initProfilePage();
    initPasswordToggles();
    initDeleteAccountModal();
}

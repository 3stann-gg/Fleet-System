/* ==========================================
   User Profile page controller
========================================== */

let profilePageInitialized = false;
let profileBaseline = null;
let profileDirty = false;
let profileSessionAvatar = null;
let profileSaving = false;

function profileToast(message, type) {
  if (typeof showToast === "function") {
    showToast(message, type || "info");
  }
}

function profileClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function profileSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function profileSetValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value == null ? "" : String(value);
}

function profileGetValue(id) {
  const el = document.getElementById(id);
  return el ? String(el.value || "").trim() : "";
}

function profileSetError(id, message) {
  const input = document.getElementById(id);
  const err = document.getElementById(id + "Error");
  if (input) {
    if (message) {
      input.setAttribute("aria-invalid", "true");
      input.classList.add("is-invalid");
    } else {
      input.removeAttribute("aria-invalid");
      input.classList.remove("is-invalid");
    }
  }
  if (err) {
    err.textContent = message || "";
    err.hidden = !message;
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
  ].forEach((id) => profileSetError(id, ""));
}

function profileThemeLabel() {
  if (typeof getThemePreference === "function") {
    const pref = getThemePreference();
    if (pref === "dark") return "Dark";
    if (pref === "system") return "System";
    return "Light";
  }
  if (typeof getSavedTheme === "function") {
    return getSavedTheme() === "dark" ? "Dark" : "Light";
  }
  return "Light";
}

function applyProfileToOverview(profile) {
  const p = profile || getUserProfile();
  const initials = getUserInitials(p);
  const preview = document.getElementById("profileAvatarPreview");
  const initialsEl = document.getElementById("profileAvatarInitials");
  const img = document.getElementById("profileAvatarImage");

  profileSetText("profileOverviewName", p.displayName || "User");
  profileSetText("profileOverviewRole", p.role || "Fleet Administrator");
  profileSetText(
    "profileOverviewDepartment",
    p.department || "Fleet & Transportation Management",
  );
  profileSetText("profileOverviewEmail", p.email || "No email on file");
  profileSetText("profileOverviewStatus", p.accountStatus || "Active");

  const avatarSrc = profileSessionAvatar || p.avatar;
  if (img && initialsEl && preview) {
    if (avatarSrc) {
      img.src = avatarSrc;
      img.alt = (p.displayName || "User") + " profile photo";
      img.hidden = false;
      initialsEl.hidden = true;
      preview.classList.add("has-photo");
    } else {
      img.removeAttribute("src");
      img.hidden = true;
      initialsEl.hidden = false;
      initialsEl.textContent = initials;
      preview.classList.remove("has-photo");
    }
  }

  const removeBtn = document.getElementById("profileRemovePhotoBtn");
  if (removeBtn) {
    removeBtn.hidden = !avatarSrc;
    removeBtn.disabled = !avatarSrc;
  }

  profileSetText("profileAccountUsername", p.username || "—");
  profileSetText("profileAccountRole", p.role || "Fleet Administrator");
  profileSetText("profileAccountStatus", p.accountStatus || "Active");
  profileSetText("profileAccountTheme", profileThemeLabel());

  if (p.lastSignIn) {
    const d = new Date(p.lastSignIn);
    profileSetText(
      "profileAccountLastSignIn",
      Number.isNaN(d.getTime()) ? "—" : d.toLocaleString(),
    );
  } else {
    profileSetText("profileAccountLastSignIn", "Not recorded");
  }

  if (p.updatedAt) {
    const u = new Date(p.updatedAt);
    profileSetText(
      "profileLastUpdated",
      Number.isNaN(u.getTime())
        ? "Last updated: —"
        : "Last updated: " + u.toLocaleString(),
    );
  } else {
    profileSetText("profileLastUpdated", "Last updated: Not saved yet");
  }
}

function applyProfileToForm(profile) {
  const p = profile || getUserProfile();
  profileSetValue("profileFirstName", p.firstName);
  profileSetValue("profileMiddleName", p.middleName);
  profileSetValue("profileLastName", p.lastName);
  profileSetValue("profileDisplayName", p.displayName);
  profileSetValue("profileEmployeeId", p.employeeId);
  profileSetValue("profileDepartment", p.department);
  profileSetValue("profileJobTitle", p.jobTitle);
  profileSetValue("profileEmail", p.email);
  profileSetValue("profileMobile", p.mobile);
  profileSetValue("profileExtension", p.extension);
  profileSetValue("profileLocation", p.location);
  profileSessionAvatar = p.avatar || null;
  applyProfileToOverview(p);
  profileClearErrors();
}

function readProfileFromForm() {
  const current = getUserProfile();
  return normalizeUserProfile({
    ...current,
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
    avatar: profileSessionAvatar,
  });
}

function isValidEmail(value) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  if (!value) return true;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function validateProfileForm() {
  profileClearErrors();
  let ok = true;
  const first = profileGetValue("profileFirstName");
  const last = profileGetValue("profileLastName");
  const display = profileGetValue("profileDisplayName");
  const dept = profileGetValue("profileDepartment");
  const title = profileGetValue("profileJobTitle");
  const email = profileGetValue("profileEmail");
  const mobile = profileGetValue("profileMobile");

  if (!first) {
    profileSetError("profileFirstName", "First name is required.");
    ok = false;
  }
  if (!last) {
    profileSetError("profileLastName", "Last name is required.");
    ok = false;
  }
  if (!display) {
    profileSetError("profileDisplayName", "Display name is required.");
    ok = false;
  }
  if (!dept) {
    profileSetError("profileDepartment", "Department is required.");
    ok = false;
  }
  if (!title) {
    profileSetError("profileJobTitle", "Job title is required.");
    ok = false;
  }
  if (!isValidEmail(email)) {
    profileSetError("profileEmail", "Enter a valid email address.");
    ok = false;
  }
  if (!isValidPhone(mobile)) {
    profileSetError("profileMobile", "Enter a valid mobile number.");
    ok = false;
  }

  if (!ok) {
    const firstInvalid = document.querySelector(
      "#userProfileForm .is-invalid",
    );
    firstInvalid?.focus();
  }
  return ok;
}

function updateProfileDirtyUi() {
  const current = readProfileFromForm();
  profileDirty =
    JSON.stringify(current) !== JSON.stringify(profileBaseline || {});
  const saveBtn = document.getElementById("profileSaveBtn");
  const resetBtn = document.getElementById("profileResetBtn");
  const badge = document.getElementById("profileDirtyBadge");
  const hint = document.getElementById("profileDirtyHint");
  if (saveBtn) saveBtn.disabled = !profileDirty || profileSaving;
  if (resetBtn) resetBtn.disabled = !profileDirty || profileSaving;
  if (badge) badge.hidden = !profileDirty;
  if (hint) {
    hint.textContent = profileDirty
      ? "You have unsaved changes"
      : "All changes saved";
  }
}

function captureProfileBaseline(profile) {
  profileBaseline = profileClone(profile || readProfileFromForm());
  updateProfileDirtyUi();
}

function processProfileImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected."));
      return;
    }
    if (!String(file.type || "").startsWith("image/")) {
      reject(new Error("Please select an image file."));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error("Image must be 2 MB or smaller."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Unable to process image."));
      img.onload = () => {
        try {
          const size = 256;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Image processing is unavailable."));
            return;
          }
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          if (dataUrl.length > 320000) {
            reject(
              new Error(
                "Processed image is too large to store. Try a smaller photo.",
              ),
            );
            return;
          }
          resolve(dataUrl);
        } catch (error) {
          reject(error);
        }
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function saveUserProfilePage() {
  if (profileSaving) return;
  if (!validateProfileForm()) {
    profileToast("Please correct the highlighted fields.", "warning");
    return;
  }

  profileSaving = true;
  updateProfileDirtyUi();

  const next = readProfileFromForm();
  const saved = saveUserProfile(next);
  profileSaving = false;

  if (!saved) {
    profileToast(
      "Unable to save profile. Storage may be full or unavailable.",
      "error",
    );
    updateProfileDirtyUi();
    return;
  }

  profileSessionAvatar = saved.avatar;
  applyProfileToForm(saved);
  captureProfileBaseline(saved);
  if (typeof syncUserProfileUI === "function") {
    syncUserProfileUI(saved);
  }
  profileToast("Profile updated successfully.", "success");
}

function resetUserProfilePage() {
  if (!profileBaseline) return;
  profileSessionAvatar = profileBaseline.avatar || null;
  applyProfileToForm(profileBaseline);
  captureProfileBaseline(profileBaseline);
  profileToast("Unsaved changes discarded.", "info");
}

function initProfilePage() {
  if (profilePageInitialized) return;
  if (!document.getElementById("userProfilePage")) return;
  profilePageInitialized = true;

  const loaded = getUserProfile();
  if (!loaded.lastSignIn) {
    loaded.lastSignIn = new Date().toISOString();
  }
  applyProfileToForm(loaded);
  captureProfileBaseline(loaded);
  if (typeof syncUserProfileUI === "function") {
    syncUserProfileUI(loaded);
  }

  const form = document.getElementById("userProfileForm");
  form?.addEventListener("input", () => {
    if (!profileGetValue("profileDisplayName")) {
      const auto =
        profileGetValue("profileFirstName") +
        " " +
        profileGetValue("profileLastName");
      if (document.activeElement?.id !== "profileDisplayName") {
        /* only auto-fill when display empty and not focused */
      }
    }
    applyProfileToOverview(readProfileFromForm());
    updateProfileDirtyUi();
  });
  form?.addEventListener("change", () => {
    applyProfileToOverview(readProfileFromForm());
    updateProfileDirtyUi();
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    saveUserProfilePage();
  });

  document
    .getElementById("profileResetBtn")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      resetUserProfilePage();
    });

  document
    .getElementById("profileChangePhotoBtn")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("profilePhotoInput")?.click();
    });

  document
    .getElementById("profilePhotoInput")
    ?.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      try {
        const dataUrl = await processProfileImageFile(file);
        profileSessionAvatar = dataUrl;
        applyProfileToOverview(readProfileFromForm());
        updateProfileDirtyUi();
        profileToast("Photo preview ready. Save to keep it.", "success");
      } catch (error) {
        profileToast(error.message || "Unable to use this image.", "error");
      }
    });

  document
    .getElementById("profileRemovePhotoBtn")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      profileSessionAvatar = null;
      applyProfileToOverview(readProfileFromForm());
      updateProfileDirtyUi();
    });

  window.addEventListener("beforeunload", (event) => {
    if (!profileDirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
}

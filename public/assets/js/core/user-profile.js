/* ==========================================
   Shared user profile (frontend-only)
   Key: himsFleetUserProfile
========================================== */

const HIMS_FLEET_USER_PROFILE_KEY = "himsFleetUserProfile";

function getDefaultUserProfile() {
  return {
    firstName: "Tristan",
    middleName: "",
    lastName: "Dave",
    displayName: "Tristan Dave",
    email: "",
    mobile: "",
    extension: "",
    employeeId: "",
    department: "Fleet & Transportation Management",
    jobTitle: "Fleet Administrator",
    location: "",
    avatar: null,
    username: "tdave",
    role: "Fleet Administrator",
    accountStatus: "Active",
    lastSignIn: null,
    updatedAt: null,
  };
}

function normalizeUserProfile(raw) {
  const d = getDefaultUserProfile();
  if (!raw || typeof raw !== "object") return d;

  const str = (v, max) => String(v == null ? "" : v).trim().slice(0, max);
  const firstName = str(raw.firstName, 60) || d.firstName;
  const lastName = str(raw.lastName, 60) || d.lastName;
  let displayName = str(raw.displayName, 120);
  if (!displayName) displayName = (firstName + " " + lastName).trim();

  let avatar = raw.avatar;
  if (avatar != null && typeof avatar === "string") {
    if (!avatar.startsWith("data:image/") || avatar.length > 350000) {
      avatar = null;
    }
  } else {
    avatar = null;
  }

  return {
    firstName,
    middleName: str(raw.middleName, 60),
    lastName,
    displayName,
    email: str(raw.email, 120),
    mobile: str(raw.mobile, 40),
    extension: str(raw.extension, 20),
    employeeId: str(raw.employeeId, 40),
    department: str(raw.department, 120) || d.department,
    jobTitle: str(raw.jobTitle, 120) || d.jobTitle,
    location: str(raw.location, 200),
    avatar,
    username: str(raw.username, 60) || d.username,
    role: str(raw.role, 80) || d.role,
    accountStatus: str(raw.accountStatus, 40) || d.accountStatus,
    lastSignIn: raw.lastSignIn || null,
    updatedAt: raw.updatedAt || null,
  };
}

function getUserProfile() {
  try {
    const raw = localStorage.getItem(HIMS_FLEET_USER_PROFILE_KEY);
    if (!raw) return getDefaultUserProfile();
    return normalizeUserProfile(JSON.parse(raw));
  } catch (error) {
    console.error("Malformed user profile storage:", error);
    return getDefaultUserProfile();
  }
}

function saveUserProfile(profile) {
  try {
    const normalized = normalizeUserProfile(profile);
    normalized.updatedAt = new Date().toISOString();
    if (!normalized.lastSignIn) {
      normalized.lastSignIn = normalized.updatedAt;
    }
    localStorage.setItem(
      HIMS_FLEET_USER_PROFILE_KEY,
      JSON.stringify(normalized),
    );
    return normalized;
  } catch (error) {
    console.error("Unable to save user profile:", error);
    return null;
  }
}

function getUserInitials(profile) {
  const p = profile || getUserProfile();
  const a = (p.firstName || "").trim().charAt(0);
  const b = (p.lastName || "").trim().charAt(0);
  const initials = (a + b).toUpperCase();
  if (initials) return initials;
  const d = (p.displayName || "U").trim();
  const parts = d.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return d.slice(0, 2).toUpperCase() || "U";
}

function syncUserProfileUI(profile) {
  const p = profile || getUserProfile();
  const initials = getUserInitials(p);
  const name = p.displayName || "User";
  const role = p.role || "Fleet Administrator";

  document.querySelectorAll(".profile-name").forEach((el) => {
    el.textContent = name;
  });
  document.querySelectorAll(".profile-role").forEach((el) => {
    el.textContent = role;
  });

  document.querySelectorAll(".profile-avatar").forEach((el) => {
    if (p.avatar) {
      el.classList.add("has-photo");
      el.style.backgroundImage = 'url("' + p.avatar.replace(/"/g, "") + '")';
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      el.textContent = "";
      el.setAttribute("aria-label", name);
    } else {
      el.classList.remove("has-photo");
      el.style.backgroundImage = "";
      el.textContent = initials;
      el.setAttribute("aria-label", name);
    }
  });

  const toggle = document.getElementById("sidebarProfileToggle");
  if (toggle) {
    toggle.setAttribute("aria-label", name + ", " + role);
  }
}

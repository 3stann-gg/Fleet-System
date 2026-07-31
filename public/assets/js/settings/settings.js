/* ==========================================
   Fleet Settings page — system configuration
   Appearance theme: shared himsFleetTheme only
========================================== */

let settingsPageInitialized = false;
let settingsBaseline = null;
let themeBaseline = null;
let settingsDirty = false;

function settingsClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function settingsSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function settingsGetThemePreference() {
  if (typeof getSavedTheme === "function") {
    return getSavedTheme();
  }
  try {
    return localStorage.getItem("himsFleetTheme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function settingsApplyTheme(theme, options) {
  if (typeof applyTheme === "function") {
    applyTheme(theme, options);
    return;
  }
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  if (options?.persist !== false) {
    try {
      localStorage.setItem("himsFleetTheme", next);
    } catch {
      /* ignore */
    }
  }
}

function settingsSyncThemeMenu() {
  if (typeof syncThemeMenuState === "function") {
    syncThemeMenuState();
  }
}

function settingsReadThemeFromForm() {
  const checked = document.querySelector(
    'input[name="settingsTheme"]:checked',
  );
  return checked?.value === "dark" ? "dark" : "light";
}

function settingsWriteThemeToForm(theme) {
  const next = theme === "dark" ? "dark" : "light";
  const radio = document.querySelector(
    'input[name="settingsTheme"][value="' + next + '"]',
  );
  if (radio) radio.checked = true;
}

function settingsSetCheckbox(id, value) {
  const el = document.getElementById(id);
  if (el) el.checked = Boolean(value);
}

function settingsGetCheckbox(id, fallback) {
  const el = document.getElementById(id);
  if (!el) return fallback;
  return el.checked;
}

function settingsSetInput(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value == null ? "" : String(value);
}

function settingsGetInput(id, fallback) {
  const el = document.getElementById(id);
  if (!el) return fallback;
  return el.value;
}

function settingsGetNumber(id, fallback) {
  const n = Number(settingsGetInput(id, fallback));
  return Number.isNaN(n) ? fallback : n;
}

function settingsStableStringify(value) {
  return JSON.stringify(value);
}

function applySettingsToForm(settings, options = {}) {
  const s = settings || getDefaultFleetSettings();
  const syncTheme = options.syncTheme !== false;

  settingsSetInput("settingsOrgName", s.general.organizationName);
  settingsSetInput("settingsFleetUnit", s.general.fleetUnitName);
  settingsSetInput("settingsContactEmail", s.general.contactEmail);
  settingsSetInput("settingsContactPhone", s.general.contactPhone);
  settingsSetInput("settingsLandingPage", s.general.defaultLandingPage);
  settingsSetInput(
    "settingsRowsPerPage",
    String(s.general.defaultRowsPerPage || 10),
  );

  settingsSetInput("settingsCurrencyCode", s.regional.currencyCode);
  settingsSetInput("settingsCurrencySymbol", s.regional.currencySymbol);
  settingsSetInput("settingsDateFormat", s.regional.dateFormat);
  settingsSetInput("settingsTimeFormat", s.regional.timeFormat);
  settingsSetInput("settingsDistanceUnit", s.regional.distanceUnit);
  settingsSetInput("settingsVolumeUnit", s.regional.volumeUnit);

  settingsSetCheckbox("settingsVehicleRequirePlate", s.vehicles.requirePlateNumber);
  settingsSetCheckbox("settingsVehicleRequireDept", s.vehicles.requireDepartment);
  settingsSetInput("settingsVehicleDefaultStatus", s.vehicles.defaultStatus);
  settingsSetInput(
    "settingsVehicleUtilThreshold",
    s.vehicles.lowUtilizationThreshold,
  );

  settingsSetCheckbox("settingsResRequireApproval", s.reservations.requireApproval);
  settingsSetCheckbox("settingsResAllowSameDay", s.reservations.allowSameDay);
  settingsSetInput(
    "settingsResDefaultHours",
    s.reservations.defaultDurationHours,
  );
  settingsSetInput("settingsResMaxAdvance", s.reservations.maxAdvanceDays);

  settingsSetCheckbox("settingsDispAutoAssign", s.dispatch.autoAssignDriver);
  settingsSetCheckbox("settingsDispRequireCheck", s.dispatch.requireVehicleCheck);
  settingsSetInput("settingsDispPriority", s.dispatch.defaultPriority);
  settingsSetInput("settingsDispCompletedDays", s.dispatch.showCompletedDays);

  settingsSetCheckbox("settingsDriverRequireLicense", s.drivers.requireLicenseExpiry);
  settingsSetInput("settingsDriverWarnDays", s.drivers.warnLicenseDays);
  settingsSetInput("settingsDriverStatus", s.drivers.defaultStatus);

  settingsSetInput("settingsMntOverdueDays", s.maintenance.overdueWarnDays);
  settingsSetCheckbox("settingsMntRequireCost", s.maintenance.requireCost);
  settingsSetInput("settingsMntDefaultType", s.maintenance.defaultType);

  settingsSetCheckbox("settingsFuelRequireOdo", s.fuel.requireOdometer);
  settingsSetCheckbox("settingsFuelRequireStation", s.fuel.requireStation);
  settingsSetInput("settingsFuelHighCost", s.fuel.highCostAlert);

  settingsSetCheckbox("settingsRoutePreferOpt", s.routes.preferOptimized);
  settingsSetCheckbox("settingsRouteArchive", s.routes.archiveCompleted);
  settingsSetInput("settingsRoutePriority", s.routes.defaultPriority);

  settingsSetInput("settingsCostDefaultRange", s.costAnalysis.defaultDateRange);
  settingsSetCheckbox(
    "settingsCostShowMismatch",
    s.costAnalysis.showBudgetMismatch,
  );
  settingsSetCheckbox(
    "settingsCostIncludeUnassigned",
    s.costAnalysis.includeUnassignedDepartment,
  );

  settingsSetCheckbox("settingsNotifMaintenance", s.notifications.maintenanceDue);
  settingsSetCheckbox("settingsNotifLicense", s.notifications.licenseExpiring);
  settingsSetCheckbox(
    "settingsNotifReservation",
    s.notifications.reservationPending,
  );
  settingsSetCheckbox("settingsNotifFuel", s.notifications.fuelHighCost);
  settingsSetCheckbox("settingsNotifDispatch", s.notifications.dispatchUpdates);
  settingsSetCheckbox(
    "settingsNotifBrowser",
    s.notifications.browserNotifications,
  );

  settingsSetCheckbox(
    "settingsDataConfirmDestructive",
    s.dataManagement.confirmDestructive,
  );
  settingsSetCheckbox(
    "settingsDataRetainExports",
    s.dataManagement.retainExportHistory,
  );

  if (syncTheme) {
    settingsWriteThemeToForm(settingsGetThemePreference());
  }

  if (s.updatedAt) {
    const d = new Date(s.updatedAt);
    settingsSetText(
      "settingsLastSaved",
      Number.isNaN(d.getTime())
        ? "Last saved: —"
        : "Last saved: " + d.toLocaleString(),
    );
  } else {
    settingsSetText("settingsLastSaved", "Last saved: Not saved yet");
  }

  updateBrowserNotificationStatus();
}

function readSettingsFromForm() {
  return normalizeFleetSettings({
    general: {
      organizationName: settingsGetInput("settingsOrgName", ""),
      fleetUnitName: settingsGetInput("settingsFleetUnit", ""),
      contactEmail: settingsGetInput("settingsContactEmail", ""),
      contactPhone: settingsGetInput("settingsContactPhone", ""),
      defaultLandingPage: settingsGetInput("settingsLandingPage", "dashboard"),
      defaultRowsPerPage: settingsGetNumber("settingsRowsPerPage", 10),
    },
    regional: {
      currencyCode: settingsGetInput("settingsCurrencyCode", "PHP"),
      currencySymbol: settingsGetInput("settingsCurrencySymbol", "₱"),
      dateFormat: settingsGetInput("settingsDateFormat", "YYYY-MM-DD"),
      timeFormat: settingsGetInput("settingsTimeFormat", "24h"),
      distanceUnit: settingsGetInput("settingsDistanceUnit", "km"),
      volumeUnit: settingsGetInput("settingsVolumeUnit", "L"),
    },
    vehicles: {
      requirePlateNumber: settingsGetCheckbox(
        "settingsVehicleRequirePlate",
        true,
      ),
      requireDepartment: settingsGetCheckbox("settingsVehicleRequireDept", true),
      defaultStatus: settingsGetInput(
        "settingsVehicleDefaultStatus",
        "Available",
      ),
      lowUtilizationThreshold: settingsGetNumber(
        "settingsVehicleUtilThreshold",
        40,
      ),
    },
    reservations: {
      requireApproval: settingsGetCheckbox("settingsResRequireApproval", true),
      allowSameDay: settingsGetCheckbox("settingsResAllowSameDay", true),
      defaultDurationHours: settingsGetNumber("settingsResDefaultHours", 2),
      maxAdvanceDays: settingsGetNumber("settingsResMaxAdvance", 30),
    },
    dispatch: {
      autoAssignDriver: settingsGetCheckbox("settingsDispAutoAssign", false),
      requireVehicleCheck: settingsGetCheckbox(
        "settingsDispRequireCheck",
        true,
      ),
      defaultPriority: settingsGetInput("settingsDispPriority", "Medium"),
      showCompletedDays: settingsGetNumber("settingsDispCompletedDays", 7),
    },
    drivers: {
      requireLicenseExpiry: settingsGetCheckbox(
        "settingsDriverRequireLicense",
        true,
      ),
      warnLicenseDays: settingsGetNumber("settingsDriverWarnDays", 30),
      defaultStatus: settingsGetInput("settingsDriverStatus", "Active"),
    },
    maintenance: {
      overdueWarnDays: settingsGetNumber("settingsMntOverdueDays", 3),
      requireCost: settingsGetCheckbox("settingsMntRequireCost", true),
      defaultType: settingsGetInput("settingsMntDefaultType", "Preventive"),
    },
    fuel: {
      requireOdometer: settingsGetCheckbox("settingsFuelRequireOdo", true),
      requireStation: settingsGetCheckbox("settingsFuelRequireStation", false),
      highCostAlert: settingsGetNumber("settingsFuelHighCost", 5000),
    },
    routes: {
      preferOptimized: settingsGetCheckbox("settingsRoutePreferOpt", true),
      archiveCompleted: settingsGetCheckbox("settingsRouteArchive", false),
      defaultPriority: settingsGetInput("settingsRoutePriority", "Medium"),
    },
    costAnalysis: {
      defaultDateRange: settingsGetInput(
        "settingsCostDefaultRange",
        "last30",
      ),
      showBudgetMismatch: settingsGetCheckbox(
        "settingsCostShowMismatch",
        true,
      ),
      includeUnassignedDepartment: settingsGetCheckbox(
        "settingsCostIncludeUnassigned",
        true,
      ),
    },
    notifications: {
      maintenanceDue: settingsGetCheckbox("settingsNotifMaintenance", true),
      licenseExpiring: settingsGetCheckbox("settingsNotifLicense", true),
      reservationPending: settingsGetCheckbox(
        "settingsNotifReservation",
        true,
      ),
      fuelHighCost: settingsGetCheckbox("settingsNotifFuel", false),
      dispatchUpdates: settingsGetCheckbox("settingsNotifDispatch", true),
      browserNotifications: settingsGetCheckbox("settingsNotifBrowser", false),
    },
    dataManagement: {
      confirmDestructive: settingsGetCheckbox(
        "settingsDataConfirmDestructive",
        true,
      ),
      retainExportHistory: settingsGetCheckbox(
        "settingsDataRetainExports",
        false,
      ),
    },
  });
}

function isSettingsFormDirty() {
  if (!settingsBaseline) return false;
  const current = readSettingsFromForm();
  const theme = settingsReadThemeFromForm();
  return (
    settingsStableStringify(current) !==
      settingsStableStringify(settingsBaseline) ||
    theme !== themeBaseline
  );
}

function updateSettingsDirtyUi() {
  settingsDirty = isSettingsFormDirty();
  const bar = document.getElementById("settingsActionBar");
  const badge = document.getElementById("settingsUnsavedBadge");
  const hint = document.getElementById("settingsDirtyHint");
  const saveBtn = document.getElementById("saveFleetSettings");
  const cancelBtn = document.getElementById("cancelFleetSettings");

  if (bar) bar.classList.toggle("is-dirty", settingsDirty);
  if (badge) badge.hidden = !settingsDirty;
  if (hint) {
    hint.textContent = settingsDirty
      ? "You have unsaved changes"
      : "All changes saved";
  }
  if (saveBtn) saveBtn.disabled = !settingsDirty;
  if (cancelBtn) cancelBtn.disabled = !settingsDirty;
}

function markSettingsDirty() {
  updateSettingsDirtyUi();
}

function clearSettingsDirty() {
  updateSettingsDirtyUi();
}

function captureSettingsBaseline() {
  settingsBaseline = settingsClone(readSettingsFromForm());
  themeBaseline = settingsReadThemeFromForm();
  updateSettingsDirtyUi();
}

function validateSettingsForm() {
  const org = settingsGetInput("settingsOrgName", "").trim();
  if (!org) {
    if (typeof showToast === "function") {
      showToast("Organization name is required.", "warning");
    }
    document.getElementById("settingsOrgName")?.focus();
    return false;
  }
  const email = settingsGetInput("settingsContactEmail", "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (typeof showToast === "function") {
      showToast("Enter a valid contact email or leave it blank.", "warning");
    }
    document.getElementById("settingsContactEmail")?.focus();
    return false;
  }
  return true;
}

function saveFleetSettingsPage() {
  if (!settingsDirty) return;
  if (!validateSettingsForm()) return;

  const next = readSettingsFromForm();
  /* One storage write for Fleet Settings */
  const saved = persistFleetSettings(next);
  if (!saved) return;

  const theme = settingsReadThemeFromForm();
  settingsApplyTheme(theme, { persist: true });
  settingsSyncThemeMenu();

  applySettingsToForm(saved);
  captureSettingsBaseline();

  if (typeof showToast === "function") {
    showToast("Fleet settings saved.", "success");
  }
}

function cancelFleetSettingsPage() {
  if (!settingsDirty) return;

  if (settingsBaseline) {
    applySettingsToForm(settingsBaseline, { syncTheme: false });
  } else {
    applySettingsToForm(loadFleetSettings(), { syncTheme: false });
  }

  const restoreTheme =
    themeBaseline || settingsGetThemePreference() || "light";
  settingsWriteThemeToForm(restoreTheme);
  /* Preview restore — storage already holds last saved theme */
  settingsApplyTheme(restoreTheme, { persist: false });
  settingsSyncThemeMenu();
  captureSettingsBaseline();

  if (typeof showToast === "function") {
    showToast("Changes discarded.", "info");
  }
}

function resetFleetSettingsDefaults() {
  const requireConfirm =
    settingsGetCheckbox("settingsDataConfirmDestructive", true) !== false;
  if (requireConfirm) {
    const ok = window.confirm(
      "Reset Fleet Settings to defaults?\n\n" +
        "This removes only himsFleetSettings.\n" +
        "Operational data and himsFleetTheme are preserved.\n" +
        "localStorage.clear() is never called.",
    );
    if (!ok) return;
  }

  clearFleetSettingsStorage();
  const defaults = getDefaultFleetSettings();
  /* Persist defaults once (settings key only) */
  const saved = persistFleetSettings(defaults);
  applySettingsToForm(saved || defaults, { syncTheme: false });
  settingsWriteThemeToForm(settingsGetThemePreference());
  settingsApplyTheme(settingsGetThemePreference(), { persist: false });
  settingsSyncThemeMenu();
  captureSettingsBaseline();

  if (typeof showToast === "function") {
    showToast("Fleet settings restored to defaults.", "success");
  }
}

function getSettingsExportDateStamp() {
  const now = new Date();
  return (
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0")
  );
}

function exportFleetSettingsFile() {
  try {
    /* Export last-saved settings when clean; draft when dirty is intentional for backup of current form */
    const payload = buildFleetSettingsExportPackage(readSettingsFromForm());
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "hims-fleet-settings-" + getSettingsExportDateStamp() + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    if (typeof showToast === "function") {
      showToast("Settings exported (settings only).", "success");
    }
  } catch (error) {
    console.error(error);
    if (typeof showToast === "function") {
      showToast("Unable to export settings.", "error");
    }
  }
}

function importFleetSettingsFromFile(file) {
  if (!file) return;
  if (file.size > (HIMS_FLEET_SETTINGS_IMPORT_MAX_BYTES || 262144)) {
    if (typeof showToast === "function") {
      showToast("Import file is too large (max 256 KB).", "warning");
    }
    return;
  }
  const name = String(file.name || "").toLowerCase();
  if (name && !name.endsWith(".json")) {
    if (typeof showToast === "function") {
      showToast("Import accepts JSON files only.", "warning");
    }
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result || "");
      if (/^\s*<!DOCTYPE|^\s*<html|javascript:/i.test(text)) {
        if (typeof showToast === "function") {
          showToast("Import rejected: file is not valid settings JSON.", "error");
        }
        return;
      }
      const parsed = JSON.parse(text);
      const result = validateFleetSettingsImportPayload(parsed, file.size);
      if (!result.ok) {
        if (typeof showToast === "function") {
          showToast(result.error || "Invalid settings import.", "error");
        }
        return;
      }
      /* Draft only until Save */
      applySettingsToForm(result.settings, { syncTheme: false });
      updateSettingsDirtyUi();
      if (typeof showToast === "function") {
        showToast(
          "Settings imported as draft. Click Save Settings to persist.",
          "success",
        );
      }
    } catch (error) {
      console.error(error);
      if (typeof showToast === "function") {
        showToast("Invalid JSON. Import failed.", "error");
      }
    }
  };
  reader.onerror = () => {
    if (typeof showToast === "function") {
      showToast("Unable to read import file.", "error");
    }
  };
  reader.readAsText(file);
}

function updateBrowserNotificationStatus() {
  const status = document.getElementById("settingsNotifBrowserStatus");
  const btn = document.getElementById("requestBrowserNotificationPermission");
  const checkbox = document.getElementById("settingsNotifBrowser");

  if (!("Notification" in window)) {
    if (status) {
      status.textContent =
        "Browser notifications are not supported in this browser. Control disabled.";
    }
    if (btn) btn.disabled = true;
    if (checkbox) {
      checkbox.disabled = true;
      checkbox.checked = false;
    }
    return;
  }

  if (btn) btn.disabled = false;
  if (checkbox) checkbox.disabled = false;

  const permission = Notification.permission;
  if (!status) return;
  if (permission === "granted") {
    status.textContent = "Browser permission: granted.";
  } else if (permission === "denied") {
    status.textContent =
      "Browser permission: denied. Enable notifications in browser site settings if needed.";
  } else {
    status.textContent =
      "Browser permission: not requested. Click the button to request (user interaction required).";
  }
}

function requestBrowserNotificationPermission() {
  if (!("Notification" in window)) {
    updateBrowserNotificationStatus();
    if (typeof showToast === "function") {
      showToast("Browser notifications are not supported.", "warning");
    }
    return;
  }

  Notification.requestPermission()
    .then((result) => {
      updateBrowserNotificationStatus();
      if (result === "granted") {
        settingsSetCheckbox("settingsNotifBrowser", true);
        markSettingsDirty();
        if (typeof showToast === "function") {
          showToast("Browser notification permission granted.", "success");
        }
      } else if (result === "denied") {
        settingsSetCheckbox("settingsNotifBrowser", false);
        markSettingsDirty();
        if (typeof showToast === "function") {
          showToast(
            "Permission denied. Preference saved as off when you Save.",
            "warning",
          );
        }
      }
    })
    .catch(() => {
      if (typeof showToast === "function") {
        showToast("Unable to request notification permission.", "error");
      }
    });
}

function initSettingsSectionNav() {
  const nav = document.getElementById("settingsSectionNav");
  if (!nav || nav.dataset.init === "true") return;
  nav.dataset.init = "true";

  nav.addEventListener("click", (event) => {
    const link = event.target?.closest?.("[data-settings-section]");
    if (!link) return;
    event.preventDefault();
    const id = link.getAttribute("data-settings-section");
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    nav.querySelectorAll("[data-settings-section]").forEach((el) => {
      el.classList.toggle("is-active", el === link);
    });
  });
}

function initSettingsDataActions() {
  document
    .getElementById("exportFleetSettings")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      exportFleetSettingsFile();
    });

  const fileInput = document.getElementById("importFleetSettingsFile");
  document
    .getElementById("importFleetSettings")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      fileInput?.click();
    });

  fileInput?.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    importFleetSettingsFromFile(file);
    fileInput.value = "";
  });

  document
    .getElementById("resetFleetSettings")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      resetFleetSettingsDefaults();
    });

  /* Demo wipe not registered — keep disabled, explain in note */
  const clearDemo = document.getElementById("clearDemoData");
  if (clearDemo) {
    clearDemo.disabled = true;
    clearDemo.setAttribute(
      "title",
      "No demo-data wipe architecture is registered in this frontend",
    );
  }

  document
    .getElementById("requestBrowserNotificationPermission")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      requestBrowserNotificationPermission();
    });
}

function initSettingsPage() {
  if (settingsPageInitialized) return;
  if (!document.getElementById("settingsPage")) return;
  settingsPageInitialized = true;

  const loaded = loadFleetSettings();
  applySettingsToForm(loaded);
  settingsWriteThemeToForm(settingsGetThemePreference());
  captureSettingsBaseline();

  initSettingsSectionNav();
  initSettingsDataActions();

  const form = document.getElementById("fleetSettingsForm");
  /* One delegated change/input path for dirty tracking */
  form?.addEventListener("input", () => {
    markSettingsDirty();
  });
  form?.addEventListener("change", (event) => {
    markSettingsDirty();
    const target = event.target;
    if (target && target.name === "settingsTheme") {
      settingsApplyTheme(settingsReadThemeFromForm(), { persist: false });
    }
  });

  /* One submit handler (Save button is type=submit) */
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    saveFleetSettingsPage();
  });

  document
    .getElementById("cancelFleetSettings")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      cancelFleetSettingsPage();
    });
}

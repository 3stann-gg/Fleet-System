/* ==========================================
   Fuel modal helpers + validation + cost calc
========================================== */

const FUEL_VEHICLE_PLATES = {
  "Ambulance 01": "ABC-1001",
  "Ambulance 03": "ABC-1003",
  "Patient Van 02": "DEF-2002",
  "Service Vehicle 04": "GHI-4004",
  "Van 02": "JKL-2002",
  "Van 05": "JKL-2005",
  "SUV 03": "MNO-3003",
};

let fuelModalInitialized = false;

function formatFuelCurrency(value) {
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) {
    return "₱0.00";
  }
  return (
    "₱" +
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function formatFuelQuantity(value) {
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) {
    return "0.00 L";
  }
  return (
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " L"
  );
}

function formatFuelOdometer(value) {
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) {
    return "0 km";
  }
  return (
    Math.round(num).toLocaleString(undefined, { maximumFractionDigits: 0 }) +
    " km"
  );
}

function formatFuelDisplayDate(raw) {
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizeFuelTotal(quantity, costPerLiter) {
  const q = Number.parseFloat(quantity);
  const c = Number.parseFloat(costPerLiter);
  if (Number.isNaN(q) || Number.isNaN(c) || q < 0 || c < 0) {
    return "";
  }
  return (Math.round(q * c * 100) / 100).toFixed(2);
}

function syncFuelTotalCostFields(prefix) {
  const quantity = document.getElementById(prefix + "Quantity");
  const costPerLiter = document.getElementById(prefix + "CostPerLiter");
  const totalCost = document.getElementById(prefix + "TotalCost");

  if (!totalCost) return;

  totalCost.value = normalizeFuelTotal(
    quantity?.value,
    costPerLiter?.value,
  );
}

function bindFuelTotalCostCalculation(prefix) {
  const quantity = document.getElementById(prefix + "Quantity");
  const costPerLiter = document.getElementById(prefix + "CostPerLiter");

  const sync = () => syncFuelTotalCostFields(prefix);

  quantity?.addEventListener("input", sync);
  quantity?.addEventListener("change", sync);
  costPerLiter?.addEventListener("input", sync);
  costPerLiter?.addEventListener("change", sync);
}

function syncFuelPlateFromVehicle(vehicleSelect, plateInput) {
  if (!vehicleSelect || !plateInput) return;

  const option = vehicleSelect.selectedOptions?.[0];
  const plate =
    option?.dataset?.plate ||
    FUEL_VEHICLE_PLATES[vehicleSelect.value] ||
    "";

  plateInput.value = plate;
}

function bindFuelVehiclePlateSync(vehicleId, plateId) {
  const vehicle = document.getElementById(vehicleId);
  const plate = document.getElementById(plateId);

  if (!vehicle || !plate || vehicle.dataset.plateSyncBound === "true") {
    return;
  }

  vehicle.dataset.plateSyncBound = "true";
  vehicle.addEventListener("change", () => {
    syncFuelPlateFromVehicle(vehicle, plate);
  });
}

function generateFuelRecordNumber() {
  const year = new Date().getFullYear();
  const tableBody = document.getElementById("fuelTableBody");
  let maxSeq = 0;

  if (tableBody && typeof getFuelDataRows === "function") {
    getFuelDataRows(tableBody).forEach((row) => {
      const number =
        (row.dataset.fuelNumber || "").trim() ||
        row.querySelector(".fuel-number")?.textContent?.trim() ||
        "";
      const match = number.match(/FUEL-(\d{4})-(\d+)/i);
      if (match) {
        const seq = Number.parseInt(match[2], 10);
        if (!Number.isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });
  }

  const next = String(maxSeq + 1).padStart(4, "0");
  return `FUEL-${year}-${next}`;
}

function generateFuelInternalId() {
  return (
    "fuel-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

function showFuelFieldError(field, message) {
  if (!field) return;

  field.classList.add("is-invalid");

  let errorEl = field.parentElement
    ? field.parentElement.querySelector(
        ".field-error[data-field='" + field.id + "']",
      )
    : null;

  if (!errorEl) {
    errorEl = document.createElement("div");
    errorEl.className = "field-error";
    errorEl.setAttribute("data-field", field.id);
    const parent = field.parentElement || field;
    parent.appendChild(errorEl);
  }

  errorEl.textContent = message;
  errorEl.style.display = "block";
}

function clearFuelFieldError(field) {
  if (!field) return;

  field.classList.remove("is-invalid");

  const errorEl = field.parentElement
    ? field.parentElement.querySelector(
        ".field-error[data-field='" + field.id + "']",
      )
    : null;

  if (errorEl) {
    errorEl.textContent = "";
    errorEl.style.display = "none";
  }
}

function clearAllFuelErrors(form) {
  if (!form) return;

  form.querySelectorAll(".is-invalid").forEach((field) => {
    clearFuelFieldError(field);
  });
}

function validateFuelForm(form) {
  if (!form) return false;

  clearAllFuelErrors(form);

  let firstInvalidField = null;

  function fail(field, message) {
    showFuelFieldError(field, message);
    if (!firstInvalidField && field) {
      firstInvalidField = field;
    }
  }

  function trackCorrection(field) {
    if (!field || field.dataset.fuelErrorClearBound === "true") return;
    field.dataset.fuelErrorClearBound = "true";
    field.addEventListener("input", () => clearFuelFieldError(field));
    field.addEventListener("change", () => clearFuelFieldError(field));
  }

  const isEdit = form.id === "editFuelForm";
  const prefix = isEdit ? "editFuel" : "fuel";

  const fields = {
    number: form.querySelector("#" + prefix + "Number"),
    date: form.querySelector("#" + prefix + "RefuelDate"),
    vehicle: form.querySelector("#" + prefix + "Vehicle"),
    driver: form.querySelector("#" + prefix + "Driver"),
    type: form.querySelector("#" + prefix + "Type"),
    quantity: form.querySelector("#" + prefix + "Quantity"),
    costPerLiter: form.querySelector("#" + prefix + "CostPerLiter"),
    totalCost: form.querySelector("#" + prefix + "TotalCost"),
    odometer: form.querySelector("#" + prefix + "Odometer"),
    station: form.querySelector("#" + prefix + "Station"),
    receipt: form.querySelector("#" + prefix + "Receipt"),
  };

  Object.values(fields).forEach(trackCorrection);

  syncFuelTotalCostFields(prefix);

  if (!fields.number || !fields.number.value.trim()) {
    fail(fields.number, "Fuel record number is required.");
  }

  if (!fields.date || !fields.date.value) {
    fail(fields.date, "Refueling date is required.");
  } else {
    const d = new Date(fields.date.value);
    if (Number.isNaN(d.getTime())) {
      fail(fields.date, "Refueling date is invalid.");
    }
  }

  if (!fields.vehicle || !fields.vehicle.value) {
    fail(fields.vehicle, "Vehicle is required.");
  }

  if (!fields.driver || !fields.driver.value.trim()) {
    fail(fields.driver, "Driver is required.");
  } else if (fields.driver.value.trim().length > 80) {
    fail(fields.driver, "Driver name is too long.");
  }

  if (!fields.type || !fields.type.value) {
    fail(fields.type, "Fuel type is required.");
  }

  const quantity = Number.parseFloat(fields.quantity?.value);
  if (
    !fields.quantity ||
    fields.quantity.value === "" ||
    Number.isNaN(quantity)
  ) {
    fail(fields.quantity, "Quantity is required.");
  } else if (quantity <= 0) {
    fail(fields.quantity, "Quantity must be greater than zero.");
  } else if (quantity > 10000) {
    fail(fields.quantity, "Quantity is unreasonably high.");
  }

  const costPerLiter = Number.parseFloat(fields.costPerLiter?.value);
  if (
    !fields.costPerLiter ||
    fields.costPerLiter.value === "" ||
    Number.isNaN(costPerLiter)
  ) {
    fail(fields.costPerLiter, "Cost per liter is required.");
  } else if (costPerLiter <= 0) {
    fail(fields.costPerLiter, "Cost per liter must be greater than zero.");
  } else if (costPerLiter > 1000) {
    fail(fields.costPerLiter, "Cost per liter is unreasonably high.");
  }

  const total = Number.parseFloat(fields.totalCost?.value);
  if (
    !fields.totalCost ||
    fields.totalCost.value === "" ||
    Number.isNaN(total) ||
    total < 0
  ) {
    fail(fields.totalCost, "Total cost is invalid.");
  }

  const odometer = Number.parseFloat(fields.odometer?.value);
  if (
    !fields.odometer ||
    fields.odometer.value === "" ||
    Number.isNaN(odometer)
  ) {
    fail(fields.odometer, "Odometer reading is required.");
  } else if (odometer < 0) {
    fail(fields.odometer, "Odometer cannot be negative.");
  }

  if (!fields.station || !fields.station.value.trim()) {
    fail(fields.station, "Fuel station is required.");
  } else if (fields.station.value.trim().length > 120) {
    fail(fields.station, "Fuel station name is too long.");
  }

  if (fields.receipt && fields.receipt.value.trim().length > 40) {
    fail(fields.receipt, "Receipt / reference is too long.");
  }

  if (firstInvalidField && typeof firstInvalidField.focus === "function") {
    firstInvalidField.focus();
  }

  return !firstInvalidField;
}

function openAddFuelModal() {
  const modal = document.getElementById("addFuelModal");
  const form = document.getElementById("fuelForm");
  if (!modal || !form) return;

  form.reset();
  clearAllFuelErrors(form);

  const numberField = document.getElementById("fuelNumber");
  if (numberField) {
    numberField.value = generateFuelRecordNumber();
  }

  const dateField = document.getElementById("fuelRefuelDate");
  if (dateField && !dateField.value) {
    dateField.value = new Date().toISOString().slice(0, 10);
  }

  syncFuelPlateFromVehicle(
    document.getElementById("fuelVehicle"),
    document.getElementById("fuelPlate"),
  );
  syncFuelTotalCostFields("fuel");

  modal.classList.add("show");
  document.body.style.overflow = "hidden";

  requestAnimationFrame(() => {
    document.getElementById("fuelVehicle")?.focus();
  });
}

function closeAddFuelModal() {
  const modal = document.getElementById("addFuelModal");
  if (!modal) return;
  modal.classList.remove("show");
  document.body.style.overflow = "";
}

function initFuelModal() {
  if (fuelModalInitialized) return;

  const modal = document.getElementById("addFuelModal");
  const openBtn = document.getElementById("addFuelBtn");
  if (!modal || !openBtn) return;

  fuelModalInitialized = true;

  openBtn.addEventListener("click", openAddFuelModal);

  document
    .getElementById("closeAddFuelModal")
    ?.addEventListener("click", closeAddFuelModal);
  document
    .getElementById("cancelAddFuel")
    ?.addEventListener("click", closeAddFuelModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeAddFuelModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeAddFuelModal();
    }
  });

  bindFuelTotalCostCalculation("fuel");
  bindFuelVehiclePlateSync("fuelVehicle", "fuelPlate");
}

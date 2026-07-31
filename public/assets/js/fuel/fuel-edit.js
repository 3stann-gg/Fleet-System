/* ==========================================
   Edit Fuel Record
========================================== */

let editFuelInitialized = false;

function populateEditFuelForm(row) {
  if (!row) return;

  const setValue = (id, value) => {
    const field = document.getElementById(id);
    if (!field) return;
    field.value = value == null ? "" : value;
  };

  const setSelect = (id, value) => {
    const field = document.getElementById(id);
    if (!field) return;
    const candidate = value == null ? "" : String(value);
    const has = Array.prototype.some.call(
      field.options,
      (opt) => opt.value === candidate,
    );
    field.value = has ? candidate : "";
  };

  const number =
    (row.dataset.fuelNumber || "").trim() ||
    row.querySelector(".fuel-number")?.textContent?.trim() ||
    "";
  const vehicle =
    row.querySelector(".fuel-vehicle")?.textContent?.trim() || "";
  const plate =
    (row.dataset.plate || "").trim() ||
    row.querySelector(".fuel-plate")?.textContent?.trim() ||
    "";
  const driver =
    (row.dataset.driver || "").trim() ||
    row.querySelector(".fuel-driver")?.textContent?.trim() ||
    "";
  const fuelType =
    (row.dataset.fuelType || "").trim() ||
    row.querySelector(".fuel-type")?.textContent?.trim() ||
    "";

  setValue("editFuelNumber", number);
  setValue("editFuelRefuelDate", row.dataset.refuelDate || "");
  setValue("editFuelRefuelTime", row.dataset.refuelTime || "");
  setSelect("editFuelVehicle", vehicle);
  setValue("editFuelPlate", plate === "—" ? "" : plate);
  setValue("editFuelDriver", driver);
  setSelect("editFuelType", fuelType);
  setValue("editFuelQuantity", row.dataset.quantity || "");
  setValue("editFuelCostPerLiter", row.dataset.costPerLiter || "");
  setValue(
    "editFuelTotalCost",
    row.dataset.totalCost ||
      normalizeFuelTotal(row.dataset.quantity, row.dataset.costPerLiter),
  );
  setValue("editFuelOdometer", row.dataset.odometer || "");
  setValue(
    "editFuelStation",
    (row.dataset.station || "").trim() ||
      row.querySelector(".fuel-station")?.textContent?.trim() ||
      "",
  );
  setValue("editFuelReceipt", row.dataset.receipt || "");
  setSelect("editFuelPayment", row.dataset.payment || "");
  setValue("editFuelNotes", row.dataset.notes || "");

  syncFuelPlateFromVehicle(
    document.getElementById("editFuelVehicle"),
    document.getElementById("editFuelPlate"),
  );
  syncFuelTotalCostFields("editFuel");
}

function openEditFuelModal(row) {
  const modal = document.getElementById("editFuelModal");
  if (!modal || !row || !document.body.contains(row)) {
    return false;
  }

  modal.currentRow = row;
  populateEditFuelForm(row);
  clearAllFuelErrors(document.getElementById("editFuelForm"));

  modal.classList.add("show");
  document.body.style.overflow = "hidden";

  requestAnimationFrame(() => {
    document.getElementById("editFuelVehicle")?.focus();
  });

  return true;
}

function closeEditFuelModal() {
  const modal = document.getElementById("editFuelModal");
  if (!modal) return;

  modal.classList.remove("show");
  document.body.style.overflow = "";
  modal.currentRow = null;
}

function initEditFuelModal() {
  if (editFuelInitialized) return;

  const modal = document.getElementById("editFuelModal");
  if (!modal) return;

  editFuelInitialized = true;

  document.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".action-btn.edit-fuel");
    if (!editBtn) return;

    const row = editBtn.closest("tr");
    if (!row) return;

    openEditFuelModal(row);
  });

  [
    document.getElementById("closeEditFuelModal"),
    document.getElementById("cancelEditFuel"),
    modal,
  ].forEach((element) => {
    if (!element) return;
    element.addEventListener("click", (event) => {
      if (element === modal && event.target !== modal) return;
      if (element === modal && event.target.closest(".custom-modal")) return;
      closeEditFuelModal();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeEditFuelModal();
    }
  });

  bindFuelTotalCostCalculation("editFuel");
  bindFuelVehiclePlateSync("editFuelVehicle", "editFuelPlate");
}

function initFuelEdit() {
  const form = document.getElementById("editFuelForm");
  const modal = document.getElementById("editFuelModal");

  if (!form || !modal) return;
  if (form.dataset.fuelEditInitialized === "true") return;

  form.dataset.fuelEditInitialized = "true";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!modal.currentRow || !document.body.contains(modal.currentRow)) {
      return;
    }

    if (!validateFuelForm(form)) {
      return;
    }

    const row = modal.currentRow;
    const get = (id) => document.getElementById(id)?.value || "";

    const number = get("editFuelNumber").trim();
    const refuelDate = get("editFuelRefuelDate");
    const refuelTime = get("editFuelRefuelTime");
    const vehicle = get("editFuelVehicle");
    const plate =
      get("editFuelPlate").trim() || FUEL_VEHICLE_PLATES[vehicle] || "";
    const driver = get("editFuelDriver").trim();
    const fuelType = get("editFuelType");
    const quantity = get("editFuelQuantity");
    const costPerLiter = get("editFuelCostPerLiter");
    const totalCost =
      normalizeFuelTotal(quantity, costPerLiter) || get("editFuelTotalCost");
    const odometer = get("editFuelOdometer");
    const station = get("editFuelStation").trim();
    const receipt = get("editFuelReceipt").trim();
    const payment = get("editFuelPayment");
    const notes = get("editFuelNotes").trim();

    /* Preserve stable internal id; keep original number */
    row.dataset.fuelNumber = number;
    row.dataset.refuelDate = refuelDate;
    row.dataset.refuelTime = refuelTime;
    row.dataset.plate = plate;
    row.dataset.driver = driver;
    row.dataset.fuelType = fuelType;
    row.dataset.quantity = quantity;
    row.dataset.costPerLiter = costPerLiter;
    row.dataset.totalCost = totalCost;
    row.dataset.odometer = odometer;
    row.dataset.station = station;
    row.dataset.receipt = receipt;
    row.dataset.payment = payment;
    row.dataset.notes = notes;

    const setCell = (selector, text) => {
      const el = row.querySelector(selector);
      if (el) el.textContent = text;
    };

    setCell(".fuel-number", number);
    setCell(".fuel-date", formatFuelDisplayDate(refuelDate));
    setCell(".fuel-vehicle", vehicle);
    setCell(".fuel-plate", plate || "—");
    setCell(".fuel-driver", driver);
    setCell(".fuel-type", fuelType);
    setCell(".fuel-quantity", formatFuelQuantity(quantity));
    setCell(".fuel-cost-per-liter", formatFuelCurrency(costPerLiter));
    setCell(".fuel-total-cost", formatFuelCurrency(totalCost));
    setCell(".fuel-odometer", formatFuelOdometer(odometer));
    setCell(".fuel-station", station);

    const viewBtn = row.querySelector(".view-fuel");
    const editBtn = row.querySelector(".edit-fuel");
    const deleteBtn = row.querySelector(".delete-fuel");
    if (viewBtn) viewBtn.setAttribute("aria-label", "View " + number);
    if (editBtn) editBtn.setAttribute("aria-label", "Edit " + number);
    if (deleteBtn) deleteBtn.setAttribute("aria-label", "Delete " + number);

    closeEditFuelModal();

    if (typeof refreshFuelTable === "function") {
      refreshFuelTable({
        resetPage: false,
        refreshStatistics: true,
        reason: "edit",
      });
    } else if (typeof updateFuelStatistics === "function") {
      updateFuelStatistics();
    }

    if (typeof showToast === "function") {
      showToast("Fuel record updated successfully.", "success");
    }
  });
}

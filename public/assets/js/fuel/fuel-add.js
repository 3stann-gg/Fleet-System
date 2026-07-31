/* ==========================================
   Add Fuel Record
========================================== */

function createFuelRow(form, internalId) {
  const get = (id) => {
    const el = form.querySelector("#" + id);
    return el ? el.value : "";
  };

  const number = get("fuelNumber").trim();
  const refuelDate = get("fuelRefuelDate");
  const refuelTime = get("fuelRefuelTime");
  const vehicle = get("fuelVehicle");
  const plate = get("fuelPlate").trim() || FUEL_VEHICLE_PLATES[vehicle] || "";
  const driver = get("fuelDriver").trim();
  const fuelType = get("fuelType");
  const quantity = get("fuelQuantity");
  const costPerLiter = get("fuelCostPerLiter");
  const totalCost =
    normalizeFuelTotal(quantity, costPerLiter) || get("fuelTotalCost");
  const odometer = get("fuelOdometer");
  const station = get("fuelStation").trim();
  const receipt = get("fuelReceipt").trim();
  const payment = get("fuelPayment");
  const notes = get("fuelNotes").trim();

  const fuelId = internalId || generateFuelInternalId();

  const tr = document.createElement("tr");
  tr.dataset.fuelId = fuelId;
  tr.dataset.fuelNumber = number;
  tr.dataset.refuelDate = refuelDate;
  tr.dataset.refuelTime = refuelTime;
  tr.dataset.plate = plate;
  tr.dataset.driver = driver;
  tr.dataset.fuelType = fuelType;
  tr.dataset.quantity = quantity;
  tr.dataset.costPerLiter = costPerLiter;
  tr.dataset.totalCost = totalCost;
  tr.dataset.odometer = odometer;
  tr.dataset.station = station;
  tr.dataset.receipt = receipt;
  tr.dataset.payment = payment;
  tr.dataset.notes = notes;

  function cell(className, text) {
    const td = document.createElement("td");
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    td.appendChild(span);
    return td;
  }

  const checkboxTd = document.createElement("td");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "fuel-checkbox";
  checkbox.dataset.fuelId = fuelId;
  checkbox.setAttribute("aria-label", "Select fuel record " + number);
  checkbox.checked = false;
  checkboxTd.appendChild(checkbox);
  tr.appendChild(checkboxTd);

  tr.appendChild(cell("fuel-number", number));
  tr.appendChild(cell("fuel-date", formatFuelDisplayDate(refuelDate)));
  tr.appendChild(cell("fuel-vehicle", vehicle));
  tr.appendChild(cell("fuel-plate", plate || "—"));
  tr.appendChild(cell("fuel-driver", driver));
  tr.appendChild(cell("fuel-type", fuelType));
  tr.appendChild(cell("fuel-quantity", formatFuelQuantity(quantity)));
  tr.appendChild(cell("fuel-cost-per-liter", formatFuelCurrency(costPerLiter)));
  tr.appendChild(cell("fuel-total-cost", formatFuelCurrency(totalCost)));
  tr.appendChild(cell("fuel-odometer", formatFuelOdometer(odometer)));
  tr.appendChild(cell("fuel-station", station));

  const actionsTd = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "action-buttons";

  [
    ["view-fuel", "ph ph-eye", "View "],
    ["edit-fuel", "ph ph-pencil-simple", "Edit "],
    ["delete-fuel", "ph ph-trash", "Delete "],
  ].forEach(([cls, iconCls, label]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "action-btn " + cls;
    btn.setAttribute("aria-label", label + number);
    const icon = document.createElement("i");
    icon.className = iconCls;
    btn.appendChild(icon);
    actions.appendChild(btn);
  });

  actionsTd.appendChild(actions);
  tr.appendChild(actionsTd);

  return tr;
}

function initFuelAdd() {
  const form = document.getElementById("fuelForm");
  const tableBody = document.getElementById("fuelTableBody");

  if (!form || !tableBody) return;
  if (form.dataset.fuelAddInitialized === "true") return;

  form.dataset.fuelAddInitialized = "true";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (form.dataset.submitting === "true") return;

    if (typeof validateFuelForm !== "function" || !validateFuelForm(form)) {
      return;
    }

    form.dataset.submitting = "true";

    try {
      const row = createFuelRow(form);
      if (!row) return;

      tableBody.prepend(row);

      form.reset();
      clearAllFuelErrors(form);
      closeAddFuelModal();

      if (typeof refreshFuelTable === "function") {
        refreshFuelTable({
          resetPage: false,
          refreshStatistics: true,
          reason: "add",
        });
      } else if (typeof updateFuelStatistics === "function") {
        updateFuelStatistics();
      }

      if (typeof showToast === "function") {
        showToast("Fuel record saved successfully.", "success");
      }
    } finally {
      form.dataset.submitting = "false";
    }
  });
}

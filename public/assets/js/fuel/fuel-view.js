/* ==========================================
   View Fuel Record
========================================== */

let viewFuelInitialized = false;

const viewFuelModalState = {
  currentRow: null,
};

function getFuelRecordIdFromRow(row) {
  if (!row) return "";
  return (
    (row.dataset.fuelId || "").trim() ||
    (row.dataset.fuelNumber || "").trim() ||
    row.querySelector(".fuel-number")?.textContent?.trim() ||
    ""
  );
}

function resolveFuelRowById(recordId) {
  const id = (recordId || "").trim();
  if (!id) return null;

  const tableBody = document.getElementById("fuelTableBody");
  if (!tableBody) return null;

  const rows =
    typeof getFuelDataRows === "function"
      ? getFuelDataRows(tableBody)
      : Array.from(tableBody.querySelectorAll("tr"));

  return (
    rows.find((row) => {
      const fuelId = (row.dataset.fuelId || "").trim();
      const number =
        (row.dataset.fuelNumber || "").trim() ||
        row.querySelector(".fuel-number")?.textContent?.trim() ||
        "";
      return fuelId === id || number === id;
    }) || null
  );
}

function openViewFuelModal(row) {
  const modal = document.getElementById("viewFuelModal");
  if (!modal || !row) return;

  viewFuelModalState.currentRow = row;

  const recordId = getFuelRecordIdFromRow(row);
  modal.dataset.fuelId = recordId;

  const editBtn = document.getElementById("editFuelFromViewBtn");
  if (editBtn) {
    editBtn.dataset.fuelId = recordId;
  }

  const getText = (selector, fallback = "Not provided") => {
    const el = row.querySelector(selector);
    return el ? el.textContent.trim() : fallback;
  };

  const getData = (key, fallback = "Not provided") => {
    const val = row.dataset[key];
    return val != null && String(val).trim() !== ""
      ? String(val).trim()
      : fallback;
  };

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("viewFuelNumber", getText(".fuel-number"));
  setText("viewFuelVehicle", getText(".fuel-vehicle"));
  setText("viewFuelType", getText(".fuel-type"));
  setText("viewFuelTotalCost", getText(".fuel-total-cost"));
  setText("viewFuelDate", getText(".fuel-date"));
  setText("viewFuelTime", getData("refuelTime", "—"));
  setText("viewFuelPlate", getText(".fuel-plate"));
  setText("viewFuelDriver", getText(".fuel-driver"));
  setText("viewFuelQuantity", getText(".fuel-quantity"));
  setText("viewFuelCostPerLiter", getText(".fuel-cost-per-liter"));
  setText("viewFuelOdometer", getText(".fuel-odometer"));
  setText("viewFuelStation", getText(".fuel-station"));
  setText("viewFuelReceipt", getData("receipt", "—"));
  setText("viewFuelPayment", getData("payment", "—"));
  setText("viewFuelNotes", getData("notes", "—"));

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeViewFuelModal() {
  const modal = document.getElementById("viewFuelModal");
  if (!modal) return;

  modal.classList.remove("show");
  document.body.style.overflow = "";
  viewFuelModalState.currentRow = null;
  delete modal.dataset.fuelId;

  const editBtn = document.getElementById("editFuelFromViewBtn");
  if (editBtn) delete editBtn.dataset.fuelId;
}

function openEditFuelFromView(recordId) {
  const modal = document.getElementById("viewFuelModal");
  const storedId =
    (recordId || "").trim() ||
    (modal?.dataset.fuelId || "").trim() ||
    getFuelRecordIdFromRow(viewFuelModalState.currentRow);

  let row = viewFuelModalState.currentRow;
  if (!row || !document.body.contains(row)) {
    row = resolveFuelRowById(storedId);
  }

  if (!row || !document.body.contains(row)) {
    if (typeof showToast === "function") {
      showToast("Fuel record is no longer available.", "error");
    }
    return;
  }

  if (typeof openEditFuelModal !== "function") {
    console.error("openEditFuelModal is not available");
    return;
  }

  closeViewFuelModal();
  openEditFuelModal(row);
}

function initViewFuelModal() {
  if (viewFuelInitialized) return;

  const modal = document.getElementById("viewFuelModal");
  if (!modal) {
    viewFuelInitialized = true;
    return;
  }

  document.addEventListener("click", (event) => {
    const openBtn = event.target.closest(".action-btn.view-fuel");
    if (openBtn) {
      const row = openBtn.closest("tr");
      if (row) openViewFuelModal(row);
      return;
    }

    const editFromView = event.target.closest("#editFuelFromViewBtn");
    if (editFromView) {
      event.preventDefault();
      openEditFuelFromView(
        editFromView.dataset.fuelId || modal.dataset.fuelId,
      );
      return;
    }

    if (
      event.target.closest("#closeViewFuelModal") ||
      event.target.closest("#closeViewFuelBtn") ||
      event.target === modal
    ) {
      closeViewFuelModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeViewFuelModal();
    }
  });

  viewFuelInitialized = true;
}

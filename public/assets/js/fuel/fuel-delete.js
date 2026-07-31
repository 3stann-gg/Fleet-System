/* ==========================================
   Fuel Delete — single + bulk confirmation
========================================== */

let deleteFuelInitialized = false;

const deleteFuelModalState = {
  currentRow: null,
  opener: null,
  mode: "single",
  bulkIds: [],
};

function populateDeleteFuel(row) {
  if (!row) return;

  const number =
    row.querySelector(".fuel-number")?.textContent?.trim() ||
    "this fuel record";
  const vehicle =
    row.querySelector(".fuel-vehicle")?.textContent?.trim() || "this vehicle";

  const title = document.getElementById("deleteFuelModalTitle");
  const description = document.getElementById("deleteFuelModalDescription");
  const confirmButton = document.getElementById("confirmDeleteFuel");

  if (title) {
    title.textContent = "Delete Fuel Record";
  }

  if (description) {
    description.innerHTML =
      "Are you sure you want to delete " +
      '<strong id="deleteFuelNumber">' +
      number +
      '</strong> for <strong id="deleteFuelVehicle">' +
      vehicle +
      "</strong>?";
  }

  if (confirmButton) {
    confirmButton.innerHTML =
      '<i class="ph ph-trash"></i> Delete Fuel Record';
  }
}

function populateBulkDeleteFuel(count) {
  const title = document.getElementById("deleteFuelModalTitle");
  const description = document.getElementById("deleteFuelModalDescription");
  const confirmButton = document.getElementById("confirmDeleteFuel");
  const safeCount = Number(count) || 0;

  if (title) {
    title.textContent = "Delete Selected Fuel Records";
  }

  if (description) {
    description.textContent =
      "Delete " +
      safeCount +
      " selected fuel record" +
      (safeCount === 1 ? "" : "s") +
      "? This action cannot be undone.";
  }

  if (confirmButton) {
    confirmButton.innerHTML = '<i class="ph ph-trash"></i> Delete Selected';
  }
}

function deleteFuelRecord(rowOrId) {
  const tableBody = document.getElementById("fuelTableBody");
  if (!tableBody) return false;

  let row = null;
  let id = "";

  if (typeof rowOrId === "string") {
    id = rowOrId.trim();
    if (!id) return false;

    row =
      typeof resolveFuelRowById === "function"
        ? resolveFuelRowById(id)
        : null;

    if (!row && typeof getFuelDataRows === "function") {
      row =
        getFuelDataRows(tableBody).find((candidate) => {
          const candidateId =
            (candidate.dataset.fuelId || "").trim() ||
            candidate.querySelector(".fuel-number")?.textContent?.trim() ||
            "";
          return candidateId === id;
        }) || null;
    }
  } else if (rowOrId && rowOrId.nodeType === Node.ELEMENT_NODE) {
    row = rowOrId;
    id =
      (row.dataset.fuelId || "").trim() ||
      row.querySelector(".fuel-number")?.textContent?.trim() ||
      "";
  }

  if (!row || !row.isConnected) return false;

  if (id && typeof removeFuelSelectionId === "function") {
    removeFuelSelectionId(id);
  }

  try {
    row.remove();
    return true;
  } catch (error) {
    console.error("deleteFuelRecord failed:", error);
    return false;
  }
}

function openDeleteFuelModal(row, opener) {
  const modal = document.getElementById("deleteFuelModal");
  if (!modal || !row) return;

  deleteFuelModalState.mode = "single";
  deleteFuelModalState.bulkIds = [];
  deleteFuelModalState.currentRow = row;
  deleteFuelModalState.opener = opener || null;

  populateDeleteFuel(row);
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
  document.getElementById("cancelDeleteFuel")?.focus();
}

function openBulkDeleteFuelModal(ids, opener) {
  const modal = document.getElementById("deleteFuelModal");
  if (!modal) return;

  const bulkIds = Array.isArray(ids)
    ? ids.map((id) => String(id).trim()).filter(Boolean)
    : [];

  if (bulkIds.length === 0) return;

  deleteFuelModalState.mode = "bulk";
  deleteFuelModalState.bulkIds = bulkIds;
  deleteFuelModalState.currentRow = null;
  deleteFuelModalState.opener = opener || null;

  populateBulkDeleteFuel(bulkIds.length);
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
  document.getElementById("cancelDeleteFuel")?.focus();
}

function closeDeleteFuelModal(opener) {
  const modal = document.getElementById("deleteFuelModal");
  if (!modal || !modal.classList.contains("show")) return;

  modal.classList.remove("show");
  document.body.style.overflow = "";

  const focusTarget = opener || deleteFuelModalState.opener;
  deleteFuelModalState.currentRow = null;
  deleteFuelModalState.bulkIds = [];
  deleteFuelModalState.mode = "single";
  deleteFuelModalState.opener = null;

  if (focusTarget && focusTarget.isConnected) {
    focusTarget.focus();
  }
}

function confirmSingleFuelDelete() {
  const row = deleteFuelModalState.currentRow;
  const opener = deleteFuelModalState.opener;

  if (!row || !row.isConnected) {
    closeDeleteFuelModal(opener);
    return;
  }

  const deleted = deleteFuelRecord(row);
  closeDeleteFuelModal(opener);

  if (!deleted) {
    if (typeof showToast === "function") {
      showToast("Unable to delete the fuel record.", "error");
    }
    return;
  }

  if (typeof refreshFuelTable === "function") {
    refreshFuelTable({
      resetPage: false,
      refreshStatistics: true,
      reason: "delete",
    });
  } else if (typeof updateFuelStatistics === "function") {
    updateFuelStatistics();
  }

  if (typeof syncFuelSelectionUI === "function") {
    syncFuelSelectionUI();
  }

  if (typeof showToast === "function") {
    showToast("Fuel record deleted successfully.", "success");
  }
}

function confirmBulkFuelDelete() {
  const opener = deleteFuelModalState.opener;
  const bulkIds = Array.from(deleteFuelModalState.bulkIds || []);
  const deleteButton = document.getElementById("deleteSelectedFuel");

  if (bulkIds.length === 0) {
    closeDeleteFuelModal(opener);
    return;
  }

  if (deleteButton) {
    deleteButton.disabled = true;
    deleteButton.dataset.processing = "true";
  }

  let successCount = 0;
  let failCount = 0;

  bulkIds.forEach((id) => {
    try {
      if (deleteFuelRecord(id)) {
        successCount += 1;
      } else {
        failCount += 1;
      }
    } catch (error) {
      console.error("Bulk fuel delete failed for:", id, error);
      failCount += 1;
    }
  });

  if (typeof clearFuelSelection === "function") {
    clearFuelSelection();
  } else {
    selectedFuelIds?.clear?.();
    if (typeof syncFuelSelectionUI === "function") {
      syncFuelSelectionUI();
    }
  }

  closeDeleteFuelModal(opener);

  if (typeof refreshFuelTable === "function") {
    refreshFuelTable({
      resetPage: false,
      refreshStatistics: true,
      reason: "bulk-delete",
    });
  } else if (typeof updateFuelStatistics === "function") {
    updateFuelStatistics();
  }

  if (typeof syncFuelSelectionUI === "function") {
    syncFuelSelectionUI();
  }

  if (deleteButton) {
    deleteButton.dataset.processing = "false";
    deleteButton.disabled = false;
  }

  if (typeof showToast === "function") {
    if (failCount === 0) {
      showToast(
        "Successfully deleted " +
          successCount +
          " fuel record" +
          (successCount === 1 ? "" : "s") +
          ".",
        "success",
      );
    } else {
      showToast(
        "Successfully deleted " +
          successCount +
          " fuel records. " +
          failCount +
          " records could not be deleted.",
        "warning",
      );
    }
  }
}

function initDeleteFuelModal() {
  if (deleteFuelInitialized) return;

  const modal = document.getElementById("deleteFuelModal");
  if (!modal) return;

  deleteFuelInitialized = true;

  document.addEventListener("click", (event) => {
    const deleteBtn = event.target.closest(".action-btn.delete-fuel");
    if (deleteBtn) {
      const row = deleteBtn.closest("tr");
      if (row) openDeleteFuelModal(row, deleteBtn);
      return;
    }

    if (
      event.target.closest("#closeDeleteFuelModal") ||
      event.target.closest("#cancelDeleteFuel") ||
      event.target === modal
    ) {
      closeDeleteFuelModal();
      return;
    }

    if (event.target.closest("#confirmDeleteFuel")) {
      if (deleteFuelModalState.mode === "bulk") {
        confirmBulkFuelDelete();
      } else {
        confirmSingleFuelDelete();
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeDeleteFuelModal();
    }
  });
}

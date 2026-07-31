let deleteMaintenanceInitialized = false;
const deleteMaintenanceModal = {
  currentRow: null,
  opener: null,
  mode: "single", // "single" | "bulk"
  bulkIds: [],
};

function populateDeleteMaintenance(row) {
  if (!row) {
    return;
  }

  const getText = (selector, fallback = "Not available") => {
    const el = row.querySelector(selector);
    return el ? el.textContent.trim() : fallback;
  };

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  };

  const number = getText(".maintenance-number");
  const vehicle = getText(".maintenance-vehicle");

  setText("deleteMaintenanceNumber", number);
  setText("deleteMaintenanceVehicle", vehicle);

  const title = document.getElementById("deleteMaintenanceModalTitle");
  const description = document.getElementById("deleteMaintenanceModalDescription");
  const confirmButton = document.getElementById("confirmDeleteMaintenance");

  if (title) {
    title.textContent = "Delete Maintenance Record";
  }

  if (description) {
    description.innerHTML =
      "Are you sure you want to delete " +
      "<strong id=\"deleteMaintenanceNumber\">" +
      number +
      "</strong> for <strong id=\"deleteMaintenanceVehicle\">" +
      vehicle +
      "</strong>?";
  }

  if (confirmButton) {
    confirmButton.innerHTML =
      '<i class="ph ph-trash"></i> Delete Maintenance';
  }
}

function populateBulkDeleteMaintenance(count) {
  const title = document.getElementById("deleteMaintenanceModalTitle");
  const description = document.getElementById(
    "deleteMaintenanceModalDescription",
  );
  const confirmButton = document.getElementById("confirmDeleteMaintenance");
  const safeCount = Number(count) || 0;

  if (title) {
    title.textContent = "Delete Selected Maintenance Records";
  }

  if (description) {
    description.textContent =
      "Delete " +
      safeCount +
      " selected maintenance record" +
      (safeCount === 1 ? "" : "s") +
      "?";
  }

  if (confirmButton) {
    confirmButton.innerHTML =
      '<i class="ph ph-trash"></i> Delete Selected';
  }
}

/**
 * Remove one maintenance data row by element or stable ID.
 * Does not refresh the table or show toasts (caller orchestrates).
 * @returns {boolean}
 */
function deleteMaintenanceRecord(rowOrId) {
  const tableBody = document.getElementById("maintenanceTableBody");
  if (!tableBody) return false;

  let row = null;
  let id = "";

  if (typeof rowOrId === "string") {
    id = rowOrId.trim();
    if (!id) return false;

    const rows =
      typeof getMaintenanceDataRows === "function"
        ? getMaintenanceDataRows(tableBody)
        : Array.from(tableBody.querySelectorAll("tr"));

    row = rows.find((candidate) => {
      const candidateId =
        (candidate.dataset.maintenanceId || "").trim() ||
        (candidate.querySelector(".maintenance-number")?.textContent || "").trim();
      return candidateId === id;
    });
  } else if (rowOrId && rowOrId.nodeType === Node.ELEMENT_NODE) {
    row = rowOrId;
    id =
      (row.dataset.maintenanceId || "").trim() ||
      (row.querySelector(".maintenance-number")?.textContent || "").trim();
  }

  if (!row || !row.isConnected) {
    return false;
  }

  if (id && typeof removeMaintenanceSelectionId === "function") {
    removeMaintenanceSelectionId(id);
  }

  try {
    row.remove();
    return true;
  } catch (error) {
    console.error("deleteMaintenanceRecord failed:", error);
    return false;
  }
}

function openDeleteMaintenanceModal(row, opener) {
  const modal = document.getElementById("deleteMaintenanceModal");
  if (!modal || !row) return;

  deleteMaintenanceModal.mode = "single";
  deleteMaintenanceModal.bulkIds = [];
  deleteMaintenanceModal.currentRow = row;
  deleteMaintenanceModal.opener = opener || null;

  populateDeleteMaintenance(row);
  modal.classList.add("show");
  document.body.style.overflow = "hidden";

  const cancelBtn = document.getElementById("cancelDeleteMaintenance");
  if (cancelBtn) {
    cancelBtn.focus();
  }
}

function openBulkDeleteMaintenanceModal(ids, opener) {
  const modal = document.getElementById("deleteMaintenanceModal");
  if (!modal) return;

  const bulkIds = Array.isArray(ids)
    ? ids.map((id) => String(id).trim()).filter(Boolean)
    : [];

  if (bulkIds.length === 0) return;

  deleteMaintenanceModal.mode = "bulk";
  deleteMaintenanceModal.bulkIds = bulkIds;
  deleteMaintenanceModal.currentRow = null;
  deleteMaintenanceModal.opener = opener || null;

  populateBulkDeleteMaintenance(bulkIds.length);
  modal.classList.add("show");
  document.body.style.overflow = "hidden";

  const cancelBtn = document.getElementById("cancelDeleteMaintenance");
  if (cancelBtn) {
    cancelBtn.focus();
  }
}

function closeDeleteMaintenanceModal(opener) {
  const modal = document.getElementById("deleteMaintenanceModal");
  if (!modal || !modal.classList.contains("show")) return;

  modal.classList.remove("show");
  document.body.style.overflow = "";
  deleteMaintenanceModal.currentRow = null;
  deleteMaintenanceModal.bulkIds = [];
  deleteMaintenanceModal.mode = "single";

  const focusTarget = opener || deleteMaintenanceModal.opener;
  if (focusTarget && focusTarget.isConnected) {
    focusTarget.focus();
  }
}

function confirmSingleMaintenanceDelete() {
  const row = deleteMaintenanceModal.currentRow;
  const opener = deleteMaintenanceModal.opener;

  if (!row || !row.isConnected) {
    closeDeleteMaintenanceModal(opener);
    return;
  }

  const deleted = deleteMaintenanceRecord(row);
  closeDeleteMaintenanceModal(opener);

  if (!deleted) {
    if (typeof showToast === "function") {
      showToast("Unable to delete the maintenance record.", "error");
    }
    return;
  }

  if (typeof refreshMaintenanceTable === "function") {
    refreshMaintenanceTable({
      resetPage: false,
      refreshStatistics: true,
      reason: "delete",
    });
  } else if (typeof updateMaintenanceStatistics === "function") {
    updateMaintenanceStatistics();
  }

  if (typeof syncMaintenanceSelectionUI === "function") {
    syncMaintenanceSelectionUI();
  }

  if (typeof showToast === "function") {
    showToast("Maintenance record deleted successfully.", "success");
  }
}

function confirmBulkMaintenanceDelete() {
  const opener = deleteMaintenanceModal.opener;
  const bulkIds = Array.from(deleteMaintenanceModal.bulkIds || []);
  const deleteButton = document.getElementById("deleteSelectedMaintenance");

  if (bulkIds.length === 0) {
    closeDeleteMaintenanceModal(opener);
    return;
  }

  if (deleteButton) {
    deleteButton.disabled = true;
  }

  let successCount = 0;
  let failCount = 0;

  bulkIds.forEach((id) => {
    try {
      if (deleteMaintenanceRecord(id)) {
        successCount += 1;
      } else {
        failCount += 1;
      }
    } catch (error) {
      console.error("Bulk maintenance delete failed for:", id, error);
      failCount += 1;
    }
  });

  /* Clear any remaining selected IDs after batch */
  if (typeof clearMaintenanceSelection === "function") {
    clearMaintenanceSelection();
  } else if (typeof selectedMaintenanceIds !== "undefined") {
    selectedMaintenanceIds.clear();
    if (typeof syncMaintenanceSelectionUI === "function") {
      syncMaintenanceSelectionUI();
    }
  }

  closeDeleteMaintenanceModal(opener);

  if (typeof refreshMaintenanceTable === "function") {
    refreshMaintenanceTable({
      resetPage: false,
      refreshStatistics: true,
      reason: "bulk-delete",
    });
  } else if (typeof updateMaintenanceStatistics === "function") {
    updateMaintenanceStatistics();
  }

  if (typeof syncMaintenanceSelectionUI === "function") {
    syncMaintenanceSelectionUI();
  }

  if (deleteButton) {
    deleteButton.disabled = false;
  }

  if (typeof showToast === "function") {
    if (failCount === 0) {
      showToast(
        "Successfully deleted " +
          successCount +
          " maintenance record" +
          (successCount === 1 ? "" : "s") +
          ".",
        "success",
      );
    } else if (successCount === 0) {
      showToast("Unable to delete the selected maintenance records.", "error");
    } else {
      showToast(
        "Successfully deleted " +
          successCount +
          " record" +
          (successCount === 1 ? "" : "s") +
          ". " +
          failCount +
          " record" +
          (failCount === 1 ? "" : "s") +
          " could not be deleted.",
        "warning",
      );
    }
  }

  if (opener && opener.isConnected) {
    opener.focus();
  }
}

function initDeleteMaintenanceModal() {
  if (deleteMaintenanceInitialized) {
    return;
  }

  const modal = document.getElementById("deleteMaintenanceModal");

  if (!modal || modal.dataset.deleteMaintenanceModalInitialized === "true") {
    return;
  }

  modal.dataset.deleteMaintenanceModalInitialized = "true";
  deleteMaintenanceModal.currentRow = null;
  deleteMaintenanceModal.bulkIds = [];
  deleteMaintenanceModal.mode = "single";

  document.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".action-btn.delete-maintenance");

    if (deleteButton) {
      const row = deleteButton.closest("tr");

      if (row) {
        openDeleteMaintenanceModal(row, deleteButton);
      }
    }
  });

  const closeButton = document.getElementById("closeDeleteMaintenanceModal");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      closeDeleteMaintenanceModal(deleteMaintenanceModal.opener);
    });
  }

  const cancelButton = document.getElementById("cancelDeleteMaintenance");
  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      closeDeleteMaintenanceModal(deleteMaintenanceModal.opener);
    });
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeDeleteMaintenanceModal(deleteMaintenanceModal.opener);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeDeleteMaintenanceModal(deleteMaintenanceModal.opener);
    }
  });

  const confirmButton = document.getElementById("confirmDeleteMaintenance");
  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      if (deleteMaintenanceModal.mode === "bulk") {
        confirmBulkMaintenanceDelete();
        return;
      }

      confirmSingleMaintenanceDelete();
    });
  }

  deleteMaintenanceInitialized = true;
}

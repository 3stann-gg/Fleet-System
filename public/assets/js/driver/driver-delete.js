/* ==========================================
   Delete Driver Modal
========================================== */

function openDeleteDriverModal(modal) {
  if (!modal.classList.contains("show")) {
    modal.dataset.previousBodyOverflow = document.body.style.overflow;
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeDeleteDriverModal(modal) {
  if (!modal.classList.contains("show")) return;

  modal.classList.remove("show");
  document.body.style.overflow = modal.dataset.previousBodyOverflow || "";
  delete modal.dataset.previousBodyOverflow;
  modal.currentRow = null;
}

function refreshDriverAfterDelete() {
  if (typeof updateDriverStats === "function") {
    updateDriverStats();
  }

  if (typeof initDriverPagination === "function") {
    initDriverPagination();
  }

  if (typeof refreshDriverBulkState === "function") {
    refreshDriverBulkState();
  }
}

function initDeleteDriverModal() {
  const modal = document.getElementById("deleteDriverModal");
  const cancelButton = document.getElementById("cancelDeleteDriver");
  const confirmButton = document.getElementById("confirmDeleteDriver");
  const driverNameElement = document.getElementById("deleteDriverName");

  if (!modal || modal.dataset.deleteDriverModalInitialized === "true") {
    return;
  }

  modal.dataset.deleteDriverModalInitialized = "true";

  document.addEventListener("click", (event) => {
    if (!event.target || typeof event.target.closest !== "function") return;

    const deleteButton = event.target.closest(".action-btn.delete-driver");

    if (!deleteButton) return;

    const row = deleteButton.closest("tr");

    if (!row) return;

    const name = row.querySelector(".driver-name")?.textContent.trim() ||
      "this driver";

    modal.currentRow = row;

    if (driverNameElement) {
      driverNameElement.textContent = name;
    }

    openDeleteDriverModal(modal);
  });

  cancelButton?.addEventListener("click", () => closeDeleteDriverModal(modal));

  confirmButton?.addEventListener("click", () => {
    const row = modal.currentRow;

    if (!row) return;

    row.remove();
    closeDeleteDriverModal(modal);
    refreshDriverAfterDelete();

    if (typeof window.showToast === "function") {
      window.showToast("Driver deleted successfully.", "success");
    }
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeDeleteDriverModal(modal);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeDeleteDriverModal(modal);
    }
  });
}

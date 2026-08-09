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
    document.body.style.overflow =
        modal.dataset.previousBodyOverflow || "";

    delete modal.dataset.previousBodyOverflow;
    delete modal.dataset.driverId;

    modal.currentRow = null;
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

    const deleteButton = event.target.closest(".action-btn.delete");

    if (!deleteButton) return;

    const row = deleteButton.closest("tr");
    if (!row) return;
    modal.dataset.driverId = row.dataset.id;;

    if (!row) return;

    const name =
      `${row.dataset.firstName} ${row.dataset.lastName}`.trim();

    modal.currentRow = row;

    if (driverNameElement) {
      driverNameElement.textContent = name;
    }

    openDeleteDriverModal(modal);
  });

  cancelButton?.addEventListener("click", () => closeDeleteDriverModal(modal));

  confirmButton?.addEventListener("click", async () => {
      const driverId = modal.dataset.driverId;
      if (!driverId) return;

      try {
          const response = await fetch(`/drivers/${driverId}`, {
              method: "DELETE",

              headers: {
                  "X-CSRF-TOKEN": document
                      .querySelector('meta[name="csrf-token"]')
                      .content,
                  "Accept": "application/json"
              }
          });

          const data = await response.json();

          if (data.success) {
              closeDeleteDriverModal(modal);
              loadDrivers();
              window.showToast(data.message, "success");
          }

          if (!response.ok) {
              window.showToast(
                  data.message || "Failed to delete driver.",
                  "error"
              );

              return;
          }

      }
      catch(error){
          console.error(error);
          window.showToast(
              "Failed to delete driver.",
              "error"
          );
      }

  });
}

document.addEventListener("DOMContentLoaded", () => {
    initDeleteDriverModal();
});


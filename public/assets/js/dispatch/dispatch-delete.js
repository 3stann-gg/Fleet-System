let modal;

function initDeleteDispatchModal() {
  if (typeof initDeleteDispatchModal.initialized !== "undefined") {
    return;
  }
  initDeleteDispatchModal.initialized = true;

  modal = document.getElementById("deleteDispatchModal");

  if (!modal) {
    return;
  }

  document.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".action-btn.delete-dispatch");

    if (!deleteButton) {
      return;
    }

    const row = deleteButton.closest("tr");
    const dispatchNumber = row
      ?.querySelector(".dispatch-number")
      ?.textContent?.trim();

    const nameElement = modal.querySelector("#deleteDispatchName");
    if (nameElement && dispatchNumber) {
      nameElement.textContent = dispatchNumber;
    }

    modal.currentRow = row;
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  const cancelButton = modal.querySelector("#cancelDeleteDispatch");
  if (cancelButton) {
    cancelButton.addEventListener("click", closeModal);
  }

  const confirmButton = modal.querySelector("#confirmDeleteDispatch");
  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      if (!modal.currentRow) {
        return;
      }

      modal.currentRow.remove();
      closeModal();

      if (typeof updateDispatchStatistics === "function") {
        updateDispatchStatistics();
      }
      if (typeof updateDispatchPagination === "function") {
        updateDispatchPagination();
      }
      if (typeof refreshDispatchBulkState === "function") {
        refreshDispatchBulkState();
      }
      if (typeof showToast === "function") {
        showToast("Dispatch deleted successfully.", "success");
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });

  function closeModal() {
    modal.classList.remove("show");
    document.body.style.overflow = "";
    delete modal.currentRow;
  }
}

let dispatchModalInitialized = false;

function validateDispatchForm(form) {
  let isValid = true;
  const firstInvalid = [];

  const requiredFields = [
    { id: "dispatchNumber", validate: (v) => v.trim().length >= 5 },
    { id: "dispatchReservation", validate: (v) => v.trim() !== "" },
    { id: "dispatchPatient", validate: (v) => v.trim() !== "" },
    { id: "dispatchRequestType", validate: (v) => v.trim() !== "" },
    { id: "dispatchVehicle", validate: (v) => v.trim() !== "" },
    { id: "dispatchDriver", validate: (v) => v.trim() !== "" },
    { id: "dispatchPickup", validate: (v) => v.trim() !== "" },
    { id: "dispatchDestination", validate: (v) => v.trim() !== "" },
    {
      id: "dispatchDate",
      validate: (v) => {
        if (v.trim() === "") return false;
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        )
          .toISOString()
          .split("T")[0];
        return v >= today;
      },
    },
    { id: "dispatchTime", validate: (v) => v.trim() !== "" },
    { id: "dispatchPriority", validate: (v) => v.trim() !== "" },
    { id: "dispatchStatus", validate: (v) => v.trim() !== "" },
  ];

  requiredFields.forEach((field) => {
    const el = document.getElementById(field.id);
    if (!el) return;

    const value = el.value || "";
    const valid = field.validate(value);

    if (!valid) {
      isValid = false;
      el.classList.add("is-invalid");
      firstInvalid.push(el);
    } else {
      el.classList.remove("is-invalid");
    }
  });

  const contactEl = document.getElementById("dispatchContact");
  if (contactEl && contactEl.value.trim() !== "") {
    const contactValid = /^[0-9+\-() ]*$/.test(contactEl.value);
    if (!contactValid) {
      isValid = false;
      contactEl.classList.add("is-invalid");
      firstInvalid.push(contactEl);
    } else {
      contactEl.classList.remove("is-invalid");
    }
  }

  if (firstInvalid.length > 0) {
    firstInvalid[0].focus();
  }

  return isValid;
}

function initDispatchModal() {
  if (dispatchModalInitialized) {
    return;
  }

  dispatchModalInitialized = true;

  const modal = document.getElementById("addDispatchModal");
  const openBtn = document.getElementById("createDispatchBtn");

  if (!modal || !openBtn) {
    return;
  }

  const closeModal = () => {
    modal.classList.remove("show");
    document.body.style.overflow = "";
  };

  openBtn.addEventListener("click", () => {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  });

  const closeBtn = document.getElementById("closeAddDispatchModal");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  const cancelBtn = document.getElementById("cancelAddDispatch");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });

  const form = document.getElementById("dispatchForm");
  if (form) {
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        input.classList.remove("is-invalid");
      });
      input.addEventListener("change", () => {
        input.classList.remove("is-invalid");
      });
    });
  }
}

function updateDispatchStatistics() {
  const tableBody = document.getElementById("dispatchTableBody");

  if (!tableBody) {
    return;
  }

  const rows = Array.from(tableBody.querySelectorAll("tr")).filter((row) => {
    if (row.classList.contains("dispatch-no-results")) {
      return false;
    }

    return (
      row.querySelector(".dispatch-number") !== null ||
      row.querySelector(".dispatch-checkbox") !== null
    );
  });

  let total = 0;
  let assigned = 0;
  let active = 0;
  let completed = 0;

  rows.forEach((row) => {
    total++;

    const statusText = (
      row.querySelector(".status-badge")?.textContent || ""
    ).trim();

    if (statusText === "Assigned") {
      assigned++;
    } else if (statusText === "En Route" || statusText === "Arrived") {
      active++;
    } else if (statusText === "Completed") {
      completed++;
    }
  });

  const totalEl = document.getElementById("totalDispatches");
  const assignedEl = document.getElementById("assignedDispatches");
  const activeEl = document.getElementById("activeDispatches");
  const completedEl = document.getElementById("completedDispatches");

  if (totalEl) {
    totalEl.textContent = total;
  }
  if (assignedEl) {
    assignedEl.textContent = assigned;
  }
  if (activeEl) {
    activeEl.textContent = active;
  }
  if (completedEl) {
    completedEl.textContent = completed;
  }
}

/*
|--------------------------------------------------------------------------
| If want Pending are showed in stats
|--------------------------------------------------------------------------
*/
/*
  function updateDispatchStatistics() {
    const tableBody = document.getElementById("dispatchTableBody");
    if (!tableBody) {
      return;
    }

    const rows = Array.from(tableBody.querySelectorAll("tr")).filter((row) => {
      if (row.classList.contains("dispatch-no-results")) {
        return false;
      }
      return (
        row.querySelector(".dispatch-number") !== null ||
        row.querySelector(".dispatch-checkbox") !== null
      );
    });

    let total = 0;
    let pending = 0;
    let active = 0;
    let completed = 0;

    rows.forEach((row) => {
      total++;
      const statusText =
        (row.querySelector(".status-badge")?.textContent || "").trim();

      if (statusText === "Pending") {
        pending++;
      } else if (
        statusText === "Assigned" ||
        statusText === "En Route" ||
        statusText === "Arrived"
      ) {
        active++;
      } else if (statusText === "Completed") {
        completed++;
      }
    });

    const totalEl = document.getElementById("totalDispatches");
    const pendingEl = document.getElementById("pendingDispatches");
    const activeEl = document.getElementById("activeDispatches");
    const completedEl = document.getElementById("completedDispatches");

    if (totalEl) {
      totalEl.textContent = total;
    }
    if (pendingEl) {
      pendingEl.textContent = pending;
    }
    if (activeEl) {
      activeEl.textContent = active;
    }
    if (completedEl) {
      completedEl.textContent = completed;
    }
  }
*/

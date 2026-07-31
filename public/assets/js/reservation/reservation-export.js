let reservationExportInitialized = false;

function initReservationExport() {
  if (reservationExportInitialized) return;

  const exportButton = document.getElementById("exportReservations");
  if (!exportButton) return;

  reservationExportInitialized = true;

  exportButton.addEventListener("click", () => {
    try {
      if (typeof XLSX === "undefined") {
        if (typeof showToast === "function") {
          showToast("Excel export library is unavailable.", "error");
        }
        return;
      }

      const tableBody = document.getElementById("reservationTableBody");
      if (!tableBody) return;

      const rows = Array.from(tableBody.querySelectorAll("tr"));

      const headers = [
        "Reservation Number",
        "Patient Name",
        "Request Type",
        "Vehicle",
        "Driver",
        "Pickup Location",
        "Destination",
        "Schedule",
        "Priority",
        "Status",
        "Contact Number",
        "Notes",
      ];

      const data = [];

      rows.forEach((row) => {
        if (
          row.id === "reservation-no-results" ||
          row.classList.contains("reservation-no-results")
        ) {
          return;
        }

        const isReal =
          row.querySelector(".reservation-number") ||
          row.querySelector(".reservation-checkbox");

        if (!isReal) {
          return;
        }

        if (row.dataset.reservationMatchesFilter === "false") {
          return;
        }

        const getText = (selector) => {
          const el = row.querySelector(selector);
          return el ? el.textContent.trim() : "";
        };

        const getDataset = (key) => {
          const value = row.dataset[key];
          return value ? value.trim() : "Not provided";
        };

        const schedule = getText(".reservation-schedule");
        const status = getText(".status-badge");

        data.push([
          getText(".reservation-number"),
          getText(".patient-name"),
          getDataset("requestType"),
          getText(".reservation-vehicle"),
          getText(".reservation-driver"),
          getText(".reservation-pickup"),
          getText(".reservation-destination"),
          schedule || "Not provided",
          getDataset("priority"),
          status || "Not provided",
          getDataset("contact"),
          getDataset("notes"),
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reservations");

      XLSX.writeFile(workbook, "HIMS_Reservation_Report.xlsx");

      if (typeof showToast === "function") {
        showToast("Reservation report exported to Excel successfully.", "success");
      }
    } catch (error) {
      if (typeof showToast === "function") {
        showToast("Excel export library is unavailable.", "error");
      }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReservationExport);
} else {
  initReservationExport();
}

let reservationPDFExportInitialized = false;

function initReservationPDFExport() {
  if (reservationPDFExportInitialized) return;

  const pdfButton = document.getElementById("exportReservationPDF");
  if (!pdfButton) return;

  reservationPDFExportInitialized = true;

  pdfButton.addEventListener("click", () => {
    try {
      if (typeof window.jspdf === "undefined" || typeof window.jspdf.jsPDF === "undefined") {
        if (typeof showToast === "function") {
          showToast("PDF export library is unavailable.", "error");
        }
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "landscape" });

      const tableBody = document.getElementById("reservationTableBody");
      if (!tableBody) return;

      const rows = Array.from(tableBody.querySelectorAll("tr"));

      const headers = [
        "Reservation No.",
        "Patient",
        "Request Type",
        "Vehicle",
        "Driver",
        "Pickup",
        "Destination",
        "Schedule",
        "Priority",
        "Status",
      ];

      const data = [];

      rows.forEach((row) => {
        if (
          row.id === "reservation-no-results" ||
          row.classList.contains("reservation-no-results")
        ) {
          return;
        }

        const isReal =
          row.querySelector(".reservation-number") ||
          row.querySelector(".reservation-checkbox");

        if (!isReal) {
          return;
        }

        if (row.dataset.reservationMatchesFilter === "false") {
          return;
        }

        const getText = (selector) => {
          const el = row.querySelector(selector);
          return el ? el.textContent.trim() : "";
        };

        const getDataset = (key) => {
          const value = row.dataset[key];
          return value ? value.trim() : "Not provided";
        };

        const schedule = getText(".reservation-schedule");
        const status = getText(".status-badge");

        data.push([
          getText(".reservation-number"),
          getText(".patient-name"),
          getDataset("requestType"),
          getText(".reservation-vehicle"),
          getText(".reservation-driver"),
          getText(".reservation-pickup"),
          getText(".reservation-destination"),
          schedule || "Not provided",
          getDataset("priority"),
          status || "Not provided",
        ]);
      });

      const generatedDate = new Date().toLocaleString();

      doc.setFontSize(16);
      doc.text("Hospital Information Management System", 14, 15);
      doc.setFontSize(12);
      doc.text("Fleet & Transportation Management", 14, 22);
      doc.text("Reservation Report", 14, 29);
      doc.text("Generated: " + generatedDate, 14, 36);

      doc.autoTable({
        head: [headers],
        body: data,
        startY: 42,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      });

      doc.save("HIMS_Reservation_Report.pdf");

      if (typeof showToast === "function") {
        showToast("Reservation report exported to PDF successfully.", "success");
      }
    } catch (error) {
      if (typeof showToast === "function") {
        showToast("PDF export library is unavailable.", "error");
      }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReservationPDFExport);
} else {
  initReservationPDFExport();
}

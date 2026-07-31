/* ==========================================
   Vehicle Export Reports
========================================== */

function getVehicleReportRows() {
  const tableBody = document.getElementById("vehicleTableBody");

  if (!tableBody) return [];

  const rows =
    typeof getVehicleDataRows === "function"
      ? getVehicleDataRows(tableBody)
      : Array.from(tableBody.querySelectorAll("tr")).filter((row) =>
          Boolean(row.querySelector(".vehicle-name") || row.querySelector(".vehicle-checkbox")),
        );

  return rows.filter((row) => row.dataset.vehicleMatchesFilter !== "false");
}

function getVehicleReportText(row, columnIndex, selector) {
  const selectedElement = selector ? row.querySelector(selector) : null;
  const cell = row.children?.[columnIndex];
  const value = selectedElement ? selectedElement.textContent : cell?.textContent;

  return value ? value.trim() : "";
}

function getVehicleReportData(row) {
  return {
    name: getVehicleReportText(row, 1, ".vehicle-name"),
    plate: getVehicleReportText(row, 2),
    type: getVehicleReportText(row, 3),
    driver: getVehicleReportText(row, 4, ".driver-info span"),
    status: getVehicleReportText(row, 5, ".status-badge"),
    lastService: getVehicleReportText(row, 7),
  };
}

function showVehicleReportToast(message, type) {
  if (typeof window.showToast === "function") {
    window.showToast(message, type);
  }
}

function initVehicleExport() {
  const exportButton = document.getElementById("exportVehicles");

  if (
    !exportButton ||
    exportButton.dataset.vehicleExportInitialized === "true"
  ) {
    return;
  }

  exportButton.dataset.vehicleExportInitialized = "true";

  exportButton.addEventListener("click", () => {
    const xlsx = window.XLSX;

    if (!xlsx?.utils) {
      showVehicleReportToast("Excel export is unavailable.", "error");
      return;
    }

    const data = [
      ["Vehicle", "Plate", "Type", "Driver", "Status", "Last Service"],
      ...getVehicleReportRows().map((row) => {
        const vehicle = getVehicleReportData(row);

        return [
          vehicle.name,
          vehicle.plate,
          vehicle.type,
          vehicle.driver,
          vehicle.status,
          vehicle.lastService,
        ];
      }),
    ];

    try {
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.aoa_to_sheet(data);
      const today = new Date().toISOString().split("T")[0];

      xlsx.utils.book_append_sheet(workbook, worksheet, "Fleet Vehicles");
      xlsx.writeFile(
          workbook,
          `Fleet_Vehicles_${today}.xlsx`
      );
      showVehicleReportToast("Excel exported successfully.", "success");
    } catch {
      showVehicleReportToast("Unable to export vehicles to Excel.", "error");
    }
  });
}

/* ==========================================
   Export PDF
========================================== */

function initVehiclePDFExport() {
  const exportButton = document.getElementById("exportPDF");

  if (
    !exportButton ||
    exportButton.dataset.vehiclePdfExportInitialized === "true"
  ) {
    return;
  }

  exportButton.dataset.vehiclePdfExportInitialized = "true";

  exportButton.addEventListener("click", () => {
    const jsPDF = window.jspdf?.jsPDF;

    if (!jsPDF) {
      showVehicleReportToast("PDF export is unavailable.", "error");
      return;
    }

    try {
      const pdfDocument = new jsPDF();

      if (typeof pdfDocument.autoTable !== "function") {
        showVehicleReportToast("PDF export is unavailable.", "error");
        return;
      }

      pdfDocument.setFontSize(18);
      pdfDocument.text("Fleet Vehicle Report", 14, 18);

      const rows = getVehicleReportRows().map((row) => {
        const vehicle = getVehicleReportData(row);

        return [
          vehicle.name,
          vehicle.plate,
          vehicle.type,
          vehicle.driver,
          vehicle.status,
          vehicle.lastService,
        ];
      });

      pdfDocument.autoTable({
        head: [["Vehicle", "Plate", "Type", "Driver", "Status", "Last Service"]],
        body: rows,
        startY: 30,
      });

      pdfDocument.save("Fleet_Vehicle_Report.pdf");
      showVehicleReportToast("PDF exported successfully.", "success");
    } catch {
      showVehicleReportToast("Unable to export the Vehicle report to PDF.", "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
    initVehicleExport();
    initVehiclePDFExport();
});

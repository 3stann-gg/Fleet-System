/* ==========================================
   Maintenance Print Report
   Uses getMaintenanceExportRows() (search + filters + sort, no pagination).
   Opens a temporary print window — does not alter the live page.
========================================== */

function escapeMaintenancePrintHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showMaintenancePrintToast(message, type) {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else if (
    typeof window !== "undefined" &&
    typeof window.showToast === "function"
  ) {
    window.showToast(message, type);
  }
}

function formatMaintenancePrintCost(cost) {
  if (typeof formatMaintenanceExportCostDisplay === "function") {
    return formatMaintenanceExportCostDisplay(cost);
  }

  if (typeof cost === "number" && !Number.isNaN(cost)) {
    return `₱${cost.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return cost == null ? "" : String(cost);
}

function getMaintenancePrintRows() {
  if (typeof getMaintenanceExportRows === "function") {
    return getMaintenanceExportRows();
  }

  const tableBody = document.getElementById("maintenanceTableBody");
  if (!tableBody || typeof getMaintenanceDataRows !== "function") {
    return [];
  }

  return getMaintenanceDataRows(tableBody).filter(
    (row) => row.dataset.matchesFilter !== "false",
  );
}

function buildMaintenancePrintTableBody(rows) {
  return rows
    .map((row) => {
      const record =
        typeof getMaintenanceExportData === "function"
          ? getMaintenanceExportData(row)
          : {};

      const notes = record.notes || record.description || "";

      return `<tr>
        <td>${escapeMaintenancePrintHtml(record.number)}</td>
        <td>${escapeMaintenancePrintHtml(record.vehicle)}</td>
        <td>${escapeMaintenancePrintHtml(record.serviceType)}</td>
        <td>${escapeMaintenancePrintHtml(record.technician)}</td>
        <td>${escapeMaintenancePrintHtml(record.scheduledDate)}</td>
        <td>${escapeMaintenancePrintHtml(record.completionDate)}</td>
        <td>${escapeMaintenancePrintHtml(formatMaintenancePrintCost(record.cost))}</td>
        <td>${escapeMaintenancePrintHtml(record.priority)}</td>
        <td>${escapeMaintenancePrintHtml(record.status)}</td>
        <td>${escapeMaintenancePrintHtml(notes)}</td>
      </tr>`;
    })
    .join("");
}

function buildMaintenancePrintHtml(rows) {
  const generatedAt = new Date();
  const generatedDate = generatedAt.toLocaleDateString();
  const generatedTime = generatedAt.toLocaleTimeString();
  const tableBodyHtml = buildMaintenancePrintTableBody(rows);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Maintenance Records Report</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 12mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #000;
      background: #fff;
      font-size: 11px;
      line-height: 1.35;
    }

    .report-header {
      margin-bottom: 14px;
    }

    .report-header h1 {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: 700;
      color: #000;
    }

    .report-header h2 {
      margin: 0 0 8px;
      font-size: 13px;
      font-weight: 600;
      color: #222;
    }

    .report-header h3 {
      margin: 0 0 10px;
      font-size: 15px;
      font-weight: 700;
    }

    .meta {
      margin: 0 0 4px;
      font-size: 11px;
      color: #222;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin-top: 12px;
    }

    thead {
      display: table-header-group;
    }

    tfoot {
      display: table-footer-group;
    }

    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    th,
    td {
      border: 1px solid #666;
      padding: 5px 6px;
      text-align: left;
      vertical-align: top;
      word-wrap: break-word;
    }

    th {
      background: #f0f0f0;
      font-weight: 700;
      font-size: 10px;
    }

    td {
      font-size: 10px;
    }

    tbody tr:nth-child(even) {
      background: #fafafa;
    }

    @media print {
      body {
        background: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      th {
        background: #f0f0f0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <h1>Fleet &amp; Transportation Management</h1>
    <h2>Hospital Information Management System</h2>
    <h3>Maintenance Records Report</h3>
    <p class="meta">Generated Date: ${escapeMaintenancePrintHtml(generatedDate)}</p>
    <p class="meta">Generated Time: ${escapeMaintenancePrintHtml(generatedTime)}</p>
    <p class="meta">Total Printed Records: ${rows.length}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Maintenance No.</th>
        <th>Vehicle</th>
        <th>Service Type</th>
        <th>Technician / Workshop</th>
        <th>Scheduled Date</th>
        <th>Completion Date</th>
        <th>Cost</th>
        <th>Priority</th>
        <th>Status</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${tableBodyHtml}
    </tbody>
  </table>
</body>
</html>`;
}

function printMaintenanceRecords() {
  if (typeof getMaintenanceExportRows !== "function") {
    showMaintenancePrintToast("Unable to prepare the print report.", "error");
    return;
  }

  const rows = getMaintenancePrintRows();

  if (!rows.length) {
    showMaintenancePrintToast(
      "No maintenance records available to print.",
      "warning",
    );
    return;
  }

  let printWindow;

  try {
    printWindow = window.open("", "_blank", "noopener,noreferrer,width=1100,height=760");
  } catch (error) {
    console.error("Maintenance print window failed:", error);
    showMaintenancePrintToast("Unable to open the print report.", "error");
    return;
  }

  if (!printWindow) {
    showMaintenancePrintToast("Unable to open the print report.", "error");
    return;
  }

  try {
    const html = buildMaintenancePrintHtml(rows);

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    const runPrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (error) {
        console.error("Maintenance print failed:", error);
        showMaintenancePrintToast("Unable to print maintenance report.", "error");
      } finally {
        /* Close when safe — afterprint or short delay fallback */
        const closeWindow = () => {
          try {
            printWindow.close();
          } catch {
            /* ignore */
          }
        };

        if (typeof printWindow.addEventListener === "function") {
          printWindow.addEventListener("afterprint", closeWindow, {
            once: true,
          });
        }

        setTimeout(closeWindow, 500);
      }
    };

    if (printWindow.document.readyState === "complete") {
      runPrint();
    } else {
      printWindow.onload = runPrint;
    }
  } catch (error) {
    console.error("Maintenance print failed:", error);
    showMaintenancePrintToast("Unable to print maintenance report.", "error");

    try {
      printWindow.close();
    } catch {
      /* ignore */
    }
  }
}

function initMaintenancePrint() {
  const printButton = document.getElementById("printMaintenance");

  if (
    !printButton ||
    printButton.dataset.maintenancePrintInitialized === "true"
  ) {
    return;
  }

  printButton.dataset.maintenancePrintInitialized = "true";
  printButton.type = "button";

  printButton.addEventListener("click", (event) => {
    event.preventDefault();
    printMaintenanceRecords();
  });
}

/* Self-init — do not modify include.js */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMaintenancePrint);
} else {
  initMaintenancePrint();
}

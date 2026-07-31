/* ==========================================
   Cost Analysis — persistent budget + history
========================================== */

const HIMS_FLEET_COST_BUDGET_KEY = "himsFleetCostAnalysisBudget";
const HIMS_FLEET_COST_BUDGET_HISTORY_KEY = "himsFleetCostAnalysisBudgetHistory";
const COST_BUDGET_HISTORY_MAX = 50;

const COST_BUDGET_CATEGORIES = [
  "Fuel",
  "Maintenance",
  "Trip Operations",
  "Reservation Operations",
  "Other",
];

function emptyCostBudgetConfig() {
  return {
    version: 1,
    overallBudget: null,
    categoryBudgets: {
      Fuel: null,
      Maintenance: null,
      TripOperations: null,
      ReservationOperations: null,
      Other: null,
    },
    periodType: "filter",
    startDate: "",
    endDate: "",
    notes: "",
    createdAt: null,
    updatedAt: null,
  };
}

function parseBudgetNumber(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (Number.isNaN(n) || !Number.isFinite(n) || n < 0) return null;
  return n;
}

function normalizeCostBudgetConfiguration(raw) {
  const base = emptyCostBudgetConfig();
  if (!raw || typeof raw !== "object") return base;

  const categoryBudgets = { ...base.categoryBudgets };
  const srcCats = raw.categoryBudgets || {};
  categoryBudgets.Fuel = parseBudgetNumber(srcCats.Fuel);
  categoryBudgets.Maintenance = parseBudgetNumber(srcCats.Maintenance);
  categoryBudgets.TripOperations = parseBudgetNumber(
    srcCats.TripOperations ?? srcCats["Trip Operations"],
  );
  categoryBudgets.ReservationOperations = parseBudgetNumber(
    srcCats.ReservationOperations ?? srcCats["Reservation Operations"],
  );
  categoryBudgets.Other = parseBudgetNumber(srcCats.Other);

  const periodType = [
    "filter",
    "monthly",
    "quarterly",
    "yearly",
    "custom",
  ].includes(raw.periodType)
    ? raw.periodType
    : "filter";

  return {
    version: 1,
    overallBudget: parseBudgetNumber(
      raw.overallBudget ?? raw.budgetAmount ?? raw.amount,
    ),
    categoryBudgets,
    periodType,
    startDate: String(raw.startDate || "").slice(0, 10),
    endDate: String(raw.endDate || "").slice(0, 10),
    notes: String(raw.notes || "").slice(0, 500),
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
  };
}

function loadCostBudgetConfiguration() {
  try {
    const raw = localStorage.getItem(HIMS_FLEET_COST_BUDGET_KEY);
    if (!raw) return emptyCostBudgetConfig();
    return normalizeCostBudgetConfiguration(JSON.parse(raw));
  } catch (error) {
    console.error("Malformed cost budget storage:", error);
    return emptyCostBudgetConfig();
  }
}

function persistCostBudgetConfiguration(config) {
  try {
    const normalized = normalizeCostBudgetConfiguration(config);
    localStorage.setItem(
      HIMS_FLEET_COST_BUDGET_KEY,
      JSON.stringify(normalized),
    );
    return true;
  } catch (error) {
    console.error("Unable to persist cost budget:", error);
    if (typeof showToast === "function") {
      showToast("Unable to save budget (storage unavailable).", "error");
    }
    return false;
  }
}

function clearCostBudgetConfiguration() {
  try {
    localStorage.removeItem(HIMS_FLEET_COST_BUDGET_KEY);
    return true;
  } catch (error) {
    console.error("Unable to clear cost budget:", error);
    return false;
  }
}

function loadCostBudgetHistory() {
  try {
    const raw = localStorage.getItem(HIMS_FLEET_COST_BUDGET_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => e && typeof e === "object" && e.id && e.action)
      .slice(0, COST_BUDGET_HISTORY_MAX);
  } catch (error) {
    console.error("Malformed cost budget history:", error);
    return [];
  }
}

function persistCostBudgetHistory(list) {
  try {
    localStorage.setItem(
      HIMS_FLEET_COST_BUDGET_HISTORY_KEY,
      JSON.stringify((list || []).slice(0, COST_BUDGET_HISTORY_MAX)),
    );
    return true;
  } catch (error) {
    console.error("Unable to persist budget history:", error);
    return false;
  }
}

function appendCostBudgetHistory(entry) {
  const list = loadCostBudgetHistory();
  list.unshift({
    id: "bh-" + Date.now().toString(36),
    action: entry.action,
    previousValue: entry.previousValue,
    newValue: entry.newValue,
    periodType: entry.periodType || "filter",
    changedAt: new Date().toISOString(),
  });
  persistCostBudgetHistory(list);
  return list;
}

function clearCostBudgetHistory() {
  try {
    localStorage.removeItem(HIMS_FLEET_COST_BUDGET_HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Whether saved budget applies to the active analysis date range.
 */
function isCostBudgetMatchingPeriod(config, range) {
  if (!config || config.overallBudget == null) return false;
  if (!range) return false;
  const type = config.periodType || "filter";

  if (type === "filter") return true;

  if (type === "custom") {
    if (!config.startDate || !config.endDate) return false;
    const s = costParseISO(config.startDate);
    const e = costParseISO(config.endDate);
    if (!s || !e) return false;
    return (
      costStartOfDay(s).getTime() === range.start.getTime() &&
      costEndOfDay(e).getTime() === range.end.getTime()
    );
  }

  if (type === "monthly") {
    return (
      range.start.getFullYear() === range.end.getFullYear() &&
      range.start.getMonth() === range.end.getMonth() &&
      range.start.getDate() === 1
    );
  }

  if (type === "quarterly") {
    const qStart = Math.floor(range.start.getMonth() / 3) * 3;
    return (
      range.start.getMonth() === qStart &&
      range.start.getDate() === 1 &&
      range.start.getFullYear() === range.end.getFullYear()
    );
  }

  if (type === "yearly") {
    return (
      range.start.getMonth() === 0 &&
      range.start.getDate() === 1 &&
      range.start.getFullYear() === range.end.getFullYear()
    );
  }

  return true;
}

function categoryBudgetKey(category) {
  if (category === "Trip Operations") return "TripOperations";
  if (category === "Reservation Operations") return "ReservationOperations";
  return category;
}

function budgetStatusFromUtil(util, hasBudget, hasActual) {
  if (!hasBudget) return "Not Configured";
  if (!hasActual) return "No Cost Data";
  if (util < 80) return "Under Budget";
  if (util <= 100) return "Near Limit";
  return "Over Budget";
}

function buildCategoryBudgetRows(config, filtered) {
  const rows = [];
  const cats = ["Fuel", "Maintenance", "Trip Operations", "Other"];
  cats.forEach((cat) => {
    const key = categoryBudgetKey(cat);
    const budget = config?.categoryBudgets?.[key];
    const actual = sumCost(
      (filtered || []).filter((r) => r.category === cat),
    );
    const hasBudget = budget != null;
    const util =
      hasBudget && budget > 0
        ? (actual / budget) * 100
        : hasBudget && budget === 0
          ? actual > 0
            ? Infinity
            : 0
          : null;
    const remaining = hasBudget ? budget - actual : null;
    let status = "Not Configured";
    if (hasBudget) {
      if (budget === 0 && actual === 0) {
        status = "No Cost Data";
      } else if (!Number.isFinite(util)) {
        status = "Over Budget";
      } else {
        status = budgetStatusFromUtil(util, true, true);
      }
    }
    rows.push({
      category: cat,
      budget: hasBudget ? budget : null,
      actual,
      remaining,
      utilization: Number.isFinite(util) ? util : util === Infinity ? 999 : null,
      status,
    });
  });
  return rows;
}

function renderBudgetHistoryTable() {
  const tbody = document.getElementById("costBudgetHistoryBody");
  if (!tbody) return;
  const history = loadCostBudgetHistory();
  if (!history.length) {
    tbody.innerHTML =
      '<tr class="helper-row"><td colspan="5">No budget history yet.</td></tr>';
    return;
  }
  tbody.innerHTML = history
    .map((h) => {
      const when = new Date(h.changedAt);
      const whenLabel = Number.isNaN(when.getTime())
        ? "—"
        : when.toLocaleString();
      const prev =
        h.previousValue == null
          ? "—"
          : typeof formatCostCurrency === "function"
            ? formatCostCurrency(h.previousValue)
            : h.previousValue;
      const next =
        h.newValue == null
          ? "—"
          : typeof formatCostCurrency === "function"
            ? formatCostCurrency(h.newValue)
            : h.newValue;
      return `<tr>
        <td>${h.action}</td>
        <td>${prev}</td>
        <td>${next}</td>
        <td>${h.periodType || "filter"}</td>
        <td>${whenLabel}</td>
      </tr>`;
    })
    .join("");
}

function renderCategoryBudgetTable(rows) {
  const tbody = document.getElementById("costCategoryBudgetBody");
  if (!tbody) return;
  if (!rows || !rows.length) {
    tbody.innerHTML =
      '<tr class="helper-row"><td colspan="6">No category budgets configured.</td></tr>';
    return;
  }
  tbody.innerHTML = rows
    .map((r) => {
      const budget =
        r.budget == null ? "—" : formatCostCurrency(r.budget);
      const actual = formatCostCurrency(r.actual);
      const remaining =
        r.remaining == null ? "—" : formatCostCurrency(r.remaining);
      const util =
        r.utilization == null ? "—" : formatCostPercent(r.utilization);
      return `<tr>
        <td>${r.category}</td>
        <td>${budget}</td>
        <td>${actual}</td>
        <td>${remaining}</td>
        <td>${util}</td>
        <td><span class="cost-budget-status" data-status="${r.status}">${r.status}</span></td>
      </tr>`;
    })
    .join("");
}

function openCostBudgetModal() {
  const modal = document.getElementById("costBudgetModal");
  if (!modal) return;
  const config =
    costAnalysisState.budgetConfig || loadCostBudgetConfiguration();

  document.getElementById("budgetPeriodType").value =
    config.periodType || "filter";
  document.getElementById("budgetOverallInput").value =
    config.overallBudget != null ? String(config.overallBudget) : "";
  document.getElementById("budgetCatFuel").value =
    config.categoryBudgets?.Fuel != null
      ? String(config.categoryBudgets.Fuel)
      : "";
  document.getElementById("budgetCatMaintenance").value =
    config.categoryBudgets?.Maintenance != null
      ? String(config.categoryBudgets.Maintenance)
      : "";
  document.getElementById("budgetCatTrip").value =
    config.categoryBudgets?.TripOperations != null
      ? String(config.categoryBudgets.TripOperations)
      : "";
  document.getElementById("budgetCatReservation").value =
    config.categoryBudgets?.ReservationOperations != null
      ? String(config.categoryBudgets.ReservationOperations)
      : "";
  document.getElementById("budgetCatOther").value =
    config.categoryBudgets?.Other != null
      ? String(config.categoryBudgets.Other)
      : "";
  document.getElementById("budgetNotes").value = config.notes || "";
  document.getElementById("budgetCustomStart").value = config.startDate || "";
  document.getElementById("budgetCustomEnd").value = config.endDate || "";
  syncBudgetModalPeriodFields();

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
  document.getElementById("budgetOverallInput")?.focus();
}

function closeCostBudgetModal() {
  const modal = document.getElementById("costBudgetModal");
  if (!modal) return;
  modal.classList.remove("show");
  document.body.style.overflow = "";
}

function syncBudgetModalPeriodFields() {
  const type = document.getElementById("budgetPeriodType")?.value;
  const wrap = document.getElementById("budgetCustomPeriodWrap");
  if (wrap) wrap.hidden = type !== "custom";
}

function saveCostBudgetFromModal() {
  const overall = parseBudgetNumber(
    document.getElementById("budgetOverallInput")?.value,
  );
  if (overall == null) {
    if (typeof showToast === "function") {
      showToast("Enter a valid overall budget (0 or greater).", "warning");
    }
    document.getElementById("budgetOverallInput")?.focus();
    return;
  }

  const periodType =
    document.getElementById("budgetPeriodType")?.value || "filter";
  let startDate = document.getElementById("budgetCustomStart")?.value || "";
  let endDate = document.getElementById("budgetCustomEnd")?.value || "";

  if (periodType === "custom") {
    if (!startDate || !endDate) {
      if (typeof showToast === "function") {
        showToast("Custom budget period requires start and end dates.", "warning");
      }
      return;
    }
    if (startDate > endDate) {
      if (typeof showToast === "function") {
        showToast("Budget start cannot be later than end.", "warning");
      }
      return;
    }
  }

  const categoryBudgets = {
    Fuel: parseBudgetNumber(document.getElementById("budgetCatFuel")?.value),
    Maintenance: parseBudgetNumber(
      document.getElementById("budgetCatMaintenance")?.value,
    ),
    TripOperations: parseBudgetNumber(
      document.getElementById("budgetCatTrip")?.value,
    ),
    ReservationOperations: parseBudgetNumber(
      document.getElementById("budgetCatReservation")?.value,
    ),
    Other: parseBudgetNumber(document.getElementById("budgetCatOther")?.value),
  };

  const catTotal = Object.values(categoryBudgets).reduce(
    (s, v) => s + (v || 0),
    0,
  );
  if (catTotal > overall + 0.001) {
    if (typeof showToast === "function") {
      showToast(
        "Category budgets exceed overall budget. Saving anyway.",
        "warning",
      );
    }
  }

  const previous = costAnalysisState.budgetConfig || loadCostBudgetConfiguration();
  const now = new Date().toISOString();
  const next = normalizeCostBudgetConfiguration({
    overallBudget: overall,
    categoryBudgets,
    periodType,
    startDate,
    endDate,
    notes: document.getElementById("budgetNotes")?.value || "",
    createdAt: previous.createdAt || now,
    updatedAt: now,
  });

  if (!persistCostBudgetConfiguration(next)) return;

  appendCostBudgetHistory({
    action: previous.overallBudget == null ? "Created" : "Updated",
    previousValue: previous.overallBudget,
    newValue: next.overallBudget,
    periodType: next.periodType,
  });

  costAnalysisState.budgetConfig = next;
  costAnalysisState.budgetAmount = next.overallBudget;

  closeCostBudgetModal();
  if (typeof refreshCostAnalysis === "function") {
    refreshCostAnalysis({ resetTablePage: false, reason: "budget-save" });
  }
  if (typeof showToast === "function") {
    showToast("Budget configuration saved.", "success");
  }
}

function clearActiveCostBudget() {
  const ok = window.confirm(
    "Clear the active budget configuration?\n\nBudget history will be kept.",
  );
  if (!ok) return;

  const previous = costAnalysisState.budgetConfig || loadCostBudgetConfiguration();
  clearCostBudgetConfiguration();
  appendCostBudgetHistory({
    action: "Cleared",
    previousValue: previous.overallBudget,
    newValue: null,
    periodType: previous.periodType,
  });

  costAnalysisState.budgetConfig = emptyCostBudgetConfig();
  costAnalysisState.budgetAmount = null;

  if (typeof refreshCostAnalysis === "function") {
    refreshCostAnalysis({ resetTablePage: false, reason: "budget-clear" });
  }
  if (typeof showToast === "function") {
    showToast("Budget cleared.", "success");
  }
}

function initCostBudgetControls() {
  if (document.body.dataset.costBudgetInit === "true") return;
  document.body.dataset.costBudgetInit = "true";

  costAnalysisState.budgetConfig = loadCostBudgetConfiguration();
  costAnalysisState.budgetAmount =
    costAnalysisState.budgetConfig.overallBudget;

  document
    .getElementById("openCostBudgetModal")
    ?.addEventListener("click", openCostBudgetModal);
  document
    .getElementById("editCostBudget")
    ?.addEventListener("click", openCostBudgetModal);
  document
    .getElementById("closeCostBudgetModal")
    ?.addEventListener("click", closeCostBudgetModal);
  document
    .getElementById("cancelCostBudgetModal")
    ?.addEventListener("click", closeCostBudgetModal);
  document.getElementById("costBudgetModal")?.addEventListener("click", (e) => {
    if (e.target.id === "costBudgetModal") closeCostBudgetModal();
  });
  document
    .getElementById("budgetPeriodType")
    ?.addEventListener("change", syncBudgetModalPeriodFields);
  document
    .getElementById("saveCostBudgetForm")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      saveCostBudgetFromModal();
    });
  document
    .getElementById("clearCostBudget")
    ?.addEventListener("click", clearActiveCostBudget);
  document
    .getElementById("clearCostBudgetHistory")
    ?.addEventListener("click", () => {
      const ok = window.confirm("Clear all budget history entries?");
      if (!ok) return;
      clearCostBudgetHistory();
      renderBudgetHistoryTable();
      if (typeof showToast === "function") {
        showToast("Budget history cleared.", "success");
      }
    });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (document.getElementById("costBudgetModal")?.classList.contains("show")) {
      closeCostBudgetModal();
    }
  });
}

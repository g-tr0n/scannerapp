import { exportScanSession, getArrayStorageValue } from "./modules/storageHelpers.mjs";
import { clearTable, updateTable } from "./modules/tableHelper.mjs";

// * Setting event listeners
document
  .getElementById("confirm-remove-scan-session-btn")
  .addEventListener("click", removeAllScanSession);

document
  .getElementById("confirm-remove-all-history-btn")
  .addEventListener("click", removeAllHistory);

document
  .getElementById("confirm-remove-last-scanned-btn")
  .addEventListener("click", removeLastScanned);

document.getElementById("remove-last-scanned-btn").addEventListener("click", displayLastScanned);

document.getElementById("export-scan-session-btn").addEventListener("click", exportScanSession);

function removeAllHistory() {
  localStorage.setItem("scannedHistory", JSON.stringify([]));
  document.querySelector("#removeHistoryModal .btn-close").click();
}

function removeAllScanSession() {
  localStorage.setItem("scanningSession", JSON.stringify([]));
  document.querySelector("#removeScanModal .btn-close").click();
  window.location.reload();
}

function removeLastScanned() {
  const scanningSessionValues = getArrayStorageValue("scanningSession");
  scanningSessionValues.splice(-1);

  clearTable();
  for (let item of scanningSessionValues) {
    updateTable(item);
  }

  localStorage.setItem("scanningSession", JSON.stringify(scanningSessionValues));
  document.querySelector("#removeLastScannedModal .btn-close").click();
}

function displayLastScanned() {
  const scanningSessionValues = getArrayStorageValue("scanningSession");
  document.getElementById("last-scanned-code").textContent = JSON.stringify(
    scanningSessionValues[scanningSessionValues.length - 1],
    0,
    2
  );
}

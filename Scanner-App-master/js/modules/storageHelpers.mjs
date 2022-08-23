import { formatItem } from "./scanningHelper.mjs";

/**
 * Gets array JSON data from localStorage
 * @param {string} storageKey - Key of data from localStorage
 * @returns {array} Value from localStorage
 */
export function getArrayStorageValue(storageKey) {
  const value = JSON.parse(localStorage.getItem(storageKey));
  if (value) {
    return value;
  } else {
    return [];
  }
}

/**
 * Add items to a possibly existing localStorage value
 * @param {string} storageKey Key of item in localStorage
 * @param {array} items List of items to add to the localStorage value
 * @param {boolean} formatItems If items should be formatted with formatItem before being added
 */
export function addToStorageValue(storageKey, items, formatItems = false) {
  let currentValues = JSON.parse(localStorage.getItem(storageKey));

  if (!currentValues) {
    currentValues = [];
  }

  let formattedItems;
  if (formatItems) {
    formattedItems = items.map((item) => formatItem(item));
  } else {
    formattedItems = items;
  }

  localStorage.setItem(storageKey, JSON.stringify([...currentValues, ...formattedItems]));
}

/**
 * Format and download scan session as CSV and add it to scan history then reset the scan session
 */
export function exportScanSession() {
  let scannedHistory = JSON.parse(localStorage.getItem("scannedHistory"));
  let scanningSession = JSON.parse(localStorage.getItem("scanningSession"));

  const headers = [
    "Barcode",
    "Manufacturer",
    "Model",
    "Container",
    "Manufacturer Serial",
    "Timestamp",
  ];
  // Manufacter Serial
  const csvData = [
    headers.join(","),
    ...scanningSession.map((obj) => Object.values(obj).map(value => `"${value}"`).join(",")),
  ].join("\r\n");

  addToStorageValue("scannedHistory", scanningSession);
  if (!scannedHistory) {
    scannedHistory = [];
  }

  let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(csvData);
  let dlAnchorEl = document.getElementById("downloadAnchorEl");
  dlAnchorEl.setAttribute("href", dataStr);
  dlAnchorEl.setAttribute("download", "output.csv");
  dlAnchorEl.click();

  localStorage.setItem("scannedHistory", JSON.stringify([...scannedHistory, ...scanningSession]));
  localStorage.setItem("scanningSession", JSON.stringify([]));
  window.location.reload();
}

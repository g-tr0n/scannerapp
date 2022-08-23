import { formatItem, checkAndHandleInvalidBarcodeEntry } from "./modules/scanningHelper.mjs";
import { addToStorageValue } from "./modules/storageHelpers.mjs";
import { updateTable } from "./modules/tableHelper.mjs";

/**
 * Checks if barcode should be added (e.g. duplicate, empty) and
 * adds barcode to storage, updates table etc.
 * If barcode is duplicate it will display to user (show message, display sound etc.) and not add
 * @param {array} newBarcode - List of input values in format {id: string, value: string}
 * @returns {boolean} Resolves with if barcode was added successfully
 */
export function updateScannedBarcodes(newBarcode) {
  return new Promise(async (resolve, reject) => {
    const formatted = formatItem(newBarcode);

    if (!(await checkAndHandleInvalidBarcodeEntry(newBarcode))) {
      return resolve(false);
    }

    // * Valid
    if (!document.getElementById("manufacturer-serial-checkbox").checked) {
      document.getElementById("log-box-entry").textContent = formatted.barcodeEntry;
    }
    console.log(`${new Date().toISOString()} -> Adding New Barcode`);
    console.log(newBarcode);
    addToStorageValue("scanningSession", [newBarcode], true);
    new Audio("./sounds/added.mp3").play();
    updateTable(formatted);
    // * Set barcode entry blank after added
    document.getElementById("barcode-entry").value = "";
    return resolve(true);
  });
}

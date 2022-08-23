import { getArrayStorageValue } from "./storageHelpers.mjs";

/**
 * Checks if a barcode value is in either scan history or the current scan session
 * @param {string} barcodeValue - A barcode value
 * @returns {boolean} If barcodeValue is a duplicate
 */
export function isDupBarcode(barcodeValue) {
  const allBarcodeValues = [
    ...getArrayStorageValue("scannedHistory").map((obj) => obj.barcodeEntry),
    ...getArrayStorageValue("scanningSession").map((obj) => obj.barcodeEntry),
  ];

  return allBarcodeValues.includes(barcodeValue);
}

/**
 * Checks if key press is the enter key
 * @param {string} event - A key event
 * @returns {boolean} If key event was a press of the return key
 */
export function isEnterKey(event) {
  return event.key == "Enter";
}

/**
 * Checks if inputs are valid
 * @param {array} values - List of input objects in format: {id: number, value: string}
 * @returns {boolean} If inputs are valid
 */
export function areInputsValid(values) {
  for (let obj of values) {
    if (!obj.value && obj.id !== "barcodeEntry") {
      alert(`${obj.id.toUpperCase()} is empty.`);
      return false;
    }

    if (obj.id == "barcodeEntry" && obj.value !== "") {
      alert(`${obj.id.toUpperCase()} must be blank to start.`);
      return false;
    }
  }

  // Inputs valid if code gets here
  return true;
}

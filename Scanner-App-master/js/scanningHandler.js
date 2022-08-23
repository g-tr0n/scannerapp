import {
  getInputValues,
  config,
  handleContainerEnterKey,
  setStateColorAndMessage,
  setInputNotReady,
  setInputReady,
  handleInvalidEntry,
  checkAndHandleInvalidBarcodeEntry,
} from "./modules/scanningHelper.mjs";
import { areInputsValid, isEnterKey } from "./modules/checkers.mjs";
import { updateScannedBarcodes } from "./storageHandler.js";
import { updateTable } from "./modules/tableHelper.mjs";

// * Set as global
let focusInterval;
let focusManfSerialInterval;

if (!window.location.pathname.includes("/historytable.html")) {
  // * Setting event listeners
  document.getElementById("start-scanning").addEventListener("click", attemptStartScanning);
  document.getElementById("stop-scanning").addEventListener("click", stopScanning);
};


function attemptStartScanning() {
  // * Don't execute if shouldn't start scanning
  if (!preStartScanning()) return;
  startScanning();
}

/**
 * Should be ran before the actual scanning (after container entry etc.) process starts
 * @returns {boolean} Returns true when scanning should be started
 */
function preStartScanning() {
  // * Check if inputs are valid
  const requiredInputValues = getInputValues(true);
  if (!areInputsValid(requiredInputValues)) return false;

  // * Check if container and manufactuerer are both in use (not allowed)
  if (
    document.getElementById("container-checkbox").checked &&
    document.getElementById("manufacturer-serial-checkbox").checked
  ) {
    alert("CONTAINER and MANUFACTURER SERIAL cannot both be in use at the same time.");
    return false;
  }

  // * Dont allow change to any checkboxes
  document.querySelectorAll(".form-check-input").forEach((el) => {
    el.disabled = true;
  });

  // * Disable all buttons expect some
  const btnsDontDisable = ["start-scanning", "stop-scanning", "log-box", "remove-last-scanned-btn"];
  document.querySelectorAll(".btn").forEach((el) => {
    if (btnsDontDisable.includes(el.id) || el.classList.contains("modal-confirm")) return;
    el.disabled = true;
  });

  // * Hide start scanning btn
  document.getElementById("start-scanning").classList.add("d-none");
  // * Show stop scanning button
  document.getElementById("stop-scanning").classList.remove("d-none");

  // * == HANDLE CONTAINER INPUT ==
  if (document.getElementById("container-checkbox").checked) {
    // * Enable container entry input
    setInputReady("#container");
    const focusContainerInterval = setInterval(() => {
      document.getElementById("container").focus();
    }, 20);
    setStateColorAndMessage("#log-box", config.states.WAITING_FOR_CONTAINER);

    // * Add eventlistener for keydown as container input is now ready to be used
    document
      .getElementById("container")
      .addEventListener("keydown", (e) => handleContainerEnterKey(e, focusContainerInterval));
    return false;
  } // else if (document.getElementById("manufacturer-serial-checkbox").checked) {
  //     // * == HANDLE MANUFACTURER SERIAL INPUT ==

  //     // * Enable field ready
  //     setInputReady("#manufacturer-serial-input");

  //     setStateColorAndMessage("#log-box", config.states.WAITING_FOR_MANUFACTURER_SERIAL);

  //     focusManfSerialInterval = setInterval(() => {
  //       document.getElementById("manufacturer-serial-input").focus();
  //     }, 20);

  //     document
  //       .getElementById("manufacturer-serial-input")
  //       .addEventListener("keydown", handleManfSerialEnterKey);

  //     return false;
  //   }

  return true;
}

// * Needs to be in handler JS so focusManfSerialInterval can be global to file
/**
 * Executes from eventlistener if enter key is pressed when inside manf input
 * @param {*} e - An event listener event
 * @returns {*} May return an alert if there is an error otherwise executes next function
 */
async function handleManfSerialEnterKey(e) {
  if (!isEnterKey(e)) return;
  const manfacSerialEntryValue = document.getElementById("manufacturer-serial-input").value;

  if (!manfacSerialEntryValue) {
    await handleInvalidEntry(
      config.states.INVALID_ENTRY,
      config.states.WAITING_FOR_MANUFACTURER_SERIAL
    );
    return;
  } else {
    // * VALID
    document.getElementById("log-box-entry").textContent = manfacSerialEntryValue;

    document
      .getElementById("manufacturer-serial-input")
      .removeEventListener("keydown", handleManfSerialEnterKey);

    // * Clear focus interval
    clearInterval(focusManfSerialInterval);
    document.getElementById("manufacturer-serial-input").disabled = true;
    addBarcode();
  }
}

// todo doc
function handleBarcodeAdded() {
  if (document.getElementById("manufacturer-serial-checkbox").checked) {
    startScanning();
  }
}

// todo doc
export async function startScanning() {
  // * Enable barcode entry input
  setInputReady("#barcode-entry");

  // * Simulate form to be submitted
  document.getElementById("barcode-entry").addEventListener("keydown", barcodeInputKeyDown);

  focusInterval = setInterval(() => {
    document.getElementById("barcode-entry").focus();
  }, 20);

  // * Show ready for scanning messages
  setStateColorAndMessage("#log-box", config.states.READY_FOR_SCANNING);
}

async function barcodeInputKeyDown(e) {
  if (isEnterKey(e)) {
    // * If manf serial not checked
    if (!document.getElementById("manufacturer-serial-checkbox").checked) {
      addBarcode();
    } else {
      if (!(await checkAndHandleInvalidBarcodeEntry(getInputValues()))) return;

      // * == HANDLE MANUFACTURER SERIAL INPUT ==
      document.getElementById("log-box-entry").textContent =
        document.getElementById("barcode-entry").value;

      document.getElementById("barcode-entry").disabled = true;
      clearInterval(focusInterval);

      new Audio("/sounds/serialno.mp3").play();

      // * Enable field ready
      setInputReady("#manufacturer-serial-input");

      setStateColorAndMessage("#log-box", config.states.WAITING_FOR_MANUFACTURER_SERIAL);

      focusManfSerialInterval = setInterval(() => {
        document.getElementById("manufacturer-serial-input").focus();
      }, 20);

      document
        .getElementById("manufacturer-serial-input")
        .addEventListener("keydown", handleManfSerialEnterKey);
    }
  }
}

async function addBarcode() {
  let inputs = getInputValues();
  const added = await updateScannedBarcodes(inputs);
  if (added) {
    handleBarcodeAdded();
  }
}

function stopScanning() {
  // * Dont allow submission
  document.getElementById("barcode-entry").removeEventListener("keydown", barcodeInputKeyDown);

  document.getElementById("log-box-entry").textContent = "None";

  // * Redisable barcode entry field
  setInputNotReady("#barcode-entry");
  // * Redisable container field
  setInputNotReady("#container");
  // * Redisable manuf serial input
  setInputNotReady("#manufacturer-serial-input");

  // * Enable all buttons
  document.querySelectorAll(".btn").forEach((el) => {
    el.disabled = false;
  });

  // * Allow change to any checkbox
  document.querySelectorAll(".form-check-input").forEach((el) => {
    el.disabled = false;
  });

  // * Stop autofocusing on entries
  clearInterval(focusInterval);
  clearInterval(focusManfSerialInterval);

  document.getElementById("barcode-entry").blur();
  document.getElementById("manufacturer-serial-input").blur();
  document.getElementById("start-scanning").classList.remove("d-none");
  document.getElementById("stop-scanning").classList.add("d-none");

  setStateColorAndMessage("#log-box", config.states.NOT_READY_FOR_SCANNING);
}

// * Fill table with data on page load
(() => {
  const scanningSession = JSON.parse(localStorage.getItem("scanningSession"));
  if (scanningSession) {
    for (let item of scanningSession) {
      updateTable(item);
    }
  }
})();

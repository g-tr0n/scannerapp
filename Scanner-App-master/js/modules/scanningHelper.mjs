import { startScanning } from "../scanningHandler.js";
import { isDupBarcode, isEnterKey } from "./checkers.mjs";

export const config = {
  // MUST BE SET IN HTML TOO
  // ! Cannot use a classColor more than once
  states: {
    READY_FOR_SCANNING: {
      classColor: "btn-primary",
      message: "Ready For Scanning",
    },
    NOT_READY_FOR_SCANNING: {
      classColor: "btn-warning",
      message: "Not Ready For Scanning",
    },
    DUPLICATE: {
      classColor: "btn-danger",
      message: "Duplicate Barcode",
    },
    WAITING_FOR_CONTAINER: {
      classColor: "btn-info",
      message: "Waiting For Container",
    },
    INVALID_ENTRY: {
      classColor: "btn-secondary",
      message: "Invalid Entry",
    },
    WAITING_FOR_MANUFACTURER_SERIAL: {
      classColor: "btn-light",
      message: "Waiting For Manufacturer Serial Entry",
    },
  },
};

/**
 * Returns input values based on params
 * @param {boolean} requiredOnly - If only required values should be returned
 * @returns {array} List of inputs in format {id: number, value: string}
 */
export function getInputValues(requiredOnly = false) {
  let selector = "";
  if (requiredOnly) {
    selector = "#entry-form .form-input[required]";
  } else {
    selector = "#entry-form .form-input";
  }

  let inputs = [];
  document.querySelectorAll(selector).forEach((input) => {
    // obj = { id: input.getAttribute("key"), value: input.value };
    // obj[input.getAttribute("key")] = input.value;
    inputs.push({ id: input.getAttribute("key"), value: input.value });
  });
  inputs.push({ id: "timestamp", value: new Date().toISOString() });

  return inputs;
}

/**
 * Executes from eventlistener if enter key is pressed when inside container
 * @param {*} event - An event listener event
 * @param {NodeJS.Timer} focusContainerInterval - An interval that focuses the container input
 * @returns {*} May return an alert if there is an error otherwise executes next function
 */
export function handleContainerEnterKey(event, focusContainerInterval) {
  if (isEnterKey(event)) {
    // * Clear focusContainerInterval set by container handling
    clearInterval(focusContainerInterval);
    const containerValue = document.getElementById("container").value;
    if (!containerValue) {
      // * Handle invalid container entry
      return alert("Cannot use empty container");
    }

    // * Valid entry
    document.getElementById("log-box-entry").textContent = containerValue;
    document.removeEventListener("keydown", handleContainerEnterKey);
    startScanning();
  }
}

/**
 * Sets a new state colour and removes all others from an element
 * @param {string} selector - Query selector for element to set state on
 * @param {object} state - A state object from the states config
 */
export function setStateColorAndMessage(selector, state) {
  // * Remove all other state colours
  const allOtherStates = Object.values(config.states).filter((obj) => obj !== state);
  const elToChange = document.querySelector(selector);

  elToChange.classList.add(state.classColor);
  if (selector == "#log-box") {
    document.getElementById("log-box-msg").textContent = state.message;
  } else {
    elToChange.textContent = state.message;
  }
  allOtherStates.forEach((state) => elToChange.classList.remove(state.classColor));
}

/**
 * Sets an input as not ready e.g. disables, changes placeholder
 * @param {string} selector - Selector for element to use
 */
export function setInputNotReady(selector) {
  const element = document.querySelector(selector);

  element.disabled = true;
  element.value = "";

  // * Custom handling for container
  switch (selector) {
    case "#container":
      if (document.getElementById("container-checkbox").checked) {
        element.placeholder = "Not Ready";
      } else {
        element.placeholder = "Disabled";
      }
      break;

    case "#manufacturer-serial-input":
      if (document.getElementById("manufacturer-serial-checkbox").checked) {
        element.placeholder = "Not Ready";
      } else {
        element.placeholder = "Disabled";
      }
      break;

    default:
      element.placeholder = "Not Ready";
      break;
  }
}

export function setInputReady(selector) {
  const element = document.querySelector(selector);

  element.disabled = false;
  element.placeholder = "";
  element.value = "";
}

/**
 * Sleep for MS time (with AWAIT)
 * @param {number} ms - MS of time to sleep for
 * @returns {Promise} A promise that resolves after ms time
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Converts item from format {id: string, value: string} to {id: value}
 * @param {object} item
 * @returns {object} Formatted item
 */
export function formatItem(item) {
  let itemFormatted = {};
  for (let obj of item) {
    itemFormatted[obj.id] = obj.value;
  }

  return itemFormatted;
}

// TODO doc
export function handleInvalidEntry(invalidState, endState) {
  return new Promise(async (resolve, reject) => {
    setStateColorAndMessage("#log-box", invalidState);
    new Audio("./sounds/error.mp3").play();
    await sleep(300);
    setStateColorAndMessage("#log-box", endState);

    return resolve();
  });
}

export function checkAndHandleInvalidBarcodeEntry(barcodeObj) {
  return new Promise(async (resolve, reject) => {
    const formatted = formatItem(barcodeObj);

    if (isDupBarcode(formatted.barcodeEntry) || !formatted.barcodeEntry.length) {
      // * Set barcode entry blank
      document.getElementById("barcode-entry").value = "";
      // * Disable barcode entry so user temporarily cannot scan a new barcode
      document.getElementById("barcode-entry").disabled = true;

      if (!formatted.barcodeEntry.length) {
        await handleInvalidEntry(config.states.INVALID_ENTRY, config.states.READY_FOR_SCANNING);
      } else {
        await handleInvalidEntry(config.states.DUPLICATE, config.states.READY_FOR_SCANNING);
      }

      // * Re-enable barcode entry so user can scan a new barcode
      document.getElementById("barcode-entry").disabled = false;
      return resolve(false);
    }

    return resolve(true);
  });
}

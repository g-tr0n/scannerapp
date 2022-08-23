const notReadyWhenCheckedInputIDs = ["container-checkbox", "manufacturer-serial-checkbox"];

function handleCheckboxControl(checkbox) {
  const elementToControl = document.getElementById(checkbox.getAttribute("for"));

  if (checkbox.checked) {
    if (notReadyWhenCheckedInputIDs.includes(checkbox.id)) {
      elementToControl.value = "";
      elementToControl.placeholder = "Not Ready";
      elementToControl.disabled = true;

      return;
    }

    // * If not a notReadyWhenCheckedInput element
    elementToControl.placeholder = "";
    elementToControl.disabled = false;
    elementToControl.required = true;
  } else {
    // * When not checked (disabled)
    elementToControl.disabled = true;
    elementToControl.required = false;
    elementToControl.placeholder = "Disabled";
    elementToControl.value = "";
  }
}

// Set initial values once
(() => {
  const formGroups = document.querySelectorAll("#entry-form > .form-group");

  for (let formGroup of formGroups) {
    const formCheckInput = formGroup.querySelector(".form-check-input");
    if (!formCheckInput) continue;
    handleCheckboxControl(formCheckInput);
  }

  // Set barcode entry field inital
  const barcodeEntry = document.getElementById("barcode-entry");
  barcodeEntry.disabled = true;
  barcodeEntry.value = "";
})();

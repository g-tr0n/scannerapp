import { getArrayStorageValue } from "./storageHelpers.mjs";

/**
 * Updates the table with one new object
 * @param {array} newTableDataItem List of fields of one object
 */
export function updateTable(newTableDataItem, addDeleteBtns = true) {
  const tableBody = document.querySelector(".barcode-entries tbody");

  // * Create a row for the barcode object item
  const tableRow = document.createElement("tr");

  for (const value of Object.values(newTableDataItem)) {
    // * Create a cell for each value in the barcode object item
    const cell = document.createElement("td");
    cell.textContent = value;
    tableRow.appendChild(cell);
  }
  //   <td class="table-delete-row-btn-container">
  //   <button
  //     class="btn btn-danger table-delete-row-btn"
  //     rowindex="0"
  //     onclick="removeRow(this)"
  //   >
  //     Delete Item
  //   </button>
  // </td>
  if (addDeleteBtns) {
    // * Add delete btn
    const deleteBtnRow = document.createElement("td");
    deleteBtnRow.classList.add("table-delete-row-btn-container");
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn");
    deleteBtn.classList.add("btn-danger");
    deleteBtn.classList.add("table-delete-row-btn");
    deleteBtn.textContent = "Remove Item";
    deleteBtn.onclick = removeRow;
    deleteBtn.setAttribute(
      "rowIndex",
      // * Don't need to -1 from length as length is not including new value at this point
      document.querySelectorAll(".barcode-entries tbody tr").length
    );

    deleteBtnRow.append(deleteBtn);
    tableRow.appendChild(deleteBtnRow);
  }
  // Add created row to table body
  // tableBody.appendChild(tableRow);

  // * Add new row to start of table body (newest first)
  tableBody.insertBefore(tableRow, tableBody.firstChild);
}

// todo doc
export function clearTable() {
  const table = document.querySelector(".barcode-entries");
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }
}

// todo doc
function removeRow(el) {
  const elClicked = el.target;
  const scanningSessionValues = getArrayStorageValue("scanningSession");
  scanningSessionValues.splice(elClicked.getAttribute("rowindex"), 1);

  clearTable();
  for (let item of scanningSessionValues) {
    updateTable(item);
  }

  localStorage.setItem("scanningSession", JSON.stringify(scanningSessionValues));
  document.querySelector("#removeLastScannedModal .btn-close").click();
}

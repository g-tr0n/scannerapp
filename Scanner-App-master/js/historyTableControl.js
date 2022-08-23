// * Only for historytable.html

import { updateTable } from "./modules/tableHelper.mjs";

(() => {
  const scanningSession = JSON.parse(localStorage.getItem("scannedHistory"));
  if (scanningSession) {
    for (let item of scanningSession) {
      updateTable(item, false);
    }
  }
})();

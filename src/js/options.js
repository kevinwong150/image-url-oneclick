document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get([
    "settings-removeTabs?", 
    "settings-removeAllConfirmation?"
  ], function (records) {
    // terminate if no storage
    if (Object.keys(records).length === 0) 
      return;

    let checkboxRemoveTabs = document.querySelector("input[type='checkbox'][name='removeTabs?']");
    if (checkboxRemoveTabs) {
      checkboxRemoveTabs.checked = "settings-removeTabs?" in records ? records["settings-removeTabs?"] : false ;
      checkboxRemoveTabs.addEventListener("change", (e) => {
        chrome.storage.sync.set({"settings-removeTabs?": e.target.checked}, () => {
          console.log("Settings updated");
        });
      });
    }

    let checkboxRemoveAllConfirmation = document.querySelector("input[type='checkbox'][name='removeAllConfirmation?']");
    if (checkboxRemoveAllConfirmation) {
      checkboxRemoveAllConfirmation.checked = "settings-removeAllConfirmation?" in records ? records["settings-removeAllConfirmation?"] : true ;
      checkboxRemoveAllConfirmation.addEventListener("change", (e) => {
        chrome.storage.sync.set({["settings-removeAllConfirmation?"]: e.target.checked}, () => {
          console.log("Settings updated");
        });
      });
    }
  });

  console.log("option loaded");
});

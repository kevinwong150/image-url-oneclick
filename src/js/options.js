document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get([
    "settings-removeTabs?", 
    "settings-removeAllConfirmation?"
  ], function (records) {
    // terminate if no storage
    if (Object.keys(records).length === 0) 
      return;

    let checkboxRemoveTabs = document.createElement("input");
    checkboxRemoveTabs.name = "removeTabs?";
    checkboxRemoveTabs.type = "checkbox";
    checkboxRemoveTabs.checked = "settings-removeTabs?" in records ? records["settings-removeTabs?"] : false ;
      checkboxRemoveTabs.addEventListener("change", (e) => {
        chrome.storage.sync.set({"settings-removeTabs?": e.target.checked}, () => {
          console.log("Settings updated");
        });
      });
    document.getElementById("label-removeTabs?").appendChild(checkboxRemoveTabs);

    
    let checkboxRemoveAllConfirmation = document.createElement("input");
    checkboxRemoveAllConfirmation.name = "removeAllConfirmation?";
    checkboxRemoveAllConfirmation.type = "checkbox";
    checkboxRemoveAllConfirmation.checked = "settings-removeAllConfirmation?" in records ? records["settings-removeAllConfirmation?"] : true ;
    checkboxRemoveAllConfirmation.addEventListener("change", (e) => {
      chrome.storage.sync.set({["settings-removeAllConfirmation?"]: e.target.checked}, () => {
        console.log("Settings updated");
      });
    });
    document.getElementById("label-removeAllConfirmation?").appendChild(checkboxRemoveAllConfirmation);
  });

  console.log("option loaded");
});

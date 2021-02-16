import { h, render, Component } from "preact";
import "crx-hotreload";
import Page from "./Page";

document.addEventListener("DOMContentLoaded", () => {
  const placeholder = document.getElementById('placeholder-settings');
  if(placeholder){
    render(<Page page="settings"/>, placeholder.parentElement);
  }
});

export function restore_settings_page() {
  chrome.storage.sync.get([
    "settings-removeTabs?", 
    "settings-removeAllConfirmation?",
    "settings-removeRecordOnRestore?",
    "settings-isDetailMode?"
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

    let checkboxRemoveRecordOnRestore = document.createElement("input");
    checkboxRemoveRecordOnRestore.name = "removeRecordOnRestore?";
    checkboxRemoveRecordOnRestore.type = "checkbox";
    checkboxRemoveRecordOnRestore.checked = "settings-removeRecordOnRestore?" in records ? records["settings-removeRecordOnRestore?"] : true ;
    checkboxRemoveRecordOnRestore.addEventListener("change", (e) => {
      chrome.storage.sync.set({["settings-removeRecordOnRestore?"]: e.target.checked}, () => {
        console.log("Settings updated");
      });
    });
    document.getElementById("label-removeRecordOnRestore?").appendChild(checkboxRemoveRecordOnRestore);

    let checkboxDetailMode = document.createElement("input");
    checkboxDetailMode.name = "isDetailMode?";
    checkboxDetailMode.type = "checkbox";
    checkboxDetailMode.checked = "settings-isDetailMode?" in records ? records["settings-isDetailMode?"] : true ;
    checkboxDetailMode.addEventListener("change", (e) => {
      chrome.storage.sync.set({["settings-isDetailMode?"]: e.target.checked}, () => {
        console.log("Settings updated");
      });
    });
    document.getElementById("label-isDetailMode?").appendChild(checkboxDetailMode);
});

  console.log("option loaded");
}
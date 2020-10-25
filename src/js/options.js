import { h, render, Component } from "preact";
import "crx-hotreload";
import Page from "./Page";

document.addEventListener("DOMContentLoaded", () => {
  const placeholder = document.getElementById('placeholder-settings');
  if(placeholder){
    render(<Page page="settings"/>, placeholder.parentElement);
  }
});

export function restore_settings() {
  chrome.storage.sync.get([
    "settings-removeTabs?", 
    "settings-removeAllConfirmation?",
    "settings-restoreConfirmation?"
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

    let checkboxRestoreConfirmation = document.createElement("input");
    checkboxRestoreConfirmation.name = "restoreConfirmation?";
    checkboxRestoreConfirmation.type = "checkbox";
    checkboxRestoreConfirmation.checked = "settings-restoreConfirmation?" in records ? records["settings-restoreConfirmation?"] : true ;
    checkboxRestoreConfirmation.addEventListener("change", (e) => {
      chrome.storage.sync.set({["settings-restoreConfirmation?"]: e.target.checked}, () => {
        console.log("Settings updated");
      });
    });
    document.getElementById("label-restoreConfirmation?").appendChild(checkboxRestoreConfirmation);
});

  console.log("option loaded");
}
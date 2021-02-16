import { h, render, Component } from "preact";
import "crx-hotreload";
import Record, { EmptyRecord } from "./Record/Record";
import Page from "./Page";

let hasConfirm = true;
let isDetailMode = true;

// get saved settings 
chrome.storage.sync.get([
  "settings-removeAllConfirmation?",
  "settings-isDetailMode?"
], function (records) {
  if("settings-removeAllConfirmation?" in records) {
    hasConfirm = records["settings-removeAllConfirmation?"];
  }

  if("settings-isDetailMode?" in records) {
    isDetailMode = records["settings-isDetailMode?"];
  }
});

// keep settings up-to-date
chrome.storage.onChanged.addListener((changes, areaName) => {
  if(areaName === "sync" && "settings-removeAllConfirmation?" in changes) {
    hasConfirm = changes["settings-removeAllConfirmation?"]["newValue"];
  }

  if(areaName === "sync" && "settings-isDetailMode?" in changes) {
    isDetailMode = changes["settings-isDetailMode?"]["newValue"];
  }
});

// message listener 
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.pendingRecordAction) {
      case null:
      case undefined:
        console.log("recordStatus:", "null/undefined");
        sendResponse({recordStatus: "null/undefined recieved"});
        break;
      // use message to implement the live update when record page is highlighted
      case "updateList":
        restore_records_page();
        console.log("recordStatus:", "updated");
        sendResponse({recordStatus: "updated"});
        break;
      default:
        sendResponse({recordStatus: "noop"});
        break;
    }
});

// tell background process records page is up
document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let recordsTab = tabs[0];
    if (recordsTab) {
      chrome.runtime.sendMessage({
        recordStatus: "opened",
        recordsTabId: recordsTab.id
      }, function(response) {
        if(response) {
          console.log("backgroundStatus: ", response["backgroundStatus"]);
        }
        else {
          console.log("background script may not received");
        }
      });
    }
  });
});

// build records page on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const placeholder = document.getElementById('placeholder-records');
  if(placeholder){
    render(<Page page="records"/>, placeholder.parentElement);
  }
});

export function clear_all_records() {
  chrome.storage.sync.get(null, function(records) {
    // terminate if no storage
    if (Object.keys(records).filter((record) => /^settings-/.test(record)).length === 0)
      return;

    if(hasConfirm) {
      if(confirm("This will remove all listed records, are you sure?")) {
        Object.keys(records).forEach((timestamp, index) => {
          if((new Date(parseInt(timestamp)).getTime())) chrome.storage.sync.remove(timestamp);
        });
        document.getElementById('records-body').innerHTML = "";
        render(<EmptyRecord />, document.getElementById('records-body'));
      }
    }
    else {
      Object.keys(records).forEach((timestamp, index) => {
        if((new Date(parseInt(timestamp)).getTime())) chrome.storage.sync.remove(timestamp);
      });
      document.getElementById('records-body').innerHTML = "";
      render(<EmptyRecord />, document.getElementById('records-body'));
    }
  });
}

export function restore_records_page() {
  chrome.storage.sync.get(null, function(records) {
    // terminate if no storage
    if (Object.keys(records).filter(record => !(/^settings-.+/.test(record))).length === 0) {
      return;
    }
    else {
      let recordsContent = document.getElementById('records-body');
      let recordList = document.createElement("ul"); 
      recordsContent.innerHTML = "";
      recordList.classList = [ "record-list" ];
      recordList.innerHTML = "";

      Object.keys(records).forEach((timestamp, index) => {
        // ignore settings if invalid timestamp 
        if(new Date(parseInt(timestamp)).getTime()) {
          let record = records[timestamp];

          // create list item placeholder bcoz preact render can only replace node, not append/prepend
          let recordPlaceholder = document.createElement("span");
          recordPlaceholder.id = timestamp;
          recordList.appendChild(recordPlaceholder);

          render(<Record timestamp={timestamp} record={record} isDetailMode={isDetailMode}/>, recordList, recordPlaceholder);

          recordPlaceholder.remove();
        }
      });
  
      recordsContent.appendChild(recordList);
    }
  });
};

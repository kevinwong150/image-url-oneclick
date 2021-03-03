import { h, render, Component } from "preact";
import "crx-hotreload";
import Record, { EmptyRecord } from "./Record/Record";
import Page, { PAGE_RECORD } from "./Page";
import { updateMainHeader, ACTION_COUNT_INIT } from "./Main/MainHeader";

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
    render(<Page page={PAGE_RECORD}/>, placeholder.parentElement);
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
        updateMainHeader(PAGE_RECORD, ACTION_COUNT_INIT, {recordCount: 0, urlCount: 0});
      }
    }
    else {
      Object.keys(records).forEach((timestamp, index) => {
        if((new Date(parseInt(timestamp)).getTime())) chrome.storage.sync.remove(timestamp);
      });
      document.getElementById('records-body').innerHTML = "";
      render(<EmptyRecord />, document.getElementById('records-body'));
      updateMainHeader(PAGE_RECORD, ACTION_COUNT_INIT, {recordCount: 0, urlCount: 0});
    }
  });
}

export function restore_records_page(filterParams = false) {
  chrome.storage.sync.get(null, function(records) {
    // terminate if no storage
    if (Object.keys(records).filter(record => !(/^settings-.+/.test(record))).length === 0) {
      return;
    }
    else {
      let recordsContent = document.getElementById('records-body');
      let result = {
        recordCount: 0,
        urlCount: 0
      }

      const recordListItems = 
        Object.keys(records)
          // ignore settings if invalid timestamp 
          // note: cannot do filter function here coz it will mess up with css order
          .filter(timestamp => new Date(parseInt(timestamp)).getTime()) 
          .map(timestamp => {
            let record = records[timestamp];
            const isFiltered = filterParams instanceof Object ? checkIsFiltered(record, timestamp, filterParams) : false;
            
            if(!isFiltered) {
              result.urlCount += record["count"];
              result.recordCount += 1;
            }

            return <Record timestamp={timestamp} record={record} isDetailMode={isDetailMode} isFiltered={isFiltered}/>
          });

      render(
        <ul class="record-list flex flex-col">{recordListItems}</ul>,
        recordsContent
      );

      updateMainHeader(PAGE_RECORD, ACTION_COUNT_INIT, result);
    }
  });
};

function checkIsFiltered(record, timestamp, filterParams) {
  // check starred match
  const matchFilterStarred = record["starred"] === filterParams["filterStarred"];

  // check all labels match
  const matchFilterLabel =  Object.keys(record["isLabelSelected"]).every(label => record["isLabelSelected"][label] === filterParams["filterLabel"][label]);
 
  // check timestamp within selected period
  const hasFilterDate = Object.values(filterParams["filterDate"]).every(value => !!value);
  const matchFilterDate = Object.values(filterParams["filterDate"]).every(value => value) && filterParams["filterDate"]["timestampStart"] < timestamp && filterParams["filterDate"]["timestampEnd"] > timestamp;

  // flag as isFiltered if any of the params not matching
  return hasFilterDate ? 
    (!matchFilterStarred || !matchFilterLabel || !matchFilterDate) :
    (!matchFilterStarred || !matchFilterLabel);
}
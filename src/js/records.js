let hasConfirm = true;

// get saved settings 
chrome.storage.sync.get([
  "settings-removeAllConfirmation?"
], function (records) {
  if("settings-removeAllConfirmation?" in records) {
    hasConfirm = records["settings-removeAllConfirmation?"];
  }
});

// keep settings up-to-date
chrome.storage.onChanged.addListener((changes, areaName) => {
  if(areaName === "sync" && "settings-removeAllConfirmation?" in changes) {
    hasConfirm = changes["settings-removeAllConfirmation?"]["newValue"];
  }
});

function clear_all_records() {
  chrome.storage.sync.get(null, function(records) {
    // terminate if no storage
    if (Object.keys(records).filter((record) => /^settings-/.test(record)).length === 0)
      return;

    if(hasConfirm) {
      if(confirm("This will remove all listed records, are you sure?")) {
        for (timestamp in records) {
          if((new Date(parseInt(timestamp)).getTime())) chrome.storage.sync.remove(timestamp);
        }
        document.getElementById('records-body').innerHTML = "There is no record yet";
      }
    }
    else {
      for (timestamp in records) {
        if((new Date(parseInt(timestamp)).getTime())) chrome.storage.sync.remove(timestamp);
      }
      document.getElementById('records-body').innerHTML = "There is no record yet";
    }
  });
}

function restore_records() {
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
  
      for (timestamp in records) {
        // ignore settings if invalid timestamp 
        if(!(new Date(parseInt(timestamp)).getTime())) continue;
  
        let record = records[timestamp];
  
        // create list item by js createElement so we could add eventListener to it easily
        let listItem = document.createElement("li"); 
        listItem.classList = [ "record-list-item" ];
        listItem.setAttribute("data-key", timestamp);
        listItem.innerHTML = `
          <div class="record-title">
            <button class="record-title-item button mod-remove" title="Delete record"></button>
            <span class="record-title-item mod-date">${(new Date(parseInt(timestamp))).toLocaleString()}</span>
            <span class="record-title-item mod-count">Count: ${record["count"]}</span>
            <button class="record-title-item button mod-copy" title="Copy URLs"></button>
          </div>
          <div class="record-content">
            <span class="record-content-item mod-urls">${record["urls"]}</span>
          </div>
        `;
  
        recordList.appendChild(listItem);
        
        // put the remove record function
        let removeButton = listItem.querySelector("button.record-title-item.mod-remove");
        if(removeButton) {
          removeButton.addEventListener('click', () => {
            chrome.storage.sync.remove(listItem.getAttribute("data-key"), () => {
              listItem.remove();
            });
          });
        }
  
        // put the copy to clipboard function
        let copyButton = listItem.querySelector("button.record-title-item.mod-copy");
        if(copyButton) {
          copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(record["urls"]).then(function() {
              copyButton.classList.add("mod-success");
              copyButton.innerText = "Copied!";
              setTimeout(() => {
                copyButton.classList.remove("mod-success");
                copyButton.innerText = "";
              }, 2000);
            }, function() {
              copyButton.classList.add("mod-fail");
              copyButton.innerText = "Copy action failed! Please try again.";
              setTimeout(() => {
                copyButton.classList.remove("mod-fail");
                copyButton.innerText = "";
              }, 2000);
            });
          });
        }
      }
  
      recordsContent.appendChild(recordList);
    }
  });
};

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
        restore_records();
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
document.addEventListener('DOMContentLoaded', restore_records);

// clear all storage
document.getElementById('clear-all').addEventListener('click', clear_all_records);

function clear_all_records() {
  chrome.storage.sync.clear(() => {
    document.getElementById('records-body').innerHTML = "There is no record yet";
  });
}

function restore_records() {
  chrome.storage.sync.get(null, function(records) {
    // terminate if no storage
    if (Object.keys(records).length === 0) 
      return;
    
    let recordsContent = document.getElementById('records-body');
    let recordList = document.createElement("ul"); 
    recordsContent.innerHTML = "";
    recordList.classList = [ "record-list" ];
    recordList.innerHTML = "";

    for (timestamp in records) {
      // create list item by js createElement so we could add eventListener to it easily
      let listItem = document.createElement("li"); 
      listItem.classList = [ "record-list-item" ];
      listItem.innerHTML = `
        <div class="record-title">
          <span class="record-title-item mod-date">${(new Date(parseInt(timestamp))).toLocaleString()}</span>
          <span class="record-title-item mod-count">Count: ${records[timestamp]["count"]}</span>
          <button class="record-title-item mod-copy"></button>
        </div>
        <div class="record-content">
          <span class="record-content-item mod-urls">${records[timestamp]["urls"]}</span>
        </div>
      `;

      recordList.appendChild(listItem);

      // put the copy to clipboard function
      let copyButton = listItem.querySelector("button.record-title-item.mod-copy");
      if(copyButton) {
        copyButton.addEventListener('click', () => {
          navigator.clipboard.writeText(records[timestamp]["urls"]).then(function() {
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

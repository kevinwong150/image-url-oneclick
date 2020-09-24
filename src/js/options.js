function clear_all_records() {
  chrome.storage.sync.clear(() => {
    document.getElementById('saved-content').innerHTML = "this is empty!";
  });
}

function restore_records() {
  chrome.storage.sync.get(null, function(records) {
    // terminate if no storage
    if (Object.keys(records).length === 0) 
      return;
    
    let savedContent = document.getElementById('saved-content');
    let dd = document.createElement("dd"); 
    savedContent.innerHTML = "";
    dd.innerHTML = "";

    for (timestamp in records) {
      let listItem = `
        <dt>
          <b>${(new Date(parseInt(timestamp))).toLocaleString()}</b>
        </dt>
        <dd>
          ${records[timestamp]}
        </dd>
      `;

      dd.innerHTML = dd.innerHTML + listItem;
    }

    savedContent.appendChild(dd);
  });
};

// message listener 
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.pendingOptionAction) {
      case null:
      case undefined:
        console.log("optionStatus:", "null/undefined");
        sendResponse({optionStatus: "null/undefined recieved"});
        break;
      case "updateList":
        restore_records();
        console.log("optionStatus:", "updated");
        sendResponse({optionStatus: "updated"});
        break;
      default:
        sendResponse({optionStatus: "noop"});
        break;
    }
});

// tell background page options page is up
document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var optionsTab = tabs[0];
    if (currTab) {
      chrome.runtime.sendMessage({
        optionStatus: "opened",
        optionsTabId: optionsTab.id
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

// build options page on DOMContentLoaded
document.addEventListener('DOMContentLoaded', restore_records);

// clear all storage
document.getElementById('clear-all').addEventListener('click', clear_all_records);
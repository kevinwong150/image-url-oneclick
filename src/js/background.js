// init records status
let isRecordOpen = false;
let recordsTabId = null;

// init settings 
let isRemoveTabs = false;

// initialized settings on installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    "settings-removeTabs?": false,
    "settings-removeAllConfirmation?": true
  }, function() {
    console.log("Initialized settings");
  });
});

// get saved settings 
chrome.storage.sync.get([
  "settings-removeTabs?"
], function (records) {
  if("settings-removeTabs?" in records) {
    isRemoveTabs = records["settings-removeTabs?"];
  }
});

// keep settings up-to-date
chrome.storage.onChanged.addListener((changes, areaName) => {
  if(areaName === "sync" && "settings-removeTabs?" in changes) {
    isRemoveTabs = changes["settings-removeTabs?"]["newValue"];
  }
});

//click extension icon will save image url in all opening tabs to storage
chrome.browserAction.onClicked.addListener(function(from_tab) {
  chrome.tabs.getAllInWindow(null, function(tabs){
    let imageURLs = [];

    // find image urls from all tabs
    for (let i = 0; i < tabs.length; i++) {
      let tabURL = tabs[i].url;
      if(isImageURL(tabURL)) {
        imageURLs.push(tabURL);
      }
    }

    // set records if there is any captured
    if(imageURLs.length > 0) {
      // if records page is open, just set it
      if(isRecordOpen && recordsTabId) {
        chrome.tabs.get(recordsTabId, tab => {
          chrome.tabs.highlight({tabs: tab.index}, () => {
            setRecords(imageURLs);
          });
        });
      }
      else {
        // else open records page
        chrome.tabs.create({  
          url: chrome.runtime.getURL("src/records.html")
        }, setRecords(imageURLs));
      }

      if(isRemoveTabs) {
        chrome.tabs.query({url: imageURLs}, function(tabs) {
          tabs.map(tab => {
            chrome.tabs.remove(tab.id);
          })
        });
      }
    }
    else {
      console.log("No image tab is opening.")
    }
  });
});

// message listener 
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.recordStatus) {
    case null:
    case undefined:
      sendResponse({backgroundStatus: "null/undefined"});
      break;
    case "opened":
      isRecordOpen = true;
      recordsTabId = request.recordsTabId ? request.recordsTabId : recordsTabId;
      sendResponse({backgroundStatus: "updated: records page opened"});
      break;
    case "closed":
      isRecordOpen = false;
      sendResponse({backgroundStatus: "updated: records page closed"});
      break;
    default:
      sendResponse({backgroundStatus: "noop"});
      break;
  }
});

// reset records status on any tab closed 
chrome.tabs.onRemoved.addListener((closedTabId) => {
  if(closedTabId == recordsTabId) {
    isRecordOpen = false;
    recordsTabId = null;
  }
});

// create context menu item
chrome.contextMenus.create({
  id: "records_page",
  title: "Open Records Page", 
  onclick: () => {
    chrome.tabs.create({  
      url: chrome.runtime.getURL("src/records.html")
    });
  },
  contexts: ["browser_action"]
}, () => {});


function isImageURL(url) {
  // finding suffix:
  // return(url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null);
  return(url.toLowerCase().match(/\.(jpeg|jpg|gif|png|svg|webp)/) != null);
}


function setRecords(imageURLs) {
  let timestampKey = Date.now();
  let newRecord = {
    urls: imageURLs.join("|"),
    count: imageURLs.length
  };
  
  // put newly saved urls
  chrome.storage.sync.set({[timestampKey.toString()]: newRecord}, function() {
    if (isRecordOpen && recordsTabId) {
      // tell records page update UI on-the-fly
      chrome.runtime.sendMessage({pendingRecordAction: "updateList"}, function(response) {
        if(response) {
          console.log("recordStatus: ", response["recordStatus"]);
        }
        else {
          console.log("records page may not be opening");
        }
      });
    }
  });
}
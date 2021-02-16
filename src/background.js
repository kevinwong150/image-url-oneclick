import "crx-hotreload";
import 'regenerator-runtime/runtime'

// init records status
let isRecordOpen = false;
let recordsTabId = null;

// init settings 
let isRemoveTabs = false;

// initialized settings on installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    "settings-removeTabs?": false,
    "settings-removeAllConfirmation?": true,
    "settings-removeRecordOnRestore?": true,
    "settings-isDetailMode?": true
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

// resolve a string(an image url) or reject
function getSuspectImage(tabId) {
  return new Promise((resolve, reject) => {
      chrome.tabs.executeScript(tabId, {
        "code": "Array.from(document.images).map(image => image.src)"
      }, result => {
        // check error of accessing url with no permissions, e.g. chrome://...
        const lastErr = chrome.runtime.lastError;
        // if there is lastErr and sanity check result 
        if(lastErr || !result) {
          reject();
        }
        // if there are more than 1 result?, I don't know if it is possible 
        else if (result.length !== 1) {
          reject();
        }
        else {
          result[0].length === 1 ? resolve(result[0][0]) : reject();
        }
      }); 
  });
}

//click extension icon will save image url in all opening tabs to storage
chrome.browserAction.onClicked.addListener(function(from_tab) {
  chrome.tabs.getAllInWindow(null, async function(tabs){
    // find image urls from all tabs
    let imageURLs = await Promise.all(tabs.map(async tab => {
      try {
        let suspectImage = await getSuspectImage(tab.id);
        if (suspectImage == tab.url || isImageURL(tab.url)) {
          return tab.url;
        }
        else {
          return false;
        }
      } catch(err) {
        return false;
      }
    })).then(urls => {
      return urls.filter(url => url);
    });

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
  return(url.match(/(\.|\=)(jpeg|jpg|gif|png|svg|webp)|^data:image\/(jpeg|jpg|gif|png|svg|webp);base64,.+/i) != null);
}


function setRecords(imageURLs) {
  let timestampKey = Date.now();
  let newRecord = {
    urls: imageURLs.join("|"),
    count: imageURLs.length,
    starred: false,
    name: null
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
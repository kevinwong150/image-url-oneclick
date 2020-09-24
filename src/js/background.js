// init options status
let isOptionOpen = false;
let optionsTabId = null;

//click extension icon will save image url in all opening tabs to storage
chrome.browserAction.onClicked.addListener(function(from_tab) {
  chrome.tabs.getAllInWindow(null, function(tabs){
    let imageURLs = [];

    // find image urls from all tabs
    for (var i = 0; i < tabs.length; i++) {
      let tabURL = tabs[i].url;
      if(isImageURL(tabURL)) {
        imageURLs.push(tabURL);
      }
    }

    if(imageURLs.length > 0) {
      // open options page
      chrome.runtime.openOptionsPage(function() {
        let timestampKey = Date.now();
        let setValue = imageURLs.join("|");
        
        // put newly saved urls
        chrome.storage.sync.set({[timestampKey.toString()]: setValue}, function() {
          if (isOptionOpen) {
          // tell options page update UI on-the-fly
          chrome.runtime.sendMessage({pendingOptionAction: "updateList"}, function(response) {
            if(response) {
              console.log("optionStatus: ", response["optionStatus"]);
            }
            else {
              console.log("options page may not be opening");
            }
          });
          }
        });
      });
    }
  });
});

// message listener 
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.optionStatus) {
    case null:
    case undefined:
      sendResponse({backgroundStatus: "null/undefined"});
      break;
    case "opened":
      isOptionOpen = true;
      optionsTabId = request.optionsTabId ? request.optionsTabId : optionsTabId;
      sendResponse({backgroundStatus: "updated: options page opened"});
      break;
    case "closed":
      isOptionOpen = false;
      sendResponse({backgroundStatus: "updated: options page closed"});
      break;
    default:
      sendResponse({backgroundStatus: "noop"});
      break;
  }
});

// reset options status on any tab closed 
chrome.tabs.onRemoved.addListener((closedTabId) => {
  if(closedTabId == optionsTabId) {
    isOptionOpen = false;
    optionsTabId = null;
  }
});


function isImageURL(url) {
  // finding suffix:
  // return(url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null);
  return(url.match(/\.(jpeg|jpg|gif|png|webp)/) != null);
}
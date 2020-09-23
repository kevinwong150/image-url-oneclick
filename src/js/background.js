//click extension icon will save image url in all opening tabs to storage
chrome.browserAction.onClicked.addListener(function(tab) {
  console.log(tab);
  chrome.tabs.getAllInWindow(null, function(tabs){
    let imageURLs = [];
    for (var i = 0; i < tabs.length; i++) {
      let tabURL = tabs[i].url;
      if(isImageURL(tabURL)) {
        console.log("tab index:", tabs[i].index, "with url", tabURL);
        imageURLs.push(tabURL);
      }
    }

    let timestampKey = Date.now().toString();
    let setValue = imageURLs.join("|");
    chrome.storage.sync.set({[timestampKey]: setValue}, function() {
      console.log('Value is set to ' + setValue);
    });
  });
});

function isImageURL(url) {
  // finding suffix:
  // return(url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null);
  return(url.match(/\.(jpeg|jpg|gif|png|webp)/) != null);
}
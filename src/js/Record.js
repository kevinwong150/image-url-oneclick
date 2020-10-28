import { h, render, Component } from "preact";

export function EmptyRecord() {
  return <span class="text-sm">There is no record yet</span>
}

export default class Record extends Component {
  constructor(props) {
    super(props);

    this.state = {
      removed: false,
      copyState: "normal", // type copyState = "normal" | "success" | "fail"
      restoreState: "normal" // type restoreState = "normal" | "all-restored" | "partially-restored" | "noop"
    };

    this.onClickRemove = this.onClickRemove.bind(this);
    this.onClickCopy = this.onClickCopy.bind(this);
    this.onClickRestore = this.onClickRestore.bind(this);
  }

  setTempState(stateName, state, timeout) {
    this.setState({
      [stateName]: state
    });
    setTimeout(() => {
      if(!this.state.removed) {
        this.setState({
          [stateName]: "normal"
        });
      }
    }, timeout);
  }

  onClickRemove = () => {
    chrome.storage.sync.remove(this.props.timestamp, () => {
      let thisRecord = document.getElementById(this.props.timestamp);
      if (thisRecord) {
        thisRecord.remove();
        this.setState({
          removed: true
        });
        chrome.storage.sync.get(null, function (records) {
          if(Object.keys(records).filter(key => !!(new Date(parseInt(key)).getTime())).length == 0){
            document.getElementById('records-body').innerHTML = "";
            render(<EmptyRecord />, document.getElementById('records-body'));
          }
        });
      }
    });
  }

  onClickCopy = () => {
    navigator.clipboard.writeText(this.props.record["urls"]).then(function() {
      this.setTempState("copyState", "success", 2000);
    }.bind(this), function() {
      this.setTempState("copyState", "fail", 2000);
    }.bind(this));
  }

   onClickRestore =  () => {   
    chrome.tabs.query({windowType:'normal'}, function(tabs) {
      let recordsTab = tabs.find(tab => tab.active); // assume current tab is the record tab
      let openingTabsUrl = tabs.map(tab => tab.url);
      let recordUrls = this.props.record["urls"].split("|");
      let openRecordUrl = recordUrls.filter(url => !openingTabsUrl.includes(url));

      // restore record urls
      openRecordUrl.map(url => chrome.tabs.create({url:url}));

      if(openRecordUrl.length === recordUrls.length) {
        this.setTempState("restoreState", "all-restored", 3000);
      }
      else if (openRecordUrl.length > 0 && openRecordUrl.length < recordUrls.length) {
        this.setTempState("restoreState", "partially-restored", 3000);
      }
      else if (openRecordUrl.length === 0) {
        this.setTempState("restoreState", "noop", 3000);
      }

      // select record page after restore record
      if(recordsTab) chrome.tabs.update(recordsTab.id, {selected: true});

      chrome.storage.sync.get([
        "settings-removeRecordOnRestore?"
      ], function (records) {
        if("settings-removeRecordOnRestore?" in records && records["settings-removeRecordOnRestore?"]) {
          let timestamp = this.props.timestamp;
          let thisRecord = document.getElementById(timestamp);
          if (thisRecord) {
            chrome.storage.sync.remove(timestamp, () => {
              thisRecord.remove();
              this.setState({
                removed: true
              });

              chrome.storage.sync.get(null, function (records) {
                if(Object.keys(records).filter(key => !!(new Date(parseInt(key)).getTime())).length == 0){
                  document.getElementById('records-body').innerHTML = "";
                  render(<EmptyRecord />, document.getElementById('records-body'));
                }
              });
            });
          }
        } 
      }.bind(this));
    }.bind(this)); 
  }

  getCopyButtonDetails = (copyState) => {
    switch(copyState) {
      case "fail":
        return {
          buttonText: "Copy action failed! Please try again.",
          buttonModClass: "mod-success"
        }
      case "success":
        return {
          buttonText: "Copied!",
          buttonModClass: "mod-success"
        }
      default:
        return {
          buttonText: "",
          buttonModClass: ""
        }
    } 
  }

  getRestoreButtonDetails = (restoreState) => {
    switch(restoreState) {
      case "noop":
        return {
          buttonText: "All images are already opened, please check your tabs.",
          buttonModClass: "mod-noop"
        }
      case "partially-restored":
        return {
          buttonText: "Restored, some images are already opened.",
          buttonModClass: "mod-restore-some"
        }
      case "all-restored":
        return {
          buttonText: "Restored!",
          buttonModClass: "mod-restore-all"
        }
      default:
        return {
          buttonText: "",
          buttonModClass: ""
        }
    } 
  }

  render({ timestamp, record }, { removed, copyState, restoreState }) {
    return (
      <li class={"bg-light-light break-all p-4 mb-4 rounded-md overflow-auto " + (removed ? "hidden" : "block")} id={timestamp}>
        <div class="flex items-center mb-2 font-bold">
          <span class="text-lg">{(new Date(parseInt(timestamp))).toLocaleString()}</span>
          <span class="ml-4">Count: {record["count"]}</span>
          <button class={"ml-4 h-6 w-6 font-bold mod-copy " + this.getCopyButtonDetails(copyState)["buttonModClass"]} title="Copy URLs" onclick={this.onClickCopy}>{this.getCopyButtonDetails(copyState)["buttonText"]}</button>
          <button class="ml-auto h-6 w-6 font-bold mod-remove " title="Delete record" onclick={this.onClickRemove}></button>
        </div>
        <div class="">
          <span class="urls">{record["urls"]}</span>
        </div>
        <button class={"ml-auto h-6 w-6 font-bold flex items-center mod-restore " + this.getRestoreButtonDetails(restoreState)["buttonModClass"]} title="Restore record" onclick={this.onClickRestore}>{this.getRestoreButtonDetails(restoreState)["buttonText"]}</button>
      </li>
    );
  }
}

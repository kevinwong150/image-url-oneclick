import { h, render, Component } from "preact";
import Caption from "./Caption";

const STATE_NORMAL = "normal"

const STATE_COPY_SUCCESS = "success";
const STATE_COPY_FAIL = "fail";

const STATE_RESTORE_ALL = "all-restored";
const STATE_RESTORE_PARTIAL = "partially-restored";
const STATE_RESTORE_NOOP = "noop";

export const STATE_RENAME_EDITING = "editing";
export const STATE_RENAME_SAVING = "saving";
export const STATE_RENAME_SUCCESS = "success";
export const STATE_RENAME_FAIL = "fail";

export function EmptyRecord() {
  return <span class="text-sm">There is no record yet</span>
}

export default class Record extends Component {
  constructor(props) {
    super(props);

    this.state = {
      record: props.record,
      removed: false,
      copyState: STATE_NORMAL, // type copyState = "normal" | "success" | "fail"
      restoreState: STATE_NORMAL, // type restoreState = "normal" | "all-restored" | "partially-restored" | "noop"
      renameState: STATE_NORMAL, // type renameState = "normal" | "editing" | "saving" | "success" | "fail"
    };

    this.onClickRemove = this.onClickRemove.bind(this);
    this.onClickCopy = this.onClickCopy.bind(this);
    this.onClickRestore = this.onClickRestore.bind(this);
    this.onClickToggleStar = this.onClickToggleStar.bind(this);
    this.onClickRename = this.onClickRename.bind(this);
    this.renameStateHandler = this.renameStateHandler.bind(this);
  }

  setTempState(stateName, state, timeout) {
    this.setState({
      [stateName]: state
    });
    setTimeout(() => {
      if(!this.state.removed) {
        this.setState({
          [stateName]: STATE_NORMAL
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
    navigator.clipboard.writeText(this.state.record["urls"]).then(function() {
      this.setTempState("copyState", STATE_COPY_SUCCESS, 2000);
    }.bind(this), function() {
      this.setTempState("copyState", STATE_COPY_FAIL, 2000);
    }.bind(this));
  }

  onClickToggleStar = () => {
    chrome.storage.sync.set({[this.props.timestamp]: {...this.state.record, starred: !this.state.record.starred}}, function() {
      this.setState({
        record: {...this.state.record, starred: !this.state.record.starred}
      });
    }.bind(this));
  }

  renameStateHandler = (params) => {
    this.setState({
      renameState: params.renameState,
    });

    chrome.storage.sync.set({[this.props.timestamp]: {...this.state.record, name: params.recordName}}, function() {
      if (chrome.runtime.lastError) {
        this.setTempState("renameState", STATE_RENAME_FAIL, 1000);
      }
      else {
        this.setTempState("renameState", STATE_RENAME_SUCCESS, 1000);
        
        this.setState({
          record: {...this.state.record, name: params.recordName}
        });
      }  
    }.bind(this));
  }
  
  onClickRename = () => {
    this.setState({
      renameState: this.state.renameState === STATE_RENAME_EDITING ? STATE_NORMAL : STATE_RENAME_EDITING
    });
  }

  onClickRestore =  () => {   
    chrome.tabs.query({windowType:'normal'}, function(tabs) {
      let recordsTab = tabs.find(tab => tab.active); // assume current tab is the record tab
      let openingTabsUrl = tabs.map(tab => tab.url);
      let recordUrls = this.state.record["urls"].split("|");
      let openRecordUrl = recordUrls.filter(url => !openingTabsUrl.includes(url));

      // restore record urls
      openRecordUrl.map(url => chrome.tabs.create({url:url}));

      if(openRecordUrl.length === recordUrls.length) {
        this.setTempState("restoreState", STATE_RESTORE_ALL, 3000);
      }
      else if (openRecordUrl.length > 0 && openRecordUrl.length < recordUrls.length) {
        this.setTempState("restoreState", STATE_RESTORE_PARTIAL, 3000);
      }
      else if (openRecordUrl.length === 0) {
        this.setTempState("restoreState", STATE_RESTORE_NOOP, 3000);
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
      case STATE_COPY_FAIL:
        return {
          buttonText: "Copy action failed! Please try again.",
          buttonModClass: "mod-success"
        }
      case STATE_COPY_SUCCESS:
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
      case STATE_RESTORE_NOOP:
        return {
          buttonText: "All images are already opened, please check your tabs.",
          buttonModClass: "mod-noop"
        }
      case STATE_RESTORE_PARTIAL:
        return {
          buttonText: "Restored, some images are already opened.",
          buttonModClass: "mod-restore-some"
        }
      case STATE_RESTORE_ALL:
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

  render({ timestamp, _record }, { record, removed, copyState, restoreState, renameState }) {
    return (
      <li class={"shadow-regular bg-light-light break-all p-4 mb-4 rounded-md overflow-auto " + (removed ? "hidden" : "block")} id={timestamp}>
        <div class="flex mb-2 font-bold">
          <Caption timestamp={timestamp} count={record["count"]} name={record["name"]} renameState={renameState} renameStateHandler={this.renameStateHandler}/>
          <button class={"ml-4 h-6 w-6 font-bold flex-shrink-0 mod-star " + (record.starred ? "mod-starred" : "") } title="Star Record" onclick={this.onClickToggleStar}></button>
          <button class={"ml-4 h-6 w-6 font-bold flex-shrink-0 mod-rename " + (renameState !== STATE_NORMAL ? "pointer-events-none" : "pointer-events-auto")} title="Rename record" onclick={this.onClickRename}></button>
          <button class={"ml-4 mr-4 h-6 w-6 font-bold flex-shrink-0 mod-copy " + this.getCopyButtonDetails(copyState)["buttonModClass"]} title="Copy URLs" onclick={this.onClickCopy}>{this.getCopyButtonDetails(copyState)["buttonText"]}</button>
          <button class="ml-auto h-6 w-6 font-bold flex-shrink-0 mod-remove " title="Delete record" onclick={this.onClickRemove}></button>
        </div>
        <div class="">
          <span class="urls">{record["urls"]}</span>
        </div>
        <button class={"ml-auto h-6 w-6 font-bold flex items-center mod-restore " + this.getRestoreButtonDetails(restoreState)["buttonModClass"]} title="Restore record" onclick={this.onClickRestore}>{this.getRestoreButtonDetails(restoreState)["buttonText"]}</button>
      </li>
    );
  }
}
import { h, render, Component } from "preact";

export default class Record extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // type copyState = "normal" | "success" | "fail"
      copyState: "normal"
    };

    this.onClickRemove = this.onClickRemove.bind(this);
    this.onClickCopy = this.onClickCopy.bind(this);
  }

  onClickRemove = () => {
    chrome.storage.sync.remove(this.props.timestamp, () => {
      let thisRecord = document.getElementById(this.props.timestamp);
      if (thisRecord) {
        thisRecord.remove();
      }
    });
  }

  onClickCopy = () => {
    navigator.clipboard.writeText(this.props.record["urls"]).then(function() {
      this.setState({
        copyState: "success"
      });
      setTimeout(() => {
        this.setState({
          copyState: "normal"
        });
      }, 2000);
    }.bind(this), function() {
      this.setState({
        copyState: "fail"
      });
      setTimeout(() => {
        this.setState({
          copyState: "normal"
        });
      }, 2000);
    }.bind(this));
  }

  getCopyButtonDetails = (copyState) => {
    switch(copyState) {
      case "fail":
        return {
          buttonText: "Copy action failed! Please try again.",
          buttonModClass: "mod-fail"
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

  render({ timestamp, record }, { copyState }) {
    return (
      <li class="record-list-item" id={timestamp}>
        <div class="record-title">
          <button class="record-title-item button mod-remove" title="Delete record" onclick={this.onClickRemove}></button>
          <span class="record-title-item mod-date">{(new Date(parseInt(timestamp))).toLocaleString()}</span>
          <span class="record-title-item mod-count">Count: {record["count"]}</span>
          <button class={"record-title-item button mod-copy " + this.getCopyButtonDetails(copyState)["buttonModClass"]} title="Copy URLs" onclick={this.onClickCopy}>{this.getCopyButtonDetails(copyState)["buttonText"]}</button>
        </div>
        <div class="record-content">
          <span class="record-content-item mod-urls">{record["urls"]}</span>
        </div>
      </li>
    );
  }
}

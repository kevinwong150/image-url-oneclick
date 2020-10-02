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
          buttonModClass: "mod-error"
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
      <li class="bg-light-light break-all p-4 mb-4" id={timestamp}>
        <div class="flex items-center mb-2 font-bold">
          <span class="text-lg">{(new Date(parseInt(timestamp))).toLocaleString()}</span>
          <span class="ml-4">Count: {record["count"]}</span>
          <button class={"ml-4 h-6 w-6 font-bold mod-copy " + this.getCopyButtonDetails(copyState)["buttonModClass"]} title="Copy URLs" onclick={this.onClickCopy}>{this.getCopyButtonDetails(copyState)["buttonText"]}</button>
          <button class="ml-auto h-6 w-6 font-bold mod-remove " title="Delete record" onclick={this.onClickRemove}></button>
        </div>
        <div class="">
          <span class="">{record["urls"]}</span>
        </div>
      </li>
    );
  }
}

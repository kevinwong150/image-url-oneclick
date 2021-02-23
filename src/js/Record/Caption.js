import { h, render, Component, Fragment } from "preact";
import { STATE_RENAME_EDITING, STATE_RENAME_SAVING, STATE_RENAME_SUCCESS, STATE_RENAME_FAIL } from "./Record";

export default class Caption extends Component {
  constructor(props) {
    super(props);

    this.renderNameBlock = this.renderNameBlock.bind(this);
    this.onSubmitHandler = this.onSubmitHandler.bind(this);
  }

  componentDidUpdate(prevProps, prevState){
    if(this.input && this.props.renameState === STATE_RENAME_EDITING) {
      this.input.focus(); 
    }
  }

  onSubmitHandler = (e) => {
    this.props.renameStateHandler({
      renameState: STATE_RENAME_SAVING,
      recordName: e.target.value.trim()
    });
  }

  renderNameBlock(name) {
    if (this.props.renameState === STATE_RENAME_EDITING) {
      return (
        <input 
          class="border p-1 h-6 rounded focus:ring focus:border-dark-light" 
          type="text" 
          value={name || ""} 
          placeholder="name the record..."
          ref={(input) => this.input = input} 
          onblur={this.onSubmitHandler}
          onkeypress={(e) => {if(e.charCode === 13) this.onSubmitHandler(e)}}
        ></input>
      )
    }
    else {
      return(
        <span class={"text-lg break-normal text-dark-dark transition duration-1000 ease-in-out " + (this.props.renameState === STATE_RENAME_SUCCESS ? "text-success" : "")}>
          {name}
        </span>
      );
    }
  }

  render({ timestamp, count, name, renameState, _renameStateHandler }, _) {
    if(name || renameState === STATE_RENAME_EDITING) {
      return (
        <span class="flex flex-col">
          { this.renderNameBlock(name) }
          <div class="text-xs text-dark-light font-normal whitespace-no-wrap w-0">
            <span>{(new Date(parseInt(timestamp))).toLocaleString()}</span>
            <span class="mx-1">|</span>
            <span>{count} {count > 1 ? "urls" : "url"}</span>
          </div>
        </span>
      );
    }
    else {
      return (
        <span>
          <span class="text-lg">{(new Date(parseInt(timestamp))).toLocaleString()}</span>
          <span class="mx-2">|</span>
          <span>{count} {count > 1 ? "urls" : "url"}</span>
        </span>
      );
    }
  }
}

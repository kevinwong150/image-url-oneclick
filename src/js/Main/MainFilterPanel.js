import { h, render, Component, Fragment } from "preact";
import { useState } from 'preact/hooks';
import { Label } from "../Record/Labels";
import { restore_records_page } from "../records";
import flatpickr from "flatpickr";
require("flatpickr/dist/themes/dark.css");
export default class MainFilterPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filterParams: {
        filterLabel: {
          "violet": false,
          "teal": false,
          "lake": false,
          "honey": false,
          "magneta": false
        },
        filterStarred: false
      }
    }

    this.onToggleIsLabelFilter = this.onToggleIsLabelFilter.bind(this);
    this.onToggleIsStarredFilter = this.onToggleIsStarredFilter.bind(this);
    this.onClickApplyFilter = this.onClickApplyFilter.bind(this);
    this.onClickResetFilter = this.onClickResetFilter.bind(this);
  }

  componentDidMount() {
    console.log(document.getElementById("flatpickr-placeholder"));

    flatpickr(document.getElementById("flatpickr-placeholder"), {
      // disableMobile: true,
      // enableTime: true,
      // time_24hr: true,
      // minuteIncrement: 15,
      // dateFormat: "Y-m-d H:i"
    });
    console.log("FLATPICKR");
  }

  onClickApplyFilter = (e) => {
    restore_records_page(this.state.filterParams);
  }

  onClickResetFilter = (e) => {
    restore_records_page();
  }

  onToggleIsLabelFilter = (e, color) => {
    this.setState({
      filterParams: {
        ...this.state.filterParams,
        filterLabel: {
          ...this.state.filterParams.filterLabel,
          [color]: !this.state.filterParams.filterLabel[color]
        }
      }
    });
  }

  onToggleIsStarredFilter = (e) => {
    this.setState({
      filterParams: {
        ...this.state.filterParams,
        filterStarred: !this.state.filterParams.filterStarred
      }
    });
  }

  render(props, { filterParams }) {
    return (

      <div class="bg-light-light break-all p-4 mb-4 rounded-md flex justify-between max-w-screen-md w-full z-10 flex-wrap">
        <div class="flex flex-wrap">
          <div class="mr-8">
            <h3 class="text-lg">Label Color</h3>
            <ul class="flex flex-wrap">
              {
                Object.keys(filterParams.filterLabel).map(color => (
                  <li>
                    <Label color={color} hasTick={true} onClickHandler={this.onToggleIsLabelFilter}/>
                  </li>
                ))
              }
            </ul>
          </div>
          <div class="mr-8">
            <h3 class="text-lg">Date</h3>
            <span class="shadow-regular cursor-pointer rounded-lm">
              <input id="flatpickr-placeholder"/>
            </span>
          </div>
          <div class="mr-8">
            <h3 class="text-lg">Starred</h3>
            <StarButton onClickHandler={this.onToggleIsStarredFilter}/>
          </div>
        </div>
        <div class="flex flex-col flex-shrink-0 text-sm space-y-2">
          <button onclick={this.onClickApplyFilter} class="mod-apply rounded-md pl-4 h-8 w-32 flex justify-center items-center text-light-light bg-dark-light">Apply</button>
          <button onclick={this.onClickResetFilter} class="mod-reset rounded-md pl-4 h-8 w-32 flex justify-center items-center text-light-light bg-dark-light">Reset</button>
        </div>
      </div>
    )
  }
}


function StarButton(props) {
  const [isSelected, toggleIsSelected] = useState(false);

  return <button class={`h-6 w-6 font-bold flex-shrink-0 mod-star ${isSelected ? "mod-starred" : ""}`} onclick={(e) => {props.onClickHandler(e); toggleIsSelected(!isSelected);}}></button>
}
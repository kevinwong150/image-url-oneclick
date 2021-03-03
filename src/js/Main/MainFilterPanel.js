import { h, render, Component, Fragment } from "preact";
import { useState } from 'preact/hooks';
import { Label } from "../Record/Labels";
import { restore_records_page } from "../records";
import flatpickr from "flatpickr";
import rangePlugin from "flatpickr/dist/plugins/rangePlugin";
require("flatpickr/dist/themes/dark.css");

const INIT_FILTER_PARAMS = {
  filterLabel: {
    "violet": false,
    "teal": false,
    "lake": false,
    "honey": false,
    "magneta": false
  },
  filterDate: {
    timestampStart: false,
    timestampEnd: false
  },
  filterStarred: false
}

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
        filterDate: {
          timestampStart: false,
          timestampEnd: false
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


    const datepicker = flatpickr(document.getElementById("flatpickr-placeholder"), {
      mode: "range",
      maxDate: "today",
      dateFormat: "Y-m-d",
      disableMobile: "true",
      "plugins": [new rangePlugin({ input: "#flatpickr-placeholder-second"})],
      onChange: (selectedDates, dateStr, instance) => {
        if(selectedDates.length == 2) {
          this.setState({
            filterParams: {
              ...this.state.filterParams,
              filterDate: {
                timestampStart: selectedDates[0].getTime(),
                timestampEnd: selectedDates[1].getTime() + 86399000
              }
            }
          });
        }
      }
    });

    this.setState({datepicker: datepicker});
  }

  onClickApplyFilter = (e) => {
    restore_records_page(this.state.filterParams);
  }

  onClickResetFilter = (e) => {
    restore_records_page();

    this.setState(function(prevState){
      prevState.datepicker.clear();

      return {
        filterParams: INIT_FILTER_PARAMS
      }
    });
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
    console.log("filterParams.filterStarred", filterParams.filterStarred);

    return (
      <div class="bg-light-light break-all p-4 mb-4 rounded-md flex justify-between max-w-screen-md w-full z-10">
        <div class="filter-list">
          <div class="filter-list-item mod-label">
            <h3 class="text-lg">Label Color</h3>
            <ul class="flex flex-wrap">
              {
                Object.keys(filterParams.filterLabel).map(color => (
                  <li>
                    <Label color={color} isSelected={filterParams.filterLabel[color]} onClickHandler={this.onToggleIsLabelFilter}/>
                  </li>
                ))
              }
            </ul>
          </div>
          <div class="filter-list-item mod-date">
            <h3 class="text-lg">Date</h3>
            <span>
              <input id="flatpickr-placeholder" class="mod-calendar" placeholder="(Start date)"/>
              <span class="mx-1 text-light-dark whitespace-no-wrap">To</span>
              <input id="flatpickr-placeholder-second" class="mod-calendar" placeholder="(End date)"/>
            </span>
          </div>
          <div class="filter-list-item mod-star">
            <h3 class="text-lg">Starred</h3>
            <StarButton isSelected={filterParams.filterStarred} onClickHandler={this.onToggleIsStarredFilter}/>
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
  return <button class={`h-6 w-6 font-bold flex-shrink-0 mod-star ${props.isSelected ? "mod-starred" : ""}`} onclick={props.onClickHandler}></button>
}
import { h, render, Component, Fragment } from "preact";
import { useState } from 'preact/hooks';
import { Label } from "../Record/Labels";
import { restore_records_page } from "../records";
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

      <div class="bg-light-light break-all p-4 mb-4 rounded-md flex justify-between max-w-screen-md w-full z-10">
        <div>
          <h3 class="text-lg">Label Color</h3>
          <ul class="flex">
            {
              Object.keys(filterParams.filterLabel).map(color => (
                <li>
                  <Label color={color} hasTick={true} onClickHandler={this.onToggleIsLabelFilter}/>
                </li>
              ))
            }
          </ul>
        </div>
        <div>
          <h3 class="text-lg">Starred</h3>
          <StarButton onClickHandler={this.onToggleIsStarredFilter}/>
        </div>
        <div class="flex flex-col text-sm space-y-2">
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
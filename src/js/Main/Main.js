import { h, render, Component, Fragment } from "preact";
import { clear_all_records } from "../records";
import { PAGE_RECORD, PAGE_SETTING } from "../Page";
import { EmptyRecord } from "../Record/Record";
import MainHeader, { ACTION_COUNT_INIT } from "./MainHeader";
import MainFilterPanel from "./MainFilterPanel";
import { restore_records_page } from "../records";

export default class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFiltering: false
    }

    this.onToggleIsFiltering = this.onToggleIsFiltering.bind(this);
  }

  componentDidMount() {
    // render EmptyRecord here to ensure it will only be rendered once on mount, instead of every time when getMainContent is called.
    if(this.props.page === PAGE_RECORD) {
      let recordsBody = document.querySelector('#records-body');
      if(recordsBody) render(<EmptyRecord />, recordsBody);
    }
  }

  onToggleIsFiltering = (e) => {
    this.setState(prevState => {
      // remove any current filtered result if closing filter panel
      if(prevState.isFiltering) restore_records_page();

      return { isFiltering: !prevState.isFiltering };
    });
  }

  getMainButtons = (page) => {
    switch (page) {
      case PAGE_RECORD:
        return (
          <Fragment>
            <button onclick={this.onToggleIsFiltering} class={`mod-filter rounded-md pl-4 h-8 w-32 flex justify-center items-center text-light-light bg-dark-light relative ${ this.state.isFiltering ? "mod-filtering" : ""}`} id="filter">Filter</button>
            <button onclick={clear_all_records} class="mod-clear-all rounded-md pl-4 h-8 w-32 flex justify-center items-center text-light-light bg-dark-light" id="clear-all">Clear All</button>
            <button class="mod-settings rounded-md h-8 w-32 flex items-center text-light-light bg-dark-light">
              <a href="options.html" class="flex flex-1 pl-4 h-full items-center justify-center">
                Settings
              </a>
            </button>
          </Fragment>
        );
      case PAGE_SETTING:
        return (
          <Fragment>
            <button class="mod-back rounded-md h-8 w-32 flex items-center text-light-light bg-dark-light">
              <a href="records.html" class="flex flex-1 pl-4 h-full items-center justify-center">
                Back
              </a>
            </button>
          </Fragment>
        );
      default:
        return <Fragment></Fragment>;
    }
  }

  getMainContent = (page) => {
    switch (page) {
      case PAGE_RECORD:
        return (
          <Fragment>
            <div id="records-body" class="max-w-screen-md w-full">
            </div>
          </Fragment>
        );
      case PAGE_SETTING:
        return (
          <Fragment>
            <div id="options-body" class="max-w-screen-md w-full">
              <dl class="settings-list">
                <dt>Remove image tabs after saved to extension?</dt>
                <dd>
                  <label id="label-removeTabs?"></label>
                </dd>
                
                <dt>Show confirm message when remove all records?</dt>
                <dd>
                  <label id="label-removeAllConfirmation?"></label>
                </dd>

                <dt>Delete record on restore tabs?</dt>
                <dd>
                  <label id="label-removeRecordOnRestore?"></label>
                </dd>

                <dt>Detail mode? (More actions and configurations against a record will be available in detail mode.)</dt>
                <dd>
                  <label id="label-isDetailMode?"></label>
                </dd>
              </dl>
            </div>
          </Fragment>
        );
      default:
        return "ERROR 404";
    }
  }

  render({ page }, { isFiltering }) {
    return (
      <main class="bg-light text-dark-dark flex flex-col flex-1 items-center px-4">
        <div class="max-w-screen-md flex flex-wrap justify-between w-full py-3">
          <MainHeader page={page} action={ACTION_COUNT_INIT} data={{recordCount: 0, urlCount: 0}}/>
          <div class="flex space-x-2 text-sm">
            {this.getMainButtons(page)}
          </div>
        </div>
        {
          isFiltering && 
            <MainFilterPanel />
        }
        {
          this.getMainContent(page)
        }
      </main>
    );
  }
}

import { h, render, Component, Fragment, createContext } from "preact";
import { clear_all_records } from "../records";
import { PAGE_RECORD, PAGE_SETTING } from "../Page";
import { EmptyRecord } from "../Record/Record";
import MainHeader, { ACTION_COUNT_INIT } from "./MainHeader";

export default class Main extends Component {
  constructor(props) {
    super(props);
  }

  getMainButtons = (page) => {
    switch (page) {
      case PAGE_RECORD:
        return (
          <Fragment>
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
              <EmptyRecord />
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

  render(props, _) {
    return (
      <main class="bg-light text-dark-dark flex flex-col flex-1 items-center px-4">
        <div class="max-w-screen-md flex flex-wrap justify-between w-full py-3">
          <MainHeader page={props.page} action={ACTION_COUNT_INIT} data={{recordCount: 0, urlCount: 0}}/>
          <div class="flex space-x-2 text-sm">
            {this.getMainButtons(props.page)}
          </div>
        </div>

        {this.getMainContent(props.page)}
      </main>
    );
  }
}

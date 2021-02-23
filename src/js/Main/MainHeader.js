import { h, render, Component, Fragment } from "preact";
import { PAGE_RECORD, PAGE_SETTING } from "../Page";

export const ACTION_COUNT_INIT = "initCount";
export const ACTION_COUNT_UPDATE = "updateCount";

export default class MainHeader extends Component {
  constructor(props) {
    super(props);

    // TODO: rewrite the counting mechanism, as this seems to be an anti pattern as we want to update state on props change,
    // but the tricky part is the callers of updateMainHeader do not necessary know the current total counts, it has to be saved somewhere,
    // currently I save the count data as state in header
    this.state = {
      data: {
        recordCount: 0,
        urlCount: 0
      }
    }
  }

  componentDidMount() {
    // init count after knowing counts in runtime
    if(this.props.data) {
      this.updateCount(this.props.action, this.props.data);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const newData = { 
      recordCount: this.state.data.recordCount + nextProps.data.recordCount, 
      urlCount: this.state.data.urlCount + nextProps.data.urlCount
    }

    // prevent loop if updated counts equal to the state
    if(nextProps.action === ACTION_COUNT_UPDATE && newData.recordCount == nextState.data.recordCount && newData.urlCount == nextState.data.urlCount) {
      return false;
    } 
    // prevent loop if currents props counts equal to the next props counts
    else if(nextProps.action === ACTION_COUNT_INIT && this.props.data.recordCount == nextProps.data.recordCount && this.props.data.urlCount == nextProps.data.urlCount) {
      return false;
    } 
  }

  componentDidUpdate(prevProps, prevState) {
    this.updateCount(this.props.action, this.props.data);
  }

  updateCount = (action, propsData) => {
    switch(action) {
      case ACTION_COUNT_INIT:
        this.setState({
          data: propsData
        });
        break;
      case ACTION_COUNT_UPDATE:
        this.setState({
          data: { 
            recordCount: this.state.data.recordCount + propsData.recordCount, 
            urlCount: this.state.data.urlCount + propsData.urlCount 
          }
        });
        break;
      default:
        break;
    }
  }

  getMainHeader = (page, {recordCount: recordCount, urlCount: urlCount}) => {
    switch (page) {
      case PAGE_RECORD:
        return (
          <Fragment>
            RECORDS
            <span class="text-xs text-dark-light ml-1 flex-shrink-0">({recordCount} {recordCount < 2 ? "record" : "records"} and {urlCount} {urlCount < 2 ? "url" : "urls"} in total)</span>
          </Fragment>
        );
      case PAGE_SETTING:
        return "SETTINGS";
      default:
        return "PAGE";
    }
  }

  render({ page, action, data }, _) {
    const updateData = 
      action === ACTION_COUNT_INIT ? 
      data :
      { 
        recordCount: this.state.data.recordCount + data.recordCount, 
        urlCount: this.state.data.urlCount + data.urlCount 
      };

    // so we re-calculater the count every time we render the header on the fly, which is a very poor practice imo
    return (
      <h1 id="MainHeader" class="text-2xl pr-4 flex flex-wrap items-baseline">{this.getMainHeader(page, updateData)}</h1>
    )
  }
}

export function updateMainHeader(page, action, data) {
  render(<MainHeader page={page} action={action} data={data}/>, document.querySelector("main"), document.getElementById("MainHeader"));
}

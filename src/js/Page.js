import { h, render, Component } from "preact";
import { restore_records } from "./records";
import { restore_settings } from "./options";
import Header from "./Header";
import Main from "./Main";

export default class Page extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    switch (this.props.page) {
      case "records":
        restore_records();
        break;
      case "settings":
        restore_settings();
        break;
      default:
        break;
    }
  }

  render(props, _) {
    return (
      <div class="flex flex-col h-full">
        <Header />
        
        <Main page={props.page}/>
      </div>
    );
  }
}

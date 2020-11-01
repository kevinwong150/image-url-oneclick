import { h, render, Component } from "preact";
import { restore_records_page } from "./records";
import { restore_settings_page } from "./options";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";

export default class Page extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    switch (this.props.page) {
      case "records":
        restore_records_page();
        break;
      case "settings":
        restore_settings_page();
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

        <Footer />
      </div>
    );
  }
}

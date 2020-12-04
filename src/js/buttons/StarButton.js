import { h, render, Component } from "preact";

export default class StarButton extends Component {
  constructor(props) {
    super(props);
  }

  render({ onClickHandler, starred }, _) {
    return (
      <button class={"ml-4 h-6 w-6 font-bold mod-star " + (starred ? "mod-starred" : "") } title="Star Record" onclick={onClickHandler}></button>
    );
  }
}

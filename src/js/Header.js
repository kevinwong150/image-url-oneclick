import { h, render, Component } from "preact";

export default class Header extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <header class="px-4 flex justify-center bg-dark text-light-light h-header">
        <div class="max-w-screen-md flex-1 justify-center flex flex-col">
          <h1 class="text-2xl">IMAGE URL ONECLICK</h1>
          <span class="font-light">
            Extension made for: <a class="underline" target="_blank" href="https://www.simplephotogrid.com">https://www.simplephotogrid.com</a>
          </span>
        </div>
      </header>
    );
  }
}

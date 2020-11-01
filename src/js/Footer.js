import { h, render, Component } from "preact";

export default class Footer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
    <footer class="bg-light text-dark-dark flex flex-col flex-1 items-center">
        <div class="max-w-screen-md flex justify-center w-full border-t border-dark-light py-3">
            <p class="block py-4">
                <span class="block text-center">Please let us know your comments!</span>
                <span class="block text-center"><a href="mailto:hege@example.com">9long@gmail.com</a> | Made with ♥</span>
            </p> 
        </div>
      </footer>
    );
  }
}

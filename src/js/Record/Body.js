import { h, render, Component, Fragment } from "preact";
import { stringToHash } from "../Util";
import { STATE_REMOVE_REMOVING, STATE_REMOVE_SUCCESS, STATE_REMOVE_FAIL } from "./Record";

export default class Body extends Component {
  constructor(props) {
    super(props);
  }

  render({ urls, removeStateHandler, isDetailMode }, _) {
    if(isDetailMode) {
      return (
        <ul class="space-y-2 my-2">
          { 
            urls.split("|").map((url, index) => 
              <Fragment key={stringToHash(url)}>
                <UrlItem url={url} removeStateHandler={() => removeStateHandler({removeState: STATE_REMOVE_REMOVING, removeIndex: index})}/>
              </Fragment>
            )
          }
        </ul>
      )
    }
    else {
      return (
        <div class="my-2">
          <span class="urls">{urls}</span>
        </div>
      )
    }
  }
}


function UrlItem({url, removeStateHandler}) {
  return (
    <li class="flex">
      <button onClick={removeStateHandler} class="h-6 w-6 font-bold flex-shrink-0 mod-delete"></button>
      <div>{url}</div>
    </li>
  )
}
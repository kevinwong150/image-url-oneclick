import { h, render, Component, Fragment } from "preact";
import { useState } from 'preact/hooks';

export default class Labels extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSelecting: false
    }

    this.onClickHandler = this.onClickHandler.bind(this);
    this.onToggleIsSelecting = this.onToggleIsSelecting.bind(this);
  }

  onClickHandler = (e, color) => {
    this.setState({
      isSelecting: false
    });

    // actually save it to the chrome storage
    this.props.toggleLabelHandler(color);
  }

  onToggleIsSelecting = (e) => {
    this.setState({
      isSelecting: !this.state.isSelecting
    });
  }

  render({ isLabelSelected }, { isSelecting }) {
    return (
      <div class="flex flex-wrap">   
        {
          Object.keys(isLabelSelected).filter(color => isLabelSelected[color]).map(color => (
            <Label color={color} isSelected={false} onClickHandler={this.onClickHandler}/>
          ))
        }
        <div class="relative h-full">
          <ul class={`label-list flex-col absolute right-0 ${isSelecting ? "mod-selecting" : ""}`} style="bottom: 100%;">
            {
              Object.keys(isLabelSelected).filter(color => !isLabelSelected[color]).map(color => (
                <Label color={color} isSelected={false} onClickHandler={this.onClickHandler}/>
              ))
            }
          </ul>
          {
            Object.values(isLabelSelected).some(isSelected => !isSelected) &&
              <div class="label mod-add" onclick={this.onToggleIsSelecting}></div>
          } 
        </div>
        
      </div>
    )
  }
}


export function Label(props) {
  return <div class={`label mod-${props.color} ${props.isSelected ? "mod-selected" : ""}`} onclick={e => props.onClickHandler(e, props.color)}></div>
}
import React from "react";
import { findDOMNode } from "react-dom";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";
import Toolbar from "./Toolbar";

class Component extends React.Component {
  state = {
    tabIndex: -1
  };

  componentDidMount() {
    if (this.getCurrentIndex(this.getFocusables()) === 0) {
      this.setState({ tabIndex: 0 });
    }

    if (!this.props.disabled) {
      this.addKeyDownHandler();
    }
  }

  componentDidUpdate(prevProps) {
    const { disabled } = this.props;

    if (prevProps.disabled !== disabled) {
      if (disabled) {
        this.removeKeyDownHandler();
      } else {
        this.addKeyDownHandler();
      }
    }
  }

  componentWillUnmount() {
    this.removeKeyDownHandler();
  }

  getElement = () => {
    if (!this.element) {
      this.element = findDOMNode(this);
    }
    return this.element;
  };

  getToolbar = () => {
    if (!this.toolbar) {
      this.toolbar = this.element.closest(`.${Toolbar.styledComponentId}`);
    }
    return this.toolbar;
  };

  getFocusables = () =>
    this.getToolbar().querySelectorAll(
      `.${ToolbarFocusable.styledComponentId}`
    );

  getCurrentIndex = focusables => {
    let currentIndex = -1;
    focusables.forEach((item, i) => {
      if (item === this.getElement()) {
        currentIndex = i;
      }
    });
    return currentIndex;
  };

  getNextFocusable = (focusables, currentIndex) => {
    const index = currentIndex + 1;
    return focusables.item(index) || focusables.item(0);
  };

  getPreviousFocusable = (focusables, currentIndex) => {
    const index = currentIndex ? currentIndex - 1 : focusables.length - 1;
    return focusables.item(index);
  };

  toolbarIsVertical = () =>
    this.toolbar.getAttribute("aria-orientation") === "vertical";

  addKeyDownHandler = () => {
    this.element.addEventListener("keydown", this.handleKeyDown);
  };

  removeKeyDownHandler = () => {
    this.element.removeEventListener("keydown", this.handleKeyDown);
  };

  handleKeyDown = e => {
    const isVertical = this.toolbarIsVertical();
    const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
    const previousKey = isVertical ? "ArrowUp" : "ArrowLeft";
    const willPerformEvent = [nextKey, previousKey].indexOf(e.key);

    if (!willPerformEvent) return;

    const focusables = this.getFocusables();
    const currentIndex = this.getCurrentIndex(focusables);

    e.preventDefault();
    this.setState({ tabIndex: -1 });

    if (e.key === nextKey) {
      this.getNextFocusable(focusables, currentIndex).focus();
    } else {
      this.getPreviousFocusable(focusables, currentIndex).focus();
    }
  };

  handleFocus = () => {
    this.setState({ tabIndex: 0 });
  };

  render() {
    return (
      <Base
        {...this.props}
        tabIndex={this.state.tabIndex}
        onFocus={this.handleFocus}
      />
    );
  }
}

const ToolbarFocusable = styled(Component)`
  ${prop("theme.ToolbarFocusable")};
`;

export default as("div")(ToolbarFocusable);

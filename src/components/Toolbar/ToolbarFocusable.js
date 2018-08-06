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
    this.element = findDOMNode(this);
    this.toolbar = this.element.closest(`.${Toolbar.styledComponentId}`);
    const allFocusable = this.toolbar.querySelectorAll(
      `.${ToolbarFocusable.styledComponentId}`
    );
    let currentIndex = -1;
    allFocusable.forEach((item, i) => {
      if (item === this.element) {
        currentIndex = i;
      }
    });

    if (currentIndex === 0) {
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

  addKeyDownHandler = () => {
    this.element.addEventListener("keydown", this.handleKeyDown);
  };

  removeKeyDownHandler = () => {
    this.element.removeEventListener("keydown", this.handleKeyDown);
  };

  handleKeyDown = e => {
    const allFocusable = this.toolbar.querySelectorAll(
      `.${ToolbarFocusable.styledComponentId}`
    );
    let currentIndex = -1;
    allFocusable.forEach((item, i) => {
      if (item === this.element) {
        currentIndex = i;
      }
    });

    const isVertical =
      this.toolbar.getAttribute("aria-orientation") === "vertical";
    const previousKey = isVertical ? "ArrowUp" : "ArrowLeft";
    const nextKey = isVertical ? "ArrowDown" : "ArrowRight";

    if (e.key === nextKey) {
      e.preventDefault();
      const nextIndex = currentIndex + 1;
      const nextElement = allFocusable.item(nextIndex) || allFocusable.item(0);
      this.setState({ tabIndex: -1 });
      nextElement.focus();
    } else if (e.key === previousKey) {
      e.preventDefault();
      const previousIndex = currentIndex
        ? currentIndex - 1
        : allFocusable.length - 1;
      const previousElement = allFocusable.item(previousIndex);
      this.setState({ tabIndex: -1 });
      previousElement.focus();
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

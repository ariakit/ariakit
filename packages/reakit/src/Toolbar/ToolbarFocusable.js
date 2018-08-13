import React from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import { prop } from "styled-tools";
import callAll from "../_utils/callAll";
import styled from "../styled";
import as from "../as";
import Base from "../Base";
import Toolbar from "./Toolbar";

class Component extends React.Component {
  static propTypes = {
    tabIndex: PropTypes.number,
    onFocus: PropTypes.func,
    disabled: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      tabIndex: this.getInitialTabIndex()
    };
  }

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

  getInitialTabIndex = () => {
    const { tabIndex } = this.props;
    return typeof tabIndex !== "undefined" ? tabIndex : -1;
  };

  getElement = () => {
    if (typeof this.element === "undefined") {
      this.element = findDOMNode(this);
    }
    return this.element;
  };

  getToolbar = () => {
    if (typeof this.toolbar === "undefined") {
      this.toolbar = this.getElement().closest(`.${Toolbar.styledComponentId}`);
    }
    return this.toolbar;
  };

  getFocusables = () => {
    if (!this.getToolbar()) return [];
    return this.getToolbar().querySelectorAll(
      `.${ToolbarFocusable.styledComponentId}`
    );
  };

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

  toolbarIsVertical = () => {
    if (!this.getToolbar()) return false;
    return this.getToolbar().getAttribute("aria-orientation") === "vertical";
  };

  addKeyDownHandler = () => {
    if (!this.getToolbar()) return;
    this.getElement().addEventListener("keydown", this.handleKeyDown);
  };

  removeKeyDownHandler = () => {
    if (!this.getToolbar()) return;
    this.getElement().removeEventListener("keydown", this.handleKeyDown);
  };

  handleKeyDown = e => {
    const isVertical = this.toolbarIsVertical();
    const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
    const previousKey = isVertical ? "ArrowUp" : "ArrowLeft";
    const willPerformEvent = [nextKey, previousKey].indexOf(e.key) >= 0;

    if (!willPerformEvent) return;

    const focusables = this.getFocusables();
    const currentIndex = this.getCurrentIndex(focusables);

    e.preventDefault();
    this.setState({ tabIndex: this.getInitialTabIndex() });

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
        onFocus={callAll(this.handleFocus, this.props.onFocus)}
        tabIndex={this.state.tabIndex}
      />
    );
  }
}

const ToolbarFocusable = styled(Component)`
  ${prop("theme.ToolbarFocusable")};
`;

export default as("div")(ToolbarFocusable);

import * as React from "react";
import { findDOMNode } from "react-dom";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import callAll from "../_utils/callAll";
import getSelector from "../_utils/getSelector";
import styled from "../styled";
import as from "../as";
import Box from "../Box";
import Toolbar from "./Toolbar";

type Focusable = (Element | Text) & {
  focus(): void;
};

export interface ToolbarFocusableProps {
  disabled?: boolean;
  tabIndex?: number;
  onFocus?: () => void;
}

export interface ToolbarFocusableState {
  tabIndex: number;
}

class ToolbarFocusableComponent extends React.Component<
  ToolbarFocusableProps,
  ToolbarFocusableState
> {
  private element: any;

  private toolbar: any;

  constructor(props: ToolbarFocusableProps) {
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

  componentDidUpdate(prevProps: ToolbarFocusableProps) {
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
      this.toolbar = this.getElement().closest(getSelector(Toolbar));
    }
    return this.toolbar;
  };

  getFocusables = (): NodeListOf<Focusable> => {
    if (!this.getToolbar()) return new NodeList() as NodeListOf<Focusable>;
    return this.getToolbar().querySelectorAll(getSelector(ToolbarFocusable));
  };

  getCurrentIndex = (focusables: NodeListOf<Focusable>) => {
    let currentIndex = -1;
    focusables.forEach((item: Element | Text | null, i: number) => {
      if (item === this.getElement()) {
        currentIndex = i;
      }
    });
    return currentIndex;
  };

  getNextFocusable = (
    focusables: NodeListOf<Focusable>,
    currentIndex: number
  ) => {
    const index = currentIndex + 1;
    return focusables.item(index) || focusables.item(0);
  };

  getPreviousFocusable = (
    focusables: NodeListOf<Focusable>,
    currentIndex: number
  ) => {
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

  handleKeyDown = (e: KeyboardEvent) => {
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
      <Box
        {...this.props}
        onFocus={callAll(this.handleFocus, this.props.onFocus)}
        tabIndex={this.state.tabIndex}
      />
    );
  }
}

// @ts-ignore
hoistNonReactStatics(ToolbarFocusableComponent, Box);

const ToolbarFocusable = styled(ToolbarFocusableComponent)`
  ${theme("ToolbarFocusable")};
`;

// @ts-ignore
ToolbarFocusable.propTypes = {
  tabIndex: PropTypes.number,
  onFocus: PropTypes.func,
  disabled: PropTypes.bool
};

export default as("div")(ToolbarFocusable);

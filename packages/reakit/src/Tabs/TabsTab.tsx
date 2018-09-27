import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import createElementRef from "../_utils/createElementRef";
import callAll from "../_utils/callAll";
import styled from "../styled";
import as from "../as";
import Step, { StepContainerActions, StepContainerSelectors } from "../Step";

export interface TabsTabProps extends StepContainerActions {
  className?: string;
  disabled?: boolean;
  onClick?: () => any;
  onFocus?: () => any;
  onKeyDown?: () => any;
  isCurrent: StepContainerSelectors["isCurrent"];
  current: number;
  tab: string;
  active: boolean;
  role?: string;
}

interface Keymap {
  [key: string]: () => void;
  ArrowLeft: StepContainerActions["previous"];
  ArrowRight: StepContainerActions["next"];
}

class Component extends React.Component<TabsTabProps> {
  element = React.createRef<HTMLElement>();

  componentDidUpdate(prevProps: TabsTabProps) {
    const { current, isCurrent, tab } = this.props;

    if (
      prevProps.current !== current &&
      isCurrent(tab) &&
      this.element &&
      this.element.current
    ) {
      this.element.current.focus();
    }
  }

  show = () => {
    const { show, isCurrent, tab } = this.props;
    if (!isCurrent(tab)) {
      show(tab);
    }
  };

  keyDown = (e: KeyboardEvent) => {
    const keyMap: Keymap = {
      ArrowLeft: this.props.previous,
      ArrowRight: this.props.next
    };
    if (keyMap[e.key]) {
      e.preventDefault();
      keyMap[e.key]();
    }
  };

  render() {
    const {
      isCurrent,
      tab,
      className,
      onClick,
      onFocus,
      onKeyDown
    } = this.props;

    const active = isCurrent(tab);
    const activeClassName = active ? "active" : "";
    const finalClassName = [className, activeClassName]
      .filter(Boolean)
      .join(" ");

    return (
      <Step
        id={`${tab}Tab`}
        step={tab}
        aria-selected={active}
        aria-controls={`${tab}Panel`}
        tabIndex={active ? 0 : -1}
        visible
        {...this.props}
        onClick={callAll(this.show, onClick)}
        onFocus={callAll(this.show, onFocus)}
        onKeyDown={callAll(this.keyDown, onKeyDown)}
        className={finalClassName}
        elementRef={createElementRef(this, "element")}
      />
    );
  }
}

const TabsTab = styled(Component)`
  ${theme("TabsTab")};
`;

// @ts-ignore
TabsTab.propTypes = {
  tab: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  unregister: PropTypes.func.isRequired,
  isCurrent: PropTypes.func.isRequired,
  show: PropTypes.func.isRequired,
  next: PropTypes.func.isRequired,
  previous: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func
};

const noop = () => {};

TabsTab.defaultProps = {
  role: "tab",
  register: noop,
  update: noop,
  unregister: noop,
  isCurrent: _ => false,
  show: noop,
  next: noop,
  previous: noop
};

export default as("li")(TabsTab);

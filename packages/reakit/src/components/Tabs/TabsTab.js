import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import callAll from "../../utils/callAll";
import createElementRef from "../../utils/createElementRef";
import Step from "../Step";

class Component extends React.Component {
  componentDidUpdate(prevProps) {
    const { current, isCurrent, tab } = this.props;

    if (prevProps.current !== current && isCurrent(tab)) {
      this.element.focus();
    }
  }

  show = () => {
    const { show, isCurrent, tab } = this.props;
    if (!isCurrent(tab)) {
      show(tab);
    }
  };

  keyDown = e => {
    const keyMap = {
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
        active={active}
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
  display: inline-flex;
  position: relative;
  flex: 1;
  user-select: none;
  outline: none;
  align-items: center;
  white-space: nowrap;
  justify-content: center;
  text-decoration: none;
  height: 2.5em;
  padding: 0 0.5em;
  min-width: 2.5em;
  &.active {
    font-weight: bold;
  }
  &[disabled] {
    pointer-events: none;
  }
  ${prop("theme.TabsTab")};
`;

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
  isCurrent: noop,
  show: noop,
  next: noop,
  previous: noop
};

export default as("li")(TabsTab);

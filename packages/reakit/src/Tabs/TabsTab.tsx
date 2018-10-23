import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import createElementRef from "../_utils/createElementRef";
import callAll from "../_utils/callAll";
import { Omit } from "../_utils/types";
import styled from "../styled";
import as from "../as";
import Step, {
  StepContainerActions,
  StepContainerSelectors,
  StepProps
} from "../Step";

export interface TabsTabProps extends Omit<StepProps, "step"> {
  tab: string;
  current: number;
  register: StepContainerActions["register"];
  update: StepContainerActions["update"];
  unregister: StepContainerActions["unregister"];
  show: StepContainerActions["show"];
  next: StepContainerActions["next"];
  previous: StepContainerActions["previous"];
  isCurrent: StepContainerSelectors["isCurrent"];
  role?: string;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler;
  onFocus?: React.MouseEventHandler;
  onKeyDown?: React.KeyboardEventHandler;
}

interface KeyMap {
  ArrowLeft: StepContainerActions["previous"];
  ArrowRight: StepContainerActions["next"];
}

class TabsTabComponent extends React.Component<TabsTabProps> {
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
    const keyMap: KeyMap = {
      ArrowLeft: this.props.previous,
      ArrowRight: this.props.next
    };

    const inKeyMap = (key: string): key is keyof KeyMap => key in keyMap;

    if (inKeyMap(e.key)) {
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

const TabsTab = styled(TabsTabComponent)`
  ${theme("TabsTab")};
`;

// @ts-ignore
TabsTab.propTypes = {
  tab: PropTypes.string.isRequired,
  current: PropTypes.number.isRequired,
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
  isCurrent: () => false,
  show: noop,
  next: noop,
  previous: noop
};

export default as("li")(TabsTab);

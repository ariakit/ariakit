import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import styled from "../styled";
import Hidden, { HiddenProps } from "../Hidden";
import { StepContainerSelectors } from "../Step";

export interface TabsPanelProps extends HiddenProps {
  isCurrent: StepContainerSelectors["isCurrent"];
  tab: string;
  role?: string;
}

const Component = (props: TabsPanelProps) => {
  const { isCurrent, tab } = props;
  return (
    <Hidden
      id={`${tab}Panel`}
      aria-labelledby={`${tab}Tab`}
      unmount
      visible={isCurrent && isCurrent(tab)}
      {...props}
    />
  );
};

const TabsPanel = styled(Component)`
  ${theme("TabsPanel")};
`;

// @ts-ignore
TabsPanel.propTypes = {
  tab: PropTypes.string.isRequired,
  isCurrent: PropTypes.func.isRequired
};

TabsPanel.defaultProps = {
  role: "tabpanel"
};

export default TabsPanel;

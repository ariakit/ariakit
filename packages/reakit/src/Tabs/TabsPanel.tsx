import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import hoist from "../_utils/hoist";
import styled from "../styled";
import use from "../use";
import Hidden, { HiddenProps } from "../Hidden";
import { StepContainerSelectors } from "../Step";

export interface TabsPanelProps extends HiddenProps {
  isCurrent: StepContainerSelectors["isCurrent"];
  tab: string;
  role?: string;
}

const TabsPanelComponent = (props: TabsPanelProps) => {
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

const TabsPanel = styled(hoist(TabsPanelComponent, Hidden))`
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

export default use(TabsPanel, "div");

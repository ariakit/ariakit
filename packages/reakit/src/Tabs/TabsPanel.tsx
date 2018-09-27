import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import styled from "../styled";
import as from "../as";
import Hidden from "../Hidden";
import { StepContainerSelectors } from "../Step";

export interface TabsPanelProps {
  isCurrent: StepContainerSelectors["isCurrent"];
  tab: string;
  role?: string;
}

const Component: React.SFC<TabsPanelProps> = props => {
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

hoistNonReactStatics(Component, Hidden);

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

export default as("div")(TabsPanel);

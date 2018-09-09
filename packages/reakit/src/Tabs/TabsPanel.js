import React from "react";
import PropTypes from "prop-types";
import { theme } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import styled from "../styled";
import as from "../as";
import Hidden from "../Hidden";

const Component = props => {
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

TabsPanel.propTypes = {
  tab: PropTypes.string.isRequired,
  isCurrent: PropTypes.func.isRequired
};

TabsPanel.defaultProps = {
  role: "tabpanel"
};

export default as("div")(TabsPanel);

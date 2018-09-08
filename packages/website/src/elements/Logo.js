import * as React from "react";
import { Box, styled } from "reakit";
import logo from "!raw-loader!../../../../logo/logo.svg";

const Component = props => (
  <Box {...props} dangerouslySetInnerHTML={{ __html: logo }} />
);

const Logo = styled(Component)`
  .cls-2 {
    fill: currentColor !important;
  }
`;

export default Logo;

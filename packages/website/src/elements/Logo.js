import * as React from "react";
import { Base, styled } from "reakit";
import logo from "!raw-loader!../../../../logo/logo.svg";

const Component = props => (
  <Base {...props} dangerouslySetInnerHTML={{ __html: logo }} />
);

const Logo = styled(Component)`
  .cls-1 {
    fill: currentColor !important;
  }
`;

export default Logo;

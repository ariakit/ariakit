import * as React from "react";
import * as PropTypes from "prop-types";
import { theme, withProp } from "styled-tools";
import hoistNonReactStatics from "hoist-non-react-statics";
import numberToPx from "../_utils/numberToPx";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface ToolbarProps extends BoxProps {
  role?: string;
  gutter?: number | string;
  vertical?: boolean;
}

const Component = (props: ToolbarProps) => (
  <Box
    aria-orientation={props.vertical ? "vertical" : "horizontal"}
    {...props}
  />
);

hoistNonReactStatics(Component, Box);

const Toolbar = styled(Component)`
  position: relative;
  display: grid;
  width: 100%;
  padding: ${withProp("gutter", numberToPx)};
  grid-gap: ${withProp("gutter", numberToPx)};
  grid-template:
    "start center end"
    / 1fr auto 1fr;

  &[aria-orientation="vertical"] {
    width: min-content;
    height: 100%;
    grid-template:
      "start" 1fr
      "center" auto
      "end" 1fr;
  }

  ${theme("Toolbar")};
`;

// @ts-ignore
Toolbar.propTypes = {
  gutter: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  vertical: PropTypes.bool
};

Toolbar.defaultProps = {
  role: "toolbar",
  gutter: 8
};

const ToolbarComponent = as("div")(Toolbar);

// we have to augment type, because styled-components typings misses "styledComponentId" property
type ToolbarComponentType = typeof ToolbarComponent & {
  styledComponentId: string;
};

export default ToolbarComponent as ToolbarComponentType;

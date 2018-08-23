import * as React from "react";
import * as PropTypes from "prop-types";
import { prop } from "styled-tools";
import { bool } from "../_utils/styledProps";
import styled from "../styled";
import as from "../as";

const positions = {
  static: "static",
  absolute: "absolute",
  fixed: "fixed",
  relative: "relative",
  sticky: "sticky"
};

type ComponentProps = {
  as: keyof JSX.IntrinsicElements | React.ComponentType;
};

const Component = ({ as: T, ...props }: ComponentProps) =>
  React.createElement(T, props);

type BaseProps = { [key in keyof typeof positions]?: boolean };

const positionsKeys = Object.keys(positions);

const Base = styled(Component)<BaseProps>`
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font-family: inherit;
  vertical-align: baseline;
  box-sizing: border-box;
  ${prop("theme.Base")};
  &&& {
    ${bool("position", positionsKeys)};
  }
`;

const asTypes = [PropTypes.func, PropTypes.string];

// @ts-ignore
Base.propTypes = {
  as: PropTypes.oneOfType([
    ...asTypes,
    PropTypes.arrayOf(PropTypes.oneOfType(asTypes))
  ]),
  static: PropTypes.bool,
  absolute: PropTypes.bool,
  fixed: PropTypes.bool,
  relative: PropTypes.bool,
  sticky: PropTypes.bool
};

export default as("div")(Base);

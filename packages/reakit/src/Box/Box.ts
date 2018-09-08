import * as React from "react";
import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import {
  bool,
  bgColorWithProps,
  textColorWithProps
} from "../_utils/styledProps";
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

export type BoxProps = { [key in keyof typeof positions]?: boolean } & {
  opaque?: boolean;
  palette?: string;
  tone?: number;
};

const positionsKeys = Object.keys(positions);

const Box = styled(Component)<BoxProps>`
  margin: unset;
  padding: unset;
  border: unset;
  background: unset;
  font: unset;
  font-family: inherit;
  font-size: 100%;
  box-sizing: border-box;
  background-color: ${bgColorWithProps};
  color: ${textColorWithProps};
  ${theme("Box")};
  &&& {
    ${bool("position", positionsKeys)};
  }
`;

const asTypes = [PropTypes.func, PropTypes.string];

// @ts-ignore
Box.propTypes = {
  as: PropTypes.oneOfType([
    ...asTypes,
    PropTypes.arrayOf(PropTypes.oneOfType(asTypes))
  ]),
  opaque: PropTypes.bool,
  palette: PropTypes.string,
  tone: PropTypes.number,
  static: PropTypes.bool,
  absolute: PropTypes.bool,
  fixed: PropTypes.bool,
  relative: PropTypes.bool,
  sticky: PropTypes.bool
};

export default as("div")(Box);

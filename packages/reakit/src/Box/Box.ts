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

const positions = ["static", "absolute", "fixed", "relative", "sticky"];

const BoxComponent = ({ as: T, ...props }: { as: React.ComponentType }) =>
  React.createElement(T, props);

export type BoxProps = {
  static?: boolean;
  absolute?: boolean;
  fixed?: boolean;
  relative?: boolean;
  sticky?: boolean;
  opaque?: boolean;
  palette?: string;
  tone?: number;
};

const Box = styled(BoxComponent)<BoxProps>`
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
    ${bool("position", positions)};
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

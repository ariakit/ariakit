import React, { ComponentType } from "react";
import PropTypes from "prop-types";
import { prop } from "styled-tools";
import { bool } from "../_utils/styledProps";
import styled from "../styled";
import as from "../as";
import globalPropTypes from "../_utils/globalPropTypes";

enum Position {
  static = "static",
  absolute = "absolute",
  fixed = "fixed",
  relative = "relative",
  sticky = "sticky"
}

type PositionProps = { [key in keyof typeof Position]?: boolean | null };

type ComponentProps = {
  as: keyof JSX.IntrinsicElements | ComponentType;
};

const positions = Object.keys(Position);

const Component = ({ as: T, ...props }: ComponentProps) =>
  React.createElement(T, props);

type BaseProps = PositionProps & ComponentProps;

const Base = styled<BaseProps>(Component)`
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font-family: inherit;
  vertical-align: baseline;
  box-sizing: border-box;
  ${prop("theme.Base")};
  &&& {
    ${bool("position", positions)};
  }
`;

Base.propTypes = {
  ...globalPropTypes,
  as: PropTypes.any,
  static: PropTypes.bool,
  absolute: PropTypes.bool,
  fixed: PropTypes.bool,
  relative: PropTypes.bool,
  sticky: PropTypes.bool
};

export default as("div")(Base);

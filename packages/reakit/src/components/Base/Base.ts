import React, { ComponentType } from "react";
import PropTypes from "prop-types";
import { prop } from "styled-tools";
import { bool } from "../../utils/styledProps";
import styled from "../../enhancers/styled";
import as from "../../enhancers/as";

enum Position {
  static,
  absolute,
  fixed,
  relative,
  sticky
}

const positions = Object.keys(Position);

type PositionProps = { [key in keyof typeof Position]?: boolean };

type ComponentProps = {
  as: keyof JSX.IntrinsicElements | ComponentType;
};

type BaseProps = PositionProps & ComponentProps;

const Component = ({ as: T, ...props }: ComponentProps) =>
  React.createElement(T, props);

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

const asTypes = [PropTypes.func, PropTypes.string];

// @ts-ignore
Base.propTypes = {
  as: PropTypes.oneOfType([
    ...asTypes,
    PropTypes.arrayOf(PropTypes.oneOfType(asTypes))
  ]),
  ...positions.reduce(
    (obj, position) => ({
      ...obj,
      [position]: PropTypes.bool
    }),
    {}
  )
};

export default as("div")(Base);

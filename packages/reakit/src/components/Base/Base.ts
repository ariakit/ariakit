import React, { SFC, ComponentClass } from "react";
import PropTypes from "prop-types";
import { prop } from "styled-tools";
import { bool } from "../../utils/styledProps";
import styled from "../../enhancers/styled";
import as, { AsComponents } from "../../enhancers/as";

const positions = ["static", "absolute", "fixed", "relative", "sticky"];

enum Position {
  static,
  absolute,
  fixed,
  relative,
  sticky
}

interface ComponentProps {
  as: SFC | ComponentClass | string;
  nextAs: AsComponents;
}

const Component = ({ as: T, nextAs, ...props }: ComponentProps) =>
  React.createElement(T, props);

const Base = styled(Component)`
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
  as: PropTypes.oneOfType(asTypes),
  ...positions.reduce(
    (obj, position) => ({
      ...obj,
      [position]: PropTypes.bool
    }),
    {}
  )
};

export default as("div")(Base);

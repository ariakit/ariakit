import React, { ComponentType } from "react";
import PropTypes from "prop-types";
import styled from "../../utils/styled";
import { prop } from "styled-tools";
import { bool } from "../../utils/styledProps";
import as from "../../enhancers/as";

const positions = ["static", "absolute", "fixed", "relative", "sticky"];

interface IComponentProps {
  as: string | ComponentType
}

const Component = ({ as: Type, ...props } : IComponentProps) => React.createElement(Type, props);

const Base = styled<IComponentProps>(Component)`
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

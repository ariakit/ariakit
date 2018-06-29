import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { prop } from "styled-tools";
import { bool } from "../../utils/styledProps";
import as from "../../enhancers/as";

const positions = ["static", "absolute", "fixed", "relative", "sticky"];

const Component = ({ as: T, ...props }) => <T {...props} />;

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

const type = PropTypes.oneOfType([PropTypes.func, PropTypes.string]);

Base.propTypes = {
  as: PropTypes.oneOfType([type, PropTypes.arrayOf(type)]),
  ...positions.reduce(
    (obj, position) => ({
      ...obj,
      [position]: PropTypes.bool
    }),
    {}
  )
};

export default as("div")(Base);

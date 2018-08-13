import PropTypes from "prop-types";
import { withProp, prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Fit from "../Fit";

const Shadow = styled(Fit)`
  border-radius: inherit;
  pointer-events: none;
  box-shadow: ${withProp(
    "depth",
    d => `0 ${d * 2}px ${d * 4}px rgba(0, 0, 0, 0.2)`
  )};
  &&& {
    margin: 0;
  }
  ${prop("theme.Shadow")};
`;

Shadow.propTypes = {
  depth: PropTypes.number
};

Shadow.defaultProps = {
  depth: 2
};

export default as("div")(Shadow);

import PropTypes from "prop-types";
import { prop } from "styled-tools";
import { bool } from "../_utils/styledProps";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const directions = ["row", "column", "rowReverse", "columnReverse"];
const wraps = ["nowrap", "wrap", "wrapReverse"];

const Flex = styled(Base)`
  display: flex;
  &&& {
    ${bool("flex-direction", directions)};
    ${bool("flex-wrap", wraps)};
  }

  ${prop("theme.Flex")};
`;

Flex.propTypes = {
  row: PropTypes.bool,
  column: PropTypes.bool,
  rowReverse: PropTypes.bool,
  columnReverse: PropTypes.bool,
  nowrap: PropTypes.bool,
  wrap: PropTypes.bool,
  wrapReverse: PropTypes.bool
};

export default as("div")(Flex);

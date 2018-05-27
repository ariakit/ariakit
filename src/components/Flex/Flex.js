import PropTypes from "prop-types";
import styled from "styled-components";
import as from "../../enhancers/as";
import { bool } from "../../utils/styledProps";
import Base from "../Base";

const flexDirection = ["row", "column", "rowReverse", "columnReverse"];
const flexWrap = ["nowrap", "wrap", "wrapReverse"];

const Flex = styled(Base)`
  display: flex;
  &&& {
    ${bool("flex-direction", flexDirection)};
    ${bool("flex-wrap", flexWrap)};
  }
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

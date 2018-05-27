import PropTypes from "prop-types";
import styled from "styled-components";
import as from "../../enhancers/as";
import { bool, value } from "../../utils/styledProps";
import Base from "../Base";

const Flex = styled(Base)`
  display: flex;

  &&& {
    ${bool("flex-direction", [
      "row",
      "column",
      "rowReverse",
      "columnReverse"
    ])} ${bool("flex-wrap", ["nowrap", "wrap", "wrapReverse"])};
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

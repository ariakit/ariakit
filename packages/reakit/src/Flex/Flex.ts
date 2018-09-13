import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import { bool } from "../_utils/styledProps";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const directions = ["row", "column", "rowReverse", "columnReverse"];
const wraps = ["nowrap", "wrap", "wrapReverse"];

export interface FlexProps {
  row: boolean;
  column: boolean;
  rowReverse: boolean;
  columnReverse: boolean;
  nowrap: boolean;
  wrap: boolean;
  wrapReverse: boolean;
}

const Flex = styled(Box)<FlexProps>`
  display: flex;
  &&& {
    ${bool("flex-direction", directions)};
    ${bool("flex-wrap", wraps)};
  }

  ${theme("Flex")};
`;

// @ts-ignore
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

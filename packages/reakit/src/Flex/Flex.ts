import * as PropTypes from "prop-types";
import { theme } from "styled-tools";
import { bool } from "../_utils/styledProps";
import styled from "../styled";
import use from "../use";
import Box, { BoxProps } from "../Box";

export interface FlexProps extends BoxProps {
  row?: boolean;
  column?: boolean;
  rowReverse?: boolean;
  columnReverse?: boolean;
}

const directions = ["row", "column", "rowReverse", "columnReverse"];

const Flex = styled(Box)<FlexProps>`
  display: flex;
  &&& {
    ${bool("flex-direction", directions)};
  }

  ${theme("Flex")};
`;

// @ts-ignore
Flex.propTypes = {
  row: PropTypes.bool,
  column: PropTypes.bool,
  rowReverse: PropTypes.bool,
  columnReverse: PropTypes.bool
};

export default use(Flex, "div");

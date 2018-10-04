import * as PropTypes from "prop-types";
import { prop, theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface ToolbarContentProps extends BoxProps {
  align?: "start" | "center" | "end";
}

const ToolbarContent = styled(Box)<ToolbarContentProps>`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  grid-gap: inherit;
  grid-area: ${prop("align")};
  justify-content: ${prop("align")};
  align-items: center;

  [aria-orientation="vertical"] > & {
    grid-auto-flow: row;
    grid-auto-rows: min-content;
    justify-content: initial;
    align-content: ${prop("align")};
  }

  ${theme("ToolbarContent")};
`;

// @ts-ignore
ToolbarContent.propTypes = {
  align: PropTypes.oneOf(["start", "center", "end"])
};

ToolbarContent.defaultProps = {
  align: "start"
};

export default as("div")(ToolbarContent);

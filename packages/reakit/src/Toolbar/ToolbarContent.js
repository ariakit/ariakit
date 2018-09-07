import PropTypes from "prop-types";
import { prop, theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const ToolbarContent = styled(Box)`
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

ToolbarContent.propTypes = {
  align: PropTypes.oneOf(["start", "center", "end"])
};

ToolbarContent.defaultProps = {
  align: "start"
};

export default as("div")(ToolbarContent);

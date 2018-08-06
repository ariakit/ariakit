import PropTypes from "prop-types";
import styled from "styled-components";
import { prop, withProp } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";
import numberToPx from "../../utils/numberToPx";

const ToolbarContent = styled(Base)`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  grid-gap: ${withProp("gap", numberToPx)};
  grid-area: ${prop("area")};
  justify-content: ${prop("area")};
  align-items: center;

  [aria-orientation="vertical"] > & {
    grid-auto-flow: row;
    grid-auto-rows: min-content;
    justify-content: initial;
    align-content: ${prop("area")};
  }

  ${prop("theme.ToolbarContent")};
`;

ToolbarContent.propTypes = {
  area: PropTypes.oneOf(["start", "center", "end"]),
  gap: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

ToolbarContent.defaultProps = {
  area: "start",
  gap: "inherit"
};

export default as("div")(ToolbarContent);

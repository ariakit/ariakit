import React from "react";
import PropTypes from "prop-types";
import { ifProp } from "styled-tools";
import as, { styled, InlineBlock } from "../../src";

const StyledInlineBlock = styled(InlineBlock)`
  font-family: "Fira Code", monospace;
  font-weight: 700;
  font-size: 20px;
  color: ${ifProp({ pos: "left" }, "#EF8132", "#E03A3C")};
  background-color: transparent;
  border: 0;
  text-shadow: ${ifProp(
    { pos: "left" },
    "-3px 0 0 #F5B840, -6px 0 0 #60BB44",
    "3px 0 0 #943D93, 6px 0 0 #439FDD"
  )};
`;

const Brackets = ({ pos, ...props }) => (
  <StyledInlineBlock pos={pos} {...props}>
    {pos === "left" ? "{" : "}"}
  </StyledInlineBlock>
);

Brackets.propTypes = {
  pos: PropTypes.oneOf(["left", "right"]).isRequired
};

export default as("div")(Brackets);

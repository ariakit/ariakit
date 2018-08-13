import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box from "../Box";

const handleKeyPress = e => {
  if (e.charCode === 32 || e.charCode === 13) {
    e.preventDefault();
    e.target.click();
  }
};

const Button = styled(Box)`
  display: inline-flex;
  position: relative;
  flex: none;
  appearance: none;
  user-select: none;
  outline: none;
  align-items: center;
  white-space: nowrap;
  justify-content: center;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.03);
  height: 2.5em;
  min-width: 2.5em;
  padding: 0 0.68em;
  &:hover,
  &:focus {
    box-shadow: inset 0 0 999em rgba(0, 0, 0, 0.1);
  }
  &:active,
  &.active {
    box-shadow: inset 0 0 999em rgba(0, 0, 0, 0.2);
  }
  &:after {
    display: none;
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: inherit;
    background-color: rgba(255, 255, 255, 0.35);
  }
  &[disabled] {
    pointer-events: none;
    &:after {
      display: block;
    }
  }
  &:not(button):not(select):not(input) {
    display: inline-grid;
    grid-gap: 0.68em;
    grid-auto-flow: column;
    align-content: center;
  }
  ${prop("theme.Button")};
`;

Button.defaultProps = {
  role: "button",
  tabIndex: 0,
  onKeyPress: handleKeyPress
};

export default as("div")(Button);

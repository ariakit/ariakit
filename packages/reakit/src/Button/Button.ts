import * as PropTypes from "prop-types";
import { theme, palette, withProp } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

interface ButtonProps {
  palette?: string;
}

const textColor = (index: number) =>
  withProp("palette", p => palette(`${p}Text`, index, "inherit"));

const Button = styled(Base)<ButtonProps>`
  border-radius: ${theme("borderRadius")};
  background-color: ${palette(1)};
  color: ${textColor(1)};

  &:hover {
    background-color: ${palette(2)};
    color: ${textColor(2)};
  }

  &:active {
    background-color: ${palette(0)};
    color: ${textColor(1)};
  }

  &[disabled] {
    pointer-events: none;
    background-color: ${palette(3)};
  }

  ${theme("Button")};
`;

// @ts-ignore
Button.propTypes = {
  palette: PropTypes.string
};

Button.defaultProps = {
  palette: "primary"
};

export default as("button")(Button);

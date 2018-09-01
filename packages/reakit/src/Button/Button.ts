import * as PropTypes from "prop-types";
import { theme, palette, withProp, ifProp } from "styled-tools";
import styled, { css } from "../styled";
import as from "../as";
import Base from "../Base";

interface ButtonProps {
  palette?: string;
  outlined?: boolean;
}

const textColor = (index: number) =>
  withProp("palette", p => palette(`${p}Text`, index, "inherit"));

const Button = styled(Base)<ButtonProps>`
  border-radius: ${theme("borderRadius")};
  &[disabled] {
    pointer-events: none;
  }

  ${ifProp(
    "outlined",
    css`
      color: ${palette(1)};
      ${ifProp(
        theme("borderWidth"),
        css`
          border: ${theme("borderWidth")} solid ${palette(1)};
        `
      )};

      &:hover {
        color: ${palette(2)};
        border-color: ${palette(2)};
      }

      &:active {
        color: ${palette(0)};
        border-color: ${palette(0)};
      }

      &[disabled] {
        color: ${palette(3)};
        border-color: ${palette(3)};
      }
    `,
    css`
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
        background-color: ${palette(3)};
      }
    `
  )} ${theme("Button")};
`;

// @ts-ignore
Button.propTypes = {
  palette: PropTypes.string,
  outlined: PropTypes.bool
};

Button.defaultProps = {
  palette: "primary"
};

export default as("button")(Button);

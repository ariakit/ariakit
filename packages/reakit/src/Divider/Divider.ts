import * as PropTypes from "prop-types";
import { ifProp, theme } from "styled-tools";
import styled, { css } from "../styled";
import as from "../as";
import Box from "../Box";

export interface DividerProps {
  vertical?: boolean;
}

const Divider = styled(Box)<DividerProps>`
  border-color: currentColor;
  border-style: solid;
  opacity: 0.2;

  ${ifProp(
    "vertical",
    css`
      margin: 0 1em;
      min-height: 100%;
      width: 0;
      border-width: 0 0 0 1px;
    `,
    css`
      margin: 1em 0;
      height: 0;
      border-width: 1px 0 0 0;
    `
  )};

  ${theme("Divider")};
`;

// @ts-ignore
Divider.propTypes = {
  vertical: PropTypes.bool
};

export default as("hr")(Divider);

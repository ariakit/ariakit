import { palette as p, theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface MenuDividerProps extends BoxProps {
  role?: string;
}

const MenuDivider = styled(Box)<MenuDividerProps>`
  background-color: ${p("background", 1)};
  color: transparent;
  font-size: 0;
  height: 2px;
  width: 100%;

  [aria-orientation="horizontal"] > & {
    height: unset;
    width: 2px;
  }

  ${theme("MenuDivider")};
`;

MenuDivider.defaultProps = {
  role: "separator"
};

export default as("li")(MenuDivider);

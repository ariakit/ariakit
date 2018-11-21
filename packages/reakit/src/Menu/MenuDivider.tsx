import { palette as p, theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

const MenuDivider = styled(Box)<BoxProps>`
  background-color: ${p("background", 1)};
  color: transparent;
  font-size: 0;
  height: 2px;
  width: 100%;

  [aria-orientation="horizontal"] > & {
    height: unset;
    width: 2px;
  }

  ${theme("MenuDidiver")};
`;

export default as("div")(MenuDivider);

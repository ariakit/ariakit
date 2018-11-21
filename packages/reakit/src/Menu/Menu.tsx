import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

const Menu = styled(Box)<BoxProps>`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;

  &[aria-orientation="horizontal"] {
    flex-direction: row;
  }

  ${theme("Menu")};
`;

export default as("ul")(Menu);

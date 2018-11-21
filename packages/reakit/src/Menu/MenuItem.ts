import { ifProp, theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

type Props = {
  disabled?: boolean;
};

const MenuItem = styled(Box)<Props & BoxProps>`
  opacity: ${ifProp("disabled", ".3", "unset")};
  cursor: ${ifProp("disabled", "unset", "pointer")};
  list-style-type: none;
  padding: 10px;
  user-select: none;

  ${theme("MenuItem")};
`;

export default as("li")(MenuItem);

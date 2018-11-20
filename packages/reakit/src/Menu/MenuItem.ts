import { ifProp, theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";
import { MenuProps } from "./Menu";

const MenuItem = styled(Box)<MenuProps>`
  opacity: ${ifProp("disabled", ".3", "unset")};
  cursor: ${ifProp("disabled", "unset", "pointer")};
  list-style-type: none;
  padding: 10px;
  ${theme("MenuItem")};

  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */
  -ms-user-select: none; /* IE 10+ */
  user-select: none; /* Likely future */
`;

export default as("li")(MenuItem);

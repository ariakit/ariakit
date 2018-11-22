import { ifProp, theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface MenuItemProps extends BoxProps {
  disabled?: boolean;
  role?: string;
}

const MenuItem = styled(Box)<MenuItemProps>`
  opacity: ${ifProp("disabled", ".3", "unset")};
  cursor: ${ifProp("disabled", "unset", "pointer")};
  list-style-type: none;
  padding: 10px;
  user-select: none;

  ${theme("MenuItem")};
`;

MenuItem.defaultProps = {
  role: "menuitem"
};

export default as("li")(MenuItem);

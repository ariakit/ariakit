import * as React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Box, { BoxProps } from "../Box";

export interface MenuProps extends BoxProps {
  role?: string;
  horizontal?: boolean;
}

const MenuComponent = (props: MenuProps) => (
  <Box
    aria-orientation={props.horizontal ? "horizontal" : "vertical"}
    {...props}
  />
);

hoistNonReactStatics(MenuComponent, Box);

const Menu = styled(MenuComponent)`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;

  &[aria-orientation="horizontal"] {
    flex-direction: row;
  }

  ${theme("Menu")};
`;

Menu.defaultProps = {
  role: "menu"
};

export default as("ul")(Menu);

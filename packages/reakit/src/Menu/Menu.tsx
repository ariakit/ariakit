import React from "react";
import { ifNotProp, theme } from "styled-tools";
import styled from "../styled";
import BaseList from "../List";
import Navigation from "../Navigation";
import withPropAt from "../_utils/withPropAt";

export interface MenuProps {
  horizontal?: boolean;
  horizontalAt?: number | string;
}

const horizontalAt = withPropAt("horizontalAt");
const HorizontalMenuContext = React.createContext(false);

const List = styled(BaseList)`
  display: flex;
  flex-wrap: wrap;
  flex-direction: ${ifNotProp("horizontal", "column", "row")};
  ${horizontalAt("flex-direction: row")};

  ${theme("Menu")};
`;

export { HorizontalMenuContext };

export default function Menu(props: MenuProps) {
  const layout = {
    horizontal: Boolean(props.horizontal),
    horizontalAt: props.horizontalAt
  };

  return (
    <HorizontalMenuContext.Provider value={layout}>
      <Navigation>
        <List {...props} />
      </Navigation>
    </HorizontalMenuContext.Provider>
  );
}

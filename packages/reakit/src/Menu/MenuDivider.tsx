import React from "react";
import { palette as p, ifProp, theme } from "styled-tools";
import styled, { css } from "../styled";
import as from "../as";
import { HorizontalMenuContext } from "./Menu";
import withPropAt from "../_utils/withPropAt";
import Box from "../Box";

const horizontalAt = withPropAt("horizontalAt");

export interface MenuDividerProps {
  horizontal?: boolean;
  horizontalAt?: number | string;
}

const Diviver = styled(Box)`
  color: transparent;
  font-size: 0;

  height: ${ifProp("horizontal", "unset", "2px")};
  width: ${ifProp("horizontal", "2px", "100%")};

  ${horizontalAt(
    css`
      height: unset;
      width: 2px;
    `
  )};

  background-color: ${p("background", 1)};
  ${theme("MenuItem")};
`;

function MenuDivider(props: MenuDividerProps) {
  return (
    <HorizontalMenuContext>
      {layout => <Diviver aria-hidden="true" {...layout} {...props} />}
    </HorizontalMenuContext>
  );
}

export default as("div")(MenuDivider);

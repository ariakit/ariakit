import React from "react";
import styled, { css } from "styled-components";
import { ifProp, prop } from "styled-tools";
import as from "../../enhancers/as";
import getUnderlyingElement from "../../utils/getUnderlyingElement";
import Base from "../Base";

const Component = props => (
  <Base
    role={getUnderlyingElement(props) === "th" ? "columnheader" : "cell"}
    {...props}
  />
);

const TableCell = styled(Component)`
  display: table-cell;
  border: inherit;
  padding: 0 8px;
  vertical-align: middle;

  ${ifProp(
    props => getUnderlyingElement(props) === "th",
    css`
      font-weight: bold;
      background-color: rgba(0, 0, 0, 0.05);
    `
  )};

  ${prop("theme.TableCell")};
`;

export default as("td")(TableCell);

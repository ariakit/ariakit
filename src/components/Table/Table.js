import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const Table = styled(Base)`
  display: table;
  table-layout: fixed;
  border-collapse: collapse;
  background-color: white;
  border: 1px solid #bbb;
  line-height: 200%;
  ${prop("theme.Table")};

  tbody,
  td,
  th,
  tfoot,
  thead,
  tr {
    border: inherit;
  }

  caption {
    display: table-caption;
    text-transform: uppercase;
    font-size: 0.9em;
    color: #999;
  }

  td,
  th {
    display: table-cell;
    padding: 0 8px;
    vertical-align: middle;
  }

  th {
    font-weight: bold;
    background-color: rgba(0, 0, 0, 0.05);
  }

  tbody {
    display: table-row-group;
  }

  col {
    display: table-column;
  }

  colgroup {
    display: table-column-group;
  }

  tfoot {
    display: table-footer-group;
  }

  thead {
    display: table-header-group;
  }

  tr {
    display: table-row;
  }
`;

Table.defaultProps = {
  role: "table"
};

export default as("table")(Table);

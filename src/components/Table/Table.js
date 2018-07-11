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
`;

Table.defaultProps = {
  role: "table"
};

export default as("table")(Table);

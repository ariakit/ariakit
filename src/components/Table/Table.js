import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const Table = styled(Base)`
  display: table;
  table-layout: fixed;
  border-collapse: collapse;
  background-color: white;
  border: 1px solid #bbb;
  line-height: 200%;
`;

Table.defaultProps = {
  role: "table"
};

export default as("table")(Table);

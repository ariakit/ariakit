import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const TableRow = styled(Base)`
  display: table-row;
  border: inherit;
`;

TableRow.defaultProps = {
  role: "row"
};

export default as("tr")(TableRow);

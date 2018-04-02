import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const TableBody = styled(Base)`
  display: table-row-group;
  border: inherit;
`;

TableBody.defaultProps = {
  role: "rowgroup"
};

export default as("tbody")(TableBody);

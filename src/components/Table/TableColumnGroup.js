import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const TableColumnGroup = styled(Base)`
  display: table-column-group;
`;

export default as("colgroup")(TableColumnGroup);

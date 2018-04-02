import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const TableFoot = styled(Base)`
  display: table-footer-group;
  border: inherit;
`;

TableFoot.defaultProps = {
  role: "rowgroup"
};

export default as("tfoot")(TableFoot);

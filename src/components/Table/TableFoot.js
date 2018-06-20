import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const TableFoot = styled(Base)`
  display: table-footer-group;
  border: inherit;
  ${prop("theme.TableFoot")};
`;

TableFoot.defaultProps = {
  role: "rowgroup"
};

export default as("tfoot")(TableFoot);

import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const TableColumnGroup = styled(Base)`
  display: table-column-group;
  ${prop("theme.TableColumnGroup")};
`;

export default as("colgroup")(TableColumnGroup);

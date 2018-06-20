import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const TableColumn = styled(Base)`
  display: table-column;
  ${prop("theme.TableColumn")};
`;

export default as("col")(TableColumn);

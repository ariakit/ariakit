import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const TableRow = styled(Base)`
  display: table-row;
  border: inherit;
  ${prop("theme.TableRow")};
`;

TableRow.defaultProps = {
  role: "row"
};

export default as("tr")(TableRow);

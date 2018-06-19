import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const TableBody = styled(Base)`
  display: table-row-group;
  border: inherit;
  ${prop("theme.TableBody")};
`;

TableBody.defaultProps = {
  role: "rowgroup"
};

export default as("tbody")(TableBody);

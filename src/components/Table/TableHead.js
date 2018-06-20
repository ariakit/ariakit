import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const TableHead = styled(Base)`
  display: table-header-group;
  border: inherit;
  ${prop("theme.TableHead")};
`;

TableHead.defaultProps = {
  role: "rowgroup"
};

export default as("thead")(TableHead);

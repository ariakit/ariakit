import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const TableCaption = styled(Base)`
  display: table-caption;
  text-transform: uppercase;
  font-size: 0.9em;
  color: #999;
  ${prop("theme.TableCaption")};
`;

export default as("caption")(TableCaption);

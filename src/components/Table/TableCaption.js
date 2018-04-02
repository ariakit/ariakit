import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const TableCaption = styled(Base)`
  display: table-caption;
  text-transform: uppercase;
  font-size: 0.9em;
  color: #999;
`;

export default as("caption")(TableCaption);

import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const TableWrapper = styled(Base)`
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  ${prop("theme.TableWrapper")};
`;

export default as("div")(TableWrapper);

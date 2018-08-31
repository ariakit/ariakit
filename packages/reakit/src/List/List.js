import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const List = styled(Base)`
  ${theme("List")};
`;

List.defaultProps = {
  role: "list"
};

export default as("ul")(List);

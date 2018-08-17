import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const List = styled(Base)`
  ${prop("theme.List")};
`;

List.defaultProps = {
  role: "list"
};

export default as("ul")(List);

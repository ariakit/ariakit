import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const List = styled(Base)`
  list-style: none;
  ${prop("theme.List")};

  li {
    margin-bottom: 0.35em;
  }
`;

List.defaultProps = {
  role: "list"
};

export default as("ul")(List);

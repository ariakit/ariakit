import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const List = styled(Base)`
  list-style: none;
  ${prop("theme.List")};
`;

List.defaultProps = {
  role: "list"
};

export default as("ul")(List);

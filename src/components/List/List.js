import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const List = styled(Base)`
  list-style: none;
`;

List.defaultProps = {
  role: "list"
};

export default as("ul")(List);

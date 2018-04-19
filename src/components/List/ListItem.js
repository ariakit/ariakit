import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const ListItem = styled(Base)`
  margin-bottom: 0.35em;
`;

ListItem.defaultProps = {
  role: "listitem"
};

export default as("li")(ListItem);

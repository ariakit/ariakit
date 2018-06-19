import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const ListItem = styled(Base)`
  margin-bottom: 0.35em;
  ${prop("theme.ListItem")};
`;

ListItem.defaultProps = {
  role: "listitem"
};

export default as("li")(ListItem);

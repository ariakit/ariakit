import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Tabs = styled(Base)`
  display: flex;
  align-items: center;
  list-style: none;
  @media screen and (max-width: 640px) {
    overflow-x: auto;
  }
  ${prop("theme.Tabs")};
`;

Tabs.defaultProps = {
  role: "tablist"
};

export default as("ul")(Tabs);

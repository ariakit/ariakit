import styled from "styled-components";
import as from "../../enhancers/as";
import Base from "../Base";

const Tabs = styled(Base)`
  display: flex;
  align-items: flex-end;
  list-style: none;
  @media screen and (max-width: 640px) {
    overflow-x: auto;
  }
`;

Tabs.defaultProps = {
  role: "tablist"
};

export default as("ul")(Tabs);

import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Tabs = styled(Base)`
  @media screen and (max-width: 640px) {
    overflow-x: auto;
  }
  ${theme("Tabs")};
`;

Tabs.defaultProps = {
  role: "tablist"
};

export default as("ul")(Tabs);

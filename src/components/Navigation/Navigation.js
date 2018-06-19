import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const Navigation = styled(Base)`
  width: 100%;
  ${prop("theme.Navigation")};
`;

export default as("nav")(Navigation);

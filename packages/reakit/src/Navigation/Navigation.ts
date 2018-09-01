import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Navigation = styled(Base)`
  ${theme("Navigation")};
`;

export default as("nav")(Navigation);

import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Link = styled(Base)`
  cursor: pointer;
  ${theme("Link")};
`;

export default as("a")(Link);

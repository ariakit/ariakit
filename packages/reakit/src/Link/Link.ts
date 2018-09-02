import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Link = styled(Base)`
  ${theme("Link")};
`;

export default as("a")(Link);

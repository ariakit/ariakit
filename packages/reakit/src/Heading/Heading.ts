import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Heading = styled(Base)`
  ${theme("Heading")};
`;

export default as("h1")(Heading);

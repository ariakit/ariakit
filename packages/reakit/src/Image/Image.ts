import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Image = styled(Base)`
  ${theme("Image")};
`;

export default as("img")(Image);

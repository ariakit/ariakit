import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Image = styled(Base)`
  display: block;
  max-width: 100%;
  ${prop("theme.Image")};
`;

export default as("img")(Image);

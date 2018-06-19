import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const Image = styled(Base)`
  display: block;
  max-width: 100%;
  ${prop("theme.Image")};
`;

export default as("img")(Image);

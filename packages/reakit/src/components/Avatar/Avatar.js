import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Base from "../Base";

const Avatar = styled(Base)`
  border-radius: 50%;
  width: 1.5em;
  height: 1.5em;
  overflow: hidden;
  object-fit: cover;
  ${prop("theme.Avatar")};
`;

export default as("img")(Avatar);

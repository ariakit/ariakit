import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Avatar = styled(Base)`
  ${prop("theme.Avatar")};
`;

export default as("img")(Avatar);

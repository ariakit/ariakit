import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Base from "../Base";

const Fit = styled(Base)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  ${prop("theme.Fit")};
`;

export default as("div")(Fit);

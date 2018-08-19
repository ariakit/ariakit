import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Arrow from "../Arrow";

const PopoverArrow = styled(Arrow)`
  position: absolute;
  border: inherit;
  [data-placement^="top"] > & {
    top: 100%;
  }
  [data-placement^="right"] > & {
    right: 100%;
    transform: rotateZ(90deg);
  }
  [data-placement^="bottom"] > & {
    bottom: 100%;
    transform: rotateZ(180deg);
  }
  [data-placement^="left"] > & {
    left: 100%;
    transform: rotateZ(-90deg);
  }
  ${prop("theme.PopoverArrow")};
`;

export default as("div")(PopoverArrow);

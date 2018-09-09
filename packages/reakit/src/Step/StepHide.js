import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
import HiddenHide from "../Hidden/HiddenHide";

const StepHide = styled(HiddenHide)`
  ${theme("StepHide")};
`;

export default as("button")(StepHide);

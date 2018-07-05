import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import HiddenHide from "../Hidden/HiddenHide";

const StepHide = styled(HiddenHide)`
  ${prop("theme.StepHide")};
`;

export default as("button")(StepHide);

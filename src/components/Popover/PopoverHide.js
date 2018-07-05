import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import HiddenHide from "../Hidden/HiddenHide";

const PopoverHide = styled(HiddenHide)`
  ${prop("theme.PopoverHide")};
`;

export default as("button")(PopoverHide);

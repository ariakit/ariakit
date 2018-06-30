import styled from "styled-components";
import { prop } from "styled-tools";
import HiddenHide from "../Hidden/HiddenHide";

const PopoverHide = styled(HiddenHide)`
  ${prop("theme.PopoverHide")};
`;

export default PopoverHide;

import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import HiddenShow from "../Hidden/HiddenShow";

const PopoverShow = styled(HiddenShow)`
  ${prop("theme.PopoverShow")};
`;

export default as("button")(PopoverShow);

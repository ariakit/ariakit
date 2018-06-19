import styled from "styled-components";
import { prop } from "styled-tools";
import as from "../../enhancers/as";
import Flex from "../Flex";

const InlineFlex = styled(Flex)`
  display: inline-flex;
  ${prop("theme.InlineFlex")};
`;

export default as("div")(InlineFlex);

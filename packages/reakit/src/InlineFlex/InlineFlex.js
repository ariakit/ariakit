import { prop } from "styled-tools";
import styled from "../styled";
import as from "../as";
import Flex from "../Flex";

const InlineFlex = styled(Flex)`
  display: inline-flex;
  ${prop("theme.InlineFlex")};
`;

export default as("div")(InlineFlex);

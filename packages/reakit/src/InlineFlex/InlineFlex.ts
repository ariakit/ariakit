import { theme } from "styled-tools";
import styled from "../styled";
import as from "../as";
// @ts-ignore
import Flex from "../Flex";

const InlineFlex = styled(Flex)`
  display: inline-flex;
  ${theme("InlineFlex")};
`;

export default as("div")(InlineFlex);

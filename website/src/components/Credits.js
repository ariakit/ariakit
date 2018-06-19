import React from "react";
import HeartIcon from "react-icons/lib/fa/heart";
import { styled, Block, InlineBlock, Link } from "reakit";

const Wrapper = styled(Block)`
  padding: 20px;
`;

const Credits = props => (
  <Wrapper {...props}>
    Made with <InlineBlock as={HeartIcon} color="red" /> by{" "}
    <Link href="https://twitter.com/diegohaz" target="_blank">
      Haz
    </Link>
  </Wrapper>
);

export default Credits;

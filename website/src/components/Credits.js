import React from "react";
import HeartIcon from "react-icons/lib/fa/heart";
import { Block, InlineBlock, Link } from "reas";

const Wrapper = Block.extend`
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

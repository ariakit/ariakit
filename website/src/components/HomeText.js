import React from "react";
import { Flex, Paragraph } from "reas";

const Wrapper = Flex.extend`
  flex-direction: column;
`;

const Headline = Paragraph.extend`
  font-family: Georgia, serif;
  font-size: 34px;
  @media (max-width: 768px) {
    font-size: 24px;
    text-align: center;
  }
`;

const HomeText = () => (
  <Wrapper>
    <Headline>Minimalist components for your next React app</Headline>
  </Wrapper>
);

export default HomeText;

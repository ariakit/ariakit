import React from "react";
import { Flex } from "reas";
import Heading from "./Heading";
import HomeBannerBox from "./HomeBannerBox";
import HomeBannerButtons from "./HomeBannerButtons";

const Wrapper = Flex.extend`
  position: relative;
  padding: 200px 80px 0px;
  justify-content: center;
  width: 100%;

  @media (max-width: 768px) {
    padding: 100px 20px 20px;
  }
`;

const Content = Flex.extend`
  flex-direction: column;
  align-items: center;
  max-width: 1200px;
  padding: 20px;
`;

const Text = Heading.extend`
  text-align: center;
  margin: 75px 0 40px;
  font-size: 44px;
  @media (max-width: 768px) {
    font-size: 30px;
  }
`;

const HomeBanner = props => (
  <Wrapper {...props}>
    <Content>
      <HomeBannerBox />
      <Text>Minimalist components for your next React app</Text>
      <HomeBannerButtons />
    </Content>
  </Wrapper>
);

export default HomeBanner;

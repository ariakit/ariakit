import React from "react";
import { styled, Block, Flex } from "../../src";
import logo from "../../logo/logo-vertical-white.svg";
import Intro from "./Intro";
import GitHubButton from "./GitHubButton";

const Wrapper = styled(Flex)`
  align-items: center;
  justify-content: center;
  background-color: rgb(48, 52, 60);
`;

const InnerWrapper = styled(Flex)`
  align-items: flex-start;
  width: 100%;
  max-width: 1200px;
  padding: 64px 16px;

  > * {
    margin: 32px;

    @media screen and (max-width: 800px) {
      margin: 16px 8px 8px;
    }
  }

  @media screen and (max-width: 800px) {
    align-items: center;
    padding: 32px 8px 8px;
    flex-direction: column;
  }
`;

const Left = styled(Flex)`
  flex-direction: column;
  flex: 0;
  align-items: center;
`;

const Logo = styled(Block)`
  flex: 0;
  width: 150px;
  margin-bottom: 32px;
`;

const Banner = ({ intro }) => (
  <Wrapper>
    <InnerWrapper>
      <Left>
        <Logo as="img" src={logo} />
        <GitHubButton />
      </Left>
      <Intro flex={1} intro={intro} maxWidth="100%" />
    </InnerWrapper>
  </Wrapper>
);

export default Banner;

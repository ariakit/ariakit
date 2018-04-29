import React from "react";
import { styled, Flex } from "reas";
import HomeBanner from "../compounds/HomeBanner";
import HomeExample from "../compounds/HomeExample";
import Credits from "../compounds/Credits";

const Wrapper = styled(Flex)`
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  font-family: sans-serif;
`;

const Home = () => (
  <Wrapper>
    <HomeBanner />
    <HomeExample />
    <Credits />
  </Wrapper>
);

export default Home;

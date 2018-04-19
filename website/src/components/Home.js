import React from "react";
import { Flex } from "reas";
import HomeBanner from "./HomeBanner";
import HomeExample from "./HomeExample";

const Wrapper = Flex.extend`
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  font-family: sans-serif;
`;

const Home = () => (
  <Wrapper>
    <HomeBanner />
    <HomeExample />
  </Wrapper>
);

export default Home;

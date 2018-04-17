import React from "react";
import HeartIcon from "react-icons/lib/fa/heart";
import { Flex, Block, Grid, Link } from "reas";

const Wrapper = Flex.extend`
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  font-family: sans-serif;
`;

const Banner = Flex.extend`
  position: relative;
  padding: 200px 80px 150px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  justify-content: center;
  width: 100%;

  @media (max-width: 768px) {
    padding: 100px 20px 20px;
  }
`;

const BannerContent = Flex.extend`
  max-width: 1200px;
  align-items: flex-end;

  @media (max-width: 768px) {
    align-items: center;
    flex-direction: column;
  }
`;

const BannerRight = Block.extend`
  margin-left: 330px;
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 240px;
  }
  @media (max-width: 360px) {
    margin-left: 0;
    margin-top: 180px;
  }
`;

const Buttons = Block.extend`
  margin: -1.5em 0 40px;
  @media (max-width: 768px) {
    margin: 40px 0;
  }
`;

const Cards = Grid.extend`
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  grid-gap: 40px;
  padding: 40px 20px;
  max-width: 100%;
  justify-items: center;
  perspective: 500px;

  > * {
    overflow: hidden;
    max-width: 100%;
  }
  @media (max-width: 1024px) {
    grid-auto-flow: row;
    padding: 20px;
    margin: 0 -20px;
  }
`;

const Credits = Block.extend`
  text-align: center;
  margin: 40px 0;
`;

const HomeLayout = ({ bannerLeft, bannerRight, middle, cards, ...props }) => (
  <Wrapper {...props}>
    <Banner>
      <BannerContent>
        {bannerLeft}
        <BannerRight>{bannerRight}</BannerRight>
      </BannerContent>
    </Banner>
    <Buttons>{middle}</Buttons>
    <Cards>{cards}</Cards>
    <Credits>
      Made with <HeartIcon /> by{" "}
      <Link href="https://twitter.com/diegohaz" target="_blank">
        Haz
      </Link>
    </Credits>
  </Wrapper>
);

export default HomeLayout;

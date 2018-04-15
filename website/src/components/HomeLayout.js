import React from "react";
import HeartIcon from "react-icons/lib/fa/heart";
import { Flex, Block, Grid, Link } from "reas";

const Wrapper = Flex.extend`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 80px;
  font-family: sans-serif;
  & > * {
    max-width: 1200px;
  }
  @media (max-width: 1024px) {
    padding: 40px;
  }
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Banner = Flex.extend`
  padding-top: 200px;
  position: relative;
  align-items: flex-end;
  @media (max-width: 768px) {
    padding-top: 50px;
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
  margin: 100px 0;
  @media (max-width: 768px) {
    margin: 40px 0;
  }
`;

const CardsWrapper = Flex.extend`
  background-color: #f6f6f6;
  width: 100vw;
  max-width: none;
  justify-content: center;
  padding: 80px 20px;
  border: 1px solid #e0e0e0;
  border-width: 1px 0;
  > * {
    max-width: 1200px;
  }
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Cards = Grid.extend`
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  grid-gap: 40px;
  justify-items: center;
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
  margin-top: 40px;
`;

const HomeLayout = ({ bannerLeft, bannerRight, middle, cards, ...props }) => (
  <Wrapper {...props}>
    <Banner>
      {bannerLeft}
      <BannerRight>{bannerRight}</BannerRight>
    </Banner>
    <Buttons>{middle}</Buttons>
    <CardsWrapper>
      <Cards>{cards}</Cards>
    </CardsWrapper>
    <Credits>
      Made with <HeartIcon /> by{" "}
      <Link href="https://twitter.com/diegohaz" target="_blank">
        Haz
      </Link>
    </Credits>
  </Wrapper>
);

export default HomeLayout;

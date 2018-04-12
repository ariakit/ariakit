import React from "react";
import LibraryBooksIcon from "react-icons/lib/md/library-books";
import CodeIcon from "react-icons/lib/fa/code";
import GitHubIcon from "react-icons/lib/go/mark-github";
import HomeBox from "./HomeBox";
import { Flex, Paragraph, Group, Button } from "../../../src";

const Wrapper = Flex.extend`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 80px;

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
  position: relative;
  align-items: flex-end;

  @media (max-width: 768px) {
    align-items: center;
    flex-direction: column;
  }
`;

const Text = Paragraph.extend`
  font-family: Georgia, serif;
  font-size: 66px;
  margin-left: 330px;

  @media (max-width: 1024px) {
    font-size: 50px;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 240px;
    font-size: 33px;
    text-align: center;
  }

  @media (max-width: 360px) {
    margin-top: 180px;
  }
`;

const Buttons = Group.extend`
  font-family: sans-serif;
  margin: 40px 0;

  @media (max-width: 768px) {
    margin: 20px 0;
  }
`;

const Home = () => (
  <Wrapper>
    <Banner>
      <HomeBox />
      <Text>Minimalist components for your next React app</Text>
    </Banner>
    <Buttons responsive={500}>
      <Button>
        <LibraryBooksIcon />Guide
      </Button>
      <Button>
        <CodeIcon />Components
      </Button>
      <Button>
        <GitHubIcon />GitHub
      </Button>
    </Buttons>
  </Wrapper>
);

export default Home;

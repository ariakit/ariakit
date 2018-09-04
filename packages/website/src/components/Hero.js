import React from "react";
import { styled, Grid, Heading, Button } from "reakit";
import { Link } from "react-router-dom";
import LibraryBooksIcon from "react-icons/lib/md/library-books";
import CodeIcon from "react-icons/lib/go/code";
import ButtonSecondary from "../elements/ButtonSecondary";
import LogoSymbol from "../elements/LogoSymbol";
import ContentWrapper from "../elements/ContentWrapper";
import ButtonRounded from "../elements/ButtonRounded";
import HeroGitHubButton from "./HeroGitHubButton";
import track from "../utils/track";

const Wrapper = styled(ContentWrapper)`
  display: grid;
  grid-template:
    "logo text" 160px
    "buttons buttons" auto / 160px 1fr;
  grid-gap: 50px 30px;
  max-width: 768px;
  padding: 0 100px;
  place-items: center;
  align-content: baseline;

  @media (max-width: 768px) {
    padding: 0 20px;
    grid-gap: 30px;
    grid-template:
      "logo" 100px
      "text"
      "buttons";
  }
`;

const Headline = styled(Heading)`
  margin: 0;
  font-size: 50px;
  font-weight: 300;
  @media (max-width: 768px) {
    font-size: 30px;
    text-align: center;
  }
`;

const Buttons = styled(Grid)`
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  grid-gap: 8px;
  font-size: 18px;
  @media (max-width: 768px) {
    font-size: 16px;
    grid-auto-flow: row;
  }
`;

const Hero = props => (
  <Wrapper {...props}>
    <LogoSymbol height="100%" gridArea="logo" />
    <Headline gridArea="text">
      Toolkit for building interactive UIs with React
    </Headline>
    <Buttons gridArea="buttons">
      <Button
        palette="primary"
        as={[ButtonRounded, Link]}
        to="/guide"
        onClick={track("reakit.heroGuideClick")}
      >
        <LibraryBooksIcon />
        Get Started
      </Button>
      <ButtonSecondary
        as={[ButtonRounded, Link]}
        to="/components"
        onClick={track("reakit.heroComponentsClick")}
      >
        <CodeIcon />
        Components
      </ButtonSecondary>
      <HeroGitHubButton />
    </Buttons>
  </Wrapper>
);

export default Hero;

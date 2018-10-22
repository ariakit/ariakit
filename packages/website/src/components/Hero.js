import React from "react";
import { styled, Grid, Heading, Inline } from "reakit";
import { Link } from "react-router-dom";
import LibraryBooksIcon from "react-icons/lib/md/library-books";
import CodeIcon from "react-icons/lib/go/code";
import ButtonPrimary from "../elements/ButtonPrimary";
import ButtonOutline from "../elements/ButtonOutline";
import ContentWrapper from "../elements/ContentWrapper";
import ButtonRounded from "../elements/ButtonRounded";
import HeroGitHubButton from "./HeroGitHubButton";
import track from "../utils/track";
import IconOnLeft from "../elements/IconOnLeft";

const Wrapper = styled(ContentWrapper)`
  display: grid;
  grid-template:
    "text" 160px
    "buttons" auto / min-content;
  grid-gap: 50px 30px;
  max-width: 768px;
  padding: 0 100px;
  place-items: center;
  align-content: baseline;

  @media (max-width: 768px) {
    padding: 0 20px;
    grid-gap: 30px;
    grid-template:
      "text"
      "buttons";
  }
`;

const Headline = styled(Heading)`
  margin: 0;
  font-size: 50px !important;
  font-weight: 300;
  @media (max-width: 768px) {
    font-size: 30px !important;
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
    <Headline gridArea="text">
      Toolkit for building{" "}
      <Inline use="strong" fontWeight={400}>
        really
      </Inline>{" "}
      interactive UIs with React
    </Headline>
    <Buttons gridArea="buttons">
      <ButtonPrimary
        use={[ButtonRounded, IconOnLeft, Link]}
        to="/guide"
        onClick={track("reakit.heroGuideClick")}
      >
        <LibraryBooksIcon />
        Get Started
      </ButtonPrimary>
      <ButtonOutline
        use={[ButtonRounded, IconOnLeft, Link]}
        to="/components"
        onClick={track("reakit.heroComponentsClick")}
      >
        <CodeIcon />
        Components
      </ButtonOutline>
      <HeroGitHubButton />
    </Buttons>
  </Wrapper>
);

export default Hero;

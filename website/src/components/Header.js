import React from "react";
import { styled, Flex, Grid } from "reakit";
import { prop } from "styled-tools";
import { NavLink as RouterLink } from "react-router-dom";
import MenuIcon from "react-icons/lib/md/menu";
import OpenInNewIcon from "react-icons/lib/md/open-in-new";
import GitHubIcon from "react-icons/lib/go/mark-github";
import ContentWrapper from "../elements/ContentWrapper";
import ViewportContainer from "../containers/ViewportContainer";
import Link from "../elements/Link";
import Logo from "../elements/Logo";
import ButtonTransparent from "../elements/ButtonTransparent";
import Icon from "../elements/Icon";
import HeaderNavigation from "./HeaderNavigation";

const Wrapper = styled(Flex)`
  width: 100%;
  justify-content: center;
  background-color: white;
  z-index: 99999;
`;

const Layout = styled(Grid)`
  align-items: center;
  grid-gap: 40px;
  width: 100%;
  grid-template: "logo nav . github" 60px / auto auto 1fr auto;
  @media (max-width: 768px) {
    grid-template: "menu logo github" 60px / 40px auto 40px;
    justify-content: space-between;
  }
`;

const LogoLink = styled(RouterLink)`
  display: grid;
  grid-gap: 10px;
  grid-auto-flow: column;
  align-items: center;
  text-decoration: none;
`;

const GitHubLink = styled(Link)`
  display: grid;
  grid-gap: 4px;
  align-items: center;
  grid-auto-flow: column;
  color: ${prop("theme.gray")};
  font-size: 18px;
  justify-self: flex-end;
`;

const Desktop = () => (
  <React.Fragment>
    <Grid.Item area="logo">
      <LogoLink to="/">
        <Logo height={26} />
      </LogoLink>
    </Grid.Item>
    <Grid.Item as={HeaderNavigation} area="nav" />
    <Grid.Item
      as={GitHubLink}
      area="github"
      href="https://github.com/reakit/reakit"
      target="_blank"
    >
      GitHub<OpenInNewIcon />
    </Grid.Item>
  </React.Fragment>
);

const Mobile = () => (
  <React.Fragment>
    <Grid.Item as={ButtonTransparent} area="menu">
      <Icon as={MenuIcon} />
    </Grid.Item>
    <Grid.Item area="logo">
      <LogoLink to="/">
        <Logo height={26} />
      </LogoLink>
    </Grid.Item>
    <Grid.Item
      as={GitHubLink}
      area="github"
      href="https://github.com/reakit/reakit"
      target="_blank"
    >
      <Icon as={GitHubIcon} />
    </Grid.Item>
  </React.Fragment>
);

const Header = props => (
  <Wrapper {...props}>
    <ContentWrapper>
      <Layout>
        <ViewportContainer>
          {({ width }) => (width > 768 ? <Desktop /> : <Mobile />)}
        </ViewportContainer>
      </Layout>
    </ContentWrapper>
  </Wrapper>
);

export default Header;

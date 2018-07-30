import React from "react";
import { styled, Flex, Grid, Link, Sidebar } from "reakit";
import { prop } from "styled-tools";
import { NavLink as RouterLink } from "react-router-dom";
import MenuIcon from "react-icons/lib/md/menu";
import OpenInNewIcon from "react-icons/lib/md/open-in-new";
import GitHubIcon from "react-icons/lib/go/mark-github";
import ViewportContainer from "../containers/ViewportContainer";
import Logo from "../elements/Logo";
import ButtonTransparent from "../elements/ButtonTransparent";
import Icon from "../elements/Icon";
import HeaderNavigation from "./HeaderNavigation";
import MobileSidebar from "./MobileSidebar";
import getRelease from "../utils/getRelease";

const Wrapper = styled(Flex)`
  width: 100%;
  justify-content: center;
  background-color: white;
  z-index: 9999;
  padding: 0 55px;
  @media (max-width: 768px) {
    padding: 0 8px;
  }
`;

const Layout = styled(Grid)`
  align-items: center;
  grid-gap: 55px;
  width: 100%;
  grid-template: "logo nav . version github" 60px / auto auto 1fr auto;
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

const HeaderLink = styled(Link)`
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
      as={HeaderLink}
      area="version"
      href={getRelease.url()}
      target="_blank"
    >
      {getRelease.version}
    </Grid.Item>
    <Grid.Item
      as={HeaderLink}
      area="github"
      href="https://github.com/reakit/reakit"
      target="_blank"
    >
      GitHub
      <OpenInNewIcon />
    </Grid.Item>
  </React.Fragment>
);

const Mobile = () => (
  <React.Fragment>
    <Sidebar.Container context="sidebar">
      {sidebar => (
        <React.Fragment>
          <Grid.Item
            as={[Sidebar.Toggle, ButtonTransparent]}
            {...sidebar}
            area="menu"
          >
            <Icon as={MenuIcon} />
          </Grid.Item>
          <MobileSidebar />
        </React.Fragment>
      )}
    </Sidebar.Container>
    <Grid.Item area="logo">
      <LogoLink to="/">
        <Logo height={26} />
      </LogoLink>
    </Grid.Item>
    <Grid.Item
      as={HeaderLink}
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
    <Layout>
      <ViewportContainer>
        {({ width }) => (width > 768 ? <Desktop /> : <Mobile />)}
      </ViewportContainer>
    </Layout>
  </Wrapper>
);

export default Header;

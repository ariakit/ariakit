import React from "react";
import { styled, Flex, Link, Sidebar, Toolbar } from "reakit";
import { theme } from "styled-tools";
import { NavLink as RouterLink } from "react-router-dom";
import MenuIcon from "react-icons/lib/md/menu";
import OpenInNewIcon from "react-icons/lib/md/open-in-new";
import GitHubIcon from "react-icons/lib/go/mark-github";
import ViewportContainer from "../containers/ViewportContainer";
import StyleguidistContainer from "../containers/StyleguidistContainer";
import Logo from "../elements/Logo";
import ButtonTransparent from "../elements/ButtonTransparent";
import Icon from "./Icon";
import MobileSidebar from "./MobileSidebar";
import getRelease from "../utils/getRelease";
import track from "../utils/track";

const Wrapper = styled(Flex)`
  width: 100%;
  height: 60px;
  justify-content: center;
  background-color: white;
  z-index: 9999;
  padding: 0 36px;
  @media (max-width: 768px) {
    padding: 0 8px;
  }
`;

const StyledToolbar = styled(Toolbar)`
  height: 100%;
  grid-gap: 24px;
  padding: 0 24px;
  ${Toolbar.Focusable} {
    /* temporary */
    outline: none;
  }
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const LogoLink = styled(RouterLink)`
  display: block;
  width: 100px;
  margin-right: 36px;
  @media (max-width: 768px) {
    margin-right: 0;
  }
`;

const NavigationLink = styled(RouterLink)`
  display: flex;
  align-items: center;
  font-size: 20px;
  height: 100%;
  padding-top: 5px;
  border-bottom: 5px solid transparent;
  color: ${theme("black")};
  text-decoration: none;
  &:hover {
    border-color: ${theme("pinkLight")};
  }
  &.active {
    border-color: ${theme("pinkDark")};
  }
`;

const ExternalLink = styled(Link)`
  color: ${theme("gray")};
  font-size: 18px;
  justify-self: flex-end;
`;

const Navigation = () => (
  <StyleguidistContainer>
    {({ sections }) =>
      sections.map(section => (
        <Toolbar.Focusable
          as={NavigationLink}
          key={section.name}
          to={`/${section.slug}`}
        >
          {section.name}
        </Toolbar.Focusable>
      ))
    }
  </StyleguidistContainer>
);

const Desktop = () => (
  <StyledToolbar>
    <Toolbar.Content>
      <Toolbar.Focusable as={LogoLink} to="/">
        <Logo />
      </Toolbar.Focusable>
      <Navigation />
    </Toolbar.Content>
    <Toolbar.Content align="end">
      <Toolbar.Focusable
        as={ExternalLink}
        href={getRelease.url()}
        target="_blank"
        onClick={track("reakit.headerVersionClick")}
      >
        {getRelease.version}
      </Toolbar.Focusable>
      <Toolbar.Focusable
        as={ExternalLink}
        href="https://github.com/reakit/reakit"
        target="_blank"
        onClick={track("reakit.headerGithubClick")}
      >
        GitHub
        <OpenInNewIcon />
      </Toolbar.Focusable>
    </Toolbar.Content>
  </StyledToolbar>
);

const Mobile = () => (
  <StyledToolbar>
    <Sidebar.Container context="sidebar">
      {sidebar => (
        <Toolbar.Content>
          <Toolbar.Focusable
            as={[Sidebar.Toggle, ButtonTransparent]}
            {...sidebar}
          >
            <Icon as={MenuIcon} />
          </Toolbar.Focusable>
          <MobileSidebar />
        </Toolbar.Content>
      )}
    </Sidebar.Container>
    <Toolbar.Content align="center">
      <Toolbar.Focusable>
        <LogoLink to="/">
          <Logo />
        </LogoLink>
      </Toolbar.Focusable>
    </Toolbar.Content>
    <Toolbar.Content align="end">
      <Toolbar.Focusable
        as={ExternalLink}
        href="https://github.com/reakit/reakit"
        target="_blank"
        onClick={track("reakit.headerGithubClick")}
      >
        <Icon as={GitHubIcon} />
      </Toolbar.Focusable>
    </Toolbar.Content>
  </StyledToolbar>
);

const Header = props => (
  <Wrapper {...props}>
    <ViewportContainer>
      {({ width }) => (width > 768 ? <Desktop /> : <Mobile />)}
    </ViewportContainer>
  </Wrapper>
);

export default Header;

import React from "react";
import { styled, Grid } from "reakit";
import { NavLink } from "react-router-dom";
import { prop } from "styled-tools";

const Navigation = styled(Grid.as("nav"))`
  grid-auto-flow: column;
  grid-gap: 20px;
  font-size: 20px;
  height: 100%;
`;

const Link = styled(NavLink)`
  display: flex;
  align-items: center;
  padding-top: 3px;
  border-bottom: 3px solid transparent;
  color: ${prop("theme.black")};
  text-decoration: none;
  &:hover {
    border-color: ${prop("theme.pinkLight")};
  }
  &.active {
    border-color: ${prop("theme.pinkDark")};
  }
`;

const HeaderNavigation = props => (
  <Navigation {...props}>
    <Link to="/guide">Guide</Link>
    <Link to="/components">Components</Link>
  </Navigation>
);

export default HeaderNavigation;

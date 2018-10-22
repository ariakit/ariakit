import React from "react";
import { styled, Popover } from "reakit";
import GitHubIcon from "react-icons/lib/go/mark-github";
import StarIcon from "react-icons/lib/go/star";
import ButtonRounded from "../elements/ButtonRounded";
import ButtonGray from "../elements/ButtonGray";
import Icon from "./Icon";
import GitHubStarsContainer from "../containers/GitHubStarsContainer";
import ViewportContainer from "../containers/ViewportContainer";
import track from "../utils/track";
import IconOnLeft from "../elements/IconOnLeft";

const getPopoverPlacement = width => (width > 768 ? "right" : "bottom");

const Button = styled(ButtonGray)`
  padding: 0 20px 0 10px;
  @media (max-width: 768px) {
    margin-bottom: 40px;
  }
`;

const StarsPopover = styled(Popover)`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 4px;
  padding: 8px 10px 8px 8px;
  place-items: center;
  cursor: inherit;
  ${Popover.Arrow} {
    font-size: 26px;
  }
`;

const HeroGitHubButton = props => (
  <Button
    use={[ButtonRounded, IconOnLeft, "a"]}
    href="https://github.com/reakit/reakit"
    target="_blank"
    onClick={track("reakit.heroGithubClick")}
    {...props}
  >
    <Icon use={GitHubIcon} />
    GitHub
    <ViewportContainer>
      {({ width }) => (
        <GitHubStarsContainer context="github">
          {({ stars }) => (
            <StarsPopover
              visible={stars > 0}
              placement={getPopoverPlacement(width)}
              flip={false}
            >
              <Popover.Arrow />
              <StarIcon /> {stars}
            </StarsPopover>
          )}
        </GitHubStarsContainer>
      )}
    </ViewportContainer>
  </Button>
);

export default HeroGitHubButton;

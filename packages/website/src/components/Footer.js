import React from "react";
import { styled, Flex, Link, Paragraph, Grid, List, getSelector } from "reakit";
import { palette } from "styled-tools";
import FacebookIcon from "react-icons/lib/fa/facebook-official";
import TwitterIcon from "react-icons/lib/fa/twitter";
import GitHubIcon from "react-icons/lib/go/mark-github";
import ContentWrapper from "../elements/ContentWrapper";
import track from "../utils/track";

const year = new Date().getFullYear();

const Wrapper = styled(Flex)`
  justify-content: center;
  width: 100%;
  padding: 40px 0;
  color: ${palette("grayscale", 2)};

  ${getSelector(Link)} {
    color: ${palette("grayscale", 2)};
  }
  ${getSelector(Paragraph)} {
    margin: 0;
    line-height: 1.5;
  }
`;

const Icons = styled(Grid)`
  font-size: 20px;
  grid-auto-flow: column;
  grid-gap: 16px;
  margin-bottom: 16px;

  ${getSelector(Link)}:hover {
    color: ${palette("grayscale", 1)};
  }
`;

const Credits = props => (
  <Wrapper {...props}>
    <ContentWrapper column>
      <Icons use={List}>
        <li>
          <Link
            href="https://facebook.com/reakitjs"
            target="_blank"
            onClick={track("reakit.footerFacebookClick")}
          >
            <FacebookIcon />
          </Link>
        </li>
        <li>
          <Link
            href="https://twitter.com/reakitjs"
            target="_blank"
            onClick={track("reakit.footerTwitterClick")}
          >
            <TwitterIcon />
          </Link>
        </li>
        <li>
          <Link
            href="https://github.com/reakit/reakit"
            target="_blank"
            onClick={track("reakit.footerGithubClick")}
          >
            <GitHubIcon />
          </Link>
        </li>
      </Icons>
      <Paragraph>
        Released under the{" "}
        <Link href="https://opensource.org/licenses/MIT" target="_blank">
          MIT License
        </Link>
      </Paragraph>
      <Paragraph>
        Copyright © 2017-
        {year} Diego Haz
      </Paragraph>
    </ContentWrapper>
  </Wrapper>
);

export default Credits;

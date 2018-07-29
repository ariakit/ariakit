import React from "react";
import { styled, Flex, Link, Paragraph, Grid, List } from "reakit";
import { prop } from "styled-tools";
import FacebookIcon from "react-icons/lib/fa/facebook-official";
import TwitterIcon from "react-icons/lib/fa/twitter";
import GitHubIcon from "react-icons/lib/go/mark-github";
import ContentWrapper from "../elements/ContentWrapper";

const year = new Date().getFullYear();

const Wrapper = styled(Flex)`
  justify-content: center;
  background-color: ${prop("theme.grayLightest")};
  width: 100%;
  padding: 40px 0;
  color: ${prop("theme.gray")};

  ${Link} {
    color: ${prop("theme.gray")};
  }

  ${Paragraph} {
    margin: 0;
    line-height: 1.5;
  }
`;

const Icons = styled(Grid)`
  font-size: 20px;
  grid-auto-flow: column;
  grid-gap: 16px;
  margin-bottom: 16px;

  ${Link}:hover {
    color: ${prop("theme.grayDark")};
  }
`;

const Credits = props => (
  <Wrapper {...props}>
    <ContentWrapper column>
      <Icons as={List}>
        <li>
          <Link href="https://facebook.com/reakitjs" target="_blank">
            <FacebookIcon />
          </Link>
        </li>
        <li>
          <Link href="https://twitter.com/reakitjs" target="_blank">
            <TwitterIcon />
          </Link>
        </li>
        <li>
          <Link href="https://github.com/reakit/reakit" target="_blank">
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
      <Paragraph>Copyright © 2017-{year} Diego Haz</Paragraph>
    </ContentWrapper>
  </Wrapper>
);

export default Credits;

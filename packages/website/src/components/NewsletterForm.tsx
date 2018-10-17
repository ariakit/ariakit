import * as React from "react";
import { Input, Block, Link, Button, styled } from "reakit";
import { palette } from "styled-tools";
// @ts-ignore
import EmailIcon from "react-icons/lib/io/ios-email";
// @ts-ignore
import ContentWrapper from "../elements/ContentWrapper";
import track from "../utils/track";

const action =
  "https://reakit.us18.list-manage.com/subscribe/post?u=cf382e48d5d8ed7178cb22060&id=941e41af27";

const Wrapper = styled(ContentWrapper)`
  position: relative;
  background-color: ${palette("background", -2)};
  color: ${palette("backgroundText", -2)};
  width: 100%;
  max-width: 100%;
  padding: 3rem 2rem;
  display: grid;
  grid-gap: 24px 16px;
  grid-template:
    "text text text"
    "email name button"
    "footer footer footer"
    / minmax(auto, 250px) minmax(auto, 250px) min-content;
  justify-content: center;
  align-items: center;
  height: auto;
  border: 1px solid ${palette("background", 1)};

  @media (max-width: 768px) {
    grid-template:
      "text"
      "email"
      "name"
      "button"
      "footer"
      / minmax(250px, 500px);
    border-left-width: 0;
    border-right-width: 0;
  }
`;

const IconBackground = styled(Block)`
  position: absolute;
  top: -11px;
  height: 20px;
  width: 30px;
  margin-left: 50%;
  transform: translateX(-50%);
  background-color: ${palette("background", 0)};
  padding: 1px;
  box-sizing: content-box;
`;

const StyledEmailIcon = styled(EmailIcon)`
  position: absolute;
  top: -20px;
  font-size: 40px;
  margin-left: 50%;
  transform: translateX(-50%);
  color: ${palette("background", -1)};
`;

const NewsletterForm = (props: any) => (
  <Wrapper use="form" action={action} method="post" {...props}>
    <IconBackground />
    <StyledEmailIcon />
    <Block gridArea="text" fontSize={20} lineHeight={1.75} textAlign="center">
      Receive <strong>exclusive</strong> tips and updates about Reakit and React
      ecosystem.
    </Block>
    <Input
      gridArea="email"
      placeholder="Email address"
      aria-label="Email address"
      name="EMAIL"
      type="email"
      onBlur={track("reakit.newsletterEmailBlur")}
    />
    <Input
      gridArea="name"
      placeholder="First name"
      aria-label="First name"
      name="FNAME"
      type="text"
    />
    <Block absolute left={-5000}>
      <Input
        type="text"
        name="b_cf382e48d5d8ed7178cb22060_941e41af27"
        aria-hidden="true"
        tabIndex={-1}
        defaultValue=""
      />
    </Block>
    <Button type="submit" gridArea="button">
      Subscribe
    </Button>
    <Block gridArea="footer" fontSize={14} textAlign="center">
      Emails will be sent by{" "}
      <Link
        href="https://twitter.com/diegohaz"
        target="_blank"
        rel="noopener noreferrer"
      >
        Diego Haz
      </Link>
      , and you can unsubscribe at any time.
    </Block>
  </Wrapper>
);

export default NewsletterForm;

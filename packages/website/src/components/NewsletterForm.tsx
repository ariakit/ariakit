import * as React from "react";
import { Input, Block, Link, Button, styled } from "reakit";
import { palette } from "styled-tools";
import ContentWrapper from "../elements/ContentWrapper";
import track from "../utils/track";

const action =
  "https://reakit.us18.list-manage.com/subscribe/post?u=cf382e48d5d8ed7178cb22060&id=941e41af27";

const Wrapper = styled(ContentWrapper)`
  background-color: ${palette("alert", -2)};
  color: ${palette("alertText", -2)};
  width: 100%;
  padding: 2rem;
  display: grid;
  grid-gap: 32px 16px;
  grid-template:
    "text text text"
    "email name button"
    "footer footer footer"
    / minmax(auto, 250px) minmax(auto, 250px) min-content;
  justify-content: center;
  align-items: center;
  height: auto;

  @media (max-width: 768px) {
    grid-template:
      "text"
      "email"
      "name"
      "button"
      "footer"
      / minmax(250px, 500px);
  }
`;

const NewsletterForm = (props: any) => (
  <Wrapper as="form" action={action} method="post" {...props}>
    <Block gridArea="text" fontSize={20} lineHeight={1.75} textAlign="center">
      Reakit is evolving and big announcements are coming.
      <br />
      Subscribe below to be notified about <strong>important</strong> updates.
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
      , and you can always unsubscribe later.
    </Block>
  </Wrapper>
);

export default NewsletterForm;

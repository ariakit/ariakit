import * as React from "react";
import { css } from "emotion";
import Heading from "../components/Heading";
import NewsletterForm from "../components/NewsletterForm";

export default function NewsletterPage() {
  return (
    <div
      className={css`
        max-width: 800px;
        margin: 0 auto;
        padding: 16px;
      `}
    >
      <Heading>Newsletter</Heading>
      <NewsletterForm />
    </div>
  );
}

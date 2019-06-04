import * as React from "react";
import { css } from "emotion";
import Heading from "../components/Heading";
import NewsletterForm from "../components/NewsletterForm";
import SEO from "../components/SEO";

export default function NewsletterPage() {
  return (
    <div
      className={css`
        max-width: 800px;
        margin: 0 auto;
        padding: 16px;
      `}
    >
      <SEO title="Newsletter – Reakit" />
      <Heading>Newsletter</Heading>
      <NewsletterForm />
    </div>
  );
}

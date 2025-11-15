"use client";

import type { RoleProps } from "@ariakit/react";
import { Role } from "@ariakit/react";
import { track } from "@vercel/analytics";
import { forwardRef } from "react";

export interface NewsletterFormProps extends RoleProps<"form"> {
  location: string;
}

export const NewsletterForm = forwardRef<HTMLFormElement, NewsletterFormProps>(
  function NewsletterForm(props, ref) {
    return (
      <Role.form
        ref={ref}
        action="https://newsletter.ariakit.org/api/v1/free?email="
        method="post"
        target="_blank"
        {...props}
        onSubmit={(event) => {
          props.onSubmit?.(event);
          if (event.defaultPrevented) return;
          const data = new FormData(event.currentTarget);
          const email = `${data.get("email")}`;
          track("newsletter-subscribe", { location: props.location, email });
        }}
      />
    );
  },
);

import { forwardRef } from "react";
import Link from "next/link.js";
import { PageMarkdown } from "./page-markdown.jsx";
import { PreviewLinkClient } from "./preview-link-client.jsx";
import type { PreviewLinkClientProps } from "./preview-link-client.jsx";

export interface PreviewLinkProps
  extends Omit<PreviewLinkClientProps, "preview"> {}

export const PreviewLink = forwardRef<HTMLAnchorElement, PreviewLinkProps>(
  ({ href, ...props }, ref) => {
    const url = new URL(href, "https://ariakit.org");
    const [, category, page] = url.pathname.split("/");
    const section = url.hash.slice(1);
    if (!category || !page) {
      return <Link {...props} ref={ref} href={href} />;
    }
    return (
      <PreviewLinkClient
        {...props}
        ref={ref}
        href={href}
        preview={
          <PageMarkdown category={category} page={page} section={section} />
        }
      />
    );
  },
);

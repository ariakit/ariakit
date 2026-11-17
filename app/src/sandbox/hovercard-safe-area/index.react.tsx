import * as ak from "@ariakit/react";
import { hovercard, hovercardHeading } from "@ariakit/ui/styles/hovercard";
import { link } from "@ariakit/ui/styles/link";

interface ArticleLinkProps {
  title: string;
}

// The gutter leaves room for the next link between a link and its hovercard, so
// the mouse moves over the next link on its way to the hovercard.
function ArticleLink({ title }: ArticleLinkProps) {
  return (
    <ak.HovercardProvider placement="bottom-start">
      <ak.HovercardAnchor href="#article" {...link.jsx()}>
        {title}
      </ak.HovercardAnchor>
      <ak.Hovercard gutter={64} {...hovercard.jsx({ className: "w-72" })}>
        <ak.HovercardHeading {...hovercardHeading.jsx()}>
          {title}
        </ak.HovercardHeading>
        <p>Read the {title.toLowerCase()}.</p>
      </ak.Hovercard>
    </ak.HovercardProvider>
  );
}

export default function Example() {
  return (
    <div className="flex flex-col items-start gap-4">
      <ArticleLink title="First article" />
      <ArticleLink title="Second article" />
    </div>
  );
}

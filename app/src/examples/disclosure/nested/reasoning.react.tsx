import type {
  DisclosureButtonProps,
  DisclosureContentProps,
  DisclosureProps,
} from "@ariakit/ui/ariakit/disclosure.react.tsx";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
  DisclosureContentBody,
} from "@ariakit/ui/ariakit/disclosure.react.tsx";
import { createRender } from "@ariakit/ui/react-utils/create-render.ts";
import { prose } from "@ariakit/ui/styles/prose.ts";
import { clsx } from "clsx";
import { createContext, useContext } from "react";

const NestedReasoningContext = createContext(false);

export interface ReasoningProps extends DisclosureProps {}

export function Reasoning(props: ReasoningProps) {
  const nested = useContext(NestedReasoningContext);
  const button = createRender(ReasoningButton, props.button);
  const content = createRender(ReasoningContent, props.content);
  return (
    <div
      className={clsx(
        nested &&
          "ak-frame ak-frame-cover ak-frame-p-1 -my-[calc(var(--disclosure-padding)*0.6)]",
      )}
    >
      <Disclosure
        {...props}
        button={button}
        content={content}
        className={clsx(
          nested
            ? "ak-frame ak-frame-field/3 data-open:ak-layer data-open:ak-layer-6"
            : "ak-frame ak-frame-card/card ak-layer ak-layer-lighten-6 ak-frame-bordering",
          props.className,
        )}
      />
    </div>
  );
}

export interface ReasoningButtonProps extends DisclosureButtonProps {}

export function ReasoningButton(props: ReasoningButtonProps) {
  return (
    <DisclosureButton indicator="chevron-right-next" {...props}>
      {props.children || "Thoughts"}
    </DisclosureButton>
  );
}

export interface ReasoningContentProps extends DisclosureContentProps {}

export function ReasoningContent(props: ReasoningContentProps) {
  const nested = useContext(NestedReasoningContext);
  const body = createRender(
    DisclosureContentBody,
    props.body,
    // Legacy prose + ak-prose-text-sm: the body is a small-type prose column
    // whose rhythm gap is capped by the frame padding. The /relaxed modifier
    // keeps the prose line-height ratio like the legacy leading channel.
    prose.jsx({
      $gap: "min(var(--ak-frame-padding), calc(var(--spacing) * 4))",
      className: "text-sm/relaxed",
    }),
  );
  return (
    <NestedReasoningContext.Provider value={true}>
      <DisclosureContent
        {...props}
        body={body}
        className={clsx(
          // The important cap beats the cv's own open max-h-max channels,
          // which land later in the stylesheet.
          !nested && "data-open:max-h-140! overflow-y-auto",
          props.className,
        )}
      />
    </NestedReasoningContext.Provider>
  );
}

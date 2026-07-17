import type {
  DisclosureButtonProps,
  DisclosureContentProps,
  DisclosureProps,
} from "@ariakit/ui/react-aria/disclosure.react.tsx";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
  DisclosureContentBody,
} from "@ariakit/ui/react-aria/disclosure.react.tsx";
import { createRender } from "@ariakit/ui/react-utils/create-render.ts";
import { prose } from "@ariakit/ui/styles/prose.ts";
import { clsx } from "clsx";
import { createContext, useContext } from "react";

// Prose content body at the small text size, with the rhythm capped at the
// disclosure frame padding like the legacy ak-prose-text-sm and
// ak-prose-gap-[min(var(--ak-frame-padding),--spacing(4))] classes.
const proseBody = prose.jsx({
  $gap: "min(var(--ak-frame-padding), calc(var(--spacing) * 4))",
  class: "text-sm/relaxed",
});

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
            ? "ak-frame ak-frame-field/3 data-expanded:ak-layer data-expanded:ak-layer-6"
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
  const body = createRender(DisclosureContentBody, props.body, proseBody);
  return (
    <NestedReasoningContext.Provider value={true}>
      <DisclosureContent
        {...props}
        body={body}
        className={clsx(
          // Legacy used data-expanded:, which rac panels never receive, so the
          // cap was dead; the disclosure-open channel restores the intended
          // behavior (the ! beats the cv's own open max-h-max).
          !nested && "ui-disclosure-open:max-h-140! overflow-y-auto",
          props.className,
        )}
      />
    </NestedReasoningContext.Provider>
  );
}

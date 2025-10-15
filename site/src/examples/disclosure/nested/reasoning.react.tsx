import clsx from "clsx";
import { createContext, useContext } from "react";
import type {
  DisclosureButtonProps,
  DisclosureContentProps,
  DisclosureProps,
} from "#app/examples/_lib/ariakit/disclosure.react.tsx";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
  DisclosureContentBody,
} from "#app/examples/_lib/ariakit/disclosure.react.tsx";
import { createRender } from "#app/examples/_lib/react-utils/create-render.ts";

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
          "ak-frame-cover/1 -my-[calc(var(--ak-disclosure-padding)*0.6)]",
      )}
    >
      <Disclosure
        {...props}
        button={button}
        content={content}
        className={clsx(
          nested
            ? "ak-frame-field/3 data-open:ak-layer-pop"
            : "ak-frame-card ak-layer ak-bordering",
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
  const body = createRender(DisclosureContentBody, props.body, {
    className: "ak-prose-text-sm",
  });
  return (
    <NestedReasoningContext.Provider value={true}>
      <DisclosureContent
        prose
        {...props}
        body={body}
        className={clsx(
          !nested && "data-open:max-h-140 overflow-y-auto",
          props.className,
        )}
      />
    </NestedReasoningContext.Provider>
  );
}

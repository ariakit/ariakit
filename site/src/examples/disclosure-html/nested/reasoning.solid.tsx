import clsx from "clsx";
import type { JSX } from "solid-js";
import { createContext, splitProps, useContext } from "solid-js";
import type {
  DisclosureButtonProps,
  DisclosureContentProps,
  DisclosureProps,
} from "#app/examples/_lib/html/disclosure.solid.tsx";
import {
  Disclosure,
  DisclosureButton,
  DisclosureContent,
  DisclosureContentBody,
} from "#app/examples/_lib/html/disclosure.solid.tsx";

const NestedReasoningContext = createContext(false);

export interface ReasoningProps extends DisclosureProps {}

export function Reasoning(props: ReasoningProps) {
  const [local, rest] = splitProps(props, ["button", "content", "class"]);
  const nested = useContext(NestedReasoningContext);

  return (
    <div
      class={clsx(
        nested &&
          "ak-frame-cover/1 -my-[calc(var(--ak-disclosure-padding)*0.6)]",
      )}
    >
      <Disclosure
        {...rest}
        button={
          <ReasoningButton>{local.button as JSX.Element}</ReasoningButton>
        }
        content={
          <ReasoningContent>{local.content as JSX.Element}</ReasoningContent>
        }
        class={clsx(
          nested
            ? "ak-frame-field/3 open:ak-layer-pop"
            : "ak-frame-card ak-layer ak-bordering",
          local.class,
        )}
      />
    </div>
  );
}

export interface ReasoningButtonProps extends DisclosureButtonProps {}

export function ReasoningButton(props: ReasoningButtonProps) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <DisclosureButton indicator="chevron-right-next" {...rest}>
      {local.children || "Thoughts"}
    </DisclosureButton>
  );
}

export interface ReasoningContentProps extends DisclosureContentProps {}

export function ReasoningContent(props: ReasoningContentProps) {
  const [local, rest] = splitProps(props, ["class", "children"]);
  const nested = useContext(NestedReasoningContext);

  return (
    <NestedReasoningContext.Provider value={true}>
      <DisclosureContent
        prose
        {...rest}
        class={clsx(
          !nested && "group-open/disclosure:max-h-140 overflow-y-auto",
          local.class,
        )}
      >
        <DisclosureContentBody class="ak-prose-text-sm">
          {local.children}
        </DisclosureContentBody>
      </DisclosureContent>
    </NestedReasoningContext.Provider>
  );
}
